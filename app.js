const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const connectDB = require('./db');
//const { ObjectId } = require('mongoose').Types;

const app = express();
const port = 8001;

app.use(bodyParser.json());

// MongoDB connection
connectDB('mongodb://localhost:27017/file_upload_db');

// File schema
const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
    name: String,
    path: String,
});
const FileModel = mongoose.model('File', fileSchema);

// Define a route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the File Upload API');
});

// Multer configuration
const upload = multer({ dest: 'uploads/' });

// Before setting up routes
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// File upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        // Save file details to the database
        const newFile = new FileModel({
            name: req.file.originalname,
            path: req.file.path,
        });
        await newFile.save();

        res.send('File uploaded successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all files
app.get('/files', async (req, res) => {
    try {
        const files = await FileModel.find();
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Get one file
app.get('/files/:id', async (req, res) => {
    try {
        const file = await FileModel.findById(req.params.id);

        if (!file) {
            return res.status(404).send('File not found');
        }

        res.json(file);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete a file
app.delete('/files/:id', async (req, res) => {
    try {
        const file = await FileModel.findById(req.params.id);

        if (!file) {
            return res.status(404).send('File not found');
        }

        // Delete the file from the file system
        fs.unlinkSync(file.path);

        // Delete the file record from the database
        await FileModel.deleteOne({ _id: req.params.id });

        res.send('File deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
