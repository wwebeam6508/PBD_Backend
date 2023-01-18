import Joi from 'joi'
const options = {
  errors: {
    wrap: {
      label: ''
    }
  }
};

function validateDesTop(httpRequest) {
  const schema = Joi.object({
    desTop: Joi.string().min(10).max(200).alphanum().required(),
    background: Joi.string().required()
  });
  return schema.validate(httpRequest.body, options)
}
export {
  validateDesTop
}