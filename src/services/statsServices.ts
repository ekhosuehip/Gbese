import Stats from '../models/statsModel';
import { IStats } from '../interfaces/activities';


class StatsService {
    // fetch all stats belonging to a particular user
    async fetchStat(user: string) {
        return await Stats.findOne({ user }); 
    }

    // fetch all stats belonging to a particular user
    async fetchAllStat() {
        const stats = await Stats.find({}).populate('user', 'fullName type');
        return stats.filter(stat => stat.user && (stat.user as any).type === 'benefactor');
    }


    // create stats
    async createStats (data : IStats) {
        return await Stats.create(data)
    }

    //update stats
    async updateStats (statId: string, data: Partial<IStats>) {
        return await Stats.findByIdAndUpdate(statId, data, {new: true})
    }
}

const statsService = new StatsService

export default statsService