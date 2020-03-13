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
                    :max-height="tableMaxHeight()"
                    element-loading-spinner="ucmp-icon-loading" border)
                        el-table-column(type="selection" width="45")
                        el-table-column(v-for="column in columns" :prop="column.prop" :label="column.label" :key="column.prop" :width="column.width")
                            template(slot-scope="scope")
                                span(v-if="column.prop === 'sessionType'") {{ scope.row[column.prop] === 0 ? '桌面' : '应用' }}
                                span(v-else-if="column.prop === 'applicationsInUse'") {{ scope.row[column.prop] && scope.row[column.prop].length ? scope.row[column.prop].join(',') : '--'}}
                                span(v-else-if="column.prop === 'appState'") {{formatAppState(scope.row[column.prop])}}
                                el-tag(v-else-if="(column.prop === 'sessionState')" :color="stateObj[scope.row[column.prop]].color" size="mini") 
                                    span.state-color {{ stateObj[scope.row[column.prop]].label }}
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
                { prop: '/virtual-cloud-mght', label: '桌面云计算机管理' },
                { prop: '', label: '查看会话' }
            ],
            columns: [
                { prop: 'userName', label: '登录账号' },
                { prop: 'userFullName', label: '用户姓名' },
                { prop: 'sessionType', label: '会话类型' },
                { prop: 'sessionState', label: '会话状态' },
                { prop: 'brokeringTime', label: '代理时间' },
                { prop: 'appState', label: '应用程序状态' },
                { prop: 'brokeringDuration', label: '持续时间（分钟）' },
                { prop: 'applicationsInUse', label: '使用中的应用程序' }
            ],
            basicBtns: [
                {prop: 'loginout', label: '注销', icon: 'ucmp-icon-loginout'},
                {prop: 'disConnect', label: '断开连接', icon: 'ucmp-icon-disconnect'}
            ]
        }
    },
    created () {
        this.getSessionList()
    },
    methods: {
        checkBtnDisabled (btn) {
            // 会话状态： 注销(选中一个即可)
            if (btn.prop === 'loginout') return this.selectSession.length !== 1
            // 会话状态： 其他(选中一个切状态为 ‘活动’)
            if (this.selectSession.length !== 1) return true
                
            return this.selectSession[0].sessionState !== 2
        },
        /**
         * @description 各种按钮操作
         */
        operationClick (btn) {
            if (btn.prop === 'loginout')
                this.sessionLogout()
            else 
                this.sessionDisConnect()
        },
        handleCurrentChange (val) {
            this.selectSession = val
        },
        /**
         * @description 格式化应用程序状态
         */
        formatAppState (state) {
            const states = {
                0: '预登陆',
                1: '预启动',
                2: '活动',
                3: '桌面'
            }

            return states[state] || ''
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
                    machine_name: this.$route.query.machine_name,
                    user_name: session.userName,
                    session_type: session.sessionType
                }
                Api.put('citrixMachineSessionsLogout', param, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: `用户: ${session.userName}的会话注销成功!`
                        })
                        this.getSessionList()
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
                    machine_name: this.$route.query.machine_name,
                    user_name: session.userName,
                    session_type: session.sessionType
                }
                Api.put('citrixMachineSessionsDisconnect', param, true).then(
                    res => {
                        this.$message({
                            type: 'success',
                            message: `用户: ${session.userName}的会话断开连接成功!`
                        })
                        this.getSessionList()
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
         * @description 计算机管理会话列表
         */
        getSessionList () {
            let routerParam = {
                provider_id: this.$route.query.provider_id,
                machine_name: this.$route.query.machine_name
            }
            this.isLoading = true
            Api.get('citrixMachineSessions', routerParam, true).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.data.sessions
                }, () => {
                    this.isLoading = false
                }
            )
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
