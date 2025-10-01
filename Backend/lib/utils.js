import jwt from 'jsonwebtoken'

// Funtion to generate a token for user
export const generatetoken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET)
    return token
}