export class Category {
  id: string;
  name: string;
  description?: string;

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }
}
