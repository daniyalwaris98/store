"use client"

import { MDXEditor } from "@mdxeditor/editor"
import {
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  ListsToggle,
  UndoRedo,
  listsPlugin,
} from "@mdxeditor/editor"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  return (
    <div className="markdown-editor-container">
      <MDXEditor
        markdown={value ?? ""}
        onChange={(md) => onChange(md ?? "")}
        placeholder={placeholder}
        className="min-h-[200px] border rounded-lg"
        plugins={[
          listsPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <ListsToggle />
              </>
            ),
          }),
        ]}
      />
    </div>
  )
}