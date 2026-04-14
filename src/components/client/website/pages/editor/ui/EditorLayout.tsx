import { Puck } from "@puckeditor/core";
import { useEditorContext } from "@/components/client/website/pages/editor/core/editorProvider";
import { useConfig } from "@/components/client/website/pages/editor/puck/config";
import { staticOverrides } from "@/components/client/website/pages/editor/puck/overrides";
import { PUCK_VIEWPORTS } from "@/components/client/website/pages/editor/puck/config/viewports";
import plugins from "@/components/client/website/pages/editor/puck/plugins";

export default function EditorLayout() {
  const { data, handleChange, handlePublish } = useEditorContext();
  const config = useConfig();

  return (
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
  );
}