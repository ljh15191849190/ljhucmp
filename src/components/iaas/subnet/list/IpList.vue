<template lang="pug">
    div.full-height
        UcmpTableContainer(
            :pagination.sync="pagination"
            :filterItems="filter"
            @sizeChange="handleSizeChange"
            @currentChange="handleCurrentChange"
            :submit="searchIp"
        )
            div.full-height(slot="tableContainer")
                div.d-flex.padding-bottom(slot="otherPanels")
                    span.state-panel 总数
                    span.margin-left ({{ allCount }})
                    span.margin-left.margin-right :
                    span.adjust-tag(v-for="state in states" :key="state.prop" @click="setState(state.prop)")
                        el-tag(:type="state.type")
                        span {{ state.label }} ( {{ state.total ? state.total : 0 }} )
                el-table.panel-table-container(:data="tableData" highlight-current-row @current-change="handleTableCurrentChange" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                    el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                        template(slot-scope="scope")
                            span(v-if="column.prop !== 'family' && column.prop !== 'status' && column.prop !== 'last_updated'") {{ scope.row[column.prop] }}
                            el-tag(v-else-if="column.prop === 'status'" :type="stateObj[scope.row.status.value].type" size="mini") {{ stateObj[scope.row.status.value].label }}
                            span(v-else-if="column.prop === 'last_updated'") {{ formatterTime(scope.row.last_updated) }}
                            span(v-else) {{ 'IPv' + scope.row[column.prop] }}
                    el-table-column(label="操作" width="150")
                        template(slot-scope="scope")
                            Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
            el-button.default-button(slot="filter-btns" type="primary" size="small") 查询
        el-dialog(title="修改IP" v-if="ipEditVisible" :visible.sync="ipEditVisible" width="600px")
            EditIp(@closeDialog="closeEditIpDialog" @submitIp="submitIp" :ipInfo="ipForm")
</template>
<script>
import Api from '@api'
import DateUtil from '@server/date-utils'
import EditIp from '../EditIp'
import Subnet from '@mock/subnet/subnet.mock'
import OperMixin from '@mixins/operatorLog.mixin'

// 过滤条件配置
const filterItems = [
    {
        label: '请输入IP',
        key: 'ip',
        type: 'input'
    },
    {
        label: '状态',
        key: 'status',
        type: 'select',
        multiple: false,
        defaultOptions: Subnet.ipStates,
        data_link: {
            text_field: 'label',
            value_field: 'prop'
        }
    }
]
export default {
    mixins: [OperMixin],
    data () {
        return {
            searchParams: {},
            allCount: 0,
            cloudProvider: '',
            advanceSwitch: true,
            ipEditVisible: false,
            ipForm: {},
            checkedIp: null,
            pagination: {
                index: 1,
                size: 20,
                total: 0
            },
            operations: [
                {
                    type: 'ucmp-icon-edit',
                    label: '编辑',
                    prop: 'edit'
                },
                {
                    type: 'ucmp-icon-delete',
                    label: '删除',
                    prop: 'delete'
                }
            ],
            filter: filterItems,
            states: Subnet.ipStates,
            columns: Subnet.ipColumns,
            tableData: [],
            isLoading: false
        }
    },
    computed: {
        stateObj () {
            let rst = {}
            this.states.forEach(
                item => {
                    rst[item.prop] = {
                        type: item.type,
                        label: item.label
                    }
                }
            )
            return rst
        }
    },
    methods: {
        handleTableCurrentChange (val) {
            this.checkedIp = val
        },
        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getIpList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getIpList()
        },
        closeEditIpDialog () {
            this.ipEditVisible = false
        },
        submitIp () {
            this.closeEditIpDialog()
            this.getIpList()
        },
        /**
         * @description 搜索ip
         * @param [param] 搜索对象
         */
        searchIp (param) {
            this.pagination.index = 1
            this.searchParams = Object.assign({}, param)
            this.getIpList()
        },
        /**
         * @description 获取ip列表
         */
        getIpList () {
            //UCMP3-517 网络管理--ip地址，带条件查询后，查询数据汇总数据（不同状态）不正确（见截图）
            //解决方法：服务端修改接口，前端作相应变更
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            let tenantParam = { tenant: localStorage.getItem('tenant') }
            let resObj = Object.assign(pageParam, this.searchParams, tenantParam)
            this.isLoading = true
            Api.get('iass_ipList', resObj, false).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.results
                    this.allCount = res.active_count + res.reserved_count + res.deprecated_count + res.dhcp_count
                    if (!this.searchParams.status)
                        this.pagination.total = res.active_count + res.reserved_count + res.deprecated_count + res.dhcp_count
                    else if (+this.searchParams.status === 1)
                        this.pagination.total = res.active_count
                    else if (+this.searchParams.status === 2)
                        this.pagination.total = res.reserved_count
                    else if (+this.searchParams.status === 3)
                        this.pagination.total = res.deprecated_count
                    else if (+this.searchParams.status === 5)
                        this.pagination.total = res.dhcp_count
                    this.$set(this.states[0], 'total', res.active_count)
                    this.$set(this.states[1], 'total', res.reserved_count)
                    this.$set(this.states[2], 'total', res.deprecated_count)
                    this.$set(this.states[3], 'total', res.dhcp_count)
                },
                () => {
                    this.isLoading = false
                }
            )
        },
        setState (state) {
            let statusParam = {status: state}
            this.pagination.index = 1
            this.searchParams = {...this.searchParams, ...statusParam}
            this.getIpList()
        },
        formatterTime (time) {
            return DateUtil.formate(new Date(time))
        },
        /**
         * @description 操作处理
         */
        handleOperation (obj) {
            //删除操作
            if (obj.id === 'delete')
                this.handleDelete(obj)
            else
                this.handleEdit(obj)
        },
        handleEdit (scope) {
            this.ipForm = scope.row
            this.ipEditVisible = true
        },
        /**
         * @description 删除操作
         */
        handleDelete (obj) {
            this.$confirm(`确定删除IP ${obj.row.address}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteIp(obj.row.id, obj.row.address)
            }).catch(() => {
            })
        },
        /**
         * @description 删除IP
         */
        deleteIp (id, address) {
            Api.delete('iaas_ips', { _id: id }, true).then(
                res => {
                    this.$message({
                        type: 'success',
                        message: address + '删除成功!'
                    })
                    this.searchParams = {}
                    this.getIpList()

                    // 插入操作日志
                    this.addOperLog({
                        text: '删除IP: ' + address,
                        modular_code: this.MODULAR_CODE.CLOUDINFRASTRUCTURE,
                        type_code: this.TYPE_CODE.DELETE,
                        resource: 'IP'
                    })
                }
            )
        }
    },

    created () {
        this.getIpList()
    },
    components: {
        EditIp
    }
}
</script>
<style lang="scss" scoped>
.state-panel {
    margin-left: 30px;
}
.demo-table-expand {
    font-size: 0;
}
.demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 33%;
}
.panel-table-container {
    height: calc(100% - 37px);
}
</style>
