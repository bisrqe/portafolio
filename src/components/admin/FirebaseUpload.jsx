import { useRef, useState } from 'react'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../../firebaseAdmin'

const ERRORS = {
  'storage/unauthorized': 'Permiso denegado: publica las reglas de FIREBASE_STORAGE_RULES.txt y vuelve a iniciar sesión.',
  'storage/unauthenticated': 'Sesión no válida: vuelve a iniciar sesión.',
}

/**
 * Uploads a file to Firebase Storage.
 *  - default: the CV (PDF only) under portfolio_pdfs/
 *  - folder="portfolio_files", accept="*": documents attached to project pages
 */
export default function FirebaseUpload({
  onUploadSuccess, label = 'Subir PDF', folder = 'portfolio_pdfs', accept = 'application/pdf', maxMb = 25,
}) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const pdfOnly = accept === 'application/pdf'

  const handleFile = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (pdfOnly && file.type !== 'application/pdf') {
      setError('El archivo debe ser un PDF.')
      setStatus('error')
      return
    }
    if (file.size > maxMb * 1024 * 1024) {
      setError(`El archivo supera ${maxMb} MB.`)
      setStatus('error')
      return
    }
    setStatus('uploading')
    setError('')
    try {
      if (!storage) throw new Error('Firebase Storage no está configurado.')
      const safeName = file.name.replace(/[^\w.-]+/g, '_')
      const fileRef = ref(storage, `${folder}/${Date.now()}_${safeName}`)
      const snapshot = await uploadBytes(fileRef, file, { contentType: file.type || 'application/octet-stream' })
      const url = await getDownloadURL(snapshot.ref)
      await onUploadSuccess({ url, name: file.name, size: file.size, type: file.type })
      setStatus('idle')
    } catch (err) {
      setError(ERRORS[err.code] || err.message)
      setStatus('error')
    }
  }

  return (
    <span className="adm-upload">
      <input ref={inputRef} type="file" accept={accept === '*' ? undefined : accept} onChange={handleFile} hidden />
      <button type="button" className="adm-btn adm-btn--accent" disabled={status === 'uploading'} onClick={() => inputRef.current?.click()}>
        {status === 'uploading' ? 'Subiendo…' : label}
      </button>
      {status === 'error' && <span className="adm-error">{error}</span>}
    </span>
  )
}
