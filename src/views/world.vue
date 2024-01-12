<template>
    <div ref="container" id="container" class="container"></div>
   </template>
   <script setup lang="ts">
   import { onMounted, ref } from "vue";
   import { World } from '../libs/World'
   
   const container = ref()

   
   onMounted(() => {
     
     const dom: HTMLElement = container.value as HTMLElement

     const world = new World(dom);
     world.render();

     // const dom= document.getElementById("container");
     
   
     
    //  scene.add(cube);
    //  const renderer = new WebGLRenderer();
    //  dom.append(renderer.domElement)
    //  // document.append(renderer.domElement)
    //  renderer.setSize(dom.clientWidth, dom.clientHeight);
    //  renderer.setPixelRatio(window.devicePixelRatio)
    //  renderer.render(scene, camera)
   
   })
   </script>
   
   
   
   <style scoped>
   .container {
     width: 200px;
     height: 200px;
   }
   </style>
   