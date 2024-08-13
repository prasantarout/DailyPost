// src/server.js
const dotenv = require('dotenv');
dotenv.config();
const app = require("./app");
const logger = require("./utils/logger");
const { port } = require("./config/index");

app?.listen(port, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});
