const { z } = require('zod')
const { refreshToken } = require('../controllers/auth.controllers')

const registerSchema = z.object({
  name: z.string().min(3, "Name must be atleast 3 letters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(3, "Password must be atleast 3 digits").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    "Password must contain uppercase, lowercase, number and special character")
})

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password must be provided")
})

const refreshTokenSchema =
  z.object({
    refreshToken: z.string().min(1),
  });


const logoutSchema = z.object({
  refreshToken: z.string().min(1)
})

const forgetPasswordSchema = z.object({
  email: z.string().email()
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8)
})

const changePasswordSchema = z.object({
   currentPassword : z.string().min(1),
   newPassword : z.string().min(8),
})

const verifyEmailSchema = z.object({
  token: z.string().min(1)
})

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema
}