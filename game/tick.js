import { locationsLootTable } from "../tables/loot.js"

function roll(lootData) {
	const lootRoll = Math.random() * 100

	let float = 0

	for (const i of lootData) {
		float += i.frequency
		if (lootRoll <= float) {
			return i
		}
	}
}
export default (action) => {
	const lootData = locationsLootTable[action.location]?.loot
	const lootPull = roll(lootData)

	const min = lootPull.minAmount ?? 1
	const max = lootPull.maxAmount ?? min
	const amount = Math.floor(Math.random() * (max - min + 1)) + min

	return { loot: { id: lootPull.id, amount } }
}
