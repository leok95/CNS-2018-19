const crypto = require('crypto')
const PBKDF2 = require('./pbkdf2-promise')
const RANDOM = require('./random-promise')
const ECB = require('./cipher').ecb
const CBC = require('./cipher').cbc
const CTR = require('./cipher').ctr

const Key = { PBKDF2, RANDOM }
const Cipher = { 
    ECB: ECB.encrypt, 
    CBC: CBC.encrypt, 
    CTR
}

const Decipher = { 
    ECB: ECB.decrypt, 
    CBC: CBC.decrypt
}

class CryptoProvider {
    static generateKey(type, params) {
        if (!Key.hasOwnProperty(type)) throw Error(`Wrong key generator type ${type}`)
        return Key[type](params)
    }

    static encrypt(type, params) {
        if (!Cipher.hasOwnProperty(type)) throw Error(`Wrong cipher/mode ${type}`)
        return Cipher[type](params)
    }

    static decrypt(type, params) {
        if (!Decipher.hasOwnProperty(type)) throw Error(`Wrong cipher/mode ${type}`)
        return Decipher[type](params)
    }
}

module.exports = CryptoProvider
