import Joi from 'joi';

// TypeScript interfaces for request payloads
export interface CreateProjectInput {
  projectName: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  agencyId?: number;
  userId: number;
}

export interface UpdateProjectInput {
  projectName?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  agencyId?: number;
  userId?: number;
}

// Joi validation schemas
export const createProjectSchema = Joi.object({
  projectName: Joi.string().required().messages({
    'any.required': 'Project name is required',
  }),
  description: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED').default('PENDING'),
  agencyId: Joi.number().optional(),
  userId: Joi.number().required(),
});

export const updateProjectSchema = Joi.object({
  projectName: Joi.string().optional(),
  description: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED').optional(),
  agencyId: Joi.number().optional(),
  userId: Joi.number().optional(),
});