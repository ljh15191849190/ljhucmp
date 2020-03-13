<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading" enlargeable filterType="date" @changeFilterParams="changeTime")
        LineChart(slot="chartCot" :options="chartOption")
        LineChart(slot="chartCotDialog" :options="chartOption")
</template>
<script>
import LineChart from '../../common/charts/LineCharts'
import CardItem from '../CardItem'
import Api from '@api'
import {mapActions} from 'vuex'

const buildChartOption = function (data = []) {
    let seriesData = []
    data.forEach(resource => {
        if (resource.items) {
            let seriesItem = {
                type: 'line',
                name: resource.name,
                data: []
            }
            resource.items.forEach(_item => {
                // 时间日期之间用 '-' 连接时，转换为时间戳会有 8 时区误差，因此在进行转换时间戳时将 '-' 转为 '/'
                if (_item.apply_day) {
                    let date = new Date(_item.apply_day.split('-').join('/'))
                    seriesItem.data.push([date.getTime(), _item.service_count])
                }
            })

            seriesData.push(seriesItem)
        }
    })
    return seriesData
}

export default {
    data () {
        return {
            code: 'resource_apply',
            titleLabel: '资源申请趋势',
            chartOption: {
                legend: {
                    enabled: true,
                    floating: true,
                    verticalAlign: 'top',
                    align: 'right'
                },
                tooltip: {
                    pointFormat: '{series.name}:{point.y}<br>{point.x:%Y-%m-%d}'
                },
                series: []
            },
            showType: 'ecs',
            loading: false
        }
    },
    methods: {
        changeTime (timeRange) {
            this.initChartDatas(timeRange.key || 7)
            this.setCardFilterItem({[this.code]: {day: timeRange.key || 7}})
        },
        initChartDatas (days) {
            this.loading = true
            Api.get('db_resource_apply', {days: days}).then(res => {
                this.loading = false
                if (res)
                    this.chartOption.series = buildChartOption(res)
            }, () => {
                this.loading = false
            })
        },

        ...mapActions([
            'setCardFilterItem'
        ])
    },
    created () {
        let initDays = 7
        this.initChartDatas(initDays)
        this.setCardFilterItem({[this.code]: {day: 7}})
    },
    destroyed () {
        this.setCardFilterItem({[this.code]: undefined})
    },
    components: { LineChart, CardItem }
}
</script>
