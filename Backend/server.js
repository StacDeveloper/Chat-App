import express from 'express'
import "dotenv/config"
import cors from 'cors'
import http from 'http'
import { connectDB } from './lib/db.js'
import userRouter from './routes/userroutes.js'

import { Server } from 'socket.io'
import messageRouter from './routes/messageroutes.js'

// Create Express app and HTTP server
const app = express()
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors: { origin: "*" }
})
// Store online user
export const userSocketmap = {}; //{userId: SocketId}

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    console.log("User Connected", userId)

    if (userId) {
        userSocketmap[userId] = socket.id

    }
    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketmap))

    socket.on("disconnect", () => {
        console.log("User Disconneted", userId)
        delete userSocketmap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketmap))
    })
})

// Middleware Setup
app.use(express.json({ limit: "4mb" }))
app.use(cors())

// Routes Setup 
app.use('/api/status', (req, res) => res.send('Server is Live'))
app.use('/api/auth', userRouter)
app.use("/api/messages", messageRouter)

const PORT = process.env.PORT || 5000
await connectDB()

server.listen(PORT, () => console.log('Server is running on PORT:' + PORT))