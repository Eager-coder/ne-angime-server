import { Request, Router, Response } from "express"
import { pool } from "../../config/db"
import { verify } from "jsonwebtoken"
import { verifyAuth } from "../../middlewares/auth.middlware"
import qs from "querystring"
import { Server } from "ws"
import { IncomingMessage } from "http"

interface Message {
	conversation_id: string
}

function getConversations(messageList: Message[]) {
	const conversationIdList = Array.from(
		new Set(messageList.map(message => message.conversation_id))
	)
	const conversations = conversationIdList.map(id => ({
		conversation_id: id,
		messages: messageList.filter(message => message.conversation_id === id),
	}))
	return conversations
}

const router = Router()
const routerWrapper = (wss: Server) => {
	router.get("/", verifyAuth, async (req: Request, res: Response) => {
		const { rows: allMessages } = await pool.query(
			`
			SELECT  message, created_at, sender_username, conversation_id, 
				recipient_username, message_id, is_seen 
			FROM messages 
			WHERE sender_username = $1 
			OR recipient_username = $1
			ORDER BY created_at
			`,
			[res.locals.user.username]
		)
		const conversations = getConversations(allMessages)
		res.json(conversations)
	})

	router.delete("/", async (req, res) => {})
	wss.on("connection", (ws: any, req: IncomingMessage) => {
		try {
			const token = qs.parse(req.url!, "/?").token?.toString()
			if (!token) return ws.close()
			const decoded: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)
			ws.user = decoded
			console.log(`${decoded.username} has connected`)
		} catch {
			ws.close()
		}
		ws.on("close", () => console.log(`${ws?.user?.username} has disconnected`))
		ws.on("message", async (json: string) => {
			try {
				const data = JSON.parse(json)
				if (data.type === "send_message") {
					const {
						message_id,
						message,
						created_at,
						sender_username,
						recipient_username,
						conversation_id,
					} = data
					await pool.query(
						`INSERT INTO messages 
						(message_id, message, created_at, sender_username, 
						recipient_username, conversation_id)
						VALUES ( $1, $2, $3, $4, $5, $6)
					`,
						[message_id, message, created_at, sender_username, recipient_username, conversation_id]
					)
					wss.clients.forEach((client: any) => {
						if (client.user.username == data.recipient_username) {
							client.send(
								JSON.stringify({
									...data,
									type: "receive_message",
									// username: ws.user.username,
								})
							)
						}
					})
					console.log("A message has sent", data)
				}
				if (
					data.type === "set_message_status_seen" &&
					data.recipient_username === ws.user.username
				) {
					await pool.query(`UPDATE messages SET is_seen = TRUE WHERE message_id = $1`, [
						data.message_id,
					])
					wss.clients.forEach((client: any) => {
						if (client.user.username === data.sender_username) {
							client.send(JSON.stringify({ ...data, type: "get_message_status_seen" }))
							console.log("The message is seen")
						}
					})
				}
			} catch (error) {
				console.log(error)
			}
		})
	})

	return router
}

export default routerWrapper
