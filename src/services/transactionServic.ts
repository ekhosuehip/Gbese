import Transaction from "../models/transactionModel";
import { ITransaction } from "../interfaces/activities";


class TransactionService {
    // create a transaction
    async createTransaction (data: ITransaction)  {
        const transaction = new Transaction(data);
        return await transaction.save();
    };

    // fetch all transactions belonging to a particular user
    async fetchTransaction(user: string) {
        return await Transaction.find({ user }).sort({ createdAt: -1 });; 
    }

    // update transaction
    async fetchUpdateTransaction (id: string, data:Partial<ITransaction>) {
        return await Transaction.findByIdAndUpdate(id, data, {new: true} )
    }
}

const transactionService = new TransactionService

export default transactionService