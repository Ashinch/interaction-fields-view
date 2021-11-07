import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
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

const InteractBoard = forwardRef(({language, onChange, onChanges, onCursorActivity}, ref) => {
  const codeMirrorRef = useRef()

  useEffect(() => {
    codeMirrorRef?.current?.editor.doc.cm.on("changes", onChanges)
  }, [])

  useImperativeHandle(ref, () => ({
    getEditor: () => {
      return codeMirrorRef?.current?.editor
    },
    getCM: () => {
      return codeMirrorRef?.current?.editor.doc.cm
    },
    getValue: () => {
      return codeMirrorRef?.current?.editor.doc.cm.getValue()
    },
    setValue: (value) => {
      let length = codeMirrorRef?.current?.editor.doc.cm.getValue().length
      let pos = codeMirrorRef?.current?.editor.doc.cm.posFromIndex(length)
      codeMirrorRef?.current?.editor.doc.cm.replaceRange(value, {line: 0, ch: 0}, pos)
    },
    replaceRange: (value, from, to = null) => {
      codeMirrorRef?.current?.editor.doc.cm.replaceRange(value, from, to)
    },
    foldCode: (pos) => {
      codeMirrorRef?.current?.editor.doc.cm.foldCode(pos, null, "fold")
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
        options={{
          lineNumbers: true,
          mode: {name: language},
          extraKeys: {
            "Alt": "autocomplete",
            // Tab: (cm) => {
            //   if (cm.somethingSelected()) {
            //     cm.indentSelection('add');
            //   } else {
            //     // cm.indentLine(cm.getCursor().line, "add");  // 整行缩进 不符合预期
            //     cm.replaceSelection(Array(cm.getOption("indentUnit") + 1).join(" "));
            //   }
            // },
          },
          autofocus: true,
          styleActiveLine: true,
          lineWrapping: true,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          scrollbarStyle: "native",
          fixedGutter: true,
          coverGutterNextToScrollbar: false,
          autoCloseBrackets: true,
          dragDrop: false,
          indentUnit: 4
        }}
        onChange={onChange}
        spellcheck
        onCursorActivity={onCursorActivity}
        editorDidMount={(editor) => {
          editor.setSize(770, 515)
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
  "import java.io.*;\n" +
  "import java.util.*;\n" +
  "import java.math.*;\n" +
  "import java.util.regex.*;\n" +
  "import java.util.stream.*;\n" +
  "import java.text.*;\n" +
  "import java.security.SecureRandom;\n" +
  "import java.util.function.*;\n" +
  "import java.util.concurrent.*;\n" +
  "\n" +
  "/**\n" +
  " * Java 环境版本: 1.8.0_282\n" +
  " * 可用包已导入，规定启动类名称: Main\n" +
  " */\n" +
  "class Main {\n" +
  "    public static void main(String[] args) {\n" +
  "        System.out.println(\"Hello World!\");\n" +
  "    }\n" +
  "}\n",

  // python2
  "\n" +
  "\"\"\"\n" +
  "Python2 环境版本: 2.7.18\n" +
  "禁用文件读写，禁用系统调用\n" +
  "\"\"\"\n" +
  "print 'Hello World'\n",

  // python3
  "\n" +
  "\"\"\"\n" +
  "Python3 环境版本: 3.9.5\n" +
  "禁用文件读写，禁用系统调用\n" +
  "\"\"\"\n" +
  "print('Hello World')\n",

  // javascript
  "\n" +
  "console.log('Hello World')\n",

  // c
  "#include <stdio.h>\n" +
  "\n" +
  "/**\n" +
  " * C语言 环境版本: Alpine 10.3.1 2021042\n" +
  " * 禁用文件读写，禁用系统调用\n" +
  " */\n" +
  "int main()\n" +
  "{\n" +
  "    printf(\"Hello, World!\\n\");\n" +
  "    return 0;\n" +
  "}\n",

  // c++
  "#include <iostream>\n" +
  "using namespace std;\n" +
  "\n" +
  "/**\n" +
  " * C++ 环境版本: Alpine 10.3.1 2021042\n" +
  " * 禁用文件读写，禁用系统调用\n" +
  " */\n" +
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
