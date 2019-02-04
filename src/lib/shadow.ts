import { isFocusable } from "./focusable";

/**
 * Traverses the slots of the open shadowroots and returns all children matching the query.
 * @param {ShadowRoot | HTMLElement} root
 * @param isMatch
 * @param {number} maxDepth
 * @param {number} depth
 * @returns {HTMLElement[]}
 */
export function queryShadowRoot (root: ShadowRoot | HTMLElement,
                                 isMatch: (($elem: HTMLElement) => boolean) = isFocusable,
                                 maxDepth: number = 20,
                                 depth: number = 0): HTMLElement[] {
	let matches: HTMLElement[] = [];

	// If the depth is above the max depth, abort the searching here.
	if (depth >= maxDepth) {
		return matches;
	}

	// Traverses a slot element
	const traverseSlot = ($slot: HTMLSlotElement) => {
		const assignedNodes = $slot.assignedNodes();
		if (assignedNodes.length > 0) {
			return queryShadowRoot(assignedNodes[0].parentElement!, isMatch, maxDepth, depth + 1);
		}

		return [];
	};

	// Go through each child and continue the traversing if necessary
	const children = <HTMLElement[]>Array.from(root.children);
	for (const $child of children) {
		if ($child.shadowRoot != null) {
			matches.push(...queryShadowRoot($child.shadowRoot, isMatch, maxDepth, depth + 1));

		} else if ($child.tagName === "SLOT") {
			matches.push(...traverseSlot(<HTMLSlotElement>$child));

		} else if (isMatch($child)) {
			matches.push($child);

		} else {
			matches.push(...queryShadowRoot($child, isMatch, maxDepth, depth + 1));
		}
	}

	return matches;
}
