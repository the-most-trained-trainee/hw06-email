const { Schema, model } = require("mongoose");
const Joi = require('joi');

const gravatar = require('gravatar');
const makeAvatar = (email) => gravatar.url(email, { protocol: 'https', s: '100' });


const userSchema = Schema({
  password: {
    type: String,
    required: [true, 'Set password for user'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
    default: null
  },
  avatarURL: {
    type: String,
    default: null
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
}, { versionKey: false, timestamps: true });

const joiRegisterSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
  subscription: Joi.string(),
  avatarURL: Joi.string(),
});

const joiLoginSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
});

const joiVerifyEmailSchema = Joi.object({
  email: Joi.string().required(),
});

const User = model('user', userSchema);

module.exports = {
  User, joiRegisterSchema, joiLoginSchema, joiVerifyEmailSchema
}