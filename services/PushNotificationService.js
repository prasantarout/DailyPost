const admin = require('../config/firebaseConfig'); // Import the Firebase config file

const send = async ({ to, title, body }) => {
  const message = {
    notification: {
      title,
      body,
    },
    token: to,
  };

  try {
    await admin.messaging().send(message);
    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification", error);
  }
};

module.exports = { send };
