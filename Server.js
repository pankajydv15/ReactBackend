const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load .env file

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = new mongoose.model('User', userSchema);

const app = express();

// CORS configuration
const corsOptions = {
    origin: 'https://vitereactlearning.netlify.app', // Your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions)); // Use the CORS options
app.use(express.json());

// Use the MONGO_URI from .env file
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Signup route with password hashing
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({ message: "User Registered Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to Register user" });
    }
});

// Login route with password comparison
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Password' });
        }

        res.status(200).json({ message: 'Login Successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed To Login' });
    }
});

// Use the PORT from .env file
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
