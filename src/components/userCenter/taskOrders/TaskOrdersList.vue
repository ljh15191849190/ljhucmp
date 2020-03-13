<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            UcmpTableContainer(
                :pagination="pagination"
                :advance="advanceSwitch"
                :filterItems="filterItems"
                @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"
                :submit="handleSearch"
            )
                div.full-height(slot="tableContainer")
                    el-table.panel-table-container(:data="tableData" stripe v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                            template(slot='header' slot-scope="scope")
                                TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                            template(slot-scope="scope")
                                a(v-if="column.link" href="javascript:;" @click="goDetail(scope.row, column.prop)")
                                   span {{scope.row[column.prop]}}
                                span(v-else-if="column.prop === 'created_at' || column.prop === 'changed_at' || column.prop === 'execution_time'") {{ formatterTime(scope.row[column.prop]) }}
                                el-tag(v-else-if="column.prop === 'task_status_zh_cn'" :type="orderType(scope.row)" size="mini") {{ scope.row.task_status_zh_cn }}
                                span(v-else) {{scope.row[column.prop]}}
                        el-table-column(label="操作" width="56px")
                            template(slot-scope="scope")
                                Icon-Button(v-if="showOper(scope.row)" v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleClose" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
</template>
<script>
/**
 * @description task orders 任务单
 */
import Api from '@api'
import {mapGetters, mapActions} from 'vuex'
import DateUtil from '@server/date-utils'
import TableFilterHeader from '@/components/common/TableFilterHeader'

export default {
    name: 'TaskOrdersList',
    components: { TableFilterHeader },
    data () {
        return {
            states: [],
            tableData: [],
            isLoading: false,
            searchParams: {},
            breadcrumbItems: [
                { prop: '', label: '任务单管理' }
            ],
            pagination: { index: 1, total: 1, size: 20 },
            operations: [
                { prop: 'delete', label: '关闭', type: 'ucmp-icon-close' }
            ],
            columns: [
                { prop: 'task_code', label: '任务单编号', link: true },
                { prop: 'order_code', label: '申请单编号', link: true },
                { prop: 'service_name', label: '服务名称' },
                {
                    prop: 'task_type_zh_cn',
                    label: '类型',
                    filterKey: 'task_type',
                    filters: [],
                    filter_link: {
                        link_url: 'taskType',
                        label_field: 'name',
                        value_field: 'task_type'
                    }
                },
                {
                    prop: 'task_status_zh_cn',
                    label: '状态',
                    filterKey: 'task_status',
                    filters: [],
                    filter_link: {
                        link_url: 'taskCounts',
                        label_field: 'task_status_zh_cn',
                        value_field: 'task_status'
                    }
                },
                { prop: 'created_at', label: '任务创建时间' },
                { prop: 'changed_at', label: '状态变化时间' },
                { prop: 'execution_time', label: '定时任务执行时间' },
                { prop: 'user_name', label: '处理人' }
            ],
            advanceSwitch: false,

            filterItems: [
                {
                    label: '任务单/申请单编号',
                    key: 'query_keyword'
                },
                {
                    label: '服务名称',
                    key: 'service_code',
                    type: 'select',
                    multiple: false,
                    defaultOptions: [],
                    data_link: {
                        text_field: 'service_name',
                        value_field: 'service_code'
                    }
                }
            ]
        }
    },
    created () {
        this.init()
    },
    methods: {
        /**
         * @description 初始化
         */
        init () {
            this.getTaskServices()
            this.getTaskOrdersList()
        },
        /**
         * @description 获取任务单服务列表
         */
        getTaskServices () {
            Api.get('taskServices', {}, true).then(
                res => {
                    this.filterItems[1].defaultOptions = res
                }
            )
        },
        /**
         * @description 获取任务单列表
         */
        getTaskOrdersList () {
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('taskOrderList', resObj, true).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.list
                    this.pagination.total = res.total
                }, () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * @description 查看详情
         * @param type 类型
         */
        goDetail (rowObj, type) {
            if (type === 'task_code')
                this.$router.push('/taskOrderDetail/' + rowObj.task_code)
            else {
                this.$router.push(`/orders/${rowObj.order_code}`)
                this.setActivedNavIndex('/orders')
            }
        },
        /**
         * @description 删除当前条目事件
         * @params rowObj 当前行数据
         */
        handleClose (rowObj) {
            this.$confirm(`关闭任务单: ${rowObj.row.task_code}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.closeTask(rowObj.row.task_code)
            }).catch(() => {})
        },
        /**
         * @description 关闭任务单
         */
        closeTask (task_code) {
            let resObj = {
                orderId: task_code
            }
            Api.post('closeTask', resObj, true).then(
                res => {
                    this.getTaskOrdersList()
                    this.$message({
                        type: 'success',
                        message: `关闭任务单:${task_code}. 操作成功!`
                    })
                }
            )
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSearch (param) {
            this.pagination.index = 1
            if (param.searchKey) {
                this.$set(param, 'query_keyword', param.searchKey)
                delete param.searchKey
            }
            this.searchParams = Object.assign({}, param)
            this.getTaskOrdersList()
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.pagination.index = 1
            this.getTaskOrdersList()
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getTaskOrdersList()
        },
        /**
         * @description 页码变化
         * @param index 页码索引
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getTaskOrdersList()
        },
        /**
         * @description 是否显示操作按钮
         */
        showOper (rowObj) {
            return rowObj.closeable
        },
        /**
         * @description 格式化状态显示
         */
        orderType (rowObj) {
            if (rowObj.task_status === 'closed') return 'info'
            return rowObj.healthy ? 'success' : 'error'
        },
        /**
         * @description 格式化时间显示
         * @param time  时间戳
         */
        formatterTime (time) {
            // UCMP3-1670【任务单管理】状态变化时间为"null"时，显示时间为1970-01-01，前端显示需要处理。
            if (!time) return ''
            return DateUtil.formate(new Date(time))
        },
        ...mapActions(['setActivedNavIndex'])
    },
    computed: {
        ...mapGetters([
            'metadata'
        ])
    }
}
</script>
<style lang="scss" scoped>
</style>
