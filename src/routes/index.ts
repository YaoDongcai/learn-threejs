
import { createRouter, createWebHashHistory} from 'vue-router'
import Board  from "../components/board.vue"
import World from '../components/world.vue'
import FabricCanvas from '../components/fabric.vue'
import Lesson01 from '../components/lesson01.vue'
import Lesson02 from '../components/lesson02.vue'
import Lesson03 from '../components/lesson03.vue'
const routes = [
    {
        path: '/',
        component: World
    },
    {
        path: '/board',
        component:Board
    },
    {
        path: '/fabric',
        component: FabricCanvas
    },{
        path: '/less01',
        component: Lesson01
    }
    ,{
        path: '/less02',
        component: Lesson02
    },{
        path: '/less03',
        component: Lesson03
    }
]


const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
  })



export default router;