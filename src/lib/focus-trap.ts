import { debounce } from "./debounce";
import { isFocusable, isHidden } from "./focusable";
import { queryShadowRoot } from "./shadow";

export interface IFocusTrap {
  inactive: boolean;
  readonly focused: boolean;
  focusFirstElement: () => void;
  focusLastElement: () => void;
  getFocusableElements: () => HTMLElement[];
}

/**
 * Template for the focus trap.
 */
const template = document.createElement("template");
template.innerHTML = `
	<div id="start"></div>
	<slot></slot>
	<div id="backup"></div>
	<div id="end"></div>
`;

/**
 * Focus trap web component.
 * @slot - Default content.
 */
export class FocusTrap extends HTMLElement implements IFocusTrap {
  // Whenever one of these attributes changes we need to render the template again.
  static get observedAttributes() {
    return ["inactive"];
  }

  /**
   * Determines whether the focus trap is active or not.
   * @attr
   */
  get inactive() {
    return this.hasAttribute("inactive");
  }

  set inactive(value: boolean) {
    value
      ? this.setAttribute("inactive", "")
      : this.removeAttribute("inactive");
  }

  // The backup element is only used if there are no other focusable children
  private $backup!: HTMLElement;

  // The debounce id is used to distinguish this focus trap from others when debouncing
  private debounceId = Math.random().toString();

  private $start!: HTMLElement;
  private $end!: HTMLElement;

  private _focused = false;

  /**
   * Returns whether the element currently has focus.
   */
  get focused(): boolean {
    return this._focused;
  }

  /**
   * Attaches the shadow root.
   */
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this.focusLastElement = this.focusLastElement.bind(this);
    this.focusFirstElement = this.focusFirstElement.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
  }

  /**
   * Hooks up the element.
   */
  connectedCallback() {
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
   * Tears down the element.
   */
  disconnectedCallback() {
    this.$start.removeEventListener("focus", this.focusLastElement);
    this.$end.removeEventListener("focus", this.focusFirstElement);
    this.removeEventListener("focusin", this.onFocusIn);
    this.removeEventListener("focusout", this.onFocusOut);
  }

  /**
   * When the attributes changes we need to re-render the template.
   */
  attributeChangedCallback() {
    this.render();
  }

  /**
   * Focuses the first focusable element in the focus trap.
   */
  focusFirstElement() {
    this.trapFocus();
  }

  /**
   * Focuses the last focusable element in the focus trap.
   */
  focusLastElement() {
    this.trapFocus(true);
  }

  /**
   * Returns a list of the focusable children found within the element.
   */
  getFocusableElements(): HTMLElement[] {
    return queryShadowRoot(this, isHidden, isFocusable);
  }

  /**
   * Focuses on either the last or first focusable element.
   * @param {boolean} trapToEnd
   */
  protected trapFocus(trapToEnd?: boolean) {
    if (this.inactive) return;

    let focusableChildren = this.getFocusableElements();
    if (focusableChildren.length > 0) {
      if (trapToEnd) {
        focusableChildren[focusableChildren.length - 1].focus();
      } else {
        focusableChildren[0].focus();
      }

      this.$backup.setAttribute("tabindex", "-1");
    } else {
      // If there are no focusable children we need to focus on the backup
      // to trap the focus. This is a useful behavior if the focus trap is
      // for example used in a dialog and we don't want the user to tab
      // outside the dialog even though there are no focusable children
      // in the dialog.
      this.$backup.setAttribute("tabindex", "0");
      this.$backup.focus();
    }
  }

  /**
   * When the element gains focus this function is called.
   */
  private onFocusIn() {
    this.updateFocused(true);
  }

  /**
   * When the element looses its focus this function is called.
   */
  private onFocusOut() {
    this.updateFocused(false);
  }

  /**
   * Updates the focused property and updates the view.
   * The update is debounced because the focusin and focusout out
   * might fire multiple times in a row. We only want to render
   * the element once, therefore waiting until the focus is "stable".
   * @param value
   */
  private updateFocused(value: boolean) {
    debounce(
      () => {
        if (this.focused !== value) {
          this._focused = value;
          this.render();
        }
      },
      0,
      this.debounceId
    );
  }

  /**
   * Updates the template.
   */
  protected render() {
    if (!this.isConnected) return;
    this.$start.setAttribute(
      "tabindex",
      !this.focused || this.inactive ? `-1` : `0`
    );
    this.$end.setAttribute(
      "tabindex",
      !this.focused || this.inactive ? `-1` : `0`
    );
    this.focused
      ? this.setAttribute("focused", "")
      : this.removeAttribute("focused");
  }
}

if (window && window.customElements) {
  window.customElements.define("focus-trap", FocusTrap);
}
