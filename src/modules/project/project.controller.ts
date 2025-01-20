import { NextFunction, Request, Response } from "express";
import { CreateProjectInput, UpdateProjectInput } from "./project.schema";
import { AppDataSource } from "../../database/data-source";
import { Project } from "../../entities/Project";
import { User } from "../../entities/User";
import { Agency } from "../../entities/Agency";

const projectRepository = AppDataSource.getRepository(Project);
const userRepository = AppDataSource.getRepository(User);
const agencyRepository = AppDataSource.getRepository(Agency);

// Create Project Controller
export const createProject = async (
  req: Request<{}, {}, CreateProjectInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectName, description, startDate, endDate, status, userId, agencyId } =
      req.body;

    // Check if user exists
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if agency exists (if agencyId provided)
    let agency = null;
    if (agencyId) {
      agency = await agencyRepository.findOne({ where: { id: agencyId } });
      if (!agency) {
        return res.status(404).json({ message: "Agency not found" });
      }
    }

    // Create new project
    const project = await projectRepository.save({
      projectName,
      description,
    //   startDate,
    //   endDate,
        //   status,
      agency: agency || undefined,
    });

    return res.status(201).json(project);
  } catch (error) {
    console.error("Error in createProject:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Projects Controller
export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projects = await projectRepository.find({
      relations: ["agency"],
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get Project by ID Controller
export const getProjectById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await projectRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["agency"],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error("Error in getProjectById:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update Project Controller
export const updateProject = async (
  req: Request<{ id: string }, {}, UpdateProjectInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if project exists
    const project = await projectRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // If userId is provided, check if user exists
    if (updateData.userId) {
      const user = await userRepository.findOne({
        where: { id: updateData.userId },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // If agencyId is provided, check if agency exists
    if (updateData.agencyId) {
      const agency = await agencyRepository.findOne({
        where: { id: updateData.agencyId },
      });
      if (!agency) {
        return res.status(404).json({ message: "Agency not found" });
      }
    }

    await projectRepository.update(id, updateData);

    const updatedProject = await projectRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["user", "agency"],
    });

    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error in updateProject:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Project Controller
export const deleteProject = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await projectRepository.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProject:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
