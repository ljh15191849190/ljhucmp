<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container.position-relative(slot="content")
            EditRuleComponent(:isBelongToEcsDetail="isBelongToEcsDetail" :operationType="operationType" :strategyId="strategyId")
</template>
<script>
// 告警策略添加/编辑/查看页面
import EditRuleComponent from './EditRuleComponent'
export default {
    components: { EditRuleComponent },
    data () {
        return {
            breadcrumbItems: [
                { prop: '/strategy-mgr', label: '告警策略管理' },
                { prop: '', label: '' }
            ]
        }
    },
    created () {
        if (this.operationType === 'add')
            this.breadcrumbItems[1].label = `新建告警策略`
        else if (this.operationType === 'edit')
            this.breadcrumbItems[1].label = `编辑告警策略`
        else if (this.operationType === 'view')
            this.breadcrumbItems[1].label = `查看策略详情`
    },
    computed: {
        isBelongToEcsDetail () {
            return this.$route.query.isBelongToEcsDetail
        },
        operationType () {
            return this.$route.query.type
        },
        strategyId () {
            return this.$route.query.strategyId
        }
    }
}
</script>
<style lang="scss" scoped>
</style>
