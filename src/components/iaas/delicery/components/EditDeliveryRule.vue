<template lang="pug">
    el-dialog.delivery-rule(:title="title" :visible.sync="visible" :before-close="close" :append-to-body="appendToBody" width="650px")
        el-form(ref="form" size="small" label-width="100px" :model="model" :rules="rules")
            el-form-item(label="显示名称" prop="publishedName")
                el-input(v-model="model.publishedName" placeholder="示例：Windows 8 桌面")
            el-form-item(label="说明")
                el-input(v-model="model.description" placeholder="示例：分配给财务的桌面")

            // 动态/静态不同的项
            el-form-item.delivery-rule__form-item(label="限制启动带标记的计算机" v-if="!isStatic")
                el-checkbox(v-model="model.restrict")
                el-select(v-model="model.restrictToTag" :disabled="!model.restrict")
                    el-option(v-for="item in tags" :key="item" :value="item") {{item}}
            el-form-item(label="最大桌面数" v-else)
                el-input-number(v-model="model.maxDesktops" :min="0" :precision="0")

            el-form-item(label="用户控制")
                el-radio-group.margin-top.margin-bottom(v-model="model.includedUserFilterEnabled")
                    el-radio.margin-bottom(:label="false") 允许对此交付组具有访问权限的所有人使用桌面
                    el-radio(:label="true") 将桌面使用限制到：
                div(v-show="model.includedUserFilterEnabled")
                    div.forbid-list
                        el-tag(v-for="item in forbidList" :key="item.id" closable @close="delForbidUser(item)").margin-right.margin-bottom {{item.name}}
                    div.margin-top
                        LazySelectUser(ref="vmSelectPerson" v-model="currentUser" reqKey="getADUser" @change="clearSelect('currentUserGroup')")
                            template(v-slot="scope")
                                el-option(
                                v-for="(item, index) in scope.userList"
                                :key="index"
                                :disabled="disableOptionCallback(item.username)"
                                :label="item.username"
                                :value="item.username")
                        el-divider(direction="vertical")
                        el-select.margin-right(v-model="currentUserGroup" size="small" placeholder="请输入用户组名称搜索" @change="clearSelect('currentUser')" filterable)
                            el-option(
                            v-for="(item, index) in adUserGroupList"
                            :key="index"
                            :disabled="disableOptionCallback(item.group_name)"
                            :label="item.group_name"
                            :value="item.group_name")
                        el-button(size="small" @click="addForbidUser" type="primary" :disabled="!currentUser && !currentUserGroup") 添加
            el-form-item(label="是否启用桌面")
                el-checkbox(v-model="model.enabled")
                i.margin-left.margin-right.ucmp-icon-question.theme-color
                span.desc 清除此复选框将禁用此桌面的交付
        div(slot="footer")
            el-button(size="small" @click="close") 取消
            el-button(size="small" type="primary" @click="submit") 确定
</template>

<script>
    import LazySelectUser from '@common/LazySelectUser'
    import Api from '@api'

    /**
     * 添加/修改 交付组 桌面（规则）
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'EditDeliveryRule',
        props: {
            visible: Boolean,
            appendToBody: Boolean,
            ruleItem: Object,
            isStatic: Boolean,
            ldapPrefix: String,
            tags: {
                type: Array,
                default: () => []
            }
        },
        components: {LazySelectUser},
        data () {
            return {
                currentUser: '',
                currentUserGroup: '',
                adUserGroupList: [],
                model: {
                    publishedName: '',
                    description: '',
                    includedUserFilterEnabled: false,
                    enabled: true,
                    restrict: false,
                    restrictToTag: '',
                    maxDesktops: 0
                },
                forbidList: [],
                rules: {
                    publishedName: [{
                        required: true, message: '请输入显示名称', trigger: 'blur'
                    }]
                }
            }
        },
        computed: {
            title () {
                return this.isEdit ? '修改桌面' : '添加桌面'
            },

            isEdit () {
                return !!this.ruleItem
            }
        },
        methods: {
            close () {
                this.$emit('update:visible', false)
            },

            addForbidUser () {
                // 没有区分用户和用户组，默认前提两者不会重名
                let name = this.currentUser || this.currentUserGroup
                name = this.pieceName(name)
                // 已在option选项中置灰了已选择对象
                this.forbidList.push({name})

                this.currentUser = ''
                this.currentUserGroup = ''
            },

            // 删除禁止用户
            delForbidUser (user) {
                this.forbidList.splice(this.forbidList.indexOf(user), 1)
            },

            pieceName (realName) {
                return `${this.ldapPrefix}\\${realName}`
            },

            submit () {
                this.$refs.form.validate(valid => {
                    if (valid) {
                        let payload = {
                            action: 2,
                            enabled: this.model.enabled,
                            publishedName: this.model.publishedName,
                            description: this.model.description,
                            includedUserFilterEnabled: this.model.includedUserFilterEnabled,
                            includedUsers: this.forbidList
                        }

                        if (!this.isStatic) {
                            // 动态 限制启动带标记的计算机
                            payload.restrictToTag = this.model.restrict ? this.model.restrictToTag : ''
                        } else {
                            // 静态 最大桌面数
                            payload.maxDesktops = this.model.maxDesktops
                        }
                        this.$emit('updated', payload)
                        this.close()
                    }
                })
            },

            // 禁止重复选择
            disableOptionCallback (name) {
                // if (!this.model.includedUserFilterEnabled) return false
                return this.forbidList.some(item => item.name === this.pieceName(name))
            },

            clearSelect (type) {
                this[type] = ''
            }
        },
        created () {
            // 获取ad用户组信息
            Api.get('getADUserGroup', {}, true).then(res => {
                this.adUserGroupList = res.data || []
            })

            if (this.ruleItem) {
                this.model = {
                    publishedName: this.ruleItem.publishedName,
                    description: this.ruleItem.description,
                    includedUserFilterEnabled: this.ruleItem.includedUserFilterEnabled,
                    enabled: this.ruleItem.enabled,
                    restrict: !!this.ruleItem.restrictToTag,
                    restrictToTag: this.ruleItem.restrictToTag || '',
                    maxDesktops: this.ruleItem.maxDesktops || 0
                }

                this.forbidList = this.ruleItem.includedUsers.map(item => {
                    return {name: item.name}
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .el-radio-group, .el-radio {
        display: block;
    }

    .desc {
        color: $fontContentGray;
        font-size: 12px;
    }

    .forbid-list {
        height: 260px;
        border: 1px solid $borderColor;
        padding: 12px;
        overflow-y: auto;
        background-color: $disabledBgColor;
    }
</style>
<style lang="scss">
    .delivery-rule {
        .delivery-rule__form-item {
            .el-form-item__label {
                line-height: 1.2;
            }
        }
    }
</style>
