import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface IAccessEntry {
  user: Types.ObjectId;
  email: string;
  access: 'view' | 'edit';
}

export interface IDocument {
  user: Types.ObjectId;
  name: string;
  doc: string; // Base64 representation of docx file
  visibility: 'public' | 'private';
  access: IAccessEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentDocument extends IDocument, MongooseDocument {
  _id: Types.ObjectId;
}

const accessEntrySchema = new Schema<IAccessEntry>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    access: {
      type: String,
      enum: ['view', 'edit'],
      required: true,
    },
  },
  { _id: false }
);

const documentSchema = new Schema<IDocumentDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    doc: {
      type: String,
      default: '', // Initially empty string (empty docx buffer base64 representation or empty content)
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    access: {
      type: [accessEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add index on access entries for quick queries
documentSchema.index({ 'access.user': 1 });

export const DocumentModel = model<IDocumentDocument>('Document', documentSchema);
