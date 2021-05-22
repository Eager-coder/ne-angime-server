import { Router } from "express"
import { verifyAuth } from "../../middlewares/auth.middlware"
import { pool } from "../../config/db"
const router = Router()

router.post("/request/:addressee_id", verifyAuth, async (req, res) => {
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

export default router
