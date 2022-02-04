const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');

const CustomError = require('../errors');
const { attachCookiesToResponse } = require('../utils');

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const emailAlreadyExists = await User.findOne({ email });

  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already in use.');
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;

  const role = isFirstAccount ? 'admin' : 'user';

  const user = await User.create({ email, password, name, role });

  const tokenUser = { userId: user._id, name: user.name, role: user.role };

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password.');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid credentials.');
  }

  const isMatch = user.comparePassword(password);

  if (!isMatch) {
    throw new CustomError.UnauthenticatedError('Invalid credentials.');
  }

  const tokenUser = { userId: user._id, name: user.name, role: user.role };

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 5 * 1000),
  });
  res.status(StatusCodes.OK).json({ msg: 'User logged out.' });
};

module.exports = { register, login, logout };
