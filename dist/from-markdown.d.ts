import type {Root} from 'mdast'
import type {Encoding, Value} from 'micromark-util-types'

export interface CompileContext {
  config: Config
  data: CompileData
  stack: unknown[]
  tokenStack: unknown[]
  buffer(this: CompileContext): undefined
  enter(this: CompileContext, node: unknown, token: unknown, onError?: unknown): undefined
  exit(this: CompileContext, token: unknown, onError?: unknown): undefined
  resume(this: CompileContext): string
  sliceSerialize(token: unknown, expandTabs?: boolean): string
}

export interface CompileData {
  atHardBreak?: boolean
  characterReferenceType?: string
  expectingFirstListItemValue?: boolean
  flowCodeInside?: boolean
  inReference?: boolean
  setextHeadingSlurpLineEnding?: boolean
  referenceType?: 'collapsed' | 'full'
}

export interface Config {
  canContainEols: string[]
  enter: Record<string, Handle>
  exit: Record<string, Handle>
  transforms: Transform[]
}

export interface Extension {
  canContainEols?: string[] | null
  enter?: Record<string, Handle> | null
  exit?: Record<string, Handle> | null
  transforms?: Transform[] | null
}

export type Handle = (this: CompileContext, token: unknown) => void

export interface Options {
  extensions?: unknown[] | null
  mdastExtensions?: Array<Extension | Extension[]> | null
}

export type Transform = (tree: Root) => Root | null | undefined | void

export function fromMarkdown(
  value: Value,
  encoding?: Encoding | Options | null,
  options?: Options | null
): Root
