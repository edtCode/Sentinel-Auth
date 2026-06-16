const { z } = require("zod");

const envSchema = z.object({
    PORT: z.string().min(1),

    DB_HOST: z.string().min(1),
    DB_PORT: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),

    JWT_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1)
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