require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const auth = require('./middlewares/auth');
const { login, createUser, logout } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const movieRouter = require('./routes/movies');
const userRouter = require('./routes/users');
const NotFoundError = require('./errors/not-found-err');
const { errorHandler } = require('./middlewares/errorHandler');
const limiter = require('./middlewares/rateLimiter');
const MONGO_DEV = require('./constants/constants');

const { MONGO_LINK, NODE_ENV } = process.env;

const { PORT = 3000 } = process.env;

const app = express();
app.use(cookieParser());
app.use(helmet());
app.use(limiter);

app.use(cors({ credentials: true }));

mongoose.connect(NODE_ENV === 'production' ? MONGO_LINK : MONGO_DEV, {
  useNewUrlParser: true,
});

app.use(express.json());

app.use(requestLogger);

app.post('/signin', celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  },
), login);
app.post('/api/signup', celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
      name: Joi.string().min(2).max(30).required(),
    }),
  },
), createUser);

app.use(auth);

app.get('/signout', logout);

app.use(movieRouter, userRouter);

app.use('*', (req, res, next) => next(new NotFoundError('Такой страницы не существует')));

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT);
