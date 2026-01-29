export type Block = {
  parentId?: string;
  id: string;
  content: string;
  depth: 0 | 1;
  status: 'active' | 'deleted';
};

export type BlockStatus = Block['status'];

export type BlockDepth = Block['depth'];
