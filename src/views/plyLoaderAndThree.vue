<script setup lang="ts">
import { onMounted, ref } from 'vue';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkTexture from '@kitware/vtk.js/Rendering/Core/Texture';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
// import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import {PLYLoader} from './plyloader.js'
import  vtkPLYReader from '@kitware/vtk.js/IO/Geometry/PLYReader';
const container = ref<HTMLDivElement | null>(null);
let renderWindow: any = null;
let renderer: any = null;

onMounted(() => {
  if (container.value) {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      container: container.value,
      background: [0.1, 0.1, 0.1],
    });

    renderWindow = fullScreenRenderer.getRenderWindow();
    renderer = fullScreenRenderer.getRenderer();
  }
});
function chunkArray(array: Array<number>, chunkSize: number) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}
const convertThreeGeometryToVtkPolyData = (geometry: THREE.BufferGeometry, buffer: any) => {
  const polyData = vtkPolyData.newInstance();
  
  // Convert vertices
  const positions = geometry.getAttribute('position').array;

  polyData.getPoints().setData( new Float32Array(buffer.vertices), 3);
  console.log('----geometry', geometry)
  // Convert faces (indices)
  const indices = buffer.indices;
  const polys = new Uint32Array(4 * indices.length/3);
  if (geometry.index) {
    
    // Uint32Array.from(buffer.indices)

    let offset = 0;
    for (let i = 0; i < indices.length; i += 3) {
      polys[offset++] = 3; // triangle size
      polys[offset++] = indices[i];
      polys[offset++] = indices[i + 1];
      polys[offset++] = indices[i + 2];
    }

    polyData.getPolys().setData(polys);
  }
  
  // Convert normals if available
  const normals = geometry.getAttribute('normal');
  if (normals) {
    const normalArray = vtkDataArray.newInstance({
      name: 'Normals',
      values: normals.array as Float32Array,
      numberOfComponents: 3,
    });
    polyData.getPointData().setNormals(normalArray);
  }
  
  // Convert UVs if available
  const uvs = geometry.getAttribute('uv');
  const hasVertTCoords = buffer.uvs.length > 0;
  const hasFaceTCoords = buffer.faceVertexUvs.length > 0;
  const nbVerts = buffer.vertices.length /3 
  
  const faceVertexUvs = chunkArray(buffer.faceVertexUvs, 6)
  console.log('----faceVertexUvs', faceVertexUvs)
  const nbFaces = faceVertexUvs.length;
  // 需要将faceVertexUvs 里面的数据变成为6个一组
  
  const tcoordsArray = new Float32Array(nbVerts * 2);
  if (!hasVertTCoords && hasFaceTCoords) {
    // don't use array.shift, because buffer.indices will be used later
    let idxVerts = 0;
    let idxCoord = 0;

    for (let faceIdx = 0; faceIdx < nbFaces; ++faceIdx) {
      const nbFaceVerts = polys[idxVerts++];
      const texcoords = faceVertexUvs[idxCoord++];
      if (texcoords && nbFaceVerts * 2 === texcoords.length) {
        // grab the vertex index
        for (let vertIdx = 0; vertIdx < nbFaceVerts; ++vertIdx) {
          const vert = polys[idxVerts++] ;
          // new texture stored at the current face
          tcoordsArray[vert * 2 + 0] = texcoords[vertIdx * 2 + 0];
          tcoordsArray[vert * 2 + 1] = texcoords[vertIdx * 2 + 1];
        }
      } else {
        idxVerts += nbFaceVerts;
      }
    }
  }
  if (uvs) {
    const tcoordArray = vtkDataArray.newInstance({
      name: 'TextureCoordinates',
      values: tcoordsArray as Float32Array,
      numberOfComponents: 2,
    });
    const cpd = polyData.getPointData();
    cpd.addArray(tcoordArray);
    cpd.setActiveTCoords(tcoordArray.getName());
    // cpd.setTCoords(tcoordArray);
  }
  printLog(polyData)
  return polyData;
};
const printLog = (polyData: vtkPolyData) => {
    // 打印出来利用three.js 读取的数据
  console.log('-----1',polyData.getPoints().getData())
  console.log('-----2', polyData.getPointData().getScalars())
  console.log('-----3', polyData.getPointData().getTCoords().getData())
  console.log('-----4', polyData.getPointData().getNormals())
  console.log('-----5', polyData.getPolys().getData())
}
const loadPLYFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const mapper = vtkMapper.newInstance();
    const arrayBuffer = e.target?.result as ArrayBuffer;
    
    // Use Three.js PLYLoader
    const loader = new PLYLoader();
    const buffer =  loader.getBuffer(arrayBuffer)
    console.log('----getBuffer', buffer)
    const geometry = loader.parse(arrayBuffer);
    // Convert to VTK.js polyData
    geometry.setIndex(buffer.indices)
    console.log('-----以下打印的数据为threejs里面组合的数据')
    const polyData = convertThreeGeometryToVtkPolyData(geometry, buffer);
    // Use Vtk.js
    const plyReader = vtkPLYReader.newInstance()
    plyReader.parseAsArrayBuffer(arrayBuffer);
    console.log('-----以下打印的数据为vtk 里面的 plyReader打印的')
    printLog(plyReader.getOutputData())
    // mapper.setInputConnection(plyReader.getOutputPort());
    console.log('----polyData', polyData)
    mapper.setInputData(polyData);
    
    
    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    
    renderer.addActor(actor);
    renderer.resetCamera();
    renderWindow.render();
  };
  reader.readAsArrayBuffer(file);
};

const loadTexture = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const image = new Image();
    image.onload = () => {
      const texture = vtkTexture.newInstance();
      texture.setInterpolate(true);
      texture.setImage(image);

      const actors = renderer.getActors();
      actors.forEach((actor: any) => {
        actor.getProperty().setDiffuse(0.8);
        actor.getProperty().setAmbient(0.2);
        actor.addTexture(texture);
      });

      renderWindow.render();
    };
    image.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};
</script>

<template>
  <div class="vtk-container">
    <div class="controls">
      <div class="input-group">
        <label for="plyFile">选择PLY文件：</label>
        <input type="file" id="plyFile" accept=".ply" @change="loadPLYFile" />
      </div>
      <div class="input-group">
        <label for="textureFile">选择纹理文件：</label>
        <input type="file" id="textureFile" accept=".png,.jpg,.jpeg" @change="loadTexture" />
      </div>
    </div>
    <div ref="container" class="viewer"></div>
  </div>
</template>

<style scoped>
.vtk-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 10px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.viewer {
  width: 100%;
  height: 100%;
}
</style>