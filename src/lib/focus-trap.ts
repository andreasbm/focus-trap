import { FOCUSABLE_QUERY, traverseShadowRootsAndSlots } from "./shadow";

const template = document.createElement("template");
template.innerHTML = `
	<div id="start"></div>
	<slot></slot>
	<div id="backup"></div>
	<div id="end"></div>
`;

export interface IFocusTrap {
	inactive: boolean;
	readonly hasActiveElement: boolean;
	focusFirstElement: (() => void);
	focusLastElement: (() => void);
	getFocusableChildren: (() => HTMLElement[]);
}

export class FocusTrap extends HTMLElement implements IFocusTrap {

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

	/**
	 * Returns whether the global focused element is currently within the focus trap.
	 */
	get hasActiveElement () {
		return this.contains(document.activeElement);
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
	 * Tears down the component.
	 */
	disconnectedCallback () {
		this.$start.removeEventListener("focus", this.focusLastElement);
		this.$end.removeEventListener("focus", this.focusFirstElement);
		this.removeEventListener("focusout", this.delayedRender);
		this.removeEventListener("focus", this.delayedRender);
	}

	/**
	 * When the attributes changes we need to re-render the template.
	 */
	attributeChangedCallback () {
		this.render();
	}

	/**
	 * Focuses the first focusable element in the focus trap.
	 */
	focusFirstElement () {
		this.trapFocus();
	}

	/**
	 * Focuses the last focusable element in the focus trap.
	 */
	focusLastElement () {
		this.trapFocus(true);
	}

	/**
	 * Returns a list of the focusable children found within the element.
	 */
	getFocusableChildren (): HTMLElement[] {
		return traverseShadowRootsAndSlots(this, FOCUSABLE_QUERY);
	}

	/**
	 * Focuses on either the last or first focusable element.
	 * @param {boolean} trapToEnd
	 */
	protected trapFocus (trapToEnd?: boolean) {
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
	 * This function is a workaround due to the document.activeElement
	 * having the wrong element present right before the correct one is set.
	 * This might be due to the order of which the focusout and other events fire.
	 */
	protected delayedRender () {
		setTimeout(() => {
			this.render();
		});
	}

	/**
	 * Updates the template.
	 */
	protected render () {
		this.$start.setAttribute("tabindex", !this.hasActiveElement || this.inactive ? `-1` : `0`);
		this.$end.setAttribute("tabindex", !this.hasActiveElement || this.inactive ? `-1` : `0`);
	}
}

window.customElements.define("focus-trap", FocusTrap);