import { TABBABLE_QUERY, traverseShadowRootsAndSlots } from "./shadow";

const template = document.createElement("template");
template.innerHTML = `
	<div id="start"></div>
	<slot></slot>
	<div id="backup"></div>
	<div id="end"></div>
`;

export class FocusTrap extends HTMLElement {

	// Whenever one of these attributes changes we need to render the template again.
	static get observedAttributes () {
		return [
			"inactive"
		];
	}

	get inactive () {
		return this.hasAttribute("inactive");
	}

	set inactive (value: boolean) {
		value ? this.setAttribute("inactive", "") : this.removeAttribute("inactive");
	}

	// A backup element to focus on if no tabbable elements were found among the children
	private $backup!: HTMLElement;
	private $start!: HTMLElement;
	private $end!: HTMLElement;

	get hasActiveElement () {
		return this.contains(document.activeElement) && document.activeElement !== this.$start && document.activeElement !== this.$end;
	}

	constructor () {
		super();

		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));

		this.focusLastElement = this.focusLastElement.bind(this);
		this.focusFirstElement = this.focusFirstElement.bind(this);
	}

	/**
	 * Hooks up the component.
	 */
	connectedCallback () {
		this.$backup = this.shadowRoot!.querySelector<HTMLElement>("#backup")!;
		this.$start = this.shadowRoot!.querySelector<HTMLElement>("#start")!;
		this.$end = this.shadowRoot!.querySelector<HTMLElement>("#end")!;

		this.$start.addEventListener("focus", this.focusLastElement);
		this.$end.addEventListener("focus", this.focusFirstElement);

		// Focus out is called every time the user tabs around inside the element
		this.addEventListener("focusout", this.delayedRender);
		this.addEventListener("focus", this.delayedRender);

		this.render();
	}

	/**
	 * This function is a workaround due to the document.activeElement being the wrong
	 * element right before the correct one is set.
	 */
	private delayedRender () {
		setTimeout(() => {
			this.render();
		});
	}

	/**
	 * Tear down the component.
	 */
	disconnectedCallback () {
		this.$start.removeEventListener("focus", this.focusLastElement);
		this.$end.removeEventListener("focus", this.focusFirstElement);
		this.removeEventListener("focusout", this.delayedRender);
		this.removeEventListener("focus", this.delayedRender);
	}

	/**
	 * When the attributes changes we need to rerender the template.
	 */
	attributeChangedCallback () {
		this.render();
	}

	/**
	 * Focuses the first focusable element.
	 */
	focusFirstElement () {
		this.trapFocus();
	}

	/**
	 * Focuses the last focusable element.
	 */
	focusLastElement () {
		this.trapFocus(true);
	}

	/**
	 * Focuses on either the last or first focusable element.
	 * @param {boolean} trapToEnd
	 */
	trapFocus (trapToEnd?: boolean) {
		if (this.inactive) return;

		let focusableChildren = this.getFocusableChildren();
		if (focusableChildren.length > 0) {
			if (trapToEnd) {
				focusableChildren[focusableChildren.length - 1].focus();
			} else {
				focusableChildren[0].focus();
			}

			this.$backup.setAttribute("tabindex", "-1");
		} else {
			this.$backup.setAttribute("tabindex", "0");
			this.$backup.focus();
		}
	}

	/**
	 * Returns the children found in the slots that we can focus.
	 */
	getFocusableChildren (): HTMLElement[] {
		return traverseShadowRootsAndSlots(this, TABBABLE_QUERY);
	}

	/**
	 * Returns the template for the component.
	 */
	protected render () {
		this.$start.setAttribute("tabindex", !this.hasActiveElement || this.inactive ? `-1` : `0`);
		this.$end.setAttribute("tabindex", !this.hasActiveElement || this.inactive ? `-1` : `0`);
	}
}

window.customElements.define("focus-trap", FocusTrap);