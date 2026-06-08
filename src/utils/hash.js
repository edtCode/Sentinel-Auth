const bcrypt = require('bcrypt')

//For registration
const hashPassword = async (password) => {
    return bcrypt.hash(password, 10)
}

//for login
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword)
}

module.exports = { hashPassword, comparePassword }