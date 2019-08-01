import { ec } from 'elliptic';
import { hashTransaction } from './hashing';
import { Buffer } from 'buffer';

/**
 * Returns signature encoded in DER format in base64.
 * @param sig 
 */
const encodeSignature = (sig: ec.Signature, enc = 'base64'): string => {
    return Buffer.from(sig.toDER()).toString(enc);
};

/**
 * Sign transaction with key.
 * @param {object} tx transaction
 * @param {BN} key key pair or private key
 */
const signMessage = async (msgHash: Buffer, key: ec.KeyPair, enc = 'base64'): Promise<string> => {
    const sig = key.sign(msgHash);
    return encodeSignature(sig, enc);
};

/**
 * Sign transaction with key.
 * @param {object} tx transaction
 * @param {BN} key key pair or private key
 */
const signTransaction = async (tx: any, key: ec.KeyPair, enc = 'base64'): Promise<string> => {
    const msgHash = await hashTransaction(tx, 'bytes', false) as Buffer;
    return signMessage(msgHash, key, enc);
};

/**
 * Verify that a signature for msg was generated by key
 * @param key key pair or public key
 */
const verifySignature = async (msg: Buffer, key: ec.KeyPair, signature: string, enc: 'base64' | 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'latin1' | 'binary' | 'hex' = 'base64'): Promise<boolean> => {
    try {
        const sign = Buffer.from(signature, enc);
        // @ts-ignore: the typedef is wrong, a Buffer is an allowed input
        return key.verify(msg, sign);
    } catch (e) {
        throw Error('could not decode signature: ' + e);
    }
};

/**
 * Verify that a signature for tx was generated by key
 */
const verifyTxSignature = async (tx: any, key: ec.KeyPair, signature: string): Promise<boolean> => {
    const msg = await hashTransaction(tx, 'bytes', false) as Buffer;
    return await verifySignature(msg, key, signature);
};

export {
    signMessage,
    signTransaction,
    verifySignature,
    verifyTxSignature,
    encodeSignature
};