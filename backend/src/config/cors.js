// Allowed browser origins. Defaults to the local Vite dev server; add your
// deployed frontend origins via the CORS_ORIGINS env var (comma-separated),
// e.g. "https://sentinel-auth.vercel.app,https://www.sentinel-auth.vercel.app"
const origins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
    : ["http://localhost:5173"];

const corsOptions = {
    origin: origins,
    credentials: true,
    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ]
}

module.exports = corsOptions