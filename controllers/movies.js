const Movie = require('../models/movie');
const ValidationError = require('../errors/validation-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-error');

const getMovies = (req, res, next) => Movie.find({ owner: req.user._id })
  .then((movies) => res.send(movies))
  .catch(next);

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;

  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((newMovie) => res.status(201).send(newMovie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Данные не валидны'));
      } else {
        next(err);
      }
    });
};

const deleteMovie = (req, res, next) => Movie.findById(req.params._id)
  .then((movie) => {
    if (!movie) {
      return next(new NotFoundError('Фильм не найден'));
    } if (!movie.owner.equals(req.user._id)) {
      return next(new ForbiddenError('Это не ваш фильм'));
    }
    return Movie.deleteOne(movie._id)
      .then(() => res.send({ movie }));
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      next(new ValidationError('Данные не валидны'));
    } else {
      next(err);
    }
  });

module.exports = {
  getMovies, createMovie, deleteMovie,
};
