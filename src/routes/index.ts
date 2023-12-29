
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
    },{
        path: '/less04',
        component: Lesson04
    },{
        path: '/less05',
        component: Lesson05
    },{
        path: '/less06',
        component: Lesson06
    },{
        path: '/less07',
        component: Lesson07
    }, {
        path: '/less08',
        component: Lesson08
    }, {
        path: '/less09',
        component: Lesson09
    }
]


const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
  })



export default router;