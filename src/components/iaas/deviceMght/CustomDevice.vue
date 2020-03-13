<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container
                el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-plus" @click="createDevice") 添加设备
            el-form.full-height(label-width="120px" size="small" label-position="left")
                UcmpTableContainer(:advance="filter.advanceSwitch"
                    :pagination="pagination"
                    :filterItems="filter.filterItems"
                    :searchPlaceholder="filter.searchPlaceholder"
                    @sizeChange="handleSizeChange"
                    @currentChange="handleCurrentChange"
                    :submit="searchDevice"
                )
                    div.full-height.padding-top(slot="tableContainer")
                        el-table.panel-table-container(:data="tableData" border)
                            el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                                template(slot-scope="scope")
                                    span(v-if="column.prop === 'ownerName'") {{scope.row.ownerType === 'org' ? scope.row.ownerName : ''}}
                                    span(v-else-if="column.prop === 'appName'") {{scope.row.ownerType === 'app' ? scope.row.ownerName : ''}}
                                    span(v-else-if="column.prop !== 'ownerName' && column.prop !== 'appName'") {{scope.row[column.prop]}}
                            el-table-column(label="操作" width="150")
                                template(slot-scope="scope")
                                    Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
                    el-button.default-button(slot="filter-btns" type="primary" size="small") 查询
</template>
<script>
/**
 * @description 设备管理
 */
import Api from '@api'

//表格显示字段配置columns
const columns = [
    { prop: 'name', label: '设备名称' },
    { prop: 'serial', label: '设备编号' },
    { prop: 'typeName', label: '设备类型' },
    { prop: 'ownerName', label: '组织机构' },
    { prop: 'appName', label: '应用' },
    { prop: 'createdAt', label: '创建时间' }
]
//表格操作配置operations
const operations = [
    {
        prop: 'edit',
        label: '编辑',
        type: 'ucmp-icon-edit'
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
        label: '设备编号',
        key: 'serial'
    },
    {
        label: '设备类型',
        key: 'typeName'
    },
    {
        label: '所属类型',
        key: 'ownerType',
        type: 'select',
        multiple: false,
        defaultOptions: [
            {
                label: '组织机构',
                value: 'org'
            },
            {
                label: '应用',
                value: 'app'
            }
        ],
        data_link: {
            text_field: 'label',
            value_field: 'value'
        }
    },
    {
        label: '开始日期',
        key: 'startCreatedAt',
        type: 'date'
    },
    {
        label: '结束日期',
        key: 'endCreatedAt',
        type: 'date'
    }
]

export default {
    name: 'FirewallList',
    data () {
        return {
            searchParams: {},
            breadcrumbItems: [
                { prop: '', label: '设备管理' }
            ],
            pagination: {
                index: 1,
                size: 20,
                total: 0
            },
            filter: {
                advanceSwitch: true,
                searchPlaceholder: '请输入设备名称',
                filterItems: filterItems
            },
            operations: operations,
            columns: columns,
            tableData: []
        }
    },
    methods: {
        /**
         * @description 获取设备信息列表
         */
        getDeviceList (param) {
            let pageParam = {
                offset: this.pagination.index,
                limit: this.pagination.size
            }
            let resObj = Object.assign(pageParam, this.searchParams)
            Api.get('deviceInfo', resObj, true).then(
                res => {
                    this.tableData = res.list
                    this.pagination.total = res.total || 0
                }
            )
        },
        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getDeviceList()
        },
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getDeviceList()
        },
        createDevice () {
            this.$router.push('/custom-device/deviceMgmt/add')
        },
        /**
         * @description 操作处理
         */
        handleOperation (obj) {
            if (obj.id === 'delete')
                this.handleDelete(obj)
            else if (obj.id === 'edit')
                this.handleEdit(obj)
        },
        /**
         * @description 删除设备
         * @param [rowObj] table row obj
         */
        handleDelete (rowObj) {
            this.$confirm(`是否删除设备: ${rowObj.row.name}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('deviceInfo', {deviceId: rowObj.row.id}, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                        this.searchParams = {}
                        this.getDeviceList()
                    }
                )
            }).catch(() => {
            })
        },
        /**
         * @description 编辑设备
         * @param [rowObj] table row obj
         */
        handleEdit (rowObj) {
            this.$router.push(`/custom-device/deviceMgmt/${rowObj.row.id}`)
        },
        /**
         * @description 搜索设备
         * @param [param] 搜索对象
         */
        searchDevice (param) {
            this.pagination.index = 1
            //处理搜索参数
            if (param.searchKey) {
                this.$set(param, 'name', param.searchKey)
                delete param.searchKey
            }
            if (param.startCreatedAt) {
                let startDate = new Date(param.startCreatedAt)
                param.startCreatedAt = startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate()
            }
            if (param.endCreatedAt) {
                let startDate = new Date(param.endCreatedAt)
                param.endCreatedAt = startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate()
            }
            this.searchParams = Object.assign({}, param)
            this.getDeviceList()
        }
    },
    created () {
        this.getDeviceList()
    }
}
</script>
<style lang="scss" scoped>
</style>
