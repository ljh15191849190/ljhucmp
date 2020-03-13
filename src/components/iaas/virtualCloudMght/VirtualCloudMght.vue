<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            UcmpTableContainer(
                :pagination="pagination"
                :advance="advanceSwitch"
                :filterItems="filterItems"
                @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"
                :submit="handleSearch"
                :containerHeight.sync="tableContainerHeight"
            )
                div.full-height(slot="tableContainer")
                    div.d-flex
                        el-tooltip(v-for="(btn, index) in basicBtns" :key="index" :content="btn.label" placement="bottom")
                            div.operator-btn-container
                                el-button.circle-btn.ucmp-service-action(circle v-if="btn.icon" plain :type="btn.type" :icon="btn.icon" size="mini" :disabled="checkBtnDisabled(btn)" @click="operationClick(btn)")
                                el-button.circle-btn.ucmp-service-action(v-else plain type="text" :icon="btn.icon" size="mini" :disabled="checkBtnDisabled(btn)" @click="operationClick(btn)") {{btn.label}}
                    el-table.margin-top(:data="tableData" stripe v-loading="isLoading" 
                    @selection-change="handleSelectionChange"
                    :max-height="tableMaxHeight()"
                    element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(type="selection" width="45")
                        el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'sync_at'") {{ formatterTime(scope.row[column.prop]) }}
                                span(v-else-if="column.prop === 'machine_type'") {{scope.row[column.prop] === 0 ? '桌面操作系统':'服务器操作系统'}}
                                el-switch(v-else-if="column.prop === 'maintenance_mode'" v-model="scope.row[column.prop]" active-value=true
                                inactive-value=false
                                 @change="changeMode(scope.row)")
                                el-tag(v-else-if="(column.prop === 'power_state')" :color="stateObj[scope.row[column.prop]].color" size="mini") 
                                    span.state-color {{ stateObj[scope.row[column.prop]].label }}
                                span(v-else) {{scope.row[column.prop]}}
                        el-table-column(label="操作")
                            template(slot-scope="scope")
                                Icon-Button(v-for="oper in operations" :key="oper.prop" :type="oper.type" @iconClick="handleOpration(scope.row)" :args="{id: oper.prop, row: scope.row}" :text="oper.label")
</template>
<script>
/**
 * @description 桌面云计算机管理
 */
import Api from '@api'
import DateUtil from '@server/date-utils'
export default {
    name: 'VirtualCloudMght',
    data () {
        return {
            tableContainerHeight: 100,
            tableData: [],
            isLoading: false,
            searchParams: {},
            advanceSwitch: false,
            breadcrumbItems: [
                { prop: '', label: '桌面云计算机管理' }
            ],
            pagination: { index: 1, total: 1, size: 20 },
            selectCitrix: [],
            filterItems: [
                {
                    label: '操作系统类型',
                    key: 'machine_type',
                    type: 'select',
                    multiple: false,
                    defaultOptions: [
                        {id: 0, name: '桌面操作系统'},
                        {id: 1, name: '服务器操作系统'}
                    ],
                    data_link: {
                        text_field: 'name',
                        value_field: 'id'
                    }
                },
                {
                    label: '交付组',
                    key: 'delivery_group_id',
                    type: 'select',
                    multiple: false,
                    data_link: {
                        endpoint: '/vdi/xen_machine/groups',
                        text_field: 'delivery_group_name',
                        value_field: 'delivery_group_id'
                    }
                },
                {
                    label: '计算机目录',
                    key: 'catalog_id',
                    type: 'select',
                    multiple: false,
                    data_link: {
                        endpoint: '/vdi/xen_machine/catalogs',
                        text_field: 'catalog_name',
                        value_field: 'catalog_id'
                    }
                }
            ],
            operations: [
                { prop: 'view', label: '查看会话', type: 'ucmp-icon-see-session' }
            ],
            columns: [
                { prop: 'machine_name', label: '名称' },
                { prop: 'machine_catalog_name', label: '计算机目录' },
                { prop: 'delivery_group_name', label: '交付组' },
                { prop: 'session_count', label: '会话数量' },
                { prop: 'machine_type', label: '操作系统' },
                { prop: 'power_state', label: '电源状态' },
                { prop: 'sync_at', label: '上次同步时间' },
                { prop: 'maintenance_mode', label: '维护模式' }
            ],
            basicBtns: [
                {prop: 'Loginout', label: '注销', icon: 'ucmp-icon-loginout'},
                {prop: 'Restart', label: '重新启动', icon: 'ucmp-icon-reboot'},
                {prop: 'Reset', label: '强制重新启动', icon: 'ucmp-icon-force-reboot'},
                {prop: 'Shutdown', label: '关闭', icon: 'ucmp-icon-close'},
                {prop: 'TurnOff', label: '强制关闭', icon: 'ucmp-icon-force-close'}
            ]
        }
    },
    created () {
        this.getCittixDeskList()
    },
    methods: {
        /**
         * @description 计算机管理列表
         */
        getCittixDeskList () {
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('citrixMachine', resObj, true).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.list
                    this.pagination.total = res.total
                }, () => {
                    this.isLoading = false
                }
            )
        },
        changeMode (rowObj) {
            //UCMP3-5067【云桌面计算机管理】打开计算机的维护模式，成功之后，状态未改变
            //问题原因：后端字段maintenance_mode由1,0 -> true, false造成
            let maintenance_mode = !rowObj.maintenance_mode 
            let msg = maintenance_mode ? `关闭维护模式: ${rowObj.machine_name}, 是否继续?` : `开启维护模式: ${rowObj.machine_name}, 是否继续?`
            this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.post('citrixMachineSwitch', {id: rowObj.id, open: rowObj.maintenance_mode}).then(
                    res => {
                        let message = maintenance_mode ? '关闭维护模式操作成功!' : '开启维护模式操作成功!'
                        this.$message({
                            type: 'success',
                            message: message
                        })
                        this.getCittixDeskList()
                    }, () => {
                        rowObj.maintenance_mode = maintenance_mode
                    }
                )
            }).catch(() => {
                rowObj.maintenance_mode = maintenance_mode
            })
        },
        checkBtnDisabled (btn) {
            // 状态：注销(选中一个即可)
            if (btn.prop === 'Loginout') return this.selectCitrix.length !== 1
            if (this.selectCitrix.length !== 1) return true
            // 状态：电源状态(关闭) 不可以关闭和强制关闭
            if (this.selectCitrix[0].power_state === 3)
                return btn.prop === 'Shutdown' || btn.prop === 'TurnOff'
            
            // 状态：电源状态(中间状态) 除了注销外不能操作
            if (this.selectCitrix[0].power_state === 1 || this.selectCitrix[0].power_state === 2) 
                return true

            return false
        },
        operationClick (btn) {
            if (btn.prop === 'Loginout')
                this.citrixLoginout(btn)
            else 
                this.citrixPerform(btn)
        },
        /**
         * @description 注销操作
         */
        citrixLoginout (btn) {
            let citrixInstance = this.selectCitrix[0]
            this.$confirm(`确定${btn.label}: ${citrixInstance.machine_name}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.put('citrixMachineLogout', {provider_id: citrixInstance.provider_id, machine_name: citrixInstance.machine_name}, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: `${btn.label}: ${citrixInstance.machine_name}的操作成功!`
                        })
                        this.getCittixDeskList()
                    }, () => {
                        this.$message({
                            type: 'error',
                            message: `${btn.label}: ${citrixInstance.machine_name}的操作失败!`
                        })
                    }
                )
            }).catch(() => {
            })
        },
        citrixPerform (btn) {
            let citrixInstance = this.selectCitrix[0]
            this.$confirm(`确定${btn.label}: ${citrixInstance.machine_name}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.post('citrixMachinePerform', {id: citrixInstance.id, action: btn.prop}, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: `${btn.label}: ${citrixInstance.machine_name}的操作成功!`
                        })
                        this.getCittixDeskList()
                    }, () => {
                        this.$message({
                            type: 'error',
                            message: `${btn.label}: ${citrixInstance.machine_name}的操作失败!`
                        })
                    }
                )
            }).catch(() => {
            })
        },
        handleOpration (row) {
            this.$router.push({path: '/virtual-cloud-mght/query-session', query: {provider_id: row.provider_id, machine_name: row.machine_name}})
        },
        handleSelectionChange (selectCitrix) {
            this.selectCitrix = selectCitrix
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getCittixDeskList()
        },
        /**
         * @description 页码变化
         * @param index 页码索引
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getCittixDeskList()
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSearch (param) {
            this.pagination.index = 1
            this.searchParams = Object.assign({}, param)
            this.getCittixDeskList()
        },
        /**
         * @description 格式化时间显示
         * @param time  时间戳
         */
        formatterTime (time) {
            if (!time) return ''
            return DateUtil.formate(new Date(time))
        },
        /**
         * @description 表格的最大高度
         */
        tableMaxHeight () {
            return this.tableContainerHeight - 16 - 34
        }
    },
    computed: {
        stateObj () {
            let rst = {}
            const states = [
                {color: '#0198e4', prop: 1, label: '未知'},
                {color: '#8bd8fe', prop: 2, label: '未知'},
                {color: '#ffaa00', prop: 3, label: '关闭'},
                {color: '#61c359', prop: 4, label: '开启'}
            ]
            states.forEach(
                item => {
                    rst[item.prop] = {
                        label: item.label,
                        color: item.color
                    }
                }
            )
            return rst
        }
    }
}
</script>
<style lang="scss" scoped>
.state-color {
    color: $fontWhite
}
</style>
