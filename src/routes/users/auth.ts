import { Router, Request, Response, NextFunction } from "express"
import { pool } from "../../config/db"
import bcrypt from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { generateTokens } from "../../helpers/generateToken"
import { verifyAuth } from "../../middlewares/auth.middlware"
const router = Router()

router.post("/register", async (req: Request, res: Response) => {
	const { stage } = req.query
	if (!stage) return res.status(400).json({ message: "Please specify the stage" })
	if (Number(stage) === 1) {
		try {
			const { username, firstname, lastname } = req.body
			if (!firstname.trim() || !lastname.trim() || !username.trim())
				return res.status(400).json({ message: "Please fill all the fields" })
			const { rows: users } = await pool.query(
				`
				SELECT username FROM users WHERE username = $1
			`,
				[username]
			)
			const existingUsername = users[0]?.username

			if (existingUsername && username === existingUsername)
				return res.status(400).json({ message: "User with this username already exists" })
			return res.status(200).json({ message: "Stage 1 passed!" })
		} catch (error) {
			console.log("~REGISTER STAGE 1~", error)
			res.status(500).json({ message: "Oops! Something went wrong!" })
		}
	} else if (Number(stage) === 2) {
		const { firstname, lastname, username, email, password1, password2 } = req.body
		console.log(req.body)
		if (
			!firstname?.trim() ||
			!lastname?.trim() ||
			!username?.trim() ||
			!email?.trim() ||
			!password1?.trim() ||
			!password2?.trim()
		)
			return res.status(400).json({ message: "Please fill all the fields" })
		if (username.includes("&"))
			return res.status(400).json({ message: `Do not add '&' symbol in the username` })
		if (password1 !== password2) return res.status(400).json({ message: "Passwords don't match" })
		if (password1.length < 8)
			return res.status(400).json({ message: "Password must be at least 8 characters long" })

		try {
			const { rows: allUsernames } = await pool.query(
				`
      SELECT username from users WHERE username = $1
    `,
				[username]
			)
			if (allUsernames.length) return res.status(400).json({ message: "Username already exists" })

			const { rows: allEmails } = await pool.query(
				`
      SELECT email from users WHERE email = $1
    `,
				[email]
			)
			if (allEmails.length) return res.status(400).json({ message: "Email already exists" })

			const hashedPassword = bcrypt.hashSync(password1, 12)
			const {
				rows: [user],
			} = await pool.query(
				`
				INSERT INTO users 
				(username, firstname, lastname, email, password) 
				VALUES ($1, $2, $3, $4, $5) 
				RETURNING user_id
			`,
				[username, firstname, lastname, email, hashedPassword]
			)

			const { accessToken, refreshToken } = generateTokens({
				user_id: user.user_id,
				username,
				email,
			})
			await pool.query(
				`
			INSERT INTO refresh_tokens (user_id, refresh_token) 
			VALUES ($1, $2)`,
				[user.user_id, refreshToken]
			)

			res.json({
				message: "Welcome to Ne Angime!",
				data: {
					username,
					firstname,
					lastname,
					email,
					user_id: user.user_id,
					accessToken,
					refreshToken,
				},
			})
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: "Oops! Something went wrong!" })
		}
	}
})

router.post("/login", async (req, res) => {
	try {
		const { username, password }: { username: string; password: string } = req.body
		if (!username || !password)
			return res.status(400).json({ message: "Please fill all the fields" })
		const { rows } = await pool.query(`SELECT * FROM users WHERE username = $1`, [username])

		if (!rows.length) return res.status(400).json({ message: "User does not exist" })

		const { password: hashedPassword, user_id, email, firstname, lastname, avatar } = rows[0]

		if (!bcrypt.compareSync(password, hashedPassword))
			return res.status(400).json({ message: "Password is incorrect" })

		const { accessToken, refreshToken } = generateTokens({ user_id, username, email })
		await pool.query(
			`
			INSERT INTO refresh_tokens (user_id, refresh_token) 
			VALUES ($1, $2)`,
			[user_id, refreshToken]
		)
		return res.json({
			message: "Welcome back!",
			data: { username, firstname, lastname, email, avatar, user_id, accessToken, refreshToken },
		})
	} catch (error) {
		console.log("LOGIN", error)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})
router.delete("/logout", verifyAuth, async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body
		const { user_id } = res.locals.user

		await pool.query(
			`
		DELETE FROM 
			refresh_tokens 
		WHERE 
			user_id = $1 AND refresh_token = $2`,
			[user_id, refreshToken]
		)
		res.json({ message: "You are loged out" })
	} catch (error) {
		console.log("LOGOUT", error.message)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})

router.get("/refresh_token", async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body
		const user: any = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!)

		const { rows: existingToken } = await pool.query(
			`SELECT * FROM refresh_tokens
		 	 WHERE user_id = $1 AND refresh_token = $2`,
			[user.user_id, refreshToken]
		)

		if (existingToken[0]?.refresh_token !== refreshToken) {
			return res.status(401).json({ message: "Unauthorized" })
		}
		const { accessToken, refreshToken: newRefreshToken } = generateTokens(user)

		await pool.query(
			`UPDATE refresh_tokens SET refresh_token = $1 
			 WHERE user_id = $2 AND refresh_token = $3`,
			[newRefreshToken, user.user_id, refreshToken]
		)
		console.log(user)
		res.json({ data: { accessToken, refreshToken: newRefreshToken } })
	} catch (error) {
		console.log(error.message)
		res.status(401).json({ message: "Unauthorized" })
	}
})

export default router
