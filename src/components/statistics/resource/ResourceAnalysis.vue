<template lang="pug">
    div.full-height.overflow-y-auto.ans-cot
        div.top-charts.overflow-y-auto
            el-row.auto-height
                el-col.border-right.padding(:span="12" )
                    ChartItem(:title="resourceOccupyOption.title" notDashboard :filterItems="resourceTypeMap" v-loading="resourceOccupyOption.loading"  @changeFilterParams="resourceOccupyOption.changeType")
                        div.full-container(slot="chartCot")
                            BarChart(:options="resourceOccupyOption.chartOption")
                el-col.padding(:span="12")
                    ChartItem(:title="resourceVariationOption.title" notDashboard :filterItems="resourceTypeMap"  v-loading="resourceVariationOption.loading"  @changeFilterParams="resourceVariationOption.changeType")
                        div.full-container(slot="chartCot")
                            BarChart(:options="resourceVariationOption.chartOption")
        div.bot-table(v-loading="tableLoading")
            UcmpTableContainer(
                ref="resourceTableContainer"
                :pagination="pagination"
                :advance="advanceSwitch"
                :filterItems="filterItems"
                :submit="refreshTableData"
                :formData="formData"
                @sizeChange="handleSizeChange"
                @currentChange="handleCurrentChange"
                tableHeightAuto
                noResizeSync)
                el-select.margin-right(slot="custonItem" v-model="tableSearchParams.statistics_type" size="small" @change="changeStatisticsType")
                    el-option(v-for="item_type in statisticsItems" :key="item_type.value" :label="item_type.label" :value="item_type.value")
                div.position-relative(slot="tableContainer")
                    el-button.table-export.oper-icon-btn(size="small" icon="ucmp-icon-download" @click="exportReport")
                    el-table(:data="tableData" border)
                        el-table-column(type="index" width="45" label="序号")
                        el-table-column(v-for="column in tableColumns" :prop="column.prop" :key="column.prop" :label="column.label" :width="column.width")
                            template(slot='header' slot-scope="scope")
                                TableFilterHeader(@handleHeaderCommand="initTableData" :column="column" :searchParams="tableSearchParams")
                            template(slot-scope="scope")
                                a(v-if="column.link && (scope.row[column.prop] !== '0')" href="javascript:;" @click="goConsoleResouce(scope.row, column.prop)")
                                   span {{scope.row[column.prop]}}
                                span(v-else) {{scope.row[column.prop] || '--'}}
</template>
<script>
import ChartItem from '../../dashboard/CardItem'
import BarChart from '../../common/charts/BarCharts'
import TableFilterHeader from '@/components/common/TableFilterHeader'
import { mapGetters } from 'vuex'
import Api from '@api'
import FileSaver from 'file-saver'

const STATISTICS_TYPE = [
    {
        label: '组织机构',
        value: 'org'
    },
    {
        label: '应用',
        value: 'app',
        related: ['app', 'project']
    },
    {
        label: '项目',
        value: 'project',
        related: ['project']
    },
    {
        label: '用户',
        value: 'user',
        related: ['org', 'user']
    }
]

const statisticsItems = JSON.parse(JSON.stringify(STATISTICS_TYPE)).map(item => {
    return {
        label: `${item.label}视图`,
        value: item.value
    }
})

const XAXiIS_MAX_NUM = 9

export default {
    components: { ChartItem, BarChart, TableFilterHeader },
    data () {
        return {
            pagination: {
                index: 1,
                count: 1,
                size: 20,
                total: 0
            },
            advanceSwitch: false,
            formData: {},
            tableLoading: false,
            tableData: [],
            tableSearchParams: {
                statistics_type: 'org'
            },
            resourceOccupyOption: {
                title: '各组织云主机占用',
                loading: false,
                chartOption: {
                    chart: {
                        inverted: true,
                        spacing: [25, 10, 25, 10]
                    },
                    colors: ['#0198e4'],
                    tooltip: {
                        pointFormat: '{series.name}：{point.y}'
                    },
                    legend: {
                        enabled: true,
                        verticalAlign: 'bottom',
                        align: 'center',
                        y: 25
                    },
                    plotOptions: {
                        column: {
                            pointWidth: 20
                        }
                    },
                    xAxis: {
                        min: 0, // 默认到最小值
                        max: XAXiIS_MAX_NUM, // 默认到最大下标位置
                        scrollbar: {
                            enabled: true
                        },
                        tickLength: 0
                    },
                    yAxis: {
                        min: 0,
                        max: 200
                    },
                    series: []
                }
            },
            resourceVariationOption: {
                title: '各组织云主机变化量',
                loading: false,
                chartOption: {
                    chart: {
                        inverted: true,
                        spacing: [25, 10, 25, 10]
                    },
                    colors: ['#0198e4', '#ffaa00', '#e64451'],
                    tooltip: {
                        pointFormat: '{series.name}变化量：{point.y}'
                    },
                    plotOptions: {
                        labelEnabled: true,
                        labelLimit: 9,
                        showInLegend: true
                    },
                    xAxis: {
                        min: 0,
                        max: 3,
                        scrollbar: {
                            enabled: true
                        },
                        tickLength: 0
                    },
                    yAxis: {
                        min: 0,
                        max: 200
                    },
                    legend: {
                        enabled: true,
                        verticalAlign: 'bottom',
                        align: 'center',
                        y: 25
                    },
                    series: []
                }
            }
        }
    },
    created () {
        this.$set(this.resourceOccupyOption, 'changeType', this.changeOccupyType)
        this.$set(this.resourceVariationOption, 'changeType', this.changeVariationType)
        this.initChartsData('occupy')
        this.initChartsData('variation')
        this.initTableData()
    },
    methods: {
        changeOccupyType (param) {
            this.resourceOccupyOption.title = `各组织${param.title}占用`
            this.initChartsData('occupy', param.key, param.title)
        },
        changeVariationType (param) {
            this.resourceVariationOption.title = `各组织${param.title}变化量`
            this.initChartsData('variation', param.key)
        },
        initChartsData (type, serviceCode = 'ecs', title = '云主机') {
            if (type === 'occupy') {
                this.resourceOccupyOption.loading = true
                Api.get('resource_occupy_data', {service_code: serviceCode}).then(res => {
                    this.resourceOccupyOption.loading = false
                    let occupySeriesData = []
                    if (res && res.list) {
                        let points = []
                        occupySeriesData = res.list.map(item => {
                            points.push(item.cnt)
                            return [item.ownerName, item.cnt]
                        })

                        if (points.length) {
                            let maxPoint = Math.max.apply([], points)
                            this.resourceOccupyOption.chartOption.yAxis.max = maxPoint * 1.1 || 200
                        }

                        this.resourceOccupyOption.chartOption.series = []
                        this.resourceOccupyOption.chartOption.series.push({})
                        this.$set(this.resourceOccupyOption.chartOption.series[0], 'data', occupySeriesData)
                        this.$set(this.resourceOccupyOption.chartOption.series[0], 'name', `${title}数量`)
                    }

                    //UCMP3-3356【资源统计】资源统计里面云主机切换到mysql,再次切回来，图形变宽了，显示不合理
                    let minNum = Math.min(...[XAXiIS_MAX_NUM, (occupySeriesData.length - 1)])
                    this.$set(this.resourceOccupyOption.chartOption.xAxis, 'max', minNum)
                }, () => {
                    this.resourceOccupyOption.loading = false
                })
            }
            if (type === 'variation') {
                this.resourceVariationOption.loading = true
                Api.get('resource_variation_data', {service_code: serviceCode}).then(res => {
                    this.resourceVariationOption.loading = false
                    if (res && res.length) {
                        let variationSeriesData = res.map(item => {
                            let data = item.data.map(data_item => {
                                return [data_item.ownerName, data_item.cnt]
                            })
                            return {
                                ...item,
                                data
                            }
                        })

                        if (res[0].data.length - 1 < this.resourceVariationOption.chartOption.xAxis.max)
                            this.$set(this.resourceVariationOption.chartOption.xAxis, 'max', res[0].data.length - 1)
                        this.$set(this.resourceVariationOption.chartOption, 'series', variationSeriesData)
                    }
                }, () => {
                    this.resourceVariationOption.loading = false
                })
            }
        },

        refreshTableData (params) {
            this.tableSearchParams = {
                statistics_type: this.tableSearchParams.statistics_type,
                ...params
            }
            this.initTableData()
        },

        initTableData (headParams) {
            this.tableSearchParams = {...this.tableSearchParams, ...headParams}
            let params = {
                ...this.tableSearchParams,
                pageNum: this.pagination.index,
                pageSize: this.pagination.size
            }
            this.tableLoading = true
            Api.get('each_role_resource_data', params).then(res => {
                this.tableLoading = false
                if (res) {
                    this.tableData = res.list || []
                    this.pagination.total = res.total || 0
                }
            }, () => {
                this.tableLoading = false
            })
        },
        changeStatisticsType (val) {
            this.pagination.index = 1
            this.initTableData()
        },
        handleSizeChange (val) {
            this.pagination.index = 1
            this.pagination.size = val
            this.initTableData()
        },
        handleCurrentChange (val) {
            this.pagination.index = val
            this.initTableData()
        },
        /**
         * @description 跳转控制台
         */
        goConsoleResouce (row, service_code) {
            let filterParam = {type: 'resourceAnalysis', params: {}}
            switch (this.tableSearchParams.statistics_type) {
                case 'org':
                    if (row.org_id)
                        filterParam.params.org_id = row.org_id
                    break
                case 'app':
                    if (row.app_id) {
                        filterParam.params.owner_type = 'app'
                        filterParam.params.owner = row.app_id
                    }
                    break
                case 'project':
                    if (row.project_id || row.org_id) {
                        // filterParam.params.owner_type = 'app'
                        if (row.project_id)
                            filterParam.params.project_id = row.project_id
                        if (row.org_id)
                            filterParam.params.org_id = row.org_id
                    }
                    break
                case 'user':
                    if (row.user_id)
                        filterParam.params.user_id = row.user_id
                    break
                default:
                    break
            }

            this.$router.push({path: `/serviceInstance/${service_code}`, query: filterParam})
        },

        exportReport () {
            // UCMP3-4538【资源统计分析-导出】资源统计分析页面，按照名称查询后导出仍是所有数据，需修改导出为查询的数据
            let param = JSON.parse(JSON.stringify(this.tableSearchParams))
            param.viewType = param.statistics_type
            delete param.statistics_type

            Api.get('export_resource_analysis', param, true, 'blob').then(res => {
                let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                FileSaver.saveAs(blob, '资源统计分析报表.xlsx')
                this.$notify({
                    type: 'success',
                    title: '成功',
                    message: '导出成功'
                })
            })
        }
    },

    computed: {
        statisticsItems () {
            statisticsItems.forEach(item => {
                if (item.value === 'project') 
                    item.label = `${this.selectedBusinessLabel}视图`
            })
            return statisticsItems
        },
        selectedBusinessLabel () {
            return this.businessOrproject === 'business' ? '业务' : '项目'
        },
        ...mapGetters([
            'metadata', 'businessOrproject'
        ]),
        resourceTypeMap () {
            if (this.metadata) {
                let metaList = this.metadata.filter(meta => !meta.asAttribute && !meta.implements && !meta.parent && meta.group !== 'blueprint' && meta.group !== 'tag')
                return metaList.map(resource => {
                    return {
                        key: resource.service_code,
                        title: resource.name
                    }
                })
            } else
                return []
        },
        tableColumns () {
            let roleColumn = this.selectedStatisticsTypes.map(item => {
                if (item.value === 'project') {
                    return {
                        prop: item.value,
                        label: this.selectedBusinessLabel
                    }
                } else {
                    return {
                        prop: item.value,
                        label: item.label
                    }
                }
            })
            let columns = [
                ...roleColumn,
                ...this.resourceTypeMap.map(item => {
                    return {
                        prop: item.key,
                        label: item.title,
                        order: true,
                        link: true
                    }
                })
            ]
            return columns
        },
        selectedStatisticsTypes () {
            let types = []
            let selectedStatisticsType = STATISTICS_TYPE.find(_type => _type.value === this.tableSearchParams.statistics_type)
            if (!selectedStatisticsType.related)
                types.push(selectedStatisticsType)
            else {
                STATISTICS_TYPE.forEach(item => {
                    if (selectedStatisticsType.related.includes(item.value))
                        types.push(item)
                })
            }
            return types
        },
        filterItems () {
            return this.selectedStatisticsTypes.map(filter_item => {
                if (filter_item.value === 'project') {
                    return {
                        label: `请输入${this.selectedBusinessLabel}名称`,
                        key: filter_item.value
                    }
                } else {
                    return {
                        label: `请输入${filter_item.label}名称`,
                        key: filter_item.value
                    }
                }
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.ans-cot {
    padding: 0 10px;
    overflow-x: hidden;
}
.bot-table {
    min-height: 200px;
}
.auto-height {
    height: auto;
}
.table-export {
    position: absolute;
    top: -50px;
    right: 0;
}
</style>

