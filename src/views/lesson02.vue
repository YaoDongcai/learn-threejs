<template>
  <canvas ref="canvas" class="canvas" width="100" height="100"></canvas>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { initShaders } from "../libs/initShaders";
const canvas = ref();
onMounted(() => {
  // 绘制一个黑色背景的webGL
  const ctx = canvas.value as HTMLCanvasElement;
  const webgl = ctx.getContext("webgl") as WebGLRenderingContext;
  //   webgl?.viewport(0,0, ctx.clientWidth, ctx.clientHeight)
  //   webgl?.clearColor(0,0,0,1);
  //   webgl?.clear(webgl.COLOR_BUFFER_BIT)
  var VSHADRE_SOURCE = `
        void main() {
            gl_Position = vec4(0.0,0.0,0.0,1.0);
            gl_PointSize = 50.0;
        }
      `;
  var FSHADER_SOURCE = `
        void main() {
            gl_FragColor = vec4(1.0,0.0,0.0,1.0);
        }
      `;
  

//   webgl?.viewport(0, 0, ctx.clientWidth, ctx.clientHeight);
  initShaders(webgl, VSHADRE_SOURCE, FSHADER_SOURCE);
  webgl?.clearColor(0, 0, 0, 1);
  
  webgl?.clear(webgl.COLOR_BUFFER_BIT);
  webgl.drawArrays(webgl.POINTS,0, 1) // position and count
});
</script>

<style>
    .canvas {
        width: 200px;
        height: 200px;
    }
</style>
