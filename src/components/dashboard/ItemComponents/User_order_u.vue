<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading")
        div.full-height.position-relative(slot="chartCot")
            div.chart-cot
                PieChart(:options="orderOptions" @clickFn="clickChartFn")
</template>
<script>
    import CardItem from '../CardItem'
    import PieChart from '../../common/charts/PieCharts'
    import Api from '@api'

    export default {
        components: {CardItem, PieChart},
        data () {
            return {
                titleLabel: '我的申请单',
                ordersTotalCount: 0,
                orderOptions: {
                    hasClickFn: true,
                    chart: {
                        spacing: [10, 10, 10, 10]
                    },
                    title: {
                        text: '',
                        position: 'middle',
                        fontSize: '16px',
                        y: 0,
                        useHTML: true,
                        zIndex: -1
                    },
                    tooltip: {
                        pointFormat: '{point.name}<br>{series.name}: {point.y}<br>占比: {point.percentage: .1f}%'
                    },
                    plotOptions: {
                        // showInLegend: true
                        labelEnabled: true,
                        distance: 30
                    },
                    series: [{
                        name: '申请单数量',
                        innerSize: '70%',
                        data: []
                    }]
                },
                loading: false,
                statusColor: {
                    // 已完成
                    succeed: '#ccc',
                    // 正在部署
                    deploying: '#0198e4',
                    // 已取消
                    canceled: '#ffaa00',
                    // 审批中
                    approving: '#61c359',
                    // 待处理
                    processing: '#fedb75',
                    // 待执行
                    performing: '#8bd8fe',
                    // 已执行
                    performed: '#707993',
                    // 已拒绝
                    refused: '#e64451',
                    // 失败
                    failed: '#ff0000'
                }
            }
        },
        created () {
            this.loading = true
            Api.get('db_orders', {}).then(res => {
                this.loading = false
                if (res && res.total_order_count) {
                    this.orderOptions.title.text = res.total_order_count ? `<p class="text-center">申请单总数</br>${res.total_order_count || 0}</p>` : ''
                    this.orderOptions.series[0].data = this.buildChartOptions(res.status_count)
                }
            }, () => {
                this.loading = false
            })
        },
        methods: {
            clickChartFn (event) {
                // bug UCMP-662【总览】我的申请单中对应跳转之后，点下一页过滤规则失效。 且统计数据与申请单管理中的数据不一致。

                // UCMP3-3391【总览】我的申请单统计数是居于用户权限总数，但跳转基于当前登录用户，跳转后两边数据不一致
                // 问题原因: UCMP-662引入, 订单跳转是用户能看到的身躯单数，不应该带上申请人参数
                let queryParam = {
                    status: event.point.statusCode
                }
                this.$router.push({path: '/orders', query: queryParam})
            },
            buildChartOptions (list) {
                return list.map(item => {
                    return {
                        name: item.status_name,
                        statusCode: item.status_code,
                        y: Number(item.status_count),
                        color: this.statusColor[item.status_code]
                    }
                })
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
