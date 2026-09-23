import { useRef, useState } from 'react'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// Unsigned upload to Cloudinary (the preset must allow unsigned uploads)
export default function CloudinaryUpload({ onUploadSuccess, accept = 'image/*', label = 'Subir imagen' }) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | uploading | error
  const [error, setError] = useState('')
  const configured = Boolean(CLOUD_NAME && UPLOAD_PRESET)

  const handleFile = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setStatus('uploading')
    setError('')
    const body = new FormData()
    body.append('file', file)
    body.append('upload_preset', UPLOAD_PRESET)
    body.append('folder', 'portfolio')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body, signal: controller.signal })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
      onUploadSuccess({ url: data.secure_url, publicId: data.public_id })
      setStatus('idle')
    } catch (err) {
      setError(err.name === 'AbortError' ? 'Tiempo de espera agotado.' : err.message)
      setStatus('error')
    } finally {
      clearTimeout(timeout)
    }
  }

  return (
    <span className="adm-upload">
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} hidden />
      <button
        type="button"
        className="adm-btn adm-btn--accent"
        disabled={!configured || status === 'uploading'}
        title={configured ? '' : 'Configura VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en .env.local'}
        onClick={() => inputRef.current?.click()}
      >
        {status === 'uploading' ? 'Subiendo…' : label}
      </button>
      {status === 'error' && <span className="adm-error">Error al subir: {error}</span>}
    </span>
  )
}
