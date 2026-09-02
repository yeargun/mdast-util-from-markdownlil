import type {Root} from 'mdast'
import {
  fromMarkdown,
  type Encoding,
  type Extension,
  type Handle,
  type Handles,
  type OnEnterError,
  type OnExitError,
  type Options,
  type Token,
  type Transform,
  type Value
} from '@itslil/mdast-util-from-markdown'
import {fromMarkdown as closedFromMarkdown} from '@itslil/mdast-util-from-markdown/closed'

const value: Value = new Uint8Array()
const encoding: Encoding = 'utf-8'
const handle: Handle = function (token) {
  this.enter({type: 'text', value: ''}, token)
}
const handles: Handles = {data: handle}
const onEnterError: OnEnterError = function (left, right) {
  void left
  void right
}
const onExitError: OnExitError = function (left, right) {
  void left
  void right
}
const transform: Transform = (tree) => tree
const extension: Extension = {
  enter: handles,
  transforms: [transform]
}
const options: Options = {
  extensions: [],
  mdastExtensions: [extension, [extension]]
}
const token = {} as Token

const fromBytes: Root = fromMarkdown(value, encoding, options)
const fromOptions: Root = fromMarkdown('# heading', options)
const fromClosed: Root = closedFromMarkdown('# heading')

void onEnterError
void onExitError
void token
void fromBytes
void fromOptions
void fromClosed
