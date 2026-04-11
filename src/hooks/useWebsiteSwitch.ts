import { useEffect, useRef } from "react";
import { useVariableStore } from "@/stores/useVariableStore";
import { useClassRegistryStore } from "@/stores/useClassRegistryStore";

/**
 * Hook to handle website switching.
 * Clears and reloads class system stores when the website changes.
 * 
 * @param websiteId - The current website ID
 */
export function useWebsiteSwitch(websiteId: string | undefined) {
  const previousWebsiteIdRef = useRef<string | undefined>(undefined);

  const { setCurrentWebsite: setVariableWebsite } = useVariableStore();
  const { setCurrentWebsite: setClassWebsite } = useClassRegistryStore();

  useEffect(() => {
    // Skip if no websiteId
    if (!websiteId) {
      return;
    }

    // Check if website has changed
    const hasChanged = previousWebsiteIdRef.current !== websiteId;

    if (hasChanged && previousWebsiteIdRef.current !== undefined) {
      console.log(
        `[WebsiteSwitch] Switching from ${previousWebsiteIdRef.current} to ${websiteId}`,
      );

      // setCurrentWebsite handles clearing and reloading automatically
      setVariableWebsite(websiteId);
      setClassWebsite(websiteId);
    }

    // Update ref
    previousWebsiteIdRef.current = websiteId;
  }, [websiteId, setVariableWebsite, setClassWebsite]);
}
