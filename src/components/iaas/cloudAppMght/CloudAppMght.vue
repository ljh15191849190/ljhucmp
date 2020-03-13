<template lang="pug">
div.app-mgmt
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            UcmpTableContainer(
                :pagination="pagination"
                :advance="advanceSwitch"
                @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"
                :containerHeight.sync="tableContainerHeight"
            )
                div.full-height(slot="tableContainer")
                    div.d-flex
                        el-tooltip(v-for="(btn, index) in basicBtns" :key="index" :content="btn.label" placement="bottom")
                            div.operator-btn-container
                                el-button.circle-btn.ucmp-service-action(circle v-if="btn.icon" plain :type="btn.type" :icon="btn.icon" size="mini" :disabled="checkBtnDisabled(btn)" @click="operationClick(btn)")
                    el-table.margin-top(:data="tableData" stripe v-loading="isLoading" 
                    @selection-change="handleSelectionChange"
                    :max-height="tableMaxHeight()"
                    element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(type="selection" width="45")
                        el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'sync_at'") {{ formatterTime(scope.row[column.prop]) }}
                                span(v-else-if="column.prop === 'visible'") {{scope.row[column.prop] ? '可见' : '不可见'}}
                                span(v-else-if="column.prop === 'often_used'") {{scope.row[column.prop] ? '常用' : '不常用'}}
                                span(v-else) {{scope.row[column.prop]}}
                        el-table-column(label="操作")
                            template(slot-scope="scope")
                                Icon-Button(v-for="oper in operations" :key="oper.prop" :type="oper.type" @iconClick="handleOpration(scope.row)" :args="{id: oper.prop, row: scope.row}" :text="oper.label")
    rename-dialog(v-if="renameVisible" :visible="renameVisible" @rename="rename" :title="renameDialogTitle" @closeDialog="closeDialog")
    props-dialog(v-if="propsVisble" :propsVisble="propsVisble" :instance="instance" :application="application" @closeDialog="closeDialog" @saveOk="saveOk")
</template>
<script>
/**
 * @description 应用程序管理
 */
import Api from '@api'
import DateUtil from '@server/date-utils'
import RenameDialog from './RenameDialog'
import PropsDialog from './PropsDialog'
export default {
    name: 'CloudAppMght',
    data () {
        return {
            tableContainerHeight: 100,
            tableData: [],
            isLoading: false,
            advanceSwitch: false,
            selectApp: [],
            renameDialogTitle: '',
            renameVisible: false,
            propsVisble: false,
            instance: null,
            application: null,
            breadcrumbItems: [
                { prop: '', label: '应用程序管理' }
            ],
            pagination: { index: 1, total: 1, size: 20 },
            operations: [
                { prop: 'view', label: '查看会话', type: 'ucmp-icon-see-session' }
            ],
            columns: [
                { prop: 'application_name', label: '应用名称' },
                { prop: 'delivery_group_name', label: '所属交付组' },
                { prop: 'working_directory', label: '工作目录' },
                { prop: 'command_line_arguments', label: '命令行参数' },
                { prop: 'visible', label: '可见性' },
                { prop: 'sync_at', label: '上次同步时间' },
                { prop: 'often_used', label: '是否常用' }
            ],
            basicBtns: [
                {prop: 'signUsed', label: '标记常用', icon: 'ucmp-icon-sign-used'},
                {prop: 'cancelSignUsed', label: '取消标记常用', icon: 'ucmp-icon-cancel-sign-used'},
                {prop: 'rename', label: '重命名', icon: 'ucmp-icon-template-define'},
                {prop: 'setProps', label: '属性设置', icon: 'ucmp-icon-cost-set'},
                {prop: 'forbidden', label: '禁用', icon: 'ucmp-icon-disabled'},
                {prop: 'delete', label: '删除', icon: 'ucmp-icon-delete'}
            ]
        }
    },
    components: {RenameDialog, PropsDialog},
    created () {
        this.getAppMgmtList()
    },
    methods: {
        getAppMgmtList () {
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            this.isLoading = true
            Api.get('appMgmtList', pageParam, true).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.list
                    this.pagination.total = res.total
                }, () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * 获取应用程序实例
         */
        getApplication () {
            let appParam = {provider_id: this.instance.provider_id, application_uid: this.instance.application_uid}
            return Api.get('getApplication', appParam)
        },
        /**
         * @description 格式化时间显示
         * @param time  时间戳
         */
        formatterTime (time) {
            if (!time) return ''
            return DateUtil.formate(new Date(time))
        },
        handleSelectionChange (app) {
            this.selectApp = app
        },
        checkBtnDisabled (btn) {
            if (this.selectApp.length !== 1) return true
            if (btn.prop === 'rename' || btn.prop === 'delete' || btn.prop === 'setProps' || btn.prop === 'forbidden') return false
            if (btn.prop === 'signUsed') return this.selectApp[0].often_used
            // 添加禁用逻辑处理
            return !this.selectApp[0].often_used
        },
        async operationClick (btn) {
            this.instance = this.selectApp[0]
            let res = await this.getApplication()
            if (res.code === '1501') {
                this.$notify.warning('此应用不存在，请同步citrix云厂商!')
                return 
            }
            this.application = res.data.application
            switch (btn.prop) {
                case 'signUsed':
                case 'cancelSignUsed':
                case 'delete':
                case 'forbidden':
                    this.handleAction(btn, this.instance)
                    break 
                case 'rename':
                    this.handleRename(btn, this.instance)
                    break
                case 'setProps':
                    this.propsVisble = true
                    break  
                default:
                    break
            }
        },
        /**
         * @description 处理标记常用与否
         */
        handleAction (btn, appInstance) {
            this.$confirm(`确定将 ${appInstance.application_name} ${btn.label}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let request = {
                    signUsed: {
                        method: 'post',
                        url: 'appSignUsed',
                        params: {id: appInstance.id, mark: !appInstance.often_used}
                    },
                    cancelSignUsed: {
                        method: 'post',
                        url: 'appSignUsed',
                        params: {id: appInstance.id, mark: !appInstance.often_used}
                    },
                    delete: {
                        method: 'delete',
                        url: `/vdi/xen_application?provider_id=${appInstance.provider_id}&application_uid=${appInstance.application_uid}`,
                        params: {}
                    },
                    forbidden: {
                        method: 'put',
                        url: `/vdi/xen_application/action?provider_id=${appInstance.provider_id}&application_uid=${appInstance.application_uid}&enable=false`,
                        params: {}
                    }
                }

                Api[request[btn.prop]['method']](request[btn.prop]['url'], request[btn.prop]['params'], true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: `${appInstance.application_name} ${btn.label}操作成功!`
                        })
                        this.getAppMgmtList()
                    }, () => {
                        this.$message({
                            type: 'error',
                            message: `${appInstance.application_name} ${btn.label}操作失败!`
                        })
                    }
                )
            }).catch(() => {
            })
        },

        /**
         * @description 处理重命名
         */
        handleRename (btn, appInstance) {
            this.renameDialogTitle = `重命名应用程序-${appInstance.application_name}`
            this.renameVisible = true
        },
        /**
         * 重命名确定事件
         */
        rename (newName) {
            let appInstance = this.selectApp[0]
            if (newName === appInstance.application_name) return
            let url = `/vdi/xen_application/rename?provider_id=${appInstance.provider_id}&application_uid=${appInstance.application_uid}&application_name=${newName}`
            Api.put(url, {}, true).then(
                res => {
                    this.renameVisible = false
                    this.$message({
                        type: 'success',
                        message: '重命名操作成功!'
                    })
                    this.getAppMgmtList()
                }, () => {
                    this.$message({
                        type: 'error',
                        message: '重命名操作失败!'
                    })
                }
            )
        },
        closeDialog () {
            this.renameVisible = false
            this.propsVisble = false
        },
        saveOk () {
            this.$notify.success('确定操作成功!')
            this.closeDialog()
            this.getAppMgmtList()
        },
        handleOpration (rowObj) {
            this.$router.push({path: '/cloud-app-mght/query-session', query: {provider_id: rowObj.provider_id, application_uid: rowObj.application_uid}})
        },
        /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getAppMgmtList()
        },
        /**
         * @description 页码变化
         * @param index 页码索引
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getAppMgmtList()
        },
        /**
         * @description 表格的最大高度
         */
        tableMaxHeight () {
            return this.tableContainerHeight - 16 - 34
        }
    }
}
</script>
<style lang="scss" scoped>
.app-mgmt {
    height: 100%;
}
</style>
