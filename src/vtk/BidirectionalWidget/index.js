import _defineProperty from "@babel/runtime/helpers/defineProperty";
import macro from "@kitware/vtk.js/macro.js";
import vtkAbstractWidgetFactory from "@kitware/vtk.js/Widgets/Core/AbstractWidgetFactory.js";
import vtkPlanePointManipulator from "@kitware/vtk.js/Widgets/Manipulators/PlaneManipulator.js";
import vtkSphereHandleRepresentation from "@kitware/vtk.js/Widgets/Representations/SphereHandleRepresentation.js";
// import vtkSVGCircleHandleRepresentation from "@/components/vtk/SVGCircleHandleRepresentation";
// import vtkSVGCrossLineRepresentation from "@/components/vtk/SVGCrossLineRepresentation";

import widgetBehavior from "./behavior.js";
import generateState, { DEF_ORIGIN } from "./state.js";
import { ViewTypes } from "@kitware/vtk.js/Widgets/Core/WidgetManager/Constants.js";
import { distance2BetweenPoints } from "@kitware/vtk.js/Common/Core/Math";

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
    const source = null !== arguments[i] ? arguments[i] : {};
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
function vtkBirectionalWidget(publicAPI, model) {
  model.classHierarchy.push("vtkBirectionalWidget");
  const superClass = _objectSpread({}, publicAPI);

  model.methodsToLink = [
    "circleProps",
    "lineProps",
    "textProps",
    "text",
    "textStateIndex",
    "scaleInPixels"
  ];

  publicAPI.getMeasure = () => {
    const handles = model.widgetState.getHandleList();
    const moveHandle = model.widgetState.getMoveHandle();
    const points = [];

    if (handles.length >= 4) {
      points.push(
        handles[0].getOrigin(),
        handles[1].getOrigin(),
        handles[2].getOrigin(),
        handles[3].getOrigin()
      );
    } else if (handles.length >= 2) {
      points.push(handles[0].getOrigin(), handles[1].getOrigin());
    } else if (handles.length === 1) {
      points.push(handles[0].getOrigin(), moveHandle.getOrigin());
    }

    let distance1 = 0.0;
    let distance2 = 0.0;
    if (points[0] && points[1]) {
      distance1 = Math.sqrt(distance2BetweenPoints(points[0], points[1]));
    }
    if (points[2] && points[3]) {
      distance2 = Math.sqrt(distance2BetweenPoints(points[2], points[3]));
    }
    return `${distance1.toFixed(1)}x${distance2.toFixed(1)}`;
    // return distance1;
  };

  publicAPI.getRepresentationsForViewType = (viewType) => {
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
          }
        ];
    }
  };

  publicAPI.setManipulator = function (manipulator) {
    superClass.setManipulator(manipulator);
    model.widgetState.getMoveHandle().setManipulator(manipulator);
    model.widgetState.getHandleList().forEach(function (handle) {
      handle.setManipulator(manipulator);
    });
  };

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
        useCameraFocalPoint: true,
        useCameraNormal: true,
      })
  );
}

function defaultValues(initialValues) {
  return _objectSpread(
    {
      manipulator: null,
      behavior: widgetBehavior,
      widgetState: generateState(),
    },
    initialValues
  );
}

function extend(publicAPI, model) {
  const initialValues =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, defaultValues(initialValues));
  vtkAbstractWidgetFactory.extend(publicAPI, model, initialValues);
  macro.setGet(publicAPI, model, ["manipulator"]);
  vtkBirectionalWidget(publicAPI, model);
}

const newInstance = macro.newInstance(extend, "vtkBirectionalWidget");

const vtkBirectionalWidget$1 = {
  newInstance: newInstance,
  extend: extend,
};

export { vtkBirectionalWidget$1 as default, extend, newInstance };
