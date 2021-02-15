const { Router } = require("express")
const router = Router()
const conversation = {
	channelId: "x7eGEWgw",
	users: ["SUltan", "kenesyerassyl"],
	list: [
		{
			from: "SUltan",
			timestampe: "156446490",
			text: "Hello",
		},
		{
			from: "kenesyerassyl",
			timestampe: "156446494",
			text: "Hi",
		},
		{
			from: "kenesyerassyl",
			timestampe: "156446494",
			text: "What are you doing?",
		},
		{
			from: "SUltan",
			timestampe: "156446494",
			text: "Doing math homework?",
		},
	],
}
router.get("/", (req, res) => {
	res.json({ data: conversation })
})

module.exports = router
