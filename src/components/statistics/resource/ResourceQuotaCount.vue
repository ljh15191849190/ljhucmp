<template lang="pug">
    div.full-height.overflow-y-auto.ans-cot
        div.top-charts.overflow-y-auto
            el-row.auto-height
                el-col.padding(:span="23")
                    ChartItem(:title="resourceOccupyOption.title" notDashboard :filterItemsType='objectTypes' :filterItems="serviceCodes" v-loading="resourceOccupyOption.loading" @changeFilterParamsType='changeFilterParamsType'  @changeFilterParams="resourceOccupyOption.changeType")
                        div.full-container(slot="chartCot")
                            div.handle-left-btn.w30(v-if='chartpagination.index>1')
                                i.el-icon-arrow-left(@click="handlePrev")
                            BarChart(:options="resourceOccupyOption.chartOption")
                            div.handle-right-btn.w30(v-if='chartpagination.hasNextPage')
                                i.el-icon-arrow-right(@click="handleNext")
        div.bot-table(v-loading="tableLoading")
            UcmpTableContainer(
                ref="resourceTableContainer"
                :pagination="pagination"
                :advance="advanceSwitch"
                :submit="refreshTableData"
                @sizeChange="handleSizeChange"
                @currentChange="handleCurrentChange"
                tableHeightAuto
                noResizeSync)
                div.position-relative(slot="tableContainer")
                    el-select.mb10.margin-right(v-model="tableSearchParams.statistics_type" size="small" @change="changeStatisticsType")
                        el-option(v-for="item_type in statisticsItems" :key="item_type.value" :label="item_type.label" :value="item_type.value")
                    el-select.margin-right(v-if='tableSearchParams.statistics_type==="project"' clearable placeholder="请选择项目名称" v-model="tableSearchParams.project" size="small" @change="projectClick")
                        el-option( v-for="item in projectList" :key="item.id" :value="item.id" :label="`${item.name}`")
                    el-select.margin-right(v-if='tableSearchParams.statistics_type==="project"' clearable placeholder="请选择应用名称" v-model="tableSearchParams.app" size="small")
                        el-option( v-for="item in appList" :key="item.id" :value="item.id" :label="item.app_name")
                    el-select.margin-right(v-if='tableSearchParams.statistics_type==="resource_pool"' clearable placeholder="请选择资源池名称" v-model="tableSearchParams.resource_pool" size="small")
                        el-option( v-for="item in resourcePoolList" :key="item.template_id" :value="item.template_id" :label="item.template_name")
                    Input-Tree.input-tree.margin-right(
                        v-if='tableSearchParams.statistics_type==="org"'
                        v-model="tableSearchParams.org"
                        placeholder="请选择组织机构"
                        name="org"
                        key="org"
                        :defaultProps="orgDefaultProps"
                        :treeData="orgList"
                        @nodeClick="nodeClick"
                        )
                    el-button(size="small" @click="initTableData" type="primary") 查询
                    el-button.table-export.oper-icon-btn(size="small" icon="ucmp-icon-download" @click="exportReport")
                    el-table(:data="tableData" border)
                        el-table-column(type="index" width="45" label="序号")
                        el-table-column(v-for="column in tableColumns" :align='column.align' :prop="column.prop" :key="column.prop" :label="column.label" :width="column.width")
                            el-table-column(v-if='column.children' v-for="col in column.children" :prop="col.prop" :key="col.prop" :label="col.label" :width="col.width")
                                template(slot-scope="scope")
                                    span(v-if='col.prop.substring(col.prop.lastIndexOf("_") + 1, col.prop.length)==="usage"') 
                                        DataBar(:activeText='scope.row[col.prop]' :invalidText="scope.row[column.prop+'_total']-scope.row[col.prop]===0?0:(scope.row[column.prop+'_total']-scope.row[col.prop]||'--')")
                                    span(v-else) {{scope.row[col.prop] || '--'}}
                            template(slot-scope="scope")
                                span {{scope.row[column.prop] || '--'}}
</template>
<script>
import ChartItem from '../../dashboard/CardItem'
import BarChart from '../../common/charts/BarCharts'
import InputTree from '@common/InputTree'
import Api from '@api'
import FileSaver from 'file-saver'
import DataBar from '@common/DataBar'
import { mapGetters } from 'vuex'

const STATISTICS_TYPE = [
    {
        label: '组织机构',
        value: 'org'
    },
    {
        label: '项目',
        value: 'project'
    },
    {
        label: '资源池',
        value: 'resource_pool'
    }
]

const statisticsItems = JSON.parse(JSON.stringify(STATISTICS_TYPE)).map(item => {
    return {
        label: item.label,
        value: item.value
    }
})

// const XAXiIS_MAX_NUM = 9

export default {
    components: { ChartItem, BarChart, InputTree, DataBar },
    data () {
        return {
            statisticsItems: statisticsItems,
            pagination: {
                index: 1,
                count: 1,
                size: 10,
                total: 0
            },
            chartpagination: {
                index: 1,
                count: 1,
                size: 5,
                total: 0,
                hasPreviousPage: false,
                hasNextPage: false
            },
            advanceSwitch: false,
            tableLoading: false,
            tableData: [],
            tableSearchParams: {
                statistics_type: 'org',
                app: '',
                project: '',
                org: {},
                resource_pool: ''
            },
            appList: [],
            projectList: [],
            orgList: [],
            resourcePoolList: [],
            resourceOccupyOption: {
                // title: '各组织云主机占用',
                loading: false,
                chartOption: {
                    chart: {
                        // inverted: true,
                        spacing: [25, 10, 25, 10]
                    },
                    colors: ['#0198e4', '#749F83', '#ffaa00', '#e64451'],
                    tooltip: {
                        pointFormat: '{series.name}：{point.y}%'
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
                        // min: 0, // 默认到最小值
                        // max: XAXiIS_MAX_NUM, // 默认到最大下标位置
                        // scrollbar: {
                        //     enabled: true
                        // },
                        tickLength: 0
                    },
                    yAxis: {
                        title: {
                            text: '使用率'
                        },
                        labels: {
                            formatter: function () {
                                return this.value + '%'
                            }
                        }
                    },
                    series: []
                }
            },
            objectTypes: [],
            serviceCodes: [],
            SearchserviceCode: 'ecs',
            SearchobjectType: 'app',
            orgDefaultProps: {
                id: 'id',
                parentId: 'parent_id',
                children: 'sub_orgs',
                label: 'org_name'
            },
            tableColumns: [
                { prop: 'object_name', label: '配额对象' }
            ]
        }
    },
    created () {
        this.init()
        this.$set(this.resourceOccupyOption, 'changeType', this.changeOccupyType)
        this.initChartsData()
        this.statisticsItems[2].label = this.systemConfig.configure_template
    },
    methods: {
        handlePrev () {
            if (this.chartpagination.index === 1) 
                return false
            this.chartpagination.index = this.chartpagination.index - 1
            this.initChartsData()
        },
        handleNext () {
            this.chartpagination.index = this.chartpagination.index + 1
            this.initChartsData()
        },
        // 选择项目
        projectClick (val) {
            // 应用列表
            Api.get('getProjectOfApps', {business_id: val, page: 1, limit: 9999}, true).then(res => {
                this.appList = res.data.apps
            })
        },
        init () {
            Api.get('get_Quota_object_types', {}).then(res => {
                res.forEach(item => {
                    item.key = item.code
                    item.title = item.name
                })
                this.objectTypes = res
            })
            Api.get('get_Quota_service_codes', {}).then(res => {
                res.forEach(item => {
                    item.key = item.code
                    item.title = item.name
                })
                this.serviceCodes = res
            })
            // 表头
            Api.get('get_Quota_Statistic_item', {}).then(res => {
                let Columns = res.map(item => {
                    return {prop: item.key, label: item.label, align: 'center', children: [{ prop: item.key + '_total', label: '总量' }, { prop: item.key + '_usage', label: '使用量', width: 120 }]}
                })
                this.tableColumns.push(...Columns)
            })

            // 项目列表
            Api.get('getAllProject', {}, true).then(res => {
                this.projectList = res.data
            })
            // 组织机构
             Api.get('orgTree', {}, true).then(res => {
                this.orgList = res.data
                this.initTableData()
            })
        },
        changeFilterParamsType (param) {
            this.SearchobjectType = param.key
            this.initChartsData()
        },
        //serviceCode
        changeOccupyType (param) {
            this.SearchserviceCode = param.key
            this.initChartsData()
        },
        nodeClick (data) {
            // this.tableSearchParams.org = data.id
        },
        // baremetal  ecs
        initChartsData () {
            this.resourceOccupyOption.loading = true
            this.$set(this.resourceOccupyOption.chartOption, 'series', [])
            Api.get('get_Quota_static_chart', {service_code: this.SearchserviceCode, objectType: this.SearchobjectType, offset: this.chartpagination.index, limit: this.SearchserviceCode === 'ecs' ? this.chartpagination.size : 10}).then(res => {
                this.resourceOccupyOption.loading = false
                let occupySeriesData = []
                if (res && res.length === 1) {
                    this.chartpagination.hasNextPage = res[0].page_info.hasNextPage
                    let points = []
                    occupySeriesData = res[0].page_info.list.map(item => {
                        points.push(item.value)
                        let clom_value = Math.floor(item.value * 10) / 10
                        return [item.object_name, clom_value]
                    })

                    if (points.length) {
                        let maxPoint = Math.max.apply([], points)
                        this.resourceOccupyOption.chartOption.yAxis.max = maxPoint * 1.1 || 200
                    }
                    this.resourceOccupyOption.chartOption.series = []
                    this.resourceOccupyOption.chartOption.series.push({})
                    this.$set(this.resourceOccupyOption.chartOption.series[0], 'data', occupySeriesData)
                    this.$set(this.resourceOccupyOption.chartOption.series[0], 'name', res[0].label)
                    // let minNum = Math.min(...[XAXiIS_MAX_NUM, (occupySeriesData.length - 1)])
                    // this.$set(this.resourceOccupyOption.chartOption.xAxis, 'max', minNum)
                } else if (res && res.length > 1) {
                    this.chartpagination.hasNextPage = res[0].page_info.hasNextPage
                    let variationSeriesData = res.map(item => {
                        let data = item.page_info.list.map(data_item => {
                            let clom_value = Math.floor(data_item.value * 10) / 10
                            return [data_item.object_name, clom_value]
                        })
                        return {
                            data,
                            name: item.label
                        }
                    })
                    // if (res[0].page_info.list.length - 1 < this.resourceOccupyOption.chartOption.xAxis.max)
                    //     this.$set(this.resourceOccupyOption.chartOption.xAxis, 'max', res[0].page_info.list.length - 1)
                    this.$set(this.resourceOccupyOption.chartOption, 'series', variationSeriesData)
                }
            }, () => {
                this.resourceOccupyOption.loading = false
            })
        },

        refreshTableData (params) {
            this.tableSearchParams = {
                statistics_type: this.tableSearchParams.statistics_type,
                ...params
            }
            this.initTableData()
        },

        initTableData () {
            let params = {
                objectType: this.tableSearchParams.app ? 'app' : this.tableSearchParams.statistics_type,
                objectId: this.tableSearchParams.app ? this.tableSearchParams.app : (this.tableSearchParams.project || this.tableSearchParams.org.id || this.tableSearchParams.resource_pool),
                // objectId: this.tableSearchParams.app || this.tableSearchParams.project || this.tableSearchParams.org.id,
                offset: this.pagination.index,
                limit: this.pagination.size
            }
            this.tableLoading = true
            Api.get('get_Quota_Statistics', params).then(res => {
                this.tableLoading = false
                if (res) {
                    res.list.forEach(item => {
                        for (let i in item.quota) {
                            if (item.quota[i] && item.quota[i].total) {
                                item[`${i}_total`] = item.quota[i].total || 0
                                item[`${i}_usage`] = item.quota[i].usage || 0
                            }
                        }
                    })
                    this.tableData = res.list || []
                    this.pagination.total = res.total || 0
                }
            }, () => {
                this.tableLoading = false
            })
        },
        // 下拉搜索
        changeStatisticsType (val) {
            this.pagination.index = 1
            this.tableSearchParams.statistics_type = val
            this.tableSearchParams.app = null
            this.tableSearchParams.project = null
            this.tableSearchParams.resource_pool = null
            this.tableSearchParams.org = {}
            if (val === 'resource_pool') {
                let pageParam = { offset: 1, limit: 99999, template_id: 'page' }
                Api.get('configTemplate', pageParam, true).then(
                    res => {
                        this.resourcePoolList = res.list
                    }
                )
            }
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

        exportReport () {
            // UCMP3-4538【资源统计分析-导出】资源统计分析页面，按照名称查询后导出仍是所有数据，需修改导出为查询的数据
            let param = {}
            param.objectType = this.tableSearchParams.app ? 'app' : this.tableSearchParams.statistics_type
            param.objectId = this.tableSearchParams.app ? this.tableSearchParams.app : (this.tableSearchParams.project || this.tableSearchParams.org.id || this.tableSearchParams.resource_pool)
            // param.objectType = this.tableSearchParams.statistics_type
            // param.objectId = this.tableSearchParams.app || this.tableSearchParams.project || this.tableSearchParams.org.id
            Api.get('get_Quota_Statistic_download', param, true, 'blob').then(res => {
                let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                FileSaver.saveAs(blob, '配额统计报表.xlsx')
                this.$notify({
                    type: 'success',
                    title: '成功',
                    message: '导出成功'
                })
            })
        }
    },
    computed: {
        ...mapGetters([
            'systemConfig'
        ])
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
    top: 0;
    right: 0;
}
.mb10{
    margin-bottom: 10px
}
.input-tree{
    width: 200px;
    display: inline-block;
    position: relative;
}
.handle-left-btn{
    font-size: 24px;
    position: absolute;
    cursor: pointer;
    top: 50%;
    left: -15px;
}
.handle-right-btn{
    font-size: 24px;
    cursor: pointer;
    position: absolute;
    top: 50%;
    right: -50px;
}
</style>

