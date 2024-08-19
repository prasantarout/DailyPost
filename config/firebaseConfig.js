const admin = require("firebase-admin");
const path = require("path");


const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

if (!serviceAccountPath) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is not set.");
}
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(serviceAccountPath))),
});

module.exports = admin;
