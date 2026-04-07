/**
 * One-time script to grant admin custom claims to a Firebase user.
 *
 * SETUP:
 * 1. Go to Firebase Console → Project Settings → Service accounts
 * 2. Click "Generate new private key" → download the JSON file
 * 3. Save it as scripts/serviceAccountKey.json  (it's gitignored)
 * 4. Run:  node scripts/set-admin-claim.js your@email.com
 */

const admin = require('firebase-admin')
const path = require('path')

const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const emailArg = process.argv[2]

if (!emailArg) {
  console.error('Usage: node scripts/set-admin-claim.js <email>')
  process.exit(1)
}

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email)
    await admin.auth().setCustomUserClaims(user.uid, { admin: true })
    console.log(`✅ Admin claim set for ${email} (uid: ${user.uid})`)
    console.log('The user must sign out and sign back in for the claim to take effect.')
  } catch (err) {
    console.error('❌ Failed:', err.message)
  } finally {
    process.exit(0)
  }
}

setAdminClaim(emailArg)
