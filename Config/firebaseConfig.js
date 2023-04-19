// Firebase config here
const admin = require('firebase-admin')
const serviceAccount = require('./key/internshipblog-16e54-firebase-adminsdk-ffcod-27e8c9207c.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://firestore.googleapis.com/v1/projects/internshipblog-16e54/databases/(default)',
    storageBucket: 'internshipblog-16e54.appspot.com'
})

const db = admin.firestore()
const storage = admin.storage().bucket()
module.exports = { db, storage }
