const Joi = require("joi");

const schema = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

const validation = (data) => {
  return schema.validate(data);
};

module.exports.validation = validation;
