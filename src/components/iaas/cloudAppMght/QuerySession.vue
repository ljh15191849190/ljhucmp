<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            UcmpTableContainer(
                :advance="advanceSwitch"
                :containerHeight.sync="tableContainerHeight"
            )
                div.full-height(slot="tableContainer")
                    div.d-flex
                        el-tooltip(v-for="(btn, index) in basicBtns" :key="index" :content="btn.label" placement="bottom")
                            div.operator-btn-container
                                el-button.circle-btn.ucmp-service-action(circle plain :type="btn.type" :icon="btn.icon" size="mini" :disabled="checkBtnDisabled(btn)" @click="operationClick(btn)")
                    el-table.margin-top(:data="tableData" stripe v-loading="isLoading"
                    @selection-change="handleCurrentChange"
                    element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(type="selection" width="45")
                        el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                            template(slot-scope="scope")
                                el-tag(v-if="(column.prop === 'sessionState')" :color="stateObj[scope.row[column.prop]].color" size="mini") 
                                    span.state-color {{ stateObj[scope.row[column.prop]].label }}
                                span(v-else-if="column.prop === 'appState'") {{formatAppState(scope.row[column.prop])}}
                                span(v-else) {{scope.row[column.prop]}}
</template>
<script>
/**
 * @description 查看会话
 */
import Api from '@api'
export default {
    name: 'QuerySession',
    data () {
        return {
            tableContainerHeight: 100,
            tableData: [],
            isLoading: false,
            advanceSwitch: false,
            selectSession: [],
            breadcrumbItems: [
                { prop: '/cloud-app-mght', label: '应用程序管理' },
                { prop: '', label: '查看会话' }
            ],
            columns: [
                { prop: 'userName', label: '登录账号' },
                { prop: 'userFullName', label: '用户姓名' },
                { prop: 'clientName', label: '客户端名称' },
                { prop: 'hostedMachineName', label: '计算机名称' },
                { prop: 'sessionState', label: '状态' },
                { prop: 'appState', label: '应用程序状态' }
            ],
            basicBtns: [
                {prop: 'loginout', label: '注销', icon: 'ucmp-icon-loginout'},
                {prop: 'disConnect', label: '断开连接', icon: 'ucmp-icon-disconnect'}
            ]
        }
    },
    created () {
        this.getAppSesions()
    },
    methods: {
        getAppSesions () {
            let routerParam = {
                provider_id: this.$route.query.provider_id,
                application_uid: this.$route.query.application_uid
            }
            this.isLoading = true
            Api.get('appSessions', routerParam, true).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.data.sessions
                }, () => {
                    this.isLoading = false
                }
            )
        },  
        formatAppState (state) {
            switch (state) {
                case 0:
                    return '预登陆'
                case 1:
                    return '预启动'
                case 2:
                    return '活动'
                case 3:
                    return '桌面'
                default:
                    return '--'
            }
        },
        handleCurrentChange (session) {
            this.selectSession = session
        },
        checkBtnDisabled (btn) {
            // 会话状态： 注销(选中一个即可)
            if (btn.prop === 'loginout') return this.selectSession.length !== 1
            // 会话状态： 其他(选中一个切状态为 ‘活动’)
            if (this.selectSession.length !== 1) return true
                
            return this.selectSession[0].sessionState !== 2
        },
        operationClick (btn) {
            if (btn.prop === 'loginout')
                this.sessionLogout()
            else 
                this.sessionDisConnect()
        },
         /**
         * @description 会话注销
         */
        sessionLogout () {
            let session = this.selectSession[0]
            this.$confirm(`确定注销用户: ${session.userName}的会话, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let param = {
                    provider_id: this.$route.query.provider_id,
                    machine_name: session.machineName,
                    user_name: session.userName,
                    session_type: session.sessionType
                }
                Api.put('citrixMachineSessionsLogout', param, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: `用户: ${session.userName}的会话注销成功!`
                        })
                        this.getAppSesions()
                    }, () => {
                        this.$message({
                            type: 'error',
                            message: `用户: ${session.userName}的会话注销失败!`
                        })
                    }
                )
            }).catch(() => {
            })
        },
        /**
         * @description 会话断开
         */
        sessionDisConnect () {
            let session = this.selectSession[0]
            this.$confirm(`确定断开连接用户: ${session.userName}的会话, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let param = {
                    provider_id: this.$route.query.provider_id,
                    machine_name: session.machineName,
                    user_name: session.userName,
                    session_type: session.sessionType
                }
                Api.put('citrixMachineSessionsDisconnect', param, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: `用户: ${session.userName}的会话断开连接成功!`
                        })
                        this.getAppSesions()
                    }, () => {
                        this.$message({
                            type: 'error',
                            message: `用户: ${session.userName}的会话断开连接失败!`
                        })
                    }
                )
            }).catch(() => {
            })
        },
        /**
         * @description 表格的最大高度
         */
        tableMaxHeight () {
            return this.tableContainerHeight - 16 - 34
        }
    },
    computed: {
        stateObj () {
            let rst = {}
            const states = [
                {color: '#61c359', prop: 2, label: '活动'},
                {color: '#ffaa00', prop: 3, label: '已断开'}
            ]
            states.forEach(
                item => {
                    rst[item.prop] = {
                        label: item.label,
                        color: item.color
                    }
                }
            )
            return rst
        }
    }
}
</script>
<style lang="scss" scoped>
.state-color {
    color: $fontWhite
}
</style>
