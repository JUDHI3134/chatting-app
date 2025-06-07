import Message from "../models/Message.js";
import User from "../models/User.js";


//Get all user except the loggedin user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password")
        
        //count number of message not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async(user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false })
            
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length
            }

        })

        await Promise.all(promises)
        res.json({success: true, user: filteredUsers, unseenMessages})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//Get all message for a selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                {senderId: selectedUserId, receiverId: myId}
            ]
        })

        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true })
        
        res.json({success: true, messages})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}