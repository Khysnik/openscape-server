import { createServer } from "node:http"
import cookie from "cookie"
import cookieParser from "cookie-parser"
import express from "express"
import jwt from "jsonwebtoken"
import { Server } from "socket.io"
import routes from "./routes/routes.js"
import initPlayer from "./socket/initPlayer.js"
import user from "./state/user.js"

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
	path: "/socket.io/",
	transports: ["websocket"],
	allowUpgrades: false,
	cors: { origin: "*", methods: ["GET", "POST"] },
})

app.use("/", routes)
app.use(cookieParser())

io.on("connection", (socket) => {
	try {
		const cookies = cookie.parse(socket.handshake.headers.cookie || "")
		const token = cookies.token

		if (!token) {
			return socket.disconnect(true)
		}

		const decoded = jwt.verify(token, "suspass")
		console.log("Connected user:", decoded.username)

		const userPath = `db/${decoded.id}/`

		socket.emit("session:start:socket:ready")

		socket.on("session:start:socket:ready:client", (ver) => {
			console.log("Client ready to start session:", ver)
			initPlayer(socket, decoded)
		})
	} catch (err) {
		socket.disconnect(true)
	}
})
httpServer.listen(5000, () => {
	console.log("Server is running on port 5000")
})
