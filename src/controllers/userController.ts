import { Response, NextFunction } from "express";
import userServices from "../services/userServices";
import accServices from "../services/accountServices";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import statsService from "../services/statsServices";
import { searchBVN, doesNameMatchBVN } from '../utils/bvn';


export const getBenefactor = async ( req: AuthenticatedRequest, res: Response, next: NextFunction) => {

  try {

    const stats = await statsService.fetchAllStat();
    console.log(stats);
    
    res.status(200).json({
      success: true,
      message: 'Benefactors fetched successfully',
      data: stats
    })
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error'
    });
  }
};


export const getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId

    try {
        
        //get user stats
        const stats = await statsService.fetchStat(userId)

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
    const userAccount = await accServices.fetchAccount(userId);

    if (!userAccount) {
      res.status(404).json({
        success: false,
        message: "User account not found",
      });
      return;
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




//KYC 
// export const kyc = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//   const { bvn } = req.body;
//   // const addressFile = req.file;
//   const userId = req.user!.userId
//   console.log(bvn);
  

//   try {
//     //fetch user 
//     const user = await userServices.fetchUserById(userId);
//     const userBvn = await searchBVN(bvn);
//     if (!userBvn || userBvn.code != 200){
//       return res.status(400).json({
//           success: false,
//           message: 'Wrong data'
//         })
//       }

//     const isLegit = doesNameMatchBVN(user!.fullName, userBvn);
//     if(!isLegit) {
//       return res.status(400).json({
//         success: false,
//         message: 'BVN data does not match user data'
//       })
//     }
//     await userServices.updateProfile(userId, {bvn: bvn})
//     res.status(200).json({
//       success: true,
//       data: userBvn
//     })
//     console.log(userBvn);
    
//   } catch (error: any) {
//     res.status(500).json({
//       error: error.message
//     })
//   }
// }