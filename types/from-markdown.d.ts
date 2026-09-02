import type {Nodes, Parent, PhrasingContent, Root} from 'mdast'
import type {
  Encoding,
  ParseOptions,
  Token,
  Value
} from 'micromark-util-types'

export type {Encoding, Token, Value} from 'micromark-util-types'

export interface CompileContext {
  config: Config
  data: CompileData
  stack: Array<Fragment | Nodes>
  tokenStack: Array<TokenTuple>
  buffer(this: CompileContext): undefined
  enter(
    this: CompileContext,
    node: Nodes,
    token: Token,
    onError?: OnEnterError | null | undefined
  ): undefined
  exit(
    this: CompileContext,
    token: Token,
    onError?: OnExitError | null | undefined
  ): undefined
  resume(this: CompileContext): string
  sliceSerialize(
    token: Pick<Token, 'end' | 'start'>,
    expandTabs?: boolean | undefined
  ): string
}

export interface CompileData {
  atHardBreak?: boolean | undefined
  characterReferenceType?:
    | 'characterReferenceMarkerHexadecimal'
    | 'characterReferenceMarkerNumeric'
    | undefined
  expectingFirstListItemValue?: boolean | undefined
  flowCodeInside?: boolean | undefined
  inReference?: boolean | undefined
  setextHeadingSlurpLineEnding?: boolean | undefined
  referenceType?: 'collapsed' | 'full' | undefined
}

export interface Config {
  canContainEols: Array<string>
  enter: Handles
  exit: Handles
  transforms: Array<Transform>
}

export interface Extension {
  canContainEols?: Array<string> | null | undefined
  enter?: Handles | null | undefined
  exit?: Handles | null | undefined
  transforms?: Array<Transform> | null | undefined
}

interface Fragment extends Parent {
  type: 'fragment'
  children: Array<PhrasingContent>
}

export type Handles = Record<string, Handle>

export type Handle = (this: CompileContext, token: Token) => undefined | void

export type OnEnterError = (
  this: Omit<CompileContext, 'sliceSerialize'>,
  left: Token | undefined,
  right: Token
) => undefined

export type OnExitError = (
  this: Omit<CompileContext, 'sliceSerialize'>,
  left: Token,
  right: Token
) => undefined

export interface Options extends ParseOptions {
  mdastExtensions?: Array<Extension | Array<Extension>> | null | undefined
}

type TokenTuple = [token: Token, onError: OnEnterError | undefined]

export type Transform = (tree: Root) => Root | null | undefined | void

export function fromMarkdown(
  value: Value,
  encoding?: Encoding | null | undefined,
  options?: Options | null | undefined
): Root

export function fromMarkdown(
  value: Value,
  options?: Options | null | undefined
): Root

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    listItem: 'listItem'
  }

  interface Token {
    _spread?: boolean
  }
}
