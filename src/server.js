require("dotenv").config();
require("./config/env");

const app = require('./app');

const logger = require("./utils/logger");

const PORT = process.env.PORT || 5173;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
});