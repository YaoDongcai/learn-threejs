<template>
    <div class="container">
        <div class="title"> Show circle SVG</div>
        <svg width="400" height="400" id="svg-container">
            <circle id="draggable-circle" cx="0" cy="0" r="10" fill="none" stroke="yellow" stroke-width="10" />
        </svg>
    </div>
</template>
<style scoped>
svg {
    border: 1px solid black;
}
</style>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
type ReFn = (...args: any) => void
// 节流函数的类型
type ThFn = (fn: ReFn, timer: number) => ReFn
const throttle: ThFn = (fn, timer) => {
    let time: any = null
    const _throttle = (...args: any) => {
        if (time) clearTimeout(time)
        time = setTimeout(() => {
            fn.apply(this, args)
        }, timer);
    }
    return _throttle
}


// 计算两个点之间的距离
function distanceFun(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}
const isDragging = ref(false);
onMounted(() => {
    // 获取SVG元素和圆形元素
    const svgContainer = document.getElementById('svg-container');
    const draggableCircle = document.getElementById('draggable-circle');
    if (!svgContainer) return;
    if (!draggableCircle) return;
    // 初始化拖拽状态
     isDragging.value = false;
    let offset = { x: 0, y: 0 };

    // 鼠标按下事件处理程序
    function handleMouseDown(event) {
        isDragging.value = true;
        console.log('----handleMouseDown', isDragging.value)
        // 计算鼠标位置相对于圆形元素的偏移量
        const { clientX, clientY } = event;
        const { left, top } = draggableCircle.getBoundingClientRect();
        offset = { x: clientX - left, y: clientY - top };
    }

    // 鼠标移动事件处理程序
    function handleMouseMove(event) {
        console.log('---event22222', event)
        // 需要检测是否为激活
        // 计算新的圆形元素位置
        const { clientX, clientY } = event;
        const { left, top } = svgContainer.getBoundingClientRect();
        const newX = clientX - left //- offset.x;
        const newY = clientY - top //- offset.y;

        const originX = draggableCircle?.getAttribute("cx");
        const originY = draggableCircle?.getAttribute('cy');

        // 计算距离 如果当前的距离为15 那么就可以认为是可以激活状态即可

        const distance = distanceFun({ x: newX, y: newY }, { x: originX, y: originY });
        console.log('---distance', distance)
        if (distance > 15) {
            // 将鼠标回复为pointer 样式即可
            document.body.style.cursor = "default";
            return;
        }
        document.body.style.cursor = "move";
        // 这个时候 要求改变鼠标为小手格式
        // 如果鼠标当前的位置离
        console.log('----newX', isDragging.value, newX, newY)
        if (!isDragging.value) return;
        // 更新圆形元素的位置

        draggableCircle.setAttribute('cx', newX);
        draggableCircle.setAttribute('cy', newY);
    }

    // 鼠标释放事件处理程序
    function handleMouseUp() {
        isDragging.value = false;
    }
    // 添加事件监听器
    svgContainer.addEventListener('mousedown', handleMouseDown);
    svgContainer.addEventListener('mousemove', handleMouseMove);
    svgContainer.addEventListener('mouseup', handleMouseUp);
})








</script>


