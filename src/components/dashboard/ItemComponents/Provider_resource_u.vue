<template lang="pug">
    CardItem(:title="providerCharts.label" :prop="prop" enlargeable v-loading="loading")
        BarChart(slot="chartCot" :options="providerCharts.options")
        BarChart(slot="chartCotDialog" :options="providerCharts.options")
</template>
<script>
import BarChart from '../../common/charts/BarCharts'
import CardItem from '../CardItem'
import Api from '@api'

const buildChartOption = function (dataArr, categories, title) {
    let seriesData = []
    dataArr.forEach(data => {
        let data_item = {
            name: data.res_code === 'ecs' ? '云主机(台)' : '云硬盘(块)',
            data: []
        }
        data.items.map(item => {
            data_item.data.push([
                item.provider,
                +item.res_count
            ])
        })
        seriesData.push(data_item)
    })
    return seriesData
}
export default {
    props: ['prop'],
    data () {
        return {
            providerCharts: {
                label: '云厂商资源概况',
                prop: 'provider_charts',
                options: {
                    chart: {
                        spacing: [25, 10, 10, 10]
                    },
                    colors: ['#006699', '#4cabce'],
                    plotOptions: {
                        labelEnabled: true,
                        labelLimit: 9,
                        showInLegend: true
                    },
                    legend: {
                        enabled: true
                    },
                    tooltip: {
                        pointFormat: '{series.name}:{point.y}'
                    },
                    series: []
                }
            },
            loading: false
        }
    },
    created () {
        this.loading = true
        Api.get('db_provider', {}).then(res => {
            this.loading = false
            if (res)
                this.providerCharts.options.series = buildChartOption(res)
        }, () => {
            this.loading = false
        })
    },
    components: { BarChart, CardItem }
}
</script>
<style lang='scss' scoped>
</style>
