import { Request, Response, NextFunction } from 'express';
import { Group, groupFileMap } from '../../types';

const validGroups: Group[] = Object.keys(groupFileMap) as Group[];

export function validateGroup(req: Request, res: Response, next: NextFunction): void {
  const group = req.query.groupBy;
  if (typeof group !== 'string' || !validGroups.includes(group as Group)) {
    res.status(400).json({ error: 'Missing or invalid group parameter' });
    return;
  }
  next();
}
