import Joi from "joi";
const options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

function validateAddCustomer(httpRequest) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(100).required(),
    address: Joi.string().optional().required(),
    taxID: Joi.string().optional().required(),
    phones: Joi.array().optional(),
    emails: Joi.array().optional(),
  });
  return schema.validate(httpRequest.body, options);
}

function validateUpdateCustomer(httpRequest) {
  const schema = Joi.object({
    customerID: Joi.string().required(),
    name: Joi.string().min(4).max(100).optional(),
    address: Joi.string().optional(),
    taxID: Joi.string().optional(),
    addPhones: Joi.array().optional(),
    addEmails: Joi.array().optional(),
    removePhones: Joi.array().optional(),
    removeEmails: Joi.array().optional(),
  });
  return schema.validate(httpRequest.body, options);
}

function validateDeleteCustomer(httpRequest) {
  const schema = Joi.object({
    customerID: Joi.string().required(),
  });
  return schema.validate(httpRequest.query, options);
}

export { validateUpdateCustomer, validateAddCustomer, validateDeleteCustomer };
