const Notification =
  require("../models/Notification");

const createNotification = async ({
  business,
  user = null,
  title,
  message,
  type = "info",
  link = "",
}) => {
  try {
    const notification =
      await Notification.create({
        business,
        user,
        title,
        message,
        type,
        link,
      });

    return notification;

  } catch (error) {
    console.error(
      "CREATE NOTIFICATION ERROR:",
      error
    );

    return null;
  }
};

module.exports =
  createNotification;