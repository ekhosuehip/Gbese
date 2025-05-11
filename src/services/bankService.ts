import Bank from "../models/bankModel";


class BanksService {
    // Fetch all banks
    async fetchAllBanks(){
        return await Bank.find({}, { _id: 0 });
    }

    // Fetch specific bank
    async fetchBank(identifier: string) {
        const isCode = /^\d+$/.test(identifier);
        const query = isCode ? { code: identifier } : { name: identifier };
        return await Bank.findOne(query, { _id: 0 });
    }

};

const banksServices = new BanksService;
export default banksServices;