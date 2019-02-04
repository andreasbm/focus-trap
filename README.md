# @appnest/focus-trap

## What is this?

A lightweight web component to trap focus within a DOM node. A focus trap ensures that `tab` and `shift + tab` keys will cycle through the focus trap's tabbable elements but will not leave the focus trap. This is great for making accessible components such as dropdowns or dialogs. Check out the demo at [https://appnest-demo.firebaseapp.com/focus-trap/](https://appnest-demo.firebaseapp.com/focus-trap/).

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

## Focus ring in Safari & Firefox

If you are having troubles with the focus ring being invisible on Safari you need to activate the accessibility settings. Read [this](http://forums.devshed.com/html-programming-1/safari-submit-button-wont-focus-tab-key-effectively-488012.html) issue if you are interested in learning more. The same goes for [Firefox](https://stackoverflow.com/questions/11704828/how-to-allow-keyboard-focus-of-links-in-firefox).

## 🎉 License

Licensed under [MIT](https://opensource.org/licenses/MIT).
