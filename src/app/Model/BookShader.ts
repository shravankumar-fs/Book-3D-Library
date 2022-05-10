import * as THREE from 'three';

export class BookShader {
  vertexShader = `
  uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vvUv; 
    uniform float uTime;
    uniform float color;
    varying float vColor;
    void main(){
      vec4 modelPosition=modelMatrix * vec4(position,1.0);
      modelPosition.z+=sin(modelPosition.x+uTime)/2.0;
      vec4 viewPosition= viewMatrix * modelPosition;
      gl_Position=projectionMatrix *  viewPosition;
      
      vvUv=uv;
      vColor=color;
  }
  `;

  fragShader = `
  precision mediump float;
    varying vec2 vvUv; 
    varying float vColor;
  void main(){
      if(vColor==0.0){
       float strength1=step(0.20, max(abs(vvUv.x-0.5 ),abs(vvUv.y-0.5)));
        float strength2=1.0-step(0.25, max(abs(vvUv.x-0.5 ),abs(vvUv.y-0.5)));
        float x=vvUv.x;
        float y=vvUv.y;
        gl_FragColor=vec4(vec2(strength1*strength2),(x+y)/3.0,1.0);
      }
      if(vColor==1.0){
        gl_FragColor=vec4(vec3(vvUv.x),1.0);
      }
      if(vColor==2.0){
        gl_FragColor=vec4(0.3,0.0,8.0,1.0);
      }

  }
  `;

  mat: THREE.RawShaderMaterial = new THREE.RawShaderMaterial();

  constructor() {
    this.mat.side = THREE.DoubleSide;
    this.mat.vertexShader = this.vertexShader;
    (this.mat.fragmentShader = this.fragShader),
      (this.mat.uniforms = {
        uTime: { value: 0.0 },
        color: { value: 0xffffff },
      });
  }

  getMaterial(): THREE.RawShaderMaterial {
    return this.mat;
  }
}
