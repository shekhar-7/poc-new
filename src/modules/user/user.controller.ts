import { NextFunction, Request, Response } from "express";
import { User } from "../../entities/User";
import { CreateUserInput, UpdateUserInput } from "./user.schema";
import bcrypt from "bcrypt";
import { AppDataSource } from "../../database/data-source";
const userRepository = AppDataSource.getRepository(User);

// Create User Controller
export const createUser = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await userRepository.save({
      email,
      password: hashedPassword,
      name,
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error in createUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Users Controller
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find({
      // select: ['id', 'email', 'name']
      relations: ["agency"],
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get User by ID Controller
export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const user = await userRepository.findOne({
      where: { id: parseInt(req.params.id) },
      select: ["id", "email", "name"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update User Controller
export const updateUser = async (
  req: Request<{ id: string }, {}, UpdateUserInput>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If updating password, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const result = await userRepository.update(id, updateData);

    if (result.affected === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await userRepository.findOne({
      where: { id: parseInt(id) },
      select: ["id", "email", "name"],
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete User Controller
export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const result = await userRepository.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
