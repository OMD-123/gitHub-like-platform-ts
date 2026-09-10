import { Schema, model, Document } from 'mongoose';
import { Types } from 'mongoose';

export interface IRepository extends Document {
  name: string;
  description?: string;
  owner: Types.ObjectId; // Reference to User
  isPrivate: boolean;
  defaultBranch: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema = new Schema<IRepository>({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPrivate: { type: Boolean, default: false },
  defaultBranch: { type: String, default: 'main' },
}, { timestamps: true });

export default model<IRepository>('Repository', RepositorySchema);
