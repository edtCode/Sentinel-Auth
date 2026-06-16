const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Sentinel Auth API",
            version: "1.0.0",
            description: "Authentication Service API"
        },

        servers: [
            {
                url: "http://localhost:5173"
            }
        ]
    },

    apis: [
        "./src/routes/*.js"
    ]
};

const swaggerSpec =
    swaggerJsdoc(options);

module.exports = swaggerSpec;