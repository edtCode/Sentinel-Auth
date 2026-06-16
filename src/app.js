const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const cors = require('cors');
const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./docs/swagger")

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const managerRoutes = require('./routes/manager.routes');

const corsOptions = require("./config/cors");

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(cors(corsOptions));

app.use(express.json({
    limit: "10kb"
}));

app.use(cookieParser());

app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerSpec))

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);

module.exports = app;