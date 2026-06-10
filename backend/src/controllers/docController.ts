import { Response, NextFunction } from 'express';
import { Schema } from 'mongoose';
import { DocumentModel } from '../models/Document';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../helpers/responseHelper';
import { AuthenticatedRequest } from '../types';

// Helper to determine a user's access level for a document
const getAccessLevel = (
  doc: any,
  userId?: string,
  userEmail?: string
): 'owner' | 'edit' | 'view' | 'none' => {
  if (!userId) {
    return doc.visibility === 'public' ? 'view' : 'none';
  }

  // Owner has full access
  if (doc.user.toString() === userId) {
    return 'owner';
  }

  // Check access list by ID or email
  const accessEntry = doc.access.find(
    (entry: any) =>
      (entry.user && entry.user.toString() === userId) ||
      (entry.email && entry.email.toLowerCase() === userEmail?.toLowerCase())
  );

  if (accessEntry) {
    return accessEntry.access; // 'edit' or 'view'
  }

  // Public document defaults to view access for others
  if (doc.visibility === 'public') {
    return 'view';
  }

  return 'none';
};

export const getDocuments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User session not found', 401);
      return;
    }

    const userId = req.user.id;
    const email = req.user.email;

    // Retrieve documents where user is creator OR user is in the access list (by user ID or email)
    const docs = await DocumentModel.find({
      $or: [
        { user: userId },
        { 'access.user': userId },
        { 'access.email': email.toLowerCase() },
      ],
    }).sort({ updatedAt: -1 });

    sendSuccess(res, docs, 200);
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User session not found', 401);
      return;
    }

    const { name, visibility, access, doc } = req.body;

    const accessList = [];
    if (access && Array.isArray(access)) {
      for (const entry of access) {
        const entryEmail = entry.email.toLowerCase();
        // Lookup user to resolve ID if they already exist
        const targetUser = await User.findOne({ email: entryEmail });
        accessList.push({
          user: targetUser ? targetUser._id : undefined,
          email: entryEmail,
          access: entry.access,
        });
      }
    }

    const document = new DocumentModel({
      user: req.user.id,
      name,
      visibility: visibility || 'private',
      access: accessList,
      doc: doc || '', // Use provided doc or empty
    });
    await document.save();
    sendSuccess(res, document, 201, 'Document created successfully');
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await DocumentModel.findById(id);

    if (!document) {
      sendError(res, 'Document not found', 404);
      return;
    }

    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const accessLevel = getAccessLevel(document, userId, userEmail);

    if (accessLevel === 'none') {
      sendError(res, 'Permission denied', 403);
      return;
    }

    sendSuccess(res, {
      document,
      currentUserAccess: accessLevel,
    }, 200);
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { doc, name, visibility } = req.body;

    if (!req.user) {
      sendError(res, 'User session not found', 401);
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      sendError(res, 'Document not found', 404);
      return;
    }

    const accessLevel = getAccessLevel(document, req.user.id, req.user.email);
    if (accessLevel !== 'owner' && accessLevel !== 'edit') {
      sendError(res, 'You do not have permission to edit this document', 403);
      return;
    }

    if (doc !== undefined) document.doc = doc;
    if (name !== undefined) document.name = name;
    if (visibility !== undefined) document.visibility = visibility;

    await document.save();
    sendSuccess(res, document, 200, 'Document updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      sendError(res, 'User session not found', 401);
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      sendError(res, 'Document not found', 404);
      return;
    }

    if (document.user.toString() !== req.user.id) {
      sendError(res, 'Only the document owner can delete this document', 403);
      return;
    }

    await DocumentModel.findByIdAndDelete(id);
    sendSuccess(res, null, 200, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const updateAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, access } = req.body; // access can be: 'view' | 'edit' | 'remove'

    if (!req.user) {
      sendError(res, 'User session not found', 401);
      return;
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      sendError(res, 'Document not found', 404);
      return;
    }

    // Only owner can manage access
    if (document.user.toString() !== req.user.id) {
      sendError(res, 'Only the document owner can manage sharing permissions', 403);
      return;
    }

    const targetEmail = email.toLowerCase();

    // Prevent changing owner's access
    const ownerUser = await User.findById(document.user);
    if (ownerUser && ownerUser.email.toLowerCase() === targetEmail) {
      sendError(res, 'Cannot modify access for the document owner', 400);
      return;
    }

    if (access === 'remove') {
      document.access = document.access.filter(
        (entry) => entry.email.toLowerCase() !== targetEmail
      );
    } else {
      // Find if email already in access list
      const existingEntryIndex = document.access.findIndex(
        (entry) => entry.email.toLowerCase() === targetEmail
      );

      if (existingEntryIndex > -1) {
        document.access[existingEntryIndex].access = access;
      } else {
        // Resolve user ID if possible
        const targetUser = await User.findOne({ email: targetEmail });
        document.access.push({
          user: targetUser ? targetUser._id : (undefined as any),
          email: targetEmail,
          access,
        });
      }
    }

    await document.save();
    sendSuccess(res, document, 200, 'Access permission updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getShareDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await DocumentModel.findById(id);

    if (!document) {
      sendError(res, 'Document not found', 404);
      return;
    }

    // Determine access for current request (even if unauthenticated)
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const accessLevel = getAccessLevel(document, userId, userEmail);

    if (accessLevel === 'none') {
      sendError(res, 'Permission denied', 403);
      return;
    }

    sendSuccess(res, {
      name: document.name,
      doc: document.doc,
      visibility: document.visibility,
      access: document.access,
      user: document.user,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      currentUserAccess: accessLevel,
    }, 200);
  } catch (error) {
    next(error);
  }
};
