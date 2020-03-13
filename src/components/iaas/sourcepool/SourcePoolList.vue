<template lang="pug">
    div.full-height
        UcmpContainer.iaas(:breadcrumbItems="breadcrumbItems")
            div.full-container(slot="content")
                div.top-button-container
                    el-button.default-button(type="primary" size="small" icon="el-icon-plus" @click="add") 创建基础配置
                UcmpTableContainer(
                    :pagination="pagination"
                    :filterItems="filter.filterItems"
                    :searchPlaceholder="filter.searchPlaceholder"
                    @sizeChange="handleSizeChange"
                    @currentChange="handleCurrentChange"
                    :submit="searchSoucePool"
                )
                    div.full-height.padding-top(slot="tableContainer")
                        el-table(:data="tableData" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                            template(v-for="column in columns" )
                                el-table-column(:prop="column.prop" :key="column.prop" :label="column.label" :width="column.width")
                                    template(slot-scope="scope")
                                        span(v-if="column.prop === 'modified_at'") {{forMatDate(scope.row[column.prop])}}
                                        el-switch(v-else-if="column.prop === 'available'" v-model="scope.row[column.prop]" @change="changeAvailable(scope.row)")
                                        span(v-else) {{scope.row[column.prop]}}
                            el-table-column(label="操作")
                                template(slot-scope="scope")
                                    Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
</template>
<script>
/**
 * @description 基础配置list
 */
import Api from '@api'
import Utils from '@server/date-utils'

//表格列配置
const columns = [
    {prop: 'name', label: '基础配置名称', isLink: true},
    {prop: 'provider_name', label: '云厂商名称'},
    {prop: 'provider_code', label: '云厂商类型'},
    {prop: 'modified_by_name', label: '更新人'},
    {prop: 'modified_at', label: '更新时间'},
    {prop: 'available', label: '是否启用'}
]
//表格操作配置operations
const operations = [
    {
        type: 'ucmp-icon-edit',
        label: '编辑',
        prop: 'edit'
    },
    {
        type: 'ucmp-icon-alloc',
        label: '配置',
        prop: 'alloc'
    },
    {
        prop: 'delete',
        label: '删除',
        type: 'ucmp-icon-delete'
    }
]
// 过滤条件配置
const filterItems = [
    {
        label: '云厂商',
        key: 'provider_id',
        type: 'select',
        multiple: false,
        defaultOptions: [],
        data_link: {
            text_field: 'label',
            value_field: 'provider_id'
        }
    }
]

export default {
    data () {
        return {
            searchParams: {},
            breadcrumbItems: [
                {prop: '', label: '基础配置'}
            ],
            operations: operations,
            filter: {
                searchPlaceholder: '请输入基础配置名称',
                filterItems: filterItems
            },
            pagination: {
                index: 1,
                size: 20,
                total: 0
            },
            columns: columns,
            tableData: [],
            isLoading: false
        }
    },
    methods: {
        /**
         * @description 获取云厂商
         */
        getProviders () {
            Api.get('provider', {}, true).then(
                res => {
                    filterItems[0].defaultOptions = res.list.map(item => {
                        return {
                            provider_id: item.id,
                            label: item.name + '(' + item.provider_code + ')'
                        }
                    })
                }
            )
        },
        /**
         * @description 初始化获取基础配置列表
         */
        getSourcePoolList () {
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('sourcePool', resObj, true).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.list
                    this.pagination.total = res.total || 0
                }, () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * @description 搜索基础配置
         * @param [param] 搜索对象
         */
        searchSoucePool (param) {
            this.pagination.index = 1
            if (param.searchKey) {
                this.$set(param, 'name', param.searchKey)
                delete param.searchKey
            }
            this.searchParams = Object.assign({}, param)
            this.getSourcePoolList()
        },
        /**
         * @description 操作处理
         */
        handleOperation (obj) {
            //删除操作
            if (obj.id === 'delete')
                this.handleDelete(obj)
            else if (obj.id === 'edit')
                this.handleEdit(obj)
            else
                this.handleAlloc(obj)
        },
        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getSourcePoolList()
        },
        /**
         * @description 当前页变化
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getSourcePoolList()
        },
        /**
         * @description 配置服务
         * @param [scope] 当前行数据
         */
        handleAlloc (scope) {
            this.$router.push(`/resource-pool/allocate/${scope.row.id}`)
        },
        /**
         * @description 修改当前条目事件
         * @param [scope] 当前行数据
         */
        handleEdit (scope) {
            this.$router.push(`/resource-pool/resource/${scope.row.id}`)
        },
        /**
         * @description 删除当前条目事件
         * @params rowObj 当前行数据
         */
        handleDelete (rowObj) {
            this.$confirm(`是否删除基础配置: ${rowObj.row.name}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('sourcePool', {id: rowObj.row.id}, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                        this.searchParams = {}
                        this.getSourcePoolList()
                    }
                )
            }).catch(() => {
            })
        },
        /**
         * @description 格式化日期
         * @param [tempstams] 时间戳
         */
        forMatDate (tempstams) {
            return Utils.formate(tempstams)
        },
        /**
         * @description 新增 基础配置
         */
        add () {
            this.$router.push('/resource-pool/resource/add')
        },
        /**
         * @description 基础配置启用、禁止
         */
        changeAvailable (rowObj) {
            let available = !rowObj.available
            let msg = rowObj.available ? `启用基础配置: ${rowObj.name}, 是否继续?` : `禁用基础配置: ${rowObj.name}, 是否继续?`
            this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.patch('sourcePoolOpre', {id: rowObj.id, available: rowObj.available}, true).then(
                    res => {
                        let message = rowObj.available ? '启用操作成功!' : '禁用操作成功!'
                        this.$message({
                            type: 'success',
                            message: message
                        })
                        this.searchParams = {}
                        this.getSourcePoolList()
                    }
                )
            }).catch(() => {
                rowObj.available = available
            })
        }
    },
    created () {
        this.getProviders()
        this.getSourcePoolList()
    }
}
</script>
<style lang="scss" scoped>
    .state-panel {
        margin-left: 32px;
    }
</style>
