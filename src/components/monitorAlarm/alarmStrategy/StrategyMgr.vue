<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            StrategyList
</template>
<script>
// 策略管理页面
import StrategyList from './StrategyList'
export default {
    components: { StrategyList },
    data () {
        return {
            breadcrumbItems: [
                { prop: '/strategy-mgr', label: '告警策略' }
            ]
        }
    },
    methods: {
    }
}
</script>
