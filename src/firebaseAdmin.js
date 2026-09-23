import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { app } from './firebase'

export const auth = app ? getAuth(app) : null
export const storage = app ? getStorage(app) : null
