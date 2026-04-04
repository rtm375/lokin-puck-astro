import type { ComponentConfig } from "@puckeditor/core";
import { Render } from "@puckeditor/core";
import { useComponentsStore } from "@/stores/useComponentsStore";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export interface GlobalComponentProps {
  componentId: string;
  data?: any; // The resolved data
}

export const GlobalComponent: ComponentConfig<GlobalComponentProps> = {
  label: "Global Component",
  fields: {
    componentId: {
      type: "select",
      options: [], // populated dynamically in useConfig
    },
  },
  resolveData: async ({ props }) => {
    if (!props.componentId) return { props };

    // Fetch from DB
    // Note: This runs on the server during SSR, or client if configured.
    // We need a way to fetch data that works in both envs or just SSR.
    // For SSR (Astro), we can use the supabase client.

    // We'll use a direct fetch or supabase client here.
    // Since this might run in the browser during editing, we need to handle that.

    // Ideally, we fetch from our API.
    try {
      // If running on server (Astro SSR)
      if (typeof window === "undefined") {
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(
          import.meta.env.PUBLIC_SUPABASE_URL,
          import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
        );
        const { data } = await sb
          .from("components")
          .select("data")
          .eq("id", props.componentId)
          .single();
        return { props: { ...props, data: data?.data } };
      }

      // If running on client (Editor)
      // We can rely on the store or fetch from API.
      // But resolveData in Puck is often used for "server components".
      // Let's try fetching from API.
      const res = await fetch(`/api/components/${props.componentId}`); // We need this endpoint or similar
      // Actually, we can just return the props and let the component handle fetching if it's client side?
      // But the goal is SSR.

      // Let's assume resolveData is mainly for the SSR output.
      // For the editor, we might need a different approach or just let it resolve.

      // Let's stick to the plan: resolveData fetches data.
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      );
      const { data } = await sb
        .from("components")
        .select("data")
        .eq("id", props.componentId)
        .single();
      return { props: { ...props, data: data?.data } };
    } catch (e) {
      console.error("Failed to resolve global component", e);
      return { props };
    }
  },
  render: ({ data }) => {
    if (!data)
      return (
        <div className="p-4 border border-dashed border-gray-300 text-gray-500">
          Select a Global Component
        </div>
      );

    // We need the config to render the data.
    // We can't easily import the full config here due to circular deps if we're not careful.
    // But we can pass a subset or import `staticConfig` if it doesn't depend on this file.
    // Actually, `Render` needs a config.

    // If we are inside the Editor, we want to render the component.
    // If we are in SSR, we want to render the component.

    // Problem: `Render` requires `config`.
    // If we import `staticConfig` here, and `staticConfig` imports `GlobalComponent`, we have a cycle.

    // Solution: Pass config context or use a lightweight config for the inner render?
    // Or, maybe we don't use `Render` inside `GlobalComponent`?
    // No, `data` is Puck data, so we MUST use `Render`.

    // We can accept `config` as a prop? No, Puck controls props.

    // Let's try to dynamically import config or use a context.
    // For now, let's just render a placeholder in the editor if we can't get config.
    // But for SSR, we need it.

    return (
      <div className="global-component-wrapper">
        {/* We will need to inject the config somehow or import it. 
                Let's assume we can import `staticConfig` and handle the cycle later if it arises.
                Actually, let's defer the import or use a separate file for the config definition.
            */}
        <div className="p-4 bg-gray-50 border border-blue-100">
          <p className="text-xs text-blue-500 mb-2">
            Global Component: {data.root?.props?.title || "Untitled"}
          </p>
          {/* <Render config={...} data={data} /> */}
          {/* We can't easily render nested Puck data without the config. 
                    This is a known "Puck within Puck" challenge.
                    
                    However, if we use Astro SSR, we can just render the HTML?
                    No, we want it to be editable? No, global components are edited separately.
                    So here we just display it.
                */}
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};
