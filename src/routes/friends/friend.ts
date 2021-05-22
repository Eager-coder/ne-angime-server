import { Request, Response, Router } from "express"
import { verifyAuth } from "../../middlewares/auth.middlware"
import { pool } from "../../config/db"
const router = Router()

router.post("/request/:addressee_id", verifyAuth, async (req: Request, res: Response) => {
	const { addressee_id } = req.params
	const user_id = res.locals.user.user_id
	if (Number(addressee_id) === Number(user_id)) {
		return res.status(400).json({ message: `Can't request to yourself` })
	}
	const { rows: existingLink } = await pool.query(
		`
		SELECT * FROM friends 
		WHERE requester_id = $1 AND addressee_id = $2`,
		[user_id, addressee_id]
	)
	if (existingLink.length) {
		return res.status(400).json({ message: "Request already sent" })
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
	if (Number(requester_id) === Number(user_id)) {
		return res.status(400).json({ message: `Can't request to yourself` })
	}
	const { rows: existingLink } = await pool.query(
		`
	SELECT * FROM friends WHERE 
	requester_id = $1 AND addressee_id = $2
	`,
		[requester_id, user_id]
	)
	if (!existingLink.length || existingLink[0].is_approved)
		return res.status(400).json({ message: "Something went wrong" })

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
