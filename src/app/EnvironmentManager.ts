import * as THREE from 'three';

export class EnvironmentManager {
  private _scene!: THREE.Scene;
  private _camera!: THREE.PerspectiveCamera;
  private _renderer!: THREE.WebGLRenderer;
  private _predefinedCanvas!: HTMLCanvasElement;
  constructor() {
    this._predefinedCanvas = document.getElementById(
      'threejsCanvas'
    ) as HTMLCanvasElement;
    this.initScene();
    this.initCamera();
    this.initRenderer();
  }

  public get scene() {
    return this._scene;
  }

  public get camera() {
    return this._camera;
  }
  public get renderer() {
    return this._renderer;
  }

  initScene() {
    this._scene = new THREE.Scene();
    // this._scene.background = new THREE.Color(0x002f9f);
  }

  initCamera() {
    this._camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this._camera.position.z = 160;
  }

  initRenderer() {
    if (this._predefinedCanvas) {
      this._renderer = new THREE.WebGLRenderer({
        canvas: this._predefinedCanvas,
        antialias: true,
      });
      this._renderer.setSize(
        this._predefinedCanvas.width,
        this._predefinedCanvas.height
      );
    } else {
      this._renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
      this._renderer.setSize(window.innerWidth, window.innerHeight);
    }
    this.onWindowResize();
  }

  onWindowResize() {
    this.adjustCanvasSize();
    this._camera.aspect =
      this._predefinedCanvas.width / this._predefinedCanvas.height;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(
      this._predefinedCanvas.width,
      this._predefinedCanvas.height
    );

    this.render();
  }

  private adjustCanvasSize() {
    this._predefinedCanvas.height = (window.innerHeight * 5) / 5;
    this._predefinedCanvas.width = (window.innerWidth * 5) / 5;
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }
}
