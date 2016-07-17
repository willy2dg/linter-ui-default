/* @flow */

import { Range } from 'atom'
import Editor from '../lib/editor'
import { getMessage } from './helpers'

describe('Editor', function() {
  let editor
  let message
  let textEditor

  beforeEach(function() {
    message = getMessage()
    message.range = [[2, 0], [2, 1]]
    message.filePath = __filename
    waitsForPromise(function() {
      return atom.workspace.open(__filename).then(function() {
        textEditor = atom.workspace.getActiveTextEditor()
        editor = new Editor(textEditor)
      })
    })
    atom.packages.loadPackage('linter-ui-default')
  })
  afterEach(function() {
    editor.dispose()
    atom.workspace.destroyActivePaneItem()
  })

  describe('apply', function() {
    it('applies the messages to the editor', function() {
      expect(textEditor.getMarkerCount()).toBe(0)
      editor.apply([message], [])
      expect(textEditor.getMarkerCount()).toBe(1)
      editor.apply([], [message])
      expect(textEditor.getMarkerCount()).toBe(0)
    })
    it('makes sure that the message is updated if text is manipulated', function() {
      expect(textEditor.getMarkerCount()).toBe(0)
      editor.apply([message], [])
      expect(textEditor.getMarkerCount()).toBe(1)
      expect(Range.fromObject(message.range)).toEqual({ start: { row: 2, column: 0 }, end: { row: 2, column: 1 } })
      textEditor.getBuffer().insert([2, 0], 'Hello')
      expect(Range.fromObject(message.range)).toEqual({ start: { row: 2, column: 0 }, end: { row: 2, column: 6 } })
      editor.apply([], [message])
      expect(Range.fromObject(message.range)).toEqual({ start: { row: 2, column: 0 }, end: { row: 2, column: 6 } })
      expect(textEditor.getMarkerCount()).toBe(0)
    })
  })
  describe('Response to config', function() {
    it('responds to `gutterPosition`', function() {
      atom.config.set('linter-ui-default.gutterPosition', 'Left')
      expect(editor.gutter.priority).toBe(-100)
      atom.config.set('linter-ui-default.gutterPosition', 'Right')
      expect(editor.gutter.priority).toBe(100)
    })
    it('responds to `showDecorations`', function() {
      expect(editor.gutter).not.toBe(null)
      atom.config.set('linter-ui-default.showDecorations', false)
      expect(editor.gutter).toBe(null)
      atom.config.set('linter-ui-default.showDecorations', true)
      expect(editor.gutter).not.toBe(null)
    })
  })
})
