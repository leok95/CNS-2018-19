const fs = require('fs')
const path = require('path')
const debug = require('debug')('oracle:controllers')
const config = rootrequire('config/config')
const crypto = require('crypto')
const Crypto = rootrequire('crypto_modules/CryptoProvider')

const serverRSAPublic = config.PUBLIC_KEY;
const serverRSAPrivate = config.PRIVATE_KEY;
// const serverRSAPublic = fs.readFileSync(path.join(__dirname, 'public.pem'))
// const serverRSAPrivate = fs.readFileSync(path.join(__dirname, 'private.pem'))

let clientRSAPublic = undefined;
let clientDHPublic = undefined;
let challenge = null;

debug('RSA keys loaded!')
debug('Server public RSA key:', serverRSAPublic)

module.exports = {

    serverRSA: (req, res) => res.json({ 
        key: Buffer.from(serverRSAPublic).toString('hex') 
    }),
    
    clientRSA: (req, res, next) => {

        const { key=undefined } = req.body

        //========================================================
        // Test the format of the submitted client RSA public key
        //========================================================
        try {
            clientRSAPublic = Buffer.from(key, 'hex').toString()

            crypto.publicEncrypt({ 
                key: clientRSAPublic, 
                // We use an insecure padding in this test since it is 
                // faster than OAEP padding; there is no harm in doing
                // this since here we encrypt only locally to test 
                // the correctnes of the format of the submitted key.
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, Buffer.from('0'));

        } catch(err) {
            clientRSAPublic = undefined;
            debug(err)
            err.code = 'EBAD_PUBLICKEY'
            return next(err)
        }

        res.json({ result: 'SUCCESS' }) 
    },

    clientDH: (req, res, next) => {
        if (!clientRSAPublic) {
            return res.json({ result: 'FAILURE', msg: "Missing the client's RSA public key" })
        }

        let { key=undefined, signature=undefined } = req.body

        try {

            clientDHPublic = Buffer.from(key, 'hex')

            //================================================================
            // Verify the signature over the client DH public key.
            // The key is signed by the client using his/her RSA private key.
            //================================================================
            const verify = crypto.createVerify('RSA-SHA256')
            verify.write(clientDHPublic.toString('hex'))
            verify.end()
            if (!verify.verify(clientRSAPublic.toString('base64'), signature, 'hex')) {
                clientDHPublic = undefined;
                return res.json({ result: 'FAILURE' })
            }
            
            res.json({ result: 'SUCCESS' })

        } catch(err) {
            clientDHPublic = undefined;
            debug(err)
            err.code = 'EBAD_PUBLICKEY'
            return next(err)
        }
    },

    challenge: (req, res, next) => {
        if (!clientDHPublic) {
            return res.json({ result: 'FAILURE', msg: "Missing the client's DH public key" })
        }

        let serverDH = undefined
        let signature = undefined

        try {
            //======================================
            // Generate ephmeral/one-time DH keys.
            // By using these keys only once, we 
            // ensure the forward secrecy property.
            //======================================
            serverDH = crypto.getDiffieHellman('modp15')
            serverDH.generateKeys()
            
            //=============================================================
            // The server signs the concatenation of the server and client 
            // DH public keys using its RSA private key.
            //=============================================================
            const sign = crypto.createSign('RSA-SHA256')
            sign.write(serverDH.getPublicKey('hex') + clientDHPublic.toString('hex'))
            sign.end()
            signature = sign.sign(serverRSAPrivate, 'hex')

            //===============================================================
            // Compute a DH shared key between the server and the client and
            // use it to derive a 256 bit AES encryption key.
            //===============================================================            
            const dhSharedKey = serverDH.computeSecret(clientDHPublic)
            const derivedKey = crypto.pbkdf2Sync(dhSharedKey, 'ServerClient', 1, 32, 'sha512');

            //====================================================
            // Finally, encrypt the challenge in AES-256-CTR mode
            // using the derived/agreed key. 
            //====================================================
            challenge = Crypto.encrypt('CTR', {
                key: derivedKey,  
                iv: Buffer.alloc(16),
                plaintext: config.ASYMM_CHALLENGE
            })
        } catch(err) {
            debug(err)
            return next(err)
        }

        // Please note that we only protect the confidentiality 
        // of the challenge; no integrity protection is used.
        res.json({ 
            key: serverDH.getPublicKey('hex'),
            signature,
            challenge
        })

        // DH key should be used only once in order to ensure
        // the forward secrecy property.
        serverDH = undefined
        clientDHPublic = undefined
        dhSharedKey = undefined
        derivedKey = undefined
    }
}