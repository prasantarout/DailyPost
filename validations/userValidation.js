const Joi = require("joi");

// Schema for user registration
const registerUserSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.valid": "Passwords must match",
    "any.required": "Confirm Password is required",
  }),
  mobileNumber: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "Mobile number must be exactly 10 digits",
      "string.pattern.base": "Mobile number must be numeric",
      "any.required": "Mobile number is required",
    }),
  address: Joi.string().min(5).required().messages({
    "string.min": "Address must be at least 5 characters long",
    "any.required": "Address is required",
  }),
});

// Schema for user login
const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Middleware to validate request body using Joi
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        errors: error.details.map((err) => err.message),
      });
    }
    next();
  };
};

module.exports = {
  registerUserSchema,
  loginUserSchema,
  validate,
};
