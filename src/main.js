/**
 * @description ucmp-ui入口文件
 */
import 'bootstrap/dist/css/bootstrap.min.css'
// import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/iconfont.css'
import '@leaptocloud/standard-ui/dist/css/standard-ui.min.css'
import '@/assets/scss/ucmp.scss'
import Vue from './vue.config'
import store from './store'
import App from './App'
import router from './router'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
