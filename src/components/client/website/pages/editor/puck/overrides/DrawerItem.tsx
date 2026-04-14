import { Icon } from "@iconify/react";
import { useConfig } from "@/components/client/website/pages/editor/puck/config";

import type { Props, BaseBlockConfig } from "../blocks/types";

export default ({ name }: { name: keyof Props }) => {
  const config = useConfig();
  const block = config.components[name] as BaseBlockConfig;
  const icon = block?.icon || "lucide:box";
  const label = block?.label || (name as string);

  return (
    <div className="flex flex-col items-center justify-center p-3 border border-gray-100 gap-2 text-center hover:border-primary/50 hover:bg-orange-50/50 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden shadow-sm hover:shadow-md">
      <Icon
        icon={icon}
        width={24}
        className="text-gray-400 group-hover:text-primary transition-colors duration-300"
      />
      <span className="block max-w-20 text-[11px] leading-tight text-gray-500 font-medium group-hover:text-gray-900 transition-colors duration-300 truncate w-full px-1">
        {label}
      </span>
    </div>
  );
};

