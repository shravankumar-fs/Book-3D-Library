import * as THREE from 'three';
import { BookShader } from './BookShader';

export class BookShaderMaterialGroup {
  private material: THREE.Material[];
  constructor() {
    const bookMatShader = new BookShader().getMaterial();
    const bookMatShader2 = new BookShader().getMaterial();
    const bookMatShader3 = new BookShader().getMaterial();
    bookMatShader.uniforms.color.value = 0;
    bookMatShader2.uniforms.color.value = 1;
    bookMatShader3.uniforms.color.value = 2;
    this.material = [
      bookMatShader2,
      bookMatShader3,
      bookMatShader2,
      bookMatShader2,
      // new THREE.MeshBasicMaterial({ color: 0xffffff }),
      // new THREE.MeshBasicMaterial({ color: 0xaf3f3f }), //side
      // new THREE.MeshBasicMaterial({ color: 0xffffff }),
      // new THREE.MeshBasicMaterial({ color: 0xffffff }),
      bookMatShader,
      bookMatShader,
      //   new THREE.MeshBasicMaterial({ color: 0x00ff00 }), //front
      //   new THREE.MeshBasicMaterial({ color: 0x00ff00 }), //back
    ];
  }

  getMaterial() {
    return this.material;
  }
}
