/**
 * Returns whether the element is hidden.
 * @param $elem
 */
export function isHidden ($elem: HTMLElement): boolean {
	return $elem.hasAttribute("hidden")
		|| ($elem.hasAttribute("aria-hidden") && $elem.getAttribute("aria-hidden") !== "false")
		// TODO: Figure out how to get the values below without window.getComputedStyle (bad performance).
		// Currently we only know if the element is hidden if it's set directly on the element.
		// This might lead to unexpected behavior if the first or last element is hidden through the stylesheet.
		// Add a test case for this.
		|| $elem.style.display === `none`
		|| $elem.style.visibility === `hidden`
		|| $elem.style.visibility === `collapse`;
}

/**
 * Returns whether the element is disabled.
 * @param $elem
 */
export function isDisabled ($elem: HTMLElement): boolean {
	return $elem.hasAttribute("disabled")
		|| ($elem.hasAttribute("aria-disabled") && $elem.getAttribute("aria-disabled") !== "false");
}

/**
 * Determines whether an element is focusable.
 * Read more here: https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/1600194#1600194
 * Or here: https://stackoverflow.com/questions/18261595/how-to-check-if-a-dom-element-is-focusable
 * @param $elem
 */
export function isFocusable ($elem: HTMLElement): boolean {

	// Discard elements that are removed from the tab order.
	if ($elem.getAttribute("tabindex") === "-1" || isHidden($elem) || isDisabled($elem)) {
		return false;
	}

	return (

		// At this point we know that the element can have focus (eg. won't be -1) if the tabindex attribute exists
		$elem.hasAttribute("tabindex")

		// Anchor tags or area tags with a href set
		|| ($elem instanceof HTMLAnchorElement || $elem instanceof HTMLAreaElement) && $elem.hasAttribute("href")

		// Form elements which are not disabled
		|| ($elem instanceof HTMLButtonElement
			|| $elem instanceof HTMLInputElement
			|| $elem instanceof HTMLTextAreaElement
			|| $elem instanceof HTMLSelectElement)

		// IFrames
		|| $elem instanceof HTMLIFrameElement
	);
}
