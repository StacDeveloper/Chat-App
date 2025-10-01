import User from "../models/user.js"
import jwt from 'jsonwebtoken'

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token

        // Add this check for missing token
        if (!token) {
            return res.json({ 
                success: false, 
                message: "Access denied. No token provided." 
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select("-password")
        
        if (!user) {
            return res.json({ 
                success: false, 
                message: "User not found" 
            })
        }
        
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        return res.json({ 
            success: false, 
            message: error.message 
        })
    }
}