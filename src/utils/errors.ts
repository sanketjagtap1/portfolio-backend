import { Response } from 'express';
import { Prisma } from '@prisma/client';

// Centralized error responder. Maps well-known Prisma errors to meaningful HTTP
// status codes (instead of a blanket 500) and falls back to 500 for everything else.
// The raw error is logged server-side; the client only ever sees a safe message.
export const handleError = (res: Response, error: unknown, label: string): Response => {
  console.error(`${label}:`, error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({ error: 'A record with this value already exists' });
      case 'P2025': // Record to update/delete not found
        return res.status(404).json({ error: 'Record not found' });
      case 'P2003': // Foreign key constraint failed
        return res.status(409).json({ error: 'Operation blocked by a related record' });
    }
  }

  return res.status(500).json({ error: 'Internal server error' });
};
