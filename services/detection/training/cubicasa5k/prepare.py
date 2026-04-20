"""Convert CubiCasa5K SVG annotations to YOLOv8-seg training format.

CubiCasa5K ships as <plan_id>/model.svg with `<polygon class="Kitchen" ...>` tags.
We rasterise each polygon into YOLO-seg txt format: `<class_idx> x1 y1 x2 y2 ...`
(normalised 0..1 to image dims).

Usage:
    python -m training.cubicasa5k.prepare \
        --input /data/cubicasa5k \
        --output /data/cubicasa5k_yolo

Then train:
    yolo segment train model=yolov8m-seg.pt data=cubicasa5k.yaml epochs=150 imgsz=1024
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image

from app.classes import FLOORPLAN_CLASSES

CLASS_LIST = list(FLOORPLAN_CLASSES.keys())
CLASS_INDEX = {name: i for i, name in enumerate(CLASS_LIST)}

CUBICASA_TO_OURS = {
    "LivingRoom": "living_room",
    "Kitchen": "kitchen",
    "Bath": "bathroom",
    "Bathroom": "bathroom",
    "Toilet": "wc",
    "Bedroom": "bedroom",
    "Hall": "hallway",
    "Corridor": "hallway",
    "Stairs": "stairs",
    "Staircase": "stairs",
    "Elevator": "lift",
    "Door": "door",
    "Window": "window",
    "EntryDoor": "external_door",
}


def _points_from_attr(points_attr: str) -> list[tuple[float, float]]:
    # "x1,y1 x2,y2 ..." — commas optional
    tokens = re.split(r"[ ,]+", points_attr.strip())
    nums = [float(t) for t in tokens if t]
    return list(zip(nums[0::2], nums[1::2]))


def convert_plan(svg_path: Path, image_path: Path, out_dir: Path) -> None:
    image = Image.open(image_path)
    W, H = image.size
    tree = ET.parse(svg_path)
    root = tree.getroot()
    lines: list[str] = []
    # Namespaced SVG elements — keep namespaces generic with wildcard tag matching.
    for el in root.iter():
        cls = el.attrib.get("class")
        if not cls:
            continue
        # Take the first semantic token if the class list has multiple.
        first = cls.split()[0]
        our = CUBICASA_TO_OURS.get(first)
        if not our or our not in CLASS_INDEX:
            continue
        pts_attr = el.attrib.get("points")
        if not pts_attr:
            continue
        pts = _points_from_attr(pts_attr)
        if len(pts) < 3:
            continue
        norm = " ".join(f"{x/W:.6f} {y/H:.6f}" for x, y in pts)
        lines.append(f"{CLASS_INDEX[our]} {norm}")

    if not lines:
        return
    out_img = out_dir / "images" / image_path.name
    out_lbl = out_dir / "labels" / f"{image_path.stem}.txt"
    out_img.parent.mkdir(parents=True, exist_ok=True)
    out_lbl.parent.mkdir(parents=True, exist_ok=True)
    if not out_img.exists():
        image.save(out_img)
    out_lbl.write_text("\n".join(lines))


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--split", default="train", choices=["train", "val"])
    args = p.parse_args()

    in_dir = Path(args.input)
    out_dir = Path(args.output) / args.split
    for plan_dir in sorted(in_dir.iterdir()):
        svg = plan_dir / "model.svg"
        img = plan_dir / "F1_original.png"
        if not (svg.exists() and img.exists()):
            continue
        convert_plan(svg, img, out_dir)


if __name__ == "__main__":
    main()
