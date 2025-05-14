import Requests from '../models/requestModel'
import { IRequest } from "../interfaces/activities";


class RequestsService {
    // create a request
    async createRequest (data: IRequest)  {
        const request = new Requests(data);
        return await request.save();
    };

    // fetch all requests belonging to a particular user
    async fetchRequests(id: string) {
        return await Requests.find({
            $or: [{ receiver: id },{ user: id }]
        }).sort({ updatedAt: -1 });
}


    // fetch a single request
    async fetchRequest(id: string) {
        return await Requests.findById(id);
    }

    // update request status
    async fetchUpdateTransaction (id: string, data:Partial<IRequest>) {
        return await Requests.findByIdAndUpdate(id, data, {new: true} )
    }
}

const requestService = new RequestsService

export default requestService