<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.overflow-y-auto.full-height.bill-container(slot="content")
            div.bill-chart-header
                div.header-left
                    el-tabs(v-model="activeTab" @tab-click="handleTabClick")
                        el-tab-pane(v-for="item in tabs" :label="item.label" :name="item.name" :key="item.name")
                div.header-right
                    template(v-if="activeTab === 'org'")
                        span.sub-title 部门
                        Input-Tree.form-width(v-model="orgObj" :defaultProps="defaultProps" :treeData="orgList" @nodeClick="nodeClick")
                    template(v-else-if="activeTab === 'business'")
                        span.sub-title {{businessOrproject==='business'?'业务':"项目"}}
                        el-select.form-width(v-model="business" size="small" @change="businessChange")
                            el-option(v-for="item in businessList" :key="item.id" :value="item.id" :label="item.name")
                        <!--el-select.form-width(-->
                        <!--v-model="business"-->
                        <!--@change="businessChange"-->
                        <!--remote-->
                        <!--filterable-->
                        <!--clearable-->
                        <!--:remote-method="getBusinessList"-->
                        <!--@clear="getBusinessList"-->
                        <!--size="small"-->
                        <!--placeholder="请输入业务名称或简称查询")-->
                            <!--el-option(v-for="item in businessList" :key="item.id" :value="item.id" :label="item.name")-->
                    template(v-else)
                        span.sub-title 应用
                        el-select.form-width(v-model="app" @change="appChange" size="small")
                            el-option(v-for="item in appList" :key="item.id" :value="item.id" :label="item.app_name")
                        <!--el-select(-->
                        <!--filterable-->
                        <!--clearable-->
                        <!--@clear="clearAppList"-->
                        <!--remote-->
                        <!--:remote-method="getRemoteAppList"-->
                        <!--v-model="app"-->
                        <!--@change="appChange"-->
                        <!--size="small")-->
                            <!--el-option(-->
                            <!--v-for="(item, index) in appList"-->
                            <!--:key="index"-->
                            <!--:label="`${item.app_name}(${item.short})`"-->
                            <!--:value="item.id")-->
                    span.sub-title 月份
                    el-date-picker(v-model="month" size="small" type="month" placeholder="选择月份" @change="getCostInfo" :clearable="isMonthDisClear")
            div.top-button-container
                el-tooltip(content="pdf下载" placement="bottom")
                    el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-download" @click="downCostPdf") pdf
                    // div.pdf_down(@click="downCostPdf")
                    //     i(class="ucmp-icon-download")
                    //     span pdf
            div.bill-chart-container.d-flex.flex-wrap
                div.dash-chart-content.border.d-flex
                    div.dash-chart-content-info
                        div.chart-header 费用概况
                        div.chart-container
                            div.price-chart-container
                                div.price-total-circle.circle-pane
                                    div.price-total ￥{{totalCost}}
                                    div.price-total 总支出
                    div.dash-chart-content-pay
                        div.chart-header
                        div.chart-container
                            PieChart(:options="costResourcetOption")
                div.dash-chart-content.border
                    div.chart-header 月度对比
                    div.chart-container
                        LineChart(:options="costTrendOption")
                div.dash-chart-full-content.border(v-if="activeTab === 'org'")
                    div.chart-header 本月部门对比
                    div.chart-container
                        BarChart(:options="costDepartOption")
            div.bill-table-container.full-height
                div.padding-top.d-flex.justify-content-between(v-if="activeTab === 'org'")
                    div
                        el-select.form-width(size="small" placeholder="请选择服务名称" clearable v-model="detailParams.serviceCode")
                            el-option(v-for="item in billServiceList" :key="item.id" :value="item.id" :label="item.name")
                        LazySelectUser.margin-left.margin-right(:params="userParams" v-model="detailParams.userId" placeholder="请输入用户名称")
                        el-button(size="small" type="primary" @click="searchDetail") 查询
                    el-button.oper-icon-btn(size="small" icon="ucmp-icon-download" @click="exportCostDetail")
                UcmpTableContainer(:pagination="pagination" :filterItems="filterItems" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange")
                    div.full-height(slot="tableContainer")
                        el-table(:data="tableData" border)
                            el-table-column(v-for="column in billColumn" :prop="column.prop" :key="column.prop" :label="column.label" :width="column.width")
                                template(slot-scope="scope")
                                    span.price-text(v-if="column.prop === 'cost'") ￥{{scope.row[column.prop]}}
                                    span(v-else) {{scope.row[column.prop]}}
</template>
<script>
/**
 * 部门账单
 */
import axios from 'axios'
import Api from '@api'
import FileSaver from 'file-saver'
import InputTree from '@common/InputTree'
import PieChart from '@common/charts/PieCharts'
import LineChart from '@common/charts/LineCharts'
import BarChart from '@common/charts/BarCharts'
import SelectHelper from '@mock/lazySelect.mock'
import LazySelectUser from '@common/LazySelectUser'
import {mapGetters} from 'vuex'

export default {
    name: 'Bill',
    data () {
        return {
            filterItems: [],
            totalCost: 0.00,
            month: '',
            depart: '',
            orgObj: {},
            orgList: [],
            app: '',
            appList: [],
            appHelper: new SelectHelper(),
            business: '',
            businessList: [],
            isMonthDisClear: false,
            costTrendOption: {},
            costDepartOption: {},
            costResourcetOption: {},
            activeTab: 'org',
            inputObj: {
                value: '',
                placeholder: '请选择组织机构'
            },
            defaultProps: {
                id: 'id',
                parentId: 'parent_id',
                children: 'sub_orgs',
                label: 'org_name'
            },
            breadcrumbItems: [
                {prop: '', label: '账单统计'}
            ],
            pagination: {
                index: 1,
                size: 20,
                total: 0
            },
            tableData: [],
            detailParams: {
                userId: '',
                serviceCode: ''
            },
            detailDownloadParams: {}
        }
    },
    methods: {
        /**
         * @description 初始化
         */
        init () {
            //初始化图表参数
            this.costResourcetOption = {
                colors: ['#006699', '#4cabce', '#61c359', '#ffaa00', '#9a5ab4', '#e64451', '#e0e4e9'],
                title: {
                    text: '',
                    position: 'middle',
                    fontSize: '16px',
                    y: -10,
                    useHTML: true
                },
                tooltip: {
                    pointFormat: '{point.name}<br>支出：￥{point.y: .2f}<br>占比:{point.percentage:.2f} %'
                },
                plotOptions: {
                    labelEnabled: false,
                    showInLegend: true
                },
                legend: {
                    enabled: true,
                    floating: true,
                    y: -170,
                    layout: 'vertical',
                    align: 'right',
                    labelFormatter () {
                        return this.name
                    }
                },
                series: [
                    {
                        innerSize: '70%',
                        name: '本月支出',
                        data: []
                    }
                ]
            }
            this.costTrendOption = {
                colors: ['#e64451'],
                tooltip: {
                    pointFormat: '{series.name}<br>消费额：￥{point.y: .2f}'
                },
                legend: {
                    enabled: true
                },
                xAxis: {
                    categories: []
                },
                series: [
                    {
                        name: '消费额',
                        data: []
                    }
                ]
            }
            this.costDepartOption = {
                chart: {
                    spacing: [25, 10, 10, 10]
                },
                colors: ['#4cabce'],
                plotOptions: {
                    labelEnabled: true,
                    labelLimit: 9,
                    showInLegend: true
                },
                legend: {
                    enabled: true
                },
                tooltip: {
                    pointFormat: '{series.name}: {point.y}'
                },
                series: [
                    {
                        name: '消费额(元)',
                        data: []
                    }
                ]
            }

            this.month = new Date()
            this.getOrgList()
        },
        /**
         * @description 组织机构点击节点
         */
        nodeClick (data) {
            this.detailParams = {
                userId: '',
                serviceCode: ''
            }
            this.detailDownloadParams = {}
            this.getCostInfo()
        },
        /**
         * @description 业务选择改变事件
         */
        businessChange () {
            this.getCostInfo()
        },
        /**
         * @description 应用选择改变事件
         */
        appChange () {
            this.getCostInfo()
        },
        handleTabClick () {
            if (this.activeTab === 'org') {
                //
                this.getOrgList()
            } else if (this.activeTab === 'business') {
                //
                this.getBusinessList()
            } else
                this.getAppList()
        },
        // 获取组织机构
        getOrgList () {
            Api.get('orgTree', {}, true).then(
                res => {
                    this.orgList = res.data
                    this.orgObj = {
                        id: this.orgList[0].id,
                        org_name: this.orgList[0].org_name
                    }
                    this.getCostInfo()
                }
            )
        },
        // 获取业务数据
        getBusinessList (query) {
            Api.get('businessListByName', {limit: 999999, page: 1}, true).then(res => {
                this.businessList = res.data.business
                this.business = this.businessList[0].id
                this.getCostInfo()
            })
        },
        // 获取应用列表
        getAppList () {
            Api.get('appListByName', {limit: 999999, page: 1}, true).then(
                res => {
                        this.appList = res.data.apps
                        this.app = this.appList[0].id
                        this.getCostInfo()
                }
            )
        },
        getRemoteAppList (query, loadMore = false) {
            // 搜索不同的或者全部的option值切换，防止loadMore多次，需要先置空
            if (query !== this.appHelper.query) {
                this.appList = []
                this.appHelper.pageCountForSearch = 1
                this.appHelper.pageIndexForSearch = 1
            }
            this.getAppList(query, loadMore)
            this.appHelper.query = query
        },

        clearAppList () {
            this.appList = this.appHelper.allDataCache
        },

        initApp () {
            this.getAppList()
        },

        loadMoreApp () {
            let hasMore = false
            if (this.appHelper.query) {
                //
                hasMore = this.appHelper.pageIndexForSearch <= this.appHelper.pageCountForSearch
            } else {
                //
                hasMore = this.appHelper.pageIndexForAll <= this.appHelper.pageCountForAll
            }

            if (hasMore) {
                //
                this.getRemoteAppList(this.appHelper.query, true)
            }
        },
        /**
         * @description 获取账单信息
         */
        getCostInfo () {
            //清除图表数据
            this.costResourcetOption.title.text = ''
            this.costTrendOption.xAxis.categories = []
            this.costTrendOption.series[0].data = []
            this.costDepartOption.series[0].data = []
            this.costResourcetOption.series[0].data = []
            let month = this.month.getFullYear() + '-' + (this.month.getMonth() + 1)
            let resObj = {}
            if (this.activeTab === 'org') {
                resObj = {
                    type: 'org',
                    orgId: this.orgObj.id,
                    monthly: month
                }
            } else if (this.activeTab === 'business') {
                resObj = {
                    type: 'business',
                    businessId: this.business,
                    monthly: month
                }
            } else resObj = {type: 'app', appId: this.app, monthly: month}

            let costInfo = Api.get('costInfo', resObj, true)
            let costTrend = Api.get('costTrend', resObj, true)
            let costResource = Api.get('costResource', resObj, true)
            axios.all([costInfo, costTrend, costResource]).then(axios.spread(
                (costInfo, costTrend, costResource) => {
                    //费用概览
                    if (costInfo) {
                        if (costInfo.totalCost)
                            this.totalCost = costInfo.totalCost
                        else
                            this.totalCost = 0.00

                        if (costResource && costResource.length)
                            this.costResourcetOption.title.text = '￥' + costInfo.currMonthlyCost + '<br>&nbsp本月支出'
                    }

                    //费用趋势
                    this.forMatCostTrend(costTrend)
                    //部门对比
                    if (this.activeTab === 'org')
                        this.getCostDepart(month)
                    //资源占比
                    this.forMatcostResource(costResource)
                    this.getCostOrder()
                })
            )
        },
        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getCostOrder()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getCostOrder()
        },
        getCostDepart (month) {
            let resObj = {type: 'org', orgId: this.orgObj.id, monthly: month}
            Api.get('costDepart', resObj, true).then(
                costDepart => {
                    this.forMatCostDepart(costDepart)
                }
            )
        },
        /**
         * @description 消费申请单table
         */
        getCostOrder () {
            let month = this.month.getFullYear() + '-' + (this.month.getMonth() + 1)
            let resObj = {}
            if (this.activeTab === 'org') {
                resObj = {
                    type: 'org',
                    orgId: this.orgObj.id,
                    monthly: month,
                    offset: this.pagination.index,
                    limit: this.pagination.size
                }

                Object.assign(resObj, this.detailParams)
                this.detailDownloadParams = JSON.parse(JSON.stringify(this.detailParams))
            } else if (this.activeTab === 'business') {
                resObj = {
                    type: 'business',
                    businessId: this.business,
                    monthly: month,
                    offset: this.pagination.index,
                    limit: this.pagination.size
                }
            } else {
                resObj = {
                    type: 'app',
                    appId: this.app,
                    monthly: month,
                    offset: this.pagination.index,
                    limit: this.pagination.size
                }
            }

            Api.get('costOrder', resObj, true).then(
                res => {
                    this.tableData = res.list
                    this.pagination.total = res.total || 0
                }
            )
        },
        /**
         * @description 格式化费用趋势图表参数
         */
        forMatCostTrend (costTrend) {
            if (!costTrend) return
            costTrend.forEach(item => {
                this.costTrendOption.xAxis.categories.push(item.monthly)
                this.costTrendOption.series[0].data.push(item.cost)
            })
        },
        /**
         * @description 格式化部门对比图表参数
         */
        forMatCostDepart (costDepart) {
            if (!costDepart) return
            costDepart.forEach(item => {
                let itemArr = []
                itemArr.push(item.orgName)
                itemArr.push(item.cost)
                this.costDepartOption.series[0].data.push(itemArr)
            })
        },
        /**
         * @description 格式化资源占比图表参数
         */
        forMatcostResource (costResource) {
            if (!costResource) return
            let costResourceArr = []
            costResource.forEach(item => {
                let resItem = [item.name, item.cost]
                costResourceArr.push(resItem)
            })

            this.costResourcetOption.series[0].data = costResourceArr
        },
        /**
         * @description 下载pdf文件
         */
        downCostPdf () {
            let downFileName = '', resObj = {},
                month = this.month.getFullYear() + '-' + (this.month.getMonth() + 1)
            //UCMP3-4367 下载pdf没有传组织机构id
            if (this.activeTab === 'org') {
                downFileName = 'costOrg.pdf'
                resObj = {
                    type: 'org',
                    title: '组织机构账单',
                    orgId: this.orgObj.id,
                    monthly: month
                }
                Object.assign(resObj, this.detailDownloadParams)
            } else if (this.activeTab === 'business') {
                downFileName = 'costBusiness.pdf'
                resObj = {
                    type: 'business',
                    title: '业务账单',
                    businessId: this.business,
                    monthly: month
                }
            } else {
                downFileName = 'costApp.pdf'
                resObj = {
                    type: 'app',
                    title: '应用账单',
                    appId: this.app,
                    monthly: month
                }
            }

            Api.get('costPdf', resObj, true, 'blob').then(
                res => {
                    let blob = new Blob([res], {type: 'application/pdf'})
                    FileSaver.saveAs(blob, downFileName)
                }
            )
        },

        searchDetail () {
            this.pagination.index = 1
            this.getCostOrder()
        },

        exportCostDetail () {
            let month = this.month.getFullYear() + '-' + (this.month.getMonth() + 1)
            let params = {
                type: 'org',
                orgId: this.orgObj.id,
                monthly: month
            }
            Object.assign(params, this.detailDownloadParams)

            Api.get('costOrderDownload', params, true, 'blob').then(res => {
                let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                FileSaver.saveAs(blob, '月度账单详情.xlsx')
            })
        }
    },
    created () {
        this.init()
    },
    computed: {
        billColumn () {
            let billColumn = []
            if (this.activeTab === 'org') {
                billColumn = [
                    {prop: 'instanceName', label: '资源名称'},
                    {prop: 'serviceName', label: '服务名称'},
                    {prop: 'cost', label: '支出金额'},
                    {prop: 'user', label: '用户'},
                    {prop: 'roleName', label: '角色'},
                    {prop: 'orgName', label: '组织机构'},
                    {prop: 'date', label: '日期'}
                ]
            } else if (this.activeTab === 'business') {
                billColumn = [
                    {prop: 'instanceName', label: '资源名称'},
                    {prop: 'serviceName', label: '服务名称'},
                    {prop: 'cost', label: '支出金额'},
                    {prop: 'businessName', label: this.selectedBusinessLabel},
                    {prop: 'date', label: '日期'}
                ]
            } else {
                billColumn = [
                    {prop: 'instanceName', label: '资源名称'},
                    {prop: 'serviceName', label: '服务名称'},
                    {prop: 'cost', label: '支出金额'},
                    {prop: 'appName', label: '应用'},
                    {prop: 'date', label: '日期'}
                ]
            }

            return billColumn
        },

        userParams () {
            return this.orgObj ? {org_id: this.orgObj.id, deep_org: true} : {}
        },

        billServiceList () {
            let metadataList = this.metadata || []
            let billList = metadataList.filter(item => item.billing)
            return billList.map(item => {
                return {
                    id: item.service_code,
                    name: item.name
                }
            })
        },

        ...mapGetters([
            'metadata',
            'businessOrproject'
        ]),
        selectedBusinessLabel () {
            return this.businessOrproject === 'business' ? '业务' : '项目'
        },
        tabs () {
            return [
                {label: '组织机构', name: 'org'},
                {label: this.selectedBusinessLabel, name: 'business'},
                {label: '应用', name: 'app'}
            ]
        }
    },
    components: {
        InputTree,
        PieChart,
        LineChart,
        BarChart,
        LazySelectUser
    }
}
</script>
<style lang="scss" scoped>
</style>
