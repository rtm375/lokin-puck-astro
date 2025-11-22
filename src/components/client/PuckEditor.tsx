import type { Data } from "@measured/puck";
import { Puck, useGetPuck, Render, ActionBar, usePuck } from "@measured/puck";
import { config } from "@lib/puck.config";
import editorStyles from "@measured/puck/puck.css?url";
import { useCallback, useState } from "react";

const initialData = {
  root: {},
  content: [],
  zones: {},
};

// Save the data to your database
const save = (data: any) => {};

// Render Puck editor
const PuckEditor = () => {
  const [clipboard, setClipboard] = useState(null);
  return (
    <>
      <link rel="stylesheet" href={editorStyles} id="puck-css" />
      <Puck config={config} data={initialData} onPublish={save} />
    </>
  );
};

export default PuckEditor;
