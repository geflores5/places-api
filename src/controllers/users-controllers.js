const { validationResult } = require('express-validator')
const User = require('../models/users')
const HttpError = require('../models/http-error')

const getUsers = async (req, res, next) => {
  let users
  try {
    users = await User.find({}, '-password')
  } catch (err) {
    const error = new HttpError('Cannot get users', 500)
    return next(error)
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) })
}

const signUp = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid input', 422)
    return next(error)
  }
  const { name, email, password } = req.body

  let duplicate
  try {
    duplicate = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError('Signup failed', 500)
    return next(error)
  }

  if (duplicate) {
    const error = new HttpError('User already exists', 422)
    return next(error)
  }

  const newUser = new User({
    name,
    email,
    password,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/e/e4/Elliot_Grieveson.png',
    places: [],
  })

  try {
    await newUser.save()
  } catch (err) {
    const error = new HttpError('Singup failed', 500)
    return next(error)
  }

  res.status(201).json({
    message: 'New user added.',
    user: newUser.toObject({ getters: true }),
  })
}

const login = async (req, res, next) => {
  const { email, password } = req.body
  let user
  try {
    existingUser = await User.findOne({ email: email, password: password })
  } catch (err) {
    const error = new HttpError('Login unsuccessful', 422)
    return next(error)
  }

  if (!existingUser) {
    const error = new HttpError('Login unsuccessful', 401)
    return next(error)
  }
  res.status(200).json({
    message: 'Login successful',
    user: existingUser.toObject({ getters: true }),
  })
}

exports.getUsers = getUsers
exports.signUp = signUp
exports.login = login
