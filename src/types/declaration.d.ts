declare module 'crypto-js' {
  type CipherParams = {
    toString(formatter?: unknown): string
  }

  type WordArray = {
    toString(formatter?: unknown): string
  }

  interface AESStatic {
    encrypt(message: string | WordArray, key: string): CipherParams
    decrypt(ciphertext: string | CipherParams, key: string): WordArray
  }

  interface Encodings {
    Utf8: {
      parse(str: string): WordArray
      stringify(wordArray: WordArray): string
    }
  }

  interface CryptoJS {
    AES: AESStatic
    enc: Encodings
  }

  const CryptoJS: CryptoJS
  export default CryptoJS
}

declare global {
  interface Window {
    ethereum?: import('viem').EIP1193Provider
  }
}
