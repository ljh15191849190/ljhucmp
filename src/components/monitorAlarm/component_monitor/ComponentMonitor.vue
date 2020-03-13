<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            UcmpTableContainer(
                ref="alarmTableContainer"
                :filterItems.sync="filterItems"
                :pagination.sync="pagination"
                @sizeChange="handleSizeChange"
                :submit="initFilterAlarmTable"
                @currentChange="handleCurrentChange"
                :containerHeight.sync="tableContainerHeight")
                div.full-height(slot="tableContainer")
                    el-table(:data="tableData" v-loading="isLoading" border element-loading-spinner="ucmp-icon-loading" :max-height="tableMaxHeight")
                        el-table-column(:prop="column.prop"
                                v-for="column in columns"
                                :width="column.width"
                                :key="column.prop"
                                :label="column.label"
                                :sortable="column.prop === 'server_code'"
                                show-overflow-tooltip)
                            template(slot='header' slot-scope="scope")
                                TableFilterHeader(@handleHeaderCommand="initFilterAlarmTable" :column="column" :searchParams="sendParams")
                            template(slot-scope="scope")
                                router-link(v-if="column.prop === 'server_name'"
                                            :to="{path: '/component-monitor/component-dashboard', query: {server_id : scope.row.server_id, server_name: scope.row.server_name, server_code: scope.row.server_code}}")
                                    | {{scope.row[column.prop]}}
                                router-link(v-else-if="column.prop === 'instance_name'" :to="{path: '/monitor-details/host-dashboard', query: {instance_id : scope.row.instance_id, instance_name: scope.row.instance_name}}")
                                    | {{scope.row[column.prop]}}
                                span(v-else-if="column.prop === 'resource_type'") {{FormatResourceType(scope.row.resource_type)}}
                                span(v-else-if="column.prop === 'owner_type'") {{(scope.row.owner_type || '--')   | TranslateOrgApp}}
                                span(v-else-if="column.prop === 'alert_count'") {{scope.row.alert_count}}
                                span(v-else) {{scope.row[column.prop] || '--'}}
</template>
<script>

import Api from '@api'
import {mapActions, mapGetters} from 'vuex'
import TableFilterHeader from '@/components/common/TableFilterHeader'

export default {
    components: { TableFilterHeader },
    data () {
        return {
            breadcrumbItems: [
                { prop: '/component-monitor', label: '组件监控' }
            ],
            
            pagination: {
                index: 1,
                size: 20,
                total: 0,
                count: 0
            },
            tableData: [],
            isLoading: false,
            columns: [
                { prop: 'server_name', label: '实例名' },
                { prop: 'instance_name', label: '所属主机' },
                { prop: 'owner_name', label: '资源所属' },
                { prop: 'owner_type', label: '资源所属类型' },
                { prop: 'host', label: '主机IP' },
                { prop: 'resource_type', label: '实例类型' },
                { prop: 'metrics', label: '指标详情' },
                { prop: 'alert_count', label: '告警数' }
            ],
            sendParams: {},
            filterItems: [
                { label: '主机IP', key: 'search', type: 'input' }
            ],
            tableContainerHeight: 100,
            excludeResourceType: ['ecs', 'nas', 'f5']
        }
    },
    created () {
        this.initAlarmTable()
        let resourceColumn = this.columns.find(column => column.prop === 'resource_type')
        // 当前组件监控-实例
        Api.get('service_components_typelist', {}).then(res => {
            if (res) {
                let resourceTypeMap = res.filter(resource => resource.key !== 'unknown')
                this.$set(resourceColumn, 'filters', resourceTypeMap)
            }
        })
        // vuex-组件实例
        if (!this.resourceTypeMap) {
            Api.get('service_select_options_api', {}).then(res => {
                if (res) 
                    this.setResourceTypeMap(res)
            })
        } 
    },
    methods: {
        ...mapActions([
           'setResourceTypeMap'
        ]),
        // 调整分页大小的参数
        handleSizeChange (val) {
            this.pagination.size = val
            this.pagination.index = 1
            this.initAlarmTable()
        },
        handleCurrentChange (val) {
            this.pagination.index = val
            this.initAlarmTable()
        },

        initAlarmTable (filterParam = {}) {
            this.isLoading = true
            let sendParams = {
                ...{ limit: this.pagination.size, offset: this.pagination.index },
                ...this.sendParams
            }
            Api.get('component_monitor_list', sendParams).then(res => {
                this.isLoading = false
                if (res) {
                    this.tableData = res.list || []
                    this.pagination.total = res.total || 0
                    this.pagination.count = res.pages || 1
                }
            }, () => { this.isLoading = false })
        },
        initFilterAlarmTable (params) {
            this.sendParams = { ...{}, ...params }
            this.pagination.index = 1
            this.initAlarmTable()
        },
        FormatResourceType (type) {
            return this.resourceTypeMap.find(item => item.value === type).label
        }
    },
    computed: {
        ...mapGetters([
            'resourceTypeMap'
        ]),
        tableMaxHeight () {
            return this.tableContainerHeight - 10
        }
    }
  }
</script>

