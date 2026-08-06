const express = require('express');

const router = express.Router();

const pool = require('../config/db');

const logger = require('../utils/logger');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Service health check
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Service is up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 service:
 *                   type: string
 *                 status:
 *                   type: string
 *                 database:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       503:
 *         description: Database unreachable
 */
router.get("/", async (req, res) => {
    let database = "up";

    try {
        await pool.query("SELECT 1");
    } catch (error) {
        logger.error({
            error: error.message
        }, "Health check: database unreachable");

        database = "down";
    }

    if (database === "down") {
        return res.status(503).json({
            success: false,
            service: "sentinel-auth-api",
            status: "degraded",
            database,
            timestamp: new Date().toISOString()
        });
    }

    return res.status(200).json({
        success: true,
        service: "sentinel-auth-api",
        status: "ok",
        database,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;