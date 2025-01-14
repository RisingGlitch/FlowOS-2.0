import './style.less'

import Preloader from './preloader'
import StatusBar from './statusbar'
import WM from './wm'
import Flow from './flow'

import * as fs from 'fs'

declare global {
  interface Window {
    preloader: Preloader
    flow: Flow
    fs: typeof fs
    statusBar: StatusBar
    wm: WM
  }
}

const params = new URLSearchParams(window.location.search)

async function enableDebug (): Promise<void> {
  const { default: eruda } = await import('eruda')
  eruda.init()
  return await Promise.resolve()
}

if (params.get('debug') !== null && params.get('debug') !== undefined) {
  enableDebug().catch(e => console.error(e))
}

window.preloader = new Preloader()
window.flow = new Flow()
window.statusBar = new StatusBar()
window.wm = new WM();

(async function () {
  window.preloader.setPending('filesystem')
  window.fs = new (window as any).Filer.FileSystem()
  await window.preloader.setDone('filesystem')

  await window.wm.init()
  await window.flow.init()
  await window.statusBar.init()

  window.preloader.setStatus('')
  window.preloader.finish()
})().catch(e => console.error)
