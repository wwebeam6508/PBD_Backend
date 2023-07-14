import Joi from "joi";
const options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

function validateAddWork(httpRequest) {
  const schema = Joi.object({
    title: Joi.string().min(4).max(100).required(),
    detail: Joi.string().optional().allow(""),
    date: Joi.date().required(),
    profit: Joi.number().required(),
    customer: Joi.string().required(),
    dateEnd: Joi.date().optional(),
    images: Joi.array().optional(),
    isCustomerRef: Joi.boolean().required(),
  });
  return schema.validate(httpRequest.body, options);
}

function validateUpdateWork(httpRequest) {
  const schema = Joi.object({
    workID: Joi.string().required(),
    title: Joi.string().min(4).max(100),
    detail: Joi.string().optional().allow(""),
    date: Joi.date(),
    profit: Joi.number(),
    customer: Joi.string(),
    dateEnd: Joi.date().optional(),
    imagesAdd: Joi.array().optional(),
    imagesDelete: Joi.array().optional(),
    isCustomerRef: Joi.boolean(),
  });
  return schema.validate(httpRequest.body, options);
}

function validateDeleteWork(httpRequest) {
  const schema = Joi.object({
    workID: Joi.string().required(),
  });
  return schema.validate(httpRequest.query, options);
}
export { validateUpdateWork, validateAddWork, validateDeleteWork };
