import { useRef, useState } from 'react'

function CloudinaryUpload({ onUploadSuccess, acceptFiles = 'image/*,video/*', buttonLabel = '📸 Upload Image' }) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!cloudName || cloudName === 'your_cloud_name_here' || 
        !uploadPreset || uploadPreset === 'your_upload_preset_here') {
      alert('❌ Cloudinary not configured!\n\n1. Sign up at cloudinary.com\n2. Add credentials to .env.local\n3. Restart dev server')
      return
    }

    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'portfolio')
    
    // Determine the upload endpoint based on file type
    let uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    if (file.type === 'application/pdf') {
      uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
    }

    try {
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()

      onUploadSuccess({
        url: data.secure_url,
        publicId: data.public_id,
        alt: data.original_filename || file.name
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
    if (!cloudName || cloudName === 'your_cloud_name_here') {
      alert('❌ Cloudinary cloud name not configured.\n\nAdd to .env.local:\nVITE_CLOUDINARY_CLOUD_NAME=your_cloud_name')
      return
    }
    if (!uploadPreset || uploadPreset === 'your_upload_preset_here') {
      alert('❌ Cloudinary upload preset not configured.\n\nAdd to .env.local:\nVITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name')
      return
    }
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

export default CloudinaryUpload

