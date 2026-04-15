import React from "react";
import type { Overrides } from "@puckeditor/core";
import DrawerItem from "./DrawerItem";
import type { Props } from "../blocks/types";
import { PluginAutoSwitcher } from "../plugins/PluginAutoSwitcher";
import { Header } from "../components/Header";
import { HeaderActions } from "../actions/HeaderActions";
import { VariablesStyleProvider } from "../blocks/shared/VariablesStyleProvider";

// Static overrides object - will not trigger Puck remounts
const puckOverrides: Partial<Overrides> = {
  fields: ({ children }) => <>{children}</>,
  fieldLabel: ({ children }) => <>{children}</>,
  outline: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  drawerItem: ({ name }) => <DrawerItem name={name as keyof Props} />,
  header: Header,
  headerActions: HeaderActions,
  iframe: ({ children, document }) => (
    <>
      <VariablesStyleProvider />
      {children}
    </>
  ),
};

export const staticOverrides = {
  ...puckOverrides,
  puck: ({ children }: { children: React.ReactNode }) => (
    <>
      <PluginAutoSwitcher />
      {children}
    </>
  ),
};