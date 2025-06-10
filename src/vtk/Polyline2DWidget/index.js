import _defineProperty from "@babel/runtime/helpers/defineProperty";
import macro from "@/vtk.js/macros.js";
import vtkAbstractWidgetFactory from "@/vtk.js/Widgets/Core/AbstractWidgetFactory.js";
import vtkPlanePointManipulator from "@/vtk.js/Widgets/Manipulators/PlaneManipulator.js";
import vtkSphereHandleRepresentation from "@/vtk.js/Widgets/Representations/SphereHandleRepresentation.js";
import vtkSVGCircleHandleRepresentation from "@/components/vtk/SVGCircleHandleRepresentation";
import vtkSVGLineRepresentation from "@/components/vtk/SVGLineRepresentation";
import vtkSVGLabelRepresentation from "@/components/vtk/SVGLabelRepresentation";

import widgetBehavior from "./behavior.js";
import generateState, { DEF_ORIGIN } from "./state.js";
import { ViewTypes } from "@/vtk.js/Widgets/Core/WidgetManager/Constants.js";
import { f as distance2BetweenPoints } from "@/vtk.js/Common/Core/Math/index.js";

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

function vtkPolyLineWidget(publicAPI, model) {
  model.classHierarchy.push("vtkPolyLineWidget");

  const superClass = _objectSpread({}, publicAPI); // --- Widget Requirement ---------------------------------------------------

  model.methodsToLink = [
    "activeColor",
    "activeScaleFactor",
    "closePolyLine",
    "defaultScale",
    "glyphResolution",
    "lineThickness",
    "useActiveColor",
    "scaleInPixels",
    "circleProps",
    "lineProps",
    "textProps",
    "text",
    "textStateIndex",
  ];

  publicAPI.placeText = function () {
    const dySign = getOffsetDirectionForTextPosition();

    const textPropsCp = _objectSpread(
      {},
      model.representations[1].getTextProps()
    );

    textPropsCp.dy = dySign * Math.abs(textPropsCp.dy);
    model.representations[1].setTextProps(textPropsCp);

    model._interactor.render();
  };

  publicAPI.getMeasure = function () {
    const handles = model.widgetState.getHandleList();
    const moveHandle = model.widgetState.getMoveHandle();
    const moveOrigin = moveHandle?.getOrigin();
    // 首次绘制时想要显示数值，要通过已绘制的点和移动中的那个点来算距离
    if (
      moveOrigin &&
      moveOrigin[0] !== DEF_ORIGIN[0] &&
      moveOrigin[1] !== DEF_ORIGIN[1] &&
      handles.length >= 1
    ) {
      handles.push(moveHandle);
    } else if (handles.length < 2) {
      return 0;
    }

    if (!handles[0].getOrigin() || !handles[1].getOrigin()) {
      return 0;
    }
    let result = 0;
    const length = handles.length;
    for (let i = 0; i < length - 1; ++i) {
      const origin1 = handles[i].getOrigin();
      const origin2 = handles[i + 1].getOrigin();
      if (origin1 && origin2) {
        result += Math.sqrt(distance2BetweenPoints(origin1, origin2));
      }
    }
    return result;
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
          },
          {
            builder: vtkSVGCircleHandleRepresentation,
            labels: ["handles", "moveHandle"],
          },
          {
            builder: vtkSVGLineRepresentation,
            labels: ["handles", "moveHandle"],
          },
          {
            builder: vtkSVGLabelRepresentation,
            labels: ["handles"],
          },
        ];
    }
  };
  // --- Public methods -------------------------------------------------------

  publicAPI.setManipulator = function (manipulator) {
    superClass.setManipulator(manipulator);
    model.widgetState.getMoveHandle().setManipulator(manipulator);
    model.widgetState.getHandleList().forEach(function (handle) {
      handle.setManipulator(manipulator);
    });
  };
  // --------------------------------------------------------------------------
  // initialization
  // --------------------------------------------------------------------------

  model.widgetState.onBoundsChange(function (bounds) {
    const center = [
      (bounds[0] + bounds[1]) * 0.5,
      (bounds[2] + bounds[3]) * 0.5,
      (bounds[4] + bounds[5]) * 0.5,
    ];
    model.widgetState.getMoveHandle().setOrigin(center);
  });

  // Default manipulator
  publicAPI.setManipulator(
    model.manipulator ||
      vtkPlanePointManipulator.newInstance({
        useCameraFocalPoint: true,
        useCameraNormal: true,
      })
  );
}
// ----------------------------------------------------------------------------

const defaultValues = function defaultValues(initialValues) {
  return _objectSpread(
    {
      manipulator: null,
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
  vtkPolyLineWidget(publicAPI, model);
} // ----------------------------------------------------------------------------

const newInstance = macro.newInstance(extend, "vtkPolyLineWidget"); // ----------------------------------------------------------------------------

const vtkPolyLineWidget$1 = {
  newInstance: newInstance,
  extend: extend,
};

export { vtkPolyLineWidget$1 as default, extend, newInstance };
