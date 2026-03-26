import { useRef, useState } from 'react'
import { db, storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'

function FirebaseUpload({ onUploadSuccess, acceptFiles = 'image/*,video/*', buttonLabel = '📸 Upload Image' }) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const uploadToStorage = async (file) => {
    if (!storage) {
      throw new Error('Firebase Storage not initialized')
    }

    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const fileRef = ref(storage, `portfolio/${fileName}`)

    console.log('Uploading to Storage:', `portfolio/${fileName}`)

    const uploadPromise = uploadBytes(fileRef, file)
    
    // Timeout after 30 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout')), 30000)
    )
    
    const snapshot = await Promise.race([uploadPromise, timeoutPromise])
    const downloadUrl = await getDownloadURL(snapshot.ref)
    
    return downloadUrl
  }

  const uploadToFirestore = async (file) => {
    if (!db) {
      throw new Error('Firestore not initialized')
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1]
          
          // Store metadata in Firestore
          const docRef = await addDoc(collection(db, 'portfolio_files'), {
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date(),
            data: base64
          })

          // Return a Data URL
          resolve(e.target.result)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      console.log('Starting upload:', file.name, file.size, 'bytes')
      
      let downloadUrl
      let method = 'storage'

      // Try Firebase Storage first
      try {
        downloadUrl = await uploadToStorage(file)
        method = 'storage'
        console.log('✅ Uploaded to Firebase Storage')
      } catch (storageError) {
        console.warn('Storage upload failed, trying Firestore:', storageError.message)
        
        // Fall back to Firestore
        try {
          downloadUrl = await uploadToFirestore(file)
          method = 'firestore'
          console.log('✅ Uploaded to Firestore (base64)')
        } catch (firestoreError) {
          throw new Error(`Both upload methods failed. Storage: ${storageError.message}, Firestore: ${firestoreError.message}`)
        }
      }

      onUploadSuccess({
        url: downloadUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadMethod: method
      })

      alert(`✅ File uploaded successfully!${method === 'firestore' ? ' (via Firestore)' : ''}`)
      
      // Reset input
      fileInputRef.current.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      
      let userMessage = error.message
      if (error.code === 'storage/unauthorized') {
        userMessage = 'Storage permission denied. Check Firebase Storage rules allow uploads.'
      } else if (error.code === 'storage/unauthenticated') {
        userMessage = 'Need authentication. Ensure Firebase is properly configured.'
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

