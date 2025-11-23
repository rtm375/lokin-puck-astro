import type { ComponentConfig } from "@measured/puck";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useState, useRef, type JSX } from "react";
import type { Props } from "../types";

const ToolbarButton = ({
  onClick,
  isActive,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`px-2 py-1 text-xs border rounded transition-colors ${
      isActive
        ? "bg-gray-200 font-bold border-gray-400"
        : "bg-white border-gray-200 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const TiptapEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [, forceUpdate] = useState(0);
  const lastHtml = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "mb-4 last:mb-0", // Adds spacing between paragraphs
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-outside leading-normal ml-4 mb-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-outside leading-normal ml-4 mb-4",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "ml-2 mb-1",
          },
        },
      }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[150px] p-3 border rounded-md bg-white text-black w-full max-w-none",
      },
    },
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastHtml.current = html;
      onChange(html);
    },
    onTransaction: () => {
      forceUpdate((x) => x + 1);
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (!editor.isFocused && value !== lastHtml.current) {
      editor.commands.setContent(value, { emitUpdate: false });
      lastHtml.current = value;
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-2 p-1 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-2 mb-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
        >
          S
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-300 mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
        >
          L
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
        >
          C
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
        >
          R
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-300 mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          UL
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          OL
        </ToolbarButton>

        <div className="w-px h-4 bg-gray-300 mx-1 self-center" />

        <input
          type="color"
          className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
          onInput={(e) =>
            editor.chain().focus().setColor(e.currentTarget.value).run()
          }
          value={editor.getAttributes("textStyle").color || "#000000"}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export const Text: ComponentConfig<Props["Text"]> = {
  fields: {
    content: {
      type: "custom",
      label: "Content",
      render: ({ field, onChange, value }) => (
        <div className="flex flex-col gap-2 mb-4">
          <span className="font-medium text-sm text-gray-500">
            {field.label || "Content"}
          </span>
          <TiptapEditor value={value} onChange={onChange} />
        </div>
      ),
    },
    htmlTag: {
      label: "HTML Tag",
      type: "select",
      options: [
        { label: "p", value: "p" },
        { label: "div", value: "div" },
        { label: "span", value: "span" },
        { label: "Heading 1", value: "h1" },
        { label: "Heading 2", value: "h2" },
        { label: "Heading 3", value: "h3" },
      ],
    },
  },
  defaultProps: {
    content: "<p>Hello World</p>",
    htmlTag: "p",
  },
  render: ({ content, htmlTag }) => {
    const Tag = htmlTag as keyof JSX.IntrinsicElements;

    return (
      <Tag
        dangerouslySetInnerHTML={{ __html: content }}
        className={htmlTag === "span" ? "inline-block" : "block"}
      />
    );
  },
};
