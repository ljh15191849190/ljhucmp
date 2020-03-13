<template lang="pug">
    CardItem(:title="titleLabel" filterType="date" @changeFilterParams="changeTime")
        Alarm_trend(ref="alarmTrend" slot="chartCot")
</template>
<script>
import Alarm_trend from '../../../components/monitorAlarm/alarm_components/Alarm_trend'
import CardItem from '../CardItem'
import {mapActions} from 'vuex'

export default {
    data () {
        return {
            code: 'alarm_trend',
            initId: 30,
            titleLabel: '告警趋势'
        }
    },
    methods: {
        changeTime (val) {
            let timeRange = [new Date((new Date()).getTime() - val.key * 24 * 60 * 60 * 1000), new Date()]
            // 切换事件范围触发图表数据刷新
            this.$refs.alarmTrend.$emit('changeTimeRange', timeRange)
            this.setCardFilterItem({[this.code]: {from: timeRange[0].getTime(), to: timeRange[1].getTime()}})
        },

        ...mapActions([
            'setCardFilterItem'
        ])
    },
    mounted () {
        let timeRange = [new Date((new Date()).getTime() - 7 * 24 * 60 * 60 * 1000), new Date()]
        this.$refs.alarmTrend.$emit('changeTimeRange', timeRange)
        this.setCardFilterItem({[this.code]: {from: timeRange[0].getTime(), to: timeRange[1].getTime()}})
    },
    destroyed () {
        this.setCardFilterItem({[this.code]: undefined})
    },
    components: { CardItem, Alarm_trend }
}
</script>
<style lang="scss" scoped>
</style>
