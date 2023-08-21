import Joi from "joi";
const options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

function validateAddExpense(httpRequest) {
  const schema = Joi.object({
    title: Joi.string().min(4).max(500).required(),
    lists: Joi.array().items(Joi.object().required()).optional(),
    detail: Joi.string().optional().allow(""),
    date: Joi.date().required(),
    currentVat: Joi.number().required(),
    workRef: Joi.string().optional().allow(""),
  });
  return schema.validate(httpRequest.body, options);
}

function validateUpdateExpense(httpRequest) {
  const schema = Joi.object({
    expenseID: Joi.string().required(),
    title: Joi.string().min(4).max(500).optional(),
    detail: Joi.string().optional().allow(""),
    date: Joi.date().optional(),
    workRef: Joi.string().optional().allow(""),
    addLists: Joi.array().optional(),
    removeLists: Joi.array().optional(),
    currentVat: Joi.number().optional(),
  });
  return schema.validate(httpRequest.body, options);
}

function validateDeleteExpense(httpRequest) {
  const schema = Joi.object({
    expenseID: Joi.string().required(),
  });
  return schema.validate(httpRequest.query, options);
}
export { validateUpdateExpense, validateAddExpense, validateDeleteExpense };
