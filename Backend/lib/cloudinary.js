import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,    // ✅ Fixed: CLOUDINARY
    api_key: process.env.CLOUDINARY_API_KEY,          // ✅ This one was correct
    api_secret: process.env.CLOUDINARY_API_SECRET     // ✅ Fixed: CLOUDINARY
})

export default cloudinary