const pool =  require('../../src/config/db')

const clearDatabase = async () =>{

    const client = await pool.connect()
    
   try {
     await client.query("BEGIN")

    await client.query("DELETE FROM refresh_tokens")
    await client.query("DELETE FROM password_reset_tokens")
    await client.query("DELETE FROM email_verification_tokens")
    await client.query("DELETE FROM audit_logs")
    await client.query("DELETE FROM users")

    await client.query("COMMIT")

   } catch (error) {
    await client.query("ROLLBACK")

    throw error
   }

   finally{
    client.release()
   }
}

module.exports={
    clearDatabase
}
