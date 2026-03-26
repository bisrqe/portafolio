import { useRef, useState } from 'react'
import { storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

function FirebaseUpload({ onUploadSuccess, acceptFiles = 'image/*,video/*', buttonLabel = '📸 Upload Image' }) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!storage) {
      alert('❌ Firebase Storage not configured!\n\nCheck your Firebase setup in src/firebase.js')
      return
    }

    setIsUploading(true)

    try {
      // Create a unique file name with timestamp
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const fileRef = ref(storage, `portfolio/${fileName}`)

      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(fileRef, file)
      
      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref)

      onUploadSuccess({
        url: downloadUrl,
        name: file.name,
        size: file.size,
        type: file.type
      })

      // Reset input
      fileInputRef.current.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message}`)
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
        accept={acceptFiles}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn-upload-image"
        onClick={handleClick}
        disabled={isUploading}
        title={isUploading ? 'Uploading...' : `Click to upload`}
      >
        {isUploading ? '⏳ Uploading...' : buttonLabel}
      </button>
    </>
  )
}

export default FirebaseUpload
