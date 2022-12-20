import Joi from 'joi'
const options = {
  errors: {
    wrap: {
      label: ''
    }
  }
};

function validateLogin(httpRequest) {
  const schema = Joi.object({
    username: Joi.string().min(4).max(20).alphanum().required(),
    password: Joi.string().min(4).max(20).alphanum().required()
  });
  return schema.validate(httpRequest.body, options)
}
export {
    validateLogin
}