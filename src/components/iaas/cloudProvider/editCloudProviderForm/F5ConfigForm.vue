<template lang="pug">
    div.bigip-form-container
        el-form.basic-form(label-width="120px" label-position="right" size="small")
            el-form-item.is-required.dynamic-form-item.rw-input(label="云厂商名称")
                el-input.form-width(v-model="form_data.name"
                    v-validate="rules.require"
                    :name="'name'"
                    placeholder="请输入云厂商名称"
                    data-vv-as="云厂商名称"
                    :class="{'input': true, 'is-danger': errors.has('name')}"
                    maxlength="100"
                )
                span.validator-error.is-danger(v-if="errors.has('name')") {{ errors.first('name') }}
            el-form-item.dynamic-form-item.rw-input(label="设备组名称" :class="{'is-required': slaveList.length > 0}")
                el-input.form-width(v-model="form_data.group_name"
                    v-validate="groupNameRule"
                    :name="'group_name'"
                    placeholder="请输入设备组名称"
                    data-vv-as="设备组名称"
                    :class="{'input': true, 'is-danger': errors.has('group_name')}"
                    maxlength="100"
                )
                span.validator-error.is-danger(v-if="errors.has('group_name')") {{ errors.first('group_name') }}
            el-form-item.dynamic-form-item.rw-input.is-required(label="主机地址")
                el-input.form-width(v-model="master.address"
                    v-validate="rules.require"
                    :name="'address'"
                    placeholder="请输入主机地址"
                    data-vv-as="主机地址"
                    :class="{'input': true, 'is-danger': errors.has('address')}"
                    maxlength="100"
                )
                span.validator-error.is-danger(v-if="errors.has('address')") {{ errors.first('address') }}
            el-form-item.dynamic-form-item.rw-input.is-required(label="用户名")
                el-input.form-width(v-model="master.user_name"
                    v-validate="rules.require"
                    :name="'user_name'"
                    placeholder="请输入用户名"
                    data-vv-as="用户名"
                    :class="{'input': true, 'is-danger': errors.has('user_name')}"
                    maxlength="100"
                )
                span.validator-error.is-danger(v-if="errors.has('user_name')") {{ errors.first('user_name') }}
            el-form-item.dynamic-form-item.rw-input(label="密码" :class="type!=='add' ? '' : 'is-required'")
                el-input.form-width(v-model="master.password"
                    type="password"
                    :v-validate="type!=='add' ? rules.norequire : rules.require"
                    :name="'password'"
                    auto-complete="new-password"
                    :placeholder="type!=='add' ? '******' : '请输入密码'"
                    data-vv-as="密码"
                    :class="{'input': true, 'is-danger': errors.has('password')}"
                    maxlength="100"
                )
                i.action-btn.plus(class="ucmp-icon-device-plus" @click="addAccount")
                span.validator-error.is-danger(v-if="errors.has('password')") {{ errors.first('password') }}
        div.slave-list-pane(v-if="slaveList.length > 0")
            div.account-title 备用账号
            el-form.basic-form(label-width="120px" label-position="right" size="small")
                div(v-for="(slaveItem, index) in slaveList" :key="index")
                    el-form-item.is-required.dynamic-form-item.rw-input(label="主机地址")
                        el-input.form-width(v-model="slaveItem.address"
                            v-validate="rules.require"
                            :name="('address' + index)"
                            placeholder="请输入主机地址"
                            data-vv-as="主机地址"
                            :class="{'input': true, 'is-danger': errors.has('address' + index)}"
                            maxlength="100"
                        )
                        span.validator-error.is-danger(v-if="errors.has('address' + index)") {{ errors.first('address' + index) }}
                    el-form-item.is-required.dynamic-form-item.rw-input(label="用户名")
                        el-input.form-width(v-model="slaveItem.user_name"
                            v-validate="rules.require"
                            :name="('user_name' + index)"
                            placeholder="请输入用户名"
                            data-vv-as="用户名"
                            :class="{'input': true, 'is-danger': errors.has('user_name' + index)}"
                            maxlength="100"
                        )
                        span.validator-error.is-danger(v-if="errors.has('user_name' + index)") {{ errors.first('user_name' + index) }}
                    el-form-item.dynamic-form-item.rw-input(label="密码" :class="type!=='add' ? '' : 'is-required'")
                        div
                            el-input.form-width(v-model="slaveItem.password"
                                type="password"
                                :v-validate="type!=='add' ? rules.norequire : rules.require"
                                :name="('password' + index)"
                                :placeholder="type!=='add' ? '******' : '请输入密码'"
                                data-vv-as="密码"
                                :class="{'input': true, 'is-danger': errors.has('password' + index)}"
                                maxlength="100"
                            )
                            i.action-btn.remove(class="ucmp-icon-device-remove" @click="delAccount(index)")
                            i.action-btn.plus.slave-plus(class="ucmp-icon-device-plus" @click="addAccount")
                            span.validator-error.is-danger(v-if="errors.has('password' + index)") {{ errors.first('password' + index) }}
                        el-checkbox(v-model="slaveItem.is_master" @change="handleCheck($event, index)") 设置为主账号
        el-form-item.dynamic-form-item.rw-input.is-required(label="类型")
            el-radio(v-model="form_data.cloud_type"
                label="private"
                v-validate="rules.require"
                :name="'cloud_type'"
                placeholder="请输入用户名"
                data-vv-as="用户名"
                :class="{'input': true, 'is-danger': errors.has('cloud_type')}"
            ) 私有云
            span.validator-error.is-danger(v-if="errors.has('cloud_type')") {{ errors.first('cloud_type') }}
        el-form-item.dynamic-form-item.rw-input(label="同步资源设置")
            el-radio(v-model="form_data.resource_sync_type" :label="item.key" :key="item.key" v-for="item in resourceForm") {{item.value}}
        el-form-item.rw-input.is-required.loading-form-item(label="" v-if="form_data.resource_sync_type==='time'")
            el-select(v-model="form_data.resource_sync_time"
                clearable
                v-validate="rules.require"
                :name="'resource_sync_time'"
                value-key="id"
                placeholder="请选择"
                data-vv-as="时间"
                size="small"
                :class="{'input': true, 'is-danger': errors.has('resource_sync_time')}"
            )
                el-option(
                    v-for="item in timeList" :key="item.id" :value="item.id" :label="item.name"
                )
            span.validator-error.is-danger(v-if="errors.has('resource_sync_time')") {{ errors.first('resource_sync_time') }}  
        el-form-item.dynamic-form-item.rw-input.is-required(label="" v-if="form_data.resource_sync_type==='frequency'")
            el-input-number(v-model="form_data.resource_sync_frequency"
                v-validate="rules.require"
                size="small"
                :name="'resource_sync_frequency'"
                data-vv-as="频次"
                :min="0"
                :class="{'input': true, 'is-danger': errors.has('resource_sync_frequency')}"
            )
            span.validator-error.is-danger(v-if="errors.has('resource_sync_frequency')") {{ errors.first('resource_sync_frequency') }}  
        el-form-item.dynamic-form-item.rw-input.is-required(label="资源创建并发限制")
            el-input-number(v-model="form_data.concurrence"
                v-validate="rules.require"
                :name="'concurrence'"
                size="small"
                data-vv-as="资源创建并发限制"
                :min="0"
                :class="{'input': true, 'is-danger': errors.has('concurrence')}"
            )
</template>
<script>
/**
 * @description F5-API配置表单
 */
import Api from '@api'
export default {
    name: 'F5ConfigForm',
    props: ['form_data', 'type'],
    inject: ['$validator'],
    data () {
        return {
            timeList: [],
            resourceForm: [{key: 'time', value: '时间'}, {key: 'frequency', value: '频次'}],
            rules: {
                require: {
                    required: true
                },
                norequire: {
                    required: false
                }
            }
        }
    },
    created () {
        this.init()
        Api.get('providerSyncTime', {}, true).then(
            res => {
                this.timeList = res
            }
        )
    },
    methods: {
        init () {
            // 根据参数判读创建还是编辑
            if (!this.form_data.name) {
                this.$set(this.form_data, 'name', '')
                this.$set(this.form_data, 'account', [{address: '', user_name: '', password: '', is_master: true}])
                this.$set(this.form_data, 'resource_sync_type', 'time')
                this.$set(this.form_data, 'resource_sync_time', '')
                this.$set(this.form_data, 'resource_sync_frequency', 24)
                this.$set(this.form_data, 'concurrence', 5)
            }

            if (!this.form_data.cloud_type) 
                this.$set(this.form_data, 'cloud_type', 'private')
        },
        /**
         * @description 添加备用账号
         */
        addAccount () {
            let account = {address: '', user_name: '', password: '', is_master: false}
            this.form_data.account.push(account)
        },
        /**
         * @description 删除备用账号
         */
        delAccount (index) {
            this.form_data.account.splice(index + 1, 1)
        },
        /**
         * @description 处理将备用账号设置为主账号
         */
        handleCheck (rst, index) {
            if (rst) {
                let targetMaster = this.form_data.account[index + 1]
                targetMaster.is_master = false
                this.$confirm('F5后端主备设备是否已切换? 请确认', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    targetMaster.is_master = true
                    let srcMaster = this.form_data.account[0]
                    srcMaster.is_master = false
                    this.form_data.account[index + 1] = srcMaster
                    this.form_data.account[0] = targetMaster
                }).catch(() => {
                    targetMaster.is_master = false
                })
            }
        }
    },
    computed: {
        master () {
            return this.form_data.account.find((item, index) => item.is_master && index === 0)
        },
        slaveList () {
            return this.form_data.account.filter(item => !item.is_master)
        },
        groupNameRule () {
            let groupNameRule = {
                required: false
            }

            groupNameRule.required = this.slaveList.length > 0
            return groupNameRule
        }
    }
}
</script>
<style lang="scss" scoped>
.el-form-item{
    margin-bottom: 10px;
}
.slave-list-pane {
    border: 1px solid $borderColor;
}
.account-title {
    background-color: $globalBgColor;
    padding: 5px 10px;
    margin-bottom: 20px;
}
.action-btn {
    position: absolute;
    font-size: 25px;
    margin-left: 25px;
    cursor: pointer;
    &.remove {
        color: $cancelBgColor;
        &:hover {
            color: $fontOrange;  
        }
    }
    &.plus {
        color: $themeColor;
        &.slave-plus {
            margin-left: 68px; 
        }
    }
}
</style>
