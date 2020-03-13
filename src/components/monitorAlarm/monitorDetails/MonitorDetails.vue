<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            UcmpTableContainer.table-height(
                :pagination.sync="pagination"
                @sizeChange="handleSizeChange"
                @currentChange="handleCurrentChange"
                :filterItems="filterItems"
                :submit="initHostTable"
                :containerHeight.sync="tableContainerHeight")
                div.full-height(slot="tableContainer")
                    el-button(size="small" type="primary" :disabled="!this.selectedList.length" @click="routerTo") 多台主机进行对比
                    el-table.margin-top.hide-check-header(
                        ref="multipleTable"
                        :data="ecsList"
                        @selection-change="handleSelectionChange"
                        :max-height="tableMaxHeight()"
                        tooltip-effect="dark"
                        v-loading="loading"
                        border
                        element-loading-spinner="ucmp-icon-loading")
                        el-table-column(type="selection" width="45" :selectable="selectable")
                        el-table-column(v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label"
                        :width="column.width" show-overflow-tooltip)
                            template(slot-scope="scope")
                                span(v-if="(column.prop === 'ip') && scope.row.ip")
                                    router-link(v-if="!showCheck" :to="{path: '/monitor-details/host-dashboard', query: {instance_id : scope.row.instance_id, instance_name: scope.row.name, ips: ''}}") {{scope.row.ip}}
                                    div(v-else) {{scope.row.ip}}
                                span(v-else-if="(column.prop === 'alert_count') && scope.row.instance_id")
                                    router-link(:to="{path: 'ecs/instanceDetail/'+scope.row.instance_id+'/alarm', params: {id : scope.row.instance_id, code: 'ecs'}}") {{scope.row[column.prop]}}
                                div(v-else-if="column.prop === 'status'")
                                    el-tag(
                                        :type="statusTypeObj[scope.row.status] ? statusTypeObj[scope.row.status].style : 'default'"
                                        :style="statusTypeObj[scope.row.status] && statusTypeObj[scope.row.status].custom_style ? statusTypeObj[scope.row.status].custom_style : {}"
                                        size="mini") {{statusTypeObj[scope.row.status] ? statusTypeObj[scope.row.status].name : '其他'}}
                                span(v-else-if="['cpu', 'mem', 'disk_used'].indexOf(column.prop) !== -1") {{Number(scope.row[column.prop]).toFixed(2)}}%
                                span(v-else-if="column.prop === 'owner_type'") {{scope.row[column.prop] | TranslateOrgApp}}
                                span(v-else) {{scope.row[column.prop] || '--'}}
</template>

<script>
/**
 * @description 监控详情
 */
import Api from '@api'
import { mapGetters } from 'vuex'
import MetadataUtils from '@server/metadata.utils'

export default {
    name: 'MonitorDetails',
    data () {
        return {
            breadcrumbItems: [{ prop: 'monitor-details', label: '主机监控' }],
            searchParams: {
                ipName: '',
                orgId: '',
                busId: ''
            },
            loading: false,
            showHeader: false,
            pagination: {
                index: 1,
                size: 20,
                count: 1,
                total: 0
            },
            tableContainerHeight: 100,
            organization: [],
            businesses: [],
            ecsList: [],
            columns: [
                { prop: 'ip', label: 'IP' },
                { prop: 'name', label: '主机名' },
                { prop: 'owner_type', label: '资源所属类型' },
                { prop: 'owner_name', label: '资源所属' },
                { prop: 'status', label: '状态', width: '70' },
                { prop: 'cpu', label: 'CPU使用率' },
                { prop: 'disk_used', label: '硬盘使用率' },
                { prop: 'mem', label: '内存使用率' },
                { prop: 'diskIO', label: '磁盘读写（读/写）' },
                { prop: 'alert_count', label: '告警数' }
            ],
            showCheck: false,
            selectedList: [],
            
            filterItems: [
                { label: '主机IP', key: 'search', type: 'input' }
            ]
        }
    },
    methods: {
        handleSizeChange (val) {
            this.pagination.size = val
            this.pagination.index = 1
            this.initEcsList(this.pagination)
        },
        handleCurrentChange (val) {
            this.pagination.index = val
            this.initEcsList(this.pagination)
        },
        handleSelectionChange (val) {
            this.selectedList = val
            if (val.length >= 5) {
                this.ecsList.forEach(item => {
                    item.disabled = val.indexOf(item) === -1
                })
            } else {
                this.ecsList.forEach(item => {
                    item.disabled = false
                })
            }
        },
        selectable (row) {
            return !row.disabled && row.ip
        },
        routerTo () {
            // 多主机对比时使用instanceId的集合
            let instanceIds = []
            let names = []
            this.selectedList.forEach(item => {
                if (item.instance_id) {
                    names.push(item.name)
                    instanceIds.push(item.instance_id)
                }
            })
            this.$router.push({ path: '/monitor-details/host-dashboard', query: { instance_id: '', instance_name: names.join(','), instanceIds: instanceIds.join(',') } })
        },
        handleState (state) {
            switch (state) {
                case 'in_use': case 'running': return { type: 'success', label: '运行中' }
                case 'error': case 'not_use': return { type: 'danger', label: '错误' }
                case 'stopped': case 'available': return { type: 'info', label: '已停止' }
                case 'default': case 'unknow': return { type: 'success', label: '其他' }
                default: return { type: 'info', label: '未知' }
            }
        },
        /**
         * @description 表格的最大高度
         */
        tableMaxHeight () {
            // 34px OperatorPanel height
            // 16px el-table margin-top
            return this.tableContainerHeight - 16 - 34
        },
        initEcsList (pagination, otherParams = {}) {
            this.loading = true
            let params = {
                offset: pagination.index,
                limit: pagination.size
            }
            Api.get('monitor_ecs_list', { ...params, ...otherParams }, true).then(res => {
                this.loading = false
                if (res && res.list) {
                    this.ecsList = res.list
                    this.pagination.count = res.pages || 1
                    this.pagination.total = res.total || 0
                }
            }, () => { this.loading = false })
        },
        initHostTable (params) {
            this.pagination.index = 1
            this.initEcsList(this.pagination, params)
        }
    },
    created () {
        // 获取主机列表

        this.initEcsList(this.pagination)

        this.statusTypeObj = MetadataUtils.getStatusMapByCode(this.metadata, 'ecs')
    },
    computed: {
        ...mapGetters([
            'metadata'
        ])
    },
    components: {}
}
</script>
<style lang="scss" scoped>
.margin-r5 {
    margin-right: 5px;
}
</style>

