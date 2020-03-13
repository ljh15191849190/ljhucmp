<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.position-relative.full-height
                el-button.absolute-rt.oper-icon-btn(size="small" icon="ucmp-icon-download" @click="downloadOrder()" title="导出")
                UcmpTableContainer(
                    :advance="advanceSwitch"
                    :pagination.sync="pagination"
                    :noResizeSync="noResizeSync"
                    :filterItems="filterItems"
                    @sizeChange="handleSizeChange"
                    @currentChange="handleCurrentChange"
                    @updateFilterForm="getFilterData"
                    :submit="searchOrder"
                    :searchPlaceholder="searchPlaceholder"
                    :formData="formData")
                    div.custom-filter(slot="custonItem")
                        el-form(
                            :inline="true"
                            size="small")
                            el-form-item
                                el-select(
                                    v-model="customParam.serviceCode"
                                    filterable 
                                    clearable
                                    value-key="service_code"
                                    placeholder="服务名称"
                                    @change='changeServiceCode')
                                    el-option(
                                        v-for="(item, index) in customFilters.serviceCode" :key="index" :value="item.service_code" :label="`${item.service_name}`")
                            el-form-item(v-if="customParam.serviceCode")
                                el-select(
                                    v-model="customParam.orderType"
                                    filterable 
                                    clearable
                                    value-key="order_type"
                                    placeholder="类型")
                                    el-option(
                                        v-for="(item, index) in customFilters.orderType" :key="index" :value="item.order_type" :label="`${item.name}`")
                    div.full-height(slot="tableContainer")
                        el-table(:data="tableData" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                            el-table-column(
                                resizable
                                :prop="column.prop"
                                v-for="column in columns"
                                :key="column.prop"
                                :label="column.label"
                                :width="column.width"
                                show-overflow-tooltip)
                                template(slot='header' slot-scope="scope")
                                    TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParam")
                                template(slot-scope="scope")
                                    IconButton(
                                        v-if="column.prop === 'operation'"
                                        type="ucmp-icon-view"
                                        text="查看申请单详情"
                                        @iconClick="$router.push({name: 'orderDetail', params: {orderCode: scope.row.order_code}})")
                                    template(v-else-if="column.prop === 'process_instance_id'")
                                        span(v-if="!scope.row[column.prop]") 无
                                        IconButton(
                                            v-else
                                            type="ucmp-icon-dashboard"
                                            text="查看流程跟踪"
                                            @iconClick="openTrackDialog(scope.row)")
                                    div(v-else-if="column.prop === 'status'")
                                        span(:class="statusMap[scope.row[column.prop]] ? statusMap[scope.row[column.prop]].txtColor : ''") {{scope.row[column.prop]| FormatOrderStatus}}
                                    span(v-else-if="column.prop === 'urgency_level'") {{scope.row[column.prop] | FormatOrderLevel}}
                                    span(v-else-if="column.prop === 'order_type'") {{scope.row[column.prop] | orderType2str( scope.row['service_code'],customFilters.originOrderType)}}
                                    span(v-else-if="column.prop === 'created_at'") {{scope.row[column.prop] | FormatTime}}
                                    span(v-else) {{scope.row[column.prop]}}
                        //- 流程跟踪dialog弹窗
                        ProcessDialog(ref="processDialog" :selectedRow="selectedOrder")
</template>

<script>
/**
 * @description 申请单管理
 */

import Api from '@api'
import FileSaver from 'file-saver'
import Utils from '@server/Utils'
import ProcessDialog from '../itemConponents/ProcessDialog'
import TableFilterHeader from '../../common/TableFilterHeader'
import { orderTypesMixin } from '@mixins/orderTypes.mixin'
import { StatusMap, UrgencyLevelsMap } from '@server/ConstParams'
import { mapGetters, mapActions } from 'vuex'

// let service_name_filter = {
//     value_field: 'service_code',
//     label_field: 'service_name',
//     link_url: 'orderServices',
//     method: 'get'
// }

// let order_type_filter = {
//     value_field: 'order_type',
//     label_field: 'name',
//     link_url: 'orderType',
//     method: 'get'
// }

// 表格列配置
const Columns = [
    { prop: 'order_code', label: '申请单编号', width: '160px' },
    // { prop: 'service_name', label: '服务名称', filterKey: 'serviceCode', useIndex: true, filter_link: service_name_filter, filters: [] },
    // { prop: 'order_type', label: '类型', filterKey: 'orderType', filter_link: order_type_filter, filters: [] },
    { prop: 'service_name', label: '服务名称' },
    { prop: 'order_type', label: '类型' },
    { prop: 'urgency_level', label: '优先级', filterKey: 'urgencyLevel', filters: Utils.generateOpts(UrgencyLevelsMap) },
    { prop: 'status', label: '状态', filterKey: 'status', filters: Utils.generateOpts(StatusMap) },
    { prop: 'order_user', label: '申请人' },
    { prop: 'created_at', label: '申请时间', width: '180px' },
    { prop: 'process_instance_id', label: '流程跟踪' },
    { prop: 'operation', label: '操作', width: '180px' }
]
// 过滤条件配置
const filterItems = [
    {
        label: '申请单编号',
        key: 'orderCode'
    },
    {
        label: '申请人',
        key: 'orderUser',
        group: 'advanced'
    },
    {
        label: '开始日期',
        key: 'createdAtFrom',
        type: 'date',
        group: 'advanced'
    },
    {
        label: '结束日期',
        key: 'createdAtTo',
        type: 'date',
        group: 'advanced'
    }
]

export default {
    mixins: [orderTypesMixin],
    data () {
        return {
            breadcrumbItems: [{ prop: '/orders', label: '申请单管理' }],
            originPagination: {
                offset: 1,
                limit: 20,
                count: 0,
                total: 0
            },
            advanceSwitch: false,
            
            noResizeSync: false,
            columns: [],
            tableData: [],
            filterItems: filterItems,
            searchPlaceholder: '请输入申请单编号或申请人信息识别搜索',
            // 表格loading配置
            isLoading: false,
            // Setting filter condition
            formData: {},
            // search parameter
            searchParam: {},
            basicSearchParams: {},
            // 定制搜索
            customParam: {
                serviceCode: undefined,
                orderType: undefined
            },
            statusMap: StatusMap,
            selectedOrder: {},
            dialogVisible: false,
            customFilters: {
                // 服务名称
                serviceCode: [],
                // 类型
                orderType: [],
                // 类型拷贝
                copyOrderType: []
            }
        }
    },
    computed: {
        ...mapGetters([
            'orderlevelDisplay'
        ]),
        pagination: {
            get () {
                return {
                    index: this.originPagination.offset,
                    size: this.originPagination.limit,
                    count: this.originPagination.count,
                    total: this.originPagination.total
                }
            },
            set (val) {
                this.originPagination.offset = val.index
            }
        }
    },
    methods: {
        handleCurrentChange (val) {
            this.originPagination.offset = val
            // bug #UCMP-662【总览】我的申请单中对应跳转之后，点下一页过滤规则失效。 且统计数据与申请单管理中的数据不一致。
            this.init()
        },
        handleSizeChange (val) {
            this.originPagination.limit = val
            // bug #UCMP-662【总览】我的申请单中对应跳转之后，点下一页过滤规则失效。 且统计数据与申请单管理中的数据不一致。
            this.init()
        },
        // 初始化
        init () {
            let defaultParam = {
                offset: this.originPagination.offset,
                limit: this.originPagination.limit
            }
            let params = Object.assign({}, defaultParam, this.searchParam, this.basicSearchParams, this.customParam)
            this.isLoading = true
            Api.get('order', params, true).then(
                res => {
                    if (res && Array.isArray(res.list)) {
                        this.tableData = res.list
                        this.originPagination.total = res.total
                        this.originPagination.count = res.size
                    }
                    this.isLoading = false
                },
                () => {
                    this.isLoading = false
                }
            )
        },
        // 搜索申请单
        searchOrder (param) {
            // UCMP3-6394【审批单管理】审批管理列表，切换到其他页（除第一页外），设置查询条件查询，返回是空
            this.originPagination.offset = 1
            let params = Object.assign({}, param)
            // Save search param when pagination
            this.searchParams = Object.assign({}, param)
            this.basicSearchParams = params
            if (!this.customParam.serviceCode)
                this.customParam.serviceCode = undefined
            if (!this.customParam.orderType)
                this.customParam.orderType = undefined
            this.init()
        },
        handleHeaderCommand (params) {
            this.searchParam = { ...this.searchParam, ...params }
            this.init()
        },
        getFilterData (data) {
            this.basicSearchParams = {}
            Object.keys(data).map(key => {
                if (![undefined, null, ''].includes(data[key])) 
                    this.basicSearchParams[key] = data[key]
            })
        },
        // bug UCMP-681申请单管理，导出功能
        downloadOrder () {
            let param = { ...this.searchParam, ...this.basicSearchParams }
            Api.get('downloadOrder', param, true, 'blob').then(
                res => {
                    let blob = new Blob([res], { type: 'application/vnd.ms-excel' })
                    FileSaver.saveAs(blob, '申请单.xlsx')
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: '导出成功'
                    })
                }
            )
        },
        // 打开流程跟踪弹窗
        openTrackDialog (row) {
            this.selectedOrder = row
            // 打开流程跟踪弹窗
            this.$refs.processDialog.dialogVisible = true
        },
        ...mapActions([
            'getOrderLevelDisplay'
        ]),
        async initCustomFilters () {
            await this.getOrderServices()
            await this.getOrderTypes()
        },
        async getOrderServices () {
            let res = await Api.get('orderServices', {})
            this.customFilters.serviceCode = res
        },
        async getOrderTypes () {
            let res = await Api.get('orderType', {})
            let allType = []
            let resObj = {}
            for (let key in res) {
                let ary = Object.entries(res[key]).map(itemAry => {
                    let innerObj = {}
                    innerObj['order_type'] = itemAry[0]
                    innerObj['name'] = itemAry[1]
                    return innerObj
                })
                resObj[key] = ary
                allType = allType.concat(ary)
            }
            this.customFilters.orderType = []
            this.customFilters.copyOrderType = resObj
            this.customFilters.originOrderType = res
        },
        changeServiceCode (serviceCode) {
            //bug UCMP3-7303 服务名称和类型需要做特殊处理
            // 服务名称变动的时候，先清空类型
            this.customParam.orderType = undefined
            this.customFilters.orderType = []
            this.customFilters.orderType = this.customFilters.copyOrderType[serviceCode]
        }
    },
    async created () {
        // Judge whether there are query conditions,
        // mainly for the dashboard home page jump
        this.formData = Object.assign({}, this.formData, this.$route.query)
        if (this.$route.query && Object.keys(this.$route.query).length)
            this.searchParam = JSON.parse(JSON.stringify(this.$route.query))
        this.init()
        // 初始自定义的过滤参数
        await this.initCustomFilters()
        this.columns = JSON.parse(JSON.stringify(Columns))
    },
    components: { TableFilterHeader, ProcessDialog },
    filters: {
        orderType2str (type, serviceCode, typeObj) {
            let str = ''
            if (typeObj[serviceCode] && typeObj[serviceCode][type])
                str = typeObj[serviceCode][type]
            return str ? str : ''
        }
    }
}
</script>
<style lang="scss" scoped>

.custom-filter {
    display: inline-block;
}
</style>

