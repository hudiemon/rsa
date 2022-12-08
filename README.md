# rsa

[![NPM version](https://img.shields.io/npm/v/rsa.svg?style=flat)](https://npmjs.org/package/@hudiemon/rsa)
[![NPM downloads](http://img.shields.io/npm/dm/rsa.svg?style=flat)](https://npmjs.org/package/@hudiemon/rsa)  

RSA in JavaScript v2 – now with padding!
### Background
In 1998, I wrote a multiple-precision math library in JavaScript. At the time, this was just an exercise in coding-for-the-joy-of-it. To test the library's validity, I implemented a few routines to do simple RSA encryption/decryption. Since this was just a proof-of-concept, I wasn't concerned with how the data got encoded/decoded...but apparently I should have been.   

As it turns out, people were interested in using this stuff. Some folks have [written articles](http://www.codeproject.com/aspnet/rasinterop.asp) about it, and others have actually [put it into production](https://web.archive.org/web/20071113225212/http://blog.meebo.com/?p=24%20target=). To this day, most of the traffic on my site is related to this RSA business (which is crazy – haven't you seen my [collection of guitar transcriptions](https://ohdave.com/guitar)??). I have received quite a few queries over the years asking how to make the library compatible with OpenSSL. The obstacle was always padding.

About a year ago, a gentleman named **Eric Wilde** solved all of our problems. He implemented PKCS #1 v1.5 padding and baked it right in, so you just have to add a flag to one function call, and you get the results correctly formatted for OpenSSL. In the process, he documented the RSA library more thoroughly, and also provided a stripped version (using jsmin) for production use.

### How to use
The most common use for this library, as shown in the sidebar, is to have the server provide a public key to the client, which uses the JavaScript to encrypt data and send it back to the server. Only the server has knowledge of the private key, which it uses to decrypt the data.

On the client, here are the JavaScript files you need:
* [Multiple-precision library](https://ohdave.com/rsa/BigInt.js)
* [Barrett modular reduction library](https://ohdave.com/rsa/Barrett.js)
* [RSA library with documentation comments](https://ohdave.com/rsa/RSA.js)  
  or [stripped for production use](https://ohdave.com/rsa/RSA_Stripped.js).

On the server, you can use whatever language you'd like. In this example, we're using PHP.
* [PHP source](https://ohdave.com/rsa/decrypt.php.txt)

Other languages, including Perl, Python, and Ruby, are coming soon.
### Creating and managing keys
I recommend using [OpenSSL](https://www.openssl.org/) to create and manage RSA keys. The OpenSSL toolkit is readily available on Unix and Windows OSes, and if you're working with a third party's public key, you'll mostly likely get it in the PEM container format, which OpenSSL works nicely with.

**Creating a new keypair**: To create a new 2048-bit keypair from a command-line interpreter such as bash, use this command:
```
openssl genrsa -out private_key.pem 2048
```
The generated file, private_key.pem, should be only accessible by the server, not the client or the general public. The OpenSSL functions are available in all mainstream languages. This means the server should be able to read this file as-is and use it to decrypt data sent from the client. The JavaScript library, however, is not able to read this format. It expects the public key to be given as two numbers, the public exponent and the modulus, in hexadecimal format. Fortunately, OpenSSL makes this easy. To get the encryption exponent, use this command:
```
openssl rsa -inform PEM -text -noout < private_key.pem
```
This prints out all key components as hexadecimal numbers. The component called "publicExponent" is what you're looking for, and by default it has the value 0x10001:
```
publicExponent: 65537 (0x10001)
```
The hex value, e.g. "10001", is provided to the JavaScript library without the leading "0x". The other numbers, such as the modulus, are formatted in a way that delimits each byte with a colon. However, there is a different flag that prints the modulus only, without the colons:
```
openssl rsa -inform PEM -modulus -noout < private_key.pem
```
After removing the "Modulus=" prefix, the rest of the value can be directly used by the JavaScript library, as you can see in the source for this webpage.
**Using a third-party public key**: If someone else gives you their public key file in PEM format, you can extract the public exponent and the modulus using the same commands, but with the additional -pubin flag. To print the public exponent, use:
```
openssl rsa -pubin -inform PEM -text -noout < public_key.pem
```
And to print the modulus, use:
```
openssl rsa -pubin -inform PEM -modulus -noout < public_key.pem
```
Again, see this webpage's source to see how these values are provided to the JavaScript library.
## Acknowledgments
Many thanks to **Eric Wilde** and **Rob Saunders** for helping with padding and endianness issues.

**Fun links**:
* [Chapter 8: Public-Key Encryption](http://cacr.uwaterloo.ca/hac/about/chap8.pdf) from the [Handbook of Applied Cryptography](http://www.cacr.math.uwaterloo.ca/hac)
* [Man-in-the-middle attack](http://en.wikipedia.org/wiki/Man-in-the-middle_attack). This stuff is susceptible. Understand the limits of this technique.
* [Why PKCS#1v1.5 Encryption Should Be Put Out of Our Misery](http://cryptosense.com/why-pkcs1v1-5-encryption-should-be-put-out-of-our-misery/)
* [Oh, Meebo](https://web.archive.org/web/20091216114817/http://chargen.matasano.com/chargen/2006/4/28/oh-meebo.html). Thomas Ptacek's (Matasano Security) criticism of Meebo using JavaScript-based RSA.
## LICENSE

MIT

