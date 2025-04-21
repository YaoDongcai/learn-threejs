<template>
  <div class="flex-row">
    <div
      id="WidgetView"
      style="width: 500px; height: 600px"
      ref="rootContainer"
    ></div>
    <div class="">
      <el-button type="primary" @click="addWidget">添加测量组件</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import "@kitware/vtk.js/favicon";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
// import "@kitware/vtk.js/Rendering/Profiles/Volume";
import "@kitware/vtk.js/Rendering/Profiles/All";
// import '@kitware/vtk.js/Rendering/Profiles/Glyph'
// Force DataAccessHelper to have access to various data source
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";
import vtkImageReslice from "@kitware/vtk.js/Imaging/Core/ImageReslice";

import { ref, onMounted } from "vue";
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkHttpDataSetReader from "@kitware/vtk.js/IO/Core/HttpDataSetReader";
import vtkInteractorStyleImage from "@kitware/vtk.js/Interaction/Style/InteractorStyleImage";
import vtkLineWidget from "@kitware/vtk.js/Widgets/Widgets3D/LineWidget";
import vtkAngleWidget from "@kitware/vtk.js/Widgets/Widgets3D/AngleWidget";
import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import vtkInteractorObserver from "@kitware/vtk.js/Rendering/Core/InteractorObserver";
import {
  bindSVGRepresentation,
  makeListenableSVGNode,
} from "@/libs/SVGHelpers";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
// import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
const rootContainer = ref<HTMLDivElement | null>(null);
const widgetManager = vtkWidgetManager.newInstance();
const fullScreenRenderWindow = vtkGenericRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderWindow = fullScreenRenderWindow.getRenderWindow();
const renderer = fullScreenRenderWindow.getRenderer();
const { computeWorldToDisplay } = vtkInteractorObserver;

// -----------------------------------------------------------
// SVG handling
// -----------------------------------------------------------

const svgCleanupCallbacks = [];

function setupTextSVG(
  w: any,
  renderer: vtkRenderer,
  {
    headPoint,
    textColor,
    textMoveable,
  }: { headPoint?: boolean; textColor?: string; textMoveable?: boolean }
) {
  if (!headPoint) {
    headPoint = false;
  }
  if (!textColor) {
    textColor = "red";
  }
  bindSVGRepresentation(renderer, w.getWidgetState(), {
    mapState(widgetState: any, { size }: any) {
      const textState = widgetState.getText();
      const text = textState.getText();
      const origin = textState.getOrigin();
      // 判断text的visible以及是否设置了中心点来显示svg text
      if (origin && textState.getVisible()) {
        const coords = computeWorldToDisplay(renderer, ...origin);
        const position = [coords[0], size[1] - coords[1]];
        return {
          text,
          position,
        };
      }
      return null;
    },
    // 注意这里的h函数是snabbdom的虚拟dom方式；而不是vue的虚拟dom
    render(data: any, h: any) {
      if (!data) return [];
      const attrs = {
        x: data.position[0],
        y: data.position[1],
        dx: headPoint ? 12 : -6,
        dy: headPoint ? -12 : 0,
        fill: textColor,
        "font-size": 14,
      };
      return [
        // text支持时间交互：拖拽等
        textMoveable
          ? makeListenableSVGNode(
              h(
                "text",
                {
                  key: "lineText",
                  attrs,
                  on: {
                    pointerdown: (e) => {
                      const svg = e.target.ownerSVGElement;
                      const textElement = e.target;
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const initialX = parseFloat(
                        textElement.getAttribute("x")
                      );
                      const initialY = parseFloat(
                        textElement.getAttribute("y")
                      );

                      const onPointerMove = (moveEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const deltaY = moveEvent.clientY - startY;
                        textElement.setAttribute("x", initialX + deltaX);
                        textElement.setAttribute("y", initialY + deltaY);
                      };

                      const onPointerUp = () => {
                        svg.removeEventListener("pointermove", onPointerMove);
                        svg.removeEventListener("pointerup", onPointerUp);
                      };

                      svg.addEventListener("pointermove", onPointerMove);
                      svg.addEventListener("pointerup", onPointerUp);
                    },
                    pointerenter: (e) => {
                      // 改变鼠标为手
                      // renderer.getRenderWindow().setCursor("grabbing")
                      console.log("----w", w);
                      // console.log('----pointerenter')
                      // todo xxx feat 释放时，widget解除激活
                      //   w.loseFocus();
                    },
                  },
                },
                [data.text]
              )
            )
          : h(
              "text",
              {
                key: "lineText",
                attrs,
              },
              [data.text]
            ),
        // 添加投影点标识
        headPoint
          ? makeListenableSVGNode(
              h("circle", {
                attrs: {
                  cx: data.position[0],
                  cy: data.position[1],
                  r: 7,
                  fill: "transparent",
                  stroke: textColor,
                  "stroke-dasharray": "2 2",
                },
                on: {
                  pointerdown: (e) => {
                    // w.activateHandle({
                    //   selectedState: w.getWidgetState().getMoveHandle(),
                    // });
                    // w.grabFocus();
                  },
                  pointerenter: (e) => {
                    // todo xxx feat 释放时，widget解除激活
                    // w.loseFocus();
                  },
                },
              })
            )
          : "",
      ];
    },
  });
}
function updateLinePos(lineWidget, renderWindow, text) {
  const subState = lineWidget.getWidgetState().getPositionOnLine();
  lineWidget.setText(text);
  subState.setPosOnLine(50 / 100);
  renderWindow.render();
}
function setWidgetColor(currentWidget, color) {
  const handle1 = currentWidget.getWidgetState().getHandle1();
  const handle2 = currentWidget.getWidgetState().getHandle2();
  //   currentWidget.setScaleInPixels(true)
  console.log("-----currentwidget", currentWidget);
  //   handle1.setVisible(true);
  //   handle2.setVisible(true);
  //   handle1.setShape("sphere");
  //   handle2.setShape("sphere");
  handle1.setScale1(30);

  window.handle1 = handle1;

  //   handle1.setScaleInPixels(true);
  //   handle2.setScaleInPixels(true);
  handle2.setScale1(30);
  //   handle1.setColor(color);
  //   handle2.setColor(color);
  //   currentWidget.setHandleVisibility(0, true);
  //   currentWidget.setHandleVisibility(1, true);
  //   currentWidget.updateHandleVisibility(0);
  //   currentWidget.updateHandleVisibility(1);

  //   console.log(
  //     "----handle1",
  //     handle1.getShape(),
  //     handle1.getScale1(),
  //     handle1.getVisible()
  //   );
  //   handle1.setShapeRadius(11);
  //   handle2.setShapeRadius(11);
  //   currentWidget.setUseActiveColor(false);
  //   currentWidget.getWidgetState().getMoveHandle().setColor(0.3);
}
const addWidget = () => {
  const widget = vtkLineWidget.newInstance();
  //   widget.setPickable(true)
  setupTextSVG(widget, renderer, {
    headPoint: true,
    textMoveable: true,
  });
  //   widget.setHandleVisibility(1)
  console.log("----widget", widget);
  const lineWidget = widgetManager.addWidget(widget);
  lineWidget.onEndInteractionEvent(() => {
    const innerHTML = widget.getDistance().toFixed(2);
    updateLinePos(lineWidget, renderWindow, innerHTML);
    console.log("----innerHTML", innerHTML);
  });
  //   lineWidget.setScale1(1000)
  //   lineWidget.setVisibility(0)
  console.log("----lineWidget", lineWidget.getHandleVisibility());
  //   setWidgetColor(lineWidget, 0.5);
  widgetManager.enablePicking();
  widgetManager.grabFocus(widget);
};

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
});
</script>


<style lang="scss" scoped>
.flex-row {
  display: flex;
}
</style>