import {
    BigInt,
    biCopy,
    biHighIndex,
    biDivide,
    biDivideByRadixPower,
    biMultiply,
    biModuloByRadixPower,
    biSubtract,
    biAdd,
    biCompare,
    biShiftRight
} from './big-int'

export class Barrett {
    private modulus: BigInt;
    private k: number;
    private mu: any;
    private bkplus1: BigInt;
    constructor(m: BigInt) {
        this.modulus = biCopy(m);
        this.k = biHighIndex(this.modulus) + 1;
        const b2k = new BigInt();
        b2k.digits[2 * this.k] = 1; // b2k = b^(2k)
        this.mu = biDivide(b2k, this.modulus);
        this.bkplus1 = new BigInt();
        this.bkplus1.digits[this.k + 1] = 1; // bkplus1 = b^(k+1);
    }

    modulo = (x: BigInt) => {
        const q1 = biDivideByRadixPower(x, this.k - 1);
        const q2 = biMultiply(q1, this.mu);
        const q3 = biDivideByRadixPower(q2, this.k + 1);
        const r1 = biModuloByRadixPower(x, this.k + 1);
        const r2term = biMultiply(q3, this.modulus);
        const r2 = biModuloByRadixPower(r2term, this.k + 1);
        let r = biSubtract(r1, r2);
        if (r.isNeg) r = biAdd(r, this.bkplus1);
        let rgtem = biCompare(r, this.modulus) >= 0;
        while (rgtem) {
            r = biSubtract(r, this.modulus);
            rgtem = biCompare(r, this.modulus) >= 0;
        }
        return r;
    }
    multiplyMod = (x: BigInt, y: BigInt) => {
        const xy = biMultiply(x, y);
        return this.modulo(xy);
    }
    powMod = (x: BigInt, y: BigInt) => {
        let result = new BigInt();
        result.digits[0] = 1;
        let a = x;
        let k = y;
        while (true) {
            if ((k.digits[0] & 1) != 0) result = this.multiplyMod(result, a);
            k = biShiftRight(k, 1);
            if (k.digits[0] == 0 && biHighIndex(k) == 0) break;
            a = this.multiplyMod(a, a);
        }
        return result;
    }
}

