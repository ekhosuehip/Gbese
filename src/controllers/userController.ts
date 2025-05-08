import { Response, NextFunction } from "express";
import userServices from "../services/userServices";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import statsService from "../services/statsServices";


export const getBenefactor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //To fetch all users from database
    const allUsers = await userServices.fetchAllUsers();
    //TO filter out those marked as benefactor
    const benefactor = allUsers.filter(user => user.type === 'benefactor');

    res.status(200).json({
      success: true,
      message: "benefactors fetched successfully",
      data: benefactor
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


export const getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId

    try {
        
        //get user stats
        const stats = await statsService.fetchStats(userId)

        res.status(200).json({
            success: true,
            message: 'Stats fetched successfully',
            data: stats
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        })
    }
}

export const getUserAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction ) => {
  const userId = req.user!.userId;

  try {
    // Fetch user account details by ID
    const userAccount = await userServices.fetchUserById(userId);

    if (!userAccount) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User account fetched successfully",
      data: userAccount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};