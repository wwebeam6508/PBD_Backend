import Joi from "joi";
const options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

function getTotalEarnValidator(httpRequest) {
  const schema = Joi.object({
    year: Joi.number().optional(),
  });
  return schema.validate(httpRequest.query, options);
}

function getTotalExpenseValidator(httpRequest) {
  const schema = Joi.object({
    year: Joi.number().optional(),
  });
  return schema.validate(httpRequest.query, options);
}

function getEarnAndSpendEachYearValidator(httpRequest) {
  const schema = Joi.object({
    year: Joi.number().optional(),
  });
  return schema.validate(httpRequest.query, options);
}

export {
  getTotalEarnValidator,
  getTotalExpenseValidator,
  getEarnAndSpendEachYearValidator,
};
