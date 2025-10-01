import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BASE_URL
axios.defaults.baseURL = backendUrl

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [token, Settoken] = useState(localStorage.getItem("token"))
    const [authUser, SetauthUser] = useState(null)
    const [onlineUser, Setonlineuser] = useState([])
    const [socket, SetSocket] = useState(null)

    const checkAuth = async () => {
        try {
            const data = await axios.get("/api/auth/check")
            if (data.success) {
                SetauthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Update profile function to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body)
            if (data.success) {
                SetauthUser(data.user)
                toast.success("Profile Updated Successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Login function to handle user authentication and socket connection
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)
            if (data.success) {
                SetauthUser(data.userData)
                connectSocket(data.userData)
                axios.defaults.headers.common["token"] = data.token
                Settoken(data.token)
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    // Logout function to handle user logout and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token")
        Settoken(null)
        SetauthUser(null)
        Setonlineuser([])
        axios.defaults.headers.common["token"] = null
        toast.success("Logged Out Successfully")
        socket.disconnect()
    }


    // Connect Socket funtion to handle socket connection  and online users updates
    const connectSocket = (userdata) => {
        if (!userdata || socket?.connected) return
        const newSocket = io(backendUrl, {
            query: {
                userId: userdata._id
            }
        })
        newSocket.connect()
        SetSocket(newSocket)
        newSocket.on("getOnlineUsers", (userIds) => {
            Setonlineuser(userIds)
        })
    }
    useEffect(() => {   
        if (token) {
            axios.defaults.headers.common["token"] = token
        }
        checkAuth()
    }, [])

    // Check if the user is authenticated or not and if so, set the user data and connect the socket

    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}