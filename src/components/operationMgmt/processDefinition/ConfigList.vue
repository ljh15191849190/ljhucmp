<template lang="pug">
    div
        ProcessConfig(v-if="!isShowConfigList" :backConfigList="switchConfigList" :modifyParam="modifyParam")
        UcmpTableContainer(
            :advance="advanceSwitch"
            :filterItems="filterItems"
            :pagination.sync="pagination"
            @sizeChange="handleSizeChange"
            @currentChange="handleCurrentChange"
            :submit="searchModel"
            v-loading="isLoading"
            element-loading-spinner="ucmp-icon-loading"
            v-else
        )
            div.full-height(slot="tableContainer")
                div.d-flex.justify-content-end.table-top-btn-pane
                  el-button.oper-icon-btn(icon="ucmp-icon-plus" size="small" @click="handleOper('add')") 添加配置
                el-table.table-height(:data="ConfigListData" border)
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
                                    @iconClick="handleOper(oper.type, scope.row)"
                                    )
                            span(v-if="column.prop === 'config_type'") {{scope.row.config_type&&scope.row.config_type==="tag"?"组织机构标识":"组织机构"}}
                            span(v-else) {{scope.row[column.prop]}}
                el-dialog(:title="detailDialog.title" :visible.sync="detailDialog.isShow")
                    div content
                    div.text-center.dialog-footer(slot="footer")
                        el-button(@click="detailDialog.isShow = false" type="primary") 取消
</template>

<script>
/**
 * @description  Process Config List
 */
import dateUtils from '@server/date-utils'
import ProcessConfig from './ProcessConfig'

import Api from '@api'
// UCMP-524 问题修改 --start--
// Table columns
const columns = [
    { prop: 'config_type', label: '配置对象类型', width: 160 },
    { prop: 'owner_name', label: '配置对象', width: 210 },
    { prop: 'name', label: '服务名称', width: 160 },
    { prop: 'operation_name', label: '操作方式' },
    { prop: 'proc_def_name', label: '流程名称' },
    { prop: 'modified_at_label', label: '最后更新时间' },
    { prop: 'operation', label: '操作', width: 160 }
]
// UCMP-524 问题修改 --end--
// Configurate Operations
const operations = [
    {
        type: 'edit',
        icon: 'ucmp-icon-edit',
        title: '编辑'
    },
    {
        type: 'delete',
        icon: 'ucmp-icon-delete',
        title: '删除'
    }
]

export default {
    data () {
        return {
            ConfigListData: [],
            advanceSwitch: false,
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
            // Default show config list
            isShowConfigList: true,
            modifyParam: {},
            // bug #UCMP-522 流程配置，页面展示样式问题
            filterItems: [{
                key: 'searchKey',
                label: '请输入服务或流程名称'
            }],
            pagination: {
                index: 1,
                size: 20,
                total: 0
            }
        }
    },
    computed: {},
    methods: {
        // Init
        init () {
          this.getProcessConfigList()
        },
        //Get process config data
        getProcessConfigList (param) {
          // Pagination information
          let defaultParam = {
            offset: this.pagination.index,
            limit: this.pagination.size
          }
          // Merge parameter
          let params = Object.assign({}, defaultParam, param)

          this.isLoading = true
          Api.get('processConfig', params, true).then(
              res => {
                  if (res && Array.isArray(res.list)) {
                      res.list.forEach(item => {
                          !item.version && (item.version = '--')
                          !item.description && (item.description = '--')
                          // bug UCMP-785 流程定义，时间显示优化
                          item.modified_at_label = item.modified_at ? dateUtils.formate(item.modified_at) : '--'
                      })
                      this.ConfigListData = res.list
                      this.pagination.total = res.total || 0
                  }
                  this.isLoading = false
              },
              () => {
                this.isLoading = false
              }
          )
        },
        handleSizeChange (val) {
            this.pagination.size = val
            this.getProcessConfigList()
        },
        handleCurrentChange (val) {
            this.pagination.index = val
            this.getProcessConfigList()
        },
        // Handle operation.Inclues add,edit and delete
        handleOper (type, row) {
            switch (type) {
                case 'delete':
                    this.delete(row)
                    break
                case 'edit':
                    this.modifyParam = row
                    this.isShowConfigList = false
                    break
                case 'add':
                    this.modifyParam = {}
                    this.isShowConfigList = false
                    break
                default:
                    break
            }
        },
        // Delete process item
        delete (row) {
            let hasParam = row && row.id
            // UCMP-576 修改删除操作提示信息
            hasParam && this.$confirm(`确认是否删除${row.proc_def_name}中${row.name}的[${row.operation_name}]配置?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let param = {}
                param.id = row.id
                Api.delete('deleteProcessConfig', param, true).then(
                    res => {
                        this.$notify({
                            title: '成功',
                            type: 'success',
                            message: '删除成功'
                        })
                        // Refresh process config list data
                        this.getProcessConfigList()
                    },
                    () => {
                      this.isLoading = false
                    }
                )
            })
        },
        // Search model list data according to filter condition
        searchModel (condition) {
          this.getProcessConfigList(condition)
        },
        // Switch Process config and config list
        switchConfigList () {
          this.isShowConfigList = true
          this.getProcessConfigList()
        }
    },
    created () {
        // Init program
        this.init()
    },
    components: {
      ProcessConfig
    }
}
</script>

<style lang="scss" scoped>
.table-height{
    margin-top: 10px;
    height: calc(100% - 11px);
}
</style>

