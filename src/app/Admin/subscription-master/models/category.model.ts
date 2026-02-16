export interface ServiceCategory {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  isLeaf: boolean;
  isActive: boolean;
  displayOrder: number;
}