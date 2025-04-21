<template>
  <div ref="containerRef" style="width: 100%; height: 100%"></div>
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

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkPolyLineWidget from "@kitware/vtk.js/Widgets/Widgets3D/PolyLineWidget";
import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import { useWidgetAndSVG } from "./useSvgWidget";

const containerRef = ref(null);

let renderer: any = null;
let renderWindow: any = null;
let widgetManager: any = null;
onMounted(() => {
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    container: containerRef.value,
  });
  renderer = fullScreenRenderer.getRenderer();
  renderWindow = fullScreenRenderer.getRenderWindow();

  const cone = vtkConeSource.newInstance();
  const mapper = vtkMapper.newInstance();
  const actor = vtkActor.newInstance();

  actor.setMapper(mapper);
  mapper.setInputConnection(cone.getOutputPort());
  actor.getProperty().setOpacity(0.5);

  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.render();

  widgetManager = vtkWidgetManager.newInstance();
  widgetManager.setRenderer(renderer);
});

const { setWidgetSVG, removeWidgetAndSVG, showOrHideWidgetAndSVG } =
  useWidgetAndSVG({ widgetManager });

const dataList = reactive<any[]>([]);
const addWidget = () => {
  const widget = vtkPolyLineWidget.newInstance();
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
