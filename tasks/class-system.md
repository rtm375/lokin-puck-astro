# Class System

## Objective
Refactor current Flex block to Container block and add class system with variable system to it. Once this success, we will refactor all blocks to use this system. And remove current tailwindcss run time pre generated css.

**Path**
`src/components/client/website/pages/puck/plugins/Classes.tsx`

---

## Core Concept

* Classes are **linked to Websites**
* Classes define reusable style layers
* Classes are hooked to each block at
  `src/components/client/website/pages/puck/blocks`
* Initial implementation target:
  `Flex → Container`
* Classes are applied as **stackable chips**
* Each class:
  * supports **nested sub-classes**
  * **inherits parent + previous classes**
  * **overrides selectively**

---

# Classes

## System Classes (Predefined)

### Applies to: Container block

#### Div

* display: block

#### Column

* display: flex
* flex-direction: column

#### Row

* display: flex
* flex-direction: row

#### Grid

* display: grid

**Sub-classes**

* 2 columns → `grid-template-columns: repeat(2, 1fr)`
* 4 columns → `grid-template-columns: repeat(4, 1fr)`

---

## Custom Classes

User can:
* Create class
* Create sub-class (nested)
* Override any property

---

# UI - Plugins Classes

## Class List (Tree)

```
- Grid ℹ️
  - 2 columns ℹ️
  - 4 columns ℹ️
- Row ℹ️
  - Test ℹ️ ✏️
    - Test with red ℹ️ ✏️
    - Test with blue ℹ️ ✏️
    - Test with green ℹ️ ✏️
- Column ℹ️
- Div ℹ️
  - Div Big Width ℹ️ ✏️
  - Experiment ℹ️ ✏️
  - Test ℹ️ ✏️
    - Test with red ℹ️ ✏️
- Text ℹ️ ✏️
  - Text with red ℹ️ ✏️
    - Red Dark ℹ️ ✏️
    - Red Light ℹ️ ✏️
  - heading 1 ℹ️ ✏️
    - Small ℹ️ ✏️
    - Medium ℹ️ ✏️
    - Large ℹ️ ✏️
  - heading 2 ℹ️ ✏️
  - heading 3 ℹ️ ✏️
```

**ℹ️ Info clicked**

```
On this page
- Layer Name
- Layer Name

or

This class is not applied to any element
```

**✏️ Actions clicked**

* Reset styles
* Copy styles
* Paste styles
* Duplicate
* Rename
* Delete

**Click Behavior**

```ts
dispatch({
  type: "setUi",
  ui: {
    itemSelector: {
      index,
      zone,
    },
    plugin: { current: "classes" },
  },
});
```

---

# UI - Block (Inside each block)

## Class Chips

```
[ Div ] [ Row ] [ Test ] [+]
```

---

## Class Chips Behavior

* Classes are stacked **left → right**
* Click class → set as **active class**
* Editing controls apply to:
  * active class → update class styles
  * no active class → update block props

---

## Breakpoints & pseudo

```
[ Breakpoints ⬇️ ] [ Pseudo ⬇️ ]
```

## Breakpoints & pseudo Behavior

Breakpoints options:
- Base > dropright pseudo options
- Laptop > dropright pseudo options
- Tablet > dropright pseudo options
- Mobile > dropright pseudo options

Pseudo options:
- Normal
- Hover
- Focus
- Visible
- [+] *when clicked popout name, selector

---

# Controls (Container Block)

Same as current Flex controls, including:
* Display
* Min Height
* Direction
* Justify Content
* Align Items
* Gap
* Margin
* Padding

- With integrated class system
- With integrated new breakpoints & pseudo system
- With integrated variable system: `src/components/client/website/pages/puck/plugins/Variables.tsx`

---

## Example Control

**Display**

```
[ Block ⬇️ ]
```

Options: [*] (Variable system selector?)
* Flex
* Grid
* Inline
* Inline flex
* Inline block

**Min height**
```
[ Slider 0-2000 ] unit: px,em,rem,%,vh
```
(*) variable icon to get value from variable system (Length & Percentage)

---

## Example

```
Div → gap: 15px
Row → gap: 24px
Test → gap: 40px
```

Result:

```
gap: 40px
```

---

# Inheritance Logic

## Merge Order

```
Parent Class
→ Class
→ Sub-class
→ Next Class
→ Block Props
```

---

## Example

```
Div → Row → Test → Test with red
```

---

## Result

```
Div.styles
→ Row.styles
→ Test.styles
→ Test with red.styles
→ Block frame
```

---

# Data Persistence (Supabase)

## Classes Table

* `id`
* `website_id`
* `name`
* `parent_id` (nullable)
* `styles` (jsonb)
* `sort_order`

---

## Block Usage

Each block must support types safety:

* `classes: available classes[]`

---

# State Management (Zustand)

## Store Scope

* classes
* UI state

---

## Required State

* `classes`
* `activeClassId`

---

## Required Actions

### Classes

* create
* update
* delete
* reorder

### Block Integration

* attach class
* detach class
* reorder class stack

---

# Behavior Rules

* State is **optimistic**
* Synced with Zustand Persist and Supabase on publish
* Reorder updates `sort_order`
* Sub-classes inherit parent
* Later class overrides earlier
* Block props override all classes

---

# Scalability

System must support future scalable in mind:
* pseudo classes (hover, active, custom added pseudo such as (name `Next El`, selector `+`) etc)
* responsive styles (per breakpoint) `src/components/client/website/pages/puck/config/viewports.tsx`
* variable integration `src/components/client/website/pages/puck/plugins/Variables.tsx`
* more style categories
* class presets / library
* website theme kit
* reusable class presets