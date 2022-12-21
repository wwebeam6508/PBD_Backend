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
    title: Joi.string().min(4).max(100).required(),
    date: Joi.date().required(),
    contractor: Joi.string().max(100).required(),
  });
  return schema.validate(httpRequest.body, options)
}

function validateUpdateWork(httpRequest) {
  const schema = Joi.object({
    workID: Joi.string().required(),
    title: Joi.string().min(4).max(100).required(),
    date: Joi.date().required(),
    contractor: Joi.string().max(100).required(),
  });
  return schema.validate(httpRequest.body, options)
}

function validateDeleteWork(httpRequest) {
  const schema = Joi.object({
    workID: Joi.string().required()
  });
  return schema.validate(httpRequest.query, options)
}
export {
  validateUpdateWork,
  validateAddWork,
  validateDeleteWork
}