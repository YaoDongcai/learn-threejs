import {
  subtract,
  add,
  normalize,
  norm,
  dot,
  cross,
  distance2BetweenPoints,
  multiplyAccumulate,
} from "@kitware/vtk.js/Common/Core/Math";

// 点c到直线ab的距离
function getDistanceOfPerpendicular(A, B, C) {
  const vectorCA = subtract(C, A, []);
  const vectorCB = subtract(C, B, []);
  const vectorcross = cross(vectorCA, vectorCB, []);
  // 向量积的长度是两向量组成的平行四边形面积，所以三角形面积除以2
  const areaABC = norm(vectorcross) / 2;

  const vectorAB = subtract(A, B, []);
  const distanceAB = norm(vectorAB);

  // 三角形面积=底边长 乘 高度
  return (areaABC / distanceAB) * 2;
}

// 计算垂足坐标
// 假设空间某点O的坐标为（Xo，Yo，Zo）,空间某条直线上两点A和B的坐标为：(X1,Y1,Z1),(X2，Y2，Z2),
// 设点O在直线AB上的垂足为点N，坐标为(Xn，Yn，Zn)。
function getFootOfPerpendicular(A, B, O) {
  const dx = A[0] - B[0];
  const dy = A[1] - B[1];
  const dz = A[2] - B[2];
  const EPS = 0.00000001;

  //  确保两个点不是同一个点
  if (Math.abs(dx) < EPS && Math.abs(dy) < EPS && Math.abs(dz) < EPS) {
    return A;
  }

  //计算斜率
  let u = (O[0] - A[0]) * dx + (O[1] - A[1]) * dy + (O[2] - A[2]) * dz;
  u = u / (Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

  return [A[0] + u * dx, A[1] + u * dy, A[2] + u * dz];
}

// 若垂足在线段的延长线上，则纠正垂足为线段的端点
function footOfPerpendicularAdaptEndpoint(A, B, N) {
  const out = [];
  const vectorNA = subtract(N, A, []);
  const vectorNB = subtract(N, B, []);
  if (dot(vectorNA, vectorNB) > 0) {
    // 点N在线段AB的延长线上
    if (norm(vectorNA) > norm(vectorNB)) {
      // 点N在线段AB的延长线上 靠近端点B
      out[0] = B[0];
      out[1] = B[1];
      out[2] = B[2];
    } else {
      // 点N在线段AB的延长线上 靠近端点A
      out[0] = A[0];
      out[1] = A[1];
      out[2] = A[2];
    }
  } else {
    // 点N在线段AB内
    out[0] = N[0];
    out[1] = N[1];
    out[2] = N[2];
  }
  return out;
}

// 若垂足在延长线上，纠正垂足为线段的端点时重新计算点O的坐标
function adaptDynamicPoint(A, B, O) {
  const out = [];
  // 获取垂足坐标点
  const N = getFootOfPerpendicular(A, B, O);
  // 若垂足在延长线上，适配垂足到线段的端点
  const N$ = footOfPerpendicularAdaptEndpoint(A, B, N);
  const vectorON = subtract(N, O, []);
  const distanceON = norm(vectorON);
  normalize(vectorON);
  // 单位向量 * 长度
  out[0] = N$[0] - vectorON[0] * distanceON;
  out[1] = N$[1] - vectorON[1] * distanceON;
  out[2] = N$[2] - vectorON[2] * distanceON;
  return out;
}

// 假设空间某点O的坐标为（Xo，Yo，Zo）,空间某条直线上两点A和B的坐标为：(X1,Y1,Z1),(X2，Y2，Z2),
// 设点O在直线AB上的垂足为点N，坐标为(Xn，Yn，Zn)。做线段ON以直线AB反转的O^N，求点O^
function getOppositePoint(A, B, O) {
  const N = getFootOfPerpendicular(A, B, O);
  const vectorON = subtract(N, O, []);
  const oppositePoint = multiplyAccumulate(O, vectorON, 2, []);
  return oppositePoint;
}

function getDynamicPointAndOppositePoint(A, B, O, oppositeDistance) {
  const O$ = adaptDynamicPoint(A, B, O);
  const N$ = getFootOfPerpendicular(A, B, O$);
  const vectorO$N$ = subtract(N$, O$, []);
  // 向量归一化
  normalize(vectorO$N$);
  // 单位向量 * 长度
  const oppositeP$ = multiplyAccumulate(N$, vectorO$N$, oppositeDistance, []);
  return {
    dynamicPoint: O$,
    oppositePoint: oppositeP$,
  };
}

function rotatePoint(O, oppositeP, oppositeDistance, distanceNC, distanceND) {
  const vector = subtract(O, oppositeP, []);
  // 归一化
  normalize(vector);
  // 单位向量vector的法向量，z平面为0
  const normalVector = [vector[1], -vector[0], 0];
  const normalVector2 = [-vector[1], vector[0], 0];
  const N = multiplyAccumulate(oppositeP, vector, oppositeDistance, []);

  let O$ = O;
  if (dot(subtract(O, N, []), subtract(oppositeP, N, [])) > 0) {
    O$ = N;
  }
  const C$ = multiplyAccumulate(N, normalVector2, distanceNC, []);
  const D$ = multiplyAccumulate(N, normalVector, distanceND, []);
  return [O$, C$, D$];
}

function getDistanceCross(points) {
  let distance1 = 0.0;
  let distance2 = 0.0;
  if (points[0] && points[1]) {
    distance1 = Math.sqrt(distance2BetweenPoints(points[0], points[1]));
  }
  if (points[2] && points[3]) {
    distance2 = Math.sqrt(distance2BetweenPoints(points[2], points[3]));
  }
  return `${distance1.toFixed(1)}x${distance2.toFixed(1)}`;
}

// 获取四个端点到垂足坐标点的距离
function getDistanceOfTerminalPointsToFootOfPerpendicular(A, B, C, D) {
  const N = getFootOfPerpendicular(A, B, C);
  const distanceNA = norm(subtract(N, A, []));
  const distanceNB = norm(subtract(N, B, []));
  const distanceNC = norm(subtract(N, C, []));
  const distanceND = norm(subtract(N, D, []));
  return [distanceNA, distanceNB, distanceNC, distanceND];
}

export {
  adaptDynamicPoint,
  getOppositePoint,
  getDistanceCross,
  rotatePoint,
  getFootOfPerpendicular,
  getDistanceOfPerpendicular,
  getDynamicPointAndOppositePoint,
  footOfPerpendicularAdaptEndpoint,
  getDistanceOfTerminalPointsToFootOfPerpendicular,
};
