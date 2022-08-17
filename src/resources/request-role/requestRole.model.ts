import { Schema, model } from 'mongoose';
import RequestRole from '@/resources/request-role/requestRole.interface';
import { RoleEnum } from '@/utils/enums/role.enum';

const RequestRoleSchema = new Schema(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedRole: {
      type: String,
      enum: Object.values(RoleEnum),
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    }
  },
  { timestamps: true },
);

export default model<RequestRole>('RequestRole', RequestRoleSchema);
