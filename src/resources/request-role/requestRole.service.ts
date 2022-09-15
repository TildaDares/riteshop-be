import RequestRoleModel from "@/resources/request-role/requestRole.model";
import RequestRole from "@/resources/request-role/requestRole.interface";
import { RoleEnum } from "@/utils/enums/role.enum";
import User from "@/resources/user/user.interface";

class RequestRoleService {
  private requestRole = RequestRoleModel;

  public async create(request: RequestRole): Promise<RequestRole> {
    try {
      const hasRole = Object.values(RoleEnum).includes(request.requestedRole as RoleEnum);
      if (!hasRole) {
        throw new Error("Role not found");
      }
      const requestToCreate = await this.requestRole.findOne({ requester: request.requester, status: "pending" });
      if (requestToCreate) { // prevent creating more than one pending request 
        throw new Error("Only one request per user is allowed");
      }

      const newRequest = await this.requestRole.create(request);
      return newRequest;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async update(id: string, request: RequestRole): Promise<RequestRole> {
    try {
      const requestToUpdate = await this.requestRole.findById(id).populate("requester");
      if (!requestToUpdate) {
        throw new Error("Request not found");
      }

      if (requestToUpdate.status !== 'pending') {
        throw new Error("Request has already been approved or rejected"); // prevent changing status of request that has already been approved or rejected
      }

      if (request.status === 'approved') {
        const user = requestToUpdate.requester as User;
        user.role = requestToUpdate.requestedRole;
        await user.save();
      }
      requestToUpdate.status = request.status;
      requestToUpdate.reviewer = request.reviewer;
      const updatedRequest = await requestToUpdate.save();
      return updatedRequest;
    } catch (error) {
      throw new Error("Unable to approve request");
    }
  }

  public async getAll() {
    try {
      const requests = await this.requestRole.find().populate('requester').sort({ createdAt: -1 });
      if (!requests) {
        throw new Error("There are no requests")
      }
      console.log(requests)
      const count = await this.requestRole.countDocuments()
      return { requests, count };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getByRequester(requester: string): Promise<RequestRole[]> {
    try {
      const requests = await this.requestRole.find({ requester }).sort({ createdAt: -1 });
      return requests;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async getById(id: string): Promise<RequestRole> {
    try {
      const request = await this.requestRole.findById(id);
      if (!request) {
        throw new Error("Request not found");
      }
      return request;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default RequestRoleService;
