<template lang="pug">
    UcmpContainer.iaas(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container
                el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-plus" @click="add") 创建规格
            div.full-height
                UcmpTableContainer(:pagination="pagination" searchPlaceholder="请输入规格名称进行搜索" :filterItems="filterItems" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange" :submit="query")
                    el-table.full-height.padding-top(slot="tableContainer" :data="tableData" stripe v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label")
                            template(slot-scope="scope")
                                a(v-if="column.type === 'link'" href="javascript:;" @click="checkDetail(scope.row)") {{scope.row[column.prop]}}
                                span(v-else-if="column.type === 'time'" href="javascript:;") {{formatDate(scope.row[column.prop])}}
                                span(v-else) {{scope.row[column.prop]}}
                        el-table-column(label="操作")
                            template(slot-scope="scope")
                                Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
            el-dialog(title="设置限制" :visible.sync="assignVisible" width="500px" v-if="assignVisible")  
                el-form(size="small")
                    el-form-item.is-required(label="限制类型")
                        el-radio-group(
                            v-model="assignFormData.type"
                            @change="typeChanged"
                            v-validate="assignRules.type"
                            name="type"
                            data-vv-as="限制类型"
                            :class="{'input': true, 'is-danger': errors.has('type')}"
                            maxlength="10"
                        )
                            el-radio(v-for="type in assignTypies" :key="type.prop" :label="type.prop") {{type.label}}
                    el-form-item(label="应用" v-if="assignFormData.type === 'yes'")
                        el-select(
                            v-model="assignFormData.app"
                            multiple 
                            clearable
                            placeholder="请选择应用"
                        )
                            el-option(
                                v-for="option in apps"
                                :key="option.id"
                                :label="option.app_name"
                                :value="option.id"
                            )
                    el-form-item(label="组织机构" v-if="assignFormData.type === 'yes'")
                        OrgTree(
                            :treeData="orgList"
                            placeholder="请选择组织机构"
                            :selectNodes.sync="assignFormData.org"
                        )
                    el-form-item(label="" v-if="assignFormData.type === 'yes'")
                        el-select.hidden(
                            v-model="combineAppAndOrg"
                            multiple
                            v-validate="assignRules.appOrOrg"
                            name="appOrOrg"
                            data-vv-as="应用或组织机构同时"
                            :class="{'input': true, 'is-danger': errors.has('appOrOrg')}"
                            maxlength="10"
                        )
                        span.validator-error.is-danger(v-if="errors.has('appOrOrg')") 应用或组织机构至少选择一项
                    el-form-item
                        el-button(size="small" @click="assignQuit") 取消
                        el-button(size="small" type="primary" @click="submitAssign" :loading="subdisabled") 确定
</template>

<script>
    /**
     * @description 规格管理 - 列表
     */
    import Api from '@api'
    import DateUtil from '@server/date-utils'
    import OrgTree from '@common/OrgTree'

    export default {
        name: 'SpecificationList',
        inject: ['$validator'],
        data () {
            return {
                breadcrumbItems: [
                    {prop: '', label: '规格管理'}
                ],
                columns: [
                    {prop: 'name', label: '规格名称', type: 'link'},
                    {prop: 'desc', label: '规格描述'},
                    {prop: 'cpu_core_count', label: 'CPU(核)'},
                    {prop: 'memory_size_mb', label: '内存大小(MB)'},
                    {prop: 'created_at', label: '创建时间', type: 'time'},
                    {prop: 'created_by_name', label: '创建人'},
                    {prop: 'modified_at', label: '修改时间', type: 'time'}
                ],
                filterItems: [
                    {label: '规格名称', key: 'name', type: 'input'},
                    {label: 'CPU(核)', key: 'cpu_core_count', type: 'input'},
                    {label: '内存大小(MB)', key: 'memory_size_mb', type: 'input'}
                ],
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20,
                    total: 0
                },
                operations: [
                    {
                        type: 'ucmp-icon-edit', 
                        label: '修改', 
                        prop: 'edit'
                    },
                    {
                        type: 'ucmp-icon-delete',
                        label: '删除',
                        prop: 'delete'
                    },
                    {
                        type: 'ucmp-icon-assign',
                        label: '限制',
                        prop: 'assign'
                    }
                ],
                tableData: [],
                searchParams: {},
                isLoading: false,
                assignVisible: false,
                assignFormData: {
                    id: null,
                    type: 'no',
                    app: [],
                    org: []
                },
                assignTypies: [
                    {
                        prop: 'yes',
                        label: '限制'
                    },
                    {
                        prop: 'no',
                        label: '不限制'
                    }
                ],
                apps: [],
                orgList: [],
                assignRules: {
                    type: {required: true},
                    appOrOrg: {required: true}
                },
                subdisabled: false
            }
        },
        methods: {
            add () {
                this.$router.push('/specification/add')
            },
            /**
             * @description 查看详情
             */
            checkDetail (data) {
                this.$router.push('/specification/' + data.id + '?check=1')
            },
            goDetail (data) {
                this.$router.push('/specification/' + data.id)
            },
            formatDate (timestamp) {
                return DateUtil.formate(new Date(timestamp), 'yyyy-MM-dd hh:mm:ss')
            },
            /**
             * @description 操作处理
             */
            handleOperation (obj) {
                //删除操作
                if (obj.id === 'delete') {
                    this.handleDelete(obj.row)
                    return
                }
                if (obj.id === 'edit') {
                    this.handleSet(obj.row)
                    return
                }
                this.handleAssign(obj.row)
            },
            handleDelete (row) {
                this.$confirm(`规格删除后无法继续被云厂商使用, 是否继续删除规格: ${row.name}?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    Api.delete('specification', {id: row.id}, true).then(res => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        })

                        this.pagination.index = 1
                        this.getList()
                    })
                }).catch(() => {
                })
            },
            handleSet (row) {
                this.$router.push('/specification/' + row.id)
            },
            /**
             * 添加/修改限制 
             * 
             */
            handleAssign (row) {
                this.subdisabled = false
                this.assignFormData.type = 'no'
                this.assignFormData.id = row.id
                this.assignFormData.app = []
                this.assignFormData.org = []

                let self = this
                let assignQuery = Api.get('specificationAssign', {id: row.id, type: 'flavor'}, true).then(
                    res => {
                        self.assignFormData.app = Array.isArray(res.app) ? res.app : []
                        self.assignFormData.org = Array.isArray(res.org) ? res.org : []
                        if (Array.isArray(self.assignFormData.app) && Array.isArray(self.assignFormData.org) && (self.assignFormData.app.length || self.assignFormData.org.length))
                            self.assignFormData.type = 'yes'
                    }
                )
                let app = Api.get('appListByName', { limit: 999999, page: 1 }, true).then(
                    res => {
                        this.apps = res.data.apps
                    }
                )

                let org = Api.get('orgTree', {}, true).then(
                    res => {
                        this.orgList = res.data
                    }
                )

                Promise.all([assignQuery, app, org]).then(
                    res => {
                        this.assignVisible = true
                    }
                )
            },
            assignQuit () {
                this.assignVisible = false
            },
            submitAssign () {
                this.$validator.validate().then(valid => {
                    if (!valid)
                        return
                    
                    this.subdisabled = true
                    let payload = {
                        id: this.assignFormData.id,
                        app: this.assignFormData.app,
                        org: this.assignFormData.org,
                        type: 'flavor'
                    }
                    Api.post('specificationAssign', payload, true).then(
                        res => {
                            this.subdisabled = false
                            this.assignVisible = false
                            this.$message({
                                type: 'success',
                                message: '添加限制成功!'
                            })
                        }
                    )
                })
            },
            typeChanged (val) {
                this.assignFormData.app.splice(0, this.assignFormData.app.length)
                this.assignFormData.org.splice(0, this.assignFormData.org.length)
            },
            /**
             * 表格每页显示条数更改cb
             * @param newSize 新的每页显示条数
             */
            handleSizeChange (newSize) {
                this.pagination.index = 1
                this.pagination.size = newSize || 20
                this.getList()
            },
            /**
             * 表格页面跳转cb
             * @param newPage 跳转的页面
             */
            handleCurrentChange (newPage) {
                this.pagination.index = newPage || 1
                this.getList()
            },
            /**
             * @description 获取表格数据
             * @param queryParams 搜索参数obj
             */
            getList () {
                const data = {
                    id: 'custom',
                    offset: this.pagination.index,
                    limit: this.pagination.size
                }

                Object.assign(data, this.searchParams)
                this.isLoading = true
                Api.get('specification', data).then(res => {
                    this.isLoading = false
                    this.tableData = res.list
                    this.pagination.count = res.pages || 1
                    this.pagination.total = res.total || 0
                }, () => {
                    this.isLoading = false
                })
            },
            query (queryParams) {
                let result = {}

                // 普通搜索
                if (queryParams.searchKey) result.name = queryParams.searchKey

                // 高级搜索
                else result = queryParams

                this.pagination.index = 1

                // UCMP-660 操作日志查询，翻页后，查询条件被重置
                // 规格管理也有同样情况，没有保存筛选条件
                this.searchParams = result
                this.getList()
            }
        },
        computed: {
            /**
             * @description 选中的app以及，限制菜单校验使用
             */
            combineAppAndOrg () {
                return this.assignFormData.app.concat(this.assignFormData.org)
            }
        },
        created () {
            this.getList()
        },
        components: {
            OrgTree
        }
    }
</script>

<style lang="scss" scoped>

</style>
