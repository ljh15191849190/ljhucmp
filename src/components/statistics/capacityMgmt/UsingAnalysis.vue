<template lang="pug">
    div.full-height
        div.filter-items
            // el-select.margin-right(size="small" v-model="filterItems.org" placeholder="请选择组织机构")
            //   el-option(v-for="(org, index) in orgs" :key="index" :label="org.name" :value="org.value")
            // el-select.margin-right(size="small" v-model="filterItems.bus" placeholder="请选择业务")
            //   el-option(v-for="(org, index) in orgs" :key="index" :label="org.name" :value="org.value")
            // el-select.margin-right(size="small" v-model="filterItems.app" placeholder="请选择应用")
            //   el-option(v-for="(org, index) in orgs" :key="index" :label="org.name" :value="org.value")
            el-date-picker.picker-width.margin-right(size="small" v-model="dateRange" type="daterange" @change="changeTime" :value-format="dateFormat" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :clearable="timeClearable")
            el-button.oper-icon-btn(size="small" icon="ucmp-icon-download" @click="exportReport")
        div.card-resource.full-container
            div.top-chart-cot.d-flex
              div.dash-chart-container.p-2(v-for="(data, key) in chartsData" :key="key")
                div.chart-header {{getLabel(key)}}
                div.chart-container
                    BarChart(:options="buildOptions(data, key)")
            div.bot-chart-cot
                div.dash-chart-container
                    div.chart-header 资源使用率对比
                    div.chart-container
                        LineChart(:options="lineOptions")
</template>
<script>
import BarChart from '../../common/charts/BarCharts'
import LineChart from '../../common/charts/LineCharts'
import Api from '@api'
import FileSaver from 'file-saver'

const sortByProp = function (prop) {
    return (obj1, obj2) => {
        let val1 = obj1[prop]
        let val2 = obj2[prop]
        if (val1 < val2)
            return -1
        else if (val1 > val2)
            return 1
        else
            return 0
    }
}

export default {
    data () {
        return {
            dateRange: [],
            dateFormat: 'yyyy-MM-dd',
            chartsData: {},
            timeClearable: false,
            lineOptions: {
                type: 'area',
                yAxis: {
                    title: {
                        text: '使用率'
                    },
                    labels: {
                        formatter: function () {
                            return this.value + '%'
                        }
                    },
                    lineWidth: 1,
                    lineColor: '#000'
                },
                tooltip: {
                    pointFormat: '{series.name}<br>使用率：{point.y:.2f}%<br>{point.x: %y-%m-%d}'
                },
                legend: {
                    enabled: true
                },
                series: []
            }
        }
    },
    created () {
        let now = new Date()
        // 设置默认查询时间为一周内
        let startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 7)).toISOString().slice(0, 10)
        let endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1)).toISOString().slice(0, 10)
        this.dateRange.push(startDate)
        this.dateRange.push(endDate)
        this.initChartsData(this.dateRange)
    },
    methods: {
        changeTime () {
            this.initChartsData(this.dateRange)
        },
        getLabel (key) {
            switch (key) {
                case 'cpu': return 'CPU使用率排行'
                case 'memory': return '内存使用率排行'
                case 'disk': return '存储使用率排行'
                default: break
            }
        },
        initChartsData (timeRange) {
            this.chartsData = {}
            let startTime = timeRange ? new Date(timeRange[0]).getTime() : ''
            let endTime = timeRange ? new Date(timeRange[1]).getTime() : ''
            Api.get('each_provider_resource', {startTime: startTime, endTime: endTime}).then(res => {
                if (res)
                    this.chartsData = res
            })
            Api.get('resource_usage', {startTime: startTime, endTime: endTime}).then(res => {
                if (res) {
                    // UCMP-437 每次在拿到新数据之前清空原有的图表数据
                    this.lineOptions.series = []
                    let seriesArr = []
                    for (const key in res) {
                        // UCMP-474 对应的指标值为null时取消原有过滤
                        if (res.hasOwnProperty(key)) {
                            const dataArr = res[key] || []
                            let name = ''
                            if (key === 'cpu') name = 'CPU'
                            else if (key === 'memory') name = '内存'
                            else name = '存储'
                            let series_item = {
                                name: name,
                                fillOpacity: 0.3,
                                data: []
                            }
                            dataArr.forEach(data => {
                                let _data = [data.date, data.usage_rate * 100]
                                series_item.data.push(_data)
                            })
                            seriesArr.push(series_item)
                        }
                    }
                    this.lineOptions.series = seriesArr.filter(item => {
                        return item.data.length !== 0
                    })
                    this.lineOptions.series.forEach(item => {
                        item.data = item.data.sort(sortByProp(0))
                    })
                }
            })
        },
        buildOptions (data, key) {
            if (!data)
                return {}
            let dataArr = []
            data.forEach(item => {
                dataArr.push({
                    name: item.provider_name,
                    y: +((item.user_rate * 100).toFixed(2))
                })
            })
            let seriesName = ''
            if (key === 'cpu') seriesName = 'CPU'
            else if (key === 'memory') seriesName = '内存'
            else seriesName = '存储'
            return {
                yAxis: {
                    title: {
                        text: ''
                    },
                    labels: {
                        formatter: function () {
                            return this.value + '%'
                        }
                    },
                    lineWidth: 1,
                    lineColor: '#000'
                },
                tooltip: {
                    pointFormat: '{series.name}:{point.y:.2f}%'
                },
                series: [{
                    name: seriesName,
                    data: dataArr
                }]
            }
        },

        exportReport () {
            let param = {startDate: this.dateRange[0], endDate: this.dateRange[1]}
            Api.get('export_use_statics', param, true, 'blob').then(res => {
                let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                FileSaver.saveAs(blob, '使用分析报表.xlsx')
                this.$notify({
                    type: 'success',
                    title: '成功',
                    message: '导出成功'
                })
            })
        }
    },
    components: { BarChart, LineChart }
}
</script>
<style lang="scss" scoped>
.filter-items {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
}
.full-height {
    margin-top: -15px;
}

.dash-chart-container {
    border-bottom: 1px solid #ddd;
    margin: 0;
    height: 100%;
    &:not(:nth-last-child(1)) {
        border-right: 1px solid #ddd;
    }
}
.top-chart-cot, .bot-chart-cot{
    height: 50%;
    width: 100%;
    &.top-chart-cot{
        .dash-chart-container{
            width: 33.3%;
        }
    }
    &.bot-chart-cot{
        .dash-chart-container{
            width: 100%;
        }
    }
}
</style>

