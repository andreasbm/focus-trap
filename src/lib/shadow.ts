/**
 * Traverses the slots of the open shadowroots and returns all children matching the query.
 * @param {ShadowRoot | HTMLElement} root
 * @param skipNode
 * @param isMatch
 * @param {number} maxDepth
 * @param {number} depth
 * @returns {HTMLElement[]}
 */
export function queryShadowRoot (root: ShadowRoot | HTMLElement,
                                 skipNode: (($elem: HTMLElement) => boolean),
                                 isMatch: (($elem: HTMLElement) => boolean),
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
			return queryShadowRoot(assignedNodes[0].parentElement!, skipNode, isMatch, maxDepth, depth + 1);
		}

		return [];
	};

	// Go through each child and continue the traversing if necessary
	const children = <HTMLElement[]>Array.from(root.children);
	for (const $child of children) {

		// Check if the node and its descendants should be skipped
		if (skipNode($child)) {
			continue;
		}

		if ($child.shadowRoot != null) {
			const shadowRootChildren = queryShadowRoot($child.shadowRoot, skipNode, isMatch, maxDepth, depth + 1);

			// Leaf elements are always prioritized. If we however couldn't find any children in the shadow root
			// we can add this node to the array of matches if it matches.
			if (shadowRootChildren.length === 0 && isMatch($child)) {
				matches.push($child);

			} else {
				matches.push(...shadowRootChildren);
			}

		} else if ($child.tagName === "SLOT") {
			matches.push(...traverseSlot(<HTMLSlotElement>$child));

		} else if (isMatch($child)) {
			matches.push($child);

		} else {
			matches.push(...queryShadowRoot($child, skipNode, isMatch, maxDepth, depth + 1));
		}
	}

	return matches;
}
