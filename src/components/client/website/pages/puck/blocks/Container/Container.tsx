import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";
import { Section } from "../../components/Section";

export const Container: ComponentConfig<Props["Container"]> & { icon?: string } = {
  label: "Container",
  icon: "lucide:type",
  fields: {
    content: {
      label: "Content",
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
