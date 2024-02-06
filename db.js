const mongoose = require('mongoose');

const connectDB = async (mongoDBUri) => {
    try {
        await mongoose.connect(mongoDBUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

module.exports = connectDB;
