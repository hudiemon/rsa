const biRadixBase = 2;
const biRadixBits = 16;
const bitsPerDigit = biRadixBits;
const biRadix = 1 << 16;
const biHalfRadix = biRadix >>> 1;
const biRadixSquared = biRadix * biRadix;
const maxDigitVal = biRadix - 1;
const maxInteger = 9999999999999998;

let maxDigits = 20;
let ZERO_ARRAY = Array(maxDigits).fill(0)
let bigZero: BigInt;
let bigOne: BigInt;

export class BigInt {
    public isNeg: boolean = false;
    digits: any;

    constructor(flag?: boolean) {
        if (typeof flag == "boolean" && flag) {
            this.digits = null;
        } else {
            this.digits = ZERO_ARRAY.slice(0);
        }
    }
}


export function setMaxDigits(value: number) {
    maxDigits = value
    ZERO_ARRAY = Array(maxDigits).fill(0)
    bigZero = new BigInt()
    bigOne = new BigInt()
    bigOne.digits[0] = 1
}

const dpl10 = 15;
const lr10 = biFromNumber(1000000000000000);

function biFromDecimal(s: string) {
    const isNeg = s.charAt(0) == '-';
    let i = isNeg ? 1 : 0;
    let result;
    while (i < s.length && s.charAt(i) == '0') ++i;
    if (i == s.length) {
        result = new BigInt();
    } else {
        var digitCount = s.length - i;
        var fgl = digitCount % dpl10;
        if (fgl == 0) fgl = dpl10;
        result = biFromNumber(Number(s.substr(i, fgl)));
        i += fgl;
        while (i < s.length) {
            result = biAdd(biMultiply(result, lr10),
                biFromNumber(Number(s.substr(i, dpl10))));
            i += dpl10;
        }
        result.isNeg = isNeg;
    }
    return result;
}

export function biCopy(bi: BigInt) {
    const result = new BigInt(true);
    result.digits = bi.digits.slice(0);
    result.isNeg = bi.isNeg;
    return result;
}

function biFromNumber(i: number) {
    const result = new BigInt();
    result.isNeg = i < 0;
    i = Math.abs(i);
    let j = 0;
    while (i > 0) {
        result.digits[j++] = i & maxDigitVal;
        i >>= biRadixBits;
    }
    return result;
}

function reverseStr(s: string) {
    let result = "";
    for (let i = s.length - 1; i > -1; --i) {
        result += s.charAt(i);
    }
    return result;
}

const hexatrigesimalToChar = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z'];

export function biToString(x: BigInt, radix: number) {
    const b = new BigInt();
    b.digits[0] = radix;
    let qr = biDivideModulo(x, b);
    let result = hexatrigesimalToChar[qr[1].digits[0]];
    while (biCompare(qr[0], bigZero) == 1) {
        qr = biDivideModulo(qr[0], b);
        const digit = qr[1].digits[0];
        result += hexatrigesimalToChar[qr[1].digits[0]];
    }
    return (x.isNeg ? "-" : "") + reverseStr(result);
}

function biToDecimal(x: BigInt) {
    const b = new BigInt();
    b.digits[0] = 10;
    let qr = biDivideModulo(x, b);
    let result = String(qr[1].digits[0]);
    while (biCompare(qr[0], bigZero) == 1) {
        qr = biDivideModulo(qr[0], b);
        result += String(qr[1].digits[0]);
    }
    return (x.isNeg ? "-" : "") + reverseStr(result);
}

const hexToChar = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f'];

function digitToHex(n: number) {
    const mask = 0xf;
    let result = "";
    for (let i = 0; i < 4; ++i) {
        result += hexToChar[n & mask];
        n >>>= 4;
    }
    return reverseStr(result);
}

export function biToHex(x: BigInt) {
    let result = "";
    for (let i = biHighIndex(x); i > -1; --i) {
        result += digitToHex(x.digits[i]);
    }
    return result;
}

function charToHex(c: number) {
    const ZERO = 48;
    const NINE = ZERO + 9;
    const littleA = 97;
    const littleZ = littleA + 25;
    const bigA = 65;
    const bigZ = 65 + 25;
    let result;

    if (c >= ZERO && c <= NINE) {
        result = c - ZERO;
    } else if (c >= bigA && c <= bigZ) {
        result = 10 + c - bigA;
    } else if (c >= littleA && c <= littleZ) {
        result = 10 + c - littleA;
    } else {
        result = 0;
    }
    return result;
}

function hexToDigit(s: string) {
    let result = 0;
    const sl = Math.min(s.length, 4);
    for (var i = 0; i < sl; ++i) {
        result <<= 4;
        result |= charToHex(s.charCodeAt(i))
    }
    return result;
}

export function biFromHex(s: string) {
    const result = new BigInt();
    const sl = s.length;
    for (let i = sl, j = 0; i > 0; i -= 4, ++j) {
        result.digits[j] = hexToDigit(s.substring(Math.max(i - 4, 0), Math.min(i, 4)));
    }
    return result;
}

export function biFromString(s: string, radix: number) {
    const isNeg = s.charAt(0) == '-';
    const istop = isNeg ? 1 : 0;
    let result = new BigInt();
    let place = new BigInt();
    place.digits[0] = 1;
    for (let i = s.length - 1; i >= istop; i--) {
        const c = s.charCodeAt(i);
        const digit = charToHex(c);
        const biDigit = biMultiplyDigit(place, digit);
        result = biAdd(result, biDigit);
        place = biMultiplyDigit(place, radix);
    }
    result.isNeg = isNeg;
    return result;
}

export function biToBytes(x: BigInt) {
    let result = "";
    for (let i = biHighIndex(x); i > -1; --i) {
        result += digitToBytes(x.digits[i]);
    }
    return result;
}

function digitToBytes(n: number) {
    const c1 = String.fromCharCode(n & 0xff);
    n >>>= 8;
    const c2 = String.fromCharCode(n & 0xff);
    return c2 + c1;
}

function biDump(b: BigInt) {
    return (b.isNeg ? "-" : "") + b.digits.join(" ");
}

export function biAdd(x: BigInt, y: BigInt) {
    let result;

    if (x.isNeg != y.isNeg) {
        y.isNeg = !y.isNeg;
        result = biSubtract(x, y);
        y.isNeg = !y.isNeg;
    } else {
        result = new BigInt();
        var c = 0;
        var n;
        for (var i = 0; i < x.digits.length; ++i) {
            n = x.digits[i] + y.digits[i] + c;
            result.digits[i] = n & 0xffff;
            c = Number(n >= biRadix);
        }
        result.isNeg = x.isNeg;
    }
    return result;
}

export function biSubtract(x: BigInt, y: BigInt): BigInt {
    let result;
    if (x.isNeg != y.isNeg) {
        y.isNeg = !y.isNeg;
        result = biAdd(x, y);
        y.isNeg = !y.isNeg;
    } else {
        result = new BigInt();
        let n, c;
        c = 0;
        for (let i = 0; i < x.digits.length; ++i) {
            n = x.digits[i] - y.digits[i] + c;
            result.digits[i] = n & 0xffff;
            if (result.digits[i] < 0) result.digits[i] += biRadix;
            c = 0 - Number(n < 0);
        }
        if (c == -1) {
            c = 0;
            for (let i = 0; i < x.digits.length; ++i) {
                n = 0 - result.digits[i] + c;
                result.digits[i] = n & 0xffff;
                if (result.digits[i] < 0) result.digits[i] += biRadix;
                c = 0 - Number(n < 0);
            }
            result.isNeg = !x.isNeg;
        } else {
            result.isNeg = x.isNeg;
        }
    }
    return result;
}

export function biHighIndex(x: BigInt) {
    let result = x.digits.length - 1;
    while (result > 0 && x.digits[result] == 0) --result;
    return result;
}

function biNumBits(x: BigInt) {
    const n = biHighIndex(x);
    let d = x.digits[n];
    const m = (n + 1) * bitsPerDigit;
    let result;
    for (result = m; result > m - bitsPerDigit; --result) {
        if ((d & 0x8000) != 0) break;
        d <<= 1;
    }
    return result;
}

export function biMultiply(x: BigInt, y: BigInt) {
    const result = new BigInt();
    let c;
    const n = biHighIndex(x);
    const t = biHighIndex(y);
    let uv, k;
    for (let i = 0; i <= t; ++i) {
        c = 0;
        k = i;
        for (let j = 0; j <= n; ++j, ++k) {
            uv = result.digits[k] + x.digits[j] * y.digits[i] + c;
            result.digits[k] = uv & maxDigitVal;
            c = uv >>> biRadixBits;
        }
        result.digits[i + n + 1] = c;
    }
    result.isNeg = x.isNeg != y.isNeg;
    return result;
}

function biMultiplyDigit(x: BigInt, y: number) {
    let n, c, uv;
    let result = new BigInt();
    n = biHighIndex(x);
    c = 0;
    for (let j = 0; j <= n; ++j) {
        uv = result.digits[j] + x.digits[j] * y + c;
        result.digits[j] = uv & maxDigitVal;
        c = uv >>> biRadixBits;
    }
    result.digits[1 + n] = c;
    return result;
}

function arrayCopy(src: string | any[], srcStart: number, dest: { [x: string]: any; }, destStart: number, n: number) {
    const m = Math.min(srcStart + n, src.length);
    for (let i = srcStart, j = destStart; i < m; ++i, ++j) {
        dest[j] = src[i];
    }
}

var highBitMasks = [0x0000, 0x8000, 0xC000, 0xE000, 0xF000, 0xF800,
    0xFC00, 0xFE00, 0xFF00, 0xFF80, 0xFFC0, 0xFFE0,
    0xFFF0, 0xFFF8, 0xFFFC, 0xFFFE, 0xFFFF];

function biShiftLeft(x: BigInt, n: number) {
    const digitCount = Math.floor(n / bitsPerDigit);
    const result = new BigInt();
    arrayCopy(x.digits, 0, result.digits, digitCount,
        result.digits.length - digitCount);
    const bits = n % bitsPerDigit;
    const rightBits = bitsPerDigit - bits;
    let i = result.digits.length - 1;
    for (let i1 = i - 1; i > 0; --i, --i1) {
        result.digits[i] = ((result.digits[i] << bits) & maxDigitVal) |
            ((result.digits[i1] & highBitMasks[bits]) >>>
                (rightBits));
    }
    result.digits[0] = ((result.digits[i] << bits) & maxDigitVal);
    result.isNeg = x.isNeg;
    return result;
}

const lowBitMasks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F,
    0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF,
    0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF];

export function biShiftRight(x: BigInt, n: number) {
    const digitCount = Math.floor(n / bitsPerDigit);
    const result = new BigInt();
    arrayCopy(x.digits, digitCount, result.digits, 0,
        x.digits.length - digitCount);
    const bits = n % bitsPerDigit;
    const leftBits = bitsPerDigit - bits;
    for (let i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
        result.digits[i] = (result.digits[i] >>> bits) |
            ((result.digits[i1] & lowBitMasks[bits]) << leftBits);
    }
    result.digits[result.digits.length - 1] >>>= bits;
    result.isNeg = x.isNeg;
    return result;
}

function biMultiplyByRadixPower(x: BigInt, n: number) {
    const result = new BigInt();
    arrayCopy(x.digits, 0, result.digits, n, result.digits.length - n);
    return result;
}

export function biDivideByRadixPower(x: BigInt, n: number) {
    const result = new BigInt();
    arrayCopy(x.digits, n, result.digits, 0, result.digits.length - n);
    return result;
}

export function biModuloByRadixPower(x: BigInt, n: number) {
    const result = new BigInt();
    arrayCopy(x.digits, 0, result.digits, 0, n);
    return result;
}

export function biCompare(x: BigInt, y: BigInt) {
    if (x.isNeg != y.isNeg) {
        return 1 - 2 * Number(x.isNeg);
    }
    for (let i = x.digits.length - 1; i >= 0; --i) {
        if (x.digits[i] != y.digits[i]) {
            if (x.isNeg) {
                return 1 - 2 * Number(x.digits[i] > y.digits[i]);
            } else {
                return 1 - 2 * Number(x.digits[i] < y.digits[i]);
            }
        }
    }
    return 0;
}

function biDivideModulo(x: BigInt, y: BigInt) {
    let nb = biNumBits(x);
    let tb = biNumBits(y);
    const origYIsNeg = y.isNeg;
    let q, r;
    if (nb < tb) {
        if (x.isNeg) {
            q = biCopy(bigOne);
            q.isNeg = !y.isNeg;
            x.isNeg = false;
            y.isNeg = false;
            r = biSubtract(y, x);
            x.isNeg = true;
            y.isNeg = origYIsNeg;
        } else {
            q = new BigInt();
            r = biCopy(x);
        }
        return [q, r];
    }
    q = new BigInt();
    r = x;
    let t = Math.ceil(tb / bitsPerDigit) - 1;
    let lambda = 0;
    while (y.digits[t] < biHalfRadix) {
        y = biShiftLeft(y, 1);
        ++lambda;
        ++tb;
        t = Math.ceil(tb / bitsPerDigit) - 1;
    }
    r = biShiftLeft(r, lambda);
    nb += lambda;
    const n = Math.ceil(nb / bitsPerDigit) - 1;
    let b = biMultiplyByRadixPower(y, n - t);
    while (biCompare(r, b) != -1) {
        ++q.digits[n - t];
        r = biSubtract(r, b);
    }
    for (let i = n; i > t; --i) {
        const ri = (i >= r.digits.length) ? 0 : r.digits[i];
        const ri1 = (i - 1 >= r.digits.length) ? 0 : r.digits[i - 1];
        const ri2 = (i - 2 >= r.digits.length) ? 0 : r.digits[i - 2];
        const yt = (t >= y.digits.length) ? 0 : y.digits[t];
        const yt1 = (t - 1 >= y.digits.length) ? 0 : y.digits[t - 1];
        if (ri == yt) {
            q.digits[i - t - 1] = maxDigitVal;
        } else {
            q.digits[i - t - 1] = Math.floor((ri * biRadix + ri1) / yt);
        }

        let c1 = q.digits[i - t - 1] * ((yt * biRadix) + yt1);
        let c2 = (ri * biRadixSquared) + ((ri1 * biRadix) + ri2);
        while (c1 > c2) {
            --q.digits[i - t - 1];
            c1 = q.digits[i - t - 1] * ((yt * biRadix) | yt1);
            c2 = (ri * biRadix * biRadix) + ((ri1 * biRadix) + ri2);
        }

        b = biMultiplyByRadixPower(y, i - t - 1);
        r = biSubtract(r, biMultiplyDigit(b, q.digits[i - t - 1]));
        if (r.isNeg) {
            r = biAdd(r, b);
            --q.digits[i - t - 1];
        }
    }
    r = biShiftRight(r, lambda);
    q.isNeg = x.isNeg != origYIsNeg;
    if (x.isNeg) {
        if (origYIsNeg) {
            q = biAdd(q, bigOne);
        } else {
            q = biSubtract(q, bigOne);
        }
        y = biShiftRight(y, lambda);
        r = biSubtract(y, r);
    }
    if (r.digits[0] == 0 && biHighIndex(r) == 0) r.isNeg = false;
    return [q, r];
}

export function biDivide(x: BigInt, y: BigInt) {
    return biDivideModulo(x, y)[0];
}

function biModulo(x: BigInt, y: BigInt) {
    return biDivideModulo(x, y)[1];
}

function biMultiplyMod(x: BigInt, y: BigInt, m: BigInt) {
    return biModulo(biMultiply(x, y), m);
}

function biPowMod(x: BigInt, y: BigInt, m: BigInt) {
    let result = bigOne;
    let a = x;
    let k = y;
    while (true) {
        if ((k.digits[0] & 1) != 0) result = biMultiplyMod(result, a, m);
        k = biShiftRight(k, 1);
        if (k.digits[0] == 0 && biHighIndex(k) == 0) break;
        a = biMultiplyMod(a, a, m);
    }
    return result;
}
