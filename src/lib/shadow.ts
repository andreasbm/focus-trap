/**
 * Traverses the slots of the open shadowroots and returns all children matching the query.
 * We need to traverse each child-depth one at a time because if an element should be skipped
 * (for example because it is hidden) we need to skip all of it's children. If we use querySelectorAll("*")
 * the information of whether the children is within a hidden parent is lost.
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

		// Only check nodes that are of the type Node.ELEMENT_NODE
		// Read more here https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
		const assignedNodes = $slot.assignedNodes().filter(node => node.nodeType === 1);
		if (assignedNodes.length > 0) {
			const $slotParent = assignedNodes[0].parentElement!;
			return queryShadowRoot($slotParent, skipNode, isMatch, maxDepth, depth + 1);
		}

		return [];
	};

	// Go through each child and continue the traversing if necessary
	// Even though the typing says that children can't be undefined, Edge 15 sometimes gives an undefined value.
	// Therefore we fallback to an empty array if it is undefined.
	const children = <HTMLElement[]>Array.from(root.children || []);
	for (const $child of children) {

		// Check if the element and its descendants should be skipped
		if (skipNode($child)) {
			continue;
		}

		// If the element matches we always add it
		if (isMatch($child)) {
			matches.push($child);
		}

		if ($child.shadowRoot != null) {

			// If the element has a shadow root we need to traverse it
			matches.push(...queryShadowRoot($child.shadowRoot, skipNode, isMatch, maxDepth, depth + 1));

		} else if ($child.tagName === "SLOT") {

			// If the child is a slot we need to traverse each assigned node
			matches.push(...traverseSlot(<HTMLSlotElement>$child));

		} else {

			// Traverse the children of the element
			matches.push(...queryShadowRoot($child, skipNode, isMatch, maxDepth, depth + 1));
		}
	}

	return matches;
}
