import Joi from "joi";
const options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

function validateEditUserType(httpRequest) {
  const schema = Joi.object({
    name: Joi.string().min(1).max(30).optional(),
    permission: Joi.string().optional(),
    userTypeID: Joi.string().required(),
  });
  return schema.validate(httpRequest.body, options);
}

function validateAddUserType(httpRequest) {
  const schema = Joi.object({
    name: Joi.string().min(1).max(30).required(),
    permission: Joi.object().required(),
  });
  return schema.validate(httpRequest.body, options);
}

export { validateAddUserType, validateEditUserType };
