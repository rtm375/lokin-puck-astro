# Design Document: Flex Class System

## Overview

This document specifies the technical design for refactoring the Flex component into a generic Container component with a class-based styling system. The system enables designers to create reusable, composable style classes that stack and override in a predictable manner, similar to CSS cascade behavior and tools like Mosaic or Elementor.

The Container component will support both flex and grid layouts through pre-registered layout classes. The component's behavior is determined by which layout class is applied, with the property panel dynamically showing relevant controls based on the active layout mode.

### Key Design Principles

1. **Separation of Concerns**: Style definitions (classes) are separate from component instances
2. **Composability**: Multiple classes can be stacked to build complex styles from simple building blocks
3. **Predictable Override**: Later classes in the stack override earlier ones (left-to-right priority)
4. **Variable-Driven**: Design tokens (variables) provide consistency across themes
5. **Responsive-First**: All properties support breakpoint-specific values
6. **Type Safety**: Full TypeScript support with strict typing

## Architecture

### System Components

The class system consists of five core subsystems:

1. **Variable System**: Manages design tokens organized by theme and category
2. **Class Registry**: Stores and retrieves style class definitions
3. **Merge Engine**: Resolves multiple classes into final computed styles
4. **Class Editor UI**: Provides interface for managing and editing classes
5. **Container Component**: Generic layout component that consumes the class system

### Data Flow

```
User Interaction
    ↓
Class Editor UI
    ↓
Class Registry (CRUD operations)
    ↓
Container Component (receives class IDs)
    ↓
Merge Engine (resolves classes → styles)
    ↓
Variable System (resolves variable references)
    ↓
Final Computed Styles
    ↓
DOM Rendering
```

## Components and Interfaces

### 1. Variable System

#### Data Structures

```typescript
// Variable value with theme support
interface VariableValue {
  light: string;
  dark: string;
}

// Variable definition
interface Variable {
  id: string;
  name: string; // User-friendly name, e.g., "Primary Color"
  key: string;  // Reference key, e.g., "color.primary"
  category: VariableCategory;
  value: VariableValue;
  type: VariableType;
}

type VariableCategory = 'color' | 'spacing' | 'sizing' | 'typography';
type VariableType = 'color' | 'dimension' | 'fontFamily' | 'fontSize' | 'fontWeight';

// Variable reference in class properties
interface VariableReference {
  type: 'variable';
  variableId: string;
}

// Property value can be concrete or variable reference
type PropertyValue = string | number | VariableReference;
```

#### Variable System Functions

```typescript
// Variable CRUD functions
function createVariable(variable: Omit<Variable, 'id'>): Promise<Variable>;
function getVariable(id: string): Variable | undefined;
function updateVariable(id: string, updates: Partial<Variable>): Promise<void>;
function deleteVariable(id: string): Promise<void>;
function listVariables(category?: VariableCategory): Variable[];

// Theme management functions
function getCurrentTheme(): 'light' | 'dark';
function setTheme(theme: 'light' | 'dark'): void;

// Value resolution functions
function resolveValue(value: PropertyValue): string;
function resolveVariable(variableId: string): string;
```

#### Variable System Hook

```typescript
// Main hook for variable system
function useVariableSystem() {
  const variables = useVariableStore(state => state.variables);
  const currentTheme = useVariableStore(state => state.currentTheme);
  const actions = useVariableStore(state => state.actions);
  
  return {
    variables,
    currentTheme,
    createVariable: actions.createVariable,
    updateVariable: actions.updateVariable,
    deleteVariable: actions.deleteVariable,
    listVariables: actions.listVariables,
    setTheme: actions.setTheme,
    resolveValue: actions.resolveValue,
    resolveVariable: actions.resolveVariable,
  };
}
```

#### Implementation Notes

- Variables stored in Zustand store: `useVariableStore.ts`
- Persisted to database for cross-session availability
- Resolution happens during merge phase
- Default variables pre-populated on first load
- All operations use functions and hooks, not classes

### 2. Class Registry

#### Data Structures

```typescript
// Style class definition
interface StyleClass {
  id: string;
  name: string;
  description?: string;
  type: ClassType;
  properties: ClassProperties;
  createdAt: Date;
  updatedAt: Date;
  isSystem: boolean; // true for pre-registered classes like Flex/Grid
}

type ClassType = 
  | 'layout'        // flex, grid (only one active at a time)
  | 'utility'       // gap, padding, margin
  | 'utility-sub'   // gap-s, gap-m (inherits from parent utility)
  | 'custom';       // user-defined

// Properties are responsive and can reference variables
interface ClassProperties {
  // Layout properties (flex)
  flexDirection?: ResponsiveValue<PropertyValue>;
  justifyContent?: ResponsiveValue<PropertyValue>;
  alignItems?: ResponsiveValue<PropertyValue>;
  flexWrap?: ResponsiveValue<PropertyValue>;
  gap?: ResponsiveValue<PropertyValue>;
  rowGap?: ResponsiveValue<PropertyValue>;
  columnGap?: ResponsiveValue<PropertyValue>;
  
  // Layout properties (grid)
  gridTemplateColumns?: ResponsiveValue<PropertyValue>;
  gridTemplateRows?: ResponsiveValue<PropertyValue>;
  gridGap?: ResponsiveValue<PropertyValue>;
  gridRowGap?: ResponsiveValue<PropertyValue>;
  gridColumnGap?: ResponsiveValue<PropertyValue>;
  justifyItems?: ResponsiveValue<PropertyValue>;
  alignContent?: ResponsiveValue<PropertyValue>;
  
  // Common properties
  width?: ResponsiveValue<PropertyValue>;
  minWidth?: ResponsiveValue<PropertyValue>;
  maxWidth?: ResponsiveValue<PropertyValue>;
  height?: ResponsiveValue<PropertyValue>;
  minHeight?: ResponsiveValue<PropertyValue>;
  maxHeight?: ResponsiveValue<PropertyValue>;
  margin?: ResponsiveSpacing;
  padding?: ResponsiveSpacing;
  
  // Background and borders
  backgroundColor?: ResponsiveValue<PropertyValue>;
  borderRadius?: ResponsiveValue<PropertyValue>;
  borderWidth?: ResponsiveValue<PropertyValue>;
  borderColor?: ResponsiveValue<PropertyValue>;
}

// Responsive value structure (from existing system)
type ResponsiveValue<T> = {
  [key in BreakpointKey]?: T;
};

type BreakpointKey = 'desktop' | 'laptop' | 'tablet' | 'mobile';

// Spacing structure (from existing system)
interface ResponsiveSpacing {
  top: ResponsiveValue<PropertyValue>;
  right: ResponsiveValue<PropertyValue>;
  bottom: ResponsiveValue<PropertyValue>;
  left: ResponsiveValue<PropertyValue>;
  topCustom?: ResponsiveValue<number>;
  rightCustom?: ResponsiveValue<number>;
  bottomCustom?: ResponsiveValue<number>;
  leftCustom?: ResponsiveValue<number>;
  unit?: ResponsiveValue<string>;
  lock: boolean;
}
```

#### Class Registry Functions

```typescript
// Class CRUD functions
function createClass(classData: Omit<StyleClass, 'id' | 'createdAt' | 'updatedAt'>): Promise<StyleClass>;
function getClass(id: string): StyleClass | undefined;
function updateClass(id: string, updates: Partial<StyleClass>): Promise<void>;
function deleteClass(id: string): Promise<void>;
function listClasses(type?: ClassType): StyleClass[];

// Class lookup functions
function getClassByName(name: string): StyleClass | undefined;
function getLayoutClasses(): StyleClass[];
function getSystemClasses(): StyleClass[];

// Validation functions
function validateClassName(name: string): boolean;
function validateClassProperties(properties: ClassProperties, type: ClassType): boolean;

// Pre-registered classes
function initializeSystemClasses(): void;
```

#### Class Registry Hook

```typescript
// Main hook for class registry
function useClassRegistry() {
  const classes = useClassRegistryStore(state => state.classes);
  const systemClassesInitialized = useClassRegistryStore(state => state.systemClassesInitialized);
  const actions = useClassRegistryStore(state => state.actions);
  
  return {
    classes,
    systemClassesInitialized,
    createClass: actions.createClass,
    updateClass: actions.updateClass,
    deleteClass: actions.deleteClass,
    getClass: actions.getClass,
    listClasses: actions.listClasses,
    getClassByName: actions.getClassByName,
    getLayoutClasses: actions.getLayoutClasses,
    getSystemClasses: actions.getSystemClasses,
    initializeSystemClasses: actions.initializeSystemClasses,
  };
}
```

#### Pre-registered System Classes

```typescript
// Flex layout class
const FLEX_CLASS: StyleClass = {
  id: 'system-flex',
  name: 'Flex',
  type: 'layout',
  isSystem: true,
  properties: {
    flexDirection: { desktop: 'row' },
    justifyContent: { desktop: 'flex-start' },
    alignItems: { desktop: 'stretch' },
    flexWrap: { desktop: 'nowrap' },
    gap: { desktop: '0px' },
  },
  // ... timestamps
};

// Grid layout class
const GRID_CLASS: StyleClass = {
  id: 'system-grid',
  name: 'Grid',
  type: 'layout',
  isSystem: true,
  properties: {
    gridTemplateColumns: { desktop: 'repeat(auto-fit, minmax(250px, 1fr))' },
    gridGap: { desktop: '16px' },
    justifyItems: { desktop: 'stretch' },
    alignItems: { desktop: 'stretch' },
  },
  // ... timestamps
};
```

#### Implementation Notes

- Registry stored in Zustand store: `useClassRegistryStore.ts`
- System classes initialized on first load per website
- System classes cannot be deleted or renamed
- Class names must be unique across all types within a website
- Validation ensures utility-sub classes reference valid parent utilities
- All operations use functions and hooks, not classes

### 3. Merge Engine

#### Core Algorithm

The merge engine combines multiple classes in left-to-right order, with later classes overriding earlier ones. The algorithm operates at the property level, preserving breakpoint-specific values.

```typescript
// Merge engine functions
function mergeClasses(classIds: string[]): ComputedStyles;
function mergeClassesUpTo(classIds: string[], stopAtIndex: number): ComputedStyles;
function explainProperty(classIds: string[], property: string): PropertyExplanation;
function getDebugTrace(classIds: string[]): MergeTrace[];

// Merge engine hook
function useMergeEngine() {
  const registry = useClassRegistry();
  const variableSystem = useVariableSystem();
  
  const mergeClasses = useCallback((classIds: string[]) => {
    // Implementation
  }, [registry, variableSystem]);
  
  const mergeClassesUpTo = useCallback((classIds: string[], stopAtIndex: number) => {
    // Implementation
  }, [registry, variableSystem]);
  
  return {
    mergeClasses,
    mergeClassesUpTo,
    explainProperty,
    getDebugTrace,
  };
}

interface ComputedStyles {
  properties: ClassProperties;
  cssVariables: Record<string, string>; // CSS custom properties for responsive values
  classNames: string[]; // Generated utility classes
}

interface PropertyExplanation {
  property: string;
  finalValue: any;
  contributingClass: string; // ID of class that set this value
  overriddenBy: string[]; // IDs of classes that were overridden
}

interface MergeTrace {
  step: number;
  classId: string;
  className: string;
  propertiesAdded: string[];
  propertiesOverridden: string[];
  currentState: ClassProperties;
}
```

#### Merge Algorithm Pseudocode

```
function mergeClasses(classIds: string[]): ComputedStyles {
  result = {}
  
  for each classId in classIds:
    styleClass = registry.getClass(classId)
    if !styleClass:
      warn("Class not found: " + classId)
      continue
    
    for each property in styleClass.properties:
      if property is ResponsiveValue:
        // Merge at breakpoint level
        for each breakpoint in property:
          if breakpoint has value:
            result[property][breakpoint] = resolveValue(value)
      else if property is ResponsiveSpacing:
        // Merge spacing edges independently
        for each edge in ['top', 'right', 'bottom', 'left']:
          for each breakpoint in property[edge]:
            if breakpoint has value:
              result[property][edge][breakpoint] = resolveValue(value)
      else:
        // Direct property assignment
        result[property] = resolveValue(value)
  
  return convertToComputedStyles(result)
}

function resolveValue(value: PropertyValue): string {
  if value is VariableReference:
    return variableSystem.resolveVariable(value.variableId)
  return value
}
```

#### Responsive CSS Generation

The merge engine leverages the existing `getResponsiveCSS` utility to generate CSS custom properties and utility classes:

```typescript
function convertToComputedStyles(merged: ClassProperties): ComputedStyles {
  const configs: ResponsiveCSSConfig[] = [];
  
  // Convert each property to ResponsiveCSSConfig
  for (const [property, value] of Object.entries(merged)) {
    if (isResponsiveValue(value)) {
      configs.push({
        property: camelToKebab(property),
        prefix: generatePrefix(property),
        responsiveValue: value,
      });
    }
  }
  
  const { style, className } = getResponsiveCSS(configs);
  
  return {
    properties: merged,
    cssVariables: style,
    classNames: className.split(' '),
  };
}
```

#### Cache Strategy

Cache is managed entirely within Zustand stores - no separate cache hooks needed:

```typescript
// Cache is part of ClassRegistryStore state
interface ClassRegistryStore {
  // ... other state
  computedStylesCache: Map<string, ComputedStyles>;
  
  // Computed getter with built-in caching
  getComputedStyles: (classIds: string[]) => ComputedStyles;
  
  // Cache invalidation
  invalidateCache: (classId?: string) => void;
}

// Implementation in store:
const useClassRegistryStore = create<ClassRegistryStore>((set, get) => ({
  computedStylesCache: new Map(),
  
  getComputedStyles: (classIds) => {
    const state = get();
    const theme = useVariableStore.getState().currentTheme;
    const cacheKey = `${classIds.join(':')}-${theme}`;
    
    // Check cache first
    if (state.computedStylesCache.has(cacheKey)) {
      return state.computedStylesCache.get(cacheKey)!;
    }
    
    // Compute and cache
    const computed = mergeClasses(classIds, state.classes, theme);
    state.computedStylesCache.set(cacheKey, computed);
    return computed;
  },
  
  invalidateCache: (classId) => {
    set(state => {
      if (classId) {
        // Remove entries containing this classId
        const newCache = new Map(state.computedStylesCache);
        for (const [key] of newCache) {
          if (key.includes(classId)) {
            newCache.delete(key);
          }
        }
        return { computedStylesCache: newCache };
      }
      // Clear all cache
      return { computedStylesCache: new Map() };
    });
  },
  
  updateClass: async (id, updates) => {
    // ... update logic
    get().invalidateCache(id); // Auto-invalidate on update
  },
}));
```

Cache invalidation triggers (automatic):
- When a class definition is updated → `invalidateCache(classId)`
- When a variable value changes → `invalidateCache()` (all)
- When theme switches → cache key includes theme, so automatic
- Manual invalidation via debug tools → `invalidateCache()`

#### Implementation Notes

- Merge engine implemented as pure functions in: `src/lib/client/class-system/merge-engine.ts`
- Cache stored in memory (Map via useRef) for performance
- Debug mode enabled via environment variable or dev tools
- Merge complexity: O(n × m) where n = number of classes, m = average properties per class
- All operations use functions and hooks, not classes

### 4. Class Editor UI

#### Component Structure

```
ClassEditor (main container)
├── ClassTopBar
│   ├── LayoutClassSelector
│   ├── ClassChipStack
│   │   └── ClassChip (draggable, removable)
│   └── AddClassButton
├── PropertyPanel
│   ├── BreakpointSelector (ViewportSelector)
│   ├── PropertyGroup (flex/grid specific)
│   │   └── PropertyControl
│   │       ├── PropertyLabel
│   │       ├── InheritedValuePreview
│   │       ├── PropertyInput (variable selector or custom value)
│   │       └── ResetButton
│   └── CommonPropertyGroup (margin, padding, sizing)
└── ComputedStylesDebugPanel (dev mode only)
```

#### Key UI Components

```typescript
// Class chip in top bar
interface ClassChipProps {
  classId: string;
  className: string;
  isActive: boolean;
  isSystem: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
}

// Property control with inheritance display
interface PropertyControlProps {
  property: string;
  label: string;
  value: PropertyValue | undefined;
  inheritedValue: PropertyValue | undefined;
  onChange: (value: PropertyValue) => void;
  onReset: () => void;
  variableCategory?: VariableCategory;
  controlType: 'select' | 'slider' | 'spacing' | 'gap' | 'custom';
}

// Variable selector dropdown
interface VariableSelectorProps {
  category: VariableCategory;
  value: PropertyValue;
  onChange: (value: PropertyValue) => void;
  onSwitchToCustom: () => void;
}

// Layout class selector
interface LayoutClassSelectorProps {
  activeLayoutClass: string | undefined;
  onChange: (classId: string) => void;
}
```

#### Class Reordering (Drag and Drop)

Using HTML5 Drag and Drop API:

```typescript
function handleDragStart(e: DragEvent, index: number) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', index.toString());
  setDraggingIndex(index);
}

function handleDragOver(e: DragEvent, index: number) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  setDropIndicatorIndex(index);
}

function handleDrop(e: DragEvent, dropIndex: number) {
  e.preventDefault();
  const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
  
  if (dragIndex !== dropIndex) {
    const newOrder = reorderArray(classIds, dragIndex, dropIndex);
    onClassOrderChange(newOrder);
  }
  
  setDraggingIndex(null);
  setDropIndicatorIndex(null);
}
```

#### Inherited Value Display

```typescript
// Inherited value computation is handled by Zustand store
// No need for component-level computation or useMemo

function PropertyControl({ property, classIds, activeIndex, breakpoint }: Props) {
  // Store handles caching and memoization
  const inheritedValue = useClassRegistryStore(state =>
    state.getInheritedValue(classIds, activeIndex, property, breakpoint)
  );
  
  const currentValue = useClassRegistryStore(state => {
    const activeClass = state.getClass(classIds[activeIndex]);
    return activeClass?.properties[property]?.[breakpoint];
  });
  
  // ... render with inheritedValue and currentValue
}

// Implementation in Zustand store:
// getInheritedValue: (classIds, activeIndex, property, breakpoint) => {
//   const cacheKey = `${classIds.slice(0, activeIndex).join(':')}-${property}-${breakpoint}`;
//   if (cache.has(cacheKey)) return cache.get(cacheKey);
//   
//   const merged = mergeClassesUpTo(classIds, activeIndex);
//   const value = merged.properties[property]?.[breakpoint];
//   cache.set(cacheKey, value);
//   return value;
// }
```

#### Implementation Notes

- Editor UI components in: `src/components/client/website/pages/components/ClassEditor/`
- Reuses existing responsive controls from `ResponsiveControls.tsx`
- Integrates with Puck editor's field system
- State managed via Zustand store: `useClassEditorStore.ts`

### 5. Container Component

#### Component Interface

```typescript
interface ContainerProps {
  classIds: string[]; // Ordered array of class IDs to apply
  items: Slot;        // Child components (from Puck)
  puck: PuckContext;  // Puck editor context
}

// Puck component config
interface ContainerConfig extends ComponentConfig<ContainerProps> {
  fields: {
    classIds: {
      type: 'custom';
      render: ClassEditorField;
    };
    items: {
      type: 'slot';
    };
  };
  defaultProps: {
    classIds: ['system-flex']; // Default to Flex layout
    items: [];
  };
}
```

#### Rendering Logic

```typescript
function Container({ classIds, items: Items, puck }: ContainerProps) {
  // Get computed styles directly from Zustand store
  // Store handles caching and memoization internally
  const computed = useClassRegistryStore(state => 
    state.getComputedStyles(classIds)
  );
  
  // Get layout mode from store
  const layoutMode = useClassRegistryStore(state => 
    state.getLayoutMode(classIds)
  );
  
  // Apply computed styles
  return (
    <Items
      ref={puck.dragRef}
      as="section"
      style={computed.cssVariables}
      className={`${layoutMode} ${computed.classNames.join(' ')}`}
      disallow={[/* ... */]}
    />
  );
}
```

#### Migration from Legacy Flex

The Container component includes migration logic in `resolveData`:

```typescript
resolveData: async ({ props }) => {
  // Check if this is legacy Flex data
  if (props.frame && !props.classIds) {
    // Convert legacy frame properties to class definition
    const legacyClass = convertLegacyFrameToClass(props.frame);
    
    // Create a custom "Legacy" class
    const legacyClassId = registry.createClass({
      name: `Legacy_${Date.now()}`,
      type: 'custom',
      isSystem: false,
      properties: legacyClass.properties,
    }).id;
    
    // Set up class stack: [flex, legacy]
    return {
      props: {
        classIds: ['system-flex', legacyClassId],
        items: props.items,
      },
    };
  }
  
  return { props };
}
```

#### Implementation Notes

- Container component in: `src/components/client/website/pages/blocks/Container/Container.tsx`
- Replaces existing Flex component
- Backward compatible via migration logic
- Exports updated type definitions to `@blockTypes`

## Data Models

### Database Schema

```sql
-- Variables table (scoped to website, not user)
CREATE TABLE public.variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('color', 'spacing', 'sizing', 'typography')),
  type TEXT NOT NULL CHECK (type IN ('color', 'dimension', 'fontFamily', 'fontSize', 'fontWeight')),
  value_light TEXT NOT NULL,
  value_dark TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(website_id, key)
);

-- Style classes table (scoped to website, not user)
CREATE TABLE public.style_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('layout', 'utility', 'utility-sub', 'custom')),
  properties JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(website_id, name)
);

-- Indexes
CREATE INDEX idx_variables_website_category ON public.variables(website_id, category);
CREATE INDEX idx_style_classes_website_type ON public.style_classes(website_id, type);
CREATE INDEX idx_style_classes_system ON public.style_classes(is_system) WHERE is_system = TRUE;

-- Enable RLS
ALTER TABLE public.variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Variables
CREATE POLICY "Users can view variables for their websites"
  ON public.variables
  FOR SELECT
  TO authenticated
  USING (check_website_access(website_id));

CREATE POLICY "Owners and editors can insert variables"
  ON public.variables
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.websites
      WHERE id = variables.website_id
      AND user_uid = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.website_collaborators
      WHERE website_id = variables.website_id
      AND user_uid = (SELECT auth.uid())
      AND role = 'editor'
    )
  );

CREATE POLICY "Owners and editors can update variables"
  ON public.variables
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.websites
      WHERE id = variables.website_id
      AND user_uid = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.website_collaborators
      WHERE website_id = variables.website_id
      AND user_uid = (SELECT auth.uid())
      AND role = 'editor'
    )
  );

CREATE POLICY "Owners and editors can delete variables"
  ON public.variables
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.websites
      WHERE id = variables.website_id
      AND user_uid = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.website_collaborators
      WHERE website_id = variables.website_id
      AND user_uid = (SELECT auth.uid())
      AND role = 'editor'
    )
  );

-- RLS Policies for Style Classes
CREATE POLICY "Users can view style classes for their websites"
  ON public.style_classes
  FOR SELECT
  TO authenticated
  USING (check_website_access(website_id));

CREATE POLICY "Owners and editors can insert style classes"
  ON public.style_classes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.websites
      WHERE id = style_classes.website_id
      AND user_uid = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.website_collaborators
      WHERE website_id = style_classes.website_id
      AND user_uid = (SELECT auth.uid())
      AND role = 'editor'
    )
  );

CREATE POLICY "Owners and editors can update style classes"
  ON public.style_classes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.websites
      WHERE id = style_classes.website_id
      AND user_uid = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.website_collaborators
      WHERE website_id = style_classes.website_id
      AND user_uid = (SELECT auth.uid())
      AND role = 'editor'
    )
  );

CREATE POLICY "Owners and editors can delete style classes"
  ON public.style_classes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.websites
      WHERE id = style_classes.website_id
      AND user_uid = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.website_collaborators
      WHERE website_id = style_classes.website_id
      AND user_uid = (SELECT auth.uid())
      AND role = 'editor'
    )
  );
```

### Zustand Store Schemas

```typescript
// Variable store (scoped to website)
interface VariableStore {
  variables: Map<string, Variable>;
  currentTheme: 'light' | 'dark';
  currentWebsiteId: string | null;
  
  // Actions
  loadVariables: (websiteId: string) => Promise<void>;
  createVariable: (websiteId: string, variable: Omit<Variable, 'id'>) => Promise<Variable>;
  updateVariable: (id: string, updates: Partial<Variable>) => Promise<void>;
  deleteVariable: (id: string) => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentWebsite: (websiteId: string) => void;
  
  // Computed getters (Zustand handles memoization)
  resolveValue: (value: PropertyValue) => string;
  getVariable: (id: string) => Variable | undefined;
  listVariables: (category?: VariableCategory) => Variable[];
}

// Class registry store (scoped to website)
interface ClassRegistryStore {
  classes: Map<string, StyleClass>;
  systemClassesInitialized: boolean;
  currentWebsiteId: string | null;
  
  // Cache for computed styles (managed by Zustand)
  computedStylesCache: Map<string, ComputedStyles>;
  
  // Actions
  loadClasses: (websiteId: string) => Promise<void>;
  createClass: (websiteId: string, classData: Omit<StyleClass, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StyleClass>;
  updateClass: (id: string, updates: Partial<StyleClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  initializeSystemClasses: (websiteId: string) => Promise<void>;
  setCurrentWebsite: (websiteId: string) => void;
  invalidateCache: (classId?: string) => void;
  
  // Computed getters (Zustand handles memoization)
  getClass: (id: string) => StyleClass | undefined;
  listClasses: (type?: ClassType) => StyleClass[];
  getLayoutClasses: () => StyleClass[];
  getSystemClasses: () => StyleClass[];
  getComputedStyles: (classIds: string[]) => ComputedStyles;
  getLayoutMode: (classIds: string[]) => 'flex' | 'grid';
  getInheritedValue: (classIds: string[], activeIndex: number, property: string, breakpoint: BreakpointKey) => PropertyValue | undefined;
}

// Class editor store (UI state)
interface ClassEditorStore {
  activeComponentId: string | null;
  activeClassIndex: number;
  activeBreakpoint: BreakpointKey;
  draggingClassIndex: number | null;
  
  // Actions
  setActiveComponent: (componentId: string) => void;
  setActiveClassIndex: (index: number) => void;
  setActiveBreakpoint: (breakpoint: BreakpointKey) => void;
  setDraggingClassIndex: (index: number | null) => void;
}
```

## Error Handling

### Error Types

```typescript
// Error codes enum
enum ErrorCode {
  CLASS_NOT_FOUND = 'CLASS_NOT_FOUND',
  VARIABLE_NOT_FOUND = 'VARIABLE_NOT_FOUND',
  INVALID_CLASS_NAME = 'INVALID_CLASS_NAME',
  DUPLICATE_CLASS_NAME = 'DUPLICATE_CLASS_NAME',
  SYSTEM_CLASS_MODIFICATION = 'SYSTEM_CLASS_MODIFICATION',
  INVALID_PROPERTY_VALUE = 'INVALID_PROPERTY_VALUE',
  MERGE_ERROR = 'MERGE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
}

// Error factory function (instead of class)
function createClassSystemError(
  message: string,
  code: ErrorCode,
  context?: Record<string, any>
): Error {
  const error = new Error(message);
  error.name = 'ClassSystemError';
  (error as any).code = code;
  (error as any).context = context;
  return error;
}

// Type guard for class system errors
function isClassSystemError(error: unknown): error is Error & { code: ErrorCode; context?: Record<string, any> } {
  return error instanceof Error && 'code' in error && error.name === 'ClassSystemError';
}
```

### Error Handling Strategy

1. **Class Not Found**: Log warning, skip class in merge, continue with remaining classes
2. **Variable Not Found**: Log warning, use fallback value (empty string or default)
3. **Invalid Property Value**: Show inline validation error in editor, prevent save
4. **System Class Modification**: Block operation, show error toast
5. **Storage Errors**: Show error toast, retry with exponential backoff
6. **Merge Errors**: Log error with stack trace, return empty computed styles

### Validation Rules

```typescript
// Class name validation
function validateClassName(name: string): boolean {
  // Must be 1-50 characters
  // Alphanumeric, hyphens, underscores only
  // Cannot start with number
  const regex = /^[a-zA-Z_][a-zA-Z0-9_-]{0,49}$/;
  return regex.test(name);
}

// Property value validation
function validatePropertyValue(
  property: string,
  value: PropertyValue,
  type: ClassType
): boolean {
  // Check if property is allowed for class type
  if (!isPropertyAllowedForType(property, type)) {
    return false;
  }
  
  // Validate variable reference
  if (isVariableReference(value)) {
    return variableSystem.getVariable(value.variableId) !== undefined;
  }
  
  // Validate concrete value based on property type
  return validateConcreteValue(property, value);
}
```

## Testing Strategy

### Unit Tests

Focus on core logic and algorithms:

- Variable resolution with theme switching
- Class merge algorithm with various property combinations
- Cache invalidation logic
- Property value validation
- Class name validation
- Responsive value cascading
- Legacy migration conversion

### Integration Tests

Test component interactions:

- Class editor UI updates when classes change
- Container component re-renders with updated styles
- Drag-and-drop reordering updates class order
- Variable selector updates class properties
- Theme switching updates all components
- Database persistence and retrieval

### Example-Based Tests

Specific scenarios to verify:

- Creating a custom class from scratch
- Applying multiple classes to a container
- Overriding inherited values
- Switching between Flex and Grid layouts
- Migrating legacy Flex component
- Exporting and importing class definitions
- Handling missing classes gracefully

### Performance Tests

Measure and optimize:

- Merge engine performance with 10+ classes
- Cache hit rate during typical editing session
- Component re-render frequency
- Database query performance
- Memory usage with large class registry

## Performance Optimization

### Optimization Strategy

The class system uses Zustand's built-in optimization capabilities:

1. **Store-level caching**: All computed values (merged styles, inherited values) cached in Zustand
2. **Selective subscriptions**: Components subscribe only to computed getters, not raw state
3. **Automatic cache invalidation**: Store handles cache invalidation on updates
4. **Zero useMemo in components**: All memoization handled by Zustand stores

### Zustand-First Approach

```typescript
// ✅ CORRECT: Store handles all caching and memoization
function Container({ classIds, items: Items, puck }: ContainerProps) {
  // Store computes, caches, and returns result
  // Only re-renders if result actually changes
  const computed = useClassRegistryStore(state => 
    state.getComputedStyles(classIds)
  );
  
  const layoutMode = useClassRegistryStore(state => 
    state.getLayoutMode(classIds)
  );
  
  return (
    <Items
      ref={puck.dragRef}
      as="section"
      style={computed.cssVariables}
      className={`${layoutMode} ${computed.classNames.join(' ')}`}
    />
  );
}

// ✅ CORRECT: Property control gets cached inherited value from store
function PropertyControl({ property, classIds, activeIndex, breakpoint }: Props) {
  const inheritedValue = useClassRegistryStore(state =>
    state.getInheritedValue(classIds, activeIndex, property, breakpoint)
  );
  
  // ... render
}

// ❌ WRONG: Don't use useMemo when Zustand can handle it
function Container({ classIds }: Props) {
  const classes = useClassRegistryStore(state => state.classes);
  
  // ❌ Bad: manual memoization
  const computed = useMemo(
    () => mergeClasses(classIds, classes),
    [classIds, classes]
  );
  
  // ✅ Good: let store handle it
  const computed = useClassRegistryStore(state => 
    state.getComputedStyles(classIds)
  );
}
```

### Store Implementation Pattern

```typescript
// ClassRegistryStore with built-in caching
const useClassRegistryStore = create<ClassRegistryStore>((set, get) => ({
  classes: new Map(),
  computedStylesCache: new Map(),
  
  // Computed getter with automatic caching
  getComputedStyles: (classIds: string[]) => {
    const state = get();
    const theme = useVariableStore.getState().currentTheme;
    const cacheKey = `${classIds.join(':')}-${theme}`;
    
    // Return cached if available
    const cached = state.computedStylesCache.get(cacheKey);
    if (cached) return cached;
    
    // Compute, cache, and return
    const computed = mergeClasses(classIds, state.classes, theme);
    set(state => ({
      computedStylesCache: new Map(state.computedStylesCache).set(cacheKey, computed)
    }));
    return computed;
  },
  
  // Auto-invalidate cache on updates
  updateClass: async (id, updates) => {
    await api.updateClass(id, updates);
    set(state => {
      const newClasses = new Map(state.classes);
      newClasses.set(id, { ...newClasses.get(id)!, ...updates });
      
      // Invalidate affected cache entries
      const newCache = new Map(state.computedStylesCache);
      for (const [key] of newCache) {
        if (key.includes(id)) newCache.delete(key);
      }
      
      return { classes: newClasses, computedStylesCache: newCache };
    });
  },
}));
```
      style={computed.cssVariables}
      className={`${layoutMode} ${computed.classNames.join(' ')}`}
    />
  );
}

// Property control - YES, use useMemo (inheritance computation)
function PropertyControl({ classIds, activeIndex, property, breakpoint }: Props) {
  const computeInherited = useClassRegistryStore(state => state.computeInherited);
  
  // useMemo here: prevents recomputation on unrelated renders
  const inheritedValue = useMemo(
    () => computeInherited(classIds, activeIndex, property, breakpoint),
    [classIds, activeIndex, property, breakpoint, computeInherited]
  );
  
  return <div>{inheritedValue}</div>;
}

// Simple component - NO useMemo needed
function ClassChip({ classId }: Props) {
  const className = useClassRegistryStore(
    state => state.classes.get(classId)?.name
  );
  
  // Simple render - no memoization needed
  return <div>{className}</div>;
}
```

### Cache at Store Level (Preferred)

Move caching logic into Zustand stores to avoid prop drilling and useMemo:

```typescript
// In useClassRegistryStore
const useClassRegistryStore = create<ClassRegistryStore>((set, get) => ({
  classes: new Map(),
  mergeCache: new Map(),
  
  // Cached merge function - handles memoization internally
  mergeClasses: (classIds: string[]) => {
    const cacheKey = getCacheKey(classIds, get().currentTheme);
    const cached = get().mergeCache.get(cacheKey);
    
    if (cached) return cached; // Return cached result
    
    const result = performMerge(classIds, get().classes);
    get().mergeCache.set(cacheKey, result);
    return result;
  },
  
  // Invalidate cache when classes change
  updateClass: (id, updates) => {
    set(state => {
      state.classes.set(id, { ...state.classes.get(id), ...updates });
      // Clear cache entries containing this class
      state.mergeCache.clear();
    });
  },
}));
```

### Lazy Loading

- Load class definitions on-demand for large registries (handled by Zustand store)
- Defer loading of non-visible property controls (React.lazy for heavy components)
- Lazy load variable selector dropdown content (virtualized list for 100+ variables)

### Debouncing

- Debounce property value changes (300ms)
- Debounce class reordering during drag (100ms)
- Debounce search/filter in class selector (200ms)

## Migration Strategy

### Phase 1: Parallel Implementation

1. Implement class system alongside existing Flex component
2. Add feature flag to enable Container component
3. Test with new components only

### Phase 2: Automatic Migration

1. Deploy migration logic in `resolveData`
2. Existing Flex components automatically convert on load
3. Legacy data preserved in custom "Legacy" classes
4. No manual intervention required

### Phase 3: Deprecation

1. Mark Flex component as deprecated in UI
2. Show migration notice in editor
3. Provide "Convert to Container" button for manual migration
4. Remove Flex component in future major version

### Migration Testing

- Test migration with various legacy Flex configurations
- Verify visual parity before/after migration
- Test rollback scenario if issues arise
- Monitor error rates post-deployment

## Future Enhancements

### Planned Features

1. **Class Inheritance**: Allow classes to explicitly inherit from parent classes
2. **Class Variants**: Define variants (hover, active, focus) within a class
3. **Class Groups**: Organize classes into folders/categories
4. **Class Templates**: Pre-built class combinations for common patterns
5. **Global Styles**: Apply classes globally to all components of a type
6. **Class Versioning**: Track changes to class definitions over time
7. **Class Sharing**: Share classes across projects or with team members
8. **AI-Assisted Class Creation**: Suggest classes based on design patterns

### Technical Debt

- Add comprehensive error boundaries around class editor
- Implement undo/redo for class modifications
- Add telemetry for class system usage patterns
- Optimize database queries with caching layer
- Add E2E tests for complete workflows


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Variable Resolution Consistency

*For any* variable reference in any class property, resolving that reference SHALL always return the current value of the variable for the active theme, and changing the variable value SHALL cause all references to resolve to the new value.

**Validates: Requirements 1.2, 1.5, 3.4, 12.3**

### Property 2: Class Merge Override Order

*For any* ordered sequence of style classes, when merged, properties from classes appearing later in the sequence SHALL override properties from classes appearing earlier, and the final computed style SHALL contain the rightmost value for each property that appears in multiple classes.

**Validates: Requirements 3.1, 3.2, 3.3, 12.2**

### Property 3: Inherited Value Computation

*For any* class at position N in a class stack, the computed inherited value for any property SHALL equal the result of merging all classes at positions 0 through N-1, and SHALL update when any of those previous classes change.

**Validates: Requirements 6.1, 6.2**

### Property 4: Graceful Class Resolution

*For any* array of class identifiers (including invalid or missing class IDs), the merge engine SHALL successfully resolve all valid class IDs, skip invalid IDs with a warning, and produce a valid computed style object from the valid classes only.

**Validates: Requirements 12.1, 12.5, 21.1**

### Property 5: Invalid Variable Fallback

*For any* class property containing an invalid variable reference (referencing a non-existent variable), the merge engine SHALL use a fallback value (empty string or type-appropriate default) and log a warning, without failing the entire merge operation.

**Validates: Requirements 21.2**

### Property 6: Property Edit Scoping

*For any* property edit made while a specific class is active in the editor, the edit SHALL modify only that class's property value, and resetting the property SHALL remove the override from that class, causing the value to fall back to the computed value from previous class layers.

**Validates: Requirements 5.3, 5.5**

### Property 7: Variable Reference Storage

*For any* property value set to a variable through the editor, the stored value SHALL be a variable reference (containing the variable ID), not the resolved concrete value, and subsequent resolution SHALL use the current variable value at resolution time.

**Validates: Requirements 7.3**

### Property 8: System Class Protection

*For any* attempt to delete or rename a system class (Flex or Grid), the operation SHALL be blocked and return an error, preserving the system class unchanged.

**Validates: Requirements 8.3**

### Property 9: Layout Class Exclusivity

*For any* class stack, when a new layout class is applied, any existing layout class SHALL be removed from the stack, ensuring exactly zero or one layout class is active at any time.

**Validates: Requirements 8.4**

### Property 10: Responsive Value Merging

*For any* property with breakpoint-specific values across multiple classes, merging SHALL preserve breakpoint-level granularity, with later classes overriding earlier classes independently at each breakpoint, and the final computed style SHALL contain the correct value for each breakpoint.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 11: Theme-Aware Variable Resolution

*For any* set of variables with different values for light and dark themes, switching the active theme SHALL cause all variable references to resolve to the values for the new theme, and the merge engine SHALL recompute all styles using the new theme values.

**Validates: Requirements 17.1, 17.2, 17.3, 17.4**

### Property 12: Migration Style Equivalence

*For any* legacy Flex component configuration, the migration conversion SHALL produce a class definition that, when merged with the default Flex class, results in computed styles visually equivalent to the original legacy configuration.

**Validates: Requirements 18.2**

### Property 13: Export-Import Round-Trip

*For any* set of class definitions, exporting to JSON and then importing SHALL produce class definitions equivalent to the originals, preserving all properties, variable references, and metadata.

**Validates: Requirements 19.1, 19.2, 19.4**

### Property 14: Cache Invalidation Correctness

*For any* cached merge result, when any class definition or variable value used in that merge is modified, the cache entry SHALL be invalidated, and the next merge with the same class IDs SHALL recompute the result using the updated definitions.

**Validates: Requirements 20.2**

### Property 15: Unique Class Identifiers

*For any* set of classes created through the registry, all class identifiers SHALL be unique, with no two classes sharing the same ID, regardless of creation order or timing.

**Validates: Requirements 2.3**

### Property 16: Class Lookup Consistency

*For any* class stored in the registry, looking up that class by its ID or by its name SHALL return the same class definition, and the returned definition SHALL match the originally stored definition.

**Validates: Requirements 2.4**


## Testing Strategy

### Overview

The testing strategy employs a dual approach combining property-based testing for core algorithms and example-based testing for UI components and integration scenarios. This ensures both comprehensive input coverage and practical validation of user workflows.

### Property-Based Testing

Property-based testing will be used to verify the correctness properties defined above. We will use **fast-check** as the property-based testing library for TypeScript/JavaScript.

#### Test Configuration

- **Library**: fast-check (npm package: `fast-check`)
- **Minimum iterations**: 100 per property test
- **Test location**: `src/lib/client/class-system/__tests__/`
- **Naming convention**: `*.property.test.ts`

#### Property Test Implementation

Each correctness property will be implemented as a single property-based test with a comment tag referencing the design document:

```typescript
import fc from 'fast-check';

describe('Class System Properties', () => {
  it('Property 1: Variable Resolution Consistency', () => {
    // Feature: flex-class-system, Property 1: Variable Resolution Consistency
    fc.assert(
      fc.property(
        fc.record({
          variables: fc.array(arbitraryVariable()),
          classWithRefs: arbitraryClassWithVariableRefs(),
          theme: fc.constantFrom('light', 'dark'),
        }),
        ({ variables, classWithRefs, theme }) => {
          // Setup: create variables and class
          variables.forEach(v => variableSystem.createVariable(v));
          variableSystem.setTheme(theme);
          
          // Test: resolve all variable references
          const resolved = mergeEngine.mergeClasses([classWithRefs.id]);
          
          // Verify: all references resolve to current theme values
          // ... assertions
          
          // Test: change variable value
          const changedVar = variables[0];
          variableSystem.updateVariable(changedVar.id, {
            value: { ...changedVar.value, [theme]: 'new-value' }
          });
          
          // Verify: references now resolve to new value
          const resolvedAfter = mergeEngine.mergeClasses([classWithRefs.id]);
          // ... assertions
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // ... additional property tests
});
```

#### Custom Arbitraries

We will define custom generators for domain-specific types:

```typescript
// Generate random variables
function arbitraryVariable(): fc.Arbitrary<Omit<Variable, 'id'>> {
  return fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    key: fc.string({ minLength: 1, maxLength: 50 }),
    category: fc.constantFrom('color', 'spacing', 'sizing', 'typography'),
    type: fc.constantFrom('color', 'dimension', 'fontFamily', 'fontSize', 'fontWeight'),
    value: fc.record({
      light: fc.string(),
      dark: fc.string(),
    }),
  });
}

// Generate random style classes
function arbitraryStyleClass(): fc.Arbitrary<Omit<StyleClass, 'id' | 'createdAt' | 'updatedAt'>> {
  return fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.option(fc.string()),
    type: fc.constantFrom('layout', 'utility', 'utility-sub', 'custom'),
    isSystem: fc.boolean(),
    properties: arbitraryClassProperties(),
  });
}

// Generate random class properties
function arbitraryClassProperties(): fc.Arbitrary<ClassProperties> {
  return fc.record({
    flexDirection: fc.option(arbitraryResponsiveValue(fc.constantFrom('row', 'column', 'row-reverse', 'column-reverse'))),
    justifyContent: fc.option(arbitraryResponsiveValue(fc.string())),
    // ... other properties
  });
}

// Generate responsive values
function arbitraryResponsiveValue<T>(valueArb: fc.Arbitrary<T>): fc.Arbitrary<ResponsiveValue<T>> {
  return fc.record({
    desktop: fc.option(valueArb),
    laptop: fc.option(valueArb),
    tablet: fc.option(valueArb),
    mobile: fc.option(valueArb),
  });
}

// Generate variable references
function arbitraryVariableReference(variableIds: string[]): fc.Arbitrary<VariableReference> {
  return fc.record({
    type: fc.constant('variable' as const),
    variableId: fc.constantFrom(...variableIds),
  });
}
```

### Unit Testing

Unit tests will focus on specific functions and edge cases not covered by property tests:

#### Test Coverage

- **Variable System**
  - CRUD operations for variables
  - Theme switching updates all references
  - Variable lookup by key and category
  - Default variable initialization

- **Class Registry**
  - CRUD operations for classes
  - System class initialization
  - Class name validation (alphanumeric, hyphens, underscores, 1-50 chars)
  - Duplicate name prevention
  - System class protection (cannot delete/rename)

- **Merge Engine**
  - Empty class array returns empty styles
  - Single class merge returns that class's properties
  - Responsive value cascading (desktop → laptop → tablet → mobile)
  - Spacing merge with lock/unlock behavior
  - CSS variable generation format
  - Class name generation format

- **Validation Functions**
  - `validateClassName` with valid and invalid names
  - `validatePropertyValue` with various property types
  - `validateClassProperties` for each class type

#### Example Unit Test

```typescript
describe('Class Registry', () => {
  describe('validateClassName', () => {
    it('should accept valid class names', () => {
      expect(validateClassName('my-class')).toBe(true);
      expect(validateClassName('MyClass_123')).toBe(true);
      expect(validateClassName('_private')).toBe(true);
    });
    
    it('should reject invalid class names', () => {
      expect(validateClassName('123-class')).toBe(false); // starts with number
      expect(validateClassName('my class')).toBe(false);  // contains space
      expect(validateClassName('a'.repeat(51))).toBe(false); // too long
      expect(validateClassName('')).toBe(false); // empty
    });
  });
  
  describe('system class protection', () => {
    it('should prevent deletion of system classes', () => {
      expect(() => registry.deleteClass('system-flex')).toThrow(ClassSystemError);
      expect(() => registry.deleteClass('system-grid')).toThrow(ClassSystemError);
    });
    
    it('should prevent renaming of system classes', () => {
      expect(() => registry.updateClass('system-flex', { name: 'CustomFlex' })).toThrow(ClassSystemError);
    });
  });
});
```

### Integration Testing

Integration tests will verify interactions between components:

#### Test Scenarios

1. **End-to-End Class Application**
   - Create variables
   - Create classes referencing variables
   - Apply classes to Container component
   - Verify rendered styles match expected output

2. **Class Editor Workflow**
   - Select a class in the editor
   - Edit properties
   - Verify changes persist to registry
   - Verify Container component updates

3. **Theme Switching**
   - Create classes with variable references
   - Switch theme
   - Verify all components re-render with new theme values

4. **Class Reordering**
   - Apply multiple classes to Container
   - Reorder classes via drag-and-drop
   - Verify computed styles update correctly

5. **Migration**
   - Load legacy Flex component data
   - Trigger migration
   - Verify migrated Container renders identically
   - Verify legacy data converted to classes

6. **Export/Import**
   - Create custom classes
   - Export to JSON
   - Clear registry
   - Import from JSON
   - Verify classes restored correctly

#### Example Integration Test

```typescript
describe('Container Component Integration', () => {
  it('should apply merged classes and render with correct styles', () => {
    // Setup: create variables and classes
    const colorVar = variableSystem.createVariable({
      name: 'Primary Color',
      key: 'color.primary',
      category: 'color',
      type: 'color',
      value: { light: '#f3602a', dark: '#ff7a4d' },
    });
    
    const flexClass = registry.getClass('system-flex');
    const customClass = registry.createClass({
      name: 'CustomSpacing',
      type: 'custom',
      isSystem: false,
      properties: {
        padding: {
          top: { desktop: '16px' },
          right: { desktop: '16px' },
          bottom: { desktop: '16px' },
          left: { desktop: '16px' },
          lock: true,
        },
        backgroundColor: {
          desktop: { type: 'variable', variableId: colorVar.id },
        },
      },
    });
    
    // Render Container with classes
    const { container } = render(
      <Container classIds={[flexClass.id, customClass.id]} items={[]} puck={mockPuckContext} />
    );
    
    // Verify styles applied
    expect(container).toHaveStyle({
      display: 'flex',
      padding: '16px',
      backgroundColor: '#f3602a',
    });
  });
});
```

### Example-Based Testing

Example tests will cover specific user scenarios and edge cases:

#### UI Component Tests

- Class chip rendering and interaction
- Property control rendering with inherited values
- Variable selector dropdown behavior
- Drag-and-drop visual feedback
- Error message display

#### Edge Cases

- Empty class stack
- All classes have empty properties
- Circular variable references (should be prevented)
- Very long class names (at validation limit)
- Maximum number of classes in stack (performance)
- Rapid theme switching
- Concurrent class edits

#### Example Test

```typescript
describe('Class Editor UI', () => {
  it('should display inherited value when editing non-first class', () => {
    const class1 = registry.createClass({
      name: 'Base',
      type: 'custom',
      isSystem: false,
      properties: {
        padding: {
          top: { desktop: '8px' },
          right: { desktop: '8px' },
          bottom: { desktop: '8px' },
          left: { desktop: '8px' },
          lock: true,
        },
      },
    });
    
    const class2 = registry.createClass({
      name: 'Override',
      type: 'custom',
      isSystem: false,
      properties: {},
    });
    
    const { getByText } = render(
      <ClassEditor classIds={[class1.id, class2.id]} activeClassIndex={1} />
    );
    
    // Should show inherited padding value from class1
    expect(getByText(/inherited.*8px/i)).toBeInTheDocument();
  });
});
```

### Performance Testing

Performance tests will ensure the system remains responsive:

#### Benchmarks

- Merge 10 classes: < 10ms
- Merge 50 classes: < 50ms
- Cache hit: < 1ms
- Variable resolution: < 1ms per variable
- Class lookup: < 1ms
- Full Container render with 10 classes: < 100ms

#### Load Testing

- 100 classes in registry
- 50 variables
- 20 classes applied to single Container
- Rapid property edits (10 per second)
- Theme switching every second

### Test Organization

```
src/lib/client/class-system/
├── __tests__/
│   ├── variable-system.test.ts          # Unit tests
│   ├── class-registry.test.ts           # Unit tests
│   ├── merge-engine.test.ts             # Unit tests
│   ├── merge-engine.property.test.ts    # Property tests
│   ├── validation.test.ts               # Unit tests
│   └── integration.test.ts              # Integration tests
│
src/components/client/website/pages/components/ClassEditor/
├── __tests__/
│   ├── ClassEditor.test.tsx             # UI component tests
│   ├── ClassChip.test.tsx               # UI component tests
│   ├── PropertyControl.test.tsx         # UI component tests
│   └── VariableSelector.test.tsx        # UI component tests
│
src/components/client/website/pages/blocks/Container/
├── __tests__/
│   ├── Container.test.tsx               # Component tests
│   ├── Container.integration.test.tsx   # Integration tests
│   └── migration.test.ts                # Migration tests
```

### Continuous Integration

All tests will run on every commit:

- Unit tests: ~2-5 minutes
- Property tests: ~5-10 minutes (100 iterations each)
- Integration tests: ~3-5 minutes
- Total CI time: ~15-20 minutes

### Test Coverage Goals

- **Core algorithms**: 100% line coverage (merge engine, variable resolution)
- **Registry and validation**: 95% line coverage
- **UI components**: 80% line coverage (focus on logic, not styling)
- **Overall project**: 85% line coverage

