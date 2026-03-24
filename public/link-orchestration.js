var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e5, o5) {
    if (this._$cssResult$ = true, o5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e5;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e5) => {
  const o5 = 1 === t4.length ? t4[0] : e5.reduce((e6, s4, o6) => e6 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o6 + 1], t4[0]);
  return new n(o5, t4, s);
};
var S = (s4, o5) => {
  if (e) s4.adoptedStyleSheets = o5.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e5 of o5) {
    const o6 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o6.setAttribute("nonce", n5), o6.textContent = e5.cssText, s4.appendChild(o6);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e5 = "";
  for (const s4 of t5.cssRules) e5 += s4.cssText;
  return r(e5);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e5, set: r4 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r4?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e5 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t4);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t5 = i5.getPropertyOptions(e5), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e5;
      const r4 = h3.fromAttribute(s4, t5.type);
      this[e5] = r4 ?? this._$Ej?.get(e5) ?? r4, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e5 = false, h3) {
    if (void 0 !== t4) {
      const r4 = this.constructor;
      if (false === e5 && (h3 = this[t4]), i5 ?? (i5 = r4.getPropertyOptions(t4)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r4._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r4) {
    i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r4 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r4) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e5 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e5 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t5) => this._$ET(t5, this[t5]))), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e5) {
    let r4;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r4 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r4.nodeType) {
        if (r4.hasAttributes()) for (const t5 of r4.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r4.getAttribute(t5).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r4.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r4.removeAttribute(t5));
        if (y2.test(r4.tagName)) {
          const t5 = r4.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r4.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r4.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r4.append(t5[i6], c3());
          }
        }
      } else if (8 === r4.nodeType) if (r4.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r4.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o5 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o5 && (h3?._$AO?.(false), void 0 === o5 ? h3 = void 0 : (h3 = new o5(t4), h3._$AT(t4, s4, e5)), void 0 !== e5 ? (s4._$Co ?? (s4._$Co = []))[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o5 = 0, n5 = 0, r4 = s4[0];
    for (; void 0 !== r4; ) {
      if (o5 === r4.index) {
        let i6;
        2 === r4.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r4.type ? i6 = new r4.ctor(h3, r4.name, r4.strings, this, t4) : 6 === r4.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r4 = s4[++n5];
      }
      o5 !== r4?.index && (h3 = P.nextNode(), o5++);
    }
    return P.currentNode = l2, e5;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e5 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t5 = new R(e5, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t4) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o5 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o5 = !a2(t4) || t4 !== this._$AH && t4 !== E, o5 && (this._$AH = t4);
    else {
      const e6 = t4;
      let n5, r4;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r4 = M(this, e6[s4 + n5], i5, n5), r4 === E && (r4 = this._$AH[n5]), o5 || (o5 = !a2(r4) || r4 !== this._$AH[n5]), r4 === A ? t4 = A : t4 !== A && (t4 += (r4 ?? "") + h3[n5 + 1]), this._$AH[n5] = r4;
    }
    o5 && !e5 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e5, h3) {
    super(t4, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.2");
var D = (t4, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t4 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t4.firstChild), t4;
  }
  update(t4) {
    const r4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r4, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t4) => (e5, o5) => {
  void 0 !== o5 ? o5.addInitializer(() => {
    customElements.define(t4, e5);
  }) : customElements.define(t4, e5);
};

// src/rdf-webcomponents/components/link-orchestration.ts
var ORCHESTRATED_ATTR = "data-orchestrated";
var ORCHESTRATOR_OWNER_ATTR = "data-orchestrator-owner";
var ORCHESTRATOR_STATE_ATTR = "data-orchestrator-state";
var ORCHESTRATED_INSTANCE_ATTR = "data-orchestrated-instance";
var LinkOrchestration = class extends i4 {
  constructor() {
    super(...arguments);
    this.debounceMs = 120;
    this.maxConcurrentPipelines = 4;
    this.allowRecursive = false;
    this._observer = null;
    this._scanTimer = null;
    this._active = 0;
    this._queue = [];
    this._records = /* @__PURE__ */ new Map();
    this._ownerId = `orchestrator-${Math.random().toString(36).slice(2, 10)}`;
    this._resolvedConfig = { rules: [] };
    this._configOverride = null;
    this._isConnected = false;
  }
  static get observedAttributes() {
    return ["config-src", "debounce-ms", "max-concurrent-pipelines", "allow-recursive"];
  }
  set config(value) {
    this._configOverride = value;
    if (this._isConnected) {
      void this.loadConfig();
    }
  }
  get config() {
    return this._configOverride;
  }
  render() {
    return b2`<slot></slot>`;
  }
  connectedCallback() {
    super.connectedCallback();
    this._isConnected = true;
    void this.loadConfig();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._isConnected = false;
    this.disconnectObserver();
    this.rollbackAll();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (oldValue === newValue) {
      return;
    }
    if (name === "config-src") {
      this.configSrc = newValue ?? void 0;
    }
    if (name === "debounce-ms") {
      const parsed = Number(newValue);
      this.debounceMs = Number.isFinite(parsed) ? parsed : 120;
    }
    if (name === "max-concurrent-pipelines") {
      const parsed = Number(newValue);
      this.maxConcurrentPipelines = Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
    }
    if (name === "allow-recursive") {
      this.allowRecursive = newValue !== null && newValue !== "false";
    }
    if (this._isConnected) {
      void this.loadConfig();
    }
  }
  async loadConfig() {
    try {
      const config = await this._resolveConfig();
      this._resolvedConfig = config;
      if (typeof config.debounceMs === "number") {
        this.debounceMs = config.debounceMs;
      }
      if (typeof config.maxConcurrentPipelines === "number") {
        this.maxConcurrentPipelines = Math.max(1, config.maxConcurrentPipelines);
      }
      if (typeof config.allowRecursive === "boolean") {
        this.allowRecursive = config.allowRecursive;
      }
      this._startObserver();
      await this.refresh();
    } catch (error) {
      this._emitEvent("orchestrator-link-error", {
        message: error instanceof Error ? error.message : String(error),
        phase: "config"
      });
    }
  }
  async refresh() {
    this._emitEvent("orchestrator-scan-start", {
      ownerId: this._ownerId,
      scope: this._isGlobal() ? "document" : "descendants"
    });
    const candidates = this._collectCandidates();
    const matched = this._matchCandidates(candidates);
    for (const [link, record] of this._records.entries()) {
      const expectedRule = this._findFirstMatchingRule(link);
      if (!expectedRule || expectedRule.id !== record.ruleId) {
        this._rollbackLink(link);
      }
    }
    for (const item of matched) {
      if (this._records.has(item.link)) {
        continue;
      }
      this._enqueue(async () => this._processMatch(item.link, item.rule));
    }
    this._drainQueue();
    this._emitEvent("orchestrator-scan-complete", {
      ownerId: this._ownerId,
      candidates: candidates.length,
      matched: matched.length,
      active: this._records.size
    });
  }
  rollbackAll() {
    const links = [...this._records.keys()];
    for (const link of links) {
      this._rollbackLink(link);
    }
  }
  disconnectObserver() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._scanTimer !== null) {
      window.clearTimeout(this._scanTimer);
      this._scanTimer = null;
    }
  }
  _startObserver() {
    this.disconnectObserver();
    const root = this._scopeRoot();
    this._observer = new MutationObserver((mutations) => {
      if (this._shouldIgnoreMutations(mutations)) {
        return;
      }
      if (this._scanTimer !== null) {
        window.clearTimeout(this._scanTimer);
      }
      this._scanTimer = window.setTimeout(() => {
        void this.refresh();
      }, this.debounceMs);
    });
    this._observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["href", "class", "src"]
    });
  }
  async _resolveConfig() {
    if (this._configOverride) {
      return this._configOverride;
    }
    const inlineScript = this.querySelector('script[type="application/json"]');
    if (inlineScript?.textContent?.trim()) {
      return this._parseConfig(inlineScript.textContent);
    }
    if (this.configSrc) {
      const response = await fetch(this.configSrc);
      if (!response.ok) {
        throw new Error(`Failed to fetch config from ${this.configSrc}: ${response.status} ${response.statusText}`);
      }
      const content = await response.text();
      return this._parseConfig(content);
    }
    return { rules: [] };
  }
  _parseConfig(raw) {
    const parsed = JSON.parse(raw);
    return {
      debounceMs: parsed.debounceMs,
      maxConcurrentPipelines: parsed.maxConcurrentPipelines,
      allowRecursive: parsed.allowRecursive,
      decorators: parsed.decorators,
      rules: Array.isArray(parsed.rules) ? parsed.rules : []
    };
  }
  _collectCandidates() {
    const root = this._scopeRoot();
    const links = Array.from(root.querySelectorAll("a[href]"));
    return links.filter((link) => {
      if (!this.allowRecursive && link.closest(`[${ORCHESTRATED_INSTANCE_ATTR}="true"]`)) {
        return false;
      }
      if (this._isGlobal() && this._isOwnedByBodyOrchestrator(link)) {
        return false;
      }
      const owner = link.getAttribute(ORCHESTRATOR_OWNER_ATTR);
      if (owner && owner !== this._ownerId) {
        return false;
      }
      return true;
    });
  }
  _matchCandidates(candidates) {
    const matches = [];
    for (const link of candidates) {
      const rule = this._findFirstMatchingRule(link);
      if (rule) {
        matches.push({ link, rule });
      }
    }
    return matches;
  }
  _findFirstMatchingRule(link) {
    for (const rule of this._resolvedConfig.rules) {
      if (!rule || !rule.id || rule.enabled === false) {
        continue;
      }
      if (this._matchesRule(link, rule)) {
        return rule;
      }
    }
    return null;
  }
  _shouldIgnoreMutations(mutations) {
    if (mutations.length === 0) {
      return true;
    }
    return mutations.every((mutation) => {
      const targetNode = mutation.target;
      const isInternalTarget = !!targetNode?.closest?.(`[${ORCHESTRATED_INSTANCE_ATTR}="true"]`);
      const addedAllInternal = Array.from(mutation.addedNodes).every((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return true;
        }
        return !!node.closest?.(`[${ORCHESTRATED_INSTANCE_ATTR}="true"]`) || node.hasAttribute?.(ORCHESTRATED_INSTANCE_ATTR);
      });
      const removedAllInternal = Array.from(mutation.removedNodes).every((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return true;
        }
        const element = node;
        return element.hasAttribute?.(ORCHESTRATED_INSTANCE_ATTR) || !!element.querySelector?.(`[${ORCHESTRATED_INSTANCE_ATTR}="true"]`);
      });
      return isInternalTarget && addedAllInternal && removedAllInternal;
    });
  }
  _matchesRule(link, rule) {
    const match = rule.match;
    if (!match || match.enabled === false) {
      return false;
    }
    if (match.css) {
      try {
        if (!link.matches(match.css)) {
          return false;
        }
      } catch {
        return false;
      }
    }
    if (match.xpath && !this._matchesXPath(link, match.xpath)) {
      return false;
    }
    if (match.parentCss) {
      try {
        if (!link.closest(match.parentCss)) {
          return false;
        }
      } catch {
        return false;
      }
    }
    if (match.urlPattern && !this._globMatch(link.href, match.urlPattern)) {
      return false;
    }
    if (match.urlRegex) {
      let regex;
      try {
        regex = new RegExp(match.urlRegex);
      } catch {
        return false;
      }
      if (!regex.test(link.href)) {
        return false;
      }
    }
    if (match.hostEquals) {
      const url = this._safeUrl(link.href);
      if (!url || url.hostname !== match.hostEquals) {
        return false;
      }
    }
    if (match.pathStartsWith) {
      const url = this._safeUrl(link.href);
      if (!url || !url.pathname.startsWith(match.pathStartsWith)) {
        return false;
      }
    }
    const contentType = rule.overrideContentType || this._detectContentType(link);
    if (match.contentType && contentType !== match.contentType) {
      return false;
    }
    return true;
  }
  _matchesXPath(link, xpath) {
    try {
      const root = this._scopeRoot();
      const result = document.evaluate(
        xpath,
        root,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      for (let i5 = 0; i5 < result.snapshotLength; i5 += 1) {
        const node = result.snapshotItem(i5);
        if (node === link) {
          return true;
        }
      }
    } catch {
      return false;
    }
    return false;
  }
  _safeUrl(value) {
    try {
      return new URL(value, document.baseURI);
    } catch {
      return null;
    }
  }
  _globMatch(value, pattern) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    const regex = new RegExp(`^${escaped}$`);
    return regex.test(value);
  }
  _detectContentType(link) {
    const hasMedia = !!link.querySelector("img, picture, video, svg, canvas");
    return hasMedia ? "image" : "text";
  }
  _enqueue(task) {
    this._queue.push(task);
  }
  _drainQueue() {
    while (this._active < this.maxConcurrentPipelines && this._queue.length > 0) {
      const task = this._queue.shift();
      if (!task) {
        break;
      }
      this._active += 1;
      void task().finally(() => {
        this._active -= 1;
        this._drainQueue();
      });
    }
  }
  async _processMatch(link, rule) {
    const decorators = this._resolveDecorators(rule);
    const contentType = rule.overrideContentType || this._detectContentType(link);
    this._emitEvent("orchestrator-link-loading", {
      ownerId: this._ownerId,
      href: link.href,
      ruleId: rule.id,
      contentType
    });
    const record = {
      link,
      ruleId: rule.id,
      ownerId: this._ownerId,
      pipelineHost: null,
      displayElement: null,
      adapterElement: null,
      iconElement: null,
      state: "loading"
    };
    this._records.set(link, record);
    link.setAttribute(ORCHESTRATED_ATTR, "true");
    link.setAttribute(ORCHESTRATOR_OWNER_ATTR, this._ownerId);
    link.setAttribute(ORCHESTRATOR_STATE_ATTR, "loading");
    if (decorators.enabled && contentType === "text") {
      record.iconElement = this._setLifecycleIcon(link, decorators.icons?.loading ?? "\u23F3");
    }
    try {
      const staged = await this._createStagedPipeline(link, rule);
      this._commitPipeline(link, record, staged, decorators, contentType);
      this._emitEvent("orchestrator-link-ready", {
        ownerId: this._ownerId,
        href: link.href,
        ruleId: rule.id,
        contentType
      });
    } catch (error) {
      this._cleanupRecord(record);
      link.removeAttribute(ORCHESTRATED_ATTR);
      link.removeAttribute(ORCHESTRATOR_OWNER_ATTR);
      link.removeAttribute(ORCHESTRATOR_STATE_ATTR);
      this._emitEvent("orchestrator-link-error", {
        ownerId: this._ownerId,
        href: link.href,
        ruleId: rule.id,
        message: error instanceof Error ? error.message : String(error),
        phase: "pipeline"
      });
      this._records.delete(link);
    }
  }
  _resolveDecorators(rule) {
    return {
      ...this._resolvedConfig.decorators,
      ...rule.decorators,
      icons: {
        ...this._resolvedConfig.decorators?.icons,
        ...rule.decorators?.icons
      }
    };
  }
  _setLifecycleIcon(link, icon) {
    const existing = link.querySelector(":scope > .orchestrator-icon");
    if (existing) {
      existing.textContent = icon;
      return existing;
    }
    const iconElement = document.createElement("span");
    iconElement.className = "orchestrator-icon";
    iconElement.setAttribute("aria-hidden", "true");
    iconElement.textContent = icon;
    link.prepend(iconElement);
    return iconElement;
  }
  async _createStagedPipeline(link, rule) {
    const adapter = document.createElement("source-rdf");
    adapter.setAttribute("url", rule.adapter?.url ?? link.href);
    this._applyAdapterConfig(adapter, rule.adapter);
    const lens = document.createElement("rdf-lens");
    this._applyLensConfig(lens, rule.lens);
    lens.appendChild(adapter);
    const display = document.createElement("lens-display");
    const inlineTemplateBlobUrl = this._applyDisplayConfig(display, rule.display);
    display.appendChild(lens);
    await this._awaitPipeline(display);
    return {
      display,
      lens,
      adapter,
      inlineTemplateBlobUrl
    };
  }
  _applyAdapterConfig(adapter, config) {
    if (!config) {
      return;
    }
    const rdfConfig = this._buildAdapterConfigRdf(config);
    if (rdfConfig) {
      adapter.setAttribute("config", rdfConfig);
    }
  }
  _buildAdapterConfigRdf(config) {
    const triples = [];
    if (config.url) triples.push(`srdf:url ${this._iriOrString(config.url)}`);
    if (config.format) triples.push(`srdf:format ${this._ttlString(config.format)}`);
    if (config.strategy) triples.push(`srdf:strategy ${this._ttlString(config.strategy)}`);
    if (config.subject) triples.push(`srdf:subject ${this._iriOrString(config.subject)}`);
    if (config.subjectQuery) triples.push(`srdf:subjectQuery ${this._ttlString(config.subjectQuery)}`);
    if (config.subjectClass) triples.push(`srdf:subjectClass ${this._iriOrString(config.subjectClass)}`);
    if (typeof config.depth === "number") triples.push(`srdf:depth ${config.depth}`);
    if (config.cache) triples.push(`srdf:cache ${this._ttlString(config.cache)}`);
    if (typeof config.cacheTtl === "number") triples.push(`srdf:cacheTtl ${config.cacheTtl}`);
    if (typeof config.shared === "boolean") triples.push(`srdf:shared ${config.shared}`);
    if (config.headers) triples.push(`srdf:headers ${this._ttlString(JSON.stringify(config.headers))}`);
    if (triples.length === 0) {
      return "";
    }
    return [
      "@prefix srdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/source-rdf.ttl#> .",
      "",
      `[] a srdf:SourceRdfConfig ;
  ${triples.join(" ;\n  ")} .`
    ].join("\n");
  }
  _ttlString(value) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  }
  _iriOrString(value) {
    if (/^https?:\/\//i.test(value)) {
      return `<${value}>`;
    }
    return this._ttlString(value);
  }
  _applyLensConfig(lens, config) {
    if (!config) {
      return;
    }
    const rdfConfig = this._buildLensConfigRdf(config);
    if (rdfConfig) {
      lens.setAttribute("config", rdfConfig);
    }
  }
  _buildLensConfigRdf(config) {
    const triples = [];
    if (config.shapeFile) triples.push(`lrdf:shapeFile ${this._iriOrString(config.shapeFile)}`);
    if (config.shapeClass) triples.push(`lrdf:shapeClass ${this._iriOrString(config.shapeClass)}`);
    if (config.shapes) triples.push(`lrdf:shapes ${this._ttlString(config.shapes)}`);
    if (typeof config.strict === "boolean") triples.push(`lrdf:strict ${config.strict}`);
    if (typeof config.multiple === "boolean") triples.push(`lrdf:multiple ${config.multiple}`);
    if (config.subject) triples.push(`lrdf:subject ${this._iriOrString(config.subject)}`);
    if (triples.length === 0) {
      return "";
    }
    return [
      "@prefix lrdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/rdf-lens.ttl#> .",
      "",
      `[] a lrdf:RdfLensConfig ;
  ${triples.join(" ;\n  ")} .`
    ].join("\n");
  }
  _applyDisplayConfig(display, config) {
    if (!config) {
      return void 0;
    }
    const rdfConfig = this._buildDisplayConfigRdf(config);
    if (rdfConfig) {
      display.config = rdfConfig;
    }
    if (config.templateInline && !config.template) {
      const blob = new Blob([config.templateInline], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      display.setAttribute("template", url);
      return url;
    }
    if (config.template) {
      display.setAttribute("template", config.template);
    }
    return void 0;
  }
  _buildDisplayConfigRdf(config) {
    const triples = [];
    if (config.theme) triples.push(`drdf:theme ${this._ttlString(config.theme)}`);
    if (config.class) triples.push(`drdf:class ${this._ttlString(config.class)}`);
    if (triples.length === 0) {
      return "";
    }
    return [
      "@prefix drdf: <https://cedricdcc.github.io/RDF-webcomponents/ns/lens-display.ttl#> .",
      "",
      `[] a drdf:LensDisplayConfig ;
  ${triples.join(" ;\n  ")} .`
    ].join("\n");
  }
  _awaitPipeline(display) {
    return new Promise((resolve, reject) => {
      const stage = document.createElement("div");
      stage.style.display = "none";
      stage.appendChild(display);
      document.body.appendChild(stage);
      const done = () => {
        display.removeEventListener("render-complete", onReady);
        display.removeEventListener("render-error", onError);
        display.removeEventListener("shape-error", onError);
        display.removeEventListener("triplestore-error", onError);
        stage.remove();
      };
      const onReady = () => {
        done();
        resolve();
      };
      const onError = (event) => {
        done();
        const detail = event.detail;
        reject(new Error(detail?.message || "Pipeline failed"));
      };
      display.addEventListener("render-complete", onReady, { once: true });
      display.addEventListener("render-error", onError, { once: true });
      display.addEventListener("shape-error", onError, { once: true });
      display.addEventListener("triplestore-error", onError, { once: true });
    });
  }
  _commitPipeline(link, record, staged, decorators, contentType) {
    const parent = link.parentNode;
    if (!parent) {
      throw new Error("Target link has no parent node");
    }
    const host = document.createElement("span");
    host.className = "orchestrated-link-host";
    host.setAttribute(ORCHESTRATED_INSTANCE_ATTR, "true");
    host.setAttribute(ORCHESTRATOR_OWNER_ATTR, this._ownerId);
    if (decorators.enabled && contentType === "text") {
      const icon = document.createElement("span");
      icon.className = "orchestrator-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = decorators.icons?.ready ?? "\u2705";
      host.appendChild(icon);
      record.iconElement?.remove();
      record.iconElement = icon;
    } else if (record.iconElement) {
      record.iconElement.remove();
      record.iconElement = null;
    }
    const adapterElement = staged.adapter;
    link.hidden = true;
    link.setAttribute("aria-hidden", "true");
    adapterElement.appendChild(link);
    host.appendChild(staged.display);
    parent.appendChild(host);
    record.pipelineHost = host;
    record.displayElement = staged.display;
    record.adapterElement = adapterElement;
    record.inlineTemplateBlobUrl = staged.inlineTemplateBlobUrl;
    record.state = "ready";
    link.setAttribute(ORCHESTRATOR_STATE_ATTR, "ready");
  }
  _rollbackLink(link) {
    const record = this._records.get(link);
    if (!record) {
      return;
    }
    if (record.pipelineHost && record.pipelineHost.parentNode) {
      const originalParent = record.pipelineHost.parentNode;
      link.hidden = false;
      link.removeAttribute("aria-hidden");
      originalParent.insertBefore(link, record.pipelineHost);
      record.pipelineHost.remove();
    }
    link.removeAttribute(ORCHESTRATED_ATTR);
    link.removeAttribute(ORCHESTRATOR_OWNER_ATTR);
    link.setAttribute(ORCHESTRATOR_STATE_ATTR, "rolled-back");
    this._cleanupRecord(record);
    this._records.delete(link);
    this._emitEvent("orchestrator-link-rollback", {
      ownerId: this._ownerId,
      href: link.href,
      ruleId: record.ruleId
    });
  }
  _cleanupRecord(record) {
    if (record.iconElement) {
      record.iconElement.remove();
      record.iconElement = null;
    }
    if (record.inlineTemplateBlobUrl) {
      URL.revokeObjectURL(record.inlineTemplateBlobUrl);
      record.inlineTemplateBlobUrl = void 0;
    }
    if (record.pipelineHost) {
      record.pipelineHost.remove();
      record.pipelineHost = null;
    }
  }
  _scopeRoot() {
    if (this._isGlobal()) {
      return document;
    }
    return this;
  }
  _isGlobal() {
    return this.parentElement?.tagName === "HEAD";
  }
  _isOwnedByBodyOrchestrator(link) {
    const orchestrators = Array.from(document.querySelectorAll("body link-orchestration"));
    for (const orchestrator of orchestrators) {
      if (orchestrator !== this && orchestrator.contains(link)) {
        return true;
      }
    }
    return false;
  }
  _emitEvent(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    }));
  }
};
LinkOrchestration.styles = i`
    :host {
      display: contents;
    }

    .orchestrator-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.35rem;
      font-size: 0.875em;
      line-height: 1;
    }

    .orchestrated-link-host {
      display: contents;
    }
  `;
LinkOrchestration = __decorateClass([
  t3("link-orchestration")
], LinkOrchestration);
export {
  LinkOrchestration
};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
