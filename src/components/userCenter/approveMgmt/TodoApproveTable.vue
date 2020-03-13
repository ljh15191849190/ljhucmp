<template lang="pug">
    UcmpTableContainer(
        :advance="advanceSwitch"
        :noResizeSync="noResizeSync"
        :pagination.sync="pagination"
        :filterItems="filterItems"
        @sizeChange="handleSizeChange"
        @currentChange="handleCurrentChange"
        :submit="submit"
        :searchPlaceholder="searchPlaceholder"
    )
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
                    :prop="column.prop"
                    v-for="column in columns"
                    :key="column.prop"
                    :label="column.label"
                    :width="column.width"
                    show-overflow-tooltip
                )
                    template(slot='header' slot-scope="scope")
                        TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParam")
                    template(slot-scope="scope")
                        //- router-link(v-if="column.prop === 'order_code'" :to="`/orders/${scope.row.order_code}`" @click="setActivedNavIndex('/orders')") {{scope.row.order_code}}
                        span(v-if="column.prop === 'urgency_level'") {{scope.row[column.prop] | FormatOrderLevel}}
                        span(v-else-if="column.prop === 'order_type'") {{scope.row[column.prop] | orderType2str( scope.row['service_code'],customFilters.originOrderType)}}
                        span(v-else-if="column.prop === 'order_time'") {{scope.row[column.prop] | FormatTime}}
                        IconButton(
                            v-else-if="column.prop === 'processTrack'"
                            type="ucmp-icon-dashboard"
                            text="查看流程跟踪"
                            @iconClick="openTrackDialog(scope.row)"
                        )
                        span(v-else) {{scope.row[column.prop]}}
                //- 操作列
                el-table-column(prop="operation" key="operation" label="操作")
                    template(slot-scope="scope")
                        IconButton(
                            type="ucmp-icon-approve-handle"
                            text="办理"
                            @iconClick="handleApprove(scope.row)"
                        )

            ProcessDialog(ref="processDialog" :selectedRow="selectedTask")
</template>
<script>

import Api from '@api'
import { mapActions, mapGetters } from 'vuex'
import TableFilterHeader from '@/components/common/TableFilterHeader'
import { orderTypesMixin } from '@mixins/orderTypes.mixin'
import ProcessDialog from '../itemConponents/ProcessDialog'

import { UrgencyLevelsMap } from '@server/ConstParams'
import Utils from '@server/Utils'

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

// 待审批表格列配置
const Columns = [
    { prop: 'order_code', label: '申请单编号' },
    // { prop: 'service_name', label: '服务名称', filterKey: 'serviceCode', filter_link: service_name_filter, filters: [] },
    // { prop: 'order_type', label: '类型', filters: [], filterKey: 'orderType', filter_link: order_type_filter },
    { prop: 'service_name', label: '服务名称' },
    { prop: 'order_type', label: '类型' },
    { prop: 'urgency_level', label: '优先级', filters: Utils.generateOpts(UrgencyLevelsMap), filterKey: 'urgencyLevel' },
    { prop: 'order_user', label: '申请人' },
    { prop: 'order_time', label: '接收时间' },
    { prop: 'processTrack', label: '流程跟踪' }
]
// Filter condition configuration
const filterItems = [
    {
        label: '申请单编号',
        key: 'orderCode'
    },
    {
        label: '申请人',
        key: 'orderUser'
    },
    {
        label: '接收时间',
        key: 'orderTime',
        type: 'date'
    }
]

export default {
    mixins: [orderTypesMixin],
    data () {
        return {
            noResizeSync: false,
            advanceSwitch: false,
            
            dialogVisible: false,
            filterItems: filterItems,
            pagination: {
                index: 1,
                size: 20,
                count: 0,
                total: 0
            },
            columns: [],
            // 表格loading配置
            isLoading: true,
            tableData: [],
            // search parameter
            searchParam: {},
            basicSearchParams: {},
            // 定制搜索
            customParam: {
                serviceCode: undefined,
                orderType: undefined
            },
            // bug #UCMP-600 1、待审批、已审批列表查询、搜索按钮无效 2、审批记录列表信息显示错误
            searchPlaceholder: '请输入申请单编号识别搜索',
            selectedTask: {},
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
    methods: {
        // 初始化
        init () {
            // 获取待审批申请单
            this.isLoading = true
            this.getTodoOrderList()
        },
        // 获取待处理申请单列表
        getTodoOrderList () {
            let defaultParam = {
                page_type: 'todo-tasks',
                offset: this.pagination.index,
                limit: this.pagination.size
            }
            if (!this.customParam.serviceCode)
                this.customParam.serviceCode = undefined
            if (!this.customParam.orderType)
                this.customParam.orderType = undefined
            let params = Object.assign({}, defaultParam, this.basicSearchParams, this.searchParam, this.customParam)
            Api.get('approveList', params, true).then(
                res => {
                    // 处理数据
                    if (res && Array.isArray(res.list)) {
                        this.tableData = res.list
                        this.pagination.total = res.total
                    }
                    this.isLoading = false
                },
                () => {
                    this.isLoading = false
                }
            )
        },
        handleSizeChange (val) {
            this.pagination.size = val
            this.init()
        },
        handleCurrentChange (val) {
            this.pagination.offset = val
            this.init()
        },
        handleApprove (approve) {
            // 办理审批申请单
            let queryParams = {
                orderCode: approve.order_code,
                processId: approve.process_instance_id,
                taskId: approve.task_id,
                type: 'todo'
            }
            this.$router.push({ path: '/approveDetail', query: queryParams })
        },
        openTrackDialog (row) {
            this.selectedTask = row
            // 打开流程跟踪弹窗
            this.$refs.processDialog.dialogVisible = true
        },
        // 关闭弹出框
        close () {
            this.dialogVisible = false
        },
        // bug #UCMP-600 1、待审批、已审批列表查询、搜索按钮无效 2、审批记录列表信息显示错误
        // Advance filter submit
        submit (params) {
            this.pagination.index = 1
            this.basicSearchParams = params
            this.init()
        },
        handleHeaderCommand (params) {
            this.pagination.index = 1
            this.searchParam = {...this.searchParam, ...params}
            this.init()
        },
        ...mapActions(['setActivedNavIndex', 'getOrderLevelDisplay']),
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
        },
        ...mapActions(['setActivedNavIndex'])
    },
    watch: {
        'metadata.length' () {

        }
    },
    computed: {
        ...mapGetters([
            'orderlevelDisplay'
        ])
    },
    async created () {
        // 初始化
        this.init()
        // 初始自定义的过滤参数
        await this.initCustomFilters()
        this.columns = JSON.parse(JSON.stringify(Columns))
    },
    components: {
        TableFilterHeader,
        ProcessDialog
    },
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
