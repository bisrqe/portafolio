import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const HOME_PATH = 'home/content'

const cacheKey = name => `portfolio_cache_${name.replace(/\//g, '_')}`

function readCache(name, fallback) {
  try {
    const raw = localStorage.getItem(cacheKey(name))
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeCache(name, value) {
  try { localStorage.setItem(cacheKey(name), JSON.stringify(value)) } catch { /* storage full or unavailable */ }
}

// Firestore timestamps are not JSON-serialisable; keep only plain data in the cache
function plain(data) {
  return JSON.parse(JSON.stringify(data, (key, value) => (value && typeof value.toMillis === 'function' ? value.toMillis() : value)))
}

/**
 * Live subscription to a Firestore collection, with a local cache so the page
 * still renders the last known content if Firestore is unreachable.
 */
export function useCollection(name) {
  const [items, setItems] = useState(() => readCache(name, []))
  const [loading, setLoading] = useState(Boolean(db))

  useEffect(() => {
    if (!db) return undefined
    return onSnapshot(
      collection(db, name),
      snapshot => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...plain(d.data()) }))
        setItems(list)
        writeCache(name, list)
        setLoading(false)
      },
      error => {
        console.error(`Error loading "${name}":`, error)
        setLoading(false)
      },
    )
  }, [name])

  return { items, loading }
}

/** Live subscription to a single Firestore document (e.g. "home/content"). */
export function useDocument(path) {
  const [data, setData] = useState(() => readCache(path, {}))
  const [loading, setLoading] = useState(Boolean(db))

  useEffect(() => {
    if (!db) return undefined
    return onSnapshot(
      doc(db, path),
      snapshot => {
        const value = snapshot.exists() ? plain(snapshot.data()) : {}
        setData(value)
        writeCache(path, value)
        setLoading(false)
      },
      error => {
        console.error(`Error loading "${path}":`, error)
        setLoading(false)
      },
    )
  }, [path])

  return { data, loading }
}

function requireDb() {
  if (!db) throw new Error('Firebase is not configured. Check .env.local.')
  return db
}

// Write helpers used by the admin dashboard. Security is enforced by Firestore rules.
export const firestoreApi = {
  add: (name, data) => addDoc(collection(requireDb(), name), { ...data, createdAt: serverTimestamp() }),
  update: (name, id, data) => updateDoc(doc(requireDb(), name, id), { ...data, updatedAt: serverTimestamp() }),
  remove: (name, id) => deleteDoc(doc(requireDb(), name, id)),
  // setDoc with merge creates the document if it does not exist yet
  save: (path, data) => setDoc(doc(requireDb(), path), { ...data, updatedAt: serverTimestamp() }, { merge: true }),
}
