<template lang="pug">
    UcmpContainer.instance-calc-container(:breadcrumbItems="breadcrumbItems")
        el-tabs.full-container(slot="content" v-model="activeComponent" @tab-click="changeState")
            el-tab-pane.full-height(v-for="tabPane in tabPanes" :key="tabPane.prop" :label="tabPane.label" :name="tabPane.prop")
                AlarmTable.el-tab-pane__content-container(
                    v-if="activeComponent === tabPane.prop"
                    :process="tabPane.process"
                    :alarmType="alarmType"
                    :alarm-time-range="alarmTimeRange")
</template>

<script>
/**
 * @description 告警管理
 */
import AlarmTable from '../alarm_components/AlarmTable'

export default {
    components: { AlarmTable },
    data () {
        return {
            breadcrumbItems: [
                { prop: '', label: '告警查询' }
            ],
            activeComponent: 'PendingAlarmList',
            tabPanes: [
                { label: '待处理告警', prop: 'PendingAlarmList', process: '0' },
                { label: '已知告警', prop: 'DoneAlarmList', process: '1' }
            ],
            alarmType: ''
        }
    },
    created () {
        if (this.$route.params.type)
            this.alarmType = this.$route.params.type
    },
    methods: {
        changeState () {
            this.$route.params.type = ''
            this.alarmType = ''
        }
    },
    computed: {
        alarmTimeRange () {
            if (this.$route.params.timeRange) {
                return [
                    this.$route.params.timeRange[0].getTime(),
                    this.$route.params.timeRange[1].getTime()
                ]
            } else
                return []
        }
    }
}
</script>
<style lang="scss" scoped>
.instance-calc-container {
    height: 100%;
}
</style>

