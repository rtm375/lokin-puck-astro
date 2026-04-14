import { layerPlugin } from "@/components/client/website/pages/editor/puck/plugins/Layer";
import variablesPlugin from "@/components/client/website/pages/editor/puck/plugins/Variables";
import classesPlugin from "@/components/client/website/pages/editor/puck/plugins/Classes";
import { editorPlugins } from "../../ui/EditorPlugins";

export default [...editorPlugins, layerPlugin, variablesPlugin, classesPlugin];