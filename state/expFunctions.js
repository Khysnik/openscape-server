/** Supported XP formulas */
const experienceArray = { default: [NaN, 0], cubic: [NaN, 0] }
const maxExperience = { default: 0, cubic: 0 }
const MAX_LEVEL = 1024

/** Initialize XP tables once on startup */
export function initializeExperienceTables() {
	for (const formula of Object.keys(experienceArray)) {
		experienceToLevel(MAX_LEVEL, formula)
		maxNormalExperience(formula)
	}
}

/** Get max level for the formula */
export function maxNormalLevel(formula = "default") {
	switch (formula) {
		case "cubic":
			return 100
		case "default":
		default:
			return 99
	}
}

/** Get total level cap based on skill count + blacklisted skills */
export function maxTotalLevel(blacklistedSkills = [], formula = "default") {
	const maxLevel = maxNormalLevel(formula)
	const numberOfSkills = ALL_SKILL_NAMES.length
	return numberOfSkills * maxLevel + (blacklistedSkills?.length ?? 0)
}

/** Get the total XP required for the highest normal level */
export function maxNormalExperience(formula = "default") {
	if (!maxExperience[formula]) {
		maxExperience[formula] = experienceToLevel(maxNormalLevel(formula), formula)
	}
	return maxExperience[formula]
}

/** Convert total XP → level (using binary search) */
export function getLevelFromExperience(experience, formula = "default") {
	let l = 1
	let r = MAX_LEVEL - 1
	while (l < r) {
		const m = Math.floor((l + r) / 2)
		if (experienceToLevel(m, formula) <= experience) {
			l = m + 1
		} else {
			r = m
		}
	}
	return l - 1
}

/** Convert level → total XP (like your big table) */
export function experienceToLevel(level, formula = "default") {
	if (experienceArray[formula][level] !== undefined) {
		return experienceArray[formula][level]
	}

	switch (formula) {
		case "cubic":
			for (let i = 2; i <= level; i++) {
				if (!experienceArray.cubic[i]) {
					if (i <= 100) {
						// Normal cubic scaling
						experienceArray.cubic[i] = Math.round(i ** 3 * 10)
					} else {
						// Mastery scaling beyond level 100
						experienceArray.cubic[i] = Math.floor(
							1.5 ** ((i - 100) / 4) * 10_000_000,
						)
					}
				}
			}
			return experienceArray.cubic[level]

		case "default":
		default: {
			let totalExperience = 0
			for (let i = 1; i < level; i++) {
				totalExperience += Math.floor(i + 300 * Math.pow(2, i / 7))
				if (!experienceArray.default[i + 1]) {
					experienceArray.default[i + 1] = Math.floor(totalExperience / 4)
				}
			}
			return experienceArray.default[level]
		}
	}
}

/** Compute total XP + level across all skills */
export function calculateTotalLevelAndExperience(
	skills,
	isMastery = false,
	formula = "default",
) {
	let totalExperience = 0
	let totalLevel = 0

	for (const [skillName, skill] of Object.entries(skills)) {
		if (skillName === "total") continue

		if (!isMastery) {
			totalExperience += skill.experience
			totalLevel += skill.level
		} else {
			totalExperience += Math.max(
				0,
				skill.masteryExperience - maxNormalExperience(formula),
			)
			totalLevel += skill.masteryLevel
		}
	}
	return { totalExperience, totalLevel }
}

// You can define your skills list here (for testing/demo)
export const ALL_SKILL_NAMES = [
	"attack",
	"defense",
	"strength",
	"magic",
	"crafting",
	"fishing",
	"mining",
]
