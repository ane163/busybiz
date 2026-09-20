import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiTrash2,
} from "react-icons/fi";
import api from "../services/api";
import "./NotificationBell.css";

function NotificationBell() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {
    try {
      const response =
        await api.get(
          "/notifications"
        );

      setNotifications(
        response.data || []
      );

    } catch (error) {
      console.error(
        "LOAD NOTIFICATIONS ERROR:",
        error
      );
    }
  };


  // =====================================================
  // LOAD UNREAD COUNT
  // =====================================================

  const fetchUnreadCount = async () => {
    try {
      const response =
        await api.get(
          "/notifications/unread-count"
        );

      setUnreadCount(
        response.data?.count || 0
      );

    } catch (error) {
      console.error(
        "UNREAD COUNT ERROR:",
        error
      );
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval =
      setInterval(() => {
        fetchUnreadCount();
      }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  // =====================================================
  // OPEN DROPDOWN
  // =====================================================

  const toggleNotifications = async () => {
    const newState = !open;

    setOpen(newState);

    if (newState) {
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };


  // =====================================================
  // MARK AS READ
  // =====================================================

  const markAsRead = async (
    notification
  ) => {
    try {
      if (!notification.read) {
        await api.put(
          `/notifications/${notification._id}/read`
        );

        setNotifications(
          (previous) =>
            previous.map((item) =>
              item._id === notification._id
                ? {
                    ...item,
                    read: true,
                  }
                : item
            )
        );

        setUnreadCount(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
        );
      }

      if (notification.link) {
        setOpen(false);
        navigate(
          notification.link
        );
      }

    } catch (error) {
      console.error(
        "MARK NOTIFICATION ERROR:",
        error
      );
    }
  };


  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {
    try {
      await api.put(
        "/notifications/read-all"
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true,
            })
          )
      );

      setUnreadCount(0);

    } catch (error) {
      console.error(
        "MARK ALL ERROR:",
        error
      );
    }
  };


  // =====================================================
  // DELETE
  // =====================================================

  const deleteNotification = async (
    id
  ) => {
    try {
      await api.delete(
        `/notifications/${id}`
      );

      setNotifications(
        (previous) =>
          previous.filter(
            (notification) =>
              notification._id !== id
          )
      );

      await fetchUnreadCount();

    } catch (error) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        error
      );
    }
  };


  // =====================================================
  // TYPE ICON
  // =====================================================

  const getNotificationIcon = (
    type
  ) => {
    switch (type) {
      case "success":
      case "payment":
        return "✓";

      case "warning":
      case "inventory":
        return "⚠️";

      case "error":
        return "!";

      case "order":
        return "🛒";

      case "invoice":
        return "📄";

      case "team":
        return "👥";

      default:
        return "i";
    }
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="notification-container">

      <button
        type="button"
        className="notification-button"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >

        <FiBell size={21} />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}

      </button>


      {open && (
        <div className="notification-dropdown">

          <div className="notification-header">

            <div>
              <h3>
                Notifications
              </h3>

              <span>
                {unreadCount} unread
              </span>
            </div>


            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
              >
                <FiCheck />
                Mark all read
              </button>
            )}

          </div>


          <div className="notification-list">

            {loading ? (
              <p className="notification-empty">
                Loading...
              </p>

            ) : notifications.length === 0 ? (

              <div className="notification-empty">
                <FiBell size={30} />

                <p>
                  You're all caught up.
                </p>
              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <div
                    key={
                      notification._id
                    }
                    className={
                      `notification-item ${
                        notification.read
                          ? ""
                          : "unread"
                      }`
                    }
                  >

                    <button
                      type="button"
                      className="notification-content"
                      onClick={() =>
                        markAsRead(
                          notification
                        )
                      }
                    >

                      <span className="notification-type-icon">
                        {getNotificationIcon(
                          notification.type
                        )}
                      </span>


                      <span className="notification-text">

                        <strong>
                          {
                            notification.title
                          }
                        </strong>

                        <span>
                          {
                            notification.message
                          }
                        </span>

                        <small>
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </small>

                      </span>

                    </button>


                    <button
                      type="button"
                      className="notification-delete"
                      onClick={() =>
                        deleteNotification(
                          notification._id
                        )
                      }
                      aria-label="Delete notification"
                    >
                      <FiTrash2 />
                    </button>

                  </div>
                )
              )
            )}

          </div>


          <div className="notification-footer">

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(
                  "/notifications"
                );
              }}
            >
              View all notifications
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationBell;

