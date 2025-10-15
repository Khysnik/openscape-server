import { abilitiesIds } from "../tables/abilities.js"
import { actionsIds } from "../tables/actions.js"
import { chatIconsIds } from "../tables/chatIcon.js"
import { enchantmentsIds } from "../tables/enchantments.js"
import { itemList } from "../tables/itemList.js"
import { itemsIds } from "../tables/items.js"
import { leaguesIds } from "../tables/leagues.js"
import { locationsIds } from "../tables/locations.js"
import { questsIds } from "../tables/quests.js"

const lookup = (table, query) => {
	if (!query) return null
	const formatted = query.toLowerCase().replace(/\s+/g, "_")
	return table[formatted] ?? null
}

const table = {
	ability: (query) => lookup(abilitiesIds, query),
	chatIcon: (query) => lookup(chatIconsIds, query),
	enchantment: (query) => lookup(enchantmentsIds, query),
	item: (query) => lookup(itemsIds, query),
	league: (query) => lookup(leaguesIds, query),
	location: (query) => lookup(locationsIds, query),
	quest: (query) => lookup(questsIds, query),
	action: (query) => lookup(actionsIds, query),
	itemData: (itemId) => itemList[itemId],
}

export default table
