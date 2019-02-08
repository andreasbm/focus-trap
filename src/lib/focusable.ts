/**
 * Returns whether the element is hidden.
 * @param $elem
 */
export function isHidden ($elem: HTMLElement): boolean {
	return $elem.hasAttribute("hidden")
		|| ($elem.hasAttribute("aria-hidden") && $elem.getAttribute("aria-hidden") !== "false");
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
 * Returns whether the element is removed from the tab order.
 * @param $elem
 */
export function isRemovedFromTabOrder ($elem: HTMLElement): boolean {
	return isHidden($elem)
		|| $elem.getAttribute("tabindex") === "-1"
		|| isDisabled($elem);
}

/**
 * Determines whether an element is focusable.
 * Read more here: https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/1600194#1600194
 * Or here: https://stackoverflow.com/questions/18261595/how-to-check-if-a-dom-element-is-focusable
 * @param $elem
 */
export function isFocusable ($elem: HTMLElement): boolean {

	// Discard elements that are removed from the tab order.
	if (isRemovedFromTabOrder($elem)) {
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
