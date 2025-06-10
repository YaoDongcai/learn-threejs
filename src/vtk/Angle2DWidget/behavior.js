import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import macro from "@kitware/vtk.js/macros.js";
import vtkPointPicker from "@kitware/vtk.js/Rendering/Core/PointPicker.js";
import { calculateAngle } from "./utils.js";
const MAX_POINTS = 3;
function widgetBehavior(publicAPI, model) {
  model.classHierarchy.push("vtkAngleWidgetProp");
  model._isDragging = false;
  const picker = vtkPointPicker.newInstance();
  picker.setPickFromList(1); // --------------------------------------------------------------------------
  // Display 2D
  // --------------------------------------------------------------------------

  publicAPI.setDisplayCallback = function (callback) {
    return model.representations[0].setDisplayCallback(callback);
  }; // --------------------------------------------------------------------------
  // Interactor events
  // --------------------------------------------------------------------------

  function ignoreKey(e) {
    return e.altKey || e.controlKey || e.shiftKey;
  } // --------------------------------------------------------------------------
  // Left press: Select handle to drag
  // --------------------------------------------------------------------------

  publicAPI.handleLeftButtonPress = function (e) {
    let _model$activeState$ge, _model$activeState, _model$activeState$ge2;

    if (
      !model.activeState ||
      !model.activeState.getActive() ||
      !model.pickable ||
      ignoreKey(e)
    ) {
      return macro.VOID;
    }

    picker.initializePickList();
    picker.setPickList(publicAPI.getNestedProps());
    const manipulator =
      (_model$activeState$ge =
        (_model$activeState = model.activeState) === null ||
        _model$activeState === void 0
          ? void 0
          : (_model$activeState$ge2 = _model$activeState.getManipulator) ===
              null || _model$activeState$ge2 === void 0
          ? void 0
          : _model$activeState$ge2.call(_model$activeState)) !== null &&
      _model$activeState$ge !== void 0
        ? _model$activeState$ge
        : model.manipulator;

    if (
      model.activeState === model.widgetState.getMoveHandle() &&
      model.widgetState.getHandleList().length < MAX_POINTS &&
      manipulator
    ) {
      const { worldCoords } = manipulator.handleEvent(
        e,
        model._apiSpecificRenderWindow
      ); // Commit handle to location

      const moveHandle = model.widgetState.getMoveHandle();
      moveHandle.setOrigin.apply(moveHandle, _toConsumableArray(worldCoords));
      const newHandle = model.widgetState.addHandle();
      newHandle.setOrigin.apply(
        newHandle,
        _toConsumableArray(moveHandle.getOrigin())
      );
      newHandle.setColor(moveHandle.getColor());
      newHandle.setScale1(moveHandle.getScale1());
      newHandle.setManipulator(manipulator);
    } else if (model.dragable) {
      model._isDragging = true;

      model._apiSpecificRenderWindow.setCursor("grabbing");

      model._interactor.requestAnimation(publicAPI);
    }

    publicAPI.invokeStartInteractionEvent();
    return macro.EVENT_ABORT;
  }; // --------------------------------------------------------------------------
  // Mouse move: Drag selected handle / Handle follow the mouse
  // --------------------------------------------------------------------------

  publicAPI.handleMouseMove = function (callData) {
    let _model$activeState$ge3, _model$activeState2, _model$activeState2$g;

    const manipulator =
      (_model$activeState$ge3 =
        (_model$activeState2 = model.activeState) === null ||
        _model$activeState2 === void 0
          ? void 0
          : (_model$activeState2$g = _model$activeState2.getManipulator) ===
              null || _model$activeState2$g === void 0
          ? void 0
          : _model$activeState2$g.call(_model$activeState2)) !== null &&
      _model$activeState$ge3 !== void 0
        ? _model$activeState$ge3
        : model.manipulator;

    if (
      manipulator &&
      model.pickable &&
      model.dragable &&
      model.activeState &&
      model.activeState.getActive() &&
      !ignoreKey(callData)
    ) {
      const { worldCoords } = manipulator.handleEvent(
        callData,
        model._apiSpecificRenderWindow
      );

      if (
        worldCoords.length &&
        (model.activeState === model.widgetState.getMoveHandle() ||
          model._isDragging) &&
        model.activeState.setOrigin // e.g. the line is pickable but not draggable
      ) {
        model.activeState.setOrigin(worldCoords);
        publicAPI.invokeInteractionEvent();
        return macro.EVENT_ABORT;
      }
    }

    if (model.hasFocus) {
      model._widgetManager.disablePicking();
    }

    return macro.VOID;
  }; // --------------------------------------------------------------------------
  // Left release: Finish drag / Create new handle
  // --------------------------------------------------------------------------

  publicAPI.handleLeftButtonRelease = function () {
    if (
      !model.activeState ||
      !model.activeState.getActive() ||
      !model.pickable
    ) {
      return macro.VOID;
    }

    if (
      model.hasFocus &&
      model.widgetState.getHandleList().length === MAX_POINTS
    ) {
      publicAPI.loseFocus();
      publicAPI.invokeEndInteractionEvent();
      return macro.VOID;
    }

    if (model._isDragging) {
      model._apiSpecificRenderWindow.setCursor("pointer");

      model.widgetState.deactivate();

      model._interactor.cancelAnimation(publicAPI);

      model._isDragging = false;
      // 修改后触发结束事件
      publicAPI.invokeEndInteractionEvent();
    } else if (model.activeState !== model.widgetState.getMoveHandle()) {
      model.widgetState.deactivate();
    }

    if (
      (model.hasFocus && !model.activeState) ||
      (model.activeState && !model.activeState.getActive())
    ) {
      model._widgetManager.enablePicking();

      model._interactor.render();
    }

    // publicAPI.invokeEndInteractionEvent();
    return macro.EVENT_ABORT;
  }; // --------------------------------------------------------------------------
  // Focus API - modeHandle follow mouse when widget has focus
  // --------------------------------------------------------------------------

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
    // 首次绘制时想要显示数值，要通过已绘制的两个点和移动中的那个点来算角度
    if (moveHandle?.getOrigin()?.length && handles.length === 2) {
      return calculateAngle(
        handles[0].getOrigin(),
        handles[1].getOrigin(),
        moveHandle.getOrigin()
      );
    }
    if (handles.length !== 3) {
      return 0;
    }

    if (
      !handles[0].getOrigin() ||
      !handles[1].getOrigin() ||
      !handles[2].getOrigin()
    ) {
      return 0;
    }

    return calculateAngle(
      handles[0].getOrigin(),
      handles[1].getOrigin(),
      handles[2].getOrigin()
    );
  };
  publicAPI.setText = function (text) {
    model.widgetState.getText().setText(text);

    model._interactor.render();
  };
  publicAPI.grabFocus = function () {
    if (
      !model.hasFocus &&
      model.widgetState.getHandleList().length < MAX_POINTS
    ) {
      model.activeState = model.widgetState.getMoveHandle();
      model.activeState.activate();
      model.activeState.setVisible(true);

      model._interactor.requestAnimation(publicAPI);

      publicAPI.invokeStartInteractionEvent();
    }

    model.hasFocus = true;
  }; // --------------------------------------------------------------------------

  publicAPI.loseFocus = function () {
    if (model.hasFocus) {
      model._interactor.cancelAnimation(publicAPI);

      // publicAPI.invokeEndInteractionEvent();
    }

    model.widgetState.deactivate();
    model.widgetState.getMoveHandle().deactivate();
    model.widgetState.getMoveHandle().setVisible(false);
    model.widgetState.getMoveHandle().setOrigin(null);
    model.activeState = null;
    model.hasFocus = false;

    model._widgetManager.enablePicking();

    model._interactor.render();
  };

  publicAPI.widgetCompleted = function () {
    return model.activeState !== model.widgetState.getMoveHandle();
  };
}

export { widgetBehavior as default };
