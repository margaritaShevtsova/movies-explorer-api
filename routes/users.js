const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUser, editUser } = require('../controllers/users');

router.get('/api/users/me', getUser);
router.patch('/api/users/me', celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      name: Joi.string().min(2).max(30).required(),
    }),
  },
), editUser);

module.exports = router;
