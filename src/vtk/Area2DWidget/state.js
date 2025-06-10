import vtkStateBuilder from "@/vtk.js/Widgets/Core/StateBuilder.js";
import { splineKind } from "@/vtk.js/Common/DataModel/Spline3D/Constants.js";
import { BoundaryCondition } from "@/vtk.js/Common/DataModel/Spline1D/Constants.js";

function generateState() {
  return vtkStateBuilder
    .createBuilder()
    .addField({
      name: "splineKind",
      initialValue: splineKind.KOCHANEK_SPLINE,
    })
    .addField({
      name: "splineClosed",
      initialValue: true,
    })
    .addField({
      name: "splineBoundaryCondition",
      initialValue: BoundaryCondition.DEFAULT,
    })
    .addField({
      name: "splineBoundaryConditionValues",
      initialValue: [0, 0, 0],
    })
    .addField({
      name: "splineTension",
      initialValue: 0,
    })
    .addField({
      name: "splineContinuity",
      initialValue: 0,
    })
    .addField({
      name: "splineBias",
      initialValue: 0,
    })
    .addStateFromMixin({
      labels: ["moveHandle"],
      mixins: ["origin", "color", "scale1", "visible", "manipulator"],
      name: "moveHandle",
      initialValues: {
        scale1: 50,
        origin: DEF_ORIGIN,
        visible: false,
      },
    })
    .addDynamicMixinState({
      labels: ["handles"],
      mixins: ["origin", "color", "scale1", "visible", "manipulator"],
      name: "handle",
      initialValues: {
        scale1: 50,
        origin: DEF_ORIGIN,
        visible: true,
      },
    })
    .build();
}

const DEF_ORIGIN = [0, 0, 0];
export { generateState as default, DEF_ORIGIN };
