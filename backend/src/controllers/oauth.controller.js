const passport = require("../config/passport");

const pool = require("../config/db");

const logger = require("../utils/logger");

const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const createAuditLog = require("../utils/audit");

const SECURITY = require("../config/security");

const issueTokens = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "OAuth authentication failed"
            });
        }

        const user = req.user;

        const accessToken = generateAccessToken(user);

        const refreshToken = generateRefreshToken(user);

        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${SECURITY.REFRESH_TOKEN_DAYS} days')`,
            [user.id, refreshToken]
        );

        await pool.query(
            `INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES ($1, $2, $3)`,
            [user.id, req.ip, req.get("User-Agent")]
        );

        await createAuditLog({
            userId: user.id,
            eventType: "OAUTH_LOGIN",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            metadata: {
                provider: user.provider
            }
        });

        logger.info(
            {
                userId: user.id,
                provider: user.provider
            },
            "OAuth login successful"
        );

        return res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                provider: user.provider,
            },
        });
    } catch (error) {
        logger.error(
            {
                error: error.message,
            },
            "OAuth token issuance failed"
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const isProviderConfigured = (provider) =>
    Array.isArray(passport.registeredProviders) &&
    passport.registeredProviders.includes(provider);

const notConfigured = (req, res) => {
    return res.status(503).json({
        success: false,
        message: "OAuth is not configured"
    });
};

const googleAuth = isProviderConfigured("google")
    ? passport.authenticate("google", {
          session: false,
          scope: ["profile", "email"],
      })
    : notConfigured;

const googleCallback = isProviderConfigured("google")
    ? [
          passport.authenticate("google", {
              session: false,
              failureRedirect: "/api/auth/oauth/failure",
          }),
          issueTokens,
      ]
    : notConfigured;

const githubAuth = isProviderConfigured("github")
    ? passport.authenticate("github", {
          session: false,
          scope: ["user:email"],
      })
    : notConfigured;

const githubCallback = isProviderConfigured("github")
    ? [
          passport.authenticate("github", {
              session: false,
              failureRedirect: "/api/auth/oauth/failure",
          }),
          issueTokens,
      ]
    : notConfigured;

const oauthFailure = (req, res) => {
    return res.status(401).json({
        success: false,
        message: "OAuth authentication failed"
    });
};

module.exports = {
    googleAuth,
    googleCallback,
    githubAuth,
    githubCallback,
    oauthFailure,
    issueTokens,
};
