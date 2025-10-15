import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import crypto from "crypto"
import fsSync from "fs"
import fs from "fs/promises"

const __dirname = dirname(fileURLToPath(import.meta.url))

const user = {
	register: async (username, password, email) => {
		const usersPath = join(__dirname, "../db/users.json")

		const data = await fs.readFile(usersPath, "utf8")
		const users = JSON.parse(data)

		const info = {
			id: users.length + 1,
			username,
			email,
			password: crypto.createHash("md5").update(password).digest("hex"),
			registered_at: new Date().toISOString(),
		}

		users.push(info)

		await fs.writeFile(usersPath, JSON.stringify(users, null, 2), "utf8")

		return info
	},

	reset: async (data) => {
		const templatePath = join(__dirname, "../db/user.template.json")
		const templateData = await fs.readFile(templatePath, "utf-8")
		const template = JSON.parse(templateData)

		template.id = data.id
		template.accountId = data.id
		template.username = data.username
		template.created = data.registered_at
		template.email = data.email || "" // optional
		template.combatStats.name = data.username
		template.combatStats.player = data.id

		const userDir = join(__dirname, "../db", String(data.id))
		if (!fsSync.existsSync(userDir))
			fsSync.mkdirSync(userDir, { recursive: true })

		await fs.writeFile(
			join(userDir, "player.json"),
			JSON.stringify(template, null, 2),
		)

		const CtemplatePath = join(__dirname, "../db/characters.template.json")
		const CtemplateData = await fs.readFile(CtemplatePath, "utf-8")
		const Ctemplate = JSON.parse(CtemplateData)

		await fs.writeFile(
			join(userDir, "characters.json"),
			JSON.stringify(Ctemplate, null, 2),
		)

		const GtemplatePath = join(__dirname, "../db/group.template.json")
		const GtemplateData = await fs.readFile(GtemplatePath, "utf-8")
		const Gtemplate = JSON.parse(GtemplateData)

		Gtemplate.leaderId = data.id
		Gtemplate.groupMemberData[0].username = data.username
		Gtemplate.groupMemberData[0].id = data.id
		Gtemplate.groupMemberData[0].combatStats.name = data.username
		Gtemplate.groupMemberData[0].combatStats.player = data.id

		await fs.writeFile(
			join(userDir, "group.json"),
			JSON.stringify(Gtemplate, null, 2),
		)

		const StemplatePath = join(__dirname, "../db/settings.template.json")
		const StemplateData = await fs.readFile(StemplatePath, "utf-8")
		const Stemplate = JSON.parse(StemplateData)

		await fs.writeFile(
			join(userDir, "settings.json"),
			JSON.stringify(Stemplate, null, 2),
		)

		console.log(`Player JSON for ${data.id} created!`)
	},
	getCharacterList: async (userId) => {
		const userDir = join(__dirname, "../db", String(userId))
		const charactersPath = join(userDir, "characters.json")
		const charactersData = await fs.readFile(charactersPath, "utf-8")
		return JSON.parse(charactersData)
	},
	login: async (username, password) => {
		const usersPath = join(__dirname, "../db/users.json")
		const data = await fs.readFile(usersPath, "utf8")
		const users = JSON.parse(data)
		const user = users.find((u) => u.username === username)
		if (
			!user ||
			user.password !== crypto.createHash("md5").update(password).digest("hex")
		) {
			return
		}
		return user
	},
}

export default user
