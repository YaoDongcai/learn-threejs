<template>
    <div>
        <button @click="renderRect()" >绘制矩形</button>
        <button @click="renderTran()" >绘制三角形</button>
        <button @click="translate()">平移功能测试</button>
        <button @click="rotateTran()">旋转功能测试</button>
        
    </div>
    
    <canvas ref="canvas" class="canvas" width="400" height="600"></canvas>
</template>
  
  <script lang="ts" setup>
  // 利用buffer 绘制多个点
  import { ref, onMounted } from "vue";
  import { initShaders } from "../libs/initShaders";
  const canvas = ref();
  const rotateTran = () => {
    // 旋转三角形
    // 绘制一个黑色背景的webGL
    const ctx = canvas.value as HTMLCanvasElement;
    const webgl = ctx.getContext("webgl") as WebGLRenderingContext;
    //   webgl?.viewport(0,0, ctx.clientWidth, ctx.clientHeight)
    //   webgl?.clearColor(0,0,0,1);
    //   webgl?.clear(webgl.COLOR_BUFFER_BIT)
    var VSHADRE_SOURCE = `
          attribute vec4 a_Position;
          uniform mat4 u_formMatrix;
          void main() {
              gl_Position = u_formMatrix * a_Position;
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
    
    const vertices = new Float32Array([0.0,0.5, -0.5, -0.5,0.5,-0.5])
    // 开始创建缓存区
    const verticesBuffer = webgl.createBuffer();
    // 将缓冲区对象绑定到目标
    webgl.bindBuffer(webgl.ARRAY_BUFFER, verticesBuffer)
    // 向缓冲区对象中写入数据
    webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW)
    const angle = 90.0 // 旋转90度
    const radian = Math.PI * angle / 180.0;
    const cosB = Math.cos(radian);
    const sinB = Math.sin(radian)

    // 旋转矩阵
    const formMatrix = new Float32Array([
        cosB, sinB,0.0,0.0,
        -sinB,cosB, 0.0,0.0,
        0.0,0.0,1.0,0.0,
        0.0,0.0,0.0,1.0
    ])

    const u_formMatrix = webgl.getUniformLocation(webgl.program, 'u_formMatrix');
    webgl.uniformMatrix4fv(u_formMatrix, false, formMatrix)
    // 开始赋予变量这个值即可
    const a_Position = webgl?.getAttribLocation(webgl.program, 'a_Position')
    webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, 0,0 )
    webgl.enableVertexAttribArray(a_Position)
    const u_Color = webgl?.getUniformLocation(webgl.program,'u_Color')
    // 需要将当前的位置信息可以设置为鼠标的事件里面即可
    let colors = [1.0,0.0,0.0,1.0]

    webgl?.uniform4f(u_Color, colors[0], colors[1], colors[2], colors[3])
    webgl?.clearColor(0, 0, 0, 1);
    webgl?.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLES,0, 3) // position and count
  }
  const renderRect = () => {
    // 绘制矩形
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
    
    const vertices = new Float32Array([-0.5,0.5, -0.5, -0.5,0.5,0.5, 0.5,-0.5])
    // 开始创建缓存区
    const verticesBuffer = webgl.createBuffer();
    // 将缓冲区对象绑定到目标
    webgl.bindBuffer(webgl.ARRAY_BUFFER, verticesBuffer)
    // 向缓冲区对象中写入数据
    webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW)

    // 开始赋予变量这个值即可
    const a_Position = webgl?.getAttribLocation(webgl.program, 'a_Position')
    webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, 0,0 )
    webgl.enableVertexAttribArray(a_Position)
    const u_Color = webgl?.getUniformLocation(webgl.program,'u_Color')
    // 需要将当前的位置信息可以设置为鼠标的事件里面即可
    let colors = [1.0,0.0,0.0,1.0]
//     ctx.onmousedown = (ev:MouseEvent) => {
//     // 开始获取这个位置信息
//     const x = ev.clientX
//     const y = ev.clientY;
//     // cavans的视图大小
//     const rect = (ev.target as HTMLElement).getBoundingClientRect();
//     // 开始计算在webGL中的位置了
//     const webGLX = (x - rect.left - rect.width/2)/(rect.width/2)
//     const webGLY = ( (rect.height)/2 - (y - rect.top))/(rect.height/2)
//     // 修改position的位置信息
//     webgl?.vertexAttrib3f(a_Position, webGLX,webGLY,0.0)
    
//     if(webGLX >= 0.0 && webGLY >=0.0) { 
//         colors = [1.0,0.0,0.0,1.0]
//     }else if(webGLX < 0.0 && webGLY <0.0) {
//         colors = [0.0,0.0,1.0,1.0]
//     }
//     webgl?.uniform4f(u_Color, colors[0], colors[1], colors[2], colors[3])
//     webgl?.clearColor(0, 0, 0, 1);
//     webgl?.clear(webgl.COLOR_BUFFER_BIT);
//     webgl.drawArrays(webgl.POINTS,0, 1) // position and count
// }
    // webgl?.vertexAttrib3f(a_Position, 1.0,1.0,0.0)
    webgl?.uniform4f(u_Color, colors[0], colors[1], colors[2], colors[3])
    webgl?.clearColor(0, 0, 0, 1);
    webgl?.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLE_STRIP,0, 4) // position and count
  }
  const translate = () => {
    // 开始平移当前的功能
        // 绘制一个黑色背景的webGL
        const ctx = canvas.value as HTMLCanvasElement;
    const webgl = ctx.getContext("webgl") as WebGLRenderingContext;
    //   webgl?.viewport(0,0, ctx.clientWidth, ctx.clientHeight)
    //   webgl?.clearColor(0,0,0,1);
    //   webgl?.clear(webgl.COLOR_BUFFER_BIT)
    var VSHADRE_SOURCE = `
          attribute vec4 a_Position;
          uniform vec4 t_Position;
          void main() {
              gl_Position = a_Position + t_Position;
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
    
    const vertices = new Float32Array([0.0,0.5, -0.5, -0.5,0.5,-0.5])
    // 开始创建缓存区
    const verticesBuffer = webgl.createBuffer();
    // 将缓冲区对象绑定到目标
    webgl.bindBuffer(webgl.ARRAY_BUFFER, verticesBuffer)
    // 向缓冲区对象中写入数据
    webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW)

    // 开始赋予变量这个值即可
    const a_Position = webgl?.getAttribLocation(webgl.program, 'a_Position')
    const t_Position = webgl?.getUniformLocation(webgl.program, 't_Position')
    webgl.uniform4f(t_Position, 0.5,0.5,0.5,0);

    webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, 0,0 )
    webgl.enableVertexAttribArray(a_Position)
    const u_Color = webgl?.getUniformLocation(webgl.program,'u_Color')
    // 需要将当前的位置信息可以设置为鼠标的事件里面即可
    let colors = [1.0,0.0,0.0,1.0]
    // webgl?.vertexAttrib3f(a_Position, 1.0,1.0,0.0)
    webgl?.uniform4f(u_Color, colors[0], colors[1], colors[2], colors[3])
    webgl?.clearColor(0, 0, 0, 1);
    webgl?.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLES,0, 3) // position and count
  }
  const renderTran = () => {
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
    
    const vertices = new Float32Array([0.0,0.5, -0.5, -0.5,0.5,-0.5])
    // 开始创建缓存区
    const verticesBuffer = webgl.createBuffer();
    // 将缓冲区对象绑定到目标
    webgl.bindBuffer(webgl.ARRAY_BUFFER, verticesBuffer)
    // 向缓冲区对象中写入数据
    webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW)

    // 开始赋予变量这个值即可
    const a_Position = webgl?.getAttribLocation(webgl.program, 'a_Position')
    webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, 0,0 )
    webgl.enableVertexAttribArray(a_Position)
    const u_Color = webgl?.getUniformLocation(webgl.program,'u_Color')
    // 需要将当前的位置信息可以设置为鼠标的事件里面即可
    let colors = [1.0,0.0,0.0,1.0]
//     ctx.onmousedown = (ev:MouseEvent) => {
//     // 开始获取这个位置信息
//     const x = ev.clientX
//     const y = ev.clientY;
//     // cavans的视图大小
//     const rect = (ev.target as HTMLElement).getBoundingClientRect();
//     // 开始计算在webGL中的位置了
//     const webGLX = (x - rect.left - rect.width/2)/(rect.width/2)
//     const webGLY = ( (rect.height)/2 - (y - rect.top))/(rect.height/2)
//     // 修改position的位置信息
//     webgl?.vertexAttrib3f(a_Position, webGLX,webGLY,0.0)
    
//     if(webGLX >= 0.0 && webGLY >=0.0) { 
//         colors = [1.0,0.0,0.0,1.0]
//     }else if(webGLX < 0.0 && webGLY <0.0) {
//         colors = [0.0,0.0,1.0,1.0]
//     }
//     webgl?.uniform4f(u_Color, colors[0], colors[1], colors[2], colors[3])
//     webgl?.clearColor(0, 0, 0, 1);
//     webgl?.clear(webgl.COLOR_BUFFER_BIT);
//     webgl.drawArrays(webgl.POINTS,0, 1) // position and count
// }
    // webgl?.vertexAttrib3f(a_Position, 1.0,1.0,0.0)
    webgl?.uniform4f(u_Color, colors[0], colors[1], colors[2], colors[3])
    webgl?.clearColor(0, 0, 0, 1);
    webgl?.clear(webgl.COLOR_BUFFER_BIT);
    webgl.drawArrays(webgl.TRIANGLES,0, 3) // position and count
  }
  onMounted(() => {
    renderTran()
  });
  </script>
  
  <style>
      .canvas {
          width: 600px;
          height: 600px;
      }
  </style>
  