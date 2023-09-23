import Joi from "joi";
const options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

function validateEditUser(httpRequest) {
  const schema = Joi.object({
    username: Joi.string().min(4).max(20).optional(),
    userType: Joi.string().optional(),
  });
  return schema.validate(httpRequest.body, options);
}

function validateAddUser(httpRequest) {
  const schema = Joi.object({
    password: Joi.string().min(4).max(20).required(),
    username: Joi.string().min(4).max(20).required(),
    userType: Joi.string().required(),
  });
  return schema.validate(httpRequest.body, options);
}

export { validateAddUser, validateEditUser };
