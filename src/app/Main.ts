import * as THREE from 'three';
import { EnvironmentManager } from './EnvironmentManager';
import { DataLoader } from './DataProvider/DataLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Book3D } from './Model/Book3D';
import { ResultPage } from './ResultPage';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
import { NewBook } from './NewBook';
import { BookShader } from './Model/BookShader';
import { BookMeshLambert } from './Model/BookMeshLambert';
import { RawShaderMaterial } from 'three';

let envManager = new EnvironmentManager();
let scene = envManager.scene;
let renderer = envManager.renderer;
let camera = envManager.camera;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 800;
//Program;

function addLight(position: THREE.Vector3) {
  const light = new THREE.DirectionalLight(
    0xffffff, // * (0.7 + Math.random() * 0.3),
    2
  );
  light.position.add(position);
  scene.add(light);
}
const positionVal = 800;
addLight(new THREE.Vector3(positionVal, 0, 0));
addLight(new THREE.Vector3(-positionVal, 0, 0));
addLight(new THREE.Vector3(0, positionVal, 0));
addLight(new THREE.Vector3(0, -positionVal, 0));
addLight(new THREE.Vector3(0, 0, positionVal));
addLight(new THREE.Vector3(0, 0, -positionVal));
// const spotLight = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 16, 0.5);
// scene.add(spotLight);
// spotLight.position.set(0, 0, 800);

//Main Functionality
const dataLoader = new DataLoader();

const total = dataLoader.filteredList.length;

const vector = new THREE.Vector3();
const sphereShape: THREE.Object3D[] = [];
const helixShape: THREE.Object3D[] = [];
const tableShape: THREE.Object3D[] = [];
const randomShape: THREE.Object3D[] = [];

function refreshHelixShape() {
  const total = dataLoader.filteredList.length;
  const totalF = dataLoader.bookList.length;
  helixShape.length = 0;
  for (let i = 0, l = total; i < l; i++) {
    const theta = i * 0.1 + Math.PI / 2;
    const height = -i + (400 * total) / totalF;

    const object = new THREE.Object3D();

    object.position.setFromCylindricalCoords(100, theta, height);

    vector.x = object.position.x * 2;
    vector.y = object.position.y;
    vector.z = object.position.z * 2;

    object.lookAt(vector);

    helixShape.push(object);
  }
}
function refreshSphereShape() {
  const total = dataLoader.filteredList.length;
  const totalF = dataLoader.bookList.length;
  sphereShape.length = 0;
  for (let i = 0, l = total; i < l; i++) {
    const phi = Math.acos(-1 + (2 * i) / l);
    const theta = Math.sqrt(l * Math.PI) * phi;

    const object = new THREE.Object3D();
    object.position.setFromSphericalCoords(190, phi, theta);
    vector.copy(object.position).multiplyScalar(2);
    object.lookAt(vector);
    sphereShape.push(object);
  }
}
function refreshTableShape() {
  const total = dataLoader.filteredList.length;
  const totalF = dataLoader.bookList.length;
  for (let i = 0; i < total; i++) {
    let x = i % 100;
    let y = Math.floor(i / 100);
    const total = dataLoader.filteredList.length;
    const totalF = dataLoader.bookList.length;

    const object = new THREE.Object3D();
    object.position.set(x * 6 - (280 * total) / totalF, -y * 8 + 80, 0);
    object.rotation.set(0, 0, 0);
    tableShape.push(object);
  }
}
function refreshRandomShapes() {
  const total = dataLoader.filteredList.length;
  const radius = 300;
  for (let i = 0; i < total; i++) {
    const x = radius * (Math.random() * 2 - 1);
    const y = radius * (Math.random() * 2 - 1);
    const z = radius * (Math.random() * 2 - 1);

    const object = new THREE.Object3D();
    object.position.set(x, y, z);
    object.rotation.set(0, 0, 0);
    randomShape.push(object);
  }
}
refreshRandomShapes();
refreshHelixShape();
refreshSphereShape();
refreshTableShape();

let books: THREE.Mesh[] = [];
// const shaderMaterial = new BookShader().getMaterial();
const bookMaterialArray = new BookMeshLambert().getMaterial();
function loadBooks() {
  books.length = 0;
  const total = dataLoader.filteredList.length;
  const totalF = dataLoader.bookList.length;
  books = dataLoader.filteredList.map((item, idx) => {
    let x = idx % 100;
    let y = Math.floor(idx / 100);
    const book = new Book3D(item, bookMaterialArray);
    // const book = new Book3D(item, dataLoader.authorStore, bookLambertMaterial);
    const bookItem = book.bookItem as THREE.Mesh;
    bookItem.position.set(x * 6 - (280 * total) / totalF, -y * 8 + 70, 0);
    return bookItem;
  });
  books.forEach((book) => scene.add(book));
}
loadBooks();

function clearBooks() {
  books.forEach((item) => {
    scene.remove(item);
    item.geometry.dispose();
    // (item.material as THREE.MeshBasicMaterial).dispose();
  });
}
function contentReset() {
  dataLoader.resetFilteredList();
  refreshHelixShape();
  refreshSphereShape();
  refreshTableShape();
  refreshRandomShapes();
  clearBooks();
  loadBooks();
}
const raycaster = new THREE.Raycaster();

document.querySelector('canvas')?.addEventListener('click', displayBook);
function displayBook(event: THREE.Event) {
  event.preventDefault();
  let canvasBounds = renderer.context.canvas.getBoundingClientRect();
  const mouse = {
    x:
      ((event.clientX - canvasBounds.left) /
        (canvasBounds.right - canvasBounds.left)) *
        2 -
      1,
    y:
      -(
        (event.clientY - canvasBounds.top) /
        (canvasBounds.bottom - canvasBounds.top)
      ) *
        2 +
      1,
  };

  raycaster.setFromCamera(mouse, camera);
  const intersects: THREE.Intersection[] = raycaster.intersectObjects(
    scene.children
  );

  if (intersects.length > 0) {
    const item = intersects[0];
    const bookdata = dataLoader.bookStore.get(item.object.name);
    if (bookdata) {
      new ResultPage(bookdata);
    }
  }
}
function loadButtons() {
  document.getElementById('sphere')?.addEventListener('click', function () {
    transform(sphereShape, 600);
  });
  document.getElementById('helix')?.addEventListener('click', function () {
    transform(helixShape, 600);
  });
  document.getElementById('table')?.addEventListener('click', function () {
    transform(tableShape, 600);
  });
  document.getElementById('random')?.addEventListener('click', function () {
    transform(randomShape, 600);
  });
}

loadButtons();

function transform(targets: THREE.Object3D[], duration: number) {
  TWEEN.removeAll();

  for (let i = 0; i < total; i++) {
    const object = books[i];
    const target = targets[i];

    new TWEEN.Tween(object.position)
      .to(
        { x: target.position.x, y: target.position.y, z: target.position.z },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to(
        {
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
  }

  // books.forEach((book) => console.log(book.rotation));
}

document
  .getElementById('searchform')
  ?.addEventListener('submit', (event: Event) => {
    event.preventDefault();
    const value = (
      document.getElementById('input') as HTMLInputElement
    ).value.toLowerCase();

    const searchedBooks = dataLoader.bookList.filter(
      (item) => item.isbn.toLowerCase() === value
    );

    if (searchedBooks && searchedBooks.length > 0) {
      const resultPage = new ResultPage(searchedBooks[0]);
    } else {
      const filtered = dataLoader.bookList.filter(
        (item) =>
          item.title.toLowerCase().includes(value) ||
          item.publisher.toLowerCase().includes(value) ||
          item.author.toLowerCase().includes(value)
      );
      if (filtered.length > 0) {
        dataLoader.filteredList = filtered;
        refreshHelixShape();
        refreshSphereShape();
        refreshTableShape();
        clearBooks();
        loadBooks();
      }
    }
    (document.getElementById('input') as HTMLInputElement).value = '';
  });

document.getElementById('reset')?.addEventListener('click', () => {
  contentReset();
});

document.getElementById('addBook')?.addEventListener('click', () => {
  new NewBook(dataLoader.addBook.bind(dataLoader), contentReset);
});

window.addEventListener('resize', () => envManager.onWindowResize(), false);
const clock = new THREE.Clock();
function animate() {
  if (Math.random() > 0.6) {
    bookMaterialArray.forEach(
      (mat) =>
        ((mat as RawShaderMaterial).uniforms.uTime.value =
          clock.getElapsedTime())
    );
  }

  requestAnimationFrame(animate);
  TWEEN.update();
  envManager.render();
}

animate();
