import { Injectable } from '@nestjs/common';

@Injectable()
export class ItemsService {
  private items = [
    { id: 1, name: 'Item 1', description: 'First item' },
    { id: 2, name: 'Item 2', description: 'Second item' },
    { id: 3, name: 'Item 3', description: 'Third item' },
  ];

  findAll() {
    return this.items;
  }

  findOne(id: number) {
    return this.items.find(item => item.id === id);
  }

  create(name: string, description: string) {
    const newItem = {
      id: this.items.length + 1,
      name,
      description,
    };
    this.items.push(newItem);
    return newItem;
  }
}
