# Requirements Document

## Introduction

This document specifies requirements for refactoring the Flex component into a generic Container component with a class-based styling system. The Container component uses a Mosaic or Elementor style class system with inheritance, variables, and layered styling. The component's behavior (flex vs grid layout) is determined by which pre-registered layout class is applied. The new system will enable designers to create reusable, composable style classes that stack and override in a predictable manner, similar to CSS cascade behavior.

## Glossary

- **Class_System**: The core styling architecture that manages class definitions, inheritance, and resolution
- **Style_Class**: A named collection of partial style properties that can be applied to components
- **Class_Layer**: A single class in an ordered stack, where later layers override earlier ones
- **Variable_System**: A global token system for managing design values (colors, spacing, sizing, typography)
- **Theme**: A collection of variable values for a specific context (e.g., light mode, dark mode)
- **Class_Registry**: The storage and lookup system for all defined style classes
- **Merge_Engine**: The algorithm that combines multiple classes in order to produce final styles
- **Class_Editor**: The UI component for editing properties within a specific class scope
- **Class_Chip**: A visual representation of an active class in the top bar UI
- **Computed_Value**: The inherited value from previous class layers shown as preview in the editor
- **Override**: A property value explicitly set in a class that replaces the computed value
- **Container_Component**: The generic layout component that supports both flex and grid layouts via class system
- **Layout_Class**: A pre-registered class (Flex or Grid) that determines the layout mode and available properties
- **Property_Panel**: The dynamic UI that displays different property controls based on the active layout class

## Requirements

### Requirement 1: Variable System Foundation

**User Story:** As a designer, I want a global variable system for design tokens, so that I can maintain consistent styling across all components and themes.

#### Acceptance Criteria

1. THE Variable_System SHALL organize variables into themes (light, dark) and categories (color, spacing, sizing, typography)
2. WHEN a variable value is changed, THE Variable_System SHALL update all references globally
3. THE Variable_System SHALL support custom variable creation with user-defined names and values
4. THE Variable_System SHALL store variable definitions in a structured format with theme and category metadata
5. THE Variable_System SHALL provide a lookup function that resolves variable references to their current values

### Requirement 2: Class Registry and Storage

**User Story:** As a developer, I want a class registry that stores and manages style class definitions, so that classes can be reused across components.

#### Acceptance Criteria

1. THE Class_Registry SHALL store style classes as partial style objects with unique identifiers
2. THE Class_Registry SHALL support class types: element (flex, grid), subclass (row, column), utility (gap, padding), utility subclass (gap-s, gap-m), and custom (user-defined)
3. WHEN a class is created, THE Class_Registry SHALL assign it a unique identifier and store its properties
4. THE Class_Registry SHALL provide lookup functions to retrieve class definitions by identifier or name
5. THE Class_Registry SHALL persist class definitions across editor sessions
6. THE Class_Registry SHALL pre-register "Flex" and "Grid" as layout classes with their respective property sets

### Requirement 3: Class Merge Engine

**User Story:** As a designer, I want classes to stack and override in a predictable order, so that I can compose complex styles from simple building blocks.

#### Acceptance Criteria

1. WHEN multiple classes are applied, THE Merge_Engine SHALL combine them in left-to-right order
2. THE Merge_Engine SHALL compute the final style by merging each class layer sequentially
3. WHEN a property exists in multiple classes, THE Merge_Engine SHALL use the value from the rightmost class
4. THE Merge_Engine SHALL resolve variable references to their current values during merge
5. THE Merge_Engine SHALL produce a final style object compatible with React inline styles and CSS classes

### Requirement 4: Class Layering UI

**User Story:** As a designer, I want to see active classes as stacked chips in the top bar, so that I understand which classes are applied and their priority order.

#### Acceptance Criteria

1. THE Class_Editor SHALL display active classes as Class_Chip components in the top bar
2. THE Class_Editor SHALL order chips from left to right matching the priority order
3. WHEN a chip is clicked, THE Class_Editor SHALL activate that class for editing
4. THE Class_Editor SHALL support reordering chips via drag-and-drop to change priority
5. THE Class_Editor SHALL support removing classes by clicking a remove button on each chip

### Requirement 5: Scoped Property Editing

**User Story:** As a designer, I want to edit properties within a specific class scope, so that I can override values without affecting other classes.

#### Acceptance Criteria

1. WHEN a class is selected, THE Class_Editor SHALL display all editable properties for that class
2. THE Class_Editor SHALL show computed values from previous class layers as preview text
3. WHEN a property is edited, THE Class_Editor SHALL store the override only in the active class
4. THE Class_Editor SHALL visually distinguish between inherited values and overridden values
5. THE Class_Editor SHALL support resetting a property to its computed value by removing the override

### Requirement 6: Property Inheritance Display

**User Story:** As a designer, I want to see inherited values from previous classes, so that I understand what I'm overriding.

#### Acceptance Criteria

1. WHEN editing a class, THE Class_Editor SHALL compute and display the inherited value for each property
2. THE Computed_Value SHALL reflect the merged result of all previous class layers
3. THE Class_Editor SHALL update computed values in real-time when previous classes change
4. THE Class_Editor SHALL show "No inherited value" when a property has no value from previous layers
5. THE Class_Editor SHALL display computed values in a visually distinct style (e.g., lighter text, italic)

### Requirement 7: Variable Integration in Properties

**User Story:** As a designer, I want to use variables or custom values for any property, so that I can choose between global tokens and specific values.

#### Acceptance Criteria

1. THE Class_Editor SHALL provide a variable selector for each property that supports variables
2. THE Class_Editor SHALL display available variables grouped by category
3. WHEN a variable is selected, THE Class_Editor SHALL store the variable reference (not the resolved value)
4. THE Class_Editor SHALL support switching between variable mode and custom value mode
5. THE Class_Editor SHALL display the current resolved value when a variable is selected

### Requirement 8: Pre-registered Layout Classes

**User Story:** As a designer, I want pre-registered Flex and Grid layout classes, so that I can switch between different layout modes with appropriate property sets.

#### Acceptance Criteria

1. THE Class_Registry SHALL pre-register a "Flex" layout class with flex-specific properties (flex-direction, justify-content, align-items, flex-wrap, gap)
2. THE Class_Registry SHALL pre-register a "Grid" layout class with grid-specific properties (grid-template-columns, grid-template-rows, grid-gap, justify-items, align-items)
3. THE Class_Registry SHALL mark "Flex" and "Grid" as layout classes that cannot be deleted or renamed
4. WHEN a layout class is applied, THE Class_System SHALL replace any existing layout class (only one layout class active at a time)
5. THE Container_Component SHALL use "flex" as the default layout class when no layout class is specified

### Requirement 9: Dynamic Property Panel Based on Layout Class

**User Story:** As a designer, I want the property panel to show different controls based on whether Flex or Grid class is active, so that I only see relevant properties for the current layout mode.

#### Acceptance Criteria

1. WHEN "Flex" class is active, THE Property_Panel SHALL display flex-specific property controls (flex-direction, justify-content, align-items, flex-wrap, gap)
2. WHEN "Grid" class is active, THE Property_Panel SHALL display grid-specific property controls (grid-template-columns, grid-template-rows, grid-gap, justify-items, align-items)
3. THE Property_Panel SHALL detect the active layout class from the class stack
4. THE Property_Panel SHALL update displayed controls in real-time when the layout class changes
5. THE Property_Panel SHALL display common properties (margin, padding, width, height) regardless of active layout class

### Requirement 10: Layout Class Switching

**User Story:** As a designer, I want to switch between Flex and Grid layout classes, so that I can change the layout behavior of my Container.

#### Acceptance Criteria

1. THE Class_Editor SHALL provide a layout class selector in the top bar
2. WHEN a different layout class is selected, THE Class_Editor SHALL remove the current layout class from the class stack
3. WHEN a different layout class is selected, THE Class_Editor SHALL add the new layout class to the class stack
4. THE Property_Panel SHALL immediately update to show properties for the new layout class
5. THE Container_Component SHALL re-render with the new layout behavior

### Requirement 11: Container Component as Generic Layout Component

**User Story:** As a developer, I want the Container component implemented as a generic layout component, so that it can support both flex and grid layouts through the class system and serve as a reusable pattern for other components.

#### Acceptance Criteria

1. THE Container_Component SHALL replace the current Flex component implementation
2. THE Container_Component SHALL accept an ordered array of class identifiers as its primary configuration
3. THE Container_Component SHALL use the Merge_Engine to resolve final styles from class identifiers
4. THE Container_Component SHALL render with the computed styles applied to the DOM element
5. WHEN first added to the canvas, THE Container_Component SHALL have "flex" as its default class

### Requirement 12: Class Resolution Pipeline

**User Story:** As a developer, I want a clear resolution pipeline from class identifiers to rendered styles, so that the system behavior is predictable and debuggable.

#### Acceptance Criteria

1. WHEN the Container_Component renders, THE Merge_Engine SHALL resolve each class identifier to its definition
2. THE Merge_Engine SHALL merge class definitions in the order specified by the class identifier array
3. THE Merge_Engine SHALL resolve all variable references to their current theme values
4. THE Merge_Engine SHALL produce a final style object containing only concrete CSS values
5. THE Merge_Engine SHALL handle missing class definitions gracefully by skipping them with a warning

### Requirement 13: Responsive Class Support

**User Story:** As a designer, I want classes to support responsive breakpoints, so that I can define different styles for mobile, tablet, and desktop.

#### Acceptance Criteria

1. THE Class_System SHALL support breakpoint-specific property values within each class
2. THE Class_System SHALL use the existing breakpoint system (desktop, tablet, mobile)
3. WHEN merging classes, THE Merge_Engine SHALL preserve breakpoint-specific values
4. THE Class_Editor SHALL provide breakpoint toggles for editing responsive values
5. THE Merge_Engine SHALL generate responsive CSS using the existing getResponsiveCSS utility

### Requirement 14: Class Type Hierarchy

**User Story:** As a designer, I want different class types (element, utility, custom) to have appropriate defaults and constraints, so that the system guides me toward good practices.

#### Acceptance Criteria

1. THE Class_Registry SHALL enforce that element classes (flex, grid) define base layout properties
2. THE Class_Registry SHALL allow utility classes to define single-purpose properties (e.g., gap-s only defines gap)
3. THE Class_Registry SHALL allow custom classes to define any combination of properties
4. THE Class_Registry SHALL provide default values for element classes based on the component type
5. THE Class_Registry SHALL validate that utility subclasses inherit from their parent utility class

### Requirement 15: Class Reordering and Priority

**User Story:** As a designer, I want to reorder classes to change their priority, so that I can control which overrides take precedence.

#### Acceptance Criteria

1. WHEN a class chip is dragged, THE Class_Editor SHALL show a drop indicator at valid positions
2. WHEN a class chip is dropped, THE Class_Editor SHALL update the class order in the component configuration
3. THE Merge_Engine SHALL immediately recompute styles using the new class order
4. THE Class_Editor SHALL update all computed value previews to reflect the new order
5. THE Container_Component SHALL re-render with the updated styles

### Requirement 16: Class Creation and Management

**User Story:** As a designer, I want to create new custom classes from the editor, so that I can save and reuse style combinations.

#### Acceptance Criteria

1. THE Class_Editor SHALL provide a "Create Class" button that opens a class creation dialog
2. WHEN creating a class, THE Class_Editor SHALL prompt for a class name and optional description
3. THE Class_Editor SHALL initialize the new class with the current computed values as defaults
4. THE Class_Registry SHALL validate that class names are unique and follow naming conventions
5. THE Class_Editor SHALL add the newly created class to the active class stack

### Requirement 17: Variable Theme Switching

**User Story:** As a designer, I want to switch between themes (light/dark), so that I can preview how my design looks in different contexts.

#### Acceptance Criteria

1. THE Variable_System SHALL support multiple themes with independent variable values
2. THE Variable_System SHALL provide a theme selector in the editor UI
3. WHEN the theme is changed, THE Variable_System SHALL update all variable references to use the new theme values
4. THE Merge_Engine SHALL recompute all styles using the new theme values
5. THE Container_Component SHALL re-render with the updated theme-specific styles

### Requirement 18: Migration from Current Implementation

**User Story:** As a developer, I want existing Flex components to migrate to the Container component with class system automatically, so that no manual data migration is required.

#### Acceptance Criteria

1. THE Container_Component SHALL detect legacy prop-based configurations during resolveData
2. WHEN legacy props are detected, THE Container_Component SHALL convert them to equivalent class definitions
3. THE Container_Component SHALL create a "Legacy" custom class containing the converted properties
4. THE Container_Component SHALL add the Legacy class to the class stack with "flex" as the default base class
5. THE Container_Component SHALL remove legacy props from the component data after migration

### Requirement 19: Class Export and Import

**User Story:** As a designer, I want to export and import class definitions, so that I can share style systems across projects.

#### Acceptance Criteria

1. THE Class_Registry SHALL provide an export function that serializes all class definitions to JSON
2. THE Class_Registry SHALL provide an import function that deserializes and validates class definitions
3. WHEN importing classes, THE Class_Registry SHALL handle name conflicts by prompting for resolution
4. THE Class_Registry SHALL validate imported class definitions against the schema
5. THE Class_Registry SHALL preserve variable references during export and import

### Requirement 20: Performance Optimization

**User Story:** As a developer, I want the class resolution to be performant, so that the editor remains responsive with many classes.

#### Acceptance Criteria

1. THE Merge_Engine SHALL cache resolved styles for unchanged class combinations
2. THE Merge_Engine SHALL invalidate cache entries when class definitions or variables change
3. THE Merge_Engine SHALL compute style merges in O(n) time where n is the number of classes
4. THE Class_Registry SHALL use efficient lookup structures (Map or object) for class retrieval
5. THE Container_Component SHALL avoid unnecessary re-renders when class order or definitions haven't changed

### Requirement 21: Error Handling and Validation

**User Story:** As a designer, I want clear error messages when class configuration is invalid, so that I can fix issues quickly.

#### Acceptance Criteria

1. WHEN a class identifier references a non-existent class, THE Merge_Engine SHALL log a warning and skip that class
2. WHEN a variable reference is invalid, THE Merge_Engine SHALL log a warning and use a fallback value
3. THE Class_Editor SHALL validate property values before saving and show inline error messages
4. THE Class_Registry SHALL validate class definitions on creation and reject invalid schemas
5. THE Variable_System SHALL validate variable values match their expected type (color, spacing, etc.)

### Requirement 22: Developer Tools and Debugging

**User Story:** As a developer, I want debugging tools to inspect class resolution, so that I can troubleshoot styling issues.

#### Acceptance Criteria

1. THE Merge_Engine SHALL provide a debug mode that logs each merge step
2. THE Class_Editor SHALL display a "Computed Styles" panel showing the final merged result
3. THE Class_Editor SHALL highlight which class contributed each property in the final result
4. THE Merge_Engine SHALL provide a function to explain why a property has a specific value
5. THE Class_System SHALL integrate with React DevTools for component inspection

### Requirement 23: Documentation and Examples

**User Story:** As a designer, I want documentation and examples for the class system, so that I can learn how to use it effectively.

#### Acceptance Criteria

1. THE Class_System SHALL include inline help text for each property in the editor
2. THE Class_Registry SHALL provide example classes for common patterns (centered column, spaced row, grid gallery, etc.)
3. THE Variable_System SHALL include a default theme with sensible variable values
4. THE Class_Editor SHALL provide tooltips explaining inheritance and override behavior
5. THE Class_System SHALL include a tutorial mode that guides users through creating their first custom class
