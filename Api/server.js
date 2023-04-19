// Api endpoints codes here
const express = require('express')
const multer = require('multer')
const { db, storage } = require('../Config/firebaseConfig')

const app = express()
app.use(express.json())

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
})

// Upload a file to Firebase Storage and return its download URL
async function uploadFile(file) {
    const fileRef = storage.file(file.originalname);
    await fileRef.save(file.buffer);
    const downloadURL = await fileRef.getSignedUrl({ action: 'read', expires: '03-09-2491' });
    return downloadURL[0];
}

// Create blog
app.post('/posts', upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;

        // Upload the image to Firebase Storage
        const downloadURL = req.file ? await uploadFile(req.file) : null;
        const postRef = await db.collection('posts').add({ title, content, image: downloadURL });

        res.send({ id: postRef.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating post');
    }
});

// Read or Fetch blog

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
