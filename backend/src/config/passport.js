const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const GitHubStrategy = require("passport-github2").Strategy;

const { findOrCreateOAuthUser } = require("../services/oauth.service");

const logger = require("../utils/logger");

const registeredProviders = [];

if (process.env.GOOGLE_CLIENT_ID) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const user = await findOrCreateOAuthUser("google", profile);
                    return done(null, user);
                } catch (error) {
                    logger.error(
                        { error: error.message },
                        "Google OAuth verification failed"
                    );
                    return done(error, null);
                }
            }
        )
    );

    registeredProviders.push("google");
}

if (process.env.GITHUB_CLIENT_ID) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const user = await findOrCreateOAuthUser("github", profile);
                    return done(null, user);
                } catch (error) {
                    logger.error(
                        { error: error.message },
                        "GitHub OAuth verification failed"
                    );
                    return done(error, null);
                }
            }
        )
    );

    registeredProviders.push("github");
}

passport.registeredProviders = registeredProviders;

module.exports = passport;
