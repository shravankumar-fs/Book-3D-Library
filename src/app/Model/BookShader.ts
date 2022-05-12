import * as THREE from 'three';
import { TextureLoader } from 'three';

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
      if(color>2.9){
        modelPosition.z+=sin(modelPosition.y+modelPosition.x+uTime)/2.0;
      }
      else{
        modelPosition.z+=sin(modelPosition.x+uTime)/2.0;
      }

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
    uniform sampler2D textureValue1;
    uniform sampler2D textureValue2;
  void main(){
      if(vColor==0.0){
       float strength1=step(0.20, max(abs(vvUv.x-0.5 ),abs(vvUv.y-0.5)));
        float strength2=1.0-step(0.25, max(abs(vvUv.x-0.5 ),abs(vvUv.y-0.5)));
        float x=vvUv.x;
        float y=vvUv.y;
        gl_FragColor=vec4(vec2(strength1*strength2),(x+y)/5.0,1.0);
      }
      if(vColor==1.0){
        gl_FragColor=vec4(vec3(vvUv.x),1.0);
      }
      if(vColor==2.0){
        float y=vvUv.y;
        gl_FragColor=vec4(0.0,0.0,y,1.0);
      }
      if(vColor==3.0){

        // gl_FragColor=vec4(0.0,vvUv.x,0.0,0.7);
        vec4 color1=texture2D(textureValue1,vvUv);
        
      gl_FragColor=vec4(color1.x,color1.y,1.0-color1.z,1.0);
    
      }
      if(vColor==4.0){
        vec4 color2=texture2D(textureValue2,vvUv);
        gl_FragColor=vec4(color2.x,color2.y,color2.z,1.0);
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
        textureValue1: {
          value: new TextureLoader().load('resources/author.png'),
        },
        textureValue2: {
          value: new TextureLoader().load('resources/publisher.png'),
        },
      });
  }

  getMaterial(): THREE.RawShaderMaterial {
    return this.mat;
  }
}
