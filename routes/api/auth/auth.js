import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import cookieParser from "cookie-parser"
import crypto from "crypto"
import express from "express"
import fs from "fs"
import jwt from "jsonwebtoken"
import user from "../../../state/user.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

const auth = express.Router()

auth.use(express.json())

auth.use(cookieParser())
auth.get("/get-token", (req, res) => {
	if (req.cookies.token) {
		return res.send({ success: true, token: req.cookies.token })
	}
	res.send("Unauthorized")
})

auth.post("/register", async (req, res) => {
	const { email, username, password, password2 } = req.body

	if (!username || !password || password !== password2) {
		return res.status(400).send("Invalid input or passwords don't match")
	}

	try {
		const info = await user.register(username, password, email)
		await user.reset(info)

		const payload = {
			id: info.id,
			username: info.username,
			sessionId: crypto.randomBytes(16).toString("hex"),
		}

		jwt.sign(payload, "suspass", { expiresIn: "1h" }, (err, token) => {
			if (err) return res.status(500).send("Error generating token")
			res.cookie("token", token, { httpOnly: true }).send({ token })
		})
	} catch (err) {
		console.error(err)
		res.status(500).send("Server error")
	}
})

auth.post("/create-character", (req, res) => {
	if (!req.body.username || !req.body.league) {
		return res.status(400).send({ error: "Invalid request" })
	}

	let data
	try {
		data = jwt.verify(req.cookies.token, "suspass")
	} catch (err) {
		return res.status(401).send({ error: "Invalid token" })
	}

	const filePath = join(
		__dirname,
		"../../../db",
		data.id.toString(),
		"characters.json",
	)

	fs.readFile(filePath, "utf8", (err, fileData) => {
		if (err) {
			console.error("Error reading file:", err)
			return res.status(500).send({ error: "Server error reading characters" })
		}

		let characters
		try {
			characters = JSON.parse(fileData)
		} catch (parseErr) {
			console.error("Invalid JSON in characters file:", parseErr)
			return res.status(500).send({ error: "Corrupt character data" })
		}

		const exists = characters.characters.find(
			(u) => u.username === req.body.username,
		)
		if (exists) {
			return res.status(400).send({ username: "Username already in use" })
		}

		const uid = characters.characters.length + 1
		characters.characters.push({
			username: req.body.username,
			id: uid,
			league: req.body.league,
			gold: 0,
			heat: 0,
			action: "Idling",
			lastLoggedInString: "0 seconds",
			totalLevel: 15,
			masteryLevel: 0,
			active: true,
			equipment: {},
			activationCooldown: 0,
			seasonClaimed: false,
			settings: {
				cosmetic: {
					selectedCosmetics: {},
				},
			},
		})

		fs.writeFile(filePath, JSON.stringify(characters, null, 2), (writeErr) => {
			if (writeErr) {
				console.error("Error saving character:", writeErr)
				return res.status(500).send({ error: "Failed to save character" })
			}
			return res.send({ characterId: uid })
		})
	})
})

auth.post("/character-info", (req, res) => {
	if (!req.cookies.token) return res.status(401).send("Unauthorized")
	jwt.verify(req.cookies.token, "suspass", async (err, decoded) => {
		if (err) {
			res.clearCookie("token")
			return res.status(401).send("Unauthorized")
		}
		console.log(await user.getCharacterList(decoded.id))
		res.send(await user.getCharacterList(decoded.id))
	})
})

auth.post("/logout", async (req, res) => {
	if (!req.cookies.token) return res.status(401).send("Unauthorized")
	jwt.verify(req.cookies.token, "suspass", async (err) => {
		if (err) return res.status(401).send("Unauthorized")
		res.clearCookie("token").send("Logged out")
	})
})

auth.post("/login", async (req, res) => {
	const { username, password } = req.body
	if (!username || !password) {
		return res.status(400).send("Invalid input")
	}
	try {
		const info = await user.login(username, password)
		if (!info) return res.status(400).send({ password: "Password incorrect" })
		const payload = {
			id: info.id,
			username: info.username,
			sessionId: crypto.randomBytes(16).toString("hex"),
		}
		jwt.sign(payload, "suspass", { expiresIn: "1h" }, (err, token) => {
			if (err) return res.status(500).send("Error generating token")
			res.cookie("token", token, { httpOnly: true }).send({ token })
		})
	} catch (err) {
		console.error(err)
		res.status(500).send("Server error")
	}
})
export default auth
