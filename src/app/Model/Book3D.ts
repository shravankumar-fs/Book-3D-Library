import * as THREE from 'three';
import { Book } from './Book';

export class Book3D {
  bookItem: THREE.Mesh;

  constructor(public book: Book, mat: THREE.Material | THREE.Material[]) {
    const geo = new THREE.BoxBufferGeometry(3, 6, 0.3, 8, 8, 8);
    this.bookItem = new THREE.Mesh(geo, mat);
    this.bookItem.name = book.isbn;
  }
}
