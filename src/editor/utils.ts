import type {ReactEditor} from 'slate-react';
import type {BaseEditor} from 'slate';
import {Editor, Element as SlateElement} from 'slate';
import type {
  CustomMasks,
  CustomTypes,
  CustomElement,
  CustomEditor,
} from './type';

export const isMarkActive = (editor: CustomEditor, format: CustomMasks) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const isBlockActive = (
  editor: BaseEditor & ReactEditor,
  format: CustomTypes,
  blockType = 'type' as keyof CustomElement,
) => {
  const {selection} = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    }),
  );

  return !!match;
};
