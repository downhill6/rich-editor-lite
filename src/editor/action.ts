import type {ReactEditor} from 'slate-react';
import type {BaseEditor} from 'slate';
import {Editor, Transforms, Element as SlateElement} from 'slate';
import type {CustomMasks, CustomTypes, CustomEditor} from './type';
import {isBlockActive, isMarkActive} from './utils';

export const toggleMark = (editor: CustomEditor, format: CustomMasks) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
export const toggleBlock = (
  editor: BaseEditor & ReactEditor,
  format: CustomTypes,
) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });
  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = {type: format, children: []};
    Transforms.wrapNodes(editor, block);
  }
};
