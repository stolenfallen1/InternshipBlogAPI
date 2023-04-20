// Api endpoints codes here
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const { db, storage } = require('../Config/firebaseConfig')

const app = express()
app.use(express.json())
app.use(cors())

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
app.get('/get/:postId?', async (req, res) => {
    try {
        if (req.params.postId) {
            const postId = req.params.postId;
            const postSnapshot = await db.collection('posts').doc(postId).get();

            if (!postSnapshot.exists) {
                res.status(404).send('Post not found');
            } else {
                const postData = postSnapshot.data();
                res.send({ id: postId, ...postData });
            }
        } else {
            const postsSnapshot = await db.collection('posts').get();
            const posts = postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            res.send(posts);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving posts');
    }
});

// Local server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

// Export the express api
module.exports = app;
