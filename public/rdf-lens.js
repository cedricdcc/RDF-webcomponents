var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i5 = 0, len = code.length; i5 < len; ++i5) {
      lookup[i5] = code[i5];
      revLookup[code.charCodeAt(i5)] = i5;
    }
    var i5;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i6;
      for (i6 = 0; i6 < len2; i6 += 4) {
        tmp = revLookup[b64.charCodeAt(i6)] << 18 | revLookup[b64.charCodeAt(i6 + 1)] << 12 | revLookup[b64.charCodeAt(i6 + 2)] << 6 | revLookup[b64.charCodeAt(i6 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i6)] << 2 | revLookup[b64.charCodeAt(i6 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i6)] << 10 | revLookup[b64.charCodeAt(i6 + 1)] << 4 | revLookup[b64.charCodeAt(i6 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i6 = start; i6 < end; i6 += 3) {
        tmp = (uint8[i6] << 16 & 16711680) + (uint8[i6 + 1] << 8 & 65280) + (uint8[i6 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i6 = 0, len22 = len2 - extraBytes; i6 < len22; i6 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i6, i6 + maxChunkLength > len22 ? len22 : i6 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
        );
      }
      return parts.join("");
    }
  }
});

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "node_modules/ieee754/index.js"(exports) {
    "use strict";
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e5, m2;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i5 = isLE ? nBytes - 1 : 0;
      var d3 = isLE ? -1 : 1;
      var s4 = buffer[offset + i5];
      i5 += d3;
      e5 = s4 & (1 << -nBits) - 1;
      s4 >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e5 = e5 * 256 + buffer[offset + i5], i5 += d3, nBits -= 8) {
      }
      m2 = e5 & (1 << -nBits) - 1;
      e5 >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m2 = m2 * 256 + buffer[offset + i5], i5 += d3, nBits -= 8) {
      }
      if (e5 === 0) {
        e5 = 1 - eBias;
      } else if (e5 === eMax) {
        return m2 ? NaN : (s4 ? -1 : 1) * Infinity;
      } else {
        m2 = m2 + Math.pow(2, mLen);
        e5 = e5 - eBias;
      }
      return (s4 ? -1 : 1) * m2 * Math.pow(2, e5 - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e5, m2, c4;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i5 = isLE ? 0 : nBytes - 1;
      var d3 = isLE ? 1 : -1;
      var s4 = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m2 = isNaN(value) ? 1 : 0;
        e5 = eMax;
      } else {
        e5 = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c4 = Math.pow(2, -e5)) < 1) {
          e5--;
          c4 *= 2;
        }
        if (e5 + eBias >= 1) {
          value += rt / c4;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c4 >= 2) {
          e5++;
          c4 /= 2;
        }
        if (e5 + eBias >= eMax) {
          m2 = 0;
          e5 = eMax;
        } else if (e5 + eBias >= 1) {
          m2 = (value * c4 - 1) * Math.pow(2, mLen);
          e5 = e5 + eBias;
        } else {
          m2 = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e5 = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i5] = m2 & 255, i5 += d3, m2 /= 256, mLen -= 8) {
      }
      e5 = e5 << mLen | m2;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i5] = e5 & 255, i5 += d3, e5 /= 256, eLen -= 8) {
      }
      buffer[offset + i5 - d3] |= s4 * 128;
    };
  }
});

// node_modules/buffer/index.js
var require_buffer = __commonJS({
  "node_modules/buffer/index.js"(exports) {
    "use strict";
    var base64 = require_base64_js();
    var ieee754 = require_ieee754();
    var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer3;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
      );
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e5) {
        return false;
      }
    }
    Object.defineProperty(Buffer3.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this)) return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer3.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this)) return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    function Buffer3(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer3.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value);
      }
      if (value == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      }
      const valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer3.from(valueOf, encodingOrOffset, length);
      }
      const b3 = fromObject(value);
      if (b3) return b3;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
        return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
      );
    }
    Buffer3.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer3, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer3.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer3.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer3.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer3.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length = byteLength(string, encoding) | 0;
      let buf = createBuffer(length);
      const actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i5 = 0; i5 < length; i5 += 1) {
        buf[i5] = array[i5] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer3.isBuffer(obj)) {
        const len = checked(obj.length) | 0;
        const buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer3.alloc(+length);
    }
    Buffer3.isBuffer = function isBuffer(b3) {
      return b3 != null && b3._isBuffer === true && b3 !== Buffer3.prototype;
    };
    Buffer3.compare = function compare(a3, b3) {
      if (isInstance(a3, Uint8Array)) a3 = Buffer3.from(a3, a3.offset, a3.byteLength);
      if (isInstance(b3, Uint8Array)) b3 = Buffer3.from(b3, b3.offset, b3.byteLength);
      if (!Buffer3.isBuffer(a3) || !Buffer3.isBuffer(b3)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      }
      if (a3 === b3) return 0;
      let x2 = a3.length;
      let y3 = b3.length;
      for (let i5 = 0, len = Math.min(x2, y3); i5 < len; ++i5) {
        if (a3[i5] !== b3[i5]) {
          x2 = a3[i5];
          y3 = b3[i5];
          break;
        }
      }
      if (x2 < y3) return -1;
      if (y3 < x2) return 1;
      return 0;
    };
    Buffer3.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer3.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer3.alloc(0);
      }
      let i5;
      if (length === void 0) {
        length = 0;
        for (i5 = 0; i5 < list.length; ++i5) {
          length += list[i5].length;
        }
      }
      const buffer = Buffer3.allocUnsafe(length);
      let pos = 0;
      for (i5 = 0; i5 < list.length; ++i5) {
        let buf = list[i5];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
            buf.copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(
              buffer,
              buf,
              pos
            );
          }
        } else if (!Buffer3.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string, encoding) {
      if (Buffer3.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
        );
      }
      const len = string.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer3.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding) encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer3.prototype._isBuffer = true;
    function swap(b3, n5, m2) {
      const i5 = b3[n5];
      b3[n5] = b3[m2];
      b3[m2] = i5;
    }
    Buffer3.prototype.swap16 = function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i5 = 0; i5 < len; i5 += 2) {
        swap(this, i5, i5 + 1);
      }
      return this;
    };
    Buffer3.prototype.swap32 = function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i5 = 0; i5 < len; i5 += 4) {
        swap(this, i5, i5 + 3);
        swap(this, i5 + 1, i5 + 2);
      }
      return this;
    };
    Buffer3.prototype.swap64 = function swap64() {
      const len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i5 = 0; i5 < len; i5 += 8) {
        swap(this, i5, i5 + 7);
        swap(this, i5 + 1, i5 + 6);
        swap(this, i5 + 2, i5 + 5);
        swap(this, i5 + 3, i5 + 4);
      }
      return this;
    };
    Buffer3.prototype.toString = function toString() {
      const length = this.length;
      if (length === 0) return "";
      if (arguments.length === 0) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
    Buffer3.prototype.equals = function equals(b3) {
      if (!Buffer3.isBuffer(b3)) throw new TypeError("Argument must be a Buffer");
      if (this === b3) return true;
      return Buffer3.compare(this, b3) === 0;
    };
    Buffer3.prototype.inspect = function inspect() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max) str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
    }
    Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer3.from(target, target.offset, target.byteLength);
      }
      if (!Buffer3.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
        );
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      let x2 = thisEnd - thisStart;
      let y3 = end - start;
      const len = Math.min(x2, y3);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i5 = 0; i5 < len; ++i5) {
        if (thisCopy[i5] !== targetCopy[i5]) {
          x2 = thisCopy[i5];
          y3 = targetCopy[i5];
          break;
        }
      }
      if (x2 < y3) return -1;
      if (y3 < x2) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
      }
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
      }
      if (typeof val === "string") {
        val = Buffer3.from(val, encoding);
      }
      if (Buffer3.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i6) {
        if (indexSize === 1) {
          return buf[i6];
        } else {
          return buf.readUInt16BE(i6 * indexSize);
        }
      }
      let i5;
      if (dir) {
        let foundIndex = -1;
        for (i5 = byteOffset; i5 < arrLength; i5++) {
          if (read(arr, i5) === read(val, foundIndex === -1 ? 0 : i5 - foundIndex)) {
            if (foundIndex === -1) foundIndex = i5;
            if (i5 - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i5 -= i5 - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i5 = byteOffset; i5 >= 0; i5--) {
          let found = true;
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i5 + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found) return i5;
        }
      }
      return -1;
    }
    Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      const strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      let i5;
      for (i5 = 0; i5 < length; ++i5) {
        const parsed = parseInt(string.substr(i5 * 2, 2), 16);
        if (numberIsNaN(parsed)) return i5;
        buf[offset + i5] = parsed;
      }
      return i5;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer3.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0) encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      }
      const remaining = this.length - offset;
      if (length === void 0 || length > remaining) length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding) encoding = "utf8";
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer3.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i5 = start;
      while (i5 < end) {
        const firstByte = buf[i5];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i5 + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i5 + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i5 + 1];
              thirdByte = buf[i5 + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i5 + 1];
              thirdByte = buf[i5 + 2];
              fourthByte = buf[i5 + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i5 += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i5 = 0;
      while (i5 < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i5, i5 += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i5 = start; i5 < end; ++i5) {
        ret += String.fromCharCode(buf[i5] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i5 = start; i5 < end; ++i5) {
        ret += String.fromCharCode(buf[i5]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      const len = buf.length;
      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;
      let out = "";
      for (let i5 = start; i5 < end; ++i5) {
        out += hexSliceLookupTable[buf[i5]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i5 = 0; i5 < bytes.length - 1; i5 += 2) {
        res += String.fromCharCode(bytes[i5] + bytes[i5 + 1] * 256);
      }
      return res;
    }
    Buffer3.prototype.slice = function slice(start, end) {
      const len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start) end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer3.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i5 = 0;
      while (++i5 < byteLength2 && (mul *= 256)) {
        val += this[offset + i5] * mul;
      }
      return val;
    };
    Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      let val = this[offset + --byteLength2];
      let mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    });
    Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    });
    Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i5 = 0;
      while (++i5 < byteLength2 && (mul *= 256)) {
        val += this[offset + i5] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let i5 = byteLength2;
      let mul = 1;
      let val = this[offset + --i5];
      while (i5 > 0 && (mul *= 256)) {
        val += this[offset + --i5] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128)) return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    });
    Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + // Overflow
      this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    });
    Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let mul = 1;
      let i5 = 0;
      this[offset] = value & 255;
      while (++i5 < byteLength2 && (mul *= 256)) {
        this[offset + i5] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let i5 = byteLength2 - 1;
      let mul = 1;
      this[offset + i5] = value & 255;
      while (--i5 >= 0 && (mul *= 256)) {
        this[offset + i5] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 255;
      return offset + 4;
    };
    Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    function wrtBigUInt64LE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    function wrtBigUInt64BE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i5 = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value & 255;
      while (++i5 < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i5 - 1] !== 0) {
          sub = 1;
        }
        this[offset + i5] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i5 = byteLength2 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i5] = value & 255;
      while (--i5 >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i5 + 1] !== 0) {
          sub = 1;
        }
        this[offset + i5] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
      if (value < 0) value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0) value = 4294967295 + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        );
      }
      return len;
    };
    Buffer3.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val) val = 0;
      let i5;
      if (typeof val === "number") {
        for (i5 = start; i5 < end; ++i5) {
          this[i5] = val;
        }
      } else {
        const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i5 = 0; i5 < end - start; ++i5) {
          this[i5 + start] = bytes[i5 % len];
        }
      }
      return this;
    };
    var errors = {};
    function E2(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value,
            writable: true
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      };
    }
    E2(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(name) {
        if (name) {
          return `${name} is outside of buffer bounds`;
        }
        return "Attempt to access memory outside buffer bounds";
      },
      RangeError
    );
    E2(
      "ERR_INVALID_ARG_TYPE",
      function(name, actual) {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
      },
      TypeError
    );
    E2(
      "ERR_OUT_OF_RANGE",
      function(str, range, input) {
        let msg = `The value of "${str}" is out of range.`;
        let received = input;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
          received = String(input);
          if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
            received = addNumericalSeparator(received);
          }
          received += "n";
        }
        msg += ` It must be ${range}. Received ${received}`;
        return msg;
      },
      RangeError
    );
    function addNumericalSeparator(val) {
      let res = "";
      let i5 = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i5 >= start + 4; i5 -= 3) {
        res = `_${val.slice(i5 - 3, i5)}${res}`;
      }
      return `${val.slice(0, i5)}${res}`;
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
    function checkIntBI(value, min, max, buf, offset, byteLength2) {
      if (value > max || value < min) {
        const n5 = typeof min === "bigint" ? "n" : "";
        let range;
        if (byteLength2 > 3) {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n5} and < 2${n5} ** ${(byteLength2 + 1) * 8}${n5}`;
          } else {
            range = `>= -(2${n5} ** ${(byteLength2 + 1) * 8 - 1}${n5}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n5}`;
          }
        } else {
          range = `>= ${min}${n5} and <= ${max}${n5}`;
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value);
      }
      checkBounds(buf, offset, byteLength2);
    }
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
      }
    }
    function boundsError(value, length, type) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type);
        throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE(
        type || "offset",
        `>= ${type ? 1 : 0} and <= ${length}`,
        value
      );
    }
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity;
      let codePoint;
      const length = string.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i5 = 0; i5 < length; ++i5) {
        codePoint = string.charCodeAt(i5);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            } else if (i5 + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push(
            codePoint >> 6 | 192,
            codePoint & 63 | 128
          );
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(
            codePoint >> 12 | 224,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break;
          bytes.push(
            codePoint >> 18 | 240,
            codePoint >> 12 & 63 | 128,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i5 = 0; i5 < str.length; ++i5) {
        byteArray.push(str.charCodeAt(i5) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      let c4, hi, lo;
      const byteArray = [];
      for (let i5 = 0; i5 < str.length; ++i5) {
        if ((units -= 2) < 0) break;
        c4 = str.charCodeAt(i5);
        hi = c4 >> 8;
        lo = c4 % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      let i5;
      for (i5 = 0; i5 < length; ++i5) {
        if (i5 + offset >= dst.length || i5 >= src.length) break;
        dst[i5 + offset] = src[i5];
      }
      return i5;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    var hexSliceLookupTable = (function() {
      const alphabet = "0123456789abcdef";
      const table = new Array(256);
      for (let i5 = 0; i5 < 16; ++i5) {
        const i16 = i5 * 16;
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i5] + alphabet[j];
        }
      }
      return table;
    })();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
  }
});

// node_modules/n3/src/IRIs.js
var RDF, XSD, SWAP, IRIs_default;
var init_IRIs = __esm({
  "node_modules/n3/src/IRIs.js"() {
    "use strict";
    RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
    XSD = "http://www.w3.org/2001/XMLSchema#";
    SWAP = "http://www.w3.org/2000/10/swap/";
    IRIs_default = {
      xsd: {
        decimal: `${XSD}decimal`,
        boolean: `${XSD}boolean`,
        double: `${XSD}double`,
        integer: `${XSD}integer`,
        string: `${XSD}string`
      },
      rdf: {
        type: `${RDF}type`,
        nil: `${RDF}nil`,
        first: `${RDF}first`,
        rest: `${RDF}rest`,
        langString: `${RDF}langString`,
        dirLangString: `${RDF}dirLangString`,
        reifies: `${RDF}reifies`
      },
      owl: {
        sameAs: "http://www.w3.org/2002/07/owl#sameAs"
      },
      r: {
        forSome: `${SWAP}reify#forSome`,
        forAll: `${SWAP}reify#forAll`
      },
      log: {
        implies: `${SWAP}log#implies`,
        isImpliedBy: `${SWAP}log#isImpliedBy`
      }
    };
  }
});

// node_modules/n3/src/N3Lexer.js
var import_buffer, xsd, escapeSequence, escapeReplacements, illegalIriChars, lineModeRegExps, invalidRegExp, N3Lexer;
var init_N3Lexer = __esm({
  "node_modules/n3/src/N3Lexer.js"() {
    "use strict";
    import_buffer = __toESM(require_buffer());
    init_IRIs();
    ({ xsd } = IRIs_default);
    escapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\([^])/g;
    escapeReplacements = {
      "\\": "\\",
      "'": "'",
      '"': '"',
      "n": "\n",
      "r": "\r",
      "t": "	",
      "f": "\f",
      "b": "\b",
      "_": "_",
      "~": "~",
      ".": ".",
      "-": "-",
      "!": "!",
      "$": "$",
      "&": "&",
      "(": "(",
      ")": ")",
      "*": "*",
      "+": "+",
      ",": ",",
      ";": ";",
      "=": "=",
      "/": "/",
      "?": "?",
      "#": "#",
      "@": "@",
      "%": "%"
    };
    illegalIriChars = /[\x00-\x20<>\\"\{\}\|\^\`]/;
    lineModeRegExps = {
      _iri: true,
      _unescapedIri: true,
      _simpleQuotedString: true,
      _langcode: true,
      _dircode: true,
      _blank: true,
      _newline: true,
      _comment: true,
      _whitespace: true,
      _endOfFile: true
    };
    invalidRegExp = /$0^/;
    N3Lexer = class {
      constructor(options) {
        this._iri = /^<((?:[^ <>{}\\]|\\[uU])+)>[ \t]*/;
        this._unescapedIri = /^<([^\x00-\x20<>\\"\{\}\|\^\`]*)>[ \t]*/;
        this._simpleQuotedString = /^"([^"\\\r\n]*)"(?=[^"])/;
        this._simpleApostropheString = /^'([^'\\\r\n]*)'(?=[^'])/;
        this._langcode = /^@([a-z]+(?:-[a-z0-9]+)*)(?=[^a-z0-9])/i;
        this._dircode = /^--(ltr)|(rtl)/;
        this._prefix = /^((?:[A-Za-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])(?:\.?[\-0-9A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])*)?:(?=[#\s<])/;
        this._prefixed = /^((?:[A-Za-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])(?:\.?[\-0-9A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])*)?:((?:(?:[0-:A-Z_a-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff]|%[0-9a-fA-F]{2}|\\[!#-\/;=?\-@_~])(?:(?:[\.\-0-:A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff]|%[0-9a-fA-F]{2}|\\[!#-\/;=?\-@_~])*(?:[\-0-:A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff]|%[0-9a-fA-F]{2}|\\[!#-\/;=?\-@_~]))?)?)(?:[ \t]+|(?=\.?[,;!\^\s#()\[\]\{\}"'<>]))/;
        this._variable = /^\?(?:(?:[A-Z_a-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])(?:[\-0-:A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])*)(?=[.,;!\^\s#()\[\]\{\}"'<>])/;
        this._blank = /^_:((?:[0-9A-Z_a-z\xc0-\xd6\xd8-\xf6\xf8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])(?:\.?[\-0-9A-Z_a-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c\u200d\u203f\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd]|[\ud800-\udb7f][\udc00-\udfff])*)(?:[ \t]+|(?=\.?[,;:\s#()\[\]\{\}"'<>]))/;
        this._number = /^[\-+]?(?:(\d+\.\d*|\.?\d+)[eE][\-+]?|\d*(\.)?)\d+(?=\.?[,;:\s#()\[\]\{\}"'<>])/;
        this._boolean = /^(?:true|false)(?=[.,;\s#()\[\]\{\}"'<>])/;
        this._atKeyword = /^@[a-z]+(?=[\s#<:])/i;
        this._keyword = /^(?:PREFIX|BASE|VERSION|GRAPH)(?=[\s#<])/i;
        this._shortPredicates = /^a(?=[\s#()\[\]\{\}"'<>])/;
        this._newline = /^[ \t]*(?:#[^\n\r]*)?(?:\r\n|\n|\r)[ \t]*/;
        this._comment = /#([^\n\r]*)/;
        this._whitespace = /^[ \t]+/;
        this._endOfFile = /^(?:#[^\n\r]*)?$/;
        options = options || {};
        this._isImpliedBy = options.isImpliedBy;
        if (this._lineMode = !!options.lineMode) {
          this._n3Mode = false;
          for (const key in this) {
            if (!(key in lineModeRegExps) && this[key] instanceof RegExp)
              this[key] = invalidRegExp;
          }
        } else {
          this._n3Mode = options.n3 !== false;
        }
        this.comments = !!options.comments;
        this._literalClosingPos = 0;
      }
      // ## Private methods
      // ### `_tokenizeToEnd` tokenizes as for as possible, emitting tokens through the callback
      _tokenizeToEnd(callback, inputFinished) {
        let input = this._input;
        let currentLineLength = input.length;
        while (true) {
          let whiteSpaceMatch, comment;
          while (whiteSpaceMatch = this._newline.exec(input)) {
            if (this.comments && (comment = this._comment.exec(whiteSpaceMatch[0])))
              emitToken("comment", comment[1], "", this._line, whiteSpaceMatch[0].length);
            input = input.substr(whiteSpaceMatch[0].length, input.length);
            currentLineLength = input.length;
            this._line++;
          }
          if (!whiteSpaceMatch && (whiteSpaceMatch = this._whitespace.exec(input)))
            input = input.substr(whiteSpaceMatch[0].length, input.length);
          if (this._endOfFile.test(input)) {
            if (inputFinished) {
              if (this.comments && (comment = this._comment.exec(input)))
                emitToken("comment", comment[1], "", this._line, input.length);
              input = null;
              emitToken("eof", "", "", this._line, 0);
            }
            return this._input = input;
          }
          const line = this._line, firstChar = input[0];
          let type = "", value = "", prefix2 = "", match2 = null, matchLength = 0, inconclusive = false;
          switch (firstChar) {
            case "^":
              if (input.length < 3)
                break;
              else if (input[1] === "^") {
                this._previousMarker = "^^";
                input = input.substr(2);
                if (input[0] !== "<") {
                  inconclusive = true;
                  break;
                }
              } else {
                if (this._n3Mode) {
                  matchLength = 1;
                  type = "^";
                }
                break;
              }
            // Fall through in case the type is an IRI
            case "<":
              if (match2 = this._unescapedIri.exec(input))
                type = "IRI", value = match2[1];
              else if (match2 = this._iri.exec(input)) {
                value = this._unescape(match2[1]);
                if (value === null || illegalIriChars.test(value))
                  return reportSyntaxError(this);
                type = "IRI";
              } else if (input.length > 2 && input[1] === "<" && input[2] === "(")
                type = "<<(", matchLength = 3;
              else if (!this._lineMode && input.length > (inputFinished ? 1 : 2) && input[1] === "<")
                type = "<<", matchLength = 2;
              else if (this._n3Mode && input.length > 1 && input[1] === "=") {
                matchLength = 2;
                if (this._isImpliedBy) type = "abbreviation", value = "<";
                else type = "inverse", value = ">";
              }
              break;
            case ">":
              if (input.length > 1 && input[1] === ">")
                type = ">>", matchLength = 2;
              break;
            case "_":
              if ((match2 = this._blank.exec(input)) || inputFinished && (match2 = this._blank.exec(`${input} `)))
                type = "blank", prefix2 = "_", value = match2[1];
              break;
            case '"':
              if (match2 = this._simpleQuotedString.exec(input))
                value = match2[1];
              else {
                ({ value, matchLength } = this._parseLiteral(input));
                if (value === null)
                  return reportSyntaxError(this);
              }
              if (match2 !== null || matchLength !== 0) {
                type = "literal";
                this._literalClosingPos = 0;
              }
              break;
            case "'":
              if (!this._lineMode) {
                if (match2 = this._simpleApostropheString.exec(input))
                  value = match2[1];
                else {
                  ({ value, matchLength } = this._parseLiteral(input));
                  if (value === null)
                    return reportSyntaxError(this);
                }
                if (match2 !== null || matchLength !== 0) {
                  type = "literal";
                  this._literalClosingPos = 0;
                }
              }
              break;
            case "?":
              if (this._n3Mode && (match2 = this._variable.exec(input)))
                type = "var", value = match2[0];
              break;
            case "@":
              if (this._previousMarker === "literal" && (match2 = this._langcode.exec(input)) && match2[1] !== "version")
                type = "langcode", value = match2[1];
              else if (match2 = this._atKeyword.exec(input))
                type = match2[0];
              break;
            case ".":
              if (input.length === 1 ? inputFinished : input[1] < "0" || input[1] > "9") {
                type = ".";
                matchLength = 1;
                break;
              }
            // Fall through to numerical case (could be a decimal dot)
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "+":
            case "-":
              if (input[1] === "-") {
                if (this._previousMarker === "langcode" && (match2 = this._dircode.exec(input)))
                  type = "dircode", matchLength = 2, value = match2[1] || match2[2], matchLength = value.length + 2;
                break;
              }
              if (match2 = this._number.exec(input) || inputFinished && (match2 = this._number.exec(`${input} `))) {
                type = "literal", value = match2[0];
                prefix2 = typeof match2[1] === "string" ? xsd.double : typeof match2[2] === "string" ? xsd.decimal : xsd.integer;
              }
              break;
            case "B":
            case "b":
            case "p":
            case "P":
            case "G":
            case "g":
            case "V":
            case "v":
              if (match2 = this._keyword.exec(input))
                type = match2[0].toUpperCase();
              else
                inconclusive = true;
              break;
            case "f":
            case "t":
              if (match2 = this._boolean.exec(input))
                type = "literal", value = match2[0], prefix2 = xsd.boolean;
              else
                inconclusive = true;
              break;
            case "a":
              if (match2 = this._shortPredicates.exec(input))
                type = "abbreviation", value = "a";
              else
                inconclusive = true;
              break;
            case "=":
              if (this._n3Mode && input.length > 1) {
                type = "abbreviation";
                if (input[1] !== ">")
                  matchLength = 1, value = "=";
                else
                  matchLength = 2, value = ">";
              }
              break;
            case "!":
              if (!this._n3Mode)
                break;
            case ")":
              if (!inputFinished && (input.length === 1 || input.length === 2 && input[1] === ">")) {
                break;
              }
              if (input.length > 2 && input[1] === ">" && input[2] === ">") {
                type = ")>>", matchLength = 3;
                break;
              }
            case ",":
            case ";":
            case "[":
            case "]":
            case "(":
            case "}":
            case "~":
              if (!this._lineMode) {
                matchLength = 1;
                type = firstChar;
              }
              break;
            case "{":
              if (!this._lineMode && input.length >= 2) {
                if (input[1] === "|")
                  type = "{|", matchLength = 2;
                else
                  type = firstChar, matchLength = 1;
              }
              break;
            case "|":
              if (input.length >= 2 && input[1] === "}")
                type = "|}", matchLength = 2;
              break;
            default:
              inconclusive = true;
          }
          if (inconclusive) {
            if ((this._previousMarker === "@prefix" || this._previousMarker === "PREFIX") && (match2 = this._prefix.exec(input)))
              type = "prefix", value = match2[1] || "";
            else if ((match2 = this._prefixed.exec(input)) || inputFinished && (match2 = this._prefixed.exec(`${input} `)))
              type = "prefixed", prefix2 = match2[1] || "", value = this._unescape(match2[2]);
          }
          if (this._previousMarker === "^^") {
            switch (type) {
              case "prefixed":
                type = "type";
                break;
              case "IRI":
                type = "typeIRI";
                break;
              default:
                type = "";
            }
          }
          if (!type) {
            if (inputFinished || !/^'''|^"""/.test(input) && /\n|\r/.test(input))
              return reportSyntaxError(this);
            else
              return this._input = input;
          }
          const length = matchLength || match2[0].length;
          const token = emitToken(type, value, prefix2, line, length);
          this.previousToken = token;
          this._previousMarker = type;
          input = input.substr(length, input.length);
        }
        function emitToken(type, value, prefix2, line, length) {
          const start = input ? currentLineLength - input.length : currentLineLength;
          const end = start + length;
          const token = { type, value, prefix: prefix2, line, start, end };
          callback(null, token);
          return token;
        }
        function reportSyntaxError(self2) {
          callback(self2._syntaxError(/^\S*/.exec(input)[0]));
        }
      }
      // ### `_unescape` replaces N3 escape codes by their corresponding characters
      _unescape(item) {
        let invalid = false;
        const replaced = item.replace(escapeSequence, (sequence, unicode4, unicode8, escapedChar) => {
          if (typeof unicode4 === "string")
            return String.fromCharCode(Number.parseInt(unicode4, 16));
          if (typeof unicode8 === "string") {
            let charCode = Number.parseInt(unicode8, 16);
            return charCode <= 65535 ? String.fromCharCode(Number.parseInt(unicode8, 16)) : String.fromCharCode(55296 + ((charCode -= 65536) >> 10), 56320 + (charCode & 1023));
          }
          if (escapedChar in escapeReplacements)
            return escapeReplacements[escapedChar];
          invalid = true;
          return "";
        });
        return invalid ? null : replaced;
      }
      // ### `_parseLiteral` parses a literal into an unescaped value
      _parseLiteral(input) {
        if (input.length >= 3) {
          const opening = input.match(/^(?:"""|"|'''|'|)/)[0];
          const openingLength = opening.length;
          let closingPos = Math.max(this._literalClosingPos, openingLength);
          while ((closingPos = input.indexOf(opening, closingPos)) > 0) {
            let backslashCount = 0;
            while (input[closingPos - backslashCount - 1] === "\\")
              backslashCount++;
            if (backslashCount % 2 === 0) {
              const raw = input.substring(openingLength, closingPos);
              const lines = raw.split(/\r\n|\r|\n/).length - 1;
              const matchLength = closingPos + openingLength;
              if (openingLength === 1 && lines !== 0 || openingLength === 3 && this._lineMode)
                break;
              this._line += lines;
              return { value: this._unescape(raw), matchLength };
            }
            closingPos++;
          }
          this._literalClosingPos = input.length - openingLength + 1;
        }
        return { value: "", matchLength: 0 };
      }
      // ### `_syntaxError` creates a syntax error for the given issue
      _syntaxError(issue) {
        this._input = null;
        const err = new Error(`Unexpected "${issue}" on line ${this._line}.`);
        err.context = {
          token: void 0,
          line: this._line,
          previousToken: this.previousToken
        };
        return err;
      }
      // ### Strips off any starting UTF BOM mark.
      _readStartingBom(input) {
        return input.startsWith("\uFEFF") ? input.substr(1) : input;
      }
      // ## Public methods
      // ### `tokenize` starts the transformation of an N3 document into an array of tokens.
      // The input can be a string or a stream.
      tokenize(input, callback) {
        this._line = 1;
        if (typeof input === "string") {
          this._input = this._readStartingBom(input);
          if (typeof callback === "function")
            queueMicrotask(() => this._tokenizeToEnd(callback, true));
          else {
            const tokens = [];
            let error;
            this._tokenizeToEnd((e5, t4) => e5 ? error = e5 : tokens.push(t4), true);
            if (error) throw error;
            return tokens;
          }
        } else {
          this._pendingBuffer = null;
          if (typeof input.setEncoding === "function")
            input.setEncoding("utf8");
          input.on("data", (data) => {
            if (this._input !== null && data.length !== 0) {
              if (this._pendingBuffer) {
                data = import_buffer.Buffer.concat([this._pendingBuffer, data]);
                this._pendingBuffer = null;
              }
              if (data[data.length - 1] & 128) {
                this._pendingBuffer = data;
              } else {
                if (typeof this._input === "undefined")
                  this._input = this._readStartingBom(typeof data === "string" ? data : data.toString());
                else
                  this._input += data;
                this._tokenizeToEnd(callback, false);
              }
            }
          });
          input.on("end", () => {
            if (typeof this._input === "string")
              this._tokenizeToEnd(callback, true);
          });
          input.on("error", callback);
        }
      }
    };
  }
});

// node_modules/n3/src/N3DataFactory.js
function termFromId(id, factory, nested) {
  factory = factory || DataFactory;
  if (!id)
    return factory.defaultGraph();
  switch (id[0]) {
    case "?":
      return factory.variable(id.substr(1));
    case "_":
      return factory.blankNode(id.substr(2));
    case '"':
      if (factory === DataFactory)
        return new Literal(id);
      if (id[id.length - 1] === '"')
        return factory.literal(id.substr(1, id.length - 2));
      const endPos = id.lastIndexOf('"', id.length - 1);
      let languageOrDatatype;
      if (id[endPos + 1] === "@") {
        languageOrDatatype = id.substr(endPos + 2);
        const dashDashIndex = languageOrDatatype.lastIndexOf("--");
        if (dashDashIndex > 0 && dashDashIndex < languageOrDatatype.length) {
          languageOrDatatype = {
            language: languageOrDatatype.substr(0, dashDashIndex),
            direction: languageOrDatatype.substr(dashDashIndex + 2)
          };
        }
      } else {
        languageOrDatatype = factory.namedNode(id.substr(endPos + 3));
      }
      return factory.literal(
        id.substr(1, endPos - 1),
        languageOrDatatype
      );
    case "[":
      id = JSON.parse(id);
      break;
    default:
      if (!nested || !Array.isArray(id)) {
        return factory.namedNode(id);
      }
  }
  return factory.quad(
    termFromId(id[0], factory, true),
    termFromId(id[1], factory, true),
    termFromId(id[2], factory, true),
    id[3] && termFromId(id[3], factory, true)
  );
}
function termToId(term, nested) {
  if (typeof term === "string")
    return term;
  if (term instanceof Term && term.termType !== "Quad")
    return term.id;
  if (!term)
    return DEFAULTGRAPH.id;
  switch (term.termType) {
    case "NamedNode":
      return term.value;
    case "BlankNode":
      return `_:${term.value}`;
    case "Variable":
      return `?${term.value}`;
    case "DefaultGraph":
      return "";
    case "Literal":
      return `"${term.value}"${term.language ? `@${term.language}${term.direction ? `--${term.direction}` : ""}` : term.datatype && term.datatype.value !== xsd2.string ? `^^${term.datatype.value}` : ""}`;
    case "Quad":
      const res = [
        termToId(term.subject, true),
        termToId(term.predicate, true),
        termToId(term.object, true)
      ];
      if (term.graph && term.graph.termType !== "DefaultGraph") {
        res.push(termToId(term.graph, true));
      }
      return nested ? res : JSON.stringify(res);
    default:
      throw new Error(`Unexpected termType: ${term.termType}`);
  }
}
function namedNode(iri) {
  return new NamedNode(iri);
}
function blankNode(name) {
  return new BlankNode(name || `n3-${_blankNodeCounter++}`);
}
function literal(value, languageOrDataType) {
  if (typeof languageOrDataType === "string")
    return new Literal(`"${value}"@${languageOrDataType.toLowerCase()}`);
  if (languageOrDataType !== void 0 && !("termType" in languageOrDataType)) {
    return new Literal(`"${value}"@${languageOrDataType.language.toLowerCase()}${languageOrDataType.direction ? `--${languageOrDataType.direction.toLowerCase()}` : ""}`);
  }
  let datatype = languageOrDataType ? languageOrDataType.value : "";
  if (datatype === "") {
    if (typeof value === "boolean")
      datatype = xsd2.boolean;
    else if (typeof value === "number") {
      if (Number.isFinite(value))
        datatype = Number.isInteger(value) ? xsd2.integer : xsd2.double;
      else {
        datatype = xsd2.double;
        if (!Number.isNaN(value))
          value = value > 0 ? "INF" : "-INF";
      }
    }
  }
  return datatype === "" || datatype === xsd2.string ? new Literal(`"${value}"`) : new Literal(`"${value}"^^${datatype}`);
}
function variable(name) {
  return new Variable(name);
}
function defaultGraph() {
  return DEFAULTGRAPH;
}
function quad(subject2, predicate2, object2, graph) {
  return new Quad(subject2, predicate2, object2, graph);
}
function fromTerm(term) {
  if (term instanceof Term)
    return term;
  switch (term.termType) {
    case "NamedNode":
      return namedNode(term.value);
    case "BlankNode":
      return blankNode(term.value);
    case "Variable":
      return variable(term.value);
    case "DefaultGraph":
      return DEFAULTGRAPH;
    case "Literal":
      return literal(term.value, term.language || term.datatype);
    case "Quad":
      return fromQuad(term);
    default:
      throw new Error(`Unexpected termType: ${term.termType}`);
  }
}
function fromQuad(inQuad) {
  if (inQuad instanceof Quad)
    return inQuad;
  if (inQuad.termType !== "Quad")
    throw new Error(`Unexpected termType: ${inQuad.termType}`);
  return quad(fromTerm(inQuad.subject), fromTerm(inQuad.predicate), fromTerm(inQuad.object), fromTerm(inQuad.graph));
}
var rdf, xsd2, DEFAULTGRAPH, _blankNodeCounter, DataFactory, N3DataFactory_default, Term, NamedNode, Literal, BlankNode, Variable, DefaultGraph, Quad;
var init_N3DataFactory = __esm({
  "node_modules/n3/src/N3DataFactory.js"() {
    "use strict";
    init_IRIs();
    ({ rdf, xsd: xsd2 } = IRIs_default);
    _blankNodeCounter = 0;
    DataFactory = {
      namedNode,
      blankNode,
      variable,
      literal,
      defaultGraph,
      quad,
      triple: quad,
      fromTerm,
      fromQuad
    };
    N3DataFactory_default = DataFactory;
    Term = class _Term {
      constructor(id) {
        this.id = id;
      }
      // ### The value of this term
      get value() {
        return this.id;
      }
      // ### Returns whether this object represents the same term as the other
      equals(other) {
        if (other instanceof _Term)
          return this.id === other.id;
        return !!other && this.termType === other.termType && this.value === other.value;
      }
      // ### Implement hashCode for Immutable.js, since we implement `equals`
      // https://immutable-js.com/docs/v4.0.0/ValueObject/#hashCode()
      hashCode() {
        return 0;
      }
      // ### Returns a plain object representation of this term
      toJSON() {
        return {
          termType: this.termType,
          value: this.value
        };
      }
    };
    NamedNode = class extends Term {
      // ### The term type of this term
      get termType() {
        return "NamedNode";
      }
    };
    Literal = class _Literal extends Term {
      // ### The term type of this term
      get termType() {
        return "Literal";
      }
      // ### The text value of this literal
      get value() {
        return this.id.substring(1, this.id.lastIndexOf('"'));
      }
      // ### The language of this literal
      get language() {
        const id = this.id;
        let atPos = id.lastIndexOf('"') + 1;
        const dirPos = id.lastIndexOf("--");
        return atPos < id.length && id[atPos++] === "@" ? (dirPos > atPos ? id.substr(0, dirPos) : id).substr(atPos).toLowerCase() : "";
      }
      // ### The direction of this literal
      get direction() {
        const id = this.id;
        const endPos = id.lastIndexOf('"');
        const dirPos = id.lastIndexOf("--");
        return dirPos > endPos && dirPos + 2 < id.length ? id.substr(dirPos + 2).toLowerCase() : "";
      }
      // ### The datatype IRI of this literal
      get datatype() {
        return new NamedNode(this.datatypeString);
      }
      // ### The datatype string of this literal
      get datatypeString() {
        const id = this.id, dtPos = id.lastIndexOf('"') + 1;
        const char = dtPos < id.length ? id[dtPos] : "";
        return char === "^" ? id.substr(dtPos + 2) : (
          // If "@" follows, return rdf:langString or rdf:dirLangString; xsd:string otherwise
          char !== "@" ? xsd2.string : id.indexOf("--", dtPos) > 0 ? rdf.dirLangString : rdf.langString
        );
      }
      // ### Returns whether this object represents the same term as the other
      equals(other) {
        if (other instanceof _Literal)
          return this.id === other.id;
        return !!other && !!other.datatype && this.termType === other.termType && this.value === other.value && this.language === other.language && (this.direction === other.direction || this.direction === "" && !other.direction) && this.datatype.value === other.datatype.value;
      }
      toJSON() {
        return {
          termType: this.termType,
          value: this.value,
          language: this.language,
          direction: this.direction,
          datatype: { termType: "NamedNode", value: this.datatypeString }
        };
      }
    };
    BlankNode = class extends Term {
      constructor(name) {
        super(`_:${name}`);
      }
      // ### The term type of this term
      get termType() {
        return "BlankNode";
      }
      // ### The name of this blank node
      get value() {
        return this.id.substr(2);
      }
    };
    Variable = class extends Term {
      constructor(name) {
        super(`?${name}`);
      }
      // ### The term type of this term
      get termType() {
        return "Variable";
      }
      // ### The name of this variable
      get value() {
        return this.id.substr(1);
      }
    };
    DefaultGraph = class extends Term {
      constructor() {
        super("");
        return DEFAULTGRAPH || this;
      }
      // ### The term type of this term
      get termType() {
        return "DefaultGraph";
      }
      // ### Returns whether this object represents the same term as the other
      equals(other) {
        return this === other || !!other && this.termType === other.termType;
      }
    };
    DEFAULTGRAPH = new DefaultGraph();
    Quad = class extends Term {
      constructor(subject2, predicate2, object2, graph) {
        super("");
        this._subject = subject2;
        this._predicate = predicate2;
        this._object = object2;
        this._graph = graph || DEFAULTGRAPH;
      }
      // ### The term type of this term
      get termType() {
        return "Quad";
      }
      get subject() {
        return this._subject;
      }
      get predicate() {
        return this._predicate;
      }
      get object() {
        return this._object;
      }
      get graph() {
        return this._graph;
      }
      // ### Returns a plain object representation of this quad
      toJSON() {
        return {
          termType: this.termType,
          subject: this._subject.toJSON(),
          predicate: this._predicate.toJSON(),
          object: this._object.toJSON(),
          graph: this._graph.toJSON()
        };
      }
      // ### Returns whether this object represents the same quad as the other
      equals(other) {
        return !!other && this._subject.equals(other.subject) && this._predicate.equals(other.predicate) && this._object.equals(other.object) && this._graph.equals(other.graph);
      }
    };
  }
});

// node_modules/n3/src/N3Parser.js
function noop() {
}
function initDataFactory(parser, factory) {
  parser._factory = factory;
  parser.DEFAULTGRAPH = factory.defaultGraph();
  parser.RDF_FIRST = factory.namedNode(IRIs_default.rdf.first);
  parser.RDF_REST = factory.namedNode(IRIs_default.rdf.rest);
  parser.RDF_NIL = factory.namedNode(IRIs_default.rdf.nil);
  parser.RDF_REIFIES = factory.namedNode(IRIs_default.rdf.reifies);
  parser.N3_FORALL = factory.namedNode(IRIs_default.r.forAll);
  parser.N3_FORSOME = factory.namedNode(IRIs_default.r.forSome);
  parser.ABBREVIATIONS = {
    "a": factory.namedNode(IRIs_default.rdf.type),
    "=": factory.namedNode(IRIs_default.owl.sameAs),
    ">": factory.namedNode(IRIs_default.log.implies),
    "<": factory.namedNode(IRIs_default.log.isImpliedBy)
  };
  parser.QUANTIFIERS_GRAPH = factory.namedNode("urn:n3:quantifiers");
}
var blankNodePrefix, N3Parser;
var init_N3Parser = __esm({
  "node_modules/n3/src/N3Parser.js"() {
    "use strict";
    init_N3Lexer();
    init_N3DataFactory();
    init_IRIs();
    blankNodePrefix = 0;
    N3Parser = class _N3Parser {
      constructor(options) {
        this._contextStack = [];
        this._graph = null;
        options = options || {};
        this._setBase(options.baseIRI);
        options.factory && initDataFactory(this, options.factory);
        const format = typeof options.format === "string" ? options.format.match(/\w*$/)[0].toLowerCase() : "", isTurtle = /turtle/.test(format), isTriG = /trig/.test(format), isNTriples = /triple/.test(format), isNQuads = /quad/.test(format), isN3 = this._n3Mode = /n3/.test(format), isLineMode = isNTriples || isNQuads;
        if (!(this._supportsNamedGraphs = !(isTurtle || isN3)))
          this._readPredicateOrNamedGraph = this._readPredicate;
        this._supportsQuads = !(isTurtle || isTriG || isNTriples || isN3);
        this._isImpliedBy = options.isImpliedBy;
        if (isLineMode)
          this._resolveRelativeIRI = (iri) => {
            return null;
          };
        this._blankNodePrefix = typeof options.blankNodePrefix !== "string" ? "" : options.blankNodePrefix.replace(/^(?!_:)/, "_:");
        this._lexer = options.lexer || new N3Lexer({ lineMode: isLineMode, n3: isN3, isImpliedBy: this._isImpliedBy });
        this._explicitQuantifiers = !!options.explicitQuantifiers;
        this._parseUnsupportedVersions = !!options.parseUnsupportedVersions;
        this._version = options.version;
      }
      // ## Static class methods
      // ### `_resetBlankNodePrefix` restarts blank node prefix identification
      static _resetBlankNodePrefix() {
        blankNodePrefix = 0;
      }
      // ## Private methods
      // ### `_setBase` sets the base IRI to resolve relative IRIs
      _setBase(baseIRI) {
        if (!baseIRI) {
          this._base = "";
          this._basePath = "";
        } else {
          const fragmentPos = baseIRI.indexOf("#");
          if (fragmentPos >= 0)
            baseIRI = baseIRI.substr(0, fragmentPos);
          this._base = baseIRI;
          this._basePath = baseIRI.indexOf("/") < 0 ? baseIRI : baseIRI.replace(/[^\/?]*(?:\?.*)?$/, "");
          baseIRI = baseIRI.match(/^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i);
          this._baseRoot = baseIRI[0];
          this._baseScheme = baseIRI[1];
        }
      }
      // ### `_saveContext` stores the current parsing context
      // when entering a new scope (list, blank node, formula)
      _saveContext(type, graph, subject2, predicate2, object2) {
        const n3Mode = this._n3Mode;
        this._contextStack.push({
          type,
          subject: subject2,
          predicate: predicate2,
          object: object2,
          graph,
          inverse: n3Mode ? this._inversePredicate : false,
          blankPrefix: n3Mode ? this._prefixes._ : "",
          quantified: n3Mode ? this._quantified : null
        });
        if (n3Mode) {
          this._inversePredicate = false;
          this._prefixes._ = this._graph ? `${this._graph.value}.` : ".";
          this._quantified = Object.create(this._quantified);
        }
      }
      // ### `_restoreContext` restores the parent context
      // when leaving a scope (list, blank node, formula)
      _restoreContext(type, token) {
        const context = this._contextStack.pop();
        if (!context || context.type !== type)
          return this._error(`Unexpected ${token.type}`, token);
        this._subject = context.subject;
        this._predicate = context.predicate;
        this._object = context.object;
        this._graph = context.graph;
        if (this._n3Mode) {
          this._inversePredicate = context.inverse;
          this._prefixes._ = context.blankPrefix;
          this._quantified = context.quantified;
        }
      }
      // ### `_readBeforeTopContext` is called once only at the start of parsing.
      _readBeforeTopContext(token) {
        if (this._version && !this._isValidVersion(this._version))
          return this._error(`Detected unsupported version as media type parameter: "${this._version}"`, token);
        return this._readInTopContext(token);
      }
      // ### `_readInTopContext` reads a token when in the top context
      _readInTopContext(token) {
        switch (token.type) {
          // If an EOF token arrives in the top context, signal that we're done
          case "eof":
            if (this._graph !== null)
              return this._error("Unclosed graph", token);
            delete this._prefixes._;
            return this._callback(null, null, this._prefixes);
          // It could be a prefix declaration
          case "PREFIX":
            this._sparqlStyle = true;
          case "@prefix":
            return this._readPrefix;
          // It could be a base declaration
          case "BASE":
            this._sparqlStyle = true;
          case "@base":
            return this._readBaseIRI;
          // It could be a version declaration
          case "VERSION":
            this._sparqlStyle = true;
          case "@version":
            return this._readVersion;
          // It could be a graph
          case "{":
            if (this._supportsNamedGraphs) {
              this._graph = "";
              this._subject = null;
              return this._readSubject;
            }
          case "GRAPH":
            if (this._supportsNamedGraphs)
              return this._readNamedGraphLabel;
          // Otherwise, the next token must be a subject
          default:
            return this._readSubject(token);
        }
      }
      // ### `_readEntity` reads an IRI, prefixed name, blank node, or variable
      _readEntity(token, quantifier) {
        let value;
        switch (token.type) {
          // Read a relative or absolute IRI
          case "IRI":
          case "typeIRI":
            const iri = this._resolveIRI(token.value);
            if (iri === null)
              return this._error("Invalid IRI", token);
            value = this._factory.namedNode(iri);
            break;
          // Read a prefixed name
          case "type":
          case "prefixed":
            const prefix2 = this._prefixes[token.prefix];
            if (prefix2 === void 0)
              return this._error(`Undefined prefix "${token.prefix}:"`, token);
            value = this._factory.namedNode(prefix2 + token.value);
            break;
          // Read a blank node
          case "blank":
            value = this._factory.blankNode(this._prefixes[token.prefix] + token.value);
            break;
          // Read a variable
          case "var":
            value = this._factory.variable(token.value.substr(1));
            break;
          // Everything else is not an entity
          default:
            return this._error(`Expected entity but got ${token.type}`, token);
        }
        if (!quantifier && this._n3Mode && value.id in this._quantified)
          value = this._quantified[value.id];
        return value;
      }
      // ### `_readSubject` reads a quad's subject
      _readSubject(token) {
        this._predicate = null;
        switch (token.type) {
          case "[":
            this._saveContext(
              "blank",
              this._graph,
              this._subject = this._factory.blankNode(),
              null,
              null
            );
            return this._readBlankNodeHead;
          case "(":
            const stack = this._contextStack, parent = stack.length && stack[stack.length - 1];
            if (parent.type === "<<") {
              return this._error("Unexpected list in reified triple", token);
            }
            this._saveContext("list", this._graph, this.RDF_NIL, null, null);
            this._subject = null;
            return this._readListItem;
          case "{":
            if (!this._n3Mode)
              return this._error("Unexpected graph", token);
            this._saveContext(
              "formula",
              this._graph,
              this._graph = this._factory.blankNode(),
              null,
              null
            );
            return this._readSubject;
          case "}":
            return this._readPunctuation(token);
          case "@forSome":
            if (!this._n3Mode)
              return this._error('Unexpected "@forSome"', token);
            this._subject = null;
            this._predicate = this.N3_FORSOME;
            this._quantifier = "blankNode";
            return this._readQuantifierList;
          case "@forAll":
            if (!this._n3Mode)
              return this._error('Unexpected "@forAll"', token);
            this._subject = null;
            this._predicate = this.N3_FORALL;
            this._quantifier = "variable";
            return this._readQuantifierList;
          case "literal":
            if (!this._n3Mode)
              return this._error("Unexpected literal", token);
            if (token.prefix.length === 0) {
              this._literalValue = token.value;
              return this._completeSubjectLiteral;
            } else
              this._subject = this._factory.literal(token.value, this._factory.namedNode(token.prefix));
            break;
          case "<<(":
            if (!this._n3Mode)
              return this._error("Disallowed triple term as subject", token);
            this._saveContext("<<(", this._graph, null, null, null);
            this._graph = null;
            return this._readSubject;
          case "<<":
            this._saveContext("<<", this._graph, null, null, null);
            this._graph = null;
            return this._readSubject;
          default:
            if ((this._subject = this._readEntity(token)) === void 0)
              return;
            if (this._n3Mode)
              return this._getPathReader(this._readPredicateOrNamedGraph);
        }
        return this._readPredicateOrNamedGraph;
      }
      // ### `_readPredicate` reads a quad's predicate
      _readPredicate(token) {
        const type = token.type;
        switch (type) {
          case "inverse":
            this._inversePredicate = true;
          case "abbreviation":
            this._predicate = this.ABBREVIATIONS[token.value];
            break;
          case ".":
          case "]":
          case "}":
          case "|}":
            if (this._predicate === null)
              return this._error(`Unexpected ${type}`, token);
            this._subject = null;
            return type === "]" ? this._readBlankNodeTail(token) : this._readPunctuation(token);
          case ";":
            return this._predicate !== null ? this._readPredicate : this._error("Expected predicate but got ;", token);
          case "[":
            if (this._n3Mode) {
              this._saveContext(
                "blank",
                this._graph,
                this._subject,
                this._subject = this._factory.blankNode(),
                null
              );
              return this._readBlankNodeHead;
            }
          case "blank":
            if (!this._n3Mode)
              return this._error("Disallowed blank node as predicate", token);
          default:
            if ((this._predicate = this._readEntity(token)) === void 0)
              return;
        }
        this._validAnnotation = true;
        return this._readObject;
      }
      // ### `_readObject` reads a quad's object
      _readObject(token) {
        switch (token.type) {
          case "literal":
            if (token.prefix.length === 0) {
              this._literalValue = token.value;
              return this._readDataTypeOrLang;
            } else
              this._object = this._factory.literal(token.value, this._factory.namedNode(token.prefix));
            break;
          case "[":
            this._saveContext(
              "blank",
              this._graph,
              this._subject,
              this._predicate,
              this._subject = this._factory.blankNode()
            );
            return this._readBlankNodeHead;
          case "(":
            const stack = this._contextStack, parent = stack.length && stack[stack.length - 1];
            if (parent.type === "<<") {
              return this._error("Unexpected list in reified triple", token);
            }
            this._saveContext("list", this._graph, this._subject, this._predicate, this.RDF_NIL);
            this._subject = null;
            return this._readListItem;
          case "{":
            if (!this._n3Mode)
              return this._error("Unexpected graph", token);
            this._saveContext(
              "formula",
              this._graph,
              this._subject,
              this._predicate,
              this._graph = this._factory.blankNode()
            );
            return this._readSubject;
          case "<<(":
            this._saveContext("<<(", this._graph, this._subject, this._predicate, null);
            this._graph = null;
            return this._readSubject;
          case "<<":
            this._saveContext("<<", this._graph, this._subject, this._predicate, null);
            this._graph = null;
            return this._readSubject;
          default:
            if ((this._object = this._readEntity(token)) === void 0)
              return;
            if (this._n3Mode)
              return this._getPathReader(this._getContextEndReader());
        }
        return this._getContextEndReader();
      }
      // ### `_readPredicateOrNamedGraph` reads a quad's predicate, or a named graph
      _readPredicateOrNamedGraph(token) {
        return token.type === "{" ? this._readGraph(token) : this._readPredicate(token);
      }
      // ### `_readGraph` reads a graph
      _readGraph(token) {
        if (token.type !== "{")
          return this._error(`Expected graph but got ${token.type}`, token);
        this._graph = this._subject, this._subject = null;
        return this._readSubject;
      }
      // ### `_readBlankNodeHead` reads the head of a blank node
      _readBlankNodeHead(token) {
        if (token.type === "]") {
          this._subject = null;
          return this._readBlankNodeTail(token);
        } else {
          const stack = this._contextStack, parentParent = stack.length > 1 && stack[stack.length - 2];
          if (parentParent.type === "<<") {
            return this._error("Unexpected compound blank node expression in reified triple", token);
          }
          this._predicate = null;
          return this._readPredicate(token);
        }
      }
      // ### `_readBlankNodeTail` reads the end of a blank node
      _readBlankNodeTail(token) {
        if (token.type !== "]")
          return this._readBlankNodePunctuation(token);
        if (this._subject !== null)
          this._emit(this._subject, this._predicate, this._object, this._graph);
        const empty2 = this._predicate === null;
        this._restoreContext("blank", token);
        if (this._object !== null)
          return this._getContextEndReader();
        else if (this._predicate !== null)
          return this._readObject;
        else
          return empty2 ? this._readPredicateOrNamedGraph : this._readPredicateAfterBlank;
      }
      // ### `_readPredicateAfterBlank` reads a predicate after an anonymous blank node
      _readPredicateAfterBlank(token) {
        switch (token.type) {
          case ".":
          case "}":
            this._subject = null;
            return this._readPunctuation(token);
          default:
            return this._readPredicate(token);
        }
      }
      // ### `_readListItem` reads items from a list
      _readListItem(token) {
        let item = null, list = null, next = this._readListItem;
        const previousList = this._subject, stack = this._contextStack, parent = stack[stack.length - 1];
        switch (token.type) {
          case "[":
            this._saveContext(
              "blank",
              this._graph,
              list = this._factory.blankNode(),
              this.RDF_FIRST,
              this._subject = item = this._factory.blankNode()
            );
            next = this._readBlankNodeHead;
            break;
          case "(":
            this._saveContext(
              "list",
              this._graph,
              list = this._factory.blankNode(),
              this.RDF_FIRST,
              this.RDF_NIL
            );
            this._subject = null;
            break;
          case ")":
            this._restoreContext("list", token);
            if (stack.length !== 0 && stack[stack.length - 1].type === "list")
              this._emit(this._subject, this._predicate, this._object, this._graph);
            if (this._predicate === null) {
              next = this._readPredicate;
              if (this._subject === this.RDF_NIL)
                return next;
            } else {
              next = this._getContextEndReader();
              if (this._object === this.RDF_NIL)
                return next;
            }
            list = this.RDF_NIL;
            break;
          case "literal":
            if (token.prefix.length === 0) {
              this._literalValue = token.value;
              next = this._readListItemDataTypeOrLang;
            } else {
              item = this._factory.literal(token.value, this._factory.namedNode(token.prefix));
              next = this._getContextEndReader();
            }
            break;
          case "{":
            if (!this._n3Mode)
              return this._error("Unexpected graph", token);
            this._saveContext(
              "formula",
              this._graph,
              this._subject,
              this._predicate,
              this._graph = this._factory.blankNode()
            );
            return this._readSubject;
          case "<<":
            this._saveContext("<<", this._graph, null, null, null);
            this._graph = null;
            next = this._readSubject;
            break;
          default:
            if ((item = this._readEntity(token)) === void 0)
              return;
        }
        if (list === null)
          this._subject = list = this._factory.blankNode();
        if (token.type === "<<")
          stack[stack.length - 1].subject = this._subject;
        if (previousList === null) {
          if (parent.predicate === null)
            parent.subject = list;
          else
            parent.object = list;
        } else {
          this._emit(previousList, this.RDF_REST, list, this._graph);
        }
        if (item !== null) {
          if (this._n3Mode && (token.type === "IRI" || token.type === "prefixed")) {
            this._saveContext("item", this._graph, list, this.RDF_FIRST, item);
            this._subject = item, this._predicate = null;
            return this._getPathReader(this._readListItem);
          }
          this._emit(list, this.RDF_FIRST, item, this._graph);
        }
        return next;
      }
      // ### `_readDataTypeOrLang` reads an _optional_ datatype or language
      _readDataTypeOrLang(token) {
        return this._completeObjectLiteral(token, false);
      }
      // ### `_readListItemDataTypeOrLang` reads an _optional_ datatype or language in a list
      _readListItemDataTypeOrLang(token) {
        return this._completeObjectLiteral(token, true);
      }
      // ### `_completeLiteral` completes a literal with an optional datatype or language
      _completeLiteral(token, component) {
        let literal3 = this._factory.literal(this._literalValue);
        let readCb;
        switch (token.type) {
          // Create a datatyped literal
          case "type":
          case "typeIRI":
            const datatype = this._readEntity(token);
            if (datatype === void 0) return;
            if (datatype.value === IRIs_default.rdf.langString || datatype.value === IRIs_default.rdf.dirLangString) {
              return this._error("Detected illegal (directional) languaged-tagged string with explicit datatype", token);
            }
            literal3 = this._factory.literal(this._literalValue, datatype);
            token = null;
            break;
          // Create a language-tagged string
          case "langcode":
            if (token.value.split("-").some((t4) => t4.length > 8))
              return this._error("Detected language tag with subtag longer than 8 characters", token);
            literal3 = this._factory.literal(this._literalValue, token.value);
            this._literalLanguage = token.value;
            token = null;
            readCb = this._readDirCode.bind(this, component);
            break;
        }
        return { token, literal: literal3, readCb };
      }
      _readDirCode(component, listItem, token) {
        if (token.type === "dircode") {
          const term = this._factory.literal(this._literalValue, { language: this._literalLanguage, direction: token.value });
          if (component === "subject")
            this._subject = term;
          else
            this._object = term;
          this._literalLanguage = void 0;
          token = null;
        }
        if (component === "subject")
          return token === null ? this._readPredicateOrNamedGraph : this._readPredicateOrNamedGraph(token);
        return this._completeObjectLiteralPost(token, listItem);
      }
      // Completes a literal in subject position
      _completeSubjectLiteral(token) {
        const completed = this._completeLiteral(token, "subject");
        this._subject = completed.literal;
        if (completed.readCb)
          return completed.readCb.bind(this, false);
        return this._readPredicateOrNamedGraph;
      }
      // Completes a literal in object position
      _completeObjectLiteral(token, listItem) {
        const completed = this._completeLiteral(token, "object");
        if (!completed)
          return;
        this._object = completed.literal;
        if (completed.readCb)
          return completed.readCb.bind(this, listItem);
        return this._completeObjectLiteralPost(completed.token, listItem);
      }
      _completeObjectLiteralPost(token, listItem) {
        if (listItem)
          this._emit(this._subject, this.RDF_FIRST, this._object, this._graph);
        if (token === null)
          return this._getContextEndReader();
        else {
          this._readCallback = this._getContextEndReader();
          return this._readCallback(token);
        }
      }
      // ### `_readFormulaTail` reads the end of a formula
      _readFormulaTail(token) {
        if (token.type !== "}")
          return this._readPunctuation(token);
        if (this._subject !== null)
          this._emit(this._subject, this._predicate, this._object, this._graph);
        this._restoreContext("formula", token);
        return this._object === null ? this._readPredicate : this._getContextEndReader();
      }
      // ### `_readPunctuation` reads punctuation between quads or quad parts
      _readPunctuation(token) {
        let next, graph = this._graph, startingAnnotation = false;
        const subject2 = this._subject, inversePredicate = this._inversePredicate;
        switch (token.type) {
          // A closing brace ends a graph
          case "}":
            if (this._graph === null)
              return this._error("Unexpected graph closing", token);
            if (this._n3Mode)
              return this._readFormulaTail(token);
            this._graph = null;
          // A dot just ends the statement, without sharing anything with the next
          case ".":
            this._subject = null;
            this._tripleTerm = null;
            next = this._contextStack.length ? this._readSubject : this._readInTopContext;
            if (inversePredicate) this._inversePredicate = false;
            break;
          // Semicolon means the subject is shared; predicate and object are different
          case ";":
            next = this._readPredicate;
            break;
          // Comma means both the subject and predicate are shared; the object is different
          case ",":
            next = this._readObject;
            break;
          // ~ is allowed in the annotation syntax
          case "~":
            next = this._readReifierInAnnotation;
            startingAnnotation = true;
            break;
          // {| means that the current triple is annotated with predicate-object pairs.
          case "{|":
            this._subject = this._readTripleTerm();
            this._validAnnotation = false;
            startingAnnotation = true;
            next = this._readPredicate;
            break;
          // |} means that the current reified triple in annotation syntax is finalized.
          case "|}":
            if (!this._annotation)
              return this._error("Unexpected annotation syntax closing", token);
            if (!this._validAnnotation)
              return this._error("Annotation block can not be empty", token);
            this._subject = null;
            this._annotation = false;
            next = this._readPunctuation;
            break;
          default:
            if (this._supportsQuads && this._graph === null && (graph = this._readEntity(token)) !== void 0) {
              next = this._readQuadPunctuation;
              break;
            }
            return this._error(`Expected punctuation to follow "${this._object.id}"`, token);
        }
        if (subject2 !== null && (!startingAnnotation || startingAnnotation && !this._annotation)) {
          const predicate2 = this._predicate, object2 = this._object;
          if (!inversePredicate)
            this._emit(subject2, predicate2, object2, graph);
          else
            this._emit(object2, predicate2, subject2, graph);
        }
        if (startingAnnotation) {
          this._annotation = true;
        }
        return next;
      }
      // ### `_readBlankNodePunctuation` reads punctuation in a blank node
      _readBlankNodePunctuation(token) {
        let next;
        switch (token.type) {
          // Semicolon means the subject is shared; predicate and object are different
          case ";":
            next = this._readPredicate;
            break;
          // Comma means both the subject and predicate are shared; the object is different
          case ",":
            next = this._readObject;
            break;
          default:
            return this._error(`Expected punctuation to follow "${this._object.id}"`, token);
        }
        this._emit(this._subject, this._predicate, this._object, this._graph);
        return next;
      }
      // ### `_readQuadPunctuation` reads punctuation after a quad
      _readQuadPunctuation(token) {
        if (token.type !== ".")
          return this._error("Expected dot to follow quad", token);
        return this._readInTopContext;
      }
      // ### `_readPrefix` reads the prefix of a prefix declaration
      _readPrefix(token) {
        if (token.type !== "prefix")
          return this._error("Expected prefix to follow @prefix", token);
        this._prefix = token.value;
        return this._readPrefixIRI;
      }
      // ### `_readPrefixIRI` reads the IRI of a prefix declaration
      _readPrefixIRI(token) {
        if (token.type !== "IRI")
          return this._error(`Expected IRI to follow prefix "${this._prefix}:"`, token);
        const prefixNode = this._readEntity(token);
        this._prefixes[this._prefix] = prefixNode.value;
        this._prefixCallback(this._prefix, prefixNode);
        return this._readDeclarationPunctuation;
      }
      // ### `_readBaseIRI` reads the IRI of a base declaration
      _readBaseIRI(token) {
        const iri = token.type === "IRI" && this._resolveIRI(token.value);
        if (!iri)
          return this._error("Expected valid IRI to follow base declaration", token);
        this._setBase(iri);
        return this._readDeclarationPunctuation;
      }
      // ### `_isValidVersion` checks if the given version is valid for this parser to handle.
      _isValidVersion(version) {
        return this._parseUnsupportedVersions || _N3Parser.SUPPORTED_VERSIONS.includes(version);
      }
      // ### `_readVersion` reads version string declaration
      _readVersion(token) {
        if (token.type !== "literal")
          return this._error("Expected literal to follow version declaration", token);
        if (token.end - token.start !== token.value.length + 2)
          return this._error("Version declarations must use single quotes", token);
        this._versionCallback(token.value);
        if (!this._isValidVersion(token.value))
          return this._error(`Detected unsupported version: "${token.value}"`, token);
        return this._readDeclarationPunctuation;
      }
      // ### `_readNamedGraphLabel` reads the label of a named graph
      _readNamedGraphLabel(token) {
        switch (token.type) {
          case "IRI":
          case "blank":
          case "prefixed":
            return this._readSubject(token), this._readGraph;
          case "[":
            return this._readNamedGraphBlankLabel;
          default:
            return this._error("Invalid graph label", token);
        }
      }
      // ### `_readNamedGraphLabel` reads a blank node label of a named graph
      _readNamedGraphBlankLabel(token) {
        if (token.type !== "]")
          return this._error("Invalid graph label", token);
        this._subject = this._factory.blankNode();
        return this._readGraph;
      }
      // ### `_readDeclarationPunctuation` reads the punctuation of a declaration
      _readDeclarationPunctuation(token) {
        if (this._sparqlStyle) {
          this._sparqlStyle = false;
          return this._readInTopContext(token);
        }
        if (token.type !== ".")
          return this._error("Expected declaration to end with a dot", token);
        return this._readInTopContext;
      }
      // Reads a list of quantified symbols from a @forSome or @forAll statement
      _readQuantifierList(token) {
        let entity;
        switch (token.type) {
          case "IRI":
          case "prefixed":
            if ((entity = this._readEntity(token, true)) !== void 0)
              break;
          default:
            return this._error(`Unexpected ${token.type}`, token);
        }
        if (!this._explicitQuantifiers)
          this._quantified[entity.id] = this._factory[this._quantifier](this._factory.blankNode().value);
        else {
          if (this._subject === null)
            this._emit(
              this._graph || this.DEFAULTGRAPH,
              this._predicate,
              this._subject = this._factory.blankNode(),
              this.QUANTIFIERS_GRAPH
            );
          else
            this._emit(
              this._subject,
              this.RDF_REST,
              this._subject = this._factory.blankNode(),
              this.QUANTIFIERS_GRAPH
            );
          this._emit(this._subject, this.RDF_FIRST, entity, this.QUANTIFIERS_GRAPH);
        }
        return this._readQuantifierPunctuation;
      }
      // Reads punctuation from a @forSome or @forAll statement
      _readQuantifierPunctuation(token) {
        if (token.type === ",")
          return this._readQuantifierList;
        else {
          if (this._explicitQuantifiers) {
            this._emit(this._subject, this.RDF_REST, this.RDF_NIL, this.QUANTIFIERS_GRAPH);
            this._subject = null;
          }
          this._readCallback = this._getContextEndReader();
          return this._readCallback(token);
        }
      }
      // ### `_getPathReader` reads a potential path and then resumes with the given function
      _getPathReader(afterPath) {
        this._afterPath = afterPath;
        return this._readPath;
      }
      // ### `_readPath` reads a potential path
      _readPath(token) {
        switch (token.type) {
          // Forward path
          case "!":
            return this._readForwardPath;
          // Backward path
          case "^":
            return this._readBackwardPath;
          // Not a path; resume reading where we left off
          default:
            const stack = this._contextStack, parent = stack.length && stack[stack.length - 1];
            if (parent && parent.type === "item") {
              const item = this._subject;
              this._restoreContext("item", token);
              this._emit(this._subject, this.RDF_FIRST, item, this._graph);
            }
            return this._afterPath(token);
        }
      }
      // ### `_readForwardPath` reads a '!' path
      _readForwardPath(token) {
        let subject2, predicate2;
        const object2 = this._factory.blankNode();
        if ((predicate2 = this._readEntity(token)) === void 0)
          return;
        if (this._predicate === null)
          subject2 = this._subject, this._subject = object2;
        else
          subject2 = this._object, this._object = object2;
        this._emit(subject2, predicate2, object2, this._graph);
        return this._readPath;
      }
      // ### `_readBackwardPath` reads a '^' path
      _readBackwardPath(token) {
        const subject2 = this._factory.blankNode();
        let predicate2, object2;
        if ((predicate2 = this._readEntity(token)) === void 0)
          return;
        if (this._predicate === null)
          object2 = this._subject, this._subject = subject2;
        else
          object2 = this._object, this._object = subject2;
        this._emit(subject2, predicate2, object2, this._graph);
        return this._readPath;
      }
      // ### `_readTripleTermTail` reads the end of a triple term
      _readTripleTermTail(token) {
        if (token.type !== ")>>")
          return this._error(`Expected )>> but got ${token.type}`, token);
        const quad3 = this._factory.quad(
          this._subject,
          this._predicate,
          this._object,
          this._graph || this.DEFAULTGRAPH
        );
        this._restoreContext("<<(", token);
        if (this._subject === null) {
          this._subject = quad3;
          return this._readPredicate;
        } else {
          this._object = quad3;
          return this._getContextEndReader();
        }
      }
      // ### `_readReifiedTripleTailOrReifier` reads a reifier or the end of a nested reified triple
      _readReifiedTripleTailOrReifier(token) {
        if (token.type === "~") {
          return this._readReifier;
        }
        return this._readReifiedTripleTail(token);
      }
      // ### `_readReifiedTripleTail` reads the end of a nested reified triple
      _readReifiedTripleTail(token) {
        if (token.type !== ">>")
          return this._error(`Expected >> but got ${token.type}`, token);
        this._tripleTerm = null;
        const reifier = this._readTripleTerm();
        this._restoreContext("<<", token);
        const stack = this._contextStack, parent = stack.length && stack[stack.length - 1];
        if (parent && parent.type === "list") {
          this._emit(this._subject, this.RDF_FIRST, reifier, this._graph);
          return this._getContextEndReader();
        } else if (this._subject === null) {
          this._subject = reifier;
          return this._readPredicateOrReifierTripleEnd;
        } else {
          this._object = reifier;
          return this._getContextEndReader();
        }
      }
      _readPredicateOrReifierTripleEnd(token) {
        if (token.type === ".") {
          this._subject = null;
          return this._readPunctuation(token);
        }
        return this._readPredicate(token);
      }
      // ### `_readReifier` reads the triple term identifier after a tilde when in a reifying triple.
      _readReifier(token) {
        this._reifier = this._readEntity(token);
        return this._readReifiedTripleTail;
      }
      // ### `_readReifier` reads the optional triple term identifier after a tilde when in annotation syntax.
      _readReifierInAnnotation(token) {
        if (token.type === "IRI" || token.type === "typeIRI" || token.type === "type" || token.type === "prefixed" || token.type === "blank" || token.type === "var") {
          this._reifier = this._readEntity(token);
          return this._readPunctuation;
        }
        this._readTripleTerm();
        this._subject = null;
        return this._readPunctuation(token);
      }
      _readTripleTerm() {
        const stack = this._contextStack, parent = stack.length && stack[stack.length - 1];
        const parentGraph = parent ? parent.graph : void 0;
        const reifier = this._reifier || this._factory.blankNode();
        this._reifier = null;
        this._tripleTerm = this._tripleTerm || this._factory.quad(this._subject, this._predicate, this._object);
        this._emit(reifier, this.RDF_REIFIES, this._tripleTerm, parentGraph || this.DEFAULTGRAPH);
        return reifier;
      }
      // ### `_getContextEndReader` gets the next reader function at the end of a context
      _getContextEndReader() {
        const contextStack = this._contextStack;
        if (!contextStack.length)
          return this._readPunctuation;
        switch (contextStack[contextStack.length - 1].type) {
          case "blank":
            return this._readBlankNodeTail;
          case "list":
            return this._readListItem;
          case "formula":
            return this._readFormulaTail;
          case "<<(":
            return this._readTripleTermTail;
          case "<<":
            return this._readReifiedTripleTailOrReifier;
        }
      }
      // ### `_emit` sends a quad through the callback
      _emit(subject2, predicate2, object2, graph) {
        this._callback(null, this._factory.quad(subject2, predicate2, object2, graph || this.DEFAULTGRAPH));
      }
      // ### `_error` emits an error message through the callback
      _error(message, token) {
        const err = new Error(`${message} on line ${token.line}.`);
        err.context = {
          token,
          line: token.line,
          previousToken: this._lexer.previousToken
        };
        this._callback(err);
        this._callback = noop;
      }
      // ### `_resolveIRI` resolves an IRI against the base path
      _resolveIRI(iri) {
        return /^[a-z][a-z0-9+.-]*:/i.test(iri) ? iri : this._resolveRelativeIRI(iri);
      }
      // ### `_resolveRelativeIRI` resolves an IRI against the base path,
      // assuming that a base path has been set and that the IRI is indeed relative
      _resolveRelativeIRI(iri) {
        if (!iri.length)
          return this._base;
        switch (iri[0]) {
          // Resolve relative fragment IRIs against the base IRI
          case "#":
            return this._base + iri;
          // Resolve relative query string IRIs by replacing the query string
          case "?":
            return this._base.replace(/(?:\?.*)?$/, iri);
          // Resolve root-relative IRIs at the root of the base IRI
          case "/":
            return (iri[1] === "/" ? this._baseScheme : this._baseRoot) + this._removeDotSegments(iri);
          // Resolve all other IRIs at the base IRI's path
          default:
            return /^[^/:]*:/.test(iri) ? null : this._removeDotSegments(this._basePath + iri);
        }
      }
      // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986
      _removeDotSegments(iri) {
        if (!/(^|\/)\.\.?($|[/#?])/.test(iri))
          return iri;
        const length = iri.length;
        let result = "", i5 = -1, pathStart = -1, segmentStart = 0, next = "/";
        while (i5 < length) {
          switch (next) {
            // The path starts with the first slash after the authority
            case ":":
              if (pathStart < 0) {
                if (iri[++i5] === "/" && iri[++i5] === "/")
                  while ((pathStart = i5 + 1) < length && iri[pathStart] !== "/")
                    i5 = pathStart;
              }
              break;
            // Don't modify a query string or fragment
            case "?":
            case "#":
              i5 = length;
              break;
            // Handle '/.' or '/..' path segments
            case "/":
              if (iri[i5 + 1] === ".") {
                next = iri[++i5 + 1];
                switch (next) {
                  // Remove a '/.' segment
                  case "/":
                    result += iri.substring(segmentStart, i5 - 1);
                    segmentStart = i5 + 1;
                    break;
                  // Remove a trailing '/.' segment
                  case void 0:
                  case "?":
                  case "#":
                    return result + iri.substring(segmentStart, i5) + iri.substr(i5 + 1);
                  // Remove a '/..' segment
                  case ".":
                    next = iri[++i5 + 1];
                    if (next === void 0 || next === "/" || next === "?" || next === "#") {
                      result += iri.substring(segmentStart, i5 - 2);
                      if ((segmentStart = result.lastIndexOf("/")) >= pathStart)
                        result = result.substr(0, segmentStart);
                      if (next !== "/")
                        return `${result}/${iri.substr(i5 + 1)}`;
                      segmentStart = i5 + 1;
                    }
                }
              }
          }
          next = iri[++i5];
        }
        return result + iri.substring(segmentStart);
      }
      // ## Public methods
      // ### `parse` parses the N3 input and emits each parsed quad through the onQuad callback.
      parse(input, quadCallback, prefixCallback, versionCallback) {
        let onQuad, onPrefix, onComment, onVersion;
        if (quadCallback && (quadCallback.onQuad || quadCallback.onPrefix || quadCallback.onComment || quadCallback.onVersion)) {
          onQuad = quadCallback.onQuad;
          onPrefix = quadCallback.onPrefix;
          onComment = quadCallback.onComment;
          onVersion = quadCallback.onVersion;
        } else {
          onQuad = quadCallback;
          onPrefix = prefixCallback;
          onVersion = versionCallback;
        }
        this._readCallback = this._readBeforeTopContext;
        this._sparqlStyle = false;
        this._prefixes = /* @__PURE__ */ Object.create(null);
        this._prefixes._ = this._blankNodePrefix ? this._blankNodePrefix.substr(2) : `b${blankNodePrefix++}_`;
        this._prefixCallback = onPrefix || noop;
        this._versionCallback = onVersion || noop;
        this._inversePredicate = false;
        this._quantified = /* @__PURE__ */ Object.create(null);
        if (!onQuad) {
          const quads = [];
          let error;
          this._callback = (e5, t4) => {
            e5 ? error = e5 : t4 && quads.push(t4);
          };
          this._lexer.tokenize(input).every((token) => {
            return this._readCallback = this._readCallback(token);
          });
          if (error) throw error;
          return quads;
        }
        let processNextToken = (error, token) => {
          if (error !== null)
            this._callback(error), this._callback = noop;
          else if (this._readCallback)
            this._readCallback = this._readCallback(token);
        };
        if (onComment) {
          this._lexer.comments = true;
          processNextToken = (error, token) => {
            if (error !== null)
              this._callback(error), this._callback = noop;
            else if (this._readCallback) {
              if (token.type === "comment")
                onComment(token.value);
              else
                this._readCallback = this._readCallback(token);
            }
          };
        }
        this._callback = onQuad;
        this._lexer.tokenize(input, processNextToken);
      }
    };
    N3Parser.SUPPORTED_VERSIONS = [
      "1.2",
      "1.2-basic",
      "1.1"
    ];
    initDataFactory(N3Parser.prototype, N3DataFactory_default);
  }
});

// node_modules/n3/src/N3Util.js
var N3Util_exports = {};
__export(N3Util_exports, {
  inDefaultGraph: () => inDefaultGraph,
  isBlankNode: () => isBlankNode,
  isDefaultGraph: () => isDefaultGraph,
  isLiteral: () => isLiteral,
  isNamedNode: () => isNamedNode,
  isQuad: () => isQuad,
  isVariable: () => isVariable,
  prefix: () => prefix,
  prefixes: () => prefixes
});
function isNamedNode(term) {
  return !!term && term.termType === "NamedNode";
}
function isBlankNode(term) {
  return !!term && term.termType === "BlankNode";
}
function isLiteral(term) {
  return !!term && term.termType === "Literal";
}
function isVariable(term) {
  return !!term && term.termType === "Variable";
}
function isQuad(term) {
  return !!term && term.termType === "Quad";
}
function isDefaultGraph(term) {
  return !!term && term.termType === "DefaultGraph";
}
function inDefaultGraph(quad3) {
  return isDefaultGraph(quad3.graph);
}
function prefix(iri, factory) {
  return prefixes({ "": iri.value || iri }, factory)("");
}
function prefixes(defaultPrefixes, factory) {
  const prefixes2 = /* @__PURE__ */ Object.create(null);
  for (const prefix2 in defaultPrefixes)
    processPrefix(prefix2, defaultPrefixes[prefix2]);
  factory = factory || N3DataFactory_default;
  function processPrefix(prefix2, iri) {
    if (typeof iri === "string") {
      const cache = /* @__PURE__ */ Object.create(null);
      prefixes2[prefix2] = (local) => {
        return cache[local] || (cache[local] = factory.namedNode(iri + local));
      };
    } else if (!(prefix2 in prefixes2)) {
      throw new Error(`Unknown prefix: ${prefix2}`);
    }
    return prefixes2[prefix2];
  }
  return processPrefix;
}
var init_N3Util = __esm({
  "node_modules/n3/src/N3Util.js"() {
    "use strict";
    init_N3DataFactory();
  }
});

// node_modules/n3/src/Util.js
function escapeRegex(regex) {
  return regex.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, "\\$&");
}
var init_Util = __esm({
  "node_modules/n3/src/Util.js"() {
    "use strict";
  }
});

// node_modules/n3/src/BaseIRI.js
var BASE_UNSUPPORTED, SUFFIX_SUPPORTED, CURRENT, PARENT, QUERY, FRAGMENT, BaseIRI;
var init_BaseIRI = __esm({
  "node_modules/n3/src/BaseIRI.js"() {
    "use strict";
    init_Util();
    BASE_UNSUPPORTED = /^:?[^:?#]*(?:[?#]|$)|^file:|^[^:]*:\/*[^?#]+?\/(?:\.\.?(?:\/|$)|\/)/i;
    SUFFIX_SUPPORTED = /^(?:(?:[^/?#]{3,}|\.?[^/?#.]\.?)(?:\/[^/?#]{3,}|\.?[^/?#.]\.?)*\/?)?(?:[?#]|$)/;
    CURRENT = "./";
    PARENT = "../";
    QUERY = "?";
    FRAGMENT = "#";
    BaseIRI = class _BaseIRI {
      constructor(base) {
        this.base = base;
        this._baseLength = 0;
        this._baseMatcher = null;
        this._pathReplacements = new Array(base.length + 1);
      }
      static supports(base) {
        return !BASE_UNSUPPORTED.test(base);
      }
      _getBaseMatcher() {
        if (this._baseMatcher)
          return this._baseMatcher;
        if (!_BaseIRI.supports(this.base))
          return this._baseMatcher = /.^/;
        const scheme = /^[^:]*:\/*/.exec(this.base)[0];
        const regexHead = ["^", escapeRegex(scheme)];
        const regexTail = [];
        const segments = [], segmenter = /[^/?#]*([/?#])/y;
        let segment, query = 0, fragment = 0, last = segmenter.lastIndex = scheme.length;
        while (!query && !fragment && (segment = segmenter.exec(this.base))) {
          if (segment[1] === FRAGMENT)
            fragment = segmenter.lastIndex - 1;
          else {
            regexHead.push(escapeRegex(segment[0]), "(?:");
            regexTail.push(")?");
            if (segment[1] !== QUERY)
              segments.push(last = segmenter.lastIndex);
            else {
              query = last = segmenter.lastIndex;
              fragment = this.base.indexOf(FRAGMENT, query);
              this._pathReplacements[query] = QUERY;
            }
          }
        }
        for (let i5 = 0; i5 < segments.length; i5++)
          this._pathReplacements[segments[i5]] = PARENT.repeat(segments.length - i5 - 1);
        this._pathReplacements[segments[segments.length - 1]] = CURRENT;
        this._baseLength = fragment > 0 ? fragment : this.base.length;
        regexHead.push(
          escapeRegex(this.base.substring(last, this._baseLength)),
          query ? "(?:#|$)" : "(?:[?#]|$)"
        );
        return this._baseMatcher = new RegExp([...regexHead, ...regexTail].join(""));
      }
      toRelative(iri) {
        const match2 = this._getBaseMatcher().exec(iri);
        if (!match2)
          return iri;
        const length = match2[0].length;
        if (length === this._baseLength && length === iri.length)
          return "";
        const parentPath = this._pathReplacements[length];
        if (parentPath) {
          const suffix = iri.substring(length);
          if (parentPath !== QUERY && !SUFFIX_SUPPORTED.test(suffix))
            return iri;
          if (parentPath === CURRENT && /^[^?#]/.test(suffix))
            return suffix;
          return parentPath + suffix;
        }
        return iri.substring(length - 1);
      }
    };
  }
});

// node_modules/n3/src/N3Writer.js
function characterReplacer(character) {
  let result = escapedCharacters[character];
  if (result === void 0) {
    if (character.length === 1) {
      result = character.charCodeAt(0).toString(16);
      result = "\\u0000".substr(0, 6 - result.length) + result;
    } else {
      result = ((character.charCodeAt(0) - 55296) * 1024 + character.charCodeAt(1) + 9216).toString(16);
      result = "\\U00000000".substr(0, 10 - result.length) + result;
    }
  }
  return result;
}
var DEFAULTGRAPH2, rdf2, xsd3, escape, escapeAll, escapedCharacters, SerializedTerm, N3Writer;
var init_N3Writer = __esm({
  "node_modules/n3/src/N3Writer.js"() {
    "use strict";
    init_IRIs();
    init_N3DataFactory();
    init_N3Util();
    init_BaseIRI();
    init_Util();
    DEFAULTGRAPH2 = N3DataFactory_default.defaultGraph();
    ({ rdf: rdf2, xsd: xsd3 } = IRIs_default);
    escape = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/;
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g;
    escapedCharacters = {
      "\\": "\\\\",
      '"': '\\"',
      "	": "\\t",
      "\n": "\\n",
      "\r": "\\r",
      "\b": "\\b",
      "\f": "\\f"
    };
    SerializedTerm = class extends Term {
      // Pretty-printed nodes are not equal to any other node
      // (e.g., [] does not equal [])
      equals(other) {
        return other === this;
      }
    };
    N3Writer = class {
      constructor(outputStream, options) {
        this._prefixRegex = /$0^/;
        if (outputStream && typeof outputStream.write !== "function")
          options = outputStream, outputStream = null;
        options = options || {};
        this._lists = options.lists;
        if (!outputStream) {
          let output = "";
          this._outputStream = {
            write(chunk, encoding, done) {
              output += chunk;
              done && done();
            },
            end: (done) => {
              done && done(null, output);
            }
          };
          this._endStream = true;
        } else {
          this._outputStream = outputStream;
          this._endStream = options.end === void 0 ? true : !!options.end;
        }
        this._subject = null;
        if (!/triple|quad/i.test(options.format)) {
          this._lineMode = false;
          this._graph = DEFAULTGRAPH2;
          this._prefixIRIs = /* @__PURE__ */ Object.create(null);
          options.prefixes && this.addPrefixes(options.prefixes);
          if (options.baseIRI) {
            this._baseIri = new BaseIRI(options.baseIRI);
          }
        } else {
          this._lineMode = true;
          this._writeQuad = this._writeQuadLine;
        }
      }
      // ## Private methods
      // ### Whether the current graph is the default graph
      get _inDefaultGraph() {
        return DEFAULTGRAPH2.equals(this._graph);
      }
      // ### `_write` writes the argument to the output stream
      _write(string, callback) {
        this._outputStream.write(string, "utf8", callback);
      }
      // ### `_writeQuad` writes the quad to the output stream
      _writeQuad(subject2, predicate2, object2, graph, done) {
        try {
          if (!graph.equals(this._graph)) {
            this._write((this._subject === null ? "" : this._inDefaultGraph ? ".\n" : "\n}\n") + (DEFAULTGRAPH2.equals(graph) ? "" : `${this._encodeIriOrBlank(graph)} {
`));
            this._graph = graph;
            this._subject = null;
          }
          if (subject2.equals(this._subject)) {
            if (predicate2.equals(this._predicate))
              this._write(`, ${this._encodeObject(object2)}`, done);
            else
              this._write(`;
    ${this._encodePredicate(this._predicate = predicate2)} ${this._encodeObject(object2)}`, done);
          } else
            this._write(`${(this._subject === null ? "" : ".\n") + this._encodeSubject(this._subject = subject2)} ${this._encodePredicate(this._predicate = predicate2)} ${this._encodeObject(object2)}`, done);
        } catch (error) {
          done && done(error);
        }
      }
      // ### `_writeQuadLine` writes the quad to the output stream as a single line
      _writeQuadLine(subject2, predicate2, object2, graph, done) {
        delete this._prefixMatch;
        this._write(this.quadToString(subject2, predicate2, object2, graph), done);
      }
      // ### `quadToString` serializes a quad as a string
      quadToString(subject2, predicate2, object2, graph) {
        return `${this._encodeSubject(subject2)} ${this._encodeIriOrBlank(predicate2)} ${this._encodeObject(object2)}${graph && graph.value ? ` ${this._encodeIriOrBlank(graph)} .
` : " .\n"}`;
      }
      // ### `quadsToString` serializes an array of quads as a string
      quadsToString(quads) {
        let quadsString = "";
        for (const quad3 of quads)
          quadsString += this.quadToString(quad3.subject, quad3.predicate, quad3.object, quad3.graph);
        return quadsString;
      }
      // ### `_encodeSubject` represents a subject
      _encodeSubject(entity) {
        return entity.termType === "Quad" ? this._encodeQuad(entity) : this._encodeIriOrBlank(entity);
      }
      // ### `_encodeIriOrBlank` represents an IRI or blank node
      _encodeIriOrBlank(entity) {
        if (entity.termType !== "NamedNode") {
          if (this._lists && entity.value in this._lists)
            entity = this.list(this._lists[entity.value]);
          return "id" in entity ? entity.id : `_:${entity.value}`;
        }
        let iri = entity.value;
        if (this._baseIri) {
          iri = this._baseIri.toRelative(iri);
        }
        if (escape.test(iri))
          iri = iri.replace(escapeAll, characterReplacer);
        const prefixMatch = this._prefixRegex.exec(iri);
        return !prefixMatch ? `<${iri}>` : !prefixMatch[1] ? iri : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2];
      }
      // ### `_encodeLiteral` represents a literal
      _encodeLiteral(literal3) {
        let value = literal3.value;
        if (escape.test(value))
          value = value.replace(escapeAll, characterReplacer);
        const direction = literal3.direction ? `--${literal3.direction}` : "";
        if (literal3.language)
          return `"${value}"@${literal3.language}${direction}`;
        if (this._lineMode) {
          if (literal3.datatype.value === xsd3.string)
            return `"${value}"`;
        } else {
          switch (literal3.datatype.value) {
            case xsd3.string:
              return `"${value}"`;
            case xsd3.boolean:
              if (value === "true" || value === "false")
                return value;
              break;
            case xsd3.integer:
              if (/^[+-]?\d+$/.test(value))
                return value;
              break;
            case xsd3.decimal:
              if (/^[+-]?\d*\.\d+$/.test(value))
                return value;
              break;
            case xsd3.double:
              if (/^[+-]?(?:\d+\.\d*|\.?\d+)[eE][+-]?\d+$/.test(value))
                return value;
              break;
          }
        }
        return `"${value}"^^${this._encodeIriOrBlank(literal3.datatype)}`;
      }
      // ### `_encodePredicate` represents a predicate
      _encodePredicate(predicate2) {
        return predicate2.value === rdf2.type ? "a" : this._encodeIriOrBlank(predicate2);
      }
      // ### `_encodeObject` represents an object
      _encodeObject(object2) {
        switch (object2.termType) {
          case "Quad":
            return this._encodeQuad(object2);
          case "Literal":
            return this._encodeLiteral(object2);
          default:
            return this._encodeIriOrBlank(object2);
        }
      }
      // ### `_encodeQuad` encodes an RDF-star quad
      _encodeQuad({ subject: subject2, predicate: predicate2, object: object2, graph }) {
        return `<<(${this._encodeSubject(subject2)} ${this._encodePredicate(predicate2)} ${this._encodeObject(object2)}${isDefaultGraph(graph) ? "" : ` ${this._encodeIriOrBlank(graph)}`})>>`;
      }
      // ### `_blockedWrite` replaces `_write` after the writer has been closed
      _blockedWrite() {
        throw new Error("Cannot write because the writer has been closed.");
      }
      // ### `addQuad` adds the quad to the output stream
      addQuad(subject2, predicate2, object2, graph, done) {
        if (object2 === void 0)
          this._writeQuad(subject2.subject, subject2.predicate, subject2.object, subject2.graph, predicate2);
        else if (typeof graph === "function")
          this._writeQuad(subject2, predicate2, object2, DEFAULTGRAPH2, graph);
        else
          this._writeQuad(subject2, predicate2, object2, graph || DEFAULTGRAPH2, done);
      }
      // ### `addQuads` adds the quads to the output stream
      addQuads(quads) {
        for (let i5 = 0; i5 < quads.length; i5++)
          this.addQuad(quads[i5]);
      }
      // ### `addPrefix` adds the prefix to the output stream
      addPrefix(prefix2, iri, done) {
        const prefixes2 = {};
        prefixes2[prefix2] = iri;
        this.addPrefixes(prefixes2, done);
      }
      // ### `addPrefixes` adds the prefixes to the output stream
      addPrefixes(prefixes2, done) {
        if (!this._prefixIRIs)
          return done && done();
        let hasPrefixes = false;
        for (let prefix2 in prefixes2) {
          let iri = prefixes2[prefix2];
          if (typeof iri !== "string")
            iri = iri.value;
          hasPrefixes = true;
          if (this._subject !== null) {
            this._write(this._inDefaultGraph ? ".\n" : "\n}\n");
            this._subject = null, this._graph = "";
          }
          this._prefixIRIs[iri] = prefix2 += ":";
          this._write(`@prefix ${prefix2} <${iri}>.
`);
        }
        if (hasPrefixes) {
          let IRIlist = "", prefixList = "";
          for (const prefixIRI in this._prefixIRIs) {
            IRIlist += IRIlist ? `|${prefixIRI}` : prefixIRI;
            prefixList += (prefixList ? "|" : "") + this._prefixIRIs[prefixIRI];
          }
          IRIlist = escapeRegex(IRIlist, /[\]\/\(\)\*\+\?\.\\\$]/g, "\\$&");
          this._prefixRegex = new RegExp(`^(?:${prefixList})[^/]*$|^(${IRIlist})([_a-zA-Z0-9][\\-_a-zA-Z0-9]*)$`);
        }
        this._write(hasPrefixes ? "\n" : "", done);
      }
      // ### `blank` creates a blank node with the given content
      blank(predicate2, object2) {
        let children = predicate2, child, length;
        if (predicate2 === void 0)
          children = [];
        else if (predicate2.termType)
          children = [{ predicate: predicate2, object: object2 }];
        else if (!("length" in predicate2))
          children = [predicate2];
        switch (length = children.length) {
          // Generate an empty blank node
          case 0:
            return new SerializedTerm("[]");
          // Generate a non-nested one-triple blank node
          case 1:
            child = children[0];
            if (!(child.object instanceof SerializedTerm))
              return new SerializedTerm(`[ ${this._encodePredicate(child.predicate)} ${this._encodeObject(child.object)} ]`);
          // Generate a multi-triple or nested blank node
          default:
            let contents = "[";
            for (let i5 = 0; i5 < length; i5++) {
              child = children[i5];
              if (child.predicate.equals(predicate2))
                contents += `, ${this._encodeObject(child.object)}`;
              else {
                contents += `${(i5 ? ";\n  " : "\n  ") + this._encodePredicate(child.predicate)} ${this._encodeObject(child.object)}`;
                predicate2 = child.predicate;
              }
            }
            return new SerializedTerm(`${contents}
]`);
        }
      }
      // ### `list` creates a list node with the given content
      list(elements) {
        const length = elements && elements.length || 0, contents = new Array(length);
        for (let i5 = 0; i5 < length; i5++)
          contents[i5] = this._encodeObject(elements[i5]);
        return new SerializedTerm(`(${contents.join(" ")})`);
      }
      // ### `end` signals the end of the output stream
      end(done) {
        if (this._subject !== null) {
          this._write(this._inDefaultGraph ? ".\n" : "\n}\n");
          this._subject = null;
        }
        this._write = this._blockedWrite;
        let singleDone = done && ((error, result) => {
          singleDone = null, done(error, result);
        });
        if (this._endStream) {
          try {
            return this._outputStream.end(singleDone);
          } catch (error) {
          }
        }
        singleDone && singleDone();
      }
    };
  }
});

// node_modules/readable-stream/lib/ours/primordials.js
var require_primordials = __commonJS({
  "node_modules/readable-stream/lib/ours/primordials.js"(exports, module) {
    "use strict";
    var AggregateError = class extends Error {
      constructor(errors) {
        if (!Array.isArray(errors)) {
          throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
        }
        let message = "";
        for (let i5 = 0; i5 < errors.length; i5++) {
          message += `    ${errors[i5].stack}
`;
        }
        super(message);
        this.name = "AggregateError";
        this.errors = errors;
      }
    };
    module.exports = {
      AggregateError,
      ArrayIsArray(self2) {
        return Array.isArray(self2);
      },
      ArrayPrototypeIncludes(self2, el) {
        return self2.includes(el);
      },
      ArrayPrototypeIndexOf(self2, el) {
        return self2.indexOf(el);
      },
      ArrayPrototypeJoin(self2, sep) {
        return self2.join(sep);
      },
      ArrayPrototypeMap(self2, fn) {
        return self2.map(fn);
      },
      ArrayPrototypePop(self2, el) {
        return self2.pop(el);
      },
      ArrayPrototypePush(self2, el) {
        return self2.push(el);
      },
      ArrayPrototypeSlice(self2, start, end) {
        return self2.slice(start, end);
      },
      Error,
      FunctionPrototypeCall(fn, thisArgs, ...args) {
        return fn.call(thisArgs, ...args);
      },
      FunctionPrototypeSymbolHasInstance(self2, instance) {
        return Function.prototype[Symbol.hasInstance].call(self2, instance);
      },
      MathFloor: Math.floor,
      Number,
      NumberIsInteger: Number.isInteger,
      NumberIsNaN: Number.isNaN,
      NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
      NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
      NumberParseInt: Number.parseInt,
      ObjectDefineProperties(self2, props) {
        return Object.defineProperties(self2, props);
      },
      ObjectDefineProperty(self2, name, prop) {
        return Object.defineProperty(self2, name, prop);
      },
      ObjectGetOwnPropertyDescriptor(self2, name) {
        return Object.getOwnPropertyDescriptor(self2, name);
      },
      ObjectKeys(obj) {
        return Object.keys(obj);
      },
      ObjectSetPrototypeOf(target, proto) {
        return Object.setPrototypeOf(target, proto);
      },
      Promise,
      PromisePrototypeCatch(self2, fn) {
        return self2.catch(fn);
      },
      PromisePrototypeThen(self2, thenFn, catchFn) {
        return self2.then(thenFn, catchFn);
      },
      PromiseReject(err) {
        return Promise.reject(err);
      },
      PromiseResolve(val) {
        return Promise.resolve(val);
      },
      ReflectApply: Reflect.apply,
      RegExpPrototypeTest(self2, value) {
        return self2.test(value);
      },
      SafeSet: Set,
      String,
      StringPrototypeSlice(self2, start, end) {
        return self2.slice(start, end);
      },
      StringPrototypeToLowerCase(self2) {
        return self2.toLowerCase();
      },
      StringPrototypeToUpperCase(self2) {
        return self2.toUpperCase();
      },
      StringPrototypeTrim(self2) {
        return self2.trim();
      },
      Symbol,
      SymbolFor: Symbol.for,
      SymbolAsyncIterator: Symbol.asyncIterator,
      SymbolHasInstance: Symbol.hasInstance,
      SymbolIterator: Symbol.iterator,
      SymbolDispose: Symbol.dispose || /* @__PURE__ */ Symbol("Symbol.dispose"),
      SymbolAsyncDispose: Symbol.asyncDispose || /* @__PURE__ */ Symbol("Symbol.asyncDispose"),
      TypedArrayPrototypeSet(self2, buf, len) {
        return self2.set(buf, len);
      },
      Boolean,
      Uint8Array
    };
  }
});

// node_modules/readable-stream/lib/ours/util/inspect.js
var require_inspect = __commonJS({
  "node_modules/readable-stream/lib/ours/util/inspect.js"(exports, module) {
    "use strict";
    module.exports = {
      format(format, ...args) {
        return format.replace(/%([sdifj])/g, function(...[_unused, type]) {
          const replacement = args.shift();
          if (type === "f") {
            return replacement.toFixed(6);
          } else if (type === "j") {
            return JSON.stringify(replacement);
          } else if (type === "s" && typeof replacement === "object") {
            const ctor = replacement.constructor !== Object ? replacement.constructor.name : "";
            return `${ctor} {}`.trim();
          } else {
            return replacement.toString();
          }
        });
      },
      inspect(value) {
        switch (typeof value) {
          case "string":
            if (value.includes("'")) {
              if (!value.includes('"')) {
                return `"${value}"`;
              } else if (!value.includes("`") && !value.includes("${")) {
                return `\`${value}\``;
              }
            }
            return `'${value}'`;
          case "number":
            if (isNaN(value)) {
              return "NaN";
            } else if (Object.is(value, -0)) {
              return String(value);
            }
            return value;
          case "bigint":
            return `${String(value)}n`;
          case "boolean":
          case "undefined":
            return String(value);
          case "object":
            return "{}";
        }
      }
    };
  }
});

// node_modules/readable-stream/lib/ours/errors.js
var require_errors = __commonJS({
  "node_modules/readable-stream/lib/ours/errors.js"(exports, module) {
    "use strict";
    var { format, inspect } = require_inspect();
    var { AggregateError: CustomAggregateError } = require_primordials();
    var AggregateError = globalThis.AggregateError || CustomAggregateError;
    var kIsNodeError = /* @__PURE__ */ Symbol("kIsNodeError");
    var kTypes = [
      "string",
      "function",
      "number",
      "object",
      // Accept 'Function' and 'Object' as alternative to the lower cased version.
      "Function",
      "Object",
      "boolean",
      "bigint",
      "symbol"
    ];
    var classRegExp = /^([A-Z][a-z0-9]*)+$/;
    var nodeInternalPrefix = "__node_internal_";
    var codes = {};
    function assert(value, message) {
      if (!value) {
        throw new codes.ERR_INTERNAL_ASSERTION(message);
      }
    }
    function addNumericalSeparator(val) {
      let res = "";
      let i5 = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i5 >= start + 4; i5 -= 3) {
        res = `_${val.slice(i5 - 3, i5)}${res}`;
      }
      return `${val.slice(0, i5)}${res}`;
    }
    function getMessage(key, msg, args) {
      if (typeof msg === "function") {
        assert(
          msg.length <= args.length,
          // Default options do not count.
          `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`
        );
        return msg(...args);
      }
      const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
      assert(
        expectedLength === args.length,
        `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`
      );
      if (args.length === 0) {
        return msg;
      }
      return format(msg, ...args);
    }
    function E2(code, message, Base) {
      if (!Base) {
        Base = Error;
      }
      class NodeError extends Base {
        constructor(...args) {
          super(getMessage(code, message, args));
        }
        toString() {
          return `${this.name} [${code}]: ${this.message}`;
        }
      }
      Object.defineProperties(NodeError.prototype, {
        name: {
          value: Base.name,
          writable: true,
          enumerable: false,
          configurable: true
        },
        toString: {
          value() {
            return `${this.name} [${code}]: ${this.message}`;
          },
          writable: true,
          enumerable: false,
          configurable: true
        }
      });
      NodeError.prototype.code = code;
      NodeError.prototype[kIsNodeError] = true;
      codes[code] = NodeError;
    }
    function hideStackFrames(fn) {
      const hidden = nodeInternalPrefix + fn.name;
      Object.defineProperty(fn, "name", {
        value: hidden
      });
      return fn;
    }
    function aggregateTwoErrors(innerError, outerError) {
      if (innerError && outerError && innerError !== outerError) {
        if (Array.isArray(outerError.errors)) {
          outerError.errors.push(innerError);
          return outerError;
        }
        const err = new AggregateError([outerError, innerError], outerError.message);
        err.code = outerError.code;
        return err;
      }
      return innerError || outerError;
    }
    var AbortError = class extends Error {
      constructor(message = "The operation was aborted", options = void 0) {
        if (options !== void 0 && typeof options !== "object") {
          throw new codes.ERR_INVALID_ARG_TYPE("options", "Object", options);
        }
        super(message, options);
        this.code = "ABORT_ERR";
        this.name = "AbortError";
      }
    };
    E2("ERR_ASSERTION", "%s", Error);
    E2(
      "ERR_INVALID_ARG_TYPE",
      (name, expected, actual) => {
        assert(typeof name === "string", "'name' must be a string");
        if (!Array.isArray(expected)) {
          expected = [expected];
        }
        let msg = "The ";
        if (name.endsWith(" argument")) {
          msg += `${name} `;
        } else {
          msg += `"${name}" ${name.includes(".") ? "property" : "argument"} `;
        }
        msg += "must be ";
        const types = [];
        const instances = [];
        const other = [];
        for (const value of expected) {
          assert(typeof value === "string", "All expected entries have to be of type string");
          if (kTypes.includes(value)) {
            types.push(value.toLowerCase());
          } else if (classRegExp.test(value)) {
            instances.push(value);
          } else {
            assert(value !== "object", 'The value "object" should be written as "Object"');
            other.push(value);
          }
        }
        if (instances.length > 0) {
          const pos = types.indexOf("object");
          if (pos !== -1) {
            types.splice(types, pos, 1);
            instances.push("Object");
          }
        }
        if (types.length > 0) {
          switch (types.length) {
            case 1:
              msg += `of type ${types[0]}`;
              break;
            case 2:
              msg += `one of type ${types[0]} or ${types[1]}`;
              break;
            default: {
              const last = types.pop();
              msg += `one of type ${types.join(", ")}, or ${last}`;
            }
          }
          if (instances.length > 0 || other.length > 0) {
            msg += " or ";
          }
        }
        if (instances.length > 0) {
          switch (instances.length) {
            case 1:
              msg += `an instance of ${instances[0]}`;
              break;
            case 2:
              msg += `an instance of ${instances[0]} or ${instances[1]}`;
              break;
            default: {
              const last = instances.pop();
              msg += `an instance of ${instances.join(", ")}, or ${last}`;
            }
          }
          if (other.length > 0) {
            msg += " or ";
          }
        }
        switch (other.length) {
          case 0:
            break;
          case 1:
            if (other[0].toLowerCase() !== other[0]) {
              msg += "an ";
            }
            msg += `${other[0]}`;
            break;
          case 2:
            msg += `one of ${other[0]} or ${other[1]}`;
            break;
          default: {
            const last = other.pop();
            msg += `one of ${other.join(", ")}, or ${last}`;
          }
        }
        if (actual == null) {
          msg += `. Received ${actual}`;
        } else if (typeof actual === "function" && actual.name) {
          msg += `. Received function ${actual.name}`;
        } else if (typeof actual === "object") {
          var _actual$constructor;
          if ((_actual$constructor = actual.constructor) !== null && _actual$constructor !== void 0 && _actual$constructor.name) {
            msg += `. Received an instance of ${actual.constructor.name}`;
          } else {
            const inspected = inspect(actual, {
              depth: -1
            });
            msg += `. Received ${inspected}`;
          }
        } else {
          let inspected = inspect(actual, {
            colors: false
          });
          if (inspected.length > 25) {
            inspected = `${inspected.slice(0, 25)}...`;
          }
          msg += `. Received type ${typeof actual} (${inspected})`;
        }
        return msg;
      },
      TypeError
    );
    E2(
      "ERR_INVALID_ARG_VALUE",
      (name, value, reason = "is invalid") => {
        let inspected = inspect(value);
        if (inspected.length > 128) {
          inspected = inspected.slice(0, 128) + "...";
        }
        const type = name.includes(".") ? "property" : "argument";
        return `The ${type} '${name}' ${reason}. Received ${inspected}`;
      },
      TypeError
    );
    E2(
      "ERR_INVALID_RETURN_VALUE",
      (input, name, value) => {
        var _value$constructor;
        const type = value !== null && value !== void 0 && (_value$constructor = value.constructor) !== null && _value$constructor !== void 0 && _value$constructor.name ? `instance of ${value.constructor.name}` : `type ${typeof value}`;
        return `Expected ${input} to be returned from the "${name}" function but got ${type}.`;
      },
      TypeError
    );
    E2(
      "ERR_MISSING_ARGS",
      (...args) => {
        assert(args.length > 0, "At least one arg needs to be specified");
        let msg;
        const len = args.length;
        args = (Array.isArray(args) ? args : [args]).map((a3) => `"${a3}"`).join(" or ");
        switch (len) {
          case 1:
            msg += `The ${args[0]} argument`;
            break;
          case 2:
            msg += `The ${args[0]} and ${args[1]} arguments`;
            break;
          default:
            {
              const last = args.pop();
              msg += `The ${args.join(", ")}, and ${last} arguments`;
            }
            break;
        }
        return `${msg} must be specified`;
      },
      TypeError
    );
    E2(
      "ERR_OUT_OF_RANGE",
      (str, range, input) => {
        assert(range, 'Missing "range" argument');
        let received;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
          received = String(input);
          const limit = BigInt(2) ** BigInt(32);
          if (input > limit || input < -limit) {
            received = addNumericalSeparator(received);
          }
          received += "n";
        } else {
          received = inspect(input);
        }
        return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`;
      },
      RangeError
    );
    E2("ERR_MULTIPLE_CALLBACK", "Callback called multiple times", Error);
    E2("ERR_METHOD_NOT_IMPLEMENTED", "The %s method is not implemented", Error);
    E2("ERR_STREAM_ALREADY_FINISHED", "Cannot call %s after a stream was finished", Error);
    E2("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable", Error);
    E2("ERR_STREAM_DESTROYED", "Cannot call %s after a stream was destroyed", Error);
    E2("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
    E2("ERR_STREAM_PREMATURE_CLOSE", "Premature close", Error);
    E2("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF", Error);
    E2("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event", Error);
    E2("ERR_STREAM_WRITE_AFTER_END", "write after end", Error);
    E2("ERR_UNKNOWN_ENCODING", "Unknown encoding: %s", TypeError);
    module.exports = {
      AbortError,
      aggregateTwoErrors: hideStackFrames(aggregateTwoErrors),
      hideStackFrames,
      codes
    };
  }
});

// node_modules/abort-controller/browser.js
var require_browser = __commonJS({
  "node_modules/abort-controller/browser.js"(exports, module) {
    "use strict";
    var { AbortController, AbortSignal } = typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : (
      /* otherwise */
      void 0
    );
    module.exports = AbortController;
    module.exports.AbortSignal = AbortSignal;
    module.exports.default = AbortController;
  }
});

// node_modules/events/events.js
var require_events = __commonJS({
  "node_modules/events/events.js"(exports, module) {
    "use strict";
    var R2 = typeof Reflect === "object" ? Reflect : null;
    var ReflectApply = R2 && typeof R2.apply === "function" ? R2.apply : function ReflectApply2(target, receiver, args) {
      return Function.prototype.apply.call(target, receiver, args);
    };
    var ReflectOwnKeys;
    if (R2 && typeof R2.ownKeys === "function") {
      ReflectOwnKeys = R2.ownKeys;
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
      };
    } else {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target);
      };
    }
    function ProcessEmitWarning(warning) {
      if (console && console.warn) console.warn(warning);
    }
    var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
      return value !== value;
    };
    function EventEmitter() {
      EventEmitter.init.call(this);
    }
    module.exports = EventEmitter;
    module.exports.once = once;
    EventEmitter.EventEmitter = EventEmitter;
    EventEmitter.prototype._events = void 0;
    EventEmitter.prototype._eventsCount = 0;
    EventEmitter.prototype._maxListeners = void 0;
    var defaultMaxListeners = 10;
    function checkListener(listener) {
      if (typeof listener !== "function") {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
    }
    Object.defineProperty(EventEmitter, "defaultMaxListeners", {
      enumerable: true,
      get: function() {
        return defaultMaxListeners;
      },
      set: function(arg) {
        if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
        }
        defaultMaxListeners = arg;
      }
    });
    EventEmitter.init = function() {
      if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      }
      this._maxListeners = this._maxListeners || void 0;
    };
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n5) {
      if (typeof n5 !== "number" || n5 < 0 || NumberIsNaN(n5)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n5 + ".");
      }
      this._maxListeners = n5;
      return this;
    };
    function _getMaxListeners(that) {
      if (that._maxListeners === void 0)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }
    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this);
    };
    EventEmitter.prototype.emit = function emit(type) {
      var args = [];
      for (var i5 = 1; i5 < arguments.length; i5++) args.push(arguments[i5]);
      var doError = type === "error";
      var events = this._events;
      if (events !== void 0)
        doError = doError && events.error === void 0;
      else if (!doError)
        return false;
      if (doError) {
        var er;
        if (args.length > 0)
          er = args[0];
        if (er instanceof Error) {
          throw er;
        }
        var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
        err.context = er;
        throw err;
      }
      var handler = events[type];
      if (handler === void 0)
        return false;
      if (typeof handler === "function") {
        ReflectApply(handler, this, args);
      } else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i5 = 0; i5 < len; ++i5)
          ReflectApply(listeners[i5], this, args);
      }
      return true;
    };
    function _addListener(target, type, listener, prepend) {
      var m2;
      var events;
      var existing;
      checkListener(listener);
      events = target._events;
      if (events === void 0) {
        events = target._events = /* @__PURE__ */ Object.create(null);
        target._eventsCount = 0;
      } else {
        if (events.newListener !== void 0) {
          target.emit(
            "newListener",
            type,
            listener.listener ? listener.listener : listener
          );
          events = target._events;
        }
        existing = events[type];
      }
      if (existing === void 0) {
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === "function") {
          existing = events[type] = prepend ? [listener, existing] : [existing, listener];
        } else if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
        m2 = _getMaxListeners(target);
        if (m2 > 0 && existing.length > m2 && !existing.warned) {
          existing.warned = true;
          var w2 = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
          w2.name = "MaxListenersExceededWarning";
          w2.emitter = target;
          w2.type = type;
          w2.count = existing.length;
          ProcessEmitWarning(w2);
        }
      }
      return target;
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.prependListener = function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };
    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0)
          return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }
    function _onceWrap(target, type, listener) {
      var state = { fired: false, wrapFn: void 0, target, type, listener };
      var wrapped = onceWrapper.bind(state);
      wrapped.listener = listener;
      state.wrapFn = wrapped;
      return wrapped;
    }
    EventEmitter.prototype.once = function once2(type, listener) {
      checkListener(listener);
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter.prototype.removeListener = function removeListener(type, listener) {
      var list, events, position, i5, originalListener;
      checkListener(listener);
      events = this._events;
      if (events === void 0)
        return this;
      list = events[type];
      if (list === void 0)
        return this;
      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = /* @__PURE__ */ Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit("removeListener", type, list.listener || listener);
        }
      } else if (typeof list !== "function") {
        position = -1;
        for (i5 = list.length - 1; i5 >= 0; i5--) {
          if (list[i5] === listener || list[i5].listener === listener) {
            originalListener = list[i5].listener;
            position = i5;
            break;
          }
        }
        if (position < 0)
          return this;
        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }
        if (list.length === 1)
          events[type] = list[0];
        if (events.removeListener !== void 0)
          this.emit("removeListener", type, originalListener || listener);
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
      var listeners, events, i5;
      events = this._events;
      if (events === void 0)
        return this;
      if (events.removeListener === void 0) {
        if (arguments.length === 0) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== void 0) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else
            delete events[type];
        }
        return this;
      }
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i5 = 0; i5 < keys.length; ++i5) {
          key = keys[i5];
          if (key === "removeListener") continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
        return this;
      }
      listeners = events[type];
      if (typeof listeners === "function") {
        this.removeListener(type, listeners);
      } else if (listeners !== void 0) {
        for (i5 = listeners.length - 1; i5 >= 0; i5--) {
          this.removeListener(type, listeners[i5]);
        }
      }
      return this;
    };
    function _listeners(target, type, unwrap) {
      var events = target._events;
      if (events === void 0)
        return [];
      var evlistener = events[type];
      if (evlistener === void 0)
        return [];
      if (typeof evlistener === "function")
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];
      return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }
    EventEmitter.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true);
    };
    EventEmitter.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false);
    };
    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === "function") {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };
    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;
      if (events !== void 0) {
        var evlistener = events[type];
        if (typeof evlistener === "function") {
          return 1;
        } else if (evlistener !== void 0) {
          return evlistener.length;
        }
      }
      return 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };
    function arrayClone(arr, n5) {
      var copy = new Array(n5);
      for (var i5 = 0; i5 < n5; ++i5)
        copy[i5] = arr[i5];
      return copy;
    }
    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
      list.pop();
    }
    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i5 = 0; i5 < ret.length; ++i5) {
        ret[i5] = arr[i5].listener || arr[i5];
      }
      return ret;
    }
    function once(emitter, name) {
      return new Promise(function(resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver);
          reject(err);
        }
        function resolver() {
          if (typeof emitter.removeListener === "function") {
            emitter.removeListener("error", errorListener);
          }
          resolve([].slice.call(arguments));
        }
        ;
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== "error") {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
      });
    }
    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === "function") {
        eventTargetAgnosticAddListener(emitter, "error", handler, flags);
      }
    }
    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === "function") {
        if (flags.once) {
          emitter.once(name, listener);
        } else {
          emitter.on(name, listener);
        }
      } else if (typeof emitter.addEventListener === "function") {
        emitter.addEventListener(name, function wrapListener(arg) {
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener);
          }
          listener(arg);
        });
      } else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
      }
    }
  }
});

// node_modules/readable-stream/lib/ours/util.js
var require_util = __commonJS({
  "node_modules/readable-stream/lib/ours/util.js"(exports, module) {
    "use strict";
    var bufferModule = require_buffer();
    var { format, inspect } = require_inspect();
    var {
      codes: { ERR_INVALID_ARG_TYPE }
    } = require_errors();
    var { kResistStopPropagation, AggregateError, SymbolDispose } = require_primordials();
    var AbortSignal = globalThis.AbortSignal || require_browser().AbortSignal;
    var AbortController = globalThis.AbortController || require_browser().AbortController;
    var AsyncFunction = Object.getPrototypeOf(async function() {
    }).constructor;
    var Blob = globalThis.Blob || bufferModule.Blob;
    var isBlob = typeof Blob !== "undefined" ? function isBlob2(b3) {
      return b3 instanceof Blob;
    } : function isBlob2(b3) {
      return false;
    };
    var validateAbortSignal = (signal, name) => {
      if (signal !== void 0 && (signal === null || typeof signal !== "object" || !("aborted" in signal))) {
        throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
      }
    };
    var validateFunction = (value, name) => {
      if (typeof value !== "function") {
        throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
      }
    };
    module.exports = {
      AggregateError,
      kEmptyObject: Object.freeze({}),
      once(callback) {
        let called = false;
        return function(...args) {
          if (called) {
            return;
          }
          called = true;
          callback.apply(this, args);
        };
      },
      createDeferredPromise: function() {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return {
          promise,
          resolve,
          reject
        };
      },
      promisify(fn) {
        return new Promise((resolve, reject) => {
          fn((err, ...args) => {
            if (err) {
              return reject(err);
            }
            return resolve(...args);
          });
        });
      },
      debuglog() {
        return function() {
        };
      },
      format,
      inspect,
      types: {
        isAsyncFunction(fn) {
          return fn instanceof AsyncFunction;
        },
        isArrayBufferView(arr) {
          return ArrayBuffer.isView(arr);
        }
      },
      isBlob,
      deprecate(fn, message) {
        return fn;
      },
      addAbortListener: require_events().addAbortListener || function addAbortListener(signal, listener) {
        if (signal === void 0) {
          throw new ERR_INVALID_ARG_TYPE("signal", "AbortSignal", signal);
        }
        validateAbortSignal(signal, "signal");
        validateFunction(listener, "listener");
        let removeEventListener;
        if (signal.aborted) {
          queueMicrotask(() => listener());
        } else {
          signal.addEventListener("abort", listener, {
            __proto__: null,
            once: true,
            [kResistStopPropagation]: true
          });
          removeEventListener = () => {
            signal.removeEventListener("abort", listener);
          };
        }
        return {
          __proto__: null,
          [SymbolDispose]() {
            var _removeEventListener;
            (_removeEventListener = removeEventListener) === null || _removeEventListener === void 0 ? void 0 : _removeEventListener();
          }
        };
      },
      AbortSignalAny: AbortSignal.any || function AbortSignalAny(signals) {
        if (signals.length === 1) {
          return signals[0];
        }
        const ac = new AbortController();
        const abort = () => ac.abort();
        signals.forEach((signal) => {
          validateAbortSignal(signal, "signals");
          signal.addEventListener("abort", abort, {
            once: true
          });
        });
        ac.signal.addEventListener(
          "abort",
          () => {
            signals.forEach((signal) => signal.removeEventListener("abort", abort));
          },
          {
            once: true
          }
        );
        return ac.signal;
      }
    };
    module.exports.promisify.custom = /* @__PURE__ */ Symbol.for("nodejs.util.promisify.custom");
  }
});

// node_modules/readable-stream/lib/internal/validators.js
var require_validators = __commonJS({
  "node_modules/readable-stream/lib/internal/validators.js"(exports, module) {
    "use strict";
    var {
      ArrayIsArray,
      ArrayPrototypeIncludes,
      ArrayPrototypeJoin,
      ArrayPrototypeMap,
      NumberIsInteger,
      NumberIsNaN,
      NumberMAX_SAFE_INTEGER,
      NumberMIN_SAFE_INTEGER,
      NumberParseInt,
      ObjectPrototypeHasOwnProperty,
      RegExpPrototypeExec,
      String: String2,
      StringPrototypeToUpperCase,
      StringPrototypeTrim
    } = require_primordials();
    var {
      hideStackFrames,
      codes: { ERR_SOCKET_BAD_PORT, ERR_INVALID_ARG_TYPE, ERR_INVALID_ARG_VALUE, ERR_OUT_OF_RANGE, ERR_UNKNOWN_SIGNAL }
    } = require_errors();
    var { normalizeEncoding } = require_util();
    var { isAsyncFunction, isArrayBufferView } = require_util().types;
    var signals = {};
    function isInt32(value) {
      return value === (value | 0);
    }
    function isUint32(value) {
      return value === value >>> 0;
    }
    var octalReg = /^[0-7]+$/;
    var modeDesc = "must be a 32-bit unsigned integer or an octal string";
    function parseFileMode(value, name, def) {
      if (typeof value === "undefined") {
        value = def;
      }
      if (typeof value === "string") {
        if (RegExpPrototypeExec(octalReg, value) === null) {
          throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
        }
        value = NumberParseInt(value, 8);
      }
      validateUint32(value, name);
      return value;
    }
    var validateInteger = hideStackFrames((value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
      if (typeof value !== "number") throw new ERR_INVALID_ARG_TYPE(name, "number", value);
      if (!NumberIsInteger(value)) throw new ERR_OUT_OF_RANGE(name, "an integer", value);
      if (value < min || value > max) throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
    });
    var validateInt32 = hideStackFrames((value, name, min = -2147483648, max = 2147483647) => {
      if (typeof value !== "number") {
        throw new ERR_INVALID_ARG_TYPE(name, "number", value);
      }
      if (!NumberIsInteger(value)) {
        throw new ERR_OUT_OF_RANGE(name, "an integer", value);
      }
      if (value < min || value > max) {
        throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
      }
    });
    var validateUint32 = hideStackFrames((value, name, positive = false) => {
      if (typeof value !== "number") {
        throw new ERR_INVALID_ARG_TYPE(name, "number", value);
      }
      if (!NumberIsInteger(value)) {
        throw new ERR_OUT_OF_RANGE(name, "an integer", value);
      }
      const min = positive ? 1 : 0;
      const max = 4294967295;
      if (value < min || value > max) {
        throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
      }
    });
    function validateString(value, name) {
      if (typeof value !== "string") throw new ERR_INVALID_ARG_TYPE(name, "string", value);
    }
    function validateNumber(value, name, min = void 0, max) {
      if (typeof value !== "number") throw new ERR_INVALID_ARG_TYPE(name, "number", value);
      if (min != null && value < min || max != null && value > max || (min != null || max != null) && NumberIsNaN(value)) {
        throw new ERR_OUT_OF_RANGE(
          name,
          `${min != null ? `>= ${min}` : ""}${min != null && max != null ? " && " : ""}${max != null ? `<= ${max}` : ""}`,
          value
        );
      }
    }
    var validateOneOf = hideStackFrames((value, name, oneOf) => {
      if (!ArrayPrototypeIncludes(oneOf, value)) {
        const allowed = ArrayPrototypeJoin(
          ArrayPrototypeMap(oneOf, (v2) => typeof v2 === "string" ? `'${v2}'` : String2(v2)),
          ", "
        );
        const reason = "must be one of: " + allowed;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateBoolean(value, name) {
      if (typeof value !== "boolean") throw new ERR_INVALID_ARG_TYPE(name, "boolean", value);
    }
    function getOwnPropertyValueOrDefault(options, key, defaultValue) {
      return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key];
    }
    var validateObject = hideStackFrames((value, name, options = null) => {
      const allowArray = getOwnPropertyValueOrDefault(options, "allowArray", false);
      const allowFunction = getOwnPropertyValueOrDefault(options, "allowFunction", false);
      const nullable = getOwnPropertyValueOrDefault(options, "nullable", false);
      if (!nullable && value === null || !allowArray && ArrayIsArray(value) || typeof value !== "object" && (!allowFunction || typeof value !== "function")) {
        throw new ERR_INVALID_ARG_TYPE(name, "Object", value);
      }
    });
    var validateDictionary = hideStackFrames((value, name) => {
      if (value != null && typeof value !== "object" && typeof value !== "function") {
        throw new ERR_INVALID_ARG_TYPE(name, "a dictionary", value);
      }
    });
    var validateArray = hideStackFrames((value, name, minLength = 0) => {
      if (!ArrayIsArray(value)) {
        throw new ERR_INVALID_ARG_TYPE(name, "Array", value);
      }
      if (value.length < minLength) {
        const reason = `must be longer than ${minLength}`;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
      }
    });
    function validateStringArray(value, name) {
      validateArray(value, name);
      for (let i5 = 0; i5 < value.length; i5++) {
        validateString(value[i5], `${name}[${i5}]`);
      }
    }
    function validateBooleanArray(value, name) {
      validateArray(value, name);
      for (let i5 = 0; i5 < value.length; i5++) {
        validateBoolean(value[i5], `${name}[${i5}]`);
      }
    }
    function validateAbortSignalArray(value, name) {
      validateArray(value, name);
      for (let i5 = 0; i5 < value.length; i5++) {
        const signal = value[i5];
        const indexedName = `${name}[${i5}]`;
        if (signal == null) {
          throw new ERR_INVALID_ARG_TYPE(indexedName, "AbortSignal", signal);
        }
        validateAbortSignal(signal, indexedName);
      }
    }
    function validateSignalName(signal, name = "signal") {
      validateString(signal, name);
      if (signals[signal] === void 0) {
        if (signals[StringPrototypeToUpperCase(signal)] !== void 0) {
          throw new ERR_UNKNOWN_SIGNAL(signal + " (signals must use all capital letters)");
        }
        throw new ERR_UNKNOWN_SIGNAL(signal);
      }
    }
    var validateBuffer = hideStackFrames((buffer, name = "buffer") => {
      if (!isArrayBufferView(buffer)) {
        throw new ERR_INVALID_ARG_TYPE(name, ["Buffer", "TypedArray", "DataView"], buffer);
      }
    });
    function validateEncoding(data, encoding) {
      const normalizedEncoding = normalizeEncoding(encoding);
      const length = data.length;
      if (normalizedEncoding === "hex" && length % 2 !== 0) {
        throw new ERR_INVALID_ARG_VALUE("encoding", encoding, `is invalid for data of length ${length}`);
      }
    }
    function validatePort(port, name = "Port", allowZero = true) {
      if (typeof port !== "number" && typeof port !== "string" || typeof port === "string" && StringPrototypeTrim(port).length === 0 || +port !== +port >>> 0 || port > 65535 || port === 0 && !allowZero) {
        throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
      }
      return port | 0;
    }
    var validateAbortSignal = hideStackFrames((signal, name) => {
      if (signal !== void 0 && (signal === null || typeof signal !== "object" || !("aborted" in signal))) {
        throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
      }
    });
    var validateFunction = hideStackFrames((value, name) => {
      if (typeof value !== "function") throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
    });
    var validatePlainFunction = hideStackFrames((value, name) => {
      if (typeof value !== "function" || isAsyncFunction(value)) throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
    });
    var validateUndefined = hideStackFrames((value, name) => {
      if (value !== void 0) throw new ERR_INVALID_ARG_TYPE(name, "undefined", value);
    });
    function validateUnion(value, name, union) {
      if (!ArrayPrototypeIncludes(union, value)) {
        throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, "|")}')`, value);
      }
    }
    var linkValueRegExp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
    function validateLinkHeaderFormat(value, name) {
      if (typeof value === "undefined" || !RegExpPrototypeExec(linkValueRegExp, value)) {
        throw new ERR_INVALID_ARG_VALUE(
          name,
          value,
          'must be an array or string of format "</styles.css>; rel=preload; as=style"'
        );
      }
    }
    function validateLinkHeaderValue(hints) {
      if (typeof hints === "string") {
        validateLinkHeaderFormat(hints, "hints");
        return hints;
      } else if (ArrayIsArray(hints)) {
        const hintsLength = hints.length;
        let result = "";
        if (hintsLength === 0) {
          return result;
        }
        for (let i5 = 0; i5 < hintsLength; i5++) {
          const link = hints[i5];
          validateLinkHeaderFormat(link, "hints");
          result += link;
          if (i5 !== hintsLength - 1) {
            result += ", ";
          }
        }
        return result;
      }
      throw new ERR_INVALID_ARG_VALUE(
        "hints",
        hints,
        'must be an array or string of format "</styles.css>; rel=preload; as=style"'
      );
    }
    module.exports = {
      isInt32,
      isUint32,
      parseFileMode,
      validateArray,
      validateStringArray,
      validateBooleanArray,
      validateAbortSignalArray,
      validateBoolean,
      validateBuffer,
      validateDictionary,
      validateEncoding,
      validateFunction,
      validateInt32,
      validateInteger,
      validateNumber,
      validateObject,
      validateOneOf,
      validatePlainFunction,
      validatePort,
      validateSignalName,
      validateString,
      validateUint32,
      validateUndefined,
      validateUnion,
      validateAbortSignal,
      validateLinkHeaderValue
    };
  }
});

// node_modules/process/browser.js
var require_browser2 = __commonJS({
  "node_modules/process/browser.js"(exports, module) {
    "use strict";
    var process2 = module.exports = {};
    var cachedSetTimeout;
    var cachedClearTimeout;
    function defaultSetTimout() {
      throw new Error("setTimeout has not been defined");
    }
    function defaultClearTimeout() {
      throw new Error("clearTimeout has not been defined");
    }
    (function() {
      try {
        if (typeof setTimeout === "function") {
          cachedSetTimeout = setTimeout;
        } else {
          cachedSetTimeout = defaultSetTimout;
        }
      } catch (e5) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        if (typeof clearTimeout === "function") {
          cachedClearTimeout = clearTimeout;
        } else {
          cachedClearTimeout = defaultClearTimeout;
        }
      } catch (e5) {
        cachedClearTimeout = defaultClearTimeout;
      }
    })();
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
        return setTimeout(fun, 0);
      }
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        return cachedSetTimeout(fun, 0);
      } catch (e5) {
        try {
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e6) {
          return cachedSetTimeout.call(this, fun, 0);
        }
      }
    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
        return clearTimeout(marker);
      }
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        return cachedClearTimeout(marker);
      } catch (e5) {
        try {
          return cachedClearTimeout.call(null, marker);
        } catch (e6) {
          return cachedClearTimeout.call(this, marker);
        }
      }
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    function cleanUpNextTick() {
      if (!draining || !currentQueue) {
        return;
      }
      draining = false;
      if (currentQueue.length) {
        queue = currentQueue.concat(queue);
      } else {
        queueIndex = -1;
      }
      if (queue.length) {
        drainQueue();
      }
    }
    function drainQueue() {
      if (draining) {
        return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run();
          }
        }
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }
    process2.nextTick = function(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (var i5 = 1; i5 < arguments.length; i5++) {
          args[i5 - 1] = arguments[i5];
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
      }
    };
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function() {
      this.fun.apply(null, this.array);
    };
    process2.title = "browser";
    process2.browser = true;
    process2.env = {};
    process2.argv = [];
    process2.version = "";
    process2.versions = {};
    function noop2() {
    }
    process2.on = noop2;
    process2.addListener = noop2;
    process2.once = noop2;
    process2.off = noop2;
    process2.removeListener = noop2;
    process2.removeAllListeners = noop2;
    process2.emit = noop2;
    process2.prependListener = noop2;
    process2.prependOnceListener = noop2;
    process2.listeners = function(name) {
      return [];
    };
    process2.binding = function(name) {
      throw new Error("process.binding is not supported");
    };
    process2.cwd = function() {
      return "/";
    };
    process2.chdir = function(dir) {
      throw new Error("process.chdir is not supported");
    };
    process2.umask = function() {
      return 0;
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/utils.js
var require_utils = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/utils.js"(exports, module) {
    "use strict";
    var { SymbolAsyncIterator, SymbolIterator, SymbolFor } = require_primordials();
    var kIsDestroyed = SymbolFor("nodejs.stream.destroyed");
    var kIsErrored = SymbolFor("nodejs.stream.errored");
    var kIsReadable = SymbolFor("nodejs.stream.readable");
    var kIsWritable = SymbolFor("nodejs.stream.writable");
    var kIsDisturbed = SymbolFor("nodejs.stream.disturbed");
    var kIsClosedPromise = SymbolFor("nodejs.webstream.isClosedPromise");
    var kControllerErrorFunction = SymbolFor("nodejs.webstream.controllerErrorFunction");
    function isReadableNodeStream(obj, strict = false) {
      var _obj$_readableState;
      return !!(obj && typeof obj.pipe === "function" && typeof obj.on === "function" && (!strict || typeof obj.pause === "function" && typeof obj.resume === "function") && (!obj._writableState || ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === void 0 ? void 0 : _obj$_readableState.readable) !== false) && // Duplex
      (!obj._writableState || obj._readableState));
    }
    function isWritableNodeStream(obj) {
      var _obj$_writableState;
      return !!(obj && typeof obj.write === "function" && typeof obj.on === "function" && (!obj._readableState || ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === void 0 ? void 0 : _obj$_writableState.writable) !== false));
    }
    function isDuplexNodeStream(obj) {
      return !!(obj && typeof obj.pipe === "function" && obj._readableState && typeof obj.on === "function" && typeof obj.write === "function");
    }
    function isNodeStream(obj) {
      return obj && (obj._readableState || obj._writableState || typeof obj.write === "function" && typeof obj.on === "function" || typeof obj.pipe === "function" && typeof obj.on === "function");
    }
    function isReadableStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.pipeThrough === "function" && typeof obj.getReader === "function" && typeof obj.cancel === "function");
    }
    function isWritableStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.getWriter === "function" && typeof obj.abort === "function");
    }
    function isTransformStream(obj) {
      return !!(obj && !isNodeStream(obj) && typeof obj.readable === "object" && typeof obj.writable === "object");
    }
    function isWebStream(obj) {
      return isReadableStream(obj) || isWritableStream(obj) || isTransformStream(obj);
    }
    function isIterable(obj, isAsync) {
      if (obj == null) return false;
      if (isAsync === true) return typeof obj[SymbolAsyncIterator] === "function";
      if (isAsync === false) return typeof obj[SymbolIterator] === "function";
      return typeof obj[SymbolAsyncIterator] === "function" || typeof obj[SymbolIterator] === "function";
    }
    function isDestroyed(stream) {
      if (!isNodeStream(stream)) return null;
      const wState = stream._writableState;
      const rState = stream._readableState;
      const state = wState || rState;
      return !!(stream.destroyed || stream[kIsDestroyed] || state !== null && state !== void 0 && state.destroyed);
    }
    function isWritableEnded(stream) {
      if (!isWritableNodeStream(stream)) return null;
      if (stream.writableEnded === true) return true;
      const wState = stream._writableState;
      if (wState !== null && wState !== void 0 && wState.errored) return false;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.ended) !== "boolean") return null;
      return wState.ended;
    }
    function isWritableFinished(stream, strict) {
      if (!isWritableNodeStream(stream)) return null;
      if (stream.writableFinished === true) return true;
      const wState = stream._writableState;
      if (wState !== null && wState !== void 0 && wState.errored) return false;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.finished) !== "boolean") return null;
      return !!(wState.finished || strict === false && wState.ended === true && wState.length === 0);
    }
    function isReadableEnded(stream) {
      if (!isReadableNodeStream(stream)) return null;
      if (stream.readableEnded === true) return true;
      const rState = stream._readableState;
      if (!rState || rState.errored) return false;
      if (typeof (rState === null || rState === void 0 ? void 0 : rState.ended) !== "boolean") return null;
      return rState.ended;
    }
    function isReadableFinished(stream, strict) {
      if (!isReadableNodeStream(stream)) return null;
      const rState = stream._readableState;
      if (rState !== null && rState !== void 0 && rState.errored) return false;
      if (typeof (rState === null || rState === void 0 ? void 0 : rState.endEmitted) !== "boolean") return null;
      return !!(rState.endEmitted || strict === false && rState.ended === true && rState.length === 0);
    }
    function isReadable(stream) {
      if (stream && stream[kIsReadable] != null) return stream[kIsReadable];
      if (typeof (stream === null || stream === void 0 ? void 0 : stream.readable) !== "boolean") return null;
      if (isDestroyed(stream)) return false;
      return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream);
    }
    function isWritable(stream) {
      if (stream && stream[kIsWritable] != null) return stream[kIsWritable];
      if (typeof (stream === null || stream === void 0 ? void 0 : stream.writable) !== "boolean") return null;
      if (isDestroyed(stream)) return false;
      return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream);
    }
    function isFinished(stream, opts) {
      if (!isNodeStream(stream)) {
        return null;
      }
      if (isDestroyed(stream)) {
        return true;
      }
      if ((opts === null || opts === void 0 ? void 0 : opts.readable) !== false && isReadable(stream)) {
        return false;
      }
      if ((opts === null || opts === void 0 ? void 0 : opts.writable) !== false && isWritable(stream)) {
        return false;
      }
      return true;
    }
    function isWritableErrored(stream) {
      var _stream$_writableStat, _stream$_writableStat2;
      if (!isNodeStream(stream)) {
        return null;
      }
      if (stream.writableErrored) {
        return stream.writableErrored;
      }
      return (_stream$_writableStat = (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === void 0 ? void 0 : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== void 0 ? _stream$_writableStat : null;
    }
    function isReadableErrored(stream) {
      var _stream$_readableStat, _stream$_readableStat2;
      if (!isNodeStream(stream)) {
        return null;
      }
      if (stream.readableErrored) {
        return stream.readableErrored;
      }
      return (_stream$_readableStat = (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === void 0 ? void 0 : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== void 0 ? _stream$_readableStat : null;
    }
    function isClosed(stream) {
      if (!isNodeStream(stream)) {
        return null;
      }
      if (typeof stream.closed === "boolean") {
        return stream.closed;
      }
      const wState = stream._writableState;
      const rState = stream._readableState;
      if (typeof (wState === null || wState === void 0 ? void 0 : wState.closed) === "boolean" || typeof (rState === null || rState === void 0 ? void 0 : rState.closed) === "boolean") {
        return (wState === null || wState === void 0 ? void 0 : wState.closed) || (rState === null || rState === void 0 ? void 0 : rState.closed);
      }
      if (typeof stream._closed === "boolean" && isOutgoingMessage(stream)) {
        return stream._closed;
      }
      return null;
    }
    function isOutgoingMessage(stream) {
      return typeof stream._closed === "boolean" && typeof stream._defaultKeepAlive === "boolean" && typeof stream._removedConnection === "boolean" && typeof stream._removedContLen === "boolean";
    }
    function isServerResponse(stream) {
      return typeof stream._sent100 === "boolean" && isOutgoingMessage(stream);
    }
    function isServerRequest(stream) {
      var _stream$req;
      return typeof stream._consuming === "boolean" && typeof stream._dumped === "boolean" && ((_stream$req = stream.req) === null || _stream$req === void 0 ? void 0 : _stream$req.upgradeOrConnect) === void 0;
    }
    function willEmitClose(stream) {
      if (!isNodeStream(stream)) return null;
      const wState = stream._writableState;
      const rState = stream._readableState;
      const state = wState || rState;
      return !state && isServerResponse(stream) || !!(state && state.autoDestroy && state.emitClose && state.closed === false);
    }
    function isDisturbed(stream) {
      var _stream$kIsDisturbed;
      return !!(stream && ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== void 0 ? _stream$kIsDisturbed : stream.readableDidRead || stream.readableAborted));
    }
    function isErrored(stream) {
      var _ref, _ref2, _ref3, _ref4, _ref5, _stream$kIsErrored, _stream$_readableStat3, _stream$_writableStat3, _stream$_readableStat4, _stream$_writableStat4;
      return !!(stream && ((_ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== void 0 ? _stream$kIsErrored : stream.readableErrored) !== null && _ref5 !== void 0 ? _ref5 : stream.writableErrored) !== null && _ref4 !== void 0 ? _ref4 : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === void 0 ? void 0 : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== void 0 ? _ref3 : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === void 0 ? void 0 : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== void 0 ? _ref2 : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === void 0 ? void 0 : _stream$_readableStat4.errored) !== null && _ref !== void 0 ? _ref : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === void 0 ? void 0 : _stream$_writableStat4.errored));
    }
    module.exports = {
      isDestroyed,
      kIsDestroyed,
      isDisturbed,
      kIsDisturbed,
      isErrored,
      kIsErrored,
      isReadable,
      kIsReadable,
      kIsClosedPromise,
      kControllerErrorFunction,
      kIsWritable,
      isClosed,
      isDuplexNodeStream,
      isFinished,
      isIterable,
      isReadableNodeStream,
      isReadableStream,
      isReadableEnded,
      isReadableFinished,
      isReadableErrored,
      isNodeStream,
      isWebStream,
      isWritable,
      isWritableNodeStream,
      isWritableStream,
      isWritableEnded,
      isWritableFinished,
      isWritableErrored,
      isServerRequest,
      isServerResponse,
      willEmitClose,
      isTransformStream
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/end-of-stream.js"(exports, module) {
    "use strict";
    var process2 = require_browser2();
    var { AbortError, codes } = require_errors();
    var { ERR_INVALID_ARG_TYPE, ERR_STREAM_PREMATURE_CLOSE } = codes;
    var { kEmptyObject, once } = require_util();
    var { validateAbortSignal, validateFunction, validateObject, validateBoolean } = require_validators();
    var { Promise: Promise2, PromisePrototypeThen, SymbolDispose } = require_primordials();
    var {
      isClosed,
      isReadable,
      isReadableNodeStream,
      isReadableStream,
      isReadableFinished,
      isReadableErrored,
      isWritable,
      isWritableNodeStream,
      isWritableStream,
      isWritableFinished,
      isWritableErrored,
      isNodeStream,
      willEmitClose: _willEmitClose,
      kIsClosedPromise
    } = require_utils();
    var addAbortListener;
    function isRequest(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    }
    var nop = () => {
    };
    function eos(stream, options, callback) {
      var _options$readable, _options$writable;
      if (arguments.length === 2) {
        callback = options;
        options = kEmptyObject;
      } else if (options == null) {
        options = kEmptyObject;
      } else {
        validateObject(options, "options");
      }
      validateFunction(callback, "callback");
      validateAbortSignal(options.signal, "options.signal");
      callback = once(callback);
      if (isReadableStream(stream) || isWritableStream(stream)) {
        return eosWeb(stream, options, callback);
      }
      if (!isNodeStream(stream)) {
        throw new ERR_INVALID_ARG_TYPE("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
      }
      const readable = (_options$readable = options.readable) !== null && _options$readable !== void 0 ? _options$readable : isReadableNodeStream(stream);
      const writable = (_options$writable = options.writable) !== null && _options$writable !== void 0 ? _options$writable : isWritableNodeStream(stream);
      const wState = stream._writableState;
      const rState = stream._readableState;
      const onlegacyfinish = () => {
        if (!stream.writable) {
          onfinish();
        }
      };
      let willEmitClose = _willEmitClose(stream) && isReadableNodeStream(stream) === readable && isWritableNodeStream(stream) === writable;
      let writableFinished = isWritableFinished(stream, false);
      const onfinish = () => {
        writableFinished = true;
        if (stream.destroyed) {
          willEmitClose = false;
        }
        if (willEmitClose && (!stream.readable || readable)) {
          return;
        }
        if (!readable || readableFinished) {
          callback.call(stream);
        }
      };
      let readableFinished = isReadableFinished(stream, false);
      const onend = () => {
        readableFinished = true;
        if (stream.destroyed) {
          willEmitClose = false;
        }
        if (willEmitClose && (!stream.writable || writable)) {
          return;
        }
        if (!writable || writableFinished) {
          callback.call(stream);
        }
      };
      const onerror = (err) => {
        callback.call(stream, err);
      };
      let closed = isClosed(stream);
      const onclose = () => {
        closed = true;
        const errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== "boolean") {
          return callback.call(stream, errored);
        }
        if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
          if (!isReadableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
        }
        if (writable && !writableFinished) {
          if (!isWritableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
        }
        callback.call(stream);
      };
      const onclosed = () => {
        closed = true;
        const errored = isWritableErrored(stream) || isReadableErrored(stream);
        if (errored && typeof errored !== "boolean") {
          return callback.call(stream, errored);
        }
        callback.call(stream);
      };
      const onrequest = () => {
        stream.req.on("finish", onfinish);
      };
      if (isRequest(stream)) {
        stream.on("complete", onfinish);
        if (!willEmitClose) {
          stream.on("abort", onclose);
        }
        if (stream.req) {
          onrequest();
        } else {
          stream.on("request", onrequest);
        }
      } else if (writable && !wState) {
        stream.on("end", onlegacyfinish);
        stream.on("close", onlegacyfinish);
      }
      if (!willEmitClose && typeof stream.aborted === "boolean") {
        stream.on("aborted", onclose);
      }
      stream.on("end", onend);
      stream.on("finish", onfinish);
      if (options.error !== false) {
        stream.on("error", onerror);
      }
      stream.on("close", onclose);
      if (closed) {
        process2.nextTick(onclose);
      } else if (wState !== null && wState !== void 0 && wState.errorEmitted || rState !== null && rState !== void 0 && rState.errorEmitted) {
        if (!willEmitClose) {
          process2.nextTick(onclosed);
        }
      } else if (!readable && (!willEmitClose || isReadable(stream)) && (writableFinished || isWritable(stream) === false)) {
        process2.nextTick(onclosed);
      } else if (!writable && (!willEmitClose || isWritable(stream)) && (readableFinished || isReadable(stream) === false)) {
        process2.nextTick(onclosed);
      } else if (rState && stream.req && stream.aborted) {
        process2.nextTick(onclosed);
      }
      const cleanup = () => {
        callback = nop;
        stream.removeListener("aborted", onclose);
        stream.removeListener("complete", onfinish);
        stream.removeListener("abort", onclose);
        stream.removeListener("request", onrequest);
        if (stream.req) stream.req.removeListener("finish", onfinish);
        stream.removeListener("end", onlegacyfinish);
        stream.removeListener("close", onlegacyfinish);
        stream.removeListener("finish", onfinish);
        stream.removeListener("end", onend);
        stream.removeListener("error", onerror);
        stream.removeListener("close", onclose);
      };
      if (options.signal && !closed) {
        const abort = () => {
          const endCallback = callback;
          cleanup();
          endCallback.call(
            stream,
            new AbortError(void 0, {
              cause: options.signal.reason
            })
          );
        };
        if (options.signal.aborted) {
          process2.nextTick(abort);
        } else {
          addAbortListener = addAbortListener || require_util().addAbortListener;
          const disposable = addAbortListener(options.signal, abort);
          const originalCallback = callback;
          callback = once((...args) => {
            disposable[SymbolDispose]();
            originalCallback.apply(stream, args);
          });
        }
      }
      return cleanup;
    }
    function eosWeb(stream, options, callback) {
      let isAborted = false;
      let abort = nop;
      if (options.signal) {
        abort = () => {
          isAborted = true;
          callback.call(
            stream,
            new AbortError(void 0, {
              cause: options.signal.reason
            })
          );
        };
        if (options.signal.aborted) {
          process2.nextTick(abort);
        } else {
          addAbortListener = addAbortListener || require_util().addAbortListener;
          const disposable = addAbortListener(options.signal, abort);
          const originalCallback = callback;
          callback = once((...args) => {
            disposable[SymbolDispose]();
            originalCallback.apply(stream, args);
          });
        }
      }
      const resolverFn = (...args) => {
        if (!isAborted) {
          process2.nextTick(() => callback.apply(stream, args));
        }
      };
      PromisePrototypeThen(stream[kIsClosedPromise].promise, resolverFn, resolverFn);
      return nop;
    }
    function finished(stream, opts) {
      var _opts;
      let autoCleanup = false;
      if (opts === null) {
        opts = kEmptyObject;
      }
      if ((_opts = opts) !== null && _opts !== void 0 && _opts.cleanup) {
        validateBoolean(opts.cleanup, "cleanup");
        autoCleanup = opts.cleanup;
      }
      return new Promise2((resolve, reject) => {
        const cleanup = eos(stream, opts, (err) => {
          if (autoCleanup) {
            cleanup();
          }
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    module.exports = eos;
    module.exports.finished = finished;
  }
});

// node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/destroy.js"(exports, module) {
    "use strict";
    var process2 = require_browser2();
    var {
      aggregateTwoErrors,
      codes: { ERR_MULTIPLE_CALLBACK },
      AbortError
    } = require_errors();
    var { Symbol: Symbol2 } = require_primordials();
    var { kIsDestroyed, isDestroyed, isFinished, isServerRequest } = require_utils();
    var kDestroy = Symbol2("kDestroy");
    var kConstruct = Symbol2("kConstruct");
    function checkError(err, w2, r5) {
      if (err) {
        err.stack;
        if (w2 && !w2.errored) {
          w2.errored = err;
        }
        if (r5 && !r5.errored) {
          r5.errored = err;
        }
      }
    }
    function destroy(err, cb) {
      const r5 = this._readableState;
      const w2 = this._writableState;
      const s4 = w2 || r5;
      if (w2 !== null && w2 !== void 0 && w2.destroyed || r5 !== null && r5 !== void 0 && r5.destroyed) {
        if (typeof cb === "function") {
          cb();
        }
        return this;
      }
      checkError(err, w2, r5);
      if (w2) {
        w2.destroyed = true;
      }
      if (r5) {
        r5.destroyed = true;
      }
      if (!s4.constructed) {
        this.once(kDestroy, function(er) {
          _destroy(this, aggregateTwoErrors(er, err), cb);
        });
      } else {
        _destroy(this, err, cb);
      }
      return this;
    }
    function _destroy(self2, err, cb) {
      let called = false;
      function onDestroy(err2) {
        if (called) {
          return;
        }
        called = true;
        const r5 = self2._readableState;
        const w2 = self2._writableState;
        checkError(err2, w2, r5);
        if (w2) {
          w2.closed = true;
        }
        if (r5) {
          r5.closed = true;
        }
        if (typeof cb === "function") {
          cb(err2);
        }
        if (err2) {
          process2.nextTick(emitErrorCloseNT, self2, err2);
        } else {
          process2.nextTick(emitCloseNT, self2);
        }
      }
      try {
        self2._destroy(err || null, onDestroy);
      } catch (err2) {
        onDestroy(err2);
      }
    }
    function emitErrorCloseNT(self2, err) {
      emitErrorNT(self2, err);
      emitCloseNT(self2);
    }
    function emitCloseNT(self2) {
      const r5 = self2._readableState;
      const w2 = self2._writableState;
      if (w2) {
        w2.closeEmitted = true;
      }
      if (r5) {
        r5.closeEmitted = true;
      }
      if (w2 !== null && w2 !== void 0 && w2.emitClose || r5 !== null && r5 !== void 0 && r5.emitClose) {
        self2.emit("close");
      }
    }
    function emitErrorNT(self2, err) {
      const r5 = self2._readableState;
      const w2 = self2._writableState;
      if (w2 !== null && w2 !== void 0 && w2.errorEmitted || r5 !== null && r5 !== void 0 && r5.errorEmitted) {
        return;
      }
      if (w2) {
        w2.errorEmitted = true;
      }
      if (r5) {
        r5.errorEmitted = true;
      }
      self2.emit("error", err);
    }
    function undestroy() {
      const r5 = this._readableState;
      const w2 = this._writableState;
      if (r5) {
        r5.constructed = true;
        r5.closed = false;
        r5.closeEmitted = false;
        r5.destroyed = false;
        r5.errored = null;
        r5.errorEmitted = false;
        r5.reading = false;
        r5.ended = r5.readable === false;
        r5.endEmitted = r5.readable === false;
      }
      if (w2) {
        w2.constructed = true;
        w2.destroyed = false;
        w2.closed = false;
        w2.closeEmitted = false;
        w2.errored = null;
        w2.errorEmitted = false;
        w2.finalCalled = false;
        w2.prefinished = false;
        w2.ended = w2.writable === false;
        w2.ending = w2.writable === false;
        w2.finished = w2.writable === false;
      }
    }
    function errorOrDestroy(stream, err, sync) {
      const r5 = stream._readableState;
      const w2 = stream._writableState;
      if (w2 !== null && w2 !== void 0 && w2.destroyed || r5 !== null && r5 !== void 0 && r5.destroyed) {
        return this;
      }
      if (r5 !== null && r5 !== void 0 && r5.autoDestroy || w2 !== null && w2 !== void 0 && w2.autoDestroy)
        stream.destroy(err);
      else if (err) {
        err.stack;
        if (w2 && !w2.errored) {
          w2.errored = err;
        }
        if (r5 && !r5.errored) {
          r5.errored = err;
        }
        if (sync) {
          process2.nextTick(emitErrorNT, stream, err);
        } else {
          emitErrorNT(stream, err);
        }
      }
    }
    function construct(stream, cb) {
      if (typeof stream._construct !== "function") {
        return;
      }
      const r5 = stream._readableState;
      const w2 = stream._writableState;
      if (r5) {
        r5.constructed = false;
      }
      if (w2) {
        w2.constructed = false;
      }
      stream.once(kConstruct, cb);
      if (stream.listenerCount(kConstruct) > 1) {
        return;
      }
      process2.nextTick(constructNT, stream);
    }
    function constructNT(stream) {
      let called = false;
      function onConstruct(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== void 0 ? err : new ERR_MULTIPLE_CALLBACK());
          return;
        }
        called = true;
        const r5 = stream._readableState;
        const w2 = stream._writableState;
        const s4 = w2 || r5;
        if (r5) {
          r5.constructed = true;
        }
        if (w2) {
          w2.constructed = true;
        }
        if (s4.destroyed) {
          stream.emit(kDestroy, err);
        } else if (err) {
          errorOrDestroy(stream, err, true);
        } else {
          process2.nextTick(emitConstructNT, stream);
        }
      }
      try {
        stream._construct((err) => {
          process2.nextTick(onConstruct, err);
        });
      } catch (err) {
        process2.nextTick(onConstruct, err);
      }
    }
    function emitConstructNT(stream) {
      stream.emit(kConstruct);
    }
    function isRequest(stream) {
      return (stream === null || stream === void 0 ? void 0 : stream.setHeader) && typeof stream.abort === "function";
    }
    function emitCloseLegacy(stream) {
      stream.emit("close");
    }
    function emitErrorCloseLegacy(stream, err) {
      stream.emit("error", err);
      process2.nextTick(emitCloseLegacy, stream);
    }
    function destroyer(stream, err) {
      if (!stream || isDestroyed(stream)) {
        return;
      }
      if (!err && !isFinished(stream)) {
        err = new AbortError();
      }
      if (isServerRequest(stream)) {
        stream.socket = null;
        stream.destroy(err);
      } else if (isRequest(stream)) {
        stream.abort();
      } else if (isRequest(stream.req)) {
        stream.req.abort();
      } else if (typeof stream.destroy === "function") {
        stream.destroy(err);
      } else if (typeof stream.close === "function") {
        stream.close();
      } else if (err) {
        process2.nextTick(emitErrorCloseLegacy, stream, err);
      } else {
        process2.nextTick(emitCloseLegacy, stream);
      }
      if (!stream.destroyed) {
        stream[kIsDestroyed] = true;
      }
    }
    module.exports = {
      construct,
      destroyer,
      destroy,
      undestroy,
      errorOrDestroy
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/legacy.js
var require_legacy = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/legacy.js"(exports, module) {
    "use strict";
    var { ArrayIsArray, ObjectSetPrototypeOf } = require_primordials();
    var { EventEmitter: EE } = require_events();
    function Stream(opts) {
      EE.call(this, opts);
    }
    ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
    ObjectSetPrototypeOf(Stream, EE);
    Stream.prototype.pipe = function(dest, options) {
      const source = this;
      function ondata(chunk) {
        if (dest.writable && dest.write(chunk) === false && source.pause) {
          source.pause();
        }
      }
      source.on("data", ondata);
      function ondrain() {
        if (source.readable && source.resume) {
          source.resume();
        }
      }
      dest.on("drain", ondrain);
      if (!dest._isStdio && (!options || options.end !== false)) {
        source.on("end", onend);
        source.on("close", onclose);
      }
      let didOnEnd = false;
      function onend() {
        if (didOnEnd) return;
        didOnEnd = true;
        dest.end();
      }
      function onclose() {
        if (didOnEnd) return;
        didOnEnd = true;
        if (typeof dest.destroy === "function") dest.destroy();
      }
      function onerror(er) {
        cleanup();
        if (EE.listenerCount(this, "error") === 0) {
          this.emit("error", er);
        }
      }
      prependListener(source, "error", onerror);
      prependListener(dest, "error", onerror);
      function cleanup() {
        source.removeListener("data", ondata);
        dest.removeListener("drain", ondrain);
        source.removeListener("end", onend);
        source.removeListener("close", onclose);
        source.removeListener("error", onerror);
        dest.removeListener("error", onerror);
        source.removeListener("end", cleanup);
        source.removeListener("close", cleanup);
        dest.removeListener("close", cleanup);
      }
      source.on("end", cleanup);
      source.on("close", cleanup);
      dest.on("close", cleanup);
      dest.emit("pipe", source);
      return dest;
    };
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
      else if (ArrayIsArray(emitter._events[event])) emitter._events[event].unshift(fn);
      else emitter._events[event] = [fn, emitter._events[event]];
    }
    module.exports = {
      Stream,
      prependListener
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/add-abort-signal.js
var require_add_abort_signal = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/add-abort-signal.js"(exports, module) {
    "use strict";
    var { SymbolDispose } = require_primordials();
    var { AbortError, codes } = require_errors();
    var { isNodeStream, isWebStream, kControllerErrorFunction } = require_utils();
    var eos = require_end_of_stream();
    var { ERR_INVALID_ARG_TYPE } = codes;
    var addAbortListener;
    var validateAbortSignal = (signal, name) => {
      if (typeof signal !== "object" || !("aborted" in signal)) {
        throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
      }
    };
    module.exports.addAbortSignal = function addAbortSignal(signal, stream) {
      validateAbortSignal(signal, "signal");
      if (!isNodeStream(stream) && !isWebStream(stream)) {
        throw new ERR_INVALID_ARG_TYPE("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
      }
      return module.exports.addAbortSignalNoValidate(signal, stream);
    };
    module.exports.addAbortSignalNoValidate = function(signal, stream) {
      if (typeof signal !== "object" || !("aborted" in signal)) {
        return stream;
      }
      const onAbort = isNodeStream(stream) ? () => {
        stream.destroy(
          new AbortError(void 0, {
            cause: signal.reason
          })
        );
      } : () => {
        stream[kControllerErrorFunction](
          new AbortError(void 0, {
            cause: signal.reason
          })
        );
      };
      if (signal.aborted) {
        onAbort();
      } else {
        addAbortListener = addAbortListener || require_util().addAbortListener;
        const disposable = addAbortListener(signal, onAbort);
        eos(stream, disposable[SymbolDispose]);
      }
      return stream;
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/buffer_list.js"(exports, module) {
    "use strict";
    var { StringPrototypeSlice, SymbolIterator, TypedArrayPrototypeSet, Uint8Array: Uint8Array2 } = require_primordials();
    var { Buffer: Buffer3 } = require_buffer();
    var { inspect } = require_util();
    module.exports = class BufferList {
      constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      push(v2) {
        const entry = {
          data: v2,
          next: null
        };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      }
      unshift(v2) {
        const entry = {
          data: v2,
          next: this.head
        };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      }
      shift() {
        if (this.length === 0) return;
        const ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      }
      clear() {
        this.head = this.tail = null;
        this.length = 0;
      }
      join(s4) {
        if (this.length === 0) return "";
        let p3 = this.head;
        let ret = "" + p3.data;
        while ((p3 = p3.next) !== null) ret += s4 + p3.data;
        return ret;
      }
      concat(n5) {
        if (this.length === 0) return Buffer3.alloc(0);
        const ret = Buffer3.allocUnsafe(n5 >>> 0);
        let p3 = this.head;
        let i5 = 0;
        while (p3) {
          TypedArrayPrototypeSet(ret, p3.data, i5);
          i5 += p3.data.length;
          p3 = p3.next;
        }
        return ret;
      }
      // Consumes a specified amount of bytes or characters from the buffered data.
      consume(n5, hasStrings) {
        const data = this.head.data;
        if (n5 < data.length) {
          const slice = data.slice(0, n5);
          this.head.data = data.slice(n5);
          return slice;
        }
        if (n5 === data.length) {
          return this.shift();
        }
        return hasStrings ? this._getString(n5) : this._getBuffer(n5);
      }
      first() {
        return this.head.data;
      }
      *[SymbolIterator]() {
        for (let p3 = this.head; p3; p3 = p3.next) {
          yield p3.data;
        }
      }
      // Consumes a specified amount of characters from the buffered data.
      _getString(n5) {
        let ret = "";
        let p3 = this.head;
        let c4 = 0;
        do {
          const str = p3.data;
          if (n5 > str.length) {
            ret += str;
            n5 -= str.length;
          } else {
            if (n5 === str.length) {
              ret += str;
              ++c4;
              if (p3.next) this.head = p3.next;
              else this.head = this.tail = null;
            } else {
              ret += StringPrototypeSlice(str, 0, n5);
              this.head = p3;
              p3.data = StringPrototypeSlice(str, n5);
            }
            break;
          }
          ++c4;
        } while ((p3 = p3.next) !== null);
        this.length -= c4;
        return ret;
      }
      // Consumes a specified amount of bytes from the buffered data.
      _getBuffer(n5) {
        const ret = Buffer3.allocUnsafe(n5);
        const retLen = n5;
        let p3 = this.head;
        let c4 = 0;
        do {
          const buf = p3.data;
          if (n5 > buf.length) {
            TypedArrayPrototypeSet(ret, buf, retLen - n5);
            n5 -= buf.length;
          } else {
            if (n5 === buf.length) {
              TypedArrayPrototypeSet(ret, buf, retLen - n5);
              ++c4;
              if (p3.next) this.head = p3.next;
              else this.head = this.tail = null;
            } else {
              TypedArrayPrototypeSet(ret, new Uint8Array2(buf.buffer, buf.byteOffset, n5), retLen - n5);
              this.head = p3;
              p3.data = buf.slice(n5);
            }
            break;
          }
          ++c4;
        } while ((p3 = p3.next) !== null);
        this.length -= c4;
        return ret;
      }
      // Make sure the linked list only shows the minimal necessary information.
      [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")](_2, options) {
        return inspect(this, {
          ...options,
          // Only inspect one level.
          depth: 0,
          // It should not recurse.
          customInspect: false
        });
      }
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/state.js
var require_state = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/state.js"(exports, module) {
    "use strict";
    var { MathFloor, NumberIsInteger } = require_primordials();
    var { validateInteger } = require_validators();
    var { ERR_INVALID_ARG_VALUE } = require_errors().codes;
    var defaultHighWaterMarkBytes = 16 * 1024;
    var defaultHighWaterMarkObjectMode = 16;
    function highWaterMarkFrom(options, isDuplex, duplexKey) {
      return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
    }
    function getDefaultHighWaterMark(objectMode) {
      return objectMode ? defaultHighWaterMarkObjectMode : defaultHighWaterMarkBytes;
    }
    function setDefaultHighWaterMark(objectMode, value) {
      validateInteger(value, "value", 0);
      if (objectMode) {
        defaultHighWaterMarkObjectMode = value;
      } else {
        defaultHighWaterMarkBytes = value;
      }
    }
    function getHighWaterMark(state, options, duplexKey, isDuplex) {
      const hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
      if (hwm != null) {
        if (!NumberIsInteger(hwm) || hwm < 0) {
          const name = isDuplex ? `options.${duplexKey}` : "options.highWaterMark";
          throw new ERR_INVALID_ARG_VALUE(name, hwm);
        }
        return MathFloor(hwm);
      }
      return getDefaultHighWaterMark(state.objectMode);
    }
    module.exports = {
      getHighWaterMark,
      getDefaultHighWaterMark,
      setDefaultHighWaterMark
    };
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports, module) {
    "use strict";
    var buffer = require_buffer();
    var Buffer3 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer3.from && Buffer3.alloc && Buffer3.allocUnsafe && Buffer3.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer3(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer3.prototype);
    copyProps(Buffer3, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer3(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer3(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer3(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "node_modules/string_decoder/lib/string_decoder.js"(exports) {
    "use strict";
    var Buffer3 = require_safe_buffer().Buffer;
    var isEncoding = Buffer3.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc) return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried) return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer3.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer3.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0) return "";
      var r5;
      var i5;
      if (this.lastNeed) {
        r5 = this.fillLast(buf);
        if (r5 === void 0) return "";
        i5 = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i5 = 0;
      }
      if (i5 < buf.length) return r5 ? r5 + this.text(buf, i5) : this.text(buf, i5);
      return r5 || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127) return 0;
      else if (byte >> 5 === 6) return 2;
      else if (byte >> 4 === 14) return 3;
      else if (byte >> 3 === 30) return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self2, buf, i5) {
      var j = buf.length - 1;
      if (j < i5) return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i5 || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i5 || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2) nb = 0;
          else self2.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self2, buf, p3) {
      if ((buf[0] & 192) !== 128) {
        self2.lastNeed = 0;
        return "\uFFFD";
      }
      if (self2.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self2.lastNeed = 1;
          return "\uFFFD";
        }
        if (self2.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self2.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p3 = this.lastTotal - this.lastNeed;
      var r5 = utf8CheckExtraBytes(this, buf, p3);
      if (r5 !== void 0) return r5;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p3, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p3, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i5) {
      var total = utf8CheckIncomplete(this, buf, i5);
      if (!this.lastNeed) return buf.toString("utf8", i5);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i5, end);
    }
    function utf8End(buf) {
      var r5 = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r5 + "\uFFFD";
      return r5;
    }
    function utf16Text(buf, i5) {
      if ((buf.length - i5) % 2 === 0) {
        var r5 = buf.toString("utf16le", i5);
        if (r5) {
          var c4 = r5.charCodeAt(r5.length - 1);
          if (c4 >= 55296 && c4 <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r5.slice(0, -1);
          }
        }
        return r5;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i5, buf.length - 1);
    }
    function utf16End(buf) {
      var r5 = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r5 + this.lastChar.toString("utf16le", 0, end);
      }
      return r5;
    }
    function base64Text(buf, i5) {
      var n5 = (buf.length - i5) % 3;
      if (n5 === 0) return buf.toString("base64", i5);
      this.lastNeed = 3 - n5;
      this.lastTotal = 3;
      if (n5 === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i5, buf.length - n5);
    }
    function base64End(buf) {
      var r5 = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r5 + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r5;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/from.js"(exports, module) {
    "use strict";
    var process2 = require_browser2();
    var { PromisePrototypeThen, SymbolAsyncIterator, SymbolIterator } = require_primordials();
    var { Buffer: Buffer3 } = require_buffer();
    var { ERR_INVALID_ARG_TYPE, ERR_STREAM_NULL_VALUES } = require_errors().codes;
    function from(Readable2, iterable, opts) {
      let iterator;
      if (typeof iterable === "string" || iterable instanceof Buffer3) {
        return new Readable2({
          objectMode: true,
          ...opts,
          read() {
            this.push(iterable);
            this.push(null);
          }
        });
      }
      let isAsync;
      if (iterable && iterable[SymbolAsyncIterator]) {
        isAsync = true;
        iterator = iterable[SymbolAsyncIterator]();
      } else if (iterable && iterable[SymbolIterator]) {
        isAsync = false;
        iterator = iterable[SymbolIterator]();
      } else {
        throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
      }
      const readable = new Readable2({
        objectMode: true,
        highWaterMark: 1,
        // TODO(ronag): What options should be allowed?
        ...opts
      });
      let reading = false;
      readable._read = function() {
        if (!reading) {
          reading = true;
          next();
        }
      };
      readable._destroy = function(error, cb) {
        PromisePrototypeThen(
          close(error),
          () => process2.nextTick(cb, error),
          // nextTick is here in case cb throws
          (e5) => process2.nextTick(cb, e5 || error)
        );
      };
      async function close(error) {
        const hadError = error !== void 0 && error !== null;
        const hasThrow = typeof iterator.throw === "function";
        if (hadError && hasThrow) {
          const { value, done } = await iterator.throw(error);
          await value;
          if (done) {
            return;
          }
        }
        if (typeof iterator.return === "function") {
          const { value } = await iterator.return();
          await value;
        }
      }
      async function next() {
        for (; ; ) {
          try {
            const { value, done } = isAsync ? await iterator.next() : iterator.next();
            if (done) {
              readable.push(null);
            } else {
              const res = value && typeof value.then === "function" ? await value : value;
              if (res === null) {
                reading = false;
                throw new ERR_STREAM_NULL_VALUES();
              } else if (readable.push(res)) {
                continue;
              } else {
                reading = false;
              }
            }
          } catch (err) {
            readable.destroy(err);
          }
          break;
        }
      }
      return readable;
    }
    module.exports = from;
  }
});

// node_modules/readable-stream/lib/internal/streams/readable.js
var require_readable = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/readable.js"(exports, module) {
    "use strict";
    var process2 = require_browser2();
    var {
      ArrayPrototypeIndexOf,
      NumberIsInteger,
      NumberIsNaN,
      NumberParseInt,
      ObjectDefineProperties,
      ObjectKeys,
      ObjectSetPrototypeOf,
      Promise: Promise2,
      SafeSet,
      SymbolAsyncDispose,
      SymbolAsyncIterator,
      Symbol: Symbol2
    } = require_primordials();
    module.exports = Readable2;
    Readable2.ReadableState = ReadableState;
    var { EventEmitter: EE } = require_events();
    var { Stream, prependListener } = require_legacy();
    var { Buffer: Buffer3 } = require_buffer();
    var { addAbortSignal } = require_add_abort_signal();
    var eos = require_end_of_stream();
    var debug = require_util().debuglog("stream", (fn) => {
      debug = fn;
    });
    var BufferList = require_buffer_list();
    var destroyImpl = require_destroy();
    var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
    var {
      aggregateTwoErrors,
      codes: {
        ERR_INVALID_ARG_TYPE,
        ERR_METHOD_NOT_IMPLEMENTED,
        ERR_OUT_OF_RANGE,
        ERR_STREAM_PUSH_AFTER_EOF,
        ERR_STREAM_UNSHIFT_AFTER_END_EVENT
      },
      AbortError
    } = require_errors();
    var { validateObject } = require_validators();
    var kPaused = Symbol2("kPaused");
    var { StringDecoder } = require_string_decoder();
    var from = require_from();
    ObjectSetPrototypeOf(Readable2.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Readable2, Stream);
    var nop = () => {
    };
    var { errorOrDestroy } = destroyImpl;
    var kObjectMode = 1 << 0;
    var kEnded = 1 << 1;
    var kEndEmitted = 1 << 2;
    var kReading = 1 << 3;
    var kConstructed = 1 << 4;
    var kSync = 1 << 5;
    var kNeedReadable = 1 << 6;
    var kEmittedReadable = 1 << 7;
    var kReadableListening = 1 << 8;
    var kResumeScheduled = 1 << 9;
    var kErrorEmitted = 1 << 10;
    var kEmitClose = 1 << 11;
    var kAutoDestroy = 1 << 12;
    var kDestroyed = 1 << 13;
    var kClosed = 1 << 14;
    var kCloseEmitted = 1 << 15;
    var kMultiAwaitDrain = 1 << 16;
    var kReadingMore = 1 << 17;
    var kDataEmitted = 1 << 18;
    function makeBitMapDescriptor(bit) {
      return {
        enumerable: false,
        get() {
          return (this.state & bit) !== 0;
        },
        set(value) {
          if (value) this.state |= bit;
          else this.state &= ~bit;
        }
      };
    }
    ObjectDefineProperties(ReadableState.prototype, {
      objectMode: makeBitMapDescriptor(kObjectMode),
      ended: makeBitMapDescriptor(kEnded),
      endEmitted: makeBitMapDescriptor(kEndEmitted),
      reading: makeBitMapDescriptor(kReading),
      // Stream is still being constructed and cannot be
      // destroyed until construction finished or failed.
      // Async construction is opt in, therefore we start as
      // constructed.
      constructed: makeBitMapDescriptor(kConstructed),
      // A flag to be able to tell if the event 'readable'/'data' is emitted
      // immediately, or on a later tick.  We set this to true at first, because
      // any actions that shouldn't happen until "later" should generally also
      // not happen before the first read call.
      sync: makeBitMapDescriptor(kSync),
      // Whenever we return null, then we set a flag to say
      // that we're awaiting a 'readable' event emission.
      needReadable: makeBitMapDescriptor(kNeedReadable),
      emittedReadable: makeBitMapDescriptor(kEmittedReadable),
      readableListening: makeBitMapDescriptor(kReadableListening),
      resumeScheduled: makeBitMapDescriptor(kResumeScheduled),
      // True if the error was already emitted and should not be thrown again.
      errorEmitted: makeBitMapDescriptor(kErrorEmitted),
      emitClose: makeBitMapDescriptor(kEmitClose),
      autoDestroy: makeBitMapDescriptor(kAutoDestroy),
      // Has it been destroyed.
      destroyed: makeBitMapDescriptor(kDestroyed),
      // Indicates whether the stream has finished destroying.
      closed: makeBitMapDescriptor(kClosed),
      // True if close has been emitted or would have been emitted
      // depending on emitClose.
      closeEmitted: makeBitMapDescriptor(kCloseEmitted),
      multiAwaitDrain: makeBitMapDescriptor(kMultiAwaitDrain),
      // If true, a maybeReadMore has been scheduled.
      readingMore: makeBitMapDescriptor(kReadingMore),
      dataEmitted: makeBitMapDescriptor(kDataEmitted)
    });
    function ReadableState(options, stream, isDuplex) {
      if (typeof isDuplex !== "boolean") isDuplex = stream instanceof require_duplex();
      this.state = kEmitClose | kAutoDestroy | kConstructed | kSync;
      if (options && options.objectMode) this.state |= kObjectMode;
      if (isDuplex && options && options.readableObjectMode) this.state |= kObjectMode;
      this.highWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = [];
      this.flowing = null;
      this[kPaused] = null;
      if (options && options.emitClose === false) this.state &= ~kEmitClose;
      if (options && options.autoDestroy === false) this.state &= ~kAutoDestroy;
      this.errored = null;
      this.defaultEncoding = options && options.defaultEncoding || "utf8";
      this.awaitDrainWriters = null;
      this.decoder = null;
      this.encoding = null;
      if (options && options.encoding) {
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable2(options) {
      if (!(this instanceof Readable2)) return new Readable2(options);
      const isDuplex = this instanceof require_duplex();
      this._readableState = new ReadableState(options, this, isDuplex);
      if (options) {
        if (typeof options.read === "function") this._read = options.read;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
        if (typeof options.construct === "function") this._construct = options.construct;
        if (options.signal && !isDuplex) addAbortSignal(options.signal, this);
      }
      Stream.call(this, options);
      destroyImpl.construct(this, () => {
        if (this._readableState.needReadable) {
          maybeReadMore(this, this._readableState);
        }
      });
    }
    Readable2.prototype.destroy = destroyImpl.destroy;
    Readable2.prototype._undestroy = destroyImpl.undestroy;
    Readable2.prototype._destroy = function(err, cb) {
      cb(err);
    };
    Readable2.prototype[EE.captureRejectionSymbol] = function(err) {
      this.destroy(err);
    };
    Readable2.prototype[SymbolAsyncDispose] = function() {
      let error;
      if (!this.destroyed) {
        error = this.readableEnded ? null : new AbortError();
        this.destroy(error);
      }
      return new Promise2((resolve, reject) => eos(this, (err) => err && err !== error ? reject(err) : resolve(null)));
    };
    Readable2.prototype.push = function(chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, false);
    };
    Readable2.prototype.unshift = function(chunk, encoding) {
      return readableAddChunk(this, chunk, encoding, true);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront) {
      debug("readableAddChunk", chunk);
      const state = stream._readableState;
      let err;
      if ((state.state & kObjectMode) === 0) {
        if (typeof chunk === "string") {
          encoding = encoding || state.defaultEncoding;
          if (state.encoding !== encoding) {
            if (addToFront && state.encoding) {
              chunk = Buffer3.from(chunk, encoding).toString(state.encoding);
            } else {
              chunk = Buffer3.from(chunk, encoding);
              encoding = "";
            }
          }
        } else if (chunk instanceof Buffer3) {
          encoding = "";
        } else if (Stream._isUint8Array(chunk)) {
          chunk = Stream._uint8ArrayToBuffer(chunk);
          encoding = "";
        } else if (chunk != null) {
          err = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
        }
      }
      if (err) {
        errorOrDestroy(stream, err);
      } else if (chunk === null) {
        state.state &= ~kReading;
        onEofChunk(stream, state);
      } else if ((state.state & kObjectMode) !== 0 || chunk && chunk.length > 0) {
        if (addToFront) {
          if ((state.state & kEndEmitted) !== 0) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
          else if (state.destroyed || state.errored) return false;
          else addChunk(stream, state, chunk, true);
        } else if (state.ended) {
          errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
        } else if (state.destroyed || state.errored) {
          return false;
        } else {
          state.state &= ~kReading;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
            else maybeReadMore(stream, state);
          } else {
            addChunk(stream, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.state &= ~kReading;
        maybeReadMore(stream, state);
      }
      return !state.ended && (state.length < state.highWaterMark || state.length === 0);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount("data") > 0) {
        if ((state.state & kMultiAwaitDrain) !== 0) {
          state.awaitDrainWriters.clear();
        } else {
          state.awaitDrainWriters = null;
        }
        state.dataEmitted = true;
        stream.emit("data", chunk);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront) state.buffer.unshift(chunk);
        else state.buffer.push(chunk);
        if ((state.state & kNeedReadable) !== 0) emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    Readable2.prototype.isPaused = function() {
      const state = this._readableState;
      return state[kPaused] === true || state.flowing === false;
    };
    Readable2.prototype.setEncoding = function(enc) {
      const decoder = new StringDecoder(enc);
      this._readableState.decoder = decoder;
      this._readableState.encoding = this._readableState.decoder.encoding;
      const buffer = this._readableState.buffer;
      let content = "";
      for (const data of buffer) {
        content += decoder.write(data);
      }
      buffer.clear();
      if (content !== "") buffer.push(content);
      this._readableState.length = content.length;
      return this;
    };
    var MAX_HWM = 1073741824;
    function computeNewHighWaterMark(n5) {
      if (n5 > MAX_HWM) {
        throw new ERR_OUT_OF_RANGE("size", "<= 1GiB", n5);
      } else {
        n5--;
        n5 |= n5 >>> 1;
        n5 |= n5 >>> 2;
        n5 |= n5 >>> 4;
        n5 |= n5 >>> 8;
        n5 |= n5 >>> 16;
        n5++;
      }
      return n5;
    }
    function howMuchToRead(n5, state) {
      if (n5 <= 0 || state.length === 0 && state.ended) return 0;
      if ((state.state & kObjectMode) !== 0) return 1;
      if (NumberIsNaN(n5)) {
        if (state.flowing && state.length) return state.buffer.first().length;
        return state.length;
      }
      if (n5 <= state.length) return n5;
      return state.ended ? state.length : 0;
    }
    Readable2.prototype.read = function(n5) {
      debug("read", n5);
      if (n5 === void 0) {
        n5 = NaN;
      } else if (!NumberIsInteger(n5)) {
        n5 = NumberParseInt(n5, 10);
      }
      const state = this._readableState;
      const nOrig = n5;
      if (n5 > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n5);
      if (n5 !== 0) state.state &= ~kEmittedReadable;
      if (n5 === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
        debug("read: emitReadable", state.length, state.ended);
        if (state.length === 0 && state.ended) endReadable(this);
        else emitReadable(this);
        return null;
      }
      n5 = howMuchToRead(n5, state);
      if (n5 === 0 && state.ended) {
        if (state.length === 0) endReadable(this);
        return null;
      }
      let doRead = (state.state & kNeedReadable) !== 0;
      debug("need readable", doRead);
      if (state.length === 0 || state.length - n5 < state.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
      }
      if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed) {
        doRead = false;
        debug("reading, ended or constructing", doRead);
      } else if (doRead) {
        debug("do read");
        state.state |= kReading | kSync;
        if (state.length === 0) state.state |= kNeedReadable;
        try {
          this._read(state.highWaterMark);
        } catch (err) {
          errorOrDestroy(this, err);
        }
        state.state &= ~kSync;
        if (!state.reading) n5 = howMuchToRead(nOrig, state);
      }
      let ret;
      if (n5 > 0) ret = fromList(n5, state);
      else ret = null;
      if (ret === null) {
        state.needReadable = state.length <= state.highWaterMark;
        n5 = 0;
      } else {
        state.length -= n5;
        if (state.multiAwaitDrain) {
          state.awaitDrainWriters.clear();
        } else {
          state.awaitDrainWriters = null;
        }
      }
      if (state.length === 0) {
        if (!state.ended) state.needReadable = true;
        if (nOrig !== n5 && state.ended) endReadable(this);
      }
      if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
        state.dataEmitted = true;
        this.emit("data", ret);
      }
      return ret;
    };
    function onEofChunk(stream, state) {
      debug("onEofChunk");
      if (state.ended) return;
      if (state.decoder) {
        const chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      if (state.sync) {
        emitReadable(stream);
      } else {
        state.needReadable = false;
        state.emittedReadable = true;
        emitReadable_(stream);
      }
    }
    function emitReadable(stream) {
      const state = stream._readableState;
      debug("emitReadable", state.needReadable, state.emittedReadable);
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug("emitReadable", state.flowing);
        state.emittedReadable = true;
        process2.nextTick(emitReadable_, stream);
      }
    }
    function emitReadable_(stream) {
      const state = stream._readableState;
      debug("emitReadable_", state.destroyed, state.length, state.ended);
      if (!state.destroyed && !state.errored && (state.length || state.ended)) {
        stream.emit("readable");
        state.emittedReadable = false;
      }
      state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore && state.constructed) {
        state.readingMore = true;
        process2.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
        const len = state.length;
        debug("maybeReadMore read 0");
        stream.read(0);
        if (len === state.length)
          break;
      }
      state.readingMore = false;
    }
    Readable2.prototype._read = function(n5) {
      throw new ERR_METHOD_NOT_IMPLEMENTED("_read()");
    };
    Readable2.prototype.pipe = function(dest, pipeOpts) {
      const src = this;
      const state = this._readableState;
      if (state.pipes.length === 1) {
        if (!state.multiAwaitDrain) {
          state.multiAwaitDrain = true;
          state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
        }
      }
      state.pipes.push(dest);
      debug("pipe count=%d opts=%j", state.pipes.length, pipeOpts);
      const doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process2.stdout && dest !== process2.stderr;
      const endFn = doEnd ? onend : unpipe;
      if (state.endEmitted) process2.nextTick(endFn);
      else src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug("onend");
        dest.end();
      }
      let ondrain;
      let cleanedUp = false;
      function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        if (ondrain) {
          dest.removeListener("drain", ondrain);
        }
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain)) ondrain();
      }
      function pause() {
        if (!cleanedUp) {
          if (state.pipes.length === 1 && state.pipes[0] === dest) {
            debug("false write response, pause", 0);
            state.awaitDrainWriters = dest;
            state.multiAwaitDrain = false;
          } else if (state.pipes.length > 1 && state.pipes.includes(dest)) {
            debug("false write response, pause", state.awaitDrainWriters.size);
            state.awaitDrainWriters.add(dest);
          }
          src.pause();
        }
        if (!ondrain) {
          ondrain = pipeOnDrain(src, dest);
          dest.on("drain", ondrain);
        }
      }
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        const ret = dest.write(chunk);
        debug("dest.write", ret);
        if (ret === false) {
          pause();
        }
      }
      function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (dest.listenerCount("error") === 0) {
          const s4 = dest._writableState || dest._readableState;
          if (s4 && !s4.errorEmitted) {
            errorOrDestroy(dest, er);
          } else {
            dest.emit("error", er);
          }
        }
      }
      prependListener(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
      }
      dest.emit("pipe", src);
      if (dest.writableNeedDrain === true) {
        pause();
      } else if (!state.flowing) {
        debug("pipe resume");
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src, dest) {
      return function pipeOnDrainFunctionResult() {
        const state = src._readableState;
        if (state.awaitDrainWriters === dest) {
          debug("pipeOnDrain", 1);
          state.awaitDrainWriters = null;
        } else if (state.multiAwaitDrain) {
          debug("pipeOnDrain", state.awaitDrainWriters.size);
          state.awaitDrainWriters.delete(dest);
        }
        if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount("data")) {
          src.resume();
        }
      };
    }
    Readable2.prototype.unpipe = function(dest) {
      const state = this._readableState;
      const unpipeInfo = {
        hasUnpiped: false
      };
      if (state.pipes.length === 0) return this;
      if (!dest) {
        const dests = state.pipes;
        state.pipes = [];
        this.pause();
        for (let i5 = 0; i5 < dests.length; i5++)
          dests[i5].emit("unpipe", this, {
            hasUnpiped: false
          });
        return this;
      }
      const index = ArrayPrototypeIndexOf(state.pipes, dest);
      if (index === -1) return this;
      state.pipes.splice(index, 1);
      if (state.pipes.length === 0) this.pause();
      dest.emit("unpipe", this, unpipeInfo);
      return this;
    };
    Readable2.prototype.on = function(ev, fn) {
      const res = Stream.prototype.on.call(this, ev, fn);
      const state = this._readableState;
      if (ev === "data") {
        state.readableListening = this.listenerCount("readable") > 0;
        if (state.flowing !== false) this.resume();
      } else if (ev === "readable") {
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.flowing = false;
          state.emittedReadable = false;
          debug("on readable", state.length, state.reading);
          if (state.length) {
            emitReadable(this);
          } else if (!state.reading) {
            process2.nextTick(nReadingNextTick, this);
          }
        }
      }
      return res;
    };
    Readable2.prototype.addListener = Readable2.prototype.on;
    Readable2.prototype.removeListener = function(ev, fn) {
      const res = Stream.prototype.removeListener.call(this, ev, fn);
      if (ev === "readable") {
        process2.nextTick(updateReadableListening, this);
      }
      return res;
    };
    Readable2.prototype.off = Readable2.prototype.removeListener;
    Readable2.prototype.removeAllListeners = function(ev) {
      const res = Stream.prototype.removeAllListeners.apply(this, arguments);
      if (ev === "readable" || ev === void 0) {
        process2.nextTick(updateReadableListening, this);
      }
      return res;
    };
    function updateReadableListening(self2) {
      const state = self2._readableState;
      state.readableListening = self2.listenerCount("readable") > 0;
      if (state.resumeScheduled && state[kPaused] === false) {
        state.flowing = true;
      } else if (self2.listenerCount("data") > 0) {
        self2.resume();
      } else if (!state.readableListening) {
        state.flowing = null;
      }
    }
    function nReadingNextTick(self2) {
      debug("readable nexttick read 0");
      self2.read(0);
    }
    Readable2.prototype.resume = function() {
      const state = this._readableState;
      if (!state.flowing) {
        debug("resume");
        state.flowing = !state.readableListening;
        resume(this, state);
      }
      state[kPaused] = false;
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        process2.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      debug("resume", state.reading);
      if (!state.reading) {
        stream.read(0);
      }
      state.resumeScheduled = false;
      stream.emit("resume");
      flow(stream);
      if (state.flowing && !state.reading) stream.read(0);
    }
    Readable2.prototype.pause = function() {
      debug("call pause flowing=%j", this._readableState.flowing);
      if (this._readableState.flowing !== false) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
      }
      this._readableState[kPaused] = true;
      return this;
    };
    function flow(stream) {
      const state = stream._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream.read() !== null) ;
    }
    Readable2.prototype.wrap = function(stream) {
      let paused = false;
      stream.on("data", (chunk) => {
        if (!this.push(chunk) && stream.pause) {
          paused = true;
          stream.pause();
        }
      });
      stream.on("end", () => {
        this.push(null);
      });
      stream.on("error", (err) => {
        errorOrDestroy(this, err);
      });
      stream.on("close", () => {
        this.destroy();
      });
      stream.on("destroy", () => {
        this.destroy();
      });
      this._read = () => {
        if (paused && stream.resume) {
          paused = false;
          stream.resume();
        }
      };
      const streamKeys = ObjectKeys(stream);
      for (let j = 1; j < streamKeys.length; j++) {
        const i5 = streamKeys[j];
        if (this[i5] === void 0 && typeof stream[i5] === "function") {
          this[i5] = stream[i5].bind(stream);
        }
      }
      return this;
    };
    Readable2.prototype[SymbolAsyncIterator] = function() {
      return streamToAsyncIterator(this);
    };
    Readable2.prototype.iterator = function(options) {
      if (options !== void 0) {
        validateObject(options, "options");
      }
      return streamToAsyncIterator(this, options);
    };
    function streamToAsyncIterator(stream, options) {
      if (typeof stream.read !== "function") {
        stream = Readable2.wrap(stream, {
          objectMode: true
        });
      }
      const iter = createAsyncIterator(stream, options);
      iter.stream = stream;
      return iter;
    }
    async function* createAsyncIterator(stream, options) {
      let callback = nop;
      function next(resolve) {
        if (this === stream) {
          callback();
          callback = nop;
        } else {
          callback = resolve;
        }
      }
      stream.on("readable", next);
      let error;
      const cleanup = eos(
        stream,
        {
          writable: false
        },
        (err) => {
          error = err ? aggregateTwoErrors(error, err) : null;
          callback();
          callback = nop;
        }
      );
      try {
        while (true) {
          const chunk = stream.destroyed ? null : stream.read();
          if (chunk !== null) {
            yield chunk;
          } else if (error) {
            throw error;
          } else if (error === null) {
            return;
          } else {
            await new Promise2(next);
          }
        }
      } catch (err) {
        error = aggregateTwoErrors(error, err);
        throw error;
      } finally {
        if ((error || (options === null || options === void 0 ? void 0 : options.destroyOnReturn) !== false) && (error === void 0 || stream._readableState.autoDestroy)) {
          destroyImpl.destroyer(stream, null);
        } else {
          stream.off("readable", next);
          cleanup();
        }
      }
    }
    ObjectDefineProperties(Readable2.prototype, {
      readable: {
        __proto__: null,
        get() {
          const r5 = this._readableState;
          return !!r5 && r5.readable !== false && !r5.destroyed && !r5.errorEmitted && !r5.endEmitted;
        },
        set(val) {
          if (this._readableState) {
            this._readableState.readable = !!val;
          }
        }
      },
      readableDidRead: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return this._readableState.dataEmitted;
        }
      },
      readableAborted: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return !!(this._readableState.readable !== false && (this._readableState.destroyed || this._readableState.errored) && !this._readableState.endEmitted);
        }
      },
      readableHighWaterMark: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return this._readableState.highWaterMark;
        }
      },
      readableBuffer: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return this._readableState && this._readableState.buffer;
        }
      },
      readableFlowing: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return this._readableState.flowing;
        },
        set: function(state) {
          if (this._readableState) {
            this._readableState.flowing = state;
          }
        }
      },
      readableLength: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState.length;
        }
      },
      readableObjectMode: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.objectMode : false;
        }
      },
      readableEncoding: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.encoding : null;
        }
      },
      errored: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.errored : null;
        }
      },
      closed: {
        __proto__: null,
        get() {
          return this._readableState ? this._readableState.closed : false;
        }
      },
      destroyed: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.destroyed : false;
        },
        set(value) {
          if (!this._readableState) {
            return;
          }
          this._readableState.destroyed = value;
        }
      },
      readableEnded: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._readableState ? this._readableState.endEmitted : false;
        }
      }
    });
    ObjectDefineProperties(ReadableState.prototype, {
      // Legacy getter for `pipesCount`.
      pipesCount: {
        __proto__: null,
        get() {
          return this.pipes.length;
        }
      },
      // Legacy property for `paused`.
      paused: {
        __proto__: null,
        get() {
          return this[kPaused] !== false;
        },
        set(value) {
          this[kPaused] = !!value;
        }
      }
    });
    Readable2._fromList = fromList;
    function fromList(n5, state) {
      if (state.length === 0) return null;
      let ret;
      if (state.objectMode) ret = state.buffer.shift();
      else if (!n5 || n5 >= state.length) {
        if (state.decoder) ret = state.buffer.join("");
        else if (state.buffer.length === 1) ret = state.buffer.first();
        else ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = state.buffer.consume(n5, state.decoder);
      }
      return ret;
    }
    function endReadable(stream) {
      const state = stream._readableState;
      debug("endReadable", state.endEmitted);
      if (!state.endEmitted) {
        state.ended = true;
        process2.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      debug("endReadableNT", state.endEmitted, state.length);
      if (!state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.emit("end");
        if (stream.writable && stream.allowHalfOpen === false) {
          process2.nextTick(endWritableNT, stream);
        } else if (state.autoDestroy) {
          const wState = stream._writableState;
          const autoDestroy = !wState || wState.autoDestroy && // We don't expect the writable to ever 'finish'
          // if writable is explicitly set to false.
          (wState.finished || wState.writable === false);
          if (autoDestroy) {
            stream.destroy();
          }
        }
      }
    }
    function endWritableNT(stream) {
      const writable = stream.writable && !stream.writableEnded && !stream.destroyed;
      if (writable) {
        stream.end();
      }
    }
    Readable2.from = function(iterable, opts) {
      return from(Readable2, iterable, opts);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Readable2.fromWeb = function(readableStream, options) {
      return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options);
    };
    Readable2.toWeb = function(streamReadable, options) {
      return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options);
    };
    Readable2.wrap = function(src, options) {
      var _ref, _src$readableObjectMo;
      return new Readable2({
        objectMode: (_ref = (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== void 0 ? _src$readableObjectMo : src.objectMode) !== null && _ref !== void 0 ? _ref : true,
        ...options,
        destroy(err, callback) {
          destroyImpl.destroyer(src, err);
          callback(err);
        }
      }).wrap(src);
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/writable.js
var require_writable = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/writable.js"(exports, module) {
    "use strict";
    var process2 = require_browser2();
    var {
      ArrayPrototypeSlice,
      Error: Error2,
      FunctionPrototypeSymbolHasInstance,
      ObjectDefineProperty,
      ObjectDefineProperties,
      ObjectSetPrototypeOf,
      StringPrototypeToLowerCase,
      Symbol: Symbol2,
      SymbolHasInstance
    } = require_primordials();
    module.exports = Writable;
    Writable.WritableState = WritableState;
    var { EventEmitter: EE } = require_events();
    var Stream = require_legacy().Stream;
    var { Buffer: Buffer3 } = require_buffer();
    var destroyImpl = require_destroy();
    var { addAbortSignal } = require_add_abort_signal();
    var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
    var {
      ERR_INVALID_ARG_TYPE,
      ERR_METHOD_NOT_IMPLEMENTED,
      ERR_MULTIPLE_CALLBACK,
      ERR_STREAM_CANNOT_PIPE,
      ERR_STREAM_DESTROYED,
      ERR_STREAM_ALREADY_FINISHED,
      ERR_STREAM_NULL_VALUES,
      ERR_STREAM_WRITE_AFTER_END,
      ERR_UNKNOWN_ENCODING
    } = require_errors().codes;
    var { errorOrDestroy } = destroyImpl;
    ObjectSetPrototypeOf(Writable.prototype, Stream.prototype);
    ObjectSetPrototypeOf(Writable, Stream);
    function nop() {
    }
    var kOnFinished = Symbol2("kOnFinished");
    function WritableState(options, stream, isDuplex) {
      if (typeof isDuplex !== "boolean") isDuplex = stream instanceof require_duplex();
      this.objectMode = !!(options && options.objectMode);
      if (isDuplex) this.objectMode = this.objectMode || !!(options && options.writableObjectMode);
      this.highWaterMark = options ? getHighWaterMark(this, options, "writableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      const noDecode = !!(options && options.decodeStrings === false);
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options && options.defaultEncoding || "utf8";
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = onwrite.bind(void 0, stream);
      this.writecb = null;
      this.writelen = 0;
      this.afterWriteTickInfo = null;
      resetBuffer(this);
      this.pendingcb = 0;
      this.constructed = true;
      this.prefinished = false;
      this.errorEmitted = false;
      this.emitClose = !options || options.emitClose !== false;
      this.autoDestroy = !options || options.autoDestroy !== false;
      this.errored = null;
      this.closed = false;
      this.closeEmitted = false;
      this[kOnFinished] = [];
    }
    function resetBuffer(state) {
      state.buffered = [];
      state.bufferedIndex = 0;
      state.allBuffers = true;
      state.allNoop = true;
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      return ArrayPrototypeSlice(this.buffered, this.bufferedIndex);
    };
    ObjectDefineProperty(WritableState.prototype, "bufferedRequestCount", {
      __proto__: null,
      get() {
        return this.buffered.length - this.bufferedIndex;
      }
    });
    function Writable(options) {
      const isDuplex = this instanceof require_duplex();
      if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable, this)) return new Writable(options);
      this._writableState = new WritableState(options, this, isDuplex);
      if (options) {
        if (typeof options.write === "function") this._write = options.write;
        if (typeof options.writev === "function") this._writev = options.writev;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
        if (typeof options.final === "function") this._final = options.final;
        if (typeof options.construct === "function") this._construct = options.construct;
        if (options.signal) addAbortSignal(options.signal, this);
      }
      Stream.call(this, options);
      destroyImpl.construct(this, () => {
        const state = this._writableState;
        if (!state.writing) {
          clearBuffer(this, state);
        }
        finishMaybe(this, state);
      });
    }
    ObjectDefineProperty(Writable, SymbolHasInstance, {
      __proto__: null,
      value: function(object2) {
        if (FunctionPrototypeSymbolHasInstance(this, object2)) return true;
        if (this !== Writable) return false;
        return object2 && object2._writableState instanceof WritableState;
      }
    });
    Writable.prototype.pipe = function() {
      errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
    };
    function _write(stream, chunk, encoding, cb) {
      const state = stream._writableState;
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = state.defaultEncoding;
      } else {
        if (!encoding) encoding = state.defaultEncoding;
        else if (encoding !== "buffer" && !Buffer3.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
        if (typeof cb !== "function") cb = nop;
      }
      if (chunk === null) {
        throw new ERR_STREAM_NULL_VALUES();
      } else if (!state.objectMode) {
        if (typeof chunk === "string") {
          if (state.decodeStrings !== false) {
            chunk = Buffer3.from(chunk, encoding);
            encoding = "buffer";
          }
        } else if (chunk instanceof Buffer3) {
          encoding = "buffer";
        } else if (Stream._isUint8Array(chunk)) {
          chunk = Stream._uint8ArrayToBuffer(chunk);
          encoding = "buffer";
        } else {
          throw new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
        }
      }
      let err;
      if (state.ending) {
        err = new ERR_STREAM_WRITE_AFTER_END();
      } else if (state.destroyed) {
        err = new ERR_STREAM_DESTROYED("write");
      }
      if (err) {
        process2.nextTick(cb, err);
        errorOrDestroy(stream, err, true);
        return err;
      }
      state.pendingcb++;
      return writeOrBuffer(stream, state, chunk, encoding, cb);
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      return _write(this, chunk, encoding, cb) === true;
    };
    Writable.prototype.cork = function() {
      this._writableState.corked++;
    };
    Writable.prototype.uncork = function() {
      const state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing) clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string") encoding = StringPrototypeToLowerCase(encoding);
      if (!Buffer3.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    function writeOrBuffer(stream, state, chunk, encoding, callback) {
      const len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      const ret = state.length < state.highWaterMark;
      if (!ret) state.needDrain = true;
      if (state.writing || state.corked || state.errored || !state.constructed) {
        state.buffered.push({
          chunk,
          encoding,
          callback
        });
        if (state.allBuffers && encoding !== "buffer") {
          state.allBuffers = false;
        }
        if (state.allNoop && callback !== nop) {
          state.allNoop = false;
        }
      } else {
        state.writelen = len;
        state.writecb = callback;
        state.writing = true;
        state.sync = true;
        stream._write(chunk, encoding, state.onwrite);
        state.sync = false;
      }
      return ret && !state.errored && !state.destroyed;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED("write"));
      else if (writev) stream._writev(chunk, state.onwrite);
      else stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, er, cb) {
      --state.pendingcb;
      cb(er);
      errorBuffer(state);
      errorOrDestroy(stream, er);
    }
    function onwrite(stream, er) {
      const state = stream._writableState;
      const sync = state.sync;
      const cb = state.writecb;
      if (typeof cb !== "function") {
        errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK());
        return;
      }
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
      if (er) {
        er.stack;
        if (!state.errored) {
          state.errored = er;
        }
        if (stream._readableState && !stream._readableState.errored) {
          stream._readableState.errored = er;
        }
        if (sync) {
          process2.nextTick(onwriteError, stream, state, er, cb);
        } else {
          onwriteError(stream, state, er, cb);
        }
      } else {
        if (state.buffered.length > state.bufferedIndex) {
          clearBuffer(stream, state);
        }
        if (sync) {
          if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb) {
            state.afterWriteTickInfo.count++;
          } else {
            state.afterWriteTickInfo = {
              count: 1,
              cb,
              stream,
              state
            };
            process2.nextTick(afterWriteTick, state.afterWriteTickInfo);
          }
        } else {
          afterWrite(stream, state, 1, cb);
        }
      }
    }
    function afterWriteTick({ stream, state, count, cb }) {
      state.afterWriteTickInfo = null;
      return afterWrite(stream, state, count, cb);
    }
    function afterWrite(stream, state, count, cb) {
      const needDrain = !state.ending && !stream.destroyed && state.length === 0 && state.needDrain;
      if (needDrain) {
        state.needDrain = false;
        stream.emit("drain");
      }
      while (count-- > 0) {
        state.pendingcb--;
        cb();
      }
      if (state.destroyed) {
        errorBuffer(state);
      }
      finishMaybe(stream, state);
    }
    function errorBuffer(state) {
      if (state.writing) {
        return;
      }
      for (let n5 = state.bufferedIndex; n5 < state.buffered.length; ++n5) {
        var _state$errored;
        const { chunk, callback } = state.buffered[n5];
        const len = state.objectMode ? 1 : chunk.length;
        state.length -= len;
        callback(
          (_state$errored = state.errored) !== null && _state$errored !== void 0 ? _state$errored : new ERR_STREAM_DESTROYED("write")
        );
      }
      const onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i5 = 0; i5 < onfinishCallbacks.length; i5++) {
        var _state$errored2;
        onfinishCallbacks[i5](
          (_state$errored2 = state.errored) !== null && _state$errored2 !== void 0 ? _state$errored2 : new ERR_STREAM_DESTROYED("end")
        );
      }
      resetBuffer(state);
    }
    function clearBuffer(stream, state) {
      if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed) {
        return;
      }
      const { buffered, bufferedIndex, objectMode } = state;
      const bufferedLength = buffered.length - bufferedIndex;
      if (!bufferedLength) {
        return;
      }
      let i5 = bufferedIndex;
      state.bufferProcessing = true;
      if (bufferedLength > 1 && stream._writev) {
        state.pendingcb -= bufferedLength - 1;
        const callback = state.allNoop ? nop : (err) => {
          for (let n5 = i5; n5 < buffered.length; ++n5) {
            buffered[n5].callback(err);
          }
        };
        const chunks = state.allNoop && i5 === 0 ? buffered : ArrayPrototypeSlice(buffered, i5);
        chunks.allBuffers = state.allBuffers;
        doWrite(stream, state, true, state.length, chunks, "", callback);
        resetBuffer(state);
      } else {
        do {
          const { chunk, encoding, callback } = buffered[i5];
          buffered[i5++] = null;
          const len = objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, callback);
        } while (i5 < buffered.length && !state.writing);
        if (i5 === buffered.length) {
          resetBuffer(state);
        } else if (i5 > 256) {
          buffered.splice(0, i5);
          state.bufferedIndex = 0;
        } else {
          state.bufferedIndex = i5;
        }
      }
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      if (this._writev) {
        this._writev(
          [
            {
              chunk,
              encoding
            }
          ],
          cb
        );
      } else {
        throw new ERR_METHOD_NOT_IMPLEMENTED("_write()");
      }
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      const state = this._writableState;
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      let err;
      if (chunk !== null && chunk !== void 0) {
        const ret = _write(this, chunk, encoding);
        if (ret instanceof Error2) {
          err = ret;
        }
      }
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (err) {
      } else if (!state.errored && !state.ending) {
        state.ending = true;
        finishMaybe(this, state, true);
        state.ended = true;
      } else if (state.finished) {
        err = new ERR_STREAM_ALREADY_FINISHED("end");
      } else if (state.destroyed) {
        err = new ERR_STREAM_DESTROYED("end");
      }
      if (typeof cb === "function") {
        if (err || state.finished) {
          process2.nextTick(cb, err);
        } else {
          state[kOnFinished].push(cb);
        }
      }
      return this;
    };
    function needFinish(state) {
      return state.ending && !state.destroyed && state.constructed && state.length === 0 && !state.errored && state.buffered.length === 0 && !state.finished && !state.writing && !state.errorEmitted && !state.closeEmitted;
    }
    function callFinal(stream, state) {
      let called = false;
      function onFinish(err) {
        if (called) {
          errorOrDestroy(stream, err !== null && err !== void 0 ? err : ERR_MULTIPLE_CALLBACK());
          return;
        }
        called = true;
        state.pendingcb--;
        if (err) {
          const onfinishCallbacks = state[kOnFinished].splice(0);
          for (let i5 = 0; i5 < onfinishCallbacks.length; i5++) {
            onfinishCallbacks[i5](err);
          }
          errorOrDestroy(stream, err, state.sync);
        } else if (needFinish(state)) {
          state.prefinished = true;
          stream.emit("prefinish");
          state.pendingcb++;
          process2.nextTick(finish, stream, state);
        }
      }
      state.sync = true;
      state.pendingcb++;
      try {
        stream._final(onFinish);
      } catch (err) {
        onFinish(err);
      }
      state.sync = false;
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === "function" && !state.destroyed) {
          state.finalCalled = true;
          callFinal(stream, state);
        } else {
          state.prefinished = true;
          stream.emit("prefinish");
        }
      }
    }
    function finishMaybe(stream, state, sync) {
      if (needFinish(state)) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          if (sync) {
            state.pendingcb++;
            process2.nextTick(
              (stream2, state2) => {
                if (needFinish(state2)) {
                  finish(stream2, state2);
                } else {
                  state2.pendingcb--;
                }
              },
              stream,
              state
            );
          } else if (needFinish(state)) {
            state.pendingcb++;
            finish(stream, state);
          }
        }
      }
    }
    function finish(stream, state) {
      state.pendingcb--;
      state.finished = true;
      const onfinishCallbacks = state[kOnFinished].splice(0);
      for (let i5 = 0; i5 < onfinishCallbacks.length; i5++) {
        onfinishCallbacks[i5]();
      }
      stream.emit("finish");
      if (state.autoDestroy) {
        const rState = stream._readableState;
        const autoDestroy = !rState || rState.autoDestroy && // We don't expect the readable to ever 'end'
        // if readable is explicitly set to false.
        (rState.endEmitted || rState.readable === false);
        if (autoDestroy) {
          stream.destroy();
        }
      }
    }
    ObjectDefineProperties(Writable.prototype, {
      closed: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.closed : false;
        }
      },
      destroyed: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.destroyed : false;
        },
        set(value) {
          if (this._writableState) {
            this._writableState.destroyed = value;
          }
        }
      },
      writable: {
        __proto__: null,
        get() {
          const w2 = this._writableState;
          return !!w2 && w2.writable !== false && !w2.destroyed && !w2.errored && !w2.ending && !w2.ended;
        },
        set(val) {
          if (this._writableState) {
            this._writableState.writable = !!val;
          }
        }
      },
      writableFinished: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.finished : false;
        }
      },
      writableObjectMode: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.objectMode : false;
        }
      },
      writableBuffer: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.getBuffer();
        }
      },
      writableEnded: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.ending : false;
        }
      },
      writableNeedDrain: {
        __proto__: null,
        get() {
          const wState = this._writableState;
          if (!wState) return false;
          return !wState.destroyed && !wState.ending && wState.needDrain;
        }
      },
      writableHighWaterMark: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.highWaterMark;
        }
      },
      writableCorked: {
        __proto__: null,
        get() {
          return this._writableState ? this._writableState.corked : 0;
        }
      },
      writableLength: {
        __proto__: null,
        get() {
          return this._writableState && this._writableState.length;
        }
      },
      errored: {
        __proto__: null,
        enumerable: false,
        get() {
          return this._writableState ? this._writableState.errored : null;
        }
      },
      writableAborted: {
        __proto__: null,
        enumerable: false,
        get: function() {
          return !!(this._writableState.writable !== false && (this._writableState.destroyed || this._writableState.errored) && !this._writableState.finished);
        }
      }
    });
    var destroy = destroyImpl.destroy;
    Writable.prototype.destroy = function(err, cb) {
      const state = this._writableState;
      if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length)) {
        process2.nextTick(errorBuffer, state);
      }
      destroy.call(this, err, cb);
      return this;
    };
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      cb(err);
    };
    Writable.prototype[EE.captureRejectionSymbol] = function(err) {
      this.destroy(err);
    };
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Writable.fromWeb = function(writableStream, options) {
      return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options);
    };
    Writable.toWeb = function(streamWritable) {
      return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable);
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/duplexify.js
var require_duplexify = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/duplexify.js"(exports, module) {
    "use strict";
    var process2 = require_browser2();
    var bufferModule = require_buffer();
    var {
      isReadable,
      isWritable,
      isIterable,
      isNodeStream,
      isReadableNodeStream,
      isWritableNodeStream,
      isDuplexNodeStream,
      isReadableStream,
      isWritableStream
    } = require_utils();
    var eos = require_end_of_stream();
    var {
      AbortError,
      codes: { ERR_INVALID_ARG_TYPE, ERR_INVALID_RETURN_VALUE }
    } = require_errors();
    var { destroyer } = require_destroy();
    var Duplex = require_duplex();
    var Readable2 = require_readable();
    var Writable = require_writable();
    var { createDeferredPromise } = require_util();
    var from = require_from();
    var Blob = globalThis.Blob || bufferModule.Blob;
    var isBlob = typeof Blob !== "undefined" ? function isBlob2(b3) {
      return b3 instanceof Blob;
    } : function isBlob2(b3) {
      return false;
    };
    var AbortController = globalThis.AbortController || require_browser().AbortController;
    var { FunctionPrototypeCall } = require_primordials();
    var Duplexify = class extends Duplex {
      constructor(options) {
        super(options);
        if ((options === null || options === void 0 ? void 0 : options.readable) === false) {
          this._readableState.readable = false;
          this._readableState.ended = true;
          this._readableState.endEmitted = true;
        }
        if ((options === null || options === void 0 ? void 0 : options.writable) === false) {
          this._writableState.writable = false;
          this._writableState.ending = true;
          this._writableState.ended = true;
          this._writableState.finished = true;
        }
      }
    };
    module.exports = function duplexify(body, name) {
      if (isDuplexNodeStream(body)) {
        return body;
      }
      if (isReadableNodeStream(body)) {
        return _duplexify({
          readable: body
        });
      }
      if (isWritableNodeStream(body)) {
        return _duplexify({
          writable: body
        });
      }
      if (isNodeStream(body)) {
        return _duplexify({
          writable: false,
          readable: false
        });
      }
      if (isReadableStream(body)) {
        return _duplexify({
          readable: Readable2.fromWeb(body)
        });
      }
      if (isWritableStream(body)) {
        return _duplexify({
          writable: Writable.fromWeb(body)
        });
      }
      if (typeof body === "function") {
        const { value, write, final, destroy } = fromAsyncGen(body);
        if (isIterable(value)) {
          return from(Duplexify, value, {
            // TODO (ronag): highWaterMark?
            objectMode: true,
            write,
            final,
            destroy
          });
        }
        const then2 = value === null || value === void 0 ? void 0 : value.then;
        if (typeof then2 === "function") {
          let d3;
          const promise = FunctionPrototypeCall(
            then2,
            value,
            (val) => {
              if (val != null) {
                throw new ERR_INVALID_RETURN_VALUE("nully", "body", val);
              }
            },
            (err) => {
              destroyer(d3, err);
            }
          );
          return d3 = new Duplexify({
            // TODO (ronag): highWaterMark?
            objectMode: true,
            readable: false,
            write,
            final(cb) {
              final(async () => {
                try {
                  await promise;
                  process2.nextTick(cb, null);
                } catch (err) {
                  process2.nextTick(cb, err);
                }
              });
            },
            destroy
          });
        }
        throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or AsyncFunction", name, value);
      }
      if (isBlob(body)) {
        return duplexify(body.arrayBuffer());
      }
      if (isIterable(body)) {
        return from(Duplexify, body, {
          // TODO (ronag): highWaterMark?
          objectMode: true,
          writable: false
        });
      }
      if (isReadableStream(body === null || body === void 0 ? void 0 : body.readable) && isWritableStream(body === null || body === void 0 ? void 0 : body.writable)) {
        return Duplexify.fromWeb(body);
      }
      if (typeof (body === null || body === void 0 ? void 0 : body.writable) === "object" || typeof (body === null || body === void 0 ? void 0 : body.readable) === "object") {
        const readable = body !== null && body !== void 0 && body.readable ? isReadableNodeStream(body === null || body === void 0 ? void 0 : body.readable) ? body === null || body === void 0 ? void 0 : body.readable : duplexify(body.readable) : void 0;
        const writable = body !== null && body !== void 0 && body.writable ? isWritableNodeStream(body === null || body === void 0 ? void 0 : body.writable) ? body === null || body === void 0 ? void 0 : body.writable : duplexify(body.writable) : void 0;
        return _duplexify({
          readable,
          writable
        });
      }
      const then = body === null || body === void 0 ? void 0 : body.then;
      if (typeof then === "function") {
        let d3;
        FunctionPrototypeCall(
          then,
          body,
          (val) => {
            if (val != null) {
              d3.push(val);
            }
            d3.push(null);
          },
          (err) => {
            destroyer(d3, err);
          }
        );
        return d3 = new Duplexify({
          objectMode: true,
          writable: false,
          read() {
          }
        });
      }
      throw new ERR_INVALID_ARG_TYPE(
        name,
        [
          "Blob",
          "ReadableStream",
          "WritableStream",
          "Stream",
          "Iterable",
          "AsyncIterable",
          "Function",
          "{ readable, writable } pair",
          "Promise"
        ],
        body
      );
    };
    function fromAsyncGen(fn) {
      let { promise, resolve } = createDeferredPromise();
      const ac = new AbortController();
      const signal = ac.signal;
      const value = fn(
        (async function* () {
          while (true) {
            const _promise = promise;
            promise = null;
            const { chunk, done, cb } = await _promise;
            process2.nextTick(cb);
            if (done) return;
            if (signal.aborted)
              throw new AbortError(void 0, {
                cause: signal.reason
              });
            ({ promise, resolve } = createDeferredPromise());
            yield chunk;
          }
        })(),
        {
          signal
        }
      );
      return {
        value,
        write(chunk, encoding, cb) {
          const _resolve = resolve;
          resolve = null;
          _resolve({
            chunk,
            done: false,
            cb
          });
        },
        final(cb) {
          const _resolve = resolve;
          resolve = null;
          _resolve({
            done: true,
            cb
          });
        },
        destroy(err, cb) {
          ac.abort();
          cb(err);
        }
      };
    }
    function _duplexify(pair) {
      const r5 = pair.readable && typeof pair.readable.read !== "function" ? Readable2.wrap(pair.readable) : pair.readable;
      const w2 = pair.writable;
      let readable = !!isReadable(r5);
      let writable = !!isWritable(w2);
      let ondrain;
      let onfinish;
      let onreadable;
      let onclose;
      let d3;
      function onfinished(err) {
        const cb = onclose;
        onclose = null;
        if (cb) {
          cb(err);
        } else if (err) {
          d3.destroy(err);
        }
      }
      d3 = new Duplexify({
        // TODO (ronag): highWaterMark?
        readableObjectMode: !!(r5 !== null && r5 !== void 0 && r5.readableObjectMode),
        writableObjectMode: !!(w2 !== null && w2 !== void 0 && w2.writableObjectMode),
        readable,
        writable
      });
      if (writable) {
        eos(w2, (err) => {
          writable = false;
          if (err) {
            destroyer(r5, err);
          }
          onfinished(err);
        });
        d3._write = function(chunk, encoding, callback) {
          if (w2.write(chunk, encoding)) {
            callback();
          } else {
            ondrain = callback;
          }
        };
        d3._final = function(callback) {
          w2.end();
          onfinish = callback;
        };
        w2.on("drain", function() {
          if (ondrain) {
            const cb = ondrain;
            ondrain = null;
            cb();
          }
        });
        w2.on("finish", function() {
          if (onfinish) {
            const cb = onfinish;
            onfinish = null;
            cb();
          }
        });
      }
      if (readable) {
        eos(r5, (err) => {
          readable = false;
          if (err) {
            destroyer(r5, err);
          }
          onfinished(err);
        });
        r5.on("readable", function() {
          if (onreadable) {
            const cb = onreadable;
            onreadable = null;
            cb();
          }
        });
        r5.on("end", function() {
          d3.push(null);
        });
        d3._read = function() {
          while (true) {
            const buf = r5.read();
            if (buf === null) {
              onreadable = d3._read;
              return;
            }
            if (!d3.push(buf)) {
              return;
            }
          }
        };
      }
      d3._destroy = function(err, callback) {
        if (!err && onclose !== null) {
          err = new AbortError();
        }
        onreadable = null;
        ondrain = null;
        onfinish = null;
        if (onclose === null) {
          callback(err);
        } else {
          onclose = callback;
          destroyer(w2, err);
          destroyer(r5, err);
        }
      };
      return d3;
    }
  }
});

// node_modules/readable-stream/lib/internal/streams/duplex.js
var require_duplex = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/duplex.js"(exports, module) {
    "use strict";
    var {
      ObjectDefineProperties,
      ObjectGetOwnPropertyDescriptor,
      ObjectKeys,
      ObjectSetPrototypeOf
    } = require_primordials();
    module.exports = Duplex;
    var Readable2 = require_readable();
    var Writable = require_writable();
    ObjectSetPrototypeOf(Duplex.prototype, Readable2.prototype);
    ObjectSetPrototypeOf(Duplex, Readable2);
    {
      const keys = ObjectKeys(Writable.prototype);
      for (let i5 = 0; i5 < keys.length; i5++) {
        const method = keys[i5];
        if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options);
      Readable2.call(this, options);
      Writable.call(this, options);
      if (options) {
        this.allowHalfOpen = options.allowHalfOpen !== false;
        if (options.readable === false) {
          this._readableState.readable = false;
          this._readableState.ended = true;
          this._readableState.endEmitted = true;
        }
        if (options.writable === false) {
          this._writableState.writable = false;
          this._writableState.ending = true;
          this._writableState.ended = true;
          this._writableState.finished = true;
        }
      } else {
        this.allowHalfOpen = true;
      }
    }
    ObjectDefineProperties(Duplex.prototype, {
      writable: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writable")
      },
      writableHighWaterMark: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableHighWaterMark")
      },
      writableObjectMode: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableObjectMode")
      },
      writableBuffer: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableBuffer")
      },
      writableLength: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableLength")
      },
      writableFinished: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableFinished")
      },
      writableCorked: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableCorked")
      },
      writableEnded: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableEnded")
      },
      writableNeedDrain: {
        __proto__: null,
        ...ObjectGetOwnPropertyDescriptor(Writable.prototype, "writableNeedDrain")
      },
      destroyed: {
        __proto__: null,
        get() {
          if (this._readableState === void 0 || this._writableState === void 0) {
            return false;
          }
          return this._readableState.destroyed && this._writableState.destroyed;
        },
        set(value) {
          if (this._readableState && this._writableState) {
            this._readableState.destroyed = value;
            this._writableState.destroyed = value;
          }
        }
      }
    });
    var webStreamsAdapters;
    function lazyWebStreams() {
      if (webStreamsAdapters === void 0) webStreamsAdapters = {};
      return webStreamsAdapters;
    }
    Duplex.fromWeb = function(pair, options) {
      return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options);
    };
    Duplex.toWeb = function(duplex) {
      return lazyWebStreams().newReadableWritablePairFromDuplex(duplex);
    };
    var duplexify;
    Duplex.from = function(body) {
      if (!duplexify) {
        duplexify = require_duplexify();
      }
      return duplexify(body, "body");
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/transform.js
var require_transform = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/transform.js"(exports, module) {
    "use strict";
    var { ObjectSetPrototypeOf, Symbol: Symbol2 } = require_primordials();
    module.exports = Transform3;
    var { ERR_METHOD_NOT_IMPLEMENTED } = require_errors().codes;
    var Duplex = require_duplex();
    var { getHighWaterMark } = require_state();
    ObjectSetPrototypeOf(Transform3.prototype, Duplex.prototype);
    ObjectSetPrototypeOf(Transform3, Duplex);
    var kCallback = Symbol2("kCallback");
    function Transform3(options) {
      if (!(this instanceof Transform3)) return new Transform3(options);
      const readableHighWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", true) : null;
      if (readableHighWaterMark === 0) {
        options = {
          ...options,
          highWaterMark: null,
          readableHighWaterMark,
          // TODO (ronag): 0 is not optimal since we have
          // a "bug" where we check needDrain before calling _write and not after.
          // Refs: https://github.com/nodejs/node/pull/32887
          // Refs: https://github.com/nodejs/node/pull/35941
          writableHighWaterMark: options.writableHighWaterMark || 0
        };
      }
      Duplex.call(this, options);
      this._readableState.sync = false;
      this[kCallback] = null;
      if (options) {
        if (typeof options.transform === "function") this._transform = options.transform;
        if (typeof options.flush === "function") this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function final(cb) {
      if (typeof this._flush === "function" && !this.destroyed) {
        this._flush((er, data) => {
          if (er) {
            if (cb) {
              cb(er);
            } else {
              this.destroy(er);
            }
            return;
          }
          if (data != null) {
            this.push(data);
          }
          this.push(null);
          if (cb) {
            cb();
          }
        });
      } else {
        this.push(null);
        if (cb) {
          cb();
        }
      }
    }
    function prefinish() {
      if (this._final !== final) {
        final.call(this);
      }
    }
    Transform3.prototype._final = final;
    Transform3.prototype._transform = function(chunk, encoding, callback) {
      throw new ERR_METHOD_NOT_IMPLEMENTED("_transform()");
    };
    Transform3.prototype._write = function(chunk, encoding, callback) {
      const rState = this._readableState;
      const wState = this._writableState;
      const length = rState.length;
      this._transform(chunk, encoding, (err, val) => {
        if (err) {
          callback(err);
          return;
        }
        if (val != null) {
          this.push(val);
        }
        if (wState.ended || // Backwards compat.
        length === rState.length || // Backwards compat.
        rState.length < rState.highWaterMark) {
          callback();
        } else {
          this[kCallback] = callback;
        }
      });
    };
    Transform3.prototype._read = function() {
      if (this[kCallback]) {
        const callback = this[kCallback];
        this[kCallback] = null;
        callback();
      }
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/passthrough.js
var require_passthrough = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/passthrough.js"(exports, module) {
    "use strict";
    var { ObjectSetPrototypeOf } = require_primordials();
    module.exports = PassThrough;
    var Transform3 = require_transform();
    ObjectSetPrototypeOf(PassThrough.prototype, Transform3.prototype);
    ObjectSetPrototypeOf(PassThrough, Transform3);
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);
      Transform3.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/pipeline.js"(exports, module) {
    "use strict";
    var process2 = require_browser2();
    var { ArrayIsArray, Promise: Promise2, SymbolAsyncIterator, SymbolDispose } = require_primordials();
    var eos = require_end_of_stream();
    var { once } = require_util();
    var destroyImpl = require_destroy();
    var Duplex = require_duplex();
    var {
      aggregateTwoErrors,
      codes: {
        ERR_INVALID_ARG_TYPE,
        ERR_INVALID_RETURN_VALUE,
        ERR_MISSING_ARGS,
        ERR_STREAM_DESTROYED,
        ERR_STREAM_PREMATURE_CLOSE
      },
      AbortError
    } = require_errors();
    var { validateFunction, validateAbortSignal } = require_validators();
    var {
      isIterable,
      isReadable,
      isReadableNodeStream,
      isNodeStream,
      isTransformStream,
      isWebStream,
      isReadableStream,
      isReadableFinished
    } = require_utils();
    var AbortController = globalThis.AbortController || require_browser().AbortController;
    var PassThrough;
    var Readable2;
    var addAbortListener;
    function destroyer(stream, reading, writing) {
      let finished = false;
      stream.on("close", () => {
        finished = true;
      });
      const cleanup = eos(
        stream,
        {
          readable: reading,
          writable: writing
        },
        (err) => {
          finished = !err;
        }
      );
      return {
        destroy: (err) => {
          if (finished) return;
          finished = true;
          destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED("pipe"));
        },
        cleanup
      };
    }
    function popCallback(streams) {
      validateFunction(streams[streams.length - 1], "streams[stream.length - 1]");
      return streams.pop();
    }
    function makeAsyncIterable(val) {
      if (isIterable(val)) {
        return val;
      } else if (isReadableNodeStream(val)) {
        return fromReadable(val);
      }
      throw new ERR_INVALID_ARG_TYPE("val", ["Readable", "Iterable", "AsyncIterable"], val);
    }
    async function* fromReadable(val) {
      if (!Readable2) {
        Readable2 = require_readable();
      }
      yield* Readable2.prototype[SymbolAsyncIterator].call(val);
    }
    async function pumpToNode(iterable, writable, finish, { end }) {
      let error;
      let onresolve = null;
      const resume = (err) => {
        if (err) {
          error = err;
        }
        if (onresolve) {
          const callback = onresolve;
          onresolve = null;
          callback();
        }
      };
      const wait = () => new Promise2((resolve, reject) => {
        if (error) {
          reject(error);
        } else {
          onresolve = () => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          };
        }
      });
      writable.on("drain", resume);
      const cleanup = eos(
        writable,
        {
          readable: false
        },
        resume
      );
      try {
        if (writable.writableNeedDrain) {
          await wait();
        }
        for await (const chunk of iterable) {
          if (!writable.write(chunk)) {
            await wait();
          }
        }
        if (end) {
          writable.end();
          await wait();
        }
        finish();
      } catch (err) {
        finish(error !== err ? aggregateTwoErrors(error, err) : err);
      } finally {
        cleanup();
        writable.off("drain", resume);
      }
    }
    async function pumpToWeb(readable, writable, finish, { end }) {
      if (isTransformStream(writable)) {
        writable = writable.writable;
      }
      const writer = writable.getWriter();
      try {
        for await (const chunk of readable) {
          await writer.ready;
          writer.write(chunk).catch(() => {
          });
        }
        await writer.ready;
        if (end) {
          await writer.close();
        }
        finish();
      } catch (err) {
        try {
          await writer.abort(err);
          finish(err);
        } catch (err2) {
          finish(err2);
        }
      }
    }
    function pipeline(...streams) {
      return pipelineImpl(streams, once(popCallback(streams)));
    }
    function pipelineImpl(streams, callback, opts) {
      if (streams.length === 1 && ArrayIsArray(streams[0])) {
        streams = streams[0];
      }
      if (streams.length < 2) {
        throw new ERR_MISSING_ARGS("streams");
      }
      const ac = new AbortController();
      const signal = ac.signal;
      const outerSignal = opts === null || opts === void 0 ? void 0 : opts.signal;
      const lastStreamCleanup = [];
      validateAbortSignal(outerSignal, "options.signal");
      function abort() {
        finishImpl(new AbortError());
      }
      addAbortListener = addAbortListener || require_util().addAbortListener;
      let disposable;
      if (outerSignal) {
        disposable = addAbortListener(outerSignal, abort);
      }
      let error;
      let value;
      const destroys = [];
      let finishCount = 0;
      function finish(err) {
        finishImpl(err, --finishCount === 0);
      }
      function finishImpl(err, final) {
        var _disposable;
        if (err && (!error || error.code === "ERR_STREAM_PREMATURE_CLOSE")) {
          error = err;
        }
        if (!error && !final) {
          return;
        }
        while (destroys.length) {
          destroys.shift()(error);
        }
        ;
        (_disposable = disposable) === null || _disposable === void 0 ? void 0 : _disposable[SymbolDispose]();
        ac.abort();
        if (final) {
          if (!error) {
            lastStreamCleanup.forEach((fn) => fn());
          }
          process2.nextTick(callback, error, value);
        }
      }
      let ret;
      for (let i5 = 0; i5 < streams.length; i5++) {
        const stream = streams[i5];
        const reading = i5 < streams.length - 1;
        const writing = i5 > 0;
        const end = reading || (opts === null || opts === void 0 ? void 0 : opts.end) !== false;
        const isLastStream = i5 === streams.length - 1;
        if (isNodeStream(stream)) {
          let onError2 = function(err) {
            if (err && err.name !== "AbortError" && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
              finish(err);
            }
          };
          var onError = onError2;
          if (end) {
            const { destroy, cleanup } = destroyer(stream, reading, writing);
            destroys.push(destroy);
            if (isReadable(stream) && isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          }
          stream.on("error", onError2);
          if (isReadable(stream) && isLastStream) {
            lastStreamCleanup.push(() => {
              stream.removeListener("error", onError2);
            });
          }
        }
        if (i5 === 0) {
          if (typeof stream === "function") {
            ret = stream({
              signal
            });
            if (!isIterable(ret)) {
              throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or Stream", "source", ret);
            }
          } else if (isIterable(stream) || isReadableNodeStream(stream) || isTransformStream(stream)) {
            ret = stream;
          } else {
            ret = Duplex.from(stream);
          }
        } else if (typeof stream === "function") {
          if (isTransformStream(ret)) {
            var _ret;
            ret = makeAsyncIterable((_ret = ret) === null || _ret === void 0 ? void 0 : _ret.readable);
          } else {
            ret = makeAsyncIterable(ret);
          }
          ret = stream(ret, {
            signal
          });
          if (reading) {
            if (!isIterable(ret, true)) {
              throw new ERR_INVALID_RETURN_VALUE("AsyncIterable", `transform[${i5 - 1}]`, ret);
            }
          } else {
            var _ret2;
            if (!PassThrough) {
              PassThrough = require_passthrough();
            }
            const pt = new PassThrough({
              objectMode: true
            });
            const then = (_ret2 = ret) === null || _ret2 === void 0 ? void 0 : _ret2.then;
            if (typeof then === "function") {
              finishCount++;
              then.call(
                ret,
                (val) => {
                  value = val;
                  if (val != null) {
                    pt.write(val);
                  }
                  if (end) {
                    pt.end();
                  }
                  process2.nextTick(finish);
                },
                (err) => {
                  pt.destroy(err);
                  process2.nextTick(finish, err);
                }
              );
            } else if (isIterable(ret, true)) {
              finishCount++;
              pumpToNode(ret, pt, finish, {
                end
              });
            } else if (isReadableStream(ret) || isTransformStream(ret)) {
              const toRead = ret.readable || ret;
              finishCount++;
              pumpToNode(toRead, pt, finish, {
                end
              });
            } else {
              throw new ERR_INVALID_RETURN_VALUE("AsyncIterable or Promise", "destination", ret);
            }
            ret = pt;
            const { destroy, cleanup } = destroyer(ret, false, true);
            destroys.push(destroy);
            if (isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          }
        } else if (isNodeStream(stream)) {
          if (isReadableNodeStream(ret)) {
            finishCount += 2;
            const cleanup = pipe(ret, stream, finish, {
              end
            });
            if (isReadable(stream) && isLastStream) {
              lastStreamCleanup.push(cleanup);
            }
          } else if (isTransformStream(ret) || isReadableStream(ret)) {
            const toRead = ret.readable || ret;
            finishCount++;
            pumpToNode(toRead, stream, finish, {
              end
            });
          } else if (isIterable(ret)) {
            finishCount++;
            pumpToNode(ret, stream, finish, {
              end
            });
          } else {
            throw new ERR_INVALID_ARG_TYPE(
              "val",
              ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"],
              ret
            );
          }
          ret = stream;
        } else if (isWebStream(stream)) {
          if (isReadableNodeStream(ret)) {
            finishCount++;
            pumpToWeb(makeAsyncIterable(ret), stream, finish, {
              end
            });
          } else if (isReadableStream(ret) || isIterable(ret)) {
            finishCount++;
            pumpToWeb(ret, stream, finish, {
              end
            });
          } else if (isTransformStream(ret)) {
            finishCount++;
            pumpToWeb(ret.readable, stream, finish, {
              end
            });
          } else {
            throw new ERR_INVALID_ARG_TYPE(
              "val",
              ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"],
              ret
            );
          }
          ret = stream;
        } else {
          ret = Duplex.from(stream);
        }
      }
      if (signal !== null && signal !== void 0 && signal.aborted || outerSignal !== null && outerSignal !== void 0 && outerSignal.aborted) {
        process2.nextTick(abort);
      }
      return ret;
    }
    function pipe(src, dst, finish, { end }) {
      let ended = false;
      dst.on("close", () => {
        if (!ended) {
          finish(new ERR_STREAM_PREMATURE_CLOSE());
        }
      });
      src.pipe(dst, {
        end: false
      });
      if (end) {
        let endFn2 = function() {
          ended = true;
          dst.end();
        };
        var endFn = endFn2;
        if (isReadableFinished(src)) {
          process2.nextTick(endFn2);
        } else {
          src.once("end", endFn2);
        }
      } else {
        finish();
      }
      eos(
        src,
        {
          readable: true,
          writable: false
        },
        (err) => {
          const rState = src._readableState;
          if (err && err.code === "ERR_STREAM_PREMATURE_CLOSE" && rState && rState.ended && !rState.errored && !rState.errorEmitted) {
            src.once("end", finish).once("error", finish);
          } else {
            finish(err);
          }
        }
      );
      return eos(
        dst,
        {
          readable: false,
          writable: true
        },
        finish
      );
    }
    module.exports = {
      pipelineImpl,
      pipeline
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/compose.js
var require_compose = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/compose.js"(exports, module) {
    "use strict";
    var { pipeline } = require_pipeline();
    var Duplex = require_duplex();
    var { destroyer } = require_destroy();
    var {
      isNodeStream,
      isReadable,
      isWritable,
      isWebStream,
      isTransformStream,
      isWritableStream,
      isReadableStream
    } = require_utils();
    var {
      AbortError,
      codes: { ERR_INVALID_ARG_VALUE, ERR_MISSING_ARGS }
    } = require_errors();
    var eos = require_end_of_stream();
    module.exports = function compose(...streams) {
      if (streams.length === 0) {
        throw new ERR_MISSING_ARGS("streams");
      }
      if (streams.length === 1) {
        return Duplex.from(streams[0]);
      }
      const orgStreams = [...streams];
      if (typeof streams[0] === "function") {
        streams[0] = Duplex.from(streams[0]);
      }
      if (typeof streams[streams.length - 1] === "function") {
        const idx = streams.length - 1;
        streams[idx] = Duplex.from(streams[idx]);
      }
      for (let n5 = 0; n5 < streams.length; ++n5) {
        if (!isNodeStream(streams[n5]) && !isWebStream(streams[n5])) {
          continue;
        }
        if (n5 < streams.length - 1 && !(isReadable(streams[n5]) || isReadableStream(streams[n5]) || isTransformStream(streams[n5]))) {
          throw new ERR_INVALID_ARG_VALUE(`streams[${n5}]`, orgStreams[n5], "must be readable");
        }
        if (n5 > 0 && !(isWritable(streams[n5]) || isWritableStream(streams[n5]) || isTransformStream(streams[n5]))) {
          throw new ERR_INVALID_ARG_VALUE(`streams[${n5}]`, orgStreams[n5], "must be writable");
        }
      }
      let ondrain;
      let onfinish;
      let onreadable;
      let onclose;
      let d3;
      function onfinished(err) {
        const cb = onclose;
        onclose = null;
        if (cb) {
          cb(err);
        } else if (err) {
          d3.destroy(err);
        } else if (!readable && !writable) {
          d3.destroy();
        }
      }
      const head = streams[0];
      const tail = pipeline(streams, onfinished);
      const writable = !!(isWritable(head) || isWritableStream(head) || isTransformStream(head));
      const readable = !!(isReadable(tail) || isReadableStream(tail) || isTransformStream(tail));
      d3 = new Duplex({
        // TODO (ronag): highWaterMark?
        writableObjectMode: !!(head !== null && head !== void 0 && head.writableObjectMode),
        readableObjectMode: !!(tail !== null && tail !== void 0 && tail.readableObjectMode),
        writable,
        readable
      });
      if (writable) {
        if (isNodeStream(head)) {
          d3._write = function(chunk, encoding, callback) {
            if (head.write(chunk, encoding)) {
              callback();
            } else {
              ondrain = callback;
            }
          };
          d3._final = function(callback) {
            head.end();
            onfinish = callback;
          };
          head.on("drain", function() {
            if (ondrain) {
              const cb = ondrain;
              ondrain = null;
              cb();
            }
          });
        } else if (isWebStream(head)) {
          const writable2 = isTransformStream(head) ? head.writable : head;
          const writer = writable2.getWriter();
          d3._write = async function(chunk, encoding, callback) {
            try {
              await writer.ready;
              writer.write(chunk).catch(() => {
              });
              callback();
            } catch (err) {
              callback(err);
            }
          };
          d3._final = async function(callback) {
            try {
              await writer.ready;
              writer.close().catch(() => {
              });
              onfinish = callback;
            } catch (err) {
              callback(err);
            }
          };
        }
        const toRead = isTransformStream(tail) ? tail.readable : tail;
        eos(toRead, () => {
          if (onfinish) {
            const cb = onfinish;
            onfinish = null;
            cb();
          }
        });
      }
      if (readable) {
        if (isNodeStream(tail)) {
          tail.on("readable", function() {
            if (onreadable) {
              const cb = onreadable;
              onreadable = null;
              cb();
            }
          });
          tail.on("end", function() {
            d3.push(null);
          });
          d3._read = function() {
            while (true) {
              const buf = tail.read();
              if (buf === null) {
                onreadable = d3._read;
                return;
              }
              if (!d3.push(buf)) {
                return;
              }
            }
          };
        } else if (isWebStream(tail)) {
          const readable2 = isTransformStream(tail) ? tail.readable : tail;
          const reader = readable2.getReader();
          d3._read = async function() {
            while (true) {
              try {
                const { value, done } = await reader.read();
                if (!d3.push(value)) {
                  return;
                }
                if (done) {
                  d3.push(null);
                  return;
                }
              } catch {
                return;
              }
            }
          };
        }
      }
      d3._destroy = function(err, callback) {
        if (!err && onclose !== null) {
          err = new AbortError();
        }
        onreadable = null;
        ondrain = null;
        onfinish = null;
        if (onclose === null) {
          callback(err);
        } else {
          onclose = callback;
          if (isNodeStream(tail)) {
            destroyer(tail, err);
          }
        }
      };
      return d3;
    };
  }
});

// node_modules/readable-stream/lib/internal/streams/operators.js
var require_operators = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/operators.js"(exports, module) {
    "use strict";
    var AbortController = globalThis.AbortController || require_browser().AbortController;
    var {
      codes: { ERR_INVALID_ARG_VALUE, ERR_INVALID_ARG_TYPE, ERR_MISSING_ARGS, ERR_OUT_OF_RANGE },
      AbortError
    } = require_errors();
    var { validateAbortSignal, validateInteger, validateObject } = require_validators();
    var kWeakHandler = require_primordials().Symbol("kWeak");
    var kResistStopPropagation = require_primordials().Symbol("kResistStopPropagation");
    var { finished } = require_end_of_stream();
    var staticCompose = require_compose();
    var { addAbortSignalNoValidate } = require_add_abort_signal();
    var { isWritable, isNodeStream } = require_utils();
    var { deprecate } = require_util();
    var {
      ArrayPrototypePush,
      Boolean: Boolean2,
      MathFloor,
      Number: Number2,
      NumberIsNaN,
      Promise: Promise2,
      PromiseReject,
      PromiseResolve,
      PromisePrototypeThen,
      Symbol: Symbol2
    } = require_primordials();
    var kEmpty = Symbol2("kEmpty");
    var kEof = Symbol2("kEof");
    function compose(stream, options) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      if (isNodeStream(stream) && !isWritable(stream)) {
        throw new ERR_INVALID_ARG_VALUE("stream", stream, "must be writable");
      }
      const composedStream = staticCompose(this, stream);
      if (options !== null && options !== void 0 && options.signal) {
        addAbortSignalNoValidate(options.signal, composedStream);
      }
      return composedStream;
    }
    function map(fn, options) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
      }
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      let concurrency = 1;
      if ((options === null || options === void 0 ? void 0 : options.concurrency) != null) {
        concurrency = MathFloor(options.concurrency);
      }
      let highWaterMark = concurrency - 1;
      if ((options === null || options === void 0 ? void 0 : options.highWaterMark) != null) {
        highWaterMark = MathFloor(options.highWaterMark);
      }
      validateInteger(concurrency, "options.concurrency", 1);
      validateInteger(highWaterMark, "options.highWaterMark", 0);
      highWaterMark += concurrency;
      return async function* map2() {
        const signal = require_util().AbortSignalAny(
          [options === null || options === void 0 ? void 0 : options.signal].filter(Boolean2)
        );
        const stream = this;
        const queue = [];
        const signalOpt = {
          signal
        };
        let next;
        let resume;
        let done = false;
        let cnt = 0;
        function onCatch() {
          done = true;
          afterItemProcessed();
        }
        function afterItemProcessed() {
          cnt -= 1;
          maybeResume();
        }
        function maybeResume() {
          if (resume && !done && cnt < concurrency && queue.length < highWaterMark) {
            resume();
            resume = null;
          }
        }
        async function pump() {
          try {
            for await (let val of stream) {
              if (done) {
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              try {
                val = fn(val, signalOpt);
                if (val === kEmpty) {
                  continue;
                }
                val = PromiseResolve(val);
              } catch (err) {
                val = PromiseReject(err);
              }
              cnt += 1;
              PromisePrototypeThen(val, afterItemProcessed, onCatch);
              queue.push(val);
              if (next) {
                next();
                next = null;
              }
              if (!done && (queue.length >= highWaterMark || cnt >= concurrency)) {
                await new Promise2((resolve) => {
                  resume = resolve;
                });
              }
            }
            queue.push(kEof);
          } catch (err) {
            const val = PromiseReject(err);
            PromisePrototypeThen(val, afterItemProcessed, onCatch);
            queue.push(val);
          } finally {
            done = true;
            if (next) {
              next();
              next = null;
            }
          }
        }
        pump();
        try {
          while (true) {
            while (queue.length > 0) {
              const val = await queue[0];
              if (val === kEof) {
                return;
              }
              if (signal.aborted) {
                throw new AbortError();
              }
              if (val !== kEmpty) {
                yield val;
              }
              queue.shift();
              maybeResume();
            }
            await new Promise2((resolve) => {
              next = resolve;
            });
          }
        } finally {
          done = true;
          if (resume) {
            resume();
            resume = null;
          }
        }
      }.call(this);
    }
    function asIndexedPairs(options = void 0) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      return async function* asIndexedPairs2() {
        let index = 0;
        for await (const val of this) {
          var _options$signal;
          if (options !== null && options !== void 0 && (_options$signal = options.signal) !== null && _options$signal !== void 0 && _options$signal.aborted) {
            throw new AbortError({
              cause: options.signal.reason
            });
          }
          yield [index++, val];
        }
      }.call(this);
    }
    async function some(fn, options = void 0) {
      for await (const unused of filter.call(this, fn, options)) {
        return true;
      }
      return false;
    }
    async function every(fn, options = void 0) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
      }
      return !await some.call(
        this,
        async (...args) => {
          return !await fn(...args);
        },
        options
      );
    }
    async function find(fn, options) {
      for await (const result of filter.call(this, fn, options)) {
        return result;
      }
      return void 0;
    }
    async function forEach(fn, options) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
      }
      async function forEachFn(value, options2) {
        await fn(value, options2);
        return kEmpty;
      }
      for await (const unused of map.call(this, forEachFn, options)) ;
    }
    function filter(fn, options) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
      }
      async function filterFn(value, options2) {
        if (await fn(value, options2)) {
          return value;
        }
        return kEmpty;
      }
      return map.call(this, filterFn, options);
    }
    var ReduceAwareErrMissingArgs = class extends ERR_MISSING_ARGS {
      constructor() {
        super("reduce");
        this.message = "Reduce of an empty stream requires an initial value";
      }
    };
    async function reduce(reducer, initialValue, options) {
      var _options$signal2;
      if (typeof reducer !== "function") {
        throw new ERR_INVALID_ARG_TYPE("reducer", ["Function", "AsyncFunction"], reducer);
      }
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      let hasInitialValue = arguments.length > 1;
      if (options !== null && options !== void 0 && (_options$signal2 = options.signal) !== null && _options$signal2 !== void 0 && _options$signal2.aborted) {
        const err = new AbortError(void 0, {
          cause: options.signal.reason
        });
        this.once("error", () => {
        });
        await finished(this.destroy(err));
        throw err;
      }
      const ac = new AbortController();
      const signal = ac.signal;
      if (options !== null && options !== void 0 && options.signal) {
        const opts = {
          once: true,
          [kWeakHandler]: this,
          [kResistStopPropagation]: true
        };
        options.signal.addEventListener("abort", () => ac.abort(), opts);
      }
      let gotAnyItemFromStream = false;
      try {
        for await (const value of this) {
          var _options$signal3;
          gotAnyItemFromStream = true;
          if (options !== null && options !== void 0 && (_options$signal3 = options.signal) !== null && _options$signal3 !== void 0 && _options$signal3.aborted) {
            throw new AbortError();
          }
          if (!hasInitialValue) {
            initialValue = value;
            hasInitialValue = true;
          } else {
            initialValue = await reducer(initialValue, value, {
              signal
            });
          }
        }
        if (!gotAnyItemFromStream && !hasInitialValue) {
          throw new ReduceAwareErrMissingArgs();
        }
      } finally {
        ac.abort();
      }
      return initialValue;
    }
    async function toArray(options) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      const result = [];
      for await (const val of this) {
        var _options$signal4;
        if (options !== null && options !== void 0 && (_options$signal4 = options.signal) !== null && _options$signal4 !== void 0 && _options$signal4.aborted) {
          throw new AbortError(void 0, {
            cause: options.signal.reason
          });
        }
        ArrayPrototypePush(result, val);
      }
      return result;
    }
    function flatMap(fn, options) {
      const values = map.call(this, fn, options);
      return async function* flatMap2() {
        for await (const val of values) {
          yield* val;
        }
      }.call(this);
    }
    function toIntegerOrInfinity(number) {
      number = Number2(number);
      if (NumberIsNaN(number)) {
        return 0;
      }
      if (number < 0) {
        throw new ERR_OUT_OF_RANGE("number", ">= 0", number);
      }
      return number;
    }
    function drop(number, options = void 0) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      number = toIntegerOrInfinity(number);
      return async function* drop2() {
        var _options$signal5;
        if (options !== null && options !== void 0 && (_options$signal5 = options.signal) !== null && _options$signal5 !== void 0 && _options$signal5.aborted) {
          throw new AbortError();
        }
        for await (const val of this) {
          var _options$signal6;
          if (options !== null && options !== void 0 && (_options$signal6 = options.signal) !== null && _options$signal6 !== void 0 && _options$signal6.aborted) {
            throw new AbortError();
          }
          if (number-- <= 0) {
            yield val;
          }
        }
      }.call(this);
    }
    function take(number, options = void 0) {
      if (options != null) {
        validateObject(options, "options");
      }
      if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
        validateAbortSignal(options.signal, "options.signal");
      }
      number = toIntegerOrInfinity(number);
      return async function* take2() {
        var _options$signal7;
        if (options !== null && options !== void 0 && (_options$signal7 = options.signal) !== null && _options$signal7 !== void 0 && _options$signal7.aborted) {
          throw new AbortError();
        }
        for await (const val of this) {
          var _options$signal8;
          if (options !== null && options !== void 0 && (_options$signal8 = options.signal) !== null && _options$signal8 !== void 0 && _options$signal8.aborted) {
            throw new AbortError();
          }
          if (number-- > 0) {
            yield val;
          }
          if (number <= 0) {
            return;
          }
        }
      }.call(this);
    }
    module.exports.streamReturningOperators = {
      asIndexedPairs: deprecate(asIndexedPairs, "readable.asIndexedPairs will be removed in a future version."),
      drop,
      filter,
      flatMap,
      map,
      take,
      compose
    };
    module.exports.promiseReturningOperators = {
      every,
      forEach,
      reduce,
      toArray,
      some,
      find
    };
  }
});

// node_modules/readable-stream/lib/stream/promises.js
var require_promises = __commonJS({
  "node_modules/readable-stream/lib/stream/promises.js"(exports, module) {
    "use strict";
    var { ArrayPrototypePop, Promise: Promise2 } = require_primordials();
    var { isIterable, isNodeStream, isWebStream } = require_utils();
    var { pipelineImpl: pl } = require_pipeline();
    var { finished } = require_end_of_stream();
    require_stream();
    function pipeline(...streams) {
      return new Promise2((resolve, reject) => {
        let signal;
        let end;
        const lastArg = streams[streams.length - 1];
        if (lastArg && typeof lastArg === "object" && !isNodeStream(lastArg) && !isIterable(lastArg) && !isWebStream(lastArg)) {
          const options = ArrayPrototypePop(streams);
          signal = options.signal;
          end = options.end;
        }
        pl(
          streams,
          (err, value) => {
            if (err) {
              reject(err);
            } else {
              resolve(value);
            }
          },
          {
            signal,
            end
          }
        );
      });
    }
    module.exports = {
      finished,
      pipeline
    };
  }
});

// node_modules/readable-stream/lib/stream.js
var require_stream = __commonJS({
  "node_modules/readable-stream/lib/stream.js"(exports, module) {
    "use strict";
    var { Buffer: Buffer3 } = require_buffer();
    var { ObjectDefineProperty, ObjectKeys, ReflectApply } = require_primordials();
    var {
      promisify: { custom: customPromisify }
    } = require_util();
    var { streamReturningOperators, promiseReturningOperators } = require_operators();
    var {
      codes: { ERR_ILLEGAL_CONSTRUCTOR }
    } = require_errors();
    var compose = require_compose();
    var { setDefaultHighWaterMark, getDefaultHighWaterMark } = require_state();
    var { pipeline } = require_pipeline();
    var { destroyer } = require_destroy();
    var eos = require_end_of_stream();
    var promises = require_promises();
    var utils = require_utils();
    var Stream = module.exports = require_legacy().Stream;
    Stream.isDestroyed = utils.isDestroyed;
    Stream.isDisturbed = utils.isDisturbed;
    Stream.isErrored = utils.isErrored;
    Stream.isReadable = utils.isReadable;
    Stream.isWritable = utils.isWritable;
    Stream.Readable = require_readable();
    for (const key of ObjectKeys(streamReturningOperators)) {
      let fn = function(...args) {
        if (new.target) {
          throw ERR_ILLEGAL_CONSTRUCTOR();
        }
        return Stream.Readable.from(ReflectApply(op, this, args));
      };
      const op = streamReturningOperators[key];
      ObjectDefineProperty(fn, "name", {
        __proto__: null,
        value: op.name
      });
      ObjectDefineProperty(fn, "length", {
        __proto__: null,
        value: op.length
      });
      ObjectDefineProperty(Stream.Readable.prototype, key, {
        __proto__: null,
        value: fn,
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
    for (const key of ObjectKeys(promiseReturningOperators)) {
      let fn = function(...args) {
        if (new.target) {
          throw ERR_ILLEGAL_CONSTRUCTOR();
        }
        return ReflectApply(op, this, args);
      };
      const op = promiseReturningOperators[key];
      ObjectDefineProperty(fn, "name", {
        __proto__: null,
        value: op.name
      });
      ObjectDefineProperty(fn, "length", {
        __proto__: null,
        value: op.length
      });
      ObjectDefineProperty(Stream.Readable.prototype, key, {
        __proto__: null,
        value: fn,
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
    Stream.Writable = require_writable();
    Stream.Duplex = require_duplex();
    Stream.Transform = require_transform();
    Stream.PassThrough = require_passthrough();
    Stream.pipeline = pipeline;
    var { addAbortSignal } = require_add_abort_signal();
    Stream.addAbortSignal = addAbortSignal;
    Stream.finished = eos;
    Stream.destroy = destroyer;
    Stream.compose = compose;
    Stream.setDefaultHighWaterMark = setDefaultHighWaterMark;
    Stream.getDefaultHighWaterMark = getDefaultHighWaterMark;
    ObjectDefineProperty(Stream, "promises", {
      __proto__: null,
      configurable: true,
      enumerable: true,
      get() {
        return promises;
      }
    });
    ObjectDefineProperty(pipeline, customPromisify, {
      __proto__: null,
      enumerable: true,
      get() {
        return promises.pipeline;
      }
    });
    ObjectDefineProperty(eos, customPromisify, {
      __proto__: null,
      enumerable: true,
      get() {
        return promises.finished;
      }
    });
    Stream.Stream = Stream;
    Stream._isUint8Array = function isUint8Array(value) {
      return value instanceof Uint8Array;
    };
    Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
      return Buffer3.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    };
  }
});

// node_modules/readable-stream/lib/ours/browser.js
var require_browser3 = __commonJS({
  "node_modules/readable-stream/lib/ours/browser.js"(exports, module) {
    "use strict";
    var CustomStream = require_stream();
    var promises = require_promises();
    var originalDestroy = CustomStream.Readable.destroy;
    module.exports = CustomStream.Readable;
    module.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer;
    module.exports._isUint8Array = CustomStream._isUint8Array;
    module.exports.isDisturbed = CustomStream.isDisturbed;
    module.exports.isErrored = CustomStream.isErrored;
    module.exports.isReadable = CustomStream.isReadable;
    module.exports.Readable = CustomStream.Readable;
    module.exports.Writable = CustomStream.Writable;
    module.exports.Duplex = CustomStream.Duplex;
    module.exports.Transform = CustomStream.Transform;
    module.exports.PassThrough = CustomStream.PassThrough;
    module.exports.addAbortSignal = CustomStream.addAbortSignal;
    module.exports.finished = CustomStream.finished;
    module.exports.destroy = CustomStream.destroy;
    module.exports.destroy = originalDestroy;
    module.exports.pipeline = CustomStream.pipeline;
    module.exports.compose = CustomStream.compose;
    Object.defineProperty(CustomStream, "promises", {
      configurable: true,
      enumerable: true,
      get() {
        return promises;
      }
    });
    module.exports.Stream = CustomStream.Stream;
    module.exports.default = module.exports;
  }
});

// node_modules/n3/src/N3Store.js
function merge(target, source, depth = 4) {
  if (depth === 0)
    return Object.assign(target, source);
  for (const key in source)
    target[key] = merge(target[key] || /* @__PURE__ */ Object.create(null), source[key], depth - 1);
  return target;
}
function intersect(s1, s22, depth = 4) {
  let target = false;
  for (const key in s1) {
    if (key in s22) {
      const intersection = depth === 0 ? null : intersect(s1[key], s22[key], depth - 1);
      if (intersection !== false) {
        target = target || /* @__PURE__ */ Object.create(null);
        target[key] = intersection;
      } else if (depth === 3) {
        return false;
      }
    }
  }
  return target;
}
function difference(s1, s22, depth = 4) {
  let target = false;
  for (const key in s1) {
    if (!(key in s22)) {
      target = target || /* @__PURE__ */ Object.create(null);
      target[key] = depth === 0 ? null : merge({}, s1[key], depth - 1);
    } else if (depth !== 0) {
      const diff = difference(s1[key], s22[key], depth - 1);
      if (diff !== false) {
        target = target || /* @__PURE__ */ Object.create(null);
        target[key] = diff;
      } else if (depth === 3) {
        return false;
      }
    }
  }
  return target;
}
function indexMatch(index, ids, depth = 0) {
  const ind = ids[depth];
  if (ind && !(ind in index))
    return false;
  let target = false;
  for (const key in ind ? { [ind]: index[ind] } : index) {
    const result = depth === 2 ? null : indexMatch(index[key], ids, depth + 1);
    if (result !== false) {
      target = target || /* @__PURE__ */ Object.create(null);
      target[key] = result;
    }
  }
  return target;
}
var import_readable_stream, ITERATOR, N3EntityIndex, N3Store, DatasetCoreAndReadableStream;
var init_N3Store = __esm({
  "node_modules/n3/src/N3Store.js"() {
    "use strict";
    import_readable_stream = __toESM(require_browser3());
    init_N3DataFactory();
    init_IRIs();
    init_N3Util();
    init_N3Writer();
    ITERATOR = /* @__PURE__ */ Symbol("iter");
    N3EntityIndex = class {
      constructor(options = {}) {
        this._id = 1;
        this._ids = /* @__PURE__ */ Object.create(null);
        this._ids[""] = 1;
        this._entities = /* @__PURE__ */ Object.create(null);
        this._entities[1] = "";
        this._blankNodeIndex = 0;
        this._factory = options.factory || N3DataFactory_default;
      }
      _termFromId(id) {
        if (id[0] === ".") {
          const entities = this._entities;
          const terms = id.split(".");
          const q = this._factory.quad(
            this._termFromId(entities[terms[1]]),
            this._termFromId(entities[terms[2]]),
            this._termFromId(entities[terms[3]]),
            terms[4] && this._termFromId(entities[terms[4]])
          );
          return q;
        }
        return termFromId(id, this._factory);
      }
      _termToNumericId(term) {
        if (term.termType === "Quad") {
          const s4 = this._termToNumericId(term.subject), p3 = this._termToNumericId(term.predicate), o6 = this._termToNumericId(term.object);
          let g2;
          return s4 && p3 && o6 && (isDefaultGraph(term.graph) || (g2 = this._termToNumericId(term.graph))) && this._ids[g2 ? `.${s4}.${p3}.${o6}.${g2}` : `.${s4}.${p3}.${o6}`];
        }
        return this._ids[termToId(term)];
      }
      _termToNewNumericId(term) {
        const str = term && term.termType === "Quad" ? `.${this._termToNewNumericId(term.subject)}.${this._termToNewNumericId(term.predicate)}.${this._termToNewNumericId(term.object)}${isDefaultGraph(term.graph) ? "" : `.${this._termToNewNumericId(term.graph)}`}` : termToId(term);
        return this._ids[str] || (this._ids[this._entities[++this._id] = str] = this._id);
      }
      createBlankNode(suggestedName) {
        let name, index;
        if (suggestedName) {
          name = suggestedName = `_:${suggestedName}`, index = 1;
          while (this._ids[name])
            name = suggestedName + index++;
        } else {
          do {
            name = `_:b${this._blankNodeIndex++}`;
          } while (this._ids[name]);
        }
        this._ids[name] = ++this._id;
        this._entities[this._id] = name;
        return this._factory.blankNode(name.substr(2));
      }
    };
    N3Store = class _N3Store {
      constructor(quads, options) {
        this._size = 0;
        this._graphs = /* @__PURE__ */ Object.create(null);
        if (!options && quads && !quads[0] && !(typeof quads.match === "function"))
          options = quads, quads = null;
        options = options || {};
        this._factory = options.factory || N3DataFactory_default;
        this._entityIndex = options.entityIndex || new N3EntityIndex({ factory: this._factory });
        this._entities = this._entityIndex._entities;
        this._termFromId = this._entityIndex._termFromId.bind(this._entityIndex);
        this._termToNumericId = this._entityIndex._termToNumericId.bind(this._entityIndex);
        this._termToNewNumericId = this._entityIndex._termToNewNumericId.bind(this._entityIndex);
        if (quads)
          this.addAll(quads);
      }
      // ## Public properties
      // ### `size` returns the number of quads in the store
      get size() {
        let size = this._size;
        if (size !== null)
          return size;
        size = 0;
        const graphs = this._graphs;
        let subjects2, subject2;
        for (const graphKey in graphs)
          for (const subjectKey in subjects2 = graphs[graphKey].subjects)
            for (const predicateKey in subject2 = subjects2[subjectKey])
              size += Object.keys(subject2[predicateKey]).length;
        return this._size = size;
      }
      // ## Private methods
      // ### `_addToIndex` adds a quad to a three-layered index.
      // Returns if the index has changed, if the entry did not already exist.
      _addToIndex(index0, key0, key1, key2) {
        const index1 = index0[key0] || (index0[key0] = {});
        const index2 = index1[key1] || (index1[key1] = {});
        const existed = key2 in index2;
        if (!existed)
          index2[key2] = null;
        return !existed;
      }
      // ### `_removeFromIndex` removes a quad from a three-layered index
      _removeFromIndex(index0, key0, key1, key2) {
        const index1 = index0[key0], index2 = index1[key1];
        delete index2[key2];
        for (const key in index2) return;
        delete index1[key1];
        for (const key in index1) return;
        delete index0[key0];
      }
      // ### `_findInIndex` finds a set of quads in a three-layered index.
      // The index base is `index0` and the keys at each level are `key0`, `key1`, and `key2`.
      // Any of these keys can be undefined, which is interpreted as a wildcard.
      // `name0`, `name1`, and `name2` are the names of the keys at each level,
      // used when reconstructing the resulting quad
      // (for instance: _subject_, _predicate_, and _object_).
      // Finally, `graphId` will be the graph of the created quads.
      *_findInIndex(index0, key0, key1, key2, name0, name1, name2, graphId) {
        let tmp, index1, index2;
        const entityKeys = this._entities;
        const graph = this._termFromId(entityKeys[graphId]);
        const parts = { subject: null, predicate: null, object: null };
        if (key0) (tmp = index0, index0 = {})[key0] = tmp[key0];
        for (const value0 in index0) {
          if (index1 = index0[value0]) {
            parts[name0] = this._termFromId(entityKeys[value0]);
            if (key1) (tmp = index1, index1 = {})[key1] = tmp[key1];
            for (const value1 in index1) {
              if (index2 = index1[value1]) {
                parts[name1] = this._termFromId(entityKeys[value1]);
                const values = key2 ? key2 in index2 ? [key2] : [] : Object.keys(index2);
                for (let l3 = 0; l3 < values.length; l3++) {
                  parts[name2] = this._termFromId(entityKeys[values[l3]]);
                  yield this._factory.quad(parts.subject, parts.predicate, parts.object, graph);
                }
              }
            }
          }
        }
      }
      // ### `_loop` executes the callback on all keys of index 0
      _loop(index0, callback) {
        for (const key0 in index0)
          callback(key0);
      }
      // ### `_loopByKey0` executes the callback on all keys of a certain entry in index 0
      _loopByKey0(index0, key0, callback) {
        let index1, key1;
        if (index1 = index0[key0]) {
          for (key1 in index1)
            callback(key1);
        }
      }
      // ### `_loopByKey1` executes the callback on given keys of all entries in index 0
      _loopByKey1(index0, key1, callback) {
        let key0, index1;
        for (key0 in index0) {
          index1 = index0[key0];
          if (index1[key1])
            callback(key0);
        }
      }
      // ### `_loopBy2Keys` executes the callback on given keys of certain entries in index 2
      _loopBy2Keys(index0, key0, key1, callback) {
        let index1, index2, key2;
        if ((index1 = index0[key0]) && (index2 = index1[key1])) {
          for (key2 in index2)
            callback(key2);
        }
      }
      // ### `_countInIndex` counts matching quads in a three-layered index.
      // The index base is `index0` and the keys at each level are `key0`, `key1`, and `key2`.
      // Any of these keys can be undefined, which is interpreted as a wildcard.
      _countInIndex(index0, key0, key1, key2) {
        let count = 0, tmp, index1, index2;
        if (key0) (tmp = index0, index0 = {})[key0] = tmp[key0];
        for (const value0 in index0) {
          if (index1 = index0[value0]) {
            if (key1) (tmp = index1, index1 = {})[key1] = tmp[key1];
            for (const value1 in index1) {
              if (index2 = index1[value1]) {
                if (key2) key2 in index2 && count++;
                else count += Object.keys(index2).length;
              }
            }
          }
        }
        return count;
      }
      // ### `_getGraphs` returns an array with the given graph,
      // or all graphs if the argument is null or undefined.
      _getGraphs(graph) {
        graph = graph === "" ? 1 : graph && (this._termToNumericId(graph) || -1);
        return typeof graph !== "number" ? this._graphs : { [graph]: this._graphs[graph] };
      }
      // ### `_uniqueEntities` returns a function that accepts an entity ID
      // and passes the corresponding entity to callback if it hasn't occurred before.
      _uniqueEntities(callback) {
        const uniqueIds = /* @__PURE__ */ Object.create(null);
        return (id) => {
          if (!(id in uniqueIds)) {
            uniqueIds[id] = true;
            callback(this._termFromId(this._entities[id], this._factory));
          }
        };
      }
      // ## Public methods
      // ### `add` adds the specified quad to the dataset.
      // Returns the dataset instance it was called on.
      // Existing quads, as defined in Quad.equals, will be ignored.
      add(quad3) {
        this.addQuad(quad3);
        return this;
      }
      // ### `addQuad` adds a new quad to the store.
      // Returns if the quad index has changed, if the quad did not already exist.
      addQuad(subject2, predicate2, object2, graph) {
        if (!predicate2)
          graph = subject2.graph, object2 = subject2.object, predicate2 = subject2.predicate, subject2 = subject2.subject;
        graph = graph ? this._termToNewNumericId(graph) : 1;
        let graphItem = this._graphs[graph];
        if (!graphItem) {
          graphItem = this._graphs[graph] = { subjects: {}, predicates: {}, objects: {} };
          Object.freeze(graphItem);
        }
        subject2 = this._termToNewNumericId(subject2);
        predicate2 = this._termToNewNumericId(predicate2);
        object2 = this._termToNewNumericId(object2);
        if (!this._addToIndex(graphItem.subjects, subject2, predicate2, object2))
          return false;
        this._addToIndex(graphItem.predicates, predicate2, object2, subject2);
        this._addToIndex(graphItem.objects, object2, subject2, predicate2);
        this._size = null;
        return true;
      }
      // ### `addQuads` adds multiple quads to the store
      addQuads(quads) {
        for (let i5 = 0; i5 < quads.length; i5++)
          this.addQuad(quads[i5]);
      }
      // ### `delete` removes the specified quad from the dataset.
      // Returns the dataset instance it was called on.
      delete(quad3) {
        this.removeQuad(quad3);
        return this;
      }
      // ### `has` determines whether a dataset includes a certain quad or quad pattern.
      has(subjectOrQuad, predicate2, object2, graph) {
        if (subjectOrQuad && subjectOrQuad.subject)
          ({ subject: subjectOrQuad, predicate: predicate2, object: object2, graph } = subjectOrQuad);
        return !this.readQuads(subjectOrQuad, predicate2, object2, graph).next().done;
      }
      // ### `import` adds a stream of quads to the store
      import(stream) {
        stream.on("data", (quad3) => {
          this.addQuad(quad3);
        });
        return stream;
      }
      // ### `removeQuad` removes a quad from the store if it exists
      removeQuad(subject2, predicate2, object2, graph) {
        if (!predicate2)
          ({ subject: subject2, predicate: predicate2, object: object2, graph } = subject2);
        graph = graph ? this._termToNumericId(graph) : 1;
        const graphs = this._graphs;
        let graphItem, subjects2, predicates;
        if (!(subject2 = subject2 && this._termToNumericId(subject2)) || !(predicate2 = predicate2 && this._termToNumericId(predicate2)) || !(object2 = object2 && this._termToNumericId(object2)) || !(graphItem = graphs[graph]) || !(subjects2 = graphItem.subjects[subject2]) || !(predicates = subjects2[predicate2]) || !(object2 in predicates))
          return false;
        this._removeFromIndex(graphItem.subjects, subject2, predicate2, object2);
        this._removeFromIndex(graphItem.predicates, predicate2, object2, subject2);
        this._removeFromIndex(graphItem.objects, object2, subject2, predicate2);
        if (this._size !== null) this._size--;
        for (subject2 in graphItem.subjects) return true;
        delete graphs[graph];
        return true;
      }
      // ### `removeQuads` removes multiple quads from the store
      removeQuads(quads) {
        for (let i5 = 0; i5 < quads.length; i5++)
          this.removeQuad(quads[i5]);
      }
      // ### `remove` removes a stream of quads from the store
      remove(stream) {
        stream.on("data", (quad3) => {
          this.removeQuad(quad3);
        });
        return stream;
      }
      // ### `removeMatches` removes all matching quads from the store
      // Setting any field to `undefined` or `null` indicates a wildcard.
      removeMatches(subject2, predicate2, object2, graph) {
        const stream = new import_readable_stream.Readable({ objectMode: true });
        const iterable = this.readQuads(subject2, predicate2, object2, graph);
        stream._read = (size) => {
          while (--size >= 0) {
            const { done, value } = iterable.next();
            if (done) {
              stream.push(null);
              return;
            }
            stream.push(value);
          }
        };
        return this.remove(stream);
      }
      // ### `deleteGraph` removes all triples with the given graph from the store
      deleteGraph(graph) {
        return this.removeMatches(null, null, null, graph);
      }
      // ### `getQuads` returns an array of quads matching a pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      getQuads(subject2, predicate2, object2, graph) {
        return [...this.readQuads(subject2, predicate2, object2, graph)];
      }
      /**
       * `readQuads` returns a generator of quads matching a pattern.
       * Setting any field to `undefined` or `null` indicates a wildcard.
       * @deprecated Use `match` instead.
       */
      *readQuads(subject2, predicate2, object2, graph) {
        const graphs = this._getGraphs(graph);
        let content, subjectId, predicateId, objectId;
        if (subject2 && !(subjectId = this._termToNumericId(subject2)) || predicate2 && !(predicateId = this._termToNumericId(predicate2)) || object2 && !(objectId = this._termToNumericId(object2)))
          return;
        for (const graphId in graphs) {
          if (content = graphs[graphId]) {
            if (subjectId) {
              if (objectId)
                yield* this._findInIndex(
                  content.objects,
                  objectId,
                  subjectId,
                  predicateId,
                  "object",
                  "subject",
                  "predicate",
                  graphId
                );
              else
                yield* this._findInIndex(
                  content.subjects,
                  subjectId,
                  predicateId,
                  null,
                  "subject",
                  "predicate",
                  "object",
                  graphId
                );
            } else if (predicateId)
              yield* this._findInIndex(
                content.predicates,
                predicateId,
                objectId,
                null,
                "predicate",
                "object",
                "subject",
                graphId
              );
            else if (objectId)
              yield* this._findInIndex(
                content.objects,
                objectId,
                null,
                null,
                "object",
                "subject",
                "predicate",
                graphId
              );
            else
              yield* this._findInIndex(
                content.subjects,
                null,
                null,
                null,
                "subject",
                "predicate",
                "object",
                graphId
              );
          }
        }
      }
      // ### `match` returns a new dataset that is comprised of all quads in the current instance matching the given arguments.
      // The logic described in Quad Matching is applied for each quad in this dataset to check if it should be included in the output dataset.
      // Note: This method always returns a new DatasetCore, even if that dataset contains no quads.
      // Note: Since a DatasetCore is an unordered set, the order of the quads within the returned sequence is arbitrary.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      // For backwards compatibility, the object return also implements the Readable stream interface.
      match(subject2, predicate2, object2, graph) {
        return new DatasetCoreAndReadableStream(this, subject2, predicate2, object2, graph, { entityIndex: this._entityIndex });
      }
      // ### `countQuads` returns the number of quads matching a pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      countQuads(subject2, predicate2, object2, graph) {
        const graphs = this._getGraphs(graph);
        let count = 0, content, subjectId, predicateId, objectId;
        if (subject2 && !(subjectId = this._termToNumericId(subject2)) || predicate2 && !(predicateId = this._termToNumericId(predicate2)) || object2 && !(objectId = this._termToNumericId(object2)))
          return 0;
        for (const graphId in graphs) {
          if (content = graphs[graphId]) {
            if (subject2) {
              if (object2)
                count += this._countInIndex(content.objects, objectId, subjectId, predicateId);
              else
                count += this._countInIndex(content.subjects, subjectId, predicateId, objectId);
            } else if (predicate2) {
              count += this._countInIndex(content.predicates, predicateId, objectId, subjectId);
            } else {
              count += this._countInIndex(content.objects, objectId, subjectId, predicateId);
            }
          }
        }
        return count;
      }
      // ### `forEach` executes the callback on all quads.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      forEach(callback, subject2, predicate2, object2, graph) {
        this.some((quad3) => {
          callback(quad3, this);
          return false;
        }, subject2, predicate2, object2, graph);
      }
      // ### `every` executes the callback on all quads,
      // and returns `true` if it returns truthy for all them.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      every(callback, subject2, predicate2, object2, graph) {
        return !this.some((quad3) => !callback(quad3, this), subject2, predicate2, object2, graph);
      }
      // ### `some` executes the callback on all quads,
      // and returns `true` if it returns truthy for any of them.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      some(callback, subject2, predicate2, object2, graph) {
        for (const quad3 of this.readQuads(subject2, predicate2, object2, graph))
          if (callback(quad3, this))
            return true;
        return false;
      }
      // ### `getSubjects` returns all subjects that match the pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      getSubjects(predicate2, object2, graph) {
        const results = [];
        this.forSubjects((s4) => {
          results.push(s4);
        }, predicate2, object2, graph);
        return results;
      }
      // ### `forSubjects` executes the callback on all subjects that match the pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      forSubjects(callback, predicate2, object2, graph) {
        const graphs = this._getGraphs(graph);
        let content, predicateId, objectId;
        callback = this._uniqueEntities(callback);
        if (predicate2 && !(predicateId = this._termToNumericId(predicate2)) || object2 && !(objectId = this._termToNumericId(object2)))
          return;
        for (graph in graphs) {
          if (content = graphs[graph]) {
            if (predicateId) {
              if (objectId)
                this._loopBy2Keys(content.predicates, predicateId, objectId, callback);
              else
                this._loopByKey1(content.subjects, predicateId, callback);
            } else if (objectId)
              this._loopByKey0(content.objects, objectId, callback);
            else
              this._loop(content.subjects, callback);
          }
        }
      }
      // ### `getPredicates` returns all predicates that match the pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      getPredicates(subject2, object2, graph) {
        const results = [];
        this.forPredicates((p3) => {
          results.push(p3);
        }, subject2, object2, graph);
        return results;
      }
      // ### `forPredicates` executes the callback on all predicates that match the pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      forPredicates(callback, subject2, object2, graph) {
        const graphs = this._getGraphs(graph);
        let content, subjectId, objectId;
        callback = this._uniqueEntities(callback);
        if (subject2 && !(subjectId = this._termToNumericId(subject2)) || object2 && !(objectId = this._termToNumericId(object2)))
          return;
        for (graph in graphs) {
          if (content = graphs[graph]) {
            if (subjectId) {
              if (objectId)
                this._loopBy2Keys(content.objects, objectId, subjectId, callback);
              else
                this._loopByKey0(content.subjects, subjectId, callback);
            } else if (objectId)
              this._loopByKey1(content.predicates, objectId, callback);
            else
              this._loop(content.predicates, callback);
          }
        }
      }
      // ### `getObjects` returns all objects that match the pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      getObjects(subject2, predicate2, graph) {
        const results = [];
        this.forObjects((o6) => {
          results.push(o6);
        }, subject2, predicate2, graph);
        return results;
      }
      // ### `forObjects` executes the callback on all objects that match the pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      forObjects(callback, subject2, predicate2, graph) {
        const graphs = this._getGraphs(graph);
        let content, subjectId, predicateId;
        callback = this._uniqueEntities(callback);
        if (subject2 && !(subjectId = this._termToNumericId(subject2)) || predicate2 && !(predicateId = this._termToNumericId(predicate2)))
          return;
        for (graph in graphs) {
          if (content = graphs[graph]) {
            if (subjectId) {
              if (predicateId)
                this._loopBy2Keys(content.subjects, subjectId, predicateId, callback);
              else
                this._loopByKey1(content.objects, subjectId, callback);
            } else if (predicateId)
              this._loopByKey0(content.predicates, predicateId, callback);
            else
              this._loop(content.objects, callback);
          }
        }
      }
      // ### `getGraphs` returns all graphs that match the pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      getGraphs(subject2, predicate2, object2) {
        const results = [];
        this.forGraphs((g2) => {
          results.push(g2);
        }, subject2, predicate2, object2);
        return results;
      }
      // ### `forGraphs` executes the callback on all graphs that match the pattern.
      // Setting any field to `undefined` or `null` indicates a wildcard.
      forGraphs(callback, subject2, predicate2, object2) {
        for (const graph in this._graphs) {
          this.some((quad3) => {
            callback(quad3.graph);
            return true;
          }, subject2, predicate2, object2, this._termFromId(this._entities[graph]));
        }
      }
      // ### `createBlankNode` creates a new blank node, returning its name
      createBlankNode(suggestedName) {
        return this._entityIndex.createBlankNode(suggestedName);
      }
      // ### `extractLists` finds and removes all list triples
      // and returns the items per list.
      extractLists({ remove = false, ignoreErrors = false } = {}) {
        const lists = {};
        const onError = ignoreErrors ? (() => true) : ((node, message) => {
          throw new Error(`${node.value} ${message}`);
        });
        const tails = this.getQuads(null, IRIs_default.rdf.rest, IRIs_default.rdf.nil, null);
        const toRemove = remove ? [...tails] : [];
        tails.forEach((tailQuad) => {
          const items = [];
          let malformed = false;
          let head;
          let headPos;
          const graph = tailQuad.graph;
          let current = tailQuad.subject;
          while (current && !malformed) {
            const objectQuads = this.getQuads(null, null, current, null);
            const subjectQuads = this.getQuads(current, null, null, null);
            let quad3, first = null, rest = null, parent = null;
            for (let i5 = 0; i5 < subjectQuads.length && !malformed; i5++) {
              quad3 = subjectQuads[i5];
              if (!quad3.graph.equals(graph))
                malformed = onError(current, "not confined to single graph");
              else if (head)
                malformed = onError(current, "has non-list arcs out");
              else if (quad3.predicate.value === IRIs_default.rdf.first) {
                if (first)
                  malformed = onError(current, "has multiple rdf:first arcs");
                else
                  toRemove.push(first = quad3);
              } else if (quad3.predicate.value === IRIs_default.rdf.rest) {
                if (rest)
                  malformed = onError(current, "has multiple rdf:rest arcs");
                else
                  toRemove.push(rest = quad3);
              } else if (objectQuads.length)
                malformed = onError(current, "can't be subject and object");
              else {
                head = quad3;
                headPos = "subject";
              }
            }
            for (let i5 = 0; i5 < objectQuads.length && !malformed; ++i5) {
              quad3 = objectQuads[i5];
              if (head)
                malformed = onError(current, "can't have coreferences");
              else if (quad3.predicate.value === IRIs_default.rdf.rest) {
                if (parent)
                  malformed = onError(current, "has incoming rdf:rest arcs");
                else
                  parent = quad3;
              } else {
                head = quad3;
                headPos = "object";
              }
            }
            if (!first)
              malformed = onError(current, "has no list head");
            else
              items.unshift(first.object);
            current = parent && parent.subject;
          }
          if (malformed)
            remove = false;
          else if (head)
            lists[head[headPos].value] = items;
        });
        if (remove)
          this.removeQuads(toRemove);
        return lists;
      }
      /**
       * Returns `true` if the current dataset is a superset of the given dataset; in other words, returns `true` if
       * the given dataset is a subset of, i.e., is contained within, the current dataset.
       *
       * Blank Nodes will be normalized.
       */
      addAll(quads) {
        if (quads instanceof DatasetCoreAndReadableStream)
          quads = quads.filtered;
        if (Array.isArray(quads))
          this.addQuads(quads);
        else if (quads instanceof _N3Store && quads._entityIndex === this._entityIndex) {
          if (quads._size !== 0) {
            this._graphs = merge(this._graphs, quads._graphs);
            this._size = null;
          }
        } else {
          for (const quad3 of quads)
            this.add(quad3);
        }
        return this;
      }
      /**
       * Returns `true` if the current dataset is a superset of the given dataset; in other words, returns `true` if
       * the given dataset is a subset of, i.e., is contained within, the current dataset.
       *
       * Blank Nodes will be normalized.
       */
      contains(other) {
        if (other instanceof DatasetCoreAndReadableStream)
          other = other.filtered;
        if (other === this)
          return true;
        if (!(other instanceof _N3Store) || this._entityIndex !== other._entityIndex)
          return other.every((quad3) => this.has(quad3));
        const g1 = this._graphs, g2 = other._graphs;
        let s1, s22, p1, p22, o1;
        for (const graph in g2) {
          if (!(s1 = g1[graph])) return false;
          s1 = s1.subjects;
          for (const subject2 in s22 = g2[graph].subjects) {
            if (!(p1 = s1[subject2])) return false;
            for (const predicate2 in p22 = s22[subject2]) {
              if (!(o1 = p1[predicate2])) return false;
              for (const object2 in p22[predicate2])
                if (!(object2 in o1)) return false;
            }
          }
        }
        return true;
      }
      /**
       * This method removes the quads in the current dataset that match the given arguments.
       *
       * The logic described in {@link https://rdf.js.org/dataset-spec/#quad-matching|Quad Matching} is applied for each
       * quad in this dataset, to select the quads which will be deleted.
       *
       * @param subject   The optional exact subject to match.
       * @param predicate The optional exact predicate to match.
       * @param object    The optional exact object to match.
       * @param graph     The optional exact graph to match.
       */
      deleteMatches(subject2, predicate2, object2, graph) {
        for (const quad3 of this.match(subject2, predicate2, object2, graph))
          this.removeQuad(quad3);
        return this;
      }
      /**
       * Returns a new dataset that contains all quads from the current dataset that are not included in the given dataset.
       */
      difference(other) {
        if (other && other instanceof DatasetCoreAndReadableStream)
          other = other.filtered;
        if (other === this)
          return new _N3Store({ entityIndex: this._entityIndex });
        if (other instanceof _N3Store && other._entityIndex === this._entityIndex) {
          const store = new _N3Store({ entityIndex: this._entityIndex });
          const graphs = difference(this._graphs, other._graphs);
          if (graphs) {
            store._graphs = graphs;
            store._size = null;
          }
          return store;
        }
        return this.filter((quad3) => !other.has(quad3));
      }
      /**
       * Returns true if the current dataset contains the same graph structure as the given dataset.
       *
       * Blank Nodes will be normalized.
       */
      equals(other) {
        if (other instanceof DatasetCoreAndReadableStream)
          other = other.filtered;
        return other === this || this.size === other.size && this.contains(other);
      }
      /**
       * Creates a new dataset with all the quads that pass the test implemented by the provided `iteratee`.
       *
       * This method is aligned with Array.prototype.filter() in ECMAScript-262.
       */
      filter(iteratee) {
        const store = new _N3Store({ entityIndex: this._entityIndex });
        for (const quad3 of this)
          if (iteratee(quad3, this))
            store.add(quad3);
        return store;
      }
      /**
       * Returns a new dataset containing all quads from the current dataset that are also included in the given dataset.
       */
      intersection(other) {
        if (other instanceof DatasetCoreAndReadableStream)
          other = other.filtered;
        if (other === this) {
          const store = new _N3Store({ entityIndex: this._entityIndex });
          store._graphs = merge(/* @__PURE__ */ Object.create(null), this._graphs);
          store._size = this._size;
          return store;
        } else if (other instanceof _N3Store && this._entityIndex === other._entityIndex) {
          const store = new _N3Store({ entityIndex: this._entityIndex });
          const graphs = intersect(other._graphs, this._graphs);
          if (graphs) {
            store._graphs = graphs;
            store._size = null;
          }
          return store;
        }
        return this.filter((quad3) => other.has(quad3));
      }
      /**
       * Returns a new dataset containing all quads returned by applying `iteratee` to each quad in the current dataset.
       */
      map(iteratee) {
        const store = new _N3Store({ entityIndex: this._entityIndex });
        for (const quad3 of this)
          store.add(iteratee(quad3, this));
        return store;
      }
      /**
       * This method calls the `iteratee` method on each `quad` of the `Dataset`. The first time the `iteratee` method
       * is called, the `accumulator` value is the `initialValue`, or, if not given, equals the first quad of the `Dataset`.
       * The return value of each call to the `iteratee` method is used as the `accumulator` value for the next call.
       *
       * This method returns the return value of the last `iteratee` call.
       *
       * This method is aligned with `Array.prototype.reduce()` in ECMAScript-262.
       */
      reduce(callback, initialValue) {
        const iter = this.readQuads();
        let accumulator = initialValue === void 0 ? iter.next().value : initialValue;
        for (const quad3 of iter)
          accumulator = callback(accumulator, quad3, this);
        return accumulator;
      }
      /**
       * Returns the set of quads within the dataset as a host-language-native sequence, for example an `Array` in
       * ECMAScript-262.
       *
       * Since a `Dataset` is an unordered set, the order of the quads within the returned sequence is arbitrary.
       */
      toArray() {
        return this.getQuads();
      }
      /**
       * Returns an N-Quads string representation of the dataset, preprocessed with the
       * {@link https://json-ld.github.io/normalization/spec/|RDF Dataset Normalization} algorithm.
       */
      toCanonical() {
        throw new Error("not implemented");
      }
      /**
       * Returns a stream that contains all quads of the dataset.
       */
      toStream() {
        return this.match();
      }
      /**
       * Returns an N-Quads string representation of the dataset.
       *
       * No prior normalization is required, therefore the results for the same quads may vary depending on the `Dataset`
       * implementation.
       */
      toString() {
        return new N3Writer().quadsToString(this);
      }
      /**
       * Returns a new `Dataset` that is a concatenation of this dataset and the quads given as an argument.
       */
      union(quads) {
        const store = new _N3Store({ entityIndex: this._entityIndex });
        store._graphs = merge(/* @__PURE__ */ Object.create(null), this._graphs);
        store._size = this._size;
        store.addAll(quads);
        return store;
      }
      // ### Store is an iterable.
      // Can be used where iterables are expected: for...of loops, array spread operator,
      // `yield*`, and destructuring assignment (order is not guaranteed).
      *[Symbol.iterator]() {
        yield* this.readQuads();
      }
    };
    DatasetCoreAndReadableStream = class _DatasetCoreAndReadableStream extends import_readable_stream.Readable {
      constructor(n3Store, subject2, predicate2, object2, graph, options) {
        super({ objectMode: true });
        Object.assign(this, { n3Store, subject: subject2, predicate: predicate2, object: object2, graph, options });
      }
      get filtered() {
        if (!this._filtered) {
          const { n3Store, graph, object: object2, predicate: predicate2, subject: subject2 } = this;
          const newStore = this._filtered = new N3Store({ factory: n3Store._factory, entityIndex: this.options.entityIndex });
          let subjectId, predicateId, objectId;
          if (subject2 && !(subjectId = newStore._termToNumericId(subject2)) || predicate2 && !(predicateId = newStore._termToNumericId(predicate2)) || object2 && !(objectId = newStore._termToNumericId(object2)))
            return newStore;
          const graphs = n3Store._getGraphs(graph);
          for (const graphKey in graphs) {
            let subjects2, predicates, objects, content;
            if (content = graphs[graphKey]) {
              if (!subjectId && predicateId) {
                if (predicates = indexMatch(content.predicates, [predicateId, objectId, subjectId])) {
                  subjects2 = indexMatch(content.subjects, [subjectId, predicateId, objectId]);
                  objects = indexMatch(content.objects, [objectId, subjectId, predicateId]);
                }
              } else if (objectId) {
                if (objects = indexMatch(content.objects, [objectId, subjectId, predicateId])) {
                  subjects2 = indexMatch(content.subjects, [subjectId, predicateId, objectId]);
                  predicates = indexMatch(content.predicates, [predicateId, objectId, subjectId]);
                }
              } else if (subjects2 = indexMatch(content.subjects, [subjectId, predicateId, objectId])) {
                predicates = indexMatch(content.predicates, [predicateId, objectId, subjectId]);
                objects = indexMatch(content.objects, [objectId, subjectId, predicateId]);
              }
              if (subjects2)
                newStore._graphs[graphKey] = { subjects: subjects2, predicates, objects };
            }
          }
          newStore._size = null;
        }
        return this._filtered;
      }
      get size() {
        return this.filtered.size;
      }
      _read(size) {
        if (size > 0 && !this[ITERATOR])
          this[ITERATOR] = this[Symbol.iterator]();
        const iterable = this[ITERATOR];
        while (--size >= 0) {
          const { done, value } = iterable.next();
          if (done) {
            this.push(null);
            return;
          }
          this.push(value);
        }
      }
      addAll(quads) {
        return this.filtered.addAll(quads);
      }
      contains(other) {
        return this.filtered.contains(other);
      }
      deleteMatches(subject2, predicate2, object2, graph) {
        return this.filtered.deleteMatches(subject2, predicate2, object2, graph);
      }
      difference(other) {
        return this.filtered.difference(other);
      }
      equals(other) {
        return this.filtered.equals(other);
      }
      every(callback, subject2, predicate2, object2, graph) {
        return this.filtered.every(callback, subject2, predicate2, object2, graph);
      }
      filter(iteratee) {
        return this.filtered.filter(iteratee);
      }
      forEach(callback, subject2, predicate2, object2, graph) {
        return this.filtered.forEach(callback, subject2, predicate2, object2, graph);
      }
      import(stream) {
        return this.filtered.import(stream);
      }
      intersection(other) {
        return this.filtered.intersection(other);
      }
      map(iteratee) {
        return this.filtered.map(iteratee);
      }
      some(callback, subject2, predicate2, object2, graph) {
        return this.filtered.some(callback, subject2, predicate2, object2, graph);
      }
      toCanonical() {
        return this.filtered.toCanonical();
      }
      toStream() {
        return this._filtered ? this._filtered.toStream() : this.n3Store.match(this.subject, this.predicate, this.object, this.graph);
      }
      union(quads) {
        return this._filtered ? this._filtered.union(quads) : this.n3Store.match(this.subject, this.predicate, this.object, this.graph).addAll(quads);
      }
      toArray() {
        return this._filtered ? this._filtered.toArray() : this.n3Store.getQuads(this.subject, this.predicate, this.object, this.graph);
      }
      reduce(callback, initialValue) {
        return this.filtered.reduce(callback, initialValue);
      }
      toString() {
        return new N3Writer().quadsToString(this);
      }
      add(quad3) {
        return this.filtered.add(quad3);
      }
      delete(quad3) {
        return this.filtered.delete(quad3);
      }
      has(quad3) {
        return this.filtered.has(quad3);
      }
      match(subject2, predicate2, object2, graph) {
        return new _DatasetCoreAndReadableStream(this.filtered, subject2, predicate2, object2, graph, this.options);
      }
      *[Symbol.iterator]() {
        yield* this._filtered || this.n3Store.readQuads(this.subject, this.predicate, this.object, this.graph);
      }
    };
  }
});

// node_modules/n3/src/N3StoreFactory.js
var N3DatasetCoreFactory;
var init_N3StoreFactory = __esm({
  "node_modules/n3/src/N3StoreFactory.js"() {
    "use strict";
    init_N3Store();
    N3DatasetCoreFactory = class {
      dataset(quads) {
        return new N3Store(quads);
      }
    };
  }
});

// node_modules/n3/src/N3Reasoner.js
function getRulesFromDataset(dataset) {
  const rules = [];
  for (const { subject: subject2, object: object2 } of dataset.match(null, N3DataFactory_default.namedNode("http://www.w3.org/2000/10/swap/log#implies"), null, N3DataFactory_default.defaultGraph())) {
    const premise = [...dataset.match(null, null, null, subject2)];
    const conclusion = [...dataset.match(null, null, null, object2)];
    rules.push({ premise, conclusion });
  }
  return rules;
}
function getIndex({ subject: subject2, predicate: predicate2, object: object2 }, set) {
  const s4 = subject2.value || set.has(subject2) || (set.add(subject2), false);
  const p3 = predicate2.value || set.has(predicate2) || (set.add(predicate2), false);
  const o6 = object2.value || set.has(object2) || (set.add(object2), false);
  return !s4 && p3 ? { content: "predicates", value: [predicate2, object2, subject2] } : o6 ? { content: "objects", value: [object2, subject2, predicate2] } : { content: "subjects", value: [subject2, predicate2, object2] };
}
function termEq(t1, t22) {
  if (t1.value === null) {
    t1.value = t22.value;
  }
  return t1.value === t22.value;
}
var N3Reasoner;
var init_N3Reasoner = __esm({
  "node_modules/n3/src/N3Reasoner.js"() {
    "use strict";
    init_N3DataFactory();
    N3Reasoner = class {
      constructor(store) {
        this._store = store;
      }
      _add(subject2, predicate2, object2, graphItem, cb) {
        if (!this._store._addToIndex(graphItem.subjects, subject2, predicate2, object2)) return;
        this._store._addToIndex(graphItem.predicates, predicate2, object2, subject2);
        this._store._addToIndex(graphItem.objects, object2, subject2, predicate2);
        cb();
      }
      // eslint-disable-next-line no-warning-comments
      _evaluatePremise(rule, content, cb, i5 = 0) {
        let v1, v2, value, index1, index2;
        const [val0, val1, val2] = rule.premise[i5].value, index = content[rule.premise[i5].content];
        const v0 = !(value = val0.value);
        for (value in v0 ? index : { [value]: index[value] }) {
          if (index1 = index[value]) {
            if (v0) val0.value = Number(value);
            v1 = !(value = val1.value);
            for (value in v1 ? index1 : { [value]: index1[value] }) {
              if (index2 = index1[value]) {
                if (v1) val1.value = Number(value);
                v2 = !(value = val2.value);
                for (value in v2 ? index2 : { [value]: index2[value] }) {
                  if (v2) val2.value = Number(value);
                  if (i5 === rule.premise.length - 1)
                    rule.conclusion.forEach((c4) => {
                      this._add(c4.subject.value, c4.predicate.value, c4.object.value, content, () => {
                        cb(c4);
                      });
                    });
                  else
                    this._evaluatePremise(rule, content, cb, i5 + 1);
                }
                if (v2) val2.value = null;
              }
            }
            if (v1) val1.value = null;
          }
        }
        if (v0) val0.value = null;
      }
      _evaluateRules(rules, content, cb) {
        for (let i5 = 0; i5 < rules.length; i5++) {
          this._evaluatePremise(rules[i5], content, cb);
        }
      }
      // A naive reasoning algorithm where rules are just applied by repeatedly applying rules
      // until no more evaluations are made
      _reasonGraphNaive(rules, content) {
        const newRules = [];
        function addRule(conclusion) {
          if (conclusion.next)
            conclusion.next.forEach((rule) => {
              newRules.push([conclusion.subject.value, conclusion.predicate.value, conclusion.object.value, rule]);
            });
        }
        const addConclusions = (conclusion) => {
          conclusion.forEach((c4) => {
            this._add(c4.subject.value, c4.predicate.value, c4.object.value, content, () => {
              addRule(c4);
            });
          });
        };
        this._evaluateRules(rules, content, addRule);
        let r5;
        while ((r5 = newRules.pop()) !== void 0) {
          const [subject2, predicate2, object2, rule] = r5;
          const v1 = rule.basePremise.subject.value;
          if (!v1) rule.basePremise.subject.value = subject2;
          const v2 = rule.basePremise.predicate.value;
          if (!v2) rule.basePremise.predicate.value = predicate2;
          const v3 = rule.basePremise.object.value;
          if (!v3) rule.basePremise.object.value = object2;
          if (rule.premise.length === 0) {
            addConclusions(rule.conclusion);
          } else {
            this._evaluatePremise(rule, content, addRule);
          }
          if (!v1) rule.basePremise.subject.value = null;
          if (!v2) rule.basePremise.predicate.value = null;
          if (!v3) rule.basePremise.object.value = null;
        }
      }
      _createRule({ premise, conclusion }) {
        const varMapping = {};
        const toId = (value) => value.termType === "Variable" ? (
          // If the term is a variable, then create an empty object that values can be placed into
          varMapping[value.value] = varMapping[value.value] || {}
        ) : (
          // If the term is not a variable, then set the ID value
          { value: this._store._termToNewNumericId(value) }
        );
        const t4 = (term) => ({ subject: toId(term.subject), predicate: toId(term.predicate), object: toId(term.object) });
        return {
          premise: premise.map((p3) => t4(p3)),
          conclusion: conclusion.map((p3) => t4(p3)),
          variables: Object.values(varMapping)
        };
      }
      reason(rules) {
        if (!Array.isArray(rules)) {
          rules = getRulesFromDataset(rules);
        }
        rules = rules.map((rule) => this._createRule(rule));
        for (const r1 of rules) {
          for (const r22 of rules) {
            for (let i5 = 0; i5 < r22.premise.length; i5++) {
              const p3 = r22.premise[i5];
              for (const c4 of r1.conclusion) {
                if (termEq(p3.subject, c4.subject) && termEq(p3.predicate, c4.predicate) && termEq(p3.object, c4.object)) {
                  const set = /* @__PURE__ */ new Set();
                  const premise = [];
                  p3.subject.value = p3.subject.value || 1;
                  p3.object.value = p3.object.value || 1;
                  p3.predicate.value = p3.predicate.value || 1;
                  for (let j = 0; j < r22.premise.length; j++) {
                    if (j !== i5) {
                      premise.push(getIndex(r22.premise[j], set));
                    }
                  }
                  (c4.next = c4.next || []).push({
                    premise,
                    conclusion: r22.conclusion,
                    // This is a single premise of the form { subject, predicate, object },
                    // which we can use to instantiate the rule using the new data that was emitted
                    basePremise: p3
                  });
                }
                r22.variables.forEach((v2) => {
                  v2.value = null;
                });
              }
            }
          }
        }
        for (const rule of rules) {
          const set = /* @__PURE__ */ new Set();
          rule.premise = rule.premise.map((p3) => getIndex(p3, set));
        }
        const graphs = this._store._getGraphs();
        for (const graphId in graphs) {
          this._reasonGraphNaive(rules, graphs[graphId]);
        }
        this._store._size = null;
      }
    };
  }
});

// node_modules/n3/src/N3StreamParser.js
var import_readable_stream2, N3StreamParser;
var init_N3StreamParser = __esm({
  "node_modules/n3/src/N3StreamParser.js"() {
    "use strict";
    import_readable_stream2 = __toESM(require_browser3());
    init_N3Parser();
    N3StreamParser = class extends import_readable_stream2.Transform {
      constructor(options) {
        super({ decodeStrings: true });
        this._readableState.objectMode = true;
        const parser = new N3Parser(options);
        let onData, onEnd;
        const callbacks = {
          // Handle quads by pushing them down the pipeline
          onQuad: (error, quad3) => {
            error && this.emit("error", error) || quad3 && this.push(quad3);
          },
          // Emit prefixes through the `prefix` event
          onPrefix: (prefix2, uri) => {
            this.emit("prefix", prefix2, uri);
          }
        };
        if (options && options.comments)
          callbacks.onComment = (comment) => {
            this.emit("comment", comment);
          };
        parser.parse({
          on: (event, callback) => {
            switch (event) {
              case "data":
                onData = callback;
                break;
              case "end":
                onEnd = callback;
                break;
            }
          }
        }, callbacks);
        this._transform = (chunk, encoding, done) => {
          onData(chunk);
          done();
        };
        this._flush = (done) => {
          onEnd();
          done();
        };
      }
      // ### Parses a stream of strings
      import(stream) {
        stream.on("data", (chunk) => {
          this.write(chunk);
        });
        stream.on("end", () => {
          this.end();
        });
        stream.on("error", (error) => {
          this.emit("error", error);
        });
        return this;
      }
    };
  }
});

// node_modules/n3/src/N3StreamWriter.js
var import_readable_stream3, N3StreamWriter;
var init_N3StreamWriter = __esm({
  "node_modules/n3/src/N3StreamWriter.js"() {
    "use strict";
    import_readable_stream3 = __toESM(require_browser3());
    init_N3Writer();
    N3StreamWriter = class extends import_readable_stream3.Transform {
      constructor(options) {
        super({ encoding: "utf8", writableObjectMode: true });
        const writer = this._writer = new N3Writer({
          write: (quad3, encoding, callback) => {
            this.push(quad3);
            callback && callback();
          },
          end: (callback) => {
            this.push(null);
            callback && callback();
          }
        }, options);
        this._transform = (quad3, encoding, done) => {
          writer.addQuad(quad3, done);
        };
        this._flush = (done) => {
          writer.end(done);
        };
      }
      // ### Serializes a stream of quads
      import(stream) {
        stream.on("data", (quad3) => {
          this.write(quad3);
        });
        stream.on("end", () => {
          this.end();
        });
        stream.on("error", (error) => {
          this.emit("error", error);
        });
        stream.on("prefix", (prefix2, iri) => {
          this._writer.addPrefix(prefix2, iri);
        });
        return this;
      }
    };
  }
});

// node_modules/n3/src/index.js
var src_exports = {};
__export(src_exports, {
  BaseIRI: () => BaseIRI,
  BlankNode: () => BlankNode,
  DataFactory: () => N3DataFactory_default,
  DefaultGraph: () => DefaultGraph,
  EntityIndex: () => N3EntityIndex,
  Lexer: () => N3Lexer,
  Literal: () => Literal,
  NamedNode: () => NamedNode,
  Parser: () => N3Parser,
  Quad: () => Quad,
  Reasoner: () => N3Reasoner,
  Store: () => N3Store,
  StoreFactory: () => N3DatasetCoreFactory,
  StreamParser: () => N3StreamParser,
  StreamWriter: () => N3StreamWriter,
  Term: () => Term,
  Triple: () => Quad,
  Util: () => N3Util_exports,
  Variable: () => Variable,
  Writer: () => N3Writer,
  default: () => src_default,
  getRulesFromDataset: () => getRulesFromDataset,
  termFromId: () => termFromId,
  termToId: () => termToId
});
var src_default;
var init_src = __esm({
  "node_modules/n3/src/index.js"() {
    "use strict";
    init_N3Lexer();
    init_N3Parser();
    init_N3Writer();
    init_N3Store();
    init_N3StoreFactory();
    init_N3Reasoner();
    init_N3StreamParser();
    init_N3StreamWriter();
    init_N3Util();
    init_BaseIRI();
    init_N3DataFactory();
    src_default = {
      Lexer: N3Lexer,
      Parser: N3Parser,
      Writer: N3Writer,
      Store: N3Store,
      StoreFactory: N3DatasetCoreFactory,
      EntityIndex: N3EntityIndex,
      StreamParser: N3StreamParser,
      StreamWriter: N3StreamWriter,
      Util: N3Util_exports,
      Reasoner: N3Reasoner,
      BaseIRI,
      DataFactory: N3DataFactory_default,
      Term,
      NamedNode,
      Literal,
      BlankNode,
      Variable,
      DefaultGraph,
      Quad,
      Triple: Quad,
      termFromId,
      termToId
    };
  }
});

// node_modules/rdf-lens/dist/lens.js
function termToString(term) {
  if (term.termType === "NamedNode") {
    return "<" + term.value + ">";
  }
  if (term.termType === "BlankNode") {
    return "_:" + term.value;
  }
  return JSON.stringify(term.value);
}
function createContext() {
  const ctx = {
    stateMap: /* @__PURE__ */ new Map(),
    lineage: []
  };
  const clone = () => ({
    clone,
    stateMap: ctx.stateMap,
    lineage: ctx.lineage.slice()
  });
  return Object.assign(ctx, { clone });
}
function deconstructList(x2) {
  if (x2.length == 1) {
    return x2[0];
  }
  return x2;
}
function asList(x2) {
  if (Array.isArray(x2))
    return x2;
  return [x2];
}
function pred(pred2) {
  return new BasicLensM(({ quads, id }) => {
    const out = quads.filter((q) => q.subject.equals(id) && (!pred2 || q.predicate.equals(pred2)));
    return out.map((q) => ({ quads, id: q.object }));
  }).named("pred", pred2 && termToString(pred2));
}
function invPred(pred2) {
  return new BasicLensM(({ quads, id }) => {
    const out = quads.filter((q) => q.object.equals(id) && (!pred2 || q.predicate.equals(pred2)));
    return out.map((q) => ({ quads, id: q.subject }));
  }).named("invPred", pred2 && termToString(pred2));
}
function predTriple(pred2) {
  return new BasicLensM(({ quads, id }) => {
    const out = quads.filter((q) => q.subject.equals(id) && (!pred2 || q.predicate.equals(pred2)));
    return out.map((q) => ({ quads, id: q }));
  }).named("predTriple");
}
function unique() {
  return new BasicLensM((qs) => {
    const literals = {};
    const named = {};
    const blank = {};
    for (const q of qs) {
      const ty = q.id.termType;
      if (ty === "Literal")
        literals[q.id.value] = q;
      if (ty === "NamedNode")
        named[q.id.value] = q;
      if (ty === "BlankNode")
        blank[q.id.value] = q;
    }
    const out = [];
    out.push(...Object.values(literals));
    out.push(...Object.values(named));
    out.push(...Object.values(blank));
    return out;
  }).named("unique");
}
function subjects() {
  return new BasicLensM((quads) => {
    return quads.map((x2) => ({ id: x2.subject, quads }));
  }).named("subjects");
}
function match(subject2, predicate2, object2) {
  return new BasicLensM((quads) => {
    return quads.filter((x2) => (!subject2 || x2.subject.equals(subject2)) && (!predicate2 || x2.predicate.equals(predicate2)) && (!object2 || x2.object.equals(object2))).map((id) => ({ id, quads }));
  }).named("match", { subject: subject2 && termToString(subject2), predicate: predicate2 && termToString(predicate2), object: object2 && termToString(object2) });
}
function empty() {
  return new BasicLens((x2) => x2);
}
var LensError, BasicLens, BasicLensM, subject, predicate, object;
var init_lens = __esm({
  "node_modules/rdf-lens/dist/lens.js"() {
    "use strict";
    LensError = class extends Error {
      constructor(message, lineage) {
        super(message);
        __publicField(this, "lineage");
        this.message = message;
        this.lineage = lineage;
      }
    };
    BasicLens = class _BasicLens {
      constructor(execute) {
        __publicField(this, "_exec");
        __publicField(this, "index");
        this._exec = execute;
      }
      named(name, opts, cb) {
        return new _BasicLens((c4, ctx) => {
          let extras = asList(opts) || [];
          if (cb) {
            extras = [...extras, ...asList(cb(c4))];
          }
          ctx.lineage.push({ name, opts: deconstructList(extras) });
          return this.execute(c4, ctx);
        });
      }
      asMulti() {
        return new BasicLensM((c4, ctx) => {
          const out = this.execute(c4, ctx);
          return out;
        });
      }
      and(...and) {
        return new _BasicLens((c4, ctx) => {
          const a3 = this.execute(c4, ctx);
          const rest = and.map((x2) => x2.execute(c4, ctx));
          return [a3, ...rest];
        });
      }
      orM(...others) {
        return new BasicLensM((c4, ctx) => {
          const all = [this, ...others];
          return all.flatMap((x2) => {
            try {
              return [x2.execute(c4, ctx.clone())];
            } catch (ex) {
              return [];
            }
          });
        });
      }
      or(...others) {
        return new _BasicLens((c4, ctx) => {
          const errors = [];
          try {
            return this.execute(c4, ctx);
          } catch (ex) {
            errors.push(ex);
            for (let i5 = 0; i5 < others.length; i5++) {
              try {
                return others[i5].execute(c4, ctx.clone());
              } catch (ex2) {
                errors.push(ex2);
              }
            }
          }
          throw errors;
        });
      }
      map(fn) {
        return new _BasicLens((c4, ctx) => {
          const a3 = this.execute(c4, ctx);
          return fn(a3, ctx);
        });
      }
      then(next) {
        return new _BasicLens((c4, ctx) => {
          const a3 = this.execute(c4, ctx);
          return next.execute(a3, ctx);
        });
      }
      execute(container, ctx = createContext()) {
        return this._exec(container, ctx);
      }
    };
    BasicLensM = class _BasicLensM extends BasicLens {
      named(name, opts, cb) {
        return new _BasicLensM((c4, ctx) => {
          let extras = asList(opts) || [];
          if (cb) {
            extras = [...extras, ...asList(cb(c4))];
          }
          ctx.lineage.push({ name, opts: deconstructList(extras) });
          return this.execute(c4, ctx);
        });
      }
      one(def) {
        return new BasicLens((c4, ctx) => {
          const qs = this.execute(c4, ctx);
          return qs[0] || def;
        });
      }
      expectOne() {
        return new BasicLens((c4, ctx) => {
          const qs = this.execute(c4, ctx);
          if (qs.length < 1)
            throw new LensError("Expected one, found none", ctx.lineage.slice());
          return qs[0];
        });
      }
      thenAll(next) {
        return new _BasicLensM((c4, ctx) => {
          const qs = this.execute(c4, ctx.clone());
          return qs.map((x2) => next.execute(x2, ctx.clone()));
        });
      }
      thenSome(next) {
        return new _BasicLensM((c4, ctx) => {
          const qs = this.execute(c4, ctx.clone());
          return qs.flatMap((x2) => {
            try {
              const o6 = next.execute(x2, ctx.clone());
              return [o6];
            } catch (ex) {
              return [];
            }
          });
        });
      }
      thenFlat(next) {
        return new _BasicLensM((c4, ctx) => {
          const qs = this.execute(c4, ctx.clone());
          return qs.flatMap((x2) => next.execute(x2, ctx.clone()));
        });
      }
      mapAll(fn) {
        return new _BasicLensM((c4, ctx) => {
          const qs = this.execute(c4, ctx);
          return qs.map((x2) => fn(x2, ctx));
        });
      }
      orAll(...others) {
        return new _BasicLensM((c4, ctx) => {
          const out = [];
          try {
            out.push(...this.execute(c4, ctx.clone()));
          } catch (ex) {
          }
          for (let i5 = 0; i5 < others.length; i5++) {
            try {
              out.push(...others[i5].execute(c4, ctx.clone()));
            } catch (ex) {
            }
          }
          return out;
        });
      }
      filter(fn) {
        return new _BasicLensM((c4, ctx) => {
          return this.execute(c4, ctx).filter(fn);
        });
      }
      reduce(lens, start) {
        return new BasicLens((c4, ctx) => {
          const st = this.and(start).map(([ts, f3]) => {
            return ts.reduce((acc, v2) => lens.execute([v2, acc], ctx), f3);
          });
          return st.execute(c4, ctx);
        });
      }
    };
    subject = new BasicLens(({ id, quads }) => ({
      id: id.subject,
      quads
    })).named("subject");
    predicate = new BasicLens(({ id, quads }) => ({
      id: id.predicate,
      quads
    })).named("predicate");
    object = new BasicLens(({ id, quads }) => ({
      id: id.object,
      quads
    })).named("object");
  }
});

// node_modules/@treecg/types/dist/lib/Bucketizer.js
var require_Bucketizer = __commonJS({
  "node_modules/@treecg/types/dist/lib/Bucketizer.js"(exports) {
    "use strict";
    exports.__esModule = true;
  }
});

// node_modules/@treecg/types/dist/lib/BucketizerOptions.js
var require_BucketizerOptions = __commonJS({
  "node_modules/@treecg/types/dist/lib/BucketizerOptions.js"(exports) {
    "use strict";
    exports.__esModule = true;
  }
});

// node_modules/@treecg/types/dist/lib/Fragment.js
var require_Fragment = __commonJS({
  "node_modules/@treecg/types/dist/lib/Fragment.js"(exports) {
    "use strict";
    exports.__esModule = true;
  }
});

// node_modules/@treecg/types/dist/lib/Member.js
var require_Member = __commonJS({
  "node_modules/@treecg/types/dist/lib/Member.js"(exports) {
    "use strict";
    exports.__esModule = true;
  }
});

// node_modules/@treecg/types/dist/lib/RelationParameters.js
var require_RelationParameters = __commonJS({
  "node_modules/@treecg/types/dist/lib/RelationParameters.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.RelationType = void 0;
    var RelationType;
    (function(RelationType2) {
      RelationType2["Relation"] = "https://w3id.org/tree#Relation";
      RelationType2["Substring"] = "https://w3id.org/tree#SubstringRelation";
      RelationType2["Prefix"] = "https://w3id.org/tree#PrefixRelation";
      RelationType2["Suffix"] = "https://w3id.org/tree#SuffixRelation";
      RelationType2["GreaterThan"] = "https://w3id.org/tree#GreaterThanRelation";
      RelationType2["GreaterThanOrEqualTo"] = "https://w3id.org/tree#GreaterThanOrEqualToRelation";
      RelationType2["LessThan"] = "https://w3id.org/tree#LessThanRelation";
      RelationType2["LessThanOrEqualTo"] = "https://w3id.org/tree#LessThanOrEqualToRelation";
      RelationType2["EqualThan"] = "https://w3id.org/tree#EqualThanRelation";
      RelationType2["GeospatiallyContains"] = "https://w3id.org/tree#GeospatiallyContainsRelation";
    })(RelationType = exports.RelationType || (exports.RelationType = {}));
  }
});

// node_modules/loglevel/lib/loglevel.js
var require_loglevel = __commonJS({
  "node_modules/loglevel/lib/loglevel.js"(exports, module) {
    "use strict";
    (function(root, definition) {
      "use strict";
      if (typeof define === "function" && define.amd) {
        define(definition);
      } else if (typeof module === "object" && module.exports) {
        module.exports = definition();
      } else {
        root.log = definition();
      }
    })(exports, function() {
      "use strict";
      var noop2 = function() {
      };
      var undefinedType = "undefined";
      var isIE = typeof window !== undefinedType && typeof window.navigator !== undefinedType && /Trident\/|MSIE /.test(window.navigator.userAgent);
      var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
      ];
      var _loggersByName = {};
      var defaultLogger = null;
      function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === "function") {
          return method.bind(obj);
        } else {
          try {
            return Function.prototype.bind.call(method, obj);
          } catch (e5) {
            return function() {
              return Function.prototype.apply.apply(method, [obj, arguments]);
            };
          }
        }
      }
      function traceForIE() {
        if (console.log) {
          if (console.log.apply) {
            console.log.apply(console, arguments);
          } else {
            Function.prototype.apply.apply(console.log, [console, arguments]);
          }
        }
        if (console.trace) console.trace();
      }
      function realMethod(methodName) {
        if (methodName === "debug") {
          methodName = "log";
        }
        if (typeof console === undefinedType) {
          return false;
        } else if (methodName === "trace" && isIE) {
          return traceForIE;
        } else if (console[methodName] !== void 0) {
          return bindMethod(console, methodName);
        } else if (console.log !== void 0) {
          return bindMethod(console, "log");
        } else {
          return noop2;
        }
      }
      function replaceLoggingMethods() {
        var level = this.getLevel();
        for (var i5 = 0; i5 < logMethods.length; i5++) {
          var methodName = logMethods[i5];
          this[methodName] = i5 < level ? noop2 : this.methodFactory(methodName, level, this.name);
        }
        this.log = this.debug;
        if (typeof console === undefinedType && level < this.levels.SILENT) {
          return "No console available for logging";
        }
      }
      function enableLoggingWhenConsoleArrives(methodName) {
        return function() {
          if (typeof console !== undefinedType) {
            replaceLoggingMethods.call(this);
            this[methodName].apply(this, arguments);
          }
        };
      }
      function defaultMethodFactory(methodName, _level, _loggerName) {
        return realMethod(methodName) || enableLoggingWhenConsoleArrives.apply(this, arguments);
      }
      function Logger(name, factory) {
        var self2 = this;
        var inheritedLevel;
        var defaultLevel;
        var userLevel;
        var storageKey = "loglevel";
        if (typeof name === "string") {
          storageKey += ":" + name;
        } else if (typeof name === "symbol") {
          storageKey = void 0;
        }
        function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || "silent").toUpperCase();
          if (typeof window === undefinedType || !storageKey) return;
          try {
            window.localStorage[storageKey] = levelName;
            return;
          } catch (ignore) {
          }
          try {
            window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {
          }
        }
        function getPersistedLevel() {
          var storedLevel;
          if (typeof window === undefinedType || !storageKey) return;
          try {
            storedLevel = window.localStorage[storageKey];
          } catch (ignore) {
          }
          if (typeof storedLevel === undefinedType) {
            try {
              var cookie = window.document.cookie;
              var cookieName = encodeURIComponent(storageKey);
              var location = cookie.indexOf(cookieName + "=");
              if (location !== -1) {
                storedLevel = /^([^;]+)/.exec(
                  cookie.slice(location + cookieName.length + 1)
                )[1];
              }
            } catch (ignore) {
            }
          }
          if (self2.levels[storedLevel] === void 0) {
            storedLevel = void 0;
          }
          return storedLevel;
        }
        function clearPersistedLevel() {
          if (typeof window === undefinedType || !storageKey) return;
          try {
            window.localStorage.removeItem(storageKey);
          } catch (ignore) {
          }
          try {
            window.document.cookie = encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          } catch (ignore) {
          }
        }
        function normalizeLevel(input) {
          var level = input;
          if (typeof level === "string" && self2.levels[level.toUpperCase()] !== void 0) {
            level = self2.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self2.levels.SILENT) {
            return level;
          } else {
            throw new TypeError("log.setLevel() called with invalid level: " + input);
          }
        }
        self2.name = name;
        self2.levels = {
          "TRACE": 0,
          "DEBUG": 1,
          "INFO": 2,
          "WARN": 3,
          "ERROR": 4,
          "SILENT": 5
        };
        self2.methodFactory = factory || defaultMethodFactory;
        self2.getLevel = function() {
          if (userLevel != null) {
            return userLevel;
          } else if (defaultLevel != null) {
            return defaultLevel;
          } else {
            return inheritedLevel;
          }
        };
        self2.setLevel = function(level, persist) {
          userLevel = normalizeLevel(level);
          if (persist !== false) {
            persistLevelIfPossible(userLevel);
          }
          return replaceLoggingMethods.call(self2);
        };
        self2.setDefaultLevel = function(level) {
          defaultLevel = normalizeLevel(level);
          if (!getPersistedLevel()) {
            self2.setLevel(level, false);
          }
        };
        self2.resetLevel = function() {
          userLevel = null;
          clearPersistedLevel();
          replaceLoggingMethods.call(self2);
        };
        self2.enableAll = function(persist) {
          self2.setLevel(self2.levels.TRACE, persist);
        };
        self2.disableAll = function(persist) {
          self2.setLevel(self2.levels.SILENT, persist);
        };
        self2.rebuild = function() {
          if (defaultLogger !== self2) {
            inheritedLevel = normalizeLevel(defaultLogger.getLevel());
          }
          replaceLoggingMethods.call(self2);
          if (defaultLogger === self2) {
            for (var childName in _loggersByName) {
              _loggersByName[childName].rebuild();
            }
          }
        };
        inheritedLevel = normalizeLevel(
          defaultLogger ? defaultLogger.getLevel() : "WARN"
        );
        var initialLevel = getPersistedLevel();
        if (initialLevel != null) {
          userLevel = normalizeLevel(initialLevel);
        }
        replaceLoggingMethods.call(self2);
      }
      defaultLogger = new Logger();
      defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "symbol" && typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }
        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name,
            defaultLogger.methodFactory
          );
        }
        return logger;
      };
      var _log = typeof window !== undefinedType ? window.log : void 0;
      defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType && window.log === defaultLogger) {
          window.log = _log;
        }
        return defaultLogger;
      };
      defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
      };
      defaultLogger["default"] = defaultLogger;
      return defaultLogger;
    });
  }
});

// node_modules/loglevel-plugin-prefix/lib/loglevel-plugin-prefix.js
var require_loglevel_plugin_prefix = __commonJS({
  "node_modules/loglevel-plugin-prefix/lib/loglevel-plugin-prefix.js"(exports, module) {
    "use strict";
    (function(root, factory) {
      if (typeof define === "function" && define.amd) {
        define(factory);
      } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.prefix = factory(root);
      }
    })(exports, function(root) {
      "use strict";
      var merge2 = function(target) {
        var i5 = 1;
        var length = arguments.length;
        var key;
        for (; i5 < length; i5++) {
          for (key in arguments[i5]) {
            if (Object.prototype.hasOwnProperty.call(arguments[i5], key)) {
              target[key] = arguments[i5][key];
            }
          }
        }
        return target;
      };
      var defaults = {
        template: "[%t] %l:",
        levelFormatter: function(level) {
          return level.toUpperCase();
        },
        nameFormatter: function(name) {
          return name || "root";
        },
        timestampFormatter: function(date) {
          return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
        },
        format: void 0
      };
      var loglevel;
      var configs = {};
      var reg = function(rootLogger) {
        if (!rootLogger || !rootLogger.getLogger) {
          throw new TypeError("Argument is not a root logger");
        }
        loglevel = rootLogger;
      };
      var apply = function(logger, config) {
        if (!logger || !logger.setLevel) {
          throw new TypeError("Argument is not a logger");
        }
        var originalFactory = logger.methodFactory;
        var name = logger.name || "";
        var parent = configs[name] || configs[""] || defaults;
        function methodFactory(methodName, logLevel, loggerName) {
          var originalMethod = originalFactory(methodName, logLevel, loggerName);
          var options = configs[loggerName] || configs[""];
          var hasTimestamp = options.template.indexOf("%t") !== -1;
          var hasLevel = options.template.indexOf("%l") !== -1;
          var hasName = options.template.indexOf("%n") !== -1;
          return function() {
            var content = "";
            var length = arguments.length;
            var args = Array(length);
            var key = 0;
            for (; key < length; key++) {
              args[key] = arguments[key];
            }
            if (name || !configs[loggerName]) {
              var timestamp = options.timestampFormatter(/* @__PURE__ */ new Date());
              var level = options.levelFormatter(methodName);
              var lname = options.nameFormatter(loggerName);
              if (options.format) {
                content += options.format(level, lname, timestamp);
              } else {
                content += options.template;
                if (hasTimestamp) {
                  content = content.replace(/%t/, timestamp);
                }
                if (hasLevel) content = content.replace(/%l/, level);
                if (hasName) content = content.replace(/%n/, lname);
              }
              if (args.length && typeof args[0] === "string") {
                args[0] = content + " " + args[0];
              } else {
                args.unshift(content);
              }
            }
            originalMethod.apply(void 0, args);
          };
        }
        if (!configs[name]) {
          logger.methodFactory = methodFactory;
        }
        config = config || {};
        if (config.template) config.format = void 0;
        configs[name] = merge2({}, parent, config);
        logger.setLevel(logger.getLevel());
        if (!loglevel) {
          logger.warn(
            "It is necessary to call the function reg() of loglevel-plugin-prefix before calling apply. From the next release, it will throw an error. See more: https://github.com/kutuluk/loglevel-plugin-prefix/blob/master/README.md"
          );
        }
        return logger;
      };
      var api = {
        reg,
        apply
      };
      var save;
      if (root) {
        save = root.prefix;
        api.noConflict = function() {
          if (root.prefix === api) {
            root.prefix = save;
          }
          return api;
        };
      }
      return api;
    });
  }
});

// node_modules/@treecg/types/dist/lib/utils/Logger-Browser.js
var require_Logger_Browser = __commonJS({
  "node_modules/@treecg/types/dist/lib/utils/Logger-Browser.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.getLogger = exports.LoggerBrowser = void 0;
    var log = require_loglevel();
    var prefix2 = require_loglevel_plugin_prefix();
    var LoggerBrowser = (
      /** @class */
      (function() {
        function LoggerBrowser2(loggable, level) {
          var label = typeof loggable === "string" ? loggable : loggable.constructor.name;
          level = level && isLogLevel(level) ? level : "info";
          log.setDefaultLevel("info");
          if (level && isLogLevel(level)) {
            log.setLevel(level);
          }
          prefix2.reg(log);
          prefix2.apply(log, {
            template: "%t [%n] %l:",
            levelFormatter: function(level2) {
              return level2;
            },
            nameFormatter: function(name) {
              return name || "global";
            },
            timestampFormatter: function(date) {
              return date.toISOString();
            }
          });
          this.logger = log.getLogger(label);
        }
        LoggerBrowser2.prototype.error = function(message) {
          this.logger.error(message);
        };
        LoggerBrowser2.prototype.warn = function(message) {
          this.logger.warn(message);
        };
        LoggerBrowser2.prototype.info = function(message) {
          this.logger.info(message);
        };
        LoggerBrowser2.prototype.debug = function(message) {
          this.logger.debug(message);
        };
        LoggerBrowser2.prototype.trace = function(message) {
          this.logger.trace(message);
        };
        return LoggerBrowser2;
      })()
    );
    exports.LoggerBrowser = LoggerBrowser;
    function isLogLevel(value) {
      value = value.toUpperCase();
      return Object.keys(log.levels).includes(value);
    }
    var getLogger = function(name) {
      return new LoggerBrowser(name, "info");
    };
    exports.getLogger = getLogger;
  }
});

// node_modules/@treecg/types/node_modules/rdf-data-factory/lib/BlankNode.js
var require_BlankNode = __commonJS({
  "node_modules/@treecg/types/node_modules/rdf-data-factory/lib/BlankNode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BlankNode = void 0;
    var BlankNode2 = class {
      constructor(value) {
        this.termType = "BlankNode";
        this.value = value;
      }
      equals(other) {
        return !!other && other.termType === "BlankNode" && other.value === this.value;
      }
    };
    exports.BlankNode = BlankNode2;
  }
});

// node_modules/@treecg/types/node_modules/rdf-data-factory/lib/DefaultGraph.js
var require_DefaultGraph = __commonJS({
  "node_modules/@treecg/types/node_modules/rdf-data-factory/lib/DefaultGraph.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultGraph = void 0;
    var DefaultGraph2 = class {
      constructor() {
        this.termType = "DefaultGraph";
        this.value = "";
      }
      equals(other) {
        return !!other && other.termType === "DefaultGraph";
      }
    };
    exports.DefaultGraph = DefaultGraph2;
    DefaultGraph2.INSTANCE = new DefaultGraph2();
  }
});

// node_modules/@treecg/types/node_modules/rdf-data-factory/lib/NamedNode.js
var require_NamedNode = __commonJS({
  "node_modules/@treecg/types/node_modules/rdf-data-factory/lib/NamedNode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NamedNode = void 0;
    var NamedNode3 = class {
      constructor(value) {
        this.termType = "NamedNode";
        this.value = value;
      }
      equals(other) {
        return !!other && other.termType === "NamedNode" && other.value === this.value;
      }
    };
    exports.NamedNode = NamedNode3;
  }
});

// node_modules/@treecg/types/node_modules/rdf-data-factory/lib/Literal.js
var require_Literal = __commonJS({
  "node_modules/@treecg/types/node_modules/rdf-data-factory/lib/Literal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Literal = void 0;
    var NamedNode_1 = require_NamedNode();
    var Literal2 = class _Literal {
      constructor(value, languageOrDatatype) {
        this.termType = "Literal";
        this.value = value;
        if (typeof languageOrDatatype === "string") {
          this.language = languageOrDatatype;
          this.datatype = _Literal.RDF_LANGUAGE_STRING;
        } else if (languageOrDatatype) {
          this.language = "";
          this.datatype = languageOrDatatype;
        } else {
          this.language = "";
          this.datatype = _Literal.XSD_STRING;
        }
      }
      equals(other) {
        return !!other && other.termType === "Literal" && other.value === this.value && other.language === this.language && this.datatype.equals(other.datatype);
      }
    };
    exports.Literal = Literal2;
    Literal2.RDF_LANGUAGE_STRING = new NamedNode_1.NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
    Literal2.XSD_STRING = new NamedNode_1.NamedNode("http://www.w3.org/2001/XMLSchema#string");
  }
});

// node_modules/@treecg/types/node_modules/rdf-data-factory/lib/Quad.js
var require_Quad = __commonJS({
  "node_modules/@treecg/types/node_modules/rdf-data-factory/lib/Quad.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Quad = void 0;
    var Quad2 = class {
      constructor(subject2, predicate2, object2, graph) {
        this.termType = "Quad";
        this.value = "";
        this.subject = subject2;
        this.predicate = predicate2;
        this.object = object2;
        this.graph = graph;
      }
      equals(other) {
        return !!other && (other.termType === "Quad" || !other.termType) && this.subject.equals(other.subject) && this.predicate.equals(other.predicate) && this.object.equals(other.object) && this.graph.equals(other.graph);
      }
    };
    exports.Quad = Quad2;
  }
});

// node_modules/@treecg/types/node_modules/rdf-data-factory/lib/Variable.js
var require_Variable = __commonJS({
  "node_modules/@treecg/types/node_modules/rdf-data-factory/lib/Variable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Variable = void 0;
    var Variable2 = class {
      constructor(value) {
        this.termType = "Variable";
        this.value = value;
      }
      equals(other) {
        return !!other && other.termType === "Variable" && other.value === this.value;
      }
    };
    exports.Variable = Variable2;
  }
});

// node_modules/@treecg/types/node_modules/rdf-data-factory/lib/DataFactory.js
var require_DataFactory = __commonJS({
  "node_modules/@treecg/types/node_modules/rdf-data-factory/lib/DataFactory.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataFactory = void 0;
    var BlankNode_1 = require_BlankNode();
    var DefaultGraph_1 = require_DefaultGraph();
    var Literal_1 = require_Literal();
    var NamedNode_1 = require_NamedNode();
    var Quad_1 = require_Quad();
    var Variable_1 = require_Variable();
    var dataFactoryCounter = 0;
    var DataFactory3 = class {
      constructor(options) {
        this.blankNodeCounter = 0;
        options = options || {};
        this.blankNodePrefix = options.blankNodePrefix || `df_${dataFactoryCounter++}_`;
      }
      /**
       * @param value The IRI for the named node.
       * @return A new instance of NamedNode.
       * @see NamedNode
       */
      namedNode(value) {
        return new NamedNode_1.NamedNode(value);
      }
      /**
       * @param value The optional blank node identifier.
       * @return A new instance of BlankNode.
       *         If the `value` parameter is undefined a new identifier
       *         for the blank node is generated for each call.
       * @see BlankNode
       */
      blankNode(value) {
        return new BlankNode_1.BlankNode(value || `${this.blankNodePrefix}${this.blankNodeCounter++}`);
      }
      /**
       * @param value              The literal value.
       * @param languageOrDatatype The optional language or datatype.
       *                           If `languageOrDatatype` is a NamedNode,
       *                           then it is used for the value of `NamedNode.datatype`.
       *                           Otherwise `languageOrDatatype` is used for the value
       *                           of `NamedNode.language`.
       * @return A new instance of Literal.
       * @see Literal
       */
      literal(value, languageOrDatatype) {
        return new Literal_1.Literal(value, languageOrDatatype);
      }
      /**
       * This method is optional.
       * @param value The variable name
       * @return A new instance of Variable.
       * @see Variable
       */
      variable(value) {
        return new Variable_1.Variable(value);
      }
      /**
       * @return An instance of DefaultGraph.
       */
      defaultGraph() {
        return DefaultGraph_1.DefaultGraph.INSTANCE;
      }
      /**
       * @param subject   The quad subject term.
       * @param predicate The quad predicate term.
       * @param object    The quad object term.
       * @param graph     The quad graph term.
       * @return A new instance of Quad.
       * @see Quad
       */
      quad(subject2, predicate2, object2, graph) {
        return new Quad_1.Quad(subject2, predicate2, object2, graph || this.defaultGraph());
      }
      /**
       * Create a deep copy of the given term using this data factory.
       * @param original An RDF term.
       * @return A deep copy of the given term.
       */
      fromTerm(original) {
        switch (original.termType) {
          case "NamedNode":
            return this.namedNode(original.value);
          case "BlankNode":
            return this.blankNode(original.value);
          case "Literal":
            if (original.language) {
              return this.literal(original.value, original.language);
            }
            if (!original.datatype.equals(Literal_1.Literal.XSD_STRING)) {
              return this.literal(original.value, this.fromTerm(original.datatype));
            }
            return this.literal(original.value);
          case "Variable":
            return this.variable(original.value);
          case "DefaultGraph":
            return this.defaultGraph();
          case "Quad":
            return this.quad(this.fromTerm(original.subject), this.fromTerm(original.predicate), this.fromTerm(original.object), this.fromTerm(original.graph));
        }
      }
      /**
       * Create a deep copy of the given quad using this data factory.
       * @param original An RDF quad.
       * @return A deep copy of the given quad.
       */
      fromQuad(original) {
        return this.fromTerm(original);
      }
      /**
       * Reset the internal blank node counter.
       */
      resetBlankNodeCounter() {
        this.blankNodeCounter = 0;
      }
    };
    exports.DataFactory = DataFactory3;
  }
});

// node_modules/@treecg/types/node_modules/rdf-data-factory/index.js
var require_rdf_data_factory = __commonJS({
  "node_modules/@treecg/types/node_modules/rdf-data-factory/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o6, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      var desc = Object.getOwnPropertyDescriptor(m2, k2);
      if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m2[k2];
        } };
      }
      Object.defineProperty(o6, k22, desc);
    }) : (function(o6, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      o6[k22] = m2[k2];
    }));
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p3 in m2) if (p3 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p3)) __createBinding(exports2, m2, p3);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_BlankNode(), exports);
    __exportStar(require_DataFactory(), exports);
    __exportStar(require_DefaultGraph(), exports);
    __exportStar(require_Literal(), exports);
    __exportStar(require_NamedNode(), exports);
    __exportStar(require_Quad(), exports);
    __exportStar(require_Variable(), exports);
  }
});

// node_modules/@treecg/types/dist/lib/Vocabularies.js
var require_Vocabularies = __commonJS({
  "node_modules/@treecg/types/dist/lib/Vocabularies.js"(exports) {
    "use strict";
    var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
      if (pack || arguments.length === 2) for (var i5 = 0, l3 = from.length, ar; i5 < l3; i5++) {
        if (ar || !(i5 in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i5);
          ar[i5] = from[i5];
        }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    exports.__esModule = true;
    exports.EX = exports.SHACL = exports.VOID = exports.PPLAN = exports.PROV = exports.SDS = exports.LDES = exports.TREE = exports.XSD = exports.RDFS = exports.RDF = exports.FOAF = exports.DC = exports.createUriAndTermNamespace = exports.createTermNamespace = exports.createUriNamespace = exports.createNamespace = void 0;
    var rdf_data_factory_1 = require_rdf_data_factory();
    var factory = new rdf_data_factory_1.DataFactory();
    function createNamespace(baseUri, toValue) {
      var localNames = [];
      for (var _i = 2; _i < arguments.length; _i++) {
        localNames[_i - 2] = arguments[_i];
      }
      var expanded = {};
      expanded.namespace = toValue(baseUri);
      expanded.custom = function(v2) {
        return toValue(baseUri + v2);
      };
      for (var _a = 0, localNames_1 = localNames; _a < localNames_1.length; _a++) {
        var localName = localNames_1[_a];
        expanded[localName] = toValue("".concat(baseUri).concat(localName));
      }
      return expanded;
    }
    exports.createNamespace = createNamespace;
    function createUriNamespace(baseUri) {
      var localNames = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        localNames[_i - 1] = arguments[_i];
      }
      return createNamespace.apply(void 0, __spreadArray([baseUri, function(expanded) {
        return expanded;
      }], localNames, false));
    }
    exports.createUriNamespace = createUriNamespace;
    function createTermNamespace2(baseUri) {
      var localNames = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        localNames[_i - 1] = arguments[_i];
      }
      return createNamespace.apply(void 0, __spreadArray([baseUri, factory.namedNode], localNames, false));
    }
    exports.createTermNamespace = createTermNamespace2;
    function createUriAndTermNamespace2(baseUri) {
      var localNames = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        localNames[_i - 1] = arguments[_i];
      }
      return Object.assign(createUriNamespace.apply(void 0, __spreadArray([baseUri], localNames, false)), { terms: createTermNamespace2.apply(void 0, __spreadArray([baseUri], localNames, false)) });
    }
    exports.createUriAndTermNamespace = createUriAndTermNamespace2;
    exports.DC = createUriAndTermNamespace2("http://purl.org/dc/terms/", "description", "modified", "title");
    exports.FOAF = createUriAndTermNamespace2("http://xmlns.com/foaf/0.1/", "Agent");
    exports.RDF = createUriAndTermNamespace2("http://www.w3.org/1999/02/22-rdf-syntax-ns#", "type", "Class", "Property", "nil", "rest", "first");
    exports.RDFS = createUriAndTermNamespace2("http://www.w3.org/2000/01/rdf-schema#", "label", "comment", "domain", "range", "isDefinedBy", "Class", "subClassOf");
    exports.XSD = createUriAndTermNamespace2("http://www.w3.org/2001/XMLSchema#", "dateTime", "integer", "string");
    exports.TREE = createUriAndTermNamespace2("https://w3id.org/tree#", "Collection", "Relation", "Node", "Member", "member", "view", "value", "relation", "PrefixRelation", "SubstringRelation", "SuffixRelation", "GreaterThanRelation", "GreaterThanOrEqualToRelation", "LessThanRelation", "LessThanOrEqualToRelation", "EqualToRelation", "GeospatiallyContainsRelation", "path", "node", "shape", "search", "ConditionalImport", "import", "importStream", "remainingItems", "zoom", "latitudeTile", "longitudeTile");
    exports.LDES = createUriAndTermNamespace2("https://w3id.org/ldes#", "EventStream", "timestampPath", "versionOfPath", "DurationAgoPolicy", "Bucketization", "retentionPolicy", "amount", "bucket", "bucketProperty", "bucketType", "LatestVersionSubset", "BucketizeStrategy");
    exports.SDS = createUriAndTermNamespace2("https://w3id.org/sds#", "Member", "Record", "ImmutableMember", "shape", "carries", "dataset", "Stream", "payload", "bucket", "relationType", "relationBucket", "relationValue", "relationPath", "stream", "relation");
    exports.PROV = createUriAndTermNamespace2("http://www.w3.org/ns/prov#", "used", "startedAtTime", "wasGeneratedBy");
    exports.PPLAN = createUriAndTermNamespace2("http://purl.org/net/p-plan#", "Activity");
    exports.VOID = createUriAndTermNamespace2("http://rdfs.org/ns/void#", "Dataset", "DatasetDescription", "Linkset", "TechnicalFeature", "feature", "sparqlEndpoint", "dataDump", "rootResource", "exampleResource", "uriLookupEndpoint", "openSearchDescription", "uriSpace", "uriRegexPattern", "vocabulary", "subset", "propertyPartition", "triples", "entities", "class", "classes", "classPartition", "property", "properties", "distinctSubjects", "distinctObjects", "documents", "target", "subjectsTarget", "objectsTarget", "linkPredicate", "inDataset");
    exports.SHACL = createUriAndTermNamespace2("http://www.w3.org/ns/shacl#", "NodeShape", "targetClass", "property", "path", "name", "alternativePath", "datatype", "nodeKind", "pattern", "flags", "minExclusive", "minInclusive", "maxExclusive", "maxInclusive", "not", "and", "or", "xone", "in", "hasValue", "defaultValue", "minCount", "maxCount");
    exports.EX = createUriAndTermNamespace2("http://example.org/ns#");
  }
});

// node_modules/@treecg/types/dist/index.js
var require_dist = __commonJS({
  "node_modules/@treecg/types/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o6, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      Object.defineProperty(o6, k22, { enumerable: true, get: function() {
        return m2[k2];
      } });
    }) : (function(o6, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      o6[k22] = m2[k2];
    }));
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p3 in m2) if (p3 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p3)) __createBinding(exports2, m2, p3);
    };
    exports.__esModule = true;
    exports.getLogger = exports.Logger = exports.LoggerBrowser = void 0;
    __exportStar(require_Bucketizer(), exports);
    __exportStar(require_BucketizerOptions(), exports);
    __exportStar(require_Fragment(), exports);
    __exportStar(require_Member(), exports);
    __exportStar(require_RelationParameters(), exports);
    var Logger_Browser_1 = require_Logger_Browser();
    __createBinding(exports, Logger_Browser_1, "LoggerBrowser");
    __createBinding(exports, Logger_Browser_1, "LoggerBrowser", "Logger");
    __createBinding(exports, Logger_Browser_1, "getLogger");
    __exportStar(require_Vocabularies(), exports);
  }
});

// node_modules/rdf-data-factory/lib/BlankNode.js
var require_BlankNode2 = __commonJS({
  "node_modules/rdf-data-factory/lib/BlankNode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BlankNode = void 0;
    var BlankNode2 = class {
      constructor(value) {
        this.termType = "BlankNode";
        this.value = value;
      }
      equals(other) {
        return !!other && other.termType === "BlankNode" && other.value === this.value;
      }
    };
    exports.BlankNode = BlankNode2;
  }
});

// node_modules/rdf-data-factory/lib/DefaultGraph.js
var require_DefaultGraph2 = __commonJS({
  "node_modules/rdf-data-factory/lib/DefaultGraph.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultGraph = void 0;
    var DefaultGraph2 = class {
      constructor() {
        this.termType = "DefaultGraph";
        this.value = "";
      }
      equals(other) {
        return !!other && other.termType === "DefaultGraph";
      }
    };
    exports.DefaultGraph = DefaultGraph2;
    DefaultGraph2.INSTANCE = new DefaultGraph2();
  }
});

// node_modules/rdf-data-factory/lib/NamedNode.js
var require_NamedNode2 = __commonJS({
  "node_modules/rdf-data-factory/lib/NamedNode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NamedNode = void 0;
    var NamedNode3 = class {
      constructor(value) {
        this.termType = "NamedNode";
        this.value = value;
      }
      equals(other) {
        return !!other && other.termType === "NamedNode" && other.value === this.value;
      }
    };
    exports.NamedNode = NamedNode3;
  }
});

// node_modules/rdf-data-factory/lib/Literal.js
var require_Literal2 = __commonJS({
  "node_modules/rdf-data-factory/lib/Literal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Literal = void 0;
    var NamedNode_1 = require_NamedNode2();
    var Literal2 = class _Literal {
      constructor(value, languageOrDatatype) {
        this.termType = "Literal";
        this.value = value;
        if (typeof languageOrDatatype === "string") {
          this.language = languageOrDatatype;
          this.datatype = _Literal.RDF_LANGUAGE_STRING;
          this.direction = "";
        } else if (languageOrDatatype) {
          if ("termType" in languageOrDatatype) {
            this.language = "";
            this.datatype = languageOrDatatype;
            this.direction = "";
          } else {
            this.language = languageOrDatatype.language;
            this.datatype = languageOrDatatype.direction ? _Literal.RDF_DIRECTIONAL_LANGUAGE_STRING : _Literal.RDF_LANGUAGE_STRING;
            this.direction = languageOrDatatype.direction || "";
          }
        } else {
          this.language = "";
          this.datatype = _Literal.XSD_STRING;
          this.direction = "";
        }
      }
      equals(other) {
        return !!other && other.termType === "Literal" && other.value === this.value && other.language === this.language && (other.direction === this.direction || !other.direction && this.direction === "") && this.datatype.equals(other.datatype);
      }
    };
    exports.Literal = Literal2;
    Literal2.RDF_LANGUAGE_STRING = new NamedNode_1.NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
    Literal2.RDF_DIRECTIONAL_LANGUAGE_STRING = new NamedNode_1.NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString");
    Literal2.XSD_STRING = new NamedNode_1.NamedNode("http://www.w3.org/2001/XMLSchema#string");
  }
});

// node_modules/rdf-data-factory/lib/Quad.js
var require_Quad2 = __commonJS({
  "node_modules/rdf-data-factory/lib/Quad.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Quad = void 0;
    var Quad2 = class {
      constructor(subject2, predicate2, object2, graph) {
        this.termType = "Quad";
        this.value = "";
        this.subject = subject2;
        this.predicate = predicate2;
        this.object = object2;
        this.graph = graph;
      }
      equals(other) {
        return !!other && (other.termType === "Quad" || !other.termType) && this.subject.equals(other.subject) && this.predicate.equals(other.predicate) && this.object.equals(other.object) && this.graph.equals(other.graph);
      }
    };
    exports.Quad = Quad2;
  }
});

// node_modules/rdf-data-factory/lib/Variable.js
var require_Variable2 = __commonJS({
  "node_modules/rdf-data-factory/lib/Variable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Variable = void 0;
    var Variable2 = class {
      constructor(value) {
        this.termType = "Variable";
        this.value = value;
      }
      equals(other) {
        return !!other && other.termType === "Variable" && other.value === this.value;
      }
    };
    exports.Variable = Variable2;
  }
});

// node_modules/rdf-data-factory/lib/DataFactory.js
var require_DataFactory2 = __commonJS({
  "node_modules/rdf-data-factory/lib/DataFactory.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataFactory = void 0;
    var BlankNode_1 = require_BlankNode2();
    var DefaultGraph_1 = require_DefaultGraph2();
    var Literal_1 = require_Literal2();
    var NamedNode_1 = require_NamedNode2();
    var Quad_1 = require_Quad2();
    var Variable_1 = require_Variable2();
    var dataFactoryCounter = 0;
    var DataFactory3 = class {
      constructor(options) {
        this.blankNodeCounter = 0;
        options = options || {};
        this.blankNodePrefix = options.blankNodePrefix || `df_${dataFactoryCounter++}_`;
      }
      /**
       * @param value The IRI for the named node.
       * @return A new instance of NamedNode.
       * @see NamedNode
       */
      namedNode(value) {
        return new NamedNode_1.NamedNode(value);
      }
      /**
       * @param value The optional blank node identifier.
       * @return A new instance of BlankNode.
       *         If the `value` parameter is undefined a new identifier
       *         for the blank node is generated for each call.
       * @see BlankNode
       */
      blankNode(value) {
        return new BlankNode_1.BlankNode(value || `${this.blankNodePrefix}${this.blankNodeCounter++}`);
      }
      /**
       * @param value              The literal value.
       * @param languageOrDatatype The optional language, datatype, or directional language.
       *                           If `languageOrDatatype` is a NamedNode,
       *                           then it is used for the value of `NamedNode.datatype`.
       *                           If `languageOrDatatype` is a NamedNode, it is used for the value
       *                           of `NamedNode.language`.
       *                           Otherwise, it is used as a directional language,
       *                           from which the language is set to `languageOrDatatype.language`
       *                           and the direction to `languageOrDatatype.direction`.
       * @return A new instance of Literal.
       * @see Literal
       */
      literal(value, languageOrDatatype) {
        return new Literal_1.Literal(value, languageOrDatatype);
      }
      /**
       * This method is optional.
       * @param value The variable name
       * @return A new instance of Variable.
       * @see Variable
       */
      variable(value) {
        return new Variable_1.Variable(value);
      }
      /**
       * @return An instance of DefaultGraph.
       */
      defaultGraph() {
        return DefaultGraph_1.DefaultGraph.INSTANCE;
      }
      /**
       * @param subject   The quad subject term.
       * @param predicate The quad predicate term.
       * @param object    The quad object term.
       * @param graph     The quad graph term.
       * @return A new instance of Quad.
       * @see Quad
       */
      quad(subject2, predicate2, object2, graph) {
        return new Quad_1.Quad(subject2, predicate2, object2, graph || this.defaultGraph());
      }
      /**
       * Create a deep copy of the given term using this data factory.
       * @param original An RDF term.
       * @return A deep copy of the given term.
       */
      fromTerm(original) {
        switch (original.termType) {
          case "NamedNode":
            return this.namedNode(original.value);
          case "BlankNode":
            return this.blankNode(original.value);
          case "Literal":
            if (original.language) {
              return this.literal(original.value, original.language);
            }
            if (!original.datatype.equals(Literal_1.Literal.XSD_STRING)) {
              return this.literal(original.value, this.fromTerm(original.datatype));
            }
            return this.literal(original.value);
          case "Variable":
            return this.variable(original.value);
          case "DefaultGraph":
            return this.defaultGraph();
          case "Quad":
            return this.quad(this.fromTerm(original.subject), this.fromTerm(original.predicate), this.fromTerm(original.object), this.fromTerm(original.graph));
        }
      }
      /**
       * Create a deep copy of the given quad using this data factory.
       * @param original An RDF quad.
       * @return A deep copy of the given quad.
       */
      fromQuad(original) {
        return this.fromTerm(original);
      }
      /**
       * Reset the internal blank node counter.
       */
      resetBlankNodeCounter() {
        this.blankNodeCounter = 0;
      }
    };
    exports.DataFactory = DataFactory3;
  }
});

// node_modules/rdf-data-factory/index.js
var require_rdf_data_factory2 = __commonJS({
  "node_modules/rdf-data-factory/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o6, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      var desc = Object.getOwnPropertyDescriptor(m2, k2);
      if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m2[k2];
        } };
      }
      Object.defineProperty(o6, k22, desc);
    }) : (function(o6, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      o6[k22] = m2[k2];
    }));
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p3 in m2) if (p3 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p3)) __createBinding(exports2, m2, p3);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_BlankNode2(), exports);
    __exportStar(require_DataFactory2(), exports);
    __exportStar(require_DefaultGraph2(), exports);
    __exportStar(require_Literal2(), exports);
    __exportStar(require_NamedNode2(), exports);
    __exportStar(require_Quad2(), exports);
    __exportStar(require_Variable2(), exports);
  }
});

// node_modules/rdf-lens/dist/ontology.js
var import_types, RDFS, SHACL, RDFL;
var init_ontology = __esm({
  "node_modules/rdf-lens/dist/ontology.js"() {
    "use strict";
    import_types = __toESM(require_dist(), 1);
    RDFS = (0, import_types.createTermNamespace)("http://www.w3.org/2000/01/rdf-schema#", "subClassOf");
    SHACL = (0, import_types.createTermNamespace)("http://www.w3.org/ns/shacl#", "Shape", "NodeShape", "PropertyShape", "targetNode", "targetClass", "targetSubjectsOf", "targetObjectsOf", "property", "path", "class", "name", "description", "defaultValue", "alternativePath", "zeroOrMorePath", "oneOrMorePath", "zeroOrOnePath", "inversePath", "minCount", "maxCount", "datatype");
    RDFL = (0, import_types.createUriAndTermNamespace)("https://w3id.org/rdf-lens/ontology#", "CBD", "PathLens", "Context", "TypedExtract", "EnvVariable", "envKey", "envDefault", "datatype");
  }
});

// node_modules/rdf-lens/dist/shacl.js
function termToString2(term) {
  if (term.termType === "NamedNode") {
    return "<" + term.value + ">";
  }
  if (term.termType === "BlankNode") {
    return "_:" + term.value;
  }
  return JSON.stringify(term.value);
}
function fieldToLens(field2) {
  const minCount = field2.minCount || 0;
  const maxCount = field2.maxCount || Number.MAX_SAFE_INTEGER;
  if (maxCount < 2) {
    return field2.path.one(void 0).then(new BasicLens((x2, ctx) => {
      if (x2) {
        return field2.extract.execute(x2, ctx);
      } else {
        if (minCount > 0) {
          throw new LensError("Field is not defined and required", ctx.lineage.slice());
        } else {
          return x2;
        }
      }
    }));
  }
  if (maxCount < 2)
    return field2.path.one().then(field2.extract);
  const thenListExtract = RdfList.and(empty()).map(([terms, { quads }]) => terms.map((id) => ({ id, quads })));
  const noListExtract = empty().map((x2) => [x2]);
  return field2.path.thenFlat(thenListExtract.or(noListExtract).asMulti()).thenAll(field2.extract).map((x2) => x2.filter((x3) => x3 !== void 0)).map((xs, ctx) => {
    if (xs.length < minCount) {
      throw new LensError("Mininum Count violation", [
        { name: "found:", opts: xs.length },
        ...ctx.lineage.slice()
      ]);
    }
    if (xs.length > maxCount) {
      throw new LensError("Maximum Count violation", [
        { name: "found: " + xs.length, opts: [] },
        ...ctx.lineage.slice()
      ]);
    }
    return xs;
  }).map((x2) => {
    const out = x2.filter((x3) => x3 !== void 0);
    if (maxCount < 2) {
      return out[0];
    } else {
      return out;
    }
  });
}
function toLens(shape) {
  if (shape.fields.length === 0)
    return empty().map(() => ({})).named("first", shape.ty.value).named("shape", { id: shape.id, type: termToString2(shape.ty), description: shape.description }).named("id", [], (cont) => termToString2(cont.id));
  ;
  const fields = shape.fields.map((field2) => {
    const base = fieldToLens(field2);
    const asField = empty().named("processing field", {
      name: field2.name,
      minCount: field2.minCount,
      maxCount: field2.maxCount
    }).then(base).map((x2) => {
      const out = {};
      out[field2.name] = x2;
      return out;
    });
    return asField;
  });
  return fields[0].and(...fields.slice(1)).map((xs) => Object.assign({}, ...xs)).named("shape", { id: shape.id, type: termToString2(shape.ty), description: shape.description }).named("id", [], (cont) => termToString2(cont.id));
}
function MultiPath(predicate2, min, max) {
  return pred(predicate2).one().then(new BasicLens((c4, ctx) => {
    return ShaclPath.execute(c4, ctx);
  })).map((x2) => new BasicLensM((c4, ctx) => {
    const out = [];
    let current = [c4];
    let done = 0;
    if (min == 0) {
      out.push(c4);
    }
    while (current.length > 0) {
      done += 1;
      const todo = current.slice();
      current = [];
      for (const c5 of todo) {
        try {
          const news = x2.execute(c5, ctx);
          current.push(...news);
          if (done >= min && (!max || done <= max)) {
            out.push(c5);
          }
        } catch (ex) {
          console.log(ex);
          if (done >= min && (!max || done <= max)) {
            out.push(c5);
          }
          break;
        }
      }
    }
    return out;
  }));
}
function field(predicate2, name, convert) {
  const conv = convert || ((x2) => x2);
  return pred(predicate2).one().map(({ id }) => {
    const out = {};
    out[name] = conv(id.value);
    return out;
  });
}
function optionalField(predicate2, name, convert) {
  const conv = convert || ((x2) => x2);
  return pred(predicate2).one(void 0).map((inp) => {
    const out = {};
    if (inp) {
      out[name] = conv(inp.id.value);
    }
    return out;
  });
}
function dataTypeToExtract(dataType, t4) {
  if (dataType.equals(import_types2.XSD.terms.integer))
    return +t4.value;
  if (dataType.equals(import_types2.XSD.terms.custom("float")))
    return +t4.value;
  if (dataType.equals(import_types2.XSD.terms.custom("double")))
    return +t4.value;
  if (dataType.equals(import_types2.XSD.terms.custom("decimal")))
    return +t4.value;
  if (dataType.equals(import_types2.XSD.terms.string))
    return t4.value;
  if (dataType.equals(import_types2.XSD.terms.dateTime))
    return new Date(t4.value);
  if (dataType.equals(import_types2.XSD.terms.custom("boolean")))
    return t4.value === "true";
  if (dataType.equals(import_types2.XSD.terms.custom("iri")))
    return new import_rdf_data_factory.NamedNode(t4.value);
  if (dataType.equals(import_types2.XSD.terms.custom("anyURI"))) {
    return new import_rdf_data_factory.NamedNode(t4.value);
  }
  return t4;
}
function envLens(dataType) {
  const checkType = pred(import_types2.RDF.terms.type).thenSome(new BasicLens(({ id }, ctx) => {
    if (!id.equals(RDFL.terms.EnvVariable)) {
      throw new LensError("Expected type " + RDFL.EnvVariable, ctx.lineage);
    }
    return { checked: true };
  })).expectOne();
  const envName = pred(RDFL.terms.envKey).one().map(({ id }) => ({
    key: id.value
  }));
  const defaultValue = pred(RDFL.terms.envDefault).one(void 0).map((found) => ({
    defaultValue: found?.id.value
  }));
  const envDatatype = pred(RDFL.terms.datatype).one(void 0).map((found) => ({ dt: found?.id }));
  return checkType.and(envName, defaultValue, envDatatype).map(([_2, { key }, { defaultValue: defaultValue2 }, { dt }], ctx) => {
    const value = process.env[key] || defaultValue2;
    const thisDt = dataType || dt || import_types2.XSD.terms.custom("literal");
    if (value) {
      return dataTypeToExtract(thisDt, literal2(value));
    } else {
      throw new LensError("ENV and default are not set", [
        { name: "Env Key", opts: key },
        ...ctx.lineage
      ]);
    }
  });
}
function sliced() {
  return new BasicLens((x2) => x2.slice());
}
function remove_cbd(quads, subject2) {
  const toRemoves = [subject2];
  while (toRemoves.length > 0) {
    const toRemove = toRemoves.pop();
    quads = quads.filter((q) => {
      if (q.subject.equals(toRemove)) {
        if (q.object.termType === "BlankNode") {
          toRemoves.push(q.object);
        }
        return false;
      } else {
        return true;
      }
    });
  }
  return quads;
}
function envReplace() {
  const shouldReplace = empty().map((x2) => x2[0]).then(envLens().and(empty().map((x2) => x2.id))).map(([value, id]) => ({
    value,
    id
  }));
  const reduce = shouldReplace.and(empty().map((x2) => x2[1])).map(([{ value, id }, quads]) => {
    return remove_cbd(quads.map((q) => {
      if (q.object.equals(id)) {
        return quad2(q.subject, q.predicate, value, q.graph);
      } else {
        return q;
      }
    }), id);
  });
  const actualReplace = match(void 0, import_types2.RDF.terms.type, RDFL.terms.EnvVariable).thenAll(subject).reduce(reduce, empty());
  return sliced().then(actualReplace);
}
function extractLeaf(datatype) {
  return envLens(datatype).or(empty().map((item) => dataTypeToExtract(datatype, item.id)));
}
function extractProperty(cache, _subClasses, apply) {
  const pathLens = pred(SHACL.path).one().then(ShaclPath).map((path) => ({
    path
  }));
  const nameLens = field(SHACL.name, "name");
  const minCount = optionalField(SHACL.minCount, "minCount", (x2) => +x2);
  const maxCount = optionalField(SHACL.maxCount, "maxCount", (x2) => +x2);
  const dataTypeLens = pred(SHACL.datatype).one().map(({ id }) => ({
    extract: extractLeaf(id)
  }));
  const clazzLens = field(SHACL.class, "clazz").map(({ clazz: expected_class }) => {
    return {
      extract: new BasicLens(({ id, quads }, ctx) => {
        const lens = cache[expected_class];
        if (!lens) {
          throw new LensError("Tried extracting class, but no shape was defined", [
            {
              name: "Found type: " + expected_class,
              opts: Object.keys(cache)
            },
            ...ctx.lineage.slice()
          ]);
        }
        if (apply[expected_class]) {
          return lens.map(apply[expected_class]).execute({ id, quads }, ctx);
        } else {
          return lens.execute({ id, quads }, ctx);
        }
      }).named("extracting class", expected_class)
    };
  });
  return pathLens.and(nameLens, minCount, maxCount, clazzLens.or(dataTypeLens)).map((xs) => Object.assign({}, ...xs));
}
function getCacheState(le, ctx, st) {
  const out = ctx.stateMap.get(le);
  if (out !== void 0)
    return out;
  const o6 = st();
  ctx.stateMap.set(le, o6);
  return o6;
}
function extractShape(cache, subclasses, apply) {
  const checkTy = pred(import_types2.RDF.terms.type).one().map(({ id }, ctx) => {
    if (id.equals(SHACL.NodeShape))
      return {};
    throw new LensError("Expected type sh:NodeShape", [
      { name: "found type", opts: termToString2(id) },
      ...ctx.lineage
    ]);
  });
  const idLens = empty().map(({ id }) => ({ id: id.value }));
  const clazzs = pred(SHACL.targetClass);
  const multiple = clazzs.thenAll(empty().map(({ id }) => ({ ty: id })));
  const descriptionClassLens = optionalField(SHACL.description, "description");
  const fields = pred(SHACL.property).thenAll(extractProperty(cache, subclasses, apply)).map((fields2) => ({ fields: fields2 }));
  return multiple.and(checkTy, idLens, descriptionClassLens, fields).map(([multiple2, ...others]) => multiple2.map((xs) => Object.assign({}, xs, ...others)));
}
function extractShapes(quads, apply = {}, customClasses = {}) {
  const cache = Object.assign({}, customClasses);
  cache[RDFL.PathLens] = ShaclPath;
  cache[RDFL.CBD] = CBDLens;
  cache[RDFL.Context] = new BasicLens(({ quads: quads2 }) => {
    return quads2;
  });
  const subClasses = {};
  quads.filter((x2) => x2.predicate.equals(RDFS.subClassOf)).forEach((x2) => subClasses[x2.subject.value] = x2.object.value);
  const shapes = subjects().then(unique()).asMulti().thenSome(extractShape(cache, subClasses, apply)).execute(quads, createContext()).flat();
  const lenses = [];
  cache[RDFL.TypedExtract] = TypedExtract(cache, apply, subClasses);
  for (const shape of shapes) {
    const lens = toLens(shape);
    const target = cache[shape.ty.value];
    if (target) {
      cache[shape.ty.value] = target.or(lens);
    } else {
      cache[shape.ty.value] = lens;
    }
    lenses.push(lens);
  }
  return { lenses: cache, shapes, subClasses };
}
var import_types2, import_rdf_data_factory, literal2, quad2, RDFListElement, RdfList, ShaclSequencePath, ShaclAlternativepath, ShaclPredicatePath, ShaclInversePath, ShaclPath, getId, CBDLens, Cached, TypedExtract;
var init_shacl = __esm({
  "node_modules/rdf-lens/dist/shacl.js"() {
    "use strict";
    import_types2 = __toESM(require_dist(), 1);
    init_lens();
    import_rdf_data_factory = __toESM(require_rdf_data_factory2(), 1);
    init_ontology();
    ({ literal: literal2, quad: quad2 } = new import_rdf_data_factory.DataFactory());
    RDFListElement = pred(import_types2.RDF.terms.first).expectOne().and(pred(import_types2.RDF.terms.rest).expectOne());
    RdfList = new BasicLens((c4, ctx) => {
      if (c4.id.equals(import_types2.RDF.terms.nil)) {
        return [];
      }
      const [first, rest] = RDFListElement.execute(c4, ctx);
      const els = RdfList.execute(rest, ctx);
      els.unshift(first.id);
      return els;
    });
    ShaclSequencePath = new BasicLens((c4, ctx) => {
      const pathList = RdfList.execute(c4, ctx);
      const paths = pathList.map((x2) => ShaclPath.execute({ id: x2, quads: c4.quads }, ctx));
      if (paths.length === 0) {
        return new BasicLensM((c5) => [c5]);
      }
      let start = paths[0];
      for (let i5 = 1; i5 < pathList.length; i5++) {
        start = start.thenFlat(paths[i5]);
      }
      return start;
    });
    ShaclAlternativepath = new BasicLens((c4, ctx) => {
      const options = pred(SHACL.alternativePath).one().then(RdfList).execute(c4, ctx);
      const optionLenses = options.map((id) => ShaclPath.execute({ id, quads: c4.quads }, ctx));
      return optionLenses[0].orAll(...optionLenses.slice(1));
    });
    ShaclPredicatePath = extractLeaf(import_types2.XSD.terms.custom("iri")).map(pred);
    ShaclInversePath = pred(SHACL.inversePath).one().then(new BasicLens((c4, ctx) => {
      const pathList = RdfList.execute(c4, ctx);
      if (pathList.length === 0) {
        return new BasicLensM((c5) => [c5]);
      }
      pathList.reverse();
      let start = invPred(pathList[0]);
      for (let i5 = 1; i5 < pathList.length; i5++) {
        start = start.thenFlat(invPred(pathList[i5]));
      }
      return start;
    }).or(new BasicLens((c4) => {
      return invPred(c4.id);
    })));
    ShaclPath = ShaclSequencePath.or(ShaclAlternativepath, ShaclInversePath, MultiPath(SHACL.zeroOrMorePath, 0), MultiPath(SHACL.zeroOrMorePath, 1), MultiPath(SHACL.zeroOrOnePath, 0, 1), ShaclPredicatePath);
    getId = empty().map(({ id }) => id);
    CBDLens = new BasicLensM(({ id, quads }, cont) => {
      cont.lineage.push({ name: "CBD", opts: ["from: " + id.value] });
      const done = /* @__PURE__ */ new Set();
      const todo = [id];
      const out = [];
      let item = todo.pop();
      while (item) {
        const found = quads.filter((x2) => x2.subject.equals(item));
        out.push(...found);
        for (const option of found) {
          const object2 = option.object;
          if (object2.termType !== "BlankNode") {
            continue;
          }
          if (done.has(object2.value))
            continue;
          done.add(object2.value);
          todo.push(object2);
        }
        item = todo.pop();
      }
      return out;
    });
    Cached = function(lens, cachedLenses) {
      const lenses = cachedLenses["lenses"] ?? (cachedLenses.lenses = []);
      const found = lenses.find((x2) => x2.from === lens);
      if (found) {
        return found.lens;
      }
      const newLens = new BasicLens(({ id, quads }, ctx) => {
        const state = getCacheState(newLens, ctx, () => ({
          namedNodes: {},
          blankNodes: {}
        }));
        let stateDict = {};
        if (id.termType == "NamedNode") {
          stateDict = state.namedNodes = state.namedNodes ?? {};
        }
        if (id.termType == "BlankNode") {
          stateDict = state.blankNodes = state.blankNodes ?? {};
        }
        if (!(id.value in stateDict)) {
          stateDict[id.value] = [];
        }
        const res = stateDict[id.value].find((x2) => x2.lens == lens);
        if (res) {
          return res.result;
        }
        const thisThing = { lens, result: {} };
        stateDict[id.value].push(thisThing);
        const executedLens = lens.execute({ quads, id }, ctx);
        Object.assign(thisThing.result, executedLens);
        return thisThing.result;
      });
      lenses.push({ lens: newLens, from: lens });
      return newLens;
    };
    TypedExtract = function(cache, apply, subClasses) {
      const lens = new BasicLens(({ id, quads }, ctx) => {
        const ty = quads.find((q) => q.subject.equals(id) && q.predicate.equals(import_types2.RDF.terms.type))?.object.value;
        ctx.lineage.push({ name: "Found type", opts: ty });
        ctx.lineage.push({ name: "TypedExtract", opts: void 0 });
        if (!ty) {
          throw new LensError("Expected a type, found none", ctx.lineage.slice());
        }
        const lenses = [];
        let current = ty;
        while (current) {
          const thisLens = cache[current];
          if (thisLens) {
            const state = getCacheState(lens, ctx, () => ({
              lenses: []
            }));
            lenses.push(Cached(thisLens, state));
          }
          current = subClasses[current];
        }
        if (lenses.length === 0) {
          throw new LensError("Expected a lens for type, found none", ctx.lineage.slice());
        }
        const finalLens = lenses.length == 1 ? lenses[0] : lenses[0].and(...lenses.slice(1)).map((xs) => Object.assign({}, ...xs));
        if (apply[ty]) {
          return finalLens.map(apply[ty]).execute({ id, quads }, ctx);
        } else {
          return finalLens.execute({ id, quads }, ctx);
        }
      });
      return lens;
    };
  }
});

// node_modules/rdf-lens/dist/index.js
var dist_exports = {};
__export(dist_exports, {
  BasicLens: () => BasicLens,
  BasicLensM: () => BasicLensM,
  CBDLens: () => CBDLens,
  Cached: () => Cached,
  LensError: () => LensError,
  MultiPath: () => MultiPath,
  RdfList: () => RdfList,
  ShaclAlternativepath: () => ShaclAlternativepath,
  ShaclInversePath: () => ShaclInversePath,
  ShaclPath: () => ShaclPath,
  ShaclPredicatePath: () => ShaclPredicatePath,
  ShaclSequencePath: () => ShaclSequencePath,
  TypedExtract: () => TypedExtract,
  createContext: () => createContext,
  empty: () => empty,
  envReplace: () => envReplace,
  extractShape: () => extractShape,
  extractShapes: () => extractShapes,
  invPred: () => invPred,
  match: () => match,
  object: () => object,
  pred: () => pred,
  predTriple: () => predTriple,
  predicate: () => predicate,
  sliced: () => sliced,
  subject: () => subject,
  subjects: () => subjects,
  toLens: () => toLens,
  unique: () => unique
});
var init_dist = __esm({
  "node_modules/rdf-lens/dist/index.js"() {
    "use strict";
    init_lens();
    init_shacl();
  }
});

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
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
  const o6 = 1 === t4.length ? t4[0] : e5.reduce((e6, s4, o7) => e6 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o7 + 1], t4[0]);
  return new n(o6, t4, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
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
    const { get: e5, set: r5 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r5?.call(this, s5), this.requestUpdate(t4, h3, i5);
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
      const r5 = h3.fromAttribute(s4, t5.type);
      this[e5] = r5 ?? this._$Ej?.get(e5) ?? r5, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e5 = false, h3) {
    if (void 0 !== t4) {
      const r5 = this.constructor;
      if (false === e5 && (h3 = this[t4]), i5 ?? (i5 = r5.getPropertyOptions(t4)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r5._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r5) {
    i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r5 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r5) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e5 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
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
    let r5;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r5 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r5.nodeType) {
        if (r5.hasAttributes()) for (const t5 of r5.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r5.getAttribute(t5).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r5.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r5.removeAttribute(t5));
        if (y2.test(r5.tagName)) {
          const t5 = r5.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r5.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r5.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r5.append(t5[i6], c3());
          }
        }
      } else if (8 === r5.nodeType) if (r5.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r5.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
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
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e5)), void 0 !== e5 ? (s4._$Co ?? (s4._$Co = []))[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e5)), i5;
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
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r5 = s4[0];
    for (; void 0 !== r5; ) {
      if (o6 === r5.index) {
        let i6;
        2 === r5.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r5.type ? i6 = new r5.ctor(h3, r5.name, r5.strings, this, t4) : 6 === r5.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r5 = s4[++n5];
      }
      o6 !== r5?.index && (h3 = P.nextNode(), o6++);
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
    let o6 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o6 = !a2(t4) || t4 !== this._$AH && t4 !== E, o6 && (this._$AH = t4);
    else {
      const e6 = t4;
      let n5, r5;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r5 = M(this, e6[s4 + n5], i5, n5), r5 === E && (r5 = this._$AH[n5]), o6 || (o6 = !a2(r5) || r5 !== this._$AH[n5]), r5 === A ? t4 = A : t4 !== A && (t4 += (r5 ?? "") + h3[n5 + 1]), this._$AH[n5] = r5;
    }
    o6 && !e5 && this.j(t4);
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
    const r5 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r5, this.renderRoot, this.renderOptions);
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
var t3 = (t4) => (e5, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t4, e5);
  }) : customElements.define(t4, e5);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e5, r5) => {
  const { kind: n5, metadata: i5 } = r5;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r5.name, t4), "accessor" === n5) {
    const { name: o6 } = r5;
    return { set(r6) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r6), this.requestUpdate(o6, n6, t4, true, r6);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t4, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r5;
    return function(r6) {
      const n6 = this[o6];
      e5.call(this, r6), this.requestUpdate(o6, n6, t4, true, r6);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t4) {
  return (e5, o6) => "object" == typeof o6 ? r4(t4, e5, o6) : ((t5, e6, o7) => {
    const r5 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t5), r5 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t4, e5, o6);
}

// src/rdf-webcomponents/components/rdf-lens.ts
var RdfLens = class extends i4 {
  constructor() {
    super(...arguments);
    this.validate = false;
    this.strict = false;
    this.multiple = false;
    // ===========================================================================
    // Internal State
    // ===========================================================================
    this._data = null;
    this._quads = [];
    this._shapeQuads = [];
    this._loading = false;
    this._error = null;
    this._shapesLoaded = false;
    this._onTriplestoreReady = (event) => {
      const source = event.composedPath?.()[0] ?? event.target;
      console.log(
        "[rdf-lens] triplestore-ready received \u2014 source:",
        source?.tagName,
        "| quads on source:",
        source?.quads?.length ?? "n/a",
        "| shapesLoaded:",
        this._shapesLoaded
      );
      if (source?.quads && Array.isArray(source.quads)) {
        this._quads = source.quads;
        console.log(`[rdf-lens] stored ${this._quads.length} quads from adapter`);
      } else {
        console.warn("[rdf-lens] triplestore-ready: could not read quads from source element");
      }
      if (this._shapesLoaded) {
        this._extractData();
      } else {
        console.log("[rdf-lens] shapes not yet loaded \u2014 extraction deferred");
      }
    };
  }
  // ===========================================================================
  // Public API
  // ===========================================================================
  /** Returns the extracted data */
  get data() {
    return this._data;
  }
  /** Returns whether data is loading */
  get loading() {
    return this._loading;
  }
  /** Returns the current error */
  get error() {
    return this._error;
  }
  /** Sets the triplestore data (called by parent or through events) */
  setQuads(quads) {
    this._quads = quads;
    if (this._shapesLoaded) {
      this._extractData();
    }
  }
  // ===========================================================================
  // Lifecycle Methods
  // ===========================================================================
  async firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    if (this.shapeFile) {
      await this._loadShapes();
    } else if (this.shapes) {
      await this._parseInlineShapes();
    } else {
      await this._parseInlineScriptShapes();
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("triplestore-ready", this._onTriplestoreReady);
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("shapeFile") && this.shapeFile) {
      this._loadShapes();
    }
    if (changedProperties.has("shapes") && this.shapes) {
      this._parseInlineShapes();
    }
    if (!this.shapeFile && !this.shapes && !this._shapesLoaded) {
      this._parseInlineScriptShapes();
    }
    if (changedProperties.has("shapeClass") || changedProperties.has("multiple") || changedProperties.has("subject")) {
      if (this._quads.length > 0 && this._shapesLoaded) {
        this._extractData();
      }
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("triplestore-ready", this._onTriplestoreReady);
  }
  // ===========================================================================
  // Rendering
  // ===========================================================================
  render() {
    return b2`
      <slot name="loading" ?hidden=${!this._loading}>
        ${this._loading ? b2`
          <div class="rdf-lens-loading">
            Extracting data from shapes...
          </div>
        ` : ""}
      </slot>
      
      <slot name="error" ?hidden=${!this._error}>
        ${this._error ? b2`
          <div class="rdf-lens-error">
            <div class="rdf-lens-error-title">Error extracting data</div>
            <div class="rdf-lens-error-message">${this._error}</div>
          </div>
        ` : ""}
      </slot>
      
      <slot ?hidden=${this._loading || this._error}></slot>
    `;
  }
  // ===========================================================================
  // Private Methods
  // ===========================================================================
  async _loadShapes() {
    if (!this.shapeFile) return;
    this._loading = true;
    this._error = null;
    this._emitEvent("shape-loading", { phase: "fetch" });
    try {
      const response = await fetch(this.shapeFile);
      if (!response.ok) {
        throw new Error(`Failed to fetch shapes: ${response.status} ${response.statusText}`);
      }
      const content = await response.text();
      await this._parseShapesContent(content, this.shapeFile);
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      const eventDetail = {
        message: this._error,
        phase: "shape",
        error: error instanceof Error ? error : void 0
      };
      this._emitEvent("shape-error", eventDetail);
      this.requestUpdate();
    }
  }
  async _parseInlineShapes() {
    if (!this.shapes) return;
    this._loading = true;
    try {
      await this._parseShapesContent(this.shapes, "inline");
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      this._emitEvent("shape-error", {
        message: this._error,
        phase: "shape",
        error: error instanceof Error ? error : void 0
      });
      this.requestUpdate();
    }
  }
  async _parseInlineScriptShapes() {
    const script = this.querySelector('script[type="text/turtle"]');
    const content = script?.textContent?.trim();
    if (!content) {
      return;
    }
    this._loading = true;
    try {
      await this._parseShapesContent(content, "inline-script");
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      this._emitEvent("shape-error", {
        message: this._error,
        phase: "shape",
        error: error instanceof Error ? error : void 0
      });
      this.requestUpdate();
    }
  }
  async _parseShapesContent(content, baseUrl) {
    const { Parser, DataFactory: DataFactory3 } = await Promise.resolve().then(() => (init_src(), src_exports));
    const { namedNode: namedNode2 } = DataFactory3;
    const parser = new Parser({ baseIRI: baseUrl });
    return new Promise((resolve, reject) => {
      const quads = [];
      parser.parse(content, (error, quad3) => {
        if (error) {
          console.error("[rdf-lens] shape parse error:", error.message);
          reject(error);
        } else if (quad3) {
          quads.push({
            subject: this._serializeTerm(quad3.subject),
            predicate: this._serializeTerm(quad3.predicate),
            object: this._serializeTerm(quad3.object),
            graph: quad3.graph ? this._serializeTerm(quad3.graph) : void 0
          });
        } else {
          console.log(`[rdf-lens] shapes parsed: ${quads.length} quads | dataQuads already available: ${this._quads.length}`);
          this._shapeQuads = quads;
          this._shapesLoaded = true;
          this._loading = false;
          this._emitEvent("shapes-loaded", { count: quads.length });
          this.requestUpdate();
          if (this._quads.length > 0) {
            this._extractData();
          }
          resolve();
        }
      });
    });
  }
  async _extractData() {
    if (this._quads.length === 0 || this._shapeQuads.length === 0) return;
    this._loading = true;
    this._error = null;
    this._emitEvent("extraction-start", {});
    const startTime = Date.now();
    try {
      const result = await this._executeLens();
      this._data = result.data;
      this._loading = false;
      const eventDetail = {
        data: result.data,
        shapeClass: result.shapeClass,
        count: result.count,
        duration: Date.now() - startTime
      };
      this._emitEvent("shape-processed", eventDetail);
      this.requestUpdate();
    } catch (error) {
      this._loading = false;
      this._error = error instanceof Error ? error.message : String(error);
      const eventDetail = {
        message: this._error,
        phase: "extract",
        error: error instanceof Error ? error : void 0
      };
      this._emitEvent("shape-error", eventDetail);
      this.requestUpdate();
    }
  }
  async _executeLens() {
    const { extractShapes: extractShapes2 } = await Promise.resolve().then(() => (init_dist(), dist_exports));
    const { DataFactory: DataFactory3 } = await Promise.resolve().then(() => (init_src(), src_exports));
    const { namedNode: namedNode2 } = DataFactory3;
    const dt = (term) => {
      switch (term.termType) {
        case "NamedNode":
          return DataFactory3.namedNode(term.value);
        case "Literal":
          if (term.language) return DataFactory3.literal(term.value, term.language);
          if (term.datatype) return DataFactory3.literal(term.value, DataFactory3.namedNode(term.datatype));
          return DataFactory3.literal(term.value);
        case "BlankNode":
          return DataFactory3.blankNode(term.value);
        case "DefaultGraph":
          return DataFactory3.defaultGraph();
        default:
          return DataFactory3.namedNode(term.value);
      }
    };
    const shapeQuads = this._shapeQuads.map(
      (q) => DataFactory3.quad(
        dt(q.subject),
        dt(q.predicate),
        dt(q.object),
        q.graph ? dt(q.graph) : DataFactory3.defaultGraph()
      )
    );
    const dataQuads = this._quads.map(
      (q) => DataFactory3.quad(
        dt(q.subject),
        dt(q.predicate),
        dt(q.object),
        q.graph ? dt(q.graph) : DataFactory3.defaultGraph()
      )
    );
    const shapes = extractShapes2(shapeQuads);
    console.log("[rdf-lens] extractShapes result \u2014 available lenses:", Object.keys(shapes.lenses));
    console.log("[rdf-lens] dataQuads count:", dataQuads.length, "| shapeQuads count:", shapeQuads.length);
    let subjects2 = [];
    const targetType = this.shapeClass;
    console.log("[rdf-lens] target shapeClass:", targetType);
    if (this.subject) {
      subjects2 = [this.subject];
    } else if (targetType) {
      const typePredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
      subjects2 = dataQuads.filter((q) => q.predicate.value === typePredicate && q.object.value === targetType).map((q) => q.subject.value);
    } else {
      const availableClass = Object.keys(shapes.lenses).find(
        (k2) => k2.startsWith("http") && !k2.includes("rdf-lens")
      );
      if (availableClass) {
        const typePredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        subjects2 = dataQuads.filter((q) => q.predicate.value === typePredicate && q.object.value === availableClass).map((q) => q.subject.value);
      }
    }
    console.log("[rdf-lens] subjects found:", subjects2);
    if (subjects2.length === 0) {
      throw new Error("No subjects found to extract. Ensure your data has instances of the target class.");
    }
    const lensKey = targetType || subjects2[0];
    const lens = shapes.lenses[lensKey];
    if (!lens) {
      const availableKeys = Object.keys(shapes.lenses);
      throw new Error(`No lens found for class: ${lensKey}. Available: ${availableKeys.join(", ")}`);
    }
    const results = [];
    const subjectsToProcess = this.multiple ? subjects2 : subjects2.slice(0, 1);
    console.log(`[rdf-lens] executing lens for ${subjectsToProcess.length} subject(s) (multiple=${this.multiple})`);
    for (const subjectUri of subjectsToProcess) {
      try {
        const result = lens.execute({
          id: namedNode2(subjectUri),
          quads: dataQuads
        });
        console.log(`[rdf-lens] extracted subject ${subjectUri}:`, result);
        results.push(result);
      } catch (error) {
        if (this.strict) {
          throw error;
        }
        console.warn(`[rdf-lens] failed to extract ${subjectUri}:`, error);
      }
    }
    console.log(`[rdf-lens] extraction complete: ${results.length} results, emitting shape-processed`);
    return {
      data: this.multiple ? results : results[0],
      count: results.length,
      shapeClass: lensKey
    };
  }
  _serializeTerm(term) {
    return {
      termType: term.termType,
      value: term.value,
      datatype: term.datatype?.value,
      language: term.language
    };
  }
  _emitEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
};
// ===========================================================================
// Static Properties
// ===========================================================================
RdfLens.styles = i`
    :host {
      display: contents;
    }
    
    :host([hidden]) {
      display: none;
    }
    
    .rdf-lens-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-loading-color, #666);
    }
    
    .rdf-lens-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--rdf-error-color, #c00);
      background: var(--rdf-error-bg, #fee);
      border-radius: 4px;
    }
    
    .rdf-lens-error-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .rdf-lens-error-message {
      font-family: monospace;
      font-size: 0.875rem;
    }
  `;
__decorateClass([
  n4({ type: String, attribute: "shape-file" })
], RdfLens.prototype, "shapeFile", 2);
__decorateClass([
  n4({ type: String, attribute: "shape-class" })
], RdfLens.prototype, "shapeClass", 2);
__decorateClass([
  n4({ type: String })
], RdfLens.prototype, "shapes", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], RdfLens.prototype, "validate", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], RdfLens.prototype, "strict", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], RdfLens.prototype, "multiple", 2);
__decorateClass([
  n4({ type: String, reflect: true })
], RdfLens.prototype, "subject", 2);
RdfLens = __decorateClass([
  t3("rdf-lens")
], RdfLens);
export {
  RdfLens
};
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

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
