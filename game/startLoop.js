import activeActions from "../state/sessions.js"
import table from "../state/table.js"
import user from "../state/user.js"
import { locations } from "../tables/locationList.js"
import tick from "./tick.js"

const loop = {
	async start(socket, data, action) {
		this.stop(data.id) // stop existing loop
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

		const runLoop = async () => {
			const baseInterval = locations[action.location].baseDuration
			const totalLevel =
				userData.skills[action.action].level +
				userData.skills[action.action].masteryLevel
			const interval = (baseInterval / (99 + totalLevel)) * 100

			const result = tick(action)

			if (result.loot) {
				await user.addLoot(socket, data.id, action, result.loot)
			}

			socket.emit("animation:start", {
				action: table.action(action.action),
				location: action.location,
				length: interval,
			})

			// schedule the next tick dynamically
			const loopID = setTimeout(runLoop, interval)
			activeActions.set(data.id, loopID)
		}

		runLoop()
	},

	stop(id) {
		const loopID = activeActions.get(id)
		if (loopID) {
			clearTimeout(loopID)
			activeActions.delete(id)
			console.log(`Action loop with ID ${id} stopped.`)
		}
	},
}

export default loop
