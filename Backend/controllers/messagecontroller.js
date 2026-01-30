// Get all user except the logged in User

import Message from "../models/message.js"
import User from "../models/user.js"
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketmap } from "../server.js"

export const getUserForsidebar = async (req, res) => {
    try {
        const userId = req.user._id
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password")

        // Better approach: Use aggregation or direct query
        const unseenmessages = {}
        
        for (const user of filteredUsers) {
            const unreadCount = await Message.countDocuments({ 
                senderId: user._id, 
                receiverId: userId, 
                seen: false 
            })
            if (unreadCount > 0) {
                unseenmessages[user._id] = unreadCount
            }
        }
        
        console.log('Unseen messages:', unseenmessages) // Debug log
        
        res.json({ success: true, users: filteredUsers, unseenmessages })
    } catch (error) {
        console.log('Get users error:', error)
        res.json({ success: false, message: error.message })
    }
}

// Get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params
        const myId = req.user._id

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },

            ]
        })
        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });
        res.json({ success: true, messages })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// api to mark message as seen using message id
export const markMessageasSeen = async (req, res) => {
    try {
        const { id } = req.params
        await Message.findByIdAndUpdate(id, { seen: true })
        res.json({ success: true })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const receiverId = req.params.id
        const senderId = req.user._id

        let image_url
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            image_url = uploadResponse.secure_url
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: image_url
        })

        // Emit the new message to receivers socket
        const receiverSocketId = userSocketmap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({ success: true, newMessage })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}