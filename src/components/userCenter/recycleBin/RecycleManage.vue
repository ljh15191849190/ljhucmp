<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
                el-tabs(v-model="activeTab" @tab-click="handleClick")
                    el-tab-pane(v-for="tab in tabs" :label="tab.label" :name="tab.prop" :key="tab.prop")
                RecycleWaitList.adjust-height(v-if="activeTab==='wait'")
                RecycleBinList.adjust-height(v-else)
</template>

<script>
/**
 * @description 审批管理
 */

import RecycleWaitList from './RecycleWaitList'
import RecycleBinList from './RecycleBinList'

const tabs = [
    { label: '待回收', prop: 'wait' },
    { label: '已回收', prop: 'bin' }
]
export default {
    name: 'RecycleManage',
    data () {
        return {
            breadcrumbItems: [{ prop: 'RecycleManage', label: '回收管理' }],
            tabs: tabs,
            activeTab: 'wait'
        }
    },
    methods: {
        handleClick (tab) {
            this.$router.push({query: {type: tab.name}})
            // this.$route.query.type = tab.name
        }
    },
    created () {
        // Judge whether there are query conditions,To set active tab
        // mainly for the dashboard home page jump
        this.activeTab = this.$route.query && this.$route.query.type ? this.$route.query.type : 'wait'
    },
    computed: {
    },
    components: {
        RecycleWaitList,
        RecycleBinList
    }
}
</script>
<style lang="scss" scoped>
.adjust-height{
  height: calc(100% - 54px);
}
</style>

