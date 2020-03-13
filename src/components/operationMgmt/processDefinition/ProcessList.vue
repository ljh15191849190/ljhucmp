<template lang="pug">
    UcmpTableContainer(
        :advance="advanceSwitch"
        :pagination.sync="pagination"
        :filterItems="filterItems"
        @sizeChange="handleSizeChange"
        @currentChange="handleCurrentChange"
        :submit="searchProcess"
        v-loading="isLoading"
        element-loading-spinner="ucmp-icon-loading"
    )
        div.table-container__processlist(slot="tableContainer")
            div.d-flex.justify-content-end.table-top-btn-pane
                el-button.oper-icon-btn(icon="ucmp-icon-delete" size="small" :disabled="!selectedProcess.length" @click="deleteSelectedProcess") 批量删除
                el-upload(
                    action=""
                    accept="text/xml, application/xml"
                    :multiple="false"
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                    :http-request="upload"
                )
                  el-button.oper-icon-btn(size="small" icon="ucmp-icon-upload") 上传流程
            el-table.table-height(:data="flowListData" @selection-change="handleSelectionChange" border)
                el-table-column(type="selection" width="45")
                el-table-column(
                    v-for="(column, index) in columns"
                    :type="column.type"
                    :prop="column.prop"
                    :key="column.prop"
                    :width="column.width"
                    :label="column.label")
                    template(slot-scope="scope")
                        span(v-if="column.prop === 'operation'")
                            IconButton(
                                v-for="oper in scope.row[column.prop]"
                                :key="oper.type"
                                @iconClick="handleoper(oper.type, scope.row)"
                                :type="oper.icon"
                                :text="oper.title"
                                )
                        span(v-else) {{scope.row[column.prop]}}
            el-dialog(:title="detail.title" :visible.sync="isShowDialog")
                div.cot-image
                    img(:src="detail.imgUrl")
</template>

<script>
/**
 * @description   流程列表
 */
import Api from '@api'

// 表格列
const columns = [
    { prop: 'name', label: '流程名称' },
    { prop: 'version', label: '版本' },
    { prop: 'description', label: '描述' },
    { prop: 'operation', label: '操作' }
]

const defaultOper = [
    {
        type: 'viewDetail',
        icon: 'ucmp-icon-view',
        title: '查看详情'
    },
    {
        type: 'delete',
        icon: 'ucmp-icon-delete',
        title: '删除'
    },
    {
        type: 'convert',
        icon: 'ucmp-icon-process-convert',
        title: '转换为模型'
    }
]

export default {
    data () {
        return {
            flowListData: [],
            advanceSwitch: false,
            columns: columns,
            isShowDialog: false,
            detail: {
                title: '',
                imgUrl: ''
            },

            // Loading before response
            isLoading: false,
            // search parameter
            searchParam: {},
            // bug #UCMP-461 流程定义搜索框提示信息不清晰
            filterItems: [{
                label: '请输入流程名称或描述信息',
                key: 'searchKey'
            }],
            selectedProcess: [],
            uploadfile: '',
            pagination: {
                index: 1,
                size: 20,
                total: 0
            }
        }
    },
    computed: {},
    methods: {
        handleSizeChange (val) {
            this.pagination.size = val
            this.refreshTable()
        },
        handleCurrentChange (val) {
            this.pagination.index = val
            this.refreshTable()
        },
        // 刷新表格数据
        refreshTable (param) {
            // Pagination information
            let defaultParam = {
                offset: this.pagination.index,
                limit: this.pagination.size
            }
            // Merge parameter
            let params = Object.assign({}, defaultParam, this.searchParam, param)
            this.isLoading = true

            Api.get('progressApi', params, true).then(
                res => {
                    if (res && res.list) {
                        res.list.forEach(item => {
                            item.operation = defaultOper
                        })
                        this.flowListData = res.list
                        this.pagination.total = res.total || 0
                        this.isLoading = false
                    }
                },
                () => {
                    this.isLoading = false
                }
            )
        },
        // 处理操作(删除、挂起、取消挂起)
        handleoper (type, row) {
            switch (type) {
                case 'viewDetail': // 查看详情
                    Api.get('getProcessImg', { processDefinitionId: row.id, resourceType: 'image' }, true).then(
                        res => {
                            this.detail.imgUrl = `data:image/png;base64,${res.img}`
                            this.isShowDialog = true
                        }
                    )
                    this.detail.title = '流程图 - ' + row.name
                    break
                case 'delete': // 删除流程
                    this.deleteProcess(row)
                    break
                case 'convert':
                    Api.post('convertProcess2Model', {processDefinitionId: row.id}, true).then(
                      () => {
                        this.$notify({
                          type: 'success',
                          title: '成功',
                          message: '操作成功'
                        })
                      }
                    )
            }
        },
        deleteProcess (row) {
            this.$confirm(`确认执行该操作吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let deploymentIdArr = []
                if (Array.isArray(row)) {
                    row.forEach(item => {
                        if (item.deploymentId)
                            deploymentIdArr.push(item.deploymentId)
                    })
                } else
                    deploymentIdArr.push(row.deploymentId)
                Api.delete('progressDeleteApi', { deploymentIds: deploymentIdArr.join(',') }, true).then(res => {
                    // The result notification
                    this.$notify.success('删除成功')
                    this.selectedProcess = []
                    this.refreshTable()
                }, () => {
                    this.isLoading = false
                }
                )
            })
        },
        deleteSelectedProcess () {
            this.deleteProcess(this.selectedProcess)
        },
        // Search process list data according to filter condition
        searchProcess (condition) {
            // Save search param when pagination
            this.searchParam = condition
            this.refreshTable(condition)
        },
        handleSelectionChange (val) {
            this.selectedProcess = val
        },
        beforeUpload (file) {
            if (!/\.(bpmn20.xml)$/.test(file.name)) {
                this.$message({
                    type: 'warning',
                    message: '请选择后缀为 .bpmn20.xml 的文件!'
                })
                return false
            }
            this.uploadfile = file
            return true
        },
        upload () {
            let self = this
            let file = this.uploadfile
            if (file) {
              let fileReader = new FileReader()
              fileReader.readAsDataURL(file)
              fileReader.onload = function (e) {
                  // To base64
                  let base64Data = e.target.result.substr(e.target.result.indexOf('base64,') + 'base64,'.length)
                  let param = {}
                  param.fileName = self.uploadfile.name
                  param.fileData = base64Data
                  self.isLoading = true
                  Api.post('uploadProcessDeploy', param, true).then(
                    () => {
                      self.$notify({
                          type: 'success',
                          message: '上传成功!'
                      })
                      // Refresh table data
                      self.refreshTable()
                    },
                    () => {
                      self.isLoading = false
                      self.$notify({
                          type: 'error',
                          message: '上传失败, 请检查上传文件后重新上传!'
                      })
                    }
                  )
              }
            }
        }
    },
    created () {
        this.refreshTable()
    }
}
</script>

<style lang="scss" scoped>
.cot-image {
    width: 100%;
    height: 550px;
    overflow: hidden;
    img {
        width: 100%;
    }
}
.table-height {
    margin-top: 10px;
    height: calc(100% - 11px);
}
.table-container__processlist {
    height: 100%;
}
</style>

