const { v4: uuid } = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')

let DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Empire State Building',
    email: 'nope1@nope.com',
    password: 'nopenope',
  },
  {
    id: 'u2',
    name: 'Empire State Building',
    email: 'nope2@nope.com',
    password: 'nopenope',
  },
  {
    id: 'u3',
    name: 'Empire State Building',
    email: 'nope3@nope.com',
    password: 'nopenope',
  },
]

const getUsers = (req, res, next) => {
  const users = DUMMY_USERS
  res.status(200).json({ users: users })
}

const signUp = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid input', 422)
  }
  const { name, email, password } = req.body
  const duplicate = DUMMY_USERS.find((user) => user.email === email)
  if (duplicate) {
    throw new HttpError('Email already registered, try logging in', 422)
  }
  const newUser = {
    id: uuid(),
    name,
    email,
    password,
  }
  DUMMY_USERS.push(newUser)
  res.status(201).json({ message: 'New user added.', newUser })
}

const login = (req, res, next) => {
  const { email, password } = req.body
  const user = DUMMY_USERS.find(
    (user) => user.email === email && user.password === password
  )

  if (!user) {
    throw new HttpError('Login unsuccessful', 401)
  }
  res.status(200).json({ message: 'Login successful' })
}

exports.getUsers = getUsers
exports.signUp = signUp
exports.login = login
