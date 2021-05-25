import { Router, Request, Response, query } from "express"
const router = Router()
import sharp from "sharp"
import { pool } from "../../config/db"
import { verifyAuth } from "../../middlewares/auth.middlware"
const cloudinary = require("cloudinary").v2
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
})
type Result = {
	url: string
}
const uploadToCloudinary = (image: Buffer) => {
	return new Promise<Result>((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
				{
					folder: "ne-angime-avatar",
				},
				(err: Error, result: Result) => {
					if (err) return reject(err)
					return resolve(result)
				}
			)
			.end(image)
	})
}

router.post("/avatar", verifyAuth, async (req, res) => {
	try {
		console.log(req.body)
		const base64Img = req.body.avatar.split(";base64,").pop()
		if (!base64Img) return res.status(404).json({ message: "Please upload an image" })
		const bufferImg = Buffer.from(base64Img, "base64")
		const formattedImgBuffer = await sharp(bufferImg)
			.jpeg({ quality: 50, chromaSubsampling: "4:4:4", force: true })
			.resize(250, 250)
			.toBuffer()
		const result = await uploadToCloudinary(formattedImgBuffer)
		if (result.url) {
			await pool.query(`UPDATE users SET avatar = $1 WHERE user_id = $2`, [
				result.url,
				res.locals.user.user_id,
			])
		}
		res.json({ message: "Image successfully uploaded", url: result.url })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})
export default router

// router.put("/username", verifyAuth, async (req: Request, res: Response) => {
// 	try {
// 		const { new_username } = req.body
// 		const { user_id } = res.locals.user
// 		if (!new_username?.trim().length) {
// 			return res.status(400).json({ message: "Username cannot be blank" })
// 		}
// 		const { rows: existing } = await pool.query(
// 			`
// 			SELECT user_id FROM users
// 			WHERE username = $1 LIMIT 1`,
// 			[new_username]
// 		)
// 		if (existing.length) {
// 			return res.status(400).json({ message: "Username is not available" })
// 		}
// 		await pool.query(`UPDATE users SET username = $1 WHERE user_id = $2`, [new_username, user_id])
// 		res.json({ message: "Username has been changed" })
// 	} catch (error) {
// 		console.log("UPDATE USERNAME", error.message)
// 		res.status(500).json({ message: "Oops! Something went wrong!" })
// 	}
// })

router.put("/firstname", verifyAuth, async (req: Request, res: Response) => {
	try {
		const { user_id } = res.locals.user
		const { firstname } = req.body
		if (!firstname?.trim().length) {
			return res.json({ message: "Firstname cannot be blank" })
		}
		await pool.query(
			`
			UPDATE users SET firstname = $1 
			WHERE user_id = $2`,
			[firstname, user_id]
		)
		res.json({ message: "Firstname has been changed" })
	} catch (error) {
		console.log("UPDATE FIRSTNAME", error.message)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})

router.put("/lastname", verifyAuth, async (req: Request, res: Response) => {
	try {
		const { user_id } = res.locals.user
		const { lastname } = req.body
		if (!lastname?.trim().length) {
			return res.json({ message: "Lastname cannot be blank" })
		}
		await pool.query(
			`
			UPDATE users SET lastname = $1 
			WHERE user_id = $2`,
			[lastname, user_id]
		)
		res.json({ message: "Lastname has been changed" })
	} catch (error) {
		console.log("UPDATE lastname", error.message)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})
router.put("/email", verifyAuth, async (req: Request, res: Response) => {
	try {
		const { new_email } = req.body
		const { user_id } = res.locals.user
		if (!new_email?.trim().length) {
			return res.status(400).json({ message: "Email cannot be blank" })
		}
		const { rows: existing } = await pool.query(
			`
			SELECT user_id FROM users WHERE email = $1 LIMIT 1`,
			[new_email]
		)
		if (existing.length) {
			return res.status(400).json({ message: "Email is not available" })
		}
		await pool.query(`UPDATE users SET email = $1 WHERE user_id = $2`, [new_email, user_id])
		res.json({ message: "Email has been changed" })
	} catch (error) {
		console.log("UPDATE EMAIl", error.message)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})

router.put("/about", verifyAuth, async (req: Request, res: Response) => {
	try {
		const { user_id } = res.locals.user
		const new_about: string = req.body.new_about
		if (!new_about.trim().length) {
			return res.status(400).json({ message: "Your about is empty" })
		}
		await pool.query(`UPDATE users SET about = $1 WHERE user_id = $2`, [new_about, user_id])
		res.json({ message: "Your about is updated" })
	} catch (error) {
		console.log("UPDATE ABOUT", error.message)
		res.status(500).json({ message: "Oops! Something went wrong!" })
	}
})
