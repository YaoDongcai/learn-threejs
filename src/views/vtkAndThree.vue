<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkPLYReader from '@kitware/vtk.js/IO/Geometry/PLYReader';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkTexture from '@kitware/vtk.js/Rendering/Core/Texture';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { TextureLoader } from 'three';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkPoints from '@kitware/vtk.js/Common/Core/Points';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';

const props = defineProps<{
  modelFile: File | null;
  textureFile: File | null;
}>();

const container = ref<HTMLElement | null>(null);
let renderWindow: any = null;
let currentActor: any = null;

onMounted(() => {
  if (container.value) {
    // Initialize render window
    renderWindow = vtkFullScreenRenderWindow.newInstance({
      container: container.value,
      background: [0.2, 0.3, 0.4],
    });

    // Enable interactor
    const interactor = renderWindow.getInteractor();
    interactor.setDesiredUpdateRate(15.0);
    interactor.initialize();
    interactor.bindEvents(container.value);

    // Initial render
    renderWindow.getRenderWindow().render();
  }
});
const loadTexture = async (file: File): Promise<any> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to get raw pixel data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        // Create VTK texture
        const texture = vtkTexture.newInstance();
        texture.setInterpolate(true);
        // texture.setWrapS(vtkTexture.WrapModes.REPEAT);
        // texture.setWrapT(vtkTexture.WrapModes.REPEAT);

        // Set image data
        texture.setInputData(imageData, 'RGB');

        resolve(texture);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
const loadModel = async (modelFile: File, textureFile: File | null) => {
  if (!renderWindow) return;

  // Clear previous model if exists
  if (currentActor) {
    const renderer = renderWindow.getRenderer();
    renderer.removeActor(currentActor);
  }

  const loader = new PLYLoader();
  const content = await modelFile.arrayBuffer();
  const threeGeometry = loader.parse(content);
  
  // Convert Three.js geometry to VTK.js polydata
  const polyData = vtkPolyData.newInstance();
  
  // Convert vertices
  const positions = threeGeometry.getAttribute('position').array;
  const points = vtkPoints.newInstance();
  points.setData(Float32Array.from(positions), 3);
  polyData.setPoints(points);
  
  // Convert faces
  if (threeGeometry.index) {
    const indices = threeGeometry.index.array;
    const polys = new Uint32Array(indices.length + indices.length / 3);
    let offset = 0;
    for (let i = 0; i < indices.length; i += 3) {
      polys[offset++] = 3;
      polys[offset++] = indices[i];
      polys[offset++] = indices[i + 1];
      polys[offset++] = indices[i + 2];
    }
    const cellArray = vtkCellArray.newInstance();
    cellArray.setData(polys);
    polyData.setPolys(cellArray);
  }

  // Convert normals if they exist
  const normals = threeGeometry.getAttribute('normal');
  if (normals) {
    const normalArray = vtkDataArray.newInstance({
      name: 'Normals',
      values: Float32Array.from(normals.array),
      numberOfComponents: 3
    });
    polyData.getPointData().setNormals(normalArray);
  }

  // Convert UV coordinates if they exist
  const uvs = threeGeometry.getAttribute('uv');
  if (uvs) {
    const tcoordArray = vtkDataArray.newInstance({
      name: 'TextureCoordinates',
      values: Float32Array.from(uvs.array),
      numberOfComponents: 2
    });
    polyData.getPointData().setTCoords(tcoordArray);
  }

  const mapper = vtkMapper.newInstance();
  mapper.setInputData(polyData);
  mapper.setInterpolateScalarsBeforeMapping(true);

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);

  // Set default properties
  const property = actor.getProperty();
  property.setAmbient(0.2);
  property.setDiffuse(0.7);
  property.setSpecular(0.3);

  // Load and apply texture if available
  if (textureFile) {
    const texture = await loadTexture(textureFile);
    actor.addTexture(texture);
  }

  const renderer = renderWindow.getRenderer();
  renderer.addActor(actor);

  // Reset camera and ensure it's looking at the model
  const camera = renderer.getActiveCamera();
  renderer.resetCamera();
  
  // Adjust camera position if needed
  const bounds = polyData.getBounds();
  const center = [
    (bounds[0] + bounds[1]) / 2,
    (bounds[2] + bounds[3]) / 2,
    (bounds[4] + bounds[5]) / 2
  ];
  const position = camera.getPosition();
  const distance = Math.sqrt(
    Math.pow(bounds[1] - bounds[0], 2) +
    Math.pow(bounds[3] - bounds[2], 2) +
    Math.pow(bounds[5] - bounds[4], 2)
  );
  camera.setPosition(
    center[0] + distance,
    center[1],
    center[2]
  );
  camera.setFocalPoint(center[0], center[1], center[2]);
  camera.setViewUp(0, 1, 0);

  // Final render
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