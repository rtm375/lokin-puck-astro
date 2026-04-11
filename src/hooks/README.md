# Class System Hooks

This directory contains React hooks for managing the class system initialization and website context.

## useClassSystemInit

Initializes the class system (variables and classes) for a website when it loads.

**Usage:**
```typescript
import { useClassSystemInit } from '@/hooks/useClassSystemInit';

function MyComponent() {
  const websiteId = getCurrentWebsiteId();
  useClassSystemInit(websiteId);
  // ... rest of component
}
```

**What it does:**
1. Loads variables from the database
2. Initializes default variables if needed
3. Loads style classes from the database
4. Initializes system classes (Flex, Grid) if needed
5. Initializes example classes if needed

**Features:**
- Prevents duplicate initialization
- Handles website switching automatically
- Logs initialization progress to console

## useWebsiteSwitch

Handles website switching by clearing and reloading class system stores.

**Usage:**
```typescript
import { useWebsiteSwitch } from '@/hooks/useWebsiteSwitch';

function MyComponent() {
  const websiteId = getCurrentWebsiteId();
  useWebsiteSwitch(websiteId);
  // ... rest of component
}
```

**What it does:**
1. Detects when the website ID changes
2. Clears variable and class stores
3. Reloads data for the new website

**Features:**
- Automatic detection of website changes
- Logs website switches to console
- Prevents unnecessary reloads

## Integration

Both hooks are used in the Editor component to ensure the class system is properly initialized and maintained:

```typescript
// src/components/client/website/pages/Editor.tsx
const websiteId = currentWebsite?.id;

// Handle website switching (clear stores when website changes)
useWebsiteSwitch(websiteId);

// Initialize class system (variables and classes) for this website
useClassSystemInit(websiteId);
```

## Store Reset

The class system stores are also reset when the user logs out or the app state is cleared:

```typescript
// src/components/client/StoreResetListener.tsx
useVariableStore.getState().reset();
useClassRegistryStore.getState().reset();
```
