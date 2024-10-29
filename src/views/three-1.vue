<template>
    <canvas ref="canvasRef" ></canvas>
</template>


<script lang="ts" setup>
import { Scene,PerspectiveCamera,WebGLRenderer, MeshPhongMaterial,Mesh,BoxGeometry, DirectionalLight  } from 'three'
import { onMounted, ref } from 'vue';
onMounted(() => {
    const canvasRef = ref<HTMLCanvasElement>()
    
    const scene = new Scene();
    const material = new MeshPhongMaterial({ color: 0x44aa88 })
    const geometry = new BoxGeometry(1, 1, 1)
    //创建网格
    const cube = new Mesh(geometry, material)
    scene.add(cube)//将网格添加到场景中
    const camera = new PerspectiveCamera( 75, 2, 0.1, 5 );
    const light = new DirectionalLight(0xFFFFFF, 1)
    light.position.set(0,2,4)
    scene.add(light)

    camera.position.z = 2
    const renderer = new WebGLRenderer({
        canvas: canvasRef.value
    });
    // renderer.render(scene, camera)
    const render = (time: number) => {
                time = time * 0.001 //原本 time 为毫秒，我们这里对 time 进行转化，修改成 秒，以便于我们动画旋转角度的递增
                cube.rotation.x = time
                cube.rotation.y = time
                renderer.render(scene, camera)
                window.requestAnimationFrame(render)
            }
            window.requestAnimationFrame(render)
    document.body.appendChild( renderer.domElement )
})
</script>