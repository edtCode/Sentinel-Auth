const logger = require("../utils/logger")

const getAdminDashboard = async(req,res)=>{
   try {
     logger.info({
        userId: req.user.id
    },"Admin dashboard accessed")

    return res.status(200).json({
        success: true,
        message: "Welcome Admin",
        user: req.user
    })
   } catch (error) {
      logger.error({
        error: error.message
      },"Admin dashboard failed")

      return res.status(500).json({
        success: false,
        message: "Internal server error"
      })
   }
}

module.exports = { getAdminDashboard }