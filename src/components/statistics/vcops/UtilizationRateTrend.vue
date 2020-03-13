<template lang="pug">
    div.utilization-rate-trend.vcops-item
        div.vcops-item__panel.position-relative.margin-bottom
            //el-tooltip(content="导出" placement="bottom")
                el-button.oper-icon-btn(
                size="small"
                icon="ucmp-icon-download"
                @click="exportReport")

            div.vcops-item__filter-panel
                label.margin-right 环境
                el-select.margin-right(size="small" v-model="resourceId" placeholder="请选择环境")
                    el-option(v-for="item in resources" :value="item.resource_id" :key="item.resource_id" :label="item.resource_name")
                label.margin-left.margin-right 日期范围
                el-date-picker(
                v-model="dateRange"
                type="daterange"
                size="small"
                value-format="yyyy-MM-dd"
                :picker-options="pickerOptions")

                el-button.filter-btn(type="primary" size="small" @click="getResourceRank") 查询
        div.vcops__cards
            el-card(v-for="(cardItem, index) in cards" :header="cardItem.header" :key="index" shadow="hover" :body-style="{padding: '6px'}")
                LineChart(:options="cardItem.chartOption")
</template>

<script>
    import LineChart from '@common/charts/LineCharts'
    import Api from '@api'
    import reportMixin from '../report/report.mixin'

    /**
     * 利用率趋势
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'UtilizationRateTrend',
        mixins: [reportMixin],
        components: {
            LineChart
        },
        data () {
            return {
                cards: [
                    {
                        header: 'CPU容量利用率趋势(GHz)',
                        chartOption: {
                            legend: {
                                enabled: true,
                                floating: true,
                                verticalAlign: 'top',
                                align: 'right',
                                y: -25
                            },
                            tooltip: {
                                pointFormat: '{series.name}：{point.y}'
                            },
                            series: [],
                            xAxis: {categories: []}
                        }
                    },
                    {
                        header: '内存容量利用率趋势(TB)',
                        chartOption: {
                            legend: {
                                enabled: true,
                                floating: true,
                                verticalAlign: 'top',
                                align: 'right',
                                y: -25
                            },
                            tooltip: {
                                pointFormat: '{series.name}：{point.y}'
                            },
                            series: [],
                            xAxis: {categories: []}
                        }
                    },
                    {
                        header: '磁盘空间容量利用率趋势(TB)',
                        chartOption: {
                            legend: {
                                enabled: true,
                                floating: true,
                                verticalAlign: 'top',
                                align: 'right',
                                y: -25
                            },
                            tooltip: {
                                pointFormat: '{series.name}：{point.y}'
                            },
                            series: [],
                            xAxis: {categories: []}
                        }
                    }
                ],
                resourceId: '', // 环境
                resources: [],
                dateRange: null

            }
        },
        computed: {},
        methods: {
            getEnvList () {
                Api.get('vcops_resources', {}, true).then(res => {
                    this.resources = res || []
                    if (this.resources.length) {
                        //
                        this.resourceId = this.resources[0].resource_id
                        this.getResourceRank()
                    }
                })
            },

            getResourceRank () {
                let params = {resourceId: this.resourceId}
                params.from = this.dateRange ? Date.parse((this.dateRange[0] + ' 00:00:00').replace(/-/g, '/')) : ''
                params.to = this.dateRange ? Date.parse((this.dateRange[1] + ' 23:59:59').replace(/-/g, '/')) : ''
                Api.get('vcops_capacity_usage', params, true).then(res => {
                    if (res.cpu && res.cpu[0] && res.cpu[0].history_data && res.cpu[0].history_data.length) {
                        let cpuTime = res.cpu[0].history_data.map(item => item.time + ':00')
                        let cpuTotal = res.cpu[0].history_data.map(item => item.cpu_capacity)
                        let cpuUsage = res.cpu[0].history_data.map(item => item.cpu_usage)

                        this.cards[0].chartOption.xAxis.categories = cpuTime
                        this.cards[0].chartOption.series = [{
                            type: 'spline',
                            name: '总量',
                            data: cpuTotal
                        }, {
                            type: 'spline',
                            name: '使用量',
                            // dashStyle: 'Dash',
                            data: cpuUsage
                        }]
                    }

                    if (res.mem && res.mem[0] && res.mem[0].history_data && res.mem[0].history_data.length) {
                        let memTime = res.mem[0].history_data.map(item => item.time + ':00')
                        let memTotal = res.mem[0].history_data.map(item => item.mem_capacity)
                        let memUsage = res.mem[0].history_data.map(item => item.mem_usage)

                        this.cards[1].chartOption.xAxis.categories = memTime
                        this.cards[1].chartOption.series = [{
                            type: 'spline',
                            name: '总量',
                            data: memTotal
                        }, {
                            type: 'spline',
                            name: '使用量',
                            data: memUsage
                        }]
                    }

                    if (res.disk && res.disk[0] && res.disk[0].history_data && res.disk[0].history_data.length) {
                        let diskTime = res.disk[0].history_data.map(item => item.time + ':00')
                        let diskTotal = res.disk[0].history_data.map(item => item.disk_capacity)
                        let diskProvisioned = res.disk[0].history_data.map(item => item.disk_provisioned)
                        let diskUsage = res.disk[0].history_data.map(item => item.disk_usage)

                        this.cards[2].chartOption.xAxis.categories = diskTime
                        this.cards[2].chartOption.series = [{
                            type: 'spline',
                            name: '总量',
                            data: diskTotal
                        }, {
                            type: 'spline',
                            name: '分配量',
                            data: diskProvisioned
                        }, {
                            type: 'spline',
                            name: '使用量',
                            data: diskUsage
                        }]
                    }
                })
            },

            exportReport () {
            }
        },
        created () {
            this.dateRange = this.getCurMonthRange()
            this.getEnvList()
        }
    }
</script>

<style lang="scss" scoped>
    .vcops__cards {
        height: calc(100% - 42px);
        overflow-y: auto;
    }
</style>
