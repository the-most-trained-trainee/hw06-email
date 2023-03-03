const path = require('path');
const fs = require('fs/promises');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const { ctrlWrapper } = require('../helpers');
const { User } = require('../models/user');
const { Conflict, Unauthorized } = require('http-errors');
const Jimp = require("jimp");


const register = async (req, res) => {
  const { email, password, subscription = "starter" } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw new Conflict('Email in use');
  }
  const avatar = gravatar.url(email, { protocol: 'https', s: '100' });

  const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  const result = await User.create({
    email, subscription, password: hashPassword, avatarURL: avatar
  });
  res.status(201).json({
    status: 'success',
    code: 201,
    data: {
      user: {
        email, subscription, avatar
      }
    }
  });
}

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Unauthorized(`${email} not found`);
  };
  const passCompare = bcrypt.compareSync(password, user.password);
  if (!passCompare) {
    throw new Unauthorized('Email or password is wrong');
  };
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
  await User.findByIdAndUpdate(user._id, { token })
  res.json({
    status: 'success',
    code: 200,
    data: {
      token,
      user: {
        email: user.email,
        subscription: user.subscription
      }
    }
  });
}

const current = async (req, res) => {
  const { name, email } = req.user;
  const user = await User.findOne({ email });
  res.json({
    status: 'success',
    code: 200,
    data: {
      user: {
        email: user.email,
        subscription: user.subscription
      }
    }
  })
}

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
}

const updateAvatar = async (req, res) => {
  const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');
  const { path: tempUpload, originalname } = req.file;
  const { _id: id } = req.user;
  const avatarName = `${id}_${originalname}`;

  try {
    const resultUpload = path.join(avatarsDir, avatarName);
    const image = await Jimp.read(`./tmp/${originalname}`);
    await image.resize(250, 250);
    await image.writeAsync(`./tmp/${originalname}`);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join('public', 'avatars', avatarName);
    await User.findByIdAndUpdate(req.user._id, { avatarURL })
    res.status(201).json(avatarURL);
  } catch (error) {
    await fs.unlink(tempUpload);
    throw error;
  }
}

module.exports = { register: ctrlWrapper(register), login: ctrlWrapper(login), current: ctrlWrapper(current), logout: ctrlWrapper(logout), updateAvatar: ctrlWrapper(updateAvatar) };