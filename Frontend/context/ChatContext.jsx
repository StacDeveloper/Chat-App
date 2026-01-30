import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
    const [messages, Setmessages] = useState([])
    const [users, Setusers] = useState([])
    const [selectedUser, SetselectedUser] = useState(null)
    const [unseenMessages, SetunseenMessages] = useState({})
    const { socket, axios } = useContext(AuthContext)

    // Function to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users")
            if (data.success) {
                Setusers(data.users)
                SetunseenMessages(data.unseenmessages)
            }
        } catch (error) {
            console.log(error.message)
            toast.error(error.message)
        }
    }
    // Funtion to get messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`)
            if (data.success) {
                Setmessages(data.messages)
            }
        } catch (error) {
            console.log(error.message)
            toast.error(error.message)
        }
    }

    // Function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if (data.success) {
                Setmessages((prevMessages) => [...prevMessages, data.newMessage])
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error.message)
            toast.error(error.message)
        }
    }

    // Function to subscribe messages for selected User
    const subscribetoMessages = async () => {
        try {
            if (!socket) return
            socket.on("newMessage", (newMessage) => {
                if (selectedUser && newMessage.senderId === selectedUser._id) {
                    newMessage.seen = true
                    Setmessages((prevMessage) => [...prevMessage, newMessage])
                    axios.put(`/api/messages/mark/${newMessage._id}`)
                } else {
                    SetunseenMessages((prevUnseenMessages) => ({
                        ...prevUnseenMessages, [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                    }))
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    const unsubscribefromMessages = () => {
        if (socket) socket.off("newMessage")
    }

    useEffect(() => {
        subscribetoMessages()
        return () => unsubscribefromMessages()

    }, [socket, selectedUser])



    const value = {
        messages, users, selectedUser, getUsers, Setmessages, sendMessage, SetselectedUser, unseenMessages, SetunseenMessages, getMessages
    }
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}