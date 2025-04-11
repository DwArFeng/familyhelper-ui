// noinspection JSUnusedGlobalSymbols

/**
 * @license Copyright (c) 2014-2022, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import type { EditorConfig, PluginConstructor } from 'ckeditor5'
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  CKFinderUploadAdapter,
  ClassicEditor as ClassicEditorBase,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  Indent,
  Italic,
  Link,
  LinkImage,
  List,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  WordCount,
} from 'ckeditor5'

import coreTranslations from 'ckeditor5/translations/zh-cn.js'

class FamilyhelperEditor extends ClassicEditorBase {
  // Plugins to include in the build.
  static builtinPlugins: Array<PluginConstructor> = [
    Alignment,
    Autoformat,
    BlockQuote,
    Bold,
    CKFinderUploadAdapter,
    Code,
    CodeBlock,
    Essentials,
    FindAndReplace,
    Heading,
    HorizontalLine,
    Image,
    ImageCaption,
    ImageResize,
    ImageStyle,
    ImageToolbar,
    ImageInsert,
    Indent,
    Italic,
    Link,
    LinkImage,
    List,
    Paragraph,
    PasteFromOffice,
    RemoveFormat,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableCellProperties,
    TableProperties,
    TableToolbar,
    TextTransformation,
    TodoList,
    Underline,
    WordCount,
  ]

  // Editor configuration.
  // noinspection SpellCheckingInspection
  static defaultConfig: EditorConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'undo',
        'redo',
        '|',
        'findAndReplace',
        '|',
        'bold',
        'code',
        'italic',
        'underline',
        'strikethrough',
        'superscript',
        'subscript',
        'removeFormat',
        '|',
        'outdent',
        'indent',
        'alignment',
        'bulletedList',
        'numberedList',
        'todoList',
        '|',
        'insertimageviaurl',
        'blockQuote',
        'insertTable',
        'horizontalLine',
        'link',
        'codeBlock',
      ],
    },
    image: {
      toolbar: [
        'imageTextAlternative',
        'imageStyle:inline',
        {
          name: 'blockDropdown',
          title: 'blockDropdown',
          items: ['imageStyle:alignBlockLeft', 'imageStyle:block', 'imageStyle:alignBlockRight'],
          defaultItem: 'imageStyle:block',
        },
        {
          name: 'sideDropdown',
          title: 'sideDropdown',
          items: ['imageStyle:alignLeft', 'imageStyle:alignRight'],
          defaultItem: 'imageStyle:alignRight',
        },
        '|',
        'linkImage',
      ],
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableCellProperties',
        'tableProperties',
      ],
    },
    translations: [coreTranslations],
  }
}

export { FamilyhelperEditor }
