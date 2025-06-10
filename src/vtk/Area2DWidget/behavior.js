import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import macro from "@/vtk.js/macros.js";
import { vec3 } from "gl-matrix";

function widgetBehavior(publicAPI, model) {
  model.classHierarchy.push("vtkSplineWidgetProp");
  model._isDragging = false;
  model.keysDown = {};
  model.moveHandle = model.widgetState.getMoveHandle(); // --------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------

  const updateHandlesSize = function updateHandlesSize() {
    if (publicAPI.getHandleSizeInPixels() != null) {
      const scale = publicAPI.getHandleSizeInPixels();
      model.moveHandle.setScale1(scale);
      model.widgetState.getHandleList().forEach(function (handle) {
        handle.setScale1(scale);
      });
    }
  }; // --------------------------------------------------------------------------
  let doubleClickFirstClicked = true;
  let doubleClickTimeout = null;
  const addPoint = function addPoint() {
    // 防止拖拽时，连续绘制面积上的点
    clearTimeout(doubleClickTimeout);
    doubleClickTimeout = setTimeout(() => {
      doubleClickFirstClicked = true;
    }, 100);
    if (!doubleClickFirstClicked) {
      return macro.VOID;
    }
    doubleClickFirstClicked = false;
    // Commit handle to location
    if (
      !model.lastHandle ||
      model.keysDown.Control ||
      !model.freeHand ||
      vec3.squaredDistance(
        model.moveHandle.getOrigin(),
        model.lastHandle.getOrigin()
      ) >
        publicAPI.getFreehandMinDistance() * publicAPI.getFreehandMinDistance()
    ) {
      let _model$lastHandle;

      model.lastHandle = model.widgetState.addHandle();
      model.lastHandle.setVisible(false);

      (_model$lastHandle = model.lastHandle).setOrigin.apply(
        _model$lastHandle,
        _toConsumableArray(model.moveHandle.getOrigin())
      );

      model.lastHandle.setColor(model.moveHandle.getColor());
      model.lastHandle.setScale1(model.moveHandle.getScale1());
      model.lastHandle.setManipulator(model.manipulator);

      if (!model.firstHandle) {
        model.firstHandle = model.lastHandle;
      }

      model._apiSpecificRenderWindow.setCursor("grabbing");
    }
  }; // --------------------------------------------------------------------------

  const getHoveredHandle = function getHoveredHandle() {
    const handles = model.widgetState.getHandleList();
    const scale =
      model.moveHandle.getScale1() *
      vec3.distance(
        model._apiSpecificRenderWindow.displayToWorld(0, 0, 0, model._renderer),
        model._apiSpecificRenderWindow.displayToWorld(1, 0, 0, model._renderer)
      );
    return handles.reduce(
      function (_ref, handle) {
        const closestHandle = _ref.closestHandle,
          closestDistance = _ref.closestDistance;

        if (
          handle !== model.moveHandle &&
          model.moveHandle.getOrigin() &&
          handle.getOrigin()
        ) {
          const distance = vec3.squaredDistance(
            model.moveHandle.getOrigin(),
            handle.getOrigin()
          );

          if (distance < closestDistance) {
            return {
              closestHandle: handle,
              closestDistance: distance,
            };
          }
        }

        return {
          closestHandle: closestHandle,
          closestDistance: closestDistance,
        };
      },
      {
        closestHandle: null,
        closestDistance: scale * scale,
      }
    ).closestHandle;
  }; // --------------------------------------------------------------------------
  // Display 2D
  // --------------------------------------------------------------------------
  publicAPI.setText = function (text) {
    model.widgetState.getText().setText(text);

    model._interactor.render();
  };
  publicAPI.setDisplayCallback = function (callback) {
    return model.representations[0].setDisplayCallback(callback);
  }; // --------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------

  publicAPI.setResetAfterPointPlacement =
    model._factory.setResetAfterPointPlacement;
  publicAPI.getResetAfterPointPlacement =
    model._factory.getResetAfterPointPlacement;
  publicAPI.setResetAfterPointPlacement(
    publicAPI.getResetAfterPointPlacement()
  );
  publicAPI.setFreehandMinDistance = model._factory.setFreehandMinDistance;
  publicAPI.getFreehandMinDistance = model._factory.getFreehandMinDistance;
  publicAPI.setFreehandMinDistance(publicAPI.getFreehandMinDistance());
  publicAPI.setAllowFreehand = model._factory.setAllowFreehand;
  publicAPI.getAllowFreehand = model._factory.getAllowFreehand;
  publicAPI.setAllowFreehand(publicAPI.getAllowFreehand());
  publicAPI.setDefaultCursor = model._factory.setDefaultCursor;
  publicAPI.getDefaultCursor = model._factory.getDefaultCursor;
  publicAPI.setDefaultCursor(publicAPI.getDefaultCursor()); // --------------------------------------------------------------------------

  publicAPI.setHandleSizeInPixels = function (size) {
    model._factory.setHandleSizeInPixels(size);

    updateHandlesSize();
  };

  publicAPI.getHandleSizeInPixels = model._factory.getHandleSizeInPixels;
  publicAPI.setHandleSizeInPixels(model._factory.getHandleSizeInPixels()); // set initial value
  // --------------------------------------------------------------------------

  publicAPI.setResolution = function (resolution) {
    model._factory.setResolution(resolution);

    model.representations[1].setResolution(resolution);
  };

  publicAPI.setResolution(model._factory.getResolution()); // set initial value
  // --------------------------------------------------------------------------

  publicAPI.getPoints = function () {
    return model.representations[1].getOutputData().getPoints().getData();
  }; // --------------------------------------------------------------------------

  publicAPI.reset = function () {
    model.widgetState.clearHandleList();
    model.lastHandle = null;
    model.firstHandle = null;
  }; // --------------------------------------------------------------------------
  // Right click: Delete handle
  // --------------------------------------------------------------------------
  // 获取面积area

  publicAPI.handleRightButtonPress = function (e) {
    // 开始设置关闭状态即可

    // const origin = model.moveHandle.getOrigin();
    // const originNew = [
    //   origin[0] + 0.00000001 * origin[0],
    //   origin[1] + 0.00000001 * origin[1],
    //   origin[2] + 0.00000001 * origin[2],
    // ];
    // model.moveHandle.setOrigin(originNew);
    // model.lastHandle = model.moveHandle;
    if (
      !model.activeState ||
      !model.activeState.getActive() ||
      !model.pickable
    ) {
      return macro.VOID;
    }
    const handle = model.widgetState.addHandle();
    handle.setOrigin(model.moveHandle.getOrigin());
    if (model.widgetState.getHandleList().length >= 3) {
      publicAPI.invokeEndInteractionEvent();
      // addPoint();

      publicAPI.loseFocus();
      // model.moveHandle.setVisible(true);

      // if (publicAPI.getResetAfterPointPlacement()) {
      //   publicAPI.reset();
      // } else {

      // }
    } else {
      // 触发正常更新事件
      publicAPI.invokeStartInteractionEvent();
      publicAPI.invokeInteractionEvent();
    }
    // if (
    //   !model.activeState ||
    //   !model.activeState.getActive() ||
    //   !model.pickable
    // ) {
    //   return macro.VOID;
    // }

    // if (model.activeState !== model.moveHandle) {
    //   model._interactor.requestAnimation(publicAPI);

    //   model.activeState.deactivate();
    //   model.widgetState.removeHandle(model.activeState);
    //   model.activeState = null;

    //   model._interactor.cancelAnimation(publicAPI);
    // } else {
    //   const handle = getHoveredHandle();

    //   if (handle) {
    //     model.widgetState.removeHandle(handle);
    //   } else if (model.lastHandle) {
    //     model.widgetState.removeHandle(model.lastHandle);
    //     const handles = model.widgetState.getHandleList();
    //     model.lastHandle = handles[handles.length - 1];
    //   }
    // }

    // publicAPI.invokeInteractionEvent();
    // return macro.EVENT_ABORT;
  };

  // --------------------------------------------------------------------------
  // Left press: Add new point
  // --------------------------------------------------------------------------
  publicAPI.handleLeftButtonPress = function (e) {
    if (
      !model.activeState ||
      !model.activeState.getActive() ||
      !model.pickable
    ) {
      return macro.VOID;
    }
    if (model.activeState === model.moveHandle) {
      if (model.widgetState.getHandleList().length === 0) {
        addPoint();
      } else {
        const hoveredHandle = getHoveredHandle();
        if (hoveredHandle && !model.keysDown.Control) {
          model.moveHandle.deactivate();
          model.moveHandle.setVisible(false);
          model.activeState = hoveredHandle;
          hoveredHandle.activate();
          model._isDragging = true;
          model.lastHandle.setVisible(true);
        } else {
          addPoint();
        }
      }

      model.freeHand = publicAPI.getAllowFreehand() && !model._isDragging;
    } else if (model.dragable) {
      model._isDragging = true;

      model._apiSpecificRenderWindow.setCursor("grabbing");

      model._interactor.requestAnimation(publicAPI);
    }

    publicAPI.invokeStartInteractionEvent();
    return macro.EVENT_ABORT;
  };

  // --------------------------------------------------------------------------
  // Left release
  // --------------------------------------------------------------------------

  publicAPI.handleLeftButtonRelease = function (e) {
    if (model._isDragging) {
      if (!model.hasFocus) {
        model._apiSpecificRenderWindow.setCursor(model.defaultCursor);

        model.widgetState.deactivate();

        model._interactor.cancelAnimation(publicAPI);

        publicAPI.invokeEndInteractionEvent();
      } else {
        let _model$moveHandle;

        (_model$moveHandle = model.moveHandle).setOrigin.apply(
          _model$moveHandle,
          _toConsumableArray(model.activeState.getOrigin())
        );

        model.activeState.deactivate();
        model.moveHandle.activate();
        model.activeState = model.moveHandle;

        if (!model.draggedPoint) {
          if (
            vec3.squaredDistance(
              model.moveHandle.getOrigin(),
              model.lastHandle.getOrigin()
            ) <
              model.moveHandle.getScale1() * model.moveHandle.getScale1() ||
            vec3.squaredDistance(
              model.moveHandle.getOrigin(),
              model.firstHandle.getOrigin()
            ) <
              model.moveHandle.getScale1() * model.moveHandle.getScale1()
          ) {
            model.lastHandle.setVisible(true);
            publicAPI.invokeEndInteractionEvent();

            if (publicAPI.getResetAfterPointPlacement()) {
              publicAPI.reset();
            } else {
              publicAPI.loseFocus();
            }
          }
        }

        model._interactor.render();
      }
    } else if (model.activeState !== model.moveHandle) {
      model.widgetState.deactivate();
    }

    model.freeHand = false;
    model.draggedPoint = false;
    model._isDragging = false;
    return model.hasFocus ? macro.EVENT_ABORT : macro.VOID;
  }; // --------------------------------------------------------------------------
  // Mouse move: Drag selected handle / Handle follow the mouse
  // --------------------------------------------------------------------------

  publicAPI.handleMouseMove = function (callData) {
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

    if (
      !manipulator ||
      !model.activeState ||
      !model.activeState.getActive() ||
      !model.pickable
    ) {
      return macro.VOID;
    }
    const worldCoords = manipulator.handleEvent(
      callData,
      model._apiSpecificRenderWindow
    );
    const hoveredHandle = getHoveredHandle();

    if (hoveredHandle) {
      model.moveHandle.setVisible(false);

      if (hoveredHandle !== model.firstHandle) {
        model._apiSpecificRenderWindow.setCursor("grabbing");
      }
    } else if (!model._isDragging && model.hasFocus) {
      model.moveHandle.setVisible(true);

      model._apiSpecificRenderWindow.setCursor(model.defaultCursor);
    }

    if (model.lastHandle) {
      model.lastHandle.setVisible(true);
    }

    if (
      worldCoords.length &&
      (model._isDragging || model.activeState === model.moveHandle)
    ) {
      model.activeState.setOrigin(worldCoords);
      publicAPI.invokeInteractionEvent();
      if (model._isDragging) {
        model.draggedPoint = true;
      }

      if (model.freeHand && model.activeState === model.moveHandle) {
        addPoint();
      }
    }

    return model.hasFocus ? macro.EVENT_ABORT : macro.VOID;
  }; // --------------------------------------------------------------------------
  // Mofifier keys
  // --------------------------------------------------------------------------

  publicAPI.handleKeyDown = function (_ref2) {
    const key = _ref2.key;
    model.keysDown[key] = true;

    if (!model.hasFocus) {
      return;
    }

    if (key === "Enter") {
      if (model.widgetState.getHandleList().length > 0) {
        publicAPI.invokeEndInteractionEvent();

        if (publicAPI.getResetAfterPointPlacement()) {
          publicAPI.reset();
        } else {
          publicAPI.loseFocus();
        }
      }
    } else if (key === "Escape") {
      publicAPI.reset();
      publicAPI.loseFocus();
      publicAPI.invokeEndInteractionEvent();
    } else if (key === "Delete" || key === "Backspace") {
      if (model.lastHandle) {
        model.widgetState.removeHandle(model.lastHandle);
        const handleList = model.widgetState.getHandleList();
        model.lastHandle = handleList[handleList.length - 1];
      }
    }
  }; // --------------------------------------------------------------------------

  publicAPI.handleKeyUp = function (_ref3) {
    const key = _ref3.key;
    model.keysDown[key] = false;
  }; // --------------------------------------------------------------------------
  // Focus API - modeHandle follow mouse when widget has focus
  // --------------------------------------------------------------------------

  publicAPI.grabFocus = function () {
    if (!model.hasFocus) {
      model.activeState = model.moveHandle;
      model.activeState.activate();
      model.activeState.setVisible(true);

      model._interactor.requestAnimation(publicAPI);

      updateHandlesSize();
    }

    model.hasFocus = true;
  }; // --------------------------------------------------------------------------

  publicAPI.loseFocus = function () {
    if (model.hasFocus) {
      model._interactor.cancelAnimation(publicAPI);
    }

    model.widgetState.deactivate();
    model.moveHandle.deactivate();
    model.moveHandle.setVisible(false);
    model.activeState = null;

    model._interactor.render();

    model.hasFocus = false;
  };

  publicAPI.widgetCompleted = function () {
    return model.activeState !== model.widgetState.getMoveHandle();
  };
}

export { widgetBehavior as default };
