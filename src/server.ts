import express from "express"
import cors from "cors"
import http from "http"
import WebSocket from "ws"
import AuthRoute from "./routes/users/auth"
import ChatRoute from "./routes/chats/chat"
import UserRoute from "./routes/users/search"
import FriendRoute from "./routes/friends/friend"
import { config } from "dotenv"
config()
const app = express()
const server = http.createServer(app)
require("dotenv").config()
const wss = new WebSocket.Server({ server })

app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb" }))

app.use("/api/user/auth", AuthRoute)
app.use("/api/chat", ChatRoute(wss))
app.use("/api/users", UserRoute)
app.use("/api/friends", FriendRoute)

const port = process.env.PORT || 8080

server.listen(port, () => console.log("Server has started at " + port))
