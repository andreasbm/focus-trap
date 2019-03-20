## API

The `focus-trap` element implements the following interface.

```typescript
interface IFocusTrap {
  // Returns whether or not the focus trap is inactive.
  inactive: boolean;

  // Returns whether the focus trap currently has focus.
  readonly focused: boolean;

  // Focuses the first focusable element in the focus trap.
  focusFirstElement: (() => void);

  // Focuses the last focusable element in the focus trap.
  focusLastElement: (() => void);

  // Returns a list of the focusable children found within the element.
  getFocusableElements: (() => HTMLElement[]);
}
```
