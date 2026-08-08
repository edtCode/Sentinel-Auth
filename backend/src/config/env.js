const { z } = require("zod");

const envSchema = z.object({
    PORT: z.string().min(1),

    DATABASE_URL: z.string().optional(),
    DB_HOST: z.string().optional(),
    DB_PORT: z.string().optional(),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),

    JWT_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),

    GOOGLE_CLIENT_ID: z.string().optional(),

    GOOGLE_CLIENT_SECRET: z.string().optional(),

    GOOGLE_CALLBACK_URL: z.string().optional(),

    GITHUB_CLIENT_ID: z.string().optional(),

    GITHUB_CLIENT_SECRET: z.string().optional(),

    GITHUB_CALLBACK_URL: z.string().optional(),
});

const result =
    envSchema.safeParse(process.env);

if (!result.success) {

    console.error(
        "Environment validation failed"
    );

    console.error(
        result.error.format()
    );

    process.exit(1);
}

module.exports = result.data;