import _defineProperty from "@babel/runtime/helpers/defineProperty";
import macro from "@kitware/vtk.js/macros.js";
import vtkAbstractWidgetFactory from "@kitware/vtk.js/Widgets/Core/AbstractWidgetFactory.js";
import vtkPlanePointManipulator from "@kitware/vtk.js/Widgets/Manipulators/PlaneManipulator.js";

import vtkSphereHandleRepresentation from "@kitware/vtk.js/Widgets/Representations/SphereHandleRepresentation.js";
import vtkMath from "@kitware/vtk.js/Common/Core/Math";
import widgetBehavior from "./behavior.js";
import generateState from "./state.js";
import { ViewTypes } from "@kitware/vtk.js/Widgets/Core/WidgetManager/Constants.js";
const distance2BetweenPoints = vtkMath.distance2BetweenPoints;
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

function vtkDistanceWidget(publicAPI, model) {
  model.classHierarchy.push("vtkDistanceWidget");

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
        ];
    }
  }; // --- Public methods -------------------------------------------------------
  publicAPI.getMeasure = function (currentHandle) {
    if (currentHandle) {
      return Math.sqrt(
        distance2BetweenPoints(
          currentHandle[0].getOrigin(),
          currentHandle[1].getOrigin()
        )
      );
    }
    const handles = model.widgetState.getHandleList();
    const moveHandle = model.widgetState.getMoveHandle();
    // 首次绘制时想要显示数值，要通过已绘制的那个点和移动中的那个点来算距离
    if (moveHandle?.getOrigin()?.length && handles.length === 1) {
      return Math.sqrt(
        distance2BetweenPoints(handles[0].getOrigin(), moveHandle.getOrigin())
      );
    }
    if (handles.length !== 2) {
      return 0;
    }

    if (!handles[0].getOrigin() || !handles[1].getOrigin()) {
      return 0;
    }

    return Math.sqrt(
      distance2BetweenPoints(handles[0].getOrigin(), handles[1].getOrigin())
    );
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
  vtkDistanceWidget(publicAPI, model);
} // ----------------------------------------------------------------------------

const newInstance = macro.newInstance(extend, "vtkDistanceWidget"); // ----------------------------------------------------------------------------

const vtkDistanceWidget$1 = {
  newInstance: newInstance,
  extend: extend,
};

export { vtkDistanceWidget$1 as default, extend, newInstance };
