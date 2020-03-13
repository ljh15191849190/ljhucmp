<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading" filterType="resource" enlargeable @changeFilterParams="changeType")
        LineChart(slot="chartCot" :options="chartOption")
        LineChart(slot="chartCotDialog" :options="chartOption")
</template>
<script>
import Utils from '@server/Utils'
import LineChart from '../../common/charts/LineCharts'
import CardItem from '../CardItem'
import Api from '@api'

const buildChartOption = function (dataObj, type) {
    let seriesData = []
    for (const key in dataObj) {
        if (dataObj.hasOwnProperty(key)) {
            const _datas = dataObj[key]
            let seriesItem = {
                name: key,
                data: []
            }
            _datas.forEach(item => {
                seriesItem.data.push([item.date, item.tendency])
            })
            seriesData.push(seriesItem)
        }
    }
    let option = {
        // 增加色值。处理初始化第四条线不显现问题
        colors: ['#006699', '#4cabce', '#ffaa00', '#9a5ab4', '#e64451'],
        legend: {
            enabled: true,
            verticalAlign: 'top',
            align: 'right',
            floating: true,
            x: -10,
            y: -15
        },
        tooltip: {
            pointFormat: '{series.name}<br>数量:{point.y}<br>{point.x:%Y-%m-%d}'
        },
        yAxis: {
            title: {
                text: Utils.filterType(type, true)
            }
        },
        series: seriesData
    }
    return option
}
export default {
    data () {
        return {
            titleLabel: '容量分配趋势',
            chartOption: {},
            showType: 'cpu',
            chartDatas: {},
            loading: false
        }
    },
    created () {
        this.loading = true
        Api.get('db_capacity_distribute', {}).then(res => {
            this.loading = false
            if (res) {
                this.chartDatas = res
                this.chartOption = buildChartOption(Object.assign({}, this.chartDatas[this.showType]), this.showType)
            }
        }, () => {
            this.loading = false
        })
    },
    methods: {
        changeType (typeObj) {
            this.chartOption = buildChartOption(Object.assign({}, this.chartDatas[typeObj.key]), typeObj.key)
        }
    },
    components: { LineChart, CardItem }
}
</script>
