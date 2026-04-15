import { Puck } from "@puckeditor/core";
import { useEditorContext } from "@/components/client/website/pages/editor/core/editorProvider";
import { useConfig } from "@/components/client/website/pages/editor/puck/config";
import { staticOverrides } from "@/components/client/website/pages/editor/puck/overrides";
import { PUCK_VIEWPORTS } from "@/components/client/website/pages/editor/puck/config/viewports";
import plugins from "@/components/client/website/pages/editor/puck/plugins";
import { ConflictDialog } from "@/components/client/ConflictDialog";

export default function EditorLayout() {
  const {
    data,
    handleChange,
    handlePublish,
    showConflictDialog,
    setShowConflictDialog,
    handleReload,
  } = useEditorContext();
  const config = useConfig();

  return (
    <>
      <Puck
        _experimentalFullScreenCanvas
        config={config}
        data={data}
        onChange={handleChange}
        onPublish={handlePublish}
        overrides={staticOverrides}
        viewports={PUCK_VIEWPORTS}
        plugins={plugins}
      />

      <ConflictDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        onReload={handleReload}
        onOverwrite={() => handlePublish(data, true)}
      />
    </>
  );
}