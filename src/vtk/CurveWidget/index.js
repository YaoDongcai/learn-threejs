import _defineProperty from "@babel/runtime/helpers/defineProperty";
import macro from "@kitware/vtk.js/macros.js";
import vtkAbstractWidgetFactory from "@kitware/vtk.js/Widgets/Core/AbstractWidgetFactory.js";
import vtkPlanePointManipulator from "@kitware/vtk.js/Widgets/Manipulators/PlaneManipulator.js";

import vtkSphereHandleRepresentation from "@kitware/vtk.js/Widgets/Representations/SphereHandleRepresentation.js";
// import vtkSVGCircleHandleRepresentation from "../SVGCircleHandleRepresentation";
// import vtkSVGLabelRepresentation from "../SVGLabelRepresentation";
// import vtkSVGCurveRepresentation from "../SVGCurveRepresentation";

import { distance2BetweenPoints } from "@kitware/vtk.js/Common/Core/Math";
import widgetBehavior from "./behavior.js";
import generateState from "./state.js";
import { ViewTypes } from "@kitware/vtk.js/Widgets/Core/WidgetManager/Constants.js";
import { getCurvePoints } from "./helper.js";
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

function vtkCurveWidget(publicAPI, model) {
  model.classHierarchy.push("vtkCurveWidget");

  const superClass = _objectSpread({}, publicAPI); // --- Widget Requirement ---------------------------------------------------

  model.methodsToLink = [
    "activeScaleFactor",
    "activeColor",
    "useActiveColor",
    "glyphResolution",
    "defaultScale",
    "scaleInPixels",
    "circleProps",
    "lineProps",
    "textProps",
    "text",
    "textStateIndex",
    "getDistanceWidgetId",
  ];
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
            labels: ["handles"],
            initialValues: {
              scaleInPixels: true,
            },
          },
          {
            builder: vtkSphereHandleRepresentation,
            labels: ["moveHandle"],
            initialValues: {
              scaleInPixels: true,
            },
          },
          // {
          //   builder: vtkSVGCircleHandleRepresentation,
          //   labels: ["handles", "moveHandle"],
          // },
          // {
          //   builder: vtkSVGCurveRepresentation,
          //   labels: ["handles", "moveHandle"],
          // },
          // {
          //   builder: vtkSVGLabelRepresentation,
          //   labels: ["handles"],
          // },
        ];
    }
  }; // --- Public methods -------------------------------------------------------
  publicAPI.getMeasure = function () {
    const handles = model.widgetState.getHandleList();
    const moveHandle = model.widgetState.getMoveHandle();
    // 首次绘制时想要显示数值，要通过已绘制的点和移动中的那个点来算距离
    if (
      !!moveHandle?.getOrigin()?.[0] && // 曲线测量时，非首次绘制时，moveHandle的origin数组为[0,0,0]，因此排除这种情况
      !!moveHandle?.getOrigin()?.[1] &&
      handles.length >= 1
    ) {
      const curvePointsArr = [];
      for (const element of handles) {
        const xy = element.getOrigin();
        const x1 = xy[0];
        const y1 = xy[1];
        curvePointsArr.push(x1, y1);
      }
      curvePointsArr.push(moveHandle.getOrigin()[0], moveHandle.getOrigin()[1]);

      const res = getCurvePoints(curvePointsArr);
      let distanceResult = 0;
      for (let i = 0; i < res.length - 3; i += 2) {
        distanceResult += Math.sqrt(
          distance2BetweenPoints(
            [res[i], res[i + 1], 0],
            [res[i + 2], res[i + 3], 0]
          )
        );
      }
      return distanceResult.toFixed(2);
    }
    if (handles.length < 2) {
      return 0;
    }

    if (!handles[0].getOrigin() || !handles[1].getOrigin()) {
      return 0;
    }
    const curvePointsArr = [];
    for (const element of handles) {
      const xy = element.getOrigin();
      const x1 = xy[0];
      const y1 = xy[1];
      curvePointsArr.push(x1, y1);
    }

    const res = getCurvePoints(curvePointsArr);
    let distanceResult = 0;
    for (let i = 0; i < res.length - 3; i += 2) {
      distanceResult += Math.sqrt(
        distance2BetweenPoints(
          [res[i], res[i + 1], 0],
          [res[i + 2], res[i + 3], 0]
        )
      );
    }

    return distanceResult.toFixed(2);
  };

  publicAPI.setManipulator = function (manipulator) {
    superClass.setManipulator(manipulator);
    model.widgetState.getMoveHandle().setManipulator(manipulator);
    model.widgetState.getHandleList().forEach(function (handle) {
      handle.setManipulator(manipulator);
    });
  }; // --------------------------------------------------------------------------
  // initialization
  // --------------------------------------------------------------------------

  model.widgetState.onBoundsChange(function (bounds) {
    const center = [
      (bounds[0] + bounds[1]) * 0.5,
      (bounds[2] + bounds[3]) * 0.5,
      (bounds[4] + bounds[5]) * 0.5,
    ];
    model.widgetState.getMoveHandle().setOrigin(center);
  }); // Default manipulator

  publicAPI.setManipulator(
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
  macro.setGet(publicAPI, model, ["manipulator"]);
  vtkCurveWidget(publicAPI, model);
} // ----------------------------------------------------------------------------

const newInstance = macro.newInstance(extend, "vtkCurveWidget"); // ----------------------------------------------------------------------------

const vtkCurveWidget$1 = {
  newInstance: newInstance,
  extend: extend,
};

export { vtkCurveWidget$1 as default, extend, newInstance };
