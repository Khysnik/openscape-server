import cookieParser from "cookie-parser";
import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import user from "../../../state/user.js";

const auth = express.Router();

auth.use(express.json());

auth.use(cookieParser());
auth.get("/get-token", (req, res) => {
	if (req.body) {
		res.send("Token is valid");
	}
	res.send("Unauthorized");
});

auth.post("/register", async (req, res) => {
	const { username, password, password2 } = req.body;

	if (!username || !password || password !== password2) {
		return res.status(400).send("Invalid input or passwords don't match");
	}

	try {
		const info = await user.register(username, password);
		await user.reset(info);

		const payload = {
			id: info.id,
			username: info.username,
			sessionId: crypto.randomBytes(16).toString("hex"),
		};

		jwt.sign(payload, "suspass", { expiresIn: "1h" }, (err, token) => {
			if (err) return res.status(500).send("Error generating token");
			res.cookie("token", token, { httpOnly: true }).send({ token });
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error");
	}
});

export default auth;
