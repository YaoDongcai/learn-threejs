// 对于角度的一些计算
import {
  subtract,
  angleBetweenVectors,
  radiansFromDegrees,
} from "@kitware/vtk.js/Common/Core/Math";
import type { Vector2, Vector3 } from "@kitware/vtk.js/types";

// 根据三个坐标点确定角度
export function calculateAngle(
  point1: Vector3,
  point2: Vector3,
  point3: Vector3
): number {
  // console.log("------coords", point1, point2, point3);
  const vec1: Vector3 = [0, 0, 0];
  const vec2: Vector3 = [0, 0, 0];
  subtract(point1, point2, vec1);
  subtract(point3, point2, vec2);
  const result: number = (
    (angleBetweenVectors(vec1, vec2) * 180) /
    Math.PI
  ).toFixed(1);
  return result;
}

// 计算两个点的二维平面距离
export function distance2BetweenPoints(p1: Vector3, p2: Vector3) {
  return Math.sqrt(
    (p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1])
  );
}

// 计算动态半径
export function getRadius(point1: Vector3, point2: Vector3, point3: Vector3) {
  const distance1 = distance2BetweenPoints(point1, point2);
  const distance2 = distance2BetweenPoints(point3, point2);
  const minDistance = Math.min(distance1, distance2);
  return minDistance * 0.5;
}

// 根据旋转角度实时计算文字坐标点
export function getTextPoint(
  radius: number,
  rotateAngle: number,
  angle: number,
  point: Vector2
) {
  const x = radius * Math.cos(radiansFromDegrees(rotateAngle + angle / 2));
  const y = radius * Math.sin(radiansFromDegrees(rotateAngle + angle / 2));
  return {
    x: x + point[0],
    y: y + point[1],
  };
}

// 计算沿x轴正方向顺时针旋转的角度值
// x轴水平向右
// y轴垂直向下
export function calculateRotateAngle(startPoint: Vector2, endPoint: Vector2) {
  const x = startPoint[0];
  const y = startPoint[1];
  const x2 = endPoint[0];
  const y2 = endPoint[1];
  const diff_x = x2 - x;
  const diff_y = y2 - y;
  let angle = (180 * Math.atan(diff_y / diff_x)) / Math.PI;
  // 纠正线条的角度（坐标轴不同象限）
  if (diff_x < 0) {
    angle += 180;
  } else if (diff_y < 0) {
    angle += 360;
  }
  return angle;
}
export function calculateRotate(
  point1: Vector2,
  point2: Vector2,
  point3: Vector2
) {
  const startAngle = calculateRotateAngle(point2, point1);
  const endAngle = calculateRotateAngle(point2, point3);
  return {
    angle:
      (endAngle - startAngle <= 0 && endAngle - startAngle >= -180) ||
      (endAngle - startAngle >= 180 && endAngle - startAngle <= 360)
        ? endAngle
        : startAngle,
    x: point2[0],
    y: point2[1],
  };
}
