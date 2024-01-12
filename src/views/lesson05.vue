<template>
    <canvas ref="canvas" class="canvas" width="400" height="600"></canvas>
</template>
  
  <script lang="ts" setup>
  // 可以改变视图里面的鼠标点击颜色
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
          attribute vec4 a_Position;
          void main() {
              gl_Position = a_Position;
              gl_PointSize = 10.0;
          }
        `;
    var FSHADER_SOURCE = `
          precision mediump float;
          uniform vec4 u_Color;
          void main() {
              gl_FragColor = u_Color;
          }
        `;
  //   webgl?.viewport(0, 0, ctx.clientWidth, ctx.clientHeight);
    initShaders(webgl, VSHADRE_SOURCE, FSHADER_SOURCE);
    // 开始赋予变量这个值即可
    const a_Position = webgl?.getAttribLocation(webgl.program, 'a_Position')
    const u_Color = webgl?.getUniformLocation(webgl.program,'u_Color')
    // 需要将当前的位置信息可以设置为鼠标的事件里面即可
    let colors = [1.0,1.0,1.0,1.0]
    ctx.onmousedown = (ev:MouseEvent) => {
    // 开始获取这个位置信息
    const x = ev.clientX
    const y = ev.clientY;
    // cavans的视图大小
    const rect = (ev.target as HTMLElement).getBoundingClientRect();
    // 开始计算在webGL中的位置了
    const webGLX = (x - rect.left - rect.width/2)/(rect.width/2)
    const webGLY = ( (rect.height)/2 - (y - rect.top))/(rect.height/2)
    // 修改position的位置信息
    webgl?.vertexAttrib3f(a_Position, webGLX,webGLY,0.0)
    
    if(webGLX >= 0.0 && webGLY >=0.0) { 
        colors = [1.0,0.0,0.0,1.0]
    }else if(webGLX < 0.0 && webGLY <0.0) {
        colors = [0.0,0.0,1.0,1.0]
    }
    webgl?.uniform4f(u_Color, colors[0], colors[1], colors[2], colors[3])
    webgl?.clearColor(0, 0, 0, 1);
    webgl?.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.POINTS,0, 1) // position and count
}
    webgl?.vertexAttrib3f(a_Position, 1.0,1.0,0.0)
    webgl?.uniform4f(u_Color, colors[0], colors[1], colors[2], colors[3])
    webgl?.clearColor(0, 0, 0, 1);
    webgl?.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.POINTS,0, 1) // position and count
  });
  </script>
  
  <style>
      .canvas {
          width: 600px;
          height: 600px;
      }
  </style>
  