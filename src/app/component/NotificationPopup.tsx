import React from "react";
import { useNotifications } from "./useNotifications";

export const NotificationPopup: React.FC = () => {
  const { notifications, visible, hide, markAllRead, removeAll } = useNotifications();

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseLeave={hide}
      style={{
        position: "absolute",
        right: 16,
        top: 52,
        width: 340,
        maxHeight: "60vh",
        overflow: "auto",
        background: "#fff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
        borderRadius: 8,
        padding: 12,
        zIndex: 9999,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong style={{ color: "#3b82f6" }}>Notifications</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={markAllRead} style={{ fontSize: 12 }}>
            Marquer lues
          </button>
          <button onClick={removeAll} style={{ fontSize: 12 }}>
            Vider
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: 12, color: "#666" }}>Aucune notification</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {notifications.map((n) => (
            <li
              key={n.id}
              style={{
                padding: "8px 6px",
                borderRadius: 6,
                background: n.read ? "transparent" : "rgba(59,130,246,0.06)",
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: "#333" }}>{n.message}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
                {new Date(n.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};