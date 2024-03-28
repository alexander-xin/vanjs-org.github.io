/// <reference types="./mini-van.d.ts" />

// This file consistently uses `let` keyword instead of `const` for reducing the bundle size.

// Aliasing some builtin symbols to reduce the bundle size.
let Obj = Object, protoOf = Obj.getPrototypeOf, _undefined

let vanWithDoc = doc => {
  let propSetterCache = {}

  let _result = {
    add: (dom, ...children) =>
      (dom.append(...children.flat(Infinity).filter(c => c != _undefined)), dom),

    tags: new Proxy((name, ...args) => {
      let [props, ...children] = args[0]?.constructor === Obj ? args : [{}, ...args]
      let dom = doc.createElement(name)
      for (let [k, v] of Obj.entries(props)) {
        let getPropDescriptor = proto => proto ?
        Obj.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) :
        _undefined
        let cacheKey = name + "," + k
        let propSetter = propSetterCache[cacheKey] ??
          (propSetterCache[cacheKey] = getPropDescriptor(protoOf(dom))?.set ?? 0)
        propSetter ? propSetter.call(dom, v) : dom.setAttribute(k, v)
      }
      return _result.add(dom, ...children)
    }, {get: (tag, name) => tag.bind(null, name)}),

    "html": (...args) => "<!DOCTYPE html>" + _result.tags.html(...args).outerHTML,
  }
  return _result
}

export default {"vanWithDoc": vanWithDoc,
  ...vanWithDoc(typeof window !== "undefined" ? window.document : null)}
