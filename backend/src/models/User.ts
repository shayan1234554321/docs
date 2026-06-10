import { Schema, model, Document, Types } from 'mongoose';

export interface IUser {
  email: string;
  password?: string; // Optional because we might exclude it in queries
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Remove sensitive info when converting to JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    const obj = ret as any;
    delete obj.password;
    delete obj.__v;
    return obj;
  },
});

export const User = model<IUserDocument>('User', userSchema);
