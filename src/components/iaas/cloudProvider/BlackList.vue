<template lang="pug">
    div.full-height
        UcmpContainer.iaas(:breadcrumbItems="breadcrumbItems")
            div.full-container(slot="content")
                div.top-button-container
                    el-button.default-button(type="primary" size="small" icon="el-icon-plus" @click="addBlackRule") 创建同步规则
                UcmpTableContainer(
                    :pagination="pagination"
                    :searchPlaceholder="filter.searchPlaceholder"
                    @sizeChange="handleSizeChange"
                    @currentChange="handleCurrentChange"
                    :submit="searchBlackRule"
                )
                    div.full-height.padding-top(slot="tableContainer")
                        el-table(:data="tableData" border)
                            el-table-column(v-for="column in columns" :prop="column.prop" :key="column.prop" :label="column.label" :width="column.width")
                                template(slot-scope="scope")
                                    el-input(v-if="column.prop === 'rule'"
                                        type="textarea"
                                        readonly
                                        :autosize="{maxRows: 4}"
                                        v-model="scope.row[column.prop]"
                                    )
                                    div(v-else) {{scope.row[column.prop]}}
                            el-table-column(label="操作" width="150px")
                                template(slot-scope="scope")
                                    Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
        el-dialog(:title="ruleTitle" v-if="ruleVisible" :visible.sync="ruleVisible" width="900px")
            EditBlackRule(:provider_id="provider_id" :ruleInfo="ruleInfo" @closeDialog="closeDialog" @submitForm="submitForm")
</template>
<script>
/**
 * 同步规则列表
 */
import Api from '@api'
import EditBlackRule from './EditBlackRule'
//表格列配置
const columns = [
    {prop: 'name', label: '规则名称', width: '200'},
    {prop: 'rule', label: '规则脚本'}
]
//表格操作配置operations
const operations = [
    {
        type: 'ucmp-icon-edit',
        label: '编辑',
        prop: 'edit'
    },
    {
        prop: 'delete',
        label: '删除',
        type: 'ucmp-icon-delete'
    }
]

export default {
    name: 'BlackList',
    data () {
        return {
            ruleTitle: '创建同步规则',
            ruleVisible: false,
            ruleInfo: null,
            provider_id: '',
            searchParams: {},
            breadcrumbItems: [
                {prop: '/cloud-provider', label: '云厂商'},
                {prop: '', label: '同步规则'}
            ],
            pagination: {
                index: 1,
                size: 20,
                total: 0
            },
            operations: operations,
            filter: {
                searchPlaceholder: '请输入规则名称'
            },
            columns: columns,
            tableData: []
        }
    },
    methods: {
        /**
         * @description 获取规则列表
         */
        getBlackRuleList () {
            let pageParam = { provider_id: this.provider_id, offset: this.pagination.index, limit: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            Api.get('providerRule', resObj, true).then(
                res => {
                    this.tableData = res.list
                    this.pagination.total = res.total || 0
                }
            )
        },
        /**
         * @description 创建黑名单规则
         */
        addBlackRule () {
            this.ruleInfo = null
            this.ruleVisible = true
        },
        searchBlackRule (param) {
            this.pagination.index = 1
            if (param.searchKey) {
                this.$set(param, 'name', param.searchKey)
                delete param.searchKey
            }
            this.searchParams = Object.assign({}, param)
            this.getBlackRuleList()
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
        /**
         * @description 删除当前条目事件
         * @params rowObj 当前行数据
         */
        handleDelete (rowObj) {
            this.$confirm(`是否删除同步规则: ${rowObj.row.name}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('providerRule', {provider_id: this.provider_id, id: rowObj.row.id}, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                        this.searchParams = {}
                        this.getBlackRuleList()
                    }
                )
            }).catch(() => {
            })
        },
        /**
         * @description 修改当前条目事件
         * @param [scope] 当前行数据
         */
        handleEdit (scope) {
            this.ruleTitle = '修改同步规则'
            this.ruleInfo = scope.row
            this.ruleVisible = true
        },
        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getBlackRuleList()
        },
        /**
         * @description 当前页变化
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getBlackRuleList()
        },
        closeDialog () {
            this.ruleVisible = false
        },
        submitForm () {
            this.closeDialog()
            this.getBlackRuleList()
        }
    },
    created () {
        this.provider_id = this.$route.params.id
        this.getBlackRuleList()
    },
    components: {
        EditBlackRule
    }
}
</script>
<style lang="scss" scoped>

</style>
