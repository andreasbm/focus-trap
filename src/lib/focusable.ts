/**
 * Returns whether the element is hidden.
 * @param $elem
 */
export function isHidden ($elem: HTMLElement): boolean {
	return $elem.hidden || $elem.hasAttribute("aria-hidden");
}

/**
 * Determines whether an element is focusable.
 * Read more here: https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/1600194#1600194
 * Or here: https://stackoverflow.com/questions/18261595/how-to-check-if-a-dom-element-is-focusable
 * @param $elem
 */
export function isFocusable ($elem: HTMLElement): boolean {

	// Discard elements that are hidden and non tabbable
	if (isHidden($elem) || $elem.tabIndex < 0) {
		return false;
	}

	return (

		// At this point we know that the element can have focus if the tabindex attribute exists
		$elem.hasAttribute("tabindex")

		// Anchor tags or area tags with a href set
		|| ($elem instanceof HTMLAnchorElement || $elem instanceof HTMLAreaElement) && $elem.hasAttribute("href")

		// Form elements which are not disabled
		|| (($elem instanceof HTMLButtonElement
			|| $elem instanceof HTMLInputElement
			|| $elem instanceof HTMLTextAreaElement
			|| $elem instanceof HTMLSelectElement) && !$elem.disabled)

		// IFrames
		|| $elem instanceof HTMLIFrameElement
	);
}
