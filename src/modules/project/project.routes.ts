import { Router } from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "./project.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createProjectSchema, updateProjectSchema } from "./project.schema";
import { authenticateUser } from "../../middleware/auth";

const router = Router();

// Create a new project (Protected route)
router.post("/", async (req, res, next) => {
  try {
    await authenticateUser(req, res, next);
    await validateRequest(createProjectSchema)(req, res, next);
    await createProject(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Get all projects (Protected route)
router.get("/", async (req, res, next) => {
  try {
    await authenticateUser(req, res, next);
    //   await validateRequest(createProjectSchema)(req, res, next);
    await getAllProjects(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Get project by ID (Protected route)
router.get("/:id", async (req, res, next) => {
  try {
    await authenticateUser(req, res, next);
    //   await validateRequest(createProjectSchema)(req, res, next);
    await getProjectById(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Update project (Protected route)
router.put("/:id", async (req, res, next) => {
  try {
    await authenticateUser(req, res, next);
    await validateRequest(updateProjectSchema)(req, res, next);
    await updateProject(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Delete project (Protected route)
router.delete("/:id", async (req, res, next) => {
  try {
    await authenticateUser(req, res, next);
    await deleteProject(req, res, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
