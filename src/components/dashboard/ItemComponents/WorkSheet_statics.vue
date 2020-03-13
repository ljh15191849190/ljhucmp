<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading")
        div.full-height.position-relative(slot="chartCot")
            div.chart-cot
                PieChart(:options="options" @clickFn="goStaticList")
</template>

<script>
    import CardItem from '../CardItem'
    import PieChart from '../../common/charts/PieCharts'
    import {WorkSheetStatus} from '@/server/ConstParams'
    import Api from '@api'

    /**
     * @description
     * @author jia.lu
     */
    export default {
        name: 'WorkSheet_statics',
        components: {CardItem, PieChart},
        data () {
            return {
                titleLabel: '工单统计',
                options: {
                    hasClickFn: true,
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
        methods: {
            getStatics () {
                Api.get('ticketStaticStatus', {}, true).then(res => {
                    let count = 0
                    let data = res.map(item => {
                        let statusObj = WorkSheetStatus[item.ticket_status]

                        // 累加总数
                        count += item.count
                        return {
                            name: statusObj.label,
                            staticKey: statusObj.id,
                            y: item.count,
                            color: statusObj.custom_style
                        }
                    })

                    this.options.series[0].data = data
                    this.options.title.text = count ? `<p class="text-center" style="z-index:-1">工单总数</br>${count || 0}</p>` : ''
                })
            },

            goStaticList (e) {
                this.$router.push({
                    name: 'WorkSheetIndex',
                    params: {tab: 'WorkSheetList', status: e.point.staticKey}
                })
            }
        },
        created () {
            this.getStatics()
        }
    }
</script>
<style lang="scss" scoped>
    .chart-cot {
        height: 100%;
        min-width: 250px;
    }
</style>
