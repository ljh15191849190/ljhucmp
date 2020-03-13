<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            el-tabs(@tab-click="changeTab" :value="activeTab")
                el-tab-pane(v-for="tab in tabs" :key="tab.name" :name="tab.name" :label="tab.label")
            router-view.bot-content.position-relative()
</template>
<script>
// 页签
const tabs = [
    {
        name: 'ProcessConfig',
        label: '流程配置'
    },
    {
        name: 'ProcessList',
        label: '流程列表'
    },
    {
        name: 'ModelList',
        label: '模型列表'
    }
]
export default {
    data () {
        return {
            breadcrumbItems: [{ prop: '/processDefinition', label: '流程定义' }],
            tabs: tabs,
            activeTab: 'ProcessConfig'
        }
    },
    created () {
        this.activeTab = this.$route.name
        this.activeTab && this.$router.push(this.activeTab)
    },
    methods: {
        // 切换页签
        changeTab (tab) {
            tab && tab.name && this.$router.push(tab.name)
        },
        // bug #UCMP-631 1、流程定义----页签未跳转，页面数据已刷新
        // Handle tab active item
        handleActiveTab (path) {
          if (path) {
            // Handle path whether include tab item
            let findTab = this.tabs.find((value) => path.includes(value.name))

            this.activeTab = findTab ? findTab.name : ''
          }
        }
    },
    watch: {
      // bug #UCMP-631 1、流程定义----页签未跳转，页面数据已刷新
      '$route.path' (newVal, oldVal) {
          if (newVal === oldVal) return
          newVal && this.handleActiveTab(newVal)
        }
    }
}
</script>
<style lang="scss" scoped>
.bot-content{
    height: calc(100% - 54px);
}
</style>
