<template>
    <canvas  ref="container" id="container" class="container"></canvas>
</template>
   <script setup lang="ts">
   import { onMounted, ref } from "vue";
   import {initShaders} from '../libs/initShaders'
   // 通过鼠标来点击当前的视图来不断显示点位信息
   // 首先需要通过positon的信息来获取Event

   const container = ref()
   // 初始化定点
   function initVertexBuffers(gl: WebGLRenderingContext): number {
    // var vertices = new Float32Array([
    //     0, 0.5, -0.5, -0.5, 0.5, -0.5 //these are the coordinates of the vertices stored in an artray for us
    // ]);
    var vertices = new Float32Array([-0.5,0.5,-0.5,-0.5,0.5,0.5,0.5,-0.5])
    var n=4;
    // 创建缓冲区
    var vertexBuffers = gl.createBuffer();
    // 绑定缓存区域
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers)
    // 将数据写入缓冲区
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // 将缓冲区对象分配给这个a_Position
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0,0)
    // 开启attribute变量
    gl.enableVertexAttribArray(a_Position);
    

    // var n = 3; //this is the number of vertices and what is checkedf later

    //create a buffer object
    // var vertexBuffer = gl.createBuffer();
    // if (!vertexBuffer) { //error for if the buffer object can't be created
    //     console.log('Failed to create the buffer object');
    //     return -1;
    // }

    // //binds trhe buffer object to target
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // //this writes data into the buffeer object
    // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // if (a_Position < 0) { //lets us know if everything is working
    //     console.log('Failed to get the storage location of a_Position');
    //     return -1;
    // }

    // //assigns the buffer object to a_Position variable
    // gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // //enables assignment to a_position
    // gl.enableVertexAttribArray(a_Position);
    return n;
   }
   onMounted(() => {
     // 顶点着色器程序 
     // 第一步先要定义attribute
     // attribute vec4 a_Position;
     // 第二步让a_Position 可以在js中获取到
     // gl.getAttribuLocation(gl.program, 'a_Position');
     // 第三步开始设置这个a_Position 变量的值 通过gl提供的值
     // gl.vertxAttrib3f(a_Positon, 0.0,0.0,0.0) // 即可 第四分量会自动补全

     var  VSHADRE_SOURCE = `
     attribute vec4 a_Position;
     void main() {
        gl_Position = a_Position;
        gl_PointSize = 5.0;
     }`
     var FSHADER_SOURCE = `
     void main() {
        gl_FragColor = vec4(0.0,0.0,1.0,1.0);
     }`
    

     const dom: HTMLElement = container.value as HTMLElement
     const g_Points = [];
     
    console.log('---dom', dom)
     var gl = <WebGLRenderingContext> container.value.getContext("webgl"); // 
     // 开始设置
     
 // initShaders
    initShaders(gl,VSHADRE_SOURCE, FSHADER_SOURCE);
    const n = initVertexBuffers(gl);
    // 获取gl的变量 get Position

//    var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    // var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
    // gl.uniform4f(u_FragColor, 0.0, 1.0,1.0,1.0)
    // gl.vertexAttrib3f(a_Position, 0.0,0.0,0.0)
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    console.log('---n', n)
    gl.drawArrays(gl.TRIANGLE_STRIP,0, n) // position and count
    //  ctx.fillStyle = 'rgba(0,0,255,1.0)'
    //  ctx.fillRect(120,10,120,100);
   })
   </script>
   
   
   
   <style scoped>
   .container {
     width: 400px;
     height: 400px;
   }
   </style>
   