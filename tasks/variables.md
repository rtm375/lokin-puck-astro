# Variables System

**Path:**
`src/components/client/website/pages/puck/plugins/Variables.tsx`

## Core Concept

* Variables are **linked to Collections**
* Collections define structure (modes, skins, types)
* Variables live inside collections

---

# Collections

## System Collections (Default)

* Color
* Typography
* Spacing
* Border

## Custom Collections

User can create new collections with:

### Fields

* **Collection Name**

### Modes (select)

* Light
* Dark

### Skins (select + scalable)

* Default
* Modern
* ➕ Add new skin (future scalable)

### Variable Types (multi-select, scalable)

* Color & Gradient
* Length & Percentage (px, em, rem, %, etc)
* Box Shadow
* Text Shadow
* ➕ Future types supported

---

# UI — Collections

## Collection List

Dropdown:

```
[ Collections ⬇️ ]

- ➕ Create New Collection
- Color
- Typography
- Spacing
- Border
```

---

## Collection Detail (Selected)

**Collection Name**

```
[ Color / Typography / Spacing / Border ]
```

**Modes**

```
[ Select ⬇️ ]
- Light
- Dark
```

**Skins**

```
[ Select ⬇️ ]
- Default
- Modern 🗑️
- ➕ Add New Skin
```

**Variable Types (Multi-select)**

```
[ Select ⬇️ ]

- ⬜ Color & Gradient
- ✅ Length & Percentage
- ⬜ Box Shadow
- ✅ Text Shadow
```

---

# Variables

## Controls

**Collection Selector**

```
[ Collections ⬇️ ]

- Color
- Typography
- Spacing
- Border
- Edit Collections
```

**Mode Selector**

```
[ Modes ⬇️ ]
- Light
- Dark
```

---

## Actions

* ➕ Add New Variable
* ➕ Add New Group Variable

---

## Variable Item

```
[ Variable Name ] / [ Variable Value ] 🗑️
```

**Examples**

* Brand / #FF0000
* Container width / 1200px

---

## Group Variables

### Group Structure

```
Group Name ✏️ 🗑️

- Variable Name / Value 🗑️
- Variable Name / Value 🗑️
```

### Example

**Colors**

```
- Accent / #F6F6F6
- Text / #000000
- Background / #EEEEEE
```

**Spacing**

```
- Section vertical spacing / 60px
- Container width / 1200px
```

---

## Behavior

* Variables support **drag & drop sorting**
* Variables can be:

  * moved **between groups**
  * moved **in/out of groups**
* Groups are optional
* Fully scalable for:

  * new variable types
  * new skins
  * new modes

---

## Data Persistence (Supabase)

### Relationships

* All data is scoped to:
  * `website_id`

---

### Variables Collections

Each variables collection must store:
* `id`
* `website_id` (FK → websites)
* `name`
* `is_system` (for default collections: Color, Typography, etc)
* `modes`
  * enum (only: Light, Dark)
* `skins`
  * array (Default, Modern, future scalable)
* `variable_types`
  * array (multi-select, future scalable)

---

### Variables

Each variable must support:
* `id`
* `website_id` (FK → websites)
* `variables_collection_id` (FK → collections)
* `name`
* `value`
* `mode`
  * Light / Dark
* `is_group`
  * boolean (group or single variable)
* `group_id`
  * nullable self-reference (for nesting inside group)
* `sort_order`
  * for drag & drop ordering

---

### Notes

* Groups and variables share the **same structure**
* Group = `is_group = true`
* Nested variables = use `group_id`
* Must support:
  * fast reorder
  * hierarchy (group nesting)
  * filtering by:
    * collection
    * mode

---

## State Management (Zustand)

### Store Scope

Global store for:
* variables_collections
* variables
* UI state

---

### Required State

* `variables_collections`
* `variables`
* `activeCollection`
* `activeMode`

---

### Required Actions

* Variables Collections:
  * create
  * update
  * delete
  * set active

* Variables:
  * create variable
  * create group
  * update
  * delete
  * reorder (drag & drop)
  * move:
    * into group
    * out of group

---

### Behavior Rules

* State must be:
  * **optimistic** (instant UI update)
  * synced with Supabase

* Drag & drop must:
  * update `sort_order`
  * update `group_id` when moved

---

## Scalability

System must support future:
* new variable types
* new skins
* new modes
* deeper grouping if needed

---