import { debounce } from "./debounce";
import { queryShadowRoot } from "./shadow";

const template = document.createElement("template");
template.innerHTML = `
	<div id="start"></div>
	<slot></slot>
	<div id="backup"></div>
	<div id="end"></div>
`;

export interface IFocusTrap {
	inactive: boolean;
	readonly hasFocus: boolean;
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

	private _hasFocus = false;

	/**
	 * Returns whether the element currently has focus.
	 */
	get hasFocus (): boolean {
		return this._hasFocus;
	}

	constructor () {
		super();

		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));

		this.focusLastElement = this.focusLastElement.bind(this);
		this.focusFirstElement = this.focusFirstElement.bind(this);
		this.onFocusIn = this.onFocusIn.bind(this);
		this.onFocusOut = this.onFocusOut.bind(this);
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
		this.addEventListener("focusin", this.onFocusIn);
		this.addEventListener("focusout", this.onFocusOut);

		this.render();
	}


	/**
	 * Tears down the component.
	 */
	disconnectedCallback () {
		this.$start.removeEventListener("focus", this.focusLastElement);
		this.$end.removeEventListener("focus", this.focusFirstElement);
		this.removeEventListener("focusin", this.onFocusIn);
		this.removeEventListener("focusout", this.onFocusOut);
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
		return queryShadowRoot(this);
		// return queryShadowRoot(this, FOCUSABLE_QUERY);
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
	 * When the element gains focus this function is called.
	 */
	private onFocusIn () {
		this.updateHasFocus(true);
	}

	/**
	 * When the element looses its focus this function is called.
	 */
	private onFocusOut () {
		this.updateHasFocus(false);
	}

	/**
	 * Updates the has focus property and updates the view.
	 * The update is debounces because the focusin and focusout out
	 * might fire multiple times in a row.
	 * @param value
	 */
	private updateHasFocus (value: boolean) {
		debounce(() => {
			if (this.hasFocus !== value) {
				this._hasFocus = value;
				this.render();
			}
		});
	}

	/**
	 * Updates the template.
	 */
	protected render () {
		this.$start.setAttribute("tabindex", !this.hasFocus || this.inactive ? `-1` : `0`);
		this.$end.setAttribute("tabindex", !this.hasFocus || this.inactive ? `-1` : `0`);
	}
}

window.customElements.define("focus-trap", FocusTrap);