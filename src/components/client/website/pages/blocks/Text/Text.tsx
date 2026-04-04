import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";

export const Text: ComponentConfig<Props["Text"]> = {
  fields: {
    content: {
      type: "richtext",
      contentEditable: true,
    },
  },
  render: ({ content }) => {
    return (
      <>{content}</>
    );
  },
};
