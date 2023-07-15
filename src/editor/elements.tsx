import {Editable} from 'slate-react';
import type {getPropsType} from './type';

export type ElementProps = getPropsType<typeof Editable, 'renderElement'>;
export const Element = ({
  attributes,
  children,
  element,
  style,
}: ElementProps & {
  style?: React.CSSProperties;
}) => {
  switch (element.type) {
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};
