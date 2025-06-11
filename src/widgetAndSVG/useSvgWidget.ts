import vtkInteractorObserver from "@kitware/vtk.js/Rendering/Core/InteractorObserver";
import {
  bindSVGRepresentation,
  makeListenableSVGNode,
} from "./SnabbdomHelpers.js";
import vtkMath from "@kitware/vtk.js/Common/Core/Math";
import {
  calculateAngle,
  getRadius,
  calculateRotate,
  getTextPoint,
} from "./angle";
import type { Vector2, Vector3 } from "@kitware/vtk.js/types.js";
import { createPathLine } from '@/vtk/CurveWidget/helper.js'
const { computeWorldToDisplay, computeDisplayToWorld } = vtkInteractorObserver;

/**
 * 计算二维线段的中点及其垂线端点
 * @param {Number[]} a - 起点坐标 [x1, y1]
 * @param {Number[]} b - 终点坐标 [x2, y2]
 * @param {Number} d - 垂线长度
 * @returns {Object} 包含中点和垂线端点的对象
 */
function calculatePerpendicularLine(a: Vector2, b: Vector2, d: number) {
  // 转换为三维向量处理
  const a3d: Vector3 = [a[0], a[1], 0];
  const b3d: Vector3 = [b[0], b[1], 0];

  // 1. 计算中点
  const midPoint: Vector3 = [0, 0, 0];
  vtkMath.add(a3d, b3d, midPoint);
  vtkMath.multiplyScalar(midPoint, 0.5);

  // 2. 计算方向向量
  const direction: Vector3 = [0, 0, 0];
  vtkMath.subtract(b3d, a3d, direction);

  // 3. 计算垂直方向向量（逆时针90度旋转）
  const orthogonal: Vector3 = [-direction[1], direction[0], 0];

  // 4. 归一化并计算偏移量
  const normalized: Vector3 = [...orthogonal];
  const length = vtkMath.norm(normalized);

  if (length === 0) {
    return {
      midpoint: midPoint.slice(0, 2),
      points: null, // 重合点无法计算垂线
    };
  }

  vtkMath.normalize(normalized);
  const offset = vtkMath.multiplyScalar(normalized, d / 2, []);

  // 5. 计算垂线端点
  const p1 = vtkMath.add(midPoint, offset, []);
  const p2 = vtkMath.subtract(midPoint, offset, []);

  return {
    midpoint: midPoint.slice(0, 2),
    points: [p1.slice(0, 2), p2.slice(0, 2)],
  };
}
const spanTextStyle = {
  position: "absolute",
  fontSize: "14px",
  cursor: "pointer",
  color: "#00ff00",
  zIndex: 1,
  // backgroundColor: "white",
  // padding: "2px 5px",
  // border: "1px solid black",
  // borderRadius: "4px",
  pointerEvents: "auto",
};
// 创建文本标签的函数
const createSVGLabel = (
  textProps: {
    [key: string]: string;
  },
  polyLineStart: Vector2,
  endPoints: Vector2
) => {
  const dashedLine = {
    key: "dashedLine",
    attrs: {
      stroke: "#82ff82", // 默认的颜色
      fill: "none",
      "stroke-dasharray": "2 2",
      points: `${polyLineStart[0]},${polyLineStart[1]} ${endPoints[0] + 10},${endPoints[1] + 10
        }`,
    },
  };
  Object.keys(textProps || {}).forEach(
    (prop) =>
      // text.setAttribute(prop, textProps[prop])
      (dashedLine.attrs[prop] = textProps[prop])
  );
  return dashedLine;
};
const createCircleSVG = (
  textProps: {
    [key: string]: string;
  },
  circleStartPoints: Vector2,
  h: any
) => {
  const dashedLine = {
    key: "circle",
    attrs: {
      stroke: "#82ff82", // 默认的颜色
      fill: "none",
      cx: circleStartPoints[0],
      cy: circleStartPoints[1],
      r: 5
    },
  };
  Object.keys(textProps || {}).forEach(
    (prop) =>
      // text.setAttribute(prop, textProps[prop])
      (dashedLine.attrs[prop] = textProps[prop])
  );
  return h("circle", dashedLine);
};
const createPolyLineSVG = (
  textProps: {
    [key: string]: string;
  },
  points: Vector2,
  h: any
) => {
  const lineString = points.map((item: Vector2) => `${item[0]},${item[1]}`).join(" ");

  const dashedLine = {
    key: "polyLine",
    attrs: {
      stroke: "#82ff82", // 默认的颜色
      points: lineString,
      fill: 'none',
      "stroke-width": 1,
    },
  };
  Object.keys(textProps || {}).forEach(
    (prop) =>
      // text.setAttribute(prop, textProps[prop])
      (dashedLine.attrs[prop] = textProps[prop])
  );
  return h("polyline", dashedLine);
};
const createArcSVG = (
  textProps: {
    [key: string]: string;
  },
  angle: number,
  radius: number,
  rotate: any,
  circleStartPoints: Vector2,
  h: any
) => {
  const dashedLine = {
    key: "circleArc",
    attrs: {
      stroke: "#82ff82", // 默认的颜色
      fill: "transparent",
      cx: circleStartPoints[0],
      cy: circleStartPoints[1],
      r: radius,
      "stroke-dasharray": `${(Math.PI * radius * 2 * angle) / 360}, ${(Math.PI * radius * 2 * (360 - angle)) / 360
        }`,
      transform: `rotate(${rotate.angle} ${rotate.x} ${rotate.y})`,
    },
  };
  Object.keys(textProps || {}).forEach(
    (prop) =>
      // text.setAttribute(prop, textProps[prop])
      (dashedLine.attrs[prop] = textProps[prop])
  );
  return h("circle", dashedLine);
};
const createCurveSVG = (
  textProps: {
    [key: string]: string;
  },
  points: Vector2,
  h: any
) => {
  const str = createPathLine(points)
  const dashedLine = {
    key: "curveLine",
    attrs: {
      stroke: "#82ff82", // 默认的颜色
      fill: "transparent",
      d: str
    },
  };
  Object.keys(textProps || {}).forEach(
    (prop) =>
      // text.setAttribute(prop, textProps[prop])
      (dashedLine.attrs[prop] = textProps[prop])
  );
  return h("path", dashedLine);
}
const createCrossLineSVG = (textProps: {
  [key: string]: string;
},
  points: Array<Vector2>,
  h: any) => {
  let str = ``
  const p0 = points[0];
  const p1 = points[1];
  if (p0 && p1) {
    for (let i = 0; i < points.length; i++) {
      // 画双向线
      const coord: Vector2 = points[i];
      if (i % 2 === 0 && i < 3) {
        const nextCoord = points[i + 1];
        if (!nextCoord) continue;
        console.log("----coord", i, i+1, coord, nextCoord);
        
        str += `M ${coord[0]} ${coord[1]} L ${nextCoord[0]} ${nextCoord[1]} `;
        // const lineProps = {
        //   ...model.lineProps,
        //   x1: coord[0],
        //   y1: winHeight - coord[1],
        //   x2: nextCoord[0],
        //   y2: winHeight - nextCoord[1],
        // };

      }
    }
  }

  const dashedLine = {
    key: "crossLine",
    attrs: {
      stroke: "#82ff82", // 默认的颜色
      fill: "transparent",
      d: str
    },
  };
  Object.keys(textProps || {}).forEach(
    (prop) =>
      // text.setAttribute(prop, textProps[prop])
      (dashedLine.attrs[prop] = textProps[prop])
  );
  return h("path", dashedLine);
}
// 动态计算偏移量dx和dy的函数
const computeDxAndDy = (coords: Array<Vector2>) => {
  const coords2d = coords[0];
  if (coords2d) {
    if (Number.isNaN(coords2d[0])) {
      coords2d[0] = 0;
    }
    let dx = 0;
    let dy = 1;
    if (coords.length === 1) {
      dx = 1; // put text in top-right
    }
    if (coords.length === 2) {
      // line widget
      const c1 = coords[1];
      if (c1[1] - coords2d[1] > 0) {
        dy = -1;
      }
    } else if (coords.length === 3) {
      // angle widget
      const c1 = coords[1];
      const c2 = coords[2];
      const v1 = normalize2([c1[0] - coords2d[0], c1[1] - coords2d[1]]);
      const v2 = normalize2([c2[0] - coords2d[0], c2[1] - coords2d[1]]);

      // negative bisector, defaulting to 1 if sign is 0
      dx = Math.sign(-(v1[0] + v2[0])) || 1;
      dy = Math.sign(-(v1[1] + v2[1])) || 1;
    }
    // canvas->svg inverts the Y coordinate
    dy *= -1;
    if (coords.length === 3) {
      text.setAttribute("x", (coords[0][0] + coords[1][0]) / 2);
      text.setAttribute("y", (coords[0][1] + coords[2][1]) / 2);
      text.setAttribute("dx", 0);
      text.setAttribute("dy", 0);
    } else {
      text.setAttribute("x", coords[0][0]);
      text.setAttribute("y", coords[0][1]);
      text.setAttribute("dx", dx);
      text.setAttribute("dy", dy);
    }
    const alignment = dy === 1 ? "hanging" : "baseline";
    const anchor = dx === 1 ? "start" : "end";
    text.setAttribute("alignment-baseline", alignment);
    text.setAttribute("text-anchor", anchor);

    // text.textContent = model.text;
  }
};
export const useWidgetAndSVG = ({ widgetManager }: any) => {
  // 初始化 Snabbdom
  let isDragging = false;
  const millimeter = "mm";
  const degree = "°";
  const squareMillimeter = "mm²";
  let polyLineStart: Vector2 = [0, 0]
  let endPoints: Vector2 = [0, 0]
  const setWidgetSVG = (opts: any) => {
    const { widget, renderer, handle } = opts;
    const data = {
      size: [],
      widgetType: "", // widget类型
      widgetId: "", // widget唯一标识
      textOffsetX: 0, // 偏移量X
      textOffsetY: 0, // 偏移量Y
      text: "", // 文本内容
      handleList: [], // 处理器列表
      coords: [], // 坐标列表
      origin: [], // 三维坐标点
      displayWorld2: 0, // 默认的世界坐标系
    };
    return bindSVGRepresentation(renderer, widget.getWidgetState(), {
      mapState(widgetState: any, { size }: any) {
        data.coords = [];
        data.handleList = [];
        data.textOffsetX = data.textOffsetX || 0;
        data.textOffsetY = data.textOffsetY || 0;
        data.size = size;
        if (!handle.getVisibility()) return data;
        // console.log("---widgetState", widgetState);
        const handleList = widgetState.getHandleList(); // [widgetState.getHandle1(), widgetState.getHandle2()];
        // 获取的是2D的坐标点位
        handleList.forEach((item: any) => {
          const origin = item.getOrigin();
          if (origin) {
            const coords = computeWorldToDisplay(renderer, ...origin);
            data.displayWorld2 = origin[2]; // 获取世界坐标系
            data.coords.push([coords[0], size[1] - coords[1]]);
            // console.log("######## coords ########", coords, size);
          }
        });

        const moveOrigin = widgetState.getMoveHandle().getOrigin();
        // console.log(")))))))) moveOrigin ))))))))", moveOrigin);
        if (moveOrigin) {
          const moveCoords = computeWorldToDisplay(renderer, ...moveOrigin);
          data.coords.push([moveCoords[0], size[1] - moveCoords[1]]);
        }
        return data;
      },
      render(data: any, h: any) {
        const nodes: any[] = [];
        const labels: any[] = [];
        // 开始创建polyline 和circle
        data.coords.forEach((coord: Vector2, index: number) => {
          // 创建圆形SVG
          nodes.push(createCircleSVG({},
            coord, h))
        })
        if (
          widget.getClassName() === "vtkDistanceWidget" ||
          widget.getClassName() === "vtkPolyLineWidget" ||
          widget.getClassName() === 'vtkAngleWidget' ||
          widget.getClassName() === "vtkSplineWidget"
        ) {
          nodes.push(createPolyLineSVG({}, data.coords, h))
        }
        if (widget.getClassName() === "vtkCurveWidget") {
          nodes.push(createCurveSVG({}, data.coords, h))
        }
        if (widget.getClassName() === "vtkBirectionalWidget") {
          nodes.push(createCrossLineSVG({}, data.coords, h))
        }
        // 
        if (!handle.getVisibility()) return { nodes, labels };
        if (!data || data.coords.length < 2) return { nodes, labels };
        const [x1, y1] = data.coords[0];
        const [x2, y2] = data.coords[1];

        // let endPoints: Vector2 = [x2, y2];
        if (
          widget.getClassName() === "vtkDistanceWidget" ||
          widget.getClassName() === "vtkPolyLineWidget"
        ) {
          // 统一封装了测量类的获取距离的数据
          data.text = widget?.getMeasure().toFixed(2) + millimeter;
          polyLineStart = [(x1 + x2) / 2, (y1 + y2) / 2];
          endPoints = [polyLineStart[0] + 20, polyLineStart[1] - 40];

        }
        if (widget.getClassName() === "vtkSplineWidget") {
          data.text = widget?.getMeasure().toFixed(2) + squareMillimeter;
          polyLineStart = [(x1 + x2) / 2, (y1 + y2) / 2];
          endPoints = [polyLineStart[0] + 20, polyLineStart[1] - 40];
        }
        if (
          widget.getClassName() === "vtkBirectionalWidget" ||
          widget.getClassName() === "vtkCurveWidget"
        ) {
          data.text = widget?.getMeasure() + millimeter;
          polyLineStart = [(x1 + x2) / 2, (y1 + y2) / 2];
          endPoints = [polyLineStart[0] + 20, polyLineStart[1] - 40];
        }
        if (widget.getClassName() === "vtkAngleWidget") {
          // 说明是当前的角度测量
          if (data.coords.length === 3) {
            const coords1th = [...data.coords[0], 0];
            const coords2th = [...data.coords[1], 0];
            const coords3th = [...data.coords[2], 0];
            // 判断当前的坐标是否为三个点
            const angle = calculateAngle(
              coords1th as Vector3,
              coords2th as Vector3,
              coords3th as Vector3
            );
            // console.log("---angle", angle);
            const radius = getRadius(
              coords1th as Vector3,
              coords2th as Vector3,
              coords3th as Vector3
            );
            // console.log("---radius", radius);
            const rotate = calculateRotate(coords1th, coords2th, coords3th);
            // console.log("----rotate", rotate);
            const textPoint = getTextPoint(
              radius,
              rotate.angle,
              angle,
              coords2th
            );
            nodes.push(createArcSVG({}, angle, radius, rotate, [coords2th[0], coords2th[1]], h))
            data.text = widget?.getMeasure() + degree;
            // console.log("----textPoint", textPoint);
            endPoints = [textPoint.x, textPoint.y];
            polyLineStart = [textPoint.x, textPoint.y];
          }
          if (data.coords.length < 3) {
            return { nodes, labels }
          }
        }

        if (!endPoints) return { nodes, labels };
        if (widget.get()?.labelOrigin) {
          // 表示有了新的设置坐标
          const labelOrigin = widget.get()?.labelOrigin;
          const displayCoord = computeWorldToDisplay(renderer, ...labelOrigin);
          endPoints = [displayCoord[0], data.size[1] - displayCoord[1]];
        }
        data.textOffsetX = endPoints[0]; // 更新偏移量
        data.textOffsetY = endPoints[1]; // 更新偏移量
        const dashedLine = createSVGLabel({}, polyLineStart, endPoints);
        const dashedlineH = h("polyline", dashedLine);
        nodes.push(dashedlineH);
        const spanText = h(
          "span",
          {
            style: {
              ...spanTextStyle,
              left: `${endPoints[0] / window.devicePixelRatio}px`,
              top: `${endPoints[1] / window.devicePixelRatio}px`,
              cursor: "pointer",
              pointerEvents:
                handle?.widgetCompleted && !handle?.widgetCompleted?.()
                  ? "none"
                  : "auto",
            },
            on: {
              mousedown: (event: MouseEvent) => {
                isDragging = true;
                const startX = event.clientX;
                const startY = event.clientY;
                const initialOffsetX = data.textOffsetX || 0;
                const initialOffsetY = data.textOffsetY || 0;

                const handleMouseMove = (event: MouseEvent) => {
                  event.stopPropagation();
                  event.preventDefault();

                  if (isDragging) {
                    const dx = event.clientX - startX;
                    const dy = event.clientY - startY;
                    data.textOffsetX = initialOffsetX + dx;
                    data.textOffsetY = initialOffsetY + dy;

                    // 边界检查
                    if (data.textOffsetX <= 0) data.textOffsetX = 0;
                    if (data.textOffsetY <= 0) data.textOffsetY = 0;
                    if (data.textOffsetX >= data.size[0] - 30)
                      data.textOffsetX = data.size[0] - 30;
                    if (data.textOffsetY >= data.size[1] - 30)
                      data.textOffsetY = data.size[1] - 30;

                    // 更新标签位置
                    const origin = computeDisplayToWorld(
                      renderer,
                      data.textOffsetX,
                      data.size[1] - data.textOffsetY,
                      data.displayWorld2
                    );

                    widget.set(
                      {
                        labelOrigin: origin,
                      },
                      true
                    );

                    const widgetState = widget.getWidgetState();
                    widgetState.modified();
                  }
                };

                const handleMouseUp = () => {
                  isDragging = false;

                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
              },
            },
          },
          data.text
        );
        labels.push(spanText);
        return { nodes, labels };
      },
    });
  };

  // 删除widget
  const removeWidgetAndSVG = (obj: any) => {
    const { widgetId } = obj;
    widgetManager = widgetManager || obj.widgetManager;
    const widgetList = widgetManager.getWidgets();
    widgetList.forEach((widget: any) => {
      const id = widget.get()?.widgetId;
      if (id && +id === widgetId) {
        // 清除svg
        widget?.get()?.cleanSVG?.();
        // 移除widget
        widgetManager.removeWidget(widget);
      }
    });
  };

  // 显示隐藏widget
  const showOrHideWidgetAndSVG = (obj: any) => {
    const { widgetId, isShow } = obj;
    widgetManager = widgetManager || obj.widgetManager;
    const widgetList = widgetManager.getWidgets();
    widgetList.forEach((widget: any) => {
      const id = widget.get()?.widgetId;
      if (id && +id === widgetId) {
        const visibility =
          isShow === undefined ? widget.getVisibility() : isShow;
        widget.setVisibility(!visibility);
        // 触发widgetstate 的更新，保证svg 更新
        widget.getWidgetState().modified();
        widget.getInteractor().render();
      }
    });
  };
  return {
    setWidgetSVG,
    removeWidgetAndSVG,
    showOrHideWidgetAndSVG,
  };
};
