const pool = require('../config/db')

const createAuditLog = async({
    userId = null,
    eventType,
    ipAddress = null,
    userAgent = null,
    metadata = {}
}) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs(user_id,event_type,ip_address,user_agent,metadata) VALUES ($1,$2,$3,$4,$5)`,
            [userId,eventType,ipAddress,userAgent,JSON.stringify(metadata)]
        )
    } catch (error) {
        console.error("Audit Log error : ",error.message)
    }
    
}

module.exports = createAuditLog