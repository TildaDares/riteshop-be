import { Types } from 'mongoose';
import User from '@/resources/user/user.interface';

interface RequestRole {
  _id: Types.ObjectId;
  status?: string;
  reviewer?: Types.ObjectId | User;
  requester: Types.ObjectId | User;
  requestedRole: string;
}

export default RequestRole;
