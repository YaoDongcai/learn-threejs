import { createApp } from 'vue'
// 引入element-plus插件与样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './routes/index'
const app = createApp(App)
app.use(ElementPlus)
app.use(router).mount('#app')
