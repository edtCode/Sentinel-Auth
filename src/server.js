require("dotenv").config();
require("./config/env");

const app = require("./app");
const pool = require("./config/db");

const logger = require("./utils/logger");

const PORT = process.env.PORT || 5173;

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

const gracefulShutdown = async () => {

    logger.info("Shutting down server...");

    server.close(async () => {

        logger.info("HTTP server closed");

        try {

            await pool.end();

            logger.info("Database pool closed");

            process.exit(0);

        } catch (error) {

            logger.error(
                { error: error.message },
                "Error during shutdown"
            );

            process.exit(1);
        }
    });
};

process.on("SIGINT", gracefulShutdown);

process.on("SIGTERM", gracefulShutdown);