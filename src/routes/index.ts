
import { createRouter, createWebHashHistory} from 'vue-router'
import Board  from "../views/board.vue"
import World from '../views/world.vue'
import FabricCanvas from '../views/fabric.vue'
import Three01 from '../views/three-1.vue'
import Lesson01 from '../views/lesson01.vue'
import Lesson02 from '../views/lesson02.vue'
import Lesson03 from '../views/lesson03.vue'
import Lesson04 from '../views/lesson04.vue'
import Lesson05 from '../views/lesson05.vue'
import Lesson06 from '../views/lesson06.vue'
import Lesson07 from '../views/lesson07.vue'
import Lesson08 from '../views/lesson08.vue'
import Lesson09 from '../views/HelloWorld.vue'
import Lesson10 from '../views/lesson10.vue'
import Lesson11 from '../views/lesson11.vue'
import Lesson12 from '../views/lesson12.vue'
import PlyView from '../views/plyViews.vue'
import threePlyViews from '../views/threePlyViews.vue'
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
      path: '/threePlyViews',
        name: 'threePlyViews',
        component:threePlyViews,
        meta: {
            title: 'threePlyViews',
            icon: 'UserFilled',
          },
    },
    {
      path: '/plyview',
        name: 'plyview',
        component:PlyView,
        meta: {
            title: 'plyview',
            icon: 'UserFilled',
          },
    },
    {
      path: '/three-01',
        name: 'three01',
        component:Three01,
        meta: {
            title: 'Three01 第一课',
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
    },{
      path: '/less11',
      name: 'less11',
      component: Lesson11,
      meta: {
        title: '图片处理',
        icon: 'UserFilled'
      }
    }, {
      
      path: '/less12',
      name: 'lesson12',
      component: Lesson12,
      meta: {
        title: 'ResizeBox',
        icon: 'UserFilled'
      }
    }
]


const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
  })



export default router;