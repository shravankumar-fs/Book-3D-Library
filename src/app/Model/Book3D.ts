import * as THREE from 'three';
import { Book } from './Book';

export class Book3D {
  bookItem: THREE.Mesh;

  constructor(public book: Book, public authStore: Map<string, number>) {
    const geo = new THREE.BoxBufferGeometry(3, 6, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: authStore.get(book.author), //Math.random() > 0.5 ? 0xff00ff : 0x000faf,
      side: THREE.DoubleSide,
      // map:new THREE.TextureLoader().load(book.image.replace('MZZZZZZZ','THUMBZZZ'))
    });
    this.bookItem = new THREE.Mesh(geo, mat);
    this.bookItem.name = book.isbn;
  }
}
