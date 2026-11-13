/*! Includes snarkjs 0.7.6, GPL-3.0-or-later. Source: https://github.com/iden3/snarkjs/tree/v0.7.6 ; license: https://www.gnu.org/licenses/gpl-3.0.html . Core worker source and build instructions accompany the source release. */

// node_modules/snarkjs/node_modules/ffjavascript/build/browser.esm.js
var hexLen = [0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4];
function fromString(s, radix) {
  if (!radix || radix == 10) {
    return BigInt(s);
  } else if (radix == 16) {
    if (s.slice(0, 2) == "0x") {
      return BigInt(s);
    } else {
      return BigInt("0x" + s);
    }
  }
}
var e = fromString;
function fromArray(a, radix) {
  let acc = BigInt(0);
  radix = BigInt(radix);
  for (let i = 0; i < a.length; i++) {
    acc = acc * radix + BigInt(a[i]);
  }
  return acc;
}
function bitLength$6(a) {
  const aS = a.toString(16);
  return (aS.length - 1) * 4 + hexLen[parseInt(aS[0], 16)];
}
function isNegative$4(a) {
  return BigInt(a) < BigInt(0);
}
function isZero$1(a) {
  return !a;
}
function shiftLeft(a, n) {
  return BigInt(a) << BigInt(n);
}
function shiftRight(a, n) {
  return BigInt(a) >> BigInt(n);
}
var shl = shiftLeft;
var shr = shiftRight;
function isOdd$5(a) {
  return (BigInt(a) & BigInt(1)) == BigInt(1);
}
function naf(n) {
  let E = BigInt(n);
  const res = [];
  while (E) {
    if (E & BigInt(1)) {
      const z = 2 - Number(E % BigInt(4));
      res.push(z);
      E = E - BigInt(z);
    } else {
      res.push(0);
    }
    E = E >> BigInt(1);
  }
  return res;
}
function bits(n) {
  let E = BigInt(n);
  const res = [];
  while (E) {
    if (E & BigInt(1)) {
      res.push(1);
    } else {
      res.push(0);
    }
    E = E >> BigInt(1);
  }
  return res;
}
function toNumber$1(s) {
  if (s > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Number too big");
  }
  return Number(s);
}
function toArray(s, radix) {
  const res = [];
  let rem = BigInt(s);
  radix = BigInt(radix);
  while (rem) {
    res.unshift(Number(rem % radix));
    rem = rem / radix;
  }
  return res;
}
function add(a, b) {
  return BigInt(a) + BigInt(b);
}
function sub(a, b) {
  return BigInt(a) - BigInt(b);
}
function neg(a) {
  return -BigInt(a);
}
function mul(a, b) {
  return BigInt(a) * BigInt(b);
}
function square$2(a) {
  return BigInt(a) * BigInt(a);
}
function pow(a, b) {
  return BigInt(a) ** BigInt(b);
}
function exp$1(a, b) {
  return BigInt(a) ** BigInt(b);
}
function abs$1(a) {
  return BigInt(a) >= 0 ? BigInt(a) : -BigInt(a);
}
function div(a, b) {
  return BigInt(a) / BigInt(b);
}
function mod(a, b) {
  return BigInt(a) % BigInt(b);
}
function eq(a, b) {
  return BigInt(a) == BigInt(b);
}
function neq(a, b) {
  return BigInt(a) != BigInt(b);
}
function lt(a, b) {
  return BigInt(a) < BigInt(b);
}
function gt(a, b) {
  return BigInt(a) > BigInt(b);
}
function leq(a, b) {
  return BigInt(a) <= BigInt(b);
}
function geq(a, b) {
  return BigInt(a) >= BigInt(b);
}
function band(a, b) {
  return BigInt(a) & BigInt(b);
}
function bor(a, b) {
  return BigInt(a) | BigInt(b);
}
function bxor(a, b) {
  return BigInt(a) ^ BigInt(b);
}
function land(a, b) {
  return BigInt(a) && BigInt(b);
}
function lor(a, b) {
  return BigInt(a) || BigInt(b);
}
function lnot(a) {
  return !BigInt(a);
}
function toRprLE(buff, o, e2, n8) {
  const s = "0000000" + e2.toString(16);
  const v = new Uint32Array(buff.buffer, buff.byteOffset + o, n8 / 4);
  const l = ((s.length - 7) * 4 - 1 >> 5) + 1;
  for (let i = 0; i < l; i++) v[i] = parseInt(s.substring(s.length - 8 * i - 8, s.length - 8 * i), 16);
  for (let i = l; i < v.length; i++) v[i] = 0;
  for (let i = v.length * 4; i < n8; i++) buff[i] = toNumber$1(band(shiftRight(e2, i * 8), 255));
}
function toRprBE(buff, o, e2, n8) {
  const s = "0000000" + e2.toString(16);
  const v = new DataView(buff.buffer, buff.byteOffset + o, n8);
  const l = ((s.length - 7) * 4 - 1 >> 5) + 1;
  for (let i = 0; i < l; i++) v.setUint32(n8 - i * 4 - 4, parseInt(s.substring(s.length - 8 * i - 8, s.length - 8 * i), 16), false);
  for (let i = 0; i < n8 / 4 - l; i++) v[i] = 0;
}
function fromRprLE(buff, o, n8) {
  n8 = n8 || buff.byteLength;
  o = o || 0;
  const v = new Uint32Array(buff.buffer, buff.byteOffset + o, n8 / 4);
  const a = new Array(n8 / 4);
  v.forEach((ch, i) => a[a.length - i - 1] = ch.toString(16).padStart(8, "0"));
  return fromString(a.join(""), 16);
}
function fromRprBE(buff, o, n8) {
  n8 = n8 || buff.byteLength;
  o = o || 0;
  const v = new DataView(buff.buffer, buff.byteOffset + o, n8);
  const a = new Array(n8 / 4);
  for (let i = 0; i < n8 / 4; i++) {
    a[i] = v.getUint32(i * 4, false).toString(16).padStart(8, "0");
  }
  return fromString(a.join(""), 16);
}
function toString(a, radix) {
  return a.toString(radix);
}
function toLEBuff(a) {
  const buff = new Uint8Array(Math.floor((bitLength$6(a) - 1) / 8) + 1);
  toRprLE(buff, 0, a, buff.byteLength);
  return buff;
}
var zero = e(0);
var one = e(1);
var _Scalar = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  abs: abs$1,
  add,
  band,
  bitLength: bitLength$6,
  bits,
  bor,
  bxor,
  div,
  e,
  eq,
  exp: exp$1,
  fromArray,
  fromRprBE,
  fromRprLE,
  fromString,
  geq,
  gt,
  isNegative: isNegative$4,
  isOdd: isOdd$5,
  isZero: isZero$1,
  land,
  leq,
  lnot,
  lor,
  lt,
  mod,
  mul,
  naf,
  neg,
  neq,
  one,
  pow,
  shiftLeft,
  shiftRight,
  shl,
  shr,
  square: square$2,
  sub,
  toArray,
  toLEBuff,
  toNumber: toNumber$1,
  toRprBE,
  toRprLE,
  toString,
  zero
});
var _revTable$1 = [];
for (let i = 0; i < 256; i++) {
  _revTable$1[i] = _revSlow$1(i, 8);
}
function _revSlow$1(idx, bits2) {
  let res = 0;
  let a = idx;
  for (let i = 0; i < bits2; i++) {
    res <<= 1;
    res = res | a & 1;
    a >>= 1;
  }
  return res;
}
function exp(F, base, e2) {
  if (isZero$1(e2)) return F.one;
  const n = bits(e2);
  if (n.length == 0) return F.one;
  let res = base;
  for (let i = n.length - 2; i >= 0; i--) {
    res = F.square(res);
    if (n[i]) {
      res = F.mul(res, base);
    }
  }
  return res;
}
function buildSqrt(F) {
  if (F.m % 2 == 1) {
    if (eq(mod(F.p, 4), 1)) {
      if (eq(mod(F.p, 8), 1)) {
        if (eq(mod(F.p, 16), 1)) {
          alg5_tonelliShanks(F);
        } else if (eq(mod(F.p, 16), 9)) {
          alg4_kong(F);
        } else {
          throw new Error("Field withot sqrt");
        }
      } else if (eq(mod(F.p, 8), 5)) {
        alg3_atkin(F);
      } else {
        throw new Error("Field withot sqrt");
      }
    } else if (eq(mod(F.p, 4), 3)) {
      alg2_shanks(F);
    }
  } else {
    const pm2mod4 = mod(pow(F.p, F.m / 2), 4);
    if (pm2mod4 == 1) {
      alg10_adj(F);
    } else if (pm2mod4 == 3) {
      alg9_adj(F);
    } else {
      alg8_complex(F);
    }
  }
}
function alg5_tonelliShanks(F) {
  F.sqrt_q = pow(F.p, F.m);
  F.sqrt_s = 0;
  F.sqrt_t = sub(F.sqrt_q, 1);
  while (!isOdd$5(F.sqrt_t)) {
    F.sqrt_s = F.sqrt_s + 1;
    F.sqrt_t = div(F.sqrt_t, 2);
  }
  let c0 = F.one;
  while (F.eq(c0, F.one)) {
    const c = F.random();
    F.sqrt_z = F.pow(c, F.sqrt_t);
    c0 = F.pow(F.sqrt_z, 2 ** (F.sqrt_s - 1));
  }
  F.sqrt_tm1d2 = div(sub(F.sqrt_t, 1), 2);
  F.sqrt = function(a) {
    const F2 = this;
    if (F2.isZero(a)) return F2.zero;
    let w = F2.pow(a, F2.sqrt_tm1d2);
    const a0 = F2.pow(F2.mul(F2.square(w), a), 2 ** (F2.sqrt_s - 1));
    if (F2.eq(a0, F2.negone)) return null;
    let v = F2.sqrt_s;
    let x = F2.mul(a, w);
    let b = F2.mul(x, w);
    let z = F2.sqrt_z;
    while (!F2.eq(b, F2.one)) {
      let b2k = F2.square(b);
      let k = 1;
      while (!F2.eq(b2k, F2.one)) {
        b2k = F2.square(b2k);
        k++;
      }
      w = z;
      for (let i = 0; i < v - k - 1; i++) {
        w = F2.square(w);
      }
      z = F2.square(w);
      b = F2.mul(b, z);
      x = F2.mul(x, w);
      v = k;
    }
    return F2.geq(x, F2.zero) ? x : F2.neg(x);
  };
}
function alg4_kong(F) {
  F.sqrt = function() {
    throw new Error("Sqrt alg 4 not implemented");
  };
}
function alg3_atkin(F) {
  F.sqrt = function() {
    throw new Error("Sqrt alg 3 not implemented");
  };
}
function alg2_shanks(F) {
  F.sqrt_q = pow(F.p, F.m);
  F.sqrt_e1 = div(sub(F.sqrt_q, 3), 4);
  F.sqrt = function(a) {
    if (this.isZero(a)) return this.zero;
    const a1 = this.pow(a, this.sqrt_e1);
    const a0 = this.mul(this.square(a1), a);
    if (this.eq(a0, this.negone)) return null;
    const x = this.mul(a1, a);
    return F.geq(x, F.zero) ? x : F.neg(x);
  };
}
function alg10_adj(F) {
  F.sqrt = function() {
    throw new Error("Sqrt alg 10 not implemented");
  };
}
function alg9_adj(F) {
  F.sqrt_q = pow(F.p, F.m / 2);
  F.sqrt_e34 = div(sub(F.sqrt_q, 3), 4);
  F.sqrt_e12 = div(sub(F.sqrt_q, 1), 2);
  F.frobenius = function(n, x) {
    if (n % 2 == 1) {
      return F.conjugate(x);
    } else {
      return x;
    }
  };
  F.sqrt = function(a) {
    const F2 = this;
    const a1 = F2.pow(a, F2.sqrt_e34);
    const alfa = F2.mul(F2.square(a1), a);
    const a0 = F2.mul(F2.frobenius(1, alfa), alfa);
    if (F2.eq(a0, F2.negone)) return null;
    const x0 = F2.mul(a1, a);
    let x;
    if (F2.eq(alfa, F2.negone)) {
      x = F2.mul(x0, [F2.F.zero, F2.F.one]);
    } else {
      const b = F2.pow(F2.add(F2.one, alfa), F2.sqrt_e12);
      x = F2.mul(b, x0);
    }
    return F2.geq(x, F2.zero) ? x : F2.neg(x);
  };
}
function alg8_complex(F) {
  F.sqrt = function() {
    throw new Error("Sqrt alg 8 not implemented");
  };
}
function quarterRound(st, a, b, c, d) {
  st[a] = st[a] + st[b] >>> 0;
  st[d] = (st[d] ^ st[a]) >>> 0;
  st[d] = (st[d] << 16 | st[d] >>> 16 & 65535) >>> 0;
  st[c] = st[c] + st[d] >>> 0;
  st[b] = (st[b] ^ st[c]) >>> 0;
  st[b] = (st[b] << 12 | st[b] >>> 20 & 4095) >>> 0;
  st[a] = st[a] + st[b] >>> 0;
  st[d] = (st[d] ^ st[a]) >>> 0;
  st[d] = (st[d] << 8 | st[d] >>> 24 & 255) >>> 0;
  st[c] = st[c] + st[d] >>> 0;
  st[b] = (st[b] ^ st[c]) >>> 0;
  st[b] = (st[b] << 7 | st[b] >>> 25 & 127) >>> 0;
}
function doubleRound(st) {
  quarterRound(st, 0, 4, 8, 12);
  quarterRound(st, 1, 5, 9, 13);
  quarterRound(st, 2, 6, 10, 14);
  quarterRound(st, 3, 7, 11, 15);
  quarterRound(st, 0, 5, 10, 15);
  quarterRound(st, 1, 6, 11, 12);
  quarterRound(st, 2, 7, 8, 13);
  quarterRound(st, 3, 4, 9, 14);
}
var ChaCha = class {
  constructor(seed) {
    seed = seed || [0, 0, 0, 0, 0, 0, 0, 0];
    this.state = [
      1634760805,
      857760878,
      2036477234,
      1797285236,
      seed[0],
      seed[1],
      seed[2],
      seed[3],
      seed[4],
      seed[5],
      seed[6],
      seed[7],
      0,
      0,
      0,
      0
    ];
    this.idx = 16;
    this.buff = new Array(16);
  }
  nextU32() {
    if (this.idx == 16) this.update();
    return this.buff[this.idx++];
  }
  nextU64() {
    return add(mul(this.nextU32(), 4294967296), this.nextU32());
  }
  nextBool() {
    return (this.nextU32() & 1) == 1;
  }
  update() {
    for (let i = 0; i < 16; i++) this.buff[i] = this.state[i];
    for (let i = 0; i < 10; i++) doubleRound(this.buff);
    for (let i = 0; i < 16; i++) this.buff[i] = this.buff[i] + this.state[i] >>> 0;
    this.idx = 0;
    this.state[12] = this.state[12] + 1 >>> 0;
    if (this.state[12] != 0) return;
    this.state[13] = this.state[13] + 1 >>> 0;
    if (this.state[13] != 0) return;
    this.state[14] = this.state[14] + 1 >>> 0;
    if (this.state[14] != 0) return;
    this.state[15] = this.state[15] + 1 >>> 0;
  }
};
function getRandomBytes(n) {
  let array = new Uint8Array(n);
  {
    if (typeof globalThis.crypto !== "undefined") {
      globalThis.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < n; i++) {
        array[i] = Math.random() * 4294967296 >>> 0;
      }
    }
  }
  return array;
}
function getRandomSeed() {
  const arr = getRandomBytes(32);
  const arrV = new Uint32Array(arr.buffer);
  const seed = [];
  for (let i = 0; i < 8; i++) {
    seed.push(arrV[i]);
  }
  return seed;
}
var threadRng = null;
function getThreadRng() {
  if (threadRng) return threadRng;
  threadRng = new ChaCha(getRandomSeed());
  return threadRng;
}
var FFT = class {
  constructor(G, F, opMulGF) {
    this.F = F;
    this.G = G;
    this.opMulGF = opMulGF;
    let rem = F.sqrt_t || F.t;
    let s = F.sqrt_s || F.s;
    let nqr = F.one;
    while (F.eq(F.pow(nqr, F.half), F.one)) nqr = F.add(nqr, F.one);
    this.w = new Array(s + 1);
    this.wi = new Array(s + 1);
    this.w[s] = this.F.pow(nqr, rem);
    this.wi[s] = this.F.inv(this.w[s]);
    let n = s - 1;
    while (n >= 0) {
      this.w[n] = this.F.square(this.w[n + 1]);
      this.wi[n] = this.F.square(this.wi[n + 1]);
      n--;
    }
    this.roots = [];
    this._setRoots(Math.min(s, 15));
  }
  _setRoots(n) {
    for (let i = n; i >= 0 && !this.roots[i]; i--) {
      let r = this.F.one;
      const nroots = 1 << i;
      const rootsi = new Array(nroots);
      for (let j = 0; j < nroots; j++) {
        rootsi[j] = r;
        r = this.F.mul(r, this.w[i]);
      }
      this.roots[i] = rootsi;
    }
  }
  fft(p) {
    if (p.length <= 1) return p;
    const bits2 = log2$1(p.length - 1) + 1;
    this._setRoots(bits2);
    const m = 1 << bits2;
    if (p.length != m) {
      throw new Error("Size must be multiple of 2");
    }
    const res = __fft(this, p, bits2, 0, 1);
    return res;
  }
  ifft(p) {
    if (p.length <= 1) return p;
    const bits2 = log2$1(p.length - 1) + 1;
    this._setRoots(bits2);
    const m = 1 << bits2;
    if (p.length != m) {
      throw new Error("Size must be multiple of 2");
    }
    const res = __fft(this, p, bits2, 0, 1);
    const twoinvm = this.F.inv(this.F.mulScalar(this.F.one, m));
    const resn = new Array(m);
    for (let i = 0; i < m; i++) {
      resn[i] = this.opMulGF(res[(m - i) % m], twoinvm);
    }
    return resn;
  }
};
function log2$1(V) {
  return ((V & 4294901760) !== 0 ? (V &= 4294901760, 16) : 0) | ((V & 4278255360) !== 0 ? (V &= 4278255360, 8) : 0) | ((V & 4042322160) !== 0 ? (V &= 4042322160, 4) : 0) | ((V & 3435973836) !== 0 ? (V &= 3435973836, 2) : 0) | (V & 2863311530) !== 0;
}
function __fft(PF, pall, bits2, offset, step) {
  const n = 1 << bits2;
  if (n == 1) {
    return [pall[offset]];
  } else if (n == 2) {
    return [
      PF.G.add(pall[offset], pall[offset + step]),
      PF.G.sub(pall[offset], pall[offset + step])
    ];
  }
  const ndiv2 = n >> 1;
  const p1 = __fft(PF, pall, bits2 - 1, offset, step * 2);
  const p2 = __fft(PF, pall, bits2 - 1, offset + step, step * 2);
  const out = new Array(n);
  for (let i = 0; i < ndiv2; i++) {
    out[i] = PF.G.add(p1[i], PF.opMulGF(p2[i], PF.roots[bits2][i]));
    out[i + ndiv2] = PF.G.sub(p1[i], PF.opMulGF(p2[i], PF.roots[bits2][i]));
  }
  return out;
}
var ZqField = class {
  constructor(p) {
    this.type = "F1";
    this.one = BigInt(1);
    this.zero = BigInt(0);
    this.p = BigInt(p);
    this.m = 1;
    this.negone = this.p - this.one;
    this.two = BigInt(2);
    this.half = this.p >> this.one;
    this.bitLength = bitLength$6(this.p);
    this.mask = (this.one << BigInt(this.bitLength)) - this.one;
    this.n64 = Math.floor((this.bitLength - 1) / 64) + 1;
    this.n32 = this.n64 * 2;
    this.n8 = this.n64 * 8;
    this.R = this.e(this.one << BigInt(this.n64 * 64));
    this.Ri = this.inv(this.R);
    const e2 = this.negone >> this.one;
    this.nqr = this.two;
    let r = this.pow(this.nqr, e2);
    while (!this.eq(r, this.negone)) {
      this.nqr = this.nqr + this.one;
      r = this.pow(this.nqr, e2);
    }
    this.s = 0;
    this.t = this.negone;
    while ((this.t & this.one) == this.zero) {
      this.s = this.s + 1;
      this.t = this.t >> this.one;
    }
    this.nqr_to_t = this.pow(this.nqr, this.t);
    buildSqrt(this);
    this.FFT = new FFT(this, this, this.mul.bind(this));
    this.fft = this.FFT.fft.bind(this.FFT);
    this.ifft = this.FFT.ifft.bind(this.FFT);
    this.w = this.FFT.w;
    this.wi = this.FFT.wi;
    this.shift = this.square(this.nqr);
    this.k = this.exp(this.nqr, 2 ** this.s);
  }
  e(a, b) {
    let res;
    if (!b) {
      res = BigInt(a);
    } else if (b == 16) {
      res = BigInt("0x" + a);
    }
    if (res < 0) {
      let nres = -res;
      if (nres >= this.p) nres = nres % this.p;
      return this.p - nres;
    } else {
      return res >= this.p ? res % this.p : res;
    }
  }
  add(a, b) {
    const res = a + b;
    return res >= this.p ? res - this.p : res;
  }
  sub(a, b) {
    return a >= b ? a - b : this.p - b + a;
  }
  neg(a) {
    return a ? this.p - a : a;
  }
  mul(a, b) {
    return a * b % this.p;
  }
  mulScalar(base, s) {
    return base * this.e(s) % this.p;
  }
  square(a) {
    return a * a % this.p;
  }
  eq(a, b) {
    return a == b;
  }
  neq(a, b) {
    return a != b;
  }
  lt(a, b) {
    const aa = a > this.half ? a - this.p : a;
    const bb = b > this.half ? b - this.p : b;
    return aa < bb;
  }
  gt(a, b) {
    const aa = a > this.half ? a - this.p : a;
    const bb = b > this.half ? b - this.p : b;
    return aa > bb;
  }
  leq(a, b) {
    const aa = a > this.half ? a - this.p : a;
    const bb = b > this.half ? b - this.p : b;
    return aa <= bb;
  }
  geq(a, b) {
    const aa = a > this.half ? a - this.p : a;
    const bb = b > this.half ? b - this.p : b;
    return aa >= bb;
  }
  div(a, b) {
    return this.mul(a, this.inv(b));
  }
  idiv(a, b) {
    if (!b) throw new Error("Division by zero");
    return a / b;
  }
  inv(a) {
    if (!a) throw new Error("Division by zero");
    let t = this.zero;
    let r = this.p;
    let newt = this.one;
    let newr = a % this.p;
    while (newr) {
      let q = r / newr;
      [t, newt] = [newt, t - q * newt];
      [r, newr] = [newr, r - q * newr];
    }
    if (t < this.zero) t += this.p;
    return t;
  }
  mod(a, b) {
    return a % b;
  }
  pow(b, e2) {
    return exp(this, b, e2);
  }
  exp(b, e2) {
    return exp(this, b, e2);
  }
  band(a, b) {
    const res = a & b & this.mask;
    return res >= this.p ? res - this.p : res;
  }
  bor(a, b) {
    const res = (a | b) & this.mask;
    return res >= this.p ? res - this.p : res;
  }
  bxor(a, b) {
    const res = (a ^ b) & this.mask;
    return res >= this.p ? res - this.p : res;
  }
  bnot(a) {
    const res = a ^ this.mask;
    return res >= this.p ? res - this.p : res;
  }
  shl(a, b) {
    if (Number(b) < this.bitLength) {
      const res = a << b & this.mask;
      return res >= this.p ? res - this.p : res;
    } else {
      const nb = this.p - b;
      if (Number(nb) < this.bitLength) {
        return a >> nb;
      } else {
        return this.zero;
      }
    }
  }
  shr(a, b) {
    if (Number(b) < this.bitLength) {
      return a >> b;
    } else {
      const nb = this.p - b;
      if (Number(nb) < this.bitLength) {
        const res = a << nb & this.mask;
        return res >= this.p ? res - this.p : res;
      } else {
        return 0;
      }
    }
  }
  land(a, b) {
    return a && b ? this.one : this.zero;
  }
  lor(a, b) {
    return a || b ? this.one : this.zero;
  }
  lnot(a) {
    return a ? this.zero : this.one;
  }
  sqrt_old(n) {
    if (n == this.zero) return this.zero;
    const res = this.pow(n, this.negone >> this.one);
    if (res != this.one) return null;
    let m = this.s;
    let c = this.nqr_to_t;
    let t = this.pow(n, this.t);
    let r = this.pow(n, this.add(this.t, this.one) >> this.one);
    while (t != this.one) {
      let sq = this.square(t);
      let i = 1;
      while (sq != this.one) {
        i++;
        sq = this.square(sq);
      }
      let b = c;
      for (let j = 0; j < m - i - 1; j++) b = this.square(b);
      m = i;
      c = this.square(b);
      t = this.mul(t, c);
      r = this.mul(r, b);
    }
    if (r > this.p >> this.one) {
      r = this.neg(r);
    }
    return r;
  }
  normalize(a, b) {
    a = BigInt(a, b);
    if (a < 0) {
      let na = -a;
      if (na >= this.p) na = na % this.p;
      return this.p - na;
    } else {
      return a >= this.p ? a % this.p : a;
    }
  }
  random() {
    const nBytes = this.bitLength * 2 / 8;
    let res = this.zero;
    for (let i = 0; i < nBytes; i++) {
      res = (res << BigInt(8)) + BigInt(getRandomBytes(1)[0]);
    }
    return res % this.p;
  }
  toString(a, base) {
    base = base || 10;
    let vs;
    if (a > this.half && base == 10) {
      const v = this.p - a;
      vs = "-" + v.toString(base);
    } else {
      vs = a.toString(base);
    }
    return vs;
  }
  isZero(a) {
    return a == this.zero;
  }
  fromRng(rng) {
    let v;
    do {
      v = this.zero;
      for (let i = 0; i < this.n64; i++) {
        v += rng.nextU64() << BigInt(64 * i);
      }
      v &= this.mask;
    } while (v >= this.p);
    v = v * this.Ri % this.p;
    return v;
  }
  fft(a) {
    return this.FFT.fft(a);
  }
  ifft(a) {
    return this.FFT.ifft(a);
  }
  // Returns a buffer with Little Endian Representation
  toRprLE(buff, o, e2) {
    toRprLE(buff, o, e2, this.n64 * 8);
  }
  // Returns a buffer with Big Endian Representation
  toRprBE(buff, o, e2) {
    toRprBE(buff, o, e2, this.n64 * 8);
  }
  // Returns a buffer with Big Endian Montgomery Representation
  toRprBEM(buff, o, e2) {
    return this.toRprBE(buff, o, this.mul(this.R, e2));
  }
  toRprLEM(buff, o, e2) {
    return this.toRprLE(buff, o, this.mul(this.R, e2));
  }
  // Pases a buffer with Little Endian Representation
  fromRprLE(buff, o) {
    return fromRprLE(buff, o, this.n8);
  }
  // Pases a buffer with Big Endian Representation
  fromRprBE(buff, o) {
    return fromRprBE(buff, o, this.n8);
  }
  fromRprLEM(buff, o) {
    return this.mul(this.fromRprLE(buff, o), this.Ri);
  }
  fromRprBEM(buff, o) {
    return this.mul(this.fromRprBE(buff, o), this.Ri);
  }
  toObject(a) {
    return a;
  }
};
var utils$6 = {};
utils$6.bigInt2BytesLE = function bigInt2BytesLE(_a, len) {
  const b = Array(len);
  let v = BigInt(_a);
  for (let i = 0; i < len; i++) {
    b[i] = Number(v & 0xFFn);
    v = v >> 8n;
  }
  return b;
};
utils$6.bigInt2U32LE = function bigInt2BytesLE2(_a, len) {
  const b = Array(len);
  let v = BigInt(_a);
  for (let i = 0; i < len; i++) {
    b[i] = Number(v & 0xFFFFFFFFn);
    v = v >> 32n;
  }
  return b;
};
utils$6.isOcamNum = function(a) {
  if (!Array.isArray(a)) return false;
  if (a.length != 3) return false;
  if (typeof a[0] !== "number") return false;
  if (typeof a[1] !== "number") return false;
  if (!Array.isArray(a[2])) return false;
  return true;
};
var build_int = function buildInt(module, n64, _prefix) {
  const prefix = _prefix || "int";
  if (module.modules[prefix]) return prefix;
  module.modules[prefix] = {};
  const n32 = n64 * 2;
  const n8 = n64 * 8;
  function buildCopy() {
    const f = module.addFunction(prefix + "_copy");
    f.addParam("px", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    for (let i = 0; i < n64; i++) {
      f.addCode(
        c.i64_store(
          c.getLocal("pr"),
          i * 8,
          c.i64_load(
            c.getLocal("px"),
            i * 8
          )
        )
      );
    }
  }
  function buildZero() {
    const f = module.addFunction(prefix + "_zero");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    for (let i = 0; i < n64; i++) {
      f.addCode(
        c.i64_store(
          c.getLocal("pr"),
          i * 8,
          c.i64_const(0)
        )
      );
    }
  }
  function buildOne() {
    const f = module.addFunction(prefix + "_one");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.i64_store(
        c.getLocal("pr"),
        0,
        c.i64_const(1)
      )
    );
    for (let i = 1; i < n64; i++) {
      f.addCode(
        c.i64_store(
          c.getLocal("pr"),
          i * 8,
          c.i64_const(0)
        )
      );
    }
  }
  function buildIsZero() {
    const f = module.addFunction(prefix + "_isZero");
    f.addParam("px", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    function getCompCode(n) {
      if (n == 0) {
        return c.ret(c.i64_eqz(
          c.i64_load(c.getLocal("px"))
        ));
      }
      return c.if(
        c.i64_eqz(
          c.i64_load(c.getLocal("px"), n * 8)
        ),
        getCompCode(n - 1),
        c.ret(c.i32_const(0))
      );
    }
    f.addCode(getCompCode(n64 - 1));
    f.addCode(c.ret(c.i32_const(0)));
  }
  function buildEq() {
    const f = module.addFunction(prefix + "_eq");
    f.addParam("px", "i32");
    f.addParam("py", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    function getCompCode(n) {
      if (n == 0) {
        return c.ret(c.i64_eq(
          c.i64_load(c.getLocal("px")),
          c.i64_load(c.getLocal("py"))
        ));
      }
      return c.if(
        c.i64_eq(
          c.i64_load(c.getLocal("px"), n * 8),
          c.i64_load(c.getLocal("py"), n * 8)
        ),
        getCompCode(n - 1),
        c.ret(c.i32_const(0))
      );
    }
    f.addCode(getCompCode(n64 - 1));
    f.addCode(c.ret(c.i32_const(0)));
  }
  function buildGte() {
    const f = module.addFunction(prefix + "_gte");
    f.addParam("px", "i32");
    f.addParam("py", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    function getCompCode(n) {
      if (n == 0) {
        return c.ret(c.i64_ge_u(
          c.i64_load(c.getLocal("px")),
          c.i64_load(c.getLocal("py"))
        ));
      }
      return c.if(
        c.i64_lt_u(
          c.i64_load(c.getLocal("px"), n * 8),
          c.i64_load(c.getLocal("py"), n * 8)
        ),
        c.ret(c.i32_const(0)),
        c.if(
          c.i64_gt_u(
            c.i64_load(c.getLocal("px"), n * 8),
            c.i64_load(c.getLocal("py"), n * 8)
          ),
          c.ret(c.i32_const(1)),
          getCompCode(n - 1)
        )
      );
    }
    f.addCode(getCompCode(n64 - 1));
    f.addCode(c.ret(c.i32_const(0)));
  }
  function buildAdd() {
    const f = module.addFunction(prefix + "_add");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    f.setReturnType("i32");
    f.addLocal("c", "i64");
    const c = f.getCodeBuilder();
    f.addCode(c.setLocal(
      "c",
      c.i64_add(
        c.i64_load32_u(c.getLocal("x")),
        c.i64_load32_u(c.getLocal("y"))
      )
    ));
    f.addCode(c.i64_store32(
      c.getLocal("r"),
      c.getLocal("c")
    ));
    for (let i = 1; i < n32; i++) {
      f.addCode(c.setLocal(
        "c",
        c.i64_add(
          c.i64_add(
            c.i64_load32_u(c.getLocal("x"), 4 * i),
            c.i64_load32_u(c.getLocal("y"), 4 * i)
          ),
          c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
        )
      ));
      f.addCode(c.i64_store32(
        c.getLocal("r"),
        i * 4,
        c.getLocal("c")
      ));
    }
    f.addCode(c.i32_wrap_i64(c.i64_shr_u(c.getLocal("c"), c.i64_const(32))));
  }
  function buildSub() {
    const f = module.addFunction(prefix + "_sub");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    f.setReturnType("i32");
    f.addLocal("c", "i64");
    const c = f.getCodeBuilder();
    f.addCode(c.setLocal(
      "c",
      c.i64_sub(
        c.i64_load32_u(c.getLocal("x")),
        c.i64_load32_u(c.getLocal("y"))
      )
    ));
    f.addCode(c.i64_store32(
      c.getLocal("r"),
      c.i64_and(
        c.getLocal("c"),
        c.i64_const("0xFFFFFFFF")
      )
    ));
    for (let i = 1; i < n32; i++) {
      f.addCode(c.setLocal(
        "c",
        c.i64_add(
          c.i64_sub(
            c.i64_load32_u(c.getLocal("x"), 4 * i),
            c.i64_load32_u(c.getLocal("y"), 4 * i)
          ),
          c.i64_shr_s(c.getLocal("c"), c.i64_const(32))
        )
      ));
      f.addCode(c.i64_store32(
        c.getLocal("r"),
        i * 4,
        c.i64_and(c.getLocal("c"), c.i64_const("0xFFFFFFFF"))
      ));
    }
    f.addCode(c.i32_wrap_i64(c.i64_shr_s(c.getLocal("c"), c.i64_const(32))));
  }
  function buildMul() {
    const f = module.addFunction(prefix + "_mul");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    f.addLocal("c0", "i64");
    f.addLocal("c1", "i64");
    for (let i = 0; i < n32; i++) {
      f.addLocal("x" + i, "i64");
      f.addLocal("y" + i, "i64");
    }
    const c = f.getCodeBuilder();
    const loadX = [];
    const loadY = [];
    function mulij(i, j) {
      let X, Y;
      if (!loadX[i]) {
        X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
        loadX[i] = true;
      } else {
        X = c.getLocal("x" + i);
      }
      if (!loadY[j]) {
        Y = c.teeLocal("y" + j, c.i64_load32_u(c.getLocal("y"), j * 4));
        loadY[j] = true;
      } else {
        Y = c.getLocal("y" + j);
      }
      return c.i64_mul(X, Y);
    }
    let c0 = "c0";
    let c1 = "c1";
    for (let k = 0; k < n32 * 2 - 1; k++) {
      for (let i = Math.max(0, k - n32 + 1); i <= k && i < n32; i++) {
        const j = k - i;
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulij(i, j)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      f.addCode(
        c.i64_store32(
          c.getLocal("r"),
          k * 4,
          c.getLocal(c0)
        )
      );
      [c0, c1] = [c1, c0];
      f.addCode(
        c.setLocal(
          c1,
          c.i64_shr_u(
            c.getLocal(c0),
            c.i64_const(32)
          )
        )
      );
    }
    f.addCode(
      c.i64_store32(
        c.getLocal("r"),
        n32 * 4 * 2 - 4,
        c.getLocal(c0)
      )
    );
  }
  function buildSquare() {
    const f = module.addFunction(prefix + "_square");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    f.addLocal("c0", "i64");
    f.addLocal("c1", "i64");
    f.addLocal("c0_old", "i64");
    f.addLocal("c1_old", "i64");
    for (let i = 0; i < n32; i++) {
      f.addLocal("x" + i, "i64");
    }
    const c = f.getCodeBuilder();
    const loadX = [];
    function mulij(i, j) {
      let X, Y;
      if (!loadX[i]) {
        X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
        loadX[i] = true;
      } else {
        X = c.getLocal("x" + i);
      }
      if (!loadX[j]) {
        Y = c.teeLocal("x" + j, c.i64_load32_u(c.getLocal("x"), j * 4));
        loadX[j] = true;
      } else {
        Y = c.getLocal("x" + j);
      }
      return c.i64_mul(X, Y);
    }
    let c0 = "c0";
    let c1 = "c1";
    let c0_old = "c0_old";
    let c1_old = "c1_old";
    for (let k = 0; k < n32 * 2 - 1; k++) {
      f.addCode(
        c.setLocal(c0, c.i64_const(0)),
        c.setLocal(c1, c.i64_const(0))
      );
      for (let i = Math.max(0, k - n32 + 1); i < k + 1 >> 1 && i < n32; i++) {
        const j = k - i;
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulij(i, j)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      f.addCode(
        c.setLocal(
          c0,
          c.i64_shl(
            c.i64_and(
              c.getLocal(c0),
              c.i64_const(4294967295)
            ),
            c.i64_const(1)
          )
        )
      );
      f.addCode(
        c.setLocal(
          c1,
          c.i64_add(
            c.i64_shl(
              c.getLocal(c1),
              c.i64_const(1)
            ),
            c.i64_shr_u(
              c.getLocal(c0),
              c.i64_const(32)
            )
          )
        )
      );
      if (k % 2 == 0) {
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulij(k >> 1, k >> 1)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      if (k > 0) {
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              c.i64_and(
                c.getLocal(c0_old),
                c.i64_const(4294967295)
              )
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.i64_add(
                c.getLocal(c1),
                c.i64_shr_u(
                  c.getLocal(c0),
                  c.i64_const(32)
                )
              ),
              c.getLocal(c1_old)
            )
          )
        );
      }
      f.addCode(
        c.i64_store32(
          c.getLocal("r"),
          k * 4,
          c.getLocal(c0)
        )
      );
      f.addCode(
        c.setLocal(
          c0_old,
          c.getLocal(c1)
        ),
        c.setLocal(
          c1_old,
          c.i64_shr_u(
            c.getLocal(c0_old),
            c.i64_const(32)
          )
        )
      );
    }
    f.addCode(
      c.i64_store32(
        c.getLocal("r"),
        n32 * 4 * 2 - 4,
        c.getLocal(c0_old)
      )
    );
  }
  function buildSquareOld() {
    const f = module.addFunction(prefix + "_squareOld");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(prefix + "_mul", c.getLocal("x"), c.getLocal("x"), c.getLocal("r")));
  }
  function _buildMul1() {
    const f = module.addFunction(prefix + "__mul1");
    f.addParam("px", "i32");
    f.addParam("y", "i64");
    f.addParam("pr", "i32");
    f.addLocal("c", "i64");
    const c = f.getCodeBuilder();
    f.addCode(c.setLocal(
      "c",
      c.i64_mul(
        c.i64_load32_u(c.getLocal("px"), 0, 0),
        c.getLocal("y")
      )
    ));
    f.addCode(c.i64_store32(
      c.getLocal("pr"),
      0,
      0,
      c.getLocal("c")
    ));
    for (let i = 1; i < n32; i++) {
      f.addCode(c.setLocal(
        "c",
        c.i64_add(
          c.i64_mul(
            c.i64_load32_u(c.getLocal("px"), 4 * i, 0),
            c.getLocal("y")
          ),
          c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
        )
      ));
      f.addCode(c.i64_store32(
        c.getLocal("pr"),
        i * 4,
        0,
        c.getLocal("c")
      ));
    }
  }
  function _buildAdd1() {
    const f = module.addFunction(prefix + "__add1");
    f.addParam("x", "i32");
    f.addParam("y", "i64");
    f.addLocal("c", "i64");
    f.addLocal("px", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.setLocal("px", c.getLocal("x")));
    f.addCode(c.setLocal(
      "c",
      c.i64_add(
        c.i64_load32_u(c.getLocal("px"), 0, 0),
        c.getLocal("y")
      )
    ));
    f.addCode(c.i64_store32(
      c.getLocal("px"),
      0,
      0,
      c.getLocal("c")
    ));
    f.addCode(c.setLocal(
      "c",
      c.i64_shr_u(
        c.getLocal("c"),
        c.i64_const(32)
      )
    ));
    f.addCode(c.block(c.loop(
      c.br_if(
        1,
        c.i64_eqz(c.getLocal("c"))
      ),
      c.setLocal(
        "px",
        c.i32_add(
          c.getLocal("px"),
          c.i32_const(4)
        )
      ),
      c.setLocal(
        "c",
        c.i64_add(
          c.i64_load32_u(c.getLocal("px"), 0, 0),
          c.getLocal("c")
        )
      ),
      c.i64_store32(
        c.getLocal("px"),
        0,
        0,
        c.getLocal("c")
      ),
      c.setLocal(
        "c",
        c.i64_shr_u(
          c.getLocal("c"),
          c.i64_const(32)
        )
      ),
      c.br(0)
    )));
  }
  function buildDiv() {
    _buildMul1();
    _buildAdd1();
    const f = module.addFunction(prefix + "_div");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("c", "i32");
    f.addParam("r", "i32");
    f.addLocal("rr", "i32");
    f.addLocal("cc", "i32");
    f.addLocal("eX", "i32");
    f.addLocal("eY", "i32");
    f.addLocal("sy", "i64");
    f.addLocal("sx", "i64");
    f.addLocal("ec", "i32");
    const c = f.getCodeBuilder();
    const Y = c.i32_const(module.alloc(n8));
    const Caux = c.i32_const(module.alloc(n8));
    const Raux = c.i32_const(module.alloc(n8));
    const C = c.getLocal("cc");
    const R = c.getLocal("rr");
    const pr1 = module.alloc(n8 * 2);
    const R1 = c.i32_const(pr1);
    const R2 = c.i32_const(pr1 + n8);
    f.addCode(c.if(
      c.getLocal("c"),
      c.setLocal("cc", c.getLocal("c")),
      c.setLocal("cc", Caux)
    ));
    f.addCode(c.if(
      c.getLocal("r"),
      c.setLocal("rr", c.getLocal("r")),
      c.setLocal("rr", Raux)
    ));
    f.addCode(c.call(prefix + "_copy", c.getLocal("x"), R));
    f.addCode(c.call(prefix + "_copy", c.getLocal("y"), Y));
    f.addCode(c.call(prefix + "_zero", C));
    f.addCode(c.call(prefix + "_zero", R1));
    f.addCode(c.setLocal("eX", c.i32_const(n8 - 1)));
    f.addCode(c.setLocal("eY", c.i32_const(n8 - 1)));
    f.addCode(c.block(c.loop(
      c.br_if(
        1,
        c.i32_or(
          c.i32_load8_u(
            c.i32_add(Y, c.getLocal("eY")),
            0,
            0
          ),
          c.i32_eq(
            c.getLocal("eY"),
            c.i32_const(3)
          )
        )
      ),
      c.setLocal("eY", c.i32_sub(c.getLocal("eY"), c.i32_const(1))),
      c.br(0)
    )));
    f.addCode(
      c.setLocal(
        "sy",
        c.i64_add(
          c.i64_load32_u(
            c.i32_sub(
              c.i32_add(Y, c.getLocal("eY")),
              c.i32_const(3)
            ),
            0,
            0
          ),
          c.i64_const(1)
        )
      )
    );
    f.addCode(
      c.if(
        c.i64_eq(
          c.getLocal("sy"),
          c.i64_const(1)
        ),
        c.drop(c.i64_div_u(c.i64_const(0), c.i64_const(0)))
      )
    );
    f.addCode(c.block(c.loop(
      // while (eX>7)&&(Y[eX]==0) ex--;
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_or(
            c.i32_load8_u(
              c.i32_add(R, c.getLocal("eX")),
              0,
              0
            ),
            c.i32_eq(
              c.getLocal("eX"),
              c.i32_const(7)
            )
          )
        ),
        c.setLocal("eX", c.i32_sub(c.getLocal("eX"), c.i32_const(1))),
        c.br(0)
      )),
      c.setLocal(
        "sx",
        c.i64_load(
          c.i32_sub(
            c.i32_add(R, c.getLocal("eX")),
            c.i32_const(7)
          ),
          0,
          0
        )
      ),
      c.setLocal(
        "sx",
        c.i64_div_u(
          c.getLocal("sx"),
          c.getLocal("sy")
        )
      ),
      c.setLocal(
        "ec",
        c.i32_sub(
          c.i32_sub(
            c.getLocal("eX"),
            c.getLocal("eY")
          ),
          c.i32_const(4)
        )
      ),
      // While greater than 32 bits or ec is neg, shr and inc exp
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_and(
            c.i64_eqz(
              c.i64_and(
                c.getLocal("sx"),
                c.i64_const("0xFFFFFFFF00000000")
              )
            ),
            c.i32_ge_s(
              c.getLocal("ec"),
              c.i32_const(0)
            )
          )
        ),
        c.setLocal(
          "sx",
          c.i64_shr_u(
            c.getLocal("sx"),
            c.i64_const(8)
          )
        ),
        c.setLocal(
          "ec",
          c.i32_add(
            c.getLocal("ec"),
            c.i32_const(1)
          )
        ),
        c.br(0)
      )),
      c.if(
        c.i64_eqz(c.getLocal("sx")),
        [
          ...c.br_if(
            2,
            c.i32_eqz(c.call(prefix + "_gte", R, Y))
          ),
          ...c.setLocal("sx", c.i64_const(1)),
          ...c.setLocal("ec", c.i32_const(0))
        ]
      ),
      c.call(prefix + "__mul1", Y, c.getLocal("sx"), R2),
      c.drop(c.call(
        prefix + "_sub",
        R,
        c.i32_sub(R2, c.getLocal("ec")),
        R
      )),
      c.call(
        prefix + "__add1",
        c.i32_add(C, c.getLocal("ec")),
        c.getLocal("sx")
      ),
      c.br(0)
    )));
  }
  function buildInverseMod() {
    const f = module.addFunction(prefix + "_inverseMod");
    f.addParam("px", "i32");
    f.addParam("pm", "i32");
    f.addParam("pr", "i32");
    f.addLocal("t", "i32");
    f.addLocal("newt", "i32");
    f.addLocal("r", "i32");
    f.addLocal("qq", "i32");
    f.addLocal("qr", "i32");
    f.addLocal("newr", "i32");
    f.addLocal("swp", "i32");
    f.addLocal("x", "i32");
    f.addLocal("signt", "i32");
    f.addLocal("signnewt", "i32");
    f.addLocal("signx", "i32");
    const c = f.getCodeBuilder();
    const aux1 = c.i32_const(module.alloc(n8));
    const aux2 = c.i32_const(module.alloc(n8));
    const aux3 = c.i32_const(module.alloc(n8));
    const aux4 = c.i32_const(module.alloc(n8));
    const aux5 = c.i32_const(module.alloc(n8));
    const aux6 = c.i32_const(module.alloc(n8));
    const mulBuff = c.i32_const(module.alloc(n8 * 2));
    const aux7 = c.i32_const(module.alloc(n8));
    f.addCode(
      c.setLocal("t", aux1),
      c.call(prefix + "_zero", aux1),
      c.setLocal("signt", c.i32_const(0))
    );
    f.addCode(
      c.setLocal("r", aux2),
      c.call(prefix + "_copy", c.getLocal("pm"), aux2)
    );
    f.addCode(
      c.setLocal("newt", aux3),
      c.call(prefix + "_one", aux3),
      c.setLocal("signnewt", c.i32_const(0))
    );
    f.addCode(
      c.setLocal("newr", aux4),
      c.call(prefix + "_copy", c.getLocal("px"), aux4)
    );
    f.addCode(c.setLocal("qq", aux5));
    f.addCode(c.setLocal("qr", aux6));
    f.addCode(c.setLocal("x", aux7));
    f.addCode(c.block(c.loop(
      c.br_if(
        1,
        c.call(prefix + "_isZero", c.getLocal("newr"))
      ),
      c.call(prefix + "_div", c.getLocal("r"), c.getLocal("newr"), c.getLocal("qq"), c.getLocal("qr")),
      c.call(prefix + "_mul", c.getLocal("qq"), c.getLocal("newt"), mulBuff),
      c.if(
        c.getLocal("signt"),
        c.if(
          c.getLocal("signnewt"),
          c.if(
            c.call(prefix + "_gte", mulBuff, c.getLocal("t")),
            [
              ...c.drop(c.call(prefix + "_sub", mulBuff, c.getLocal("t"), c.getLocal("x"))),
              ...c.setLocal("signx", c.i32_const(0))
            ],
            [
              ...c.drop(c.call(prefix + "_sub", c.getLocal("t"), mulBuff, c.getLocal("x"))),
              ...c.setLocal("signx", c.i32_const(1))
            ]
          ),
          [
            ...c.drop(c.call(prefix + "_add", mulBuff, c.getLocal("t"), c.getLocal("x"))),
            ...c.setLocal("signx", c.i32_const(1))
          ]
        ),
        c.if(
          c.getLocal("signnewt"),
          [
            ...c.drop(c.call(prefix + "_add", mulBuff, c.getLocal("t"), c.getLocal("x"))),
            ...c.setLocal("signx", c.i32_const(0))
          ],
          c.if(
            c.call(prefix + "_gte", c.getLocal("t"), mulBuff),
            [
              ...c.drop(c.call(prefix + "_sub", c.getLocal("t"), mulBuff, c.getLocal("x"))),
              ...c.setLocal("signx", c.i32_const(0))
            ],
            [
              ...c.drop(c.call(prefix + "_sub", mulBuff, c.getLocal("t"), c.getLocal("x"))),
              ...c.setLocal("signx", c.i32_const(1))
            ]
          )
        )
      ),
      c.setLocal("swp", c.getLocal("t")),
      c.setLocal("t", c.getLocal("newt")),
      c.setLocal("newt", c.getLocal("x")),
      c.setLocal("x", c.getLocal("swp")),
      c.setLocal("signt", c.getLocal("signnewt")),
      c.setLocal("signnewt", c.getLocal("signx")),
      c.setLocal("swp", c.getLocal("r")),
      c.setLocal("r", c.getLocal("newr")),
      c.setLocal("newr", c.getLocal("qr")),
      c.setLocal("qr", c.getLocal("swp")),
      c.br(0)
    )));
    f.addCode(c.if(
      c.getLocal("signt"),
      c.drop(c.call(prefix + "_sub", c.getLocal("pm"), c.getLocal("t"), c.getLocal("pr"))),
      c.call(prefix + "_copy", c.getLocal("t"), c.getLocal("pr"))
    ));
  }
  buildCopy();
  buildZero();
  buildIsZero();
  buildOne();
  buildEq();
  buildGte();
  buildAdd();
  buildSub();
  buildMul();
  buildSquare();
  buildSquareOld();
  buildDiv();
  buildInverseMod();
  module.exportFunction(prefix + "_copy");
  module.exportFunction(prefix + "_zero");
  module.exportFunction(prefix + "_one");
  module.exportFunction(prefix + "_isZero");
  module.exportFunction(prefix + "_eq");
  module.exportFunction(prefix + "_gte");
  module.exportFunction(prefix + "_add");
  module.exportFunction(prefix + "_sub");
  module.exportFunction(prefix + "_mul");
  module.exportFunction(prefix + "_square");
  module.exportFunction(prefix + "_squareOld");
  module.exportFunction(prefix + "_div");
  module.exportFunction(prefix + "_inverseMod");
  return prefix;
};
var build_timesscalar = function buildTimesScalar(module, fnName, elementLen, opAB, opAA, opCopy, opInit) {
  const f = module.addFunction(fnName);
  f.addParam("base", "i32");
  f.addParam("scalar", "i32");
  f.addParam("scalarLength", "i32");
  f.addParam("r", "i32");
  f.addLocal("i", "i32");
  f.addLocal("b", "i32");
  const c = f.getCodeBuilder();
  const aux = c.i32_const(module.alloc(elementLen));
  f.addCode(
    c.if(
      c.i32_eqz(c.getLocal("scalarLength")),
      [
        ...c.call(opInit, c.getLocal("r")),
        ...c.ret([])
      ]
    )
  );
  f.addCode(c.call(opCopy, c.getLocal("base"), aux));
  f.addCode(c.call(opInit, c.getLocal("r")));
  f.addCode(c.setLocal("i", c.getLocal("scalarLength")));
  f.addCode(c.block(c.loop(
    c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
    c.setLocal(
      "b",
      c.i32_load8_u(
        c.i32_add(
          c.getLocal("scalar"),
          c.getLocal("i")
        )
      )
    ),
    ...innerLoop(),
    c.br_if(1, c.i32_eqz(c.getLocal("i"))),
    c.br(0)
  )));
  function innerLoop() {
    const code = [];
    for (let i = 0; i < 8; i++) {
      code.push(
        ...c.call(opAA, c.getLocal("r"), c.getLocal("r")),
        ...c.if(
          c.i32_ge_u(c.getLocal("b"), c.i32_const(128 >> i)),
          [
            ...c.setLocal(
              "b",
              c.i32_sub(
                c.getLocal("b"),
                c.i32_const(128 >> i)
              )
            ),
            ...c.call(opAB, c.getLocal("r"), aux, c.getLocal("r"))
          ]
        )
      );
    }
    return code;
  }
};
var build_batchinverse = buildBatchInverse$3;
function buildBatchInverse$3(module, prefix) {
  const n8 = module.modules[prefix].n64 * 8;
  const f = module.addFunction(prefix + "_batchInverse");
  f.addParam("pIn", "i32");
  f.addParam("inStep", "i32");
  f.addParam("n", "i32");
  f.addParam("pOut", "i32");
  f.addParam("outStep", "i32");
  f.addLocal("itAux", "i32");
  f.addLocal("itIn", "i32");
  f.addLocal("itOut", "i32");
  f.addLocal("i", "i32");
  const c = f.getCodeBuilder();
  const AUX = c.i32_const(module.alloc(n8));
  f.addCode(
    c.setLocal("itAux", c.i32_load(c.i32_const(0))),
    c.i32_store(
      c.i32_const(0),
      c.i32_add(
        c.getLocal("itAux"),
        c.i32_mul(
          c.i32_add(
            c.getLocal("n"),
            c.i32_const(1)
          ),
          c.i32_const(n8)
        )
      )
    )
  );
  f.addCode(
    // aux[0] = a;
    c.call(prefix + "_one", c.getLocal("itAux")),
    // for (i=0;i<n;i++) aux[i] = aux[i-1]*in[i]
    c.setLocal("itIn", c.getLocal("pIn")),
    c.setLocal("itAux", c.i32_add(c.getLocal("itAux"), c.i32_const(n8))),
    c.setLocal("i", c.i32_const(0)),
    c.block(c.loop(
      c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
      c.if(
        c.call(prefix + "_isZero", c.getLocal("itIn")),
        c.call(
          prefix + "_copy",
          c.i32_sub(c.getLocal("itAux"), c.i32_const(n8)),
          c.getLocal("itAux")
        ),
        c.call(
          prefix + "_mul",
          c.getLocal("itIn"),
          c.i32_sub(c.getLocal("itAux"), c.i32_const(n8)),
          c.getLocal("itAux")
        )
      ),
      c.setLocal("itIn", c.i32_add(c.getLocal("itIn"), c.getLocal("inStep"))),
      c.setLocal("itAux", c.i32_add(c.getLocal("itAux"), c.i32_const(n8))),
      c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
      c.br(0)
    )),
    // point to the last
    c.setLocal("itIn", c.i32_sub(c.getLocal("itIn"), c.getLocal("inStep"))),
    c.setLocal("itAux", c.i32_sub(c.getLocal("itAux"), c.i32_const(n8))),
    // itOut = pOut + (n-1)*stepOut   // Point to the last
    c.setLocal(
      "itOut",
      c.i32_add(
        c.getLocal("pOut"),
        c.i32_mul(
          c.i32_sub(c.getLocal("n"), c.i32_const(1)),
          c.getLocal("outStep")
        )
      )
    ),
    // aux[n-1] = 1/aux[n-1]
    c.call(prefix + "_inverse", c.getLocal("itAux"), c.getLocal("itAux")),
    c.block(c.loop(
      c.br_if(1, c.i32_eqz(c.getLocal("i"))),
      c.if(
        c.call(prefix + "_isZero", c.getLocal("itIn")),
        [
          ...c.call(
            prefix + "_copy",
            c.getLocal("itAux"),
            c.i32_sub(c.getLocal("itAux"), c.i32_const(n8))
          ),
          ...c.call(
            prefix + "_zero",
            c.getLocal("itOut")
          )
        ],
        [
          ...c.call(prefix + "_copy", c.i32_sub(c.getLocal("itAux"), c.i32_const(n8)), AUX),
          ...c.call(
            prefix + "_mul",
            c.getLocal("itAux"),
            c.getLocal("itIn"),
            c.i32_sub(c.getLocal("itAux"), c.i32_const(n8))
          ),
          ...c.call(
            prefix + "_mul",
            c.getLocal("itAux"),
            AUX,
            c.getLocal("itOut")
          )
        ]
      ),
      c.setLocal("itIn", c.i32_sub(c.getLocal("itIn"), c.getLocal("inStep"))),
      c.setLocal("itOut", c.i32_sub(c.getLocal("itOut"), c.getLocal("outStep"))),
      c.setLocal("itAux", c.i32_sub(c.getLocal("itAux"), c.i32_const(n8))),
      c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
      c.br(0)
    ))
  );
  f.addCode(
    c.i32_store(
      c.i32_const(0),
      c.getLocal("itAux")
    )
  );
}
var build_batchconvertion = buildBatchConvertion$3;
function buildBatchConvertion$3(module, fnName, internalFnName, sizeIn, sizeOut, reverse) {
  if (typeof reverse === "undefined") {
    if (sizeIn < sizeOut) {
      reverse = true;
    } else {
      reverse = false;
    }
  }
  const f = module.addFunction(fnName);
  f.addParam("pIn", "i32");
  f.addParam("n", "i32");
  f.addParam("pOut", "i32");
  f.addLocal("i", "i32");
  f.addLocal("itIn", "i32");
  f.addLocal("itOut", "i32");
  const c = f.getCodeBuilder();
  if (reverse) {
    f.addCode(
      c.setLocal(
        "itIn",
        c.i32_add(
          c.getLocal("pIn"),
          c.i32_mul(
            c.i32_sub(
              c.getLocal("n"),
              c.i32_const(1)
            ),
            c.i32_const(sizeIn)
          )
        )
      ),
      c.setLocal(
        "itOut",
        c.i32_add(
          c.getLocal("pOut"),
          c.i32_mul(
            c.i32_sub(
              c.getLocal("n"),
              c.i32_const(1)
            ),
            c.i32_const(sizeOut)
          )
        )
      ),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
        c.call(internalFnName, c.getLocal("itIn"), c.getLocal("itOut")),
        c.setLocal("itIn", c.i32_sub(c.getLocal("itIn"), c.i32_const(sizeIn))),
        c.setLocal("itOut", c.i32_sub(c.getLocal("itOut"), c.i32_const(sizeOut))),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  } else {
    f.addCode(
      c.setLocal("itIn", c.getLocal("pIn")),
      c.setLocal("itOut", c.getLocal("pOut")),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
        c.call(internalFnName, c.getLocal("itIn"), c.getLocal("itOut")),
        c.setLocal("itIn", c.i32_add(c.getLocal("itIn"), c.i32_const(sizeIn))),
        c.setLocal("itOut", c.i32_add(c.getLocal("itOut"), c.i32_const(sizeOut))),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
}
var build_batchop = buildBatchConvertion$2;
function buildBatchConvertion$2(module, fnName, internalFnName, sizeIn, sizeOut, reverse) {
  if (typeof reverse === "undefined") {
    if (sizeIn < sizeOut) {
      reverse = true;
    } else {
      reverse = false;
    }
  }
  const f = module.addFunction(fnName);
  f.addParam("pIn1", "i32");
  f.addParam("pIn2", "i32");
  f.addParam("n", "i32");
  f.addParam("pOut", "i32");
  f.addLocal("i", "i32");
  f.addLocal("itIn1", "i32");
  f.addLocal("itIn2", "i32");
  f.addLocal("itOut", "i32");
  const c = f.getCodeBuilder();
  if (reverse) {
    f.addCode(
      c.setLocal(
        "itIn1",
        c.i32_add(
          c.getLocal("pIn1"),
          c.i32_mul(
            c.i32_sub(
              c.getLocal("n"),
              c.i32_const(1)
            ),
            c.i32_const(sizeIn)
          )
        )
      ),
      c.setLocal(
        "itIn2",
        c.i32_add(
          c.getLocal("pIn2"),
          c.i32_mul(
            c.i32_sub(
              c.getLocal("n"),
              c.i32_const(1)
            ),
            c.i32_const(sizeIn)
          )
        )
      ),
      c.setLocal(
        "itOut",
        c.i32_add(
          c.getLocal("pOut"),
          c.i32_mul(
            c.i32_sub(
              c.getLocal("n"),
              c.i32_const(1)
            ),
            c.i32_const(sizeOut)
          )
        )
      ),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
        c.call(internalFnName, c.getLocal("itIn1"), c.getLocal("itIn2"), c.getLocal("itOut")),
        c.setLocal("itIn1", c.i32_sub(c.getLocal("itIn1"), c.i32_const(sizeIn))),
        c.setLocal("itIn2", c.i32_sub(c.getLocal("itIn2"), c.i32_const(sizeIn))),
        c.setLocal("itOut", c.i32_sub(c.getLocal("itOut"), c.i32_const(sizeOut))),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  } else {
    f.addCode(
      c.setLocal("itIn1", c.getLocal("pIn1")),
      c.setLocal("itIn2", c.getLocal("pIn2")),
      c.setLocal("itOut", c.getLocal("pOut")),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
        c.call(internalFnName, c.getLocal("itIn1"), c.getLocal("itIn2"), c.getLocal("itOut")),
        c.setLocal("itIn1", c.i32_add(c.getLocal("itIn1"), c.i32_const(sizeIn))),
        c.setLocal("itIn2", c.i32_add(c.getLocal("itIn2"), c.i32_const(sizeIn))),
        c.setLocal("itOut", c.i32_add(c.getLocal("itOut"), c.i32_const(sizeOut))),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
}
var bigint = {};
function compare(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
function square$1(n) {
  return n * n;
}
function isOdd$4(n) {
  return n % 2n !== 0n;
}
function isEven(n) {
  return n % 2n === 0n;
}
function isNegative$3(n) {
  return n < 0n;
}
function isPositive(n) {
  return n > 0n;
}
function bitLength$5(n) {
  if (isNegative$3(n)) {
    return n.toString(2).length - 1;
  } else {
    return n.toString(2).length;
  }
}
function abs(n) {
  return n < 0n ? -n : n;
}
function isUnit(n) {
  return abs(n) === 1n;
}
function modInv$3(a, n) {
  var t = 0n, newT = 1n, r = n, newR = abs(a), q, lastT, lastR;
  while (newR !== 0n) {
    q = r / newR;
    lastT = t;
    lastR = r;
    t = newT;
    r = newR;
    newT = lastT - q * newT;
    newR = lastR - q * newR;
  }
  if (!isUnit(r)) throw new Error(a.toString() + " and " + n.toString() + " are not co-prime");
  if (compare(t, 0n) === -1) {
    t = t + n;
  }
  if (isNegative$3(a)) {
    return -t;
  }
  return t;
}
function modPow$2(n, exp2, mod2) {
  if (mod2 === 0n) throw new Error("Cannot take modPow with modulus 0");
  var r = 1n, base = n % mod2;
  if (isNegative$3(exp2)) {
    exp2 = exp2 * -1n;
    base = modInv$3(base, mod2);
  }
  while (isPositive(exp2)) {
    if (base === 0n) return 0n;
    if (isOdd$4(exp2)) r = r * base % mod2;
    exp2 = exp2 / 2n;
    base = square$1(base) % mod2;
  }
  return r;
}
function compareAbs(a, b) {
  a = a >= 0n ? a : -a;
  b = b >= 0n ? b : -b;
  return a === b ? 0 : a > b ? 1 : -1;
}
function isDivisibleBy(a, n) {
  if (n === 0n) return false;
  if (isUnit(n)) return true;
  if (compareAbs(n, 2n) === 0) return isEven(a);
  return a % n === 0n;
}
function isBasicPrime(v) {
  var n = abs(v);
  if (isUnit(n)) return false;
  if (n === 2n || n === 3n || n === 5n) return true;
  if (isEven(n) || isDivisibleBy(n, 3n) || isDivisibleBy(n, 5n)) return false;
  if (n < 49n) return true;
}
function prev(n) {
  return n - 1n;
}
function millerRabinTest(n, a) {
  var nPrev = prev(n), b = nPrev, r = 0, d, i, x;
  while (isEven(b)) b = b / 2n, r++;
  next: for (i = 0; i < a.length; i++) {
    if (n < a[i]) continue;
    x = modPow$2(BigInt(a[i]), b, n);
    if (isUnit(x) || x === nPrev) continue;
    for (d = r - 1; d != 0; d--) {
      x = square$1(x) % n;
      if (isUnit(x)) return false;
      if (x === nPrev) continue next;
    }
    return false;
  }
  return true;
}
function isPrime$1(p) {
  var isPrime2 = isBasicPrime(p);
  if (isPrime2 !== void 0) return isPrime2;
  var n = abs(p);
  var bits2 = bitLength$5(n);
  if (bits2 <= 64)
    return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
  var logN = Math.log(2) * Number(bits2);
  var t = Math.ceil(logN);
  for (var a = [], i = 0; i < t; i++) {
    a.push(BigInt(i + 2));
  }
  return millerRabinTest(n, a);
}
bigint.bitLength = bitLength$5;
bigint.isOdd = isOdd$4;
bigint.isNegative = isNegative$3;
bigint.abs = abs;
bigint.isUnit = isUnit;
bigint.compare = compare;
bigint.modInv = modInv$3;
bigint.modPow = modPow$2;
bigint.isPrime = isPrime$1;
bigint.square = square$1;
var buildInt2 = build_int;
var utils$5 = utils$6;
var buildExp$2 = build_timesscalar;
var buildBatchInverse$2 = build_batchinverse;
var buildBatchConvertion$1 = build_batchconvertion;
var buildBatchOp = build_batchop;
var { bitLength: bitLength$4, modInv: modInv$2, modPow: modPow$1, isPrime, isOdd: isOdd$3, square } = bigint;
var build_f1m = function buildF1m(module, _q, _prefix, _intPrefix) {
  const q = BigInt(_q);
  const n64 = Math.floor((bitLength$4(q - 1n) - 1) / 64) + 1;
  const n32 = n64 * 2;
  const n8 = n64 * 8;
  const prefix = _prefix || "f1m";
  if (module.modules[prefix]) return prefix;
  const intPrefix = buildInt2(module, n64, _intPrefix);
  const pq = module.alloc(n8, utils$5.bigInt2BytesLE(q, n8));
  const pR2 = module.alloc(utils$5.bigInt2BytesLE(square(1n << BigInt(n64 * 64)) % q, n8));
  const pOne = module.alloc(utils$5.bigInt2BytesLE((1n << BigInt(n64 * 64)) % q, n8));
  const pZero = module.alloc(utils$5.bigInt2BytesLE(0n, n8));
  const _minusOne = q - 1n;
  const _e = _minusOne >> 1n;
  const pe = module.alloc(n8, utils$5.bigInt2BytesLE(_e, n8));
  const _ePlusOne = _e + 1n;
  const pePlusOne = module.alloc(n8, utils$5.bigInt2BytesLE(_ePlusOne, n8));
  module.modules[prefix] = {
    pq,
    pR2,
    n64,
    q,
    pOne,
    pZero,
    pePlusOne
  };
  function buildOne() {
    const f = module.addFunction(prefix + "_one");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(intPrefix + "_copy", c.i32_const(pOne), c.getLocal("pr")));
  }
  function buildAdd() {
    const f = module.addFunction(prefix + "_add");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.if(
        c.call(intPrefix + "_add", c.getLocal("x"), c.getLocal("y"), c.getLocal("r")),
        c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r"))),
        c.if(
          c.call(intPrefix + "_gte", c.getLocal("r"), c.i32_const(pq)),
          c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
        )
      )
    );
  }
  function buildSub() {
    const f = module.addFunction(prefix + "_sub");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.if(
        c.call(intPrefix + "_sub", c.getLocal("x"), c.getLocal("y"), c.getLocal("r")),
        c.drop(c.call(intPrefix + "_add", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
      )
    );
  }
  function buildNeg() {
    const f = module.addFunction(prefix + "_neg");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.call(prefix + "_sub", c.i32_const(pZero), c.getLocal("x"), c.getLocal("r"))
    );
  }
  function buildIsNegative() {
    const f = module.addFunction(prefix + "_isNegative");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const AUX = c.i32_const(module.alloc(n8));
    f.addCode(
      c.call(prefix + "_fromMontgomery", c.getLocal("x"), AUX),
      c.call(intPrefix + "_gte", AUX, c.i32_const(pePlusOne))
    );
  }
  function buildSign() {
    const f = module.addFunction(prefix + "_sign");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const AUX = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(intPrefix + "_isZero", c.getLocal("x")),
        c.ret(c.i32_const(0))
      ),
      c.call(prefix + "_fromMontgomery", c.getLocal("x"), AUX),
      c.if(
        c.call(intPrefix + "_gte", AUX, c.i32_const(pePlusOne)),
        c.ret(c.i32_const(-1))
      ),
      c.ret(c.i32_const(1))
    );
  }
  function buildMReduct() {
    const carries = module.alloc(n32 * n32 * 8);
    const f = module.addFunction(prefix + "_mReduct");
    f.addParam("t", "i32");
    f.addParam("r", "i32");
    f.addLocal("np32", "i64");
    f.addLocal("c", "i64");
    f.addLocal("m", "i64");
    const c = f.getCodeBuilder();
    const np32 = Number(0x100000000n - modInv$2(q, 0x100000000n));
    f.addCode(c.setLocal("np32", c.i64_const(np32)));
    for (let i = 0; i < n32; i++) {
      f.addCode(c.setLocal("c", c.i64_const(0)));
      f.addCode(
        c.setLocal(
          "m",
          c.i64_and(
            c.i64_mul(
              c.i64_load32_u(c.getLocal("t"), i * 4),
              c.getLocal("np32")
            ),
            c.i64_const("0xFFFFFFFF")
          )
        )
      );
      for (let j = 0; j < n32; j++) {
        f.addCode(
          c.setLocal(
            "c",
            c.i64_add(
              c.i64_add(
                c.i64_load32_u(c.getLocal("t"), (i + j) * 4),
                c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
              ),
              c.i64_mul(
                c.i64_load32_u(c.i32_const(pq), j * 4),
                c.getLocal("m")
              )
            )
          )
        );
        f.addCode(
          c.i64_store32(
            c.getLocal("t"),
            (i + j) * 4,
            c.getLocal("c")
          )
        );
      }
      f.addCode(
        c.i64_store32(
          c.i32_const(carries),
          i * 4,
          c.i64_shr_u(c.getLocal("c"), c.i64_const(32))
        )
      );
    }
    f.addCode(
      c.call(
        prefix + "_add",
        c.i32_const(carries),
        c.i32_add(
          c.getLocal("t"),
          c.i32_const(n32 * 4)
        ),
        c.getLocal("r")
      )
    );
  }
  function buildMul() {
    const f = module.addFunction(prefix + "_mul");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    f.addLocal("c0", "i64");
    f.addLocal("c1", "i64");
    f.addLocal("np32", "i64");
    for (let i = 0; i < n32; i++) {
      f.addLocal("x" + i, "i64");
      f.addLocal("y" + i, "i64");
      f.addLocal("m" + i, "i64");
      f.addLocal("q" + i, "i64");
    }
    const c = f.getCodeBuilder();
    const np32 = Number(0x100000000n - modInv$2(q, 0x100000000n));
    f.addCode(c.setLocal("np32", c.i64_const(np32)));
    const loadX = [];
    const loadY = [];
    const loadQ = [];
    function mulij(i, j) {
      let X, Y;
      if (!loadX[i]) {
        X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
        loadX[i] = true;
      } else {
        X = c.getLocal("x" + i);
      }
      if (!loadY[j]) {
        Y = c.teeLocal("y" + j, c.i64_load32_u(c.getLocal("y"), j * 4));
        loadY[j] = true;
      } else {
        Y = c.getLocal("y" + j);
      }
      return c.i64_mul(X, Y);
    }
    function mulqm(i, j) {
      let Q2, M;
      if (!loadQ[i]) {
        Q2 = c.teeLocal("q" + i, c.i64_load32_u(c.i32_const(0), pq + i * 4));
        loadQ[i] = true;
      } else {
        Q2 = c.getLocal("q" + i);
      }
      M = c.getLocal("m" + j);
      return c.i64_mul(Q2, M);
    }
    let c0 = "c0";
    let c1 = "c1";
    for (let k = 0; k < n32 * 2 - 1; k++) {
      for (let i = Math.max(0, k - n32 + 1); i <= k && i < n32; i++) {
        const j = k - i;
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulij(i, j)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      for (let i = Math.max(1, k - n32 + 1); i <= k && i < n32; i++) {
        const j = k - i;
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulqm(i, j)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      if (k < n32) {
        f.addCode(
          c.setLocal(
            "m" + k,
            c.i64_and(
              c.i64_mul(
                c.i64_and(
                  c.getLocal(c0),
                  c.i64_const(4294967295)
                ),
                c.getLocal("np32")
              ),
              c.i64_const("0xFFFFFFFF")
            )
          )
        );
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulqm(0, k)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      if (k >= n32) {
        f.addCode(
          c.i64_store32(
            c.getLocal("r"),
            (k - n32) * 4,
            c.getLocal(c0)
          )
        );
      }
      [c0, c1] = [c1, c0];
      f.addCode(
        c.setLocal(
          c1,
          c.i64_shr_u(
            c.getLocal(c0),
            c.i64_const(32)
          )
        )
      );
    }
    f.addCode(
      c.i64_store32(
        c.getLocal("r"),
        n32 * 4 - 4,
        c.getLocal(c0)
      )
    );
    f.addCode(
      c.if(
        c.i32_wrap_i64(c.getLocal(c1)),
        c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r"))),
        c.if(
          c.call(intPrefix + "_gte", c.getLocal("r"), c.i32_const(pq)),
          c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
        )
      )
    );
  }
  function buildSquare() {
    const f = module.addFunction(prefix + "_square");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    f.addLocal("c0", "i64");
    f.addLocal("c1", "i64");
    f.addLocal("c0_old", "i64");
    f.addLocal("c1_old", "i64");
    f.addLocal("np32", "i64");
    for (let i = 0; i < n32; i++) {
      f.addLocal("x" + i, "i64");
      f.addLocal("m" + i, "i64");
      f.addLocal("q" + i, "i64");
    }
    const c = f.getCodeBuilder();
    const np32 = Number(0x100000000n - modInv$2(q, 0x100000000n));
    f.addCode(c.setLocal("np32", c.i64_const(np32)));
    const loadX = [];
    const loadQ = [];
    function mulij(i, j) {
      let X, Y;
      if (!loadX[i]) {
        X = c.teeLocal("x" + i, c.i64_load32_u(c.getLocal("x"), i * 4));
        loadX[i] = true;
      } else {
        X = c.getLocal("x" + i);
      }
      if (!loadX[j]) {
        Y = c.teeLocal("x" + j, c.i64_load32_u(c.getLocal("x"), j * 4));
        loadX[j] = true;
      } else {
        Y = c.getLocal("x" + j);
      }
      return c.i64_mul(X, Y);
    }
    function mulqm(i, j) {
      let Q2, M;
      if (!loadQ[i]) {
        Q2 = c.teeLocal("q" + i, c.i64_load32_u(c.i32_const(0), pq + i * 4));
        loadQ[i] = true;
      } else {
        Q2 = c.getLocal("q" + i);
      }
      M = c.getLocal("m" + j);
      return c.i64_mul(Q2, M);
    }
    let c0 = "c0";
    let c1 = "c1";
    let c0_old = "c0_old";
    let c1_old = "c1_old";
    for (let k = 0; k < n32 * 2 - 1; k++) {
      f.addCode(
        c.setLocal(c0, c.i64_const(0)),
        c.setLocal(c1, c.i64_const(0))
      );
      for (let i = Math.max(0, k - n32 + 1); i < k + 1 >> 1 && i < n32; i++) {
        const j = k - i;
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulij(i, j)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      f.addCode(
        c.setLocal(
          c0,
          c.i64_shl(
            c.i64_and(
              c.getLocal(c0),
              c.i64_const(4294967295)
            ),
            c.i64_const(1)
          )
        )
      );
      f.addCode(
        c.setLocal(
          c1,
          c.i64_add(
            c.i64_shl(
              c.getLocal(c1),
              c.i64_const(1)
            ),
            c.i64_shr_u(
              c.getLocal(c0),
              c.i64_const(32)
            )
          )
        )
      );
      if (k % 2 == 0) {
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulij(k >> 1, k >> 1)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      if (k > 0) {
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              c.i64_and(
                c.getLocal(c0_old),
                c.i64_const(4294967295)
              )
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.i64_add(
                c.getLocal(c1),
                c.i64_shr_u(
                  c.getLocal(c0),
                  c.i64_const(32)
                )
              ),
              c.getLocal(c1_old)
            )
          )
        );
      }
      for (let i = Math.max(1, k - n32 + 1); i <= k && i < n32; i++) {
        const j = k - i;
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulqm(i, j)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      if (k < n32) {
        f.addCode(
          c.setLocal(
            "m" + k,
            c.i64_and(
              c.i64_mul(
                c.i64_and(
                  c.getLocal(c0),
                  c.i64_const(4294967295)
                ),
                c.getLocal("np32")
              ),
              c.i64_const("0xFFFFFFFF")
            )
          )
        );
        f.addCode(
          c.setLocal(
            c0,
            c.i64_add(
              c.i64_and(
                c.getLocal(c0),
                c.i64_const(4294967295)
              ),
              mulqm(0, k)
            )
          )
        );
        f.addCode(
          c.setLocal(
            c1,
            c.i64_add(
              c.getLocal(c1),
              c.i64_shr_u(
                c.getLocal(c0),
                c.i64_const(32)
              )
            )
          )
        );
      }
      if (k >= n32) {
        f.addCode(
          c.i64_store32(
            c.getLocal("r"),
            (k - n32) * 4,
            c.getLocal(c0)
          )
        );
      }
      f.addCode(
        c.setLocal(
          c0_old,
          c.getLocal(c1)
        ),
        c.setLocal(
          c1_old,
          c.i64_shr_u(
            c.getLocal(c0_old),
            c.i64_const(32)
          )
        )
      );
    }
    f.addCode(
      c.i64_store32(
        c.getLocal("r"),
        n32 * 4 - 4,
        c.getLocal(c0_old)
      )
    );
    f.addCode(
      c.if(
        c.i32_wrap_i64(c.getLocal(c1_old)),
        c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r"))),
        c.if(
          c.call(intPrefix + "_gte", c.getLocal("r"), c.i32_const(pq)),
          c.drop(c.call(intPrefix + "_sub", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")))
        )
      )
    );
  }
  function buildSquareOld() {
    const f = module.addFunction(prefix + "_squareOld");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(prefix + "_mul", c.getLocal("x"), c.getLocal("x"), c.getLocal("r")));
  }
  function buildToMontgomery() {
    const f = module.addFunction(prefix + "_toMontgomery");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(prefix + "_mul", c.getLocal("x"), c.i32_const(pR2), c.getLocal("r")));
  }
  function buildFromMontgomery() {
    const pAux2 = module.alloc(n8 * 2);
    const f = module.addFunction(prefix + "_fromMontgomery");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(intPrefix + "_copy", c.getLocal("x"), c.i32_const(pAux2)));
    f.addCode(c.call(intPrefix + "_zero", c.i32_const(pAux2 + n8)));
    f.addCode(c.call(prefix + "_mReduct", c.i32_const(pAux2), c.getLocal("r")));
  }
  function buildInverse() {
    const f = module.addFunction(prefix + "_inverse");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(prefix + "_fromMontgomery", c.getLocal("x"), c.getLocal("r")));
    f.addCode(c.call(intPrefix + "_inverseMod", c.getLocal("r"), c.i32_const(pq), c.getLocal("r")));
    f.addCode(c.call(prefix + "_toMontgomery", c.getLocal("r"), c.getLocal("r")));
  }
  let _nqr = 2n;
  if (isPrime(q)) {
    while (modPow$1(_nqr, _e, q) !== _minusOne) _nqr = _nqr + 1n;
  }
  let s2 = 0;
  let _t = _minusOne;
  while (!isOdd$3(_t) && _t !== 0n) {
    s2++;
    _t = _t >> 1n;
  }
  const pt = module.alloc(n8, utils$5.bigInt2BytesLE(_t, n8));
  const _nqrToT = modPow$1(_nqr, _t, q);
  const pNqrToT = module.alloc(utils$5.bigInt2BytesLE((_nqrToT << BigInt(n64 * 64)) % q, n8));
  const _tPlusOneOver2 = _t + 1n >> 1n;
  const ptPlusOneOver2 = module.alloc(n8, utils$5.bigInt2BytesLE(_tPlusOneOver2, n8));
  function buildSqrt2() {
    const f = module.addFunction(prefix + "_sqrt");
    f.addParam("n", "i32");
    f.addParam("r", "i32");
    f.addLocal("m", "i32");
    f.addLocal("i", "i32");
    f.addLocal("j", "i32");
    const c = f.getCodeBuilder();
    const ONE = c.i32_const(pOne);
    const C = c.i32_const(module.alloc(n8));
    const T = c.i32_const(module.alloc(n8));
    const R = c.i32_const(module.alloc(n8));
    const SQ = c.i32_const(module.alloc(n8));
    const B = c.i32_const(module.alloc(n8));
    f.addCode(
      // If (n==0) return 0
      c.if(
        c.call(prefix + "_isZero", c.getLocal("n")),
        c.ret(
          c.call(prefix + "_zero", c.getLocal("r"))
        )
      ),
      c.setLocal("m", c.i32_const(s2)),
      c.call(prefix + "_copy", c.i32_const(pNqrToT), C),
      c.call(prefix + "_exp", c.getLocal("n"), c.i32_const(pt), c.i32_const(n8), T),
      c.call(prefix + "_exp", c.getLocal("n"), c.i32_const(ptPlusOneOver2), c.i32_const(n8), R),
      c.block(c.loop(
        c.br_if(1, c.call(prefix + "_eq", T, ONE)),
        c.call(prefix + "_square", T, SQ),
        c.setLocal("i", c.i32_const(1)),
        c.block(c.loop(
          c.br_if(1, c.call(prefix + "_eq", SQ, ONE)),
          c.call(prefix + "_square", SQ, SQ),
          c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
          c.br(0)
        )),
        c.call(prefix + "_copy", C, B),
        c.setLocal("j", c.i32_sub(c.i32_sub(c.getLocal("m"), c.getLocal("i")), c.i32_const(1))),
        c.block(c.loop(
          c.br_if(1, c.i32_eqz(c.getLocal("j"))),
          c.call(prefix + "_square", B, B),
          c.setLocal("j", c.i32_sub(c.getLocal("j"), c.i32_const(1))),
          c.br(0)
        )),
        c.setLocal("m", c.getLocal("i")),
        c.call(prefix + "_square", B, C),
        c.call(prefix + "_mul", T, C, T),
        c.call(prefix + "_mul", R, B, R),
        c.br(0)
      )),
      c.if(
        c.call(prefix + "_isNegative", R),
        c.call(prefix + "_neg", R, c.getLocal("r")),
        c.call(prefix + "_copy", R, c.getLocal("r"))
      )
    );
  }
  function buildIsSquare() {
    const f = module.addFunction(prefix + "_isSquare");
    f.addParam("n", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const ONE = c.i32_const(pOne);
    const AUX = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZero", c.getLocal("n")),
        c.ret(c.i32_const(1))
      ),
      c.call(prefix + "_exp", c.getLocal("n"), c.i32_const(pe), c.i32_const(n8), AUX),
      c.call(prefix + "_eq", AUX, ONE)
    );
  }
  function buildLoad() {
    const f = module.addFunction(prefix + "_load");
    f.addParam("scalar", "i32");
    f.addParam("scalarLen", "i32");
    f.addParam("r", "i32");
    f.addLocal("p", "i32");
    f.addLocal("l", "i32");
    f.addLocal("i", "i32");
    f.addLocal("j", "i32");
    const c = f.getCodeBuilder();
    const R = c.i32_const(module.alloc(n8));
    const pAux = module.alloc(n8);
    const AUX = c.i32_const(pAux);
    f.addCode(
      c.call(intPrefix + "_zero", c.getLocal("r")),
      c.setLocal("i", c.i32_const(n8)),
      c.setLocal("p", c.getLocal("scalar")),
      c.block(c.loop(
        c.br_if(1, c.i32_gt_u(c.getLocal("i"), c.getLocal("scalarLen"))),
        c.if(
          c.i32_eq(c.getLocal("i"), c.i32_const(n8)),
          c.call(prefix + "_one", R),
          c.call(prefix + "_mul", R, c.i32_const(pR2), R)
        ),
        c.call(prefix + "_mul", c.getLocal("p"), R, AUX),
        c.call(prefix + "_add", c.getLocal("r"), AUX, c.getLocal("r")),
        c.setLocal("p", c.i32_add(c.getLocal("p"), c.i32_const(n8))),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(n8))),
        c.br(0)
      )),
      c.setLocal("l", c.i32_rem_u(c.getLocal("scalarLen"), c.i32_const(n8))),
      c.if(c.i32_eqz(c.getLocal("l")), c.ret([])),
      c.call(intPrefix + "_zero", AUX),
      c.setLocal("j", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(1, c.i32_eq(c.getLocal("j"), c.getLocal("l"))),
        c.i32_store8(
          c.getLocal("j"),
          pAux,
          c.i32_load8_u(c.getLocal("p"))
        ),
        c.setLocal("p", c.i32_add(c.getLocal("p"), c.i32_const(1))),
        c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
        c.br(0)
      )),
      c.if(
        c.i32_eq(c.getLocal("i"), c.i32_const(n8)),
        c.call(prefix + "_one", R),
        c.call(prefix + "_mul", R, c.i32_const(pR2), R)
      ),
      c.call(prefix + "_mul", AUX, R, AUX),
      c.call(prefix + "_add", c.getLocal("r"), AUX, c.getLocal("r"))
    );
  }
  function buildTimesScalar2() {
    const f = module.addFunction(prefix + "_timesScalar");
    f.addParam("x", "i32");
    f.addParam("scalar", "i32");
    f.addParam("scalarLen", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const AUX = c.i32_const(module.alloc(n8));
    f.addCode(
      c.call(prefix + "_load", c.getLocal("scalar"), c.getLocal("scalarLen"), AUX),
      c.call(prefix + "_toMontgomery", AUX, AUX),
      c.call(prefix + "_mul", c.getLocal("x"), AUX, c.getLocal("r"))
    );
  }
  function buildIsOne() {
    const f = module.addFunction(prefix + "_isOne");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.ret(c.call(intPrefix + "_eq", c.getLocal("x"), c.i32_const(pOne)))
    );
  }
  module.exportFunction(intPrefix + "_copy", prefix + "_copy");
  module.exportFunction(intPrefix + "_zero", prefix + "_zero");
  module.exportFunction(intPrefix + "_isZero", prefix + "_isZero");
  module.exportFunction(intPrefix + "_eq", prefix + "_eq");
  buildIsOne();
  buildAdd();
  buildSub();
  buildNeg();
  buildMReduct();
  buildMul();
  buildSquare();
  buildSquareOld();
  buildToMontgomery();
  buildFromMontgomery();
  buildIsNegative();
  buildSign();
  buildInverse();
  buildOne();
  buildLoad();
  buildTimesScalar2();
  buildBatchInverse$2(module, prefix);
  buildBatchConvertion$1(module, prefix + "_batchToMontgomery", prefix + "_toMontgomery", n8, n8);
  buildBatchConvertion$1(module, prefix + "_batchFromMontgomery", prefix + "_fromMontgomery", n8, n8);
  buildBatchConvertion$1(module, prefix + "_batchNeg", prefix + "_neg", n8, n8);
  buildBatchOp(module, prefix + "_batchAdd", prefix + "_add", n8, n8);
  buildBatchOp(module, prefix + "_batchSub", prefix + "_sub", n8, n8);
  buildBatchOp(module, prefix + "_batchMul", prefix + "_mul", n8, n8);
  module.exportFunction(prefix + "_add");
  module.exportFunction(prefix + "_sub");
  module.exportFunction(prefix + "_neg");
  module.exportFunction(prefix + "_isNegative");
  module.exportFunction(prefix + "_isOne");
  module.exportFunction(prefix + "_sign");
  module.exportFunction(prefix + "_mReduct");
  module.exportFunction(prefix + "_mul");
  module.exportFunction(prefix + "_square");
  module.exportFunction(prefix + "_squareOld");
  module.exportFunction(prefix + "_fromMontgomery");
  module.exportFunction(prefix + "_toMontgomery");
  module.exportFunction(prefix + "_inverse");
  module.exportFunction(prefix + "_one");
  module.exportFunction(prefix + "_load");
  module.exportFunction(prefix + "_timesScalar");
  buildExp$2(
    module,
    prefix + "_exp",
    n8,
    prefix + "_mul",
    prefix + "_square",
    intPrefix + "_copy",
    prefix + "_one"
  );
  module.exportFunction(prefix + "_exp");
  module.exportFunction(prefix + "_batchInverse");
  if (isPrime(q)) {
    buildSqrt2();
    buildIsSquare();
    module.exportFunction(prefix + "_sqrt");
    module.exportFunction(prefix + "_isSquare");
  }
  module.exportFunction(prefix + "_batchToMontgomery");
  module.exportFunction(prefix + "_batchFromMontgomery");
  return prefix;
};
var buildF1m$2 = build_f1m;
var { bitLength: bitLength$3 } = bigint;
var build_f1 = function buildF1(module, _q, _prefix, _f1mPrefix, _intPrefix) {
  const q = BigInt(_q);
  const n64 = Math.floor((bitLength$3(q - 1n) - 1) / 64) + 1;
  const n8 = n64 * 8;
  const prefix = _prefix || "f1";
  if (module.modules[prefix]) return prefix;
  module.modules[prefix] = {
    n64
  };
  const intPrefix = _intPrefix || "int";
  const f1mPrefix = buildF1m$2(module, q, _f1mPrefix, intPrefix);
  const pR2 = module.modules[f1mPrefix].pR2;
  const pq = module.modules[f1mPrefix].pq;
  const pePlusOne = module.modules[f1mPrefix].pePlusOne;
  function buildMul() {
    const pAux1 = module.alloc(n8);
    const f = module.addFunction(prefix + "_mul");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(f1mPrefix + "_mul", c.getLocal("x"), c.getLocal("y"), c.i32_const(pAux1)));
    f.addCode(c.call(f1mPrefix + "_mul", c.i32_const(pAux1), c.i32_const(pR2), c.getLocal("r")));
  }
  function buildSquare() {
    const f = module.addFunction(prefix + "_square");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(prefix + "_mul", c.getLocal("x"), c.getLocal("x"), c.getLocal("r")));
  }
  function buildInverse() {
    const f = module.addFunction(prefix + "_inverse");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(intPrefix + "_inverseMod", c.getLocal("x"), c.i32_const(pq), c.getLocal("r")));
  }
  function buildIsNegative() {
    const f = module.addFunction(prefix + "_isNegative");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.call(intPrefix + "_gte", c.getLocal("x"), c.i32_const(pePlusOne))
    );
  }
  buildMul();
  buildSquare();
  buildInverse();
  buildIsNegative();
  module.exportFunction(f1mPrefix + "_add", prefix + "_add");
  module.exportFunction(f1mPrefix + "_sub", prefix + "_sub");
  module.exportFunction(f1mPrefix + "_neg", prefix + "_neg");
  module.exportFunction(prefix + "_mul");
  module.exportFunction(prefix + "_square");
  module.exportFunction(prefix + "_inverse");
  module.exportFunction(prefix + "_isNegative");
  module.exportFunction(f1mPrefix + "_copy", prefix + "_copy");
  module.exportFunction(f1mPrefix + "_zero", prefix + "_zero");
  module.exportFunction(f1mPrefix + "_one", prefix + "_one");
  module.exportFunction(f1mPrefix + "_isZero", prefix + "_isZero");
  module.exportFunction(f1mPrefix + "_eq", prefix + "_eq");
  return prefix;
};
var buildExp$1 = build_timesscalar;
var buildBatchInverse$1 = build_batchinverse;
var utils$4 = utils$6;
var build_f2m = function buildF2m(module, mulNonResidueFn, prefix, f1mPrefix) {
  if (module.modules[prefix]) return prefix;
  const f1n8 = module.modules[f1mPrefix].n64 * 8;
  const q = module.modules[f1mPrefix].q;
  module.modules[prefix] = {
    n64: module.modules[f1mPrefix].n64 * 2
  };
  function buildAdd() {
    const f = module.addFunction(prefix + "_add");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const y0 = c.getLocal("y");
    const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_add", x0, y0, r0),
      c.call(f1mPrefix + "_add", x1, y1, r1)
    );
  }
  function buildTimesScalar2() {
    const f = module.addFunction(prefix + "_timesScalar");
    f.addParam("x", "i32");
    f.addParam("scalar", "i32");
    f.addParam("scalarLen", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_timesScalar", x0, c.getLocal("scalar"), c.getLocal("scalarLen"), r0),
      c.call(f1mPrefix + "_timesScalar", x1, c.getLocal("scalar"), c.getLocal("scalarLen"), r1)
    );
  }
  function buildSub() {
    const f = module.addFunction(prefix + "_sub");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const y0 = c.getLocal("y");
    const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_sub", x0, y0, r0),
      c.call(f1mPrefix + "_sub", x1, y1, r1)
    );
  }
  function buildNeg() {
    const f = module.addFunction(prefix + "_neg");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_neg", x0, r0),
      c.call(f1mPrefix + "_neg", x1, r1)
    );
  }
  function buildConjugate() {
    const f = module.addFunction(prefix + "_conjugate");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_copy", x0, r0),
      c.call(f1mPrefix + "_neg", x1, r1)
    );
  }
  function buildIsNegative() {
    const f = module.addFunction(prefix + "_isNegative");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    f.addCode(
      c.if(
        c.call(f1mPrefix + "_isZero", x1),
        c.ret(c.call(f1mPrefix + "_isNegative", x0))
      ),
      c.ret(c.call(f1mPrefix + "_isNegative", x1))
    );
  }
  function buildMul() {
    const f = module.addFunction(prefix + "_mul");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const y0 = c.getLocal("y");
    const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const A = c.i32_const(module.alloc(f1n8));
    const B = c.i32_const(module.alloc(f1n8));
    const C = c.i32_const(module.alloc(f1n8));
    const D = c.i32_const(module.alloc(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_mul", x0, y0, A),
      // A = x0*y0
      c.call(f1mPrefix + "_mul", x1, y1, B),
      // B = x1*y1
      c.call(f1mPrefix + "_add", x0, x1, C),
      // C = x0 + x1
      c.call(f1mPrefix + "_add", y0, y1, D),
      // D = y0 + y1
      c.call(f1mPrefix + "_mul", C, D, C),
      // C = (x0 + x1)*(y0 + y1) = x0*y0+x0*y1+x1*y0+x1*y1
      //  c.call(f1mPrefix + "_mul", B, c.i32_const(pNonResidue), r0),  // r0 = nr*(x1*y1)
      c.call(mulNonResidueFn, B, r0),
      // r0 = nr*(x1*y1)
      c.call(f1mPrefix + "_add", A, r0, r0),
      // r0 = x0*y0 + nr*(x1*y1)
      c.call(f1mPrefix + "_add", A, B, r1),
      // r1 = x0*y0+x1*y1
      c.call(f1mPrefix + "_sub", C, r1, r1)
      // r1 = x0*y0+x0*y1+x1*y0+x1*y1 - x0*y0+x1*y1 = x0*y1+x1*y0
    );
  }
  function buildMul1() {
    const f = module.addFunction(prefix + "_mul1");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const y = c.getLocal("y");
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_mul", x0, y, r0),
      // A = x0*y
      c.call(f1mPrefix + "_mul", x1, y, r1)
      // B = x1*y
    );
  }
  function buildSquare() {
    const f = module.addFunction(prefix + "_square");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const AB = c.i32_const(module.alloc(f1n8));
    const APB = c.i32_const(module.alloc(f1n8));
    const APNB = c.i32_const(module.alloc(f1n8));
    const ABPNAB = c.i32_const(module.alloc(f1n8));
    f.addCode(
      // AB = x0*y1
      c.call(f1mPrefix + "_mul", x0, x1, AB),
      // APB = x0+y1
      c.call(f1mPrefix + "_add", x0, x1, APB),
      // APBN0 = x0 + nr*x1
      c.call(mulNonResidueFn, x1, APNB),
      c.call(f1mPrefix + "_add", x0, APNB, APNB),
      // ABPNAB = ab + nr*ab
      c.call(mulNonResidueFn, AB, ABPNAB),
      c.call(f1mPrefix + "_add", ABPNAB, AB, ABPNAB),
      // r0 = APB * APNB - ABPNAB
      c.call(f1mPrefix + "_mul", APB, APNB, r0),
      c.call(f1mPrefix + "_sub", r0, ABPNAB, r0),
      // r1 = AB + AB
      c.call(f1mPrefix + "_add", AB, AB, r1)
    );
  }
  function buildToMontgomery() {
    const f = module.addFunction(prefix + "_toMontgomery");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_toMontgomery", x0, r0),
      c.call(f1mPrefix + "_toMontgomery", x1, r1)
    );
  }
  function buildFromMontgomery() {
    const f = module.addFunction(prefix + "_fromMontgomery");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_fromMontgomery", x0, r0),
      c.call(f1mPrefix + "_fromMontgomery", x1, r1)
    );
  }
  function buildCopy() {
    const f = module.addFunction(prefix + "_copy");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_copy", x0, r0),
      c.call(f1mPrefix + "_copy", x1, r1)
    );
  }
  function buildZero() {
    const f = module.addFunction(prefix + "_zero");
    f.addParam("x", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_zero", x0),
      c.call(f1mPrefix + "_zero", x1)
    );
  }
  function buildOne() {
    const f = module.addFunction(prefix + "_one");
    f.addParam("x", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_one", x0),
      c.call(f1mPrefix + "_zero", x1)
    );
  }
  function buildEq() {
    const f = module.addFunction(prefix + "_eq");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const y0 = c.getLocal("y");
    const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
    f.addCode(
      c.i32_and(
        c.call(f1mPrefix + "_eq", x0, y0),
        c.call(f1mPrefix + "_eq", x1, y1)
      )
    );
  }
  function buildIsZero() {
    const f = module.addFunction(prefix + "_isZero");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    f.addCode(
      c.i32_and(
        c.call(f1mPrefix + "_isZero", x0),
        c.call(f1mPrefix + "_isZero", x1)
      )
    );
  }
  function buildInverse() {
    const f = module.addFunction(prefix + "_inverse");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const t0 = c.i32_const(module.alloc(f1n8));
    const t1 = c.i32_const(module.alloc(f1n8));
    const t2 = c.i32_const(module.alloc(f1n8));
    const t3 = c.i32_const(module.alloc(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_square", x0, t0),
      c.call(f1mPrefix + "_square", x1, t1),
      // c.call(f1mPrefix+"_mul", t1, c.i32_const(pNonResidue), t2),
      c.call(mulNonResidueFn, t1, t2),
      c.call(f1mPrefix + "_sub", t0, t2, t2),
      c.call(f1mPrefix + "_inverse", t2, t3),
      c.call(f1mPrefix + "_mul", x0, t3, r0),
      c.call(f1mPrefix + "_mul", x1, t3, r1),
      c.call(f1mPrefix + "_neg", r1, r1)
    );
  }
  function buildSign() {
    const f = module.addFunction(prefix + "_sign");
    f.addParam("x", "i32");
    f.addLocal("s", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    f.addCode(
      c.setLocal("s", c.call(f1mPrefix + "_sign", x1)),
      c.if(
        c.getLocal("s"),
        c.ret(c.getLocal("s"))
      ),
      c.ret(c.call(f1mPrefix + "_sign", x0))
    );
  }
  function buildIsOne() {
    const f = module.addFunction(prefix + "_isOne");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    f.addCode(
      c.ret(c.i32_and(
        c.call(f1mPrefix + "_isOne", x0),
        c.call(f1mPrefix + "_isZero", x1)
      ))
    );
  }
  function buildSqrt2() {
    const f = module.addFunction(prefix + "_sqrt");
    f.addParam("a", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const e34 = c.i32_const(module.alloc(utils$4.bigInt2BytesLE((BigInt(q || 0) - 3n) / 4n, f1n8)));
    const e12 = c.i32_const(module.alloc(utils$4.bigInt2BytesLE((BigInt(q || 0) - 1n) / 2n, f1n8)));
    const a = c.getLocal("a");
    const a1 = c.i32_const(module.alloc(f1n8 * 2));
    const alpha = c.i32_const(module.alloc(f1n8 * 2));
    const a0 = c.i32_const(module.alloc(f1n8 * 2));
    const pn1 = module.alloc(f1n8 * 2);
    const n1 = c.i32_const(pn1);
    const n1a = c.i32_const(pn1);
    const n1b = c.i32_const(pn1 + f1n8);
    const x0 = c.i32_const(module.alloc(f1n8 * 2));
    const b = c.i32_const(module.alloc(f1n8 * 2));
    f.addCode(
      c.call(prefix + "_one", n1),
      c.call(prefix + "_neg", n1, n1),
      // const a1 = F.pow(a, F.sqrt_e34);
      c.call(prefix + "_exp", a, e34, c.i32_const(f1n8), a1),
      // const a1 = F.pow(a, F.sqrt_e34);
      c.call(prefix + "_square", a1, alpha),
      c.call(prefix + "_mul", a, alpha, alpha),
      // const a0 = F.mul(F.frobenius(1, alfa), alfa);
      c.call(prefix + "_conjugate", alpha, a0),
      c.call(prefix + "_mul", a0, alpha, a0),
      // if (F.eq(a0, F.negone)) return null;
      c.if(c.call(prefix + "_eq", a0, n1), c.unreachable()),
      // const x0 = F.mul(a1, a);
      c.call(prefix + "_mul", a1, a, x0),
      // if (F.eq(alfa, F.negone)) {
      c.if(
        c.call(prefix + "_eq", alpha, n1),
        [
          // x = F.mul(x0, [F.F.zero, F.F.one]);
          ...c.call(f1mPrefix + "_zero", n1a),
          ...c.call(f1mPrefix + "_one", n1b),
          ...c.call(prefix + "_mul", n1, x0, c.getLocal("pr"))
        ],
        [
          // const b = F.pow(F.add(F.one, alfa), F.sqrt_e12);
          ...c.call(prefix + "_one", b),
          ...c.call(prefix + "_add", b, alpha, b),
          ...c.call(prefix + "_exp", b, e12, c.i32_const(f1n8), b),
          // x = F.mul(b, x0);
          ...c.call(prefix + "_mul", b, x0, c.getLocal("pr"))
        ]
      )
    );
  }
  function buildIsSquare() {
    const f = module.addFunction(prefix + "_isSquare");
    f.addParam("a", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const e34 = c.i32_const(module.alloc(utils$4.bigInt2BytesLE((BigInt(q || 0) - 3n) / 4n, f1n8)));
    const a = c.getLocal("a");
    const a1 = c.i32_const(module.alloc(f1n8 * 2));
    const alpha = c.i32_const(module.alloc(f1n8 * 2));
    const a0 = c.i32_const(module.alloc(f1n8 * 2));
    const pn1 = module.alloc(f1n8 * 2);
    const n1 = c.i32_const(pn1);
    f.addCode(
      c.call(prefix + "_one", n1),
      c.call(prefix + "_neg", n1, n1),
      // const a1 = F.pow(a, F.sqrt_e34);
      c.call(prefix + "_exp", a, e34, c.i32_const(f1n8), a1),
      // const a1 = F.pow(a, F.sqrt_e34);
      c.call(prefix + "_square", a1, alpha),
      c.call(prefix + "_mul", a, alpha, alpha),
      // const a0 = F.mul(F.frobenius(1, alfa), alfa);
      c.call(prefix + "_conjugate", alpha, a0),
      c.call(prefix + "_mul", a0, alpha, a0),
      // if (F.eq(a0, F.negone)) return null;
      c.if(
        c.call(
          prefix + "_eq",
          a0,
          n1
        ),
        c.ret(c.i32_const(0))
      ),
      c.ret(c.i32_const(1))
    );
  }
  buildIsZero();
  buildIsOne();
  buildZero();
  buildOne();
  buildCopy();
  buildMul();
  buildMul1();
  buildSquare();
  buildAdd();
  buildSub();
  buildNeg();
  buildConjugate();
  buildToMontgomery();
  buildFromMontgomery();
  buildEq();
  buildInverse();
  buildTimesScalar2();
  buildSign();
  buildIsNegative();
  module.exportFunction(prefix + "_isZero");
  module.exportFunction(prefix + "_isOne");
  module.exportFunction(prefix + "_zero");
  module.exportFunction(prefix + "_one");
  module.exportFunction(prefix + "_copy");
  module.exportFunction(prefix + "_mul");
  module.exportFunction(prefix + "_mul1");
  module.exportFunction(prefix + "_square");
  module.exportFunction(prefix + "_add");
  module.exportFunction(prefix + "_sub");
  module.exportFunction(prefix + "_neg");
  module.exportFunction(prefix + "_sign");
  module.exportFunction(prefix + "_conjugate");
  module.exportFunction(prefix + "_fromMontgomery");
  module.exportFunction(prefix + "_toMontgomery");
  module.exportFunction(prefix + "_eq");
  module.exportFunction(prefix + "_inverse");
  buildBatchInverse$1(module, prefix);
  buildExp$1(
    module,
    prefix + "_exp",
    f1n8 * 2,
    prefix + "_mul",
    prefix + "_square",
    prefix + "_copy",
    prefix + "_one"
  );
  buildSqrt2();
  buildIsSquare();
  module.exportFunction(prefix + "_exp");
  module.exportFunction(prefix + "_timesScalar");
  module.exportFunction(prefix + "_batchInverse");
  module.exportFunction(prefix + "_sqrt");
  module.exportFunction(prefix + "_isSquare");
  module.exportFunction(prefix + "_isNegative");
  return prefix;
};
var buildExp = build_timesscalar;
var buildBatchInverse = build_batchinverse;
var build_f3m = function buildF3m(module, mulNonResidueFn, prefix, f1mPrefix) {
  if (module.modules[prefix]) return prefix;
  const f1n8 = module.modules[f1mPrefix].n64 * 8;
  module.modules[prefix] = {
    n64: module.modules[f1mPrefix].n64 * 3
  };
  function buildAdd() {
    const f = module.addFunction(prefix + "_add");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const y0 = c.getLocal("y");
    const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
    const y2 = c.i32_add(c.getLocal("y"), c.i32_const(2 * f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
    f.addCode(
      c.call(f1mPrefix + "_add", x0, y0, r0),
      c.call(f1mPrefix + "_add", x1, y1, r1),
      c.call(f1mPrefix + "_add", x2, y2, r2)
    );
  }
  function buildTimesScalar2() {
    const f = module.addFunction(prefix + "_timesScalar");
    f.addParam("x", "i32");
    f.addParam("scalar", "i32");
    f.addParam("scalarLen", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
    f.addCode(
      c.call(f1mPrefix + "_timesScalar", x0, c.getLocal("scalar"), c.getLocal("scalarLen"), r0),
      c.call(f1mPrefix + "_timesScalar", x1, c.getLocal("scalar"), c.getLocal("scalarLen"), r1),
      c.call(f1mPrefix + "_timesScalar", x2, c.getLocal("scalar"), c.getLocal("scalarLen"), r2)
    );
  }
  function buildSub() {
    const f = module.addFunction(prefix + "_sub");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const y0 = c.getLocal("y");
    const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
    const y2 = c.i32_add(c.getLocal("y"), c.i32_const(2 * f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
    f.addCode(
      c.call(f1mPrefix + "_sub", x0, y0, r0),
      c.call(f1mPrefix + "_sub", x1, y1, r1),
      c.call(f1mPrefix + "_sub", x2, y2, r2)
    );
  }
  function buildNeg() {
    const f = module.addFunction(prefix + "_neg");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
    f.addCode(
      c.call(f1mPrefix + "_neg", x0, r0),
      c.call(f1mPrefix + "_neg", x1, r1),
      c.call(f1mPrefix + "_neg", x2, r2)
    );
  }
  function buildIsNegative() {
    const f = module.addFunction(prefix + "_isNegative");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    f.addCode(
      c.if(
        c.call(f1mPrefix + "_isZero", x2),
        c.if(
          c.call(f1mPrefix + "_isZero", x1),
          c.ret(c.call(f1mPrefix + "_isNegative", x0)),
          c.ret(c.call(f1mPrefix + "_isNegative", x1))
        )
      ),
      c.ret(c.call(f1mPrefix + "_isNegative", x2))
    );
  }
  function buildMul() {
    const f = module.addFunction(prefix + "_mul");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.addParam("r", "i32");
    const cd = f.getCodeBuilder();
    const a = cd.getLocal("x");
    const b = cd.i32_add(cd.getLocal("x"), cd.i32_const(f1n8));
    const c = cd.i32_add(cd.getLocal("x"), cd.i32_const(2 * f1n8));
    const A = cd.getLocal("y");
    const B = cd.i32_add(cd.getLocal("y"), cd.i32_const(f1n8));
    const C = cd.i32_add(cd.getLocal("y"), cd.i32_const(2 * f1n8));
    const r0 = cd.getLocal("r");
    const r1 = cd.i32_add(cd.getLocal("r"), cd.i32_const(f1n8));
    const r2 = cd.i32_add(cd.getLocal("r"), cd.i32_const(2 * f1n8));
    const aA = cd.i32_const(module.alloc(f1n8));
    const bB = cd.i32_const(module.alloc(f1n8));
    const cC = cd.i32_const(module.alloc(f1n8));
    const a_b = cd.i32_const(module.alloc(f1n8));
    const A_B = cd.i32_const(module.alloc(f1n8));
    const a_c = cd.i32_const(module.alloc(f1n8));
    const A_C = cd.i32_const(module.alloc(f1n8));
    const b_c = cd.i32_const(module.alloc(f1n8));
    const B_C = cd.i32_const(module.alloc(f1n8));
    const aA_bB = cd.i32_const(module.alloc(f1n8));
    const aA_cC = cd.i32_const(module.alloc(f1n8));
    const bB_cC = cd.i32_const(module.alloc(f1n8));
    const AUX = cd.i32_const(module.alloc(f1n8));
    f.addCode(
      cd.call(f1mPrefix + "_mul", a, A, aA),
      cd.call(f1mPrefix + "_mul", b, B, bB),
      cd.call(f1mPrefix + "_mul", c, C, cC),
      cd.call(f1mPrefix + "_add", a, b, a_b),
      cd.call(f1mPrefix + "_add", A, B, A_B),
      cd.call(f1mPrefix + "_add", a, c, a_c),
      cd.call(f1mPrefix + "_add", A, C, A_C),
      cd.call(f1mPrefix + "_add", b, c, b_c),
      cd.call(f1mPrefix + "_add", B, C, B_C),
      cd.call(f1mPrefix + "_add", aA, bB, aA_bB),
      cd.call(f1mPrefix + "_add", aA, cC, aA_cC),
      cd.call(f1mPrefix + "_add", bB, cC, bB_cC),
      cd.call(f1mPrefix + "_mul", b_c, B_C, r0),
      cd.call(f1mPrefix + "_sub", r0, bB_cC, r0),
      cd.call(mulNonResidueFn, r0, r0),
      cd.call(f1mPrefix + "_add", aA, r0, r0),
      cd.call(f1mPrefix + "_mul", a_b, A_B, r1),
      cd.call(f1mPrefix + "_sub", r1, aA_bB, r1),
      cd.call(mulNonResidueFn, cC, AUX),
      cd.call(f1mPrefix + "_add", r1, AUX, r1),
      cd.call(f1mPrefix + "_mul", a_c, A_C, r2),
      cd.call(f1mPrefix + "_sub", r2, aA_cC, r2),
      cd.call(f1mPrefix + "_add", r2, bB, r2)
    );
  }
  function buildSquare() {
    const f = module.addFunction(prefix + "_square");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const A = c.getLocal("x");
    const B = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const C = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
    const s0 = c.i32_const(module.alloc(f1n8));
    const ab = c.i32_const(module.alloc(f1n8));
    const s1 = c.i32_const(module.alloc(f1n8));
    const s2 = c.i32_const(module.alloc(f1n8));
    const bc = c.i32_const(module.alloc(f1n8));
    const s3 = c.i32_const(module.alloc(f1n8));
    const s4 = c.i32_const(module.alloc(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_square", A, s0),
      c.call(f1mPrefix + "_mul", A, B, ab),
      c.call(f1mPrefix + "_add", ab, ab, s1),
      c.call(f1mPrefix + "_sub", A, B, s2),
      c.call(f1mPrefix + "_add", s2, C, s2),
      c.call(f1mPrefix + "_square", s2, s2),
      c.call(f1mPrefix + "_mul", B, C, bc),
      c.call(f1mPrefix + "_add", bc, bc, s3),
      c.call(f1mPrefix + "_square", C, s4),
      c.call(mulNonResidueFn, s3, r0),
      c.call(f1mPrefix + "_add", s0, r0, r0),
      c.call(mulNonResidueFn, s4, r1),
      c.call(f1mPrefix + "_add", s1, r1, r1),
      c.call(f1mPrefix + "_add", s0, s4, r2),
      c.call(f1mPrefix + "_sub", s3, r2, r2),
      c.call(f1mPrefix + "_add", s2, r2, r2),
      c.call(f1mPrefix + "_add", s1, r2, r2)
    );
  }
  function buildToMontgomery() {
    const f = module.addFunction(prefix + "_toMontgomery");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
    f.addCode(
      c.call(f1mPrefix + "_toMontgomery", x0, r0),
      c.call(f1mPrefix + "_toMontgomery", x1, r1),
      c.call(f1mPrefix + "_toMontgomery", x2, r2)
    );
  }
  function buildFromMontgomery() {
    const f = module.addFunction(prefix + "_fromMontgomery");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
    f.addCode(
      c.call(f1mPrefix + "_fromMontgomery", x0, r0),
      c.call(f1mPrefix + "_fromMontgomery", x1, r1),
      c.call(f1mPrefix + "_fromMontgomery", x2, r2)
    );
  }
  function buildCopy() {
    const f = module.addFunction(prefix + "_copy");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
    f.addCode(
      c.call(f1mPrefix + "_copy", x0, r0),
      c.call(f1mPrefix + "_copy", x1, r1),
      c.call(f1mPrefix + "_copy", x2, r2)
    );
  }
  function buildZero() {
    const f = module.addFunction(prefix + "_zero");
    f.addParam("x", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    f.addCode(
      c.call(f1mPrefix + "_zero", x0),
      c.call(f1mPrefix + "_zero", x1),
      c.call(f1mPrefix + "_zero", x2)
    );
  }
  function buildOne() {
    const f = module.addFunction(prefix + "_one");
    f.addParam("x", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    f.addCode(
      c.call(f1mPrefix + "_one", x0),
      c.call(f1mPrefix + "_zero", x1),
      c.call(f1mPrefix + "_zero", x2)
    );
  }
  function buildEq() {
    const f = module.addFunction(prefix + "_eq");
    f.addParam("x", "i32");
    f.addParam("y", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const y0 = c.getLocal("y");
    const y1 = c.i32_add(c.getLocal("y"), c.i32_const(f1n8));
    const y2 = c.i32_add(c.getLocal("y"), c.i32_const(2 * f1n8));
    f.addCode(
      c.i32_and(
        c.i32_and(
          c.call(f1mPrefix + "_eq", x0, y0),
          c.call(f1mPrefix + "_eq", x1, y1)
        ),
        c.call(f1mPrefix + "_eq", x2, y2)
      )
    );
  }
  function buildIsZero() {
    const f = module.addFunction(prefix + "_isZero");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    f.addCode(
      c.i32_and(
        c.i32_and(
          c.call(f1mPrefix + "_isZero", x0),
          c.call(f1mPrefix + "_isZero", x1)
        ),
        c.call(f1mPrefix + "_isZero", x2)
      )
    );
  }
  function buildInverse() {
    const f = module.addFunction(prefix + "_inverse");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    const r0 = c.getLocal("r");
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(f1n8));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f1n8));
    const t0 = c.i32_const(module.alloc(f1n8));
    const t1 = c.i32_const(module.alloc(f1n8));
    const t2 = c.i32_const(module.alloc(f1n8));
    const t3 = c.i32_const(module.alloc(f1n8));
    const t4 = c.i32_const(module.alloc(f1n8));
    const t5 = c.i32_const(module.alloc(f1n8));
    const c0 = c.i32_const(module.alloc(f1n8));
    const c1 = c.i32_const(module.alloc(f1n8));
    const c2 = c.i32_const(module.alloc(f1n8));
    const t6 = c.i32_const(module.alloc(f1n8));
    const AUX = c.i32_const(module.alloc(f1n8));
    f.addCode(
      c.call(f1mPrefix + "_square", x0, t0),
      c.call(f1mPrefix + "_square", x1, t1),
      c.call(f1mPrefix + "_square", x2, t2),
      c.call(f1mPrefix + "_mul", x0, x1, t3),
      c.call(f1mPrefix + "_mul", x0, x2, t4),
      c.call(f1mPrefix + "_mul", x1, x2, t5),
      c.call(mulNonResidueFn, t5, c0),
      c.call(f1mPrefix + "_sub", t0, c0, c0),
      c.call(mulNonResidueFn, t2, c1),
      c.call(f1mPrefix + "_sub", c1, t3, c1),
      c.call(f1mPrefix + "_sub", t1, t4, c2),
      c.call(f1mPrefix + "_mul", x2, c1, t6),
      c.call(f1mPrefix + "_mul", x1, c2, AUX),
      c.call(f1mPrefix + "_add", t6, AUX, t6),
      c.call(mulNonResidueFn, t6, t6),
      c.call(f1mPrefix + "_mul", x0, c0, AUX),
      c.call(f1mPrefix + "_add", AUX, t6, t6),
      c.call(f1mPrefix + "_inverse", t6, t6),
      c.call(f1mPrefix + "_mul", t6, c0, r0),
      c.call(f1mPrefix + "_mul", t6, c1, r1),
      c.call(f1mPrefix + "_mul", t6, c2, r2)
    );
  }
  function buildSign() {
    const f = module.addFunction(prefix + "_sign");
    f.addParam("x", "i32");
    f.addLocal("s", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f1n8));
    f.addCode(
      c.setLocal("s", c.call(f1mPrefix + "_sign", x2)),
      c.if(
        c.getLocal("s"),
        c.ret(c.getLocal("s"))
      ),
      c.setLocal("s", c.call(f1mPrefix + "_sign", x1)),
      c.if(
        c.getLocal("s"),
        c.ret(c.getLocal("s"))
      ),
      c.ret(c.call(f1mPrefix + "_sign", x0))
    );
  }
  function buildIsOne() {
    const f = module.addFunction(prefix + "_isOne");
    f.addParam("x", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(f1n8 * 2));
    f.addCode(
      c.ret(
        c.i32_and(
          c.i32_and(
            c.call(f1mPrefix + "_isOne", x0),
            c.call(f1mPrefix + "_isZero", x1)
          ),
          c.call(f1mPrefix + "_isZero", x2)
        )
      )
    );
  }
  buildIsZero();
  buildIsOne();
  buildZero();
  buildOne();
  buildCopy();
  buildMul();
  buildSquare();
  buildAdd();
  buildSub();
  buildNeg();
  buildSign();
  buildToMontgomery();
  buildFromMontgomery();
  buildEq();
  buildInverse();
  buildTimesScalar2();
  buildIsNegative();
  module.exportFunction(prefix + "_isZero");
  module.exportFunction(prefix + "_isOne");
  module.exportFunction(prefix + "_zero");
  module.exportFunction(prefix + "_one");
  module.exportFunction(prefix + "_copy");
  module.exportFunction(prefix + "_mul");
  module.exportFunction(prefix + "_square");
  module.exportFunction(prefix + "_add");
  module.exportFunction(prefix + "_sub");
  module.exportFunction(prefix + "_neg");
  module.exportFunction(prefix + "_sign");
  module.exportFunction(prefix + "_fromMontgomery");
  module.exportFunction(prefix + "_toMontgomery");
  module.exportFunction(prefix + "_eq");
  module.exportFunction(prefix + "_inverse");
  buildBatchInverse(module, prefix);
  buildExp(
    module,
    prefix + "_exp",
    f1n8 * 3,
    prefix + "_mul",
    prefix + "_square",
    prefix + "_copy",
    prefix + "_one"
  );
  module.exportFunction(prefix + "_exp");
  module.exportFunction(prefix + "_timesScalar");
  module.exportFunction(prefix + "_batchInverse");
  module.exportFunction(prefix + "_isNegative");
  return prefix;
};
var build_timesscalarnaf = function buildTimesScalarNAF(module, fnName, elementLen, opAB, opAA, opAmB, opCopy, opInit) {
  const f = module.addFunction(fnName);
  f.addParam("base", "i32");
  f.addParam("scalar", "i32");
  f.addParam("scalarLength", "i32");
  f.addParam("r", "i32");
  f.addLocal("old0", "i32");
  f.addLocal("nbits", "i32");
  f.addLocal("i", "i32");
  f.addLocal("last", "i32");
  f.addLocal("cur", "i32");
  f.addLocal("carry", "i32");
  f.addLocal("p", "i32");
  const c = f.getCodeBuilder();
  const aux = c.i32_const(module.alloc(elementLen));
  function getBit(IDX) {
    return c.i32_and(
      c.i32_shr_u(
        c.i32_load(
          c.i32_add(
            c.getLocal("scalar"),
            c.i32_and(
              c.i32_shr_u(
                IDX,
                c.i32_const(3)
              ),
              c.i32_const(4294967292)
            )
          )
        ),
        c.i32_and(
          IDX,
          c.i32_const(31)
        )
      ),
      c.i32_const(1)
    );
  }
  function pushBit(b) {
    return [
      ...c.i32_store8(
        c.getLocal("p"),
        c.i32_const(b)
      ),
      ...c.setLocal(
        "p",
        c.i32_add(
          c.getLocal("p"),
          c.i32_const(1)
        )
      )
    ];
  }
  f.addCode(
    c.if(
      c.i32_eqz(c.getLocal("scalarLength")),
      [
        ...c.call(opInit, c.getLocal("r")),
        ...c.ret([])
      ]
    ),
    c.setLocal("nbits", c.i32_shl(c.getLocal("scalarLength"), c.i32_const(3))),
    c.setLocal("old0", c.i32_load(c.i32_const(0))),
    c.setLocal("p", c.getLocal("old0")),
    c.i32_store(
      c.i32_const(0),
      c.i32_and(
        c.i32_add(
          c.i32_add(
            c.getLocal("old0"),
            c.i32_const(32)
          ),
          c.getLocal("nbits")
        ),
        c.i32_const(4294967288)
      )
    ),
    c.setLocal("i", c.i32_const(1)),
    c.setLocal("last", getBit(c.i32_const(0))),
    c.setLocal("carry", c.i32_const(0)),
    c.block(c.loop(
      c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("nbits"))),
      c.setLocal("cur", getBit(c.getLocal("i"))),
      c.if(
        c.getLocal("last"),
        c.if(
          c.getLocal("cur"),
          c.if(
            c.getLocal("carry"),
            [
              ...c.setLocal("last", c.i32_const(0)),
              ...c.setLocal("carry", c.i32_const(1)),
              ...pushBit(1)
            ],
            [
              ...c.setLocal("last", c.i32_const(0)),
              ...c.setLocal("carry", c.i32_const(1)),
              ...pushBit(255)
            ]
          ),
          c.if(
            c.getLocal("carry"),
            [
              ...c.setLocal("last", c.i32_const(0)),
              ...c.setLocal("carry", c.i32_const(1)),
              ...pushBit(255)
            ],
            [
              ...c.setLocal("last", c.i32_const(0)),
              ...c.setLocal("carry", c.i32_const(0)),
              ...pushBit(1)
            ]
          )
        ),
        c.if(
          c.getLocal("cur"),
          c.if(
            c.getLocal("carry"),
            [
              ...c.setLocal("last", c.i32_const(0)),
              ...c.setLocal("carry", c.i32_const(1)),
              ...pushBit(0)
            ],
            [
              ...c.setLocal("last", c.i32_const(1)),
              ...c.setLocal("carry", c.i32_const(0)),
              ...pushBit(0)
            ]
          ),
          c.if(
            c.getLocal("carry"),
            [
              ...c.setLocal("last", c.i32_const(1)),
              ...c.setLocal("carry", c.i32_const(0)),
              ...pushBit(0)
            ],
            [
              ...c.setLocal("last", c.i32_const(0)),
              ...c.setLocal("carry", c.i32_const(0)),
              ...pushBit(0)
            ]
          )
        )
      ),
      c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
      c.br(0)
    )),
    c.if(
      c.getLocal("last"),
      c.if(
        c.getLocal("carry"),
        [
          ...pushBit(255),
          ...pushBit(0),
          ...pushBit(1)
        ],
        [
          ...pushBit(1)
        ]
      ),
      c.if(
        c.getLocal("carry"),
        [
          ...pushBit(0),
          ...pushBit(1)
        ]
      )
    ),
    c.setLocal("p", c.i32_sub(c.getLocal("p"), c.i32_const(1))),
    // p already points to the last bit
    c.call(opCopy, c.getLocal("base"), aux),
    c.call(opInit, c.getLocal("r")),
    c.block(c.loop(
      c.call(opAA, c.getLocal("r"), c.getLocal("r")),
      c.setLocal(
        "cur",
        c.i32_load8_u(
          c.getLocal("p")
        )
      ),
      c.if(
        c.getLocal("cur"),
        c.if(
          c.i32_eq(c.getLocal("cur"), c.i32_const(1)),
          c.call(opAB, c.getLocal("r"), aux, c.getLocal("r")),
          c.call(opAmB, c.getLocal("r"), aux, c.getLocal("r"))
        )
      ),
      c.br_if(1, c.i32_eq(c.getLocal("old0"), c.getLocal("p"))),
      c.setLocal("p", c.i32_sub(c.getLocal("p"), c.i32_const(1))),
      c.br(0)
    )),
    c.i32_store(c.i32_const(0), c.getLocal("old0"))
  );
};
var build_multiexp = function buildMultiexp(module, prefix, fnName, opAdd, n8b) {
  const n64g = module.modules[prefix].n64;
  const n8g = n64g * 8;
  function buildGetChunk() {
    const f = module.addFunction(fnName + "_getChunk");
    f.addParam("pScalar", "i32");
    f.addParam("scalarSize", "i32");
    f.addParam("startBit", "i32");
    f.addParam("chunkSize", "i32");
    f.addLocal("bitsToEnd", "i32");
    f.addLocal("mask", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.setLocal(
        "bitsToEnd",
        c.i32_sub(
          c.i32_mul(
            c.getLocal("scalarSize"),
            c.i32_const(8)
          ),
          c.getLocal("startBit")
        )
      ),
      c.if(
        c.i32_gt_s(
          c.getLocal("chunkSize"),
          c.getLocal("bitsToEnd")
        ),
        c.setLocal(
          "mask",
          c.i32_sub(
            c.i32_shl(
              c.i32_const(1),
              c.getLocal("bitsToEnd")
            ),
            c.i32_const(1)
          )
        ),
        c.setLocal(
          "mask",
          c.i32_sub(
            c.i32_shl(
              c.i32_const(1),
              c.getLocal("chunkSize")
            ),
            c.i32_const(1)
          )
        )
      ),
      c.i32_and(
        c.i32_shr_u(
          c.i32_load(
            c.i32_add(
              c.getLocal("pScalar"),
              c.i32_shr_u(
                c.getLocal("startBit"),
                c.i32_const(3)
              )
            ),
            0,
            // offset
            0
            // align to byte.
          ),
          c.i32_and(
            c.getLocal("startBit"),
            c.i32_const(7)
          )
        ),
        c.getLocal("mask")
      )
    );
  }
  function buildMutiexpChunk() {
    const f = module.addFunction(fnName + "_chunk");
    f.addParam("pBases", "i32");
    f.addParam("pScalars", "i32");
    f.addParam("scalarSize", "i32");
    f.addParam("n", "i32");
    f.addParam("startBit", "i32");
    f.addParam("chunkSize", "i32");
    f.addParam("pr", "i32");
    f.addLocal("nChunks", "i32");
    f.addLocal("itScalar", "i32");
    f.addLocal("endScalar", "i32");
    f.addLocal("itBase", "i32");
    f.addLocal("i", "i32");
    f.addLocal("j", "i32");
    f.addLocal("nTable", "i32");
    f.addLocal("pTable", "i32");
    f.addLocal("idx", "i32");
    f.addLocal("pIdxTable", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.if(
        c.i32_eqz(c.getLocal("n")),
        [
          ...c.call(prefix + "_zero", c.getLocal("pr")),
          ...c.ret([])
        ]
      ),
      // Allocate memory
      c.setLocal(
        "nTable",
        c.i32_shl(
          c.i32_const(1),
          c.getLocal("chunkSize")
        )
      ),
      c.setLocal("pTable", c.i32_load(c.i32_const(0))),
      c.i32_store(
        c.i32_const(0),
        c.i32_add(
          c.getLocal("pTable"),
          c.i32_mul(
            c.getLocal("nTable"),
            c.i32_const(n8g)
          )
        )
      ),
      // Reset Table
      c.setLocal("j", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("j"),
            c.getLocal("nTable")
          )
        ),
        c.call(
          prefix + "_zero",
          c.i32_add(
            c.getLocal("pTable"),
            c.i32_mul(
              c.getLocal("j"),
              c.i32_const(n8g)
            )
          )
        ),
        c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
        c.br(0)
      )),
      // Distribute elements
      c.setLocal("itBase", c.getLocal("pBases")),
      c.setLocal("itScalar", c.getLocal("pScalars")),
      c.setLocal(
        "endScalar",
        c.i32_add(
          c.getLocal("pScalars"),
          c.i32_mul(
            c.getLocal("n"),
            c.getLocal("scalarSize")
          )
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("itScalar"),
            c.getLocal("endScalar")
          )
        ),
        c.setLocal(
          "idx",
          c.call(
            fnName + "_getChunk",
            c.getLocal("itScalar"),
            c.getLocal("scalarSize"),
            c.getLocal("startBit"),
            c.getLocal("chunkSize")
          )
        ),
        c.if(
          c.getLocal("idx"),
          [
            ...c.setLocal(
              "pIdxTable",
              c.i32_add(
                c.getLocal("pTable"),
                c.i32_mul(
                  c.i32_sub(
                    c.getLocal("idx"),
                    c.i32_const(1)
                  ),
                  c.i32_const(n8g)
                )
              )
            ),
            ...c.call(
              opAdd,
              c.getLocal("pIdxTable"),
              c.getLocal("itBase"),
              c.getLocal("pIdxTable")
            )
          ]
        ),
        c.setLocal("itScalar", c.i32_add(c.getLocal("itScalar"), c.getLocal("scalarSize"))),
        c.setLocal("itBase", c.i32_add(c.getLocal("itBase"), c.i32_const(n8b))),
        c.br(0)
      )),
      c.call(fnName + "_reduceTable", c.getLocal("pTable"), c.getLocal("chunkSize")),
      c.call(
        prefix + "_copy",
        c.getLocal("pTable"),
        c.getLocal("pr")
      ),
      c.i32_store(
        c.i32_const(0),
        c.getLocal("pTable")
      )
    );
  }
  function buildMultiexp3() {
    const f = module.addFunction(fnName);
    f.addParam("pBases", "i32");
    f.addParam("pScalars", "i32");
    f.addParam("scalarSize", "i32");
    f.addParam("n", "i32");
    f.addParam("pr", "i32");
    f.addLocal("chunkSize", "i32");
    f.addLocal("nChunks", "i32");
    f.addLocal("itScalar", "i32");
    f.addLocal("endScalar", "i32");
    f.addLocal("itBase", "i32");
    f.addLocal("itBit", "i32");
    f.addLocal("i", "i32");
    f.addLocal("j", "i32");
    f.addLocal("nTable", "i32");
    f.addLocal("pTable", "i32");
    f.addLocal("idx", "i32");
    f.addLocal("pIdxTable", "i32");
    const c = f.getCodeBuilder();
    const aux = c.i32_const(module.alloc(n8g));
    const pTSizes2 = module.alloc([
      17,
      17,
      17,
      17,
      17,
      17,
      17,
      17,
      17,
      17,
      16,
      16,
      15,
      14,
      13,
      13,
      12,
      11,
      10,
      9,
      8,
      7,
      7,
      6,
      5,
      4,
      3,
      2,
      1,
      1,
      1,
      1
    ]);
    f.addCode(
      c.call(prefix + "_zero", c.getLocal("pr")),
      c.if(
        c.i32_eqz(c.getLocal("n")),
        c.ret([])
      ),
      c.setLocal("chunkSize", c.i32_load8_u(c.i32_clz(c.getLocal("n")), pTSizes2)),
      c.setLocal(
        "nChunks",
        c.i32_add(
          c.i32_div_u(
            c.i32_sub(
              c.i32_shl(
                c.getLocal("scalarSize"),
                c.i32_const(3)
              ),
              c.i32_const(1)
            ),
            c.getLocal("chunkSize")
          ),
          c.i32_const(1)
        )
      ),
      // Allocate memory
      c.setLocal(
        "itBit",
        c.i32_mul(
          c.i32_sub(
            c.getLocal("nChunks"),
            c.i32_const(1)
          ),
          c.getLocal("chunkSize")
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_lt_s(
            c.getLocal("itBit"),
            c.i32_const(0)
          )
        ),
        // Double nChunk times
        c.if(
          c.i32_eqz(c.call(prefix + "_isZero", c.getLocal("pr"))),
          [
            ...c.setLocal("j", c.i32_const(0)),
            ...c.block(c.loop(
              c.br_if(
                1,
                c.i32_eq(
                  c.getLocal("j"),
                  c.getLocal("chunkSize")
                )
              ),
              c.call(prefix + "_double", c.getLocal("pr"), c.getLocal("pr")),
              c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
              c.br(0)
            ))
          ]
        ),
        c.call(
          fnName + "_chunk",
          c.getLocal("pBases"),
          c.getLocal("pScalars"),
          c.getLocal("scalarSize"),
          c.getLocal("n"),
          c.getLocal("itBit"),
          c.getLocal("chunkSize"),
          aux
        ),
        c.call(
          prefix + "_add",
          c.getLocal("pr"),
          aux,
          c.getLocal("pr")
        ),
        c.setLocal("itBit", c.i32_sub(c.getLocal("itBit"), c.getLocal("chunkSize"))),
        c.br(0)
      ))
    );
  }
  function buildReduceTable() {
    const f = module.addFunction(fnName + "_reduceTable");
    f.addParam("pTable", "i32");
    f.addParam("p", "i32");
    f.addLocal("half", "i32");
    f.addLocal("it1", "i32");
    f.addLocal("it2", "i32");
    f.addLocal("pAcc", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.if(
        c.i32_eq(c.getLocal("p"), c.i32_const(1)),
        c.ret([])
      ),
      c.setLocal(
        "half",
        c.i32_shl(
          c.i32_const(1),
          c.i32_sub(
            c.getLocal("p"),
            c.i32_const(1)
          )
        )
      ),
      c.setLocal("it1", c.getLocal("pTable")),
      c.setLocal(
        "it2",
        c.i32_add(
          c.getLocal("pTable"),
          c.i32_mul(
            c.getLocal("half"),
            c.i32_const(n8g)
          )
        )
      ),
      c.setLocal(
        "pAcc",
        c.i32_sub(
          c.getLocal("it2"),
          c.i32_const(n8g)
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("it1"),
            c.getLocal("pAcc")
          )
        ),
        c.call(
          prefix + "_add",
          c.getLocal("it1"),
          c.getLocal("it2"),
          c.getLocal("it1")
        ),
        c.call(
          prefix + "_add",
          c.getLocal("pAcc"),
          c.getLocal("it2"),
          c.getLocal("pAcc")
        ),
        c.setLocal("it1", c.i32_add(c.getLocal("it1"), c.i32_const(n8g))),
        c.setLocal("it2", c.i32_add(c.getLocal("it2"), c.i32_const(n8g))),
        c.br(0)
      )),
      c.call(
        fnName + "_reduceTable",
        c.getLocal("pTable"),
        c.i32_sub(
          c.getLocal("p"),
          c.i32_const(1)
        )
      ),
      c.setLocal("p", c.i32_sub(c.getLocal("p"), c.i32_const(1))),
      c.block(c.loop(
        c.br_if(1, c.i32_eqz(c.getLocal("p"))),
        c.call(prefix + "_double", c.getLocal("pAcc"), c.getLocal("pAcc")),
        c.setLocal("p", c.i32_sub(c.getLocal("p"), c.i32_const(1))),
        c.br(0)
      )),
      c.call(prefix + "_add", c.getLocal("pTable"), c.getLocal("pAcc"), c.getLocal("pTable"))
    );
  }
  buildGetChunk();
  buildReduceTable();
  buildMutiexpChunk();
  buildMultiexp3();
  module.exportFunction(fnName);
  module.exportFunction(fnName + "_chunk");
};
var buildTimesScalarNAF2 = build_timesscalarnaf;
var buildBatchConvertion = build_batchconvertion;
var buildMultiexp$1 = build_multiexp;
var build_curve_jacobian_a0 = function buildCurve(module, prefix, prefixField, pB) {
  const n64 = module.modules[prefixField].n64;
  const n8 = n64 * 8;
  if (module.modules[prefix]) return prefix;
  module.modules[prefix] = {
    n64: n64 * 3
  };
  function buildIsZero() {
    const f = module.addFunction(prefix + "_isZero");
    f.addParam("p1", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(
      prefixField + "_isZero",
      c.i32_add(
        c.getLocal("p1"),
        c.i32_const(n8 * 2)
      )
    ));
  }
  function buildIsZeroAffine() {
    const f = module.addFunction(prefix + "_isZeroAffine");
    f.addParam("p1", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.i32_and(
        c.call(
          prefixField + "_isZero",
          c.getLocal("p1")
        ),
        c.call(
          prefixField + "_isZero",
          c.i32_add(
            c.getLocal("p1"),
            c.i32_const(n8)
          )
        )
      )
    );
  }
  function buildCopy() {
    const f = module.addFunction(prefix + "_copy");
    f.addParam("ps", "i32");
    f.addParam("pd", "i32");
    const c = f.getCodeBuilder();
    for (let i = 0; i < n64 * 3; i++) {
      f.addCode(
        c.i64_store(
          c.getLocal("pd"),
          i * 8,
          c.i64_load(
            c.getLocal("ps"),
            i * 8
          )
        )
      );
    }
  }
  function buildCopyAffine() {
    const f = module.addFunction(prefix + "_copyAffine");
    f.addParam("ps", "i32");
    f.addParam("pd", "i32");
    const c = f.getCodeBuilder();
    for (let i = 0; i < n64 * 2; i++) {
      f.addCode(
        c.i64_store(
          c.getLocal("pd"),
          i * 8,
          c.i64_load(
            c.getLocal("ps"),
            i * 8
          )
        )
      );
    }
  }
  function buildZero() {
    const f = module.addFunction(prefix + "_zero");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(
      prefixField + "_zero",
      c.getLocal("pr")
    ));
    f.addCode(c.call(
      prefixField + "_one",
      c.i32_add(
        c.getLocal("pr"),
        c.i32_const(n8)
      )
    ));
    f.addCode(c.call(
      prefixField + "_zero",
      c.i32_add(
        c.getLocal("pr"),
        c.i32_const(n8 * 2)
      )
    ));
  }
  function buildZeroAffine() {
    const f = module.addFunction(prefix + "_zeroAffine");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(
      prefixField + "_zero",
      c.getLocal("pr")
    ));
    f.addCode(c.call(
      prefixField + "_zero",
      c.i32_add(
        c.getLocal("pr"),
        c.i32_const(n8)
      )
    ));
  }
  function buildEq() {
    const f = module.addFunction(prefix + "_eq");
    f.addParam("p1", "i32");
    f.addParam("p2", "i32");
    f.setReturnType("i32");
    f.addLocal("z1", "i32");
    f.addLocal("z2", "i32");
    const c = f.getCodeBuilder();
    const x1 = c.getLocal("p1");
    const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
    const z1 = c.getLocal("z1");
    const x2 = c.getLocal("p2");
    const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
    f.addCode(c.setLocal("z2", c.i32_add(c.getLocal("p2"), c.i32_const(n8 * 2))));
    const z2 = c.getLocal("z2");
    const Z1Z1 = c.i32_const(module.alloc(n8));
    const Z2Z2 = c.i32_const(module.alloc(n8));
    const U1 = c.i32_const(module.alloc(n8));
    const U2 = c.i32_const(module.alloc(n8));
    const Z1_cubed = c.i32_const(module.alloc(n8));
    const Z2_cubed = c.i32_const(module.alloc(n8));
    const S1 = c.i32_const(module.alloc(n8));
    const S2 = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZero", c.getLocal("p1")),
        c.ret(c.call(prefix + "_isZero", c.getLocal("p2")))
      ),
      c.if(
        c.call(prefix + "_isZero", c.getLocal("p2")),
        c.ret(c.i32_const(0))
      ),
      c.if(
        c.call(prefixField + "_isOne", z1),
        c.ret(c.call(prefix + "_eqMixed", c.getLocal("p2"), c.getLocal("p1")))
      ),
      c.if(
        c.call(prefixField + "_isOne", z2),
        c.ret(c.call(prefix + "_eqMixed", c.getLocal("p1"), c.getLocal("p2")))
      ),
      c.call(prefixField + "_square", z1, Z1Z1),
      c.call(prefixField + "_square", z2, Z2Z2),
      c.call(prefixField + "_mul", x1, Z2Z2, U1),
      c.call(prefixField + "_mul", x2, Z1Z1, U2),
      c.call(prefixField + "_mul", z1, Z1Z1, Z1_cubed),
      c.call(prefixField + "_mul", z2, Z2Z2, Z2_cubed),
      c.call(prefixField + "_mul", y1, Z2_cubed, S1),
      c.call(prefixField + "_mul", y2, Z1_cubed, S2),
      c.if(
        c.call(prefixField + "_eq", U1, U2),
        c.if(
          c.call(prefixField + "_eq", S1, S2),
          c.ret(c.i32_const(1))
        )
      ),
      c.ret(c.i32_const(0))
    );
  }
  function buildEqMixed() {
    const f = module.addFunction(prefix + "_eqMixed");
    f.addParam("p1", "i32");
    f.addParam("p2", "i32");
    f.setReturnType("i32");
    f.addLocal("z1", "i32");
    const c = f.getCodeBuilder();
    const x1 = c.getLocal("p1");
    const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
    const z1 = c.getLocal("z1");
    const x2 = c.getLocal("p2");
    const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
    const Z1Z1 = c.i32_const(module.alloc(n8));
    const U2 = c.i32_const(module.alloc(n8));
    const Z1_cubed = c.i32_const(module.alloc(n8));
    const S2 = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZero", c.getLocal("p1")),
        c.ret(c.call(prefix + "_isZeroAffine", c.getLocal("p2")))
      ),
      c.if(
        c.call(prefix + "_isZeroAffine", c.getLocal("p2")),
        c.ret(c.i32_const(0))
      ),
      c.if(
        c.call(prefixField + "_isOne", z1),
        c.ret(c.call(prefix + "_eqAffine", c.getLocal("p1"), c.getLocal("p2")))
      ),
      c.call(prefixField + "_square", z1, Z1Z1),
      c.call(prefixField + "_mul", x2, Z1Z1, U2),
      c.call(prefixField + "_mul", z1, Z1Z1, Z1_cubed),
      c.call(prefixField + "_mul", y2, Z1_cubed, S2),
      c.if(
        c.call(prefixField + "_eq", x1, U2),
        c.if(
          c.call(prefixField + "_eq", y1, S2),
          c.ret(c.i32_const(1))
        )
      ),
      c.ret(c.i32_const(0))
    );
  }
  function buildDouble() {
    const f = module.addFunction(prefix + "_double");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("p1");
    const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
    const A = c.i32_const(module.alloc(n8));
    const B = c.i32_const(module.alloc(n8));
    const C = c.i32_const(module.alloc(n8));
    const D = c.i32_const(module.alloc(n8));
    const E = c.i32_const(module.alloc(n8));
    const F = c.i32_const(module.alloc(n8));
    const G = c.i32_const(module.alloc(n8));
    const eightC = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZero", c.getLocal("p1")),
        [
          ...c.call(prefix + "_copy", c.getLocal("p1"), c.getLocal("pr")),
          ...c.ret([])
        ]
      ),
      c.if(
        c.call(prefixField + "_isOne", z),
        [
          ...c.ret(c.call(prefix + "_doubleAffine", c.getLocal("p1"), c.getLocal("pr"))),
          ...c.ret([])
        ]
      ),
      c.call(prefixField + "_square", x, A),
      c.call(prefixField + "_square", y, B),
      c.call(prefixField + "_square", B, C),
      c.call(prefixField + "_add", x, B, D),
      c.call(prefixField + "_square", D, D),
      c.call(prefixField + "_sub", D, A, D),
      c.call(prefixField + "_sub", D, C, D),
      c.call(prefixField + "_add", D, D, D),
      c.call(prefixField + "_add", A, A, E),
      c.call(prefixField + "_add", E, A, E),
      c.call(prefixField + "_square", E, F),
      c.call(prefixField + "_mul", y, z, G),
      c.call(prefixField + "_add", D, D, x3),
      c.call(prefixField + "_sub", F, x3, x3),
      c.call(prefixField + "_add", C, C, eightC),
      c.call(prefixField + "_add", eightC, eightC, eightC),
      c.call(prefixField + "_add", eightC, eightC, eightC),
      c.call(prefixField + "_sub", D, x3, y3),
      c.call(prefixField + "_mul", y3, E, y3),
      c.call(prefixField + "_sub", y3, eightC, y3),
      c.call(prefixField + "_add", G, G, z3)
    );
  }
  function buildDoubleAffine() {
    const f = module.addFunction(prefix + "_doubleAffine");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("p1");
    const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
    const XX = c.i32_const(module.alloc(n8));
    const YY = c.i32_const(module.alloc(n8));
    const YYYY = c.i32_const(module.alloc(n8));
    const S = c.i32_const(module.alloc(n8));
    const M = c.i32_const(module.alloc(n8));
    const eightYYYY = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZeroAffine", c.getLocal("p1")),
        [
          ...c.call(prefix + "_toJacobian", c.getLocal("p1"), c.getLocal("pr")),
          ...c.ret([])
        ]
      ),
      // XX = X1^2
      c.call(prefixField + "_square", x, XX),
      // YY = Y1^2
      c.call(prefixField + "_square", y, YY),
      // YYYY = YY^2
      c.call(prefixField + "_square", YY, YYYY),
      // S = 2*((X1+YY)^2-XX-YYYY)
      c.call(prefixField + "_add", x, YY, S),
      c.call(prefixField + "_square", S, S),
      c.call(prefixField + "_sub", S, XX, S),
      c.call(prefixField + "_sub", S, YYYY, S),
      c.call(prefixField + "_add", S, S, S),
      // M = 3*XX+a  (Hera a=0)
      c.call(prefixField + "_add", XX, XX, M),
      c.call(prefixField + "_add", M, XX, M),
      // Z3 = 2*Y1
      c.call(prefixField + "_add", y, y, z3),
      // T = M^2-2*S
      // X3 = T
      c.call(prefixField + "_square", M, x3),
      c.call(prefixField + "_sub", x3, S, x3),
      c.call(prefixField + "_sub", x3, S, x3),
      // Y3 = M*(S-T)-8*YYYY
      c.call(prefixField + "_add", YYYY, YYYY, eightYYYY),
      c.call(prefixField + "_add", eightYYYY, eightYYYY, eightYYYY),
      c.call(prefixField + "_add", eightYYYY, eightYYYY, eightYYYY),
      c.call(prefixField + "_sub", S, x3, y3),
      c.call(prefixField + "_mul", y3, M, y3),
      c.call(prefixField + "_sub", y3, eightYYYY, y3)
    );
  }
  function buildEqAffine() {
    const f = module.addFunction(prefix + "_eqAffine");
    f.addParam("p1", "i32");
    f.addParam("p2", "i32");
    f.setReturnType("i32");
    f.addLocal("z1", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.ret(c.i32_and(
        c.call(
          prefixField + "_eq",
          c.getLocal("p1"),
          c.getLocal("p2")
        ),
        c.call(
          prefixField + "_eq",
          c.i32_add(c.getLocal("p1"), c.i32_const(n8)),
          c.i32_add(c.getLocal("p2"), c.i32_const(n8))
        )
      ))
    );
  }
  function buildToMontgomery() {
    const f = module.addFunction(prefix + "_toMontgomery");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(
      prefixField + "_toMontgomery",
      c.getLocal("p1"),
      c.getLocal("pr")
    ));
    for (let i = 1; i < 3; i++) {
      f.addCode(c.call(
        prefixField + "_toMontgomery",
        c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
        c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
      ));
    }
  }
  function buildToMontgomeryAffine() {
    const f = module.addFunction(prefix + "_toMontgomeryAffine");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(
      prefixField + "_toMontgomery",
      c.getLocal("p1"),
      c.getLocal("pr")
    ));
    for (let i = 1; i < 2; i++) {
      f.addCode(c.call(
        prefixField + "_toMontgomery",
        c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
        c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
      ));
    }
  }
  function buildFromMontgomery() {
    const f = module.addFunction(prefix + "_fromMontgomery");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(
      prefixField + "_fromMontgomery",
      c.getLocal("p1"),
      c.getLocal("pr")
    ));
    for (let i = 1; i < 3; i++) {
      f.addCode(c.call(
        prefixField + "_fromMontgomery",
        c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
        c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
      ));
    }
  }
  function buildFromMontgomeryAffine() {
    const f = module.addFunction(prefix + "_fromMontgomeryAffine");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(c.call(
      prefixField + "_fromMontgomery",
      c.getLocal("p1"),
      c.getLocal("pr")
    ));
    for (let i = 1; i < 2; i++) {
      f.addCode(c.call(
        prefixField + "_fromMontgomery",
        c.i32_add(c.getLocal("p1"), c.i32_const(i * n8)),
        c.i32_add(c.getLocal("pr"), c.i32_const(i * n8))
      ));
    }
  }
  function buildAdd() {
    const f = module.addFunction(prefix + "_add");
    f.addParam("p1", "i32");
    f.addParam("p2", "i32");
    f.addParam("pr", "i32");
    f.addLocal("z1", "i32");
    f.addLocal("z2", "i32");
    const c = f.getCodeBuilder();
    const x1 = c.getLocal("p1");
    const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
    const z1 = c.getLocal("z1");
    const x2 = c.getLocal("p2");
    const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
    f.addCode(c.setLocal("z2", c.i32_add(c.getLocal("p2"), c.i32_const(n8 * 2))));
    const z2 = c.getLocal("z2");
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
    const Z1Z1 = c.i32_const(module.alloc(n8));
    const Z2Z2 = c.i32_const(module.alloc(n8));
    const U1 = c.i32_const(module.alloc(n8));
    const U2 = c.i32_const(module.alloc(n8));
    const Z1_cubed = c.i32_const(module.alloc(n8));
    const Z2_cubed = c.i32_const(module.alloc(n8));
    const S1 = c.i32_const(module.alloc(n8));
    const S2 = c.i32_const(module.alloc(n8));
    const H = c.i32_const(module.alloc(n8));
    const S2_minus_S1 = c.i32_const(module.alloc(n8));
    const I = c.i32_const(module.alloc(n8));
    const J = c.i32_const(module.alloc(n8));
    const r = c.i32_const(module.alloc(n8));
    const r2 = c.i32_const(module.alloc(n8));
    const V = c.i32_const(module.alloc(n8));
    const V2 = c.i32_const(module.alloc(n8));
    const S1_J2 = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZero", c.getLocal("p1")),
        [
          ...c.call(prefix + "_copy", c.getLocal("p2"), c.getLocal("pr")),
          ...c.ret([])
        ]
      ),
      c.if(
        c.call(prefix + "_isZero", c.getLocal("p2")),
        [
          ...c.call(prefix + "_copy", c.getLocal("p1"), c.getLocal("pr")),
          ...c.ret([])
        ]
      ),
      c.if(
        c.call(prefixField + "_isOne", z1),
        [
          ...c.call(prefix + "_addMixed", x2, x1, x3),
          ...c.ret([])
        ]
      ),
      c.if(
        c.call(prefixField + "_isOne", z2),
        [
          ...c.call(prefix + "_addMixed", x1, x2, x3),
          ...c.ret([])
        ]
      ),
      c.call(prefixField + "_square", z1, Z1Z1),
      c.call(prefixField + "_square", z2, Z2Z2),
      c.call(prefixField + "_mul", x1, Z2Z2, U1),
      c.call(prefixField + "_mul", x2, Z1Z1, U2),
      c.call(prefixField + "_mul", z1, Z1Z1, Z1_cubed),
      c.call(prefixField + "_mul", z2, Z2Z2, Z2_cubed),
      c.call(prefixField + "_mul", y1, Z2_cubed, S1),
      c.call(prefixField + "_mul", y2, Z1_cubed, S2),
      c.if(
        c.call(prefixField + "_eq", U1, U2),
        c.if(
          c.call(prefixField + "_eq", S1, S2),
          [
            ...c.call(prefix + "_double", c.getLocal("p1"), c.getLocal("pr")),
            ...c.ret([])
          ]
        )
      ),
      c.call(prefixField + "_sub", U2, U1, H),
      c.call(prefixField + "_sub", S2, S1, S2_minus_S1),
      c.call(prefixField + "_add", H, H, I),
      c.call(prefixField + "_square", I, I),
      c.call(prefixField + "_mul", H, I, J),
      c.call(prefixField + "_add", S2_minus_S1, S2_minus_S1, r),
      c.call(prefixField + "_mul", U1, I, V),
      c.call(prefixField + "_square", r, r2),
      c.call(prefixField + "_add", V, V, V2),
      c.call(prefixField + "_sub", r2, J, x3),
      c.call(prefixField + "_sub", x3, V2, x3),
      c.call(prefixField + "_mul", S1, J, S1_J2),
      c.call(prefixField + "_add", S1_J2, S1_J2, S1_J2),
      c.call(prefixField + "_sub", V, x3, y3),
      c.call(prefixField + "_mul", y3, r, y3),
      c.call(prefixField + "_sub", y3, S1_J2, y3),
      c.call(prefixField + "_add", z1, z2, z3),
      c.call(prefixField + "_square", z3, z3),
      c.call(prefixField + "_sub", z3, Z1Z1, z3),
      c.call(prefixField + "_sub", z3, Z2Z2, z3),
      c.call(prefixField + "_mul", z3, H, z3)
    );
  }
  function buildAddMixed() {
    const f = module.addFunction(prefix + "_addMixed");
    f.addParam("p1", "i32");
    f.addParam("p2", "i32");
    f.addParam("pr", "i32");
    f.addLocal("z1", "i32");
    const c = f.getCodeBuilder();
    const x1 = c.getLocal("p1");
    const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
    const z1 = c.getLocal("z1");
    const x2 = c.getLocal("p2");
    const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
    const Z1Z1 = c.i32_const(module.alloc(n8));
    const U2 = c.i32_const(module.alloc(n8));
    const Z1_cubed = c.i32_const(module.alloc(n8));
    const S2 = c.i32_const(module.alloc(n8));
    const H = c.i32_const(module.alloc(n8));
    const HH = c.i32_const(module.alloc(n8));
    const S2_minus_y1 = c.i32_const(module.alloc(n8));
    const I = c.i32_const(module.alloc(n8));
    const J = c.i32_const(module.alloc(n8));
    const r = c.i32_const(module.alloc(n8));
    const r2 = c.i32_const(module.alloc(n8));
    const V = c.i32_const(module.alloc(n8));
    const V2 = c.i32_const(module.alloc(n8));
    const y1_J2 = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZero", c.getLocal("p1")),
        [
          ...c.call(prefix + "_copyAffine", c.getLocal("p2"), c.getLocal("pr")),
          ...c.call(prefixField + "_one", c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2))),
          ...c.ret([])
        ]
      ),
      c.if(
        c.call(prefix + "_isZeroAffine", c.getLocal("p2")),
        [
          ...c.call(prefix + "_copy", c.getLocal("p1"), c.getLocal("pr")),
          ...c.ret([])
        ]
      ),
      c.if(
        c.call(prefixField + "_isOne", z1),
        [
          ...c.call(prefix + "_addAffine", x1, x2, x3),
          ...c.ret([])
        ]
      ),
      c.call(prefixField + "_square", z1, Z1Z1),
      c.call(prefixField + "_mul", x2, Z1Z1, U2),
      c.call(prefixField + "_mul", z1, Z1Z1, Z1_cubed),
      c.call(prefixField + "_mul", y2, Z1_cubed, S2),
      c.if(
        c.call(prefixField + "_eq", x1, U2),
        c.if(
          c.call(prefixField + "_eq", y1, S2),
          [
            ...c.call(prefix + "_doubleAffine", c.getLocal("p2"), c.getLocal("pr")),
            ...c.ret([])
          ]
        )
      ),
      c.call(prefixField + "_sub", U2, x1, H),
      c.call(prefixField + "_sub", S2, y1, S2_minus_y1),
      c.call(prefixField + "_square", H, HH),
      c.call(prefixField + "_add", HH, HH, I),
      c.call(prefixField + "_add", I, I, I),
      c.call(prefixField + "_mul", H, I, J),
      c.call(prefixField + "_add", S2_minus_y1, S2_minus_y1, r),
      c.call(prefixField + "_mul", x1, I, V),
      c.call(prefixField + "_square", r, r2),
      c.call(prefixField + "_add", V, V, V2),
      c.call(prefixField + "_sub", r2, J, x3),
      c.call(prefixField + "_sub", x3, V2, x3),
      c.call(prefixField + "_mul", y1, J, y1_J2),
      c.call(prefixField + "_add", y1_J2, y1_J2, y1_J2),
      c.call(prefixField + "_sub", V, x3, y3),
      c.call(prefixField + "_mul", y3, r, y3),
      c.call(prefixField + "_sub", y3, y1_J2, y3),
      c.call(prefixField + "_add", z1, H, z3),
      c.call(prefixField + "_square", z3, z3),
      c.call(prefixField + "_sub", z3, Z1Z1, z3),
      c.call(prefixField + "_sub", z3, HH, z3)
    );
  }
  function buildAddAffine() {
    const f = module.addFunction(prefix + "_addAffine");
    f.addParam("p1", "i32");
    f.addParam("p2", "i32");
    f.addParam("pr", "i32");
    f.addLocal("z1", "i32");
    const c = f.getCodeBuilder();
    const x1 = c.getLocal("p1");
    const y1 = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    f.addCode(c.setLocal("z1", c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2))));
    const x2 = c.getLocal("p2");
    const y2 = c.i32_add(c.getLocal("p2"), c.i32_const(n8));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
    const H = c.i32_const(module.alloc(n8));
    const HH = c.i32_const(module.alloc(n8));
    const y2_minus_y1 = c.i32_const(module.alloc(n8));
    const I = c.i32_const(module.alloc(n8));
    const J = c.i32_const(module.alloc(n8));
    const r = c.i32_const(module.alloc(n8));
    const r2 = c.i32_const(module.alloc(n8));
    const V = c.i32_const(module.alloc(n8));
    const V2 = c.i32_const(module.alloc(n8));
    const y1_J2 = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZeroAffine", c.getLocal("p1")),
        [
          ...c.call(prefix + "_copyAffine", c.getLocal("p2"), c.getLocal("pr")),
          ...c.call(prefixField + "_one", c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2))),
          ...c.ret([])
        ]
      ),
      c.if(
        c.call(prefix + "_isZeroAffine", c.getLocal("p2")),
        [
          ...c.call(prefix + "_copyAffine", c.getLocal("p1"), c.getLocal("pr")),
          ...c.call(prefixField + "_one", c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2))),
          ...c.ret([])
        ]
      ),
      c.if(
        c.call(prefixField + "_eq", x1, x2),
        c.if(
          c.call(prefixField + "_eq", y1, y2),
          [
            ...c.call(prefix + "_doubleAffine", c.getLocal("p2"), c.getLocal("pr")),
            ...c.ret([])
          ]
        )
      ),
      c.call(prefixField + "_sub", x2, x1, H),
      c.call(prefixField + "_sub", y2, y1, y2_minus_y1),
      c.call(prefixField + "_square", H, HH),
      c.call(prefixField + "_add", HH, HH, I),
      c.call(prefixField + "_add", I, I, I),
      c.call(prefixField + "_mul", H, I, J),
      c.call(prefixField + "_add", y2_minus_y1, y2_minus_y1, r),
      c.call(prefixField + "_mul", x1, I, V),
      c.call(prefixField + "_square", r, r2),
      c.call(prefixField + "_add", V, V, V2),
      c.call(prefixField + "_sub", r2, J, x3),
      c.call(prefixField + "_sub", x3, V2, x3),
      c.call(prefixField + "_mul", y1, J, y1_J2),
      c.call(prefixField + "_add", y1_J2, y1_J2, y1_J2),
      c.call(prefixField + "_sub", V, x3, y3),
      c.call(prefixField + "_mul", y3, r, y3),
      c.call(prefixField + "_sub", y3, y1_J2, y3),
      c.call(prefixField + "_add", H, H, z3)
    );
  }
  function buildNeg() {
    const f = module.addFunction(prefix + "_neg");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("p1");
    const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
    f.addCode(
      c.call(prefixField + "_copy", x, x3),
      c.call(prefixField + "_neg", y, y3),
      c.call(prefixField + "_copy", z, z3)
    );
  }
  function buildNegAffine() {
    const f = module.addFunction(prefix + "_negAffine");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("p1");
    const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    f.addCode(
      c.call(prefixField + "_copy", x, x3),
      c.call(prefixField + "_neg", y, y3)
    );
  }
  function buildSub() {
    const f = module.addFunction(prefix + "_sub");
    f.addParam("p1", "i32");
    f.addParam("p2", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const AUX = c.i32_const(module.alloc(n8 * 3));
    f.addCode(
      c.call(prefix + "_neg", c.getLocal("p2"), AUX),
      c.call(prefix + "_add", c.getLocal("p1"), AUX, c.getLocal("pr"))
    );
  }
  function buildSubMixed() {
    const f = module.addFunction(prefix + "_subMixed");
    f.addParam("p1", "i32");
    f.addParam("p2", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const AUX = c.i32_const(module.alloc(n8 * 3));
    f.addCode(
      c.call(prefix + "_negAffine", c.getLocal("p2"), AUX),
      c.call(prefix + "_addMixed", c.getLocal("p1"), AUX, c.getLocal("pr"))
    );
  }
  function buildSubAffine() {
    const f = module.addFunction(prefix + "_subAffine");
    f.addParam("p1", "i32");
    f.addParam("p2", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const AUX = c.i32_const(module.alloc(n8 * 3));
    f.addCode(
      c.call(prefix + "_negAffine", c.getLocal("p2"), AUX),
      c.call(prefix + "_addAffine", c.getLocal("p1"), AUX, c.getLocal("pr"))
    );
  }
  function buildNormalize() {
    const f = module.addFunction(prefix + "_normalize");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("p1");
    const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
    const Z_inv = c.i32_const(module.alloc(n8));
    const Z2_inv = c.i32_const(module.alloc(n8));
    const Z3_inv = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZero", c.getLocal("p1")),
        c.call(prefix + "_zero", c.getLocal("pr")),
        [
          ...c.call(prefixField + "_inverse", z, Z_inv),
          ...c.call(prefixField + "_square", Z_inv, Z2_inv),
          ...c.call(prefixField + "_mul", Z_inv, Z2_inv, Z3_inv),
          ...c.call(prefixField + "_mul", x, Z2_inv, x3),
          ...c.call(prefixField + "_mul", y, Z3_inv, y3),
          ...c.call(prefixField + "_one", z3)
        ]
      )
    );
  }
  function buildToAffine() {
    const f = module.addFunction(prefix + "_toAffine");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("p1");
    const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    const z = c.i32_add(c.getLocal("p1"), c.i32_const(n8 * 2));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    const Z_inv = c.i32_const(module.alloc(n8));
    const Z2_inv = c.i32_const(module.alloc(n8));
    const Z3_inv = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZero", c.getLocal("p1")),
        [
          ...c.call(prefixField + "_zero", x3),
          ...c.call(prefixField + "_zero", y3)
        ],
        [
          ...c.call(prefixField + "_inverse", z, Z_inv),
          ...c.call(prefixField + "_square", Z_inv, Z2_inv),
          ...c.call(prefixField + "_mul", Z_inv, Z2_inv, Z3_inv),
          ...c.call(prefixField + "_mul", x, Z2_inv, x3),
          ...c.call(prefixField + "_mul", y, Z3_inv, y3)
        ]
      )
    );
  }
  function buildToJacobian() {
    const f = module.addFunction(prefix + "_toJacobian");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("p1");
    const y = c.i32_add(c.getLocal("p1"), c.i32_const(n8));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8));
    const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2));
    f.addCode(
      c.if(
        c.call(prefix + "_isZeroAffine", c.getLocal("p1")),
        c.call(prefix + "_zero", c.getLocal("pr")),
        [
          ...c.call(prefixField + "_one", z3),
          ...c.call(prefixField + "_copy", y, y3),
          ...c.call(prefixField + "_copy", x, x3)
        ]
      )
    );
  }
  function buildBatchToAffine() {
    const f = module.addFunction(prefix + "_batchToAffine");
    f.addParam("pIn", "i32");
    f.addParam("n", "i32");
    f.addParam("pOut", "i32");
    f.addLocal("pAux", "i32");
    f.addLocal("itIn", "i32");
    f.addLocal("itAux", "i32");
    f.addLocal("itOut", "i32");
    f.addLocal("i", "i32");
    const c = f.getCodeBuilder();
    const tmp = c.i32_const(module.alloc(n8));
    f.addCode(
      c.setLocal("pAux", c.i32_load(c.i32_const(0))),
      c.i32_store(
        c.i32_const(0),
        c.i32_add(
          c.getLocal("pAux"),
          c.i32_mul(c.getLocal("n"), c.i32_const(n8))
        )
      ),
      c.call(
        prefixField + "_batchInverse",
        c.i32_add(c.getLocal("pIn"), c.i32_const(n8 * 2)),
        c.i32_const(n8 * 3),
        c.getLocal("n"),
        c.getLocal("pAux"),
        c.i32_const(n8)
      ),
      c.setLocal("itIn", c.getLocal("pIn")),
      c.setLocal("itAux", c.getLocal("pAux")),
      c.setLocal("itOut", c.getLocal("pOut")),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
        c.if(
          c.call(prefixField + "_isZero", c.getLocal("itAux")),
          [
            ...c.call(prefixField + "_zero", c.getLocal("itOut")),
            ...c.call(prefixField + "_zero", c.i32_add(c.getLocal("itOut"), c.i32_const(n8)))
          ],
          [
            ...c.call(
              prefixField + "_mul",
              c.getLocal("itAux"),
              c.i32_add(c.getLocal("itIn"), c.i32_const(n8)),
              tmp
            ),
            ...c.call(
              prefixField + "_square",
              c.getLocal("itAux"),
              c.getLocal("itAux")
            ),
            ...c.call(
              prefixField + "_mul",
              c.getLocal("itAux"),
              c.getLocal("itIn"),
              c.getLocal("itOut")
            ),
            ...c.call(
              prefixField + "_mul",
              c.getLocal("itAux"),
              tmp,
              c.i32_add(c.getLocal("itOut"), c.i32_const(n8))
            )
          ]
        ),
        c.setLocal("itIn", c.i32_add(c.getLocal("itIn"), c.i32_const(n8 * 3))),
        c.setLocal("itOut", c.i32_add(c.getLocal("itOut"), c.i32_const(n8 * 2))),
        c.setLocal("itAux", c.i32_add(c.getLocal("itAux"), c.i32_const(n8))),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      )),
      c.i32_store(
        c.i32_const(0),
        c.getLocal("pAux")
      )
    );
  }
  function buildReverseBytes() {
    const f = module.addFunction(prefix + "__reverseBytes");
    f.addParam("pIn", "i32");
    f.addParam("n", "i32");
    f.addParam("pOut", "i32");
    f.addLocal("itOut", "i32");
    f.addLocal("itIn", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.setLocal(
        "itOut",
        c.i32_sub(
          c.i32_add(
            c.getLocal("pOut"),
            c.getLocal("n")
          ),
          c.i32_const(1)
        )
      ),
      c.setLocal(
        "itIn",
        c.getLocal("pIn")
      ),
      c.block(c.loop(
        c.br_if(1, c.i32_lt_s(c.getLocal("itOut"), c.getLocal("pOut"))),
        c.i32_store8(
          c.getLocal("itOut"),
          c.i32_load8_u(c.getLocal("itIn"))
        ),
        c.setLocal("itOut", c.i32_sub(c.getLocal("itOut"), c.i32_const(1))),
        c.setLocal("itIn", c.i32_add(c.getLocal("itIn"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  function buildLEMtoC() {
    const f = module.addFunction(prefix + "_LEMtoC");
    f.addParam("pIn", "i32");
    f.addParam("pOut", "i32");
    const c = f.getCodeBuilder();
    const tmp = c.i32_const(module.alloc(n8));
    f.addCode(
      c.if(
        c.call(prefix + "_isZeroAffine", c.getLocal("pIn")),
        [
          ...c.call(prefixField + "_zero", c.getLocal("pOut")),
          ...c.i32_store8(
            c.getLocal("pOut"),
            c.i32_const(64)
          ),
          ...c.ret([])
        ]
      ),
      c.call(prefixField + "_fromMontgomery", c.getLocal("pIn"), tmp),
      c.call(prefix + "__reverseBytes", tmp, c.i32_const(n8), c.getLocal("pOut")),
      c.if(
        c.i32_eq(
          c.call(prefixField + "_sign", c.i32_add(c.getLocal("pIn"), c.i32_const(n8))),
          c.i32_const(-1)
        ),
        c.i32_store8(
          c.getLocal("pOut"),
          c.i32_or(
            c.i32_load8_u(c.getLocal("pOut")),
            c.i32_const(128)
          )
        )
      )
    );
  }
  function buildLEMtoU() {
    const f = module.addFunction(prefix + "_LEMtoU");
    f.addParam("pIn", "i32");
    f.addParam("pOut", "i32");
    const c = f.getCodeBuilder();
    const pTmp = module.alloc(n8 * 2);
    const tmp = c.i32_const(pTmp);
    const tmpX = c.i32_const(pTmp);
    const tmpY = c.i32_const(pTmp + n8);
    f.addCode(
      c.if(
        c.call(prefix + "_isZeroAffine", c.getLocal("pIn")),
        [
          ...c.call(prefix + "_zeroAffine", c.getLocal("pOut")),
          ...c.ret([])
        ]
      ),
      c.call(prefix + "_fromMontgomeryAffine", c.getLocal("pIn"), tmp),
      c.call(prefix + "__reverseBytes", tmpX, c.i32_const(n8), c.getLocal("pOut")),
      c.call(prefix + "__reverseBytes", tmpY, c.i32_const(n8), c.i32_add(c.getLocal("pOut"), c.i32_const(n8)))
    );
  }
  function buildUtoLEM() {
    const f = module.addFunction(prefix + "_UtoLEM");
    f.addParam("pIn", "i32");
    f.addParam("pOut", "i32");
    const c = f.getCodeBuilder();
    const pTmp = module.alloc(n8 * 2);
    const tmp = c.i32_const(pTmp);
    const tmpX = c.i32_const(pTmp);
    const tmpY = c.i32_const(pTmp + n8);
    f.addCode(
      c.if(
        c.i32_and(c.i32_load8_u(c.getLocal("pIn")), c.i32_const(64)),
        [
          ...c.call(prefix + "_zeroAffine", c.getLocal("pOut")),
          ...c.ret([])
        ]
      ),
      c.call(prefix + "__reverseBytes", c.getLocal("pIn"), c.i32_const(n8), tmpX),
      c.call(prefix + "__reverseBytes", c.i32_add(c.getLocal("pIn"), c.i32_const(n8)), c.i32_const(n8), tmpY),
      c.call(prefix + "_toMontgomeryAffine", tmp, c.getLocal("pOut"))
    );
  }
  function buildCtoLEM() {
    const f = module.addFunction(prefix + "_CtoLEM");
    f.addParam("pIn", "i32");
    f.addParam("pOut", "i32");
    f.addLocal("firstByte", "i32");
    f.addLocal("greatest", "i32");
    const c = f.getCodeBuilder();
    const pTmp = module.alloc(n8 * 2);
    const tmpX = c.i32_const(pTmp);
    const tmpY = c.i32_const(pTmp + n8);
    f.addCode(
      c.setLocal("firstByte", c.i32_load8_u(c.getLocal("pIn"))),
      c.if(
        c.i32_and(
          c.getLocal("firstByte"),
          c.i32_const(64)
        ),
        [
          ...c.call(prefix + "_zeroAffine", c.getLocal("pOut")),
          ...c.ret([])
        ]
      ),
      c.setLocal(
        "greatest",
        c.i32_and(
          c.getLocal("firstByte"),
          c.i32_const(128)
        )
      ),
      c.call(prefixField + "_copy", c.getLocal("pIn"), tmpY),
      c.i32_store8(tmpY, c.i32_and(c.getLocal("firstByte"), c.i32_const(63))),
      c.call(prefix + "__reverseBytes", tmpY, c.i32_const(n8), tmpX),
      c.call(prefixField + "_toMontgomery", tmpX, c.getLocal("pOut")),
      c.call(prefixField + "_square", c.getLocal("pOut"), tmpY),
      c.call(prefixField + "_mul", c.getLocal("pOut"), tmpY, tmpY),
      c.call(prefixField + "_add", tmpY, c.i32_const(pB), tmpY),
      c.call(prefixField + "_sqrt", tmpY, tmpY),
      c.call(prefixField + "_neg", tmpY, tmpX),
      c.if(
        c.i32_eq(
          c.call(prefixField + "_sign", tmpY),
          c.i32_const(-1)
        ),
        c.if(
          c.getLocal("greatest"),
          c.call(prefixField + "_copy", tmpY, c.i32_add(c.getLocal("pOut"), c.i32_const(n8))),
          c.call(prefixField + "_neg", tmpY, c.i32_add(c.getLocal("pOut"), c.i32_const(n8)))
        ),
        c.if(
          c.getLocal("greatest"),
          c.call(prefixField + "_neg", tmpY, c.i32_add(c.getLocal("pOut"), c.i32_const(n8))),
          c.call(prefixField + "_copy", tmpY, c.i32_add(c.getLocal("pOut"), c.i32_const(n8)))
        )
      )
    );
  }
  function buildInCurveAffine() {
    const f = module.addFunction(prefix + "_inCurveAffine");
    f.addParam("pIn", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("pIn");
    const y = c.i32_add(c.getLocal("pIn"), c.i32_const(n8));
    const y2 = c.i32_const(module.alloc(n8));
    const x3b = c.i32_const(module.alloc(n8));
    f.addCode(
      c.call(prefixField + "_square", y, y2),
      c.call(prefixField + "_square", x, x3b),
      c.call(prefixField + "_mul", x, x3b, x3b),
      c.call(prefixField + "_add", x3b, c.i32_const(pB), x3b),
      c.ret(
        c.call(prefixField + "_eq", y2, x3b)
      )
    );
  }
  function buildInCurve() {
    const f = module.addFunction(prefix + "_inCurve");
    f.addParam("pIn", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const aux = c.i32_const(module.alloc(n8 * 2));
    f.addCode(
      c.call(prefix + "_toAffine", c.getLocal("pIn"), aux),
      c.ret(
        c.call(prefix + "_inCurveAffine", aux)
      )
    );
  }
  buildIsZeroAffine();
  buildIsZero();
  buildZeroAffine();
  buildZero();
  buildCopyAffine();
  buildCopy();
  buildToJacobian();
  buildEqAffine();
  buildEqMixed();
  buildEq();
  buildDoubleAffine();
  buildDouble();
  buildAddAffine();
  buildAddMixed();
  buildAdd();
  buildNegAffine();
  buildNeg();
  buildSubAffine();
  buildSubMixed();
  buildSub();
  buildFromMontgomeryAffine();
  buildFromMontgomery();
  buildToMontgomeryAffine();
  buildToMontgomery();
  buildToAffine();
  buildInCurveAffine();
  buildInCurve();
  buildBatchToAffine();
  buildNormalize();
  buildReverseBytes();
  buildLEMtoU();
  buildLEMtoC();
  buildUtoLEM();
  buildCtoLEM();
  buildBatchConvertion(module, prefix + "_batchLEMtoU", prefix + "_LEMtoU", n8 * 2, n8 * 2);
  buildBatchConvertion(module, prefix + "_batchLEMtoC", prefix + "_LEMtoC", n8 * 2, n8);
  buildBatchConvertion(module, prefix + "_batchUtoLEM", prefix + "_UtoLEM", n8 * 2, n8 * 2);
  buildBatchConvertion(module, prefix + "_batchCtoLEM", prefix + "_CtoLEM", n8, n8 * 2, true);
  buildBatchConvertion(module, prefix + "_batchToJacobian", prefix + "_toJacobian", n8 * 2, n8 * 3, true);
  buildMultiexp$1(module, prefix, prefix + "_multiexp", prefix + "_add", n8 * 3);
  buildMultiexp$1(module, prefix, prefix + "_multiexpAffine", prefix + "_addMixed", n8 * 2);
  buildTimesScalarNAF2(
    module,
    prefix + "_timesScalar",
    n8 * 3,
    prefix + "_add",
    prefix + "_double",
    prefix + "_sub",
    prefix + "_copy",
    prefix + "_zero"
  );
  buildTimesScalarNAF2(
    module,
    prefix + "_timesScalarAffine",
    n8 * 2,
    prefix + "_addMixed",
    prefix + "_double",
    prefix + "_subMixed",
    prefix + "_copyAffine",
    prefix + "_zero"
  );
  module.exportFunction(prefix + "_isZero");
  module.exportFunction(prefix + "_isZeroAffine");
  module.exportFunction(prefix + "_eq");
  module.exportFunction(prefix + "_eqMixed");
  module.exportFunction(prefix + "_eqAffine");
  module.exportFunction(prefix + "_copy");
  module.exportFunction(prefix + "_copyAffine");
  module.exportFunction(prefix + "_zero");
  module.exportFunction(prefix + "_zeroAffine");
  module.exportFunction(prefix + "_double");
  module.exportFunction(prefix + "_doubleAffine");
  module.exportFunction(prefix + "_add");
  module.exportFunction(prefix + "_addMixed");
  module.exportFunction(prefix + "_addAffine");
  module.exportFunction(prefix + "_neg");
  module.exportFunction(prefix + "_negAffine");
  module.exportFunction(prefix + "_sub");
  module.exportFunction(prefix + "_subMixed");
  module.exportFunction(prefix + "_subAffine");
  module.exportFunction(prefix + "_fromMontgomery");
  module.exportFunction(prefix + "_fromMontgomeryAffine");
  module.exportFunction(prefix + "_toMontgomery");
  module.exportFunction(prefix + "_toMontgomeryAffine");
  module.exportFunction(prefix + "_timesScalar");
  module.exportFunction(prefix + "_timesScalarAffine");
  module.exportFunction(prefix + "_normalize");
  module.exportFunction(prefix + "_LEMtoU");
  module.exportFunction(prefix + "_LEMtoC");
  module.exportFunction(prefix + "_UtoLEM");
  module.exportFunction(prefix + "_CtoLEM");
  module.exportFunction(prefix + "_batchLEMtoU");
  module.exportFunction(prefix + "_batchLEMtoC");
  module.exportFunction(prefix + "_batchUtoLEM");
  module.exportFunction(prefix + "_batchCtoLEM");
  module.exportFunction(prefix + "_toAffine");
  module.exportFunction(prefix + "_toJacobian");
  module.exportFunction(prefix + "_batchToAffine");
  module.exportFunction(prefix + "_batchToJacobian");
  module.exportFunction(prefix + "_inCurve");
  module.exportFunction(prefix + "_inCurveAffine");
  return prefix;
};
var { isOdd: isOdd$2, modInv: modInv$1, modPow } = bigint;
var utils$3 = utils$6;
var build_fft = function buildFFT(module, prefix, gPrefix, fPrefix, opGtimesF) {
  const n64f = module.modules[fPrefix].n64;
  const n8f = n64f * 8;
  const n64g = module.modules[gPrefix].n64;
  const n8g = n64g * 8;
  const q = module.modules[fPrefix].q;
  let rem = q - 1n;
  let maxBits = 0;
  while (!isOdd$2(rem)) {
    maxBits++;
    rem = rem >> 1n;
  }
  let nr = 2n;
  while (modPow(nr, q >> 1n, q) === 1n) nr = nr + 1n;
  const w = new Array(maxBits + 1);
  w[maxBits] = modPow(nr, rem, q);
  let n = maxBits - 1;
  while (n >= 0) {
    w[n] = modPow(w[n + 1], 2n, q);
    n--;
  }
  const bytes2 = [];
  const R = (1n << BigInt(n8f * 8)) % q;
  for (let i = 0; i < w.length; i++) {
    const m = w[i] * R % q;
    bytes2.push(...utils$3.bigInt2BytesLE(m, n8f));
  }
  const ROOTs = module.alloc(bytes2);
  const i2 = new Array(maxBits + 1);
  i2[0] = 1n;
  for (let i = 1; i <= maxBits; i++) {
    i2[i] = i2[i - 1] * 2n;
  }
  const bytesi2 = [];
  for (let i = 0; i <= maxBits; i++) {
    const m = modInv$1(i2[i], q) * R % q;
    bytesi2.push(...utils$3.bigInt2BytesLE(m, n8f));
  }
  const INV2 = module.alloc(bytesi2);
  const shift = modPow(nr, 2n, q);
  const bytesShiftToSmallM = [];
  const bytesSConst = [];
  for (let i = 0; i <= maxBits; i++) {
    const shiftToSmallM = modPow(shift, 2n ** BigInt(i), q);
    const sConst = modInv$1(q + 1n - shiftToSmallM, q);
    bytesShiftToSmallM.push(...utils$3.bigInt2BytesLE(shiftToSmallM * R % q, n8f));
    bytesSConst.push(...utils$3.bigInt2BytesLE(sConst * R % q, n8f));
  }
  const SHIFT_TO_M = module.alloc(bytesShiftToSmallM);
  const SCONST = module.alloc(bytesSConst);
  function rev(x) {
    let r = 0;
    for (let i = 0; i < 8; i++) {
      if (x & 1 << i) {
        r = r | 128 >> i;
      }
    }
    return r;
  }
  const rtable = Array(256);
  for (let i = 0; i < 256; i++) {
    rtable[i] = rev(i);
  }
  const REVTABLE = module.alloc(rtable);
  function buildLog2() {
    const f = module.addFunction(prefix + "__log2");
    f.addParam("n", "i32");
    f.setReturnType("i32");
    f.addLocal("bits", "i32");
    f.addLocal("aux", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.setLocal(
        "aux",
        c.i32_shr_u(
          c.getLocal("n"),
          c.i32_const(1)
        )
      )
    );
    f.addCode(c.setLocal("bits", c.i32_const(0)));
    f.addCode(c.block(c.loop(
      c.br_if(
        1,
        c.i32_eqz(c.getLocal("aux"))
      ),
      c.setLocal(
        "aux",
        c.i32_shr_u(
          c.getLocal("aux"),
          c.i32_const(1)
        )
      ),
      c.setLocal(
        "bits",
        c.i32_add(
          c.getLocal("bits"),
          c.i32_const(1)
        )
      ),
      c.br(0)
    )));
    f.addCode(c.if(
      c.i32_ne(
        c.getLocal("n"),
        c.i32_shl(
          c.i32_const(1),
          c.getLocal("bits")
        )
      ),
      c.unreachable()
    ));
    f.addCode(c.if(
      c.i32_gt_u(
        c.getLocal("bits"),
        c.i32_const(maxBits)
      ),
      c.unreachable()
    ));
    f.addCode(c.getLocal("bits"));
  }
  function buildFFT3() {
    const f = module.addFunction(prefix + "_fft");
    f.addParam("px", "i32");
    f.addParam("n", "i32");
    f.addLocal("bits", "i32");
    const c = f.getCodeBuilder();
    const One = c.i32_const(module.alloc(n8f));
    f.addCode(
      c.setLocal(
        "bits",
        c.call(
          prefix + "__log2",
          c.getLocal("n")
        )
      ),
      c.call(fPrefix + "_one", One),
      c.call(
        prefix + "_rawfft",
        c.getLocal("px"),
        c.getLocal("bits"),
        c.i32_const(0),
        One
      )
    );
  }
  function buildIFFT() {
    const f = module.addFunction(prefix + "_ifft");
    f.addParam("px", "i32");
    f.addParam("n", "i32");
    f.addLocal("bits", "i32");
    f.addLocal("pInv2", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.setLocal(
        "bits",
        c.call(
          prefix + "__log2",
          c.getLocal("n")
        )
      ),
      c.setLocal(
        "pInv2",
        c.i32_add(
          c.i32_const(INV2),
          c.i32_mul(
            c.getLocal("bits"),
            c.i32_const(n8f)
          )
        )
      ),
      c.call(
        prefix + "_rawfft",
        c.getLocal("px"),
        c.getLocal("bits"),
        c.i32_const(1),
        c.getLocal("pInv2")
      )
    );
  }
  function buildRawFFT() {
    const f = module.addFunction(prefix + "_rawfft");
    f.addParam("px", "i32");
    f.addParam("bits", "i32");
    f.addParam("reverse", "i32");
    f.addParam("mulFactor", "i32");
    f.addLocal("s", "i32");
    f.addLocal("k", "i32");
    f.addLocal("j", "i32");
    f.addLocal("m", "i32");
    f.addLocal("mdiv2", "i32");
    f.addLocal("n", "i32");
    f.addLocal("pwm", "i32");
    f.addLocal("idx1", "i32");
    f.addLocal("idx2", "i32");
    const c = f.getCodeBuilder();
    const W = c.i32_const(module.alloc(n8f));
    const T = c.i32_const(module.alloc(n8g));
    const U = c.i32_const(module.alloc(n8g));
    f.addCode(
      c.call(prefix + "__reversePermutation", c.getLocal("px"), c.getLocal("bits")),
      c.setLocal("n", c.i32_shl(c.i32_const(1), c.getLocal("bits"))),
      c.setLocal("s", c.i32_const(1)),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_gt_u(
            c.getLocal("s"),
            c.getLocal("bits")
          )
        ),
        c.setLocal("m", c.i32_shl(c.i32_const(1), c.getLocal("s"))),
        c.setLocal(
          "pwm",
          c.i32_add(
            c.i32_const(ROOTs),
            c.i32_mul(
              c.getLocal("s"),
              c.i32_const(n8f)
            )
          )
        ),
        c.setLocal("k", c.i32_const(0)),
        c.block(c.loop(
          c.br_if(
            1,
            c.i32_ge_u(
              c.getLocal("k"),
              c.getLocal("n")
            )
          ),
          c.call(fPrefix + "_one", W),
          c.setLocal("mdiv2", c.i32_shr_u(c.getLocal("m"), c.i32_const(1))),
          c.setLocal("j", c.i32_const(0)),
          c.block(c.loop(
            c.br_if(
              1,
              c.i32_ge_u(
                c.getLocal("j"),
                c.getLocal("mdiv2")
              )
            ),
            c.setLocal(
              "idx1",
              c.i32_add(
                c.getLocal("px"),
                c.i32_mul(
                  c.i32_add(
                    c.getLocal("k"),
                    c.getLocal("j")
                  ),
                  c.i32_const(n8g)
                )
              )
            ),
            c.setLocal(
              "idx2",
              c.i32_add(
                c.getLocal("idx1"),
                c.i32_mul(
                  c.getLocal("mdiv2"),
                  c.i32_const(n8g)
                )
              )
            ),
            c.call(
              opGtimesF,
              c.getLocal("idx2"),
              W,
              T
            ),
            c.call(
              gPrefix + "_copy",
              c.getLocal("idx1"),
              U
            ),
            c.call(
              gPrefix + "_add",
              U,
              T,
              c.getLocal("idx1")
            ),
            c.call(
              gPrefix + "_sub",
              U,
              T,
              c.getLocal("idx2")
            ),
            c.call(
              fPrefix + "_mul",
              W,
              c.getLocal("pwm"),
              W
            ),
            c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
            c.br(0)
          )),
          c.setLocal("k", c.i32_add(c.getLocal("k"), c.getLocal("m"))),
          c.br(0)
        )),
        c.setLocal("s", c.i32_add(c.getLocal("s"), c.i32_const(1))),
        c.br(0)
      )),
      c.call(
        prefix + "__fftFinal",
        c.getLocal("px"),
        c.getLocal("bits"),
        c.getLocal("reverse"),
        c.getLocal("mulFactor")
      )
    );
  }
  function buildFinalInverse() {
    const f = module.addFunction(prefix + "__fftFinal");
    f.addParam("px", "i32");
    f.addParam("bits", "i32");
    f.addParam("reverse", "i32");
    f.addParam("mulFactor", "i32");
    f.addLocal("n", "i32");
    f.addLocal("ndiv2", "i32");
    f.addLocal("pInv2", "i32");
    f.addLocal("i", "i32");
    f.addLocal("mask", "i32");
    f.addLocal("idx1", "i32");
    f.addLocal("idx2", "i32");
    const c = f.getCodeBuilder();
    const T = c.i32_const(module.alloc(n8g));
    f.addCode(
      c.if(
        c.i32_and(
          c.i32_eqz(c.getLocal("reverse")),
          c.call(fPrefix + "_isOne", c.getLocal("mulFactor"))
        ),
        c.ret([])
      ),
      c.setLocal("n", c.i32_shl(c.i32_const(1), c.getLocal("bits"))),
      c.setLocal("mask", c.i32_sub(c.getLocal("n"), c.i32_const(1))),
      c.setLocal("i", c.i32_const(1)),
      c.setLocal(
        "ndiv2",
        c.i32_shr_u(
          c.getLocal("n"),
          c.i32_const(1)
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_ge_u(
            c.getLocal("i"),
            c.getLocal("ndiv2")
          )
        ),
        c.setLocal(
          "idx1",
          c.i32_add(
            c.getLocal("px"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.setLocal(
          "idx2",
          c.i32_add(
            c.getLocal("px"),
            c.i32_mul(
              c.i32_sub(
                c.getLocal("n"),
                c.getLocal("i")
              ),
              c.i32_const(n8g)
            )
          )
        ),
        c.if(
          c.getLocal("reverse"),
          c.if(
            c.call(fPrefix + "_isOne", c.getLocal("mulFactor")),
            [
              ...c.call(gPrefix + "_copy", c.getLocal("idx1"), T),
              ...c.call(gPrefix + "_copy", c.getLocal("idx2"), c.getLocal("idx1")),
              ...c.call(gPrefix + "_copy", T, c.getLocal("idx2"))
            ],
            [
              ...c.call(gPrefix + "_copy", c.getLocal("idx1"), T),
              ...c.call(opGtimesF, c.getLocal("idx2"), c.getLocal("mulFactor"), c.getLocal("idx1")),
              ...c.call(opGtimesF, T, c.getLocal("mulFactor"), c.getLocal("idx2"))
            ]
          ),
          c.if(
            c.call(fPrefix + "_isOne", c.getLocal("mulFactor")),
            [
              // Do nothing (It should not be here)
            ],
            [
              ...c.call(opGtimesF, c.getLocal("idx1"), c.getLocal("mulFactor"), c.getLocal("idx1")),
              ...c.call(opGtimesF, c.getLocal("idx2"), c.getLocal("mulFactor"), c.getLocal("idx2"))
            ]
          )
        ),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      )),
      c.if(
        c.call(fPrefix + "_isOne", c.getLocal("mulFactor")),
        [
          // Do nothing (It should not be here)
        ],
        [
          ...c.call(opGtimesF, c.getLocal("px"), c.getLocal("mulFactor"), c.getLocal("px")),
          ...c.setLocal(
            "idx2",
            c.i32_add(
              c.getLocal("px"),
              c.i32_mul(
                c.getLocal("ndiv2"),
                c.i32_const(n8g)
              )
            )
          ),
          ...c.call(opGtimesF, c.getLocal("idx2"), c.getLocal("mulFactor"), c.getLocal("idx2"))
        ]
      )
    );
  }
  function buildReversePermutation() {
    const f = module.addFunction(prefix + "__reversePermutation");
    f.addParam("px", "i32");
    f.addParam("bits", "i32");
    f.addLocal("n", "i32");
    f.addLocal("i", "i32");
    f.addLocal("ri", "i32");
    f.addLocal("idx1", "i32");
    f.addLocal("idx2", "i32");
    const c = f.getCodeBuilder();
    const T = c.i32_const(module.alloc(n8g));
    f.addCode(
      c.setLocal("n", c.i32_shl(c.i32_const(1), c.getLocal("bits"))),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("i"),
            c.getLocal("n")
          )
        ),
        c.setLocal(
          "idx1",
          c.i32_add(
            c.getLocal("px"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.setLocal("ri", c.call(prefix + "__rev", c.getLocal("i"), c.getLocal("bits"))),
        c.setLocal(
          "idx2",
          c.i32_add(
            c.getLocal("px"),
            c.i32_mul(
              c.getLocal("ri"),
              c.i32_const(n8g)
            )
          )
        ),
        c.if(
          c.i32_lt_u(
            c.getLocal("i"),
            c.getLocal("ri")
          ),
          [
            ...c.call(gPrefix + "_copy", c.getLocal("idx1"), T),
            ...c.call(gPrefix + "_copy", c.getLocal("idx2"), c.getLocal("idx1")),
            ...c.call(gPrefix + "_copy", T, c.getLocal("idx2"))
          ]
        ),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  function buildRev() {
    const f = module.addFunction(prefix + "__rev");
    f.addParam("x", "i32");
    f.addParam("bits", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.i32_rotl(
        c.i32_add(
          c.i32_add(
            c.i32_shl(
              c.i32_load8_u(
                c.i32_and(
                  c.getLocal("x"),
                  c.i32_const(255)
                ),
                REVTABLE,
                0
              ),
              c.i32_const(24)
            ),
            c.i32_shl(
              c.i32_load8_u(
                c.i32_and(
                  c.i32_shr_u(
                    c.getLocal("x"),
                    c.i32_const(8)
                  ),
                  c.i32_const(255)
                ),
                REVTABLE,
                0
              ),
              c.i32_const(16)
            )
          ),
          c.i32_add(
            c.i32_shl(
              c.i32_load8_u(
                c.i32_and(
                  c.i32_shr_u(
                    c.getLocal("x"),
                    c.i32_const(16)
                  ),
                  c.i32_const(255)
                ),
                REVTABLE,
                0
              ),
              c.i32_const(8)
            ),
            c.i32_load8_u(
              c.i32_and(
                c.i32_shr_u(
                  c.getLocal("x"),
                  c.i32_const(24)
                ),
                c.i32_const(255)
              ),
              REVTABLE,
              0
            )
          )
        ),
        c.getLocal("bits")
      )
    );
  }
  function buildFFTJoin() {
    const f = module.addFunction(prefix + "_fftJoin");
    f.addParam("pBuff1", "i32");
    f.addParam("pBuff2", "i32");
    f.addParam("n", "i32");
    f.addParam("first", "i32");
    f.addParam("inc", "i32");
    f.addLocal("idx1", "i32");
    f.addLocal("idx2", "i32");
    f.addLocal("i", "i32");
    const c = f.getCodeBuilder();
    const W = c.i32_const(module.alloc(n8f));
    const T = c.i32_const(module.alloc(n8g));
    const U = c.i32_const(module.alloc(n8g));
    f.addCode(
      c.call(fPrefix + "_copy", c.getLocal("first"), W),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("i"),
            c.getLocal("n")
          )
        ),
        c.setLocal(
          "idx1",
          c.i32_add(
            c.getLocal("pBuff1"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.setLocal(
          "idx2",
          c.i32_add(
            c.getLocal("pBuff2"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx2"),
          W,
          T
        ),
        c.call(
          gPrefix + "_copy",
          c.getLocal("idx1"),
          U
        ),
        c.call(
          gPrefix + "_add",
          U,
          T,
          c.getLocal("idx1")
        ),
        c.call(
          gPrefix + "_sub",
          U,
          T,
          c.getLocal("idx2")
        ),
        c.call(
          fPrefix + "_mul",
          W,
          c.getLocal("inc"),
          W
        ),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  function buildFFTJoinExt() {
    const f = module.addFunction(prefix + "_fftJoinExt");
    f.addParam("pBuff1", "i32");
    f.addParam("pBuff2", "i32");
    f.addParam("n", "i32");
    f.addParam("first", "i32");
    f.addParam("inc", "i32");
    f.addParam("totalBits", "i32");
    f.addLocal("idx1", "i32");
    f.addLocal("idx2", "i32");
    f.addLocal("i", "i32");
    f.addLocal("pShiftToM", "i32");
    const c = f.getCodeBuilder();
    const W = c.i32_const(module.alloc(n8f));
    const U = c.i32_const(module.alloc(n8g));
    f.addCode(
      c.setLocal(
        "pShiftToM",
        c.i32_add(
          c.i32_const(SHIFT_TO_M),
          c.i32_mul(
            c.getLocal("totalBits"),
            c.i32_const(n8f)
          )
        )
      ),
      c.call(fPrefix + "_copy", c.getLocal("first"), W),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("i"),
            c.getLocal("n")
          )
        ),
        c.setLocal(
          "idx1",
          c.i32_add(
            c.getLocal("pBuff1"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.setLocal(
          "idx2",
          c.i32_add(
            c.getLocal("pBuff2"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.call(
          gPrefix + "_add",
          c.getLocal("idx1"),
          c.getLocal("idx2"),
          U
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx2"),
          c.getLocal("pShiftToM"),
          c.getLocal("idx2")
        ),
        c.call(
          gPrefix + "_add",
          c.getLocal("idx1"),
          c.getLocal("idx2"),
          c.getLocal("idx2")
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx2"),
          W,
          c.getLocal("idx2")
        ),
        c.call(
          gPrefix + "_copy",
          U,
          c.getLocal("idx1")
        ),
        c.call(
          fPrefix + "_mul",
          W,
          c.getLocal("inc"),
          W
        ),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  function buildFFTJoinExtInv() {
    const f = module.addFunction(prefix + "_fftJoinExtInv");
    f.addParam("pBuff1", "i32");
    f.addParam("pBuff2", "i32");
    f.addParam("n", "i32");
    f.addParam("first", "i32");
    f.addParam("inc", "i32");
    f.addParam("totalBits", "i32");
    f.addLocal("idx1", "i32");
    f.addLocal("idx2", "i32");
    f.addLocal("i", "i32");
    f.addLocal("pShiftToM", "i32");
    f.addLocal("pSConst", "i32");
    const c = f.getCodeBuilder();
    const W = c.i32_const(module.alloc(n8f));
    const U = c.i32_const(module.alloc(n8g));
    f.addCode(
      c.setLocal(
        "pShiftToM",
        c.i32_add(
          c.i32_const(SHIFT_TO_M),
          c.i32_mul(
            c.getLocal("totalBits"),
            c.i32_const(n8f)
          )
        )
      ),
      c.setLocal(
        "pSConst",
        c.i32_add(
          c.i32_const(SCONST),
          c.i32_mul(
            c.getLocal("totalBits"),
            c.i32_const(n8f)
          )
        )
      ),
      c.call(fPrefix + "_copy", c.getLocal("first"), W),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("i"),
            c.getLocal("n")
          )
        ),
        c.setLocal(
          "idx1",
          c.i32_add(
            c.getLocal("pBuff1"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.setLocal(
          "idx2",
          c.i32_add(
            c.getLocal("pBuff2"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx2"),
          W,
          U
        ),
        c.call(
          gPrefix + "_sub",
          c.getLocal("idx1"),
          U,
          c.getLocal("idx2")
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx2"),
          c.getLocal("pSConst"),
          c.getLocal("idx2")
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx1"),
          c.getLocal("pShiftToM"),
          c.getLocal("idx1")
        ),
        c.call(
          gPrefix + "_sub",
          U,
          c.getLocal("idx1"),
          c.getLocal("idx1")
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx1"),
          c.getLocal("pSConst"),
          c.getLocal("idx1")
        ),
        c.call(
          fPrefix + "_mul",
          W,
          c.getLocal("inc"),
          W
        ),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  function buildPrepareLagrangeEvaluation() {
    const f = module.addFunction(prefix + "_prepareLagrangeEvaluation");
    f.addParam("pBuff1", "i32");
    f.addParam("pBuff2", "i32");
    f.addParam("n", "i32");
    f.addParam("first", "i32");
    f.addParam("inc", "i32");
    f.addParam("totalBits", "i32");
    f.addLocal("idx1", "i32");
    f.addLocal("idx2", "i32");
    f.addLocal("i", "i32");
    f.addLocal("pShiftToM", "i32");
    f.addLocal("pSConst", "i32");
    const c = f.getCodeBuilder();
    const W = c.i32_const(module.alloc(n8f));
    const U = c.i32_const(module.alloc(n8g));
    f.addCode(
      c.setLocal(
        "pShiftToM",
        c.i32_add(
          c.i32_const(SHIFT_TO_M),
          c.i32_mul(
            c.getLocal("totalBits"),
            c.i32_const(n8f)
          )
        )
      ),
      c.setLocal(
        "pSConst",
        c.i32_add(
          c.i32_const(SCONST),
          c.i32_mul(
            c.getLocal("totalBits"),
            c.i32_const(n8f)
          )
        )
      ),
      c.call(fPrefix + "_copy", c.getLocal("first"), W),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("i"),
            c.getLocal("n")
          )
        ),
        c.setLocal(
          "idx1",
          c.i32_add(
            c.getLocal("pBuff1"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.setLocal(
          "idx2",
          c.i32_add(
            c.getLocal("pBuff2"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx1"),
          c.getLocal("pShiftToM"),
          U
        ),
        c.call(
          gPrefix + "_sub",
          c.getLocal("idx2"),
          U,
          U
        ),
        c.call(
          gPrefix + "_sub",
          c.getLocal("idx1"),
          c.getLocal("idx2"),
          c.getLocal("idx2")
        ),
        c.call(
          opGtimesF,
          U,
          c.getLocal("pSConst"),
          c.getLocal("idx1")
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx2"),
          W,
          c.getLocal("idx2")
        ),
        c.call(
          fPrefix + "_mul",
          W,
          c.getLocal("inc"),
          W
        ),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  function buildFFTMix() {
    const f = module.addFunction(prefix + "_fftMix");
    f.addParam("pBuff", "i32");
    f.addParam("n", "i32");
    f.addParam("exp", "i32");
    f.addLocal("nGroups", "i32");
    f.addLocal("nPerGroup", "i32");
    f.addLocal("nPerGroupDiv2", "i32");
    f.addLocal("pairOffset", "i32");
    f.addLocal("idx1", "i32");
    f.addLocal("idx2", "i32");
    f.addLocal("i", "i32");
    f.addLocal("j", "i32");
    f.addLocal("pwm", "i32");
    const c = f.getCodeBuilder();
    const W = c.i32_const(module.alloc(n8f));
    const T = c.i32_const(module.alloc(n8g));
    const U = c.i32_const(module.alloc(n8g));
    f.addCode(
      c.setLocal("nPerGroup", c.i32_shl(c.i32_const(1), c.getLocal("exp"))),
      c.setLocal("nPerGroupDiv2", c.i32_shr_u(c.getLocal("nPerGroup"), c.i32_const(1))),
      c.setLocal("nGroups", c.i32_shr_u(c.getLocal("n"), c.getLocal("exp"))),
      c.setLocal("pairOffset", c.i32_mul(c.getLocal("nPerGroupDiv2"), c.i32_const(n8g))),
      c.setLocal(
        "pwm",
        c.i32_add(
          c.i32_const(ROOTs),
          c.i32_mul(
            c.getLocal("exp"),
            c.i32_const(n8f)
          )
        )
      ),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("i"),
            c.getLocal("nGroups")
          )
        ),
        c.call(fPrefix + "_one", W),
        c.setLocal("j", c.i32_const(0)),
        c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("j"),
              c.getLocal("nPerGroupDiv2")
            )
          ),
          c.setLocal(
            "idx1",
            c.i32_add(
              c.getLocal("pBuff"),
              c.i32_mul(
                c.i32_add(
                  c.i32_mul(
                    c.getLocal("i"),
                    c.getLocal("nPerGroup")
                  ),
                  c.getLocal("j")
                ),
                c.i32_const(n8g)
              )
            )
          ),
          c.setLocal(
            "idx2",
            c.i32_add(
              c.getLocal("idx1"),
              c.getLocal("pairOffset")
            )
          ),
          c.call(
            opGtimesF,
            c.getLocal("idx2"),
            W,
            T
          ),
          c.call(
            gPrefix + "_copy",
            c.getLocal("idx1"),
            U
          ),
          c.call(
            gPrefix + "_add",
            U,
            T,
            c.getLocal("idx1")
          ),
          c.call(
            gPrefix + "_sub",
            U,
            T,
            c.getLocal("idx2")
          ),
          c.call(
            fPrefix + "_mul",
            W,
            c.getLocal("pwm"),
            W
          ),
          c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
          c.br(0)
        )),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  function buildFFTFinal() {
    const f = module.addFunction(prefix + "_fftFinal");
    f.addParam("pBuff", "i32");
    f.addParam("n", "i32");
    f.addParam("factor", "i32");
    f.addLocal("idx1", "i32");
    f.addLocal("idx2", "i32");
    f.addLocal("i", "i32");
    f.addLocal("ndiv2", "i32");
    const c = f.getCodeBuilder();
    const T = c.i32_const(module.alloc(n8g));
    f.addCode(
      c.setLocal("ndiv2", c.i32_shr_u(c.getLocal("n"), c.i32_const(1))),
      c.if(
        c.i32_and(
          c.getLocal("n"),
          c.i32_const(1)
        ),
        c.call(
          opGtimesF,
          c.i32_add(
            c.getLocal("pBuff"),
            c.i32_mul(
              c.getLocal("ndiv2"),
              c.i32_const(n8g)
            )
          ),
          c.getLocal("factor"),
          c.i32_add(
            c.getLocal("pBuff"),
            c.i32_mul(
              c.getLocal("ndiv2"),
              c.i32_const(n8g)
            )
          )
        )
      ),
      c.setLocal("i", c.i32_const(0)),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_ge_u(
            c.getLocal("i"),
            c.getLocal("ndiv2")
          )
        ),
        c.setLocal(
          "idx1",
          c.i32_add(
            c.getLocal("pBuff"),
            c.i32_mul(
              c.getLocal("i"),
              c.i32_const(n8g)
            )
          )
        ),
        c.setLocal(
          "idx2",
          c.i32_add(
            c.getLocal("pBuff"),
            c.i32_mul(
              c.i32_sub(
                c.i32_sub(
                  c.getLocal("n"),
                  c.i32_const(1)
                ),
                c.getLocal("i")
              ),
              c.i32_const(n8g)
            )
          )
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx2"),
          c.getLocal("factor"),
          T
        ),
        c.call(
          opGtimesF,
          c.getLocal("idx1"),
          c.getLocal("factor"),
          c.getLocal("idx2")
        ),
        c.call(
          gPrefix + "_copy",
          T,
          c.getLocal("idx1")
        ),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  buildRev();
  buildReversePermutation();
  buildFinalInverse();
  buildRawFFT();
  buildLog2();
  buildFFT3();
  buildIFFT();
  buildFFTJoin();
  buildFFTJoinExt();
  buildFFTJoinExtInv();
  buildFFTMix();
  buildFFTFinal();
  buildPrepareLagrangeEvaluation();
  module.exportFunction(prefix + "_fft");
  module.exportFunction(prefix + "_ifft");
  module.exportFunction(prefix + "_rawfft");
  module.exportFunction(prefix + "_fftJoin");
  module.exportFunction(prefix + "_fftJoinExt");
  module.exportFunction(prefix + "_fftJoinExtInv");
  module.exportFunction(prefix + "_fftMix");
  module.exportFunction(prefix + "_fftFinal");
  module.exportFunction(prefix + "_prepareLagrangeEvaluation");
};
var build_pol = function buildPol(module, prefix, prefixField) {
  const n64 = module.modules[prefixField].n64;
  const n8 = n64 * 8;
  function buildZero() {
    const f = module.addFunction(prefix + "_zero");
    f.addParam("px", "i32");
    f.addParam("n", "i32");
    f.addLocal("lastp", "i32");
    f.addLocal("p", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.setLocal("p", c.getLocal("px")),
      c.setLocal(
        "lastp",
        c.i32_add(
          c.getLocal("px"),
          c.i32_mul(
            c.getLocal("n"),
            c.i32_const(n8)
          )
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("p"),
            c.getLocal("lastp")
          )
        ),
        c.call(prefixField + "_zero", c.getLocal("p")),
        c.setLocal("p", c.i32_add(c.getLocal("p"), c.i32_const(n8))),
        c.br(0)
      ))
    );
  }
  function buildConstructLC() {
    const f = module.addFunction(prefix + "_constructLC");
    f.addParam("ppolynomials", "i32");
    f.addParam("psignals", "i32");
    f.addParam("nSignals", "i32");
    f.addParam("pres", "i32");
    f.addLocal("i", "i32");
    f.addLocal("j", "i32");
    f.addLocal("pp", "i32");
    f.addLocal("ps", "i32");
    f.addLocal("pd", "i32");
    f.addLocal("ncoefs", "i32");
    const c = f.getCodeBuilder();
    const aux = c.i32_const(module.alloc(n8));
    f.addCode(
      c.setLocal("i", c.i32_const(0)),
      c.setLocal("pp", c.getLocal("ppolynomials")),
      c.setLocal("ps", c.getLocal("psignals")),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("i"),
            c.getLocal("nSignals")
          )
        ),
        c.setLocal("ncoefs", c.i32_load(c.getLocal("pp"))),
        c.setLocal("pp", c.i32_add(c.getLocal("pp"), c.i32_const(4))),
        c.setLocal("j", c.i32_const(0)),
        c.block(c.loop(
          c.br_if(
            1,
            c.i32_eq(
              c.getLocal("j"),
              c.getLocal("ncoefs")
            )
          ),
          c.setLocal(
            "pd",
            c.i32_add(
              c.getLocal("pres"),
              c.i32_mul(
                c.i32_load(c.getLocal("pp")),
                c.i32_const(n8)
              )
            )
          ),
          c.setLocal("pp", c.i32_add(c.getLocal("pp"), c.i32_const(4))),
          c.call(
            prefixField + "_mul",
            c.getLocal("ps"),
            c.getLocal("pp"),
            aux
          ),
          c.call(
            prefixField + "_add",
            aux,
            c.getLocal("pd"),
            c.getLocal("pd")
          ),
          c.setLocal("pp", c.i32_add(c.getLocal("pp"), c.i32_const(n8))),
          c.setLocal("j", c.i32_add(c.getLocal("j"), c.i32_const(1))),
          c.br(0)
        )),
        c.setLocal("ps", c.i32_add(c.getLocal("ps"), c.i32_const(n8))),
        c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  buildZero();
  buildConstructLC();
  module.exportFunction(prefix + "_zero");
  module.exportFunction(prefix + "_constructLC");
  return prefix;
};
var build_qap = function buildQAP(module, prefix, prefixField) {
  const n64 = module.modules[prefixField].n64;
  const n8 = n64 * 8;
  function buildBuildABC() {
    const f = module.addFunction(prefix + "_buildABC");
    f.addParam("pCoefs", "i32");
    f.addParam("nCoefs", "i32");
    f.addParam("pWitness", "i32");
    f.addParam("pA", "i32");
    f.addParam("pB", "i32");
    f.addParam("pC", "i32");
    f.addParam("offsetOut", "i32");
    f.addParam("nOut", "i32");
    f.addParam("offsetWitness", "i32");
    f.addParam("nWitness", "i32");
    f.addLocal("it", "i32");
    f.addLocal("ita", "i32");
    f.addLocal("itb", "i32");
    f.addLocal("last", "i32");
    f.addLocal("m", "i32");
    f.addLocal("c", "i32");
    f.addLocal("s", "i32");
    f.addLocal("pOut", "i32");
    const c = f.getCodeBuilder();
    const aux = c.i32_const(module.alloc(n8));
    f.addCode(
      // Set output a and b to 0
      c.setLocal("ita", c.getLocal("pA")),
      c.setLocal("itb", c.getLocal("pB")),
      c.setLocal(
        "last",
        c.i32_add(
          c.getLocal("pA"),
          c.i32_mul(
            c.getLocal("nOut"),
            c.i32_const(n8)
          )
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("ita"),
            c.getLocal("last")
          )
        ),
        c.call(prefixField + "_zero", c.getLocal("ita")),
        c.call(prefixField + "_zero", c.getLocal("itb")),
        c.setLocal("ita", c.i32_add(c.getLocal("ita"), c.i32_const(n8))),
        c.setLocal("itb", c.i32_add(c.getLocal("itb"), c.i32_const(n8))),
        c.br(0)
      )),
      c.setLocal("it", c.getLocal("pCoefs")),
      c.setLocal(
        "last",
        c.i32_add(
          c.getLocal("pCoefs"),
          c.i32_mul(
            c.getLocal("nCoefs"),
            c.i32_const(n8 + 12)
          )
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("it"),
            c.getLocal("last")
          )
        ),
        c.setLocal(
          "s",
          c.i32_load(c.getLocal("it"), 8)
        ),
        c.if(
          c.i32_or(
            c.i32_lt_u(
              c.getLocal("s"),
              c.getLocal("offsetWitness")
            ),
            c.i32_ge_u(
              c.getLocal("s"),
              c.i32_add(
                c.getLocal("offsetWitness"),
                c.getLocal("nWitness")
              )
            )
          ),
          [
            ...c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8 + 12))),
            ...c.br(1)
          ]
        ),
        c.setLocal(
          "m",
          c.i32_load(c.getLocal("it"))
        ),
        c.if(
          c.i32_eq(c.getLocal("m"), c.i32_const(0)),
          c.setLocal("pOut", c.getLocal("pA")),
          c.if(
            c.i32_eq(c.getLocal("m"), c.i32_const(1)),
            c.setLocal("pOut", c.getLocal("pB")),
            [
              ...c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8 + 12))),
              ...c.br(1)
            ]
          )
        ),
        c.setLocal(
          "c",
          c.i32_load(c.getLocal("it"), 4)
        ),
        c.if(
          c.i32_or(
            c.i32_lt_u(
              c.getLocal("c"),
              c.getLocal("offsetOut")
            ),
            c.i32_ge_u(
              c.getLocal("c"),
              c.i32_add(
                c.getLocal("offsetOut"),
                c.getLocal("nOut")
              )
            )
          ),
          [
            ...c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8 + 12))),
            ...c.br(1)
          ]
        ),
        c.setLocal(
          "pOut",
          c.i32_add(
            c.getLocal("pOut"),
            c.i32_mul(
              c.i32_sub(
                c.getLocal("c"),
                c.getLocal("offsetOut")
              ),
              c.i32_const(n8)
            )
          )
        ),
        c.call(
          prefixField + "_mul",
          c.i32_add(
            c.getLocal("pWitness"),
            c.i32_mul(
              c.i32_sub(c.getLocal("s"), c.getLocal("offsetWitness")),
              c.i32_const(n8)
            )
          ),
          c.i32_add(c.getLocal("it"), c.i32_const(12)),
          aux
        ),
        c.call(
          prefixField + "_add",
          c.getLocal("pOut"),
          aux,
          c.getLocal("pOut")
        ),
        c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8 + 12))),
        c.br(0)
      )),
      c.setLocal("ita", c.getLocal("pA")),
      c.setLocal("itb", c.getLocal("pB")),
      c.setLocal("it", c.getLocal("pC")),
      c.setLocal(
        "last",
        c.i32_add(
          c.getLocal("pA"),
          c.i32_mul(
            c.getLocal("nOut"),
            c.i32_const(n8)
          )
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("ita"),
            c.getLocal("last")
          )
        ),
        c.call(
          prefixField + "_mul",
          c.getLocal("ita"),
          c.getLocal("itb"),
          c.getLocal("it")
        ),
        c.setLocal("ita", c.i32_add(c.getLocal("ita"), c.i32_const(n8))),
        c.setLocal("itb", c.i32_add(c.getLocal("itb"), c.i32_const(n8))),
        c.setLocal("it", c.i32_add(c.getLocal("it"), c.i32_const(n8))),
        c.br(0)
      ))
    );
  }
  function buildJoinABC() {
    const f = module.addFunction(prefix + "_joinABC");
    f.addParam("pA", "i32");
    f.addParam("pB", "i32");
    f.addParam("pC", "i32");
    f.addParam("n", "i32");
    f.addParam("pP", "i32");
    f.addLocal("ita", "i32");
    f.addLocal("itb", "i32");
    f.addLocal("itc", "i32");
    f.addLocal("itp", "i32");
    f.addLocal("last", "i32");
    const c = f.getCodeBuilder();
    const aux = c.i32_const(module.alloc(n8));
    f.addCode(
      c.setLocal("ita", c.getLocal("pA")),
      c.setLocal("itb", c.getLocal("pB")),
      c.setLocal("itc", c.getLocal("pC")),
      c.setLocal("itp", c.getLocal("pP")),
      c.setLocal(
        "last",
        c.i32_add(
          c.getLocal("pA"),
          c.i32_mul(
            c.getLocal("n"),
            c.i32_const(n8)
          )
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("ita"),
            c.getLocal("last")
          )
        ),
        c.call(
          prefixField + "_mul",
          c.getLocal("ita"),
          c.getLocal("itb"),
          aux
        ),
        c.call(
          prefixField + "_sub",
          aux,
          c.getLocal("itc"),
          c.getLocal("itp")
        ),
        c.setLocal("ita", c.i32_add(c.getLocal("ita"), c.i32_const(n8))),
        c.setLocal("itb", c.i32_add(c.getLocal("itb"), c.i32_const(n8))),
        c.setLocal("itc", c.i32_add(c.getLocal("itc"), c.i32_const(n8))),
        c.setLocal("itp", c.i32_add(c.getLocal("itp"), c.i32_const(n8))),
        c.br(0)
      ))
    );
  }
  function buildBatchAdd() {
    const f = module.addFunction(prefix + "_batchAdd");
    f.addParam("pa", "i32");
    f.addParam("pb", "i32");
    f.addParam("n", "i32");
    f.addParam("pr", "i32");
    f.addLocal("ita", "i32");
    f.addLocal("itb", "i32");
    f.addLocal("itr", "i32");
    f.addLocal("last", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.setLocal("ita", c.getLocal("pa")),
      c.setLocal("itb", c.getLocal("pb")),
      c.setLocal("itr", c.getLocal("pr")),
      c.setLocal(
        "last",
        c.i32_add(
          c.getLocal("pa"),
          c.i32_mul(
            c.getLocal("n"),
            c.i32_const(n8)
          )
        )
      ),
      c.block(c.loop(
        c.br_if(
          1,
          c.i32_eq(
            c.getLocal("ita"),
            c.getLocal("last")
          )
        ),
        c.call(
          prefixField + "_add",
          c.getLocal("ita"),
          c.getLocal("itb"),
          c.getLocal("itr")
        ),
        c.setLocal("ita", c.i32_add(c.getLocal("ita"), c.i32_const(n8))),
        c.setLocal("itb", c.i32_add(c.getLocal("itb"), c.i32_const(n8))),
        c.setLocal("itr", c.i32_add(c.getLocal("itr"), c.i32_const(n8))),
        c.br(0)
      ))
    );
  }
  buildBuildABC();
  buildJoinABC();
  buildBatchAdd();
  module.exportFunction(prefix + "_buildABC");
  module.exportFunction(prefix + "_joinABC");
  module.exportFunction(prefix + "_batchAdd");
  return prefix;
};
var build_applykey = function buildApplyKey(module, fnName, gPrefix, frPrefix, sizeGIn, sizeGOut, sizeF, opGtimesF) {
  const f = module.addFunction(fnName);
  f.addParam("pIn", "i32");
  f.addParam("n", "i32");
  f.addParam("pFirst", "i32");
  f.addParam("pInc", "i32");
  f.addParam("pOut", "i32");
  f.addLocal("pOldFree", "i32");
  f.addLocal("i", "i32");
  f.addLocal("pFrom", "i32");
  f.addLocal("pTo", "i32");
  const c = f.getCodeBuilder();
  const t = c.i32_const(module.alloc(sizeF));
  f.addCode(
    c.setLocal("pFrom", c.getLocal("pIn")),
    c.setLocal("pTo", c.getLocal("pOut"))
  );
  f.addCode(
    c.call(
      frPrefix + "_copy",
      c.getLocal("pFirst"),
      t
    )
  );
  f.addCode(
    c.setLocal("i", c.i32_const(0)),
    c.block(c.loop(
      c.br_if(1, c.i32_eq(c.getLocal("i"), c.getLocal("n"))),
      c.call(
        opGtimesF,
        c.getLocal("pFrom"),
        t,
        c.getLocal("pTo")
      ),
      c.setLocal("pFrom", c.i32_add(c.getLocal("pFrom"), c.i32_const(sizeGIn))),
      c.setLocal("pTo", c.i32_add(c.getLocal("pTo"), c.i32_const(sizeGOut))),
      // t = t* inc
      c.call(
        frPrefix + "_mul",
        t,
        c.getLocal("pInc"),
        t
      ),
      c.setLocal("i", c.i32_add(c.getLocal("i"), c.i32_const(1))),
      c.br(0)
    ))
  );
  module.exportFunction(fnName);
};
var utils$2 = utils$6;
var buildF1m$1 = build_f1m;
var buildF1$1 = build_f1;
var buildF2m$1 = build_f2m;
var buildF3m$1 = build_f3m;
var buildCurve$1 = build_curve_jacobian_a0;
var buildFFT$2 = build_fft;
var buildPol$1 = build_pol;
var buildQAP$1 = build_qap;
var buildApplyKey$1 = build_applykey;
var { bitLength: bitLength$2, modInv, isOdd: isOdd$1, isNegative: isNegative$2 } = bigint;
var build_bn128 = function buildBN128(module, _prefix) {
  const prefix = _prefix || "bn128";
  if (module.modules[prefix]) return prefix;
  const q = 21888242871839275222246405745257275088696311157297823662689037894645226208583n;
  const r = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
  const n64 = Math.floor((bitLength$2(q - 1n) - 1) / 64) + 1;
  const n8 = n64 * 8;
  const frsize = n8;
  const f1size = n8;
  const f2size = f1size * 2;
  const ftsize = f1size * 12;
  const pr = module.alloc(utils$2.bigInt2BytesLE(r, frsize));
  const f1mPrefix = buildF1m$1(module, q, "f1m");
  buildF1$1(module, r, "fr", "frm");
  const pG1b = module.alloc(utils$2.bigInt2BytesLE(toMontgomery(3n), f1size));
  const g1mPrefix = buildCurve$1(module, "g1m", "f1m", pG1b);
  buildFFT$2(module, "frm", "frm", "frm", "frm_mul");
  buildPol$1(module, "pol", "frm");
  buildQAP$1(module, "qap", "frm");
  const f2mPrefix = buildF2m$1(module, "f1m_neg", "f2m", "f1m");
  const pG2b = module.alloc([
    ...utils$2.bigInt2BytesLE(toMontgomery(19485874751759354771024239261021720505790618469301721065564631296452457478373n), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(266929791119991161246907387137283842545076965332900288569378510910307636690n), f1size)
  ]);
  const g2mPrefix = buildCurve$1(module, "g2m", "f2m", pG2b);
  function buildGTimesFr(fnName, opMul) {
    const f = module.addFunction(fnName);
    f.addParam("pG", "i32");
    f.addParam("pFr", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const AUX = c.i32_const(module.alloc(n8));
    f.addCode(
      c.call("frm_fromMontgomery", c.getLocal("pFr"), AUX),
      c.call(
        opMul,
        c.getLocal("pG"),
        AUX,
        c.i32_const(n8),
        c.getLocal("pr")
      )
    );
    module.exportFunction(fnName);
  }
  buildGTimesFr("g1m_timesFr", "g1m_timesScalar");
  buildFFT$2(module, "g1m", "g1m", "frm", "g1m_timesFr");
  buildGTimesFr("g2m_timesFr", "g2m_timesScalar");
  buildFFT$2(module, "g2m", "g2m", "frm", "g2m_timesFr");
  buildGTimesFr("g1m_timesFrAffine", "g1m_timesScalarAffine");
  buildGTimesFr("g2m_timesFrAffine", "g2m_timesScalarAffine");
  buildApplyKey$1(module, "frm_batchApplyKey", "fmr", "frm", n8, n8, n8, "frm_mul");
  buildApplyKey$1(module, "g1m_batchApplyKey", "g1m", "frm", n8 * 3, n8 * 3, n8, "g1m_timesFr");
  buildApplyKey$1(module, "g1m_batchApplyKeyMixed", "g1m", "frm", n8 * 2, n8 * 3, n8, "g1m_timesFrAffine");
  buildApplyKey$1(module, "g2m_batchApplyKey", "g2m", "frm", n8 * 2 * 3, n8 * 3 * 2, n8, "g2m_timesFr");
  buildApplyKey$1(module, "g2m_batchApplyKeyMixed", "g2m", "frm", n8 * 2 * 2, n8 * 3 * 2, n8, "g2m_timesFrAffine");
  function toMontgomery(a) {
    return BigInt(a) * (1n << BigInt(f1size * 8)) % q;
  }
  const G1gen = [
    1n,
    2n,
    1n
  ];
  const pG1gen = module.alloc(
    [
      ...utils$2.bigInt2BytesLE(toMontgomery(G1gen[0]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G1gen[1]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G1gen[2]), f1size)
    ]
  );
  const G1zero = [
    0n,
    1n,
    0n
  ];
  const pG1zero = module.alloc(
    [
      ...utils$2.bigInt2BytesLE(toMontgomery(G1zero[0]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G1zero[1]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G1zero[2]), f1size)
    ]
  );
  const G2gen = [
    [
      10857046999023057135944570762232829481370756359578518086990519993285655852781n,
      11559732032986387107991004021392285783925812861821192530917403151452391805634n
    ],
    [
      8495653923123431417604973247489272438418190587263600148770280649306958101930n,
      4082367875863433681332203403145435568316851327593401208105741076214120093531n
    ],
    [
      1n,
      0n
    ]
  ];
  const pG2gen = module.alloc(
    [
      ...utils$2.bigInt2BytesLE(toMontgomery(G2gen[0][0]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2gen[0][1]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2gen[1][0]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2gen[1][1]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2gen[2][0]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2gen[2][1]), f1size)
    ]
  );
  const G2zero = [
    [
      0n,
      0n
    ],
    [
      1n,
      0n
    ],
    [
      0n,
      0n
    ]
  ];
  const pG2zero = module.alloc(
    [
      ...utils$2.bigInt2BytesLE(toMontgomery(G2zero[0][0]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2zero[0][1]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2zero[1][0]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2zero[1][1]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2zero[2][0]), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery(G2zero[2][1]), f1size)
    ]
  );
  const pOneT = module.alloc([
    ...utils$2.bigInt2BytesLE(toMontgomery(1), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(0), f1size)
  ]);
  const pNonResidueF6 = module.alloc([
    ...utils$2.bigInt2BytesLE(toMontgomery(9), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(1), f1size)
  ]);
  const pTwoInv = module.alloc([
    ...utils$2.bigInt2BytesLE(toMontgomery(modInv(2n, q)), f1size),
    ...utils$2.bigInt2BytesLE(0n, f1size)
  ]);
  const pAltBn128Twist = pNonResidueF6;
  const pTwistCoefB = module.alloc([
    ...utils$2.bigInt2BytesLE(toMontgomery(19485874751759354771024239261021720505790618469301721065564631296452457478373n), f1size),
    ...utils$2.bigInt2BytesLE(toMontgomery(266929791119991161246907387137283842545076965332900288569378510910307636690n), f1size)
  ]);
  function build_mulNR6() {
    const f = module.addFunction(prefix + "_mulNR6");
    f.addParam("x", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.call(
        f2mPrefix + "_mul",
        c.i32_const(pNonResidueF6),
        c.getLocal("x"),
        c.getLocal("pr")
      )
    );
  }
  build_mulNR6();
  const f6mPrefix = buildF3m$1(module, prefix + "_mulNR6", "f6m", "f2m");
  function build_mulNR12() {
    const f = module.addFunction(prefix + "_mulNR12");
    f.addParam("x", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.call(
        f2mPrefix + "_mul",
        c.i32_const(pNonResidueF6),
        c.i32_add(c.getLocal("x"), c.i32_const(n8 * 4)),
        c.getLocal("pr")
      ),
      c.call(
        f2mPrefix + "_copy",
        c.getLocal("x"),
        c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 2))
      ),
      c.call(
        f2mPrefix + "_copy",
        c.i32_add(c.getLocal("x"), c.i32_const(n8 * 2)),
        c.i32_add(c.getLocal("pr"), c.i32_const(n8 * 4))
      )
    );
  }
  build_mulNR12();
  const ftmPrefix = buildF2m$1(module, prefix + "_mulNR12", "ftm", f6mPrefix);
  const ateLoopCount = 29793968203157093288n;
  const ateLoopBitBytes = bits2(ateLoopCount);
  const pAteLoopBitBytes = module.alloc(ateLoopBitBytes);
  const ateCoefSize = 3 * f2size;
  const ateNDblCoefs = ateLoopBitBytes.length - 1;
  const ateNAddCoefs = ateLoopBitBytes.reduce((acc, b) => acc + (b != 0 ? 1 : 0), 0);
  const ateNCoefs = ateNAddCoefs + ateNDblCoefs + 1;
  const prePSize = 3 * 2 * n8;
  const preQSize = 3 * n8 * 2 + ateNCoefs * ateCoefSize;
  module.modules[prefix] = {
    n64,
    pG1gen,
    pG1zero,
    pG1b,
    pG2gen,
    pG2zero,
    pG2b,
    pq: module.modules["f1m"].pq,
    pr,
    pOneT,
    prePSize,
    preQSize,
    r: r.toString(),
    q: q.toString()
  };
  const finalExpZ = 4965661367192848881n;
  function naf2(n) {
    let E = n;
    const res = [];
    while (E > 0n) {
      if (isOdd$1(E)) {
        const z = 2 - Number(E % 4n);
        res.push(z);
        E = E - BigInt(z);
      } else {
        res.push(0);
      }
      E = E >> 1n;
    }
    return res;
  }
  function bits2(n) {
    let E = n;
    const res = [];
    while (E > 0n) {
      if (isOdd$1(E)) {
        res.push(1);
      } else {
        res.push(0);
      }
      E = E >> 1n;
    }
    return res;
  }
  function buildPrepareG1() {
    const f = module.addFunction(prefix + "_prepareG1");
    f.addParam("pP", "i32");
    f.addParam("ppreP", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.call(g1mPrefix + "_normalize", c.getLocal("pP"), c.getLocal("ppreP"))
      // TODO Remove if already in affine
    );
  }
  function buildPrepAddStep() {
    const f = module.addFunction(prefix + "_prepAddStep");
    f.addParam("pQ", "i32");
    f.addParam("pR", "i32");
    f.addParam("pCoef", "i32");
    const c = f.getCodeBuilder();
    const X2 = c.getLocal("pQ");
    const Y2 = c.i32_add(c.getLocal("pQ"), c.i32_const(f2size));
    const X1 = c.getLocal("pR");
    const Y1 = c.i32_add(c.getLocal("pR"), c.i32_const(f2size));
    const Z1 = c.i32_add(c.getLocal("pR"), c.i32_const(2 * f2size));
    const ELL_0 = c.getLocal("pCoef");
    const ELL_VW = c.i32_add(c.getLocal("pCoef"), c.i32_const(f2size));
    const ELL_VV = c.i32_add(c.getLocal("pCoef"), c.i32_const(2 * f2size));
    const D = ELL_VW;
    const E = c.i32_const(module.alloc(f2size));
    const F = c.i32_const(module.alloc(f2size));
    const G = c.i32_const(module.alloc(f2size));
    const H = c.i32_const(module.alloc(f2size));
    const I = c.i32_const(module.alloc(f2size));
    const J = c.i32_const(module.alloc(f2size));
    const AUX = c.i32_const(module.alloc(f2size));
    f.addCode(
      // D = X1 - X2*Z1
      c.call(f2mPrefix + "_mul", X2, Z1, D),
      c.call(f2mPrefix + "_sub", X1, D, D),
      // E = Y1 - Y2*Z1
      c.call(f2mPrefix + "_mul", Y2, Z1, E),
      c.call(f2mPrefix + "_sub", Y1, E, E),
      // F = D^2
      c.call(f2mPrefix + "_square", D, F),
      // G = E^2
      c.call(f2mPrefix + "_square", E, G),
      // H = D*F
      c.call(f2mPrefix + "_mul", D, F, H),
      // I = X1 * F
      c.call(f2mPrefix + "_mul", X1, F, I),
      // J = H + Z1*G - (I+I)
      c.call(f2mPrefix + "_add", I, I, AUX),
      c.call(f2mPrefix + "_mul", Z1, G, J),
      c.call(f2mPrefix + "_add", H, J, J),
      c.call(f2mPrefix + "_sub", J, AUX, J),
      // X3 (X1) = D*J
      c.call(f2mPrefix + "_mul", D, J, X1),
      // Y3 (Y1) = E*(I-J)-(H*Y1)
      c.call(f2mPrefix + "_mul", H, Y1, Y1),
      c.call(f2mPrefix + "_sub", I, J, AUX),
      c.call(f2mPrefix + "_mul", E, AUX, AUX),
      c.call(f2mPrefix + "_sub", AUX, Y1, Y1),
      // Z3 (Z1) = Z1*H
      c.call(f2mPrefix + "_mul", Z1, H, Z1),
      // ell_0 = xi * (E * X2 - D * Y2)
      c.call(f2mPrefix + "_mul", D, Y2, AUX),
      c.call(f2mPrefix + "_mul", E, X2, ELL_0),
      c.call(f2mPrefix + "_sub", ELL_0, AUX, ELL_0),
      c.call(f2mPrefix + "_mul", ELL_0, c.i32_const(pAltBn128Twist), ELL_0),
      // ell_VV = - E (later: * xP)
      c.call(f2mPrefix + "_neg", E, ELL_VV)
      // ell_VW = D (later: * yP    )
      // Already assigned
    );
  }
  function buildPrepDoubleStep() {
    const f = module.addFunction(prefix + "_prepDblStep");
    f.addParam("pR", "i32");
    f.addParam("pCoef", "i32");
    const c = f.getCodeBuilder();
    const X1 = c.getLocal("pR");
    const Y1 = c.i32_add(c.getLocal("pR"), c.i32_const(f2size));
    const Z1 = c.i32_add(c.getLocal("pR"), c.i32_const(2 * f2size));
    const ELL_0 = c.getLocal("pCoef");
    const ELL_VW = c.i32_add(c.getLocal("pCoef"), c.i32_const(f2size));
    const ELL_VV = c.i32_add(c.getLocal("pCoef"), c.i32_const(2 * f2size));
    const A = c.i32_const(module.alloc(f2size));
    const B = c.i32_const(module.alloc(f2size));
    const C = c.i32_const(module.alloc(f2size));
    const D = c.i32_const(module.alloc(f2size));
    const E = c.i32_const(module.alloc(f2size));
    const F = c.i32_const(module.alloc(f2size));
    const G = c.i32_const(module.alloc(f2size));
    const H = c.i32_const(module.alloc(f2size));
    const I = c.i32_const(module.alloc(f2size));
    const J = c.i32_const(module.alloc(f2size));
    const E2 = c.i32_const(module.alloc(f2size));
    const AUX = c.i32_const(module.alloc(f2size));
    f.addCode(
      // A = X1 * Y1 / 2
      c.call(f2mPrefix + "_mul", Y1, c.i32_const(pTwoInv), A),
      c.call(f2mPrefix + "_mul", X1, A, A),
      // B = Y1^2
      c.call(f2mPrefix + "_square", Y1, B),
      // C = Z1^2
      c.call(f2mPrefix + "_square", Z1, C),
      // D = 3 * C
      c.call(f2mPrefix + "_add", C, C, D),
      c.call(f2mPrefix + "_add", D, C, D),
      // E = twist_b * D
      c.call(f2mPrefix + "_mul", c.i32_const(pTwistCoefB), D, E),
      // F = 3 * E
      c.call(f2mPrefix + "_add", E, E, F),
      c.call(f2mPrefix + "_add", E, F, F),
      // G = (B+F)/2
      c.call(f2mPrefix + "_add", B, F, G),
      c.call(f2mPrefix + "_mul", G, c.i32_const(pTwoInv), G),
      // H = (Y1+Z1)^2-(B+C)
      c.call(f2mPrefix + "_add", B, C, AUX),
      c.call(f2mPrefix + "_add", Y1, Z1, H),
      c.call(f2mPrefix + "_square", H, H),
      c.call(f2mPrefix + "_sub", H, AUX, H),
      // I = E-B
      c.call(f2mPrefix + "_sub", E, B, I),
      // J = X1^2
      c.call(f2mPrefix + "_square", X1, J),
      // E_squared = E^2
      c.call(f2mPrefix + "_square", E, E2),
      // X3 (X1) = A * (B-F)
      c.call(f2mPrefix + "_sub", B, F, AUX),
      c.call(f2mPrefix + "_mul", A, AUX, X1),
      // Y3 (Y1) = G^2 - 3*E^2
      c.call(f2mPrefix + "_add", E2, E2, AUX),
      c.call(f2mPrefix + "_add", E2, AUX, AUX),
      c.call(f2mPrefix + "_square", G, Y1),
      c.call(f2mPrefix + "_sub", Y1, AUX, Y1),
      // Z3 (Z1) = B * H
      c.call(f2mPrefix + "_mul", B, H, Z1),
      // ell_0 = xi * I
      c.call(f2mPrefix + "_mul", c.i32_const(pAltBn128Twist), I, ELL_0),
      // ell_VW = - H (later: * yP)
      c.call(f2mPrefix + "_neg", H, ELL_VW),
      // ell_VV = 3*J (later: * xP)
      c.call(f2mPrefix + "_add", J, J, ELL_VV),
      c.call(f2mPrefix + "_add", J, ELL_VV, ELL_VV)
    );
  }
  function buildMulByQ() {
    const f = module.addFunction(prefix + "_mulByQ");
    f.addParam("p1", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("p1");
    const y = c.i32_add(c.getLocal("p1"), c.i32_const(f2size));
    const z = c.i32_add(c.getLocal("p1"), c.i32_const(f2size * 2));
    const x3 = c.getLocal("pr");
    const y3 = c.i32_add(c.getLocal("pr"), c.i32_const(f2size));
    const z3 = c.i32_add(c.getLocal("pr"), c.i32_const(f2size * 2));
    const MulByQX = c.i32_const(module.alloc([
      ...utils$2.bigInt2BytesLE(toMontgomery("21575463638280843010398324269430826099269044274347216827212613867836435027261"), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery("10307601595873709700152284273816112264069230130616436755625194854815875713954"), f1size)
    ]));
    const MulByQY = c.i32_const(module.alloc([
      ...utils$2.bigInt2BytesLE(toMontgomery("2821565182194536844548159561693502659359617185244120367078079554186484126554"), f1size),
      ...utils$2.bigInt2BytesLE(toMontgomery("3505843767911556378687030309984248845540243509899259641013678093033130930403"), f1size)
    ]));
    f.addCode(
      // The frobeniusMap(1) in this field, is the conjugate
      c.call(f2mPrefix + "_conjugate", x, x3),
      c.call(f2mPrefix + "_mul", MulByQX, x3, x3),
      c.call(f2mPrefix + "_conjugate", y, y3),
      c.call(f2mPrefix + "_mul", MulByQY, y3, y3),
      c.call(f2mPrefix + "_conjugate", z, z3)
    );
  }
  function buildPrepareG2() {
    buildMulByQ();
    const f = module.addFunction(prefix + "_prepareG2");
    f.addParam("pQ", "i32");
    f.addParam("ppreQ", "i32");
    f.addLocal("pCoef", "i32");
    f.addLocal("i", "i32");
    const c = f.getCodeBuilder();
    const QX = c.getLocal("pQ");
    const pR = module.alloc(f2size * 3);
    const R = c.i32_const(pR);
    const RX = c.i32_const(pR);
    const RY = c.i32_const(pR + f2size);
    const RZ = c.i32_const(pR + 2 * f2size);
    const cQX = c.i32_add(c.getLocal("ppreQ"), c.i32_const(0));
    const cQY = c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size));
    const pQ1 = module.alloc(f2size * 3);
    const Q1 = c.i32_const(pQ1);
    const pQ2 = module.alloc(f2size * 3);
    const Q2 = c.i32_const(pQ2);
    const Q2Y = c.i32_const(pQ2 + f2size);
    f.addCode(
      c.call(g2mPrefix + "_normalize", QX, cQX),
      // TODO Remove if already in affine
      c.call(f2mPrefix + "_copy", cQX, RX),
      c.call(f2mPrefix + "_copy", cQY, RY),
      c.call(f2mPrefix + "_one", RZ)
    );
    f.addCode(
      c.setLocal("pCoef", c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size * 3))),
      c.setLocal("i", c.i32_const(ateLoopBitBytes.length - 2)),
      c.block(c.loop(
        c.call(prefix + "_prepDblStep", R, c.getLocal("pCoef")),
        c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
        c.if(
          c.i32_load8_s(c.getLocal("i"), pAteLoopBitBytes),
          [
            ...c.call(prefix + "_prepAddStep", cQX, R, c.getLocal("pCoef")),
            ...c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
          ]
        ),
        c.br_if(1, c.i32_eqz(c.getLocal("i"))),
        c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
    f.addCode(
      c.call(prefix + "_mulByQ", cQX, Q1),
      c.call(prefix + "_mulByQ", Q1, Q2)
    );
    f.addCode(
      c.call(f2mPrefix + "_neg", Q2Y, Q2Y),
      c.call(prefix + "_prepAddStep", Q1, R, c.getLocal("pCoef")),
      c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
      c.call(prefix + "_prepAddStep", Q2, R, c.getLocal("pCoef")),
      c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
    );
  }
  function buildMulBy024Old() {
    const f = module.addFunction(prefix + "__mulBy024Old");
    f.addParam("pEll0", "i32");
    f.addParam("pEllVW", "i32");
    f.addParam("pEllVV", "i32");
    f.addParam("pR", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("pEll0");
    const x2 = c.getLocal("pEllVV");
    const x4 = c.getLocal("pEllVW");
    const z0 = c.getLocal("pR");
    const pAUX12 = module.alloc(ftsize);
    const AUX12 = c.i32_const(pAUX12);
    const AUX12_0 = c.i32_const(pAUX12);
    const AUX12_2 = c.i32_const(pAUX12 + f2size);
    const AUX12_4 = c.i32_const(pAUX12 + f2size * 2);
    const AUX12_6 = c.i32_const(pAUX12 + f2size * 3);
    const AUX12_8 = c.i32_const(pAUX12 + f2size * 4);
    const AUX12_10 = c.i32_const(pAUX12 + f2size * 5);
    f.addCode(
      c.call(f2mPrefix + "_copy", x0, AUX12_0),
      c.call(f2mPrefix + "_zero", AUX12_2),
      c.call(f2mPrefix + "_copy", x2, AUX12_4),
      c.call(f2mPrefix + "_zero", AUX12_6),
      c.call(f2mPrefix + "_copy", x4, AUX12_8),
      c.call(f2mPrefix + "_zero", AUX12_10),
      c.call(ftmPrefix + "_mul", AUX12, z0, z0)
    );
  }
  function buildMulBy024() {
    const f = module.addFunction(prefix + "__mulBy024");
    f.addParam("pEll0", "i32");
    f.addParam("pEllVW", "i32");
    f.addParam("pEllVV", "i32");
    f.addParam("pR", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("pEll0");
    const x2 = c.getLocal("pEllVV");
    const x4 = c.getLocal("pEllVW");
    const z0 = c.getLocal("pR");
    const z1 = c.i32_add(c.getLocal("pR"), c.i32_const(2 * n8));
    const z2 = c.i32_add(c.getLocal("pR"), c.i32_const(4 * n8));
    const z3 = c.i32_add(c.getLocal("pR"), c.i32_const(6 * n8));
    const z4 = c.i32_add(c.getLocal("pR"), c.i32_const(8 * n8));
    const z5 = c.i32_add(c.getLocal("pR"), c.i32_const(10 * n8));
    const t0 = c.i32_const(module.alloc(f2size));
    const t1 = c.i32_const(module.alloc(f2size));
    const t2 = c.i32_const(module.alloc(f2size));
    const s0 = c.i32_const(module.alloc(f2size));
    const T3 = c.i32_const(module.alloc(f2size));
    const T4 = c.i32_const(module.alloc(f2size));
    const D0 = c.i32_const(module.alloc(f2size));
    const D2 = c.i32_const(module.alloc(f2size));
    const D4 = c.i32_const(module.alloc(f2size));
    const S1 = c.i32_const(module.alloc(f2size));
    const AUX = c.i32_const(module.alloc(f2size));
    f.addCode(
      // D0 = z0 * x0;
      c.call(f2mPrefix + "_mul", z0, x0, D0),
      // D2 = z2 * x2;
      c.call(f2mPrefix + "_mul", z2, x2, D2),
      // D4 = z4 * x4;
      c.call(f2mPrefix + "_mul", z4, x4, D4),
      // t2 = z0 + z4;
      c.call(f2mPrefix + "_add", z0, z4, t2),
      // t1 = z0 + z2;
      c.call(f2mPrefix + "_add", z0, z2, t1),
      // s0 = z1 + z3 + z5;
      c.call(f2mPrefix + "_add", z1, z3, s0),
      c.call(f2mPrefix + "_add", s0, z5, s0),
      // For z.a_.a_ = z0.
      // S1 = z1 * x2;
      c.call(f2mPrefix + "_mul", z1, x2, S1),
      // T3 = S1 + D4;
      c.call(f2mPrefix + "_add", S1, D4, T3),
      // T4 = my_Fp6::non_residue * T3 + D0;
      c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), T3, T4),
      c.call(f2mPrefix + "_add", T4, D0, z0),
      // z0 = T4;
      // For z.a_.b_ = z1
      // T3 = z5 * x4;
      c.call(f2mPrefix + "_mul", z5, x4, T3),
      // S1 = S1 + T3;
      c.call(f2mPrefix + "_add", S1, T3, S1),
      // T3 = T3 + D2;
      c.call(f2mPrefix + "_add", T3, D2, T3),
      // T4 = my_Fp6::non_residue * T3;
      c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), T3, T4),
      // T3 = z1 * x0;
      c.call(f2mPrefix + "_mul", z1, x0, T3),
      // S1 = S1 + T3;
      c.call(f2mPrefix + "_add", S1, T3, S1),
      // T4 = T4 + T3;
      c.call(f2mPrefix + "_add", T4, T3, z1),
      // z1 = T4;
      // For z.a_.c_ = z2
      // t0 = x0 + x2;
      c.call(f2mPrefix + "_add", x0, x2, t0),
      // T3 = t1 * t0 - D0 - D2;
      c.call(f2mPrefix + "_mul", t1, t0, T3),
      c.call(f2mPrefix + "_add", D0, D2, AUX),
      c.call(f2mPrefix + "_sub", T3, AUX, T3),
      // T4 = z3 * x4;
      c.call(f2mPrefix + "_mul", z3, x4, T4),
      // S1 = S1 + T4;
      c.call(f2mPrefix + "_add", S1, T4, S1),
      // For z.b_.a_ = z3 (z3 needs z2)
      // t0 = z2 + z4;
      c.call(f2mPrefix + "_add", z2, z4, t0),
      // T3 = T3 + T4;
      // z2 = T3;
      c.call(f2mPrefix + "_add", T3, T4, z2),
      // t1 = x2 + x4;
      c.call(f2mPrefix + "_add", x2, x4, t1),
      // T3 = t0 * t1 - D2 - D4;
      c.call(f2mPrefix + "_mul", t1, t0, T3),
      c.call(f2mPrefix + "_add", D2, D4, AUX),
      c.call(f2mPrefix + "_sub", T3, AUX, T3),
      // T4 = my_Fp6::non_residue * T3;
      c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), T3, T4),
      // T3 = z3 * x0;
      c.call(f2mPrefix + "_mul", z3, x0, T3),
      // S1 = S1 + T3;
      c.call(f2mPrefix + "_add", S1, T3, S1),
      // T4 = T4 + T3;
      c.call(f2mPrefix + "_add", T4, T3, z3),
      // z3 = T4;
      // For z.b_.b_ = z4
      // T3 = z5 * x2;
      c.call(f2mPrefix + "_mul", z5, x2, T3),
      // S1 = S1 + T3;
      c.call(f2mPrefix + "_add", S1, T3, S1),
      // T4 = my_Fp6::non_residue * T3;
      c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), T3, T4),
      // t0 = x0 + x4;
      c.call(f2mPrefix + "_add", x0, x4, t0),
      // T3 = t2 * t0 - D0 - D4;
      c.call(f2mPrefix + "_mul", t2, t0, T3),
      c.call(f2mPrefix + "_add", D0, D4, AUX),
      c.call(f2mPrefix + "_sub", T3, AUX, T3),
      // T4 = T4 + T3;
      c.call(f2mPrefix + "_add", T4, T3, z4),
      // z4 = T4;
      // For z.b_.c_ = z5.
      // t0 = x0 + x2 + x4;
      c.call(f2mPrefix + "_add", x0, x2, t0),
      c.call(f2mPrefix + "_add", t0, x4, t0),
      // T3 = s0 * t0 - S1;
      c.call(f2mPrefix + "_mul", s0, t0, T3),
      c.call(f2mPrefix + "_sub", T3, S1, z5)
      // z5 = T3;
    );
  }
  function buildMillerLoop() {
    const f = module.addFunction(prefix + "_millerLoop");
    f.addParam("ppreP", "i32");
    f.addParam("ppreQ", "i32");
    f.addParam("r", "i32");
    f.addLocal("pCoef", "i32");
    f.addLocal("i", "i32");
    const c = f.getCodeBuilder();
    const preP_PX = c.getLocal("ppreP");
    const preP_PY = c.i32_add(c.getLocal("ppreP"), c.i32_const(f1size));
    const ELL_0 = c.getLocal("pCoef");
    const ELL_VW = c.i32_add(c.getLocal("pCoef"), c.i32_const(f2size));
    const ELL_VV = c.i32_add(c.getLocal("pCoef"), c.i32_const(2 * f2size));
    const pVW = module.alloc(f2size);
    const VW = c.i32_const(pVW);
    const pVV = module.alloc(f2size);
    const VV = c.i32_const(pVV);
    const F = c.getLocal("r");
    f.addCode(
      c.call(ftmPrefix + "_one", F),
      c.setLocal("pCoef", c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size * 3))),
      c.setLocal("i", c.i32_const(ateLoopBitBytes.length - 2)),
      c.block(c.loop(
        c.call(ftmPrefix + "_square", F, F),
        c.call(f2mPrefix + "_mul1", ELL_VW, preP_PY, VW),
        c.call(f2mPrefix + "_mul1", ELL_VV, preP_PX, VV),
        c.call(prefix + "__mulBy024", ELL_0, VW, VV, F),
        c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
        c.if(
          c.i32_load8_s(c.getLocal("i"), pAteLoopBitBytes),
          [
            ...c.call(f2mPrefix + "_mul1", ELL_VW, preP_PY, VW),
            ...c.call(f2mPrefix + "_mul1", ELL_VV, preP_PX, VV),
            ...c.call(prefix + "__mulBy024", ELL_0, VW, VV, F),
            ...c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
          ]
        ),
        c.br_if(1, c.i32_eqz(c.getLocal("i"))),
        c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
    f.addCode(
      c.call(f2mPrefix + "_mul1", ELL_VW, preP_PY, VW),
      c.call(f2mPrefix + "_mul1", ELL_VV, preP_PX, VV),
      c.call(prefix + "__mulBy024", ELL_0, VW, VV, F),
      c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
      c.call(f2mPrefix + "_mul1", ELL_VW, preP_PY, VW),
      c.call(f2mPrefix + "_mul1", ELL_VV, preP_PX, VV),
      c.call(prefix + "__mulBy024", ELL_0, VW, VV, F),
      c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
    );
  }
  function buildFrobeniusMap(n) {
    const F12 = [
      [
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n]
      ],
      [
        [1n, 0n],
        [8376118865763821496583973867626364092589906065868298776909617916018768340080n, 16469823323077808223889137241176536799009286646108169935659301613961712198316n],
        [21888242871839275220042445260109153167277707414472061641714758635765020556617n, 0n],
        [11697423496358154304825782922584725312912383441159505038794027105778954184319n, 303847389135065887422783454877609941456349188919719272345083954437860409601n],
        [21888242871839275220042445260109153167277707414472061641714758635765020556616n, 0n],
        [3321304630594332808241809054958361220322477375291206261884409189760185844239n, 5722266937896532885780051958958348231143373700109372999374820235121374419868n],
        [21888242871839275222246405745257275088696311157297823662689037894645226208582n, 0n],
        [13512124006075453725662431877630910996106405091429524885779419978626457868503n, 5418419548761466998357268504080738289687024511189653727029736280683514010267n],
        [2203960485148121921418603742825762020974279258880205651966n, 0n],
        [10190819375481120917420622822672549775783927716138318623895010788866272024264n, 21584395482704209334823622290379665147239961968378104390343953940207365798982n],
        [2203960485148121921418603742825762020974279258880205651967n, 0n],
        [18566938241244942414004596690298913868373833782006617400804628704885040364344n, 16165975933942742336466353786298926857552937457188450663314217659523851788715n]
      ]
    ];
    const F6 = [
      [
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n]
      ],
      [
        [1n, 0n],
        [21575463638280843010398324269430826099269044274347216827212613867836435027261n, 10307601595873709700152284273816112264069230130616436755625194854815875713954n],
        [21888242871839275220042445260109153167277707414472061641714758635765020556616n, 0n],
        [3772000881919853776433695186713858239009073593817195771773381919316419345261n, 2236595495967245188281701248203181795121068902605861227855261137820944008926n],
        [2203960485148121921418603742825762020974279258880205651966n, 0n],
        [18429021223477853657660792034369865839114504446431234726392080002137598044644n, 9344045779998320333812420223237981029506012124075525679208581902008406485703n]
      ],
      [
        [1n, 0n],
        [2581911344467009335267311115468803099551665605076196740867805258568234346338n, 19937756971775647987995932169929341994314640652964949448313374472400716661030n],
        [2203960485148121921418603742825762020974279258880205651966n, 0n],
        [5324479202449903542726783395506214481928257762400643279780343368557297135718n, 16208900380737693084919495127334387981393726419856888799917914180988844123039n],
        [21888242871839275220042445260109153167277707414472061641714758635765020556616n, 0n],
        [13981852324922362344252311234282257507216387789820983642040889267519694726527n, 7629828391165209371577384193250820201684255241773809077146787135900891633097n]
      ]
    ];
    const f = module.addFunction(prefix + "__frobeniusMap" + n);
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    for (let i = 0; i < 6; i++) {
      const X = i == 0 ? c.getLocal("x") : c.i32_add(c.getLocal("x"), c.i32_const(i * f2size));
      const Xc0 = X;
      const Xc1 = c.i32_add(c.getLocal("x"), c.i32_const(i * f2size + f1size));
      const R = i == 0 ? c.getLocal("r") : c.i32_add(c.getLocal("r"), c.i32_const(i * f2size));
      const Rc0 = R;
      const Rc1 = c.i32_add(c.getLocal("r"), c.i32_const(i * f2size + f1size));
      const coef = mul2(F12[Math.floor(i / 3)][n % 12], F6[i % 3][n % 6]);
      const pCoef = module.alloc([
        ...utils$2.bigInt2BytesLE(toMontgomery(coef[0]), 32),
        ...utils$2.bigInt2BytesLE(toMontgomery(coef[1]), 32)
      ]);
      if (n % 2 == 1) {
        f.addCode(
          c.call(f1mPrefix + "_copy", Xc0, Rc0),
          c.call(f1mPrefix + "_neg", Xc1, Rc1),
          c.call(f2mPrefix + "_mul", R, c.i32_const(pCoef), R)
        );
      } else {
        f.addCode(c.call(f2mPrefix + "_mul", X, c.i32_const(pCoef), R));
      }
    }
    function mul2(a, b) {
      const ac0 = BigInt(a[0]);
      const ac1 = BigInt(a[1]);
      const bc0 = BigInt(b[0]);
      const bc1 = BigInt(b[1]);
      const res = [
        (ac0 * bc0 - ac1 * bc1) % q,
        (ac0 * bc1 + ac1 * bc0) % q
      ];
      if (isNegative$2(res[0])) res[0] = res[0] + q;
      return res;
    }
  }
  function buildFinalExponentiationFirstChunk() {
    const f = module.addFunction(prefix + "__finalExponentiationFirstChunk");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const elt = c.getLocal("x");
    const eltC0 = elt;
    const eltC1 = c.i32_add(elt, c.i32_const(n8 * 6));
    const r2 = c.getLocal("r");
    const pA = module.alloc(ftsize);
    const A = c.i32_const(pA);
    const Ac0 = A;
    const Ac1 = c.i32_const(pA + n8 * 6);
    const B = c.i32_const(module.alloc(ftsize));
    const C = c.i32_const(module.alloc(ftsize));
    const D = c.i32_const(module.alloc(ftsize));
    f.addCode(
      // const alt_bn128_Fq12 A = alt_bn128_Fq12(elt.c0,-elt.c1);
      c.call(f6mPrefix + "_copy", eltC0, Ac0),
      c.call(f6mPrefix + "_neg", eltC1, Ac1),
      // const alt_bn128_Fq12 B = elt.inverse();
      c.call(ftmPrefix + "_inverse", elt, B),
      // const alt_bn128_Fq12 C = A * B;
      c.call(ftmPrefix + "_mul", A, B, C),
      // const alt_bn128_Fq12 D = C.Frobenius_map(2);
      c.call(prefix + "__frobeniusMap2", C, D),
      // const alt_bn128_Fq12 result = D * C;
      c.call(ftmPrefix + "_mul", C, D, r2)
    );
  }
  function buildCyclotomicSquare() {
    const f = module.addFunction(prefix + "__cyclotomicSquare");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x4 = c.i32_add(c.getLocal("x"), c.i32_const(f2size));
    const x3 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f2size));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(3 * f2size));
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(4 * f2size));
    const x5 = c.i32_add(c.getLocal("x"), c.i32_const(5 * f2size));
    const r0 = c.getLocal("r");
    const r4 = c.i32_add(c.getLocal("r"), c.i32_const(f2size));
    const r3 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f2size));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(3 * f2size));
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(4 * f2size));
    const r5 = c.i32_add(c.getLocal("r"), c.i32_const(5 * f2size));
    const t0 = c.i32_const(module.alloc(f2size));
    const t1 = c.i32_const(module.alloc(f2size));
    const t2 = c.i32_const(module.alloc(f2size));
    const t3 = c.i32_const(module.alloc(f2size));
    const t4 = c.i32_const(module.alloc(f2size));
    const t5 = c.i32_const(module.alloc(f2size));
    const tmp = c.i32_const(module.alloc(f2size));
    const AUX = c.i32_const(module.alloc(f2size));
    f.addCode(
      //    // t0 + t1*y = (z0 + z1*y)^2 = a^2
      //    tmp = z0 * z1;
      //    t0 = (z0 + z1) * (z0 + my_Fp6::non_residue * z1) - tmp - my_Fp6::non_residue * tmp;
      //    t1 = tmp + tmp;
      c.call(f2mPrefix + "_mul", x0, x1, tmp),
      c.call(f2mPrefix + "_mul", x1, c.i32_const(pNonResidueF6), t0),
      c.call(f2mPrefix + "_add", x0, t0, t0),
      c.call(f2mPrefix + "_add", x0, x1, AUX),
      c.call(f2mPrefix + "_mul", AUX, t0, t0),
      c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), tmp, AUX),
      c.call(f2mPrefix + "_add", tmp, AUX, AUX),
      c.call(f2mPrefix + "_sub", t0, AUX, t0),
      c.call(f2mPrefix + "_add", tmp, tmp, t1),
      //  // t2 + t3*y = (z2 + z3*y)^2 = b^2
      //  tmp = z2 * z3;
      //  t2 = (z2 + z3) * (z2 + my_Fp6::non_residue * z3) - tmp - my_Fp6::non_residue * tmp;
      //  t3 = tmp + tmp;
      c.call(f2mPrefix + "_mul", x2, x3, tmp),
      c.call(f2mPrefix + "_mul", x3, c.i32_const(pNonResidueF6), t2),
      c.call(f2mPrefix + "_add", x2, t2, t2),
      c.call(f2mPrefix + "_add", x2, x3, AUX),
      c.call(f2mPrefix + "_mul", AUX, t2, t2),
      c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), tmp, AUX),
      c.call(f2mPrefix + "_add", tmp, AUX, AUX),
      c.call(f2mPrefix + "_sub", t2, AUX, t2),
      c.call(f2mPrefix + "_add", tmp, tmp, t3),
      //  // t4 + t5*y = (z4 + z5*y)^2 = c^2
      //  tmp = z4 * z5;
      //  t4 = (z4 + z5) * (z4 + my_Fp6::non_residue * z5) - tmp - my_Fp6::non_residue * tmp;
      //  t5 = tmp + tmp;
      c.call(f2mPrefix + "_mul", x4, x5, tmp),
      c.call(f2mPrefix + "_mul", x5, c.i32_const(pNonResidueF6), t4),
      c.call(f2mPrefix + "_add", x4, t4, t4),
      c.call(f2mPrefix + "_add", x4, x5, AUX),
      c.call(f2mPrefix + "_mul", AUX, t4, t4),
      c.call(f2mPrefix + "_mul", c.i32_const(pNonResidueF6), tmp, AUX),
      c.call(f2mPrefix + "_add", tmp, AUX, AUX),
      c.call(f2mPrefix + "_sub", t4, AUX, t4),
      c.call(f2mPrefix + "_add", tmp, tmp, t5),
      // For A
      // z0 = 3 * t0 - 2 * z0
      c.call(f2mPrefix + "_sub", t0, x0, r0),
      c.call(f2mPrefix + "_add", r0, r0, r0),
      c.call(f2mPrefix + "_add", t0, r0, r0),
      // z1 = 3 * t1 + 2 * z1
      c.call(f2mPrefix + "_add", t1, x1, r1),
      c.call(f2mPrefix + "_add", r1, r1, r1),
      c.call(f2mPrefix + "_add", t1, r1, r1),
      // For B
      // z2 = 3 * (xi * t5) + 2 * z2
      c.call(f2mPrefix + "_mul", t5, c.i32_const(pAltBn128Twist), AUX),
      c.call(f2mPrefix + "_add", AUX, x2, r2),
      c.call(f2mPrefix + "_add", r2, r2, r2),
      c.call(f2mPrefix + "_add", AUX, r2, r2),
      // z3 = 3 * t4 - 2 * z3
      c.call(f2mPrefix + "_sub", t4, x3, r3),
      c.call(f2mPrefix + "_add", r3, r3, r3),
      c.call(f2mPrefix + "_add", t4, r3, r3),
      // For C
      // z4 = 3 * t2 - 2 * z4
      c.call(f2mPrefix + "_sub", t2, x4, r4),
      c.call(f2mPrefix + "_add", r4, r4, r4),
      c.call(f2mPrefix + "_add", t2, r4, r4),
      // z5 = 3 * t3 + 2 * z5
      c.call(f2mPrefix + "_add", t3, x5, r5),
      c.call(f2mPrefix + "_add", r5, r5, r5),
      c.call(f2mPrefix + "_add", t3, r5, r5)
    );
  }
  function buildCyclotomicExp(exponent, fnName) {
    const exponentNafBytes = naf2(exponent).map((b) => b == -1 ? 255 : b);
    const pExponentNafBytes = module.alloc(exponentNafBytes);
    const f = module.addFunction(prefix + "__cyclotomicExp_" + fnName);
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    f.addLocal("bit", "i32");
    f.addLocal("i", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("x");
    const res = c.getLocal("r");
    const inverse = c.i32_const(module.alloc(ftsize));
    f.addCode(
      c.call(ftmPrefix + "_conjugate", x, inverse),
      c.call(ftmPrefix + "_one", res),
      c.if(
        c.teeLocal("bit", c.i32_load8_s(c.i32_const(exponentNafBytes.length - 1), pExponentNafBytes)),
        c.if(
          c.i32_eq(
            c.getLocal("bit"),
            c.i32_const(1)
          ),
          c.call(ftmPrefix + "_mul", res, x, res),
          c.call(ftmPrefix + "_mul", res, inverse, res)
        )
      ),
      c.setLocal("i", c.i32_const(exponentNafBytes.length - 2)),
      c.block(c.loop(
        c.call(prefix + "__cyclotomicSquare", res, res),
        c.if(
          c.teeLocal("bit", c.i32_load8_s(c.getLocal("i"), pExponentNafBytes)),
          c.if(
            c.i32_eq(
              c.getLocal("bit"),
              c.i32_const(1)
            ),
            c.call(ftmPrefix + "_mul", res, x, res),
            c.call(ftmPrefix + "_mul", res, inverse, res)
          )
        ),
        c.br_if(1, c.i32_eqz(c.getLocal("i"))),
        c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  function buildFinalExponentiationLastChunk() {
    buildCyclotomicSquare();
    buildCyclotomicExp(finalExpZ, "w0");
    const f = module.addFunction(prefix + "__finalExponentiationLastChunk");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const elt = c.getLocal("x");
    const result = c.getLocal("r");
    const A = c.i32_const(module.alloc(ftsize));
    const B = c.i32_const(module.alloc(ftsize));
    const C = c.i32_const(module.alloc(ftsize));
    const D = c.i32_const(module.alloc(ftsize));
    const E = c.i32_const(module.alloc(ftsize));
    const F = c.i32_const(module.alloc(ftsize));
    const G = c.i32_const(module.alloc(ftsize));
    const H = c.i32_const(module.alloc(ftsize));
    const I = c.i32_const(module.alloc(ftsize));
    const J = c.i32_const(module.alloc(ftsize));
    const K = c.i32_const(module.alloc(ftsize));
    const L = c.i32_const(module.alloc(ftsize));
    const M = c.i32_const(module.alloc(ftsize));
    const N = c.i32_const(module.alloc(ftsize));
    const O = c.i32_const(module.alloc(ftsize));
    const P = c.i32_const(module.alloc(ftsize));
    const Q2 = c.i32_const(module.alloc(ftsize));
    const R = c.i32_const(module.alloc(ftsize));
    const S = c.i32_const(module.alloc(ftsize));
    const T = c.i32_const(module.alloc(ftsize));
    const U = c.i32_const(module.alloc(ftsize));
    f.addCode(
      // A = exp_by_neg_z(elt)  // = elt^(-z)
      c.call(prefix + "__cyclotomicExp_w0", elt, A),
      c.call(ftmPrefix + "_conjugate", A, A),
      // B = A^2                // = elt^(-2*z)
      c.call(prefix + "__cyclotomicSquare", A, B),
      // C = B^2                // = elt^(-4*z)
      c.call(prefix + "__cyclotomicSquare", B, C),
      // D = C * B              // = elt^(-6*z)
      c.call(ftmPrefix + "_mul", C, B, D),
      // E = exp_by_neg_z(D)    // = elt^(6*z^2)
      c.call(prefix + "__cyclotomicExp_w0", D, E),
      c.call(ftmPrefix + "_conjugate", E, E),
      // F = E^2                // = elt^(12*z^2)
      c.call(prefix + "__cyclotomicSquare", E, F),
      // G = epx_by_neg_z(F)    // = elt^(-12*z^3)
      c.call(prefix + "__cyclotomicExp_w0", F, G),
      c.call(ftmPrefix + "_conjugate", G, G),
      // H = conj(D)            // = elt^(6*z)
      c.call(ftmPrefix + "_conjugate", D, H),
      // I = conj(G)            // = elt^(12*z^3)
      c.call(ftmPrefix + "_conjugate", G, I),
      // J = I * E              // = elt^(12*z^3 + 6*z^2)
      c.call(ftmPrefix + "_mul", I, E, J),
      // K = J * H              // = elt^(12*z^3 + 6*z^2 + 6*z)
      c.call(ftmPrefix + "_mul", J, H, K),
      // L = K * B              // = elt^(12*z^3 + 6*z^2 + 4*z)
      c.call(ftmPrefix + "_mul", K, B, L),
      // M = K * E              // = elt^(12*z^3 + 12*z^2 + 6*z)
      c.call(ftmPrefix + "_mul", K, E, M),
      // N = M * elt            // = elt^(12*z^3 + 12*z^2 + 6*z + 1)
      c.call(ftmPrefix + "_mul", M, elt, N),
      // O = L.Frobenius_map(1) // = elt^(q*(12*z^3 + 6*z^2 + 4*z))
      c.call(prefix + "__frobeniusMap1", L, O),
      // P = O * N              // = elt^(q*(12*z^3 + 6*z^2 + 4*z) * (12*z^3 + 12*z^2 + 6*z + 1))
      c.call(ftmPrefix + "_mul", O, N, P),
      // Q = K.Frobenius_map(2) // = elt^(q^2 * (12*z^3 + 6*z^2 + 6*z))
      c.call(prefix + "__frobeniusMap2", K, Q2),
      // R = Q * P              // = elt^(q^2 * (12*z^3 + 6*z^2 + 6*z) + q*(12*z^3 + 6*z^2 + 4*z) * (12*z^3 + 12*z^2 + 6*z + 1))
      c.call(ftmPrefix + "_mul", Q2, P, R),
      // S = conj(elt)          // = elt^(-1)
      c.call(ftmPrefix + "_conjugate", elt, S),
      // T = S * L              // = elt^(12*z^3 + 6*z^2 + 4*z - 1)
      c.call(ftmPrefix + "_mul", S, L, T),
      // U = T.Frobenius_map(3) // = elt^(q^3(12*z^3 + 6*z^2 + 4*z - 1))
      c.call(prefix + "__frobeniusMap3", T, U),
      // V = U * R              // = elt^(q^3(12*z^3 + 6*z^2 + 4*z - 1) + q^2 * (12*z^3 + 6*z^2 + 6*z) + q*(12*z^3 + 6*z^2 + 4*z) * (12*z^3 + 12*z^2 + 6*z + 1))
      c.call(ftmPrefix + "_mul", U, R, result)
      // result = V
    );
  }
  function buildFinalExponentiation() {
    buildFinalExponentiationFirstChunk();
    buildFinalExponentiationLastChunk();
    const f = module.addFunction(prefix + "_finalExponentiation");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const elt = c.getLocal("x");
    const result = c.getLocal("r");
    const eltToFirstChunk = c.i32_const(module.alloc(ftsize));
    f.addCode(
      c.call(prefix + "__finalExponentiationFirstChunk", elt, eltToFirstChunk),
      c.call(prefix + "__finalExponentiationLastChunk", eltToFirstChunk, result)
    );
  }
  function buildFinalExponentiationOld() {
    const f = module.addFunction(prefix + "_finalExponentiationOld");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const exponent = 552484233613224096312617126783173147097382103762957654188882734314196910839907541213974502761540629817009608548654680343627701153829446747810907373256841551006201639677726139946029199968412598804882391702273019083653272047566316584365559776493027495458238373902875937659943504873220554161550525926302303331747463515644711876653177129578303191095900909191624817826566688241804408081892785725967931714097716709526092261278071952560171111444072049229123565057483750161460024353346284167282452756217662335528813519139808291170539072125381230815729071544861602750936964829313608137325426383735122175229541155376346436093930287402089517426973178917569713384748081827255472576937471496195752727188261435633271238710131736096299798168852925540549342330775279877006784354801422249722573783561685179618816480037695005515426162362431072245638324744480n;
    const pExponent = module.alloc(utils$2.bigInt2BytesLE(exponent, 352));
    const c = f.getCodeBuilder();
    f.addCode(
      c.call(ftmPrefix + "_exp", c.getLocal("x"), c.i32_const(pExponent), c.i32_const(352), c.getLocal("r"))
    );
  }
  const pPreP = module.alloc(prePSize);
  const pPreQ = module.alloc(preQSize);
  function buildPairingEquation(nPairings) {
    const f = module.addFunction(prefix + "_pairingEq" + nPairings);
    for (let i = 0; i < nPairings; i++) {
      f.addParam("p_" + i, "i32");
      f.addParam("q_" + i, "i32");
    }
    f.addParam("c", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const resT = c.i32_const(module.alloc(ftsize));
    const auxT = c.i32_const(module.alloc(ftsize));
    f.addCode(c.call(ftmPrefix + "_one", resT));
    for (let i = 0; i < nPairings; i++) {
      f.addCode(c.call(prefix + "_prepareG1", c.getLocal("p_" + i), c.i32_const(pPreP)));
      f.addCode(c.call(prefix + "_prepareG2", c.getLocal("q_" + i), c.i32_const(pPreQ)));
      f.addCode(c.call(prefix + "_millerLoop", c.i32_const(pPreP), c.i32_const(pPreQ), auxT));
      f.addCode(c.call(ftmPrefix + "_mul", resT, auxT, resT));
    }
    f.addCode(c.call(prefix + "_finalExponentiation", resT, resT));
    f.addCode(c.call(ftmPrefix + "_eq", resT, c.getLocal("c")));
  }
  function buildPairing2() {
    const f = module.addFunction(prefix + "_pairing");
    f.addParam("p", "i32");
    f.addParam("q", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const resT = c.i32_const(module.alloc(ftsize));
    f.addCode(c.call(prefix + "_prepareG1", c.getLocal("p"), c.i32_const(pPreP)));
    f.addCode(c.call(prefix + "_prepareG2", c.getLocal("q"), c.i32_const(pPreQ)));
    f.addCode(c.call(prefix + "_millerLoop", c.i32_const(pPreP), c.i32_const(pPreQ), resT));
    f.addCode(c.call(prefix + "_finalExponentiation", resT, c.getLocal("r")));
  }
  buildPrepAddStep();
  buildPrepDoubleStep();
  buildPrepareG1();
  buildPrepareG2();
  buildMulBy024();
  buildMulBy024Old();
  buildMillerLoop();
  for (let i = 0; i < 10; i++) {
    buildFrobeniusMap(i);
    module.exportFunction(prefix + "__frobeniusMap" + i);
  }
  buildFinalExponentiationOld();
  buildFinalExponentiation();
  for (let i = 1; i <= 5; i++) {
    buildPairingEquation(i);
    module.exportFunction(prefix + "_pairingEq" + i);
  }
  buildPairing2();
  module.exportFunction(prefix + "_pairing");
  module.exportFunction(prefix + "_prepareG1");
  module.exportFunction(prefix + "_prepareG2");
  module.exportFunction(prefix + "_millerLoop");
  module.exportFunction(prefix + "_finalExponentiation");
  module.exportFunction(prefix + "_finalExponentiationOld");
  module.exportFunction(prefix + "__mulBy024");
  module.exportFunction(prefix + "__mulBy024Old");
  module.exportFunction(prefix + "__cyclotomicSquare");
  module.exportFunction(prefix + "__cyclotomicExp_w0");
};
var utils$1 = utils$6;
var buildF1m2 = build_f1m;
var buildF12 = build_f1;
var buildF2m2 = build_f2m;
var buildF3m2 = build_f3m;
var buildCurve2 = build_curve_jacobian_a0;
var buildFFT$1 = build_fft;
var buildPol2 = build_pol;
var buildQAP2 = build_qap;
var buildApplyKey2 = build_applykey;
var { bitLength: bitLength$1, isOdd, isNegative: isNegative$1 } = bigint;
var build_bls12381 = function buildBLS12381(module, _prefix) {
  const prefix = _prefix || "bls12381";
  if (module.modules[prefix]) return prefix;
  const q = 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn;
  const r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001n;
  const n64q = Math.floor((bitLength$1(q - 1n) - 1) / 64) + 1;
  const n8q = n64q * 8;
  const f1size = n8q;
  const f2size = f1size * 2;
  const ftsize = f1size * 12;
  const n64r = Math.floor((bitLength$1(r - 1n) - 1) / 64) + 1;
  const n8r = n64r * 8;
  const frsize = n8r;
  const pr = module.alloc(utils$1.bigInt2BytesLE(r, frsize));
  const f1mPrefix = buildF1m2(module, q, "f1m", "intq");
  buildF12(module, r, "fr", "frm", "intr");
  const pG1b = module.alloc(utils$1.bigInt2BytesLE(toMontgomery(4n), f1size));
  const g1mPrefix = buildCurve2(module, "g1m", "f1m", pG1b);
  buildFFT$1(module, "frm", "frm", "frm", "frm_mul");
  buildPol2(module, "pol", "frm");
  buildQAP2(module, "qap", "frm");
  const f2mPrefix = buildF2m2(module, "f1m_neg", "f2m", "f1m");
  const pG2b = module.alloc([
    ...utils$1.bigInt2BytesLE(toMontgomery(4n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(4n), f1size)
  ]);
  const g2mPrefix = buildCurve2(module, "g2m", "f2m", pG2b);
  function buildGTimesFr(fnName, opMul) {
    const f = module.addFunction(fnName);
    f.addParam("pG", "i32");
    f.addParam("pFr", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const AUX = c.i32_const(module.alloc(n8r));
    f.addCode(
      c.call("frm_fromMontgomery", c.getLocal("pFr"), AUX),
      c.call(
        opMul,
        c.getLocal("pG"),
        AUX,
        c.i32_const(n8r),
        c.getLocal("pr")
      )
    );
    module.exportFunction(fnName);
  }
  buildGTimesFr("g1m_timesFr", "g1m_timesScalar");
  buildFFT$1(module, "g1m", "g1m", "frm", "g1m_timesFr");
  buildGTimesFr("g2m_timesFr", "g2m_timesScalar");
  buildFFT$1(module, "g2m", "g2m", "frm", "g2m_timesFr");
  buildGTimesFr("g1m_timesFrAffine", "g1m_timesScalarAffine");
  buildGTimesFr("g2m_timesFrAffine", "g2m_timesScalarAffine");
  buildApplyKey2(module, "frm_batchApplyKey", "fmr", "frm", n8r, n8r, n8r, "frm_mul");
  buildApplyKey2(module, "g1m_batchApplyKey", "g1m", "frm", n8q * 3, n8q * 3, n8r, "g1m_timesFr");
  buildApplyKey2(module, "g1m_batchApplyKeyMixed", "g1m", "frm", n8q * 2, n8q * 3, n8r, "g1m_timesFrAffine");
  buildApplyKey2(module, "g2m_batchApplyKey", "g2m", "frm", n8q * 2 * 3, n8q * 3 * 2, n8r, "g2m_timesFr");
  buildApplyKey2(module, "g2m_batchApplyKeyMixed", "g2m", "frm", n8q * 2 * 2, n8q * 3 * 2, n8r, "g2m_timesFrAffine");
  function toMontgomery(a) {
    return BigInt(a) * (1n << BigInt(f1size * 8)) % q;
  }
  const G1gen = [
    3685416753713387016781088315183077757961620795782546409894578378688607592378376318836054947676345821548104185464507n,
    1339506544944476473020471379941921221584933875938349620426543736416511423956333506472724655353366534992391756441569n,
    1n
  ];
  const pG1gen = module.alloc(
    [
      ...utils$1.bigInt2BytesLE(toMontgomery(G1gen[0]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G1gen[1]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G1gen[2]), f1size)
    ]
  );
  const G1zero = [
    0n,
    1n,
    0n
  ];
  const pG1zero = module.alloc(
    [
      ...utils$1.bigInt2BytesLE(toMontgomery(G1zero[0]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G1zero[1]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G1zero[2]), f1size)
    ]
  );
  const G2gen = [
    [
      352701069587466618187139116011060144890029952792775240219908644239793785735715026873347600343865175952761926303160n,
      3059144344244213709971259814753781636986470325476647558659373206291635324768958432433509563104347017837885763365758n
    ],
    [
      1985150602287291935568054521177171638300868978215655730859378665066344726373823718423869104263333984641494340347905n,
      927553665492332455747201965776037880757740193453592970025027978793976877002675564980949289727957565575433344219582n
    ],
    [
      1n,
      0n
    ]
  ];
  const pG2gen = module.alloc(
    [
      ...utils$1.bigInt2BytesLE(toMontgomery(G2gen[0][0]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2gen[0][1]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2gen[1][0]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2gen[1][1]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2gen[2][0]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2gen[2][1]), f1size)
    ]
  );
  const G2zero = [
    [
      0n,
      0n
    ],
    [
      1n,
      0n
    ],
    [
      0n,
      0n
    ]
  ];
  const pG2zero = module.alloc(
    [
      ...utils$1.bigInt2BytesLE(toMontgomery(G2zero[0][0]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2zero[0][1]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2zero[1][0]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2zero[1][1]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2zero[2][0]), f1size),
      ...utils$1.bigInt2BytesLE(toMontgomery(G2zero[2][1]), f1size)
    ]
  );
  const pOneT = module.alloc([
    ...utils$1.bigInt2BytesLE(toMontgomery(1n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(0n), f1size)
  ]);
  const pBls12381Twist = module.alloc([
    ...utils$1.bigInt2BytesLE(toMontgomery(1n), f1size),
    ...utils$1.bigInt2BytesLE(toMontgomery(1n), f1size)
  ]);
  function build_mulNR2() {
    const f = module.addFunction(f2mPrefix + "_mulNR");
    f.addParam("x", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const x0c = c.i32_const(module.alloc(f1size));
    const x0 = c.getLocal("x");
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(f1size));
    const r0 = c.getLocal("pr");
    const r1 = c.i32_add(c.getLocal("pr"), c.i32_const(f1size));
    f.addCode(
      c.call(f1mPrefix + "_copy", x0, x0c),
      c.call(f1mPrefix + "_sub", x0, x1, r0),
      c.call(f1mPrefix + "_add", x0c, x1, r1)
    );
  }
  build_mulNR2();
  const f6mPrefix = buildF3m2(module, f2mPrefix + "_mulNR", "f6m", "f2m");
  function build_mulNR6() {
    const f = module.addFunction(f6mPrefix + "_mulNR");
    f.addParam("x", "i32");
    f.addParam("pr", "i32");
    const c = f.getCodeBuilder();
    const c0copy = c.i32_const(module.alloc(f1size * 2));
    f.addCode(
      c.call(
        f2mPrefix + "_copy",
        c.getLocal("x"),
        c0copy
      ),
      c.call(
        f2mPrefix + "_mulNR",
        c.i32_add(c.getLocal("x"), c.i32_const(n8q * 4)),
        c.getLocal("pr")
      ),
      c.call(
        f2mPrefix + "_copy",
        c.i32_add(c.getLocal("x"), c.i32_const(n8q * 2)),
        c.i32_add(c.getLocal("pr"), c.i32_const(n8q * 4))
      ),
      c.call(
        f2mPrefix + "_copy",
        c0copy,
        c.i32_add(c.getLocal("pr"), c.i32_const(n8q * 2))
      )
    );
  }
  build_mulNR6();
  const ftmPrefix = buildF2m2(module, f6mPrefix + "_mulNR", "ftm", f6mPrefix);
  const ateLoopCount = 0xd201000000010000n;
  const ateLoopBitBytes = bits2(ateLoopCount);
  const pAteLoopBitBytes = module.alloc(ateLoopBitBytes);
  const ateCoefSize = 3 * f2size;
  const ateNDblCoefs = ateLoopBitBytes.length - 1;
  const ateNAddCoefs = ateLoopBitBytes.reduce((acc, b) => acc + (b != 0 ? 1 : 0), 0);
  const ateNCoefs = ateNAddCoefs + ateNDblCoefs + 1;
  const prePSize = 3 * 2 * n8q;
  const preQSize = 3 * n8q * 2 + ateNCoefs * ateCoefSize;
  const finalExpIsNegative = true;
  const finalExpZ = 15132376222941642752n;
  module.modules[prefix] = {
    n64q,
    n64r,
    n8q,
    n8r,
    pG1gen,
    pG1zero,
    pG1b,
    pG2gen,
    pG2zero,
    pG2b,
    pq: module.modules["f1m"].pq,
    pr,
    pOneT,
    r,
    q,
    prePSize,
    preQSize
  };
  function naf2(n) {
    let E = n;
    const res = [];
    while (E > 0n) {
      if (isOdd(E)) {
        const z = 2 - Number(E % 4n);
        res.push(z);
        E = E - BigInt(z);
      } else {
        res.push(0);
      }
      E = E >> 1n;
    }
    return res;
  }
  function bits2(n) {
    let E = n;
    const res = [];
    while (E > 0n) {
      if (isOdd(E)) {
        res.push(1);
      } else {
        res.push(0);
      }
      E = E >> 1n;
    }
    return res;
  }
  function buildPrepareG1() {
    const f = module.addFunction(prefix + "_prepareG1");
    f.addParam("pP", "i32");
    f.addParam("ppreP", "i32");
    const c = f.getCodeBuilder();
    f.addCode(
      c.call(g1mPrefix + "_normalize", c.getLocal("pP"), c.getLocal("ppreP"))
      // TODO Remove if already in affine
    );
  }
  function buildPrepDoubleStep() {
    const f = module.addFunction(prefix + "_prepDblStep");
    f.addParam("R", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const Rx = c.getLocal("R");
    const Ry = c.i32_add(c.getLocal("R"), c.i32_const(2 * n8q));
    const Rz = c.i32_add(c.getLocal("R"), c.i32_const(4 * n8q));
    const t0 = c.getLocal("r");
    const t3 = c.i32_add(c.getLocal("r"), c.i32_const(2 * n8q));
    const t6 = c.i32_add(c.getLocal("r"), c.i32_const(4 * n8q));
    const zsquared = c.i32_const(module.alloc(f2size));
    const t1 = c.i32_const(module.alloc(f2size));
    const t2 = c.i32_const(module.alloc(f2size));
    const t4 = c.i32_const(module.alloc(f2size));
    const t5 = c.i32_const(module.alloc(f2size));
    f.addCode(
      // tmp0 = r.x.square();
      c.call(f2mPrefix + "_square", Rx, t0),
      // tmp1 = r.y.square();
      c.call(f2mPrefix + "_square", Ry, t1),
      // tmp2 = tmp1.square();
      c.call(f2mPrefix + "_square", t1, t2),
      // tmp3 = (tmp1 + r.x).square() - tmp0 - tmp2;
      c.call(f2mPrefix + "_add", t1, Rx, t3),
      c.call(f2mPrefix + "_square", t3, t3),
      c.call(f2mPrefix + "_sub", t3, t0, t3),
      c.call(f2mPrefix + "_sub", t3, t2, t3),
      // tmp3 = tmp3 + tmp3;
      c.call(f2mPrefix + "_add", t3, t3, t3),
      // tmp4 = tmp0 + tmp0 + tmp0;
      c.call(f2mPrefix + "_add", t0, t0, t4),
      c.call(f2mPrefix + "_add", t4, t0, t4),
      // tmp6 = r.x + tmp4;
      c.call(f2mPrefix + "_add", Rx, t4, t6),
      // tmp5 = tmp4.square();
      c.call(f2mPrefix + "_square", t4, t5),
      // zsquared = r.z.square();
      c.call(f2mPrefix + "_square", Rz, zsquared),
      // r.x = tmp5 - tmp3 - tmp3;
      c.call(f2mPrefix + "_sub", t5, t3, Rx),
      c.call(f2mPrefix + "_sub", Rx, t3, Rx),
      // r.z = (r.z + r.y).square() - tmp1 - zsquared;
      c.call(f2mPrefix + "_add", Rz, Ry, Rz),
      c.call(f2mPrefix + "_square", Rz, Rz),
      c.call(f2mPrefix + "_sub", Rz, t1, Rz),
      c.call(f2mPrefix + "_sub", Rz, zsquared, Rz),
      // r.y = (tmp3 - r.x) * tmp4;
      c.call(f2mPrefix + "_sub", t3, Rx, Ry),
      c.call(f2mPrefix + "_mul", Ry, t4, Ry),
      // tmp2 = tmp2 + tmp2;
      c.call(f2mPrefix + "_add", t2, t2, t2),
      // tmp2 = tmp2 + tmp2;
      c.call(f2mPrefix + "_add", t2, t2, t2),
      // tmp2 = tmp2 + tmp2;
      c.call(f2mPrefix + "_add", t2, t2, t2),
      // r.y -= tmp2;
      c.call(f2mPrefix + "_sub", Ry, t2, Ry),
      // tmp3 = tmp4 * zsquared;
      c.call(f2mPrefix + "_mul", t4, zsquared, t3),
      // tmp3 = tmp3 + tmp3;
      c.call(f2mPrefix + "_add", t3, t3, t3),
      // tmp3 = -tmp3;
      c.call(f2mPrefix + "_neg", t3, t3),
      // tmp6 = tmp6.square() - tmp0 - tmp5;
      c.call(f2mPrefix + "_square", t6, t6),
      c.call(f2mPrefix + "_sub", t6, t0, t6),
      c.call(f2mPrefix + "_sub", t6, t5, t6),
      // tmp1 = tmp1 + tmp1;
      c.call(f2mPrefix + "_add", t1, t1, t1),
      // tmp1 = tmp1 + tmp1;
      c.call(f2mPrefix + "_add", t1, t1, t1),
      // tmp6 = tmp6 - tmp1;
      c.call(f2mPrefix + "_sub", t6, t1, t6),
      // tmp0 = r.z * zsquared;
      c.call(f2mPrefix + "_mul", Rz, zsquared, t0),
      // tmp0 = tmp0 + tmp0;
      c.call(f2mPrefix + "_add", t0, t0, t0)
    );
  }
  function buildPrepAddStep() {
    const f = module.addFunction(prefix + "_prepAddStep");
    f.addParam("R", "i32");
    f.addParam("Q", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const Rx = c.getLocal("R");
    const Ry = c.i32_add(c.getLocal("R"), c.i32_const(2 * n8q));
    const Rz = c.i32_add(c.getLocal("R"), c.i32_const(4 * n8q));
    const Qx = c.getLocal("Q");
    const Qy = c.i32_add(c.getLocal("Q"), c.i32_const(2 * n8q));
    const t10 = c.getLocal("r");
    const t1 = c.i32_add(c.getLocal("r"), c.i32_const(2 * n8q));
    const t9 = c.i32_add(c.getLocal("r"), c.i32_const(4 * n8q));
    const zsquared = c.i32_const(module.alloc(f2size));
    const ysquared = c.i32_const(module.alloc(f2size));
    const ztsquared = c.i32_const(module.alloc(f2size));
    const t0 = c.i32_const(module.alloc(f2size));
    const t2 = c.i32_const(module.alloc(f2size));
    const t3 = c.i32_const(module.alloc(f2size));
    const t4 = c.i32_const(module.alloc(f2size));
    const t5 = c.i32_const(module.alloc(f2size));
    const t6 = c.i32_const(module.alloc(f2size));
    const t7 = c.i32_const(module.alloc(f2size));
    const t8 = c.i32_const(module.alloc(f2size));
    f.addCode(
      // zsquared = r.z.square();
      c.call(f2mPrefix + "_square", Rz, zsquared),
      // ysquared = q.y.square();
      c.call(f2mPrefix + "_square", Qy, ysquared),
      // t0 = zsquared * q.x;
      c.call(f2mPrefix + "_mul", zsquared, Qx, t0),
      // t1 = ((q.y + r.z).square() - ysquared - zsquared) * zsquared;
      c.call(f2mPrefix + "_add", Qy, Rz, t1),
      c.call(f2mPrefix + "_square", t1, t1),
      c.call(f2mPrefix + "_sub", t1, ysquared, t1),
      c.call(f2mPrefix + "_sub", t1, zsquared, t1),
      c.call(f2mPrefix + "_mul", t1, zsquared, t1),
      // t2 = t0 - r.x;
      c.call(f2mPrefix + "_sub", t0, Rx, t2),
      // t3 = t2.square();
      c.call(f2mPrefix + "_square", t2, t3),
      // t4 = t3 + t3;
      c.call(f2mPrefix + "_add", t3, t3, t4),
      // t4 = t4 + t4;
      c.call(f2mPrefix + "_add", t4, t4, t4),
      // t5 = t4 * t2;
      c.call(f2mPrefix + "_mul", t4, t2, t5),
      // t6 = t1 - r.y - r.y;
      c.call(f2mPrefix + "_sub", t1, Ry, t6),
      c.call(f2mPrefix + "_sub", t6, Ry, t6),
      // t9 = t6 * q.x;
      c.call(f2mPrefix + "_mul", t6, Qx, t9),
      // t7 = t4 * r.x;
      c.call(f2mPrefix + "_mul", t4, Rx, t7),
      // r.x = t6.square() - t5 - t7 - t7;
      c.call(f2mPrefix + "_square", t6, Rx),
      c.call(f2mPrefix + "_sub", Rx, t5, Rx),
      c.call(f2mPrefix + "_sub", Rx, t7, Rx),
      c.call(f2mPrefix + "_sub", Rx, t7, Rx),
      // r.z = (r.z + t2).square() - zsquared - t3;
      c.call(f2mPrefix + "_add", Rz, t2, Rz),
      c.call(f2mPrefix + "_square", Rz, Rz),
      c.call(f2mPrefix + "_sub", Rz, zsquared, Rz),
      c.call(f2mPrefix + "_sub", Rz, t3, Rz),
      // t10 = q.y + r.z;
      c.call(f2mPrefix + "_add", Qy, Rz, t10),
      // t8 = (t7 - r.x) * t6;
      c.call(f2mPrefix + "_sub", t7, Rx, t8),
      c.call(f2mPrefix + "_mul", t8, t6, t8),
      // t0 = r.y * t5;
      c.call(f2mPrefix + "_mul", Ry, t5, t0),
      // t0 = t0 + t0;
      c.call(f2mPrefix + "_add", t0, t0, t0),
      // r.y = t8 - t0;
      c.call(f2mPrefix + "_sub", t8, t0, Ry),
      // t10 = t10.square() - ysquared;
      c.call(f2mPrefix + "_square", t10, t10),
      c.call(f2mPrefix + "_sub", t10, ysquared, t10),
      // ztsquared = r.z.square();
      c.call(f2mPrefix + "_square", Rz, ztsquared),
      // t10 = t10 - ztsquared;
      c.call(f2mPrefix + "_sub", t10, ztsquared, t10),
      // t9 = t9 + t9 - t10;
      c.call(f2mPrefix + "_add", t9, t9, t9),
      c.call(f2mPrefix + "_sub", t9, t10, t9),
      // t10 = r.z + r.z;
      c.call(f2mPrefix + "_add", Rz, Rz, t10),
      // t6 = -t6;
      c.call(f2mPrefix + "_neg", t6, t6),
      // t1 = t6 + t6;
      c.call(f2mPrefix + "_add", t6, t6, t1)
    );
  }
  function buildPrepareG2() {
    const f = module.addFunction(prefix + "_prepareG2");
    f.addParam("pQ", "i32");
    f.addParam("ppreQ", "i32");
    f.addLocal("pCoef", "i32");
    f.addLocal("i", "i32");
    const c = f.getCodeBuilder();
    const Q2 = c.getLocal("pQ");
    const pR = module.alloc(f2size * 3);
    const R = c.i32_const(pR);
    const base = c.getLocal("ppreQ");
    f.addCode(
      c.call(g2mPrefix + "_normalize", Q2, base),
      c.if(
        c.call(g2mPrefix + "_isZero", base),
        c.ret([])
      ),
      c.call(g2mPrefix + "_copy", base, R),
      c.setLocal("pCoef", c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size * 3)))
    );
    f.addCode(
      c.setLocal("i", c.i32_const(ateLoopBitBytes.length - 2)),
      c.block(c.loop(
        c.call(prefix + "_prepDblStep", R, c.getLocal("pCoef")),
        c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
        c.if(
          c.i32_load8_s(c.getLocal("i"), pAteLoopBitBytes),
          [
            ...c.call(prefix + "_prepAddStep", R, base, c.getLocal("pCoef")),
            ...c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
          ]
        ),
        c.br_if(1, c.i32_eqz(c.getLocal("i"))),
        c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
  }
  function buildF6Mul1() {
    const f = module.addFunction(f6mPrefix + "_mul1");
    f.addParam("pA", "i32");
    f.addParam("pC1", "i32");
    f.addParam("pR", "i32");
    const c = f.getCodeBuilder();
    const A_c0 = c.getLocal("pA");
    const A_c1 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 2));
    const A_c2 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 4));
    const c1 = c.getLocal("pC1");
    const t1 = c.getLocal("pR");
    const t2 = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 2));
    const b_b = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 4));
    const Ac0_Ac1 = c.i32_const(module.alloc(f1size * 2));
    const Ac1_Ac2 = c.i32_const(module.alloc(f1size * 2));
    f.addCode(
      c.call(f2mPrefix + "_add", A_c0, A_c1, Ac0_Ac1),
      c.call(f2mPrefix + "_add", A_c1, A_c2, Ac1_Ac2),
      // let b_b = self.c1 * c1;
      c.call(f2mPrefix + "_mul", A_c1, c1, b_b),
      // let t1 = (self.c1 + self.c2) * c1 - b_b;
      c.call(f2mPrefix + "_mul", Ac1_Ac2, c1, t1),
      c.call(f2mPrefix + "_sub", t1, b_b, t1),
      // let t1 = t1.mul_by_nonresidue();
      c.call(f2mPrefix + "_mulNR", t1, t1),
      // let t2 = (self.c0 + self.c1) * c1 - b_b;
      c.call(f2mPrefix + "_mul", Ac0_Ac1, c1, t2),
      c.call(f2mPrefix + "_sub", t2, b_b, t2)
    );
  }
  buildF6Mul1();
  function buildF6Mul01() {
    const f = module.addFunction(f6mPrefix + "_mul01");
    f.addParam("pA", "i32");
    f.addParam("pC0", "i32");
    f.addParam("pC1", "i32");
    f.addParam("pR", "i32");
    const c = f.getCodeBuilder();
    const A_c0 = c.getLocal("pA");
    const A_c1 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 2));
    const A_c2 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 4));
    const c0 = c.getLocal("pC0");
    const c1 = c.getLocal("pC1");
    const t1 = c.getLocal("pR");
    const t2 = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 2));
    const t3 = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 4));
    const a_a = c.i32_const(module.alloc(f1size * 2));
    const b_b = c.i32_const(module.alloc(f1size * 2));
    const Ac0_Ac1 = c.i32_const(module.alloc(f1size * 2));
    const Ac0_Ac2 = c.i32_const(module.alloc(f1size * 2));
    f.addCode(
      // let a_a = self.c0 * c0;
      c.call(f2mPrefix + "_mul", A_c0, c0, a_a),
      // let b_b = self.c1 * c1;
      c.call(f2mPrefix + "_mul", A_c1, c1, b_b),
      c.call(f2mPrefix + "_add", A_c0, A_c1, Ac0_Ac1),
      c.call(f2mPrefix + "_add", A_c0, A_c2, Ac0_Ac2),
      // let t1 = (self.c1 + self.c2) * c1 - b_b;
      c.call(f2mPrefix + "_add", A_c1, A_c2, t1),
      c.call(f2mPrefix + "_mul", t1, c1, t1),
      c.call(f2mPrefix + "_sub", t1, b_b, t1),
      // let t1 = t1.mul_by_nonresidue() + a_a;
      c.call(f2mPrefix + "_mulNR", t1, t1),
      c.call(f2mPrefix + "_add", t1, a_a, t1),
      // let t2 = (c0 + c1) * (self.c0 + self.c1) - a_a - b_b;
      c.call(f2mPrefix + "_add", c0, c1, t2),
      c.call(f2mPrefix + "_mul", t2, Ac0_Ac1, t2),
      c.call(f2mPrefix + "_sub", t2, a_a, t2),
      c.call(f2mPrefix + "_sub", t2, b_b, t2),
      // let t3 = (self.c0 + self.c2) * c0 - a_a + b_b;
      c.call(f2mPrefix + "_mul", Ac0_Ac2, c0, t3),
      c.call(f2mPrefix + "_sub", t3, a_a, t3),
      c.call(f2mPrefix + "_add", t3, b_b, t3)
    );
  }
  buildF6Mul01();
  function buildF12Mul014() {
    const f = module.addFunction(ftmPrefix + "_mul014");
    f.addParam("pA", "i32");
    f.addParam("pC0", "i32");
    f.addParam("pC1", "i32");
    f.addParam("pC4", "i32");
    f.addParam("pR", "i32");
    const c = f.getCodeBuilder();
    const A_c0 = c.getLocal("pA");
    const A_c1 = c.i32_add(c.getLocal("pA"), c.i32_const(f1size * 6));
    const c0 = c.getLocal("pC0");
    const c1 = c.getLocal("pC1");
    const c4 = c.getLocal("pC4");
    const aa = c.i32_const(module.alloc(f1size * 6));
    const bb = c.i32_const(module.alloc(f1size * 6));
    const o = c.i32_const(module.alloc(f1size * 2));
    const R_c0 = c.getLocal("pR");
    const R_c1 = c.i32_add(c.getLocal("pR"), c.i32_const(f1size * 6));
    f.addCode(
      // let aa = self.c0.mul_by_01(c0, c1);
      c.call(f6mPrefix + "_mul01", A_c0, c0, c1, aa),
      // let bb = self.c1.mul_by_1(c4);
      c.call(f6mPrefix + "_mul1", A_c1, c4, bb),
      // let o = c1 + c4;
      c.call(f2mPrefix + "_add", c1, c4, o),
      // let c1 = self.c1 + self.c0;
      c.call(f6mPrefix + "_add", A_c1, A_c0, R_c1),
      // let c1 = c1.mul_by_01(c0, &o);
      c.call(f6mPrefix + "_mul01", R_c1, c0, o, R_c1),
      // let c1 = c1 - aa - bb;
      c.call(f6mPrefix + "_sub", R_c1, aa, R_c1),
      c.call(f6mPrefix + "_sub", R_c1, bb, R_c1),
      // let c0 = bb;
      c.call(f6mPrefix + "_copy", bb, R_c0),
      // let c0 = c0.mul_by_nonresidue();
      c.call(f6mPrefix + "_mulNR", R_c0, R_c0),
      // let c0 = c0 + aa;
      c.call(f6mPrefix + "_add", R_c0, aa, R_c0)
    );
  }
  buildF12Mul014();
  function buildELL() {
    const f = module.addFunction(prefix + "_ell");
    f.addParam("pP", "i32");
    f.addParam("pCoefs", "i32");
    f.addParam("pF", "i32");
    const c = f.getCodeBuilder();
    const Px = c.getLocal("pP");
    const Py = c.i32_add(c.getLocal("pP"), c.i32_const(n8q));
    const F = c.getLocal("pF");
    const coef0_0 = c.getLocal("pCoefs");
    const coef0_1 = c.i32_add(c.getLocal("pCoefs"), c.i32_const(f1size));
    const coef1_0 = c.i32_add(c.getLocal("pCoefs"), c.i32_const(f1size * 2));
    const coef1_1 = c.i32_add(c.getLocal("pCoefs"), c.i32_const(f1size * 3));
    const coef2 = c.i32_add(c.getLocal("pCoefs"), c.i32_const(f1size * 4));
    const pc0 = module.alloc(f1size * 2);
    const c0 = c.i32_const(pc0);
    const c0_c0 = c.i32_const(pc0);
    const c0_c1 = c.i32_const(pc0 + f1size);
    const pc1 = module.alloc(f1size * 2);
    const c1 = c.i32_const(pc1);
    const c1_c0 = c.i32_const(pc1);
    const c1_c1 = c.i32_const(pc1 + f1size);
    f.addCode(
      //     let mut c0 = coeffs.0;
      //     let mut c1 = coeffs.1;
      //
      //    c0.c0 *= p.y;
      //    c0.c1 *= p.y;
      //
      //    c1.c0 *= p.x;
      //    c1.c1 *= p.x;
      //
      //     f.mul_by_014(&coeffs.2, &c1, &c0)
      c.call(f1mPrefix + "_mul", coef0_0, Py, c0_c0),
      c.call(f1mPrefix + "_mul", coef0_1, Py, c0_c1),
      c.call(f1mPrefix + "_mul", coef1_0, Px, c1_c0),
      c.call(f1mPrefix + "_mul", coef1_1, Px, c1_c1),
      c.call(ftmPrefix + "_mul014", F, coef2, c1, c0, F)
    );
  }
  buildELL();
  function buildMillerLoop() {
    const f = module.addFunction(prefix + "_millerLoop");
    f.addParam("ppreP", "i32");
    f.addParam("ppreQ", "i32");
    f.addParam("r", "i32");
    f.addLocal("pCoef", "i32");
    f.addLocal("i", "i32");
    const c = f.getCodeBuilder();
    const preP = c.getLocal("ppreP");
    const coefs = c.getLocal("pCoef");
    const F = c.getLocal("r");
    f.addCode(
      c.call(ftmPrefix + "_one", F),
      c.if(
        c.call(g1mPrefix + "_isZero", preP),
        c.ret([])
      ),
      c.if(
        c.call(g1mPrefix + "_isZero", c.getLocal("ppreQ")),
        c.ret([])
      ),
      c.setLocal("pCoef", c.i32_add(c.getLocal("ppreQ"), c.i32_const(f2size * 3))),
      c.setLocal("i", c.i32_const(ateLoopBitBytes.length - 2)),
      c.block(c.loop(
        c.call(prefix + "_ell", preP, coefs, F),
        c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize))),
        c.if(
          c.i32_load8_s(c.getLocal("i"), pAteLoopBitBytes),
          [
            ...c.call(prefix + "_ell", preP, coefs, F),
            ...c.setLocal("pCoef", c.i32_add(c.getLocal("pCoef"), c.i32_const(ateCoefSize)))
          ]
        ),
        c.call(ftmPrefix + "_square", F, F),
        c.br_if(1, c.i32_eq(c.getLocal("i"), c.i32_const(1))),
        c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      )),
      c.call(prefix + "_ell", preP, coefs, F)
    );
    {
      f.addCode(
        c.call(ftmPrefix + "_conjugate", F, F)
      );
    }
  }
  function buildFrobeniusMap(n) {
    const F12 = [
      [
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n]
      ],
      [
        [1n, 0n],
        [3850754370037169011952147076051364057158807420970682438676050522613628423219637725072182697113062777891589506424760n, 151655185184498381465642749684540099398075398968325446656007613510403227271200139370504932015952886146304766135027n],
        [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620351n, 0n],
        [2973677408986561043442465346520108879172042883009249989176415018091420807192182638567116318576472649347015917690530n, 1028732146235106349975324479215795277384839936929757896155643118032610843298655225875571310552543014690878354869257n],
        [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n, 0n],
        [3125332594171059424908108096204648978570118281977575435832422631601824034463382777937621250592425535493320683825557n, 877076961050607968509681729531255177986764537961432449499635504522207616027455086505066378536590128544573588734230n],
        [4002409555221667393417789825735904156556882819939007885332058136124031650490837864442687629129015664037894272559786n, 0n],
        [151655185184498381465642749684540099398075398968325446656007613510403227271200139370504932015952886146304766135027n, 3850754370037169011952147076051364057158807420970682438676050522613628423219637725072182697113062777891589506424760n],
        [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n, 0n],
        [1028732146235106349975324479215795277384839936929757896155643118032610843298655225875571310552543014690878354869257n, 2973677408986561043442465346520108879172042883009249989176415018091420807192182638567116318576472649347015917690530n],
        [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939437n, 0n],
        [877076961050607968509681729531255177986764537961432449499635504522207616027455086505066378536590128544573588734230n, 3125332594171059424908108096204648978570118281977575435832422631601824034463382777937621250592425535493320683825557n]
      ]
    ];
    const F6 = [
      [
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n],
        [1n, 0n]
      ],
      [
        [1n, 0n],
        [0n, 4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n],
        [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n, 0n],
        [0n, 1n],
        [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n, 0n],
        [0n, 793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n]
      ],
      [
        [1n, 0n],
        [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939437n, 0n],
        [4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n, 0n],
        [4002409555221667393417789825735904156556882819939007885332058136124031650490837864442687629129015664037894272559786n, 0n],
        [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n, 0n],
        [793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620351n, 0n]
      ]
    ];
    const f = module.addFunction(ftmPrefix + "_frobeniusMap" + n);
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    for (let i = 0; i < 6; i++) {
      const X = i == 0 ? c.getLocal("x") : c.i32_add(c.getLocal("x"), c.i32_const(i * f2size));
      const Xc0 = X;
      const Xc1 = c.i32_add(c.getLocal("x"), c.i32_const(i * f2size + f1size));
      const R = i == 0 ? c.getLocal("r") : c.i32_add(c.getLocal("r"), c.i32_const(i * f2size));
      const Rc0 = R;
      const Rc1 = c.i32_add(c.getLocal("r"), c.i32_const(i * f2size + f1size));
      const coef = mul2(F12[Math.floor(i / 3)][n % 12], F6[i % 3][n % 6]);
      const pCoef = module.alloc([
        ...utils$1.bigInt2BytesLE(toMontgomery(coef[0]), n8q),
        ...utils$1.bigInt2BytesLE(toMontgomery(coef[1]), n8q)
      ]);
      if (n % 2 == 1) {
        f.addCode(
          c.call(f1mPrefix + "_copy", Xc0, Rc0),
          c.call(f1mPrefix + "_neg", Xc1, Rc1),
          c.call(f2mPrefix + "_mul", R, c.i32_const(pCoef), R)
        );
      } else {
        f.addCode(c.call(f2mPrefix + "_mul", X, c.i32_const(pCoef), R));
      }
    }
    function mul2(a, b) {
      const ac0 = a[0];
      const ac1 = a[1];
      const bc0 = b[0];
      const bc1 = b[1];
      const res = [
        (ac0 * bc0 - ac1 * bc1) % q,
        (ac0 * bc1 + ac1 * bc0) % q
      ];
      if (isNegative$1(res[0])) res[0] = res[0] + q;
      return res;
    }
  }
  function buildCyclotomicSquare() {
    const f = module.addFunction(prefix + "__cyclotomicSquare");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const x0 = c.getLocal("x");
    const x4 = c.i32_add(c.getLocal("x"), c.i32_const(f2size));
    const x3 = c.i32_add(c.getLocal("x"), c.i32_const(2 * f2size));
    const x2 = c.i32_add(c.getLocal("x"), c.i32_const(3 * f2size));
    const x1 = c.i32_add(c.getLocal("x"), c.i32_const(4 * f2size));
    const x5 = c.i32_add(c.getLocal("x"), c.i32_const(5 * f2size));
    const r0 = c.getLocal("r");
    const r4 = c.i32_add(c.getLocal("r"), c.i32_const(f2size));
    const r3 = c.i32_add(c.getLocal("r"), c.i32_const(2 * f2size));
    const r2 = c.i32_add(c.getLocal("r"), c.i32_const(3 * f2size));
    const r1 = c.i32_add(c.getLocal("r"), c.i32_const(4 * f2size));
    const r5 = c.i32_add(c.getLocal("r"), c.i32_const(5 * f2size));
    const t0 = c.i32_const(module.alloc(f2size));
    const t1 = c.i32_const(module.alloc(f2size));
    const t2 = c.i32_const(module.alloc(f2size));
    const t3 = c.i32_const(module.alloc(f2size));
    const t4 = c.i32_const(module.alloc(f2size));
    const t5 = c.i32_const(module.alloc(f2size));
    const tmp = c.i32_const(module.alloc(f2size));
    const AUX = c.i32_const(module.alloc(f2size));
    f.addCode(
      //    // t0 + t1*y = (z0 + z1*y)^2 = a^2
      //    tmp = z0 * z1;
      //    t0 = (z0 + z1) * (z0 + my_Fp6::non_residue * z1) - tmp - my_Fp6::non_residue * tmp;
      //    t1 = tmp + tmp;
      c.call(f2mPrefix + "_mul", x0, x1, tmp),
      c.call(f2mPrefix + "_mulNR", x1, t0),
      c.call(f2mPrefix + "_add", x0, t0, t0),
      c.call(f2mPrefix + "_add", x0, x1, AUX),
      c.call(f2mPrefix + "_mul", AUX, t0, t0),
      c.call(f2mPrefix + "_mulNR", tmp, AUX),
      c.call(f2mPrefix + "_add", tmp, AUX, AUX),
      c.call(f2mPrefix + "_sub", t0, AUX, t0),
      c.call(f2mPrefix + "_add", tmp, tmp, t1),
      //  // t2 + t3*y = (z2 + z3*y)^2 = b^2
      //  tmp = z2 * z3;
      //  t2 = (z2 + z3) * (z2 + my_Fp6::non_residue * z3) - tmp - my_Fp6::non_residue * tmp;
      //  t3 = tmp + tmp;
      c.call(f2mPrefix + "_mul", x2, x3, tmp),
      c.call(f2mPrefix + "_mulNR", x3, t2),
      c.call(f2mPrefix + "_add", x2, t2, t2),
      c.call(f2mPrefix + "_add", x2, x3, AUX),
      c.call(f2mPrefix + "_mul", AUX, t2, t2),
      c.call(f2mPrefix + "_mulNR", tmp, AUX),
      c.call(f2mPrefix + "_add", tmp, AUX, AUX),
      c.call(f2mPrefix + "_sub", t2, AUX, t2),
      c.call(f2mPrefix + "_add", tmp, tmp, t3),
      //  // t4 + t5*y = (z4 + z5*y)^2 = c^2
      //  tmp = z4 * z5;
      //  t4 = (z4 + z5) * (z4 + my_Fp6::non_residue * z5) - tmp - my_Fp6::non_residue * tmp;
      //  t5 = tmp + tmp;
      c.call(f2mPrefix + "_mul", x4, x5, tmp),
      c.call(f2mPrefix + "_mulNR", x5, t4),
      c.call(f2mPrefix + "_add", x4, t4, t4),
      c.call(f2mPrefix + "_add", x4, x5, AUX),
      c.call(f2mPrefix + "_mul", AUX, t4, t4),
      c.call(f2mPrefix + "_mulNR", tmp, AUX),
      c.call(f2mPrefix + "_add", tmp, AUX, AUX),
      c.call(f2mPrefix + "_sub", t4, AUX, t4),
      c.call(f2mPrefix + "_add", tmp, tmp, t5),
      // For A
      // z0 = 3 * t0 - 2 * z0
      c.call(f2mPrefix + "_sub", t0, x0, r0),
      c.call(f2mPrefix + "_add", r0, r0, r0),
      c.call(f2mPrefix + "_add", t0, r0, r0),
      // z1 = 3 * t1 + 2 * z1
      c.call(f2mPrefix + "_add", t1, x1, r1),
      c.call(f2mPrefix + "_add", r1, r1, r1),
      c.call(f2mPrefix + "_add", t1, r1, r1),
      // For B
      // z2 = 3 * (xi * t5) + 2 * z2
      c.call(f2mPrefix + "_mul", t5, c.i32_const(pBls12381Twist), AUX),
      c.call(f2mPrefix + "_add", AUX, x2, r2),
      c.call(f2mPrefix + "_add", r2, r2, r2),
      c.call(f2mPrefix + "_add", AUX, r2, r2),
      // z3 = 3 * t4 - 2 * z3
      c.call(f2mPrefix + "_sub", t4, x3, r3),
      c.call(f2mPrefix + "_add", r3, r3, r3),
      c.call(f2mPrefix + "_add", t4, r3, r3),
      // For C
      // z4 = 3 * t2 - 2 * z4
      c.call(f2mPrefix + "_sub", t2, x4, r4),
      c.call(f2mPrefix + "_add", r4, r4, r4),
      c.call(f2mPrefix + "_add", t2, r4, r4),
      // z5 = 3 * t3 + 2 * z5
      c.call(f2mPrefix + "_add", t3, x5, r5),
      c.call(f2mPrefix + "_add", r5, r5, r5),
      c.call(f2mPrefix + "_add", t3, r5, r5)
    );
  }
  function buildCyclotomicExp(exponent, isExpNegative, fnName) {
    const exponentNafBytes = naf2(exponent).map((b) => b == -1 ? 255 : b);
    const pExponentNafBytes = module.alloc(exponentNafBytes);
    const f = module.addFunction(prefix + "__cyclotomicExp_" + fnName);
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    f.addLocal("bit", "i32");
    f.addLocal("i", "i32");
    const c = f.getCodeBuilder();
    const x = c.getLocal("x");
    const res = c.getLocal("r");
    const inverse = c.i32_const(module.alloc(ftsize));
    f.addCode(
      c.call(ftmPrefix + "_conjugate", x, inverse),
      c.call(ftmPrefix + "_one", res),
      c.if(
        c.teeLocal("bit", c.i32_load8_s(c.i32_const(exponentNafBytes.length - 1), pExponentNafBytes)),
        c.if(
          c.i32_eq(
            c.getLocal("bit"),
            c.i32_const(1)
          ),
          c.call(ftmPrefix + "_mul", res, x, res),
          c.call(ftmPrefix + "_mul", res, inverse, res)
        )
      ),
      c.setLocal("i", c.i32_const(exponentNafBytes.length - 2)),
      c.block(c.loop(
        c.call(prefix + "__cyclotomicSquare", res, res),
        c.if(
          c.teeLocal("bit", c.i32_load8_s(c.getLocal("i"), pExponentNafBytes)),
          c.if(
            c.i32_eq(
              c.getLocal("bit"),
              c.i32_const(1)
            ),
            c.call(ftmPrefix + "_mul", res, x, res),
            c.call(ftmPrefix + "_mul", res, inverse, res)
          )
        ),
        c.br_if(1, c.i32_eqz(c.getLocal("i"))),
        c.setLocal("i", c.i32_sub(c.getLocal("i"), c.i32_const(1))),
        c.br(0)
      ))
    );
    if (isExpNegative) {
      f.addCode(
        c.call(ftmPrefix + "_conjugate", res, res)
      );
    }
  }
  function buildFinalExponentiation() {
    buildCyclotomicSquare();
    buildCyclotomicExp(finalExpZ, finalExpIsNegative, "w0");
    const f = module.addFunction(prefix + "_finalExponentiation");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const elt = c.getLocal("x");
    const res = c.getLocal("r");
    const t0 = c.i32_const(module.alloc(ftsize));
    const t1 = c.i32_const(module.alloc(ftsize));
    const t2 = c.i32_const(module.alloc(ftsize));
    const t3 = c.i32_const(module.alloc(ftsize));
    const t4 = c.i32_const(module.alloc(ftsize));
    const t5 = c.i32_const(module.alloc(ftsize));
    const t6 = c.i32_const(module.alloc(ftsize));
    f.addCode(
      // let mut t0 = f.frobenius_map(6)
      c.call(ftmPrefix + "_frobeniusMap6", elt, t0),
      // let t1 = f.invert()
      c.call(ftmPrefix + "_inverse", elt, t1),
      // let mut t2 = t0 * t1;
      c.call(ftmPrefix + "_mul", t0, t1, t2),
      // t1 = t2.clone();
      c.call(ftmPrefix + "_copy", t2, t1),
      // t2 = t2.frobenius_map().frobenius_map();
      c.call(ftmPrefix + "_frobeniusMap2", t2, t2),
      // t2 *= t1;
      c.call(ftmPrefix + "_mul", t2, t1, t2),
      // t1 = cyclotomic_square(t2).conjugate();
      c.call(prefix + "__cyclotomicSquare", t2, t1),
      c.call(ftmPrefix + "_conjugate", t1, t1),
      // let mut t3 = cycolotomic_exp(t2);
      c.call(prefix + "__cyclotomicExp_w0", t2, t3),
      // let mut t4 = cyclotomic_square(t3);
      c.call(prefix + "__cyclotomicSquare", t3, t4),
      // let mut t5 = t1 * t3;
      c.call(ftmPrefix + "_mul", t1, t3, t5),
      // t1 = cycolotomic_exp(t5);
      c.call(prefix + "__cyclotomicExp_w0", t5, t1),
      // t0 = cycolotomic_exp(t1);
      c.call(prefix + "__cyclotomicExp_w0", t1, t0),
      // let mut t6 = cycolotomic_exp(t0);
      c.call(prefix + "__cyclotomicExp_w0", t0, t6),
      // t6 *= t4;
      c.call(ftmPrefix + "_mul", t6, t4, t6),
      // t4 = cycolotomic_exp(t6);
      c.call(prefix + "__cyclotomicExp_w0", t6, t4),
      // t5 = t5.conjugate();
      c.call(ftmPrefix + "_conjugate", t5, t5),
      // t4 *= t5 * t2;
      c.call(ftmPrefix + "_mul", t4, t5, t4),
      c.call(ftmPrefix + "_mul", t4, t2, t4),
      // t5 = t2.conjugate();
      c.call(ftmPrefix + "_conjugate", t2, t5),
      // t1 *= t2;
      c.call(ftmPrefix + "_mul", t1, t2, t1),
      // t1 = t1.frobenius_map().frobenius_map().frobenius_map();
      c.call(ftmPrefix + "_frobeniusMap3", t1, t1),
      // t6 *= t5;
      c.call(ftmPrefix + "_mul", t6, t5, t6),
      // t6 = t6.frobenius_map();
      c.call(ftmPrefix + "_frobeniusMap1", t6, t6),
      // t3 *= t0;
      c.call(ftmPrefix + "_mul", t3, t0, t3),
      // t3 = t3.frobenius_map().frobenius_map();
      c.call(ftmPrefix + "_frobeniusMap2", t3, t3),
      // t3 *= t1;
      c.call(ftmPrefix + "_mul", t3, t1, t3),
      // t3 *= t6;
      c.call(ftmPrefix + "_mul", t3, t6, t3),
      // f = t3 * t4;
      c.call(ftmPrefix + "_mul", t3, t4, res)
    );
  }
  function buildFinalExponentiationOld() {
    const f = module.addFunction(prefix + "_finalExponentiationOld");
    f.addParam("x", "i32");
    f.addParam("r", "i32");
    const exponent = 322277361516934140462891564586510139908379969514828494218366688025288661041104682794998680497580008899973249814104447692778988208376779573819485263026159588510513834876303014016798809919343532899164848730280942609956670917565618115867287399623286813270357901731510188149934363360381614501334086825442271920079363289954510565375378443704372994881406797882676971082200626541916413184642520269678897559532260949334760604962086348898118982248842634379637598665468817769075878555493752214492790122785850202957575200176084204422751485957336465472324810982833638490904279282696134323072515220044451592646885410572234451732790590013479358343841220074174848221722017083597872017638514103174122784843925578370430843522959600095676285723737049438346544753168912974976791528535276317256904336520179281145394686565050419250614107803233314658825463117900250701199181529205942363159325765991819433914303908860460720581408201373164047773794825411011922305820065611121544561808414055302212057471395719432072209245600258134364584636810093520285711072578721435517884103526483832733289802426157301542744476740008494780363354305116978805620671467071400711358839553375340724899735460480144599782014906586543813292157922220645089192130209334926661588737007768565838519456601560804957985667880395221049249803753582637708560n;
    const pExponent = module.alloc(utils$1.bigInt2BytesLE(exponent, 544));
    const c = f.getCodeBuilder();
    f.addCode(
      c.call(ftmPrefix + "_exp", c.getLocal("x"), c.i32_const(pExponent), c.i32_const(544), c.getLocal("r"))
    );
  }
  const pPreP = module.alloc(prePSize);
  const pPreQ = module.alloc(preQSize);
  function buildPairingEquation(nPairings) {
    const f = module.addFunction(prefix + "_pairingEq" + nPairings);
    for (let i = 0; i < nPairings; i++) {
      f.addParam("p_" + i, "i32");
      f.addParam("q_" + i, "i32");
    }
    f.addParam("c", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const resT = c.i32_const(module.alloc(ftsize));
    const auxT = c.i32_const(module.alloc(ftsize));
    f.addCode(c.call(ftmPrefix + "_one", resT));
    for (let i = 0; i < nPairings; i++) {
      f.addCode(c.call(prefix + "_prepareG1", c.getLocal("p_" + i), c.i32_const(pPreP)));
      f.addCode(c.call(prefix + "_prepareG2", c.getLocal("q_" + i), c.i32_const(pPreQ)));
      f.addCode(
        c.if(
          c.i32_eqz(c.call(g1mPrefix + "_inGroupAffine", c.i32_const(pPreP))),
          c.ret(c.i32_const(0))
        ),
        c.if(
          c.i32_eqz(c.call(g2mPrefix + "_inGroupAffine", c.i32_const(pPreQ))),
          c.ret(c.i32_const(0))
        )
      );
      f.addCode(c.call(prefix + "_millerLoop", c.i32_const(pPreP), c.i32_const(pPreQ), auxT));
      f.addCode(c.call(ftmPrefix + "_mul", resT, auxT, resT));
    }
    f.addCode(c.call(prefix + "_finalExponentiation", resT, resT));
    f.addCode(c.call(ftmPrefix + "_eq", resT, c.getLocal("c")));
  }
  function buildPairing2() {
    const f = module.addFunction(prefix + "_pairing");
    f.addParam("p", "i32");
    f.addParam("q", "i32");
    f.addParam("r", "i32");
    const c = f.getCodeBuilder();
    const resT = c.i32_const(module.alloc(ftsize));
    f.addCode(c.call(prefix + "_prepareG1", c.getLocal("p"), c.i32_const(pPreP)));
    f.addCode(c.call(prefix + "_prepareG2", c.getLocal("q"), c.i32_const(pPreQ)));
    f.addCode(c.call(prefix + "_millerLoop", c.i32_const(pPreP), c.i32_const(pPreQ), resT));
    f.addCode(c.call(prefix + "_finalExponentiation", resT, c.getLocal("r")));
  }
  function buildInGroupG2() {
    const f = module.addFunction(g2mPrefix + "_inGroupAffine");
    f.addParam("p", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const WINV = [
      2001204777610833696708894912867952078278441409969503942666029068062015825245418932221343814564507832018947136279894n,
      2001204777610833696708894912867952078278441409969503942666029068062015825245418932221343814564507832018947136279893n
    ];
    const FROB2X = 4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n;
    const FROB3Y = [
      2973677408986561043442465346520108879172042883009249989176415018091420807192182638567116318576472649347015917690530n,
      2973677408986561043442465346520108879172042883009249989176415018091420807192182638567116318576472649347015917690530n
    ];
    const wInv = c.i32_const(module.alloc([
      ...utils$1.bigInt2BytesLE(toMontgomery(WINV[0]), n8q),
      ...utils$1.bigInt2BytesLE(toMontgomery(WINV[1]), n8q)
    ]));
    const frob2X = c.i32_const(module.alloc(utils$1.bigInt2BytesLE(toMontgomery(FROB2X), n8q)));
    const frob3Y = c.i32_const(module.alloc([
      ...utils$1.bigInt2BytesLE(toMontgomery(FROB3Y[0]), n8q),
      ...utils$1.bigInt2BytesLE(toMontgomery(FROB3Y[1]), n8q)
    ]));
    const z = c.i32_const(module.alloc(utils$1.bigInt2BytesLE(finalExpZ, 8)));
    const px = c.getLocal("p");
    const py = c.i32_add(c.getLocal("p"), c.i32_const(f2size));
    const aux = c.i32_const(module.alloc(f1size));
    const x_winv = c.i32_const(module.alloc(f2size));
    const y_winv = c.i32_const(module.alloc(f2size));
    const pf2 = module.alloc(f2size * 2);
    const f2 = c.i32_const(pf2);
    const f2x = c.i32_const(pf2);
    const f2x_c1 = c.i32_const(pf2);
    const f2x_c2 = c.i32_const(pf2 + f1size);
    const f2y = c.i32_const(pf2 + f2size);
    const f2y_c1 = c.i32_const(pf2 + f2size);
    const f2y_c2 = c.i32_const(pf2 + f2size + f1size);
    const pf3 = module.alloc(f2size * 3);
    const f3 = c.i32_const(pf3);
    const f3x = c.i32_const(pf3);
    const f3x_c1 = c.i32_const(pf3);
    const f3x_c2 = c.i32_const(pf3 + f1size);
    const f3y = c.i32_const(pf3 + f2size);
    const f3y_c1 = c.i32_const(pf3 + f2size);
    const f3y_c2 = c.i32_const(pf3 + f2size + f1size);
    const f3z = c.i32_const(pf3 + f2size * 2);
    f.addCode(
      c.if(
        c.call(g2mPrefix + "_isZeroAffine", c.getLocal("p")),
        c.ret(c.i32_const(1))
      ),
      c.if(
        c.i32_eqz(c.call(g2mPrefix + "_inCurveAffine", c.getLocal("p"))),
        c.ret(c.i32_const(0))
      ),
      c.call(f2mPrefix + "_mul", px, wInv, x_winv),
      c.call(f2mPrefix + "_mul", py, wInv, y_winv),
      c.call(f2mPrefix + "_mul1", x_winv, frob2X, f2x),
      c.call(f2mPrefix + "_neg", y_winv, f2y),
      c.call(f2mPrefix + "_neg", x_winv, f3x),
      c.call(f2mPrefix + "_mul", y_winv, frob3Y, f3y),
      c.call(f1mPrefix + "_sub", f2x_c1, f2x_c2, aux),
      c.call(f1mPrefix + "_add", f2x_c1, f2x_c2, f2x_c2),
      c.call(f1mPrefix + "_copy", aux, f2x_c1),
      c.call(f1mPrefix + "_sub", f2y_c1, f2y_c2, aux),
      c.call(f1mPrefix + "_add", f2y_c1, f2y_c2, f2y_c2),
      c.call(f1mPrefix + "_copy", aux, f2y_c1),
      c.call(f1mPrefix + "_add", f3x_c1, f3x_c2, aux),
      c.call(f1mPrefix + "_sub", f3x_c1, f3x_c2, f3x_c2),
      c.call(f1mPrefix + "_copy", aux, f3x_c1),
      c.call(f1mPrefix + "_sub", f3y_c2, f3y_c1, aux),
      c.call(f1mPrefix + "_add", f3y_c1, f3y_c2, f3y_c2),
      c.call(f1mPrefix + "_copy", aux, f3y_c1),
      c.call(f2mPrefix + "_one", f3z),
      c.call(g2mPrefix + "_timesScalar", f3, z, c.i32_const(8), f3),
      c.call(g2mPrefix + "_addMixed", f3, f2, f3),
      c.ret(
        c.call(g2mPrefix + "_eqMixed", f3, c.getLocal("p"))
      )
    );
    const fInGroup = module.addFunction(g2mPrefix + "_inGroup");
    fInGroup.addParam("pIn", "i32");
    fInGroup.setReturnType("i32");
    const c2 = fInGroup.getCodeBuilder();
    const aux2 = c2.i32_const(module.alloc(f2size * 2));
    fInGroup.addCode(
      c2.call(g2mPrefix + "_toAffine", c2.getLocal("pIn"), aux2),
      c2.ret(
        c2.call(g2mPrefix + "_inGroupAffine", aux2)
      )
    );
  }
  function buildInGroupG1() {
    const f = module.addFunction(g1mPrefix + "_inGroupAffine");
    f.addParam("p", "i32");
    f.setReturnType("i32");
    const c = f.getCodeBuilder();
    const BETA = 4002409555221667392624310435006688643935503118305586438271171395842971157480381377015405980053539358417135540939436n;
    const BETA2 = 793479390729215512621379701633421447060886740281060493010456487427281649075476305620758731620350n;
    const Z2M1D3 = (finalExpZ * finalExpZ - 1n) / 3n;
    const beta = c.i32_const(module.alloc(utils$1.bigInt2BytesLE(toMontgomery(BETA), n8q)));
    const beta2 = c.i32_const(module.alloc(utils$1.bigInt2BytesLE(toMontgomery(BETA2), n8q)));
    const z2m1d3 = c.i32_const(module.alloc(utils$1.bigInt2BytesLE(Z2M1D3, 16)));
    const px = c.getLocal("p");
    const py = c.i32_add(c.getLocal("p"), c.i32_const(f1size));
    const psp = module.alloc(f1size * 3);
    const sp = c.i32_const(psp);
    const spx = c.i32_const(psp);
    const spy = c.i32_const(psp + f1size);
    const ps2p = module.alloc(f1size * 2);
    const s2p = c.i32_const(ps2p);
    const s2px = c.i32_const(ps2p);
    const s2py = c.i32_const(ps2p + f1size);
    f.addCode(
      c.if(
        c.call(g1mPrefix + "_isZeroAffine", c.getLocal("p")),
        c.ret(c.i32_const(1))
      ),
      c.if(
        c.i32_eqz(c.call(g1mPrefix + "_inCurveAffine", c.getLocal("p"))),
        c.ret(c.i32_const(0))
      ),
      c.call(f1mPrefix + "_mul", px, beta, spx),
      c.call(f1mPrefix + "_copy", py, spy),
      c.call(f1mPrefix + "_mul", px, beta2, s2px),
      c.call(f1mPrefix + "_copy", py, s2py),
      c.call(g1mPrefix + "_doubleAffine", sp, sp),
      c.call(g1mPrefix + "_subMixed", sp, c.getLocal("p"), sp),
      c.call(g1mPrefix + "_subMixed", sp, s2p, sp),
      c.call(g1mPrefix + "_timesScalar", sp, z2m1d3, c.i32_const(16), sp),
      c.ret(
        c.call(g1mPrefix + "_eqMixed", sp, s2p)
      )
    );
    const fInGroup = module.addFunction(g1mPrefix + "_inGroup");
    fInGroup.addParam("pIn", "i32");
    fInGroup.setReturnType("i32");
    const c2 = fInGroup.getCodeBuilder();
    const aux2 = c2.i32_const(module.alloc(f1size * 2));
    fInGroup.addCode(
      c2.call(g1mPrefix + "_toAffine", c2.getLocal("pIn"), aux2),
      c2.ret(
        c2.call(g1mPrefix + "_inGroupAffine", aux2)
      )
    );
  }
  for (let i = 0; i < 10; i++) {
    buildFrobeniusMap(i);
    module.exportFunction(ftmPrefix + "_frobeniusMap" + i);
  }
  buildInGroupG1();
  buildInGroupG2();
  buildPrepAddStep();
  buildPrepDoubleStep();
  buildPrepareG1();
  buildPrepareG2();
  buildMillerLoop();
  buildFinalExponentiationOld();
  buildFinalExponentiation();
  for (let i = 1; i <= 5; i++) {
    buildPairingEquation(i);
    module.exportFunction(prefix + "_pairingEq" + i);
  }
  buildPairing2();
  module.exportFunction(prefix + "_pairing");
  module.exportFunction(prefix + "_prepareG1");
  module.exportFunction(prefix + "_prepareG2");
  module.exportFunction(prefix + "_millerLoop");
  module.exportFunction(prefix + "_finalExponentiation");
  module.exportFunction(prefix + "_finalExponentiationOld");
  module.exportFunction(prefix + "__cyclotomicSquare");
  module.exportFunction(prefix + "__cyclotomicExp_w0");
  module.exportFunction(f6mPrefix + "_mul1");
  module.exportFunction(f6mPrefix + "_mul01");
  module.exportFunction(ftmPrefix + "_mul014");
  module.exportFunction(g1mPrefix + "_inGroupAffine");
  module.exportFunction(g1mPrefix + "_inGroup");
  module.exportFunction(g2mPrefix + "_inGroupAffine");
  module.exportFunction(g2mPrefix + "_inGroup");
};
var buildBn128$1 = build_bn128;
var buildBls12381$1 = build_bls12381;
function stringifyBigInts(o) {
  if (typeof o == "bigint" || o.eq !== void 0) {
    return o.toString(10);
  } else if (o instanceof Uint8Array) {
    return fromRprLE(o, 0);
  } else if (Array.isArray(o)) {
    return o.map(stringifyBigInts);
  } else if (typeof o == "object") {
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = stringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}
function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}
function beBuff2int(buff) {
  let res = BigInt(0);
  let i = buff.length;
  let offset = 0;
  const buffV = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);
  while (i > 0) {
    if (i >= 4) {
      i -= 4;
      res += BigInt(buffV.getUint32(i)) << BigInt(offset * 8);
      offset += 4;
    } else if (i >= 2) {
      i -= 2;
      res += BigInt(buffV.getUint16(i)) << BigInt(offset * 8);
      offset += 2;
    } else {
      i -= 1;
      res += BigInt(buffV.getUint8(i)) << BigInt(offset * 8);
      offset += 1;
    }
  }
  return res;
}
function beInt2Buff(n, len) {
  let r = n;
  const buff = new Uint8Array(len);
  const buffV = new DataView(buff.buffer);
  let o = len;
  while (o > 0) {
    if (o - 4 >= 0) {
      o -= 4;
      buffV.setUint32(o, Number(r & BigInt(4294967295)));
      r = r >> BigInt(32);
    } else if (o - 2 >= 0) {
      o -= 2;
      buffV.setUint16(o, Number(r & BigInt(65535)));
      r = r >> BigInt(16);
    } else {
      o -= 1;
      buffV.setUint8(o, Number(r & BigInt(255)));
      r = r >> BigInt(8);
    }
  }
  if (r) {
    throw new Error("Number does not fit in this length");
  }
  return buff;
}
function leBuff2int(buff) {
  let res = BigInt(0);
  let i = 0;
  const buffV = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);
  while (i < buff.length) {
    if (i + 4 <= buff.length) {
      res += BigInt(buffV.getUint32(i, true)) << BigInt(i * 8);
      i += 4;
    } else if (i + 2 <= buff.length) {
      res += BigInt(buffV.getUint16(i, true)) << BigInt(i * 8);
      i += 2;
    } else {
      res += BigInt(buffV.getUint8(i, true)) << BigInt(i * 8);
      i += 1;
    }
  }
  return res;
}
function leInt2Buff(n, len) {
  let r = n;
  if (typeof len === "undefined") {
    len = Math.floor((bitLength$6(n) - 1) / 8) + 1;
    if (len == 0) len = 1;
  }
  const buff = new Uint8Array(len);
  const buffV = new DataView(buff.buffer);
  let o = 0;
  while (o < len) {
    if (o + 4 <= len) {
      buffV.setUint32(o, Number(r & BigInt(4294967295)), true);
      o += 4;
      r = r >> BigInt(32);
    } else if (o + 2 <= len) {
      buffV.setUint16(o, Number(r & BigInt(65535)), true);
      o += 2;
      r = r >> BigInt(16);
    } else {
      buffV.setUint8(o, Number(r & BigInt(255)), true);
      o += 1;
      r = r >> BigInt(8);
    }
  }
  if (r) {
    throw new Error("Number does not fit in this length");
  }
  return buff;
}
function stringifyFElements(F, o) {
  if (typeof o == "bigint" || o.eq !== void 0) {
    return o.toString(10);
  } else if (o instanceof Uint8Array) {
    return F.toString(F.e(o));
  } else if (Array.isArray(o)) {
    return o.map(stringifyFElements.bind(this, F));
  } else if (typeof o == "object") {
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = stringifyFElements(F, o[k]);
    });
    return res;
  } else {
    return o;
  }
}
function unstringifyFElements(F, o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return F.e(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return F.e(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyFElements.bind(this, F));
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyFElements(F, o[k]);
    });
    return res;
  } else {
    return o;
  }
}
var _revTable = [];
for (let i = 0; i < 256; i++) {
  _revTable[i] = _revSlow(i, 8);
}
function _revSlow(idx, bits2) {
  let res = 0;
  let a = idx;
  for (let i = 0; i < bits2; i++) {
    res <<= 1;
    res = res | a & 1;
    a >>= 1;
  }
  return res;
}
function bitReverse(idx, bits2) {
  return (_revTable[idx >>> 24] | _revTable[idx >>> 16 & 255] << 8 | _revTable[idx >>> 8 & 255] << 16 | _revTable[idx & 255] << 24) >>> 32 - bits2;
}
function log2(V) {
  return ((V & 4294901760) !== 0 ? (V &= 4294901760, 16) : 0) | ((V & 4278255360) !== 0 ? (V &= 4278255360, 8) : 0) | ((V & 4042322160) !== 0 ? (V &= 4042322160, 4) : 0) | ((V & 3435973836) !== 0 ? (V &= 3435973836, 2) : 0) | (V & 2863311530) !== 0;
}
function buffReverseBits(buff, eSize) {
  const n = buff.byteLength / eSize;
  const bits2 = log2(n);
  if (n != 1 << bits2) {
    throw new Error("Invalid number of pointers");
  }
  for (let i = 0; i < n; i++) {
    const r = bitReverse(i, bits2);
    if (i > r) {
      const tmp = buff.slice(i * eSize, (i + 1) * eSize);
      buff.set(buff.slice(r * eSize, (r + 1) * eSize), i * eSize);
      buff.set(tmp, r * eSize);
    }
  }
}
function array2buffer(arr, sG) {
  const buff = new Uint8Array(sG * arr.length);
  for (let i = 0; i < arr.length; i++) {
    buff.set(arr[i], i * sG);
  }
  return buff;
}
function buffer2array(buff, sG) {
  const n = buff.byteLength / sG;
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = buff.slice(i * sG, i * sG + sG);
  }
  return arr;
}
var _utils = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  array2buffer,
  beBuff2int,
  beInt2Buff,
  bitReverse,
  buffReverseBits,
  buffer2array,
  leBuff2int,
  leInt2Buff,
  log2,
  stringifyBigInts,
  stringifyFElements,
  unstringifyBigInts,
  unstringifyFElements
});
var PAGE_SIZE = 1 << 30;
var BigBuffer = class _BigBuffer {
  constructor(size) {
    this.buffers = [];
    this.byteLength = size;
    for (let i = 0; i < size; i += PAGE_SIZE) {
      const n = Math.min(size - i, PAGE_SIZE);
      this.buffers.push(new Uint8Array(n));
    }
  }
  slice(fr, to) {
    if (to === void 0) to = this.byteLength;
    if (fr === void 0) fr = 0;
    const len = to - fr;
    const firstPage = Math.floor(fr / PAGE_SIZE);
    const lastPage = Math.floor((fr + len - 1) / PAGE_SIZE);
    if (firstPage == lastPage || len == 0)
      return this.buffers[firstPage].slice(fr % PAGE_SIZE, fr % PAGE_SIZE + len);
    let buff;
    let p = firstPage;
    let o = fr % PAGE_SIZE;
    let r = len;
    while (r > 0) {
      const l = o + r > PAGE_SIZE ? PAGE_SIZE - o : r;
      const srcView = new Uint8Array(this.buffers[p].buffer, this.buffers[p].byteOffset + o, l);
      if (l == len) return srcView.slice();
      if (!buff) {
        if (len <= PAGE_SIZE) {
          buff = new Uint8Array(len);
        } else {
          buff = new _BigBuffer(len);
        }
      }
      buff.set(srcView, len - r);
      r = r - l;
      p++;
      o = 0;
    }
    return buff;
  }
  set(buff, offset) {
    if (offset === void 0) offset = 0;
    const len = buff.byteLength;
    if (len == 0) return;
    const firstPage = Math.floor(offset / PAGE_SIZE);
    const lastPage = Math.floor((offset + len - 1) / PAGE_SIZE);
    if (firstPage == lastPage) {
      if (buff instanceof _BigBuffer && buff.buffers.length == 1) {
        return this.buffers[firstPage].set(buff.buffers[0], offset % PAGE_SIZE);
      } else {
        return this.buffers[firstPage].set(buff, offset % PAGE_SIZE);
      }
    }
    let p = firstPage;
    let o = offset % PAGE_SIZE;
    let r = len;
    while (r > 0) {
      const l = o + r > PAGE_SIZE ? PAGE_SIZE - o : r;
      const srcView = buff.slice(len - r, len - r + l);
      const dstView = new Uint8Array(this.buffers[p].buffer, this.buffers[p].byteOffset + o, l);
      dstView.set(srcView);
      r = r - l;
      p++;
      o = 0;
    }
  }
};
function buildBatchConvert(tm, fnName, sIn, sOut) {
  return async function batchConvert(buffIn) {
    const nPoints = Math.floor(buffIn.byteLength / sIn);
    if (nPoints * sIn !== buffIn.byteLength) {
      throw new Error("Invalid buffer size");
    }
    const pointsPerChunk = Math.floor(nPoints / tm.concurrency);
    const opPromises = [];
    for (let i = 0; i < tm.concurrency; i++) {
      let n;
      if (i < tm.concurrency - 1) {
        n = pointsPerChunk;
      } else {
        n = nPoints - i * pointsPerChunk;
      }
      if (n == 0) continue;
      const buffChunk = buffIn.slice(i * pointsPerChunk * sIn, i * pointsPerChunk * sIn + n * sIn);
      const task = [
        { cmd: "ALLOCSET", var: 0, buff: buffChunk },
        { cmd: "ALLOC", var: 1, len: sOut * n },
        { cmd: "CALL", fnName, params: [
          { var: 0 },
          { val: n },
          { var: 1 }
        ] },
        { cmd: "GET", out: 0, var: 1, len: sOut * n }
      ];
      opPromises.push(
        tm.queueAction(task)
      );
    }
    const result = await Promise.all(opPromises);
    let fullBuffOut;
    if (buffIn instanceof BigBuffer) {
      fullBuffOut = new BigBuffer(nPoints * sOut);
    } else {
      fullBuffOut = new Uint8Array(nPoints * sOut);
    }
    let p = 0;
    for (let i = 0; i < result.length; i++) {
      fullBuffOut.set(result[i][0], p);
      p += result[i][0].byteLength;
    }
    return fullBuffOut;
  };
}
var WasmField1 = class {
  constructor(tm, prefix, n8, p) {
    this.tm = tm;
    this.prefix = prefix;
    this.p = p;
    this.n8 = n8;
    this.type = "F1";
    this.m = 1;
    this.half = shiftRight(p, one);
    this.bitLength = bitLength$6(p);
    this.mask = sub(shiftLeft(one, this.bitLength), one);
    this.pOp1 = tm.alloc(n8);
    this.pOp2 = tm.alloc(n8);
    this.pOp3 = tm.alloc(n8);
    this.tm.instance.exports[prefix + "_zero"](this.pOp1);
    this.zero = this.tm.getBuff(this.pOp1, this.n8);
    this.tm.instance.exports[prefix + "_one"](this.pOp1);
    this.one = this.tm.getBuff(this.pOp1, this.n8);
    this.negone = this.neg(this.one);
    this.two = this.add(this.one, this.one);
    this.n64 = Math.floor(n8 / 8);
    this.n32 = Math.floor(n8 / 4);
    if (this.n64 * 8 != this.n8) {
      throw new Error("n8 must be a multiple of 8");
    }
    this.half = shiftRight(this.p, one);
    this.nqr = this.two;
    let r = this.exp(this.nqr, this.half);
    while (!this.eq(r, this.negone)) {
      this.nqr = this.add(this.nqr, this.one);
      r = this.exp(this.nqr, this.half);
    }
    this.shift = this.mul(this.nqr, this.nqr);
    this.shiftInv = this.inv(this.shift);
    this.s = 0;
    let t = sub(this.p, one);
    while (!isOdd$5(t)) {
      this.s = this.s + 1;
      t = shiftRight(t, one);
    }
    this.w = [];
    this.w[this.s] = this.exp(this.nqr, t);
    for (let i = this.s - 1; i >= 0; i--) {
      this.w[i] = this.square(this.w[i + 1]);
    }
    if (!this.eq(this.w[0], this.one)) {
      throw new Error("Error calculating roots of unity");
    }
    this.batchToMontgomery = buildBatchConvert(tm, prefix + "_batchToMontgomery", this.n8, this.n8);
    this.batchFromMontgomery = buildBatchConvert(tm, prefix + "_batchFromMontgomery", this.n8, this.n8);
  }
  op2(opName, a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  op2Bool(opName, a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2);
  }
  op1(opName, a) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  op1Bool(opName, a) {
    this.tm.setBuff(this.pOp1, a);
    return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
  }
  add(a, b) {
    return this.op2("_add", a, b);
  }
  eq(a, b) {
    return this.op2Bool("_eq", a, b);
  }
  isZero(a) {
    return this.op1Bool("_isZero", a);
  }
  sub(a, b) {
    return this.op2("_sub", a, b);
  }
  neg(a) {
    return this.op1("_neg", a);
  }
  inv(a) {
    return this.op1("_inverse", a);
  }
  toMontgomery(a) {
    return this.op1("_toMontgomery", a);
  }
  fromMontgomery(a) {
    return this.op1("_fromMontgomery", a);
  }
  mul(a, b) {
    return this.op2("_mul", a, b);
  }
  div(a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + "_inverse"](this.pOp2, this.pOp2);
    this.tm.instance.exports[this.prefix + "_mul"](this.pOp1, this.pOp2, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  square(a) {
    return this.op1("_square", a);
  }
  isSquare(a) {
    return this.op1Bool("_isSquare", a);
  }
  sqrt(a) {
    return this.op1("_sqrt", a);
  }
  exp(a, b) {
    if (!(b instanceof Uint8Array)) {
      b = toLEBuff(e(b));
    }
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + "_exp"](this.pOp1, this.pOp2, b.byteLength, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  isNegative(a) {
    return this.op1Bool("_isNegative", a);
  }
  e(a, b) {
    if (a instanceof Uint8Array) return a;
    let ra = e(a, b);
    if (isNegative$4(ra)) {
      ra = neg(ra);
      if (gt(ra, this.p)) {
        ra = mod(ra, this.p);
      }
      ra = sub(this.p, ra);
    } else {
      if (gt(ra, this.p)) {
        ra = mod(ra, this.p);
      }
    }
    const buff = leInt2Buff(ra, this.n8);
    return this.toMontgomery(buff);
  }
  toString(a, radix) {
    const an = this.fromMontgomery(a);
    const s = fromRprLE(an, 0);
    return toString(s, radix);
  }
  fromRng(rng) {
    let v;
    const buff = new Uint8Array(this.n8);
    do {
      v = zero;
      for (let i = 0; i < this.n64; i++) {
        v = add(v, shiftLeft(rng.nextU64(), 64 * i));
      }
      v = band(v, this.mask);
    } while (geq(v, this.p));
    toRprLE(buff, 0, v, this.n8);
    return buff;
  }
  random() {
    return this.fromRng(getThreadRng());
  }
  toObject(a) {
    const an = this.fromMontgomery(a);
    return fromRprLE(an, 0);
  }
  fromObject(a) {
    const buff = new Uint8Array(this.n8);
    toRprLE(buff, 0, a, this.n8);
    return this.toMontgomery(buff);
  }
  toRprLE(buff, offset, a) {
    buff.set(this.fromMontgomery(a), offset);
  }
  toRprBE(buff, offset, a) {
    const buff2 = this.fromMontgomery(a);
    for (let i = 0; i < this.n8 / 2; i++) {
      const aux = buff2[i];
      buff2[i] = buff2[this.n8 - 1 - i];
      buff2[this.n8 - 1 - i] = aux;
    }
    buff.set(buff2, offset);
  }
  fromRprLE(buff, offset) {
    offset = offset || 0;
    const res = buff.slice(offset, offset + this.n8);
    return this.toMontgomery(res);
  }
  async batchInverse(buffIn) {
    let returnArray = false;
    const sIn = this.n8;
    const sOut = this.n8;
    if (Array.isArray(buffIn)) {
      buffIn = array2buffer(buffIn, sIn);
      returnArray = true;
    } else {
      buffIn = buffIn.slice(0, buffIn.byteLength);
    }
    const nPoints = Math.floor(buffIn.byteLength / sIn);
    if (nPoints * sIn !== buffIn.byteLength) {
      throw new Error("Invalid buffer size");
    }
    const pointsPerChunk = Math.floor(nPoints / this.tm.concurrency);
    const opPromises = [];
    for (let i = 0; i < this.tm.concurrency; i++) {
      let n;
      if (i < this.tm.concurrency - 1) {
        n = pointsPerChunk;
      } else {
        n = nPoints - i * pointsPerChunk;
      }
      if (n == 0) continue;
      const buffChunk = buffIn.slice(i * pointsPerChunk * sIn, i * pointsPerChunk * sIn + n * sIn);
      const task = [
        { cmd: "ALLOCSET", var: 0, buff: buffChunk },
        { cmd: "ALLOC", var: 1, len: sOut * n },
        { cmd: "CALL", fnName: this.prefix + "_batchInverse", params: [
          { var: 0 },
          { val: sIn },
          { val: n },
          { var: 1 },
          { val: sOut }
        ] },
        { cmd: "GET", out: 0, var: 1, len: sOut * n }
      ];
      opPromises.push(
        this.tm.queueAction(task)
      );
    }
    const result = await Promise.all(opPromises);
    let fullBuffOut;
    if (buffIn instanceof BigBuffer) {
      fullBuffOut = new BigBuffer(nPoints * sOut);
    } else {
      fullBuffOut = new Uint8Array(nPoints * sOut);
    }
    let p = 0;
    for (let i = 0; i < result.length; i++) {
      fullBuffOut.set(result[i][0], p);
      p += result[i][0].byteLength;
    }
    if (returnArray) {
      return buffer2array(fullBuffOut, sOut);
    } else {
      return fullBuffOut;
    }
  }
};
var WasmField2 = class {
  constructor(tm, prefix, F) {
    this.tm = tm;
    this.prefix = prefix;
    this.F = F;
    this.type = "F2";
    this.m = F.m * 2;
    this.n8 = this.F.n8 * 2;
    this.n32 = this.F.n32 * 2;
    this.n64 = this.F.n64 * 2;
    this.pOp1 = tm.alloc(F.n8 * 2);
    this.pOp2 = tm.alloc(F.n8 * 2);
    this.pOp3 = tm.alloc(F.n8 * 2);
    this.tm.instance.exports[prefix + "_zero"](this.pOp1);
    this.zero = tm.getBuff(this.pOp1, this.n8);
    this.tm.instance.exports[prefix + "_one"](this.pOp1);
    this.one = tm.getBuff(this.pOp1, this.n8);
    this.negone = this.neg(this.one);
    this.two = this.add(this.one, this.one);
  }
  op2(opName, a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  op2Bool(opName, a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2);
  }
  op1(opName, a) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  op1Bool(opName, a) {
    this.tm.setBuff(this.pOp1, a);
    return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
  }
  add(a, b) {
    return this.op2("_add", a, b);
  }
  eq(a, b) {
    return this.op2Bool("_eq", a, b);
  }
  isZero(a) {
    return this.op1Bool("_isZero", a);
  }
  sub(a, b) {
    return this.op2("_sub", a, b);
  }
  neg(a) {
    return this.op1("_neg", a);
  }
  inv(a) {
    return this.op1("_inverse", a);
  }
  isNegative(a) {
    return this.op1Bool("_isNegative", a);
  }
  toMontgomery(a) {
    return this.op1("_toMontgomery", a);
  }
  fromMontgomery(a) {
    return this.op1("_fromMontgomery", a);
  }
  mul(a, b) {
    return this.op2("_mul", a, b);
  }
  mul1(a, b) {
    return this.op2("_mul1", a, b);
  }
  div(a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + "_inverse"](this.pOp2, this.pOp2);
    this.tm.instance.exports[this.prefix + "_mul"](this.pOp1, this.pOp2, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  square(a) {
    return this.op1("_square", a);
  }
  isSquare(a) {
    return this.op1Bool("_isSquare", a);
  }
  sqrt(a) {
    return this.op1("_sqrt", a);
  }
  exp(a, b) {
    if (!(b instanceof Uint8Array)) {
      b = toLEBuff(e(b));
    }
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + "_exp"](this.pOp1, this.pOp2, b.byteLength, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  e(a, b) {
    if (a instanceof Uint8Array) return a;
    if (Array.isArray(a) && a.length == 2) {
      const c1 = this.F.e(a[0], b);
      const c2 = this.F.e(a[1], b);
      const res = new Uint8Array(this.F.n8 * 2);
      res.set(c1);
      res.set(c2, this.F.n8 * 2);
      return res;
    } else {
      throw new Error("invalid F2");
    }
  }
  toString(a, radix) {
    const s1 = this.F.toString(a.slice(0, this.F.n8), radix);
    const s2 = this.F.toString(a.slice(this.F.n8), radix);
    return `[${s1}, ${s2}]`;
  }
  fromRng(rng) {
    const c1 = this.F.fromRng(rng);
    const c2 = this.F.fromRng(rng);
    const res = new Uint8Array(this.F.n8 * 2);
    res.set(c1);
    res.set(c2, this.F.n8);
    return res;
  }
  random() {
    return this.fromRng(getThreadRng());
  }
  toObject(a) {
    const c1 = this.F.toObject(a.slice(0, this.F.n8));
    const c2 = this.F.toObject(a.slice(this.F.n8, this.F.n8 * 2));
    return [c1, c2];
  }
  fromObject(a) {
    const buff = new Uint8Array(this.F.n8 * 2);
    const b1 = this.F.fromObject(a[0]);
    const b2 = this.F.fromObject(a[1]);
    buff.set(b1);
    buff.set(b2, this.F.n8);
    return buff;
  }
  c1(a) {
    return a.slice(0, this.F.n8);
  }
  c2(a) {
    return a.slice(this.F.n8);
  }
};
var WasmField3 = class {
  constructor(tm, prefix, F) {
    this.tm = tm;
    this.prefix = prefix;
    this.F = F;
    this.type = "F3";
    this.m = F.m * 3;
    this.n8 = this.F.n8 * 3;
    this.n32 = this.F.n32 * 3;
    this.n64 = this.F.n64 * 3;
    this.pOp1 = tm.alloc(F.n8 * 3);
    this.pOp2 = tm.alloc(F.n8 * 3);
    this.pOp3 = tm.alloc(F.n8 * 3);
    this.tm.instance.exports[prefix + "_zero"](this.pOp1);
    this.zero = tm.getBuff(this.pOp1, this.n8);
    this.tm.instance.exports[prefix + "_one"](this.pOp1);
    this.one = tm.getBuff(this.pOp1, this.n8);
    this.negone = this.neg(this.one);
    this.two = this.add(this.one, this.one);
  }
  op2(opName, a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  op2Bool(opName, a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2);
  }
  op1(opName, a) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  op1Bool(opName, a) {
    this.tm.setBuff(this.pOp1, a);
    return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
  }
  eq(a, b) {
    return this.op2Bool("_eq", a, b);
  }
  isZero(a) {
    return this.op1Bool("_isZero", a);
  }
  add(a, b) {
    return this.op2("_add", a, b);
  }
  sub(a, b) {
    return this.op2("_sub", a, b);
  }
  neg(a) {
    return this.op1("_neg", a);
  }
  inv(a) {
    return this.op1("_inverse", a);
  }
  isNegative(a) {
    return this.op1Bool("_isNegative", a);
  }
  toMontgomery(a) {
    return this.op1("_toMontgomery", a);
  }
  fromMontgomery(a) {
    return this.op1("_fromMontgomery", a);
  }
  mul(a, b) {
    return this.op2("_mul", a, b);
  }
  div(a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + "_inverse"](this.pOp2, this.pOp2);
    this.tm.instance.exports[this.prefix + "_mul"](this.pOp1, this.pOp2, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.n8);
  }
  square(a) {
    return this.op1("_square", a);
  }
  isSquare(a) {
    return this.op1Bool("_isSquare", a);
  }
  sqrt(a) {
    return this.op1("_sqrt", a);
  }
  exp(a, b) {
    if (!(b instanceof Uint8Array)) {
      b = toLEBuff(e(b));
    }
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + "_exp"](this.pOp1, this.pOp2, b.byteLength, this.pOp3);
    return this.getBuff(this.pOp3, this.n8);
  }
  e(a, b) {
    if (a instanceof Uint8Array) return a;
    if (Array.isArray(a) && a.length == 3) {
      const c1 = this.F.e(a[0], b);
      const c2 = this.F.e(a[1], b);
      const c3 = this.F.e(a[2], b);
      const res = new Uint8Array(this.F.n8 * 3);
      res.set(c1);
      res.set(c2, this.F.n8);
      res.set(c3, this.F.n8 * 2);
      return res;
    } else {
      throw new Error("invalid F3");
    }
  }
  toString(a, radix) {
    const s1 = this.F.toString(a.slice(0, this.F.n8), radix);
    const s2 = this.F.toString(a.slice(this.F.n8, this.F.n8 * 2), radix);
    const s3 = this.F.toString(a.slice(this.F.n8 * 2), radix);
    return `[${s1}, ${s2}, ${s3}]`;
  }
  fromRng(rng) {
    const c1 = this.F.fromRng(rng);
    const c2 = this.F.fromRng(rng);
    const c3 = this.F.fromRng(rng);
    const res = new Uint8Array(this.F.n8 * 3);
    res.set(c1);
    res.set(c2, this.F.n8);
    res.set(c3, this.F.n8 * 2);
    return res;
  }
  random() {
    return this.fromRng(getThreadRng());
  }
  toObject(a) {
    const c1 = this.F.toObject(a.slice(0, this.F.n8));
    const c2 = this.F.toObject(a.slice(this.F.n8, this.F.n8 * 2));
    const c3 = this.F.toObject(a.slice(this.F.n8 * 2, this.F.n8 * 3));
    return [c1, c2, c3];
  }
  fromObject(a) {
    const buff = new Uint8Array(this.F.n8 * 3);
    const b1 = this.F.fromObject(a[0]);
    const b2 = this.F.fromObject(a[1]);
    const b3 = this.F.fromObject(a[2]);
    buff.set(b1);
    buff.set(b2, this.F.n8);
    buff.set(b3, this.F.n8 * 2);
    return buff;
  }
  c1(a) {
    return a.slice(0, this.F.n8);
  }
  c2(a) {
    return a.slice(this.F.n8, this.F.n8 * 2);
  }
  c3(a) {
    return a.slice(this.F.n8 * 2);
  }
};
var WasmCurve = class {
  constructor(tm, prefix, F, pGen, pGb, cofactor) {
    this.tm = tm;
    this.prefix = prefix;
    this.F = F;
    this.pOp1 = tm.alloc(F.n8 * 3);
    this.pOp2 = tm.alloc(F.n8 * 3);
    this.pOp3 = tm.alloc(F.n8 * 3);
    this.tm.instance.exports[prefix + "_zero"](this.pOp1);
    this.zero = this.tm.getBuff(this.pOp1, F.n8 * 3);
    this.tm.instance.exports[prefix + "_zeroAffine"](this.pOp1);
    this.zeroAffine = this.tm.getBuff(this.pOp1, F.n8 * 2);
    this.one = this.tm.getBuff(pGen, F.n8 * 3);
    this.g = this.one;
    this.oneAffine = this.tm.getBuff(pGen, F.n8 * 2);
    this.gAffine = this.oneAffine;
    this.b = this.tm.getBuff(pGb, F.n8);
    if (cofactor) {
      this.cofactor = toLEBuff(cofactor);
    }
    this.negone = this.neg(this.one);
    this.two = this.add(this.one, this.one);
    this.batchLEMtoC = buildBatchConvert(tm, prefix + "_batchLEMtoC", F.n8 * 2, F.n8);
    this.batchLEMtoU = buildBatchConvert(tm, prefix + "_batchLEMtoU", F.n8 * 2, F.n8 * 2);
    this.batchCtoLEM = buildBatchConvert(tm, prefix + "_batchCtoLEM", F.n8, F.n8 * 2);
    this.batchUtoLEM = buildBatchConvert(tm, prefix + "_batchUtoLEM", F.n8 * 2, F.n8 * 2);
    this.batchToJacobian = buildBatchConvert(tm, prefix + "_batchToJacobian", F.n8 * 2, F.n8 * 3);
    this.batchToAffine = buildBatchConvert(tm, prefix + "_batchToAffine", F.n8 * 3, F.n8 * 2);
  }
  op2(opName, a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.F.n8 * 3);
  }
  op2bool(opName, a, b) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, b);
    return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2, this.pOp3);
  }
  op1(opName, a) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.F.n8 * 3);
  }
  op1Affine(opName, a) {
    this.tm.setBuff(this.pOp1, a);
    this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.F.n8 * 2);
  }
  op1Bool(opName, a) {
    this.tm.setBuff(this.pOp1, a);
    return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
  }
  add(a, b) {
    if (a.byteLength == this.F.n8 * 3) {
      if (b.byteLength == this.F.n8 * 3) {
        return this.op2("_add", a, b);
      } else if (b.byteLength == this.F.n8 * 2) {
        return this.op2("_addMixed", a, b);
      } else {
        throw new Error("invalid point size");
      }
    } else if (a.byteLength == this.F.n8 * 2) {
      if (b.byteLength == this.F.n8 * 3) {
        return this.op2("_addMixed", b, a);
      } else if (b.byteLength == this.F.n8 * 2) {
        return this.op2("_addAffine", a, b);
      } else {
        throw new Error("invalid point size");
      }
    } else {
      throw new Error("invalid point size");
    }
  }
  sub(a, b) {
    if (a.byteLength == this.F.n8 * 3) {
      if (b.byteLength == this.F.n8 * 3) {
        return this.op2("_sub", a, b);
      } else if (b.byteLength == this.F.n8 * 2) {
        return this.op2("_subMixed", a, b);
      } else {
        throw new Error("invalid point size");
      }
    } else if (a.byteLength == this.F.n8 * 2) {
      if (b.byteLength == this.F.n8 * 3) {
        return this.op2("_subMixed", b, a);
      } else if (b.byteLength == this.F.n8 * 2) {
        return this.op2("_subAffine", a, b);
      } else {
        throw new Error("invalid point size");
      }
    } else {
      throw new Error("invalid point size");
    }
  }
  neg(a) {
    if (a.byteLength == this.F.n8 * 3) {
      return this.op1("_neg", a);
    } else if (a.byteLength == this.F.n8 * 2) {
      return this.op1Affine("_negAffine", a);
    } else {
      throw new Error("invalid point size");
    }
  }
  double(a) {
    if (a.byteLength == this.F.n8 * 3) {
      return this.op1("_double", a);
    } else if (a.byteLength == this.F.n8 * 2) {
      return this.op1("_doubleAffine", a);
    } else {
      throw new Error("invalid point size");
    }
  }
  isZero(a) {
    if (a.byteLength == this.F.n8 * 3) {
      return this.op1Bool("_isZero", a);
    } else if (a.byteLength == this.F.n8 * 2) {
      return this.op1Bool("_isZeroAffine", a);
    } else {
      throw new Error("invalid point size");
    }
  }
  timesScalar(a, s) {
    if (!(s instanceof Uint8Array)) {
      s = toLEBuff(e(s));
    }
    let fnName;
    if (a.byteLength == this.F.n8 * 3) {
      fnName = this.prefix + "_timesScalar";
    } else if (a.byteLength == this.F.n8 * 2) {
      fnName = this.prefix + "_timesScalarAffine";
    } else {
      throw new Error("invalid point size");
    }
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, s);
    this.tm.instance.exports[fnName](this.pOp1, this.pOp2, s.byteLength, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.F.n8 * 3);
  }
  timesFr(a, s) {
    let fnName;
    if (a.byteLength == this.F.n8 * 3) {
      fnName = this.prefix + "_timesFr";
    } else if (a.byteLength == this.F.n8 * 2) {
      fnName = this.prefix + "_timesFrAffine";
    } else {
      throw new Error("invalid point size");
    }
    this.tm.setBuff(this.pOp1, a);
    this.tm.setBuff(this.pOp2, s);
    this.tm.instance.exports[fnName](this.pOp1, this.pOp2, this.pOp3);
    return this.tm.getBuff(this.pOp3, this.F.n8 * 3);
  }
  eq(a, b) {
    if (a.byteLength == this.F.n8 * 3) {
      if (b.byteLength == this.F.n8 * 3) {
        return this.op2bool("_eq", a, b);
      } else if (b.byteLength == this.F.n8 * 2) {
        return this.op2bool("_eqMixed", a, b);
      } else {
        throw new Error("invalid point size");
      }
    } else if (a.byteLength == this.F.n8 * 2) {
      if (b.byteLength == this.F.n8 * 3) {
        return this.op2bool("_eqMixed", b, a);
      } else if (b.byteLength == this.F.n8 * 2) {
        return this.op2bool("_eqAffine", a, b);
      } else {
        throw new Error("invalid point size");
      }
    } else {
      throw new Error("invalid point size");
    }
  }
  toAffine(a) {
    if (a.byteLength == this.F.n8 * 3) {
      return this.op1Affine("_toAffine", a);
    } else if (a.byteLength == this.F.n8 * 2) {
      return a;
    } else {
      throw new Error("invalid point size");
    }
  }
  toJacobian(a) {
    if (a.byteLength == this.F.n8 * 3) {
      return a;
    } else if (a.byteLength == this.F.n8 * 2) {
      return this.op1("_toJacobian", a);
    } else {
      throw new Error("invalid point size");
    }
  }
  toRprUncompressed(arr, offset, a) {
    this.tm.setBuff(this.pOp1, a);
    if (a.byteLength == this.F.n8 * 3) {
      this.tm.instance.exports[this.prefix + "_toAffine"](this.pOp1, this.pOp1);
    } else if (a.byteLength != this.F.n8 * 2) {
      throw new Error("invalid point size");
    }
    this.tm.instance.exports[this.prefix + "_LEMtoU"](this.pOp1, this.pOp1);
    const res = this.tm.getBuff(this.pOp1, this.F.n8 * 2);
    arr.set(res, offset);
  }
  fromRprUncompressed(arr, offset) {
    const buff = arr.slice(offset, offset + this.F.n8 * 2);
    this.tm.setBuff(this.pOp1, buff);
    this.tm.instance.exports[this.prefix + "_UtoLEM"](this.pOp1, this.pOp1);
    return this.tm.getBuff(this.pOp1, this.F.n8 * 2);
  }
  toRprCompressed(arr, offset, a) {
    this.tm.setBuff(this.pOp1, a);
    if (a.byteLength == this.F.n8 * 3) {
      this.tm.instance.exports[this.prefix + "_toAffine"](this.pOp1, this.pOp1);
    } else if (a.byteLength != this.F.n8 * 2) {
      throw new Error("invalid point size");
    }
    this.tm.instance.exports[this.prefix + "_LEMtoC"](this.pOp1, this.pOp1);
    const res = this.tm.getBuff(this.pOp1, this.F.n8);
    arr.set(res, offset);
  }
  fromRprCompressed(arr, offset) {
    const buff = arr.slice(offset, offset + this.F.n8);
    this.tm.setBuff(this.pOp1, buff);
    this.tm.instance.exports[this.prefix + "_CtoLEM"](this.pOp1, this.pOp2);
    return this.tm.getBuff(this.pOp2, this.F.n8 * 2);
  }
  toUncompressed(a) {
    const buff = new Uint8Array(this.F.n8 * 2);
    this.toRprUncompressed(buff, 0, a);
    return buff;
  }
  toRprLEM(arr, offset, a) {
    if (a.byteLength == this.F.n8 * 2) {
      arr.set(a, offset);
      return;
    } else if (a.byteLength == this.F.n8 * 3) {
      this.tm.setBuff(this.pOp1, a);
      this.tm.instance.exports[this.prefix + "_toAffine"](this.pOp1, this.pOp1);
      const res = this.tm.getBuff(this.pOp1, this.F.n8 * 2);
      arr.set(res, offset);
    } else {
      throw new Error("invalid point size");
    }
  }
  fromRprLEM(arr, offset) {
    offset = offset || 0;
    return arr.slice(offset, offset + this.F.n8 * 2);
  }
  toString(a, radix) {
    if (a.byteLength == this.F.n8 * 3) {
      const x = this.F.toString(a.slice(0, this.F.n8), radix);
      const y = this.F.toString(a.slice(this.F.n8, this.F.n8 * 2), radix);
      const z = this.F.toString(a.slice(this.F.n8 * 2), radix);
      return `[ ${x}, ${y}, ${z} ]`;
    } else if (a.byteLength == this.F.n8 * 2) {
      const x = this.F.toString(a.slice(0, this.F.n8), radix);
      const y = this.F.toString(a.slice(this.F.n8), radix);
      return `[ ${x}, ${y} ]`;
    } else {
      throw new Error("invalid point size");
    }
  }
  isValid(a) {
    if (this.isZero(a)) return true;
    const F = this.F;
    const aa = this.toAffine(a);
    const x = aa.slice(0, this.F.n8);
    const y = aa.slice(this.F.n8, this.F.n8 * 2);
    const x3b = F.add(F.mul(F.square(x), x), this.b);
    const y2 = F.square(y);
    return F.eq(x3b, y2);
  }
  fromRng(rng) {
    const F = this.F;
    let P = [];
    let greatest;
    let x3b;
    do {
      P[0] = F.fromRng(rng);
      greatest = rng.nextBool();
      x3b = F.add(F.mul(F.square(P[0]), P[0]), this.b);
    } while (!F.isSquare(x3b));
    P[1] = F.sqrt(x3b);
    const s = F.isNegative(P[1]);
    if (greatest ^ s) P[1] = F.neg(P[1]);
    let Pbuff = new Uint8Array(this.F.n8 * 2);
    Pbuff.set(P[0]);
    Pbuff.set(P[1], this.F.n8);
    if (this.cofactor) {
      Pbuff = this.timesScalar(Pbuff, this.cofactor);
    }
    return Pbuff;
  }
  toObject(a) {
    if (this.isZero(a)) {
      return [
        this.F.toObject(this.F.zero),
        this.F.toObject(this.F.one),
        this.F.toObject(this.F.zero)
      ];
    }
    const x = this.F.toObject(a.slice(0, this.F.n8));
    const y = this.F.toObject(a.slice(this.F.n8, this.F.n8 * 2));
    let z;
    if (a.byteLength == this.F.n8 * 3) {
      z = this.F.toObject(a.slice(this.F.n8 * 2, this.F.n8 * 3));
    } else {
      z = this.F.toObject(this.F.one);
    }
    return [x, y, z];
  }
  fromObject(a) {
    const x = this.F.fromObject(a[0]);
    const y = this.F.fromObject(a[1]);
    let z;
    if (a.length == 3) {
      z = this.F.fromObject(a[2]);
    } else {
      z = this.F.one;
    }
    if (this.F.isZero(z, this.F.one)) {
      return this.zeroAffine;
    } else if (this.F.eq(z, this.F.one)) {
      const buff = new Uint8Array(this.F.n8 * 2);
      buff.set(x);
      buff.set(y, this.F.n8);
      return buff;
    } else {
      const buff = new Uint8Array(this.F.n8 * 3);
      buff.set(x);
      buff.set(y, this.F.n8);
      buff.set(z, this.F.n8 * 2);
      return buff;
    }
  }
  e(a) {
    if (a instanceof Uint8Array) return a;
    return this.fromObject(a);
  }
  x(a) {
    const tmp = this.toAffine(a);
    return tmp.slice(0, this.F.n8);
  }
  y(a) {
    const tmp = this.toAffine(a);
    return tmp.slice(this.F.n8);
  }
};
function thread(self) {
  const MAXMEM = 32767;
  let instance;
  let memory;
  if (self) {
    self.onmessage = function(e2) {
      let data;
      if (e2.data) {
        data = e2.data;
      } else {
        data = e2;
      }
      if (data[0].cmd == "INIT") {
        init(data[0]).then(function() {
          self.postMessage(data.result);
        });
      } else if (data[0].cmd == "TERMINATE") {
        self.close();
      } else {
        const res = runTask(data);
        self.postMessage(res);
      }
    };
  }
  async function init(data) {
    const code = new Uint8Array(data.code);
    const wasmModule = await WebAssembly.compile(code);
    memory = new WebAssembly.Memory({ initial: data.init, maximum: MAXMEM });
    instance = await WebAssembly.instantiate(wasmModule, {
      env: {
        "memory": memory
      }
    });
  }
  function alloc(length) {
    const u323 = new Uint32Array(memory.buffer, 0, 1);
    while (u323[0] & 3) u323[0]++;
    const res = u323[0];
    u323[0] += length;
    if (u323[0] + length > memory.buffer.byteLength) {
      const currentPages = memory.buffer.byteLength / 65536;
      let requiredPages = Math.floor((u323[0] + length) / 65536) + 1;
      if (requiredPages > MAXMEM) requiredPages = MAXMEM;
      memory.grow(requiredPages - currentPages);
    }
    return res;
  }
  function allocBuffer(buffer) {
    const p = alloc(buffer.byteLength);
    setBuffer(p, buffer);
    return p;
  }
  function getBuffer(pointer, length) {
    const u8 = new Uint8Array(memory.buffer);
    return new Uint8Array(u8.buffer, u8.byteOffset + pointer, length);
  }
  function setBuffer(pointer, buffer) {
    const u8 = new Uint8Array(memory.buffer);
    u8.set(new Uint8Array(buffer), pointer);
  }
  function runTask(task) {
    if (task[0].cmd == "INIT") {
      return init(task[0]);
    }
    const ctx = {
      vars: [],
      out: []
    };
    const u32a = new Uint32Array(memory.buffer, 0, 1);
    const oldAlloc = u32a[0];
    for (let i = 0; i < task.length; i++) {
      switch (task[i].cmd) {
        case "ALLOCSET":
          ctx.vars[task[i].var] = allocBuffer(task[i].buff);
          break;
        case "ALLOC":
          ctx.vars[task[i].var] = alloc(task[i].len);
          break;
        case "SET":
          setBuffer(ctx.vars[task[i].var], task[i].buff);
          break;
        case "CALL": {
          const params = [];
          for (let j = 0; j < task[i].params.length; j++) {
            const p = task[i].params[j];
            if (typeof p.var !== "undefined") {
              params.push(ctx.vars[p.var] + (p.offset || 0));
            } else if (typeof p.val != "undefined") {
              params.push(p.val);
            }
          }
          instance.exports[task[i].fnName](...params);
          break;
        }
        case "GET":
          ctx.out[task[i].out] = getBuffer(ctx.vars[task[i].var], task[i].len).slice();
          break;
        default:
          throw new Error("Invalid cmd");
      }
    }
    const u32b = new Uint32Array(memory.buffer, 0, 1);
    u32b[0] = oldAlloc;
    return ctx.out;
  }
  return runTask;
}
var MEM_SIZE = 25;
var Deferred = class {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var workerSource;
var threadStr = `(${'function thread(self) {\n    const MAXMEM = 32767;\n    let instance;\n    let memory;\n\n    if (self) {\n        self.onmessage = function(e) {\n            let data;\n            if (e.data) {\n                data = e.data;\n            } else {\n                data = e;\n            }\n\n            if (data[0].cmd == "INIT") {\n                init(data[0]).then(function() {\n                    self.postMessage(data.result);\n                });\n            } else if (data[0].cmd == "TERMINATE") {\n                self.close();\n            } else {\n                const res = runTask(data);\n                self.postMessage(res);\n            }\n        };\n    }\n\n    async function init(data) {\n        const code = new Uint8Array(data.code);\n        const wasmModule = await WebAssembly.compile(code);\n        memory = new WebAssembly.Memory({initial:data.init, maximum: MAXMEM});\n\n        instance = await WebAssembly.instantiate(wasmModule, {\n            env: {\n                "memory": memory\n            }\n        });\n    }\n\n\n\n    function alloc(length) {\n        const u32 = new Uint32Array(memory.buffer, 0, 1);\n        while (u32[0] & 3) u32[0]++;  // Return always aligned pointers\n        const res = u32[0];\n        u32[0] += length;\n        if (u32[0] + length > memory.buffer.byteLength) {\n            const currentPages = memory.buffer.byteLength / 0x10000;\n            let requiredPages = Math.floor((u32[0] + length) / 0x10000)+1;\n            if (requiredPages>MAXMEM) requiredPages=MAXMEM;\n            memory.grow(requiredPages-currentPages);\n        }\n        return res;\n    }\n\n    function allocBuffer(buffer) {\n        const p = alloc(buffer.byteLength);\n        setBuffer(p, buffer);\n        return p;\n    }\n\n    function getBuffer(pointer, length) {\n        const u8 = new Uint8Array(memory.buffer);\n        return new Uint8Array(u8.buffer, u8.byteOffset + pointer, length);\n    }\n\n    function setBuffer(pointer, buffer) {\n        const u8 = new Uint8Array(memory.buffer);\n        u8.set(new Uint8Array(buffer), pointer);\n    }\n\n    function runTask(task) {\n        if (task[0].cmd == "INIT") {\n            return init(task[0]);\n        }\n        const ctx = {\n            vars: [],\n            out: []\n        };\n        const u32a = new Uint32Array(memory.buffer, 0, 1);\n        const oldAlloc = u32a[0];\n        for (let i=0; i<task.length; i++) {\n            switch (task[i].cmd) {\n            case "ALLOCSET":\n                ctx.vars[task[i].var] = allocBuffer(task[i].buff);\n                break;\n            case "ALLOC":\n                ctx.vars[task[i].var] = alloc(task[i].len);\n                break;\n            case "SET":\n                setBuffer(ctx.vars[task[i].var], task[i].buff);\n                break;\n            case "CALL": {\n                const params = [];\n                for (let j=0; j<task[i].params.length; j++) {\n                    const p = task[i].params[j];\n                    if (typeof p.var !== "undefined") {\n                        params.push(ctx.vars[p.var] + (p.offset || 0));\n                    } else if (typeof p.val != "undefined") {\n                        params.push(p.val);\n                    }\n                }\n                instance.exports[task[i].fnName](...params);\n                break;\n            }\n            case "GET":\n                ctx.out[task[i].out] = getBuffer(ctx.vars[task[i].var], task[i].len).slice();\n                break;\n            default:\n                throw new Error("Invalid cmd");\n            }\n        }\n        const u32b = new Uint32Array(memory.buffer, 0, 1);\n        u32b[0] = oldAlloc;\n        return ctx.out;\n    }\n\n\n    return runTask;\n}'})(self)`;
{
  if (globalThis?.Blob) {
    const threadBytes = new TextEncoder().encode(threadStr);
    const workerBlob = new Blob([threadBytes], { type: "application/javascript" });
    workerSource = URL.createObjectURL(workerBlob);
  } else {
    workerSource = "data:application/javascript;base64," + globalThis.btoa(threadStr);
  }
}
async function buildThreadManager(wasm, singleThread) {
  const tm = new ThreadManager();
  tm.memory = new WebAssembly.Memory({ initial: MEM_SIZE });
  tm.u8 = new Uint8Array(tm.memory.buffer);
  tm.u32 = new Uint32Array(tm.memory.buffer);
  const wasmModule = await WebAssembly.compile(wasm.code);
  tm.instance = await WebAssembly.instantiate(wasmModule, {
    env: {
      "memory": tm.memory
    }
  });
  if (!globalThis?.Worker) {
    singleThread = true;
  }
  tm.singleThread = singleThread;
  tm.initalPFree = tm.u32[0];
  tm.pq = wasm.pq;
  tm.pr = wasm.pr;
  tm.pG1gen = wasm.pG1gen;
  tm.pG1zero = wasm.pG1zero;
  tm.pG2gen = wasm.pG2gen;
  tm.pG2zero = wasm.pG2zero;
  tm.pOneT = wasm.pOneT;
  if (singleThread) {
    tm.code = wasm.code;
    tm.taskManager = thread();
    await tm.taskManager([{
      cmd: "INIT",
      init: MEM_SIZE,
      code: tm.code.slice()
    }]);
    tm.concurrency = 1;
  } else {
    tm.workers = [];
    tm.pendingDeferreds = [];
    tm.working = [];
    let concurrency = 2;
    {
      if (typeof navigator === "object" && navigator.hardwareConcurrency) {
        concurrency = navigator.hardwareConcurrency;
      }
    }
    if (concurrency == 0) {
      concurrency = 2;
    }
    if (concurrency > 64) concurrency = 64;
    tm.concurrency = concurrency;
    for (let i = 0; i < concurrency; i++) {
      tm.workers[i] = new Worker(workerSource);
      tm.workers[i].addEventListener("message", getOnMsg(i));
      tm.working[i] = false;
    }
    const initPromises = [];
    for (let i = 0; i < tm.workers.length; i++) {
      const copyCode = wasm.code.slice();
      initPromises.push(tm.postAction(i, [{
        cmd: "INIT",
        init: MEM_SIZE,
        code: copyCode
      }], [copyCode.buffer]));
    }
    await Promise.all(initPromises);
  }
  return tm;
  function getOnMsg(i) {
    return function(e2) {
      let data;
      if (e2 && e2.data) {
        data = e2.data;
      } else {
        data = e2;
      }
      tm.working[i] = false;
      tm.pendingDeferreds[i].resolve(data);
      tm.processWorks();
    };
  }
}
var ThreadManager = class {
  constructor() {
    this.actionQueue = [];
    this.oldPFree = 0;
  }
  startSyncOp() {
    if (this.oldPFree != 0) throw new Error("Sync operation in progress");
    this.oldPFree = this.u32[0];
  }
  endSyncOp() {
    if (this.oldPFree == 0) throw new Error("No sync operation in progress");
    this.u32[0] = this.oldPFree;
    this.oldPFree = 0;
  }
  postAction(workerId, e2, transfers, _deferred) {
    if (this.working[workerId]) {
      throw new Error("Posting a job t a working worker");
    }
    this.working[workerId] = true;
    this.pendingDeferreds[workerId] = _deferred ? _deferred : new Deferred();
    this.workers[workerId].postMessage(e2, transfers);
    return this.pendingDeferreds[workerId].promise;
  }
  processWorks() {
    for (let i = 0; i < this.workers.length && this.actionQueue.length > 0; i++) {
      if (this.working[i] == false) {
        const work = this.actionQueue.shift();
        this.postAction(i, work.data, work.transfers, work.deferred);
      }
    }
  }
  queueAction(actionData, transfers) {
    const d = new Deferred();
    if (this.singleThread) {
      const res = this.taskManager(actionData);
      d.resolve(res);
    } else {
      this.actionQueue.push({
        data: actionData,
        transfers,
        deferred: d
      });
      this.processWorks();
    }
    return d.promise;
  }
  resetMemory() {
    this.u32[0] = this.initalPFree;
  }
  allocBuff(buff) {
    const pointer = this.alloc(buff.byteLength);
    this.setBuff(pointer, buff);
    return pointer;
  }
  getBuff(pointer, length) {
    return this.u8.slice(pointer, pointer + length);
  }
  setBuff(pointer, buffer) {
    this.u8.set(new Uint8Array(buffer), pointer);
  }
  alloc(length) {
    while (this.u32[0] & 3) this.u32[0]++;
    const res = this.u32[0];
    this.u32[0] += length;
    return res;
  }
  async terminate() {
    for (let i = 0; i < this.workers.length; i++) {
      this.workers[i].postMessage([{ cmd: "TERMINATE" }]);
    }
    await sleep(200);
  }
};
function buildBatchApplyKey(curve2, groupName) {
  const G = curve2[groupName];
  const Fr = curve2.Fr;
  const tm = curve2.tm;
  curve2[groupName].batchApplyKey = async function(buff, first, inc, inType, outType) {
    inType = inType || "affine";
    outType = outType || "affine";
    let fnName, fnAffine;
    let sGin, sGmid, sGout;
    if (groupName == "G1") {
      if (inType == "jacobian") {
        sGin = G.F.n8 * 3;
        fnName = "g1m_batchApplyKey";
      } else {
        sGin = G.F.n8 * 2;
        fnName = "g1m_batchApplyKeyMixed";
      }
      sGmid = G.F.n8 * 3;
      if (outType == "jacobian") {
        sGout = G.F.n8 * 3;
      } else {
        fnAffine = "g1m_batchToAffine";
        sGout = G.F.n8 * 2;
      }
    } else if (groupName == "G2") {
      if (inType == "jacobian") {
        sGin = G.F.n8 * 3;
        fnName = "g2m_batchApplyKey";
      } else {
        sGin = G.F.n8 * 2;
        fnName = "g2m_batchApplyKeyMixed";
      }
      sGmid = G.F.n8 * 3;
      if (outType == "jacobian") {
        sGout = G.F.n8 * 3;
      } else {
        fnAffine = "g2m_batchToAffine";
        sGout = G.F.n8 * 2;
      }
    } else if (groupName == "Fr") {
      fnName = "frm_batchApplyKey";
      sGin = G.n8;
      sGmid = G.n8;
      sGout = G.n8;
    } else {
      throw new Error("Invalid group: " + groupName);
    }
    const nPoints = Math.floor(buff.byteLength / sGin);
    const pointsPerChunk = Math.floor(nPoints / tm.concurrency);
    const opPromises = [];
    inc = Fr.e(inc);
    let t = Fr.e(first);
    for (let i = 0; i < tm.concurrency; i++) {
      let n;
      if (i < tm.concurrency - 1) {
        n = pointsPerChunk;
      } else {
        n = nPoints - i * pointsPerChunk;
      }
      if (n == 0) continue;
      const task = [];
      task.push({
        cmd: "ALLOCSET",
        var: 0,
        buff: buff.slice(i * pointsPerChunk * sGin, i * pointsPerChunk * sGin + n * sGin)
      });
      task.push({ cmd: "ALLOCSET", var: 1, buff: t });
      task.push({ cmd: "ALLOCSET", var: 2, buff: inc });
      task.push({ cmd: "ALLOC", var: 3, len: n * Math.max(sGmid, sGout) });
      task.push({
        cmd: "CALL",
        fnName,
        params: [
          { var: 0 },
          { val: n },
          { var: 1 },
          { var: 2 },
          { var: 3 }
        ]
      });
      if (fnAffine) {
        task.push({
          cmd: "CALL",
          fnName: fnAffine,
          params: [
            { var: 3 },
            { val: n },
            { var: 3 }
          ]
        });
      }
      task.push({ cmd: "GET", out: 0, var: 3, len: n * sGout });
      opPromises.push(tm.queueAction(task));
      t = Fr.mul(t, Fr.exp(inc, n));
    }
    const result = await Promise.all(opPromises);
    let outBuff;
    if (buff instanceof BigBuffer) {
      outBuff = new BigBuffer(nPoints * sGout);
    } else {
      outBuff = new Uint8Array(nPoints * sGout);
    }
    let p = 0;
    for (let i = 0; i < result.length; i++) {
      outBuff.set(result[i][0], p);
      p += result[i][0].byteLength;
    }
    return outBuff;
  };
}
function buildPairing(curve2) {
  const tm = curve2.tm;
  curve2.pairing = function pairing(a, b) {
    tm.startSyncOp();
    const pA = tm.allocBuff(curve2.G1.toJacobian(a));
    const pB = tm.allocBuff(curve2.G2.toJacobian(b));
    const pRes = tm.alloc(curve2.Gt.n8);
    tm.instance.exports[curve2.name + "_pairing"](pA, pB, pRes);
    const res = tm.getBuff(pRes, curve2.Gt.n8);
    tm.endSyncOp();
    return res;
  };
  curve2.pairingEq = async function pairingEq() {
    let buffCt;
    let nEqs;
    if (arguments.length % 2 == 1) {
      buffCt = arguments[arguments.length - 1];
      nEqs = (arguments.length - 1) / 2;
    } else {
      buffCt = curve2.Gt.one;
      nEqs = arguments.length / 2;
    }
    const opPromises = [];
    for (let i = 0; i < nEqs; i++) {
      const task = [];
      const g1Buff = curve2.G1.toJacobian(arguments[i * 2]);
      task.push({ cmd: "ALLOCSET", var: 0, buff: g1Buff });
      task.push({ cmd: "ALLOC", var: 1, len: curve2.prePSize });
      const g2Buff = curve2.G2.toJacobian(arguments[i * 2 + 1]);
      task.push({ cmd: "ALLOCSET", var: 2, buff: g2Buff });
      task.push({ cmd: "ALLOC", var: 3, len: curve2.preQSize });
      task.push({ cmd: "ALLOC", var: 4, len: curve2.Gt.n8 });
      task.push({ cmd: "CALL", fnName: curve2.name + "_prepareG1", params: [
        { var: 0 },
        { var: 1 }
      ] });
      task.push({ cmd: "CALL", fnName: curve2.name + "_prepareG2", params: [
        { var: 2 },
        { var: 3 }
      ] });
      task.push({ cmd: "CALL", fnName: curve2.name + "_millerLoop", params: [
        { var: 1 },
        { var: 3 },
        { var: 4 }
      ] });
      task.push({ cmd: "GET", out: 0, var: 4, len: curve2.Gt.n8 });
      opPromises.push(
        tm.queueAction(task)
      );
    }
    const result = await Promise.all(opPromises);
    tm.startSyncOp();
    const pRes = tm.alloc(curve2.Gt.n8);
    tm.instance.exports.ftm_one(pRes);
    for (let i = 0; i < result.length; i++) {
      const pMR = tm.allocBuff(result[i][0]);
      tm.instance.exports.ftm_mul(pRes, pMR, pRes);
    }
    tm.instance.exports[curve2.name + "_finalExponentiation"](pRes, pRes);
    const pCt = tm.allocBuff(buffCt);
    const r = !!tm.instance.exports.ftm_eq(pRes, pCt);
    tm.endSyncOp();
    return r;
  };
  curve2.prepareG1 = function(p) {
    this.tm.startSyncOp();
    const pP = this.tm.allocBuff(p);
    const pPrepP = this.tm.alloc(this.prePSize);
    this.tm.instance.exports[this.name + "_prepareG1"](pP, pPrepP);
    const res = this.tm.getBuff(pPrepP, this.prePSize);
    this.tm.endSyncOp();
    return res;
  };
  curve2.prepareG2 = function(q) {
    this.tm.startSyncOp();
    const pQ = this.tm.allocBuff(q);
    const pPrepQ = this.tm.alloc(this.preQSize);
    this.tm.instance.exports[this.name + "_prepareG2"](pQ, pPrepQ);
    const res = this.tm.getBuff(pPrepQ, this.preQSize);
    this.tm.endSyncOp();
    return res;
  };
  curve2.millerLoop = function(preP, preQ) {
    this.tm.startSyncOp();
    const pPreP = this.tm.allocBuff(preP);
    const pPreQ = this.tm.allocBuff(preQ);
    const pRes = this.tm.alloc(this.Gt.n8);
    this.tm.instance.exports[this.name + "_millerLoop"](pPreP, pPreQ, pRes);
    const res = this.tm.getBuff(pRes, this.Gt.n8);
    this.tm.endSyncOp();
    return res;
  };
  curve2.finalExponentiation = function(a) {
    this.tm.startSyncOp();
    const pA = this.tm.allocBuff(a);
    const pRes = this.tm.alloc(this.Gt.n8);
    this.tm.instance.exports[this.name + "_finalExponentiation"](pA, pRes);
    const res = this.tm.getBuff(pRes, this.Gt.n8);
    this.tm.endSyncOp();
    return res;
  };
}
var pTSizes = [
  1,
  1,
  1,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  13,
  14,
  15,
  16,
  16,
  17,
  17,
  17,
  17,
  17,
  17,
  17,
  17,
  17,
  17
];
function buildMultiexp2(curve2, groupName) {
  const G = curve2[groupName];
  const tm = G.tm;
  async function _multiExpChunk(buffBases, buffScalars, inType, logger, logText) {
    if (!(buffBases instanceof Uint8Array)) {
      if (logger) logger.error(`${logText} _multiExpChunk buffBases is not Uint8Array`);
      throw new Error(`${logText} _multiExpChunk buffBases is not Uint8Array`);
    }
    if (!(buffScalars instanceof Uint8Array)) {
      if (logger) logger.error(`${logText} _multiExpChunk buffScalars is not Uint8Array`);
      throw new Error(`${logText} _multiExpChunk buffScalars is not Uint8Array`);
    }
    inType = inType || "affine";
    let sGIn;
    let fnName;
    if (groupName == "G1") {
      if (inType == "affine") {
        fnName = "g1m_multiexpAffine_chunk";
        sGIn = G.F.n8 * 2;
      } else {
        fnName = "g1m_multiexp_chunk";
        sGIn = G.F.n8 * 3;
      }
    } else if (groupName == "G2") {
      if (inType == "affine") {
        fnName = "g2m_multiexpAffine_chunk";
        sGIn = G.F.n8 * 2;
      } else {
        fnName = "g2m_multiexp_chunk";
        sGIn = G.F.n8 * 3;
      }
    } else {
      throw new Error("Invalid group");
    }
    const nPoints = Math.floor(buffBases.byteLength / sGIn);
    if (nPoints == 0) return G.zero;
    const sScalar = Math.floor(buffScalars.byteLength / nPoints);
    if (sScalar * nPoints != buffScalars.byteLength) {
      throw new Error("Scalar size does not match");
    }
    const bitChunkSize = pTSizes[log2(nPoints)];
    const nChunks = Math.floor((sScalar * 8 - 1) / bitChunkSize) + 1;
    const opPromises = [];
    for (let i = 0; i < nChunks; i++) {
      const task = [
        { cmd: "ALLOCSET", var: 0, buff: buffBases },
        { cmd: "ALLOCSET", var: 1, buff: buffScalars },
        { cmd: "ALLOC", var: 2, len: G.F.n8 * 3 },
        { cmd: "CALL", fnName, params: [
          { var: 0 },
          { var: 1 },
          { val: sScalar },
          { val: nPoints },
          { val: i * bitChunkSize },
          { val: Math.min(sScalar * 8 - i * bitChunkSize, bitChunkSize) },
          { var: 2 }
        ] },
        { cmd: "GET", out: 0, var: 2, len: G.F.n8 * 3 }
      ];
      opPromises.push(
        G.tm.queueAction(task)
      );
    }
    const result = await Promise.all(opPromises);
    let res = G.zero;
    for (let i = result.length - 1; i >= 0; i--) {
      if (!G.isZero(res)) {
        for (let j = 0; j < bitChunkSize; j++) res = G.double(res);
      }
      res = G.add(res, result[i][0]);
    }
    return res;
  }
  async function _multiExp(buffBases, buffScalars, inType, logger, logText) {
    const MAX_CHUNK_SIZE = 1 << 22;
    const MIN_CHUNK_SIZE = 1 << 10;
    let sGIn;
    if (groupName == "G1") {
      if (inType == "affine") {
        sGIn = G.F.n8 * 2;
      } else {
        sGIn = G.F.n8 * 3;
      }
    } else if (groupName == "G2") {
      if (inType == "affine") {
        sGIn = G.F.n8 * 2;
      } else {
        sGIn = G.F.n8 * 3;
      }
    } else {
      throw new Error("Invalid group");
    }
    const nPoints = Math.floor(buffBases.byteLength / sGIn);
    if (nPoints == 0) return G.zero;
    const sScalar = Math.floor(buffScalars.byteLength / nPoints);
    if (sScalar * nPoints != buffScalars.byteLength) {
      throw new Error("Scalar size does not match");
    }
    const bitChunkSize = pTSizes[log2(nPoints)];
    const nChunks = Math.floor((sScalar * 8 - 1) / bitChunkSize) + 1;
    let chunkSize;
    chunkSize = Math.floor(nPoints / (tm.concurrency / nChunks));
    if (chunkSize > MAX_CHUNK_SIZE) chunkSize = MAX_CHUNK_SIZE;
    if (chunkSize < MIN_CHUNK_SIZE) chunkSize = MIN_CHUNK_SIZE;
    const opPromises = [];
    for (let i = 0; i < nPoints; i += chunkSize) {
      if (logger) logger.debug(`Multiexp start: ${logText}: ${i}/${nPoints}`);
      const n = Math.min(nPoints - i, chunkSize);
      const buffBasesChunk = buffBases.slice(i * sGIn, (i + n) * sGIn);
      const buffScalarsChunk = buffScalars.slice(i * sScalar, (i + n) * sScalar);
      opPromises.push(_multiExpChunk(buffBasesChunk, buffScalarsChunk, inType, logger, logText).then((r) => {
        if (logger) logger.debug(`Multiexp end: ${logText}: ${i}/${nPoints}`);
        return r;
      }));
    }
    const result = await Promise.all(opPromises);
    let res = G.zero;
    for (let i = result.length - 1; i >= 0; i--) {
      res = G.add(res, result[i]);
    }
    return res;
  }
  G.multiExp = async function multiExpAffine(buffBases, buffScalars, logger, logText) {
    return await _multiExp(buffBases, buffScalars, "jacobian", logger, logText);
  };
  G.multiExpAffine = async function multiExpAffine(buffBases, buffScalars, logger, logText) {
    return await _multiExp(buffBases, buffScalars, "affine", logger, logText);
  };
}
function buildFFT2(curve2, groupName) {
  const G = curve2[groupName];
  const Fr = curve2.Fr;
  const tm = G.tm;
  async function _fft(buff, inverse, inType, outType, logger, loggerTxt) {
    inType = inType || "affine";
    outType = outType || "affine";
    const MAX_BITS_THREAD = 14;
    let sIn, sMid, sOut, fnIn2Mid, fnMid2Out, fnFFTMix, fnFFTJoin, fnFFTFinal;
    if (groupName == "G1") {
      if (inType == "affine") {
        sIn = G.F.n8 * 2;
        fnIn2Mid = "g1m_batchToJacobian";
      } else {
        sIn = G.F.n8 * 3;
      }
      sMid = G.F.n8 * 3;
      if (inverse) {
        fnFFTFinal = "g1m_fftFinal";
      }
      fnFFTJoin = "g1m_fftJoin";
      fnFFTMix = "g1m_fftMix";
      if (outType == "affine") {
        sOut = G.F.n8 * 2;
        fnMid2Out = "g1m_batchToAffine";
      } else {
        sOut = G.F.n8 * 3;
      }
    } else if (groupName == "G2") {
      if (inType == "affine") {
        sIn = G.F.n8 * 2;
        fnIn2Mid = "g2m_batchToJacobian";
      } else {
        sIn = G.F.n8 * 3;
      }
      sMid = G.F.n8 * 3;
      if (inverse) {
        fnFFTFinal = "g2m_fftFinal";
      }
      fnFFTJoin = "g2m_fftJoin";
      fnFFTMix = "g2m_fftMix";
      if (outType == "affine") {
        sOut = G.F.n8 * 2;
        fnMid2Out = "g2m_batchToAffine";
      } else {
        sOut = G.F.n8 * 3;
      }
    } else if (groupName == "Fr") {
      sIn = G.n8;
      sMid = G.n8;
      sOut = G.n8;
      if (inverse) {
        fnFFTFinal = "frm_fftFinal";
      }
      fnFFTMix = "frm_fftMix";
      fnFFTJoin = "frm_fftJoin";
    }
    let returnArray = false;
    if (Array.isArray(buff)) {
      buff = array2buffer(buff, sIn);
      returnArray = true;
    } else {
      buff = buff.slice(0, buff.byteLength);
    }
    const nPoints = buff.byteLength / sIn;
    const bits2 = log2(nPoints);
    if (1 << bits2 != nPoints) {
      throw new Error("fft must be multiple of 2");
    }
    if (bits2 == Fr.s + 1) {
      let buffOut2;
      if (inverse) {
        buffOut2 = await _fftExtInv(buff, inType, outType, logger, loggerTxt);
      } else {
        buffOut2 = await _fftExt(buff, inType, outType, logger, loggerTxt);
      }
      if (returnArray) {
        return buffer2array(buffOut2, sOut);
      } else {
        return buffOut2;
      }
    }
    let inv;
    if (inverse) {
      inv = Fr.inv(Fr.e(nPoints));
    }
    let buffOut;
    buffReverseBits(buff, sIn);
    let chunks;
    let pointsInChunk = Math.min(1 << MAX_BITS_THREAD, nPoints);
    let nChunks = nPoints / pointsInChunk;
    while (nChunks < tm.concurrency && pointsInChunk >= 16) {
      nChunks *= 2;
      pointsInChunk /= 2;
    }
    const l2Chunk = log2(pointsInChunk);
    const promises = [];
    for (let i = 0; i < nChunks; i++) {
      if (logger) logger.debug(`${loggerTxt}: fft ${bits2} mix start: ${i}/${nChunks}`);
      const task = [];
      task.push({ cmd: "ALLOC", var: 0, len: sMid * pointsInChunk });
      const buffChunk = buff.slice(pointsInChunk * i * sIn, pointsInChunk * (i + 1) * sIn);
      task.push({ cmd: "SET", var: 0, buff: buffChunk });
      if (fnIn2Mid) {
        task.push({ cmd: "CALL", fnName: fnIn2Mid, params: [{ var: 0 }, { val: pointsInChunk }, { var: 0 }] });
      }
      for (let j = 1; j <= l2Chunk; j++) {
        task.push({ cmd: "CALL", fnName: fnFFTMix, params: [{ var: 0 }, { val: pointsInChunk }, { val: j }] });
      }
      if (l2Chunk == bits2) {
        if (fnFFTFinal) {
          task.push({ cmd: "ALLOCSET", var: 1, buff: inv });
          task.push({ cmd: "CALL", fnName: fnFFTFinal, params: [
            { var: 0 },
            { val: pointsInChunk },
            { var: 1 }
          ] });
        }
        if (fnMid2Out) {
          task.push({ cmd: "CALL", fnName: fnMid2Out, params: [{ var: 0 }, { val: pointsInChunk }, { var: 0 }] });
        }
        task.push({ cmd: "GET", out: 0, var: 0, len: pointsInChunk * sOut });
      } else {
        task.push({ cmd: "GET", out: 0, var: 0, len: sMid * pointsInChunk });
      }
      promises.push(tm.queueAction(task).then((r) => {
        if (logger) logger.debug(`${loggerTxt}: fft ${bits2} mix end: ${i}/${nChunks}`);
        return r;
      }));
    }
    chunks = await Promise.all(promises);
    for (let i = 0; i < nChunks; i++) chunks[i] = chunks[i][0];
    for (let i = l2Chunk + 1; i <= bits2; i++) {
      if (logger) logger.debug(`${loggerTxt}: fft  ${bits2}  join: ${i}/${bits2}`);
      const nGroups = 1 << bits2 - i;
      const nChunksPerGroup = nChunks / nGroups;
      const opPromises = [];
      for (let j = 0; j < nGroups; j++) {
        for (let k = 0; k < nChunksPerGroup / 2; k++) {
          const first = Fr.exp(Fr.w[i], k * pointsInChunk);
          const inc = Fr.w[i];
          const o1 = j * nChunksPerGroup + k;
          const o2 = j * nChunksPerGroup + k + nChunksPerGroup / 2;
          const task = [];
          task.push({ cmd: "ALLOCSET", var: 0, buff: chunks[o1] });
          task.push({ cmd: "ALLOCSET", var: 1, buff: chunks[o2] });
          task.push({ cmd: "ALLOCSET", var: 2, buff: first });
          task.push({ cmd: "ALLOCSET", var: 3, buff: inc });
          task.push({ cmd: "CALL", fnName: fnFFTJoin, params: [
            { var: 0 },
            { var: 1 },
            { val: pointsInChunk },
            { var: 2 },
            { var: 3 }
          ] });
          if (i == bits2) {
            if (fnFFTFinal) {
              task.push({ cmd: "ALLOCSET", var: 4, buff: inv });
              task.push({ cmd: "CALL", fnName: fnFFTFinal, params: [
                { var: 0 },
                { val: pointsInChunk },
                { var: 4 }
              ] });
              task.push({ cmd: "CALL", fnName: fnFFTFinal, params: [
                { var: 1 },
                { val: pointsInChunk },
                { var: 4 }
              ] });
            }
            if (fnMid2Out) {
              task.push({ cmd: "CALL", fnName: fnMid2Out, params: [{ var: 0 }, { val: pointsInChunk }, { var: 0 }] });
              task.push({ cmd: "CALL", fnName: fnMid2Out, params: [{ var: 1 }, { val: pointsInChunk }, { var: 1 }] });
            }
            task.push({ cmd: "GET", out: 0, var: 0, len: pointsInChunk * sOut });
            task.push({ cmd: "GET", out: 1, var: 1, len: pointsInChunk * sOut });
          } else {
            task.push({ cmd: "GET", out: 0, var: 0, len: pointsInChunk * sMid });
            task.push({ cmd: "GET", out: 1, var: 1, len: pointsInChunk * sMid });
          }
          opPromises.push(tm.queueAction(task).then((r) => {
            if (logger) logger.debug(`${loggerTxt}: fft ${bits2} join  ${i}/${bits2}  ${j + 1}/${nGroups} ${k}/${nChunksPerGroup / 2}`);
            return r;
          }));
        }
      }
      const res = await Promise.all(opPromises);
      for (let j = 0; j < nGroups; j++) {
        for (let k = 0; k < nChunksPerGroup / 2; k++) {
          const o1 = j * nChunksPerGroup + k;
          const o2 = j * nChunksPerGroup + k + nChunksPerGroup / 2;
          const resChunk = res.shift();
          chunks[o1] = resChunk[0];
          chunks[o2] = resChunk[1];
        }
      }
    }
    if (buff instanceof BigBuffer) {
      buffOut = new BigBuffer(nPoints * sOut);
    } else {
      buffOut = new Uint8Array(nPoints * sOut);
    }
    if (inverse) {
      buffOut.set(chunks[0].slice((pointsInChunk - 1) * sOut));
      let p = sOut;
      for (let i = nChunks - 1; i > 0; i--) {
        buffOut.set(chunks[i], p);
        p += pointsInChunk * sOut;
        delete chunks[i];
      }
      buffOut.set(chunks[0].slice(0, (pointsInChunk - 1) * sOut), p);
      delete chunks[0];
    } else {
      for (let i = 0; i < nChunks; i++) {
        buffOut.set(chunks[i], pointsInChunk * sOut * i);
        delete chunks[i];
      }
    }
    if (returnArray) {
      return buffer2array(buffOut, sOut);
    } else {
      return buffOut;
    }
  }
  async function _fftExt(buff, inType, outType, logger, loggerTxt) {
    let b1, b2;
    b1 = buff.slice(0, buff.byteLength / 2);
    b2 = buff.slice(buff.byteLength / 2, buff.byteLength);
    const promises = [];
    [b1, b2] = await _fftJoinExt(b1, b2, "fftJoinExt", Fr.one, Fr.shift, inType, "jacobian", logger, loggerTxt);
    promises.push(_fft(b1, false, "jacobian", outType, logger, loggerTxt));
    promises.push(_fft(b2, false, "jacobian", outType, logger, loggerTxt));
    const res1 = await Promise.all(promises);
    let buffOut;
    if (res1[0].byteLength > 1 << 28) {
      buffOut = new BigBuffer(res1[0].byteLength * 2);
    } else {
      buffOut = new Uint8Array(res1[0].byteLength * 2);
    }
    buffOut.set(res1[0]);
    buffOut.set(res1[1], res1[0].byteLength);
    return buffOut;
  }
  async function _fftExtInv(buff, inType, outType, logger, loggerTxt) {
    let b1, b2;
    b1 = buff.slice(0, buff.byteLength / 2);
    b2 = buff.slice(buff.byteLength / 2, buff.byteLength);
    const promises = [];
    promises.push(_fft(b1, true, inType, "jacobian", logger, loggerTxt));
    promises.push(_fft(b2, true, inType, "jacobian", logger, loggerTxt));
    [b1, b2] = await Promise.all(promises);
    const res1 = await _fftJoinExt(b1, b2, "fftJoinExtInv", Fr.one, Fr.shiftInv, "jacobian", outType, logger, loggerTxt);
    let buffOut;
    if (res1[0].byteLength > 1 << 28) {
      buffOut = new BigBuffer(res1[0].byteLength * 2);
    } else {
      buffOut = new Uint8Array(res1[0].byteLength * 2);
    }
    buffOut.set(res1[0]);
    buffOut.set(res1[1], res1[0].byteLength);
    return buffOut;
  }
  async function _fftJoinExt(buff1, buff2, fn, first, inc, inType, outType, logger, loggerTxt) {
    const MAX_CHUNK_SIZE = 1 << 16;
    const MIN_CHUNK_SIZE = 1 << 4;
    let fnName;
    let fnIn2Mid, fnMid2Out;
    let sOut, sIn, sMid;
    if (groupName == "G1") {
      if (inType == "affine") {
        sIn = G.F.n8 * 2;
        fnIn2Mid = "g1m_batchToJacobian";
      } else {
        sIn = G.F.n8 * 3;
      }
      sMid = G.F.n8 * 3;
      fnName = "g1m_" + fn;
      if (outType == "affine") {
        fnMid2Out = "g1m_batchToAffine";
        sOut = G.F.n8 * 2;
      } else {
        sOut = G.F.n8 * 3;
      }
    } else if (groupName == "G2") {
      if (inType == "affine") {
        sIn = G.F.n8 * 2;
        fnIn2Mid = "g2m_batchToJacobian";
      } else {
        sIn = G.F.n8 * 3;
      }
      fnName = "g2m_" + fn;
      sMid = G.F.n8 * 3;
      if (outType == "affine") {
        fnMid2Out = "g2m_batchToAffine";
        sOut = G.F.n8 * 2;
      } else {
        sOut = G.F.n8 * 3;
      }
    } else if (groupName == "Fr") {
      sIn = Fr.n8;
      sOut = Fr.n8;
      sMid = Fr.n8;
      fnName = "frm_" + fn;
    } else {
      throw new Error("Invalid group");
    }
    if (buff1.byteLength != buff2.byteLength) {
      throw new Error("Invalid buffer size");
    }
    const nPoints = Math.floor(buff1.byteLength / sIn);
    if (nPoints != 1 << log2(nPoints)) {
      throw new Error("Invalid number of points");
    }
    let chunkSize = Math.floor(nPoints / tm.concurrency);
    if (chunkSize < MIN_CHUNK_SIZE) chunkSize = MIN_CHUNK_SIZE;
    if (chunkSize > MAX_CHUNK_SIZE) chunkSize = MAX_CHUNK_SIZE;
    const opPromises = [];
    for (let i = 0; i < nPoints; i += chunkSize) {
      if (logger) logger.debug(`${loggerTxt}: fftJoinExt Start: ${i}/${nPoints}`);
      const n = Math.min(nPoints - i, chunkSize);
      const firstChunk = Fr.mul(first, Fr.exp(inc, i));
      const task = [];
      const b1 = buff1.slice(i * sIn, (i + n) * sIn);
      const b2 = buff2.slice(i * sIn, (i + n) * sIn);
      task.push({ cmd: "ALLOC", var: 0, len: sMid * n });
      task.push({ cmd: "SET", var: 0, buff: b1 });
      task.push({ cmd: "ALLOC", var: 1, len: sMid * n });
      task.push({ cmd: "SET", var: 1, buff: b2 });
      task.push({ cmd: "ALLOCSET", var: 2, buff: firstChunk });
      task.push({ cmd: "ALLOCSET", var: 3, buff: inc });
      if (fnIn2Mid) {
        task.push({ cmd: "CALL", fnName: fnIn2Mid, params: [{ var: 0 }, { val: n }, { var: 0 }] });
        task.push({ cmd: "CALL", fnName: fnIn2Mid, params: [{ var: 1 }, { val: n }, { var: 1 }] });
      }
      task.push({ cmd: "CALL", fnName, params: [
        { var: 0 },
        { var: 1 },
        { val: n },
        { var: 2 },
        { var: 3 },
        { val: Fr.s }
      ] });
      if (fnMid2Out) {
        task.push({ cmd: "CALL", fnName: fnMid2Out, params: [{ var: 0 }, { val: n }, { var: 0 }] });
        task.push({ cmd: "CALL", fnName: fnMid2Out, params: [{ var: 1 }, { val: n }, { var: 1 }] });
      }
      task.push({ cmd: "GET", out: 0, var: 0, len: n * sOut });
      task.push({ cmd: "GET", out: 1, var: 1, len: n * sOut });
      opPromises.push(
        tm.queueAction(task).then((r) => {
          if (logger) logger.debug(`${loggerTxt}: fftJoinExt End: ${i}/${nPoints}`);
          return r;
        })
      );
    }
    const result = await Promise.all(opPromises);
    let fullBuffOut1;
    let fullBuffOut2;
    if (nPoints * sOut > 1 << 28) {
      fullBuffOut1 = new BigBuffer(nPoints * sOut);
      fullBuffOut2 = new BigBuffer(nPoints * sOut);
    } else {
      fullBuffOut1 = new Uint8Array(nPoints * sOut);
      fullBuffOut2 = new Uint8Array(nPoints * sOut);
    }
    let p = 0;
    for (let i = 0; i < result.length; i++) {
      fullBuffOut1.set(result[i][0], p);
      fullBuffOut2.set(result[i][1], p);
      p += result[i][0].byteLength;
    }
    return [fullBuffOut1, fullBuffOut2];
  }
  G.fft = async function(buff, inType, outType, logger, loggerTxt) {
    return await _fft(buff, false, inType, outType, logger, loggerTxt);
  };
  G.ifft = async function(buff, inType, outType, logger, loggerTxt) {
    return await _fft(buff, true, inType, outType, logger, loggerTxt);
  };
  G.lagrangeEvaluations = async function(buff, inType, outType, logger, loggerTxt) {
    inType = inType || "affine";
    outType = outType || "affine";
    let sIn;
    if (groupName == "G1") {
      if (inType == "affine") {
        sIn = G.F.n8 * 2;
      } else {
        sIn = G.F.n8 * 3;
      }
    } else if (groupName == "G2") {
      if (inType == "affine") {
        sIn = G.F.n8 * 2;
      } else {
        sIn = G.F.n8 * 3;
      }
    } else if (groupName == "Fr") {
      sIn = Fr.n8;
    } else {
      throw new Error("Invalid group");
    }
    const nPoints = buff.byteLength / sIn;
    const bits2 = log2(nPoints);
    if (2 ** bits2 * sIn != buff.byteLength) {
      if (logger) logger.error("lagrangeEvaluations iinvalid input size");
      throw new Error("lagrangeEvaluations invalid Input size");
    }
    if (bits2 <= Fr.s) {
      return await G.ifft(buff, inType, outType, logger, loggerTxt);
    }
    if (bits2 > Fr.s + 1) {
      if (logger) logger.error("lagrangeEvaluations input too big");
      throw new Error("lagrangeEvaluations input too big");
    }
    let t0 = buff.slice(0, buff.byteLength / 2);
    let t1 = buff.slice(buff.byteLength / 2, buff.byteLength);
    const shiftToSmallM = Fr.exp(Fr.shift, nPoints / 2);
    const sConst = Fr.inv(Fr.sub(Fr.one, shiftToSmallM));
    [t0, t1] = await _fftJoinExt(t0, t1, "prepareLagrangeEvaluation", sConst, Fr.shiftInv, inType, "jacobian", logger, loggerTxt + " prep");
    const promises = [];
    promises.push(_fft(t0, true, "jacobian", outType, logger, loggerTxt + " t0"));
    promises.push(_fft(t1, true, "jacobian", outType, logger, loggerTxt + " t1"));
    [t0, t1] = await Promise.all(promises);
    let buffOut;
    if (t0.byteLength > 1 << 28) {
      buffOut = new BigBuffer(t0.byteLength * 2);
    } else {
      buffOut = new Uint8Array(t0.byteLength * 2);
    }
    buffOut.set(t0);
    buffOut.set(t1, t0.byteLength);
    return buffOut;
  };
  G.fftMix = async function fftMix(buff) {
    const sG = G.F.n8 * 3;
    let fnName, fnFFTJoin;
    if (groupName == "G1") {
      fnName = "g1m_fftMix";
      fnFFTJoin = "g1m_fftJoin";
    } else if (groupName == "G2") {
      fnName = "g2m_fftMix";
      fnFFTJoin = "g2m_fftJoin";
    } else if (groupName == "Fr") {
      fnName = "frm_fftMix";
      fnFFTJoin = "frm_fftJoin";
    } else {
      throw new Error("Invalid group");
    }
    const nPoints = Math.floor(buff.byteLength / sG);
    const power = log2(nPoints);
    let nChunks = 1 << log2(tm.concurrency);
    if (nPoints <= nChunks * 2) nChunks = 1;
    const pointsPerChunk = nPoints / nChunks;
    const powerChunk = log2(pointsPerChunk);
    const opPromises = [];
    for (let i = 0; i < nChunks; i++) {
      const task = [];
      const b = buff.slice(i * pointsPerChunk * sG, (i + 1) * pointsPerChunk * sG);
      task.push({ cmd: "ALLOCSET", var: 0, buff: b });
      for (let j = 1; j <= powerChunk; j++) {
        task.push({ cmd: "CALL", fnName, params: [
          { var: 0 },
          { val: pointsPerChunk },
          { val: j }
        ] });
      }
      task.push({ cmd: "GET", out: 0, var: 0, len: pointsPerChunk * sG });
      opPromises.push(
        tm.queueAction(task)
      );
    }
    const result = await Promise.all(opPromises);
    const chunks = [];
    for (let i = 0; i < result.length; i++) chunks[i] = result[i][0];
    for (let i = powerChunk + 1; i <= power; i++) {
      const nGroups = 1 << power - i;
      const nChunksPerGroup = nChunks / nGroups;
      const opPromises2 = [];
      for (let j = 0; j < nGroups; j++) {
        for (let k = 0; k < nChunksPerGroup / 2; k++) {
          const first = Fr.exp(Fr.w[i], k * pointsPerChunk);
          const inc = Fr.w[i];
          const o1 = j * nChunksPerGroup + k;
          const o2 = j * nChunksPerGroup + k + nChunksPerGroup / 2;
          const task = [];
          task.push({ cmd: "ALLOCSET", var: 0, buff: chunks[o1] });
          task.push({ cmd: "ALLOCSET", var: 1, buff: chunks[o2] });
          task.push({ cmd: "ALLOCSET", var: 2, buff: first });
          task.push({ cmd: "ALLOCSET", var: 3, buff: inc });
          task.push({ cmd: "CALL", fnName: fnFFTJoin, params: [
            { var: 0 },
            { var: 1 },
            { val: pointsPerChunk },
            { var: 2 },
            { var: 3 }
          ] });
          task.push({ cmd: "GET", out: 0, var: 0, len: pointsPerChunk * sG });
          task.push({ cmd: "GET", out: 1, var: 1, len: pointsPerChunk * sG });
          opPromises2.push(tm.queueAction(task));
        }
      }
      const res = await Promise.all(opPromises2);
      for (let j = 0; j < nGroups; j++) {
        for (let k = 0; k < nChunksPerGroup / 2; k++) {
          const o1 = j * nChunksPerGroup + k;
          const o2 = j * nChunksPerGroup + k + nChunksPerGroup / 2;
          const resChunk = res.shift();
          chunks[o1] = resChunk[0];
          chunks[o2] = resChunk[1];
        }
      }
    }
    let fullBuffOut;
    if (buff instanceof BigBuffer) {
      fullBuffOut = new BigBuffer(nPoints * sG);
    } else {
      fullBuffOut = new Uint8Array(nPoints * sG);
    }
    let p = 0;
    for (let i = 0; i < nChunks; i++) {
      fullBuffOut.set(chunks[i], p);
      p += chunks[i].byteLength;
    }
    return fullBuffOut;
  };
  G.fftJoin = async function fftJoin(buff1, buff2, first, inc) {
    const sG = G.F.n8 * 3;
    let fnName;
    if (groupName == "G1") {
      fnName = "g1m_fftJoin";
    } else if (groupName == "G2") {
      fnName = "g2m_fftJoin";
    } else if (groupName == "Fr") {
      fnName = "frm_fftJoin";
    } else {
      throw new Error("Invalid group");
    }
    if (buff1.byteLength != buff2.byteLength) {
      throw new Error("Invalid buffer size");
    }
    const nPoints = Math.floor(buff1.byteLength / sG);
    if (nPoints != 1 << log2(nPoints)) {
      throw new Error("Invalid number of points");
    }
    let nChunks = 1 << log2(tm.concurrency);
    if (nPoints <= nChunks * 2) nChunks = 1;
    const pointsPerChunk = nPoints / nChunks;
    const opPromises = [];
    for (let i = 0; i < nChunks; i++) {
      const task = [];
      const firstChunk = Fr.mul(first, Fr.exp(inc, i * pointsPerChunk));
      const b1 = buff1.slice(i * pointsPerChunk * sG, (i + 1) * pointsPerChunk * sG);
      const b2 = buff2.slice(i * pointsPerChunk * sG, (i + 1) * pointsPerChunk * sG);
      task.push({ cmd: "ALLOCSET", var: 0, buff: b1 });
      task.push({ cmd: "ALLOCSET", var: 1, buff: b2 });
      task.push({ cmd: "ALLOCSET", var: 2, buff: firstChunk });
      task.push({ cmd: "ALLOCSET", var: 3, buff: inc });
      task.push({ cmd: "CALL", fnName, params: [
        { var: 0 },
        { var: 1 },
        { val: pointsPerChunk },
        { var: 2 },
        { var: 3 }
      ] });
      task.push({ cmd: "GET", out: 0, var: 0, len: pointsPerChunk * sG });
      task.push({ cmd: "GET", out: 1, var: 1, len: pointsPerChunk * sG });
      opPromises.push(
        tm.queueAction(task)
      );
    }
    const result = await Promise.all(opPromises);
    let fullBuffOut1;
    let fullBuffOut2;
    if (buff1 instanceof BigBuffer) {
      fullBuffOut1 = new BigBuffer(nPoints * sG);
      fullBuffOut2 = new BigBuffer(nPoints * sG);
    } else {
      fullBuffOut1 = new Uint8Array(nPoints * sG);
      fullBuffOut2 = new Uint8Array(nPoints * sG);
    }
    let p = 0;
    for (let i = 0; i < result.length; i++) {
      fullBuffOut1.set(result[i][0], p);
      fullBuffOut2.set(result[i][1], p);
      p += result[i][0].byteLength;
    }
    return [fullBuffOut1, fullBuffOut2];
  };
  G.fftFinal = async function fftFinal(buff, factor) {
    const sG = G.F.n8 * 3;
    const sGout = G.F.n8 * 2;
    let fnName, fnToAffine;
    if (groupName == "G1") {
      fnName = "g1m_fftFinal";
      fnToAffine = "g1m_batchToAffine";
    } else if (groupName == "G2") {
      fnName = "g2m_fftFinal";
      fnToAffine = "g2m_batchToAffine";
    } else {
      throw new Error("Invalid group");
    }
    const nPoints = Math.floor(buff.byteLength / sG);
    if (nPoints != 1 << log2(nPoints)) {
      throw new Error("Invalid number of points");
    }
    const pointsPerChunk = Math.floor(nPoints / tm.concurrency);
    const opPromises = [];
    for (let i = 0; i < tm.concurrency; i++) {
      let n;
      if (i < tm.concurrency - 1) {
        n = pointsPerChunk;
      } else {
        n = nPoints - i * pointsPerChunk;
      }
      if (n == 0) continue;
      const task = [];
      const b = buff.slice(i * pointsPerChunk * sG, (i * pointsPerChunk + n) * sG);
      task.push({ cmd: "ALLOCSET", var: 0, buff: b });
      task.push({ cmd: "ALLOCSET", var: 1, buff: factor });
      task.push({ cmd: "CALL", fnName, params: [
        { var: 0 },
        { val: n },
        { var: 1 }
      ] });
      task.push({ cmd: "CALL", fnName: fnToAffine, params: [
        { var: 0 },
        { val: n },
        { var: 0 }
      ] });
      task.push({ cmd: "GET", out: 0, var: 0, len: n * sGout });
      opPromises.push(
        tm.queueAction(task)
      );
    }
    const result = await Promise.all(opPromises);
    let fullBuffOut;
    if (buff instanceof BigBuffer) {
      fullBuffOut = new BigBuffer(nPoints * sGout);
    } else {
      fullBuffOut = new Uint8Array(nPoints * sGout);
    }
    let p = 0;
    for (let i = result.length - 1; i >= 0; i--) {
      fullBuffOut.set(result[i][0], p);
      p += result[i][0].byteLength;
    }
    return fullBuffOut;
  };
}
async function buildEngine(params) {
  const tm = await buildThreadManager(params.wasm, params.singleThread);
  const curve2 = {};
  curve2.q = e(params.wasm.q.toString());
  curve2.r = e(params.wasm.r.toString());
  curve2.name = params.name;
  curve2.tm = tm;
  curve2.prePSize = params.wasm.prePSize;
  curve2.preQSize = params.wasm.preQSize;
  curve2.Fr = new WasmField1(tm, "frm", params.n8r, params.r);
  curve2.F1 = new WasmField1(tm, "f1m", params.n8q, params.q);
  curve2.F2 = new WasmField2(tm, "f2m", curve2.F1);
  curve2.G1 = new WasmCurve(tm, "g1m", curve2.F1, params.wasm.pG1gen, params.wasm.pG1b, params.cofactorG1);
  curve2.G2 = new WasmCurve(tm, "g2m", curve2.F2, params.wasm.pG2gen, params.wasm.pG2b, params.cofactorG2);
  curve2.F6 = new WasmField3(tm, "f6m", curve2.F2);
  curve2.F12 = new WasmField2(tm, "ftm", curve2.F6);
  curve2.Gt = curve2.F12;
  buildBatchApplyKey(curve2, "G1");
  buildBatchApplyKey(curve2, "G2");
  buildBatchApplyKey(curve2, "Fr");
  buildMultiexp2(curve2, "G1");
  buildMultiexp2(curve2, "G2");
  buildFFT2(curve2, "G1");
  buildFFT2(curve2, "G2");
  buildFFT2(curve2, "Fr");
  buildPairing(curve2);
  curve2.array2buffer = function(arr, sG) {
    const buff = new Uint8Array(sG * arr.length);
    for (let i = 0; i < arr.length; i++) {
      buff.set(arr[i], i * sG);
    }
    return buff;
  };
  curve2.buffer2array = function(buff, sG) {
    const n = buff.byteLength / sG;
    const arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = buff.slice(i * sG, i * sG + sG);
    }
    return arr;
  };
  return curve2;
}
function toNumber(n) {
  return BigInt(n);
}
function isNegative(n) {
  return n < 0n;
}
function isZero(n) {
  return n === 0n;
}
function bitLength(n) {
  if (isNegative(n)) {
    return n.toString(2).length - 1;
  } else {
    return n.toString(2).length;
  }
}
function u32(n) {
  const b = [];
  const v = toNumber(n);
  b.push(Number(v & 0xFFn));
  b.push(Number(v >> 8n & 0xFFn));
  b.push(Number(v >> 16n & 0xFFn));
  b.push(Number(v >> 24n & 0xFFn));
  return b;
}
function toUTF8Array(str) {
  var utf8 = [];
  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i);
    if (charcode < 128) utf8.push(charcode);
    else if (charcode < 2048) {
      utf8.push(
        192 | charcode >> 6,
        128 | charcode & 63
      );
    } else if (charcode < 55296 || charcode >= 57344) {
      utf8.push(
        224 | charcode >> 12,
        128 | charcode >> 6 & 63,
        128 | charcode & 63
      );
    } else {
      i++;
      charcode = 65536 + ((charcode & 1023) << 10 | str.charCodeAt(i) & 1023);
      utf8.push(
        240 | charcode >> 18,
        128 | charcode >> 12 & 63,
        128 | charcode >> 6 & 63,
        128 | charcode & 63
      );
    }
  }
  return utf8;
}
function string(str) {
  const bytes2 = toUTF8Array(str);
  return [...varuint32(bytes2.length), ...bytes2];
}
function varuint(n) {
  const code = [];
  let v = toNumber(n);
  if (isNegative(v)) throw new Error("Number cannot be negative");
  while (!isZero(v)) {
    code.push(Number(v & 0x7Fn));
    v = v >> 7n;
  }
  if (code.length == 0) code.push(0);
  for (let i = 0; i < code.length - 1; i++) {
    code[i] = code[i] | 128;
  }
  return code;
}
function varint(_n) {
  let n, sign;
  const bits2 = bitLength(_n);
  if (_n < 0) {
    sign = true;
    n = (1n << BigInt(bits2)) + _n;
  } else {
    sign = false;
    n = toNumber(_n);
  }
  const paddingBits = 7 - bits2 % 7;
  const padding = (1n << BigInt(paddingBits)) - 1n << BigInt(bits2);
  const paddingMask = (1 << 7 - paddingBits) - 1 | 128;
  const code = varuint(n + padding);
  if (!sign) {
    code[code.length - 1] = code[code.length - 1] & paddingMask;
  }
  return code;
}
function varint32(n) {
  let v = toNumber(n);
  if (v > 0xFFFFFFFFn) throw new Error("Number too big");
  if (v > 0x7FFFFFFFn) v = v - 0x100000000n;
  if (v < -2147483648n) throw new Error("Number too small");
  return varint(v);
}
function varint64(n) {
  let v = toNumber(n);
  if (v > 0xFFFFFFFFFFFFFFFFn) throw new Error("Number too big");
  if (v > 0x7FFFFFFFFFFFFFFFn) v = v - 0x10000000000000000n;
  if (v < -9223372036854775808n) throw new Error("Number too small");
  return varint(v);
}
function varuint32(n) {
  let v = toNumber(n);
  if (v > 0xFFFFFFFFn) throw new Error("Number too big");
  return varuint(v);
}
function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ("0" + (byte & 255).toString(16)).slice(-2);
  }).join("");
}
var CodeBuilder = class {
  constructor(func) {
    this.func = func;
    this.functionName = func.functionName;
    this.module = func.module;
  }
  setLocal(localName, valCode) {
    const idx = this.func.localIdxByName[localName];
    if (idx === void 0)
      throw new Error(`Local Variable not defined: Function: ${this.functionName} local: ${localName} `);
    return [...valCode, 33, ...varuint32(idx)];
  }
  teeLocal(localName, valCode) {
    const idx = this.func.localIdxByName[localName];
    if (idx === void 0)
      throw new Error(`Local Variable not defined: Function: ${this.functionName} local: ${localName} `);
    return [...valCode, 34, ...varuint32(idx)];
  }
  getLocal(localName) {
    const idx = this.func.localIdxByName[localName];
    if (idx === void 0)
      throw new Error(`Local Variable not defined: Function: ${this.functionName} local: ${localName} `);
    return [32, ...varuint32(idx)];
  }
  i64_load8_s(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 0 : _align;
    return [...idxCode, 48, align, ...varuint32(offset)];
  }
  i64_load8_u(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 0 : _align;
    return [...idxCode, 49, align, ...varuint32(offset)];
  }
  i64_load16_s(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 1 : _align;
    return [...idxCode, 50, align, ...varuint32(offset)];
  }
  i64_load16_u(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 1 : _align;
    return [...idxCode, 51, align, ...varuint32(offset)];
  }
  i64_load32_s(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 2 : _align;
    return [...idxCode, 52, align, ...varuint32(offset)];
  }
  i64_load32_u(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 2 : _align;
    return [...idxCode, 53, align, ...varuint32(offset)];
  }
  i64_load(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 3 : _align;
    return [...idxCode, 41, align, ...varuint32(offset)];
  }
  i64_store(idxCode, _offset, _align, _codeVal) {
    let offset, align, codeVal;
    if (Array.isArray(_offset)) {
      offset = 0;
      align = 3;
      codeVal = _offset;
    } else if (Array.isArray(_align)) {
      offset = _offset;
      align = 3;
      codeVal = _align;
    } else if (Array.isArray(_codeVal)) {
      offset = _offset;
      align = _align;
      codeVal = _codeVal;
    }
    return [...idxCode, ...codeVal, 55, align, ...varuint32(offset)];
  }
  i64_store32(idxCode, _offset, _align, _codeVal) {
    let offset, align, codeVal;
    if (Array.isArray(_offset)) {
      offset = 0;
      align = 2;
      codeVal = _offset;
    } else if (Array.isArray(_align)) {
      offset = _offset;
      align = 2;
      codeVal = _align;
    } else if (Array.isArray(_codeVal)) {
      offset = _offset;
      align = _align;
      codeVal = _codeVal;
    }
    return [...idxCode, ...codeVal, 62, align, ...varuint32(offset)];
  }
  i64_store16(idxCode, _offset, _align, _codeVal) {
    let offset, align, codeVal;
    if (Array.isArray(_offset)) {
      offset = 0;
      align = 1;
      codeVal = _offset;
    } else if (Array.isArray(_align)) {
      offset = _offset;
      align = 1;
      codeVal = _align;
    } else if (Array.isArray(_codeVal)) {
      offset = _offset;
      align = _align;
      codeVal = _codeVal;
    }
    return [...idxCode, ...codeVal, 61, align, ...varuint32(offset)];
  }
  i64_store8(idxCode, _offset, _align, _codeVal) {
    let offset, align, codeVal;
    if (Array.isArray(_offset)) {
      offset = 0;
      align = 0;
      codeVal = _offset;
    } else if (Array.isArray(_align)) {
      offset = _offset;
      align = 0;
      codeVal = _align;
    } else if (Array.isArray(_codeVal)) {
      offset = _offset;
      align = _align;
      codeVal = _codeVal;
    }
    return [...idxCode, ...codeVal, 60, align, ...varuint32(offset)];
  }
  i32_load8_s(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 0 : _align;
    return [...idxCode, 44, align, ...varuint32(offset)];
  }
  i32_load8_u(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 0 : _align;
    return [...idxCode, 45, align, ...varuint32(offset)];
  }
  i32_load16_s(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 1 : _align;
    return [...idxCode, 46, align, ...varuint32(offset)];
  }
  i32_load16_u(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 1 : _align;
    return [...idxCode, 47, align, ...varuint32(offset)];
  }
  i32_load(idxCode, _offset, _align) {
    const offset = _offset || 0;
    const align = _align === void 0 ? 2 : _align;
    return [...idxCode, 40, align, ...varuint32(offset)];
  }
  i32_store(idxCode, _offset, _align, _codeVal) {
    let offset, align, codeVal;
    if (Array.isArray(_offset)) {
      offset = 0;
      align = 2;
      codeVal = _offset;
    } else if (Array.isArray(_align)) {
      offset = _offset;
      align = 2;
      codeVal = _align;
    } else if (Array.isArray(_codeVal)) {
      offset = _offset;
      align = _align;
      codeVal = _codeVal;
    }
    return [...idxCode, ...codeVal, 54, align, ...varuint32(offset)];
  }
  i32_store16(idxCode, _offset, _align, _codeVal) {
    let offset, align, codeVal;
    if (Array.isArray(_offset)) {
      offset = 0;
      align = 1;
      codeVal = _offset;
    } else if (Array.isArray(_align)) {
      offset = _offset;
      align = 1;
      codeVal = _align;
    } else if (Array.isArray(_codeVal)) {
      offset = _offset;
      align = _align;
      codeVal = _codeVal;
    }
    return [...idxCode, ...codeVal, 59, align, ...varuint32(offset)];
  }
  i32_store8(idxCode, _offset, _align, _codeVal) {
    let offset, align, codeVal;
    if (Array.isArray(_offset)) {
      offset = 0;
      align = 0;
      codeVal = _offset;
    } else if (Array.isArray(_align)) {
      offset = _offset;
      align = 0;
      codeVal = _align;
    } else if (Array.isArray(_codeVal)) {
      offset = _offset;
      align = _align;
      codeVal = _codeVal;
    }
    return [...idxCode, ...codeVal, 58, align, ...varuint32(offset)];
  }
  call(fnName, ...args) {
    const idx = this.module.functionIdxByName[fnName];
    if (idx === void 0)
      throw new Error(`Function not defined: Function: ${fnName}`);
    return [...[].concat(...args), 16, ...varuint32(idx)];
  }
  call_indirect(fnIdx, ...args) {
    return [...[].concat(...args), ...fnIdx, 17, 0, 0];
  }
  if(condCode, thenCode, elseCode) {
    if (elseCode) {
      return [...condCode, 4, 64, ...thenCode, 5, ...elseCode, 11];
    } else {
      return [...condCode, 4, 64, ...thenCode, 11];
    }
  }
  block(bCode) {
    return [2, 64, ...bCode, 11];
  }
  loop(...args) {
    return [3, 64, ...[].concat(...[...args]), 11];
  }
  br_if(relPath, condCode) {
    return [...condCode, 13, ...varuint32(relPath)];
  }
  br(relPath) {
    return [12, ...varuint32(relPath)];
  }
  ret(rCode) {
    return [...rCode, 15];
  }
  drop(dCode) {
    return [...dCode, 26];
  }
  i64_const(num) {
    return [66, ...varint64(num)];
  }
  i32_const(num) {
    return [65, ...varint32(num)];
  }
  i64_eqz(opcode) {
    return [...opcode, 80];
  }
  i64_eq(op1code, op2code) {
    return [...op1code, ...op2code, 81];
  }
  i64_ne(op1code, op2code) {
    return [...op1code, ...op2code, 82];
  }
  i64_lt_s(op1code, op2code) {
    return [...op1code, ...op2code, 83];
  }
  i64_lt_u(op1code, op2code) {
    return [...op1code, ...op2code, 84];
  }
  i64_gt_s(op1code, op2code) {
    return [...op1code, ...op2code, 85];
  }
  i64_gt_u(op1code, op2code) {
    return [...op1code, ...op2code, 86];
  }
  i64_le_s(op1code, op2code) {
    return [...op1code, ...op2code, 87];
  }
  i64_le_u(op1code, op2code) {
    return [...op1code, ...op2code, 88];
  }
  i64_ge_s(op1code, op2code) {
    return [...op1code, ...op2code, 89];
  }
  i64_ge_u(op1code, op2code) {
    return [...op1code, ...op2code, 90];
  }
  i64_add(op1code, op2code) {
    return [...op1code, ...op2code, 124];
  }
  i64_sub(op1code, op2code) {
    return [...op1code, ...op2code, 125];
  }
  i64_mul(op1code, op2code) {
    return [...op1code, ...op2code, 126];
  }
  i64_div_s(op1code, op2code) {
    return [...op1code, ...op2code, 127];
  }
  i64_div_u(op1code, op2code) {
    return [...op1code, ...op2code, 128];
  }
  i64_rem_s(op1code, op2code) {
    return [...op1code, ...op2code, 129];
  }
  i64_rem_u(op1code, op2code) {
    return [...op1code, ...op2code, 130];
  }
  i64_and(op1code, op2code) {
    return [...op1code, ...op2code, 131];
  }
  i64_or(op1code, op2code) {
    return [...op1code, ...op2code, 132];
  }
  i64_xor(op1code, op2code) {
    return [...op1code, ...op2code, 133];
  }
  i64_shl(op1code, op2code) {
    return [...op1code, ...op2code, 134];
  }
  i64_shr_s(op1code, op2code) {
    return [...op1code, ...op2code, 135];
  }
  i64_shr_u(op1code, op2code) {
    return [...op1code, ...op2code, 136];
  }
  i64_extend_i32_s(op1code) {
    return [...op1code, 172];
  }
  i64_extend_i32_u(op1code) {
    return [...op1code, 173];
  }
  i64_clz(op1code) {
    return [...op1code, 121];
  }
  i64_ctz(op1code) {
    return [...op1code, 122];
  }
  i32_eqz(op1code) {
    return [...op1code, 69];
  }
  i32_eq(op1code, op2code) {
    return [...op1code, ...op2code, 70];
  }
  i32_ne(op1code, op2code) {
    return [...op1code, ...op2code, 71];
  }
  i32_lt_s(op1code, op2code) {
    return [...op1code, ...op2code, 72];
  }
  i32_lt_u(op1code, op2code) {
    return [...op1code, ...op2code, 73];
  }
  i32_gt_s(op1code, op2code) {
    return [...op1code, ...op2code, 74];
  }
  i32_gt_u(op1code, op2code) {
    return [...op1code, ...op2code, 75];
  }
  i32_le_s(op1code, op2code) {
    return [...op1code, ...op2code, 76];
  }
  i32_le_u(op1code, op2code) {
    return [...op1code, ...op2code, 77];
  }
  i32_ge_s(op1code, op2code) {
    return [...op1code, ...op2code, 78];
  }
  i32_ge_u(op1code, op2code) {
    return [...op1code, ...op2code, 79];
  }
  i32_add(op1code, op2code) {
    return [...op1code, ...op2code, 106];
  }
  i32_sub(op1code, op2code) {
    return [...op1code, ...op2code, 107];
  }
  i32_mul(op1code, op2code) {
    return [...op1code, ...op2code, 108];
  }
  i32_div_s(op1code, op2code) {
    return [...op1code, ...op2code, 109];
  }
  i32_div_u(op1code, op2code) {
    return [...op1code, ...op2code, 110];
  }
  i32_rem_s(op1code, op2code) {
    return [...op1code, ...op2code, 111];
  }
  i32_rem_u(op1code, op2code) {
    return [...op1code, ...op2code, 112];
  }
  i32_and(op1code, op2code) {
    return [...op1code, ...op2code, 113];
  }
  i32_or(op1code, op2code) {
    return [...op1code, ...op2code, 114];
  }
  i32_xor(op1code, op2code) {
    return [...op1code, ...op2code, 115];
  }
  i32_shl(op1code, op2code) {
    return [...op1code, ...op2code, 116];
  }
  i32_shr_s(op1code, op2code) {
    return [...op1code, ...op2code, 117];
  }
  i32_shr_u(op1code, op2code) {
    return [...op1code, ...op2code, 118];
  }
  i32_rotl(op1code, op2code) {
    return [...op1code, ...op2code, 119];
  }
  i32_rotr(op1code, op2code) {
    return [...op1code, ...op2code, 120];
  }
  i32_wrap_i64(op1code) {
    return [...op1code, 167];
  }
  i32_clz(op1code) {
    return [...op1code, 103];
  }
  i32_ctz(op1code) {
    return [...op1code, 104];
  }
  unreachable() {
    return [0];
  }
  current_memory() {
    return [63, 0];
  }
  comment() {
    return [];
  }
};
var typeCodes = {
  "i32": 127,
  "i64": 126,
  "f32": 125,
  "f64": 124,
  "anyfunc": 112,
  "func": 96,
  "emptyblock": 64
};
var FunctionBuilder = class {
  constructor(module, fnName, fnType, moduleName, fieldName) {
    if (fnType == "import") {
      this.fnType = "import";
      this.moduleName = moduleName;
      this.fieldName = fieldName;
    } else if (fnType == "internal") {
      this.fnType = "internal";
    } else {
      throw new Error("Invalid function fnType: " + fnType);
    }
    this.module = module;
    this.fnName = fnName;
    this.params = [];
    this.locals = [];
    this.localIdxByName = {};
    this.code = [];
    this.returnType = null;
    this.nextLocal = 0;
  }
  addParam(paramName, paramType) {
    if (this.localIdxByName[paramName])
      throw new Error(`param already exists. Function: ${this.fnName}, Param: ${paramName} `);
    const idx = this.nextLocal++;
    this.localIdxByName[paramName] = idx;
    this.params.push({
      type: paramType
    });
  }
  addLocal(localName, localType, _length) {
    const length = _length || 1;
    if (this.localIdxByName[localName])
      throw new Error(`local already exists. Function: ${this.fnName}, Param: ${localName} `);
    const idx = this.nextLocal++;
    this.localIdxByName[localName] = idx;
    this.locals.push({
      type: localType,
      length
    });
  }
  setReturnType(returnType) {
    if (this.returnType)
      throw new Error(`returnType already defined. Function: ${this.fnName}`);
    this.returnType = returnType;
  }
  getSignature() {
    const params = [...varuint32(this.params.length), ...this.params.map((p) => typeCodes[p.type])];
    const returns = this.returnType ? [1, typeCodes[this.returnType]] : [0];
    return [96, ...params, ...returns];
  }
  getBody() {
    const locals = this.locals.map((l) => [
      ...varuint32(l.length),
      typeCodes[l.type]
    ]);
    const body = [
      ...varuint32(this.locals.length),
      ...[].concat(...locals),
      ...this.code,
      11
    ];
    return [
      ...varuint32(body.length),
      ...body
    ];
  }
  addCode(...code) {
    this.code.push(...[].concat(...[...code]));
  }
  getCodeBuilder() {
    return new CodeBuilder(this);
  }
};
var ModuleBuilder = class {
  constructor() {
    this.functions = [];
    this.functionIdxByName = {};
    this.nImportFunctions = 0;
    this.nInternalFunctions = 0;
    this.memory = {
      pagesSize: 1,
      moduleName: "env",
      fieldName: "memory"
    };
    this.free = 8;
    this.datas = [];
    this.modules = {};
    this.exports = [];
    this.functionsTable = [];
  }
  build() {
    this._setSignatures();
    return new Uint8Array([
      ...u32(1836278016),
      ...u32(1),
      ...this._buildType(),
      ...this._buildImport(),
      ...this._buildFunctionDeclarations(),
      ...this._buildFunctionsTable(),
      ...this._buildExports(),
      ...this._buildElements(),
      ...this._buildCode(),
      ...this._buildData()
    ]);
  }
  addFunction(fnName) {
    if (typeof this.functionIdxByName[fnName] !== "undefined")
      throw new Error(`Function already defined: ${fnName}`);
    const idx = this.functions.length;
    this.functionIdxByName[fnName] = idx;
    this.functions.push(new FunctionBuilder(this, fnName, "internal"));
    this.nInternalFunctions++;
    return this.functions[idx];
  }
  addIimportFunction(fnName, moduleName, _fieldName) {
    if (typeof this.functionIdxByName[fnName] !== "undefined")
      throw new Error(`Function already defined: ${fnName}`);
    if (this.functions.length > 0 && this.functions[this.functions.length - 1].type == "internal")
      throw new Error(`Import functions must be declared before internal: ${fnName}`);
    let fieldName = _fieldName || fnName;
    const idx = this.functions.length;
    this.functionIdxByName[fnName] = idx;
    this.functions.push(new FunctionBuilder(this, fnName, "import", moduleName, fieldName));
    this.nImportFunctions++;
    return this.functions[idx];
  }
  setMemory(pagesSize, moduleName, fieldName) {
    this.memory = {
      pagesSize,
      moduleName: moduleName || "env",
      fieldName: fieldName || "memory"
    };
  }
  exportFunction(fnName, _exportName) {
    const exportName = _exportName || fnName;
    if (typeof this.functionIdxByName[fnName] === "undefined")
      throw new Error(`Function not defined: ${fnName}`);
    const idx = this.functionIdxByName[fnName];
    if (exportName != fnName) {
      this.functionIdxByName[exportName] = idx;
    }
    this.exports.push({
      exportName,
      idx
    });
  }
  addFunctionToTable(fnName) {
    const idx = this.functionIdxByName[fnName];
    this.functionsTable.push(idx);
  }
  addData(offset, bytes2) {
    this.datas.push({
      offset,
      bytes: bytes2
    });
  }
  alloc(a, b) {
    let size;
    let bytes2;
    if ((Array.isArray(a) || ArrayBuffer.isView(a)) && typeof b === "undefined") {
      size = a.length;
      bytes2 = a;
    } else {
      size = a;
      bytes2 = b;
    }
    size = (size - 1 >> 3) + 1 << 3;
    const p = this.free;
    this.free += size;
    if (bytes2) {
      this.addData(p, bytes2);
    }
    return p;
  }
  allocString(s) {
    const encoder = new globalThis.TextEncoder();
    const uint8array = encoder.encode(s);
    return this.alloc([...uint8array, 0]);
  }
  _setSignatures() {
    this.signatures = [];
    const signatureIdxByName = {};
    if (this.functionsTable.length > 0) {
      const signature = this.functions[this.functionsTable[0]].getSignature();
      const signatureName = "s_" + toHexString(signature);
      signatureIdxByName[signatureName] = 0;
      this.signatures.push(signature);
    }
    for (let i = 0; i < this.functions.length; i++) {
      const signature = this.functions[i].getSignature();
      const signatureName = "s_" + toHexString(signature);
      if (typeof signatureIdxByName[signatureName] === "undefined") {
        signatureIdxByName[signatureName] = this.signatures.length;
        this.signatures.push(signature);
      }
      this.functions[i].signatureIdx = signatureIdxByName[signatureName];
    }
  }
  _buildSection(sectionType, section) {
    return [sectionType, ...varuint32(section.length), ...section];
  }
  _buildType() {
    return this._buildSection(
      1,
      [
        ...varuint32(this.signatures.length),
        ...[].concat(...this.signatures)
      ]
    );
  }
  _buildImport() {
    const entries = [];
    entries.push([
      ...string(this.memory.moduleName),
      ...string(this.memory.fieldName),
      2,
      0,
      //Flags no init valua
      ...varuint32(this.memory.pagesSize)
    ]);
    for (let i = 0; i < this.nImportFunctions; i++) {
      entries.push([
        ...string(this.functions[i].moduleName),
        ...string(this.functions[i].fieldName),
        0,
        ...varuint32(this.functions[i].signatureIdx)
      ]);
    }
    return this._buildSection(
      2,
      varuint32(entries.length).concat(...entries)
    );
  }
  _buildFunctionDeclarations() {
    const entries = [];
    for (let i = this.nImportFunctions; i < this.nImportFunctions + this.nInternalFunctions; i++) {
      entries.push(...varuint32(this.functions[i].signatureIdx));
    }
    return this._buildSection(
      3,
      [
        ...varuint32(entries.length),
        ...[...entries]
      ]
    );
  }
  _buildFunctionsTable() {
    if (this.functionsTable.length == 0) return [];
    return this._buildSection(
      4,
      [
        ...varuint32(1),
        112,
        0,
        ...varuint32(this.functionsTable.length)
      ]
    );
  }
  _buildElements() {
    if (this.functionsTable.length == 0) return [];
    const entries = [];
    for (let i = 0; i < this.functionsTable.length; i++) {
      entries.push(...varuint32(this.functionsTable[i]));
    }
    return this._buildSection(
      9,
      [
        ...varuint32(1),
        // 1 entry
        ...varuint32(0),
        // Table (0 in MVP)
        65,
        // offset 0
        ...varint32(0),
        11,
        ...varuint32(this.functionsTable.length),
        // Number of elements
        ...[...entries]
      ]
    );
  }
  _buildExports() {
    const entries = [];
    for (let i = 0; i < this.exports.length; i++) {
      entries.push([
        ...string(this.exports[i].exportName),
        0,
        ...varuint32(this.exports[i].idx)
      ]);
    }
    return this._buildSection(
      7,
      varuint32(entries.length).concat(...entries)
    );
  }
  _buildCode() {
    const entries = [];
    for (let i = this.nImportFunctions; i < this.nImportFunctions + this.nInternalFunctions; i++) {
      entries.push(this.functions[i].getBody());
    }
    return this._buildSection(
      10,
      varuint32(entries.length).concat(...entries)
    );
  }
  _buildData() {
    const entries = [];
    entries.push([
      0,
      65,
      0,
      11,
      4,
      ...u32(this.free)
    ]);
    for (let i = 0; i < this.datas.length; i++) {
      entries.push([
        0,
        65,
        ...varint32(this.datas[i].offset),
        11,
        ...varuint32(this.datas[i].bytes.length),
        ...this.datas[i].bytes
      ]);
    }
    return this._buildSection(
      11,
      varuint32(entries.length).concat(...entries)
    );
  }
};
globalThis.curve_bn128 = null;
async function buildBn128(singleThread, plugins) {
  if (!singleThread && globalThis.curve_bn128) return globalThis.curve_bn128;
  const moduleBuilder = new ModuleBuilder();
  moduleBuilder.setMemory(25);
  buildBn128$1(moduleBuilder);
  if (plugins) plugins(moduleBuilder);
  const bn128wasm = {};
  bn128wasm.code = moduleBuilder.build();
  bn128wasm.pq = moduleBuilder.modules.f1m.pq;
  bn128wasm.pr = moduleBuilder.modules.frm.pq;
  bn128wasm.pG1gen = moduleBuilder.modules.bn128.pG1gen;
  bn128wasm.pG1zero = moduleBuilder.modules.bn128.pG1zero;
  bn128wasm.pG1b = moduleBuilder.modules.bn128.pG1b;
  bn128wasm.pG2gen = moduleBuilder.modules.bn128.pG2gen;
  bn128wasm.pG2zero = moduleBuilder.modules.bn128.pG2zero;
  bn128wasm.pG2b = moduleBuilder.modules.bn128.pG2b;
  bn128wasm.pOneT = moduleBuilder.modules.bn128.pOneT;
  bn128wasm.prePSize = moduleBuilder.modules.bn128.prePSize;
  bn128wasm.preQSize = moduleBuilder.modules.bn128.preQSize;
  bn128wasm.n8q = 32;
  bn128wasm.n8r = 32;
  bn128wasm.q = moduleBuilder.modules.bn128.q;
  bn128wasm.r = moduleBuilder.modules.bn128.r;
  const params = {
    name: "bn128",
    wasm: bn128wasm,
    q: e("21888242871839275222246405745257275088696311157297823662689037894645226208583"),
    r: e("21888242871839275222246405745257275088548364400416034343698204186575808495617"),
    n8q: 32,
    n8r: 32,
    cofactorG2: e("30644e72e131a029b85045b68181585e06ceecda572a2489345f2299c0f9fa8d", 16),
    singleThread: singleThread ? true : false
  };
  const curve2 = await buildEngine(params);
  curve2.terminate = async function() {
    if (!params.singleThread) {
      globalThis.curve_bn128 = null;
      await this.tm.terminate();
    }
  };
  if (!singleThread) {
    globalThis.curve_bn128 = curve2;
  }
  return curve2;
}
globalThis.curve_bls12381 = null;
async function buildBls12381(singleThread, plugins) {
  if (!singleThread && globalThis.curve_bls12381) return globalThis.curve_bls12381;
  const moduleBuilder = new ModuleBuilder();
  moduleBuilder.setMemory(25);
  buildBls12381$1(moduleBuilder);
  if (plugins) plugins(moduleBuilder);
  const bls12381wasm = {};
  bls12381wasm.code = moduleBuilder.build();
  bls12381wasm.pq = moduleBuilder.modules.f1m.pq;
  bls12381wasm.pr = moduleBuilder.modules.frm.pq;
  bls12381wasm.pG1gen = moduleBuilder.modules.bls12381.pG1gen;
  bls12381wasm.pG1zero = moduleBuilder.modules.bls12381.pG1zero;
  bls12381wasm.pG1b = moduleBuilder.modules.bls12381.pG1b;
  bls12381wasm.pG2gen = moduleBuilder.modules.bls12381.pG2gen;
  bls12381wasm.pG2zero = moduleBuilder.modules.bls12381.pG2zero;
  bls12381wasm.pG2b = moduleBuilder.modules.bls12381.pG2b;
  bls12381wasm.pOneT = moduleBuilder.modules.bls12381.pOneT;
  bls12381wasm.prePSize = moduleBuilder.modules.bls12381.prePSize;
  bls12381wasm.preQSize = moduleBuilder.modules.bls12381.preQSize;
  bls12381wasm.n8q = 48;
  bls12381wasm.n8r = 32;
  bls12381wasm.q = moduleBuilder.modules.bls12381.q;
  bls12381wasm.r = moduleBuilder.modules.bls12381.r;
  const params = {
    name: "bls12381",
    wasm: bls12381wasm,
    q: e("1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab", 16),
    r: e("73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001", 16),
    n8q: 48,
    n8r: 32,
    cofactorG1: e("0x396c8c005555e1568c00aaab0000aaab", 16),
    cofactorG2: e("0x5d543a95414e7f1091d50792876a202cd91de4547085abaa68a205b2e5a7ddfa628f1cb4d9e82ef21537e293a6691ae1616ec6e786f0c70cf1c38e31c7238e5", 16),
    singleThread: singleThread ? true : false
  };
  const curve2 = await buildEngine(params);
  curve2.terminate = async function() {
    if (!params.singleThread) {
      globalThis.curve_bls12381 = null;
      await this.tm.terminate();
    }
  };
  if (!singleThread) {
    globalThis.curve_bls12381 = curve2;
  }
  return curve2;
}
var bls12381r = e("73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001", 16);
var bn128r = e("21888242871839275222246405745257275088548364400416034343698204186575808495617");
var bls12381q = e("1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab", 16);
var bn128q = e("21888242871839275222246405745257275088696311157297823662689037894645226208583");
async function getCurveFromR(r, singleThread, plugins) {
  let curve2;
  if (eq(r, bn128r)) {
    curve2 = await buildBn128(singleThread, plugins);
  } else if (eq(r, bls12381r)) {
    curve2 = await buildBls12381(singleThread, plugins);
  } else {
    throw new Error(`Curve not supported: ${toString(r)}`);
  }
  return curve2;
}
var Scalar = _Scalar;
var utils = _utils;

// node_modules/snarkjs/build/browser.esm.js
var fs = {};
async function open(fileName, openFlags, cacheSize, pageSize) {
  cacheSize = cacheSize || 4096 * 64;
  if (typeof openFlags !== "number" && ["w+", "wx+", "r", "ax+", "a+"].indexOf(openFlags) < 0)
    throw new Error("Invalid open option");
  const fd = await fs.promises.open(fileName, openFlags);
  const stats = await fd.stat();
  return new FastFile(fd, stats, cacheSize, pageSize, fileName);
}
var FastFile = class {
  constructor(fd, stats, cacheSize, pageSize, fileName) {
    this.fileName = fileName;
    this.fd = fd;
    this.pos = 0;
    this.pageSize = pageSize || 1 << 8;
    while (this.pageSize < stats.blksize) {
      this.pageSize *= 2;
    }
    this.totalSize = stats.size;
    this.totalPages = Math.floor((stats.size - 1) / this.pageSize) + 1;
    this.maxPagesLoaded = Math.floor(cacheSize / this.pageSize) + 1;
    this.pages = {};
    this.pendingLoads = [];
    this.writing = false;
    this.reading = false;
    this.avBuffs = [];
    this.history = {};
  }
  _loadPage(p) {
    const self = this;
    const P = new Promise((resolve, reject) => {
      self.pendingLoads.push({
        page: p,
        resolve,
        reject
      });
    });
    self.__statusPage("After Load request: ", p);
    return P;
  }
  __statusPage(s, p) {
    const logEntry = [];
    const self = this;
    if (!self.logHistory) return;
    logEntry.push("==" + s + " " + p);
    let S = "";
    for (let i = 0; i < self.pendingLoads.length; i++) {
      if (self.pendingLoads[i].page == p) S = S + " " + i;
    }
    if (S) logEntry.push("Pending loads:" + S);
    if (typeof self.pages[p] != "undefined") {
      const page = self.pages[p];
      logEntry.push("Loaded");
      logEntry.push("pendingOps: " + page.pendingOps);
      if (page.loading) logEntry.push("loading: " + page.loading);
      if (page.writing) logEntry.push("writing");
      if (page.dirty) logEntry.push("dirty");
    }
    logEntry.push("==");
    if (!self.history[p]) self.history[p] = [];
    self.history[p].push(logEntry);
  }
  __printHistory(p) {
    const self = this;
    if (!self.history[p]) console.log("Empty History ", p);
    console.log("History " + p);
    for (let i = 0; i < self.history[p].length; i++) {
      for (let j = 0; j < self.history[p][i].length; j++) {
        console.log("-> " + self.history[p][i][j]);
      }
    }
  }
  _triggerLoad() {
    const self = this;
    if (self.reading) return;
    if (self.pendingLoads.length == 0) return;
    const pageIdxs = Object.keys(self.pages);
    const deletablePages = [];
    for (let i = 0; i < pageIdxs.length; i++) {
      const page = self.pages[parseInt(pageIdxs[i])];
      if (page.dirty == false && page.pendingOps == 0 && !page.writing && !page.loading) deletablePages.push(parseInt(pageIdxs[i]));
    }
    let freePages = self.maxPagesLoaded - pageIdxs.length;
    const ops = [];
    while (self.pendingLoads.length > 0 && (typeof self.pages[self.pendingLoads[0].page] != "undefined" || (freePages > 0 || deletablePages.length > 0))) {
      const load = self.pendingLoads.shift();
      if (typeof self.pages[load.page] != "undefined") {
        self.pages[load.page].pendingOps++;
        const idx = deletablePages.indexOf(load.page);
        if (idx >= 0) deletablePages.splice(idx, 1);
        if (self.pages[load.page].loading) {
          self.pages[load.page].loading.push(load);
        } else {
          load.resolve();
        }
        self.__statusPage("After Load (cached): ", load.page);
      } else {
        if (freePages) {
          freePages--;
        } else {
          const fp = deletablePages.shift();
          self.__statusPage("Before Unload: ", fp);
          self.avBuffs.unshift(self.pages[fp]);
          delete self.pages[fp];
          self.__statusPage("After Unload: ", fp);
        }
        if (load.page >= self.totalPages) {
          self.pages[load.page] = getNewPage();
          load.resolve();
          self.__statusPage("After Load (new): ", load.page);
        } else {
          self.reading = true;
          self.pages[load.page] = getNewPage();
          self.pages[load.page].loading = [load];
          ops.push(self.fd.read(self.pages[load.page].buff, 0, self.pageSize, load.page * self.pageSize).then((res) => {
            self.pages[load.page].size = res.bytesRead;
            const loading = self.pages[load.page].loading;
            delete self.pages[load.page].loading;
            for (let i = 0; i < loading.length; i++) {
              loading[i].resolve();
            }
            self.__statusPage("After Load (loaded): ", load.page);
            return res;
          }, (err) => {
            load.reject(err);
          }));
          self.__statusPage("After Load (loading): ", load.page);
        }
      }
    }
    Promise.all(ops).then(() => {
      self.reading = false;
      if (self.pendingLoads.length > 0) setImmediate(self._triggerLoad.bind(self));
      self._tryClose();
    });
    function getNewPage() {
      if (self.avBuffs.length > 0) {
        const p = self.avBuffs.shift();
        p.dirty = false;
        p.pendingOps = 1;
        p.size = 0;
        return p;
      } else {
        return {
          dirty: false,
          buff: new Uint8Array(self.pageSize),
          pendingOps: 1,
          size: 0
        };
      }
    }
  }
  _triggerWrite() {
    const self = this;
    if (self.writing) return;
    const pageIdxs = Object.keys(self.pages);
    const ops = [];
    for (let i = 0; i < pageIdxs.length; i++) {
      const page = self.pages[parseInt(pageIdxs[i])];
      if (page.dirty) {
        page.dirty = false;
        page.writing = true;
        self.writing = true;
        ops.push(self.fd.write(page.buff, 0, page.size, parseInt(pageIdxs[i]) * self.pageSize).then(() => {
          page.writing = false;
          return;
        }, (err) => {
          console.log("ERROR Writing: " + err);
          self.error = err;
          self._tryClose();
        }));
      }
    }
    if (self.writing) {
      Promise.all(ops).then(() => {
        self.writing = false;
        setImmediate(self._triggerWrite.bind(self));
        self._tryClose();
        if (self.pendingLoads.length > 0) setImmediate(self._triggerLoad.bind(self));
      });
    }
  }
  _getDirtyPage() {
    for (let p in this.pages) {
      if (this.pages[p].dirty) return p;
    }
    return -1;
  }
  async write(buff, pos) {
    if (buff.byteLength == 0) return;
    const self = this;
    if (typeof pos == "undefined") pos = self.pos;
    self.pos = pos + buff.byteLength;
    if (self.totalSize < pos + buff.byteLength) self.totalSize = pos + buff.byteLength;
    if (self.pendingClose)
      throw new Error("Writing a closing file");
    const firstPage = Math.floor(pos / self.pageSize);
    const lastPage = Math.floor((pos + buff.byteLength - 1) / self.pageSize);
    const pagePromises = [];
    for (let i = firstPage; i <= lastPage; i++) pagePromises.push(self._loadPage(i));
    self._triggerLoad();
    let p = firstPage;
    let o = pos % self.pageSize;
    let r = buff.byteLength;
    while (r > 0) {
      await pagePromises[p - firstPage];
      const l = o + r > self.pageSize ? self.pageSize - o : r;
      const srcView = buff.slice(buff.byteLength - r, buff.byteLength - r + l);
      const dstView = new Uint8Array(self.pages[p].buff.buffer, o, l);
      dstView.set(srcView);
      self.pages[p].dirty = true;
      self.pages[p].pendingOps--;
      self.pages[p].size = Math.max(o + l, self.pages[p].size);
      if (p >= self.totalPages) {
        self.totalPages = p + 1;
      }
      r = r - l;
      p++;
      o = 0;
      if (!self.writing) setImmediate(self._triggerWrite.bind(self));
    }
  }
  async read(len, pos) {
    const self = this;
    let buff = new Uint8Array(len);
    await self.readToBuffer(buff, 0, len, pos);
    return buff;
  }
  async readToBuffer(buffDst, offset, len, pos) {
    if (len == 0) {
      return;
    }
    const self = this;
    if (len > self.pageSize * self.maxPagesLoaded * 0.8) {
      const cacheSize = Math.floor(len * 1.1);
      this.maxPagesLoaded = Math.floor(cacheSize / self.pageSize) + 1;
    }
    if (typeof pos == "undefined") pos = self.pos;
    self.pos = pos + len;
    if (self.pendingClose)
      throw new Error("Reading a closing file");
    const firstPage = Math.floor(pos / self.pageSize);
    const lastPage = Math.floor((pos + len - 1) / self.pageSize);
    const pagePromises = [];
    for (let i = firstPage; i <= lastPage; i++) pagePromises.push(self._loadPage(i));
    self._triggerLoad();
    let p = firstPage;
    let o = pos % self.pageSize;
    let r = pos + len > self.totalSize ? len - (pos + len - self.totalSize) : len;
    while (r > 0) {
      await pagePromises[p - firstPage];
      self.__statusPage("After Await (read): ", p);
      const l = o + r > self.pageSize ? self.pageSize - o : r;
      const srcView = new Uint8Array(self.pages[p].buff.buffer, self.pages[p].buff.byteOffset + o, l);
      buffDst.set(srcView, offset + len - r);
      self.pages[p].pendingOps--;
      self.__statusPage("After Op done: ", p);
      r = r - l;
      p++;
      o = 0;
      if (self.pendingLoads.length > 0) setImmediate(self._triggerLoad.bind(self));
    }
    this.pos = pos + len;
  }
  _tryClose() {
    const self = this;
    if (!self.pendingClose) return;
    if (self.error) {
      self.pendingCloseReject(self.error);
    }
    const p = self._getDirtyPage();
    if (p >= 0 || self.writing || self.reading || self.pendingLoads.length > 0) return;
    self.pendingClose();
  }
  close() {
    const self = this;
    if (self.pendingClose)
      throw new Error("Closing the file twice");
    return new Promise((resolve, reject) => {
      self.pendingClose = resolve;
      self.pendingCloseReject = reject;
      self._tryClose();
    }).then(() => {
      self.fd.close();
    }, (err) => {
      self.fd.close();
      throw err;
    });
  }
  async discard() {
    const self = this;
    await self.close();
    await fs.promises.unlink(this.fileName);
  }
  async writeULE32(v, pos) {
    const self = this;
    const tmpBuff322 = new Uint8Array(4);
    const tmpBuff32v2 = new DataView(tmpBuff322.buffer);
    tmpBuff32v2.setUint32(0, v, true);
    await self.write(tmpBuff322, pos);
  }
  async writeUBE32(v, pos) {
    const self = this;
    const tmpBuff322 = new Uint8Array(4);
    const tmpBuff32v2 = new DataView(tmpBuff322.buffer);
    tmpBuff32v2.setUint32(0, v, false);
    await self.write(tmpBuff322, pos);
  }
  async writeULE64(v, pos) {
    const self = this;
    const tmpBuff642 = new Uint8Array(8);
    const tmpBuff64v2 = new DataView(tmpBuff642.buffer);
    tmpBuff64v2.setUint32(0, v & 4294967295, true);
    tmpBuff64v2.setUint32(4, Math.floor(v / 4294967296), true);
    await self.write(tmpBuff642, pos);
  }
  async readULE32(pos) {
    const self = this;
    const b = await self.read(4, pos);
    const view = new Uint32Array(b.buffer);
    return view[0];
  }
  async readUBE32(pos) {
    const self = this;
    const b = await self.read(4, pos);
    const view = new DataView(b.buffer);
    return view.getUint32(0, false);
  }
  async readULE64(pos) {
    const self = this;
    const b = await self.read(8, pos);
    const view = new Uint32Array(b.buffer);
    return view[1] * 4294967296 + view[0];
  }
  async readString(pos) {
    const self = this;
    if (self.pendingClose) {
      throw new Error("Reading a closing file");
    }
    let currentPosition = typeof pos == "undefined" ? self.pos : pos;
    let currentPage = Math.floor(currentPosition / self.pageSize);
    let endOfStringFound = false;
    let str = "";
    while (!endOfStringFound) {
      let pagePromise = self._loadPage(currentPage);
      self._triggerLoad();
      await pagePromise;
      self.__statusPage("After Await (read): ", currentPage);
      let offsetOnPage = currentPosition % self.pageSize;
      const dataArray = new Uint8Array(
        self.pages[currentPage].buff.buffer,
        self.pages[currentPage].buff.byteOffset + offsetOnPage,
        self.pageSize - offsetOnPage
      );
      let indexEndOfString = dataArray.findIndex((element) => element === 0);
      endOfStringFound = indexEndOfString !== -1;
      if (endOfStringFound) {
        str += new TextDecoder().decode(dataArray.slice(0, indexEndOfString));
        self.pos = currentPage * this.pageSize + offsetOnPage + indexEndOfString + 1;
      } else {
        str += new TextDecoder().decode(dataArray);
        self.pos = currentPage * this.pageSize + offsetOnPage + dataArray.length;
      }
      self.pages[currentPage].pendingOps--;
      self.__statusPage("After Op done: ", currentPage);
      currentPosition = self.pos;
      currentPage++;
      if (self.pendingLoads.length > 0) setImmediate(self._triggerLoad.bind(self));
    }
    return str;
  }
};
function createNew$1(o) {
  const initialSize = o.initialSize || 1 << 20;
  const fd = new MemFile();
  fd.o = o;
  fd.o.data = new Uint8Array(initialSize);
  fd.allocSize = initialSize;
  fd.totalSize = 0;
  fd.readOnly = false;
  fd.pos = 0;
  return fd;
}
function readExisting$2(o) {
  const fd = new MemFile();
  fd.o = o;
  fd.allocSize = o.data.byteLength;
  fd.totalSize = o.data.byteLength;
  fd.readOnly = true;
  fd.pos = 0;
  return fd;
}
var tmpBuff32$1 = new Uint8Array(4);
var tmpBuff32v$1 = new DataView(tmpBuff32$1.buffer);
var tmpBuff64$1 = new Uint8Array(8);
var tmpBuff64v$1 = new DataView(tmpBuff64$1.buffer);
var MemFile = class {
  constructor() {
    this.pageSize = 1 << 14;
  }
  _resizeIfNeeded(newLen) {
    if (newLen > this.allocSize) {
      const newAllocSize = Math.max(
        this.allocSize + (1 << 20),
        Math.floor(this.allocSize * 1.1),
        newLen
      );
      const newData = new Uint8Array(newAllocSize);
      newData.set(this.o.data);
      this.o.data = newData;
      this.allocSize = newAllocSize;
    }
  }
  async write(buff, pos) {
    const self = this;
    if (typeof pos == "undefined") pos = self.pos;
    if (this.readOnly) throw new Error("Writing a read only file");
    this._resizeIfNeeded(pos + buff.byteLength);
    this.o.data.set(buff.slice(), pos);
    if (pos + buff.byteLength > this.totalSize) this.totalSize = pos + buff.byteLength;
    this.pos = pos + buff.byteLength;
  }
  async readToBuffer(buffDest, offset, len, pos) {
    const self = this;
    if (typeof pos == "undefined") pos = self.pos;
    if (this.readOnly) {
      if (pos + len > this.totalSize) throw new Error("Reading out of bounds");
    }
    this._resizeIfNeeded(pos + len);
    const buffSrc = new Uint8Array(this.o.data.buffer, this.o.data.byteOffset + pos, len);
    buffDest.set(buffSrc, offset);
    this.pos = pos + len;
  }
  async read(len, pos) {
    const self = this;
    const buff = new Uint8Array(len);
    await self.readToBuffer(buff, 0, len, pos);
    return buff;
  }
  close() {
    if (this.o.data.byteLength != this.totalSize) {
      this.o.data = this.o.data.slice(0, this.totalSize);
    }
  }
  async discard() {
  }
  async writeULE32(v, pos) {
    const self = this;
    tmpBuff32v$1.setUint32(0, v, true);
    await self.write(tmpBuff32$1, pos);
  }
  async writeUBE32(v, pos) {
    const self = this;
    tmpBuff32v$1.setUint32(0, v, false);
    await self.write(tmpBuff32$1, pos);
  }
  async writeULE64(v, pos) {
    const self = this;
    tmpBuff64v$1.setUint32(0, v & 4294967295, true);
    tmpBuff64v$1.setUint32(4, Math.floor(v / 4294967296), true);
    await self.write(tmpBuff64$1, pos);
  }
  async readULE32(pos) {
    const self = this;
    const b = await self.read(4, pos);
    const view = new Uint32Array(b.buffer);
    return view[0];
  }
  async readUBE32(pos) {
    const self = this;
    const b = await self.read(4, pos);
    const view = new DataView(b.buffer);
    return view.getUint32(0, false);
  }
  async readULE64(pos) {
    const self = this;
    const b = await self.read(8, pos);
    const view = new Uint32Array(b.buffer);
    return view[1] * 4294967296 + view[0];
  }
  async readString(pos) {
    const self = this;
    let currentPosition = typeof pos == "undefined" ? self.pos : pos;
    if (currentPosition > this.totalSize) {
      if (this.readOnly) {
        throw new Error("Reading out of bounds");
      }
      this._resizeIfNeeded(pos);
    }
    const dataArray = new Uint8Array(
      self.o.data.buffer,
      currentPosition,
      this.totalSize - currentPosition
    );
    let indexEndOfString = dataArray.findIndex((element) => element === 0);
    let endOfStringFound = indexEndOfString !== -1;
    let str = "";
    if (endOfStringFound) {
      str = new TextDecoder().decode(dataArray.slice(0, indexEndOfString));
      self.pos = currentPosition + indexEndOfString + 1;
    } else {
      self.pos = currentPosition;
    }
    return str;
  }
};
var PAGE_SIZE2 = 1 << 22;
function createNew(o) {
  const initialSize = o.initialSize || 0;
  const fd = new BigMemFile();
  fd.o = o;
  const nPages = initialSize ? Math.floor((initialSize - 1) / PAGE_SIZE2) + 1 : 0;
  fd.o.data = [];
  for (let i = 0; i < nPages - 1; i++) {
    fd.o.data.push(new Uint8Array(PAGE_SIZE2));
  }
  if (nPages) fd.o.data.push(new Uint8Array(initialSize - PAGE_SIZE2 * (nPages - 1)));
  fd.totalSize = 0;
  fd.readOnly = false;
  fd.pos = 0;
  return fd;
}
function readExisting$1(o) {
  const fd = new BigMemFile();
  fd.o = o;
  fd.totalSize = (o.data.length - 1) * PAGE_SIZE2 + o.data[o.data.length - 1].byteLength;
  fd.readOnly = true;
  fd.pos = 0;
  return fd;
}
var tmpBuff32 = new Uint8Array(4);
var tmpBuff32v = new DataView(tmpBuff32.buffer);
var tmpBuff64 = new Uint8Array(8);
var tmpBuff64v = new DataView(tmpBuff64.buffer);
var BigMemFile = class {
  constructor() {
    this.pageSize = 1 << 14;
  }
  _resizeIfNeeded(newLen) {
    if (newLen <= this.totalSize) return;
    if (this.readOnly) throw new Error("Reading out of file bounds");
    const nPages = Math.floor((newLen - 1) / PAGE_SIZE2) + 1;
    for (let i = Math.max(this.o.data.length - 1, 0); i < nPages; i++) {
      const newSize = i < nPages - 1 ? PAGE_SIZE2 : newLen - (nPages - 1) * PAGE_SIZE2;
      const p = new Uint8Array(newSize);
      if (i == this.o.data.length - 1) p.set(this.o.data[i]);
      this.o.data[i] = p;
    }
    this.totalSize = newLen;
  }
  async write(buff, pos) {
    const self = this;
    if (typeof pos == "undefined") pos = self.pos;
    if (this.readOnly) throw new Error("Writing a read only file");
    this._resizeIfNeeded(pos + buff.byteLength);
    const firstPage = Math.floor(pos / PAGE_SIZE2);
    let p = firstPage;
    let o = pos % PAGE_SIZE2;
    let r = buff.byteLength;
    while (r > 0) {
      const l = o + r > PAGE_SIZE2 ? PAGE_SIZE2 - o : r;
      const srcView = buff.slice(buff.byteLength - r, buff.byteLength - r + l);
      const dstView = new Uint8Array(self.o.data[p].buffer, o, l);
      dstView.set(srcView);
      r = r - l;
      p++;
      o = 0;
    }
    this.pos = pos + buff.byteLength;
  }
  async readToBuffer(buffDst, offset, len, pos) {
    const self = this;
    if (typeof pos == "undefined") pos = self.pos;
    if (this.readOnly) {
      if (pos + len > this.totalSize) throw new Error("Reading out of bounds");
    }
    this._resizeIfNeeded(pos + len);
    const firstPage = Math.floor(pos / PAGE_SIZE2);
    let p = firstPage;
    let o = pos % PAGE_SIZE2;
    let r = len;
    while (r > 0) {
      const l = o + r > PAGE_SIZE2 ? PAGE_SIZE2 - o : r;
      const srcView = new Uint8Array(self.o.data[p].buffer, o, l);
      buffDst.set(srcView, offset + len - r);
      r = r - l;
      p++;
      o = 0;
    }
    this.pos = pos + len;
  }
  async read(len, pos) {
    const self = this;
    const buff = new Uint8Array(len);
    await self.readToBuffer(buff, 0, len, pos);
    return buff;
  }
  close() {
  }
  async discard() {
  }
  async writeULE32(v, pos) {
    const self = this;
    tmpBuff32v.setUint32(0, v, true);
    await self.write(tmpBuff32, pos);
  }
  async writeUBE32(v, pos) {
    const self = this;
    tmpBuff32v.setUint32(0, v, false);
    await self.write(tmpBuff32, pos);
  }
  async writeULE64(v, pos) {
    const self = this;
    tmpBuff64v.setUint32(0, v & 4294967295, true);
    tmpBuff64v.setUint32(4, Math.floor(v / 4294967296), true);
    await self.write(tmpBuff64, pos);
  }
  async readULE32(pos) {
    const self = this;
    const b = await self.read(4, pos);
    const view = new Uint32Array(b.buffer);
    return view[0];
  }
  async readUBE32(pos) {
    const self = this;
    const b = await self.read(4, pos);
    const view = new DataView(b.buffer);
    return view.getUint32(0, false);
  }
  async readULE64(pos) {
    const self = this;
    const b = await self.read(8, pos);
    const view = new Uint32Array(b.buffer);
    return view[1] * 4294967296 + view[0];
  }
  async readString(pos) {
    const self = this;
    const fixedSize = 2048;
    let currentPosition = typeof pos == "undefined" ? self.pos : pos;
    if (currentPosition > this.totalSize) {
      if (this.readOnly) {
        throw new Error("Reading out of bounds");
      }
      this._resizeIfNeeded(pos);
    }
    let endOfStringFound = false;
    let str = "";
    while (!endOfStringFound) {
      let currentPage = Math.floor(currentPosition / PAGE_SIZE2);
      let offsetOnPage = currentPosition % PAGE_SIZE2;
      if (self.o.data[currentPage] === void 0) {
        throw new Error("ERROR");
      }
      let readLength = Math.min(fixedSize, self.o.data[currentPage].length - offsetOnPage);
      const dataArray = new Uint8Array(self.o.data[currentPage].buffer, offsetOnPage, readLength);
      let indexEndOfString = dataArray.findIndex((element) => element === 0);
      endOfStringFound = indexEndOfString !== -1;
      if (endOfStringFound) {
        str += new TextDecoder().decode(dataArray.slice(0, indexEndOfString));
        self.pos = currentPage * PAGE_SIZE2 + offsetOnPage + indexEndOfString + 1;
      } else {
        str += new TextDecoder().decode(dataArray);
        self.pos = currentPage * PAGE_SIZE2 + offsetOnPage + dataArray.length;
      }
      currentPosition = self.pos;
    }
    return str;
  }
};
var O_TRUNC = 1024;
var O_CREAT = 512;
var O_RDWR = 2;
var O_RDONLY = 0;
var DEFAULT_CACHE_SIZE = 1 << 16;
var DEFAULT_PAGE_SIZE = 1 << 13;
async function createOverride(o, b, c) {
  if (typeof o === "string") {
    o = {
      type: "file",
      fileName: o,
      cacheSize: b || DEFAULT_CACHE_SIZE,
      pageSize: c || DEFAULT_PAGE_SIZE
    };
  }
  if (o.type == "file") {
    return await open(o.fileName, O_TRUNC | O_CREAT | O_RDWR, o.cacheSize, o.pageSize);
  } else if (o.type == "mem") {
    return createNew$1(o);
  } else if (o.type == "bigMem") {
    return createNew(o);
  } else {
    throw new Error("Invalid FastFile type: " + o.type);
  }
}
async function readExisting(o, b, c) {
  if (o instanceof Uint8Array) {
    o = {
      type: "mem",
      data: o
    };
  }
  {
    if (typeof o === "string") {
      const buff = await fetch(o).then(function(res) {
        return res.arrayBuffer();
      }).then(function(ab) {
        return new Uint8Array(ab);
      });
      o = {
        type: "mem",
        data: buff
      };
    }
  }
  if (o.type == "file") {
    return await open(o.fileName, O_RDONLY, o.cacheSize, o.pageSize);
  } else if (o.type == "mem") {
    return await readExisting$2(o);
  } else if (o.type == "bigMem") {
    return await readExisting$1(o);
  } else {
    throw new Error("Invalid FastFile type: " + o.type);
  }
}
async function readBinFile(fileName, type, maxVersion, cacheSize, pageSize) {
  const fd = await readExisting(fileName);
  const b = await fd.read(4);
  let readedType = "";
  for (let i = 0; i < 4; i++) readedType += String.fromCharCode(b[i]);
  if (readedType != type) throw new Error(fileName + ": Invalid File format");
  let v = await fd.readULE32();
  if (v > maxVersion) throw new Error("Version not supported");
  const nSections = await fd.readULE32();
  let sections = [];
  for (let i = 0; i < nSections; i++) {
    let ht = await fd.readULE32();
    let hl = await fd.readULE64();
    if (typeof sections[ht] == "undefined") sections[ht] = [];
    sections[ht].push({
      p: fd.pos,
      size: hl
    });
    fd.pos += hl;
  }
  return { fd, sections };
}
async function createBinFile(fileName, type, version, nSections, cacheSize, pageSize) {
  const fd = await createOverride(fileName, cacheSize, pageSize);
  const buff = new Uint8Array(4);
  for (let i = 0; i < 4; i++) buff[i] = type.charCodeAt(i);
  await fd.write(buff, 0);
  await fd.writeULE32(version);
  await fd.writeULE32(nSections);
  return fd;
}
async function startWriteSection(fd, idSection) {
  if (typeof fd.writingSection !== "undefined") throw new Error("Already writing a section");
  await fd.writeULE32(idSection);
  fd.writingSection = {
    pSectionSize: fd.pos
  };
  await fd.writeULE64(0);
}
async function endWriteSection(fd) {
  if (typeof fd.writingSection === "undefined") throw new Error("Not writing a section");
  const sectionSize = fd.pos - fd.writingSection.pSectionSize - 8;
  const oldPos = fd.pos;
  fd.pos = fd.writingSection.pSectionSize;
  await fd.writeULE64(sectionSize);
  fd.pos = oldPos;
  delete fd.writingSection;
}
async function startReadUniqueSection(fd, sections, idSection) {
  if (typeof fd.readingSection !== "undefined") throw new Error("Already reading a section");
  if (!sections[idSection]) throw new Error(fd.fileName + ": Missing section " + idSection);
  if (sections[idSection].length > 1) throw new Error(fd.fileName + ": Section Duplicated " + idSection);
  fd.pos = sections[idSection][0].p;
  fd.readingSection = sections[idSection][0];
}
async function endReadSection(fd, noCheck) {
  if (typeof fd.readingSection === "undefined") throw new Error("Not reading a section");
  if (!noCheck) {
    if (fd.pos - fd.readingSection.p != fd.readingSection.size) throw new Error("Invalid section size reading");
  }
  delete fd.readingSection;
}
async function writeBigInt(fd, n, n8, pos) {
  const buff = new Uint8Array(n8);
  Scalar.toRprLE(buff, 0, n, n8);
  await fd.write(buff, pos);
}
async function readBigInt(fd, n8, pos) {
  const buff = await fd.read(n8, pos);
  return Scalar.fromRprLE(buff, 0, n8);
}
async function readSection(fd, sections, idSection, offset, length) {
  offset = typeof offset === "undefined" ? 0 : offset;
  length = typeof length === "undefined" ? sections[idSection][0].size - offset : length;
  if (offset + length > sections[idSection][0].size) {
    throw new Error("Reading out of the range of the section");
  }
  let buff;
  if (length < 1 << 30) {
    buff = new Uint8Array(length);
  } else {
    buff = new BigBuffer(length);
  }
  await fd.readToBuffer(buff, 0, length, sections[idSection][0].p + offset);
  return buff;
}
var bls12381r$1 = Scalar.e("73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001", 16);
var bn128r$1 = Scalar.e("21888242871839275222246405745257275088548364400416034343698204186575808495617");
var bls12381q2 = Scalar.e("1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab", 16);
var bn128q2 = Scalar.e("21888242871839275222246405745257275088696311157297823662689037894645226208583");
async function getCurveFromR2(r, options) {
  let curve2;
  let singleThread = options && options.singleThread;
  if (Scalar.eq(r, bn128r$1)) {
    curve2 = await buildBn128(singleThread);
  } else if (Scalar.eq(r, bls12381r$1)) {
    curve2 = await buildBls12381(singleThread);
  } else {
    throw new Error(`Curve not supported: ${Scalar.toString(r)}`);
  }
  return curve2;
}
async function getCurveFromQ(q, options) {
  let curve2;
  let singleThread = options && options.singleThread;
  if (Scalar.eq(q, bn128q2)) {
    curve2 = await buildBn128(singleThread);
  } else if (Scalar.eq(q, bls12381q2)) {
    curve2 = await buildBls12381(singleThread);
  } else {
    throw new Error(`Curve not supported: ${Scalar.toString(q)}`);
  }
  return curve2;
}
async function getCurveFromName(name, options) {
  let curve2;
  let singleThread = options && options.singleThread;
  const normName = normalizeName(name);
  if (["BN128", "BN254", "ALTBN128"].indexOf(normName) >= 0) {
    curve2 = await buildBn128(singleThread);
  } else if (["BLS12381"].indexOf(normName) >= 0) {
    curve2 = await buildBls12381(singleThread);
  } else {
    throw new Error(`Curve not supported: ${name}`);
  }
  return curve2;
  function normalizeName(n) {
    return n.toUpperCase().match(/[A-Za-z0-9]+/g).join("");
  }
}
var curves = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getCurveFromR: getCurveFromR2,
  getCurveFromQ,
  getCurveFromName
});
function number(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`positive integer expected, not ${n}`);
}
function isBytes(a) {
  return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
}
function bytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
}
function exists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function output(out, instance) {
  bytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var u322 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
var byteSwap = (word) => word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  bytes(data);
  return data;
}
var Hash = class {
  // Safe version that clones internal state
  clone() {
    return this._cloneInto();
  }
};
function wrapConstructor(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  let Ah = new Uint32Array(lst.length);
  let Al = new Uint32Array(lst.length);
  for (let i = 0; i < lst.length; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
function log22(V) {
  return ((V & 4294901760) !== 0 ? (V &= 4294901760, 16) : 0) | ((V & 4278255360) !== 0 ? (V &= 4278255360, 8) : 0) | ((V & 4042322160) !== 0 ? (V &= 4042322160, 4) : 0) | ((V & 3435973836) !== 0 ? (V &= 3435973836, 2) : 0) | (V & 2863311530) !== 0;
}
var GROTH16_PROTOCOL_ID = 1;
var PLONK_PROTOCOL_ID = 2;
var FFLONK_PROTOCOL_ID = 10;
var ZKEY_FF_HEADER_SECTION = 2;
async function readG1(fd, curve2, toObject) {
  const buff = await fd.read(curve2.G1.F.n8 * 2);
  const res = curve2.G1.fromRprLEM(buff, 0);
  return toObject ? curve2.G1.toObject(res) : res;
}
async function readG2(fd, curve2, toObject) {
  const buff = await fd.read(curve2.G2.F.n8 * 2);
  const res = curve2.G2.fromRprLEM(buff, 0);
  return toObject ? curve2.G2.toObject(res) : res;
}
async function readHeader$1(fd, sections, toObject, options) {
  await startReadUniqueSection(fd, sections, 1);
  const protocolId = await fd.readULE32();
  await endReadSection(fd);
  if (protocolId === GROTH16_PROTOCOL_ID) {
    return await readHeaderGroth16(fd, sections, toObject, options);
  } else if (protocolId === PLONK_PROTOCOL_ID) {
    return await readHeaderPlonk(fd, sections, toObject, options);
  } else if (protocolId === FFLONK_PROTOCOL_ID) {
    return await readHeaderFFlonk(fd, sections, toObject, options);
  } else {
    throw new Error("Protocol not supported: ");
  }
}
async function readHeaderGroth16(fd, sections, toObject, options) {
  const zkey = {};
  zkey.protocol = "groth16";
  await startReadUniqueSection(fd, sections, 2);
  const n8q = await fd.readULE32();
  zkey.n8q = n8q;
  zkey.q = await readBigInt(fd, n8q);
  const n8r = await fd.readULE32();
  zkey.n8r = n8r;
  zkey.r = await readBigInt(fd, n8r);
  zkey.curve = await getCurveFromQ(zkey.q, options);
  zkey.nVars = await fd.readULE32();
  zkey.nPublic = await fd.readULE32();
  zkey.domainSize = await fd.readULE32();
  zkey.power = log22(zkey.domainSize);
  zkey.vk_alpha_1 = await readG1(fd, zkey.curve, toObject);
  zkey.vk_beta_1 = await readG1(fd, zkey.curve, toObject);
  zkey.vk_beta_2 = await readG2(fd, zkey.curve, toObject);
  zkey.vk_gamma_2 = await readG2(fd, zkey.curve, toObject);
  zkey.vk_delta_1 = await readG1(fd, zkey.curve, toObject);
  zkey.vk_delta_2 = await readG2(fd, zkey.curve, toObject);
  await endReadSection(fd);
  return zkey;
}
async function readHeaderPlonk(fd, sections, toObject, options) {
  const zkey = {};
  zkey.protocol = "plonk";
  await startReadUniqueSection(fd, sections, 2);
  const n8q = await fd.readULE32();
  zkey.n8q = n8q;
  zkey.q = await readBigInt(fd, n8q);
  const n8r = await fd.readULE32();
  zkey.n8r = n8r;
  zkey.r = await readBigInt(fd, n8r);
  zkey.curve = await getCurveFromQ(zkey.q, options);
  zkey.nVars = await fd.readULE32();
  zkey.nPublic = await fd.readULE32();
  zkey.domainSize = await fd.readULE32();
  zkey.power = log22(zkey.domainSize);
  zkey.nAdditions = await fd.readULE32();
  zkey.nConstraints = await fd.readULE32();
  zkey.k1 = await fd.read(n8r);
  zkey.k2 = await fd.read(n8r);
  zkey.Qm = await readG1(fd, zkey.curve, toObject);
  zkey.Ql = await readG1(fd, zkey.curve, toObject);
  zkey.Qr = await readG1(fd, zkey.curve, toObject);
  zkey.Qo = await readG1(fd, zkey.curve, toObject);
  zkey.Qc = await readG1(fd, zkey.curve, toObject);
  zkey.S1 = await readG1(fd, zkey.curve, toObject);
  zkey.S2 = await readG1(fd, zkey.curve, toObject);
  zkey.S3 = await readG1(fd, zkey.curve, toObject);
  zkey.X_2 = await readG2(fd, zkey.curve, toObject);
  await endReadSection(fd);
  return zkey;
}
async function readHeaderFFlonk(fd, sections, toObject, options) {
  const zkey = {};
  zkey.protocol = "fflonk";
  zkey.protocolId = FFLONK_PROTOCOL_ID;
  await startReadUniqueSection(fd, sections, ZKEY_FF_HEADER_SECTION);
  const n8q = await fd.readULE32();
  zkey.n8q = n8q;
  zkey.q = await readBigInt(fd, n8q);
  zkey.curve = await getCurveFromQ(zkey.q, options);
  const n8r = await fd.readULE32();
  zkey.n8r = n8r;
  zkey.r = await readBigInt(fd, n8r);
  zkey.nVars = await fd.readULE32();
  zkey.nPublic = await fd.readULE32();
  zkey.domainSize = await fd.readULE32();
  zkey.power = log22(zkey.domainSize);
  zkey.nAdditions = await fd.readULE32();
  zkey.nConstraints = await fd.readULE32();
  zkey.k1 = await fd.read(n8r);
  zkey.k2 = await fd.read(n8r);
  zkey.w3 = await fd.read(n8r);
  zkey.w4 = await fd.read(n8r);
  zkey.w8 = await fd.read(n8r);
  zkey.wr = await fd.read(n8r);
  zkey.X_2 = await readG2(fd, zkey.curve, toObject);
  zkey.C0 = await readG1(fd, zkey.curve, toObject);
  await endReadSection(fd);
  return zkey;
}
async function write(fd, witness, prime) {
  await startWriteSection(fd, 1);
  const n8 = (Math.floor((Scalar.bitLength(prime) - 1) / 64) + 1) * 8;
  await fd.writeULE32(n8);
  await writeBigInt(fd, prime, n8);
  await fd.writeULE32(witness.length);
  await endWriteSection(fd);
  await startWriteSection(fd, 2);
  for (let i = 0; i < witness.length; i++) {
    await writeBigInt(fd, witness[i], n8);
  }
  await endWriteSection(fd);
}
async function writeBin(fd, witnessBin, prime) {
  await startWriteSection(fd, 1);
  const n8 = (Math.floor((Scalar.bitLength(prime) - 1) / 64) + 1) * 8;
  await fd.writeULE32(n8);
  await writeBigInt(fd, prime, n8);
  if (witnessBin.byteLength % n8 != 0) {
    throw new Error("Invalid witness length");
  }
  await fd.writeULE32(witnessBin.byteLength / n8);
  await endWriteSection(fd);
  await startWriteSection(fd, 2);
  await fd.write(witnessBin);
  await endWriteSection(fd);
}
async function readHeader(fd, sections) {
  await startReadUniqueSection(fd, sections, 1);
  const n8 = await fd.readULE32();
  const q = await readBigInt(fd, n8);
  const nWitness = await fd.readULE32();
  await endReadSection(fd);
  return { n8, q, nWitness };
}
async function read(fileName) {
  const { fd, sections } = await readBinFile(fileName, "wtns", 2);
  const { n8, nWitness } = await readHeader(fd, sections);
  await startReadUniqueSection(fd, sections, 2);
  const res = [];
  for (let i = 0; i < nWitness; i++) {
    const v = await readBigInt(fd, n8);
    res.push(v);
  }
  await endReadSection(fd);
  await fd.close();
  return res;
}
var { stringifyBigInts: stringifyBigInts$4 } = utils;
async function groth16Prove(zkeyFileName, witnessFileName, logger, options) {
  const { fd: fdWtns, sections: sectionsWtns } = await readBinFile(witnessFileName, "wtns", 2);
  const wtns2 = await readHeader(fdWtns, sectionsWtns);
  const { fd: fdZKey, sections: sectionsZKey } = await readBinFile(zkeyFileName, "zkey", 2);
  const zkey = await readHeader$1(fdZKey, sectionsZKey, void 0, options);
  if (zkey.protocol != "groth16") {
    throw new Error("zkey file is not groth16");
  }
  if (!Scalar.eq(zkey.r, wtns2.q)) {
    throw new Error("Curve of the witness does not match the curve of the proving key");
  }
  if (wtns2.nWitness != zkey.nVars) {
    throw new Error(`Invalid witness length. Circuit: ${zkey.nVars}, witness: ${wtns2.nWitness}`);
  }
  const curve2 = zkey.curve;
  const Fr = curve2.Fr;
  const G1 = curve2.G1;
  const G2 = curve2.G2;
  const power = log22(zkey.domainSize);
  if (logger) logger.debug("Reading Wtns");
  const buffWitness = await readSection(fdWtns, sectionsWtns, 2);
  if (logger) logger.debug("Reading Coeffs");
  const buffCoeffs = await readSection(fdZKey, sectionsZKey, 4);
  if (logger) logger.debug("Building ABC");
  const [buffA_T, buffB_T, buffC_T] = await buildABC1(curve2, zkey, buffWitness, buffCoeffs, logger);
  const inc = power == Fr.s ? curve2.Fr.shift : curve2.Fr.w[power + 1];
  const buffA = await Fr.ifft(buffA_T, "", "", logger, "IFFT_A");
  const buffAodd = await Fr.batchApplyKey(buffA, Fr.e(1), inc);
  const buffAodd_T = await Fr.fft(buffAodd, "", "", logger, "FFT_A");
  const buffB = await Fr.ifft(buffB_T, "", "", logger, "IFFT_B");
  const buffBodd = await Fr.batchApplyKey(buffB, Fr.e(1), inc);
  const buffBodd_T = await Fr.fft(buffBodd, "", "", logger, "FFT_B");
  const buffC = await Fr.ifft(buffC_T, "", "", logger, "IFFT_C");
  const buffCodd = await Fr.batchApplyKey(buffC, Fr.e(1), inc);
  const buffCodd_T = await Fr.fft(buffCodd, "", "", logger, "FFT_C");
  if (logger) logger.debug("Join ABC");
  const buffPodd_T = await joinABC(curve2, zkey, buffAodd_T, buffBodd_T, buffCodd_T, logger);
  let proof = {};
  if (logger) logger.debug("Reading A Points");
  const buffBasesA = await readSection(fdZKey, sectionsZKey, 5);
  proof.pi_a = await curve2.G1.multiExpAffine(buffBasesA, buffWitness, logger, "multiexp A");
  if (logger) logger.debug("Reading B1 Points");
  const buffBasesB1 = await readSection(fdZKey, sectionsZKey, 6);
  let pib1 = await curve2.G1.multiExpAffine(buffBasesB1, buffWitness, logger, "multiexp B1");
  if (logger) logger.debug("Reading B2 Points");
  const buffBasesB2 = await readSection(fdZKey, sectionsZKey, 7);
  proof.pi_b = await curve2.G2.multiExpAffine(buffBasesB2, buffWitness, logger, "multiexp B2");
  if (logger) logger.debug("Reading C Points");
  const buffBasesC = await readSection(fdZKey, sectionsZKey, 8);
  proof.pi_c = await curve2.G1.multiExpAffine(buffBasesC, buffWitness.slice((zkey.nPublic + 1) * curve2.Fr.n8), logger, "multiexp C");
  if (logger) logger.debug("Reading H Points");
  const buffBasesH = await readSection(fdZKey, sectionsZKey, 9);
  const resH = await curve2.G1.multiExpAffine(buffBasesH, buffPodd_T, logger, "multiexp H");
  const r = curve2.Fr.random();
  const s = curve2.Fr.random();
  proof.pi_a = G1.add(proof.pi_a, zkey.vk_alpha_1);
  proof.pi_a = G1.add(proof.pi_a, G1.timesFr(zkey.vk_delta_1, r));
  proof.pi_b = G2.add(proof.pi_b, zkey.vk_beta_2);
  proof.pi_b = G2.add(proof.pi_b, G2.timesFr(zkey.vk_delta_2, s));
  pib1 = G1.add(pib1, zkey.vk_beta_1);
  pib1 = G1.add(pib1, G1.timesFr(zkey.vk_delta_1, s));
  proof.pi_c = G1.add(proof.pi_c, resH);
  proof.pi_c = G1.add(proof.pi_c, G1.timesFr(proof.pi_a, s));
  proof.pi_c = G1.add(proof.pi_c, G1.timesFr(pib1, r));
  proof.pi_c = G1.add(proof.pi_c, G1.timesFr(zkey.vk_delta_1, Fr.neg(Fr.mul(r, s))));
  let publicSignals = [];
  for (let i = 1; i <= zkey.nPublic; i++) {
    const b = buffWitness.slice(i * Fr.n8, i * Fr.n8 + Fr.n8);
    publicSignals.push(Scalar.fromRprLE(b));
  }
  proof.pi_a = G1.toObject(G1.toAffine(proof.pi_a));
  proof.pi_b = G2.toObject(G2.toAffine(proof.pi_b));
  proof.pi_c = G1.toObject(G1.toAffine(proof.pi_c));
  proof.protocol = "groth16";
  proof.curve = curve2.name;
  await fdZKey.close();
  await fdWtns.close();
  proof = stringifyBigInts$4(proof);
  publicSignals = stringifyBigInts$4(publicSignals);
  return { proof, publicSignals };
}
async function buildABC1(curve2, zkey, witness, coeffs, logger) {
  const n8 = curve2.Fr.n8;
  const sCoef = 4 * 3 + zkey.n8r;
  const nCoef = (coeffs.byteLength - 4) / sCoef;
  const outBuffA = new BigBuffer(zkey.domainSize * n8);
  const outBuffB = new BigBuffer(zkey.domainSize * n8);
  const outBuffC = new BigBuffer(zkey.domainSize * n8);
  const outBuf = [outBuffA, outBuffB];
  for (let i = 0; i < nCoef; i++) {
    if (logger && i % 1e6 == 0) logger.debug(`QAP AB: ${i}/${nCoef}`);
    const buffCoef = coeffs.slice(4 + i * sCoef, 4 + i * sCoef + sCoef);
    const buffCoefV = new DataView(buffCoef.buffer);
    const m = buffCoefV.getUint32(0, true);
    const c = buffCoefV.getUint32(4, true);
    const s = buffCoefV.getUint32(8, true);
    const coef = buffCoef.slice(12, 12 + n8);
    outBuf[m].set(
      curve2.Fr.add(
        outBuf[m].slice(c * n8, c * n8 + n8),
        curve2.Fr.mul(coef, witness.slice(s * n8, s * n8 + n8))
      ),
      c * n8
    );
  }
  for (let i = 0; i < zkey.domainSize; i++) {
    if (logger && i % 1e6 == 0) logger.debug(`QAP C: ${i}/${zkey.domainSize}`);
    outBuffC.set(
      curve2.Fr.mul(
        outBuffA.slice(i * n8, i * n8 + n8),
        outBuffB.slice(i * n8, i * n8 + n8)
      ),
      i * n8
    );
  }
  return [outBuffA, outBuffB, outBuffC];
}
async function joinABC(curve2, zkey, a, b, c, logger) {
  const MAX_CHUNK_SIZE = 1 << 22;
  const n8 = curve2.Fr.n8;
  const nElements = Math.floor(a.byteLength / curve2.Fr.n8);
  const promises = [];
  for (let i = 0; i < nElements; i += MAX_CHUNK_SIZE) {
    if (logger) logger.debug(`JoinABC: ${i}/${nElements}`);
    const n = Math.min(nElements - i, MAX_CHUNK_SIZE);
    const task = [];
    const aChunk = a.slice(i * n8, (i + n) * n8);
    const bChunk = b.slice(i * n8, (i + n) * n8);
    const cChunk = c.slice(i * n8, (i + n) * n8);
    task.push({ cmd: "ALLOCSET", var: 0, buff: aChunk });
    task.push({ cmd: "ALLOCSET", var: 1, buff: bChunk });
    task.push({ cmd: "ALLOCSET", var: 2, buff: cChunk });
    task.push({ cmd: "ALLOC", var: 3, len: n * n8 });
    task.push({ cmd: "CALL", fnName: "qap_joinABC", params: [
      { var: 0 },
      { var: 1 },
      { var: 2 },
      { val: n },
      { var: 3 }
    ] });
    task.push({ cmd: "CALL", fnName: "frm_batchFromMontgomery", params: [
      { var: 3 },
      { val: n },
      { var: 3 }
    ] });
    task.push({ cmd: "GET", out: 0, var: 3, len: n * n8 });
    promises.push(curve2.tm.queueAction(task));
  }
  const result = await Promise.all(promises);
  let outBuff;
  if (a instanceof BigBuffer) {
    outBuff = new BigBuffer(a.byteLength);
  } else {
    outBuff = new Uint8Array(a.byteLength);
  }
  let p = 0;
  for (let i = 0; i < result.length; i++) {
    outBuff.set(result[i][0], p);
    p += result[i][0].byteLength;
  }
  return outBuff;
}
function flatArray(a) {
  let res = [];
  fillArray(res, a);
  return res;
  function fillArray(res2, a2) {
    if (Array.isArray(a2)) {
      for (let i = 0; i < a2.length; i++) {
        fillArray(res2, a2[i]);
      }
    } else {
      res2.push(a2);
    }
  }
}
function normalize(n, prime) {
  let res = BigInt(n) % prime;
  if (res < 0) res += prime;
  return res;
}
function fnvHash(str) {
  const uint64_max = BigInt(2) ** BigInt(64);
  let hash3 = BigInt("0xCBF29CE484222325");
  for (let i = 0; i < str.length; i++) {
    hash3 ^= BigInt(str[i].charCodeAt(0));
    hash3 *= BigInt(1099511628211);
    hash3 %= uint64_max;
  }
  let shash = hash3.toString(16);
  let n = 16 - shash.length;
  shash = "0".repeat(n).concat(shash);
  return shash;
}
function toArray32(s, size) {
  const res = [];
  let rem = BigInt(s);
  const radix = BigInt(4294967296);
  while (rem) {
    res.unshift(Number(rem % radix));
    rem = rem / radix;
  }
  if (size) {
    let i = size - res.length;
    while (i > 0) {
      res.unshift(0);
      i--;
    }
  }
  return res;
}
async function builder(code, options) {
  let instance;
  let wc;
  let memory;
  options = options || {};
  let majorVersion = 1;
  let minorVersion = 0;
  let patchVersion = 0;
  let codeIsWebAssemblyInstance = false;
  if (code instanceof WebAssembly.Instance) {
    instance = code;
    codeIsWebAssemblyInstance = true;
  } else {
    let memorySize = 32767;
    if (options.memorySize) {
      memorySize = parseInt(options.memorySize);
      if (memorySize < 0) {
        throw new Error("Invalid memory size");
      }
    }
    let memoryAllocated = false;
    while (!memoryAllocated) {
      try {
        memory = new WebAssembly.Memory({ initial: memorySize });
        memoryAllocated = true;
      } catch (err) {
        if (memorySize <= 1) {
          throw err;
        }
        console.warn("Could not allocate " + memorySize * 1024 * 64 + " bytes. This may cause severe instability. Trying with " + memorySize * 1024 * 64 / 2 + " bytes");
        memorySize = Math.floor(memorySize / 2);
      }
    }
    const wasmModule = await WebAssembly.compile(code);
    let errStr = "";
    let msgStr = "";
    instance = await WebAssembly.instantiate(wasmModule, {
      env: {
        "memory": memory
      },
      runtime: {
        printDebug: function(value) {
          console.log("printDebug:", value);
        },
        exceptionHandler: function(code2) {
          let err;
          if (code2 === 1) {
            err = "Signal not found. ";
          } else if (code2 === 2) {
            err = "Too many signals set. ";
          } else if (code2 === 3) {
            err = "Signal already set. ";
          } else if (code2 === 4) {
            err = "Assert Failed. ";
          } else if (code2 === 5) {
            err = "Not enough memory. ";
          } else if (code2 === 6) {
            err = "Input signal array access exceeds the size. ";
          } else {
            err = "Unknown error. ";
          }
          console.error("ERROR: ", code2, errStr);
          throw new Error(err + errStr);
        },
        // A new way of logging messages was added in Circom 2.0.7 that requires 2 new imports
        // `printErrorMessage` and `writeBufferMessage`.
        printErrorMessage: function() {
          errStr += getMessage() + "\n";
        },
        writeBufferMessage: function() {
          const msg = getMessage();
          if (msg === "\n") {
            console.log(msgStr);
            msgStr = "";
          } else {
            if (msgStr !== "") {
              msgStr += " ";
            }
            msgStr += msg;
          }
        },
        showSharedRWMemory: function() {
          const shared_rw_memory_size = instance.exports.getFieldNumLen32();
          const arr = new Uint32Array(shared_rw_memory_size);
          for (let j = 0; j < shared_rw_memory_size; j++) {
            arr[shared_rw_memory_size - 1 - j] = instance.exports.readSharedRWMemory(j);
          }
          if (majorVersion >= 2 && (minorVersion >= 1 || patchVersion >= 7)) {
            if (msgStr !== "") {
              msgStr += " ";
            }
            const msg = Scalar.fromArray(arr, 4294967296).toString();
            msgStr += msg;
          } else {
            console.log(Scalar.fromArray(arr, 4294967296));
          }
        },
        error: function(code2, pstr, a, b, c, d) {
          let errStr2;
          if (code2 === 7) {
            errStr2 = p2str(pstr) + " " + wc.getFr(b).toString() + " != " + wc.getFr(c).toString() + " " + p2str(d);
          } else if (code2 === 9) {
            errStr2 = p2str(pstr) + " " + wc.getFr(b).toString() + " " + p2str(c);
          } else if (code2 === 5 && options.sym) {
            errStr2 = p2str(pstr) + " " + options.sym.labelIdx2Name[c];
          } else {
            errStr2 = p2str(pstr) + " " + a + " " + b + " " + c + " " + d;
          }
          console.log("ERROR: ", code2, errStr2);
          throw new Error(errStr2);
        },
        log: function(a) {
          console.log(wc.getFr(a).toString());
        },
        logGetSignal: function(signal, pVal) {
          if (options.logGetSignal) {
            options.logGetSignal(signal, wc.getFr(pVal));
          }
        },
        logSetSignal: function(signal, pVal) {
          if (options.logSetSignal) {
            options.logSetSignal(signal, wc.getFr(pVal));
          }
        },
        logStartComponent: function(cIdx) {
          if (options.logStartComponent) {
            options.logStartComponent(cIdx);
          }
        },
        logFinishComponent: function(cIdx) {
          if (options.logFinishComponent) {
            options.logFinishComponent(cIdx);
          }
        }
      }
    });
  }
  if (typeof instance.exports.getVersion == "function") {
    majorVersion = instance.exports.getVersion();
  }
  if (typeof instance.exports.getMinorVersion == "function") {
    minorVersion = instance.exports.getMinorVersion();
  }
  if (typeof instance.exports.getPatchVersion == "function") {
    patchVersion = instance.exports.getPatchVersion();
  }
  const sanityCheck = options && (options.sanityCheck || options.logGetSignal || options.logSetSignal || options.logStartComponent || options.logFinishComponent);
  if (majorVersion === 2) {
    wc = new WitnessCalculatorCircom2(instance, sanityCheck);
  } else if (majorVersion === 1) {
    if (codeIsWebAssemblyInstance) {
      throw new Error("Loading code from WebAssembly instance is not supported for circom version 1");
    }
    wc = new WitnessCalculatorCircom1(memory, instance, sanityCheck);
  } else {
    throw new Error(`Unsupported circom version: ${majorVersion}`);
  }
  return wc;
  function getMessage() {
    let message = "";
    let c = instance.exports.getMessageChar();
    while (c !== 0) {
      message += String.fromCharCode(c);
      c = instance.exports.getMessageChar();
    }
    return message;
  }
  function p2str(p) {
    const i8 = new Uint8Array(memory.buffer);
    const bytes2 = [];
    for (let i = 0; i8[p + i] > 0; i++) bytes2.push(i8[p + i]);
    return String.fromCharCode.apply(null, bytes2);
  }
}
var WitnessCalculatorCircom1 = class {
  constructor(memory, instance, sanityCheck) {
    this.memory = memory;
    this.i32 = new Uint32Array(memory.buffer);
    this.instance = instance;
    this.n32 = (this.instance.exports.getFrLen() >> 2) - 2;
    const pRawPrime = this.instance.exports.getPRawPrime();
    const arr = new Array(this.n32);
    for (let i = 0; i < this.n32; i++) {
      arr[this.n32 - 1 - i] = this.i32[(pRawPrime >> 2) + i];
    }
    this.prime = Scalar.fromArray(arr, 4294967296);
    this.Fr = new ZqField(this.prime);
    this.mask32 = Scalar.fromString("FFFFFFFF", 16);
    this.NVars = this.instance.exports.getNVars();
    this.n64 = Math.floor((this.Fr.bitLength - 1) / 64) + 1;
    this.R = this.Fr.e(Scalar.shiftLeft(1, this.n64 * 64));
    this.RInv = this.Fr.inv(this.R);
    this.sanityCheck = sanityCheck;
  }
  circom_version() {
    return 1;
  }
  async _doCalculateWitness(input, sanityCheck) {
    this.instance.exports.init(this.sanityCheck || sanityCheck ? 1 : 0);
    const pSigOffset = this.allocInt();
    const pFr = this.allocFr();
    const keys = Object.keys(input);
    keys.forEach((k) => {
      const h = fnvHash(k);
      const hMSB = parseInt(h.slice(0, 8), 16);
      const hLSB = parseInt(h.slice(8, 16), 16);
      try {
        this.instance.exports.getSignalOffset32(pSigOffset, 0, hMSB, hLSB);
      } catch (err) {
        throw new Error(`Signal ${k} is not an input of the circuit.`);
      }
      const sigOffset = this.getInt(pSigOffset);
      const fArr = flatArray(input[k]);
      for (let i = 0; i < fArr.length; i++) {
        this.setFr(pFr, fArr[i]);
        this.instance.exports.setSignal(0, 0, sigOffset + i, pFr);
      }
    });
  }
  async calculateWitness(input, sanityCheck) {
    const self = this;
    const old0 = self.i32[0];
    const w = [];
    await self._doCalculateWitness(input, sanityCheck);
    for (let i = 0; i < self.NVars; i++) {
      const pWitness = self.instance.exports.getPWitness(i);
      w.push(self.getFr(pWitness));
    }
    self.i32[0] = old0;
    return w;
  }
  async calculateBinWitness(input, sanityCheck) {
    const self = this;
    const old0 = self.i32[0];
    await self._doCalculateWitness(input, sanityCheck);
    const pWitnessBuffer = self.instance.exports.getWitnessBuffer();
    self.i32[0] = old0;
    const buff = self.memory.buffer.slice(pWitnessBuffer, pWitnessBuffer + self.NVars * self.n64 * 8);
    return new Uint8Array(buff);
  }
  allocInt() {
    const p = this.i32[0];
    this.i32[0] = p + 8;
    return p;
  }
  allocFr() {
    const p = this.i32[0];
    this.i32[0] = p + this.n32 * 4 + 8;
    return p;
  }
  getInt(p) {
    return this.i32[p >> 2];
  }
  setInt(p, v) {
    this.i32[p >> 2] = v;
  }
  getFr(p) {
    const self = this;
    const idx = p >> 2;
    if (self.i32[idx + 1] & 2147483648) {
      const arr = new Array(self.n32);
      for (let i = 0; i < self.n32; i++) {
        arr[self.n32 - 1 - i] = self.i32[idx + 2 + i];
      }
      const res = self.Fr.e(Scalar.fromArray(arr, 4294967296));
      if (self.i32[idx + 1] & 1073741824) {
        return fromMontgomery(res);
      } else {
        return res;
      }
    } else {
      if (self.i32[idx] & 2147483648) {
        return self.Fr.e(self.i32[idx] - 4294967296);
      } else {
        return self.Fr.e(self.i32[idx]);
      }
    }
    function fromMontgomery(n) {
      return self.Fr.mul(self.RInv, n);
    }
  }
  setFr(p, v) {
    const self = this;
    v = self.Fr.e(v);
    const minShort = self.Fr.neg(self.Fr.e("80000000", 16));
    const maxShort = self.Fr.e("7FFFFFFF", 16);
    if (self.Fr.geq(v, minShort) && self.Fr.leq(v, maxShort)) {
      let a;
      if (self.Fr.geq(v, self.Fr.zero)) {
        a = Scalar.toNumber(v);
      } else {
        a = Scalar.toNumber(self.Fr.sub(v, minShort));
        a = a - 2147483648;
        a = 4294967296 + a;
      }
      self.i32[p >> 2] = a;
      self.i32[(p >> 2) + 1] = 0;
      return;
    }
    self.i32[p >> 2] = 0;
    self.i32[(p >> 2) + 1] = 2147483648;
    const arr = Scalar.toArray(v, 4294967296);
    for (let i = 0; i < self.n32; i++) {
      const idx = arr.length - 1 - i;
      if (idx >= 0) {
        self.i32[(p >> 2) + 2 + i] = arr[idx];
      } else {
        self.i32[(p >> 2) + 2 + i] = 0;
      }
    }
  }
};
var WitnessCalculatorCircom2 = class {
  constructor(instance, sanityCheck) {
    this.instance = instance;
    this.version = this.instance.exports.getVersion();
    this.n32 = this.instance.exports.getFieldNumLen32();
    this.instance.exports.getRawPrime();
    const arr = new Uint32Array(this.n32);
    for (let i = 0; i < this.n32; i++) {
      arr[this.n32 - 1 - i] = this.instance.exports.readSharedRWMemory(i);
    }
    this.prime = Scalar.fromArray(arr, 4294967296);
    this.witnessSize = this.instance.exports.getWitnessSize();
    this.sanityCheck = sanityCheck;
  }
  circom_version() {
    return this.instance.exports.getVersion();
  }
  async _doCalculateWitness(input, sanityCheck) {
    this.instance.exports.init(this.sanityCheck || sanityCheck ? 1 : 0);
    const keys = Object.keys(input);
    let input_counter = 0;
    keys.forEach((k) => {
      const h = fnvHash(k);
      const hMSB = parseInt(h.slice(0, 8), 16);
      const hLSB = parseInt(h.slice(8, 16), 16);
      const fArr = flatArray(input[k]);
      if (typeof this.instance.exports.getInputSignalSize === "function") {
        let signalSize = this.instance.exports.getInputSignalSize(hMSB, hLSB);
        if (signalSize < 0) {
          throw new Error(`Signal ${k} not found
`);
        }
        if (fArr.length < signalSize) {
          throw new Error(`Not enough values for input signal ${k}
`);
        }
        if (fArr.length > signalSize) {
          throw new Error(`Too many values for input signal ${k}
`);
        }
      }
      for (let i = 0; i < fArr.length; i++) {
        const arrFr = toArray32(normalize(fArr[i], this.prime), this.n32);
        for (let j = 0; j < this.n32; j++) {
          this.instance.exports.writeSharedRWMemory(j, arrFr[this.n32 - 1 - j]);
        }
        try {
          this.instance.exports.setInputSignal(hMSB, hLSB, i);
          input_counter++;
        } catch (err) {
          throw new Error(err);
        }
      }
    });
    if (input_counter < this.instance.exports.getInputSize()) {
      throw new Error(`Not all inputs have been set. Only ${input_counter} out of ${this.instance.exports.getInputSize()}`);
    }
  }
  async calculateWitness(input, sanityCheck) {
    const w = [];
    await this._doCalculateWitness(input, sanityCheck);
    for (let i = 0; i < this.witnessSize; i++) {
      this.instance.exports.getWitness(i);
      const arr = new Uint32Array(this.n32);
      for (let j = 0; j < this.n32; j++) {
        arr[this.n32 - 1 - j] = this.instance.exports.readSharedRWMemory(j);
      }
      w.push(Scalar.fromArray(arr, 4294967296));
    }
    return w;
  }
  async calculateWTNSBin(input, sanityCheck) {
    const buff32 = new Uint32Array(this.witnessSize * this.n32 + this.n32 + 11);
    const buff = new Uint8Array(buff32.buffer);
    await this._doCalculateWitness(input, sanityCheck);
    buff[0] = "w".charCodeAt(0);
    buff[1] = "t".charCodeAt(0);
    buff[2] = "n".charCodeAt(0);
    buff[3] = "s".charCodeAt(0);
    buff32[1] = 2;
    buff32[2] = 2;
    buff32[3] = 1;
    const n8 = this.n32 * 4;
    const idSection1length = 8 + n8;
    const idSection1lengthHex = idSection1length.toString(16);
    buff32[4] = parseInt(idSection1lengthHex.slice(0, 8), 16);
    buff32[5] = parseInt(idSection1lengthHex.slice(8, 16), 16);
    buff32[6] = n8;
    this.instance.exports.getRawPrime();
    let pos = 7;
    for (let j = 0; j < this.n32; j++) {
      buff32[pos + j] = this.instance.exports.readSharedRWMemory(j);
    }
    pos += this.n32;
    buff32[pos] = this.witnessSize;
    pos++;
    buff32[pos] = 2;
    pos++;
    const idSection2length = n8 * this.witnessSize;
    const idSection2lengthHex = idSection2length.toString(16);
    buff32[pos] = parseInt(idSection2lengthHex.slice(0, 8), 16);
    buff32[pos + 1] = parseInt(idSection2lengthHex.slice(8, 16), 16);
    pos += 2;
    for (let i = 0; i < this.witnessSize; i++) {
      this.instance.exports.getWitness(i);
      for (let j = 0; j < this.n32; j++) {
        buff32[pos + j] = this.instance.exports.readSharedRWMemory(j);
      }
      pos += this.n32;
    }
    return buff;
  }
};
var { unstringifyBigInts: unstringifyBigInts$b } = utils;
async function wtnsCalculate(_input, wasmFileName, wtnsFileName, options) {
  const input = unstringifyBigInts$b(_input);
  const fdWasm = await readExisting(wasmFileName);
  const wasm = await fdWasm.read(fdWasm.totalSize);
  await fdWasm.close();
  const wc = await builder(wasm, options);
  if (wc.circom_version() === 1) {
    const w = await wc.calculateBinWitness(input);
    const fdWtns = await createBinFile(wtnsFileName, "wtns", 2, 2);
    await writeBin(fdWtns, w, wc.prime);
    await fdWtns.close();
  } else {
    const fdWtns = await createOverride(wtnsFileName);
    const w = await wc.calculateWTNSBin(input);
    await fdWtns.write(w);
    await fdWtns.close();
  }
}
var { unstringifyBigInts: unstringifyBigInts$a } = utils;
async function groth16FullProve(_input, wasmFile, zkeyFileName, logger, wtnsCalcOptions, proverOptions) {
  const input = unstringifyBigInts$a(_input);
  const wtns2 = {
    type: "mem"
  };
  await wtnsCalculate(input, wasmFile, wtns2, wtnsCalcOptions);
  return await groth16Prove(zkeyFileName, wtns2, logger, proverOptions);
}
var { unstringifyBigInts: unstringifyBigInts$9 } = utils;
async function groth16Verify(_vk_verifier, _publicSignals, _proof, logger) {
  const vk_verifier = unstringifyBigInts$9(_vk_verifier);
  const proof = unstringifyBigInts$9(_proof);
  const publicSignals = unstringifyBigInts$9(_publicSignals);
  const curve2 = await getCurveFromName(vk_verifier.curve);
  const IC0 = curve2.G1.fromObject(vk_verifier.IC[0]);
  const IC = new Uint8Array(curve2.G1.F.n8 * 2 * publicSignals.length);
  const w = new Uint8Array(curve2.Fr.n8 * publicSignals.length);
  if (!publicInputsAreValid$2(curve2, publicSignals)) {
    if (logger) logger.error("Public inputs are not valid.");
    return false;
  }
  for (let i = 0; i < publicSignals.length; i++) {
    const buffP = curve2.G1.fromObject(vk_verifier.IC[i + 1]);
    IC.set(buffP, i * curve2.G1.F.n8 * 2);
    Scalar.toRprLE(w, curve2.Fr.n8 * i, publicSignals[i], curve2.Fr.n8);
  }
  let cpub = await curve2.G1.multiExpAffine(IC, w);
  cpub = curve2.G1.add(cpub, IC0);
  const pi_a = curve2.G1.fromObject(proof.pi_a);
  const pi_b = curve2.G2.fromObject(proof.pi_b);
  const pi_c = curve2.G1.fromObject(proof.pi_c);
  if (!isWellConstructed$1(curve2, { pi_a, pi_b, pi_c })) {
    if (logger) logger.error("Proof commitments are not valid.");
    return false;
  }
  const vk_gamma_2 = curve2.G2.fromObject(vk_verifier.vk_gamma_2);
  const vk_delta_2 = curve2.G2.fromObject(vk_verifier.vk_delta_2);
  const vk_alpha_1 = curve2.G1.fromObject(vk_verifier.vk_alpha_1);
  const vk_beta_2 = curve2.G2.fromObject(vk_verifier.vk_beta_2);
  const res = await curve2.pairingEq(
    curve2.G1.neg(pi_a),
    pi_b,
    cpub,
    vk_gamma_2,
    pi_c,
    vk_delta_2,
    vk_alpha_1,
    vk_beta_2
  );
  if (!res) {
    if (logger) logger.error("Invalid proof");
    return false;
  }
  if (logger) logger.info("OK!");
  return true;
}
function isWellConstructed$1(curve2, proof) {
  const G1 = curve2.G1;
  const G2 = curve2.G2;
  return G1.isValid(proof.pi_a) && G2.isValid(proof.pi_b) && G1.isValid(proof.pi_c);
}
function checkValueBelongToField$2(curve2, value) {
  return Scalar.geq(value, 0) && Scalar.lt(value, curve2.r);
}
function publicInputsAreValid$2(curve2, publicInputs) {
  for (let i = 0; i < publicInputs.length; i++) {
    if (!checkValueBelongToField$2(curve2, publicInputs[i])) {
      return false;
    }
  }
  return true;
}
var { unstringifyBigInts: unstringifyBigInts$8 } = utils;
function p256$2(n) {
  let nstr = n.toString(16);
  while (nstr.length < 64) nstr = "0" + nstr;
  nstr = `"0x${nstr}"`;
  return nstr;
}
async function groth16ExportSolidityCallData(_proof, _pub) {
  const proof = unstringifyBigInts$8(_proof);
  const pub = unstringifyBigInts$8(_pub);
  let inputs = "";
  for (let i = 0; i < pub.length; i++) {
    if (inputs != "") inputs = inputs + ",";
    inputs = inputs + p256$2(pub[i]);
  }
  let S;
  S = `[${p256$2(proof.pi_a[0])}, ${p256$2(proof.pi_a[1])}],[[${p256$2(proof.pi_b[0][1])}, ${p256$2(proof.pi_b[0][0])}],[${p256$2(proof.pi_b[1][1])}, ${p256$2(proof.pi_b[1][0])}]],[${p256$2(proof.pi_c[0])}, ${p256$2(proof.pi_c[1])}],[${inputs}]`;
  return S;
}
var groth16 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  fullProve: groth16FullProve,
  prove: groth16Prove,
  verify: groth16Verify,
  exportSolidityCallData: groth16ExportSolidityCallData
});
var SUBARRAY_SIZE$1 = 262144;
var BigArrayHandler$1 = {
  get: function(obj, prop) {
    if (!isNaN(prop)) {
      return obj.getElement(prop);
    } else return obj[prop];
  },
  set: function(obj, prop, value) {
    if (!isNaN(prop)) {
      return obj.setElement(prop, value);
    } else {
      obj[prop] = value;
      return true;
    }
  }
};
var _BigArray$1 = class {
  constructor(initSize) {
    this.length = initSize || 0;
    this.arr = new Array(SUBARRAY_SIZE$1);
    for (let i = 0; i < initSize; i += SUBARRAY_SIZE$1) {
      this.arr[i / SUBARRAY_SIZE$1] = new Array(Math.min(SUBARRAY_SIZE$1, initSize - i));
    }
    return this;
  }
  push() {
    for (let i = 0; i < arguments.length; i++) {
      this.setElement(this.length, arguments[i]);
    }
  }
  slice(f, t) {
    const arr = new Array(t - f);
    for (let i = f; i < t; i++) arr[i - f] = this.getElement(i);
    return arr;
  }
  getElement(idx) {
    idx = parseInt(idx);
    const idx1 = Math.floor(idx / SUBARRAY_SIZE$1);
    const idx2 = idx % SUBARRAY_SIZE$1;
    return this.arr[idx1] ? this.arr[idx1][idx2] : void 0;
  }
  setElement(idx, value) {
    idx = parseInt(idx);
    const idx1 = Math.floor(idx / SUBARRAY_SIZE$1);
    if (!this.arr[idx1]) {
      this.arr[idx1] = new Array(SUBARRAY_SIZE$1);
    }
    const idx2 = idx % SUBARRAY_SIZE$1;
    this.arr[idx1][idx2] = value;
    if (idx >= this.length) this.length = idx + 1;
    return true;
  }
  getKeys() {
    const newA = new BigArray$2();
    for (let i = 0; i < this.arr.length; i++) {
      if (this.arr[i]) {
        for (let j = 0; j < this.arr[i].length; j++) {
          if (typeof this.arr[i][j] !== "undefined") {
            newA.push(i * SUBARRAY_SIZE$1 + j);
          }
        }
      }
    }
    return newA;
  }
};
var BigArray$2 = class {
  constructor(initSize) {
    const obj = new _BigArray$1(initSize);
    const extObj = new Proxy(obj, BigArrayHandler$1);
    return extObj;
  }
};
var BigArray$3 = BigArray$2;
var R1CS_FILE_CUSTOM_GATES_LIST_SECTION = 4;
var R1CS_FILE_CUSTOM_GATES_USES_SECTION = 5;
async function readR1csHeader(fd, sections, singleThread) {
  let options;
  if (typeof singleThread === "object") {
    options = singleThread;
  } else if (typeof singleThread === "undefined") {
    options = {
      singleThread: false
    };
  } else {
    options = {
      singleThread
    };
  }
  const res = {};
  await startReadUniqueSection(fd, sections, 1);
  res.n8 = await fd.readULE32();
  res.prime = await readBigInt(fd, res.n8);
  if (options.F) {
    if (options.F.p != res.prime) throw new Error("Different Prime");
    res.F = options.F;
  } else if (options.getFieldFromPrime) {
    res.F = await options.getFieldFromPrime(res.prime, options.singleThread);
  } else if (options.getCurveFromPrime) {
    res.curve = await options.getCurveFromPrime(res.prime, options.singleThread);
    res.F = res.curve.Fr;
  } else {
    try {
      res.curve = await getCurveFromR(res.prime, options.singleThread);
      res.F = res.curve.Fr;
    } catch (err) {
      res.F = new ZqField(res.prime);
    }
  }
  res.nVars = await fd.readULE32();
  res.nOutputs = await fd.readULE32();
  res.nPubInputs = await fd.readULE32();
  res.nPrvInputs = await fd.readULE32();
  res.nLabels = await fd.readULE64();
  res.nConstraints = await fd.readULE32();
  res.useCustomGates = typeof sections[R1CS_FILE_CUSTOM_GATES_LIST_SECTION] !== "undefined" && sections[R1CS_FILE_CUSTOM_GATES_LIST_SECTION] !== null && typeof sections[R1CS_FILE_CUSTOM_GATES_USES_SECTION] !== "undefined" && sections[R1CS_FILE_CUSTOM_GATES_USES_SECTION] !== null;
  await endReadSection(fd);
  return res;
}
async function readConstraints(fd, sections, r1cs, logger, loggerCtx) {
  let options;
  if (typeof logger === "object") {
    options = logger;
  } else if (typeof logger === "undefined") {
    options = {};
  } else {
    options = {
      logger,
      loggerCtx
    };
  }
  const bR1cs = await readSection(fd, sections, 2);
  let bR1csPos = 0;
  let constraints;
  if (r1cs.nConstraints > 1 << 20) {
    constraints = new BigArray$3();
  } else {
    constraints = [];
  }
  for (let i = 0; i < r1cs.nConstraints; i++) {
    if (options.logger && i % 1e5 == 0) options.logger.info(`${options.loggerCtx}: Loading constraints: ${i}/${r1cs.nConstraints}`);
    const c = readConstraint();
    constraints.push(c);
  }
  return constraints;
  function readConstraint() {
    const c = [];
    c[0] = readLC();
    c[1] = readLC();
    c[2] = readLC();
    return c;
  }
  function readLC() {
    const lc = {};
    const buffUL32 = bR1cs.slice(bR1csPos, bR1csPos + 4);
    bR1csPos += 4;
    const buffUL32V = new DataView(buffUL32.buffer);
    const nIdx = buffUL32V.getUint32(0, true);
    const buff = bR1cs.slice(bR1csPos, bR1csPos + (4 + r1cs.n8) * nIdx);
    bR1csPos += (4 + r1cs.n8) * nIdx;
    const buffV = new DataView(buff.buffer);
    for (let i = 0; i < nIdx; i++) {
      const idx = buffV.getUint32(i * (4 + r1cs.n8), true);
      const val = r1cs.F.fromRprLE(buff, i * (4 + r1cs.n8) + 4);
      lc[idx] = val;
    }
    return lc;
  }
}
async function readMap(fd, sections, r1cs, logger, loggerCtx) {
  let options;
  if (typeof logger === "object") {
    options = logger;
  } else if (typeof logger === "undefined") {
    options = {};
  } else {
    options = {
      logger,
      loggerCtx
    };
  }
  const bMap = await readSection(fd, sections, 3);
  let bMapPos = 0;
  let map;
  if (r1cs.nVars > 1 << 20) {
    map = new BigArray$3();
  } else {
    map = [];
  }
  for (let i = 0; i < r1cs.nVars; i++) {
    if (options.logger && i % 1e4 == 0) options.logger.info(`${options.loggerCtx}: Loading map: ${i}/${r1cs.nVars}`);
    const idx = readULE64();
    map.push(idx);
  }
  return map;
  function readULE64() {
    const buffULE64 = bMap.slice(bMapPos, bMapPos + 8);
    bMapPos += 8;
    const buffULE64V = new DataView(buffULE64.buffer);
    const LSB = buffULE64V.getUint32(0, true);
    const MSB = buffULE64V.getUint32(4, true);
    return MSB * 4294967296 + LSB;
  }
}
async function readR1csFd(fd, sections, options) {
  if (typeof options !== "object") {
    throw new Error("readR1csFd: options must be an object");
  }
  options.loadConstraints = "loadConstraints" in options ? options.loadConstraints : true;
  options.loadMap = "loadMap" in options ? options.loadMap : false;
  options.loadCustomGates = "loadCustomGates" in options ? options.loadCustomGates : true;
  const res = await readR1csHeader(fd, sections, options);
  if (options.loadConstraints) {
    res.constraints = await readConstraints(fd, sections, res, options);
  }
  if (options.loadMap) {
    res.map = await readMap(fd, sections, res, options);
  }
  if (options.loadCustomGates) {
    if (res.useCustomGates) {
      res.customGates = await readCustomGatesListSection(fd, sections, res);
      res.customGatesUses = await readCustomGatesUsesSection(fd, sections, options);
    } else {
      res.customGates = [];
      res.customGatesUses = [];
    }
  }
  return res;
}
async function readCustomGatesListSection(fd, sections, res) {
  await startReadUniqueSection(fd, sections, R1CS_FILE_CUSTOM_GATES_LIST_SECTION);
  let num = await fd.readULE32();
  let customGates = [];
  for (let i = 0; i < num; i++) {
    let customGate = {};
    customGate.templateName = await fd.readString();
    let numParameters = await fd.readULE32();
    customGate.parameters = Array(numParameters);
    let buff = await fd.read(res.n8 * numParameters);
    for (let j = 0; j < numParameters; j++) {
      customGate.parameters[j] = res.F.fromRprLE(buff, j * res.n8, res.n8);
    }
    customGates.push(customGate);
  }
  await endReadSection(fd);
  return customGates;
}
async function readCustomGatesUsesSection(fd, sections, options) {
  const bR1cs = await readSection(fd, sections, R1CS_FILE_CUSTOM_GATES_USES_SECTION);
  const bR1cs32 = new Uint32Array(bR1cs.buffer, bR1cs.byteOffset, bR1cs.byteLength / 4);
  const nCustomGateUses = bR1cs32[0];
  let bR1csPos = 1;
  let customGatesUses;
  if (nCustomGateUses > 1 << 20) {
    customGatesUses = new BigArray$3();
  } else {
    customGatesUses = [];
  }
  for (let i = 0; i < nCustomGateUses; i++) {
    if (options.logger && i % 1e5 == 0) options.logger.info(`${options.loggerCtx}: Loading custom gate uses: ${i}/${nCustomGateUses}`);
    let c = {};
    c.id = bR1cs32[bR1csPos++];
    let numSignals = bR1cs32[bR1csPos++];
    c.signals = [];
    for (let j = 0; j < numSignals; j++) {
      const LSB = bR1cs32[bR1csPos++];
      const MSB = bR1cs32[bR1csPos++];
      c.signals.push(MSB * 4294967296 + LSB);
    }
    customGatesUses.push(c);
  }
  return customGatesUses;
}
var bls12381r2 = Scalar.e("73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001", 16);
var bn128r2 = Scalar.e("21888242871839275222246405745257275088548364400416034343698204186575808495617");
async function loadSymbols(symFileName) {
  const sym = {
    labelIdx2Name: ["one"],
    varIdx2Name: ["one"],
    componentIdx2Name: []
  };
  const fd = await readExisting(symFileName);
  const buff = await fd.read(fd.totalSize);
  const symsStr = new TextDecoder("utf-8").decode(buff);
  const lines = symsStr.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const arr = lines[i].split(",");
    if (arr.length != 4) continue;
    if (sym.varIdx2Name[arr[1]]) {
      sym.varIdx2Name[arr[1]] += "|" + arr[3];
    } else {
      sym.varIdx2Name[arr[1]] = arr[3];
    }
    sym.labelIdx2Name[arr[0]] = arr[3];
    if (!sym.componentIdx2Name[arr[2]]) {
      sym.componentIdx2Name[arr[2]] = extractComponent(arr[3]);
    }
  }
  await fd.close();
  return sym;
  function extractComponent(name) {
    const arr = name.split(".");
    arr.pop();
    return arr.join(".");
  }
}
var { unstringifyBigInts: unstringifyBigInts$7 } = utils;
async function wtnsDebug(_input, wasmFileName, wtnsFileName, symName, options, logger) {
  const input = unstringifyBigInts$7(_input);
  const fdWasm = await readExisting(wasmFileName);
  const wasm = await fdWasm.read(fdWasm.totalSize);
  await fdWasm.close();
  const wcOps = { ...options, sanityCheck: true };
  let sym = await loadSymbols(symName);
  if (options.set) {
    if (!sym) sym = await loadSymbols(symName);
    wcOps.logSetSignal = function(labelIdx, value) {
      if (logger) logger.info("SET " + sym.labelIdx2Name[labelIdx] + " <-- " + value.toString());
    };
  }
  if (options.get) {
    if (!sym) sym = await loadSymbols(symName);
    wcOps.logGetSignal = function(varIdx, value) {
      if (logger) logger.info("GET " + sym.labelIdx2Name[varIdx] + " --> " + value.toString());
    };
  }
  if (options.trigger) {
    if (!sym) sym = await loadSymbols(symName);
    wcOps.logStartComponent = function(cIdx) {
      if (logger) logger.info("START: " + sym.componentIdx2Name[cIdx]);
    };
    wcOps.logFinishComponent = function(cIdx) {
      if (logger) logger.info("FINISH: " + sym.componentIdx2Name[cIdx]);
    };
  }
  wcOps.sym = sym;
  const wc = await builder(wasm, wcOps);
  const w = await wc.calculateWitness(input, true);
  const fdWtns = await createBinFile(wtnsFileName, "wtns", 2, 2);
  await write(fdWtns, w, wc.prime);
  await fdWtns.close();
}
async function wtnsExportJson(wtnsFileName) {
  const w = await read(wtnsFileName);
  return w;
}
async function wtnsCheck(r1csFilename, wtnsFilename, logger) {
  if (logger) logger.info("WITNESS CHECKING STARTED");
  if (logger) logger.info("> Reading r1cs file");
  const {
    fd: fdR1cs,
    sections: sectionsR1cs
  } = await readBinFile(r1csFilename, "r1cs", 1);
  const r1cs = await readR1csFd(fdR1cs, sectionsR1cs, { loadConstraints: false, loadCustomGates: false });
  if (logger) logger.info("> Reading witness file");
  const {
    fd: fdWtns,
    sections: wtnsSections
  } = await readBinFile(wtnsFilename, "wtns", 2);
  const wtnsHeader = await readHeader(fdWtns, wtnsSections);
  if (!Scalar.eq(r1cs.prime, wtnsHeader.q)) {
    throw new Error("Curve of the witness does not match the curve of the proving key");
  }
  const buffWitness = await readSection(fdWtns, wtnsSections, 2);
  await fdWtns.close();
  const curve2 = await getCurveFromR2(r1cs.prime);
  const Fr = curve2.Fr;
  const sFr = Fr.n8;
  const bR1cs = await readSection(fdR1cs, sectionsR1cs, 2);
  if (logger) {
    logger.info("----------------------------");
    logger.info("  WITNESS CHECK");
    logger.info(`  Curve:          ${r1cs.curve.name}`);
    logger.info(`  Vars (wires):   ${r1cs.nVars}`);
    logger.info(`  Outputs:        ${r1cs.nOutputs}`);
    logger.info(`  Public Inputs:  ${r1cs.nPubInputs}`);
    logger.info(`  Private Inputs: ${r1cs.nPrvInputs}`);
    logger.info(`  Labels:         ${r1cs.nLabels}`);
    logger.info(`  Constraints:    ${r1cs.nConstraints}`);
    logger.info(`  Custom Gates:   ${r1cs.useCustomGates}`);
    logger.info("----------------------------");
  }
  if (logger) logger.info("> Checking witness correctness");
  let bR1csPos = 0;
  let res = true;
  for (let i = 0; i < r1cs.nConstraints; i++) {
    if (logger && i !== 0 && i % 5e5 === 0) {
      logger.info(`\xB7\xB7\xB7 processing r1cs constraints ${i}/${r1cs.nConstraints}`);
    }
    const lcA = readLC();
    const lcB = readLC();
    const lcC = readLC();
    const evalA = EvaluateLinearCombination(lcA);
    const evalB = EvaluateLinearCombination(lcB);
    const evalC = EvaluateLinearCombination(lcC);
    if (!Fr.eq(Fr.sub(Fr.mul(evalA, evalB), evalC), Fr.zero)) {
      logger.warn("\xB7\xB7\xB7 aborting checking process at constraint " + i);
      res = false;
      break;
    }
  }
  fdR1cs.close();
  if (logger) {
    if (res) {
      logger.info("WITNESS IS CORRECT");
      logger.info("WITNESS CHECKING FINISHED SUCCESSFULLY");
    } else {
      logger.warn("WITNESS IS NOT CORRECT");
      logger.warn("WITNESS CHECKING FINISHED UNSUCCESSFULLY");
    }
  }
  return res;
  function EvaluateLinearCombination(lc) {
    let res2 = Fr.zero;
    const keys = Object.keys(lc);
    keys.forEach((signalId) => {
      const signalValue = getWitnessValue(signalId);
      const signalFactor = lc[signalId];
      res2 = Fr.add(res2, Fr.mul(signalValue, signalFactor));
    });
    return res2;
  }
  function readLC() {
    const lc = {};
    const buffUL32 = bR1cs.slice(bR1csPos, bR1csPos + 4);
    bR1csPos += 4;
    const buffUL32V = new DataView(buffUL32.buffer);
    const nIdx = buffUL32V.getUint32(0, true);
    const buff = bR1cs.slice(bR1csPos, bR1csPos + (4 + r1cs.n8) * nIdx);
    bR1csPos += (4 + r1cs.n8) * nIdx;
    const buffV = new DataView(buff.buffer);
    for (let i = 0; i < nIdx; i++) {
      const idx = buffV.getUint32(i * (4 + r1cs.n8), true);
      const val = r1cs.F.fromRprLE(buff, i * (4 + r1cs.n8) + 4);
      lc[idx] = val;
    }
    return lc;
  }
  function getWitnessValue(signalId) {
    return Fr.fromRprLE(buffWitness.slice(signalId * sFr, signalId * sFr + sFr));
  }
}
var wtns = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  calculate: wtnsCalculate,
  debug: wtnsDebug,
  exportJson: wtnsExportJson,
  check: wtnsCheck
});
var { stringifyBigInts: stringifyBigInts$3 } = utils;
var { unstringifyBigInts: unstringifyBigInts$6, stringifyBigInts: stringifyBigInts$2 } = utils;
var SHA3_PI = [];
var SHA3_ROTL = [];
var _SHA3_IOTA = [];
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _7n = /* @__PURE__ */ BigInt(7);
var _256n = /* @__PURE__ */ BigInt(256);
var _0x71n = /* @__PURE__ */ BigInt(113);
for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
  [x, y] = [y, (2 * x + 3 * y) % 5];
  SHA3_PI.push(2 * (5 * y + x));
  SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
  let t = _0n;
  for (let j = 0; j < 7; j++) {
    R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
    if (R & _2n)
      t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
  }
  _SHA3_IOTA.push(t);
}
var [SHA3_IOTA_H, SHA3_IOTA_L] = /* @__PURE__ */ split(_SHA3_IOTA, true);
var rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
var rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  B.fill(0);
}
var Keccak = class _Keccak extends Hash {
  // NOTE: we accept arguments in bytes instead of bits here.
  constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
    super();
    this.blockLen = blockLen;
    this.suffix = suffix;
    this.outputLen = outputLen;
    this.enableXOF = enableXOF;
    this.rounds = rounds;
    this.pos = 0;
    this.posOut = 0;
    this.finished = false;
    this.destroyed = false;
    number(outputLen);
    if (0 >= this.blockLen || this.blockLen >= 200)
      throw new Error("Sha3 supports only keccak-f1600 function");
    this.state = new Uint8Array(200);
    this.state32 = u322(this.state);
  }
  keccak() {
    if (!isLE)
      byteSwap32(this.state32);
    keccakP(this.state32, this.rounds);
    if (!isLE)
      byteSwap32(this.state32);
    this.posOut = 0;
    this.pos = 0;
  }
  update(data) {
    exists(this);
    const { blockLen, state } = this;
    data = toBytes(data);
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      for (let i = 0; i < take; i++)
        state[this.pos++] ^= data[pos++];
      if (this.pos === blockLen)
        this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = true;
    const { state, suffix, pos, blockLen } = this;
    state[pos] ^= suffix;
    if ((suffix & 128) !== 0 && pos === blockLen - 1)
      this.keccak();
    state[blockLen - 1] ^= 128;
    this.keccak();
  }
  writeInto(out) {
    exists(this, false);
    bytes(out);
    this.finish();
    const bufferOut = this.state;
    const { blockLen } = this;
    for (let pos = 0, len = out.length; pos < len; ) {
      if (this.posOut >= blockLen)
        this.keccak();
      const take = Math.min(blockLen - this.posOut, len - pos);
      out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
      this.posOut += take;
      pos += take;
    }
    return out;
  }
  xofInto(out) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible for this instance");
    return this.writeInto(out);
  }
  xof(bytes2) {
    number(bytes2);
    return this.xofInto(new Uint8Array(bytes2));
  }
  digestInto(out) {
    output(out, this);
    if (this.finished)
      throw new Error("digest() was already called");
    this.writeInto(out);
    this.destroy();
    return out;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    this.destroyed = true;
    this.state.fill(0);
  }
  _cloneInto(to) {
    const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
    to || (to = new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
    to.state32.set(this.state32);
    to.pos = this.pos;
    to.posOut = this.posOut;
    to.finished = this.finished;
    to.rounds = rounds;
    to.suffix = suffix;
    to.outputLen = outputLen;
    to.enableXOF = enableXOF;
    to.destroyed = this.destroyed;
    return to;
  }
};
var gen = (suffix, blockLen, outputLen) => wrapConstructor(() => new Keccak(blockLen, suffix, outputLen));
var keccak_256 = /* @__PURE__ */ gen(1, 136, 256 / 8);
var { stringifyBigInts: stringifyBigInts$1 } = utils;
var { unstringifyBigInts: unstringifyBigInts$5 } = utils;
var { unstringifyBigInts: unstringifyBigInts$4 } = utils;
var { unstringifyBigInts: unstringifyBigInts$3 } = utils;
var { stringifyBigInts: stringifyBigInts2 } = utils;
var { unstringifyBigInts: unstringifyBigInts$2 } = utils;
var { unstringifyBigInts: unstringifyBigInts$1 } = utils;
var { unstringifyBigInts: unstringifyBigInts2 } = utils;

// sdk/client/crypto.ts
function canonical(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return JSON.stringify(value);
  if (typeof value === "number" && Number.isSafeInteger(value))
    return String(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (typeof value === "object" && value && Object.getPrototypeOf(value) === Object.prototype)
    return `{${Object.keys(value).sort().map(
      (k) => `${JSON.stringify(k)}:${canonical(value[k])}`
    ).join(",")}}`;
  throw new Error("Unsupported public JSON value");
}
var hex = (bytes2) => [...bytes2].map((b) => b.toString(16).padStart(2, "0")).join("");
async function sha256(value) {
  return hex(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
    )
  );
}
async function shaField(value) {
  const bytes2 = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  );
  bytes2[0] &= 31;
  return BigInt(`0x${hex(bytes2)}`).toString();
}

// sdk/client/payment.ts
var GAS = "300000000000000";
var STORAGE = 20000000000000000000000n;
var FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
function object(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a public JSON object");
  return value;
}
function account(value) {
  if (typeof value !== "string" || value.length < 2 || value.length > 64 || !/^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(value))
    throw new Error("Invalid NEAR account");
  return value;
}
function scalar(value) {
  if (typeof value !== "string" || value.length > 77 || !/^(0|[1-9][0-9]*)$/.test(value) || BigInt(value) >= FIELD)
    throw new Error("Invalid scalar");
  return value;
}
function atomic(value) {
  if (typeof value !== "string" || value.length > 39 || !/^(0|[1-9][0-9]*)$/.test(value) || BigInt(value) >= 1n << 128n)
    throw new Error("Invalid atomic amount");
  return value;
}
function hash(value) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value))
    throw new Error("Invalid hash");
  return value;
}
function exact(value, keys) {
  if (Object.keys(value).sort().join("|") !== keys.sort().join("|"))
    throw new Error("Unexpected fields in public call");
}
function parsePolicy(input) {
  const p = object(input);
  const allowed = [
    "network",
    "registry",
    "denomination",
    "feeRecipient",
    "registryWasmSha256",
    "vaultWasmSha256",
    "verifierSha256",
    ...p.tokenId !== void 0 ? ["tokenId"] : []
  ];
  exact(p, allowed);
  if (p.network !== "sandbox" && p.network !== "testnet")
    throw new Error("Unsupported network");
  const registry = account(p.registry);
  if (registry.length > 30) throw new Error("Registry is too long");
  const denomination = atomic(p.denomination);
  if (BigInt(denomination) <= 0n || BigInt(denomination) > ((1n << 128n) - 1n) / 256n)
    throw new Error("Invalid denomination");
  return {
    network: p.network,
    registry,
    denomination,
    feeRecipient: account(p.feeRecipient),
    registryWasmSha256: hash(p.registryWasmSha256),
    vaultWasmSha256: hash(p.vaultWasmSha256),
    verifierSha256: hash(p.verifierSha256),
    ...p.tokenId !== void 0 ? { tokenId: account(p.tokenId) } : {}
  };
}
function parseCall(input) {
  const c = object(input);
  exact(c, ["contract", "method", "args", "attachedYoctoNear", "gas"]);
  if (typeof c.method !== "string" || c.method.length > 64 || c.gas !== GAS)
    throw new Error("Unsupported function call or gas");
  return {
    contract: account(c.contract),
    method: c.method,
    args: object(c.args),
    attachedYoctoNear: atomic(c.attachedYoctoNear),
    gas: GAS
  };
}
function vault(value, policy) {
  const v = account(value);
  if (!new RegExp(
    `^v[a-f0-9]{32}\\.${policy.registry.replaceAll(".", "\\.")}$`
  ).test(v))
    throw new Error("Vault must be a direct protocol child");
  return v;
}
function feeQuote(policy) {
  const d = BigInt(policy.denomination), fee = d * 15n / 10000n;
  if (!policy.tokenId || fee === 0n)
    throw new Error("Use an FT shared group with a nonzero fee");
  return {
    principalTokens: d.toString(),
    feeTokens: fee.toString(),
    depositTokens: (d + fee).toString(),
    storageYoctoNear: STORAGE.toString()
  };
}
async function preparedPayment(input, policyInput, payerInput) {
  const policy = parsePolicy(policyInput), payer = account(payerInput), plan = object(input);
  if (Object.keys(plan).some(
    (k) => ![
      "quote",
      "storageTarget",
      "tokenCall",
      "completion",
      "checkedAtBlock",
      "prerequisite"
    ].includes(k)
  ))
    throw new Error(
      "Only a public Core FT call plan is accepted. Never import a private note or key."
    );
  const call = parseCall(plan.tokenCall), q = feeQuote(policy);
  exact(call.args, ["receiver_id", "amount", "msg"]);
  if (call.contract !== policy.tokenId || call.method !== "ft_transfer_call" || call.attachedYoctoNear !== "1" || typeof call.args.msg !== "string" || call.args.msg.length > 4096)
    throw new Error("Wrong token call");
  const msg = object(JSON.parse(call.args.msg));
  const receipt = hash(msg.disclosure_root);
  if (call.args.receiver_id !== policy.registry) {
    const destination2 = vault(call.args.receiver_id, policy);
    exact(msg, ["commitment", "disclosure_root"]);
    const commitment = scalar(msg.commitment);
    if (commitment === "0" || call.args.amount !== q.depositTokens)
      throw new Error("Wrong deposit principal or add-on fee");
    return {
      payment: {
        ...call,
        args: {
          receiver_id: destination2,
          amount: q.depositTokens,
          msg: JSON.stringify({ commitment, disclosure_root: receipt })
        }
      },
      reference: {
        kind: "deposit",
        vault: destination2,
        commitment,
        expectedOwner: payer,
        expectedDisclosureRoot: receipt
      }
    };
  }
  exact(msg, [
    "vault",
    "recipient",
    "disclosure_root",
    "proof",
    "public_inputs"
  ]);
  const destination = vault(msg.vault, policy), recipient = account(msg.recipient);
  if (recipient === policy.registry || recipient.endsWith(`.${policy.registry}`) || call.args.amount !== q.feeTokens)
    throw new Error("Wrong withdrawal destination or fee");
  if (typeof msg.proof !== "string" || !/^[A-Za-z0-9+/]{342}==$/.test(msg.proof) || atob(msg.proof).length !== 256)
    throw new Error("Invalid proof encoding");
  if (!Array.isArray(msg.public_inputs) || msg.public_inputs.length !== 5)
    throw new Error("Expected five proof inputs");
  const inputs = msg.public_inputs.map(scalar);
  const domain = await shaField(
    `core:ft:v3|${policy.network}|${policy.registry}|${policy.tokenId}|${policy.denomination}`
  );
  const context = await shaField(
    `core:action:ft:v3|${domain}|withdraw|${destination}|${recipient}|${receipt}`
  );
  if (inputs[4] !== domain || inputs[3] !== context)
    throw new Error(
      "Proof does not bind this asset, vault, recipient and receipt"
    );
  return {
    payment: {
      ...call,
      args: {
        receiver_id: policy.registry,
        amount: q.feeTokens,
        msg: JSON.stringify({
          vault: destination,
          recipient,
          disclosure_root: receipt,
          proof: msg.proof,
          public_inputs: inputs
        })
      }
    },
    reference: {
      kind: "withdrawal",
      nullifier: inputs[0],
      expectedVault: destination,
      expectedRecipient: recipient,
      expectedDisclosureRoot: receipt
    }
  };
}

// sdk/client/poseidon-constants.ts
var parameters = {
  "2": {
    "C": [
      "0x0ee9a592ba9a9518d05986d656f40c2114c4993c11bb29938d21d47304cd8e6e",
      "0x00f1445235f2148c5986587169fc1bcd887b08d4d00868df5696fff40956e864",
      "0x08dff3487e8ac99e1f29a058d0fa80b930c728730b7ab36ce879f3890ecf73f5",
      "0x2f27be690fdaee46c3ce28f7532b13c856c35342c84bda6e20966310fadc01d0",
      "0x2b2ae1acf68b7b8d2416bebf3d4f6234b763fe04b8043ee48b8327bebca16cf2",
      "0x0319d062072bef7ecca5eac06f97d4d55952c175ab6b03eae64b44c7dbf11cfa",
      "0x28813dcaebaeaa828a376df87af4a63bc8b7bf27ad49c6298ef7b387bf28526d",
      "0x2727673b2ccbc903f181bf38e1c1d40d2033865200c352bc150928adddf9cb78",
      "0x234ec45ca27727c2e74abd2b2a1494cd6efbd43e340587d6b8fb9e31e65cc632",
      "0x15b52534031ae18f7f862cb2cf7cf760ab10a8150a337b1ccd99ff6e8797d428",
      "0x0dc8fad6d9e4b35f5ed9a3d186b79ce38e0e8a8d1b58b132d701d4eecf68d1f6",
      "0x1bcd95ffc211fbca600f705fad3fb567ea4eb378f62e1fec97805518a47e4d9c",
      "0x10520b0ab721cadfe9eff81b016fc34dc76da36c2578937817cb978d069de559",
      "0x1f6d48149b8e7f7d9b257d8ed5fbbaf42932498075fed0ace88a9eb81f5627f6",
      "0x1d9655f652309014d29e00ef35a2089bfff8dc1c816f0dc9ca34bdb5460c8705",
      "0x04df5a56ff95bcafb051f7b1cd43a99ba731ff67e47032058fe3d4185697cc7d",
      "0x0672d995f8fff640151b3d290cedaf148690a10a8c8424a7f6ec282b6e4be828",
      "0x099952b414884454b21200d7ffafdd5f0c9a9dcc06f2708e9fc1d8209b5c75b9",
      "0x052cba2255dfd00c7c483143ba8d469448e43586a9b4cd9183fd0e843a6b9fa6",
      "0x0b8badee690adb8eb0bd74712b7999af82de55707251ad7716077cb93c464ddc",
      "0x119b1590f13307af5a1ee651020c07c749c15d60683a8050b963d0a8e4b2bdd1",
      "0x03150b7cd6d5d17b2529d36be0f67b832c4acfc884ef4ee5ce15be0bfb4a8d09",
      "0x2cc6182c5e14546e3cf1951f173912355374efb83d80898abe69cb317c9ea565",
      "0x005032551e6378c450cfe129a404b3764218cadedac14e2b92d2cd73111bf0f9",
      "0x233237e3289baa34bb147e972ebcb9516469c399fcc069fb88f9da2cc28276b5",
      "0x05c8f4f4ebd4a6e3c980d31674bfbe6323037f21b34ae5a4e80c2d4c24d60280",
      "0x0a7b1db13042d396ba05d818a319f25252bcf35ef3aeed91ee1f09b2590fc65b",
      "0x2a73b71f9b210cf5b14296572c9d32dbf156e2b086ff47dc5df542365a404ec0",
      "0x1ac9b0417abcc9a1935107e9ffc91dc3ec18f2c4dbe7f22976a760bb5c50c460",
      "0x12c0339ae08374823fabb076707ef479269f3e4d6cb104349015ee046dc93fc0",
      "0x0b7475b102a165ad7f5b18db4e1e704f52900aa3253baac68246682e56e9a28e",
      "0x037c2849e191ca3edb1c5e49f6e8b8917c843e379366f2ea32ab3aa88d7f8448",
      "0x05a6811f8556f014e92674661e217e9bd5206c5c93a07dc145fdb176a716346f",
      "0x29a795e7d98028946e947b75d54e9f044076e87a7b2883b47b675ef5f38bd66e",
      "0x20439a0c84b322eb45a3857afc18f5826e8c7382c8a1585c507be199981fd22f",
      "0x2e0ba8d94d9ecf4a94ec2050c7371ff1bb50f27799a84b6d4a2a6f2a0982c887",
      "0x143fd115ce08fb27ca38eb7cce822b4517822cd2109048d2e6d0ddcca17d71c8",
      "0x0c64cbecb1c734b857968dbbdcf813cdf8611659323dbcbfc84323623be9caf1",
      "0x028a305847c683f646fca925c163ff5ae74f348d62c2b670f1426cef9403da53",
      "0x2e4ef510ff0b6fda5fa940ab4c4380f26a6bcb64d89427b824d6755b5db9e30c",
      "0x0081c95bc43384e663d79270c956ce3b8925b4f6d033b078b96384f50579400e",
      "0x2ed5f0c91cbd9749187e2fade687e05ee2491b349c039a0bba8a9f4023a0bb38",
      "0x30509991f88da3504bbf374ed5aae2f03448a22c76234c8c990f01f33a735206",
      "0x1c3f20fd55409a53221b7c4d49a356b9f0a1119fb2067b41a7529094424ec6ad",
      "0x10b4e7f3ab5df003049514459b6e18eec46bb2213e8e131e170887b47ddcb96c",
      "0x2a1982979c3ff7f43ddd543d891c2abddd80f804c077d775039aa3502e43adef",
      "0x1c74ee64f15e1db6feddbead56d6d55dba431ebc396c9af95cad0f1315bd5c91",
      "0x07533ec850ba7f98eab9303cace01b4b9e4f2e8b82708cfa9c2fe45a0ae146a0",
      "0x21576b438e500449a151e4eeaf17b154285c68f42d42c1808a11abf3764c0750",
      "0x2f17c0559b8fe79608ad5ca193d62f10bce8384c815f0906743d6930836d4a9e",
      "0x2d477e3862d07708a79e8aae946170bc9775a4201318474ae665b0b1b7e2730e",
      "0x162f5243967064c390e095577984f291afba2266c38f5abcd89be0f5b2747eab",
      "0x2b4cb233ede9ba48264ecd2c8ae50d1ad7a8596a87f29f8a7777a70092393311",
      "0x2c8fbcb2dd8573dc1dbaf8f4622854776db2eece6d85c4cf4254e7c35e03b07a",
      "0x1d6f347725e4816af2ff453f0cd56b199e1b61e9f601e9ade5e88db870949da9",
      "0x204b0c397f4ebe71ebc2d8b3df5b913df9e6ac02b68d31324cd49af5c4565529",
      "0x0c4cb9dc3c4fd8174f1149b3c63c3c2f9ecb827cd7dc25534ff8fb75bc79c502",
      "0x174ad61a1448c899a25416474f4930301e5c49475279e0639a616ddc45bc7b54",
      "0x1a96177bcf4d8d89f759df4ec2f3cde2eaaa28c177cc0fa13a9816d49a38d2ef",
      "0x066d04b24331d71cd0ef8054bc60c4ff05202c126a233c1a8242ace360b8a30a",
      "0x2a4c4fc6ec0b0cf52195782871c6dd3b381cc65f72e02ad527037a62aa1bd804",
      "0x13ab2d136ccf37d447e9f2e14a7cedc95e727f8446f6d9d7e55afc01219fd649",
      "0x1121552fca26061619d24d843dc82769c1b04fcec26f55194c2e3e869acc6a9a",
      "0x00ef653322b13d6c889bc81715c37d77a6cd267d595c4a8909a5546c7c97cff1",
      "0x0e25483e45a665208b261d8ba74051e6400c776d652595d9845aca35d8a397d3",
      "0x29f536dcb9dd7682245264659e15d88e395ac3d4dde92d8c46448db979eeba89",
      "0x2a56ef9f2c53febadfda33575dbdbd885a124e2780bbea170e456baace0fa5be",
      "0x1c8361c78eb5cf5decfb7a2d17b5c409f2ae2999a46762e8ee416240a8cb9af1",
      "0x151aff5f38b20a0fc0473089aaf0206b83e8e68a764507bfd3d0ab4be74319c5",
      "0x04c6187e41ed881dc1b239c88f7f9d43a9f52fc8c8b6cdd1e76e47615b51f100",
      "0x13b37bd80f4d27fb10d84331f6fb6d534b81c61ed15776449e801b7ddc9c2967",
      "0x01a5c536273c2d9df578bfbd32c17b7a2ce3664c2a52032c9321ceb1c4e8a8e4",
      "0x2ab3561834ca73835ad05f5d7acb950b4a9a2c666b9726da832239065b7c3b02",
      "0x1d4d8ec291e720db200fe6d686c0d613acaf6af4e95d3bf69f7ed516a597b646",
      "0x041294d2cc484d228f5784fe7919fd2bb925351240a04b711514c9c80b65af1d",
      "0x154ac98e01708c611c4fa715991f004898f57939d126e392042971dd90e81fc6",
      "0x0b339d8acca7d4f83eedd84093aef51050b3684c88f8b0b04524563bc6ea4da4",
      "0x0955e49e6610c94254a4f84cfbab344598f0e71eaff4a7dd81ed95b50839c82e",
      "0x06746a6156eba54426b9e22206f15abca9a6f41e6f535c6f3525401ea0654626",
      "0x0f18f5a0ecd1423c496f3820c549c27838e5790e2bd0a196ac917c7ff32077fb",
      "0x04f6eeca1751f7308ac59eff5beb261e4bb563583ede7bc92a738223d6f76e13",
      "0x2b56973364c4c4f5c1a3ec4da3cdce038811eb116fb3e45bc1768d26fc0b3758",
      "0x123769dd49d5b054dcd76b89804b1bcb8e1392b385716a5d83feb65d437f29ef",
      "0x2147b424fc48c80a88ee52b91169aacea989f6446471150994257b2fb01c63e9",
      "0x0fdc1f58548b85701a6c5505ea332a29647e6f34ad4243c2ea54ad897cebe54d",
      "0x12373a8251fea004df68abcf0f7786d4bceff28c5dbbe0c3944f685cc0a0b1f2",
      "0x21e4f4ea5f35f85bad7ea52ff742c9e8a642756b6af44203dd8a1f35c1a90035",
      "0x16243916d69d2ca3dfb4722224d4c462b57366492f45e90d8a81934f1bc3b147",
      "0x1efbe46dd7a578b4f66f9adbc88b4378abc21566e1a0453ca13a4159cac04ac2",
      "0x07ea5e8537cf5dd08886020e23a7f387d468d5525be66f853b672cc96a88969a",
      "0x05a8c4f9968b8aa3b7b478a30f9a5b63650f19a75e7ce11ca9fe16c0b76c00bc",
      "0x20f057712cc21654fbfe59bd345e8dac3f7818c701b9c7882d9d57b72a32e83f",
      "0x04a12ededa9dfd689672f8c67fee31636dcd8e88d01d49019bd90b33eb33db69",
      "0x27e88d8c15f37dcee44f1e5425a51decbd136ce5091a6767e49ec9544ccd101a",
      "0x2feed17b84285ed9b8a5c8c5e95a41f66e096619a7703223176c41ee433de4d1",
      "0x1ed7cc76edf45c7c404241420f729cf394e5942911312a0d6972b8bd53aff2b8",
      "0x15742e99b9bfa323157ff8c586f5660eac6783476144cdcadf2874be45466b1a",
      "0x1aac285387f65e82c895fc6887ddf40577107454c6ec0317284f033f27d0c785",
      "0x25851c3c845d4790f9ddadbdb6057357832e2e7a49775f71ec75a96554d67c77",
      "0x15a5821565cc2ec2ce78457db197edf353b7ebba2c5523370ddccc3d9f146a67",
      "0x2411d57a4813b9980efa7e31a1db5966dcf64f36044277502f15485f28c71727",
      "0x002e6f8d6520cd4713e335b8c0b6d2e647e9a98e12f4cd2558828b5ef6cb4c9b",
      "0x2ff7bc8f4380cde997da00b616b0fcd1af8f0e91e2fe1ed7398834609e0315d2",
      "0x00b9831b948525595ee02724471bcd182e9521f6b7bb68f1e93be4febb0d3cbe",
      "0x0a2f53768b8ebf6a86913b0e57c04e011ca408648a4743a87d77adbf0c9c3512",
      "0x00248156142fd0373a479f91ff239e960f599ff7e94be69b7f2a290305e1198d",
      "0x171d5620b87bfb1328cf8c02ab3f0c9a397196aa6a542c2350eb512a2b2bcda9",
      "0x170a4f55536f7dc970087c7c10d6fad760c952172dd54dd99d1045e4ec34a808",
      "0x29aba33f799fe66c2ef3134aea04336ecc37e38c1cd211ba482eca17e2dbfae1",
      "0x1e9bc179a4fdd758fdd1bb1945088d47e70d114a03f6a0e8b5ba650369e64973",
      "0x1dd269799b660fad58f7f4892dfb0b5afeaad869a9c4b44f9c9e1c43bdaf8f09",
      "0x22cdbc8b70117ad1401181d02e15459e7ccd426fe869c7c95d1dd2cb0f24af38",
      "0x0ef042e454771c533a9f57a55c503fcefd3150f52ed94a7cd5ba93b9c7dacefd",
      "0x11609e06ad6c8fe2f287f3036037e8851318e8b08a0359a03b304ffca62e8284",
      "0x1166d9e554616dba9e753eea427c17b7fecd58c076dfe42708b08f5b783aa9af",
      "0x2de52989431a859593413026354413db177fbf4cd2ac0b56f855a888357ee466",
      "0x3006eb4ffc7a85819a6da492f3a8ac1df51aee5b17b8e89d74bf01cf5f71e9ad",
      "0x2af41fbb61ba8a80fdcf6fff9e3f6f422993fe8f0a4639f962344c8225145086",
      "0x119e684de476155fe5a6b41a8ebc85db8718ab27889e85e781b214bace4827c3",
      "0x1835b786e2e8925e188bea59ae363537b51248c23828f047cff784b97b3fd800",
      "0x28201a34c594dfa34d794996c6433a20d152bac2a7905c926c40e285ab32eeb6",
      "0x083efd7a27d1751094e80fefaf78b000864c82eb571187724a761f88c22cc4e7",
      "0x0b6f88a3577199526158e61ceea27be811c16df7774dd8519e079564f61fd13b",
      "0x0ec868e6d15e51d9644f66e1d6471a94589511ca00d29e1014390e6ee4254f5b",
      "0x2af33e3f866771271ac0c9b3ed2e1142ecd3e74b939cd40d00d937ab84c98591",
      "0x0b520211f904b5e7d09b5d961c6ace7734568c547dd6858b364ce5e47951f178",
      "0x0b2d722d0919a1aad8db58f10062a92ea0c56ac4270e822cca228620188a1d40",
      "0x1f790d4d7f8cf094d980ceb37c2453e957b54a9991ca38bbe0061d1ed6e562d4",
      "0x0171eb95dfbf7d1eaea97cd385f780150885c16235a2a6a8da92ceb01e504233",
      "0x0c2d0e3b5fd57549329bf6885da66b9b790b40defd2c8650762305381b168873",
      "0x1162fb28689c27154e5a8228b4e72b377cbcafa589e283c35d3803054407a18d",
      "0x2f1459b65dee441b64ad386a91e8310f282c5a92a89e19921623ef8249711bc0",
      "0x1e6ff3216b688c3d996d74367d5cd4c1bc489d46754eb712c243f70d1b53cfbb",
      "0x01ca8be73832b8d0681487d27d157802d741a6f36cdc2a0576881f9326478875",
      "0x1f7735706ffe9fc586f976d5bdf223dc680286080b10cea00b9b5de315f9650e",
      "0x2522b60f4ea3307640a0c2dce041fba921ac10a3d5f096ef4745ca838285f019",
      "0x23f0bee001b1029d5255075ddc957f833418cad4f52b6c3f8ce16c235572575b",
      "0x2bc1ae8b8ddbb81fcaac2d44555ed5685d142633e9df905f66d9401093082d59",
      "0x0f9406b8296564a37304507b8dba3ed162371273a07b1fc98011fcd6ad72205f",
      "0x2360a8eb0cc7defa67b72998de90714e17e75b174a52ee4acb126c8cd995f0a8",
      "0x15871a5cddead976804c803cbaef255eb4815a5e96df8b006dcbbc2767f88948",
      "0x193a56766998ee9e0a8652dd2f3b1da0362f4f54f72379544f957ccdeefb420f",
      "0x2a394a43934f86982f9be56ff4fab1703b2e63c8ad334834e4309805e777ae0f",
      "0x1859954cfeb8695f3e8b635dcb345192892cd11223443ba7b4166e8876c0d142",
      "0x04e1181763050e58013444dbcb99f1902b11bc25d90bbdca408d3819f4fed32b",
      "0x0fdb253dee83869d40c335ea64de8c5bb10eb82db08b5e8b1f5e5552bfd05f23",
      "0x058cbe8a9a5027bdaa4efb623adead6275f08686f1c08984a9d7c5bae9b4f1c0",
      "0x1382edce9971e186497eadb1aeb1f52b23b4b83bef023ab0d15228b4cceca59a",
      "0x03464990f045c6ee0819ca51fd11b0be7f61b8eb99f14b77e1e6634601d9e8b5",
      "0x23f7bfc8720dc296fff33b41f98ff83c6fcab4605db2eb5aaa5bc137aeb70a58",
      "0x0a59a158e3eec2117e6e94e7f0e9decf18c3ffd5e1531a9219636158bbaf62f2",
      "0x06ec54c80381c052b58bf23b312ffd3ce2c4eba065420af8f4c23ed0075fd07b",
      "0x118872dc832e0eb5476b56648e867ec8b09340f7a7bcb1b4962f0ff9ed1f9d01",
      "0x13d69fa127d834165ad5c7cba7ad59ed52e0b0f0e42d7fea95e1906b520921b1",
      "0x169a177f63ea681270b1c6877a73d21bde143942fb71dc55fd8a49f19f10c77b",
      "0x04ef51591c6ead97ef42f287adce40d93abeb032b922f66ffb7e9a5a7450544d",
      "0x256e175a1dc079390ecd7ca703fb2e3b19ec61805d4f03ced5f45ee6dd0f69ec",
      "0x30102d28636abd5fe5f2af412ff6004f75cc360d3205dd2da002813d3e2ceeb2",
      "0x10998e42dfcd3bbf1c0714bc73eb1bf40443a3fa99bef4a31fd31be182fcc792",
      "0x193edd8e9fcf3d7625fa7d24b598a1d89f3362eaf4d582efecad76f879e36860",
      "0x18168afd34f2d915d0368ce80b7b3347d1c7a561ce611425f2664d7aa51f0b5d",
      "0x29383c01ebd3b6ab0c017656ebe658b6a328ec77bc33626e29e2e95b33ea6111",
      "0x10646d2f2603de39a1f4ae5e7771a64a702db6e86fb76ab600bf573f9010c711",
      "0x0beb5e07d1b27145f575f1395a55bf132f90c25b40da7b3864d0242dcb1117fb",
      "0x16d685252078c133dc0d3ecad62b5c8830f95bb2e54b59abdffbf018d96fa336",
      "0x0a6abd1d833938f33c74154e0404b4b40a555bbbec21ddfafd672dd62047f01a",
      "0x1a679f5d36eb7b5c8ea12a4c2dedc8feb12dffeec450317270a6f19b34cf1860",
      "0x0980fb233bd456c23974d50e0ebfde4726a423eada4e8f6ffbc7592e3f1b93d6",
      "0x161b42232e61b84cbf1810af93a38fc0cece3d5628c9282003ebacb5c312c72b",
      "0x0ada10a90c7f0520950f7d47a60d5e6a493f09787f1564e5d09203db47de1a0b",
      "0x1a730d372310ba82320345a29ac4238ed3f07a8a2b4e121bb50ddb9af407f451",
      "0x2c8120f268ef054f817064c369dda7ea908377feaba5c4dffbda10ef58e8c556",
      "0x1c7c8824f758753fa57c00789c684217b930e95313bcb73e6e7b8649a4968f70",
      "0x2cd9ed31f5f8691c8e39e4077a74faa0f400ad8b491eb3f7b47b27fa3fd1cf77",
      "0x23ff4f9d46813457cf60d92f57618399a5e022ac321ca550854ae23918a22eea",
      "0x09945a5d147a4f66ceece6405dddd9d0af5a2c5103529407dff1ea58f180426d",
      "0x188d9c528025d4c2b67660c6b771b90f7c7da6eaa29d3f268a6dd223ec6fc630",
      "0x3050e37996596b7f81f68311431d8734dba7d926d3633595e0c0d8ddf4f0f47f",
      "0x15af1169396830a91600ca8102c35c426ceae5461e3f95d89d829518d30afd78",
      "0x1da6d09885432ea9a06d9f37f873d985dae933e351466b2904284da3320d8acc",
      "0x2796ea90d269af29f5f8acf33921124e4e4fad3dbe658945e546ee411ddaa9cb",
      "0x202d7dd1da0f6b4b0325c8b3307742f01e15612ec8e9304a7cb0319e01d32d60",
      "0x096d6790d05bb759156a952ba263d672a2d7f9c788f4c831a29dace4c0f8be5f",
      "0x054efa1f65b0fce283808965275d877b438da23ce5b13e1963798cb1447d25a4",
      "0x1b162f83d917e93edb3308c29802deb9d8aa690113b2e14864ccf6e18e4165f1",
      "0x21e5241e12564dd6fd9f1cdd2a0de39eedfefc1466cc568ec5ceb745a0506edc",
      "0x1cfb5662e8cf5ac9226a80ee17b36abecb73ab5f87e161927b4349e10e4bdf08",
      "0x0f21177e302a771bbae6d8d1ecb373b62c99af346220ac0129c53f666eb24100",
      "0x1671522374606992affb0dd7f71b12bec4236aede6290546bcef7e1f515c2320",
      "0x0fa3ec5b9488259c2eb4cf24501bfad9be2ec9e42c5cc8ccd419d2a692cad870",
      "0x193c0e04e0bd298357cb266c1506080ed36edce85c648cc085e8c57b1ab54bba",
      "0x102adf8ef74735a27e9128306dcbc3c99f6f7291cd406578ce14ea2adaba68f8",
      "0x0fe0af7858e49859e2a54d6f1ad945b1316aa24bfbdd23ae40a6d0cb70c3eab1",
      "0x216f6717bbc7dedb08536a2220843f4e2da5f1daa9ebdefde8a5ea7344798d22",
      "0x1da55cc900f0d21f4a3e694391918a1b3c23b2ac773c6b3ef88e2e4228325161"
    ],
    "M": [
      [
        "0x109b7f411ba0e4c9b2b70caf5c36a7b194be7c11ad24378bfedb68592ba8118b",
        "0x16ed41e13bb9c0c66ae119424fddbcbc9314dc9fdbdeea55d6c64543dc4903e0",
        "0x2b90bba00fca0589f617e7dcbfe82e0df706ab640ceb247b791a93b74e36736d"
      ],
      [
        "0x2969f27eed31a480b9c36c764379dbca2cc8fdd1415c3dded62940bcde0bd771",
        "0x2e2419f9ec02ec394c9871c832963dc1b89d743c8c7b964029b2311687b1fe23",
        "0x101071f0032379b697315876690f053d148d4e109f5fb065c8aacc55a0f89bfa"
      ],
      [
        "0x143021ec686a3f330d5f9e654638065ce6cd79e28c5b3753326244ee65a1b1a7",
        "0x176cc029695ad02582a70eff08a6fd99d057e12e58e7d7b6b16cdfabc8ee2911",
        "0x19a3fc0a56702bf417ba7fee3802593fa644470307043f7773279cd71d25d5e0"
      ]
    ]
  },
  "3": {
    "C": [
      "0x19b849f69450b06848da1d39bd5e4a4302bb86744edc26238b0878e269ed23e5",
      "0x265ddfe127dd51bd7239347b758f0a1320eb2cc7450acc1dad47f80c8dcf34d6",
      "0x199750ec472f1809e0f66a545e1e51624108ac845015c2aa3dfc36bab497d8aa",
      "0x157ff3fe65ac7208110f06a5f74302b14d743ea25067f0ffd032f787c7f1cdf8",
      "0x2e49c43c4569dd9c5fd35ac45fca33f10b15c590692f8beefe18f4896ac94902",
      "0x0e35fb89981890520d4aef2b6d6506c3cb2f0b6973c24fa82731345ffa2d1f1e",
      "0x251ad47cb15c4f1105f109ae5e944f1ba9d9e7806d667ffec6fe723002e0b996",
      "0x13da07dc64d428369873e97160234641f8beb56fdd05e5f3563fa39d9c22df4e",
      "0x0c009b84e650e6d23dc00c7dccef7483a553939689d350cd46e7b89055fd4738",
      "0x011f16b1c63a854f01992e3956f42d8b04eb650c6d535eb0203dec74befdca06",
      "0x0ed69e5e383a688f209d9a561daa79612f3f78d0467ad45485df07093f367549",
      "0x04dba94a7b0ce9e221acad41472b6bbe3aec507f5eb3d33f463672264c9f789b",
      "0x0a3f2637d840f3a16eb094271c9d237b6036757d4bb50bf7ce732ff1d4fa28e8",
      "0x259a666f129eea198f8a1c502fdb38fa39b1f075569564b6e54a485d1182323f",
      "0x28bf7459c9b2f4c6d8e7d06a4ee3a47f7745d4271038e5157a32fdf7ede0d6a1",
      "0x0a1ca941f057037526ea200f489be8d4c37c85bbcce6a2aeec91bd6941432447",
      "0x0c6f8f958be0e93053d7fd4fc54512855535ed1539f051dcb43a26fd926361cf",
      "0x123106a93cd17578d426e8128ac9d90aa9e8a00708e296e084dd57e69caaf811",
      "0x26e1ba52ad9285d97dd3ab52f8e840085e8fa83ff1e8f1877b074867cd2dee75",
      "0x1cb55cad7bd133de18a64c5c47b9c97cbe4d8b7bf9e095864471537e6a4ae2c5",
      "0x1dcd73e46acd8f8e0e2c7ce04bde7f6d2a53043d5060a41c7143f08e6e9055d0",
      "0x011003e32f6d9c66f5852f05474a4def0cda294a0eb4e9b9b12b9bb4512e5574",
      "0x2b1e809ac1d10ab29ad5f20d03a57dfebadfe5903f58bafed7c508dd2287ae8c",
      "0x2539de1785b735999fb4dac35ee17ed0ef995d05ab2fc5faeaa69ae87bcec0a5",
      "0x0c246c5a2ef8ee0126497f222b3e0a0ef4e1c3d41c86d46e43982cb11d77951d",
      "0x192089c4974f68e95408148f7c0632edbb09e6a6ad1a1c2f3f0305f5d03b527b",
      "0x1eae0ad8ab68b2f06a0ee36eeb0d0c058529097d91096b756d8fdc2fb5a60d85",
      "0x179190e5d0e22179e46f8282872abc88db6e2fdc0dee99e69768bd98c5d06bfb",
      "0x29bb9e2c9076732576e9a81c7ac4b83214528f7db00f31bf6cafe794a9b3cd1c",
      "0x225d394e42207599403efd0c2464a90d52652645882aac35b10e590e6e691e08",
      "0x064760623c25c8cf753d238055b444532be13557451c087de09efd454b23fd59",
      "0x10ba3a0e01df92e87f301c4b716d8a394d67f4bf42a75c10922910a78f6b5b87",
      "0x0e070bf53f8451b24f9c6e96b0c2a801cb511bc0c242eb9d361b77693f21471c",
      "0x1b94cd61b051b04dd39755ff93821a73ccd6cb11d2491d8aa7f921014de252fb",
      "0x1d7cb39bafb8c744e148787a2e70230f9d4e917d5713bb050487b5aa7d74070b",
      "0x2ec93189bd1ab4f69117d0fe980c80ff8785c2961829f701bb74ac1f303b17db",
      "0x2db366bfdd36d277a692bb825b86275beac404a19ae07a9082ea46bd83517926",
      "0x062100eb485db06269655cf186a68532985275428450359adc99cec6960711b8",
      "0x0761d33c66614aaa570e7f1e8244ca1120243f92fa59e4f900c567bf41f5a59b",
      "0x20fc411a114d13992c2705aa034e3f315d78608a0f7de4ccf7a72e494855ad0d",
      "0x25b5c004a4bdfcb5add9ec4e9ab219ba102c67e8b3effb5fc3a30f317250bc5a",
      "0x23b1822d278ed632a494e58f6df6f5ed038b186d8474155ad87e7dff62b37f4b",
      "0x22734b4c5c3f9493606c4ba9012499bf0f14d13bfcfcccaa16102a29cc2f69e0",
      "0x26c0c8fe09eb30b7e27a74dc33492347e5bdff409aa3610254413d3fad795ce5",
      "0x070dd0ccb6bd7bbae88eac03fa1fbb26196be3083a809829bbd626df348ccad9",
      "0x12b6595bdb329b6fb043ba78bb28c3bec2c0a6de46d8c5ad6067c4ebfd4250da",
      "0x248d97d7f76283d63bec30e7a5876c11c06fca9b275c671c5e33d95bb7e8d729",
      "0x1a306d439d463b0816fc6fd64cc939318b45eb759ddde4aa106d15d9bd9baaaa",
      "0x28a8f8372e3c38daced7c00421cb4621f4f1b54ddc27821b0d62d3d6ec7c56cf",
      "0x0094975717f9a8a8bb35152f24d43294071ce320c829f388bc852183e1e2ce7e",
      "0x04d5ee4c3aa78f7d80fde60d716480d3593f74d4f653ae83f4103246db2e8d65",
      "0x2a6cf5e9aa03d4336349ad6fb8ed2269c7bef54b8822cc76d08495c12efde187",
      "0x2304d31eaab960ba9274da43e19ddeb7f792180808fd6e43baae48d7efcba3f3",
      "0x03fd9ac865a4b2a6d5e7009785817249bff08a7e0726fcb4e1c11d39d199f0b0",
      "0x00b7258ded52bbda2248404d55ee5044798afc3a209193073f7954d4d63b0b64",
      "0x159f81ada0771799ec38fca2d4bf65ebb13d3a74f3298db36272c5ca65e92d9a",
      "0x1ef90e67437fbc8550237a75bc28e3bb9000130ea25f0c5471e144cf4264431f",
      "0x1e65f838515e5ff0196b49aa41a2d2568df739bc176b08ec95a79ed82932e30d",
      "0x2b1b045def3a166cec6ce768d079ba74b18c844e570e1f826575c1068c94c33f",
      "0x0832e5753ceb0ff6402543b1109229c165dc2d73bef715e3f1c6e07c168bb173",
      "0x02f614e9cedfb3dc6b762ae0a37d41bab1b841c2e8b6451bc5a8e3c390b6ad16",
      "0x0e2427d38bd46a60dd640b8e362cad967370ebb777bedff40f6a0be27e7ed705",
      "0x0493630b7c670b6deb7c84d414e7ce79049f0ec098c3c7c50768bbe29214a53a",
      "0x22ead100e8e482674decdab17066c5a26bb1515355d5461a3dc06cc85327cea9",
      "0x25b3e56e655b42cdaae2626ed2554d48583f1ae35626d04de5084e0b6d2a6f16",
      "0x1e32752ada8836ef5837a6cde8ff13dbb599c336349e4c584b4fdc0a0cf6f9d0",
      "0x2fa2a871c15a387cc50f68f6f3c3455b23c00995f05078f672a9864074d412e5",
      "0x2f569b8a9a4424c9278e1db7311e889f54ccbf10661bab7fcd18e7c7a7d83505",
      "0x044cb455110a8fdd531ade530234c518a7df93f7332ffd2144165374b246b43d",
      "0x227808de93906d5d420246157f2e42b191fe8c90adfe118178ddc723a5319025",
      "0x02fcca2934e046bc623adead873579865d03781ae090ad4a8579d2e7a6800355",
      "0x0ef915f0ac120b876abccceb344a1d36bad3f3c5ab91a8ddcbec2e060d8befac",
      "0x1797130f4b7a3e1777eb757bc6f287f6ab0fb85f6be63b09f3b16ef2b1405d38",
      "0x0a76225dc04170ae3306c85abab59e608c7f497c20156d4d36c668555decc6e5",
      "0x1fffb9ec1992d66ba1e77a7b93209af6f8fa76d48acb664796174b5326a31a5c",
      "0x25721c4fc15a3f2853b57c338fa538d85f8fbba6c6b9c6090611889b797b9c5f",
      "0x0c817fd42d5f7a41215e3d07ba197216adb4c3790705da95eb63b982bfcaf75a",
      "0x13abe3f5239915d39f7e13c2c24970b6df8cf86ce00a22002bc15866e52b5a96",
      "0x2106feea546224ea12ef7f39987a46c85c1bc3dc29bdbd7a92cd60acb4d391ce",
      "0x21ca859468a746b6aaa79474a37dab49f1ca5a28c748bc7157e1b3345bb0f959",
      "0x05ccd6255c1e6f0c5cf1f0df934194c62911d14d0321662a8f1a48999e34185b",
      "0x0f0e34a64b70a626e464d846674c4c8816c4fb267fe44fe6ea28678cb09490a4",
      "0x0558531a4e25470c6157794ca36d0e9647dbfcfe350d64838f5b1a8a2de0d4bf",
      "0x09d3dca9173ed2faceea125157683d18924cadad3f655a60b72f5864961f1455",
      "0x0328cbd54e8c0913493f866ed03d218bf23f92d68aaec48617d4c722e5bd4335",
      "0x2bf07216e2aff0a223a487b1a7094e07e79e7bcc9798c648ee3347dd5329d34b",
      "0x1daf345a58006b736499c583cb76c316d6f78ed6a6dffc82111e11a63fe412df",
      "0x176563472456aaa746b694c60e1823611ef39039b2edc7ff391e6f2293d2c404",
      "0x2ef1e0fad9f08e87a3bb5e47d7e33538ca964d2b7d1083d4fb0225035bd3f8db",
      "0x226c9b1af95babcf17b2b1f57c7310179c1803dec5ae8f0a1779ed36c817ae2a",
      "0x14bce3549cc3db7428126b4c3a15ae0ff8148c89f13fb35d35734eb5d4ad0def",
      "0x2debff156e276bb5742c3373f2635b48b8e923d301f372f8e550cfd4034212c7",
      "0x2d4083cf5a87f5b6fc2395b22e356b6441afe1b6b29c47add7d0432d1d4760c7",
      "0x0c225b7bcd04bf9c34b911262fdc9c1b91bf79a10c0184d89c317c53d7161c29",
      "0x03152169d4f3d06ec33a79bfac91a02c99aa0200db66d5aa7b835265f9c9c8f3",
      "0x0b61811a9210be78b05974587486d58bddc8f51bfdfebbb87afe8b7aa7d3199c",
      "0x203e000cad298daaf7eba6a5c5921878b8ae48acf7048f16046d637a533b6f78",
      "0x1a44bf0937c722d1376672b69f6c9655ba7ee386fda1112c0757143d1bfa9146",
      "0x0376b4fae08cb03d3500afec1a1f56acb8e0fde75a2106d7002f59c5611d4daa",
      "0x00780af2ca1cad6465a2171250fdfc32d6fc241d3214177f3d553ef363182185",
      "0x10774d9ab80c25bdeb808bedfd72a8d9b75dbe18d5221c87e9d857079bdc31d5",
      "0x10dc6e9c006ea38b04b1e03b4bd9490c0d03f98929ca1d7fb56821fd19d3b6e8",
      "0x00544b8338791518b2c7645a50392798b21f75bb60e3596170067d00141cac16",
      "0x222c01175718386f2e2e82eb122789e352e105a3b8fa852613bc534433ee428c",
      "0x2840d045e9bc22b259cfb8811b1e0f45b77f7bdb7f7e2b46151a1430f608e3c5",
      "0x062752f86eebe11a009c937e468c335b04554574c2990196508e01fa5860186b",
      "0x06041bdac48205ac87adb87c20a478a71c9950c12a80bc0a55a8e83eaaf04746",
      "0x04a533f236c422d1ff900a368949b0022c7a2ae092f308d82b1dcbbf51f5000d",
      "0x13e31d7a67232fd811d6a955b3d4f25dfe066d1e7dc33df04bde50a2b2d05b2a",
      "0x011c2683ae91eb4dfbc13d6357e8599a9279d1648ff2c95d2f79905bb13920f1",
      "0x0b0d219346b8574525b1a270e0b4cba5d56c928e3e2c2bd0a1ecaed015aaf6ae",
      "0x14abdec8db9c6dc970291ee638690209b65080781ef9fd13d84c7a726b5f1364",
      "0x1a0b70b4b26fdc28fcd32aa3d266478801eb12202ef47ced988d0376610be106",
      "0x278543721f96d1307b6943f9804e7fe56401deb2ef99c4d12704882e7278b607",
      "0x16eb59494a9776cf57866214dbd1473f3f0738a325638d8ba36535e011d58259",
      "0x2567a658a81ffb444f240088fa5524c69a9e53eeab6b7f8c41c3479dcf8c644a",
      "0x29aa1d7c151e9ad0a7ab39f1abd9cf77ab78e0215a5715a6b882ade840bb13d8",
      "0x15c091233e60efe0d4bbfce2b36415006a4f017f9a85388ce206b91f99f2c984",
      "0x16bd7d22ff858e5e0882c2c999558d77e7673ad5f1915f9feb679a8115f014cf",
      "0x02db50480a07be0eb2c2e13ed6ef4074c0182d9b668b8e08ffe6769250042025",
      "0x05e4a220e6a3bc9f7b6806ec9d6cdba186330ef2bf7adb4c13ba866343b73119",
      "0x1dda05ebc30170bc98cbf2a5ee3b50e8b5f70bc424d39fa4104d37f1cbcf7a42",
      "0x0184bef721888187f645b6fee3667f3c91da214414d89ba5cd301f22b0de8990",
      "0x1498a307e68900065f5e8276f62aef1c37414b84494e1577ad1a6d64341b78ec",
      "0x25f40f82b31dacc4f4939800b9d2c3eacef737b8fab1f864fe33548ad46bd49d",
      "0x09d317cc670251943f6f5862a30d2ea9e83056ce4907bfbbcb1ff31ce5bb9650",
      "0x2f77d77786d979b23ba4ce4a4c1b3bd0a41132cd467a86ab29b913b6cf3149d0",
      "0x0f53dafd535a9f4473dc266b6fccc6841bbd336963f254c152f89e785f729bbf",
      "0x25c1fd72e223045265c3a099e17526fa0e6976e1c00baf16de96de85deef2fa2",
      "0x2a902c8980c17faae368d385d52d16be41af95c84eaea3cf893e65d6ce4a8f62",
      "0x1ce1580a3452ecf302878c8976b82be96676dd114d1dc8d25527405762f83529",
      "0x24a6073f91addc33a49a1fa306df008801c5ec569609034d2fc50f7f0f4d0056",
      "0x25e52dbd6124530d9fc27fe306d71d4583e07ca554b5d1577f256c68b0be2b74",
      "0x23dffae3c423fa7a93468dbccfb029855974be4d0a7b29946796e5b6cd70f15d",
      "0x06342da370cc0d8c49b77594f6b027c480615d50be36243a99591bc9924ed6f5",
      "0x2754114281286546b75f09f115fc751b4778303d0405c1b4cc7df0d8e9f63925",
      "0x15c19e8534c5c1a8862c2bc1d119eddeabf214153833d7bdb59ee197f8187cf5",
      "0x265fe062766d08fab4c78d0d9ef3cabe366f3be0a821061679b4b3d2d77d5f3e",
      "0x13ccf689d67a3ec9f22cb7cd0ac3a327d377ac5cd0146f048debfd098d3ec7be",
      "0x17662f7456789739f81cd3974827a887d92a5e05bdf3fe6b9fbccca4524aaebd",
      "0x21b29c76329b31c8ef18631e515f7f2f82ca6a5cca70cee4e809fd624be7ad5d",
      "0x18137478382aadba441eb97fe27901989c06738165215319939eb17b01fa975c",
      "0x2bc07ea2bfad68e8dc724f5fef2b37c2d34f761935ffd3b739ceec4668f37e88",
      "0x2ddb2e376f54d64a563840480df993feb4173203c2bd94ad0e602077aef9a03e",
      "0x277eb50f2baa706106b41cb24c602609e8a20f8d72f613708adb25373596c3f7",
      "0x0d4de47e1aba34269d0c620904f01a56b33fc4b450c0db50bb7f87734c9a1fe5",
      "0x0b8442bfe9e4a1b4428673b6bd3eea6f9f445697058f134aae908d0279a29f0c",
      "0x11fe5b18fbbea1a86e06930cb89f7d4a26e186a65945e96574247fddb720f8f5",
      "0x224026f6dfaf71e24d25d8f6d9f90021df5b774dcad4d883170e4ad89c33a0d6",
      "0x0b2ca6a999fe6887e0704dad58d03465a96bc9e37d1091f61bc9f9c62bbeb824",
      "0x221b63d66f0b45f9d40c54053a28a06b1d0a4ce41d364797a1a7e0c96529f421",
      "0x30185c48b7b2f1d53d4120801b047d087493bce64d4d24aedce2f4836bb84ad4",
      "0x23f5d372a3f0e3cba989e223056227d3533356f0faa48f27f8267318632a61f0",
      "0x2716683b32c755fd1bf8235ea162b1f388e1e0090d06162e8e6dfbe4328f3e3b",
      "0x0977545836866fa204ca1d853ec0909e3d140770c80ac67dc930c69748d5d4bc",
      "0x1444e8f592bdbfd8025d91ab4982dd425f51682d31472b05e81c43c0f9434b31",
      "0x26e04b65e9ca8270beb74a1c5cb8fee8be3ffbfe583f7012a00f874e7718fbe3",
      "0x22a5c2fa860d11fe34ee47a5cd9f869800f48f4febe29ad6df69816fb1a914d2",
      "0x174b54d9907d8f5c6afd672a738f42737ec338f3a0964c629f7474dd44c5c8d7",
      "0x1db1db8aa45283f31168fa66694cf2808d2189b87c8c8143d56c871907b39b87",
      "0x1530bf0f46527e889030b8c7b7dfde126f65faf8cce0ab66387341d813d1bfd1",
      "0x0b73f613993229f59f01c1cec8760e9936ead9edc8f2814889330a2f2bade457",
      "0x29c25a22fe2164604552aaea377f448d587ab977fc8227787bd2dc0f36bcf41e",
      "0x2b30d53ed1759bfb8503da66c92cf4077abe82795dc272b377df57d77c875526",
      "0x12f6d703b5702aab7b7b7e69359d53a2756c08c85ede7227cf5f0a2916787cd2",
      "0x2520e18300afda3f61a40a0b8837293a55ad01071028d4841ffa9ac706364113",
      "0x1ec9daea860971ecdda8ed4f346fa967ac9bc59278277393c68f09fa03b8b95f",
      "0x0a99b3e178db2e2e432f5cd5bef8fe4483bf5cbf70ed407c08aae24b830ad725",
      "0x07cda9e63db6e39f086b89b601c2bbe407ee0abac3c817a1317abad7c5778492",
      "0x08c9c65a4f955e8952d571b191bb0adb49bd8290963203b35d48aab38f8fc3a3",
      "0x2737f8ce1d5a67b349590ddbfbd709ed9af54a2a3f2719d33801c9c17bdd9c9e",
      "0x1049a6c65ff019f0d28770072798e8b7909432bd0c129813a9f179ba627f7d6a",
      "0x18b4fe968732c462c0ea5a9beb27cecbde8868944fdf64ee60a5122361daeddb",
      "0x2ff2b6fd22df49d2440b2eaeeefa8c02a6f478cfcf11f1b2a4f7473483885d19",
      "0x2ec5f2f1928fe932e56c789b8f6bbcb3e8be4057cbd8dbd18a1b352f5cef42ff",
      "0x265a5eccd8b92975e33ad9f75bf3426d424a4c6a7794ee3f08c1d100378e545e",
      "0x2405eaa4c0bde1129d6242bb5ada0e68778e656cfcb366bf20517da1dfd4279c",
      "0x094c97d8c194c42e88018004cbbf2bc5fdb51955d8b2d66b76dd98a2dbf60417",
      "0x2c30d5f33bb32c5c22b9979a605bf64d508b705221e6a686330c9625c2afe0b8",
      "0x01a75666f6241f6825d01cc6dcb1622d4886ea583e87299e6aa2fc716fdb6cf5",
      "0x0a3290e8398113ea4d12ac091e87be7c6d359ab9a66979fcf47bf2e87d382fcb",
      "0x154ade9ca36e268dfeb38461425bb0d8c31219d8fa0dfc75ecd21bf69aa0cc74",
      "0x27aa8d3e25380c0b1b172d79c6f22eee99231ef5dc69d8dc13a4b5095d028772",
      "0x2cf4051e6cab48301a8b2e3bca6099d756bbdf485afa1f549d395bbcbd806461",
      "0x301e70f729f3c94b1d3f517ddff9f2015131feab8afa5eebb0843d7f84b23e71",
      "0x298beb64f812d25d8b4d9620347ab02332dc4cef113ae60d17a8d7a4c91f83bc",
      "0x1b362e72a5f847f84d03fd291c3c471ed1c14a15b221680acf11a3f02e46aa95",
      "0x0dc8a2146110c0b375432902999223d5aa1ef6e78e1e5ebcbc1d9ba41dc1c737",
      "0x0a48663b34ce5e1c05dc93092cb69778cb21729a72ddc03a08afa1eb922ff279",
      "0x0a87391fb1cd8cdf6096b64a82f9e95f0fe46f143b702d74545bb314881098ee",
      "0x1b5b2946f7c28975f0512ff8e6ca362f8826edd7ea9c29f382ba8a2a0892fd5d",
      "0x01001cf512ac241d47ebe2239219bc6a173a8bbcb8a5b987b4eac1f533315b6b",
      "0x2fd977c70f645db4f704fa7d7693da727ac093d3fb5f5febc72beb17d8358a32",
      "0x23c0039a3fab4ad3c2d7cc688164f39e761d5355c05444d99be763a97793a9c4",
      "0x19d43ee0c6081c052c9c0df6161eaac1aec356cf435888e79f27f22ff03fa25d",
      "0x2d9b10c2f2e7ac1afddccffd94a563028bf29b646d020830919f9d5ca1cefe59",
      "0x2457ca6c2f2aa30ec47e4aff5a66f5ce2799283e166fc81cdae2f2b9f83e4267",
      "0x0abc392fe85eda855820592445094022811ee8676ed6f0c3044dfb54a7c10b35",
      "0x19d2cc5ca549d1d40cebcd37f3ea54f31161ac3993acf3101d2c2bc30eac1eb0",
      "0x0f97ae3033ffa01608aafb26ae13cd393ee0e4ec041ba644a3d3ab546e98c9c8",
      "0x16dbc78fd28b7fb8260e404cf1d427a7fa15537ea4e168e88a166496e88cfeca",
      "0x240faf28f11499b916f085f73bc4f22eef8344e576f8ad3d1827820366d5e07b",
      "0x0a1bb075aa37ff0cfe6c8531e55e1770eaba808c8fdb6dbf46f8cab58d9ef1af",
      "0x2e47e15ea4a47ff1a6a853aaf3a644ca38d5b085ac1042fdc4a705a7ce089f4d",
      "0x166e5bf073378348860ca4a9c09d39e1673ab059935f4df35fb14528375772b6",
      "0x18b42d7ffdd2ea4faf235902f057a2740cacccd027233001ed10f96538f0916f",
      "0x089cb1b032238f5e4914788e3e3c7ead4fc368020b3ed38221deab1051c37702",
      "0x242acd3eb3a2f72baf7c7076dd165adf89f9339c7b971921d9e70863451dd8d1",
      "0x174fbb104a4ee302bf47f2bd82fce896eac9a068283f326474af860457245c3b",
      "0x17340e71d96f466d61f3058ce092c67d2891fb2bb318613f780c275fe1116c6b",
      "0x1e8e40ac853b7d42f00f2e383982d024f098b9f8fd455953a2fd380c4df7f6b2",
      "0x0529898dc0649907e1d4d5e284b8d1075198c55cad66e8a9bf40f92938e2e961",
      "0x2162754db0baa030bf7de5bb797364dce8c77aa017ee1d7bf65f21c4d4e5df8f",
      "0x12c7553698c4bf6f3ceb250ae00c58c2a9f9291efbde4c8421bef44741752ec6",
      "0x292643e3ba2026affcb8c5279313bd51a733c93353e9d9c79cb723136526508e",
      "0x00ccf13e0cb6f9d81d52951bea990bd5b6c07c5d98e66ff71db6e74d5b87d158",
      "0x185d1e20e23b0917dd654128cf2f3aaab6723873cb30fc22b0f86c15ab645b4b",
      "0x14c61c836d55d3df742bdf11c60efa186778e3de0f024c0f13fe53f8d8764e1f",
      "0x0f356841b3f556fce5dbe4680457691c2919e2af53008184d03ee1195d72449e",
      "0x1b8fd9ff39714e075df124f887bf40b383143374fd2080ba0c0a6b6e8fa5b3e8",
      "0x0e86a8c2009c140ca3f873924e2aaa14fc3c8ae04e9df0b3e9103418796f6024",
      "0x2e6c5e898f5547770e5462ad932fcdd2373fc43820ca2b16b0861421e79155c8",
      "0x05d797f1ab3647237c14f9d1df032bc9ff9fe1a0ecd377972ce5fd5a0c014604",
      "0x29a3110463a5aae76c3d152875981d0c1daf2dcd65519ef5ca8929851da8c008",
      "0x2974da7bc074322273c3a4b91c05354cdc71640a8bbd1f864b732f8163883314",
      "0x1ed0fb06699ba249b2a30621c05eb12ca29cb91aa082c8bfcce9c522889b47dc",
      "0x1c793ef0dcc51123654ff26d8d863feeae29e8c572eca912d80c8ae36e40fe9b",
      "0x1e6aac1c6d3dd3157956257d3d234ef18c91e82589a78169fbb4a8770977dc2f",
      "0x1a20ada7576234eee6273dd6fa98b25ed037748080a47d948fcda33256fb6bf5",
      "0x191033d6d85ceaa6fc7a9a23a6fd9996642d772045ece51335d49306728af96c",
      "0x006e5979da7e7ef53a825aa6fddc3abfc76f200b3740b8b232ef481f5d06297b",
      "0x0b0d7e69c651910bbef3e68d417e9fa0fbd57f596c8f29831eff8c0174cdb06d",
      "0x25caf5b0c1b93bc516435ec084e2ecd44ac46dbbb033c5112c4b20a25c9cdf9d",
      "0x12c1ea892cc31e0d9af8b796d9645872f7f77442d62fd4c8085b2f150f72472a",
      "0x16af29695157aba9b8bbe3afeb245feee5a929d9f928b9b81de6dadc78c32aae",
      "0x0136df457c80588dd687fb2f3be18691705b87ec5a4cfdc168d31084256b67dc",
      "0x1639a28c5b4c81166aea984fba6e71479e07b1efbc74434db95a285060e7b089",
      "0x03d62fbf82fd1d4313f8e650f587ec06816c28b700bdc50f7e232bd9b5ca9b76",
      "0x11aeeb527dc8ce44b4d14aaddca3cfe2f77a1e40fc6da97c249830de1edfde54",
      "0x13f9b9a41274129479c5e6138c6c8ee36a670e6bc68c7a49642b645807bfc824",
      "0x0e4772fa3d75179dc8484cd26c7c1f635ddeeed7a939440c506cae8b7ebcd15b",
      "0x1b39a00cbc81e427de4bdec58febe8d8b5971752067a612b39fc46a68c5d4db4",
      "0x2bedb66e1ad5a1d571e16e2953f48731f66463c2eb54a245444d1c0a3a25707e",
      "0x2cf0a09a55ca93af8abd068f06a7287fb08b193b608582a27379ce35da915dec",
      "0x2d1bd78fa90e77aa88830cabfef2f8d27d1a512050ba7db0753c8fb863efb387",
      "0x065610c6f4f92491f423d3071eb83539f7c0d49c1387062e630d7fd283dc3394",
      "0x2d933ff19217a5545013b12873452bebcc5f9969033f15ec642fb464bd607368",
      "0x1aa9d3fe4c644910f76b92b3e13b30d500dae5354e79508c3c49c8aa99e0258b",
      "0x027ef04869e482b1c748638c59111c6b27095fa773e1aca078cea1f1c8450bdd",
      "0x2b7d524c5172cbbb15db4e00668a8c449f67a2605d9ec03802e3fa136ad0b8fb",
      "0x0c7c382443c6aa787c8718d86747c7f74693ae25b1e55df13f7c3c1dd735db0f",
      "0x00b4567186bc3f7c62a7b56acf4f76207a1f43c2d30d0fe4a627dcdd9bd79078",
      "0x1e41fc29b825454fe6d61737fe08b47fb07fe739e4c1e61d0337490883db4fd5",
      "0x12507cd556b7bbcc72ee6dafc616584421e1af872d8c0e89002ae8d3ba0653b6",
      "0x13d437083553006bcef312e5e6f52a5d97eb36617ef36fe4d77d3e97f71cb5db",
      "0x163ec73251f85443687222487dda9a65467d90b22f0b38664686077c6a4486d5"
    ],
    "M": [
      [
        "0x236d13393ef85cc48a351dd786dd7a1de5e39942296127fd87947223ae5108ad",
        "0x277686494f7644bbc4a9b194e10724eb967f1dc58718e59e3cedc821b2a7ae19",
        "0x023db68784e3f0cc0b85618826a9b3505129c16479973b0a84a4529e66b09c62",
        "0x1d359d245f286c12d50d663bae733f978af08cdbd63017c57b3a75646ff382c1"
      ],
      [
        "0x2a75a171563b807db525be259699ab28fe9bc7fb1f70943ff049bc970e841a0c",
        "0x083abff5e10051f078e2827d092e1ae808b4dd3e15ccc3706f38ce4157b6770e",
        "0x1a5ad71bbbecd8a97dc49cfdbae303ad24d5c4741eab8b7568a9ff8253a1eb6f",
        "0x0d745fd00dd167fb86772133640f02ce945004a7bc2c59e8790f725c5d84f0af"
      ],
      [
        "0x2070679e798782ef592a52ca9cef820d497ad2eecbaa7e42f366b3e521c4ed42",
        "0x2e18c8570d20bf5df800739a53da75d906ece318cd224ab6b3a2be979e2d7eab",
        "0x0fa86f0f27e4d3dd7f3367ce86f684f1f2e4386d3e5b9f38fa283c6aa723b608",
        "0x03f3e6fab791f16628168e4b14dbaeb657035ee3da6b2ca83f0c2491e0b403eb"
      ],
      [
        "0x2f545e578202c9732488540e41f783b68ff0613fd79375f8ba8b3d30958e7677",
        "0x23810bf82877fc19bff7eefeae3faf4bb8104c32ba4cd701596a15623d01476e",
        "0x014fcd5eb0be6d5beeafc4944034cf321c068ef930f10be2207ed58d2a34cdd6",
        "0x00c15fc3a1d5733dd835eae0823e377f8ba4a8b627627cc2bb661c25d20fb52a"
      ]
    ]
  }
};

// sdk/client/notes.ts
var FIELD2 = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
function exact2(value, fields) {
  if (Object.keys(value).sort().join("|") !== [...fields].sort().join("|")) throw new Error("Unexpected private note fields");
}
var constants = Object.fromEntries([2, 3].map((n) => [n, { C: parameters[n].C.map(BigInt), M: parameters[n].M.map((row) => row.map(BigInt)) }]));
function noteHash(inputs) {
  if (inputs.length !== 2 && inputs.length !== 3) throw new Error("Poseidon supports two or three inputs");
  const n = inputs.length, { C, M } = constants[n], partial = n === 2 ? 57 : 56;
  let state = [0n, ...inputs.map((value) => BigInt(scalar(value)))];
  const pow5 = (x) => {
    const square2 = x * x % FIELD2;
    return square2 * square2 % FIELD2 * x % FIELD2;
  };
  for (let round = 0; round < 8 + partial; round++) {
    state = state.map((value, i) => (value + C[round * (n + 1) + i]) % FIELD2);
    state = state.map((value, i) => round < 4 || round >= partial + 4 || i === 0 ? pow5(value) : value);
    state = M.map((row) => row.reduce((sum, coefficient, i) => (sum + coefficient * state[i]) % FIELD2, 0n));
  }
  return state[0].toString();
}
async function noteDomain(input) {
  const policy = parsePolicy(input);
  feeQuote(policy);
  return shaField(`core:ft:v3|${policy.network}|${policy.registry}|${policy.tokenId}|${policy.denomination}`);
}
async function validatePrivateNote(policy, raw) {
  const note = object(raw);
  exact2(note, ["version", "domain", "secret", "nullifier", "commitment"]);
  const domain = scalar(note.domain), secret = scalar(note.secret), nullifier = scalar(note.nullifier), commitment = scalar(note.commitment);
  if (note.version !== 1 || commitment === "0" || domain !== await noteDomain(policy) || commitment !== noteHash([secret, nullifier, domain])) throw new Error("Invalid note or different settlement group");
  return { version: 1, domain, secret, nullifier, commitment };
}

// sdk/client/prover.ts
var HASH = /^[a-f0-9]{64}$/;
var Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583n;
function exact3(o, keys) {
  if (Object.keys(o).sort().join("|") !== [...keys].sort().join("|")) throw new Error("Unexpected proving fields");
}
function hash2(value) {
  if (typeof value !== "string" || !HASH.test(value)) throw new Error("Invalid proving digest");
  return value;
}
function block(input) {
  const b = object(input);
  exact3(b, ["hash", "height"]);
  if (typeof b.hash !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(b.hash) || !Number.isSafeInteger(b.height) || Number(b.height) < 0) throw new Error("Invalid finalized snapshot");
  return { hash: b.hash, height: b.height };
}
function ft(input) {
  const policy = parsePolicy(input);
  feeQuote(policy);
  if (!policy.tokenId) throw new Error("Browser proving requires a trusted FT group");
  return policy;
}
function vaultFor(policy, value) {
  const vault2 = account(value);
  if (!new RegExp(`^v[a-f0-9]{32}\\.${policy.registry.replaceAll(".", "\\.")}$`).test(vault2)) throw new Error("Vault must be a direct protocol child in the original group");
  return vault2;
}
function parseProvingAction(input, policy) {
  const a = object(input);
  exact3(a, ["recipient", "disclosureRoot"]);
  const recipient = account(a.recipient);
  if (recipient === policy.registry || recipient.endsWith("." + policy.registry)) throw new Error("Choose an external recipient");
  return { recipient, disclosureRoot: hash2(a.disclosureRoot) };
}
function parseProvingContext(input, expected) {
  const c = object(input);
  exact3(c, ["version", "policy", "checkedAtBlock", "root", "commitments", "vault"]);
  const policy = ft(c.policy);
  if (c.version !== 1 || canonical(policy) !== canonical(ft(expected))) throw new Error("Proving context differs from the trusted policy");
  if (!Array.isArray(c.commitments) || c.commitments.length < 1 || c.commitments.length > 256) throw new Error("Expected 1\u2013256 ordered commitments");
  const commitments = c.commitments.map(scalar);
  if (commitments.includes("0") || new Set(commitments).size !== commitments.length) throw new Error("Empty or duplicate commitment");
  return { version: 1, policy, root: scalar(c.root), commitments, vault: vaultFor(policy, c.vault), checkedAtBlock: block(c.checkedAtBlock) };
}
async function spendWitness(request) {
  const policy = ft(request.policy), note = await validatePrivateNote(policy, request.note);
  const context = parseProvingContext(request.context, policy), action = parseProvingAction(request.action, policy);
  let index = context.commitments.indexOf(note.commitment);
  if (index < 0) throw new Error("Note is absent from the original group snapshot");
  let level = [...context.commitments, ...Array(256 - context.commitments.length).fill("0")];
  const siblings = [], pathIndices = [];
  for (let depth = 0; depth < 8; depth++) {
    siblings.push(level[index ^ 1]);
    pathIndices.push(index & 1);
    index >>= 1;
    const next = [];
    for (let i = 0; i < level.length; i += 2) next.push(noteHash([level[i], level[i + 1]]));
    level = next;
  }
  if (level[0] !== context.root) throw new Error("Ordered commitments do not match the group root");
  const contextHash = await withdrawalContext(policy, context.vault, action), domain = note.domain;
  return {
    input: { root: context.root, contextHash, domain, secret: note.secret, nullifier: note.nullifier, siblings, pathIndices },
    publicInputs: [noteHash([note.nullifier, domain]), noteHash([note.nullifier, contextHash]), context.root, contextHash, domain]
  };
}
async function withdrawalContext(policy, vault2, action) {
  return shaField(`core:action:ft:v3|${await noteDomain(policy)}|withdraw|${vault2}|${action.recipient}|${action.disclosureRoot}`);
}
async function digest(bytes2) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes2))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function read2(blob, max) {
  if (!(blob instanceof Blob) || blob.size < 1 || blob.size > max) throw new Error("Proving asset size is outside the supported limit");
  return new Uint8Array(await blob.arrayBuffer());
}
async function verifyProvingAssets(assets, expected) {
  const manifestBytes = await read2(assets.manifest, 8192);
  if (await digest(manifestBytes) !== hash2(assets.manifestSha256)) throw new Error("Artifact manifest hash mismatch");
  const manifest = object(JSON.parse(new TextDecoder().decode(manifestBytes)));
  exact3(manifest, ["protocol", "depth", "setup", "hashes"]);
  if (manifest.protocol !== "core-v1" || manifest.depth !== 8 || typeof manifest.setup !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(manifest.setup)) throw new Error("Unsupported proving manifest");
  const hashes = object(manifest.hashes);
  exact3(hashes, ["spend.r1cs", "spend_js/spend.wasm", "spend.zkey", "verification_key.json"]);
  Object.values(hashes).forEach(hash2);
  const wasm = await read2(assets.wasm, 8 * 1024 * 1024), zkey = await read2(assets.zkey, 16 * 1024 * 1024), key = await read2(assets.verificationKey, 16384);
  if (await digest(wasm) !== hashes["spend_js/spend.wasm"] || await digest(zkey) !== hashes["spend.zkey"] || await digest(key) !== hashes["verification_key.json"]) throw new Error("Proving asset hash mismatch");
  const verificationKey = object(JSON.parse(new TextDecoder().decode(key)));
  if (await digest(encodeVerificationKeyBytes(verificationKey)) !== ft(expected).verifierSha256) throw new Error("Verification key differs from the trusted policy");
  return { wasm, zkey, verificationKey, setup: manifest.setup };
}
function limb(value) {
  if (typeof value !== "string" || !/^(0|[1-9][0-9]*)$/.test(value) || value.length > 77 || BigInt(value) >= Q) throw new Error("Invalid BN254 coordinate");
  let n = BigInt(value);
  return Uint8Array.from({ length: 32 }, () => {
    const byte = Number(n & 255n);
    n >>= 8n;
    return byte;
  });
}
function g1(p) {
  if (!Array.isArray(p) || p.length !== 3 || p[2] !== "1") throw new Error("Invalid affine G1 point");
  return [limb(p[0]), limb(p[1])];
}
function g2(p) {
  if (!Array.isArray(p) || p.length !== 3 || !Array.isArray(p[0]) || p[0].length !== 2 || !Array.isArray(p[1]) || p[1].length !== 2 || canonical(p[2]) !== '["1","0"]') throw new Error("Invalid affine G2 point");
  return [limb(p[0][0]), limb(p[0][1]), limb(p[1][0]), limb(p[1][1])];
}
function concat(parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}
function encodeVerificationKeyBytes(key) {
  if (key.protocol !== "groth16" || key.curve !== "bn128" || key.nPublic !== 5 || !Array.isArray(key.IC) || key.IC.length !== 6) throw new Error("Wrong circuit verification key");
  return concat([...g1(key.vk_alpha_1), ...g2(key.vk_beta_2), ...g2(key.vk_gamma_2), ...g2(key.vk_delta_2), ...key.IC.flatMap(g1)]);
}
function encodeBrowserProof(input) {
  const p = object(input);
  if (p.protocol !== "groth16" || p.curve !== "bn128") throw new Error("Wrong proof protocol");
  return btoa(String.fromCharCode(...concat([...g1(p.pi_a), ...g2(p.pi_b), ...g1(p.pi_c)])));
}
function parseSpend(input) {
  const p = object(input);
  exact3(p, ["proof", "public_inputs"]);
  if (typeof p.proof !== "string" || !/^[A-Za-z0-9+/]{342}==$/.test(p.proof) || atob(p.proof).length !== 256 || btoa(atob(p.proof)) !== p.proof || !Array.isArray(p.public_inputs) || p.public_inputs.length !== 5) throw new Error("Invalid spend proof");
  return { proof: p.proof, public_inputs: p.public_inputs.map(scalar) };
}
function decodeBrowserProof(spend) {
  const bytes2 = Uint8Array.from(atob(parseSpend(spend).proof), (c) => c.charCodeAt(0));
  const limbs = Array.from({ length: 8 }, (_, i) => {
    const value = BigInt("0x" + [...bytes2.slice(i * 32, (i + 1) * 32)].reverse().map((b) => b.toString(16).padStart(2, "0")).join("")).toString();
    limb(value);
    return value;
  });
  return { protocol: "groth16", curve: "bn128", pi_a: [...limbs.slice(0, 2), "1"], pi_b: [limbs.slice(2, 4), limbs.slice(4, 6), ["1", "0"]], pi_c: [...limbs.slice(6), "1"] };
}
async function publicPlan(policy, action, spend, checkedAtBlock) {
  const q = feeQuote(policy);
  const tokenCall = { contract: policy.tokenId, method: "ft_transfer_call", args: {
    receiver_id: policy.registry,
    amount: q.feeTokens,
    msg: JSON.stringify({ vault: action.vault, recipient: action.recipient, disclosure_root: action.disclosureRoot, ...spend })
  }, attachedYoctoNear: "1", gas: "300000000000000" };
  await preparedPayment({ tokenCall, checkedAtBlock }, policy, action.recipient);
  return { tokenCall, checkedAtBlock };
}
async function createProofBundle(request, assets, raw) {
  const policy = ft(request.policy), context = parseProvingContext(request.context, policy), action = { ...parseProvingAction(request.action, policy), vault: context.vault }, spend = parseSpend(raw);
  const payload = {
    format: "core-browser-proof",
    version: 1,
    policy,
    action,
    checkedAtBlock: context.checkedAtBlock,
    artifactManifestSha256: hash2(assets.manifestSha256),
    setup: assets.setup,
    spend,
    plan: await publicPlan(policy, action, spend, context.checkedAtBlock.hash)
  };
  return { ...payload, digest: await sha256(canonical(payload)) };
}
async function parseProofBundle(raw, expected) {
  const b = object(raw);
  exact3(b, ["format", "version", "policy", "action", "checkedAtBlock", "artifactManifestSha256", "setup", "spend", "plan", "digest"]);
  const { digest: checksum, ...payload } = b;
  if (b.format !== "core-browser-proof" || b.version !== 1 || await sha256(canonical(payload)) !== hash2(checksum) || canonical(ft(b.policy)) !== canonical(ft(expected))) throw new Error("Proof file integrity or policy mismatch");
  const policy = ft(expected), a = object(b.action);
  exact3(a, ["vault", "recipient", "disclosureRoot"]);
  const action = { ...parseProvingAction({ recipient: a.recipient, disclosureRoot: a.disclosureRoot }, policy), vault: vaultFor(policy, a.vault) }, spend = parseSpend(b.spend), checkedAtBlock = block(b.checkedAtBlock);
  if (spend.public_inputs[4] !== await noteDomain(policy) || spend.public_inputs[3] !== await withdrawalContext(policy, action.vault, action)) throw new Error("Proof file does not bind this withdrawal");
  if (canonical(b.plan) !== canonical(await publicPlan(policy, action, spend, checkedAtBlock.hash)) || typeof b.setup !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(b.setup)) throw new Error("Proof plan or setup metadata mismatch");
  hash2(b.artifactManifestSha256);
  return b;
}

// sdk/prover-worker.ts
var scope = globalThis;
var started = false;
scope.onmessage = (event) => {
  if (started) return;
  started = true;
  void execute(event.data);
};
async function execute(message) {
  let code = "ASSET_INVALID";
  const progress = (stage) => scope.postMessage({ type: "progress", id: message.id, stage });
  const start = performance.now();
  try {
    progress("assets");
    const assets = await verifyProvingAssets(message.assets, message.policy);
    let witnessMs = 0, provingMs = 0;
    let bundle;
    scope.curve_bn128 = await curves.getCurveFromName("bn128", { singleThread: true });
    if (message.operation === "prove" && message.request) {
      code = "INPUT_INVALID";
      progress("tree");
      const witness = await spendWitness(message.request);
      code = "PROVING_FAILED";
      progress("witness");
      const wtnsFile = { type: "mem" };
      let clock2 = performance.now();
      await wtns.calculate(witness.input, assets.wasm, wtnsFile, { memorySize: 256 });
      witnessMs = performance.now() - clock2;
      progress("proving");
      clock2 = performance.now();
      const result = await groth16.prove(assets.zkey, wtnsFile);
      provingMs = performance.now() - clock2;
      code = "PROOF_INVALID";
      if (canonical(result.publicSignals) !== canonical(witness.publicInputs)) throw new Error("Input mismatch");
      bundle = await createProofBundle(message.request, { manifestSha256: message.assets.manifestSha256, setup: assets.setup }, { proof: encodeBrowserProof(result.proof), public_inputs: result.publicSignals });
    } else if (message.operation === "verify" && message.bundle) {
      code = "PROOF_INVALID";
      bundle = await parseProofBundle(message.bundle, message.policy);
      if (bundle.artifactManifestSha256 !== message.assets.manifestSha256 || bundle.setup !== assets.setup) throw new Error("Artifact mismatch");
    } else throw new Error("Unsupported operation");
    code = "PROOF_INVALID";
    progress("verifying");
    const clock = performance.now();
    if (!await groth16.verify(assets.verificationKey, bundle.spend.public_inputs, decodeBrowserProof(bundle.spend))) throw new Error("Verification failed");
    const verificationMs = performance.now() - clock;
    scope.postMessage({ type: "result", id: message.id, bundle, metrics: { elapsedMs: performance.now() - start, witnessMs, provingMs, verificationMs } });
  } catch {
    scope.postMessage({ type: "error", id: message.id, code });
  }
}
