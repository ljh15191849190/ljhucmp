<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            HostItemDashboard(:instanceId="instanceId" :instanceIds="instanceIds")
</template>
<script>
/**
 * @description 主机监控面板
 */
import HostItemDashboard from './HostItemDashboard'
export default {
   data () {
       return {
           breadcrumbItems: [
               { prop: '/monitor-details', label: '监控详情' },
               { prop: '', label: '主机监控面板' }
           ],
           monitorIPs: '',
           instanceId: '',
           instanceIds: ''
       }
   },
   created () {
       let tagName = this.$route.query.instance_name
       if (!this.$route.query.instance_id && !this.$route.query.instanceIds)
            tagName = '未知主机'
       this.$set(this.breadcrumbItems[1], 'label', tagName)
       this.instanceId = this.$route.query.instance_id || ''
       this.instanceIds = this.$route.query.instanceIds || ''
   },
   components: { HostItemDashboard }
}
</script>
<style lang="scss" scoped>
.dash-chart-container{
    height: 380px;
    margin-bottom: 16px;
}
</style>

