import type {ReactEditor} from 'slate-react';
import type {HistoryEditor} from 'slate-history';
import type {BaseEditor, Descendant} from 'slate';
import type {ComponentProps} from 'react';

export type CustomMasks = 'bold' | 'italic' | 'underline';
export type CustomTypes =
  | 'paragraph'
  | 'list-item'
  | 'numbered-list'
  | 'bulleted-list';

export type CustomText = Flatten<
  {text: string} & Partial<Record<CustomMasks, boolean>>
>;
export type CustomElement = {
  type: CustomTypes;
  children: CustomText[];
};

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

type Flatten<T> = T extends object
  ? T extends infer O
    ? {[K in keyof O]: Flatten<O[K]>} extends infer O
      ? {[K in keyof O]: O[K]}
      : never
    : never
  : T;

export type getPropsType<
  T extends (...args: any) => any,
  Name extends string,
> = Parameters<NonNullable<ComponentProps<T>[Name]>>[number];
