const logger = require('../utils/logger')

const getManagerDashboard = async(req,res)=>{
    try {
        logger.info({
            userId: req.user.id,
            role: req.user.role
        },"Manager dashboard accessed")

        return res.status(200).json({
            success: true,
            message: "Welcome manager dashboard"
        })
    } catch (error) {
        logger.error({
            error: error.message
        },"Manager dashboard access failed")

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

module.exports = { getManagerDashboard }