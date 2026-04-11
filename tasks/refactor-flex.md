Refactor src/components/client/website/pages/blocks/Flex/Flex.tsx → Mosaic-style system (class inheritance + UI + variables)
- ref class system: https://mosaicbuilder.com/docs/editor/class-system/
- ref variable system: https://mosaicbuilder.com/docs/editor/style-variables/

---

Problem

* props styling → no layering
* no inheritance
* no system

---

Goal

* class layering system (like Mosaic)
* class overrides previous
* variables drive values
* UI controls everything

---

Top bar (class UI)

* stacked chips
* order = priority (left → right)

example
Rows | Row gap s | column-first | Custom

rules

* new class inherits previous styles
* can override any property
* reorder = change priority

---

Class behavior (CORE)

when add class "column-first":

* inherit all previous computed styles
* UI shows current values (preview)
* any change = override ONLY in this class

example flow

Rows → gap: var(--gap-m)

* column-first → sees gap: var(--gap-m)
  edit gap → var(--gap-s)

result
column-first overrides gap only

---

Property system

each property (gap, margin, padding, width, etc):

* shows computed value (from previous classes)
* editable per active class
* stored as delta (override only)

---

Variables system

* all values from variables OR custom input

structure

themes

* light
* dark

categories (user-defined)

* color
* spacing
* sizing (px, rem, %, vh, etc)
* typography
* etc (extendable)

rules

* variables = global tokens
* class uses variable OR raw value
* variable change → global update

---

Class types

element

* flex (base)

subclass

* row, column

utility

* gap, padding

utility subclass

* gap-s, gap-m

custom

* user-defined (e.g column-first, MyCard)

---

Flex.tsx

* no styling props
* only classNames (ordered array)
* resolve pipeline:

for class in order:
→ merge styles
→ override previous

---

Data model (important)

class = partial style object

finalStyle = merge(
class1,
class2,
class3
)

---

UI behavior

* click chip → edit that class
* properties panel = scoped to selected class
* shows inherited values (preview)
* editing = override only

---

Example

UI
Rows | gap-m | column-first

column-first edits:

* direction → column
* gap → var(--gap-s)

Final result

* direction from column-first
* gap from column-first
* rest from previous classes

---

Refactor steps

1. ditch current implementation and make it as a puck block plugin: https://puckeditor.com/docs/api-reference/plugins/blocks-plugin
2. build variable system (theme + categories)
3. build class registry (partial styles)
4. implement class merge engine (ordered override)
5. build class UI (chips + editor scope)
6. connect UI → classNames → renderer

---

Mindset

* class = layer
* not preset, but override layer
* behaves like CSS cascade

---

Goal

* real design system (not component styling)
* scalable like Mosaic
* reusable + themeable + override-safe
