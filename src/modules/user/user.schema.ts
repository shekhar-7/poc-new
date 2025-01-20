import Joi from 'joi';
// Schema for creating a new user
export const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
  }),
});

// Schema for updating a user
export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters long',
  }),
  name: Joi.string().optional(),
});

// export type CreateUserInput = Joi.extractType<typeof createUserSchema>;
// export type UpdateUserInput = Joi.extractType<typeof updateUserSchema>;

// TypeScript types for request validation
export type CreateUserInput = {
  email: string;
  password: string;
  name: string;
};

export type UpdateUserInput = {
  email?: string;
  password?: string;
  name?: string;
};