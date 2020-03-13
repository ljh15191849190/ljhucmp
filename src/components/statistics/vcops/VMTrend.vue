<template lang="pug">
    div.resource-rank.vcops-item
        div.vcops-item__panel.position-relative.margin-bottom
            //el-tooltip(content="导出" placement="bottom")
                el-button.oper-icon-btn(
                size="small"
                icon="ucmp-icon-download"
                @click="exportReport")

            div.vcops-item__filter-panel
                label.margin-right 数据中心
                el-select.margin-right(size="small" @change='dataCenterChange' v-model="dataCenter" placeholder="请选择数据中心")
                    el-option(v-for="item in dataCenters" :value="item.resource_id" :key="item.resource_id" :label="item.resource_name")
                label.margin-left.margin-right 群集
                el-select.margin-right(size="small" @change='clustersChange' v-model="clusters" placeholder="请选择群集")
                    el-option(v-for="item in clustersData" :value="item.resource_id" :key="item.resource_id" :label="item.resource_name")
                label.margin-left.margin-right 日期范围
                el-date-picker(
                    v-model="dateRange"
                    type="daterange"
                    size="small"
                    value-format="yyyy-MM-dd"
                    :picker-options="pickerOptions")
                el-button.filter-btn(type="primary" size="small" @click="getResourceRank") 查询
        div
            LineChart(:options="chartOption")
</template>

<script>
    import LineChart from '@common/charts/LineCharts'
    import Api from '@api'
    import reportMixin from '../report/report.mixin'

    /**
     * 虚拟机增长趋势
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'VMTrend',
        mixins: [reportMixin],
        components: {
            LineChart
        },
        data () {
            return {
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
                },
                dataCenter: '',
                dataCenters: [],
                dateRange: null,
                clusters: '',
                clustersData: []
            }
        },
        computed: {},
        methods: {
            dataCenterChange (val) {
                if (val !== '') 
                    this.clusters = ''
            },
            clustersChange (val) {
                if (val !== '') 
                    this.dataCenter = ''
            },
            getDataCenters () {
                Api.get('vcops_data_centers', {}, true).then(res => {
                    this.dataCenters = res || []
                    if (this.dataCenters.length) {
                        this.dataCenter = this.dataCenters[0].resource_id
                        this.getResourceRank()
                    }
                })
            },
            getDataClusters () {
                Api.get('vcops_data_clusters', {}, true).then(res => {
                    this.clustersData = res || []
                })
            },

            getResourceRank () {
                let params = {datacenterId: this.dataCenter || this.clusters}
                params.from = this.dateRange ? Date.parse((this.dateRange[0] + ' 00:00:00').replace(/-/g, '/')) : ''
                params.to = this.dateRange ? Date.parse((this.dateRange[1] + ' 23:59:59').replace(/-/g, '/')) : ''
                Api.get('vcops_vm_stats', params, true).then(res => {
                    if (res && res.history_data && res.history_data.length) {
                        let historyData = res.history_data
                        let categories = historyData.map(item => item.time + ':00')
                        this.chartOption.xAxis.categories = categories
                        this.chartOption.series = [{
                            type: 'spline',
                            name: '历史',
                            data: historyData.map(item => item.vm_num)
                        }]
                    }
                })
            },

            exportReport () {

            }
        },
        created () {
            this.dateRange = this.getCurMonthRange()
            this.getDataCenters()
            this.getDataClusters()
        }
    }
</script>

<style lang="scss" scoped>
    .vcops-item__panel {
        height: 30px;
    }
</style>
