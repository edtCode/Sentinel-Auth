const express = require("express");

const router = express.Router();

const {
    googleAuth,
    googleCallback,
    githubAuth,
    githubCallback,
    oauthFailure,
} = require("../controllers/oauth.controller");

router.get("/google", googleAuth);

router.get("/google/callback", googleCallback);

router.get("/github", githubAuth);

router.get("/github/callback", githubCallback);

router.get("/oauth/failure", oauthFailure);

module.exports = router;
