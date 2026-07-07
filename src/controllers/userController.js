const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const DATA_PATH = path.join(__dirname, '../../data/users.json');

const readUsers = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const writeUsers = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');

const createUser = (req, res, next) => {
  console.log('[createUser] Request body:', req.body);
  const { cnic, name } = req.body;

  const users = readUsers();
  const existing = users.find((u) => u.cnic === cnic);
  if (existing) {
    console.log('[createUser] Duplicate CNIC:', cnic);
    return next(new AppError(`User with CNIC ${cnic} already exists`, 409));
  }

  const newUser = { id: `usr-${Date.now()}`, cnic, name };
  users.push(newUser);
  writeUsers(users);

  console.log('[createUser] User created:', newUser);
  res.status(200).json({ success: true, data: newUser });
};

module.exports = { createUser };
