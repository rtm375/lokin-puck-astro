import { Icon } from "@iconify/react";
import { SettingsPanel } from "./SettingsPanel";
import { layerPlugin } from "../puck/plugins/Layer";
import variablesPlugin from "../puck/plugins/Variables";
import classesPlugin from "../puck/plugins/Classes";

export const editorPlugins = [
  {
    name: "fields",
    label: "Settings",
    icon: <Icon icon="lucide:settings" width={24} />,
    render: () => <SettingsPanel />,
    mobileOnly: false,
  },
  layerPlugin,
  variablesPlugin,
  classesPlugin,
];
