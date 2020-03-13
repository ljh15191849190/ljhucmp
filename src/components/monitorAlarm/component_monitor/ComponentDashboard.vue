<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            ComponentItemDashboard(:serverName="serverName" :serverCode="serverCode" :serverId="serverId")
</template>
<script>
/**
 * @description 组件监控面板
 */
import ComponentItemDashboard from './ComponentItemDashboard'

export default {
    data () {
        return {
            breadcrumbItems: [
                { prop: '/component-monitor', label: '组件监控详情' },
                { prop: '', label: '组件监控面板' }
            ]
        }
    },
    created () {
        let server_name = this.$route.query.server_name
        // 更新面包屑内容
        this.$set(this.breadcrumbItems[1], 'label', server_name)
    },
    computed: {
        serverCode () {
            return this.$route.query.server_code
        },
        serverId () {
            return this.$route.query.server_id
        },
        serverName () {
             return this.$route.query.server_name
        }
    },
    components: { ComponentItemDashboard }
}
</script>
<style lang="scss" scoped>
</style>
