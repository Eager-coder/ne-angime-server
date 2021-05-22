import { NextFunction, Request, Response } from "express"
import { verify } from "jsonwebtoken"

export const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
	try {
		console.log("Access Token", req.headers.authorization?.split(" ")[1])
		const token = req.headers.authorization?.split(" ")[1]
		if (!token) return res.status(401).json({ message: "Unautorized" })
		const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET!)
		res.locals.user = decoded
		next()
	} catch (e) {
		console.error("VERIFY AUTH", e.message)
		res.status(401).json({ message: "Unautorized" })
	}
}
