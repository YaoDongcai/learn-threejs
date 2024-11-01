<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkPLYReader from '@kitware/vtk.js/IO/Geometry/PLYReader';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkTexture from '@kitware/vtk.js/Rendering/Core/Texture';

const props = defineProps<{
  modelFile: File | null;
  textureFile: File | null;
}>();

const container = ref<HTMLDivElement | null>(null);
let renderWindow: any = null;
let currentActor: any = null;

const convertToRGBTexture = (image: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d')!;
  
  // Fill with white background first
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw the image
  ctx.drawImage(image, 0, 0);
  
  // Force RGB format by getting and putting back the image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);
  
  return canvas;
};

const loadTexture = async (file: File): Promise<vtkTexture> => {
  return new Promise((resolve) => {
    const texture = vtkTexture.newInstance();
    const image = new Image();
    
    image.onload = () => {
      // Convert the image to RGB format
      const rgbCanvas = convertToRGBTexture(image);
      
      // Configure texture settings for better quality
      texture.setInterpolate(true);      
      // Use the RGB canvas as texture input
      
      texture.setCanvas(rgbCanvas);
      console.log('----texture', texture)
      resolve(texture);
    };
    
    const reader = new FileReader();
    reader.onload = (e) => {
      image.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const loadModel = async (modelFile: File, textureFile: File | null) => {
  // Clear previous model if exists
  if (currentActor) {
    const renderer = renderWindow.getRenderer();
    renderer.removeActor(currentActor);
  }

  const reader = vtkPLYReader.newInstance();
  const content = await modelFile.arrayBuffer();
  reader.parseAsArrayBuffer(content);
  
  const mapper = vtkMapper.newInstance();
  console.log('----reader.getOutputPort()', reader.getOutputData())
  mapper.setInputConnection(reader.getOutputPort());
  mapper.setInterpolateScalarsBeforeMapping(true);

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);

  // Load and apply texture if available
  if (textureFile) {
    const texture = await loadTexture(textureFile);
    actor.addTexture(texture);
  }

  const renderer = renderWindow.getRenderer();
  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.getRenderWindow().render();

  currentActor = actor;
};

watch(() => props.modelFile, (newFile) => {
  if (newFile) {
    loadModel(newFile, props.textureFile);
  }
});

watch(() => props.textureFile, (newFile) => {
  if (newFile && props.modelFile) {
    loadModel(props.modelFile, newFile);
  }
});

onMounted(() => {
  if (container.value) {
    renderWindow = vtkFullScreenRenderWindow.newInstance({
      container: container.value,
      background: [0.2, 0.3, 0.4],
    });
  }
});
</script>

<template>
  <div ref="container" class="vtk-container"></div>
</template>

<style scoped>
.vtk-container {
  width: 100%;
  height: 100%;
}
</style>