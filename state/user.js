import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "crypto";
import fsSync from "fs";
import fs from "fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

const user = {
	register: async (username, password) => {
		const usersPath = join(__dirname, "../db/users.json");

		const data = await fs.readFile(usersPath, "utf8");
		const users = JSON.parse(data);

		const info = {
			id: users.length + 1,
			username,
			email,
			password: crypto.createHash("md5").update(password).digest("hex"),
			registered_at: new Date().toISOString(),
		};

		users.push(info);

		await fs.writeFile(usersPath, JSON.stringify(users, null, 2), "utf8");

		return info;
	},

	reset: async (data) => {
		const templatePath = join(__dirname, "../db/template.json");
		const templateData = await fs.readFile(templatePath, "utf-8");
		const template = JSON.parse(templateData);

		template.id = data.id;
		template.accountId = data.id;
		template.username = data.username;
		template.created = data.registered_at;
		template.email = data.email || ""; // optional
		template.combatStats.name = data.username;
		template.combatStats.player = data.id;

		const userDir = join(__dirname, "../db", String(data.id));
		if (!fsSync.existsSync(userDir))
			fsSync.mkdirSync(userDir, { recursive: true });

		await fs.writeFile(
			join(userDir, "player.json"),
			JSON.stringify(template, null, 2),
		);
		console.log(`Player JSON for ${data.id} created!`);
	},
};

export default user;
