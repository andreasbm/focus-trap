import { isFocusable } from "../lib/focusable";

const expect = chai.expect;

const testElements: {tag: string, focusable: boolean, attributes?: {[key: string]: string}}[] = [

	// Elements
	{tag: "div", focusable: true, attributes: {tabindex: "0"}},
	{tag: "div", focusable: false},
	{tag: "div", focusable: false, attributes: {tabindex: "0", "aria-disabled": ""}},
	{tag: "div", focusable: true, attributes: {tabindex: "0", "aria-disabled": "false"}},
	{tag: "div", focusable: false, attributes: {tabindex: "0", "aria-hidden": ""}},
	{tag: "div", focusable: true, attributes: {tabindex: "0", "aria-hidden": "false"}},
	{tag: "div", focusable: false, attributes: {tabindex: "0", hidden: ""}},
	{tag: "div", focusable: false, attributes: {tabindex: "0", style: "display: none"}},
	{tag: "div", focusable: false, attributes: {tabindex: "0", style: "visibility: hidden"}},
	{tag: "div", focusable: false, attributes: {tabindex: "0", style: "visibility: collapse"}},
	{tag: "div", focusable: false, attributes: {tabindex: "0", style: "opacity: 0"}},

	// Links
	{tag: "a", focusable: true, attributes: {href: "#"}},
	{tag: "a", focusable: false},

	// Form elements
	{tag: "input", focusable: true},
	{tag: "textarea", focusable: true},
	{tag: "button", focusable: true},
	{tag: "select", focusable: true},
	{tag: "button", focusable: false, attributes: {disabled: ""}},
	{tag: "input", focusable: false, attributes: {disabled: ""}},
	{tag: "textarea", focusable: false, attributes: {disabled: ""}},
	{tag: "button", focusable: false, attributes: {disabled: ""}},
	{tag: "select", focusable: false, attributes: {disabled: ""}},
	{tag: "button", focusable: false, attributes: {"aria-hidden": ""}},
	{tag: "button", focusable: false, attributes: {hidden: ""}},

	// IFrames
	{tag: "iframe", focusable: true}
];

describe("focusable", () => {
	beforeEach(async () => {
	});
	after(() => {
	});

	it("[isFocusable] - should correctly determine whether an element is focusable", async () => {
		for (const elem of testElements) {
			const $elem = document.createElement(elem.tag);
			if (elem.attributes) {
				for (const [key, value] of Object.entries(elem.attributes)) {
					$elem.setAttribute(key, value);
				}
			}
			expect(isFocusable($elem)).to.be.equal(elem.focusable);
		}
	});
});

