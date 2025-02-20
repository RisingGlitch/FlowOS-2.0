import icon from '../assets/icons/editor.png'
import { App } from '../types.ts'

import { fullEditor } from 'prism-code-editor/setups'
import Prism from 'prism-code-editor/prism-core'
import 'prismjs/components/prism-markup.js'
import 'prismjs/components/prism-clike.js'
import 'prismjs/components/prism-javascript.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-tsx.js'
import 'prism-code-editor/languages'
import 'prism-code-editor/prism-markdown'

import { FlowWindow } from '../wm.ts'

interface EditorConfig {
  path: string
}

export default class EditorApp implements App {
  meta = {
    name: 'Editor',
    description: 'A simple editor app.',
    pkg: 'flow.editor',
    version: '1.0.0',
    icon
  }

  async open (data?: EditorConfig): Promise<FlowWindow> {
    const win = window.wm.createWindow({
      title: this.meta.name,
      icon: this.meta.icon,
      width: 500,
      height: 400
    })

    if (data != null) {
      win.setTitle(`Editor - ${data.path}`)

      win.content.style.display = 'flex'
      win.content.style.flexDirection = 'column'
      win.content.innerHTML = `
        <div style="padding: 5px;display: flex;align-items: center;gap: 5px;">
          <div id="file-open">File</div>
          <div id="edit-open">Edit</div>

          <div class="dropdown" id="file">
            <a id="save">
              <i class='bx bxs-save' style="font-size: 1.1rem;"></i>
              Save
            </a>
          </div>
          <div class="dropdown" id="edit">
            <a id="find">
              <i class='bx bxs-save' style="font-size: 1.1rem;"></i>
              Find
            </a>
          </div>
        </div>
        <div class="editor" style="flex:1;"></div>
        <style>
        .dropdown {
          position: absolute;
          z-index: 100;
          width: 150px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 5px;
          padding: 5px;
          margin-top: 80px;
          background: var(--surface-0);
          transition: all 0.1s cubic-bezier(0.16, 1, 0.5, 1);
            
          transform: translateY(0.5rem);
          visibility: hidden;
          opacity: 0;
        }
        
        .show {
          transform: translateY(0rem);
          visibility: visible;
          opacity: 1;
        }

        .dropdown a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 10px;
          text-decoration: none;
          color: var(--text);
        }
        
        .dropdown a:hover {
          background-color: var(--base);
          color: white;
        }
        </style>
      `

      const fileBtn = win.content.querySelector('#file-open')
      const editBtn = win.content.querySelector('#edit-open')

      const toggleDropdown = (id: string): void => {
        const el = win.content.querySelector(`#${id}`)
        el?.classList.toggle('show')
      }

      fileBtn?.addEventListener('click', (e) => {
        e.stopPropagation()
        toggleDropdown('file')
      })

      editBtn?.addEventListener('click', (e) => {
        e.stopPropagation()
        toggleDropdown('edit')
      })

      win.content.addEventListener('click', () => {
        const file = (win.content.querySelector('#file') as HTMLElement)
        const edit = (win.content.querySelector('#edit') as HTMLElement)
        if (file.classList.contains('show')) {
          toggleDropdown('file')
        }
        if (edit.classList.contains('show')) {
          toggleDropdown('edit')
        }
      })

      let language

      switch (data.path.split('.').at(-1)?.toLowerCase()) {
        case 'c':
        case 'cs':
        case 'cpp':
        case 'java': {
          language = 'clike'
          break
        }

        case 'ts': {
          language = 'typescript'
          break
        }

        case 'js':
        case 'mjs':
        case 'cjs': {
          language = 'javascript'
          break
        }

        case 'jsx': {
          language = 'jsx'
          break
        }

        case 'tsx': {
          language = 'tsx'
          break
        }

        case 'html': {
          language = 'html'
          break
        }

        case 'md': {
          language = 'md'
          break
        }

        case 'css': {
          language = 'css'
          break
        }

        case 'xml': {
          language = 'xml'
          break
        }

        case 'py': {
          language = 'python'
          break
        }

        default: {
          language = 'text'
          break
        }
      }

      const value = (await window.fs.promises.readFile(data.path)).toString()
      const editor = fullEditor(
        Prism,
        win.content.querySelector('.editor'),
        {
          language,
          theme: 'github-dark',
          value
        }
      )

      const style = document.createElement('style')
      style.innerHTML = `
      .prism-editor {
        border-radius: 10px 10px 0 0;
        caret-color: var(--text);
        font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
        --editor__bg: var(--base);
        --widget__border: var(--mantle);
        --widget__bg: var(--crust);
        --widget__color: var(--text);
        --widget__color-active: var(--text);
        --widget__color-options: #8a99a8;
        --widget__bg-input: var(--mantle);
        --widget__bg-hover: #5a5d5e4f;
        --widget__bg-active: var(--base);
        --widget__focus-ring: var(--text);
        --search__bg-find: var(--surface-1)80;
        --widget__bg-error: #5a1d1d;
        --widget__error-ring: #be1100;
        --editor__bg-highlight: #636e7b1a;
        --editor__bg-selection-match: var(--surface-1)40;
        --editor__line-number: #636e7b;
        --editor__line-number-active: #adbac7;
        --editor__bg-scrollbar: 210, 10%, 35%;
        --editor__bg-fold: #768390;
        --bg-guide-indent: var(--surface-0);
        color-scheme: dark;
        height: 100%;
      }
      .prism-search * {
        font-family: 'Satoshi', sans-serif;
      }
      `
      editor.scrollContainer.appendChild(style);
      (win.content.querySelector('#find') as HTMLElement).onclick = () => {
        editor.extensions.searchWidget.open()
      }
      (win.content.querySelector('#save') as HTMLElement).onclick = async () => {
        await window.fs.promises.writeFile(data.path, editor.value)
      }
    }

    return win
  }
}
