import { useEffect, useRef } from "react";
import { useVariableStore } from "@/stores/useVariableStore";
import { useClassRegistryStore } from "@/stores/useClassRegistryStore";

/**
 * Hook to initialize the class system (variables and classes) for a website.
 * Handles loading data from the database and initializing defaults.
 * 
 * @param websiteId - The ID of the website to initialize for
 */
export function useClassSystemInit(websiteId: string | undefined) {
  const initializingRef = useRef(false);
  const lastWebsiteIdRef = useRef<string | undefined>(undefined);

  const {
    loadVariables,
    initializeDefaults: initializeDefaultVariables,
    currentWebsiteId: currentVariableWebsiteId,
  } = useVariableStore();

  const {
    loadClasses,
    initializeSystemClasses,
    initializeExamples,
    currentWebsiteId: currentClassWebsiteId,
  } = useClassRegistryStore();

  useEffect(() => {
    // Skip if no websiteId
    if (!websiteId) {
      return;
    }

    // Skip if already initializing
    if (initializingRef.current) {
      return;
    }

    // Check if we need to initialize (new website or first load)
    const needsInit =
      lastWebsiteIdRef.current !== websiteId ||
      currentVariableWebsiteId !== websiteId ||
      currentClassWebsiteId !== websiteId;

    if (!needsInit) {
      return;
    }

    // Mark as initializing
    initializingRef.current = true;
    lastWebsiteIdRef.current = websiteId;

    const initializeClassSystem = async () => {
      try {
        console.log(`[ClassSystem] Initializing for website: ${websiteId}`);

        // 1. Load variables from database
        await loadVariables(websiteId);

        // 2. Initialize default variables if needed
        await initializeDefaultVariables(websiteId);

        // 3. Load classes from database
        await loadClasses(websiteId);

        // 4. Initialize system classes (Flex, Grid) if needed
        await initializeSystemClasses(websiteId);

        // 5. Initialize example classes if needed (in next tick to avoid state update during render)
        setTimeout(() => {
          initializeExamples(websiteId).catch((error) => {
            console.error("[ClassSystem] Failed to initialize examples:", error);
          });
        }, 0);

        console.log(`[ClassSystem] Initialization complete for website: ${websiteId}`);
      } catch (error) {
        console.error("[ClassSystem] Initialization failed:", error);
      } finally {
        initializingRef.current = false;
      }
    };

    initializeClassSystem();
  }, [
    websiteId,
    currentVariableWebsiteId,
    currentClassWebsiteId,
    loadVariables,
    initializeDefaultVariables,
    loadClasses,
    initializeSystemClasses,
    initializeExamples,
  ]);
}
