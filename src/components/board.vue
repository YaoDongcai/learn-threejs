<template>
<canvas id="whiteboard" width="800" height="600"></canvas>
<input type="range" id="lineWidthSlider" min="1" max="20" value="5">

</template>


<script lang="ts" setup>
import { nextTick, onMounted } from 'vue';
import WhiteBoard from '../libs/WhiteBoard'
onMounted(() => {
    const canvas = document.getElementById('whiteboard') as HTMLCanvasElement;
    const lineWidthSlider = document.getElementById('lineWidthSlider') as HTMLInputElement;
    const whiteboard = new WhiteBoard(canvas, lineWidthSlider);
})

</script>
