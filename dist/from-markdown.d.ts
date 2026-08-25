export interface ParseOptions {
  gfm?: boolean
  breaks?: boolean
  math?: boolean
  allowDangerousHtml?: boolean
  singleTilde?: boolean
}

export interface Node {
  type: string
  [key: string]: unknown
}

export interface Root {
  type: "root"
  children: Node[]
}

export function fromMarkdown(
  value: string,
  encodingOrOptions?: string | ParseOptions,
  options?: ParseOptions,
): Root

export default fromMarkdown
