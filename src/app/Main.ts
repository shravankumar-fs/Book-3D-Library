import * as THREE from 'three';
import { EnvironmentManager } from './EnvironmentManager';
import { DataLoader } from './DataProvider/DataLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Book3D } from './Model/Book3D';
import { ResultPage } from './ResultPage';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
import { NewBook } from './NewBook';
import { BookShader } from './Model/BookShader';
import { BookShaderMaterialGroup } from './Model/BookShaderMaterialGroup';

import { ResultsAuthorPub } from './ResultsAuthorPub';

let envManager = new EnvironmentManager();
let scene = envManager.scene;
let renderer = envManager.renderer;
let camera = envManager.camera;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 1000;
//Program;
const lineVector = new Map<string, string[]>();
function addLight(position: THREE.Vector3) {
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.add(position);
  scene.add(light);
}
const positionVal = 1200;
addLight(new THREE.Vector3(positionVal, 0, 0));
addLight(new THREE.Vector3(-positionVal, 0, 0));
addLight(new THREE.Vector3(0, positionVal, 0));
addLight(new THREE.Vector3(0, -positionVal, 0));
addLight(new THREE.Vector3(0, 0, positionVal));
addLight(new THREE.Vector3(0, 0, -positionVal));
// const spotLight = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 16, 0.5);
// scene.add(spotLight);
// spotLight.position.set(0, 0, 1200);

//Main Functionality
const dataLoader = new DataLoader();

const vector = new THREE.Vector3();
const sphereShape: THREE.Object3D[] = [];
const helixShape: THREE.Object3D[] = [];
const tableShape: THREE.Object3D[] = [];
const randomShape: THREE.Object3D[] = [];

function refreshHelixShape() {
  const total = dataLoader.filteredList.length;
  const totalF = dataLoader.bookList.length;
  helixShape.splice(0, helixShape.length);
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
  sphereShape.splice(0, sphereShape.length);
  for (let i = 0, l = total; i < l; i++) {
    const phi = Math.acos(-1 + (2 * i) / l);
    const theta = Math.sqrt(l * Math.PI) * phi;

    const object = new THREE.Object3D();
    object.position.setFromSphericalCoords(
      Math.max(50, (190 * total) / totalF),
      phi,
      theta
    );
    vector.copy(object.position).multiplyScalar(2);
    object.lookAt(vector);
    sphereShape.push(object);
  }
}
function refreshTableShape() {
  const total = dataLoader.filteredList.length;
  const totalF = dataLoader.bookList.length;
  tableShape.splice(0, tableShape.length);
  for (let i = 0; i < total; i++) {
    let x = i % 40;
    let y = Math.floor(i / 40);

    const object = new THREE.Object3D();
    object.position.set(
      (x * 10 * total) / totalF - (280 * total) / totalF,
      -y * 8 + 80,
      0
    );
    object.rotation.set(0, 0, 0);
    tableShape.push(object);
  }
}
function refreshRandomShapes() {
  const total = dataLoader.filteredList.length;
  randomShape.splice(0, randomShape.length);
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
const bookMaterialArray = new BookShaderMaterialGroup().getMaterial();
function loadBooks() {
  books.length = 0;
  const total = dataLoader.filteredList.length;
  const totalF = dataLoader.bookList.length;
  books = dataLoader.filteredList.map((item, idx) => {
    let x = idx % 40;
    let y = Math.floor(idx / 40);
    const book = new Book3D(item, bookMaterialArray);
    const bookItem = book.bookItem as THREE.Mesh;
    bookItem.position.set(x * 10 - (280 * total) / totalF, -y * 8 + 70, 0);
    return bookItem;
  });
  books.forEach((book) => scene.add(book));
}
loadBooks();

function clearBooks() {
  books.forEach((item) => {
    scene.remove(item);
    item.geometry.dispose();
  });
}
function arrangementsReset() {
  refreshHelixShape();
  refreshSphereShape();
  refreshTableShape();
  refreshRandomShapes();
  clearBooks();
  loadBooks();
}
function contentReset() {
  dataLoader.resetFilteredList();
  arrangementsReset();
}
function authorPublisherReset() {
  clearAllRelationalLineVectors();
  clearConnectingLines();
  clearAuthors();
  clearPublishers();
  loadAuthors();
  loadPublishers();
  loadAuthorPublisherConnections();
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
    const item = intersects
      .map((i) => i.object)
      .find((i) => (i as THREE.Mesh).isMesh);

    if (item) {
      const bookdata = dataLoader.bookStore.get(item.name);
      const authData = dataLoader.authorStore.get(item.name);
      const pubdata = dataLoader.publisherStore.get(item.name);
      if (bookdata) {
        new ResultPage(bookdata);
        createConnectingLines(item as THREE.Mesh);
      } else if (authData) {
        new ResultsAuthorPub(item.name, authData, 'Author');
        createConnectingLines(item as THREE.Mesh);
      } else if (pubdata) {
        new ResultsAuthorPub(item.name, pubdata, 'Publisher');
        createConnectingLines(item as THREE.Mesh);
      }
    }
  }
}
const connectingLines: THREE.Line[] = [];

function clearConnectingLines() {
  connectingLines.forEach((line) => {
    scene.remove(line);
    line.geometry.dispose();
  });
  connectingLines.splice(0, connectingLines.length);
}

function createConnectingLines(source: THREE.Mesh) {
  clearConnectingLines();
  const sourcePos = source.position;
  const mat = new THREE.LineBasicMaterial();
  const targets = lineVector.get(source.id + '');
  targets?.forEach((target) => {
    const targetPos = scene.getObjectById(+target)?.position;
    if (targetPos) {
      const points: THREE.Vector3[] = [];
      for (let i = 0; i < 5; i++) {
        points.push(sourcePos.clone());
      }
      for (let i = 0; i < 5; i++) {
        points.push(targetPos.clone());
      }
      const diff = 0.05;
      points[1].x += diff;
      points[2].x -= diff;
      points[3].y += diff;
      points[4].y -= diff;
      points[6].x += diff;
      points[7].x -= diff;
      points[8].y += diff;
      points[9].y -= diff;
      for (let i = 0; i < 5; i++) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          points[i],
          points[i + 5],
        ]);
        const line = new THREE.Line(geometry, mat);
        scene.add(line);
        connectingLines.push(line);
      }
    }
  });
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
  clearAllRelationalLineVectors();
  clearConnectingLines();
  clearAuthors();
  clearPublishers();

  const total = dataLoader.filteredList.length;
  const time = Math.random() * duration + duration;
  for (let i = 0; i < total; i++) {
    const object = books[i];
    const target = targets[i];

    new TWEEN.Tween(object.position)
      .to(
        { x: target.position.x, y: target.position.y, z: target.position.z },
        time
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
        time
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
  }

  setTimeout(() => {
    loadAuthors();
    loadPublishers();
    loadAuthorPublisherConnections();
  }, time + 300);
}
let showRelations = false;
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
      clearConnectingLines();
      dataLoader.filteredList = searchedBooks;
      arrangementsReset();
      authorPublisherReset();
      new ResultPage(searchedBooks[0]);
    } else {
      const filtered = dataLoader.bookList.filter(
        (item) =>
          item.title.toLowerCase().includes(value) ||
          item.publisher.toLowerCase().includes(value) ||
          item.author.toLowerCase().includes(value)
      );
      if (filtered.length > 0) {
        clearConnectingLines();
        dataLoader.filteredList = filtered;
        arrangementsReset();
        authorPublisherReset();
      }
    }
    // (document.getElementById('input') as HTMLInputElement).value = '';
  });

document.getElementById('reset')?.addEventListener('click', () => {
  contentReset();
  authorPublisherReset();
});

document.getElementById('addBook')?.addEventListener('click', () => {
  new NewBook(dataLoader.addBook.bind(dataLoader), contentReset);
});

const authorGroup: THREE.Mesh[] = [];
const authorLineGroup: THREE.Line[] = [];
const authMat = new BookShader().getMaterial();
const pubMat = new BookShader().getMaterial();

function clearAllRelationalLineVectors() {
  lineVector.clear();
}
function collectVerticesForAllRelationalLines(
  sourceObject: THREE.Mesh,
  targetObject: THREE.Mesh
) {
  if (lineVector.get(sourceObject.id + '')) {
    lineVector.get(sourceObject.id + '')?.push(targetObject.id + '');
  } else {
    lineVector.set(sourceObject.id + '', [targetObject.id + '']);
  }
  if (lineVector.get(targetObject.id + '')) {
    lineVector.get(targetObject.id + '')?.push(sourceObject.id + '');
  } else {
    lineVector.set(targetObject.id + '', [sourceObject.id + '']);
  }
}

function createAllRelationalLines(
  target: THREE.Mesh,
  source: THREE.Mesh,
  lineGroup: THREE.Line[],
  opacity: number,
  color: number
) {
  const material = new THREE.LineDashedMaterial({
    color: color,
    transparent: true,
    opacity: opacity,
    dashSize: 1,
    gapSize: 10,
  });
  const points: THREE.Vector3[] = [];
  points.push(source.position.clone());
  points.push(target.position.clone());
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  lineGroup.push(line);
}

function loadAuthors() {
  dataLoader.filteredList.forEach((book) => {
    const book3DObject = scene.getObjectByName(book.isbn);
    let author = scene.getObjectByName(book.author);
    if (!author) {
      const geo = new THREE.PlaneGeometry(6, 6, 4, 4);
      authMat.uniforms.color.value = 3.0;
      authMat.transparent = true;
      author = new THREE.Mesh(geo, authMat);
      author.name = book.author;
      authorGroup.push(author as THREE.Mesh);
      scene.add(author);
      if (book3DObject) {
        author.position.set(
          book3DObject.position.x * 1.5,
          book3DObject.position.y * 1.5,
          book3DObject.position.z == 0 ? 300 : book3DObject.position.z * 1.5
        );
        author.lookAt(book3DObject.position);
      }
    }
    if (book3DObject) {
      collectVerticesForAllRelationalLines(
        author as THREE.Mesh,
        book3DObject as THREE.Mesh
      );
      if (showRelations)
        createAllRelationalLines(
          book3DObject as THREE.Mesh,
          author as THREE.Mesh,
          authorLineGroup,
          0.06,
          0x00ff00
        );
    }
  });
}

function clearAuthors() {
  authorGroup.forEach((author) => {
    scene.remove(author);
    author.geometry.dispose();
  });
  authorGroup.splice(0, authorGroup.length);

  authorLineGroup.forEach((line) => {
    scene.remove(line);
    line.geometry.dispose();
  });
  authorLineGroup.splice(0, authorLineGroup.length);
}

loadAuthors();

const publisherGroup: THREE.Mesh[] = [];
const publisherLineGroup: THREE.Line[] = [];

function clearPublishers() {
  publisherGroup.forEach((pub) => {
    scene.remove(pub);
    pub.geometry.dispose();
  });
  publisherGroup.splice(0, publisherGroup.length);

  publisherLineGroup.forEach((line) => {
    scene.remove(line);
    line.geometry.dispose();
  });
  publisherLineGroup.splice(0, publisherLineGroup.length);
}
function loadPublishers() {
  dataLoader.filteredList.forEach((book) => {
    const book3DObject = scene.getObjectByName(book.isbn);
    let publisher = scene.getObjectByName(book.publisher);
    if (!publisher) {
      const geo = new THREE.PlaneGeometry(6, 6, 4, 4);
      pubMat.uniforms.color.value = 4.0;
      pubMat.transparent = true;
      publisher = new THREE.Mesh(geo, pubMat);
      publisher.name = book.publisher;
      publisherGroup.push(publisher as THREE.Mesh);
      scene.add(publisher);
      if (book3DObject) {
        publisher.position.set(
          book3DObject.position.x * 2,
          book3DObject.position.y * 2,
          book3DObject.position.z == 0 ? 500 : book3DObject.position.z * 2
        );
        publisher.lookAt(book3DObject.position);
      }
    }
    if (book3DObject) {
      collectVerticesForAllRelationalLines(
        publisher as THREE.Mesh,
        book3DObject as THREE.Mesh
      );

      if (showRelations)
        createAllRelationalLines(
          book3DObject as THREE.Mesh,
          publisher as THREE.Mesh,
          publisherLineGroup,
          0.2,
          0xffffff
        );
    }
  });
}

loadPublishers();

function loadAuthorPublisherConnections() {
  dataLoader.bookList.forEach((book) => {
    const author = book.author;
    const publisher = book.publisher;
    const author3D = scene.getObjectByName(author);
    const publisher3D = scene.getObjectByName(publisher);

    if (author3D && publisher3D) {
      lineVector.get(author3D.id + '')?.push(publisher3D.id + '');
      lineVector.get(publisher3D.id + '')?.push(author3D.id + '');
    }
  });
}

loadAuthorPublisherConnections();
const relationsBtn = document.getElementById('relations');

if (relationsBtn) {
  relationsBtn.addEventListener('click', () => {
    if (relationsBtn.innerText.startsWith('show')) {
      relationsBtn.innerText = 'hide all relations';
    } else {
      relationsBtn.innerText = 'show all relations';
    }
    showRelations = !showRelations;
    clearAuthors();
    clearPublishers();
    loadAuthors();
    loadPublishers();
    loadAuthorPublisherConnections();
  });
}
window.addEventListener('resize', () => envManager.onWindowResize(), false);
const clock = new THREE.Clock();
function animate() {
  if (Math.random() > 0.6) {
    bookMaterialArray.forEach(
      (mat) =>
        ((mat as THREE.RawShaderMaterial).uniforms.uTime.value =
          clock.getElapsedTime())
    );
    pubMat.uniforms.uTime.value = clock.getElapsedTime();
    authMat.uniforms.uTime.value = clock.getElapsedTime();
  }

  requestAnimationFrame(animate);
  TWEEN.update();
  envManager.render();
}

animate();
