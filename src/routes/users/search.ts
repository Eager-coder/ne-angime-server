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
			FROM users WHERE NOT username = $1`,
			[username]
		)
		res.json({ users })
	} catch (error) {
		console.log("USERS", error)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})
router.get("/user/:username", verifyAuth, async (req, res) => {
	const { username } = req.params
	console.log(username)
	try {
		const { rows: user } = await pool.query(
			`
			SELECT username, firstname, lastname, avatar
			FROM users WHERE username = $1`,
			[username]
		)
		return res.json({ user: user[0] })
	} catch (error) {
		console.log("USER", error)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})
// router.post("/", verifyToken, async (req, res) => {
// 	const { user_id } = req.user
// })

export default router
