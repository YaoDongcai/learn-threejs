<template>
 <div ref="container" id="container" class="container"></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  Color,
  PerspectiveCamera,
  Scene,
  Mesh,
  BoxGeometry,
  WebGLRenderer,
MeshBasicMaterial
} from 'three'

const container = ref()
const scene = new Scene();
scene.background = new Color('skyblue')


onMounted(() => {
  const fov = 35;
  const dom: HTMLElement = container.value as HTMLElement
  // const dom= document.getElementById("container");
  const aspect = dom?.clientWidth / dom?.clientHeight
  const near = 0.1;
  const far = 100;

  const camera= new PerspectiveCamera(
    fov,aspect, near, far 
  )

  const geometry = new BoxGeometry(2,2,2)

  const material = new MeshBasicMaterial();
  const cube = new Mesh(geometry, material);
  scene.add(cube);
  const renderer = new WebGLRenderer();
  dom.append(renderer.domElement)
  // document.append(renderer.domElement)
  renderer.setSize(dom.clientWidth, dom.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.render(scene, camera)

})
defineProps<{ msg: string }>();

const count = ref(0);
</script>



<style scoped>
.container {
  width: 200px;
  height: 200px;
}
</style>
