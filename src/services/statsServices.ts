import Stats from '../models/statsModel';
import { IStats } from '../interfaces/activities';


class StatsService {
    // fetch all stats belonging to a particular user
    async fetchStat(statsId: string) {
        return await Stats.find({ user: statsId }); 
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