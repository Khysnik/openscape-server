import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import crypto from "crypto"
import fsSync from "fs"
import fs from "fs/promises"
import { locations } from "../tables/locationList.js"
import table from "./table.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

function xpToLevel(level) {
	let totalXP = 0
	for (let x = 1; x < level; x++) {
		totalXP += Math.floor(x + 300 * Math.pow(2, x / 7))
	}
	return Math.floor(totalXP / 4)
}

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
	getData: async (userId) => {
		const userDir = join(__dirname, "../db", String(userId))
		const playerPath = join(userDir, "player.json")
		const playerData = await fs.readFile(playerPath, "utf-8")
		return JSON.parse(playerData)
	},
	addLoot: async (socket, userId, action, loot) => {
		const userDir = join(__dirname, "../db", String(userId))
		const templatePath = join(userDir, "player.json")
		const templateData = await fs.readFile(templatePath, "utf-8")
		const template = JSON.parse(templateData)

		template.stockpile = template.stockpile || []

		let lootObject
		const existingItem = template.stockpile.find(
			(item) => item.itemID === loot.id,
		)

		if (existingItem) {
			existingItem.stackSize += loot.amount
			lootObject = existingItem
			socket.emit("update:inventory", {
				inventory: "stockpile",
				changedItems: [{ job: "MODIFY", item: lootObject }],
			})
		} else {
			lootObject = {
				itemID: loot.id,
				name: table.itemData(loot.id).name,
				stackSize: loot.amount,
				inventoryItemId: Math.floor(Math.random() * 999999999),
				id: Math.floor(Math.random() * 999999999),
				order: 1,
			}
			template.stockpile.push(lootObject)
			socket.emit("update:inventory", {
				inventory: "stockpile",
				changedItems: [{ job: "ADD", item: lootObject }],
			})
		}

		template.leaderId = userId

		const location = locations[action.location]
		if (location?.xpPerCompletion?.length) {
			location.xpPerCompletion.forEach((xp) => {
				const skill = template.skills[xp.skill]
				if (skill) {
					skill.experience += xp.amount

					while (skill.experience >= xpToLevel(skill.level + 1)) {
						skill.level += 1
					}
				}
			})

			template.skills.total.experience = Object.values(template.skills).reduce(
				(sum, s) => (sum.experience ? sum + s.experience : sum),
				0,
			)

			const updatedSkills = {}
			Object.entries(template.skills).forEach(([key, val]) => {
				updatedSkills[key] = {
					...val,
					lastReceivedExperience: new Date().toISOString(),
				}
			})

			socket.emit("update:player:paths", {
				key: "skills",
				value: updatedSkills,
			})
		}

		await fs.writeFile(templatePath, JSON.stringify(template, null, 2))
	},
}

export default user
