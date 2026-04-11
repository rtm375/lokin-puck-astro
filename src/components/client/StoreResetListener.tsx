import { useEffect } from "react";
import { useProfileStore } from "@/stores/useProfileStore";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { usePagesStore } from "@/stores/usePagesStore";
import { useEditorData } from "@/stores/useEditorData";
import { useDomainsStore } from "@/stores/useDomainsStore";
import { useComponentsStore } from "@/stores/useComponentsStore";
import { useVariableStore } from "@/stores/useVariableStore";
import { useClassRegistryStore } from "@/stores/useClassRegistryStore";

export default function StoreResetListener() {
  useEffect(() => {
    const handleReset = () => {
      console.log("Resetting app state");
      useProfileStore.getState().reset();
      useWebsitesStore.getState().reset();
      usePagesStore.getState().reset();
      useEditorData.getState().reset();
      useDomainsStore.getState().reset();
      useComponentsStore.getState().reset();
      useVariableStore.getState().reset();
      useClassRegistryStore.getState().reset();
      localStorage.clear();
      window.location.href = "/login";
    };

    window.addEventListener("app:reset", handleReset);

    return () => {
      window.removeEventListener("app:reset", handleReset);
    };
  }, []);

  return null;
}
