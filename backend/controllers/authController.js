const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup
exports.signup = async (req, res) => {
  try {
  
    const { name, email, password, role, adminKey } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });


    if (role === 'Admin') {
      const serverAdminKey = process.env.ADMIN_SECRET_CODE || 'BOSS123'; 
      if (adminKey !== serverAdminKey) {
        return res.status(401).json({ msg: "Invalid Admin Key! Admin account nahi ban sakta." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'Member' 
    });
    
    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login 
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

console.log("Input Password:", password);
console.log("Hashed Password in DB:", user.password);
console.log("Does it match?:", isMatch);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Users fetch karne mein error" });
  }
};