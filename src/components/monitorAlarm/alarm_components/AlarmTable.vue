<template lang="pug">
    UcmpTableContainer(
        ref="alarmTableContainer"
        :filterItems.sync="filterItems"
        :pagination.sync="pagination"
        @sizeChange="handleSizeChange"
        :submit="fliterInitAlarmTable"
        :containerHeight.sync="tableContainerHeight"
        @currentChange="handleCurrentChange")
        div.table-container.full-height(slot="tableContainer")
            div.position-relative
                LabelGroup(:stateTypes="stateTypes" :setState="setState")
                el-button.pull-right(v-if="process !== '1'" size="small" type="primary" icon="el-icon-edit-outline" :disabled="!selecedAlarms.length" @click="handleAlarmStatus(selecedAlarms)") 批量处理告警
            el-table.margin-top(:data="tableData" border v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" @selection-change="handleSelectionChange" :max-height="tableMaxHeight")
                el-table-column(v-if="process !== '1'" type="selection" width="45" :selectable="selectable")
                el-table-column(:prop="column.prop"
                        v-for="column in columns"
                        :width="column.width"
                        :key="column.prop"
                        :label="column.label"
                        show-overflow-tooltip)
                    template(slot='header' slot-scope="scope")
                        TableFilterHeader(@handleHeaderCommand="initAlarmTable" :column="column" :searchParams="searchParams")
                    template(slot-scope="scope")
                        router-link(v-if="(column.prop === 'name') && scope.row[column.prop]" :to="{path: '/strategy-mgr/edit', query: {type: 'view', isBelongToEcsDetail: false, strategyId: scope.row.rule_id}}") {{scope.row[column.prop]}}
                        span(v-else-if="column.prop === 'resource_type'") {{FormatResourceType(scope.row.resource_type)}}
                        el-tag.level-tag(v-else-if="column.prop === 'severity'" :class="`bg-alarm-${scope.row.severity}`") {{scope.row[column.prop] | FormatAlarmLevel}}
                        span(v-else-if="column.prop === 'occurred-at'")
                            span 初次：{{scope.row.create_time | FormatTime}}
                            br
                            span.text-danger 最后
                            span ：{{scope.row.update_time| FormatTime}}
                        span(v-else-if="column.prop === 'owner'" v-show="scope.row.owner_type") ({{scope.row.owner_type | TranslateOrgApp}})
                            | {{scope.row.owner || '--'}}
                        span(v-else-if="column.prop === 'manner'")
                            el-button.no-padding(size="small" type="text" @click="openChangeDialog(scope.row['alert-serial'])") 标为已知
                        span(v-else) {{scope.row[column.prop] || (column.hasOwnProperty('defaultValue') ? column.defaultValue : '--')}}
                el-table-column(v-if="process !== '1'" label="处理")
                    template(slot-scope="scope")
                        el-button.no-padding(type="text" :disabled="scope.row.processed" @click="handleAlarmStatus([scope.row])") 标为已知
</template>

<script>
/**
 * @description 告警管理
 */
import Api from '@api'
import TableFilterHeader from '@/components/common/TableFilterHeader'
import { AlarmLevel } from '@/server/ConstParams'
import {mapGetters, mapActions} from 'vuex'
import LabelGroup from '@/components/console/LabelGroup'

export default {
    components: { TableFilterHeader, LabelGroup },
    props: {
        process: {
            type: [String, Number],
            default: ''
        },
        alarmType: {
            type: [String, Number],
            default: ''
        },

        alarmTimeRange: {
            type: Array,
            default () {
                return []
            }
        },

        instanceType: {
            type: String,
            default: ''
        },

        instanceId: {
            type: String,
            default: ''
        },

        isEcsAlarm: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            breadcrumbItems: [
                { prop: '', label: '告警管理' }
            ],
            columns: [
                { prop: 'name', label: '告警策略', order: true },
                { prop: 'severity', label: '级别', width: 90, filters: AlarmLevel, order: true },
                { prop: 'source', label: '告警来源' },
                { prop: 'owner', label: '资源所属' },
                { prop: 'resource_type', label: '服务类型', order: true },
                { prop: 'cnt', label: '重复次数', defaultValue: 0, order: true },
                { prop: 'summary', label: '告警内容' },
                { prop: 'occurred-at', label: '告警时间' }
            ],
            tableContainerHeight: 0,
            tableData: [],
            pagination: {
                index: 1,
                size: 20,
                total: 0,
                count: 0
            },
            isLoading: false,

            stateTypes: AlarmLevel,
            searchParams: {},
            selecedAlarms: [],
            filterItems: [
                {
                    label: '时间范围',
                    key: 'timeRange',
                    type: 'daterange'
                }
            ]
        }
    },
    methods: {
        ...mapActions([
           'setResourceTypeMap'
        ]),
        initTableDdatas () {
            let params = {
                offset: this.pagination.index,
                limit: this.pagination.size
            }
            params = {...params, ...this.searchParams}
            if (params.timeRange && params.timeRange.length) {
                params.from = this.searchParams.timeRange[0]
                params.to = this.searchParams.timeRange[1] + 86400000  // 结束时间延后 1d
                delete params.timeRange
            }
            this.isLoading = true
            this.process && (params.process = this.process)
            if (this.instanceId)
                params.instance_id = this.instanceId || ''
            Api.get('alarm_list_api', params).then(res => {
                this.isLoading = false
                if (res) {
                    this.stateTypes.forEach(item => {
                        // item.count = res.eachTypeCount[item.id] || 0
                        this.$set(item, 'count', res.eachTypeCount[item.id])
                    })
                    this.pagination.total = res.total || 0
                    this.pagination.count = res.pages || 1
                    this.tableData = res.list || []
                }
            }, () => { this.isLoading = false })
        },
        handleAlarmStatus (rows) {
            this.$confirm('确定修改当前告警状态吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                customClass: 'warningConfirmBox',
                type: 'warning'
            }).then(res => {
                let ids = rows.map(item => item.id)
                Api.put('change_alarm_status', {id: ids}).then(
                    res => {
                        this.$notify.success({title: '成功', message: '告警状态修改成功。'})
                        this.pagination.index = 1
                        this.initTableDdatas()
                    },
                    () => {
                        this.$notify.error({title: '失败', message: '告警状态修改失败。'})
                    }
                )
            }).catch(() => {})
        },
        handleSizeChange (val) {
            this.pagination.size = val
            this.pagination.index = 1
            this.initTableDdatas()
        },
        handleCurrentChange (val) {
            this.pagination.index = val
            this.initTableDdatas()
        },
        FormatResourceType (type) {
            return this.resourceTypeMap.find(item => item.value === type).label
        },
        fliterInitAlarmTable (param) {
            delete this.searchParams.timeRange
            this.initAlarmTable(param)
        },
        initAlarmTable (param) {
            this.searchParams = { ...this.searchParams, ...param }
            this.pagination.index = 1
            this.initTableDdatas()
        },
        setState (state) {
            this.searchParams.severity = state
            this.initAlarmTable(this.searchParams)
        },
        initColumnResourceOptions (typeMap) {
            // UCMP3-2477 从告警查询的服务类型过滤参数中去掉nas和f5
            let resourceMap = typeMap.filter(item => !['netapp', 'f5'].includes(item.key))
            if (!this.isEcsAlarm) {
                let resource_type_column = this.columns.find(column => column.prop === 'resource_type')
                if (resource_type_column)
                    this.$set(resource_type_column, 'filters', resourceMap)
            } else {
                let tarResourceType = resourceMap.find(resource => resource.key === this.instanceType)
                tarResourceType && (this.searchParams.resource_type = tarResourceType.value)
            }
        },
        // 控制台下的告警列表中已处理的告警禁止操作
        selectable (row) {
            return !row.processed
        },
        // 选择需要操作的告警
        handleSelectionChange (selected) {
            this.selecedAlarms = selected
        }
    },
    created () {
        this.stateTypes = this.stateTypes.map(item => {
            return {
                id: item.value,
                name: item.label,
                count: 0,
                class: `bg-alarm-${item.value}`
            }
        })
        // 告警分析下钻过来时会携带类型信息，须校验
        if (this.alarmType && this.alarmType !== 'total')
            this.searchParams.severity = Number(this.alarmType)

        // 其他页面 跳转至列表页面时给时间范围赋默认值
        if (this.alarmTimeRange && this.alarmTimeRange.length) {
            this.searchParams.timeRange = [
                this.alarmTimeRange[0],
                this.alarmTimeRange[1]
            ]
            this.$nextTick(() => {
                this.$refs.alarmTableContainer.assignValue('timeRange', this.alarmTimeRange)
            })
        }

        // 初始化过滤条件
        if (!this.resourceTypeMap) {
            Api.get('service_select_options_api', {}).then(
                res => {
                    if (res) {
                        this.setResourceTypeMap(res)
                        this.initColumnResourceOptions(this.resourceTypeMap)
                    }
                }
            )
        } else
            this.initColumnResourceOptions(this.resourceTypeMap)

        this.initTableDdatas()
    },
    computed: {
        ...mapGetters([
            'resourceTypeMap'
        ]),
        tableMaxHeight () {
            return this.tableContainerHeight - 15 - 21
        }
    }
}
</script>
<style lang="scss" scoped>
.pull-right {
    position: absolute;
    right: 0;
    bottom: 0;
}
</style>
