import { Router } from "express"
import { verifyAuth } from "../../middlewares/auth.middlware"
const router = Router()
import { pool } from "../../config/db"

router.get("/all", verifyAuth, async (req, res) => {
	const { username } = res.locals.user
	try {
		const { rows: users } = await pool.query(
			`
			SELECT username, firstname, lastname, avatar 
			FROM users WHERE NOT username = $1 AND is_private = FALSE`,
			[username]
		)
		res.json({ data: users })
	} catch (error) {
		console.log("USERS", error)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})
router.get("/user/:username", verifyAuth, async (req, res) => {
	const { username } = req.params
	const { user_id } = res.locals.user
	try {
		const { rows: user } = await pool.query(
			`
			SELECT user_id, username, firstname, lastname, avatar, about, is_private
			FROM users WHERE username = $1 `,
			[username]
		)
		if (!user.length) {
			return res.status(404).json({ message: "No user found" })
		}

		const { rows: existingLink } = await pool.query(
			`
			SELECT * FROM friends 
				WHERE (requester_id = $1 AND addressee_id = $2)
				OR (requester_id = $2 AND addressee_id = $1)

		`,
			[user_id, user[0].user_id]
		)
		let status: string = "no_relation"

		if (existingLink.length && user[0].user_id != user_id) {
			if (existingLink[0].is_approved) {
				status = "friend"
			} else if (existingLink[0].requester_id == user_id) {
				status = "outcoming_request"
			} else if (existingLink[0].addressee_id == user_id) {
				status = "incoming_request"
			}
		}
		if (status === "no_relation" && user[0].is_private) {
			return res.status(404).json({ message: "No user found" })
		}
		delete user[0].is_private
		res.json({ data: { ...user[0], status } })
	} catch (error) {
		console.log("USER", error)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})

export default router
