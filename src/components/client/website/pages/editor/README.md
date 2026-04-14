# Editor Module Structure

The Editor component has been refactored into modular, focused pieces for better maintainability and testability.

## Directory Structure

```
editor/
├── core/                          # Core editor logic and hooks
│   ├── EditorProvider.tsx         # Context provider for editor state
│   ├── UseEditor.tsx              # Main editor hook (existing)
│   ├── useEditorState.ts          # State management (data, saving, changes)
│   ├── useEditorSetup.ts          # Data loading and initialization
│   └── useEditorPublish.ts        # Publishing logic
├── data/                          # Data loading and persistence
│   ├── UseEditorLoader.tsx        # Data loader hook (existing)
│   └── useEditorPersistence.ts    # Local storage persistence (existing)
├── publish/                       # Publishing utilities
│   ├── generateCss.ts             # CSS generation (existing)
│   └── publishPage.ts             # API publishing (existing)
├── puck/                          # Puck editor configuration
│   ├── blocks/                    # Block definitions
│   ├── components/                # Editor UI components
│   ├── config/                    # Editor configuration
│   ├── overrides/                 # Puck editor overrides
│   └── plugins/                   # Editor plugins
└── ui/                            # UI components
    ├── SettingsPanel.tsx          # Settings panel component
    ├── EditorPlugins.tsx          # Plugin configuration
    ├── EditorViewports.tsx        # Viewport configuration
    ├── EditorLoadingState.tsx      # Loading/error states
    └── PuckEditorContainer.tsx     # Main Puck editor wrapper
```

## Key Modules

### Core Hooks

**useEditorState.ts**
- Manages editor state: initialData, isSaving, hasUnsavedChanges
- Handles local storage debouncing
- Provides change handlers and cleanup

**useEditorSetup.ts**
- Loads websites and pages from stores
- Fetches editor data from database
- Handles local storage recovery
- Returns setup metadata (websiteId, pageId, etc.)

**useEditorPublish.ts**
- Handles publish workflow
- Generates CSS and saves to API
- Manages success/error callbacks
- Clears local storage on success

### UI Components

**SettingsPanel.tsx**
- Displays element settings
- Provides back navigation to blocks panel

**EditorLoadingState.tsx**
- Shows loading spinner
- Displays error messages
- Provides navigation back to dashboard

**PuckEditorContainer.tsx**
- Wraps Puck editor with configuration
- Passes all necessary props
- Manages viewport and plugin setup

### Configuration

**EditorPlugins.tsx**
- Centralizes plugin configuration
- Includes Settings, Layer, Variables, Classes plugins

**EditorViewports.tsx**
- Re-exports viewport configuration from puck/config

## Main Component Flow

```
Editor.tsx
├── useEditorState()           → Manages local state
├── useEditorSetup()           → Loads data
├── useEditorPublish()         → Handles publishing
├── EditorLoadingState         → Shows loading/errors
└── PuckEditorContainer        → Renders editor
    └── EditorContext.Provider → Provides context to overrides
```

## Usage

The main `Editor.tsx` component orchestrates all modules:

```tsx
export default function PuckEditor() {
  const editorState = useEditorState("");
  const setupResult = useEditorSetup(...);
  const { handlePublish } = useEditorPublish({...});
  
  return (
    <EditorContext.Provider value={{...}}>
      <PuckEditorContainer {...} />
    </EditorContext.Provider>
  );
}
```

## Benefits

- **Separation of Concerns**: Each module has a single responsibility
- **Testability**: Hooks and components can be tested independently
- **Reusability**: Hooks can be used in other components
- **Maintainability**: Easier to locate and modify specific functionality
- **Scalability**: Easy to add new features without bloating main component
