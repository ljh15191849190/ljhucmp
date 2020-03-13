<template lang="pug">
    UcmpFormContainer(:breadcrumbItems="breadcrumbItems")
        div.config-temp-continer(slot="form-content")
            el-form.allocate-form.is-large.padding(label-width="120px" label-position="right" size="small")
                el-form-item.rw-input.is-required(:label="`${systemConfig.configure_template}名称`")
                    el-input(
                        v-model="configTemForm.template_name"
                        v-validate="rules.template_name"
                        :name="'template_name'"
                        :placeholder="`请输入${systemConfig.configure_template}名称`"
                        :data-vv-as="`${systemConfig.configure_template}名称`"
                        :class="{'input': true, 'is-danger': errors.has('template_name')}"
                        maxlength="20"
                    )
                    span.validator-error.is-danger(v-if="errors.has('template_name')") {{ errors.first('template_name') }}
                el-form-item.rw-input.is-required(label="组织机构")
                    Org-Tree.form-width(
                        v-if="orgList.length"
                        v-model="configTemForm.org_names"
                        v-validate="'required'"
                        :name="'org_ids'"
                        :placeholder="'请选择组织机构'"
                        data-vv-as="组织机构"
                        :isDanger="errors.has('org_ids')"
                        :defaultProps="defaultProps"
                        :treeData="orgList"
                        :selectNodes.sync="configTemForm.org_ids"
                    )
                    span.validator-error.is-danger(v-if="errors.has('org_ids')") {{ errors.first('org_ids') }}
                div.line
                el-form-item.rw-input.is-required.loading-form-item.service-item(label="服务")
                    el-select(v-model="configTemForm.service_code"
                        @change="serviceChange"
                        v-validate="'required'"
                        :name="'service_code'"
                        placeholder="请选择服务"
                        data-vv-as="服务"
                        :class="{'input': true, 'is-danger': errors.has('service_code')}"
                        v-loading="loading.service"
                        :disabled="loading.service"
                    )
                        el-option(
                            v-for="item in serviceList" :key="item.service_code"
                            :value="item.service_code" :label="item.service_name"
                        )
                    span.validator-error.is-danger(v-if="errors.has('service_code')") {{ errors.first('service_code') }}
                el-form-item.rw-input.is-required.loading-form-item(label="云厂商")
                    el-select(v-model="configTemForm.provider_id"
                        @change="providerChange"
                        v-validate="'required'"
                        :name="'provider_id'"
                        placeholder="请选择云厂商"
                        data-vv-as="云厂商"
                        :class="{'input': true, 'is-danger': errors.has('provider_id')}"
                        v-loading="loading.provider"
                        :disabled="loading.provider"
                    )
                        el-option(
                            v-for="item in providerList" :key="item.provider_id" :value="item.provider_id" :label="item.provider_name"
                        )
                    span.validator-error.is-danger(v-if="errors.has('provider_id')") {{ errors.first('provider_id') }}
                DynamicForm(
                    v-if="formItmes"
                    :formItems="formItmes"
                    :formData.sync="configTemForm.configure"
                    :labelPosition="'right'"
                    :showLinkedItemKeys="showLinkedItemKeys"
                )
        div(slot="form-footer")
            el-button(@click="goBack" size="small") 返回
            el-button(type="warning" size="small" @click="submitForm" :disabled="submitDisabled") 保存
</template>
<script>
/**
 * @description 新建、修改配置模板
 */
import Api from '@api'
import {mapGetters} from 'vuex'
import { Validator } from 'vee-validate'
import OrgTree from '@common/OrgTree'
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
export default {
    name: 'configTemplate',
    $_veeValidate: {
        validator: 'new'
    },
    components: {OrgTree, DynamicForm},
    data () {
        return {
            breadcrumbItems: [
                {prop: '/config-template', label: '配置模板'},
                {prop: '', label: '创建配置模板'}
            ],
            submitDisabled: false,
            orgList: [],
            template_id: '',
            serviceList: [],
            providerList: [],
            formItmes: null,
            configTemForm: {
                template_name: '',
                service_code: '',
                provider_id: '',
                configure: {},
                org_ids: [],
                org_names: ''
            },
            loading: {
                service: true,
                provide: true
            },
            rules: {
                template_name: { 
                    required: true, 
                    customRegex: [/^[\u4e00-\u9fa5\w\-]+$/, '模板名称只支持输入字母、数字、汉字、横杠和下划线'], 
                    uniqueRule: true 
                }
            },
            defaultProps: {
                id: 'id',
                parentId: 'parent_id',
                children: 'sub_orgs',
                label: 'org_name'
            },
            uniqueKey: 'key',
            linkedKeyAttrs: [],
            template_name: ''
        }
    },
    methods: {
        initSystemConfig () {
            this.breadcrumbItems[0].label = this.systemConfig.configure_template
            this.breadcrumbItems[1].label = `创建${this.systemConfig.configure_template}`
        },
        init () {
            this.template_id = this.$route.params.id
            this.initSystemConfig()
            this.setBreadcrumbItems()
            this.getOrgList()
            this.getProvideDefine()
            this.setValideForm()
            this.getCigTempDetail()
        },
        /**
         * @description 获取组织机构
         */
        getOrgList () {
            Api.get('orgTree', {}, true).then(
                res => {
                    this.orgList = res.data
                }
            )
        },
        /**
         * @description 设置面板显示
         */
        setBreadcrumbItems () {
            if (!this.isEdit) return
            this.breadcrumbItems[1].label = `修改${this.systemConfig.configure_template}`
        },
        /**
         * @description 配置名称添加唯一性校验
         */
        setValideForm () {
            let self = this
            let uniqueRule = {
                getMessage (field, params, data) {
                    return (data && data.message) || 'program error!'
                },
                validate (value) {
                    //修改，禁止校验唯一性
                    if (self.isEdit && (self.template_name === value))
                        return {valid: true, data: undefined}

                    return Api.get('verifyTemplateExist', {template_name: value}, true).then(
                        res => {
                            return {
                                valid: res.valid,
                                data: !res.valid ? {message: '配置模板名称重复，请修改'} : undefined
                            }
                        }
                    )
                }
            }
            Validator.extend('uniqueRule', uniqueRule)
        },
        /**
         * @description 获取所有厂商配置的服务
         */
        getProvideDefine () {
            Api.get('cfgProviderDefine', {}, true).then(
                res => {
                    this.loading.service = false
                    this.serviceList = res
                }, () => {
                    this.loading.service = false
                }
            )
        },
        /**
         * @description 获取配置模板详情
         */
        getCigTempDetail () {
            if (!this.isEdit) return
            Api.get('configTemplate', {template_id: this.template_id}, true).then(
                res => {
                    this.template_name = res.template_name
                    this.configTemForm.template_name = res.template_name
                    this.configTemForm.service_code = res.service_code
                    this.configTemForm.provider_id = res.provider_id
                    this.configTemForm.configure = res.configure
                    this.configTemForm.org_ids = res.orgs
                    this.getProvidesByService()
                }
            )
        },
        /**
         * @description 服务类型选择改变
         */
        serviceChange () {
            this.configTemForm.provider_id = ''
            this.configTemForm.configure = {}
            this.formItmes = []
            this.getProvidesByService()
        },
        /**
         * @description 通过服务code获取云厂商
         */
        getProvidesByService () {
            Api.get('cfgTemplateProviders', {service_code: this.configTemForm.service_code}, true).then(
                res => {
                    this.loading.provide = false
                    this.providerList = res
                    if (this.isEdit)
                        this.providerChange()
                }, () => {
                    this.loading.provide = false
                }
            )
        },
        /**
         * @description 云厂商选择改变
         */
        providerChange () {
            //获取云厂商code
            let provider_code = this.configTemForm.provider_id ? (this.providerList.find(item => item.provider_id === this.configTemForm.provider_id).provider_code || '') : ''

            // ucmp3-4998 template=true 返回的是不再配置模板出现而在审批时填写的参数
            Api.get('cfgTemplateDefines', {template: true, service_code: this.configTemForm.service_code, provider_code: provider_code}, true).then(
                res => {
                    this.formItmes = res.attribute
                    this.handleFormItems()
                }
            )
        },
        /**
         * @description 处理formItems
         */
        handleFormItems () {
            if (!this.formItmes || !this.formItmes.length) return
            this.linkedKeyAttrs = []
            let copiedData = { provider_id: this.configTemForm.provider_id }
            this.formItmes.forEach(attrItem => {
                if (attrItem.data_link && attrItem.data_link.endpoint) {
                    if (!attrItem.data_link.params)
                        this.$set(attrItem.data_link, 'params', {})
                    // 满足需要云厂商id的接口动态添加参数
                    attrItem.data_link.params = { ...attrItem.data_link.params, ...copiedData }
                }
                // 处理校验-(模板这里都是非必填)
                if (attrItem.validation && attrItem.validation.required)
                    attrItem.validation.required = false
                if (attrItem.required)
                    attrItem.required = false
                if (attrItem.attached_attrs && attrItem.attached_attrs.attribute) {
                    attrItem.attached_attrs.attribute.forEach(attacheAttr => {
                        if (attacheAttr.validation && attacheAttr.validation.required)
                            attacheAttr.validation.required = false
                    })
                }
                //处理lined true
                if (attrItem.link)
                    this.linkedKeyAttrs.push(attrItem)
            })
        },
        /**
         * @description 返回列表
         */
        goBack () {
            this.$router.push('/config-template')
        },
        /**
         * @description 保存
         */
        submitForm () {
            this.$validator.validate().then(result => {
                if (result) {
                    this.submitDisabled = true

                    let payload = JSON.parse(JSON.stringify(this.configTemForm))
                    delete payload.org_names
                    delete payload.configure.provider_id
                    if (this.isEdit) {
                        payload.template_id = this.template_id
                        Api.put('configTemplate', payload, true).then(
                            res => {
                                this.submitDisabled = false
                                this.$message({
                                    type: 'success',
                                    message: `配置模板: ${payload.template_name} 修改成功!`
                                })
                                this.goBack()
                            }, () => {
                                this.submitDisabled = false
                            }
                        )
                    } else {
                        Api.post('configTemplate', payload, true).then(
                            res => {
                                this.submitDisabled = false
                                this.$message({
                                    type: 'success',
                                    message: `配置模板: ${payload.template_name} 创建成功!`
                                })
                                this.goBack()
                            }, () => {
                                this.submitDisabled = false
                            }
                        )
                    }
                }
            })
        }
    },
    created () {
        this.init()
    },
    computed: {
        isEdit () {
            return this.$route.params.id !== 'add'
        },
        showLinkedItemKeys () {
            let showLinkedKeys = []
            this.linkedKeyAttrs.forEach(linkeAttr => {
                let formItemData = this.configTemForm.configure[linkeAttr[this.uniqueKey]]
                if (formItemData && linkeAttr['link']['link_' + formItemData])
                    showLinkedKeys = [...showLinkedKeys, ...linkeAttr['link']['link_' + formItemData]]
            })
            return showLinkedKeys
        },
        ...mapGetters([
            'systemConfig'
        ])
    },
    watch: {
        'configTemForm.provider_id' (newVal, oldVal) {
            this.$set(this.configTemForm.configure, 'provider_id', newVal)
        },
        // 配置模板中Oracle_pass 选择配置类型切换问题 三级联动
        'configTemForm.configure.config_type' (val) {
            if (val === 'admin') {
                delete this.configTemForm.configure.server_pool
                delete this.configTemForm.configure.server_pool_name
                delete this.configTemForm.configure.cardinality
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.config-temp-continer {
    position: relative;
    width: 100%;
    .line {
        position: absolute;
        width: 100%;
        height: 1px;
        left: 0px;
        background-color: $borderColor;
    }
    .service-item {
        margin-top: 30px;
    }
}
</style>
