<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading")
        div.full-height.position-relative(slot="chartCot")
            div.chart-cot
                PieChart(:options="approveOptions" @clickFn="clickChartFn")
</template>
<script>
import CardItem from '../CardItem'
import PieChart from '../../common/charts/PieCharts'
import Api from '@api'

const buildChartOptions = function (data) {
    let chartArr = [
        ['审批通过', data.pass || 0],
        ['审批不通过', data.refused || 0],
        ['待审批', data.todo || 0]
    ]
    chartArr = chartArr.filter(item => {
        return item[1] !== 0
    })
    return chartArr
}

export default {
    components: { CardItem, PieChart },
    data () {
        return {
            titleLabel: '我的审批',
            approveTotalCount: 0,
            approveOptions: {
                hasClickFn: true,
                colors: ['#61c359', '#e64451', '#ffaa00'],
                chart: {
                    spacing: [10, 110, 10, 10]
                },
                title: {
                    text: '',
                    position: 'middle',
                    fontSize: '16px',
                    y: -20,
                    useHTML: true,
                    zIndex: -1
                },
                tooltip: {
                    pointFormat: '{point.name}<br>{series.name}: {point.percentage: .1f}%'
                },
                plotOptions: {
                    showInLegend: true
                },
                series: [{
                    name: '占比',
                    innerSize: '70%',
                    data: []
                }]
            },
            loading: false
        }
    },
    created () {
        this.loading = true
        Api.get('db_approve', {}).then(res => {
            this.loading = false
            this.approveTotalCount = (res.todo || 0) + (res.done || 0)
            if (res) {
                this.approveOptions.title.text = this.approveTotalCount ? `<p class="text-center" style="z-index:-1">审批总数</br>${this.approveTotalCount}</p>` : ''
                this.approveOptions.series[0].data = buildChartOptions(res)
            }
        }, () => {
            this.loading = false
        })
    },
    methods: {
        clickChartFn (event) {
            this.$router.push({path: '/approve', query: {type: event.point.name === '待审批' ? 'todo' : 'done'}})
        }
    }
}
</script>
<style lang="scss" scoped>
.chart-cot {
    height: 100%;
    min-width: 250px;
}
</style>
