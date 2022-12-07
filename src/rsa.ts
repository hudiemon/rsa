import {Barrett} from './barrett'
import {BigInt, biFromHex, biHighIndex, biFromString, biToBytes, biToHex, biToString, setMaxDigits} from './big-int'

export {setMaxDigits}

export enum RSAAPP {
    NoPadding = "NoPadding",
    RawEncoding = "RawEncoding",
    PKCS1Padding = "PKCS1Padding",
    NumericEncoding = "NumericEncoding"
}

export default class RSAKeyPair {
    e: BigInt;
    d: BigInt;
    m: BigInt;
    chunkSize: number;
    radix: number;
    barrett: Barrett;

    constructor(encryptionExponent: string, decryptionExponent: string, modulus: string, keylen?: number) {
        this.e = biFromHex(encryptionExponent);
        this.d = biFromHex(decryptionExponent);
        this.m = biFromHex(modulus);
        if (typeof (keylen) != 'number') {
            this.chunkSize = 2 * biHighIndex(this.m);
        } else {
            this.chunkSize = keylen / 8;
        }
        this.radix = 16;
        this.barrett = new Barrett(this.m);
    }
}
export const encryptedString = (key: RSAKeyPair, s: string, pad?: RSAAPP, encoding?: RSAAPP) => {
    const a = [];
    let sl = s.length;
    let i, j, k;
    let padtype;
    let encodingtype;
    let rpad;
    let al;
    let result = "";
    let block;
    let crypt;
    let text;
    if (typeof (pad) == 'string') {
        if (pad == RSAAPP.NoPadding) {
            padtype = 1;
        } else if (pad == RSAAPP.PKCS1Padding) {
            padtype = 2;
        } else {
            padtype = 0;
        }
    } else {
        padtype = 0;
    }
    if (typeof (encoding) == 'string' && encoding == RSAAPP.RawEncoding) {
        encodingtype = 1;
    } else {
        encodingtype = 0;
    }
    if (padtype == 1) {
        if (sl > key.chunkSize) {
            sl = key.chunkSize;
        }
    } else if (padtype == 2) {
        if (sl > (key.chunkSize - 11)) {
            sl = key.chunkSize - 11;
        }
    }
    i = 0;
    if (padtype == 2) {
        j = sl - 1;
    } else {
        j = key.chunkSize - 1;
    }
    while (i < sl) {
        if (padtype) {
            a[j] = s.charCodeAt(i);
        } else {
            a[i] = s.charCodeAt(i);
        }
        i++;
        j--;
    }
    if (padtype == 1) {
        i = 0;
    }
    j = key.chunkSize - (sl % key.chunkSize);
    while (j > 0) {
        if (padtype == 2) {
            rpad = Math.floor(Math.random() * 256);
            while (!rpad) {
                rpad = Math.floor(Math.random() * 256);
            }
            a[i] = rpad;
        } else {
            a[i] = 0;
        }
        i++;
        j--;
    }
    if (padtype == 2) {
        a[sl] = 0;
        a[key.chunkSize - 2] = 2;
        a[key.chunkSize - 1] = 0;
    }
    al = a.length;
    for (i = 0; i < al; i += key.chunkSize) {
        block = new BigInt();
        j = 0;
        for (k = i; k < (i + key.chunkSize); ++j) {
            block.digits[j] = a[k++];
            block.digits[j] += a[k++] << 8;
        }
        crypt = key.barrett.powMod(block, key.e);
        if (encodingtype == 1) {
            text = biToBytes(crypt);
        } else {
            text = (key.radix == 16) ? biToHex(crypt) : biToString(crypt, key.radix);
        }
        result += text;
    }
    return result;
}
export const decryptedString = (key: RSAKeyPair, c: string) => {
    const blocks = c.split(" ");
    let b;
    let i, j;
    let bi;
    let result = "";
    for (i = 0; i < blocks.length; ++i) {
        if (key.radix == 16) {
            bi = biFromHex(blocks[i]);
        } else {
            bi = biFromString(blocks[i], key.radix);
        }
        b = key.barrett.powMod(bi, key.d);
        for (j = 0; j <= biHighIndex(b); ++j) {
            result += String.fromCharCode(b.digits[j] & 255, b.digits[j] >> 8);
        }
    }
    if (result.charCodeAt(result.length - 1) == 0) {
        result = result.substring(0, result.length - 1);
    }
    return result;
}