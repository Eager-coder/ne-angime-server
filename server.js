const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

require("dotenv").config()

const app = express()

app.use(bodyParser.json({ limit: "3mb" }))
app.use(bodyParser.urlencoded({ limit: "3mb", extended: true }))
// app.use(
// 	cors({
// 		allowedHeaders: ["sessionId", "Content-Type"],
// 		exposedHeaders: ["sessionId"],
// 		origin: "http://localhost:3000",
// 		credentials: true,
// 	})
// )
app.use("/api/auth", require("./routes/auth/auth"))

const port = process.env.PORT || 80

app.listen(port, () => console.log("Server has started at " + port))
