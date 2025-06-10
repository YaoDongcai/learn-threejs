import _defineProperty from "@babel/runtime/helpers/defineProperty";
import macro from "@/vtk.js/macros.js";
import vtkAbstractWidgetFactory from "@/vtk.js/Widgets/Core/AbstractWidgetFactory.js";
import vtkPlanePointManipulator from "@/vtk.js/Widgets/Manipulators/PlaneManipulator.js";
import vtkSplineContextRepresentation from "@/vtk.js/Widgets/Representations/SplineContextRepresentation.js";
import vtkSphereHandleRepresentation from "@/vtk.js/Widgets/Representations/SphereHandleRepresentation.js";
import vtkSVGCircleHandleRepresentation from "@/components/vtk/SVGCircleHandleRepresentation";
import vtkSVGCloseLineRepresentation from "@/components/vtk/SVGCloseLineRepresentation";
import vtkSVGLabelRepresentation from "@/components/vtk/SVGLabelRepresentation";

import widgetBehavior from "./behavior.js";
import generateState, { DEF_ORIGIN } from "./state.js";
import { ViewTypes } from "@/vtk.js/Widgets/Core/WidgetManager/Constants.js";
import { getPoint, updateTextPosition } from "./helpers.js";
function ownKeys(object, enumerableOnly) {
  const keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    let symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly &&
      (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })),
      keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (let i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2
      ? ownKeys(Object(source), !0).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(
          target,
          Object.getOwnPropertyDescriptors(source)
        )
      : ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(
            target,
            key,
            Object.getOwnPropertyDescriptor(source, key)
          );
        });
  }
  return target;
}
// Factory
// ----------------------------------------------------------------------------

function vtkSplineWidget(publicAPI, model) {
  model.classHierarchy.push("vtkSplineWidget");

  const superClass = _objectSpread({}, publicAPI); // --- Widget Requirement ---------------------------------------------------

  model.methodsToLink = [
    "boundaryCondition",
    "close",
    "outputBorder",
    "fill",
    "borderColor",
    "errorBorderColor",
    "scaleInPixels",
    "circleProps",
    "lineProps",
    "textProps",
    "text",
    "textStateIndex",
  ];
  model.widgetState.onModified(function () {
    updateTextPosition(model);
  });

  publicAPI.getMeasure = function () {
    const handleList = model.widgetState.getHandleList();
    const moveHandle = model.widgetState.getMoveHandle();
    const moveOrigin = moveHandle?.getOrigin();
    let area = 0.0;
    // 首次绘制时想要显示数值，要通过已绘制的点和移动中的那个点来算面积
    if (
      moveOrigin &&
      moveOrigin[0] !== DEF_ORIGIN[0] &&
      moveOrigin[1] !== DEF_ORIGIN[1] &&
      handleList.length >= 2
    ) {
      handleList.push(moveHandle); // 如果属于首次动态绘制点，则插入当前动态绘制点
    }

    // 去重 ---------begin----------
    const tempMap = new Map();
    handleList.forEach((handle) => {
      const key = handle.getOrigin().toString();
      if (!tempMap.has(key)) tempMap.set(key, handle);
    });
    handleList.length = 0;
    tempMap.forEach((item) => handleList.push(item));
    // 去重 ---------end----------

    // 去重后判断handList.length是否大于等于3
    if (handleList.length >= 3) {
      // 最少三个点才可以
      const length = handleList.length;
      // 获取前三个点
      const point1 = handleList[0].getOrigin();
      const point2 = handleList[1].getOrigin();
      const point3 = handleList[2].getOrigin();
      // first origin
      const P1X = point1[0];
      const P1Y = point1[1];
      const P1Z = point1[2];
      // second origin
      const P2X = point2[0];
      const P2Y = point2[1];
      const P2Z = point2[2];

      //third origin
      const P3X = point3[0];
      const P3Y = point3[1];
      const P3Z = point3[2];

      const a =
        Math.pow((P2Y - P1Y) * (P3Z - P1Z) - (P3Y - P1Y) * (P2Z - P1Z), 2) +
        Math.pow((P3X - P1X) * (P2Z - P1Z) - (P2X - P1X) * (P3Z - P1Z), 2) +
        Math.pow((P2X - P1X) * (P3Y - P1Y) - (P3X - P1X) * (P2Y - P1Y), 2);
      const cosnx =
        ((P2Y - P1Y) * (P3Z - P1Z) - (P3Y - P1Y) * (P2Z - P1Z)) /
        Math.pow(a, 0.5);
      const cosny =
        ((P3X - P1X) * (P2Z - P1Z) - (P2X - P1X) * (P3Z - P1Z)) /
        Math.pow(a, 0.5);
      const cosnz =
        ((P2X - P1X) * (P3Y - P1Y) - (P3X - P1X) * (P2Y - P1Y)) /
        Math.pow(a, 0.5);
      // 临时的点
      let node0, node1;
      for (let i = 1; i < length; ++i) {
        node0 = handleList[i - 1].getOrigin();
        node1 = handleList[i].getOrigin();
        const tempArea =
          cosnz * (node0[0] * node1[1] - node1[0] * node0[1]) +
          cosnx * (node0[1] * node1[2] - node1[1] * node0[2]) +
          cosny * (node0[2] * node1[0] - node1[2] * node0[0]);
        area += tempArea;
      }
      node0 = handleList[length - 1].getOrigin();
      node1 = handleList[0].getOrigin();
      area +=
        cosnz * (node0[0] * node1[1] - node1[0] * node0[1]) +
        cosnx * (node0[1] * node1[2] - node1[1] * node0[2]) +
        cosny * (node0[2] * node1[0] - node1[2] * node0[0]);

      area = area * 0.5;
      if (area < 0) {
        area = -area;
      }
    }
    return area; //.toFixed(1);
  };
  publicAPI.getRepresentationsForViewType = function (viewType) {
    switch (viewType) {
      case ViewTypes.DEFAULT:
      case ViewTypes.GEOMETRY:
      case ViewTypes.SLICE:
      case ViewTypes.VOLUME:
      default:
        return [
          {
            builder: vtkSphereHandleRepresentation,
            labels: ["handles", "moveHandle"],
          },
          {
            builder: vtkSplineContextRepresentation,
            labels: ["handles", "moveHandle"],
          },
          {
            builder: vtkSVGCircleHandleRepresentation,
            labels: ["handles", "moveHandle"],
          },
          {
            builder: vtkSVGCloseLineRepresentation,
            labels: ["handles", "moveHandle"],
          },
          {
            builder: vtkSVGLabelRepresentation,
            labels: ["handles"],
          },
        ];
    }
  }; // --- Public methods -------------------------------------------------------

  publicAPI.setManipulator = function (manipulator) {
    superClass.setManipulator(manipulator);
    model.widgetState.getMoveHandle().setManipulator(manipulator);
    model.widgetState.getHandleList().forEach(function (handle) {
      handle.setManipulator(manipulator);
    });
  }; // --------------------------------------------------------------------------
  // initialization
  // --------------------------------------------------------------------------
  // Default manipulator

  publicAPI.setManipulator(
    model.manipulator ||
      model.manipulator ||
      vtkPlanePointManipulator.newInstance({
        useCameraNormal: true,
      })
  );
} // ----------------------------------------------------------------------------

const defaultValues = function defaultValues(initialValues) {
  return _objectSpread(
    {
      // manipulator: null,
      freehandMinDistance: 0.1,
      allowFreehand: true,
      resolution: 1,
      // propagates to SplineContextRepresentation
      defaultCursor: "pointer",
      handleSizeInPixels: 10,
      // propagates to SplineContextRepresentation
      resetAfterPointPlacement: false,
      behavior: widgetBehavior,
      widgetState: generateState(),
    },
    initialValues
  );
}; // ----------------------------------------------------------------------------

function extend(publicAPI, model) {
  const initialValues =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, defaultValues(initialValues));
  vtkAbstractWidgetFactory.extend(publicAPI, model, initialValues);
  macro.setGet(publicAPI, model, [
    "manipulator",
    "freehandMinDistance",
    "allowFreehand",
    "resolution",
    "defaultCursor",
    "handleSizeInPixels",
    "resetAfterPointPlacement",
  ]);
  vtkSplineWidget(publicAPI, model);
} // ----------------------------------------------------------------------------

const newInstance = macro.newInstance(extend, "vtkSplineWidget"); // ----------------------------------------------------------------------------

const vtkSplineWidget$1 = {
  newInstance: newInstance,
  extend: extend,
};

export { vtkSplineWidget$1 as default, extend, newInstance };
