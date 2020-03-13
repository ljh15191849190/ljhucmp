<template lang="pug">
    UcmpContainer.iaas(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container(v-if="templateType === 'custom'")
                el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-plus" @click="addTemp") 创建镜像
            div.full-height
                <!--el-tabs(v-model="templateType" @tab-click="handleClick")-->
                    <!--el-tab-pane(label="公共镜像" name="preset")-->
                    <!--el-tab-pane(label="自定义镜像" name="custom")-->
                div.template-table
                    UcmpTableContainer(
                        ref="templateTable"
                        :pagination="pagination"
                        :filterItems="filter.filterItems"
                        :searchPlaceholder="filter.searchPlaceholder"
                        @sizeChange="handleSizeChange"
                        @currentChange="handleCurrentChange"
                        :submit="searchTemplate"
                    )
                        div.full-height.padding-top(slot="tableContainer")
                            el-table.panel-table(:data="tableData" stripe v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                                el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                                    template(slot-scope="scope")
                                        span(v-if="column.prop === 'os.os_version'") {{formatCellData(scope.row, column.prop)}} ({{formatCellData(scope.row, 'os.arch')}})
                                        span(v-else) {{formatCellData(scope.row, column.prop)}}
                                el-table-column(label="操作")
                                    template(slot-scope="scope")
                                        Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
</template>

<script>
/**
 * @description 云主机模板管理
 */
import Api from '@api'

//表格列配置
const columns = [
    {prop: 'name', label: '镜像名称'},
    {prop: 'os.name', label: '操作系统'},
    {prop: 'os.os_family', label: '类型'}
]
// 过滤条件配置
const filterItems = [
    {
        label: '请输入镜像名称',
        key: 'name'
    },
    {
        label: '操作系统',
        key: 'os_id',
        type: 'select',
        multiple: false,
        defaultOptions: [],
        data_link: {
            text_field: 'name',
            value_field: 'id'
        }
    }
]
export default {
    name: 'TemplateDefine',
    data () {
        return {
            searchParams: {},
            // branch hide-mirror-tab 暂时隐藏镜像管理tab页，只显示自定义镜像
            templateType: 'custom',
            breadcrumbItems: [
                {prop: '', label: '镜像管理'}
            ],
            filter: {
                searchPlaceholder: '请输入镜像名称',
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
         * @description 获取操作系统列表
         */
        getSystemList () {
            Api.get('systemOs', { offset: 0, limit: 9999 }, true).then(
                res => {
                    filterItems[1].defaultOptions = res.list.map(item => {
                        return {
                            id: item.id,
                            name: item.name
                        }
                    })
                }
            )
        },
        /**
         * @description 获取镜像列表
         */
        getMirrorList () {
            let pageParam = { id: this.templateType, offset: this.pagination.index, limit: this.pagination.size }
            let resObj = Object.assign(pageParam, this.searchParams)
            this.isLoading = true
            Api.get('mirror', resObj, true).then(
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
         * @description 操作处理
         */
        handleOperation (obj) {
            //删除操作
            if (obj.id === 'delete')
                this.handleDelete(obj)
            else if (obj.id === 'edit')
                this.handleEdit(obj)
            else
                this.handleSet(obj)
        },
        /**
         * @description 搜索资源池
         * @param [param] 搜索对象
         */
        searchTemplate (param) {
            this.pagination.index = 1
            if (param.searchKey) {
                this.$set(param, 'name', param.searchKey)
                delete param.searchKey
            }
            this.searchParams = Object.assign({}, param)
            this.getMirrorList()
        },
        /**
         * 表格每页显示条数更改cb
         * @param size 新的每页显示条数
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getMirrorList()
        },
        /**
         * 表格页面跳转cb
         * @param index 跳转的页面
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getMirrorList()
        },
        /**
         * @description 公共镜像配置
         * @params scope 当前行数据
         */
        handleSet (scope) {
            this.$router.push({ path: '/edit-template/set', query: { id: scope.row.id } })
        },
        /**
         * @description 修改当前条目事件
         * @params scope 当前行数据
         */
        handleEdit (scope) {
            this.$router.push({ path: '/edit-template/edit', query: { id: scope.row.id } })
        },
        /**
         * @description 删除当前条目事件
         * @params scope 当前行数据
         */
        handleDelete (scope) {
            this.$confirm(`确定删除镜像 ${scope.row.name}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('mirror', { id: scope.row.id }, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: `镜像 ${scope.row.name} 删除成功!`
                        })
                        this.getMirrorList()
                    }
                )
            }).catch(() => {
            })
        },
        /**
         * @description 跳转到添加 关联模版页面
         */
        addTemp () {
            this.$router.push(`/edit-template/add`)
        },
        handleClick () {
            this.searchParams = {}
            this.$nextTick(
                () => {
                    this.$refs.templateTable.$refs.filterRef.searchVal = ''
                }
            )

            this.getMirrorList()
        },
        /**
         * 字符串key查找数据
         * @param data 数据源
         * @param key 字符串key
         * @returns {*} 查找到的数据
         */
        formatCellData (data, key) {
             key.split('.').forEach(k => {
                 data = data[k]
             })

            return data
        }
    },
    created () {
        this.getSystemList()
        if (this.$route.query.type) {
            this.templateType = this.$route.query.type
            this.handleClick()
        } else
            this.getMirrorList()
    },
    computed: {
        operations () {
            let operations = []
            if (this.templateType === 'preset') {
                operations = [
                    {
                        type: 'ucmp-icon-template-set',
                        label: '配置',
                        prop: 'set'
                    }
                ]
            } else {
                operations = [
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
            }

            return operations
        }
    }
}
</script>
<style lang="scss" scoped>
.template-table {
    height: 100%;
}
</style>
