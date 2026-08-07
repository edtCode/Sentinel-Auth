const logger = require('../utils/logger')

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }

        const userRole = req.user.role

        if (!allowedRoles.includes(userRole)) {

            logger.warn(
                {
                    userId: req.user.id,
                    role: req.user.role,
                    allowedRoles,
                },
                "RBAC access denied"
            );
            return res.status(403).json({

                success: false,
                message: "Access denied"
            })
        }

        next()
    }
}

module.exports = authorize