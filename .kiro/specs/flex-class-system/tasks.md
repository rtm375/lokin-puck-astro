# Implementation Plan: Flex Class System

## Overview

This plan implements a class-based styling system for the Container component (replacing Flex), enabling designers to create reusable, composable style classes with variable support, theme switching, and predictable override behavior. The implementation follows a bottom-up approach: database schema → Zustand stores → core algorithms → UI components → Container component → migration.

## Tasks

- [x] 1. Set up database schema and API endpoints
  - Create `variables` and `style_classes` tables with RLS policies
  - Create API endpoints for CRUD operations on both tables
  - Add database indexes for performance
  - Test RLS policies ensure proper website-scoped access
  - _Requirements: 1.5, 2.5, 20.4_

- [-] 2. Implement Variable System
  - [x] 2.1 Create Variable System Zustand store
    - Create `src/stores/useVariableStore.ts` with state and actions
    - Implement CRUD functions (create, update, delete, list)
    - Implement theme management (getCurrentTheme, setTheme)
    - Implement value resolution (resolveValue, resolveVariable)
    - Add website scoping and initialization logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 2.2 Write property test for variable resolution consistency
    - **Property 1: Variable Resolution Consistency**
    - **Validates: Requirements 1.2, 1.5, 3.4, 12.3**
  
  - [ ]* 2.3 Write unit tests for Variable System
    - Test CRUD operations
    - Test theme switching
    - Test variable lookup by key and category
    - Test default variable initialization
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Implement Class Registry
  - [x] 3.1 Create Class Registry Zustand store
    - Create `src/stores/useClassRegistryStore.ts` with state and actions
    - Implement CRUD functions for style classes
    - Implement lookup functions (getClass, getClassByName, listClasses)
    - Implement validation functions (validateClassName, validateClassProperties)
    - Add computed style caching with Map
    - Add website scoping and initialization logic
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 3.2 Implement system class initialization
    - Create pre-registered Flex and Grid layout classes
    - Implement initializeSystemClasses function
    - Add system class protection (prevent delete/rename)
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 3.3 Write property test for system class protection
    - **Property 8: System Class Protection**
    - **Validates: Requirements 8.3**
  
  - [ ]* 3.4 Write unit tests for Class Registry
    - Test CRUD operations
    - Test class name validation
    - Test duplicate name prevention
    - Test system class protection
    - Test lookup functions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.3_

- [x] 4. Implement Merge Engine
  - [x] 4.1 Create merge engine core functions
    - Create `src/lib/client/class-system/merge-engine.ts`
    - Implement mergeClasses function with left-to-right override
    - Implement mergeClassesUpTo for inherited value computation
    - Implement variable reference resolution during merge
    - Implement responsive value merging at breakpoint level
    - Implement spacing merge with edge-level granularity
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 13.1, 13.2, 13.3_
  
  - [x] 4.2 Implement CSS generation from merged styles
    - Implement convertToComputedStyles function
    - Integrate with existing getResponsiveCSS utility
    - Generate CSS custom properties for responsive values
    - Generate utility class names
    - _Requirements: 3.5, 12.4_
  
  - [x] 4.3 Add computed getters to Class Registry store
    - Implement getComputedStyles with caching
    - Implement getLayoutMode to detect active layout class
    - Implement getInheritedValue for property inheritance display
    - Implement automatic cache invalidation on updates
    - _Requirements: 6.1, 6.2, 6.3, 20.1, 20.2_
  
  - [ ]* 4.4 Write property test for class merge override order
    - **Property 2: Class Merge Override Order**
    - **Validates: Requirements 3.1, 3.2, 3.3, 12.2**
  
  - [ ]* 4.5 Write property test for inherited value computation
    - **Property 3: Inherited Value Computation**
    - **Validates: Requirements 6.1, 6.2**
  
  - [ ]* 4.6 Write property test for graceful class resolution
    - **Property 4: Graceful Class Resolution**
    - **Validates: Requirements 12.1, 12.5, 21.1**
  
  - [ ]* 4.7 Write property test for invalid variable fallback
    - **Property 5: Invalid Variable Fallback**
    - **Validates: Requirements 21.2**
  
  - [ ]* 4.8 Write property test for responsive value merging
    - **Property 10: Responsive Value Merging**
    - **Validates: Requirements 13.1, 13.2, 13.3**
  
  - [ ]* 4.9 Write property test for theme-aware variable resolution
    - **Property 11: Theme-Aware Variable Resolution**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**
  
  - [ ]* 4.10 Write property test for cache invalidation correctness
    - **Property 14: Cache Invalidation Correctness**
    - **Validates: Requirements 20.2**
  
  - [ ]* 4.11 Write unit tests for Merge Engine
    - Test empty class array returns empty styles
    - Test single class merge
    - Test responsive value cascading
    - Test spacing merge with lock/unlock
    - Test CSS variable generation format
    - Test class name generation format
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 13.3_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Class Editor UI Components
  - [x] 6.1 Create ClassChip component
    - Create `src/components/client/website/pages/components/ClassEditor/ClassChip.tsx`
    - Implement visual representation of active class
    - Add drag-and-drop handlers
    - Add remove button
    - Add active state styling
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [x] 6.2 Create ClassChipStack component
    - Create `src/components/client/website/pages/components/ClassEditor/ClassChipStack.tsx`
    - Implement horizontal chip layout
    - Implement drag-and-drop reordering with drop indicators
    - Handle class order updates
    - _Requirements: 4.1, 4.2, 4.4, 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [x] 6.3 Create LayoutClassSelector component
    - Create `src/components/client/website/pages/components/ClassEditor/LayoutClassSelector.tsx`
    - Implement dropdown for Flex/Grid selection
    - Implement layout class switching logic (remove old, add new)
    - _Requirements: 8.4, 10.1, 10.2, 10.3_
  
  - [x] 6.4 Create VariableSelector component
    - Create `src/components/client/website/pages/components/ClassEditor/VariableSelector.tsx`
    - Implement dropdown with variables grouped by category
    - Implement variable selection and custom value toggle
    - Display current resolved value for selected variable
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 6.5 Create PropertyControl component
    - Create `src/components/client/website/pages/components/ClassEditor/PropertyControl.tsx`
    - Display property label and current value
    - Display inherited value preview from previous layers
    - Integrate VariableSelector for variable-capable properties
    - Add reset button to remove override
    - Visually distinguish inherited vs overridden values
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 6.6 Create PropertyPanel component
    - Create `src/components/client/website/pages/components/ClassEditor/PropertyPanel.tsx`
    - Implement dynamic property groups based on active layout class
    - Show flex-specific properties when Flex is active
    - Show grid-specific properties when Grid is active
    - Show common properties (margin, padding, sizing) always
    - Integrate existing ResponsiveControls components
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 6.7 Create ClassTopBar component
    - Create `src/components/client/website/pages/components/ClassEditor/ClassTopBar.tsx`
    - Integrate LayoutClassSelector
    - Integrate ClassChipStack
    - Add "Add Class" button with class creation dialog
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 16.1, 16.2_
  
  - [x] 6.8 Create main ClassEditor component
    - Create `src/components/client/website/pages/components/ClassEditor/ClassEditor.tsx`
    - Integrate ClassTopBar and PropertyPanel
    - Create ClassEditorStore for UI state (activeClassIndex, activeBreakpoint, draggingClassIndex)
    - Handle class selection and property editing
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 6.9 Write property test for property edit scoping
    - **Property 6: Property Edit Scoping**
    - **Validates: Requirements 5.3, 5.5**
  
  - [ ]* 6.10 Write property test for variable reference storage
    - **Property 7: Variable Reference Storage**
    - **Validates: Requirements 7.3**
  
  - [ ]* 6.11 Write property test for layout class exclusivity
    - **Property 9: Layout Class Exclusivity**
    - **Validates: Requirements 8.4**
  
  - [ ]* 6.12 Write unit tests for Class Editor UI components
    - Test ClassChip rendering and interaction
    - Test drag-and-drop visual feedback
    - Test inherited value display in PropertyControl
    - Test VariableSelector dropdown behavior
    - Test PropertyPanel dynamic property display
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 7. Implement Container Component
  - [x] 7.1 Create Container component
    - Create `src/components/client/website/pages/blocks/Container/Container.tsx`
    - Accept classIds array and items slot as props
    - Use getComputedStyles from ClassRegistryStore
    - Render with computed CSS variables and class names
    - Set default classIds to ['system-flex']
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 7.2 Integrate ClassEditor as Puck field
    - Create custom field render function for classIds
    - Integrate ClassEditor component into Puck field system
    - Handle field value updates
    - _Requirements: 11.2_
  
  - [x] 7.3 Implement legacy Flex migration in resolveData
    - Detect legacy frame-based configuration
    - Convert legacy props to class definition
    - Create "Legacy" custom class with converted properties
    - Set up class stack with [system-flex, legacy-class]
    - Remove legacy props after migration
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [x] 7.4 Update block registry and types
    - Update `src/components/client/website/pages/blocks/index.ts` to export Container
    - Update `@blockTypes` to include Container props
    - Mark Flex component as deprecated (keep for backward compatibility)
    - _Requirements: 11.1_
  
  - [ ]* 7.5 Write property test for migration style equivalence
    - **Property 12: Migration Style Equivalence**
    - **Validates: Requirements 18.2**
  
  - [ ]* 7.6 Write integration tests for Container component
    - Test Container applies merged classes correctly
    - Test Container re-renders when classes change
    - Test Container with empty class stack
    - Test Container with invalid class IDs
    - Test legacy migration produces equivalent styles
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5, 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Class Management Features
  - [x] 9.1 Implement class creation dialog
    - Create dialog component for new class creation
    - Prompt for class name and optional description
    - Validate class name uniqueness
    - Initialize new class with current computed values as defaults
    - Add newly created class to active class stack
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_
  
  - [x] 9.2 Implement class export functionality
    - Create export function in ClassRegistryStore
    - Serialize all class definitions to JSON
    - Preserve variable references during export
    - Add UI button to trigger export
    - _Requirements: 19.1, 19.3, 19.5_
  
  - [x] 9.3 Implement class import functionality
    - Create import function in ClassRegistryStore
    - Deserialize and validate class definitions from JSON
    - Handle name conflicts with user prompt
    - Validate imported classes against schema
    - Add UI button to trigger import
    - _Requirements: 19.2, 19.3, 19.4, 19.5_
  
  - [ ]* 9.4 Write property test for export-import round-trip
    - **Property 13: Export-Import Round-Trip**
    - **Validates: Requirements 19.1, 19.2, 19.4**
  
  - [ ]* 9.5 Write integration tests for class management
    - Test class creation workflow
    - Test export produces valid JSON
    - Test import restores classes correctly
    - Test import handles name conflicts
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 19.1, 19.2, 19.3, 19.4, 19.5_

- [x] 10. Implement Error Handling and Validation
  - [x] 10.1 Create error factory and error codes
    - Create `src/lib/client/class-system/errors.ts`
    - Define ErrorCode enum
    - Implement createClassSystemError factory function
    - Implement isClassSystemError type guard
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_
  
  - [x] 10.2 Add validation functions
    - Implement validateClassName with regex
    - Implement validatePropertyValue with type checking
    - Implement validateClassProperties for each class type
    - Add inline error messages in ClassEditor
    - _Requirements: 21.3, 21.4_
  
  - [x] 10.3 Add error handling to merge engine
    - Handle missing class IDs with warning and skip
    - Handle invalid variable references with fallback
    - Log errors with context
    - Return empty computed styles on merge failure
    - _Requirements: 21.1, 21.2, 21.5_
  
  - [ ]* 10.4 Write unit tests for validation functions
    - Test validateClassName with valid and invalid names
    - Test validatePropertyValue with various property types
    - Test validateClassProperties for each class type
    - Test error factory creates correct error objects
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

- [ ] 11. Implement Debugging and Developer Tools
  - [ ] 11.1 Add debug mode to merge engine
    - Implement explainProperty function
    - Implement getDebugTrace function
    - Add debug logging for each merge step
    - Enable via environment variable or dev tools
    - _Requirements: 22.1, 22.2, 22.4_
  
  - [ ] 11.2 Create ComputedStylesDebugPanel component
    - Create `src/components/client/website/pages/components/ClassEditor/ComputedStylesDebugPanel.tsx`
    - Display final merged result
    - Highlight which class contributed each property
    - Show only in dev mode
    - _Requirements: 22.2, 22.3_
  
  - [ ]* 11.3 Write integration tests for debugging tools
    - Test explainProperty returns correct contributing class
    - Test getDebugTrace shows all merge steps
    - Test ComputedStylesDebugPanel displays correctly
    - _Requirements: 22.1, 22.2, 22.3, 22.4_

- [x] 12. Add Documentation and Default Content
  - [x] 12.1 Create default variables
    - Define default color variables (primary, secondary, neutral)
    - Define default spacing variables (xs, s, m, l, xl)
    - Define default sizing variables (container widths)
    - Define default typography variables (font families, sizes)
    - Implement initialization on first website load
    - _Requirements: 23.3_
  
  - [x] 12.2 Create example classes
    - Create "Centered Column" example class
    - Create "Spaced Row" example class
    - Create "Grid Gallery" example class
    - Create "Card Container" example class
    - Add to system class initialization
    - _Requirements: 23.2_
  
  - [x] 12.3 Add inline help and tooltips
    - Add help text for each property in PropertyControl
    - Add tooltips explaining inheritance and override behavior
    - Add tooltips for variable selector
    - Add help text for layout class selector
    - _Requirements: 23.1, 23.4_

- [x] 13. Final Integration and Testing
  - [x] 13.1 Wire up stores to website context
    - Initialize VariableStore when website loads
    - Initialize ClassRegistryStore when website loads
    - Load variables and classes from database
    - Initialize system classes if not present
    - _Requirements: 1.5, 2.5, 8.1, 8.2_
  
  - [x] 13.2 Add store reset on website switch
    - Clear VariableStore when switching websites
    - Clear ClassRegistryStore when switching websites
    - Reload data for new website
    - _Requirements: 1.5, 2.5_
  
  - [ ]* 13.3 Write end-to-end integration tests
    - Test complete class application workflow
    - Test class editor workflow with persistence
    - Test theme switching updates all components
    - Test class reordering via drag-and-drop
    - Test migration from legacy Flex
    - Test export and import workflow
    - _Requirements: All requirements_
  
  - [ ]* 13.4 Write performance tests
    - Benchmark merge with 10 classes (< 10ms)
    - Benchmark merge with 50 classes (< 50ms)
    - Benchmark cache hit (< 1ms)
    - Test with 100 classes in registry
    - Test with 50 variables
    - Test rapid property edits (10 per second)
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- Checkpoints ensure incremental validation
- Implementation follows bottom-up approach: data layer → stores → algorithms → UI → integration
- All state management uses Zustand stores with computed getters for caching
- No useMemo in components - all memoization handled by Zustand stores
- Database tables scoped to website_id, not user_id
- System classes (Flex, Grid) are pre-registered and protected from deletion/rename
- Legacy Flex components automatically migrate to Container on load
