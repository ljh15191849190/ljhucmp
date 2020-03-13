<template lang="pug">
  div.container-right-side(v-show="showNavBar")
    transition(name="zoom-in-right")
      div.side-function-container(v-show="showFuncs")
        div.side-icon-function.arrow-right-container
            div.el-icon-caret-right(@click="handlerClick({prop: 'direction'})")
        el-tooltip(v-for="(func, index) in allNavItems" :key="index" :content="func.label" placement="left")
          <!-- UCMP367 购物车无数字显示已加入的资源数量 -->
          div.side-icon-cart-pane(v-if="func.child === 'shopping_car'" @click="handlerClick(func)")
            div.side-icon-cart-function.inner-icon(:class="shopCarCount ? func.activeIcon : func.icon")
            //- div.cart-text 购
            //- div.cart-text 物
            //- div.cart-text 车
            div.cart-text(v-for="(item, index) in shoppingCarList" :key="index") {{item}}
            div.cart-num(:class="{active: shopCarCount}") {{shopCarCount > 99 ? '99+' : shopCarCount}}
          div.side-icon-function.inner-icon(v-else :class="func.icon" @click="handlerClick(func)")
    transition(name="zoom-in-right")
      div.single-arrow-container(v-show="!showFuncs" @click="handlerClick({prop: 'direction'})")
        div.el-icon-caret-left
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import store from '@/store'

export default {
  data () {
    return {
      showFuncs: true,
      sideFunctions: [
        {
          prop: 'ucmp_catalog',
          child: 'shopping_car',
          label: '购物车',
          icon: 'ucmp-icon-cart',
          activeIcon: 'ucmp-icon-cart-load',
          route: ''
        },
        {
          prop: 'work_orders',
          label: '工单',
          icon: 'ucmp-icon-work-order',
          route: '/tickets'
        }
      ],
      shoppingCarList: []
    }
  },
  methods: {
    handlerClick (item) {
      if (item.prop === 'direction') {
        this.showFuncs = !this.showFuncs
        return
      }

      if (item.prop === 'ucmp_catalog' && item.child === 'shopping_car') {
        this.setCarShow(true)
        return
      }

      this.$router.push(item.route)
    },
    initSystemConfig () {
        if (this.systemConfig && this.systemConfig.shopping_car) {
            this.sideFunctions[0].label = this.systemConfig.shopping_car
            this.shoppingCarList = this.systemConfig.shopping_car.split('')
        }
    },
    ...mapActions([
      'setCarShow'
    ])
  },
  computed: {
    ...mapGetters([
      'showNavBar',
      'ucmpNavList',
      'shopCarCount',
      'systemConfig'
    ]),

    allNavItems () {
      let rst = []
      this.sideFunctions.forEach(
        nav => {
          // if (nav.prop === 'work_orders')
          let index = this.allNavKeys.indexOf(nav.prop)
          if (index !== -1)
            rst.push(nav)
        }
      )
      return rst
    },

    allNavKeys () {
      return this.ucmpNavList.map(
        item => {
          return item.url
        }
      )
    }
  },
  async created () {
      await store.dispatch('getSystemConfig')
      await this.initSystemConfig()
  }
}
</script>
<style lang="scss" scoped>
.inner-icon {
  font-size: 25px;
}
</style>
<style lang="scss">
.container-right-side{
    .el-badge__content {
      border:none;
      &.is-fixed{
        top: 18px;
        right: 18px;
      }
    }
}
</style>
