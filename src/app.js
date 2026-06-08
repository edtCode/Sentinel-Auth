const express = require('express');

const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes')

const userRoutes = require('./routes/user.routes')

const adminRoutes = require('./routes/admin.routes')

const managerRoutes = require('../src/routes/manager.routes')

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth",authRoutes)

app.use("/api/users",userRoutes)

app.use("/api/admin",adminRoutes)

app.use("/api/manager",managerRoutes)

module.exports = app;