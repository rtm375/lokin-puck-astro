import type { Config } from "@measured/puck";
import type { Props } from "@components/client/website/pages/blocks/types";
import { useTranslation } from "react-i18next";
import {
  createFlexConfig,
  Hero,
  HeroSlider,
  Text,
} from "@components/client/website/pages/blocks";

// Hook-based config for use in React components (editor UI)
export const useConfig = (): Config<Props> => {
  const { t } = useTranslation();

  return {
    components: {
      Text,
      Flex: createFlexConfig(t),
      Hero,
      HeroSlider,
    },
  };
};

// Static config for server-side rendering (no hooks)
// Translation labels are not needed for rendering, only for editor UI
export const staticConfig: Config<Props> = {
  components: {
    Text,
    Flex: createFlexConfig((key: string) => key), // No-op translation for SSR
    Hero,
    HeroSlider,
  },
};
