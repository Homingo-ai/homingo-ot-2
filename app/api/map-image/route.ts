import { NextRequest, NextResponse } from "next/server";

type FacilityType = "shop" | "bus" | "train" | "tube" | "dlr";

interface Facility {
  lat: number;
  lon: number;
  type: FacilityType;
}

function classifyTransport(tags: Record<string, string>): FacilityType | null {
  if (tags.highway === "bus_stop" || tags.public_transport === "stop_position") {
    const network = (tags.network || "").toLowerCase();
    const operator = (tags.operator || "").toLowerCase();
    const name = (tags.name || "").toLowerCase();
    if (network.includes("dlr") || operator.includes("dlr") || name.includes("dlr"))
      return "dlr";
    if (
      network.includes("london underground") ||
      network.includes("tube") ||
      operator.includes("tfl") ||
      tags.station === "subway"
    )
      return "tube";
    return "bus";
  }
  if (tags.railway === "station" || tags.railway === "halt") {
    const network = (tags.network || "").toLowerCase();
    const operator = (tags.operator || "").toLowerCase();
    const name = (tags.name || "").toLowerCase();
    if (network.includes("dlr") || operator.includes("dlr") || name.includes("dlr"))
      return "dlr";
    if (
      network.includes("london underground") ||
      network.includes("tube") ||
      operator.includes("tfl") ||
      tags.station === "subway"
    )
      return "tube";
    return "train";
  }
  if (tags.railway === "tram_stop") return "bus";
  if (tags.railway === "subway_entrance") return "tube";
  if (tags.public_transport === "station") {
    const network = (tags.network || "").toLowerCase();
    const name = (tags.name || "").toLowerCase();
    if (network.includes("dlr") || name.includes("dlr")) return "dlr";
    if (network.includes("tube") || network.includes("underground")) return "tube";
    return "train";
  }
  return null;
}

async function fetchNearbyFacilities(
  lat: number,
  lon: number,
  shopRadius = 100,
  transportRadius = 250,
): Promise<Facility[]> {
  const query = `
[out:json][timeout:15];
(
  node["shop"](around:${shopRadius},${lat},${lon});
  node["amenity"="convenience"](around:${shopRadius},${lat},${lon});
  node["amenity"="supermarket"](around:${shopRadius},${lat},${lon});
  node["highway"="bus_stop"](around:${transportRadius},${lat},${lon});
  node["railway"="station"](around:${transportRadius},${lat},${lon});
  node["railway"="halt"](around:${transportRadius},${lat},${lon});
  node["railway"="tram_stop"](around:${transportRadius},${lat},${lon});
  node["railway"="subway_entrance"](around:${transportRadius},${lat},${lon});
  node["public_transport"="stop_position"](around:${transportRadius},${lat},${lon});
  node["public_transport"="station"](around:${transportRadius},${lat},${lon});
);
out body;
  `.trim();

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const elements: { lat?: number; lon?: number; tags?: Record<string, string> }[] =
      data.elements || [];

    const facilities: Facility[] = [];
    const seen = new Set<string>();

    for (const el of elements) {
      if (el.lat == null || el.lon == null) continue;

      const tags = el.tags || {};
      const key = `${el.lat.toFixed(5)},${el.lon.toFixed(5)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const isShop =
        tags.shop ||
        tags.amenity === "convenience" ||
        tags.amenity === "supermarket";
      const transportType = classifyTransport(tags);

      if (isShop) {
        facilities.push({ lat: el.lat, lon: el.lon, type: "shop" });
      } else if (transportType) {
        facilities.push({ lat: el.lat, lon: el.lon, type: transportType });
      }
    }

    return facilities;
  } catch {
    return [];
  }
}

const TRANSPORT_MARKERS: Record<
  Exclude<FacilityType, "shop">,
  { color: string; label: string }
> = {
  bus: { color: "green", label: "B" },
  train: { color: "purple", label: "R" },
  tube: { color: "0xCC0000", label: "U" },
  dlr: { color: "0x00CED1", label: "D" },
};

function buildStaticMapUrl(
  lat: number,
  lon: number,
  facilities: Facility[],
  key: string,
): string {
  const params = new URLSearchParams({
    center: `${lat},${lon}`,
    zoom: "17",
    size: "600x200",
    scale: "2",
    key,
  });

  params.append("markers", `color:red|label:P|${lat},${lon}`);

  const shops = facilities.filter((f) => f.type === "shop").slice(0, 6);
  const bus = facilities.filter((f) => f.type === "bus").slice(0, 4);
  const train = facilities.filter((f) => f.type === "train").slice(0, 4);
  const tube = facilities.filter((f) => f.type === "tube").slice(0, 4);
  const dlr = facilities.filter((f) => f.type === "dlr").slice(0, 4);

  for (const f of shops) {
    params.append("markers", `color:blue|label:S|${f.lat},${f.lon}`);
  }
  for (const f of bus) {
    const m = TRANSPORT_MARKERS.bus;
    params.append("markers", `color:${m.color}|label:${m.label}|${f.lat},${f.lon}`);
  }
  for (const f of train) {
    const m = TRANSPORT_MARKERS.train;
    params.append("markers", `color:${m.color}|label:${m.label}|${f.lat},${f.lon}`);
  }
  for (const f of tube) {
    const m = TRANSPORT_MARKERS.tube;
    params.append("markers", `color:${m.color}|label:${m.label}|${f.lat},${f.lon}`);
  }
  for (const f of dlr) {
    const m = TRANSPORT_MARKERS.dlr;
    params.append("markers", `color:${m.color}|label:${m.label}|${f.lat},${f.lon}`);
  }

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!lat || !lon || !key) {
    return NextResponse.json(
      { error: "Missing lat, lon, or API key" },
      { status: 400 },
    );
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
    return NextResponse.json(
      { error: "Invalid lat or lon" },
      { status: 400 },
    );
  }

  try {
    const facilities = await fetchNearbyFacilities(latNum, lonNum);
    const url = buildStaticMapUrl(latNum, lonNum, facilities, key);

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch map image" },
        { status: 502 },
      );
    }
    const blob = await res.blob();
    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    console.error("[map-image] Error:", e);
    return NextResponse.json(
      { error: "Map image fetch failed" },
      { status: 500 },
    );
  }
}
