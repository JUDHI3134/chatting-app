import express from "express"
import cors from "cors"
import "dotenv/config"
import http from "http"
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/userRoutes.js"
import messageRouter from "./routes/messageRoutes.js"
import { Server } from "socket.io"

//create express app and HTTP server
const app = express()
const server = http.createServer(app)

//initialized socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

//store online user
export const userSocketMap = {}; //{userId: socketId}

//Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId)

    if (userId) userSocketMap[userId] = socket.id
    
    //emit online user to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

//middleware setup
app.use(express.json({ limit: "4mb" }))
app.use(cors())

app.use("/api/status", (req, res) => { res.send("Server is Live") })

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

//connect to mongoDB
await connectDB()

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => console.log("Server running on PORT : "+ PORT))   
}

//export server for vercel
export default server;

