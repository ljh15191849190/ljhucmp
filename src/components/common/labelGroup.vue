<template lang="pug">
  div.labelGroup
    span.state-panel {{provider_name}}
    span.margin-left.adjust-box
      span.adjust-tag(
        v-for="state in stateTypes"
        :key="state.id"
      )
        el-tag(:type="state.style" :style="state.custom_style ? state.custom_style : {}" :class="state.class")
        span {{ state.name }} ( {{ state.count }} )
</template>
<script>
/**
 * @description 服务状态列表
 * @prop [states] 状态列表
 */

export default {
  props: ['stateTypes', 'provider_name'],
  data () {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.labelGroup{
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  .state-panel {
    flex: 0 0 80px;
    text-align: right;
    margin-right: 5px;
  }
  .adjust-box{
    flex: 0 0 calc(100% - 85px);
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.adjust-tag {
  min-width: 90px;
  padding-bottom: 5px;
}

.adjust-tag .el-tag {
    width: 10px;
    height: 10px;
    padding: 0;
    border-radius: 15px;
    margin-right: 4px;
    position: relative;
    top: 0px;
}
</style>
