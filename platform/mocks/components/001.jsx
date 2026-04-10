import { useState, useRef, useEffect } from "react";

const CATEGORIES = [
  "Chat Models",
  "Embedding Models",
  "Search Tools",
  "Code Assistants",
  "Image Models",
  "Audio Models",
  "Data Pipelines",
  "Custom Agents",
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "#22c55e", bg: "#dcfce7" },
  { value: "inactive", label: "Inactive", color: "#94a3b8", bg: "#f1f5f9" },
  { value: "beta", label: "Beta", color: "#f59e0b", bg: "#fef3c7" },
  { value: "deprecated", label: "Deprecated", color: "#ef4444", bg: "#fee2e2" },
];

const EMOJI_OPTIONS = [
  "🔍",
  "🤖",
  "💬",
  "🧠",
  "⚡",
  "🔗",
  "📡",
  "🛠️",
  "🎯",
  "📊",
  "🗂️",
  "🔐",
  "🌐",
  "📝",
  "🧩",
  "🚀",
];

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          height: 44,
          borderRadius: 10,
          border: "1.5px solid #e2e8f0",
          background: "#fff",
          fontSize: 22,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
          borderColor: open ? "#818cf8" : "#e2e8f0",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.borderColor = "#cbd5e1";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.borderColor = "#e2e8f0";
        }}
      >
        {value || <span style={{ fontSize: 14, color: "#94a3b8" }}>Pick</span>}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            borderRadius: 14,
            boxShadow:
              "0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
            padding: 10,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 4,
            zIndex: 50,
            animation: "fadeIn 0.15s ease",
          }}
        >
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: "none",
                background: value === emoji ? "#eef2ff" : "transparent",
                fontSize: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f1f5f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  value === emoji ? "#eef2ff" : "transparent")
              }
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ option, selected, onSelect }) {
  const isActive = selected === option.value;
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      style={{
        padding: "6px 14px",
        borderRadius: 20,
        border: isActive
          ? `1.5px solid ${option.color}`
          : "1.5px solid #e2e8f0",
        background: isActive ? option.bg : "#fff",
        color: isActive ? option.color : "#64748b",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "inherit",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = option.color;
          e.currentTarget.style.color = option.color;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.color = "#64748b";
        }
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: isActive ? option.color : "#cbd5e1",
          marginRight: 6,
          transition: "background 0.2s",
        }}
      />
      {option.label}
    </button>
  );
}

function SelectDropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          height: 44,
          borderRadius: 10,
          border: "1.5px solid",
          borderColor: open ? "#818cf8" : "#e2e8f0",
          background: "#fff",
          padding: "0 14px",
          fontSize: 14,
          color: value ? "#1e293b" : "#94a3b8",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "inherit",
          transition: "all 0.2s",
          boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
        }}
      >
        <span>{value || placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "#fff",
            borderRadius: 12,
            boxShadow:
              "0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
            padding: 5,
            zIndex: 50,
            maxHeight: 220,
            overflowY: "auto",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                background: value === opt ? "#eef2ff" : "transparent",
                color: value === opt ? "#4f46e5" : "#1e293b",
                fontSize: 14,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                fontWeight: value === opt ? 600 : 400,
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  value === opt ? "#eef2ff" : "#f8fafc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  value === opt ? "#eef2ff" : "transparent")
              }
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BasicInfoForm() {
  const [form, setForm] = useState({
    name: "TavilySearch",
    category: "Chat Models",
    status: "active",
    emoji: "🔍",
    description: "Web search tool via Tavily API",
  });
  const [saved, setSaved] = useState(false);
  const [charCount, setCharCount] = useState(form.description.length);

  const update = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
    if (key === "description") setCharCount(val.length);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 20px",
        fontFamily:
          "'DM Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        textarea:focus, input:focus { outline: none; }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {form.emoji || "⚙️"}
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                Basic Info
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#94a3b8",
                  fontWeight: 400,
                }}
              >
                Configure your tool identity
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              background: saved
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "linear-gradient(135deg, #4f46e5, #6366f1)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.25s",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: saved
                ? "0 2px 8px rgba(34,197,94,0.3)"
                : "0 2px 8px rgba(79,70,229,0.3)",
            }}
          >
            {saved ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{ animation: "checkIn 0.3s ease" }}
                >
                  <path
                    d="M3 7L6 10L11 4"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Saved
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: "24px 28px 28px" }}>
          {/* Row 1: Emoji + Name (grouped as identity) */}
          <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 72, flexShrink: 0 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Icon
              </label>
              <EmojiPicker
                value={form.emoji}
                onChange={(v) => update("emoji", v)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Enter tool name..."
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  padding: "0 14px",
                  fontSize: 14,
                  color: "#1e293b",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                  background: "#fff",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#818cf8";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Row 2: Category */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Category
            </label>
            <SelectDropdown
              value={form.category}
              onChange={(v) => update("category", v)}
              options={CATEGORIES}
              placeholder="Select category..."
            />
          </div>

          {/* Row 3: Status pills */}
          <div style={{ marginBottom: 22 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Status
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map((opt) => (
                <StatusPill
                  key={opt.value}
                  option={opt}
                  selected={form.status}
                  onSelect={(v) => update("status", v)}
                />
              ))}
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Description
              </label>
              <span
                style={{
                  fontSize: 11,
                  color: charCount > 200 ? "#ef4444" : "#94a3b8",
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {charCount}/200
              </span>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => {
                if (e.target.value.length <= 200)
                  update("description", e.target.value);
              }}
              placeholder="Describe what this tool does..."
              rows={3}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                padding: "12px 14px",
                fontSize: 14,
                color: "#1e293b",
                fontFamily: "inherit",
                resize: "vertical",
                transition: "all 0.2s",
                boxSizing: "border-box",
                lineHeight: 1.6,
                background: "#fff",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#818cf8";
                e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
