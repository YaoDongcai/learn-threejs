import macro from "@kitware/vtk.js/macros.js";

import {
  adaptDynamicPoint,
  getOppositePoint,
  rotatePoint,
  getDynamicPointAndOppositePoint,
  getDistanceOfTerminalPointsToFootOfPerpendicular,
} from "./helpers.js";
const MAX_POINTS = 4;

function widgetBehavior(publicAPI, model) {
  model.classHierarchy.push("vtkBirectionalWidgetProp");
  model._isDragging = false;
  // 存储四个端点到垂足坐标点的距离
  let distanceTTF = [0, 0, 0, 0];

  // --------------------------------------------------------------------------
  // Display 2D
  // --------------------------------------------------------------------------
  publicAPI.getOffsetDistance = function () {
    return model.offsetDistance || 10;
  };
  publicAPI.setOffsetDistance = function (value) {
    model.offsetDistance = value;
  };
  publicAPI.setDisplayCallback = function (callback) {
    return model.representations[0].setDisplayCallback(callback);
  };

  // --------------------------------------------------------------------------
  // Interactor events
  // --------------------------------------------------------------------------
  function ignoreKey(e) {
    return e.altKey || e.controlKey || e.shiftKey;
  }

  function addHandle(origin) {
    const moveHandle = model.widgetState.getMoveHandle();
    const newHandle = model.widgetState.addHandle();
    newHandle.setOrigin(origin);
    newHandle.setColor(moveHandle.getColor());
    newHandle.setScale1(moveHandle.getScale1());
    newHandle.setManipulator(moveHandle.getManipulator());
  }

  // --------------------------------------------------------------------------
  // Left press: Select handle to drag
  // --------------------------------------------------------------------------
  publicAPI.handleLeftButtonPress = function (e) {
    let _model$activeState$ge3, _model$activeState2, _model$activeState2$g;

    if (
      !model.activeState ||
      !model.activeState.getActive() ||
      !model.pickable ||
      ignoreKey(e)
    ) {
      return macro.VOID;
    }

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
      model.activeState === model.widgetState.getMoveHandle() &&
      model.widgetState.getHandleList().length < MAX_POINTS &&
      manipulator
    ) {
      const { worldCoords } = manipulator.handleEvent(
        e,
        model._apiSpecificRenderWindow
      );
      const moveHandle = model.widgetState.getMoveHandle();
      moveHandle.setOrigin(worldCoords);

      if (model.widgetState.getHandleList().length < 2) {
        addHandle(worldCoords);
      } else if (model.widgetState.getHandleList().length === 2) {
        const handleList = model.widgetState.getHandleList();
        const p1 = handleList[0].getOrigin();
        const p2 = handleList[1].getOrigin();
        const adaptPoint = adaptDynamicPoint(p1, p2, worldCoords);
        addHandle(adaptPoint);
      }
      if (model.widgetState.getHandleList().length === 3) {
        const handleList = model.widgetState.getHandleList();
        const p1 = handleList[0].getOrigin();
        const p2 = handleList[1].getOrigin();
        const p3 = handleList[2].getOrigin();
        const oppositePoint = getOppositePoint(p1, p2, p3);
        addHandle(oppositePoint);
      }
    } else if (model.dragable) {
      model._isDragging = true;

      model._apiSpecificRenderWindow.setCursor("grabbing");

      model._interactor.requestAnimation(publicAPI);

      const handleList = model.widgetState.getHandleList();
      const p1 = handleList[0].getOrigin();
      const p2 = handleList[1].getOrigin();
      const p3 = handleList[2].getOrigin();
      const p4 = handleList[3].getOrigin();
      distanceTTF = getDistanceOfTerminalPointsToFootOfPerpendicular(
        p1,
        p2,
        p3,
        p4
      );
    }

    publicAPI.invokeStartInteractionEvent();
    return macro.EVENT_ABORT;
  };

  // --------------------------------------------------------------------------
  // Mouse move: Drag selected handle / Handle follow the mouse
  // --------------------------------------------------------------------------
  function handleDragging(model, worldCoords) {
    const handleList = model.widgetState.getHandleList();
    const p0 = handleList[0].getOrigin();
    const p1 = handleList[1].getOrigin();
    const p2 = handleList[2].getOrigin();
    const p3 = handleList[3].getOrigin();
    const index = handleList.indexOf(model.activeState);
    switch (index) {
      case 0: {
        const [p0$, p2$, p3$] = rotatePoint(
          worldCoords,
          p1,
          distanceTTF[1],
          distanceTTF[2],
          distanceTTF[3]
        );
        handleList[0].setOrigin(p0$);
        handleList[2].setOrigin(p2$);
        handleList[3].setOrigin(p3$);
        break;
      }
      case 1: {
        const [p1$, p2$, p3$] = rotatePoint(
          worldCoords,
          p0,
          distanceTTF[0],
          distanceTTF[2],
          distanceTTF[3]
        );
        handleList[1].setOrigin(p1$);
        handleList[2].setOrigin(p2$);
        handleList[3].setOrigin(p3$);
        break;
      }
      case 2: {
        const { dynamicPoint, oppositePoint } = getDynamicPointAndOppositePoint(
          p0,
          p1,
          worldCoords,
          distanceTTF[3]
        );
        handleList[2].setOrigin(dynamicPoint);
        handleList[3].setOrigin(oppositePoint);
        break;
      }
      case 3: {
        const { dynamicPoint, oppositePoint } = getDynamicPointAndOppositePoint(
          p0,
          p1,
          worldCoords,
          distanceTTF[2]
        );
        handleList[2].setOrigin(oppositePoint);
        handleList[3].setOrigin(dynamicPoint);
        break;
      }
    }
  }
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
        if (model.activeState === model.widgetState.getMoveHandle()) {
          model.activeState.setOrigin(worldCoords);
        } else if (model._isDragging) {
          handleDragging(model, worldCoords);
        }

        publicAPI.invokeInteractionEvent();
        return macro.EVENT_ABORT;
      }
    }

    if (model.hasFocus) {
      model._widgetManager.disablePicking();
    }

    return macro.VOID;
  };

  // --------------------------------------------------------------------------
  // Left release: Finish drag / Create new handle
  // --------------------------------------------------------------------------
  publicAPI.updateCursor = function (type) {
    model._apiSpecificRenderWindow.setCursor(type);
  };

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
      model.activeState = null;
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
  };

  // --------------------------------------------------------------------------
  // Escape key: Release focus to switch to drag mode
  // --------------------------------------------------------------------------
  publicAPI.handleKeyDown = function (_ref) {
    const key = _ref.key;
    if (key === "Escape") {
      publicAPI.loseFocus();
    }
  };

  // --------------------------------------------------------------------------
  // Focus API - modeHandle follow mouse when widget has focus
  // --------------------------------------------------------------------------
  publicAPI.grabFocus = function () {
    if (!model.hasFocus) {
      model.activeState = model.widgetState.getMoveHandle();
      model.activeState.activate();
      model.activeState.setVisible(true);
      model._interactor.requestAnimation(publicAPI);
      publicAPI.invokeStartInteractionEvent();
    }
    model.hasFocus = true;
  };

  publicAPI.loseFocus = function () {
    if (model.hasFocus) {
      model._interactor.cancelAnimation(publicAPI);
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
