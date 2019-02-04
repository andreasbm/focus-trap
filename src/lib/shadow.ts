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
 * Traverses the shadowroots and returns the most inner activeElement (the element that currently have focus).
 * The implemented algorithm is specified in https://medium.com/dev-channel/focus-inside-shadow-dom-78e8a575b73.
 * @param root
 */
export function findActiveElement (root: DocumentOrShadowRoot): Element | null {
	while (root.activeElement != null && root.activeElement.shadowRoot != null && root.activeElement.shadowRoot.activeElement !== root.activeElement) {
		root = root.activeElement.shadowRoot;
	}

	return root.activeElement;
}


/**
 * Traverses the slots of the open shadowroots and returns all children matching the query.
 * @param {ShadowRoot | HTMLElement} root
 * @param {string} query
 * @param {number} maxDepth
 * @param {number} depth
 * @returns {HTMLElement[]}
 */
export function queryShadowRoot (root: ShadowRoot | HTMLElement,
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
			return queryShadowRoot(assignedNodes[0].parentElement!, query, maxDepth, depth + 1);
		}

		return [];
	};

	// Go through each child and continue the traversing if necessary
	const children = Array.from(root.childNodes); // Array.from(root.querySelectorAll("> *"));
	for (const $elem of children) {
		if ($elem != null && $elem instanceof HTMLElement) {
			if ($elem.shadowRoot != null) {
				matches.push(...queryShadowRoot($elem.shadowRoot, query, maxDepth, depth + 1));

			} else if ($elem.tagName === "SLOT") {
				matches.push(...traverseSlot(<HTMLSlotElement>$elem, query));

			} else if ($elem.matches(query)) {
				matches.push($elem);

			} else {
				matches.push(...queryShadowRoot($elem, query, maxDepth, depth + 1));
			}
		}
	}

	return matches;
}
