import Debt from "../models/debtModel";
import { IDebt } from "../interfaces/debts";
import User from "../models/userModel";


class DebtService {
    // Create debt
    async createDebt (data: Partial<IDebt>) {
    return await Debt.create(data);
    }

    // Fetch debt 
    async fetchDebt (id: string) {
        return Debt.findById(id)
    }

    //Update debt date
    async updateDebt (id: string, date: Partial<IDebt>) {
        return await Debt.findByIdAndUpdate(id, date, { new: true })
    }

    //merketplace
    async fetchListedDebt () {
        return await Debt.find({
            isListed: true,
            isCleared: false
            }).sort({ dueDate: 1 }).populate("user");
    }

}

const debtService = new DebtService;

export default debtService