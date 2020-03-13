<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
                el-tabs(v-model="activeTab" @tab-click="handleClick")
                    el-tab-pane(v-for="tab in tabs" :label="tab.label" :name="tab.prop" :key="tab.prop")
                TodoApproveTable.adjust-height(v-if="activeTab==='todo'")
                DoneApproveTable.adjust-height(v-else)
</template>

<script>
/**
 * @description 审批管理
 */

import TodoApproveTable from './TodoApproveTable'
import DoneApproveTable from './DoneApproveTable'

const tabs = [
    { label: '待审批申请单', prop: 'todo' },
    { label: '已审批申请单', prop: 'done' }
]
export default {
    name: 'ApproveMgmt',
    data () {
        return {
            breadcrumbItems: [{ prop: 'approveMgmt', label: '审批管理' }],
            tabs: tabs,
            activeTab: ''
        }
    },
    methods: {
        handleClick (tab) {
            console.log(this.$route)
            this.$router.push({query: {type: tab.name}})
            // this.$route.query.type = tab.name
        }
    },
    created () {
        // Judge whether there are query conditions,To set active tab
        // mainly for the dashboard home page jump
        this.activeTab = this.$route.query && this.$route.query.type ? this.$route.query.type : 'todo'
    },
    computed: {
    },
    mounted () {
    },
    components: {
        TodoApproveTable,
        DoneApproveTable
    }
}
</script>
<style lang="scss" scoped>
.adjust-height{
  height: calc(100% - 54px);
}
</style>

