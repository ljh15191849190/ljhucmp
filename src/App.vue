<template lang="pug">
  div#app
    div.container-left-part
        div.collapse-switch.position-relative(v-if="showNavBar" @click="toggleCollapse" size="small" :class="{'btn-mini-width': isCollapse}")
            span.ucmp-navbar-icon.ucmp-icon-menu-collapse-btn.collapse-btn
        navbar.full-height.atom-navbar(v-if="showNavBar" :is-collapse="isCollapse")
    div.container-right-part(:class="{'more-width': isCollapse && showNavBar, 'no-navbar': !showNavBar}")
      transition(name="el-fade-in-linear")
        router-view
        // 路由跳转时强制刷新组件
        // router-view(:key="$route.path")
    RightSideFunc
    transition(name="zoom-in-right")
      SideShoppingCar(v-if="carShow")
</template>

<script>
import Navbar from '@/components/Navbar'
import RightSideFunc from '@/components/RightSideFunc'
import SideShoppingCar from '@/components/catalog/shoppingCar/SideShoppingCar'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'app',
  data () {
    return {
      isCollapse: false,
      timeInterval: null,
      lastTime: null,
      currentTime: null,
      timeOut: 30 * 60 * 1000,
        projectId: localStorage.getItem('tenant')
    }
  },
  computed: {
    collapseIcon () {
      return this.isCollapse ? 'el-icon-arrow-right' : 'el-icon-arrow-left'
    },
    ...mapGetters([
      'carShow',
      'showNavBar'
    ])
  },
  methods: {
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    ...mapActions([
        'getTenancy',
        'getRecycleConfig',
        'getAttachmentDisplay',
        'getNasAutoAttach'
    ]),
    testTime () {
      let sessionTime = sessionStorage.getItem('session_time')
      if (sessionTime)
        this.timeOut = Number(sessionTime) * 60 * 1000

      //更新当前时间
      this.currentTime = new Date().getTime()
      //判断是否超时
      if (this.currentTime - this.lastTime > this.timeOut) {
        window.parent.postMessage({status: 601}, '*')
        clearInterval(this.timeInterval)
      }
    }
  },
  components: {
    Navbar,
    RightSideFunc,
    SideShoppingCar
  },
  created () {
    // 全局参数- 租期, 回收站, 附件，nas自动挂载
    this.getTenancy()
    this.getRecycleConfig()
    this.getAttachmentDisplay()
    this.getNasAutoAttach()
  },
  mounted () {
    this.lastTime = new Date().getTime()
    document.addEventListener('mouseover', () => {
      this.lastTime = new Date().getTime()
    })
    this.timeInterval = setInterval(this.testTime, 5000)
  }
}
</script>

<style lang="scss" scoped>
.no-navbar {
  margin-left: 0 !important;
  width: 100% !important;
}
</style>
