import * as THREE from 'three';
import { EnvironmentManager } from './EnvironmentManager';
import { DataLoader } from './DataProvider/DataLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Book3D } from './Model/Book3D';
import { DirectionalLight, Mesh, Object3D } from 'three';
import { ResultPage } from './ResultPage';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
import { AddPage } from './AddPage';
import { Book } from './Model/Book';
import { generateUUID } from 'three/src/math/MathUtils';

let envManager = new EnvironmentManager();
let scene = envManager.scene;
let renderer = envManager.renderer;
let camera = envManager.camera;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 500;
//Program;

const light = new DirectionalLight(0xffffff);
scene.add(light);

//Actual Functionality
const dataLoader = new DataLoader();

const total = dataLoader.filteredList.length;

const vector = new THREE.Vector3();
const sphereShape: Object3D[] = [];
const helixShape: Object3D[] = [];
const tableShape: Object3D[] = [];

function refreshHelixShape() {
  const total = dataLoader.filteredList.length;
  helixShape.length = 0;
  for (let i = 0, l = total; i < l; i++) {
    const theta = i * 0.1 + Math.PI / 2;
    const y = -i + 400;

    const object = new THREE.Object3D();

    object.position.setFromCylindricalCoords(100, theta, y);

    vector.x = object.position.x * 2;
    vector.y = object.position.y;
    vector.z = object.position.z * 2;

    object.lookAt(vector);

    helixShape.push(object);
  }
}
function refreshSphereShape() {
  const total = dataLoader.filteredList.length;
  sphereShape.length = 0;
  for (let i = 0, l = total; i < l; i++) {
    const phi = Math.acos(-1 + (2 * i) / l);
    const theta = Math.sqrt(l * Math.PI) * phi;

    const object = new THREE.Object3D();
    object.position.setFromSphericalCoords(140, phi, theta);
    vector.copy(object.position).multiplyScalar(2);
    object.lookAt(vector);
    sphereShape.push(object);
  }
}

refreshHelixShape();
refreshSphereShape();
for (let i = 0; i < total; i++) {
  let x = i % 60;
  let y = Math.floor(i / 60);

  const object = new THREE.Object3D();
  object.position.set(x * 6 - 140, -y * 8 + 80, 0);
  object.rotation.setFromVector3(new THREE.Vector3(0, 0, 0));

  vector.copy(object.position).multiplyScalar(2);
  object.lookAt(vector);
  tableShape.push(object);
}

let books: THREE.Mesh[] = [];

function loadBooks() {
  books.length = 0;
  books = dataLoader.filteredList.map((item, idx) => {
    let x = idx % 60;
    let y = Math.floor(idx / 60);

    const book = new Book3D(item, dataLoader.authorStore);
    const bookItem = book.bookItem as THREE.Mesh;
    bookItem.position.set(x * 6 - 120, -y * 8 + 70, 0);
    return bookItem;
  });
  books.forEach((book) => scene.add(book));
  console.log(
    dataLoader.filteredList.filter((item) => item.author === 'Shravan')
  );
}
loadBooks();

function clearBooks() {
  books.forEach((item) => {
    scene.remove(item);
    item.geometry.dispose();
    (item.material as THREE.MeshBasicMaterial).dispose();
  });
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
      const resultPage = new ResultPage(bookdata);
    }
  }
}
const buttonSphere = document.getElementById('sphere');
const buttonHelix = document.getElementById('helix');
const buttonTable = document.getElementById('table');
if (buttonHelix && buttonSphere && buttonTable) {
  buttonSphere.addEventListener('click', function () {
    transform(sphereShape, 600);
  });

  buttonHelix.addEventListener('click', function () {
    transform(helixShape, 600);
  });
  buttonTable.addEventListener('click', function () {
    transform(tableShape, 600);
  });
}
function transform(targets: Object3D[], duration: number) {
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

    // new TWEEN.Tween(object.rotation)
    //   .to(
    //     { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z },
    //     Math.random() * duration + duration
    //   )
    //   .easing(TWEEN.Easing.Exponential.InOut)
    //   .start();
  }

  // new TWEEN.Tween(scene)
  //   .to({}, duration * 2)
  //   .onUpdate(envManager.render)
  //   .start();
}

document
  .getElementById('searchform')
  ?.addEventListener('submit', (event: Event) => {
    event.preventDefault();
    const value = (
      document.getElementById('input') as HTMLInputElement
    ).value.toLowerCase();
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
      clearBooks();
      loadBooks();
    }
    (document.getElementById('input') as HTMLInputElement).value = '';
  });
document.getElementById('reset')?.addEventListener('click', () => {
  overallReset();
});
document.getElementById('addBook')?.addEventListener('click', () => {
  document.getElementById('formnewbook')?.remove();
  const el = document.createElement('form');
  el.innerHTML = `
  <div class="input">
      <label for="formtitle">Enter title </label>
      <input id="formtitle" placeholder="title.." required>
  </div>
  <div class="input">
      <label for="formauthor">Author of book </label>
      <input id="formauthor" placeholder="author.." required>
  </div>
  <div class="input">
      <label for="formpub">Publication </label>
      <input id="formpub" placeholder="publication.." required>
  </div>
  <div class="input">
      <label for="formimage">Image url (optional) </label>
      <input id="formimage" placeholder="image link..">
  </div>

  <div class="actions">
      <button id="formnewsubmit" type="submit">Submit</button>
      <button id="formnewcancel" class="cancel">Cancel</button>
  </div>
  
  `;
  el.id = 'formnewbook';
  el.classList.add('formnewbook');

  document.body.appendChild(el);
  const titleEl = document.getElementById('formtitle') as HTMLInputElement;
  const authorEl = document.getElementById('formauthor') as HTMLInputElement;
  const pubEl = document.getElementById('formpub') as HTMLInputElement;
  const imageEl = document.getElementById('formimage') as HTMLInputElement;

  document.getElementById('formnewsubmit')?.addEventListener('click', () => {
    if (!titleEl.value || !authorEl.value || !pubEl.value) {
    } else {
      const book = new Book();
      book.title = titleEl.value;
      book.author = authorEl.value;
      book.publisher = pubEl.value;
      book.image = imageEl.value
        ? imageEl.value
        : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg';
      book.isbn = generateUUID();
      dataLoader.addBook(book);
      overallReset();
      el.remove();
    }
  });
  document.getElementById('formnewcancel')?.addEventListener('click', () => {
    el.remove();
    overallReset();
  });
});

function overallReset() {
  dataLoader.resetFilteredList();
  refreshHelixShape();
  refreshSphereShape();
  clearBooks();
  loadBooks();
}
window.addEventListener('resize', () => envManager.onWindowResize(), false);
function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  envManager.render();
}

animate();
