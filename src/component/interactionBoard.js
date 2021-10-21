import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import "../util/bee.js"

import { UnControlled as CodeMirror } from "react-codemirror2"
import "codemirror/lib/codemirror"
import "codemirror/lib/codemirror.css"
import "codemirror/theme/idea.css"

import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/fold/foldgutter.css' // 折叠
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/edit/closebrackets.js' // 括号补全
import 'codemirror/addon/hint/show-hint.css' // start-ctrl+空格代码提示补全
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/anyword-hint.js'

import 'codemirror/mode/javascript/javascript' //语言
import 'codemirror/mode/markdown/markdown' //语言
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/perl/perl.js'
import 'codemirror/mode/clike/clike.js'

const InteractionBoard = forwardRef(({editValue, language, onBeforeChange, onCursorActivity}, ref) => {
  const codeMirrorRef = useRef()

  useImperativeHandle(ref, () => ({
    getEditor: () => {
      return codeMirrorRef?.current?.editor
    },
    replaceRange: (code, from, to = null) => {
      codeMirrorRef?.current?.editor.doc.replaceRange(code, from, to)
    },
    getSelection: () => {
      return codeMirrorRef?.current?.editor.getSelection()
    },
    markLine: (lineNumber) => {
      codeMirrorRef?.current?.editor.getAllMarks().forEach(item => item.clear())
      codeMirrorRef?.current?.editor.markText({line: lineNumber, ch: 0}, {line: lineNumber, ch: 10000}, {
        className: "other-line",
        // readonly: true,
        // atomic: true,
        selectLeft: false,
        selectRight: false
      })
    }
  }))

  return (
    <>
      <CodeMirror
        ref={codeMirrorRef}
        value={editValue}
        options={{
          lineNumbers: true,
          mode: {name: language},
          extraKeys: {"Alt": "autocomplete"},
          autofocus: true,
          styleActiveLine: true,
          lineWrapping: true,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          scrollbarStyle: "native",
          fixedGutter: true,
          coverGutterNextToScrollbar: false,
          autoCloseBrackets: true
        }}
        onChange={onBeforeChange}
        // onBeforeChange={onBeforeChange}
        spellcheck
        onCursorActivity={onCursorActivity}
        editorDidMount={(editor) => {
          editor.setSize(830, 600)
        }}
      />

      <style jsx="true">{`
        .other-line {
          background: #f6e3ff;
        }
      `}</style>
    </>
  )
})

export const placeholder = [
  // java
  "",

  // python2
  "print 'Hello World'\n",

  // python3
  "print('Hello World')\n",

  // javascript
  "console.log('Hello World')\n",

  // c
  "#include <stdio.h>\n" +
  "\n" +
  "int main()\n" +
  "{\n" +
  "    printf(\"Hello, World!\\n\");\n" +
  "    return 0;\n" +
  "}\n",

  // c++
  "#include <iostream>\n" +
  "using namespace std;\n" +
  "\n" +
  "int main()\n" +
  "{\n" +
  "    cout << \"Hello, World!\" << endl;\n" +
  "    return 0;\n" +
  "}\n",
]

export const editorLang = [
  "text",
  "text/x-java",
  "text/x-cython",
  "text/x-cython",
  "text/javascript",
  "text/x-csrc",
  "text/x-c++src",
]

export default InteractionBoard
