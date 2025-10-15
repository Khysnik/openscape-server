import activeActions from "../state/sessions.js"
import table from "../state/table.js"
import user from "../state/user.js"
import { locations } from "../tables/locationList.js"
import tick from "./tick.js"

const loop = {
	async start(socket, data, action) {
		this.stop(data.id)
		const userData = await user.getData(data.id)

		socket.emit("update:player", {
			portion: "actionQueue",
			value: {
				playerIDs: [data.id],
				leaderID: data.id,
				groupId: "group:110297-1760420694187",
				actionType: table.action(action.action),
				actionSubType: table.action(action.action),
				location: action.location,
				subLocation: action.location,
				info: {
					initialStartTime: Date.now(),
				},
			},
		})

		let baseInterval = locations[action.location].baseDuration
		let totalLevel =
			userData.skills[action.action].level +
			userData.skills[action.action].masteryLevel

		let interval = (baseInterval / (99 + totalLevel)) * 100
		socket.emit("animation:start", {
			action: table.action(action.action),
			location: action.location,
			length: interval,
		})
		const loopID = setInterval(() => {
			let result = tick(action)

			if (result.loot) {
				user.addLoot(socket, data.id, action, result.loot)
			}
			socket.emit("animation:start", {
				action: table.action(action.action),
				location: action.location,
				length: interval,
			})
		}, interval)

		activeActions.set(data.id, loopID)
	},

	stop(id) {
		clearInterval(activeActions.get(id))
		activeActions.delete(id)
		console.log(`Action loop with ID ${id} stopped.`)
	},
}

export default loop
