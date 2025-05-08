import Stats from '../models/statsModel';
import { IStats } from '../interfaces/stats';


class StatsService {
    //get user stats
    async fetchStats (id: string){
        return await Stats.findById(id)
    }
}

const statsService = new StatsService

export default statsService