# @appnest/focus-trap

## What is this?

A lightweight Web Component that can trap focus. Great for making accessible components such as dropdowns or dialogs.

**Features**

* Does one things very very well - it traps the focus! 
* Pierces through the shadow roots when looking for focusable elements.
* Works right out of the box (just add it to your markup)
* Created using only vanilla js - no dependencies and framework agnostic!

## Installation

```javascript
npm i @appnest/focus-trap
```

## Example

Import `@appnest/focus-trap` somewhere in your code and you're ready to go! Simply add the focus trap to your `html` and it'll be working without any more effort from your part.

```html
<focus-trap>
  <button>Focus 1</button>
  <button>Focus 2</button>
  <button>Focus 3</button>
  <button>Focus 4</button>
  <button>Focus 5</button>
</focus-trap>
```
