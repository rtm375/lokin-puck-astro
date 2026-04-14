import { createContext, useContext } from "react";

export const EditorContext = createContext<any>(null);

export const EditorProvider = EditorContext.Provider;

export const useEditorContext = () => useContext(EditorContext);