import express from "express"
import cors from "cors"
import "dotenv/config"
import http from "http"
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/userRoutes.js"
import messageRouter from "./routes/messageRoutes.js"

//create express app and HTTP server
const app = express()
const server = http.createServer(app)

//middleware setup
app.use(express.json({ limit: "4mb" }))
app.use(cors())

app.use("/api/status", (req, res) => { res.send("Server is Live") })

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

//connect to mongoDB
await connectDB()

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log("Server running on PORT : "+ PORT))

