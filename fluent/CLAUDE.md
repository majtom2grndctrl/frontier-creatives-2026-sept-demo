# AI guidelines for building web applications with Fluent design system

## styling approach
- default to using **griffel** for all component-level styles, as it is included with the fluent design system  
- use **emotion/react** with `useStyles()` only for wrapper components that need responsive design considerations  
- prefer component props for styling whenever possible, instead of custom css  

## semantic html
- always write semantic html directly when not using fluent components
- when using fluent components, leverage props (e.g., `as="section"`, `as="nav"`) to ensure the component renders as the correct semantic html element

### form structure
- use `<fieldset>` for grouping related form controls (radio groups, checkbox groups, or multiple related inputs)
- use native `<legend>` element as the first child of `<fieldset>` to label the group (fluent `Label` component does not support rendering as legend)
- style `<legend>` elements with griffel to match `Label` styling (use design tokens for font size, weight, color, spacing)
- use `<div>` for simple single label + input pairs
- use heading elements (`<h2>`, `<h3>`, etc.) for form section titles - leverage the `as` prop on `Text` component (e.g., `<Text as="h2">`)
- reset default fieldset styling with: `border: 'none'`, `padding: '0'`, `margin: '0'`, `minWidth: '0'`
- reset default legend styling with: `padding: '0'`, and add appropriate `marginBottom` using spacing tokens
- avoid redundant ARIA: `<legend>` automatically labels its `<fieldset>`, so don't add `role="group"` or `aria-labelledby` to elements inside the fieldset  

## custom styling
- when custom styling is required:
  - use **emotion/react** with `useStyles()`  
  - avoid hard-coded values if a design token exists in the theme  
  - reference design tokens from the fluent theme for colors, spacing, typography, and breakpoints  

## accessibility
- follow accessibility best practices:
  - ensure all interactive elements are keyboard accessible
  - provide appropriate aria attributes when needed
  - maintain sufficient color contrast using design tokens
  - use semantic html elements to improve screen reader support

### form label associations
- always associate labels with form controls for screen reader accessibility
- for `Input` and `Textarea`: use `htmlFor` prop on `Label`/`InfoLabel` matching the `id` prop on the control
  ```tsx
  <Label htmlFor="field-id">Field name</Label>
  <Input id="field-id" />
  ```
- for `RadioGroup`: wrap in `<fieldset>`, use native `<legend>` element for the group label with styled className, and provide unique `id` props to each `Radio` component
  ```tsx
  <fieldset>
    <legend id="label-id" className={styles.legend}>
      Field name <span className={styles.required}>*</span>
    </legend>
    <RadioGroup aria-labelledby="label-id">
      <Radio id="option-1" value="option1" label="Option 1" />
      <Radio id="option-2" value="option2" label="Option 2" />
    </RadioGroup>
  </fieldset>
  ```
- for grouped inputs without a single associated control: wrap in `<fieldset>`, use native `<legend>` element with styled className, and add `aria-label` on individual inputs (no need for `role="group"` or `aria-labelledby` on inner divs - the fieldset provides the grouping semantics)
  ```tsx
  <fieldset>
    <legend className={styles.legend}>Tags</legend>
    <div>
      <Input aria-label="Tag name" />
      <Input aria-label="Tag value" />
    </div>
  </fieldset>
  ```  

## writing style
- all code, comments, and documentation should use **sentence case** for clarity and consistency  

## summary
- use griffel by default  
- use emotion/react with `useStyles()` for responsive wrappers  
- prefer semantic html and fluent component props for structure  
- rely on design tokens instead of hard-coded values  
- prioritize accessibility in all components  
- write everything in sentence case  
