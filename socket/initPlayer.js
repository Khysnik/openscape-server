import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import fs from "fs/promises"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async (socket, data) => {
	fs.readFile(__dirname + "/../db/" + data.id + "/settings.json", "utf-8").then(
		async (settings) => {
			socket.emit("update:player:paths", {
				key: "settings",
				value: JSON.parse(settings),
			})
		},
	)
	fs.readFile(__dirname + "/../db/" + data.id + "/player.json", "utf-8").then(
		async (playerData) => {
			socket.emit("update:player", {
				portion: "all",
				value: JSON.parse(playerData),
			})
		},
	)
	fs.readFile(__dirname + "/../db/global.json", "utf-8").then(
		async (globals) => {
			socket.emit("globals:update", JSON.parse(globals))
		},
	)
	fs.readFile(__dirname + "/../db/" + data.id + "/group.json", "utf-8").then(
		async (playerGroup) => {
			socket.emit("update:group", {
				portion: "all",
				value: JSON.parse(playerGroup),
			})
		},
	)
}
