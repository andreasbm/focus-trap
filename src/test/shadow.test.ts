import { FocusTrap } from "../lib/focus-trap";
import "../lib/index";

const expect = chai.expect;

const rootTemplate = document.createElement("template");
rootTemplate.innerHTML = `
	<focus-trap>
		<element-with-focusable-children id="1">
			<element-with-focusable-children id="2">
				<element-with-focusable-children id="3">
					<element-with-focusable-children id="4">
						<element-with-focusable-children id="5">
							<a href="#" id="6">I am the center of the world!</a>
						</element-with-focusable-children>
					</element-with-focusable-children>
					<element-with-focusable-children id="7">
						<a href="#" id="8">I am the center of the world!</a>
					</element-with-focusable-children>
				</element-with-focusable-children>
			</element-with-focusable-children>
		</element-with-focusable-children>
		<element-with-focusable-children id="9">
			<element-with-focusable-children id="10">
				<element-with-focusable-children id="11">
					<element-with-focusable-children id="12" aria-hidden="false">
						<element-with-focusable-children id="13">
							<a id="14" href="#">I am the center of the world!</a>
						</element-with-focusable-children>
					</element-with-focusable-children>
					
					<!-- Ignore -->
					<element-with-focusable-children hidden id="15">
						<element-with-focusable-children id="16">
							<a id="17" href="#">I am the center of the world!</a>
						</element-with-focusable-children>
					</element-with-focusable-children>
					<element-with-focusable-children aria-hidden id="18">
						<element-with-focusable-children id="19">
							<a id="20" href="#">I am the center of the world!</a>
						</element-with-focusable-children>
					</element-with-focusable-children>
					<element-with-focusable-children style="display: none" id="18">
						<element-with-focusable-children id="19">
							<a id="20" href="#">I am the center of the world!</a>
						</element-with-focusable-children>
					</element-with-focusable-children>
					<element-with-focusable-children style="visibility: hidden" id="18">
						<element-with-focusable-children id="19">
							<a id="20" href="#">I am the center of the world!</a>
						</element-with-focusable-children>
					</element-with-focusable-children>
					<element-with-focusable-children style="visibility: collapse" id="18">
						<element-with-focusable-children id="19">
							<a id="20" href="#">I am the center of the world!</a>
						</element-with-focusable-children>
					</element-with-focusable-children>
				</element-with-focusable-children>
			</element-with-focusable-children>
		</element-with-focusable-children>
	</focus-trap>
`;

const template = document.createElement("template");
template.innerHTML = `
	<button>Focusable</button>
	<a href="#">Focusable</a>
	<div tabindex="0">Focusable</div>
	<input placeholder="Focusable" />
	<textarea placeholder="Focusable"></textarea>
	<select>
		<option>1</option>
		<option>2</option>
		<option>3</option>
	</select>
	
	<button disabled>Not focusable</button>
	<slot></slot>
`;

const ELEMENT_WITH_FOCUSABLE_CHILDREN_COUNT = 11;
const FOCUSABLE_CHILDREN_PER_ELEMENT_WITH_FOCUSABLE_CHILDREN = 6;
const FOCUSABLE_LEAF_NODE_COUNT = 3;

class FocusTrapRoot extends HTMLElement {

	$focusTrap!: FocusTrap;

	constructor () {
		super();

		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(rootTemplate.content.cloneNode(true));
	}

	connectedCallback () {
		this.$focusTrap = this.shadowRoot!.querySelector<FocusTrap>("focus-trap")!;
	}
}

class ElementWithFocusableChildren extends HTMLElement {
	constructor () {
		super();

		const shadow = this.attachShadow({mode: "open"});
		shadow.appendChild(template.content.cloneNode(true));
	}
}

customElements.define("focus-trap-root", FocusTrapRoot);
customElements.define("element-with-focusable-children", ElementWithFocusableChildren);

describe("shadow", () => {

	let $root: FocusTrapRoot;

	beforeEach(async () => {
		$root = new FocusTrapRoot();
		document.body.appendChild($root);
	});
	after(() => {
		while (document.body.firstChild) {
			(<HTMLElement>document.body.firstChild).remove();
		}
	});

	it("[shadow] - should traverse nested shadow roots and find all focusable children", async () => {
		// console.log($root.$focusTrap.getFocusableElements());
		expect($root.$focusTrap.getFocusableElements().length).to.be.equal((ELEMENT_WITH_FOCUSABLE_CHILDREN_COUNT * FOCUSABLE_CHILDREN_PER_ELEMENT_WITH_FOCUSABLE_CHILDREN) + FOCUSABLE_LEAF_NODE_COUNT);
	});
});

