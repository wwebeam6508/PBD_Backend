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
    lists: Joi.array()
      .items(Joi.string().min(4).max(500).required())
      .optional(),
    prices: Joi.array(Joi.number().required()).optional(),
    totalPrice: Joi.number().required(),
    detail: Joi.string().min(4).optional(),
    date: Joi.date().required(),
    workRef: Joi.string().optional(),
  });
  return schema.validate(httpRequest.body, options);
}

function validateUpdateExpense(httpRequest) {
  const schema = Joi.object({
    ExpenseID: Joi.string().required(),
    title: Joi.string().min(4).max(500).optional(),
    totalPrice: Joi.number().optional(),
    detail: Joi.string().min(4).optional(),
    date: Joi.date().optional(),
    workRef: Joi.string().optional(),
    addLists: Joi.array().optional(),
    addPrices: Joi.array().optional(),
    removeLists: Joi.array().optional(),
    removePrices: Joi.array().optional(),
  });
  return schema.validate(httpRequest.body, options);
}

function validateDeleteExpense(httpRequest) {
  const schema = Joi.object({
    ExpenseID: Joi.string().required(),
  });
  return schema.validate(httpRequest.query, options);
}
export { validateUpdateExpense, validateAddExpense, validateDeleteExpense };
