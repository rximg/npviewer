import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';




createApp(App)
.use(Antd)
  .mount('#app')
  .$nextTick(() => {
    postMessage({cmd: 'removeLoading', payload: 'removeLoading' }, '*')
  })
