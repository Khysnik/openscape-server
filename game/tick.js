import { locations } from "../tables/locationList.js"
import { locationsLootTable } from "../tables/loot.js"

function roll(lootData) {
	const totalFreq = lootData.reduce((sum, item) => sum + item.frequency, 0)
	const lootRoll = Math.random() * totalFreq
	let float = 0

	for (const i of lootData) {
		float += i.frequency
		if (lootRoll <= float) return i
	}
	return lootData[lootData.length - 1] // fallback
}

export default (action, isNode, node) => {
	let currNode = {}
	let modNode = node || {}
	let newNode = 0

	if (!node || node.count === undefined || node.count <= 0) newNode = 1

	if (isNode == 1) {
		if (newNode == 1) {
			let totalFreq = 0
			const nodeData = locations[action.location].nodes

			for (const n of nodeData) {
				if (n.frequency > 0) totalFreq += n.frequency
			}

			let nodeRoll = Math.random() * totalFreq

			for (const n of nodeData) {
				if (n.frequency > 0) {
					nodeRoll -= n.frequency
					if (nodeRoll <= 0) {
						modNode.data = n
						const min = n.minimumBaseAmount ?? 1
						const max = n.maximumBaseAmount ?? 1
						const randomAmount =
							Math.floor(Math.random() * (max - min + 1)) + min

						modNode.count = randomAmount - 1
						modNode.reps = randomAmount
						currNode = modNode.data
						break
					}
				}
			}
		} else {
			currNode = node.data
			modNode.count--
		}

		/*console.log("DEBUG:", {
			location: action.location,
			nodeID: currNode?.nodeID,
			hasLootTable: !!locationsLootTable[action.location],
			nodeKeys: Object.keys(locationsLootTable[action.location]?.nodes || {}),
		})*/

		const lootData = locationsLootTable[action.location]?.nodes[currNode.nodeID]
		if (!lootData) return { loot: null, node: modNode }

		const lootPull = roll(lootData)
		const min = lootPull.minAmount ?? 1
		const max = lootPull.maxAmount ?? min
		const amount = Math.floor(Math.random() * (max - min + 1)) + min

		return { loot: { id: lootPull.id, amount }, node: modNode }
	}

	// Non-node loot
	const lootData = locationsLootTable[action.location]?.loot
	if (!lootData) return { loot: null }

	const lootPull = roll(lootData)
	const min = lootPull.minAmount ?? 1
	const max = lootPull.maxAmount ?? min
	const amount = Math.floor(Math.random() * (max - min + 1)) + min

	return { loot: { id: lootPull.id, amount } }
}
