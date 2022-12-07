# rsa

[![NPM version](https://img.shields.io/npm/v/rsa.svg?style=flat)](https://npmjs.org/package/@hudiemon/rsa)
[![NPM downloads](http://img.shields.io/npm/dm/rsa.svg?style=flat)](https://npmjs.org/package/@hudiemon/rsa)   
基于[https://ohdave.com/rsa/](https://ohdave.com/rsa/)，未做任何修改。方便在现代项目中使用。
## Install

```bash
$ npm i @hudiemon/rsa
```

```javascript
import RSAKeyPair,{setMaxDigits,encryptedString} from '@hudiemon/rsa'

setMaxDigits(131);
const key = new RSAKeyPair(
    "010001",
    "", 
    "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7"
);
encryptedString(key, "yhDnpHz1LjJjoeAh");
// 0af5c736ac376e04167b6c394129733d72511cabe2197e1f1afb232e8cf4031cb1fa59af6a64e0cd789b86ca319777114280f961fde1ac9e7779db263a654e38c94ebff223a13a80c42fd025a5f3b1e003828029efa8ff871cec27a5b9acc499697812773cb588746d007d3ad16c8636e3c6e8cdcf97c048b0e4bb20d1aa4d3e
```

## LICENSE

MIT
