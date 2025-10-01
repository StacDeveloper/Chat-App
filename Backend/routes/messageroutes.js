import express from 'express'
import { protectRoute } from '../middleware/auth.js'
import { getMessages, getUserForsidebar, markMessageasSeen, sendMessage } from '../controllers/messagecontroller.js'

const messageRouter = express.Router()

messageRouter.get("/users", protectRoute, getUserForsidebar)
messageRouter.get('/:id', protectRoute, getMessages)
messageRouter.put('/mark/:id', protectRoute, markMessageasSeen)
messageRouter.post('/send/:id', protectRoute, sendMessage)

export default messageRouter




