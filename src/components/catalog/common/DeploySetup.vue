<template lang="pug">
    el-dialog.deploy-setup-dialog(v-if="deployDialogVisible" title="部署配置" :visible.sync="deployDialogVisible" :before-close="close" width="600px")
        div.dialog-content
            el-form(label-width="80px" label-position="right" size="small")
                el-form-item.is-required(label="部署方式")
                    el-radio-group(v-model="deployForm.deploy_type")
                        el-radio(label="manual") 手工
                        el-radio(label="auto") 自动
                el-form-item.is-required(
                    v-if="deployForm.deploy_type === 'auto'"
                    :label="index === 0 ? '部署参数' : ''"
                    v-for="(item, index) in deployForm.deploy_conf"
                    :key="index"
                )
                    div.d-flex
                        div
                            el-select.half-item-width(v-model="item.os_id"
                                v-validate="rules.os"
                                :name="'os_id' + index"
                                placeholder="操作系统"
                                data-vv-as="操作系统"
                                :class="{'input': true, 'is-danger': errors.has('os_id' + index)}"
                                clearable
                            )
                                el-option(v-for="item in osList" :key="item.id" :value="item.id" :label="item.name")
                            span.validator-error.is-danger(v-if="errors.has('os_id' + index)") {{ errors.first('os_id' + index) }}
                        div
                            el-input-number.half-item-width.os-num-formItem(
                                v-model="item.deploy_num"
                                :min="1"
                                v-validate="rules.require"
                                :name="'deploy_num' + index"
                                :data-vv-as="'数量'"
                                :class="{'is-danger': errors.has('deploy_num' + index)}"
                                clearable
                            )
                            span.validator-error.is-danger.osnum-error(v-if="errors.has('deploy_num' + index)") {{ errors.first('deploy_num' + index) }}
                        i.deploy-btn.remove(class="ucmp-icon-delete" v-if="deployForm.deploy_conf.length !== 1" size="small" type="primary" @click="deleteOsList(index)")
                        i.deploy-btn.plus(class="ucmp-icon-plus" v-if="index === deployForm.deploy_conf.length - 1"
                            size="small" type="primary" @click="addOsList"
                        )
        div.dialog-footer(slot="footer")
            el-button(@click="close" size="small") 取消
            el-button(type="primary" @click="save" size="small") 确定
</template>
<script>
/**
 * 部署配置-组件
 */
import Api from '@api'
import { Validator } from 'vee-validate'
export default {
    name: 'DeploySetup',
    inject: ['$validator'],
    props: {
        deployDialogVisible: {
            type: Boolean,
            default: () => false
        },
        serviceCode: {
            type: String,
            default: () => ''
        }
    },
    data () {
        return {
            osList: [],
            deployData: {},
            deployForm: {
                deploy_type: 'manual',
                deploy_conf: []
            },
            rules: {
                os: {
                    required: true,
                    uniqueRule: true 
                },
                require: {
                    required: true
                }
            }
        }
    },
    created () {
        this.getSystemList()
        this.getDeployConf()
        this.setValideForm()
    },
    methods: {
        /**
         * @description 获取操作系统列表
         */
        getSystemList () {
            Api.get('systemOs', { offset: 0, limit: 9999 }, true).then(
                res => {
                    this.osList = res.list.map(item => {
                        return {
                            id: item.id,
                            name: item.name
                        }
                    })
                }
            )
        },
        /**
         * @description 获取配置信息
         */
        getDeployConf () {
            Api.get('deployConf', { serviceCode: this.serviceCode }, true).then(
                res => {
                    this.deployData = res
                    if (res.deploy_type) 
                        this.deployForm.deploy_type = res.deploy_type
                    if (res.attribute && res.attribute[0].default_value) {
                        let deploy_conf = JSON.parse(res.attribute[0].default_value)
                        if (deploy_conf.length)
                            this.deployForm.deploy_conf = deploy_conf
                        else 
                            this.addOsList()
                    }
                }
            )
        },
        /**
         * @description 对话框-关闭事件
         */
        close () {
            this.$emit('closeDeployDialog')
        },
        /**
         * @description 对话框-确定事件
         */
        save () {
            this.$validator.validate().then(result => {
                if (result) {
                    this.deployData.deploy_type = this.deployForm.deploy_type
                    if (this.deployData.deploy_type === 'auto')
                        this.deployData.attribute[0].default_value = JSON.stringify(this.deployForm.deploy_conf)
                    let params = {...{ serviceCode: this.serviceCode }, ...this.deployData}
                    Api.put('deployConf', params, true).then(
                        res => {
                            this.$notify.success('修改部署配置操作成功!')
                            this.close()
                        }
                    )
                }
            })
        },
        /**
         * @description 对话框-添加操作系统项
         */
        addOsList () {
            this.deployForm.deploy_conf.push({os_id: '', deploy_num: 1})
        },
        /**
         * @description 对话框-删除操作系统项
         */
        deleteOsList (index) {
            this.deployForm.deploy_conf.splice(index, 1)
        },
        /**
         * @description 操作系统添加唯一性校验
         */
        setValideForm () {
            let self = this
            let uniqueRule = {
                getMessage (field, params, data) {
                    return (data && data.message) || 'program error!'
                },
                validate (value) {
                    let sameOsTypes = self.deployForm.deploy_conf.filter(item => item.os_id === value)
                    let isHasOsType = sameOsTypes.length > 1
                    if (value && isHasOsType)
                        return {valid: false, data: {message: '操作系统重复，请重新选择!'}}
                    else 
                        return {valid: true, data: undefined}
                }
            }
            Validator.extend('uniqueRule', uniqueRule)
        }
    }
}
</script>
<style lang="scss" scoped>
.deploy-setup-dialog {
    .half-item-width {
        width: 160px;
    }
    .osnum-error {
        margin-left: 20px;
    }
    .dialog-content {
        max-height: 400px;
        overflow-y: auto;
    }
    .os-num-formItem {
        margin-left: 20px;
    }
    .deploy-btn {
        height: 32px;
        line-height: 32px;
        color: #ffffff;
        font-size: 20px;
        cursor: pointer;
        margin-left: 20px;
        border-radius: 5px;
        padding: 0 4px;
    }
    .remove {
        background-color: $themeColor;
        border: none;
        background: #ddd;
        color: #333;
        &:hover {
            background: orange;
            color: #fff;
        }
    }
    .plus {
        background-color: $themeColor;
    }
}
</style>
