const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
  email: {
    type: String,
    required: true,
    unique: true,
    validate: (value) => validator.isEmail(value),
    message: 'Некорректный email',
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },
},
{ versionKey: false },
);

module.exports = mongoose.model('user', userSchema);