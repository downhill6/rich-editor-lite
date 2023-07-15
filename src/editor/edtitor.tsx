import {useCallback, useEffect, useMemo} from 'react';
import type {Descendant} from 'slate';
import {withHistory} from 'slate-history';
import {Editable, withReact, Slate} from 'slate-react';
import {createEditor} from 'slate';
import type {CustomEditor} from './type';
import {Element, ElementProps} from './elements';
import {Leaf, LeafProps} from './leaf';

export const RichTextLite = (props: {
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
