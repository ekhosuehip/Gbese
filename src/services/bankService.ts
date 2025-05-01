import Bank from "../models/bankModel";


class BanksService {
    // Fetch all banks
    async fetchAllBanks(){
        return await Bank.find({}, { _id: 0 });
    }

    // Fetch specific bank
    async fetchBank(bankName: string){
        return await Bank.findOne({name: bankName}, { _id: 0 })
    }
};

const banksServices = new BanksService;
export default banksServices;