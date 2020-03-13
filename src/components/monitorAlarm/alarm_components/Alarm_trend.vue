<template lang="pug">
    LineChart(:options="lineOption" v-loading="isLoading")
</template>
<script>
import LineChart from '../../common/charts/LineCharts'
import { AlarmLevel } from '@server/ConstParams'
import Api from '@api'

export default {
    components: { LineChart },
    props: {
        chartData: {
            type: Object,
            default () {
                return {}
            }
        }
    },
    data () {
        return {
            isLoading: false,
            lineOption: {
                legend: {
                    enabled: true
                },
                tooltip: {
                    pointFormat: '告警等级：{series.name}<br>数量：{point.y}<br>{point.x: %m-%d %H:%M:%S}'
                },
                plotOptions: {
                    spline: {
                        lineWidth: 1,
                        marker: {
                            radius: 2
                        }
                    }
                },
                series: []
            }
        }
    },
    methods: {
        initData (timeRange) {
            let params = {
                from: timeRange[0].getTime(),
                to: timeRange[1].getTime() + 86400000  // 结束时间延后 1d
            }
            // 10080min --近一周内的告警数据
            this.isLoading = true
            Api.get('bs_alarm_within', params).then(res => {
                this.isLoading = false
                if (res) {
                    // 向父组件传递整理的各服务类型告警数的汇总数据
                    this.$emit('getAlarmType', { ...res.eachTypeCount, ...{ total: res.total } })
                    this.lineOption.series = this.buildLineOptions(res.eachTypeAlerts)
                }
            }, () => {
                this.isLoading = false
            })
        },
        buildLineOptions (dataArr) {
            let seriesArr = []
            for (const key in dataArr) {
                if (dataArr.hasOwnProperty(key)) {
                    let alarmType = AlarmLevel.find(item => +item.value === +key)

                    //UCMP-1237【监控告警】告警分析页面，告警趋势图表在鼠标拖动后无数据显示了
                    //问题原因：highcharts 源码分析：highcharts默认不对数组排序，满足图表拖动前提是数组按升序排序
                    let serItemArr = []
                    let serieItemTempArr = this.filterAlarmByTime(dataArr[key])
                    for (let index = serieItemTempArr.length - 1; index >= 0; index--)
                        serItemArr.push(serieItemTempArr[index])

                    seriesArr.push({
                        name: alarmType ? alarmType.label : '其他',
                        data: serItemArr
                    })
                }
            }
            // 过滤没有数据的选项
            seriesArr = seriesArr.filter(item => {
                return item.data.length !== 0
            })

            return seriesArr
        },
        // 过滤分类告警
        filterAlarmByTime (dataArr) {
            let seriesArr = []
            if (dataArr && dataArr.length) {
                dataArr.forEach(alarm_item => {
                    let timeStemp = (new Date(alarm_item.createtime)).getTime()
                    let tarData = seriesArr.find(item => {
                        return item[0] === timeStemp
                    })
                    if (tarData) tarData[1]++
                    else seriesArr.push([timeStemp, 1])
                })
            }
            return seriesArr
        }
    },
    mounted () {
        this.$on('changeTimeRange', (val) => {
            this.initData(val)
        })
    }
}
</script>
