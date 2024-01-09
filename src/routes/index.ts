
import { createRouter, createWebHashHistory} from 'vue-router'
import Board  from "../components/board.vue"
import World from '../components/world.vue'
import FabricCanvas from '../components/fabric.vue'
import Lesson01 from '../components/lesson01.vue'
import Lesson02 from '../components/lesson02.vue'
import Lesson03 from '../components/lesson03.vue'
import Lesson04 from '../components/lesson04.vue'
import Lesson05 from '../components/lesson05.vue'
import Lesson06 from '../components/lesson06.vue'
import Lesson07 from '../components/lesson07.vue'
import Lesson08 from '../components/lesson08.vue'
import Lesson09 from '../components/HelloWorld.vue'
import Lesson10 from '../components/lesson10.vue'
export const routes = [
    {
        path: '/',
        component: World,
        name: '/',
        meta: {
            title: '首页',
            icon: 'UserFilled',
          },
    },
    {
        path: '/board',
        name: 'board',
        component:Board,
        meta: {
            title: 'board',
            icon: 'UserFilled',
          },
    },
    {
        path: '/fabric',
        name: 'fabric',
        component: FabricCanvas,
        meta: {
            title: 'fabric',
            icon: 'UserFilled',
          },
    },{
        path: '/less01',
        name: 'less01',
        component: Lesson01,
        meta: {
            title: 'less01',
            icon: 'UserFilled',
          },
    }
    ,{
        path: '/less02',
        name: 'less02',
        component: Lesson02,
        meta: {
            title: 'less02',
            icon: 'UserFilled',
          },
    },{
        path: '/less03',
        name: 'less03',
        component: Lesson03,
        meta: {
            title: 'less03',
            icon: 'UserFilled',
          },
    },{
        path: '/less04',
        name: 'less04',
        component: Lesson04,
        meta: {
            title: 'less04',
            icon: 'UserFilled',
          },
    },{
        path: '/less05',
        name: 'less05',
        component: Lesson05,
        meta: {
            title: 'less05',
            icon: 'UserFilled',
          },
    },{
        path: '/less06',
        name: 'less06',
        component: Lesson06,
        meta: {
            title: 'less06',
            icon: 'UserFilled',
          },
    },{
        path: '/less07',
        name: 'less07',
        component: Lesson07,
        meta: {
            title: 'less07',
            icon: 'UserFilled',
          },
    }, {
        path: '/less08',
        name: 'less08',
        component: Lesson08,
        meta: {
            title: 'less08',
            icon: 'UserFilled',
          },
    }, {
        path: '/less09',
        name: 'less09',
        component: Lesson09,
        meta: {
            title: 'less09',
            icon: 'UserFilled',
          },
    },{
        path: '/less10',
        name: 'less10',
        component: Lesson10,
        meta: {
            title: 'less10',
            icon: 'UserFilled',
          },
    }
]


const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
  })



export default router;