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
import { ShapeFactory } from './Shapes/ShapeFactory';

let envManager = new EnvironmentManager();
let scene = envManager.scene;
let renderer = envManager.renderer;
let camera = envManager.camera;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 1000;

/**Lightings;*/
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

/**Main Functionality*/
const PUB_IDENTIFIER = 'mainskpub';
const AUTH_IDENTIFIER = 'mainskauth';
const linkedObjects = new Map<number, number[]>();
const dataLoader = new DataLoader();

const shapeFactory = new ShapeFactory(dataLoader);
shapeFactory.refreshAllShapes();

let books: THREE.Mesh[] = [];
const bookMaterialArray = new BookShaderMaterialGroup().getMaterial();
/**adds book geometries from the scene */
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

/**clears book geometries from the scene */
function clearBooks() {
  books.forEach((item) => {
    scene.remove(item);
    item.geometry.dispose();
  });
}

/** clears all book related positions,arrangements and loads again*/
function arrangementsReset() {
  shapeFactory.refreshAllShapes();
  clearBooks();
  loadBooks();
}
/** clears all book related filters, positions,arrangements and loads again*/
function contentReset() {
  dataLoader.resetFilteredList();
  arrangementsReset();
}
/** clears all author publisher relations,connections and loads again */
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
const camFollow = false;
document
  .querySelector('canvas')
  ?.addEventListener('click', displayRelationalData);
function displayRelationalData(event: THREE.Event) {
  event.preventDefault();
  let canvasBounds = renderer.context.canvas.getBoundingClientRect();
  /**Formula for line going to point 3D coordinates from 2D plane*/
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
    /**Browse until you find a mesh object */
    const item = intersects
      .map((i) => i.object)
      .find((i) => (i as THREE.Mesh).isMesh);

    if (item) {
      const bookdata = dataLoader.bookStore.get(item.name);
      const authData = dataLoader.authorStore.get(
        item.name.replace(AUTH_IDENTIFIER, '')
      );
      const pubdata = dataLoader.publisherStore.get(
        item.name.replace(PUB_IDENTIFIER, '')
      );

      if (bookdata) {
        new ResultPage(bookdata);
        createConnectingLines(item as THREE.Mesh);
        if (camFollow) {
          camera.position.set(
            item.position.x,
            item.position.y,
            item.position.z + 50
          );
          camera.lookAt(item.position);
        }
      } else if (authData) {
        new ResultsAuthorPub(
          item.name.replace(AUTH_IDENTIFIER, ''),
          authData,
          'Author'
        );
        createConnectingLines(item as THREE.Mesh);
        if (camFollow) {
          camera.position.set(
            item.position.x,
            item.position.y,
            item.position.z - 50
          );
          camera.lookAt(item.position);
        }
      } else if (pubdata) {
        new ResultsAuthorPub(
          item.name.replace(PUB_IDENTIFIER, ''),
          pubdata,
          'Publisher'
        );
        createConnectingLines(item as THREE.Mesh);
        if (camFollow) {
          camera.position.set(
            item.position.x,
            item.position.y,
            item.position.z - 50
          );
          camera.lookAt(item.position);
        }
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
  const mat = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const targets = linkedObjects.get(source.id);
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

function loadTransformationButtons() {
  document.getElementById('sphere')?.addEventListener('click', function () {
    transform(shapeFactory.spherePositions, 600);
  });
  document.getElementById('helix')?.addEventListener('click', function () {
    transform(shapeFactory.helixPositions, 600);
  });
  document.getElementById('table')?.addEventListener('click', function () {
    transform(shapeFactory.tablePositions, 600);
  });
  document.getElementById('random')?.addEventListener('click', function () {
    transform(shapeFactory.randomPositions, 600);
  });
}

loadTransformationButtons();

function transform(targets: THREE.Object3D[], duration: number) {
  TWEEN.removeAll();
  clearAllRelationalLineVectors();
  clearConnectingLines();
  clearAuthors();
  clearPublishers();

  const total = dataLoader.filteredList.length;
  for (let i = 0; i < total; i++) {
    const object = books[i];
    const target = targets[i];

    new TWEEN.Tween(object.position)
      .to(
        { x: target.position.x, y: target.position.y, z: target.position.z },
        duration
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
        duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
  }

  setTimeout(() => {
    loadAuthors();
    loadPublishers();
    loadAuthorPublisherConnections();
  }, duration + 300);
}

const input = document.getElementById('input') as HTMLInputElement;
input.value = '';

document.getElementById('reset')?.addEventListener('click', () => {
  contentReset();
  authorPublisherReset();
  input.value = '';
});
let showRelations = false;

/**Input search function */
document
  .getElementById('searchform')
  ?.addEventListener('submit', (event: Event) => {
    event.preventDefault();
    const value = input.value.toLowerCase();

    const searchedBooks = dataLoader.bookList.filter(
      (item) => item.isbn.toLowerCase() === value
    );
    /** If ISBN is searched by the user */
    if (searchedBooks && searchedBooks.length > 0) {
      clearConnectingLines();
      dataLoader.filteredList = searchedBooks;
      arrangementsReset();
      authorPublisherReset();
      new ResultPage(searchedBooks[0]);
    } else {
      /**If user filtered basis on book title, author or publisher */
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
  });

document.getElementById('addBook')?.addEventListener('click', () => {
  new NewBook(dataLoader.addBook.bind(dataLoader), contentReset);
});

const authorGroup: THREE.Mesh[] = [];
const authorLineGroup: THREE.Line[] = [];
const authMat = new BookShader().getMaterial();
const pubMat = new BookShader().getMaterial();
/**clear Relational lines */
function clearAllRelationalLineVectors() {
  linkedObjects.clear();
}
/**collect vertices needed for all relational lines */
function collectVerticesForConnections(
  sourceObject: THREE.Mesh,
  targetObject: THREE.Mesh
) {
  if (linkedObjects.get(sourceObject.id)) {
    linkedObjects.get(sourceObject.id)?.push(targetObject.id);
  } else {
    linkedObjects.set(sourceObject.id, [targetObject.id]);
  }
  if (linkedObjects.get(targetObject.id)) {
    linkedObjects.get(targetObject.id)?.push(sourceObject.id);
  } else {
    linkedObjects.set(targetObject.id, [sourceObject.id]);
  }
}
/** Create all relational lines */
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
/** Load Author 3D Shader objects */
function loadAuthors() {
  dataLoader.filteredList.forEach((book) => {
    /**For every book create an author object */
    const book3DObject = scene.getObjectByName(book.isbn);
    let author = scene.getObjectByName(AUTH_IDENTIFIER + book.author);
    if (!author) {
      const geo = new THREE.PlaneGeometry(6, 6, 4, 4);
      authMat.uniforms.color.value = 3.0;
      authMat.transparent = true;
      author = new THREE.Mesh(geo, authMat);
      author.name = AUTH_IDENTIFIER + book.author;
      authorGroup.push(author as THREE.Mesh);
      scene.add(author);
      /** Position author with respect to book */
      if (book3DObject) {
        author.position.set(
          book3DObject.position.x * 1.5,
          book3DObject.position.y * 1.5,
          book3DObject.position.z == 0 ? 300 : book3DObject.position.z * 1.5
        );
        author.lookAt(book3DObject.position);
      }
    }
    /** Position author with respect to book */
    if (book3DObject) {
      collectVerticesForConnections(
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
/**clear authors and author connection lines */
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
/**clear publishers and author publisher lines */
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
/**Load 3D publisher objects */
function loadPublishers() {
  /**For every book create an publisher object */
  dataLoader.filteredList.forEach((book) => {
    const book3DObject = scene.getObjectByName(book.isbn);
    let publisher = scene.getObjectByName(PUB_IDENTIFIER + book.publisher);
    if (!publisher) {
      const geo = new THREE.PlaneGeometry(6, 6, 4, 4);
      pubMat.uniforms.color.value = 4.0;
      pubMat.transparent = true;
      publisher = new THREE.Mesh(geo, pubMat);
      publisher.name = PUB_IDENTIFIER + book.publisher;
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
      collectVerticesForConnections(
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
/**Load connections from authors to publishers */
function loadAuthorPublisherConnections() {
  dataLoader.bookList.forEach((book) => {
    const author = book.author;
    const publisher = book.publisher;
    const author3D = scene.getObjectByName(AUTH_IDENTIFIER + author);
    const publisher3D = scene.getObjectByName(PUB_IDENTIFIER + publisher);

    if (author3D && publisher3D) {
      linkedObjects.get(author3D.id)?.push(publisher3D.id);
      linkedObjects.get(publisher3D.id)?.push(author3D.id);
    }
  });
}

loadAuthorPublisherConnections();

const relationsBtn = document.getElementById('relations');

if (relationsBtn) {
  relationsBtn.addEventListener('click', () => {
    if (relationsBtn.innerText.startsWith('show')) {
      relationsBtn.innerText.replace('show', 'hide');
    } else {
      relationsBtn.innerText.replace('hide', 'show');
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
