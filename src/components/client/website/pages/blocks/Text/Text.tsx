import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";
import { Section } from "../../components/Section";

export const Text: ComponentConfig<Props["Text"]> & { icon?: string } = {
  label: "Text",
  icon: "lucide:type",
  fields: {
    content: {
      type: "richtext",
    }
  },
  defaultProps: {
    content: "<p>Your text here</p>",
  },
  inline: true,
  render: ({ puck, content }) => {
    return <Section ref={puck.dragRef}>{content}</Section>;
  }
};
