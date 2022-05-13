import * as THREE from 'three';
import { DataLoader } from '../DataProvider/DataLoader';

export class ShapeFactory {
  vector = new THREE.Vector3();
  spherePositions: THREE.Object3D[] = [];
  helixPositions: THREE.Object3D[] = [];
  tablePositions: THREE.Object3D[] = [];
  randomPositions: THREE.Object3D[] = [];

  constructor(private dataLoader: DataLoader) {}

  refreshHelixShape() {
    const total = this.dataLoader.filteredList.length;
    const totalF = this.dataLoader.bookList.length;
    this.helixPositions.splice(0, this.helixPositions.length);
    for (let i = 0, l = total; i < l; i++) {
      const theta = i * 0.1 + Math.PI / 2;
      const height = -i + (400 * total) / totalF;

      const object = new THREE.Object3D();
      object.position.setFromCylindricalCoords(100, theta, height);
      this.vector.x = object.position.x * 2;
      this.vector.y = object.position.y;
      this.vector.z = object.position.z * 2;

      object.lookAt(this.vector);
      this.helixPositions.push(object);
    }
  }
  refreshSphereShape() {
    const total = this.dataLoader.filteredList.length;
    const totalF = this.dataLoader.bookList.length;
    this.spherePositions.splice(0, this.spherePositions.length);
    for (let i = 0, l = total; i < l; i++) {
      const phi = Math.acos(-1 + (2 * i) / l);
      const theta = Math.sqrt(l * Math.PI) * phi;

      const object = new THREE.Object3D();
      object.position.setFromSphericalCoords(
        Math.max(50, (190 * total) / totalF),
        phi,
        theta
      );
      this.vector.copy(object.position).multiplyScalar(2);
      object.lookAt(this.vector);
      this.spherePositions.push(object);
    }
  }
  refreshTableShape() {
    const total = this.dataLoader.filteredList.length;
    const totalF = this.dataLoader.bookList.length;
    this.tablePositions.splice(0, this.tablePositions.length);
    for (let i = 0; i < total; i++) {
      let x = i % 40;
      let y = Math.floor(i / 40);

      const object = new THREE.Object3D();
      object.position.set(x * 10 - (280 * total) / totalF, -y * 8 + 70, 0);
      object.rotation.set(0, 0, 0);
      this.tablePositions.push(object);
    }
  }
  refreshRandomShapes() {
    const total = this.dataLoader.filteredList.length;
    this.randomPositions.splice(0, this.randomPositions.length);
    const radius = Math.max(50, 300 * total * this.dataLoader.bookList.length);
    for (let i = 0; i < total; i++) {
      const x = radius * (Math.random() * 2 - 1);
      const y = radius * (Math.random() * 2 - 1);
      const z = radius * (Math.random() * 2 - 1);

      const object = new THREE.Object3D();
      object.position.set(x, y, z);
      object.rotation.set(0, 0, 0);
      this.randomPositions.push(object);
    }
  }

  refreshAllShapes() {
    this.refreshSphereShape();
    this.refreshHelixShape();
    this.refreshRandomShapes();
    this.refreshTableShape();
  }
}
