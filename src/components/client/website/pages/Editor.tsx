import { EditorProvider } from "@components/client/website/pages/editor/core/editorProvider";
import { useEditor } from "@components/client/website/pages/editor/core/useEditor";
import EditorLayout from "@components/client/website/pages/editor/ui/EditorLayout";
import LoadingState from "@components/client/website/pages/editor/ui/LoadingState";
import ErrorState from "@components/client/website/pages/editor/ui/ErrorState";
import "@puckeditor/core/puck.css";
import "@/assets/css/global.css";
export default function Editor() {
  const editor = useEditor();

  if (editor.loading) return <LoadingState />;
  if (editor.error) return <ErrorState message={editor.error} />;

  return (
    <EditorProvider value={editor}>
      <EditorLayout />
    </EditorProvider>
  );
}