<template>
  <div ref="rootContainer" style="width: 100%; height: 100%"></div>
  <div style="position: absolute; right: 20px; top: 20px">
    <button @click="addWidget">添加widget</button>
    <br />
    <ul>
      <li v-for="(item, index) in dataList" :key="item.id">
        测量{{ index }}
        <span @click="showOrHideWIdget(item)" class="list-name">o</span>
        <span @click="removeWIdget(item)" class="list-name">x</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue";

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/Rendering/Profiles/Glyph";

import "@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper";
import vtkInteractorStyleImage from "@kitware/vtk.js/Interaction/Style/InteractorStyleImage";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";
import vtkImageReslice from "@kitware/vtk.js/Imaging/Core/ImageReslice";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkHttpDataSetReader from "@kitware/vtk.js/IO/Core/HttpDataSetReader";
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkPolyLineWidget from "@kitware/vtk.js/Widgets/Widgets3D/PolyLineWidget";
import vtkLineWidget from "@kitware/vtk.js/Widgets/Widgets3D/LineWidget";
import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import { useWidgetAndSVG } from "@/widgetAndSVG/useSvgWidget";

const rootContainer = ref<HTMLDivElement | null>(null);

// let renderer: any = null;
// let renderWindow: any = null;

const widgetManager = vtkWidgetManager.newInstance();
const fullScreenRenderWindow = vtkGenericRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderWindow = fullScreenRenderWindow.getRenderWindow();
const renderer = fullScreenRenderWindow.getRenderer();
onMounted(() => {
    if (!rootContainer.value) return;
  // Create a generic render window

  fullScreenRenderWindow.setContainer(rootContainer.value);

  const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
  reader
    .setUrl("https://kitware.github.io/vtk-js/data/volume/headsq.vti", {
      loadData: true,
    })
    .then(() => {
      // Read binary data

      const data = reader.getOutputData();
      const reslice = vtkImageReslice.newInstance();
      reslice.setInputData(data);
      const dataRange = data.getPointData().getScalars().getRange();
      const extent = data.getExtent();
      // Create image mapper and image slice
      const imageMapper = vtkImageMapper.newInstance();
      imageMapper.setInputConnection(reslice.getOutputPort());
      imageMapper?.setRelativeCoincidentTopologyLineOffsetParameters(0, 66000);
      imageMapper?.setRelativeCoincidentTopologyPointOffsetParameters(0, 66000);
      imageMapper?.setRelativeCoincidentTopologyPolygonOffsetParameters(
        0,
        66000
      );
      //   imageMapper.setKSlice(30);
      imageMapper.setSliceAtFocalPoint(true);
      const imageActor = vtkImageSlice.newInstance();
      imageActor.setMapper(imageMapper);
      imageActor.getProperty().setColorLevel((dataRange[0] + dataRange[1]) / 2);
      imageActor.getProperty().setColorWindow(dataRange[1]);

      widgetManager.setRenderer(renderer);
      // Add image slice to the renderer
      renderer.addActor(imageActor);
      const bounds = imageActor.getBounds();
      const camera = renderer.getActiveCamera();
      renderer.resetCamera(bounds);
      renderer.resetCameraClippingRange();
      camera.setViewUp(0, 1, 0);
      camera.setParallelProjection(true);

      const iStyle: vtkInteractorStyleImage =
        vtkInteractorStyleImage.newInstance();
      iStyle.setInteractionMode("IMAGE_SLICING");
      renderWindow.getInteractor().setInteractorStyle(iStyle);
      const renderInteractor = renderWindow.getInteractor();
      renderInteractor.render();
      renderWindow.render();
});
})
const { setWidgetSVG, removeWidgetAndSVG, showOrHideWidgetAndSVG } =
  useWidgetAndSVG({ widgetManager });

const dataList = reactive<any[]>([]);
const addWidget = () => {
  const widget = vtkLineWidget.newInstance();
  const currentHandle = widgetManager.addWidget(widget);
  widgetManager.enablePicking();
  widgetManager.grabFocus(widget);
  const widgetId = new Date().getTime();
  dataList.push({ widgetId });

  // 添加svg
  const cleanSVG = setWidgetSVG({ widget, renderer, handle: currentHandle });
  currentHandle.set({ widgetId, cleanSVG }, true);
};

// 删除widget
const removeWIdget = (obj: any) => {
  removeWidgetAndSVG({ widgetId: obj.widgetId, widgetManager });

  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].widgetId === obj.widgetId) {
      dataList.splice(i, 1);
      break;
    }
  }
};

// 显示隐藏widget
const showOrHideWIdget = (obj: any) => {
  showOrHideWidgetAndSVG({ widgetId: obj.widgetId, widgetManager });
};
</script>
<style scoped>
ul {
  padding: 0;
  color: #fff;
  list-style: none;
}
li {
  background-color: #000;
  padding: 4px 10px;
}
.list-name {
  color: red;
  cursor: pointer;
  margin-left: 10px;
}
</style>
