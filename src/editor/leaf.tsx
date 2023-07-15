import {Editable} from 'slate-react';
import type {getPropsType} from './type';

export type LeafProps = getPropsType<typeof Editable, 'renderLeaf'>;
export const Leaf = ({attributes, children, leaf}: LeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};
