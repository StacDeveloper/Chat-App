import cloudinary from "../lib/cloudinary.js"
import { generatetoken } from "../lib/utils.js"
import User from "../models/user.js"
import brcrypt from 'bcrypt'

// Signup new user

export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: 'Please complete all the required fields' })
        }
        const user = await User.findOne({ email: email })
        if (user) {
            return res.json({ success: false, message: "Account Already Exist" })
        }
        const salt = await brcrypt.genSalt(10)
        const hashedpassword = await brcrypt.hash(password, salt)
        const newUser = await User.create({
            fullName,
            email,
            password: hashedpassword,
            bio
        })
        const token = generatetoken(newUser._id)
        res.json({ success: true, userData: newUser, token, message: 'Account Created Successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// controller to login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const userData = await User.findOne({ email })
        const isPasswordCorrect = await brcrypt.compare(password, userData.password)
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }
        const token = generatetoken(userData._id)
        res.json({ success: true, userData, token, message: "Login Successfull" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Controller to Check if user is authenticated
export const checkAuth = async (req, res) => {
    res.json({ success: true, user: req.user })
}

// controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body
        const userId = req.user._id
        let updatedUser
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true })
        }
        return res.json({ success: true, user: updatedUser })
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }

}