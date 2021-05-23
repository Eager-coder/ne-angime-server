import { Request, Response, Router } from "express"
import { verifyAuth } from "../../middlewares/auth.middlware"
import { pool } from "../../config/db"
const router = Router()

router.post("/request/:addressee_id", verifyAuth, async (req: Request, res: Response) => {
	try {
		const { addressee_id } = req.params
		const user_id = res.locals.user.user_id
		if (Number(addressee_id) === Number(user_id)) {
			return res.status(400).json({ message: `Can't request to yourself` })
		}
		const { rows: existingLink } = await pool.query(
			`
		SELECT * FROM friends 
		WHERE 
			(requester_id = $1 AND addressee_id = $2) 
		OR
			(requester_id = $2 AND addressee_id = $1)`,
			[user_id, addressee_id]
		)
		if (existingLink.length) {
			if (existingLink[0].requester_id == user_id && !existingLink[0].is_approved) {
				return res.status(400).json({ message: "Request already sent" })
			}
			if (existingLink[0].requester_id == user_id && existingLink[0].is_approved) {
				return res.status(400).json({ message: "You are already friends" })
			}
			if (existingLink[0].addressee_id == user_id && !existingLink[0].is_approved) {
				return res.status(400).json({ message: "The user has already sent you a request" })
			}
			if (existingLink[0].addressee_id == user_id && existingLink[0].is_approved) {
				return res.status(400).json({ message: "You are already friends" })
			}
		}

		await pool.query(
			`
    INSERT INTO friends 
      (requester_id, addressee_id, is_approved) 
    VALUES
      ($1, $2, FALSE)
  `,
			[user_id, addressee_id]
		)
		res.json({ message: "Request has sent" })
	} catch (error) {
		console.log("ADD TO FRIENDS REQUEST", error.message)
		res.status(500).json({ message: "Oops! Something went wrong." })
	}
})

router.get("/all", verifyAuth, async (req: Request, res: Response) => {
	try {
		const { user_id } = res.locals.user
		const { rows: userList } = await pool.query(
			`
		SELECT 
			users.user_id as user_id, users.username, is_approved 
		FROM 
			friends 
		LEFT JOIN 
			users
		ON addressee_id = users.user_id
		WHERE friends.requester_id = $1 
		`,
			[user_id]
		)
		const { rows: incomingRequests } = await pool.query(
			`
		SELECT 
			users.user_id as user_id, users.username, is_approved 
		FROM 
			friends 
		LEFT JOIN 
			users
		ON requester_id = users.user_id
		WHERE friends.addressee_id = $1 AND is_approved = FALSE
		`,
			[user_id]
		)
		res.json({
			data: {
				friends: userList.filter(user => user.is_approved),
				requests: userList.filter(user => !user.is_approved),
				incomingRequests,
			},
		})
	} catch (error) {
		console.log("GET ALL FRIENDS", error.message)
		res.status(500).json({ message: "Oops! Something went wrong." })
	}
})

router.post("/approve/:requester_id", verifyAuth, async (req: Request, res: Response) => {
	try {
		const { requester_id } = req.params
		const user_id = res.locals.user.user_id
		if (Number(requester_id) === Number(user_id)) {
			return res.status(400).json({ message: `Can't request to yourself` })
		}
		const { rows: existingLink } = await pool.query(
			`
			SELECT * FROM friends 
			WHERE requester_id = $1 AND addressee_id = $2
			`,
			[requester_id, user_id]
		)

		if (!existingLink.length)
			return res.status(400).json({ message: "No friend request was found on that user" })

		if (existingLink.length && existingLink[0].is_approved)
			return res.status(400).json({ message: "The user is already in your friend list" })

		await pool.query(
			`
			UPDATE friends SET is_approved = TRUE 
			WHERE requester_id = $1 AND addressee_id = $2
		`,
			[requester_id, user_id]
		)
		await pool.query(
			`
    INSERT INTO friends 
      (requester_id, addressee_id, is_approved) 
    VALUES
      ($1, $2, TRUE)
		 ON CONFLICT (requester_id, addressee_id) 
		 DO UPDATE SET is_approved = TRUE
  `,
			[user_id, requester_id]
		)
		res.json({ message: "You are now friends" })
	} catch (error) {
		console.log("APPROVE FRIEND", error.message)
		res.status(500).json({ message: "Oops! Something went wrong." })
	}
})
router.delete("/remove/:addressee_id", verifyAuth, async (req: Request, res: Response) => {
	try {
		const { addressee_id } = req.params
		const user_id = res.locals.user.user_id
		await pool.query(`
		SELECT * FROM friends WHERE requester_id = $1 AND addressee_id = $2`)
	} catch (error) {}
})
export default router
