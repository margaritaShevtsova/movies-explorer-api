const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const ConflictError = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = (req, res, next) => User.findById(req.user._id)
  .then((user) => {
    if (!user) {
      return next(new NotFoundError('Пользователь не найден'));
    }
    return res.send(user);
  })
  .catch((err) => {
    next(err);
  });

const editUser = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Данные не валидны'));
      } else if (err.code === 11000) {
        next(new ConflictError('Такой пользователь уже существует'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name,
    }))
    .then((newUser) => res.status(201).send({
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Данные не валидны'));
      } else if (err.code === 11000) {
        next(new ConflictError('Такой пользователь уже существует'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return next(new ValidationError('Неправильные почта или пароль'));
        }
        const token = jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        );
        return res
          .cookie('jwt', token, {
            maxAge: 3600000,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          })
          .status(200)
          .send({
            email: user.email,
            name: user.name,
            about: user.about,
            avatar: user.avatar,
          });
      });
    })
    .catch((err) => {
      next(err);
    });
};

const logout = (req, res) => {
  res.status(200)
    .clearCookie('jwt', {
      sameSite: 'none',
    })
    .send({ message: 'Вы вышли из профиля' });
};

module.exports = {
  getUser,
  editUser,
  createUser,
  login,
  logout,
};
