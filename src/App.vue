<script setup lang="ts">
// import World from "./components/world.vue";
// import webGL from "./components/webGL.vue";
// import webGL from "./components/webGL2.vue";
// import board from './components/board.vue';
</script>

<template>
  
  <!-- <world /> -->
  <!-- <webGL /> -->
  <router-view></router-view>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
