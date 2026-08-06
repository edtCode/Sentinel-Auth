const crypto = require("crypto");

const pool = require("../config/db");

const getEmailFromProfile = (profile) => {
    if (profile.emails && profile.emails.length > 0) {
        return profile.emails[0].value.toLowerCase();
    }
    return null;
};

const findOrCreateOAuthUser = async (provider, profile) => {
    const providerId = String(profile.id);

    const email = getEmailFromProfile(profile);

    const name =
        profile.displayName ||
        profile.username ||
        (email ? email.split("@")[0] : "OAuth User");

    if (!email) {
        const error = new Error("OAuth profile does not include an email");
        error.code = "OAUTH_EMAIL_REQUIRED";
        throw error;
    }

    const byProvider = await pool.query(
        `SELECT * FROM users WHERE provider = $1 AND provider_id = $2`,
        [provider, providerId]
    );

    if (byProvider.rows.length > 0) {
        const existing = byProvider.rows[0];

        if (existing.name !== name) {
            await pool.query(
                `UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2`,
                [name, existing.id]
            );

            existing.name = name;
        }

        return existing;
    }

    const byEmail = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );

    if (byEmail.rows.length > 0) {
        const linked = await pool.query(
            `UPDATE users SET provider = $1, provider_id = $2, is_verified = true, updated_at = NOW() WHERE id = $3 RETURNING *`,
            [provider, providerId, byEmail.rows[0].id]
        );

        return linked.rows[0];
    }

    const randomPassword = crypto.randomBytes(32).toString("hex");

    const created = await pool.query(
        `INSERT INTO users (name, email, password, role, is_verified, provider, provider_id)
         VALUES ($1, $2, $3, 'USER', true, $4, $5)
         RETURNING *`,
        [name, email, randomPassword, provider, providerId]
    );

    return created.rows[0];
};

module.exports = { findOrCreateOAuthUser };
