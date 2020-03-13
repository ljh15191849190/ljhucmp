<template lang="pug">
  div
    span.state-panel 状态:
    span.margin-left
      span.adjust-tag(
        v-for="state in stateTypes"
        :key="state.id"
        @click="setState(state.id)"
      )
        el-tag(:type="state.style" :style="state.custom_style ? state.custom_style : {}" :class="state.class")
        span {{ state.name }} ( {{ state.count }} )
</template>
<script>
/**
 * @description 服务状态列表
 * @prop [states] 状态列表 [setState] 点击状态事件
 */

export default {
  props: ['stateTypes', 'setState'],
  data () {
    return {}
  }
}
</script>
