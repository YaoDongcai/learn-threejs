

<template>
  <!-- 右边的内容 然后左边都在显示即可 -->
  <div class="layout_container">
    <div class="layout_slider">
      <el-scrollbar class="scrollbar">
        <!-- 菜单组件-->
        <el-menu
                :collapse="false"
                :default-active="$route.path"
                background-color="#001529"
                text-color="white"
                active-text-color="yellowgreen"
                >
                <!--根据路由动态生成菜单-->
                    <Menu :menuList="menuRoutes"></Menu>
                </el-menu>
      </el-scrollbar>
    </div>
    <!-- 内容展示区 -->
    <div class="layout_main">
      <el-scrollbar>
        <router-view v-slot="{Component}">
        <Transition name="fade">
            <component :is="Component" ></component>
        </Transition>
    </router-view>
      </el-scrollbar>
    </div>

  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Menu from './components/menu.vue'
import { routes as menuRoutes} from './routes/index'
import { useRoute } from 'vue-router'
const $route = useRoute()

</script>
<style lang="scss" scoped>
.layout_container {
  width: 100vw;
  height: 100vh;

  .layout_slider {
    color: white;
    width: 120px;
    height: 100vh;
    transition: all 0.3s;

    .scrollbar {
      width: 100%;
      height: calc(100vh);

      .el-menu {
        border-right: none;
      }
    }
  }

  .layout_main {
    position: absolute;
    width: calc(100% - 160px);
    height: calc(100vh - 0px);
    left: 120px;
    top: 0px;
    overflow: auto;
    transition: all 0.3s;

  }
}</style>
