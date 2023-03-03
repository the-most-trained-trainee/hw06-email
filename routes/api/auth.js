const express = require('express');
const { validateBody, authCheck, upload } = require('../../middlewares');
const { register, login, current, logout, updateAvatar, verifyEmail, resendVerification } = require('../../controllers/auth');
const { joiRegisterSchema, joiLoginSchema, joiVerifyEmailSchema } = require('../../models/user');
const { ctrlWrapper } = require('../../helpers');


const router = express.Router();

router.post('/register', validateBody(joiRegisterSchema), register);

router.post('/login', validateBody(joiLoginSchema), login);

router.get('/logout', authCheck, logout);

router.get('/current', authCheck, current);

router.patch('/avatars', authCheck, upload.single('image'), updateAvatar);

router.get('/verify/:verificationToken', verifyEmail);

router.post('/verify', validateBody(joiVerifyEmailSchema), resendVerification);

module.exports = router;