import { Request, Response, NextFunction } from "express";
import userServices from "../services/userServices";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getNonBeneficiatorUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //To fetch all users from database
    const allUsers = await userServices.fetchAllUsers();
    //TO filter out those marked as benefitiators
    const nonBeneficiators = allUsers.filter(user => !user.isBeneficiator);

    res.status(200).json({
      success: true,
      message: "Non-beneficiator users fetched successfully",
      data: nonBeneficiators
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
