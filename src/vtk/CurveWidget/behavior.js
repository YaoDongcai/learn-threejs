import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import macro from "@kitware/vtk.js/macros.js";

const MAX_POINTS = 300;
function uuid() {
  const s = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 32; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23];
  const uuid = s.join("");
  return uuid;
}
function widgetBehavior(publicAPI, model) {
  model.classHierarchy.push("vtkCurveWidgetProp");
  model.widgetId = uuid();
  model._isDragging = false; // --------------------------------------------------------------------------
  // Display 2D
  // --------------------------------------------------------------------------
  // 给每个distancewidget 都生成一个唯一标识的id
  publicAPI.getDistanceWidgetId = function () {
    return model.widgetId;
  };
  publicAPI.setDisplayCallback = function (callback) {
    return model.representations[0].setDisplayCallback(callback);
  }; // --------------------------------------------------------------------------
  // Interactor events
  // --------------------------------------------------------------------------
  publicAPI.handleRightButtonPress = function (e) {
    if (
      !model.activeState ||
      !model.activeState.getActive() ||
      !model.pickable ||
      ignoreKey(e)
    ) {
      return macro.VOID;
    }

    // 当鼠标右键取消的时候 增加一个点
    if (model.hasFocus) {
      const handle = model.widgetState.addHandle();
      const moveHandle = model.widgetState.getMoveHandle();
      handle.setOrigin(moveHandle.getOrigin());
      if (model.widgetState.getHandleList().length !== 1) {
        // 事件结束不能发生在仅一个点时
        publicAPI.loseFocus();
        publicAPI.invokeEndInteractionEvent();
      } else {
        // 触发正常更新事件
        publicAPI.invokeStartInteractionEvent();
        publicAPI.invokeInteractionEvent();
      }
      return macro.EVENT_ABORT;
    }

    if (model.activeState !== model.widgetState.getMoveHandle()) {
      model._interactor.requestAnimation(publicAPI);

      model.activeState.deactivate();
      model.widgetState.removeHandle(model.activeState);
      model.activeState = null;

      model._interactor.cancelAnimation(publicAPI);
    }

    publicAPI.invokeStartInteractionEvent();
    publicAPI.invokeInteractionEvent();
    // publicAPI.invokeEndInteractionEvent();
    return macro.EVENT_ABORT;
  };
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
