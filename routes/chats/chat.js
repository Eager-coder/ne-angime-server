const { Router } = require("express")
const { verify } = require("jsonwebtoken")
const router = Router()
const verifyToken = require("../../middlewares/verifyToken")
const conversations = [
	{
		channel_id: "x7eGEWgw",
		users: ["SUltan", "kenesyerassyl"],
		list: [
			{
				sender_username: "SUltan",
				sender_firstname: "Sultan",
				sender_lastname: "Turan",
				timestampe: "156446490",
				text: "Hello",
			},
			{
				sneder_username: "kenesyerassyl",
				sender_firstname: "Yerassyl",
				sender_lastname: "Kenes",
				timestampe: "156446494",
				text: "Hi",
			},
			{
				sneder_username: "kenesyerassyl",
				sender_firstname: "Yerassyl",
				sender_lastname: "Kenes",
				timestampe: "156446494",
				text: "What are you doing?",
			},
			{
				sneder_username: "SUltan",
				sender_firstname: "Sultan",
				sender_lastname: "Turan",
				timestampe: "156446494",
				text: "Doing math homework?",
			},
		],
	},
	{
		channelId: "8935ogrh89",
		users: ["bedya", "kenesyerassyl"],
		list: [
			{
				sender_username: "bedya",
				timestampe: "156446490",
				text: "Hello",
			},
			{
				sender_username: "kenesyerassyl",
				timestampe: "156446494",
				text: "Hi",
			},
			{
				sender_username: "bedya",
				timestampe: "156446494",
				text: "What are you doing?",
			},
			{
				sender_username: "kenesyerassyl",
				timestampe: "156446494",
				text: "Doing math homework?",
			},
		],
	},
]
router.get("/", verifyToken, (req, res) => {
	res.json({ data: conversations })
})

module.exports = router
