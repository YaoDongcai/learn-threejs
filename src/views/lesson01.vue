<template>
  <canvas ref="canvas" id="canvas" width="100" height="100" ></canvas>
</template>


<script lang="ts" setup>
import { ref, onMounted } from 'vue'
 const canvas = ref()
onMounted(() => {
    // 绘制一个黑色背景的webGL
    const ctx = canvas.value as HTMLCanvasElement;
    const webgl = ctx.getContext("webgl") as WebGLRenderingContext;
    webgl?.viewport(0,0, ctx.clientWidth, ctx.clientHeight)
    webgl?.clearColor(0,0,0,1);
    webgl?.clear(webgl.COLOR_BUFFER_BIT)
})
</script>