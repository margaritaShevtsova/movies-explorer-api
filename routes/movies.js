const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');

router.get('/api/movies', getMovies);
router.post('/api/movies', celebrate(
  {
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().pattern(/^https?:\/\/(www\.)?[-a-zA-Z0-9-._~:/?#@!$&'()*+,;=/]{1,256}#?/),
      trailerLink: Joi.string().required().pattern(/^https?:\/\/(www\.)?[-a-zA-Z0-9-._~:/?#@!$&'()*+,;=/]{1,256}#?/),
      thumbnail: Joi.string().required().pattern(/^https?:\/\/(www\.)?[-a-zA-Z0-9-._~:/?#@!$&'()*+,;=/]{1,256}#?/),
      movieId: Joi.number().required().unsafe(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  },
), createMovie);
router.delete('/api/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(24).required(),
  }),
}), deleteMovie);

module.exports = router;
