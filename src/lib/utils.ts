import CryptoJS from 'crypto-js'
import { toast } from 'react-hot-toast'

export const cn = (...inputs: Array<string | false | null | undefined>) => inputs.filter(Boolean).join(' ')

export const cryptic = () => {
  const getKey = () => {
    const key = import.meta.env.VITE_SECRET_KEY
    return typeof key === 'string' && key.trim().length > 0 ? key : null
  }

  const safeEncrypt = (data: string) => {
    const key = getKey()
    if (!key) return data
    try {
      return CryptoJS.AES.encrypt(data, key).toString()
    } catch {
      return data
    }
  }

  const safeDecrypt = (data: string) => {
    const key = getKey()
    if (!key) return data
    try {
      return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8)
    } catch {
      return data
    }
  }

  return {
    encrypt: (data: string) => safeEncrypt(data),
    decrypt: (data: string) => safeDecrypt(data),
    urlSafeEncrypt: (data: string) => encodeURIComponent(safeEncrypt(data)),
    urlSafeDecrypt: (data: string) => safeDecrypt(decodeURIComponent(data)),
  }
}

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard')
}
