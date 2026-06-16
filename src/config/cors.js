const corsOptions = {
    origin: [
        "http://localhost:5173"
    ],
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