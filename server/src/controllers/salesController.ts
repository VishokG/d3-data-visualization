import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { Group, groupFileMap } from '../types';

export const getSales = (req: Request, res: Response) => {
  const group = req.query.groupBy as Group;
  const { file, key } = groupFileMap[group];
  const filePath = path.join(__dirname, '../data', file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return res.status(500).json({ error: 'Data file not found or invalid' });
  }
  // Rename the grouping key to 'category' in each record
  const sales = data.map((item: any) => {
    const { [key]: category, ...rest } = item;
    return { ...rest, category };
  });
  return res.json({ group, sales });
};