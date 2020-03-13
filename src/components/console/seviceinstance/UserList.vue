<template lang="pug">
    div.bastion-user-container
        div.content
            el-form(v-if="!id")
                DynamicForm(
                    :formItems="formItems"
                    uniqueKey="prop"
                    :formData="hostForm"
                    :inline="inline"
                    :labelWidth="'80px'"
                )
            div.tablePane(:class="{'add': !id}")
                TableSelect(ref="tableSelect" :config="tableConfig" :columns="tableColumns" :selectedList="tableSelectedList")
        div.footer
            el-button(@click="handleClose" size="small") 取消
            el-button(type="warning" @click="submitForm" :disabled="submitDisable") 保存
</template>
<script>
/**
 * 用户列表
 */
import Api from '@api'
import { mapGetters } from 'vuex'
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import TableSelect from '@/components/common/TableSelect'
export default {
    name: 'UserList',
    $_veeValidate: {
        validator: 'new'
    },
    props: {
        id: {
            type: String,
            default: () => {
                return ''
            }
        },
        asset_id: {
            type: String,
            default: () => {
                return ''
            }
        },
        users: {
            type: Array,
            default: () => {
                return []
            }
        }
    },
    data () {
        return {
            inline: true,
            tableData: [],
            userList: [],
            hostInfo: null,
            hostForm: {},
            submitDisable: false,
            tableColumns: [
                {
                    prop: 'name',
                    label: '用户名称'
                },
                {
                    prop: 'realname',
                    label: '中文名称'
                },
                {
                    prop: 'email',
                    label: '邮箱'
                }
            ],
            formItems: [
                {
                    label: '用户名',
                    prop: 'admin_username',
                    type: 'input',
                    description: '请输入用户名',
                    validation: {
                        max: '100',
                        required: true
                    }
                },
                {
                    label: '密码',
                    prop: 'admin_password',
                    type: 'password',
                    description: '请输入密码',
                    validation: {
                        max: '100',
                        required: true
                    }
                },
                //UCMP-876【堡垒机】同步的存量资源无法进行堡垒机用户关联，提示“云主机镜像没有端口号，不能关联用户”。
                //问题原因：需求变更
                {
                    label: '端口号',
                    prop: 'ssh_port',
                    type: 'input',
                    description: '端口号(1-65535)',
                    validation: {
                        max: '5',
                        required: true,
                        reg: '/^(^[1-9]\\d{0,3}$)|(^[1-5]\\d{4}$)|(^[6][0-5][0-5][0-3][0-5]$)/'
                    }
                },
                {
                    label: 'IP',
                    prop: 'ip',
                    type: 'select',
                    description: '请选择IP',
                    defaultOptions: [],
                    data_link: {
                        text_field: 'name',
                        value_field: 'ip'
                    },
                    validation: {
                        required: true
                    }
                }
            ],
            tableConfig: {
                search: false,
                multiple: false, // 是否多选
                unique: 'name',   // 能确定唯一数据的key
                api: 'userListByName',
                listRoot: 'data.users',
                paginationParam: {offset: 'page_idx'},
                pagination: true,
                frontPagination: false,
                selectedHead: false
            },
            tableSelectedList: []
        }
    },
    methods: {
        /**
         * 初始化操作
         */
        init () {
            let params = {service: this.serviceCode, instanceId: this.checkedInstanceId}
            Api.get('serviceInstanceDetail', params, true).then(
                res => {
                    this.hostInfo = res
                    let defaultSshPort = this.hostInfo.image.ssh_port ? this.hostInfo.image.ssh_port : ''
                    this.$set(this.hostForm, 'ssh_port', defaultSshPort)
                    this.hostInfo.ip.forEach(item => {
                        let ipItem = {
                            ip: item,
                            name: item
                        }

                        this.formItems[3].defaultOptions.push(ipItem)
                    })
                }
            )

            this.tableSelectedList = this.users.map(item => {
                return {
                    id: item.user_id,
                    realname: item.name,
                    name: item.username,
                    email: item.email
                }
            })
        },
        /**
         * @description 关联用户对话框关闭
         */
        handleClose () {
            this.$emit('closeDialog')
        },
        /**
         * @description 格式化
         * @param [isUpdate] 是否是更新
         */
        formatResObj (isUpdate) {
            let resObj = {}
            let users = this.$refs.tableSelect.getSelection().map(item => {
                return {
                    user_id: item.id,
                    name: item.realname,
                    username: item.name,
                    email: item.email
                }
            })
            if (isUpdate) {
                this.$set(resObj, 'type', 'update')
                this.$set(resObj, 'pre_id', this.id)
                this.$set(resObj, 'users', users)
            } else {
                //UCMP-639 【堡垒机】云主机详情接口改变，导致云主机关联用户功能不可用。
                //问题原因：服务端接口形式更改
                let asset = {
                    asset_id: this.asset_id,
                    hostname: this.hostInfo.instance_name,
                    domain: '',
                    ip: this.hostForm.ip,
                    platform: this.hostInfo.image.os_type,
                    port: this.hostForm.ssh_port,
                    admin_username: this.hostForm.admin_username,
                    admin_password: this.hostForm.admin_password
                }

                this.$set(resObj, 'users', users)
                this.$set(resObj, 'assets', [asset])
            }

            return resObj
        },
        /**
         * @description 关联用户对话框确定
         */
        submitForm () {
            this.$validator.validate().then(valid => {
                if (valid) {
                    if (!this.$refs.tableSelect.getSelection().length) {
                        this.$notify({
                            type: 'warning',
                            message: '请选择关联用户!'
                        })
                        return
                    }
                    this.submitDisable = true
                    let params = this.formatResObj(this.id)
                    //更新、关联用户
                    let msg = this.id ? '更新关联用户操作成功!' : '关联用户操作成功!'
                    Api.post('bastion', params, true).then(
                        res => {
                            //UCMP-1031【jumpserver】jumpserver错误码需要添加错误信息提示。
                            if (res.error_code && res.error_code === 2005) {
                                this.$notify({
                                    title: '通知',
                                    type: 'warning',
                                    message: res.msg
                                })
                                //UCMP-1169【jumpserver】关联用户时，提示报错之后，保存按钮不可再点
                                this.submitDisable = false
                            } else {
                                this.$notify({
                                    type: 'success',
                                    message: msg
                                })
                                this.$emit('submit')
                            }
                        }, err => {
                            console.log(err)
                            this.submitDisable = false
                        }
                    )
                }
            })
        }
    },
    created () {
        this.init()
    },
    computed: {
        serviceCode () {
            return this.$route.params.code
        },
        ...mapGetters([
            'checkedInstanceId'
        ])
    },
    components: {
        DynamicForm,
        TableSelect
    }
}
</script>
<style lang="scss" scoped>
.bastion-user-container {
    .content {
        // UCMP-1294【堡垒机】关联用户各字段不填时，校验之后，保存和取消按钮无法看见。
        overflow-y: auto;
        .tablePane {
            height: calc(100% - 20px);
            &.add {
                height: calc(100% - 100px);
            }
        }
    }
    .footer {
        padding: 15px 5px 0px 0px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
}
</style>
