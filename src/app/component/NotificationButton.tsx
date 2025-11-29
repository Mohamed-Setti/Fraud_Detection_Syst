import React from "react";
import { useNotifications } from "./useNotifications";

export const NotificationButton: React.FC<{ className?: string }> = ({ className }) => {
  const { unreadCount, toggle } = useNotifications();

  return (
    <button
      aria-label="Notifications"
      onClick={toggle}
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      🔔
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            background: "#e11",
            color: "#fff",
            borderRadius: 12,
            padding: "2px 6px",
            fontSize: 12,
            lineHeight: "12px",
          }}
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
};