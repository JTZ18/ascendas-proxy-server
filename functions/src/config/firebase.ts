import * as admin from 'firebase-admin'

const serviceAccount = require('../../service_key.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

export { admin, db }