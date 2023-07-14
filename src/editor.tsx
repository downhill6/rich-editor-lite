import {useCallback, useEffect, useMemo} from 'react';
import type {ComponentProps} from 'react';
import type {ReactEditor} from 'slate-react';
import type {BaseEditor, Descendant} from 'slate';
import {HistoryEditor, withHistory} from 'slate-history';
import {Editable, withReact, Slate} from 'slate-react';
import {Editor, Transforms, createEditor, Element as SlateElement} from 'slate';

export type CustomMasks = 'bold' | 'italic' | 'underline';
type CustomTypes =
  | 'paragraph'
  | 'list-item'
  | 'numbered-list'
  | 'bulleted-list';
type CustomText = {text: string} & Partial<Record<CustomMasks, boolean>>;
type CustomElement = {
  type: CustomTypes;
  children: CustomText[];
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;
const isMarkActive = (editor: CustomEditor, format: CustomMasks) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (editor: CustomEditor, format: CustomMasks) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

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

const isBlockActive = (
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

type ElementProps = getPropsType<typeof Editable, 'renderElement'>;
const Element = ({
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

type LeafProps = getPropsType<typeof Editable, 'renderLeaf'>;
const Leaf = ({attributes, children, leaf}: LeafProps) => {
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

type getPropsType<
  T extends (...args: any) => any,
  Name extends string,
> = Parameters<NonNullable<ComponentProps<T>[Name]>>[number];

const RichTextLite = (props: {
  editorRef?: React.MutableRefObject<CustomEditor | null>;
  onChange?: (value: Descendant[]) => void;
  placeholder?: string;
  elementStyle?: React.CSSProperties;
  onKeyDown?: React.DOMAttributes<HTMLDivElement>['onKeyDown'];
  spellCheck?: boolean;
  autoFocus?: boolean;
  initialValue?: Descendant[];
}) => {
  const {
    editorRef,
    onChange,
    onKeyDown,
    elementStyle,
    placeholder = 'Enter some text…',
    initialValue,
    ...restProps
  } = props;
  const renderElement = useCallback(
    (props: ElementProps) => <Element {...props} style={elementStyle} />,
    [elementStyle],
  );
  const renderLeaf = useCallback((props: LeafProps) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  return (
    <Slate
      editor={editor}
      initialValue={initialValue || []}
      onChange={onChange}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        {...restProps}
      />
    </Slate>
  );
};

export default RichTextLite;
