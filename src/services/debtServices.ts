import Debt from "../models/debtModel";
import { IDebt } from "../interfaces/debts";


class DebtService {
    // Create debt
    async createDebt (data: IDebt) {
        return await Debt.create(data)
    }
}

const debtService = new DebtService;

export default debtService