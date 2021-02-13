const { Router } = require("express")
const pool = require("../../db")
const bcrypt = require("bcrypt")
const router = Router()
const { sign } = require("jsonwebtoken")
router.get("/", async (req, res) => {
	res.json({ message: "TEst has succeeded" })
})
router.post("/register", async (req, res) => {
	const {
		firstname,
		lastname,
		username,
		email,
		password1,
		password2,
	} = req.body
	if (
		!firstname ||
		!lastname ||
		!username ||
		!email ||
		!password1 ||
		!password2
	)
		return res.status(400).json({ message: "Please fill all the fields" })
	if (password1 !== password2)
		return res.status(400).json({ message: "Passwords don't match" })
	if (password1.length < 8)
		return res
			.status(400)
			.json({ message: "Password must be at least 8 characters long" })
	try {
		const { rows: allUsernames } = await pool.query(`
      SELECT username from users WHERE username = '${username}'
    `)
		if (allUsernames.length)
			return res.status(400).json({ message: "Username already exists" })

		const { rows: allEmails } = await pool.query(`
      SELECT email from users WHERE email = '${email}'
    `)
		if (allEmails.length)
			return res.status(400).json({ message: "Email already exists" })

		const hashedPassword = bcrypt.hashSync(password1, 12)
		await pool.query(`INSERT INTO users 
      (username, firstname, lastname, email, password) VALUES 
      ('${username}', '${firstname}','${lastname}','${email}','${hashedPassword}')
    `)
		const token = sign(
			{
				username,
				firstname,
				lastname,
				email,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "30d" }
		)

		res.cookie("token", token).json({ message: "Welcome to Ne Angime!" })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})

router.post("/login", async (req, res) => {
	const { username, password } = req.body
	if (!username || !password)
		return res.status(400).json({ message: "Please fill all the fields" })
	try {
		const { rows } = await pool.query(
			`SELECT * FROM users WHERE username = '${username}'`
		)

		if (!rows.length)
			return res.status(400).json({ message: "User does not exist" })

		const { password: hashedPassword, email, firstname, lastname } = rows[0]

		if (!bcrypt.compare(password, hashedPassword))
			return res.status(400).json({ message: "Password is incorrect" })

		const token = sign(
			{ username, firstname, lastname, email },
			process.env.JWT_SECRET,
			{ expiresIn: "30d" }
		)
		return res.cookie(token).json({
			message: "Welcome back!",
			data: { username, firstname, lastname, email },
		})
	} catch (error) {
		console.log("LOGIN", error)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})
module.exports = router
