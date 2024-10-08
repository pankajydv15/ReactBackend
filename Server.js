const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');  // Import bcryptjs

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = new mongoose.model('User', userSchema);

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/ReactLearning', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Signup route with password hashing
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword  // Save the hashed password
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

        // Compare the plain text password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Password' });
        }

        res.status(200).json({ message: 'Login Successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed To Login' });
    }
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
