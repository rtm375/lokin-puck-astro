import type { Data } from "@measured/puck";
import { Puck, useGetPuck, Render, ActionBar, usePuck } from "@measured/puck";
import { config } from "../lib/puck.config";
import editorStyles from "@measured/puck/puck.css?url";
import { useCallback, useState } from "react";

const initialData = {
  root: {},
  content: [],
  zones: {}
}

// Save the data to your database
const save = (data: any) => { };

type ClipboardType = any;

const MyAction = ({ setClipboard }: { setClipboard: (c: ClipboardType) => void }) => {
  const getPuck = useGetPuck();

  const onClick = useCallback(() => {
    const api = getPuck();
    const selected = api.selectedItem;
    if (!selected) return;
    // deep clone
    const copy = structuredClone(selected);
    setClipboard(copy);
    console.log("COPIED:", copy);
  }, [getPuck, setClipboard]);

  return <button onClick={onClick}>Copy</button>;
};

const MyActionPaste = ({ clipboard }: any) => {
  const getPuck = useGetPuck();

  const onClick = () => {
    if (!clipboard) return;

    const api = getPuck();
    const selectedItem = api.selectedItem;
    const data = api.appState.data;

    if (!selectedItem) return;

    const list = data.content ?? [];

    const selectedIndex = list.findIndex(
      (item) => item.props.id === selectedItem.props.id
    );

    if (selectedIndex === -1) return;

    const newItem = {
      ...structuredClone(clipboard),
      props: {
        ...clipboard.props,
        id: `blk-${crypto.randomUUID()}`,
      },
    };

    const newList = [
      ...list.slice(0, selectedIndex + 1),
      newItem,
      ...list.slice(selectedIndex + 1),
    ];

    api.dispatch({
      type: "setData",
      data: {
        ...data,
        content: newList,
      },
    });

    console.log("PASTED:", newItem);
  };

  return <button onClick={onClick}>Paste</button>;
};



// Render Puck editor
const PuckEditor = () => {
  const [clipboard, setClipboard] = useState(null);
  return (
    <>
      <link rel="stylesheet" href={editorStyles} id="puck-css" />
      <Puck overrides={{
  actionBar: ({ children, label }) => (
    <ActionBar label={label}>
      <ActionBar.Group>
          <MyAction setClipboard={setClipboard} />
          <MyActionPaste clipboard={clipboard} />
      </ActionBar.Group>
      <ActionBar.Group>
        {children}
      </ActionBar.Group>
    </ActionBar>
  ),
}} config={config} data={initialData} onPublish={save} />
    </>
  )
}

export default PuckEditor;