import { Request, Response, Router } from "express"
import { verifyAuth } from "../../middlewares/auth.middlware"
import { pool } from "../../config/db"
const router = Router()

router.post("/request/:addressee_id", verifyAuth, async (req: Request, res: Response) => {
	const { addressee_id } = req.params
	const user_id = res.locals.user.user_id
	if (addressee_id === user_id) {
		return res.status(400).json({ message: `Can't request to yourself` })
	}
	await pool.query(
		`
    INSERT INTO friends 
      (requester_id, addressee_id, is_approved) 
    VALUES
      ($1, $2, false)
  `,
		[user_id, addressee_id]
	)
	res.json({ message: "good" })
})
router.get("/all", verifyAuth, async (req: Request, res: Response) => {
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
})
router.post("/approve/:requester_id", verifyAuth, async (req: Request, res: Response) => {
	const { requester_id } = req.params
	const user_id = res.locals.user.user_id

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
  `,
		[user_id, requester_id]
	)
	res.json({ message: "good" })
})
export default router
