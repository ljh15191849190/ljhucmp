<template lang="pug">
    div.full-container
        div.d-flex.justify-content-end.table-top-btn-pane
            el-tooltip(disabled)
                div
                    el-button.oper-icon-btn(icon="ucmp-icon-delete" size="small" :disabled="!curentSelected.length" @click="deleteStrategy(curentSelected, true)") 批量删除
            el-tooltip(effect="dark" :disabled="!(isBelongToEcsDetail && !instanceInfo.owner)" content="该资源没有所属机构或应用，请先进行分配所属组织" placement="top")
                div
                    el-button.oper-icon-btn(v-if="service_code" v-btn-privilege="service_code+'_create_alarm_strategy'" icon="el-icon-plus" @click="routerTo('add')" size="small" :disabled="isBelongToEcsDetail && !instanceInfo.owner") 创建告警策略
                    el-button.oper-icon-btn(v-else icon="el-icon-plus" @click="routerTo('add')" size="small" :disabled="isBelongToEcsDetail && !instanceInfo.owner") 创建告警策略
        UcmpTableContainer(
            :pagination.sync="pagination"
            @sizeChange="handleSizeChange"
            @currentChange="handleCurrentChange"
            :filterItems.sync="filterItems"
            :submit="filterStrateList"
        )
            div.full-height.position-relative(slot="tableContainer")
                el-table(:data="tableData" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" @selection-change="handleSelectionChange")
                    el-table-column(type="selection" width="45" :selectable="selectable")
                    el-table-column(:prop="column.prop"
                        v-for="column in columns"
                        :width="column.width"
                        :key="column.prop"
                        :label="column.label"
                        show-overflow-tooltip)
                        template(slot='header' slot-scope="scope")
                            TableFilterHeader(@handleHeaderCommand="handleHeaderCommand" :column="column" :searchParams="searchParams")
                        template(slot-scope="scope")
                            div(v-if="column.prop === 'operation'")
                                el-button(type="text" @click="routerTo('edit', scope.row)" :disabled="isBelongToEcsDetail && scope.row.origin === 1") 编辑
                                el-button(type="text" @click="deleteStrategy(scope.row)" :disabled="isBelongToEcsDetail && scope.row.origin === 1") 删除
                            span(v-else-if="column.prop === 'enable'")
                                i.rule-status(:class="{'is-enabled': scope.row[column.prop], 'is-disabled': !scope.row[column.prop]}")
                                span {{scope.row[column.prop] ? '启用' : '禁用'}}
                            span(v-else-if="column.prop === 'create_time'") {{scope.row[column.prop] * 1000 | FormatTime}}
                            span(v-else-if="column.prop === 'severity'")
                                el-tag.level-tag(:class="`bg-alarm-${scope.row[column.prop]}`") {{scope.row[column.prop] | FormatAlarmLevel(true)}}
                            span(v-else-if="column.prop === 'alert_type'") {{scope.row[column.prop] | FormatAlertType}}
                            span(v-else-if="column.prop === 'resource_type'") {{FormatResourceType(scope.row[column.prop])}}
                            span(v-else-if="column.prop === 'rule_name'")
                                el-button(type="text" @click="routerTo('view', scope.row)") {{scope.row[column.prop]}}
                            span(v-else) {{scope.row[column.prop]}}
                div.bot-tip.tip-text(v-if="isBelongToEcsDetail") 提示：该策略列表仅可编辑/删除当前资源下创建的策略，在“告警策略管理”下定义的策略，本列表中只可查看，不能进行编辑/删除。
</template>
<script>
// 告警策略管理列表
import {mapGetters, mapActions} from 'vuex'
import Api from '@api'
import TableFilterHeader from '@/components/common/TableFilterHeader'
import { AlarmType, AlarmLevel } from '@/server/ConstParams'

const StrategyEnable = [{value: true, label: '启用'}, {value: false, label: '禁用'}]

export default {
    components: { TableFilterHeader },
    props: {
        /**
         * @param isBelongToEcsDetail 该列表属于哪个模块
         * isBelongToEcsDetail = false -> 监控告警模块
         * isBelongToEcsDetail = true -> 控制台下主机详情下
         */
        isBelongToEcsDetail: {
            type: Boolean,
            default: false
        },
        instanceInfo: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            columns: [
                { prop: 'rule_name', label: '名称' },
                { prop: 'enable', label: '是否启用', filters: StrategyEnable },
                { prop: 'severity', label: '告警级别', filters: AlarmLevel },
                { prop: 'alert_type', label: '告警类型', filters: AlarmType },
                { prop: 'resource_type', label: '监控对象类型' },
                { prop: 'alert_way', label: '告警方式' },
                { prop: 'create_by', label: '创建人' },
                { prop: 'create_time', label: '创建时间' },
                { prop: 'operation', label: '操作' }
            ],
            tableData: [],
            pagination: {
                index: 1,
                size: 20,
                tatal: 0,
                count: 0
            },

            filterItems: [],
            isLoading: false,
            curentSelected: [],
            tableContainerHeight: 100,
            searchParams: {},
            service_code: ''
        }
    },
    created () {
        // 获取监控对象类型集合
        if (this.resourceTypeMap)
            this.initStrategyList()
        else
            this.getResourceMap()

        this.filterItems.push({ label: '策略名称', key: 'rule_name', type: 'input' })
    },

    methods: {
        ...mapActions([
            'setResourceTypeMap'
        ]),
        refreshList (pagination) {
            let params = {...this.searchParams}
            params.offset = pagination.index
            params.limit = pagination.size
            this.isLoading = true
            let apiUrl = ''
            if (this.isBelongToEcsDetail) {
                apiUrl = 'api_instance_alarm_rules_list'
                params.instance_id = this.instanceInfo.instance_id || this.instanceInfo[`${this.service_code}_id`]
            } else if (!this.isBelongToEcsDetail && this.instanceInfo && this.instanceInfo.bare_id) {
                apiUrl = 'api_instance_alarm_rules_list'
                params.instance_id = this.instanceInfo.bare_id
            } else
                apiUrl = 'api_alarm_rules_list'

            Api.get(apiUrl, params).then(
                res => {
                    this.isLoading = false
                    if (res) {
                        this.tableData = res.list

                        this.pagination.total = res.total
                    }
                }
            )
        },
        handleSizeChange (val) {
            this.pagination.size = val
            this.pagination.index = 1
            this.refreshList(this.pagination)
        },
        handleCurrentChange (val) {
            this.pagination.index = val
            this.refreshList(this.pagination)
        },
        handleSelectionChange (selected) {
            this.curentSelected = JSON.parse(JSON.stringify(selected))
        },
        filterStrateList (param) {
            delete this.searchParams.rule_name
            this.searchParams = {...this.searchParams, ...param}
            this.pagination.index = 1
            this.refreshList(this.pagination)
        },

        /**
         * type => add | edit | view
         * */
        routerTo (type, row = {}) {
            if (this.isBelongToEcsDetail)
                this.$router.push({path: 'strategy-edit', query: {type: type, isBelongToEcsDetail: this.isBelongToEcsDetail, instanceInfo: this.instanceInfo, strategyId: row.id}})
            else if (!this.isBelongToEcsDetail && this.instanceInfo && this.instanceInfo.bare_id)
                this.$router.push({path: 'strategy-edit', query: {type: type, isBelongToEcsDetail: !this.isBelongToEcsDetail, instanceInfo: this.instanceInfo, strategyId: row.id}})
            else
                this.$router.push({path: '/strategy-mgr/edit', query: {type: type, isBelongToEcsDetail: this.isBelongToEcsDetail, strategyId: row.id}})
        },
        // 删除
        deleteStrategy (row, isList) {
            let tipName = ''
            let strategyIds = ''
            if (isList) {
                tipName = row.map(item => item.rule_name).join('，')
                strategyIds = row.map(item => item.id).join(',')
            } else {
                tipName = row.rule_name
                strategyIds = row.id
            }

            this.$confirm(`请确认是否删除告警策略【${tipName}】?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                customClass: 'warningConfirmBox',
                type: 'warning'
            }).then(() => {
                this.isLoading = true
                Api.delete('api_alarm_rule_delete', {id: strategyIds}).then(
                    res => {
                        this.isLoading = false
                        if (res) {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            })
                            this.pagination.index = 1
                            this.refreshList(this.pagination)
                        }
                    }
                )
            }).catch(() => {})
        },
        getResourceMap () {
            Api.get('service_select_options_api', {}).then(
                res => {
                    // 存储到VUEX中
                    this.setResourceTypeMap(res)
                    this.initStrategyList()
                }
            )
        },

        // 初始化告警策略列表
        initStrategyList () {
            let resouce_type_column = this.columns.find(column => {
                return column.prop === 'resource_type'
            })
            if (!this.isBelongToEcsDetail) {
                this.$nextTick(() => {
                    this.$set(resouce_type_column, 'filters', [])
                    this.resourceTypeMap.forEach(item => {
                        if (item.value)
                            resouce_type_column.filters.push(item)
                    })
                })
            } else {
                let conf = this.resourceTypeMap.find(item_type => {
                    return this.$route.params.code === item_type.key
                })
                this.service_code = conf && conf.key ? conf.key : ''
                this.searchParams.resource_type = conf ? conf.value : undefined
            }

            // 获取列表
            this.refreshList(this.pagination)
        },

        FormatResourceType (type) {
            return this.resourceTypeMap.find(item => item.value === type).label
        },
        handleHeaderCommand (filterParam) {
            this.searchParams = {...this.searchParams, ...filterParam}
            this.pagination.index = 1
            this.refreshList(this.pagination)
        },
        selectable (row) {
            return !(this.isBelongToEcsDetail && row.origin === 1)
        }
    },
    computed: {
        tableMaxHeight () {
            return this.tableContainerHeight - 50
        },
        ...mapGetters([
            'resourceTypeMap'
        ])
    }
}
</script>
<style lang="scss" scoped>
.full-container{
    position: relative;
}
.table-top-btn-pane{
    height: 40px;
    z-index: 100;
}
.rule-status {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 10px;
    border-radius: 50%;
    vertical-align: text-top;
}
.bot-tip {
    position: absolute;
    bottom: -2em;
    left: 0
}
</style>
