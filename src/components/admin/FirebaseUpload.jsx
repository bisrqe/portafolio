import { useRef, useState } from 'react'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../../firebaseAdmin'

const ERRORS = {
  'storage/unauthorized': 'Permiso denegado: revisa las reglas de Storage y el claim de administrador.',
  'storage/unauthenticated': 'Sesión no válida: vuelve a iniciar sesión.',
}

// Uploads a PDF (the CV) to Firebase Storage under portfolio_pdfs/
export default function FirebaseUpload({ onUploadSuccess, label = 'Subir PDF' }) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleFile = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('El archivo debe ser un PDF.')
      setStatus('error')
      return
    }
    setStatus('uploading')
    setError('')
    try {
      if (!storage) throw new Error('Firebase Storage no está configurado.')
      const fileRef = ref(storage, `portfolio_pdfs/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(fileRef, file, { contentType: 'application/pdf' })
      const url = await getDownloadURL(snapshot.ref)
      await onUploadSuccess({ url, name: file.name })
      setStatus('idle')
    } catch (err) {
      setError(ERRORS[err.code] || err.message)
      setStatus('error')
    }
  }

  return (
    <span className="adm-upload">
      <input ref={inputRef} type="file" accept="application/pdf" onChange={handleFile} hidden />
      <button type="button" className="adm-btn adm-btn--accent" disabled={status === 'uploading'} onClick={() => inputRef.current?.click()}>
        {status === 'uploading' ? 'Subiendo…' : label}
      </button>
      {status === 'error' && <span className="adm-error">{error}</span>}
    </span>
  )
}
