/**
 * A query targeted at all focusable elements.
 * @type {string}
 */
export const FOCUSABLE_QUERY = [
	`[href]`,
	`[tabindex]:not([tabindex="-1"])`,
	`button:not([disabled])`,
	`input:not([disabled])`,
	`textarea:not([disabled])`,
	`select:not([disabled])`
].join(",");

/**
 * Traverses the slots of the open shadowroots and returns all children matching the query.
 * @param {ShadowRoot | HTMLElement} root
 * @param {string} query
 * @param {number} maxDepth
 * @param {number} depth
 * @returns {HTMLElement[]}
 */
export function traverseShadowRootsAndSlots (root: ShadowRoot | HTMLElement,
                                             query: string,
                                             maxDepth: number = 20,
                                             depth: number = 0): HTMLElement[] {
	let matches: HTMLElement[] = [];

	// If the depth is above the max depth, abort the searching here.
	if (depth >= maxDepth) {
		return matches;
	}

	// Traverses a slot element
	const traverseSlot = ($slot: HTMLSlotElement, query: string) => {
		const assignedNodes = $slot.assignedNodes();
		if (assignedNodes.length > 0) {
			return traverseShadowRootsAndSlots(assignedNodes[0].parentElement!, query, maxDepth, depth + 1);
		}

		return [];
	};

	// Go through each child and continue the traversing if necessary
	const children = Array.from(root.childNodes); // Array.from(root.querySelectorAll("> *"));
	for (const $elem of children) {
		if ($elem != null && $elem instanceof HTMLElement) {
			if ($elem.shadowRoot != null) {
				matches.push(...traverseShadowRootsAndSlots($elem.shadowRoot, query, maxDepth, depth + 1));

			} else if ($elem.tagName === "SLOT") {
				matches.push(...traverseSlot(<HTMLSlotElement>$elem, query));

			} else if ($elem.matches(query)) {
				matches.push($elem);

			} else {
				matches.push(...traverseShadowRootsAndSlots($elem, query, maxDepth, depth + 1));
			}
		}
	}

	return matches;
}
