import vtkStateBuilder from "@kitware/vtk.js/Widgets/Core/StateBuilder.js";

const DEF_ORIGIN = [0, 0, 0];

function generateState() {
  return vtkStateBuilder
    .createBuilder()
    .addStateFromMixin({
      labels: ["moveHandle"],
      mixins: ["origin", "color", "scale1", "visible", "manipulator"],
      name: "moveHandle",
      initialValues: {
        // when scaleInPixels=true, the handles have 30px height
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

export { generateState as default, DEF_ORIGIN };
