const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// Route to delete all users
router.delete('/deleteAll', async (req, res) => {
  try {
    await User.deleteMany({});
    res.send('All users deleted successfully');
  } catch (error) {
    console.error('Error deleting all users:', error);
    res.status(500).send('Error deleting all users');
  }
});

// User routes
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send('Error fetching users');
  }
});

router.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.send('User data saved to MongoDB');
  } catch (error) {
    res.status(500).send('Error saving user data');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send('User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Error deleting user');
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role }, 
        'yourSecretKey', // Replace 'yourSecretKey' with your actual secret key
        { expiresIn: '1h' }
      );

      // Return the token and user details including deliveryAddress
      res.json({
        token,
        userDetails: {
          email: user.email,
          role: user.role,
          deliveryAddress: user.deliveryAddress // Include deliveryAddress in the response
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login error' });
  }
});


module.exports = router;