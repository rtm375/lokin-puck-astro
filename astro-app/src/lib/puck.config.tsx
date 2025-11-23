import type { Config } from "@measured/puck";
import type { Props } from "@components/client/website/pages/blocks/types";
import {
  Flex,
  Hero,
  HeroSlider,
  Text,
} from "@components/client/website/pages/blocks";

export const config: Config<Props> = {
  components: {
    Text,
    Flex,
    Hero,
    HeroSlider,
  },
};
