import CryptoJS from 'crypto-js'
import { toast } from 'react-hot-toast'

export const cn = (...inputs: Array<string | false | null | undefined>) => inputs.filter(Boolean).join(' ')

export const cryptic = () => {
  return {
    encrypt: (data: string) => CryptoJS.AES.encrypt(data, import.meta.env.VITE_SECRET_KEY).toString(),
    decrypt: (data: string) => CryptoJS.AES.decrypt(data, import.meta.env.VITE_SECRET_KEY).toString(CryptoJS.enc.Utf8),
    urlSafeEncrypt: (data: string) =>
      encodeURIComponent(CryptoJS.AES.encrypt(data, import.meta.env.VITE_SECRET_KEY).toString()),
    urlSafeDecrypt: (data: string) =>
      decodeURIComponent(CryptoJS.AES.decrypt(data, import.meta.env.VITE_SECRET_KEY).toString(CryptoJS.enc.Utf8)),
  }
}

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard')
}
