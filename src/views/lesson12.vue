<template>
    <div class="container">
        <div class="title">ResizeBox 组件实现</div>
        <resize-box v-on:resize="resize" :min-percent='20' split="vertical">
        <template #paneL>
          this is a PaneL
        </template>


        <template #paneR>

          <reisze-box v-on:resize="resize" split="vertical" :default-percent='30'>
            <template #paneL>
                this is aa PaneL
            </template>
            <template #paneR>
                this is aa PaneR
            </template>
          </reisze-box>

        </template>
      </resize-box>
    </div>
</template>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100vh;
}
</style>
<script lang="ts" setup>
import ResizeBox from '../components/resizeBox.vue'
const  resize = () => {
    console.log('---resize')
}                                                                                                            
console.log('----setTup11111')
</script>


