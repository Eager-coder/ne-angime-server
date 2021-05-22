import { Router } from "express"
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

// router.post("/avatar", upload.single("avatar"), async (req, res) => {
// 	// console.log(req.file)
// 	console.log(req.body)
// 	const reqImage = req?.file?.buffer
// 	if (!reqImage)
// 		return res.status(404).json({ message: "No image was uploaded." })
// 	const formattedImg = await sharp(reqImage)
// 		.jpeg({ quality: 50, chromaSubsampling: "4:4:4", force: true })
// 		.resize(250, 250)
// 		.toBuffer()

// 	try {
// 		const result = await uploadToCloudinary(formattedImg)

// 		res.json({ message: "Image successfully uploaded", url: result.url })
// 		console.log(result)
// 	} catch (error) {
// 		console.log(error)
// 		res.status(500).json({ message: "Oops! Something went wrong!" })
// 	}
// })
