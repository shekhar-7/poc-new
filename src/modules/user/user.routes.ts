import { Router, Request } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createUserSchema,
  UpdateUserInput,
  updateUserSchema,
} from "./user.schema";
import { authenticateUser } from "../../middleware/auth";

const router = Router();

// Create a new user (Register)
router.post(
  "/",
//   validateRequest(createUserSchema),
  async (req, res, next) => {
    try {
      await createUser(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

// Get all users (Protected route)
router.get(
  "/",
  //   authenticateUser,
  async (req, res, next) => {
    try {
      await getAllUsers(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get user by ID (Protected route)
router.get(
  "/:id",
  //   authenticateUser,
  async (req: Request<{ id: string }>, res, next) => {
    try {
      await getUserById(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Update user (Protected route)
router.put(
  "/:id",
  //   authenticateUser,
  //   validateRequest(updateUserSchema),
  async (req: Request<{ id: string }, {}, UpdateUserInput>, res, next) => {
    try {
      await updateUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Delete user (Protected route)
router.delete(
  "/:id",
  //   authenticateUser,
  async (req: Request<{ id: string }>, res, next) => {
    try {
      await deleteUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
