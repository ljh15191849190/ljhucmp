<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container.position-relative(slot="content")
            el-tabs(v-model="capacityChild" @tab-click="handleClick")
                el-tab-pane(v-for="capacity in capacitys" :key="capacity.prop" :label="capacity.label" :name="capacity.prop")
            div.main-cot
                router-view
</template>

<script>
/**
 * @description 资源使用统计
 */
export default {
  name: 'ResourceIndex',
  data () {
    return {
      breadcrumbItems: [{ prop: '/ResourceIndex', label: '资源概览' }],
      capacitys: [
        { prop: 'ResourceEmploy', label: '资源趋势' },
        // { prop: 'ResourceDistribution', label: '资源分布' },
        { prop: 'ResourceQuotaCount', label: '配额统计' }, // 功能设计问题 3.3.2暂时去掉
        { prop: 'ResourceAnalysis', label: '资源统计分析' },
        { prop: 'ResourceUseAnalysis', label: '资源使用统计' },
        { prop: 'ResourceMonth', label: '月度统计' }
      ],
      capacityChild: 'ResourceEmploy'
    }
  },
  methods: {
    handleClick (tab, event) {
      this.$router.push(tab.name)
    }
  },
  created () {
    this.$router.push(this.capacityChild)
  }
}
</script>
<style lang="scss" scoped>
.dashboard-tabs {
    height: 100%;
}
.main-cot {
    height: calc(100% - 50px);
}
</style>
