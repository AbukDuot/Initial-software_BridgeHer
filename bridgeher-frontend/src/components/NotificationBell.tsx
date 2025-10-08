import React, { useState } from "react";
import "../styles/notification.css";

function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="notification-bell">
      <button className="bell-icon" onClick={() => setOpen(!open)}>
        🔔
      </button>
      {open && (
        <div className="notification-dropdown">
          {notifications.map((note) => (
            <p key={note.id}>{note.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
