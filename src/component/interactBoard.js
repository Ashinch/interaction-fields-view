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

const InteractBoard = forwardRef(({editValue, language, onChange: onChange, onCursorActivity}, ref) => {
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
    clearOtherCursor: () => {
      codeMirrorRef?.current?.editor.getAllMarks().forEach(item => item.clear())
    },
    setOtherCursor: (cursorPos, color, word) => {
      codeMirrorRef?.current?.editor.getAllMarks().forEach(item => item.clear())

      let cursorCoords = codeMirrorRef?.current?.editor.doc.cm.cursorCoords(cursorPos, "local")
      let startCoords = codeMirrorRef?.current?.editor.doc.cm.charCoords({line: 0, ch: 0}, "local")
      let lineHeight = codeMirrorRef?.current?.editor.doc.cm.defaultTextHeight()
      let top = (cursorCoords.top - startCoords.top) % lineHeight
      let left = cursorCoords.left + 0.5

      let cursorEl = document.createElement('span')
      cursorEl.className = 'other-cursor'
      cursorEl.style.display = 'inline-block'
      cursorEl.style.position = 'absolute'
      cursorEl.style.top = top + 'px'
      cursorEl.style.left = left + 'px'
      cursorEl.style.padding = '0px'
      cursorEl.style.marginLeft = cursorEl.style.marginRight = '-1px'
      cursorEl.style.borderLeftWidth = '2px'
      cursorEl.style.borderLeftStyle = 'solid'
      cursorEl.style.borderLeftColor = color
      cursorEl.style.height = lineHeight + 'px'
      codeMirrorRef?.current?.editor.doc.cm.setBookmark(cursorPos, {widget: cursorEl, insertLeft: true})

      let nameEl = document.createElement('span')
      nameEl.className = "other-name"
      nameEl.style.display = cursorEl.style.display
      nameEl.style.position = cursorEl.style.position
      nameEl.style.left = cursorEl.style.left
      nameEl.style.padding = cursorEl.style.padding
      nameEl.style.marginLeft = cursorEl.style.marginRight = cursorEl.style.marginLeft

      nameEl.style.top = top + lineHeight - 4 + 'px'
      nameEl.style.height = lineHeight - 4 + 'px'
      nameEl.style.width = '20px'
      nameEl.style.borderRadius = '4px'
      nameEl.style.fontSize = '12px'
      nameEl.style.fontWeight = 'bold'
      nameEl.style.lineHeight = lineHeight - 4 + 'px'
      nameEl.style.textAlign = 'center'
      nameEl.style.color = '#fff'
      nameEl.style.backgroundColor = color

      let nameTN = document.createTextNode(word)
      nameEl.appendChild(nameTN)
      codeMirrorRef?.current?.editor.doc.cm.setBookmark(cursorPos, {widget: nameEl, insertLeft: true})
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
        onChange={onChange}
        spellcheck
        onCursorActivity={onCursorActivity}
        editorDidMount={(editor) => {
          editor.setSize(770, 530)
        }}
      />

      <style jsx="true">{`
        .other-line {
          background: #f6e3ff;
        }

        .CodeMirror-gutters {
          border: unset !important;
          background-color: #fafafa !important;
        }
      `}</style>
    </>
  )
})

export const placeholder = [
  // java
  "class Main {\n" +
  "    public static void main(String[] args) {\n" +
  "        System.out.println(\"Hello World!\");\n" +
  "    }\n" +
  "}\n",

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

export default InteractBoard
