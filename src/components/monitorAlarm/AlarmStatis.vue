<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container.overflow-y-auto.full-tab-container.alarm-statis-section(slot="content")
            div.clearfix
                div.filter-items.float-right
                    el-date-picker.picker-width(size="small" v-model="searchParams.dateRange" type="daterange" @change="changeTimeRange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期")
            div.top_alarm_count
                div.d-flex.justify-content-between
                    router-link.flex-item(v-for="(alarm, index) in allAlarms" :key="alarm.prop" :to="{name: 'alertMgmt', params: {type: alarm.value, timeRange: searchParams.dateRange}}")
                        div(:class="`alarm-${alarm.prop}`")
                            span.circle-cot(:span="10")
                                span.icon-circle
                                    i(:class="'ucmp-icon-alarm-' + alarm.prop")
                            span.text-count(:span="14")
                                span.alarm-count {{alarm.count}}
                                span.alarm-label {{alarm.label}}
            div.bot-charts.border-top.margin-top.padding-top
                div.clearfix
                    div.dash-chart-container.border.float-left
                        div.chart-header 告警趋势
                        div.chart-container
                            AlarmTrend(ref="alarmTrend" @getAlarmType="changeAlarmCounts")
                    div.dash-chart-container.border.float-right
                        div.chart-header 告警类别分布
                        div.chart-container.chart-pad
                            PieChart(:options="pieChart")
</template>
<script>
import PieChart from '../common/charts/PieCharts'
import AlarmTrend from './alarm_components/Alarm_trend'
import Api from '@api'
import { AlarmLevel } from '@server/ConstParams'

export default {
    data () {
        return {
            breadcrumbItems: [{ prop: '/alarm-statistics', label: '告警分析' }],
            lineChartsData: {
                data: {}
            },
            searchParams: {
                dateRange: []
            },
            allAlarms: [],
            pieChart: {
                legend: {
                    enabled: true
                },
                tooltip: {
                    pointFormat: '{series.name}: {point.name}<br>告警数量：{point.y}<br>占比：{point.percentage: .1f}%'
                },
                plotOptions: {
                    labelEnabled: true,
                    distance: 20,
                    labelText: '{point.name}',
                    showInLegend: true
                },
                series: [{
                    name: '告警类型',
                    innerSize: '75%',
                    data: []
                }]
            }
        }
    },
    created () {
        let now = new Date()
        // 设置默认查询时间为一周内
        let startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 7)).toISOString().slice(0, 10)
        let endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10)
        this.searchParams.dateRange.push(new Date(startDate))
        this.searchParams.dateRange.push(new Date(endDate))

        this.allAlarms.push({label: '总数', value: 'total', prop: 'total'})
        this.allAlarms = [...this.allAlarms, ...JSON.parse(JSON.stringify(AlarmLevel))]
    },
    methods: {
        changeAlarmCounts (val) {
            this.allAlarms.forEach(item => {
                this.$set(item, 'count', val[item.value])
            })
        },
        changeTimeRange () {
            this.initAlarmData(this.searchParams)
        },
        initPieDatas (dateRange) {
            let params = {
                from: dateRange[0].getTime(),
                to: dateRange[1].getTime() + 86400000  // 结束时间延后 1d
            }
            Api.get('alarm_counts_by_serve_type', params).then(res => {
                if (res) {
                    this.pieChart.series[0].data = []
                    for (const key in res) {
                        if (res.hasOwnProperty(key)) {
                            const alarmCount = res[key]
                            if (alarmCount) {
                                this.pieChart.series[0].data.push({
                                    name: key,
                                    y: alarmCount
                                })
                            }
                        }
                    }
                }
            })
        },
        initAlarmData (searchParams) {
            this.initPieDatas(searchParams.dateRange)
            // 改变时间范围 1 - 90
            this.$refs.alarmTrend.$emit('changeTimeRange', searchParams.dateRange)
        }
    },
    mounted () {
        this.initPieDatas(this.searchParams.dateRange)
        this.$refs.alarmTrend.$emit('changeTimeRange', this.searchParams.dateRange)
    },
    components: { PieChart, AlarmTrend }
}
</script>
<style lang="scss" scoped>
.top-container {
  height: 250px;
}
.full-tab-container {
  height: 100%;
}
.filter-items {
  line-height: 30px;
  padding: 10px 0;
  &.float-right {
    margin-right: 30px;
  }
}
.small-width {
  width: 70px !important;
  margin: 0 10px;
}
.dash-chart-container {
  width: 50% !important;
  height: 400px;
  margin: 0 !important;
  &:nth-child(1) {
    border-right: none !important;
  }
}

.picker-width {
  width: auto;
}
</style>


