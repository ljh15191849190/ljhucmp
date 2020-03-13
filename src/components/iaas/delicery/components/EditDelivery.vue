<template lang="pug">
    el-dialog.edit-delivery(title="编辑交付组" :visible.sync="visible" :before-close="close" width="680px")
        el-tabs(tab-position="left" v-model="activeTag")
            el-tab-pane(label="用户" name="user")
                div.edit-delivery__user
                    h4 用户
                    p.edit-delivery__desc 指定能够使用此交付组中的应该程序和桌面的用户，可以分配使用有效凭据登录的用户。此外，还可以允许未经身份验证的用户进行访问。
                    el-radio-group.margin-bottom(v-model="userRule.allowedUsers")
                        el-radio.margin-bottom(:label="1") 允许任何已通过身份验证的用户使用此交付组
                        el-radio(:label="0") 限制以下用户使用此交付组
                    div(v-show="!userRule.allowedUsers")
                        div.forbid-list(:style="{'height': isStatic ? '290px' : '260px'}")
                            el-tag(v-for="item in userRule.forbidList" v-if="item.action !== 3" :key="item.name" closable @close="delForbidUser(item)").margin-right.margin-bottom {{item.name}}
                        div.margin-top
                            LazySelectUser(ref="vmSelectPerson" v-model="userRule.currentUser" reqKey="getADUser" @change="clearSelect('currentUserGroup')")
                                template(v-slot="scope")
                                    el-option(
                                    v-for="(item, index) in scope.userList"
                                    :key="index"
                                    :disabled="disableOptionCallback(item.username)"
                                    :label="item.username"
                                    :value="item.username")
                            el-divider(direction="vertical")
                            el-select.margin-right(v-model="userRule.currentUserGroup" size="small" placeholder="请输入用户组名称搜索" @change="clearSelect('currentUser')" filterable)
                                el-option(
                                v-for="(item, index) in adUserGroupList"
                                :key="index"
                                :disabled="disableOptionCallback(item.group_name)"
                                :label="item.group_name"
                                :value="item.group_name")
                            el-button(size="small" @click="addForbidUser" type="primary" :disabled="!userRule.currentUser && !userRule.currentUserGroup") 添加
                    el-checkbox.margin-top(v-if="!isStatic" v-model="userRule.isSelect") 如果已配置，则会话必须在用户的主区域中启动

            el-tab-pane(:label="desktopTagLabel" name="desktop")
                div.edit-delivery__desktop
                    h4 桌面
                    p.edit-delivery__desc 添加能够启动此交付组中的桌面的用户
                    div.margin-bottom
                        el-button(size="small" @click="addRule") 添加
                        el-button(size="small" :disabled="!desktopCurRow" @click="editRule") 修改
                        el-button(size="small" :disabled="!desktopCurRow" @click="delRule") 删除
                    el-table(:data="desktopList" highlight-current-row @current-change="handleCurrentChange")
                        el-table-column(label="名称" prop="publishedName" width="200px")
                        el-table-column(label="用户" prop="includedUserFilterEnabled")
                            template(slot-scope="scope")
                                span(v-if="scope.row.includedUserFilterEnabled")
                                    span 被限制使用的名单：
                                    span(v-for="(item, index) in scope.row.includedUsers") {{item.name}}
                                        span(v-if="index !== scope.row.includedUsers.length - 1") ,
                                span(v-else) 允许对此交付组具有访问权限的所有人使用桌面

            el-tab-pane(label="计算机分配" name="computer" v-if="isStatic")
                div.edit-delivery__computer
                    h4 计算机分配
                    p.edit-delivery__desc &nbsp;
                    div.margin-bottom
                        el-upload.inline-block.margin-right(
                        ref="upload"
                        action=""
                        :multiple="false"
                        :auto-upload="false"
                        :show-file-list="false"
                        :on-change="readFile"
                        )
                            el-button(size="small") 导入
                        el-button(size="small" @click="writeFile") 导出
                    el-table(:data="computerList")
                        el-table-column(label="计算机名称" prop="machine_name")
                        el-table-column(label="用户" prop="user")
                            template(slot-scope="scope")
                                div(v-show="scope.$index !== assignUserVisibleIndex")
                                    span {{scope.row.user}}
                                    el-button.float-right(size="mini" type="text" icon="el-icon-edit" @click.stop="showEditUser(scope.$index)")
                                LazySelectUser(ref="vmAssignUser" size="mini" v-if="scope.$index === assignUserVisibleIndex" @change="changeAssignUser" reqKey="getADUser")
                                    template(v-slot="scope")
                                        el-option(
                                        v-for="(item, index) in scope.userList"
                                        :key="index"
                                        :disabled="disableOptionCallback(item.username)"
                                        :label="item.username"
                                        :value="item.username")

        div(slot="footer")
            el-button(size="small" @click="close") 取消
            el-button(size="small" type="primary" @click="confirm" :loading="isSaving") 确定
            el-button.margin-left(size="small" type="primary" @click="apply" :loading="isSaving") 应用

        EditDeliveryRule(
        v-if="editRuleVisible"
        :visible.sync="editRuleVisible"
        :rule-item="editRuleItem"
        :append-to-body="true"
        :ldap-prefix="ldapPrefix"
        :is-static="isStatic"
        :tags="desktopTags"
        @updated="updatedRule")
</template>

<script>
    import LazySelectUser from '@common/LazySelectUser'
    import EditDeliveryRule from './EditDeliveryRule'
    import XLSX from 'xlsx'
    import FileSaver from 'file-saver'
    import Api from '@api'
    import axios from 'axios'

    /**
     * 编辑交付组
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'EditDelivery',
        props: ['visible', 'activeDelivery'],
        components: {LazySelectUser, EditDeliveryRule},
        data () {
            return {
                isSaving: false,
                activeTag: 'user',
                ldapPrefix: '',
                adUserGroupList: [],
                userRule: {
                    allowedUsers: 1,
                    forbidList: [],
                    currentUser: '',
                    currentUserGroup: '',
                    isSelect: false
                },
                assignUser: '',
                assignUserVisibleIndex: -1,

                desktopCurRow: null,
                editRuleVisible: false,
                editRuleItem: null,
                desktopList: [],
                desktopTags: [],
                deletedDesktopList: [],

                computerList: []
            }
        },
        computed: {
            isStatic () {
                // 交付组类型 0 static, 1 random
                return this.activeDelivery.delivery_type === 0
            },

            desktopTagLabel () {
                return this.isStatic ? '桌面分配规则' : '桌面'
            }
        },
        methods: {
            init () {
                // 获取ldap的前缀信息
                Api.get('getLdap', {}, true).then(res => {
                    let domainName = res.data.domain_name
                    this.ldapPrefix = domainName.split('.')[0].toUpperCase()
                })

                // 获取ad用户组信息
                Api.get('getADUserGroup', {}, true).then(res => {
                    this.adUserGroupList = res.data || []
                })

                // 获取 授权用户信息
                this.initUser()

                // 获取 桌面分配信息
                this.initDesktop()

                // 获取 计算机分配信息
                if (this.isStatic) {
                    //
                    this.initComputer()
                }
            },

            initUser () {
                let params = {
                    provider_id: this.activeDelivery.provider_id,
                    desktop_group_uid: this.activeDelivery.delivery_group_id
                }

                // 获取 授权用户信息
                Api.get('deliveryUser', params, true).then(res => {
                    let rule = res.data.policy_rule
                    this.userRule.allowedUsers = rule.allowedUsers
                    this.userRule.forbidList = rule.includedUsers
                    this.userRule.isSelect = res.data.is_select
                })
            },

            initDesktop () {
                // 清除桌面 上次删除的记录
                this.deletedDesktopList = []

                let params = {
                    provider_id: this.activeDelivery.provider_id,
                    desktop_group_uid: this.activeDelivery.delivery_group_id
                }
                if (!this.isStatic) {
                    Api.get('deliveryRandomDesktop', params, true).then(res => {
                        this.desktopList = res.data.policy_rule || []
                        this.desktopTags = res.data.tags || []
                    })
                } else {
                    Api.get('deliveryStaticDesktop', params, true).then(res => {
                        this.desktopList = res.data.rules || []
                        this.desktopTags = []
                    })
                }
            },

            initComputer () {
                let params = {
                    provider_id: this.activeDelivery.provider_id,
                    desktop_group_uid: this.activeDelivery.delivery_group_id
                }
                Api.get('deliveryMachine', params, true).then(res => {
                    this.computerList = res.data.machines.map(item => {
                        return {
                            machine_name: item.machineName,
                            user: item.associatedUserNames[0] || ''
                        }
                    })
                })
            },

            close () {
                this.$emit('update:visible', false)
            },

            pieceName (realName) {
                return `${this.ldapPrefix}\\${realName}`
            },

            /**
             * 用户
             */
            // 添加禁止用户
            addForbidUser () {
                // 没有区分用户和用户组，默认前提两者不会重名
                let name = this.userRule.currentUser || this.userRule.currentUserGroup
                name = this.pieceName(name)
                let hasItem = this.userRule.forbidList.find(item => item.action === 3 && item.name === name)
                if (hasItem) {
                    // 原本就存在的，重新添加后删除action
                    delete hasItem.action
                } else {
                    // 已在option选项中置灰了已选择对象
                    this.userRule.forbidList.push({
                        // action 1:修改 2:添加 3:删除
                        action: 2,
                        name
                    })
                }

                this.userRule.currentUser = ''
                this.userRule.currentUserGroup = ''
            },

            // 删除禁止用户
            delForbidUser (user) {
                if (user.action === 2) {
                    // 本页面新添加的 ，直接删除
                    this.userRule.forbidList.splice(this.userRule.forbidList.indexOf(user), 1)
                } else if (!user.hasOwnProperty('action')) {
                    // 接口返回的，action不存在， 需要置action为删除
                    this.$set(user, 'action', 3)
                }
            },

            // 禁止重复选择
            disableOptionCallback (name) {
                // if (this.userRule.allowedUsers) return false
                return this.userRule.forbidList.some(item => item.action !== 3 && item.name === this.pieceName(name))
            },

            clearSelect (type) {
                this.userRule[type] = ''
            },

            /**
             * 桌面
             */
            handleCurrentChange (row) {
                this.desktopCurRow = row
            },

            addRule () {
                this.editRuleItem = null
                this.editRuleVisible = true
            },

            editRule () {
                this.editRuleItem = this.desktopCurRow
                this.editRuleVisible = true
            },

            delRule () {
                let index = this.desktopList.indexOf(this.desktopCurRow)
                let delItem = this.desktopList.splice(index, 1)[0]
                if (delItem !== 2) {
                    delItem.action = 3
                    this.deletedDesktopList.push(delItem)
                }
            },

            updatedRule (newRuleItem) {
                if (this.editRuleItem) {
                    // update
                    // action 1:修改 2:添加 3:删除
                    this.editRuleItem.action = this.editRuleItem.action !== 2 ? 1 : 2
                    this.editRuleItem.description = newRuleItem.description
                    this.editRuleItem.publishedName = newRuleItem.publishedName
                    this.editRuleItem.includedUserFilterEnabled = newRuleItem.includedUserFilterEnabled
                    this.editRuleItem.includedUsers = newRuleItem.includedUsers
                    this.editRuleItem.enabled = newRuleItem.enabled

                    if (this.isStatic) {
                        // 静态 最大桌面数
                        this.editRuleItem.maxDesktops = newRuleItem.maxDesktops
                    } else {
                        // 动态 限制启动带标记的计算机
                        this.editRuleItem.restrictToTag = newRuleItem.restrictToTag
                    }
                } else {
                    // add, 补上desktopGroupUid
                    newRuleItem.desktopGroupUid = this.activeDelivery.delivery_group_id
                    this.desktopList.push(newRuleItem)
                }
            },

            /**
             * 计算机分配
             */
            // 修改用户
            showEditUser (index) {
                this.assignUserVisibleIndex = this.assignUserVisibleIndex === index ? -1 : index
                document.removeEventListener('click', this.clickOutFn)
                setTimeout(() => {
                    document.addEventListener('click', this.clickOutFn, {
                        once: true,
                        capture: false
                    })
                })
            },

            clickOutFn (e) {
                this.assignUserVisibleIndex = -1
            },

            // 分配计算机，修改用户
            changeAssignUser () {
                // selectedLabel在下一帧中渲染
                this.$nextTick(() => {
                    this.computerList[this.assignUserVisibleIndex].user = this.pieceName(this.$refs.vmAssignUser.$refs.select.selectedLabel.replace(/\(.*\)/g, ''))
                    this.assignUserVisibleIndex = -1
                })
            },

            // 读取excel, csv, txt
            readFile (file, fileList) {
                let reader = new FileReader()
                reader.onload = (e) => {
                    let fileData = new Uint8Array(e.target.result)
                    let wb = XLSX.read(fileData, {type: 'array'})
                    let first_ws = wb.Sheets[wb.SheetNames[0]]
                    let data = XLSX.utils.sheet_to_json(first_ws, {header: 1})

                    // 处理获取到的数据
                    let computerList = data.map(item => {
                        return {machine_name: item[0], user: item[1]}
                    })

                    // 去掉header, 以当前表格数据的计算机名称为唯一key 只更新用户信息，不添加新数据
                    computerList.shift()

                    let computerNameList = this.computerList.map(item => item.machine_name)
                    computerList.forEach(inComputerItem => {
                        let index = computerNameList.indexOf(inComputerItem.machine_name)
                        if (index > -1) {
                            // 替换user
                            this.computerList[index].user = inComputerItem.user
                        }
                    })
                }
                reader.readAsArrayBuffer(file.raw)
            },

            // 导出excel
            writeFile () {
                let wbOpts = {bookType: 'xlsx', bookSST: false, type: 'array'}
                let wb = XLSX.utils.book_new()
                let ws = XLSX.utils.json_to_sheet(this.computerList, {
                    header: ['machine_name', 'user']
                })
                XLSX.utils.sheet_add_json(ws, [{
                    machine_name: '计算机名称',
                    user: '用户'
                }], {
                    header: ['machine_name', 'user'],
                    skipHeader: true
                })

                XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

                let wbOut = XLSX.write(wb, wbOpts)
                FileSaver.saveAs(new Blob([wbOut], {type: 'application/octet-stream'}), '计算机分配.xlsx')
            },

            /**
             * 确认，应用按钮
             */
            // 应用
            apply () {
                let tagFnMap = {
                    user: 'applyUserUpdate',
                    desktop: 'applyDesktopUpdate',
                    computer: 'applyComputerUpdate'
                }

                this.isSaving = true
                let fnKey = tagFnMap[this.activeTag]
                this[fnKey]().then(() => {
                    this.isSaving = false
                }).catch(e => {
                    this.isSaving = false
                })
            },

            // 确认
            confirm () {
                let reqArray = [this.applyUserUpdate(), this.applyDesktopUpdate()]
                if (this.isStatic) {
                    // 静态才有计算机分配
                    reqArray.push(this.applyComputerUpdate())
                }

                this.isSaving = true
                axios.all(reqArray).then(() => {
                    this.isSaving = false
                    this.close()
                }).catch(e => {
                    this.isSaving = false
                })
            },

            // 应用--用户
            applyUserUpdate () {
                let params = {}

                // users: [{ action: (1:修改 2:添加 3:删除) , name: string}]
                let users = this.userRule.forbidList.filter(item => {
                    return item.hasOwnProperty('action')
                }).map(item => {
                    return {
                        action: item.action,
                        name: item.name
                    }
                })
                params = {
                    provider_id: this.activeDelivery.provider_id,
                    desktop_group_uid: this.activeDelivery.delivery_group_id,
                    allowed_users: this.userRule.allowedUsers,
                    is_select: this.userRule.isSelect,
                    users
                }

                return Api.put('deliveryUserUpdate', params, true).then(res => {
                    this.initUser()
                    this.$notify.success('用户修改应用成功')
                })
            },

            // 应用--桌面
            applyDesktopUpdate () {
                let params = {}
                params = {
                    provider_id: this.activeDelivery.provider_id,
                    desktop_group_uid: this.activeDelivery.delivery_group_id,
                    rules: this.desktopList.filter(item => item.action !== 0).concat(this.deletedDesktopList)
                }

                let apiKey = this.isStatic ? 'deliveryStaticDesktopUpdate' : 'deliveryRandomDesktopUpdate'
                return Api.put(apiKey, params, true, {
                    params: {
                        provider_id: this.activeDelivery.provider_id,
                        desktop_group_uid: this.activeDelivery.delivery_group_id
                    }
                }).then(res => {
                    this.initDesktop()
                    this.$notify.success(`${this.desktopTagLabel}修改应用成功`)
                })
            },

            // 应用--计算机规则
            applyComputerUpdate () {
                let params = {}
                params = {
                    provider_id: this.activeDelivery.provider_id,
                    desktop_group_uid: this.activeDelivery.delivery_group_id,
                    users: this.computerList
                }

                return Api.put('deliveryMachineUpdate', params, true).then(res => {
                    this.initComputer()
                    this.$notify.success('计算机规则修改应用成功')
                })
            }
        },
        created () {
            this.init()
        }
    }
</script>

<style lang="scss" scoped>
    .el-tabs {
        height: 480px;
    }

    .el-radio-group, .el-radio {
        display: block;
    }

    .edit-delivery__user {
        .forbid-list {
            height: 260px;
            border: 1px solid $borderColor;
            padding: 12px;
            overflow-y: auto;
            background-color: $disabledBgColor;
        }
    }

    .edit-delivery__desc {
        margin-bottom: 24px;
    }

    .el-table {
        // 72 描述， 42 按钮
        height: calc(480px - 72px - 42px);
    }

    .margin-left {
        margin-left: 36px;
    }

    .float-right {
        float: right;
    }
</style>
<style lang="scss">
    .edit-delivery {
        .el-table__row {
            height: 33px;
            line-height: 33px;
        }
    }
</style>
