<template lang="pug">
    UcmpTableContainer(
        :advance="advanceSwitch"
        :pagination.sync="pagination"
        @sizeChange="handleSizeChange"
        @currentChange="handleCurrentChange"
        :submit="searchModel"
        v-loading="isLoading"
        element-loading-spinner="ucmp-icon-loading"
        :filterItems="filterItems"
    )
        div.full-height(slot="tableContainer")
            div.d-flex.justify-content-end.table-top-btn-pane
                el-button.oper-icon-btn(icon="ucmp-icon-delete" size="small" :disabled="!selectedModels.length" @click="deleteSelectedModels") 批量删除
                el-button.oper-icon-btn(icon="ucmp-icon-plus" size="small" @click="defineModel") 创建模型
            el-table.table-height(:data="DeployListData" @selection-change="handleSelectionChange" border)
                el-table-column(type="selection" width="45")
                el-table-column(
                    v-for="column in columns"
                    :type="column.type"
                    :prop="column.prop"
                    :key="column.prop"
                    :width="column.width"
                    :label="column.label")
                    template(slot-scope="scope")
                        span(v-if="column.prop === 'operation'")
                            IconButton(
                                v-for="oper in operations"
                                :key="oper.type"
                                :type="oper.icon"
                                :text="oper.title"
                                @iconClick="handleOper(scope.row, oper.type)"
                                )
                        span(v-else) {{scope.row[column.prop]}}
            el-dialog(:title="detailDialog.title" :visible.sync="detailDialog.isShow")
                div content
                div.text-center.dialog-footer(slot="footer")
                    el-button(@click="detailDialog.isShow = false" type="primary") 取消
</template>

<script>
/**
 * @description  模型列表
 */
import dateUtils from '@server/date-utils'

import Api from '@api'

// 表格列
const columns = [
    { prop: 'name', label: '模型名称' },
    { prop: 'version', label: '版本' },
    { prop: 'description', label: '描述' },
    { prop: 'createTimeLable', label: '创建时间' },
    { prop: 'lastUpdateTimeLable', label: '最后更新时间' },
    { prop: 'operation', label: '操作' }
]
// 操作配置
const operations = [
    {
        type: 'edit',
        icon: 'ucmp-icon-edit',
        title: '编辑'
    },
    {
        type: 'deploy',
        icon: 'ucmp-icon-model-deploy',
        title: '部署'
    },
    {
        type: 'delete',
        icon: 'ucmp-icon-delete',
        title: '删除'
    }
]
// Default Pagination
const originPagination = {
    offset: 0,
    limit: 20,
    count: 0,
    total: 0
}

export default {
    data () {
        return {
            DeployListData: [],
            advanceSwitch: false,
            originPagination: originPagination,
            columns: columns,
            detailDialog: {
                isShow: false,
                title: '',
                imgUrl: ''
            },
            operations: operations,
            description: '',
            // Loading before response
            isLoading: false,
            // search parameter
            searchParam: {},
            // bug #UCMP-461 流程定义搜索框提示信息不清晰
            filterItems: [{
                label: '请输入模型名称或描述信息',
                key: 'searchKey'
            }],
            selectedModels: []
        }
    },
    computed: {
        pagination: {
            get () {
                return {
                    index: this.originPagination.offset + 1,
                    size: this.originPagination.limit,
                    count: this.originPagination.count,
                    total: this.originPagination.total
                }
            },
            set (val) {
                this.originPagination.offset = val.index - 1
            }
        }
    },
    methods: {
        // Init
        init () {
            this.getModelList()
        },
        getModelList (param) {
            // Pagination information
            let defaultParam = {
                offset: this.originPagination.offset,
                limit: this.originPagination.limit
            }
            // Merge parameter
            let params = Object.assign({}, defaultParam, this.searchParam, param)

            this.isLoading = true
            Api.get('modelApi', params, true).then(
                res => {
                    if (res && Array.isArray(res.list)) {
                      res.list.forEach(item => {
                          // bug #UCMP-719 流程定义，创建模型，创建完成后，时间不正确
                          item.name = item.model && item.model.name ? item.model.name : '--'
                          item.version = item.model && item.model.version ? item.model.version : '--'
                          // bug #UCMP-526 问题二：模型列表取值字段不正确
                          let description = ''
                          item.model && item.model.metaInfo && (description = JSON.parse(item.model.metaInfo).description)
                          item.description = description || '--'
                          // bug UCMP-785 流程定义，时间显示优化
                          item.createTimeLable = item.createTime ? dateUtils.formate(item.createTime) : '--'
                          item.lastUpdateTimeLable = item.lastUpdateTime ? dateUtils.formate(item.lastUpdateTime) : ''
                      })
                      this.DeployListData = res.list
                      this.originPagination.total = res.total
                      this.originPagination.count = res.size
                    }
                    this.isLoading = false
                },
                () => {
                    this.isLoading = false
                }
            )
        },
        handleSizeChange (val) {
            this.originPagination.limit = val
            this.getModelList()
        },
        handleCurrentChange (val) {
            this.originPagination.offset = val - 1
            this.getModelList()
        },
        // 查看详情
        viewDetail (row) {
            this.detailDialog.isShow = true
            this.detailDialog.title = '流程图 - ' + row.name
        },
        // 操作处理（部署和编辑）
        handleOper (row, type) {
            switch (type) {
                case 'deploy': // 部署模型
                    this.deploy(row)
                    break
                case 'edit': // 编辑模型
                    this.openActiviti(type, row)
                    break
                case 'delete': // 删除模型
                    this.deleteModel(row)
                    break
                default:
                    break
            }
        },
        deploy (row) {
            this.$confirm(`确认部署：${row.name}?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                if (row && row.model && row.model.id) {
                    this.isLoading = true
                    Api.post('modelDeploy', { modelId: row.model.id }, true).then(
                        res => {
                            this.$notify({
                                title: '成功',
                                type: 'success',
                                message: '模型部署成功'
                            })
                            // Refresh model list
                            this.getModelList()
                        },
                        () => {
                            this.isLoading = false
                        }
                    )
                }
            })
        },
        // 打开activiti(定义或编辑)
        openActiviti (type, row) {
            this.$router.push({ path: '/processDefinition/defineModel', query: { id: row.model ? row.model.id : '' } })
        },
        deleteModel (row) {
            let modelIdArr = []
            if (Array.isArray(row)) {
                row.forEach(item => {
                    if (item.model && item.model.id)
                        modelIdArr.push(item.model.id)
                })
            } else
                row.model && row.model.id && modelIdArr.push(row.model.id)
            modelIdArr.length && this.$confirm('请确认是否删除选中模型?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('modelDeleteApi', { modelIds: modelIdArr.join(',') }).then(res => {
                    this.$message({
                        type: 'success',
                        message: '模型删除成功!'
                    })
                    this.getModelList()
                }).catch(() => {
                    this.$message({
                        type: 'error',
                        message: '模型删除失败!'
                    })
                })
            })
        },
        deleteSelectedModels () {
            this.deleteModel(this.selectedModels)
        },
        // Search model list data according to filter condition
        searchModel (condition) {
            // Save search param when pagination
            this.searchParam = condition
            this.getModelList(condition)
        },
        // Create Model
        defineModel () {
            this.$router.push('/processDefinition/defineModel')
        },
        // 多选操作
        handleSelectionChange (val) {
            this.selectedModels = val
        }
    },
    created () {
        // Init program
        this.init()
    }
}
</script>

<style lang="scss" scoped>
.table-height{
    margin-top: 10px;
    height: calc(100% - 11px);
}
</style>

