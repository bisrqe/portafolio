import { useRef, useState } from 'react'
import { db, storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

function FirebaseUpload({ onUploadSuccess, buttonLabel = '📄 Upload PDF' }) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const uploadPdfToStorage = async (file) => {
    if (!storage) {
      throw new Error('Firebase Storage not initialized')
    }

    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const fileRef = ref(storage, `portfolio_pdfs/${fileName}`)

    console.log('Uploading PDF to Storage:', `portfolio_pdfs/${fileName}`)

    const uploadPromise = uploadBytes(fileRef, file)
    
    // Timeout after 30 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout')), 30000)
    )
    
    const snapshot = await Promise.race([uploadPromise, timeoutPromise])
    const downloadUrl = await getDownloadURL(snapshot.ref)
    
    return downloadUrl
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate PDF file
    if (file.type !== 'application/pdf') {
      alert('⚠️ Please upload a PDF file')
      return
    }

    setIsUploading(true)

    try {
      console.log('Starting PDF upload:', file.name, file.size, 'bytes')
      
      const downloadUrl = await uploadPdfToStorage(file)
      console.log('✅ PDF uploaded to Firebase Storage')

      onUploadSuccess({
        url: downloadUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadMethod: 'firebase-storage'
      })

      alert('✅ PDF uploaded successfully!')
      
      // Reset input
      fileInputRef.current.value = ''
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      })
      
      let userMessage = error.message
      
      if (error.code === 'storage/unauthorized') {
        userMessage = '❌ Permission denied. Firebase Storage rules may be too restrictive.'
      } else if (error.code === 'storage/unauthenticated') {
        userMessage = '❌ Authentication error. Check your Firebase configuration.'
      } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
        userMessage = '❌ Upload timeout. File may be too large or network is slow.'
      } else if (!navigator.onLine) {
        userMessage = '❌ No internet connection'
      }
      
      alert(`Upload failed: ${userMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn-upload-image"
        onClick={handleClick}
        disabled={isUploading}
        title={isUploading ? 'Uploading...' : 'Click to upload'}
      >
        {isUploading ? '⏳ Uploading...' : buttonLabel}
      </button>
    </>
  )
}

export default FirebaseUpload

