import {useCallback, useEffect, useRef} from 'react';
import RichTextLite, {toggleBlock, toggleMark} from './editor';
import type {Descendant} from 'slate';
import type {CustomEditor, CustomMasks} from './editor/type';
import {Editor} from 'slate';
import './App.css';

let initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{text: 'This is editable'}],
  },
];
if (window.initialValue) {
  initialValue = window.initialValue;
}

type Command = {
  tag:
    | CustomMasks
    | 'bulleted-list'
    | 'numbered-list'
    | 'insert'
    | 'save'
    | 'redo'
    | 'undo';
  value?: string;
  callback?: (value: string) => void;
};

function dispatch(command: Command) {
  window.dispatchEvent(
    new CustomEvent('rich-text-lite', {
      detail: command,
    }),
  );
}
window.dispatch = dispatch;

function App() {
  const editorRef = useRef<CustomEditor>(null);
  const valueRef = useRef<Descendant[]>([]);

  const onChange = useCallback((value: Descendant[]) => {
    valueRef.current = value;
  }, []);

  const save = (callback: Command['callback']) => {
    if (callback) {
      try {
        callback(JSON.stringify(valueRef.current));
      } catch (e) {
        callback('json error');
        console.error(e);
      }
    }
  };

  const insert = (value?: string) => {
    if (!value) return;
    if (editorRef.current) {
      Editor.insertText(editorRef.current, value);
    }
  };

  const undo = () => {
    if (editorRef.current) {
      editorRef.current.undo();
    }
  };

  const redo = () => {
    if (editorRef.current) {
      editorRef.current.redo();
    }
  };

  useEffect(() => {
    // 监听外部事件
    const listener = (e: any) => {
      const {tag, value, callback} = e.detail as Command;
      switch (tag) {
        case 'save':
          save(callback);
          break;
        case 'insert':
          insert(value);
          break;
        case 'bold':
        case 'italic':
        case 'underline':
          if (editorRef.current) {
            toggleMark(editorRef.current, tag);
          }
          break;
        case 'bulleted-list':
        case 'numbered-list':
          if (editorRef.current) {
            console.log(123);

            toggleBlock(editorRef.current, tag);
          }
          break;
        case 'undo':
          undo();
          break;
        case 'redo':
          redo();
          break;
      }
    };
    window.addEventListener('rich-text-lite', listener);

    return () => {
      window.removeEventListener('rich-text-lite', listener);
    };
  }, []);

  return (
    <RichTextLite
      editorRef={editorRef}
      onChange={onChange}
      initialValue={initialValue}
    />
  );
}

export default App;
