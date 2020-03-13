<template lang="pug">
    div.ws-pending-list.d-flex.flex-column
        WorkSheetFilter(v-model="searchParams" @search="search")
        div.ws-status
            LabelGroup(:stateTypes="stateTypes" :setState="setState")
        div.ws-table
            el-table(:data="tableData"
            v-loading="loading"
            element-loading-spinner="ucmp-icon-loading"
            stripe
            border)
                el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                    template(slot="header" slot-scope="scope")
                        TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                    template(slot-scope="scope")
                        span.theme-color.column-name(v-if="column.isLink" @click="goDetail(scope.row[column.prop])") {{scope.row[column.prop]}}
                        span(v-else-if="column.isDate") {{scope.row[column.prop] | dateFormat}}
                        <!--el-tag(v-else-if="column.prop === 'ticketGrade'" :color="wsUrgencyObj[scope.row[column.prop]]" :style="{color: 'black'}") {{scope.row[column.prop]}}-->
                        span(v-else-if="column.prop === 'ticketGrade'" :style="{color: wsUrgencyObj[scope.row[column.prop]], fontWeight: 'bold'}") {{scope.row[column.prop]}}
                        span(v-else-if="column.prop === 'ticketStatus'") {{statusObj[scope.row[column.prop]] ? statusObj[scope.row[column.prop]].label : '未知'}}
                        span(v-else-if="column.prop === 'handleType'") {{wsGroupObj[scope.row[column.prop]] || '未知'}}
                        span(v-else) {{scope.row[column.prop]}}
                el-table-column(label="操作" width="180px")
                    // 这个列表java返回4种：分配给我的，分配给我的角色的，我接单的，我曾经处理过的
                    template(slot-scope="scope")
                        template(v-if="scope.row.ticketStatus !== WS_STATUS.PROCESSING")
                            template(v-if="scope.row.ticketStatus === WS_STATUS.WAIT_BEGIN || scope.row.ticketStatus === WS_STATUS.WAIT_PROCESS")
                                el-button(
                                v-if="(scope.row.handlerType === 'role' && ucmpRoleId === scope.row.handler) || (scope.row.handlerType === 'person' && currUser === scope.row.handler)"
                                type="text"
                                @click="ticketTake(scope.row.ticketCode)") 接单
                                el-button(type="text" @click="ticketAssign(scope.row.ticketCode)") 分配
                            template(v-if="checkCreateUser(scope.row.created_by) && scope.row.ticketStatus === WS_STATUS.FINISHED")
                                el-button(type="text" @click="ticketClose(scope.row.ticketCode)") 关闭
                            template(v-if="checkCreateUser(scope.row.created_by) && scope.row.ticketStatus === WS_STATUS.WAIT_BEGIN")
                                el-button(type="text" @click="ticketModify(scope.row.ticketCode)") 修改
                                el-button(type="text" @click="ticketCancel(scope.row.ticketCode)") 取消
                        template(v-else-if="checkHandler(scope.row.takingUser)")
                            el-button(type="text" @click="ticketAssign(scope.row.ticketCode)") 分配
                            el-button(type="text" @click="ticketConfirm(scope.row.ticketCode)") 完成

        div.ws-pagination
            el-pagination(
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="pagination.index"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.size"
            layout="sizes, total, prev, pager, next"
            :total="pagination.total"
            :page-count="pagination.count")
</template>

<script>
    import TableFilterHeader from '@/components/common/TableFilterHeader'
    import LabelGroup from '@/components/console/LabelGroup'
    import WorkSheetFilter from './WorkSheetFilter'
    import wsMixin from './workSheetMixin'
    import Api from '@api'
    import axios from 'axios'
    import {mapGetters} from 'vuex'

    /**
     * 工单 待处理列表
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'WorkSheetPendingList',
        components: {TableFilterHeader, WorkSheetFilter, LabelGroup},
        mixins: [wsMixin],
        props: ['refresh'],
        data () {
            return {
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                tableData: [],
                loading: false,
                searchParams: {}
            }
        },
        computed: {
            ucmpRoleId () {
                return this.wsUserRole.ucmp ? this.wsUserRole.ucmp.id : ''
            },
            ...mapGetters(['wsUserRole'])
        },
        methods: {
            handleSizeChange (size) {
                this.pagination.size = size
                this.getList()
            },
            handleCurrentChange () {
                this.getList()
            },
            handleHeaderCommand (param) {
                this.searchParams = {...this.searchParams, ...param}
                this.search()
            },
            setState (group) {
                this.$set(this.searchParams, 'handleType', group)
                this.search()
            },
            search () {
                this.pagination.index = 1
                this.getList()
            },
            getGroupCount () {
                let reqToHandle = Api.get('ticketGroupCount', {type: 'tohandle'}, true)
                let reqHandled = Api.get('ticketGroupCount', {type: 'handled'}, true)

                axios.all([reqToHandle, reqHandled]).then(axios.spread(
                    (tohandle, handled) => {
                        this.$set(this.stateTypes[0], 'count', tohandle || 0)
                        this.$set(this.stateTypes[1], 'count', handled || 0)
                    })
                )
            },
            getList () {
                let params = {
                    listType: 'handle', // 待处理列表
                    offset: this.pagination.index,
                    limit: this.pagination.size
                }
                Object.assign(params, this.searchParams)

                Api.get('ticket', params, true).then(res => {
                    this.tableData = res.list
                    this.pagination.total = res.total || 0
                })
            },
            goDetail (id) {
                this.$router.push('/tickets/detail/' + id)
            },

            // 创建，删除这种条目数量发生变化 状态栏数量也需要更改
            refreshTable () {
                this.getList()
                this.getGroupCount()
            }
        },
        created () {
            if (this.$route.params && this.$route.params.tab === 'WorkSheetPendingList') {
                let params = JSON.parse(JSON.stringify(this.$route.params))
                delete params.tab

                Object.assign(this.searchParams, params)
            }

            this.refreshTable()
        },
        watch: {
            refresh (newVal) {
                this.pagination.index = 1
                this.refreshTable()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .flex-column {
        .ws-filter, .ws-status {
            flex: none;
        }

        .ws-pagination {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }

        .ws-table {
            flex: auto;
            height: 100%;
            overflow: hidden;
        }
    }
</style>