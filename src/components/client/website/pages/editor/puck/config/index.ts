import { createUsePuck } from "@puckeditor/core";

export * from "@lib/client";
export { getConfig, useConfig } from "@components/client/website/pages/editor/puck/config/puck.config";
export { scriptRegistry } from "@components/client/website/pages/editor/core/script-registry";

export const usePuck = createUsePuck();