import * as THREE from 'three';
import { Book } from './Book';

export class Book3D {
  bookItem: THREE.Mesh;

  constructor(
    public book: Book,
    public authStore: Map<string, number>,
    mat: THREE.Material | THREE.Material[]
  ) {
    const material = new THREE.MeshLambertMaterial({
      color: Math.random() > 0.5 ? 0x0fdf0f : 0x0f0fdf,
      side: THREE.DoubleSide,
      reflectivity: 1,
    });
    const geo = new THREE.BoxBufferGeometry(3, 6, 0.3, 8, 8, 8);
    this.bookItem = new THREE.Mesh(geo, mat);
    this.bookItem.name = book.isbn;
  }
}
