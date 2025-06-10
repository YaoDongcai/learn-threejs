import macro from "@/vtk.js/macros.js";
import {
  s as subtract,
  k as add,
  l as normalize,
} from "@/vtk.js/Common/Core/Math/index.js";
function widgetBehavior(publicAPI, model) {
  model.classHierarchy.push("vtkPolyLineWidgetProp");
  model._isDragging = false; // --------------------------------------------------------------------------
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
  }; // --------------------------------------------------------------------------
  // Interactor events
  // --------------------------------------------------------------------------

  function ignoreKey(e) {
    return e.altKey || e.controlKey || e.shiftKey;
  }

  function updateMoveHandle(callData) {
    let _model$activeState$ge, _model$activeState, _model$activeState$ge2;

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

    if (!manipulator) {
      return macro.VOID;
    }

    const { worldCoords } = manipulator.handleEvent(
      callData,
      model._apiSpecificRenderWindow
    );
    const translation = model.previousPosition
      ? subtract(worldCoords, model.previousPosition, [])
      : [0, 0, 0];
    model.previousPosition = worldCoords;
    if (
      worldCoords.length &&
      (model.activeState === model.widgetState.getMoveHandle() ||
        (model._isDragging && model.activeState))
    ) {
      // model.activeState.setOrigin(worldCoords);
      if (model.activeState && model.activeState?.hasOwnProperty("setOrigin")) {
        // e.g. the line is pickable but not draggable
        model.activeState.setOrigin(worldCoords);
      } else {
        //dragger the line
        const handleList = model.widgetState.getHandleList();
        for (let i = 0; i < handleList.length; ++i) {
          handleList[i].setOrigin(
            add(handleList[i].getOrigin(), translation, [])
          );
        }
      }
      publicAPI.invokeInteractionEvent();
      return macro.EVENT_ABORT;
    }

    return macro.VOID;
  } // --------------------------------------------------------------------------
  // Right click: Delete handle
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
      manipulator
    ) {
      updateMoveHandle(e);
      const moveHandle = model.widgetState.getMoveHandle();
      const newHandle = model.widgetState.addHandle();
      newHandle.setOrigin(moveHandle.getOrigin());
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
    if (
      model.pickable &&
      model.dragable &&
      model.activeState &&
      model.activeState.getActive() &&
      !ignoreKey(callData)
    ) {
      if (updateMoveHandle(callData) == macro.EVENT_ABORT) {
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
  }; // --------------------------------------------------------------------------
  // Escape key: Release focus to switch to drag mode
  // --------------------------------------------------------------------------

  publicAPI.handleKeyDown = function (_ref) {
    const key = _ref.key;

    if (key === "Escape") {
      publicAPI.loseFocus();
    }
  }; // --------------------------------------------------------------------------
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
  }; // --------------------------------------------------------------------------

  // publicAPI.placeText = function () {
  //   const dySign = getOffsetDirectionForTextPosition();

  //   const textPropsCp = _objectSpread(
  //     {},
  //     model.representations[1].getTextProps()
  //   );

  //   textPropsCp.dy = dySign * Math.abs(textPropsCp.dy);
  //   model.representations[1].setTextProps(textPropsCp);

  //   model._interactor.render();
  // };

  publicAPI.setText = function (text) {
    model.widgetState.getText().setText(text);

    model._interactor.render();
  };
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
