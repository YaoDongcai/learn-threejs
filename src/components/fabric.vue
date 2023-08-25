<template>
  <!-- tool 工具类 -->
  <div class="tool">
    <button @click="setTool('pen')">Pen</button>
    <button @click="setTool('eraser')">Eraser</button>
    <button @click="setTool('rectangle')">Rectangle</button>
    <button @click="setTool('circle')">Circle</button>

    colorPicker: <input type="color" id="colorPicker" @change="setColor" />
    
    thickness: <input
      type="range"
      min="1"
      max="10"
      value="1"
      @change="setThickness"
    />
    <button @click="clearCanvas">Clear Canvas</button>
  </div>

  <canvas id="canvas" ref="canvas"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
// 开始学习fabric 学习
import FabricBoard from "../libs/FabricBoard";
const canvas = ref();
let board: FabricBoard;
onMounted(() => {
    board = new FabricBoard(canvas.value, {
    width: 600,
    height: 600,
  });
});
const setThickness = (e: Event) => {
    const target = (e.target) as HTMLElement
    const value = target?.value 
    board.setBrushWidth(value);
}
const setTool = (tool: string) => {
    board.setToolName(tool)
}
const setColor = (e: Event) => {
    const target = (e.target) as HTMLElement
    const value = target?.value
    console.log('---color', value)
    board.setBrushColor(value);
}
const clearCanvas = () => {
    // 清空当前的数据
}
</script>

<style scoped>
.tool {
    
    button {
        margin-right: 16px;
    }
}
#canvas {
  border: 1px solid red;
}
</style>
