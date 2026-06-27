import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): Response {
  console.error(err);
  return res.status(500).json({ message: 'Internal server error', error: err.message });
}
