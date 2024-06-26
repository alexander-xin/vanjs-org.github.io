export interface State<T> {
  val: T
  readonly oldVal: T
}

// Defining readonly view of State<T> for covariance.
// Basically we want StateView<string> to implement StateView<string | number>
export type StateView<T> = Readonly<State<T>>

export type Primitive = string | number | boolean | bigint

export type PropValue = Primitive | ((e: any) => void) | null

export type Props = Record<string, PropValue | StateView<PropValue> | (() => PropValue)>

export type ValidChildDomValue<ElementType, TextNodeType> =
  Primitive | ElementType | TextNodeType | null | undefined

export type BindingFunc<ElementType, TextNodeType> =
  | ((dom?: ElementType | TextNodeType) => ValidChildDomValue<ElementType, TextNodeType>)
  | ((dom?: ElementType) => ElementType)

export type ChildDom<ElementType, TextNodeType> =
  | ValidChildDomValue<ElementType, TextNodeType>
  | StateView<Primitive | null | undefined>
  | BindingFunc<ElementType, TextNodeType>
  | readonly ChildDom<ElementType, TextNodeType>[]

type AddFunc<ElementType, TextNodeType> =
  (dom: ElementType, ...children: readonly ChildDom<ElementType, TextNodeType>[]) => ElementType

export type TagFunc<ElementType, TextNodeType, ResultType = ElementType> =
  (first?: Props | ChildDom<ElementType, TextNodeType>,
    ...rest: readonly ChildDom<ElementType, TextNodeType>[]) => ResultType

type Tags<ElementType, TextNodeType> = Readonly<Record<string, TagFunc<ElementType, TextNodeType>>>

// Tags type in browser context, which contains the signatures to tag functions that return
// specialized DOM elements.
type BrowserTags = Tags<Element, Text> & {
  [K in keyof HTMLElementTagNameMap]: TagFunc<Element, Text, HTMLElementTagNameMap[K]>
}

export interface VanObj<ElementType, TextNodeType> {
  readonly state: <T>(initVal: T) => State<T>
  readonly val: <T>(s: T | StateView<T>) => T
  readonly oldVal: <T>(s: T | StateView<T>) => T
  readonly derive: <T>(f: () => T) => State<T>
  readonly add: AddFunc<ElementType, TextNodeType>
  readonly _: (f: () => PropValue) => () => PropValue
  readonly tags: Tags<ElementType, TextNodeType>
  readonly tagsNS: (namespaceURI: string) => Tags<ElementType, TextNodeType>

  // Mini-Van specific API
  html: (first?: Props | ChildDom<ElementType, TextNodeType>,
    ...rest: readonly ChildDom<ElementType, TextNodeType>[]) => string
}

export interface Van extends VanObj<Element, Text> {
  readonly vanWithDoc: <ElementType, TextNodeType>(doc: {
    createElement(s: any): ElementType,
    createTextNode(s: any): TextNodeType,
  }) => VanObj<ElementType, TextNodeType>
  readonly tags: BrowserTags
}

declare const van: Van

export default van
