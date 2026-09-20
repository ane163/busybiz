import { useEffect, useState } from "react";
import { FiBell, FiCheck, FiTrash2 } from "react-icons/fi";
import api from "../../services/api";

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


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
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to load notifications."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchNotifications();
  }, []);


  const markAsRead = async (id) => {
    try {
      await api.put(
        `/notifications/${id}/read`
      );

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification._id === id
                ? {
                    ...notification,
                    read: true,
                  }
                : notification
          )
      );

    } catch (error) {
      console.error(error);
    }
  };


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

    } catch (error) {
      console.error(error);
    }
  };


  const deleteNotification = async (id) => {
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

    } catch (error) {
      console.error(error);
    }
  };


  if (loading) {
    return (
      <div>
        <h1>Notifications</h1>
        <p>Loading notifications...</p>
      </div>
    );
  }


  return (
    <div className="notifications-page">

      <div>
        <h1>Notifications</h1>

        <p>
          Stay up to date with your business.
        </p>

        {notifications.some(
          (notification) =>
            !notification.read
        ) && (
          <button
            onClick={markAllAsRead}
          >
            <FiCheck />
            Mark all as read
          </button>
        )}
      </div>


      {error && (
        <p>{error}</p>
      )}


      {notifications.length === 0 ? (

        <div>
          <FiBell size={40} />

          <h3>
            You're all caught up
          </h3>

          <p>
            New business notifications
            will appear here.
          </p>
        </div>

      ) : (

        <div>

          {notifications.map(
            (notification) => (

              <div
                key={
                  notification._id
                }
              >

                <div>
                  <strong>
                    {
                      notification.title
                    }
                  </strong>

                  <p>
                    {
                      notification.message
                    }
                  </p>

                  <small>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </small>
                </div>


                {!notification.read && (
                  <button
                    onClick={() =>
                      markAsRead(
                        notification._id
                      )
                    }
                  >
                    Mark read
                  </button>
                )}


                <button
                  onClick={() =>
                    deleteNotification(
                      notification._id
                    )
                  }
                >
                  <FiTrash2 />
                </button>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

export default Notifications;