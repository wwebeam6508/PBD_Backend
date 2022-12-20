import Joi from 'joi'
const options = {
  errors: {
    wrap: {
      label: ''
    }
  }
};

function validateAddWork(httpRequest) {
  const schema = Joi.object({
    title: Joi.string().min(4).max(20).alphanum().required(),
    date: Joi.date().required()
  });
  return schema.validate(httpRequest.body, options)
}

function validateDeleteWork(httpRequest) {
  const schema = Joi.object({
    workID: Joi.string().required()
  });
  return schema.validate(httpRequest.body, options)
}
export {
  validateAddWork,
  validateDeleteWork
}