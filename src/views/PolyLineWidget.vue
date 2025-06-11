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
import vtkPolyLineWidget from "@/vtk/Polyline2DWidget";
import vtkLineWidget from "@kitware/vtk.js/Widgets/Widgets3D/LineWidget";
import vtkDistanceWidget from "@/vtk/Distance3DWidget/index";
import vtkAngle2DWidget from "@/vtk/Angle2DWidget";
import vtkArea2DWidget from "@/vtk/Area2DWidget";
import vtkCurveWidget from "@/vtk/CurveWidget"
import vtkBidirectionalWidget from "@/vtk/BidirectionalWidget";
import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import { useWidgetAndSVG } from "@/widgetAndSVG/useSvgWidget";

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
  // const widget = vtkPolyLineWidget.newInstance();
  // const widget = vtkLineWidget.newInstance();
  // const widget = vtkDistanceWidget.newInstance();
  // const widget = vtkAngle2DWidget.newInstance();
  // const widget = vtkArea2DWidget.newInstance();
  // const widget = vtkCurveWidget.newInstance();
  const widget = vtkBidirectionalWidget.newInstance();
  widget.setHandleVisibility(true)
  console.log("widget", widget);
  const currentHandle = widgetManager.addWidget(widget);
  currentHandle.setScaleInPixels(true)
  // currentHandle.setUseActiveColor(false)
  currentHandle.setHandleVisibility(false)
  // 设置 handle 颜色为透明
  // const handle1 = currentHandle.getWidgetState().getHandle1();
  // const handle2 = currentHandle.getWidgetState().getHandle2();
  // if (handle1 && handle2) {
  //   console.log("handle1", handle1);
  //   handle1.setColor([0, 0, 0]);
  //   handle2.setColor([0, 0, 0]);
  //   handle1.setVisibility?.(false); // 如果有 setOpacity 方法
  //   handle2.setVisibility?.(false);
  // }
  console.log("currentHandle", currentHandle);
  // currentHandle.setTextStateIndex(0);
  currentHandle.setVisibility(true);
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
