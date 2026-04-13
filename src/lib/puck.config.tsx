import type { Config } from "@puckeditor/core";
import type {
  Props,
  RootProps,
} from "@/components/client/website/pages/puck/blocks/types";
import { useTranslation } from "react-i18next";
import {
  createContainerConfig,
  Hero,
  HeroSlider,
  Text,
} from "@/components/client/website/pages/puck/blocks";
import { GlobalComponent } from "@/components/client/website/pages/puck/blocks/GlobalComponent";
import { useComponentsStore } from "@/stores/useComponentsStore";
import { useMemo } from "react";

// Hook-based config for use in React components (editor UI)
// Pure config function for SSR and internal use
export const getConfig = (
  t: (key: string) => string,
  components: { name: string; id: string }[] = [],
): Config<Props, RootProps> => {
  return {
    root: {
      fields: {},
      render: ({ children }) => {
        return <div style={{ minHeight: "100vh" }}>{children}</div>;
      },
    },
    categories: {
      typography: {
        components: ["Text", "GlobalComponent"],
      },
      layout: {
        components: ["Container"],
      },
      hero: {
        components: ["Hero", "HeroSlider"],
      },
    },
    components: {
      Container: createContainerConfig(t),
      Text,
      Hero,
      HeroSlider,
      GlobalComponent: {
        ...GlobalComponent,
        fields: {
          ...GlobalComponent.fields,
          componentId: {
            type: "select",
            options: components.map((c) => ({
              label: c.name,
              value: c.id,
            })),
          },
        },
      },
    },
  };
};

// Hook-based config for use in React components (editor UI)
export const useConfig = (): Config<Props, RootProps> => {
  const { t } = useTranslation();
  const { components } = useComponentsStore();

  return useMemo(() => getConfig(t, components), [t, components]);
};
