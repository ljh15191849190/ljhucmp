<template lang="pug">
  el-tooltip(:content="text" effect="light")
    i.icon-button(@click="handleClick" :class="[ type, disabled ? 'disabled' : '' ]")
</template>
<script>
/**
 * @description 图标按钮组件
 */
export default {
  /**
   * @description 父组件传递的配置参数
   * @prop {*} args 可选 传递处理图标点击函数的参数
   * @prop {string} type 可选 图标的class
   * @prop {string} text 可选 图标提示文字
   * @example IconButton(@iconClick="viewDetail" :args="detail" type="el-icon-view" text="查看")
   */
  props: {
    args: {
      default: ''
    },
    type: {
      type: String,
      default: 'portal-icon-dict'
    },
    text: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {

    }
  },
  methods: {
    handleClick () {
      if (this.disabled)
        return
      this.$emit('iconClick', this.args)
    }
  },
  computed: {
      isPortal () {
        return this.type.indexOf('portal') !== -1
      }
  },
  created () {
  }
}
</script>
<style lang="scss" scoped>

</style>
