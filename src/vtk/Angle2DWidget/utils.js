import vtkMath from "@kitware/vtk.js/Common/Core/Math/index.js";
const {
  subtract,
  angleBetweenVectors,
} = vtkMath;
export function calculateAngle(point1Origin, point2Origin, point3Origin) {
  const vec1 = [0, 0, 0];
  const vec2 = [0, 0, 0];
  subtract(point1Origin, point2Origin, vec1);
  subtract(point3Origin, point2Origin, vec2);
  return ((angleBetweenVectors(vec1, vec2) * 180) / Math.PI).toFixed(1);
}
