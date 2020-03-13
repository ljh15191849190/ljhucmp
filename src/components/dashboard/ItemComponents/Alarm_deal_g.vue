<template lang="pug">
    CardItem(:title="titleLabel" filterType="date" enlargeable)
        BarChart(slot="chartCot" :options="chartOption")
        BarChart(slot="chartCotDialog" :options="chartOption")
</template>
<script>
import BarChart from '../../common/charts/BarCharts'
import CardItem from '../CardItem'

// mock数据
import AlarmDeal from '@mock/homeCharts/alarm_deal'
const devicesChartFilter = [
    { id: 6, name: '一周内' },
    { id: 14, name: '近15天' },
    { id: 30, name: '近30天' }
]
const buildChartOption = function (data) {
    let pendlings = []
    let processeds = []
    let months = []
    data.map(item => {
        pendlings.push(item.untreated)
        processeds.push(item.treated)
        months.push(item.alarmTime)
    })
    let alarmSeries = [
        {
            name: '待处理',
            data: pendlings
        },
        {
            name: '已处理',
            data: processeds
        }
    ]
    let obj = {
        legend: {
            enabled: true
        },
        xAxis: {
            categories: months,
            crosshair: true
        },
        yAxis: {
            title: {
                text: '单位/个',
                y: 0,
                x: 0
            }
        },
        series: alarmSeries
    }
    return obj
}
export default {
    data () {
        return {
            devicesChartFilter: devicesChartFilter,
            initId: 30,
            titleLabel: '告警处理统计',
            chartOption: null
        }
    },
    created () {
        this.chartOption = buildChartOption(AlarmDeal)
    },
    methods: {
        changeType (type) { console.log(type) }
    },
    components: { BarChart, CardItem }
}
</script>
<style lang="scss" scoped>
</style>
