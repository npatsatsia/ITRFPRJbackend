const { client } = require('../config/dbConnection')
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const registerUser = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ 'message': 'User info is required' });
  }

  try {
    await client.connect();

    const db = client.db('ITransitionPRJ');
    const usersCollection = db.collection('usersData');

    const duplicateEmail = await usersCollection.findOne({ email: email });
    const duplicateUsername = await usersCollection.findOne({ username: username });

    if (duplicateEmail || duplicateUsername) {
      return res.status(409).json({ 'message': 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      userId: uuidv4(),
      username: username,
      password: hashedPassword,
      email: email,
      roles: {
        "USER": "2001",
        "ADMIN": "5150"
      },
       active: true
    };

    const result = await usersCollection.insertOne(newUser);
    if (result.insertedCount === 0) {
        throw new Error('No user was inserted');
    }

    res.status(201).json({ 'message': `User ${username} has been created` });
  } catch (err) {
    res.status(500).json({ 'message': err.message });
  }
};

module.exports = { registerUser };
