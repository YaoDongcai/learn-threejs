<template>
    <div>
      <div id="controls">
        <input type="file" @change="onPlyFileChange" accept=".ply" />
        <input type="file" @change="onTextureFileChange" accept=".png" />
      </div>
      <canvas ref="canvas"></canvas>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  import * as THREE from 'three';
  import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
  
  export default defineComponent({
    name: 'ThreeJsViewer',
    setup() {
      const canvas = ref<HTMLCanvasElement | null>(null);
      let scene: THREE.Scene;
      let camera: THREE.PerspectiveCamera;
      let renderer: THREE.WebGLRenderer;
      let mesh: THREE.Mesh | null = null;
  
      const initThreeJs = () => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
        renderer = new THREE.WebGLRenderer({ canvas: canvas.value! });
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.z = 100;
      };
  
      const onPlyFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const contents = e.target?.result as ArrayBuffer;
            const loader = new PLYLoader();
            const geometry = loader.parse(contents);
            console.log('-----geometry', geometry)
            loadTextureAndCreateMesh(geometry);
          };
          reader.readAsArrayBuffer(file);
        }
      };
  
      const onTextureFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(e.target?.result as string, (texture) => {
                console.log('----texture', texture)
              if (mesh) scene.remove(mesh);
              const material = new THREE.MeshBasicMaterial({ map: texture });
              mesh = new THREE.Mesh(mesh?.geometry, material);
              scene.add(mesh);
            //   animate();
            renderer.render(scene, camera);
            });
          };
          reader.readAsDataURL(file);
        }
      };
  
      const loadTextureAndCreateMesh = (geometry: THREE.BufferGeometry) => {
        if (mesh) scene.remove(mesh);
        mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
        scene.add(mesh);
      };
  
      const animate = () => {
        requestAnimationFrame(animate);
        if (mesh) {
          mesh.rotation.x += 0.01;
          mesh.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
      };
  
      onMounted(() => {
        initThreeJs();
      });
  
      return {
        onPlyFileChange,
        onTextureFileChange,
        canvas,
      };
    },
  });
  </script>
  
  <style scoped>
  #controls {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
  }
  canvas {
    display: block;
  }
  </style>