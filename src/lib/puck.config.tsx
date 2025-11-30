import type { Config } from "@measured/puck";
import type {
  Props,
  RootProps,
} from "@components/client/website/pages/blocks/types";
import { useTranslation } from "react-i18next";
import {
  createFlexConfig,
  Hero,
  HeroSlider,
  Text,
} from "@components/client/website/pages/blocks";
import { GlobalComponent } from "@components/client/website/pages/blocks/GlobalComponent";
import { useComponentsStore } from "@/stores/useComponentsStore";
import { useEffect, useMemo } from "react";
import * as ReactRouterDOM from "react-router-dom";
const { useParams } = ReactRouterDOM;

// Hook-based config for use in React components (editor UI)
// Pure config function for SSR and internal use
export const getConfig = (
  t: (key: string) => string,
  components: { name: string; id: string }[] = [],
): Config<Props, RootProps> => {
  return {
    root: {
      fields: {},
    },
    components: {
      Text,
      Flex: createFlexConfig(t),
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
