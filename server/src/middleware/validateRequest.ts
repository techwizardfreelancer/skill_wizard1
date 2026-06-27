import { Request, Response, NextFunction } from 'express';

export function validateRunRequest(req: Request, res: Response, next: NextFunction): Response | void {
  const { language, questionId, code } = req.body;
  if (!language || !questionId || !code) {
    return res.status(400).json({ message: 'language, questionId, and code are required.' });
  }

  return next();
}
