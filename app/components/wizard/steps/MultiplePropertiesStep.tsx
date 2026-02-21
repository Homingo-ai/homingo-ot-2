import React from "react";
import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import { WizardStepProps } from "../types";

const MultiplePropertiesStep: React.FC<WizardStepProps> = ({
  formData,
  handleUpdateField,
}) => {
  const isYes = formData.multipleProperties === "Yes";

  const buttonBase: React.CSSProperties = {
    flex: 1,
    padding: "18px 12px",
    borderRadius: "12px",
    border: "2px solid",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
    transition: "all 0.15s ease",
    textAlign: "center",
  };

  const yesStyle: React.CSSProperties = {
    ...buttonBase,
    borderColor: isYes ? "#6366f1" : "#e2e8f0",
    background: isYes ? "#eef2ff" : "#fff",
    color: isYes ? "#4338ca" : "#64748b",
  };

  const noStyle: React.CSSProperties = {
    ...buttonBase,
    borderColor:
      !isYes && formData.multipleProperties === "No" ? "#6366f1" : "#e2e8f0",
    background:
      !isYes && formData.multipleProperties === "No" ? "#eef2ff" : "#fff",
    color:
      !isYes && formData.multipleProperties === "No" ? "#4338ca" : "#64748b",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ padding: "24px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "#eef2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Copy size={20} color="#6366f1" />
        </div>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "17px",
              fontWeight: "800",
              color: "#1e293b",
            }}
          >
            Multiple Identical Properties
          </h2>
        </div>
      </div>

      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "24px",
          marginTop: "16px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#475569",
            lineHeight: "1.6",
          }}
        >
          If this property is one of a number of{" "}
          <strong>identical units</strong> in the same block or development,
          this survey will apply to all identical units — saving time on repeat
          assessments.
        </p>
      </div>

      <p
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#1e293b",
          marginBottom: "16px",
        }}
      >
        Is this property one of multiple identical units in the same block or
        development?
      </p>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <button
          style={yesStyle}
          onClick={() => handleUpdateField("multipleProperties", "Yes")}
        >
          Yes
        </button>
        <button
          style={noStyle}
          onClick={() => {
            handleUpdateField("multipleProperties", "No");
            handleUpdateField("multiplePropertiesCount", "");
          }}
        >
          No
        </button>
      </div>

      {isYes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              background: "#eef2ff",
              border: "1.5px solid #c7d2fe",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#4338ca",
                display: "block",
                marginBottom: "10px",
              }}
            >
              How many identical units are there in total?
            </label>
            <input
              type="number"
              min="2"
              placeholder="e.g. 12"
              value={formData.multiplePropertiesCount || ""}
              onChange={(e) =>
                handleUpdateField("multiplePropertiesCount", e.target.value)
              }
              style={{
                width: "120px",
                padding: "10px 12px",
                border: "1.5px solid #a5b4fc",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "700",
                color: "#1e293b",
                background: "#fff",
                outline: "none",
              }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MultiplePropertiesStep;
