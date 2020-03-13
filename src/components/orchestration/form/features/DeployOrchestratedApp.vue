<template lang="pug">
div.order-form
    el-form(:model="form" ref="ruleForm" label-width="100px" size="small")
        el-form-item.is-required.rw-input(label="编排名称" prop="name")
            el-input(
                v-model="form.name"
                v-validate="rules.bp_name"
                name="bp_name"
                data-vv-as="编排名称"
                :class="{'is-danger': errors.has('bp_name')}"
            )
            span.validator-error.is-danger(v-if="errors.has('bp_name')") {{ errors.first('bp_name') }}
        el-form-item.is-required.rw-input(label="编排编码" prop="service_code")
            el-input(
                v-model="form.service_code"
                :disabled="ifEdit"
                v-validate="rules.service_code"
                name="service_code"
                data-vv-as="编排编码"
                :class="{'is-danger': errors.has('service_code')}")
                span(v-if="!ifEdit" slot="prefix") bp_
            span.validator-error.is-danger(v-if="errors.has('service_code')") {{ errors.first('service_code') }}
        el-form-item.rw-input(label="描述" prop="description")
            el-input(
                v-model="form.description"
                type="textarea"
                v-validate="rules.description"
                name="description"
                data-vv-as="描述"
                maxlength="110"
                placeholder="最多110个字符"
                :class="{'is-danger': errors.has('description')}")
            span.validator-error.is-danger(v-if="errors.has('description')") {{ errors.first('description') }}
        el-form-item.rw-input(label="编排icon" prop="name")
            EditBlueprintIcon(:checkedIcon.sync="form.icon")
        InstanceOwner.business-form-body(:resourceOwner.sync="resourceOwner")
        OrderConfirm(:orderForm="orderForm")
        el-form-item.is-required.rw-input(label="租期" prop="expired_at" v-if="tenancy.available")
            el-date-picker(
                v-model="form.expired_at"
                type="date"
                placeholder="选择租期"
                value-format="timestamp"
                :editable="1 === 2"
                :picker-options="expiredAtOptions"
                v-validate="rules.expired_at"
                name="expired_at"
                data-vv-as="租期"
                :class="{'is-danger': errors.has('expired_at')}"
            )
            span.validator-error.is-danger(v-if="errors.has('expired_at')") {{ errors.first('expired_at') }}
        el-form-item.rw-input
            el-button(size="small" @click="quit") 取消
            el-button(size="small" type="primary" @click="submit" :disabled="submitDisabled") 确定
</template>
<script>
import Api from '@api'
import EditBlueprintIcon from './EditBlueprintIcon'
import OrderConfirm from '@/components/catalog/common/OrderConfirm'
import InstanceOwner from '@/components/catalog/common/InstanceOwner'
import DefaultAttributes from '@mock/metadata/blueprint.attributes'
import Utils from '@server/Utils'
import MetadataUtils from '@server/metadata.utils'
import BLUEPRINTACTIONS from '@mock/metadata/blueprint.actions'
import { Validator } from 'vee-validate'
import { mapActions, mapGetters } from 'vuex'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    props: ['resources', 'dialogVisible', 'ifEdit', 'blueInfo'],
    data () {
        return {
            form: {
                name: '',
                icon: '',
                service_code: '',
                group: 'blueprint',
                expired_at: null
            },
            copied_service_code: null,
            orderForm: {
                urgency_level: 'low',
                expected_time: '',
                memo: ''
            },
            rules: {
                bp_name: { required: true, customRegex: [/^[\w\-\u4e00-\u9fa5]{1,100}$/, '编排名称支持英文大小写字符、数字、 -、 _以及中文字符，最多不能超过100个字符'] },
                service_code: { required: true, max: 50, customRegex: [/^[a-zA-Z_]+[\w]*$/, '编排编码支持英文大小写、数字以及 _ ，首个字符不能为数字'], uniqueRule: true },
                expired_at: { required: true },
                description: { max: 110 }
            },
            resourceOwner: {
                owner_type: '',
                owner: null,
                resource_pool_id: ''
            },
            order_code: '',
            uniqueRule: null,
            submitDisabled: false,
            expiredAtOptions: {
                disabledDate (time) {
                    return time.getTime() < Date.now()
                }
            }  // UCMP-406 今日之前的日期不让点击
        }
    },
    methods: {
        ...mapActions([
            'setMetaData',
            'updateMetaData',
            'getTenancy'
        ]),
        quit () {
            this.$emit('update:dialogVisible', false)
        },

        deploy (resources) {
            // 如果租期不显示，提交表单去除租期信息
            let formData = JSON.parse(JSON.stringify(this.formData))

            let depolyResources = this.handleDepolyNasData(JSON.parse(JSON.stringify(resources.resources)))

            Object.values(formData.order_item[0].data.resources)[0].resources = depolyResources
            Object.values(formData.order_item[0].data.resources)[0].dependencies = resources.dependencies
            if (!this.tenancy.available) {
                formData.order_item.forEach(
                    item => {
                        delete item.service_item.expired_at
                    }
                )
            }
            Api.post('order', formData, true).then(
                res => {
                    this.$notify.success('资源申请操作成功')
                    this.$emit('confirmClose')
                    this.$emit('update:dialogVisible', false)
                    this.$router.push('/orders')
                }, () => {
                    this.$notify.error('资源申请操作失败')
                }
            )
        },

        /**
         * @description 校验编排编码唯一性
         */
        checkServiceCode (rule, value, callback) {
            // 更新模式，禁止校验唯一性
            if (this.ifEdit) {
                callback()
                return
            }

            let service_code = this.ifEdit ? value : `bp_${value}`
            // UCMP3-1558 蓝图部署时蓝图编码默认添加 bp_ 作为起始字符
            Api.get('getMetadata', {_code: 'blueprint/service_code_check', service_code: service_code}, true).then(
                res => {
                    if (!res.result)
                        callback(new Error('编排编码已经存在，请修改'))
                    else
                        callback()
                }
            )
        },

        submit () {
            this.$validator.validate().then(
                valid => {
                    if (valid) {
                        let resources = JSON.parse(JSON.stringify(this.resources))

                        // 编排添加默认normal_actions
                        let _normalActions = {}

                        BLUEPRINTACTIONS && BLUEPRINTACTIONS.forEach(
                            action => {
                                _normalActions[action.key] = action
                            }
                        )
                        let data = Object.assign(resources,
                            {
                                service_code: this.ifEdit ? this.form.service_code : `bp_${this.form.service_code}`,
                                _code: 'blueprint',
                                group: 'blueprint',
                                tenancy: true,
                                applicable: true,
                                icon: this.form.icon,
                                name: this.form.name,
                                description: this.form.description,
                                normal_actions: _normalActions,
                                resource_owner: ['app', 'org'], // 默认资源归属为[应用/组织机构],需要自定义后期可在服务定义中修改
                                actions: [
                                    {
                                        description: '租期续期',
                                        enabled: true,
                                        label: '续期',
                                        name: 'renewal',
                                        instance_max_count: 1
                                    },
                                    {
                                        description: '修改资源所属',
                                        enabled: true,
                                        label: '修改资源所属',
                                        name: 'modify_resource_belong',
                                        is_approve: true 
                                    }

                                ],
                                orchestrate: true, // UCMP-1117 应用编排资源列表过滤条件
                                attribute: DefaultAttributes,
                                text_field: 'name',
                                value_field: 'service_instance_id',
                                name_field: 'name'
                            }
                        )
                        // bug UCMP-1292【应用编排】新建编排点击立即部署，报错错误之后修改，确定按钮不可再点。
                        // 校验通过后再置灰按钮,否则校验未通过后就不可再点击
                        let tipLabel = this.ifEdit ? '更新' : '保存'
                        let requestMethod = this.ifEdit ? 'put' : 'post'
                        this.submitDisabled = true
                        Api[requestMethod]('getMetadata', data, true).then(
                            res => {
                                if (res) {
                                    this.$message.success(`${tipLabel}编排` + this.form.name + '成功，开始部署编排资源...')
                                    // 编排信息更新/创建成功之后同步元数据进行修改
                                    this.setMetaData([])
                                    // 获取 metadata列表信息
                                    Api.get('getBasicMetadata', {}, true).then(
                                        metas => {
                                            let metadata = metas.map(
                                                item => {
                                                    return item.metadata
                                                }
                                            )
                                            this.setMetaData(metadata)
                                            this.updateMetaData(res)
                                        }
                                    )

                                    this.deploy(res)
                                }
                            },
                            () => {
                                this.submitDisabled = false
                                this.$message.error(`${tipLabel}编排` + this.form.name + '失败')
                            }
                        )
                    }
                }
            )
        },

        // 在部署时将nas相关申请单内的nas_name字段中的${short}字段进行替换更新
        handleDepolyNasData (insResources) {
            let shortName = ''
            if (this.resourceOwner.owner && this.resourceOwner.owner.short)
                shortName = this.resourceOwner.owner.short
            let regParams = {short: shortName}
            Object.keys(insResources).forEach(item_res_id => {
                Object.keys(insResources[item_res_id]).forEach(item_key => {
                    if (item_key === 'attributes' || item_key === 'display') {
                        Object.keys(insResources[item_res_id][item_key]).forEach(
                            param_key => {
                                if (typeof insResources[item_res_id][item_key][param_key] === 'string')
                                    insResources[item_res_id][item_key][param_key] = MetadataUtils.getDependenciesByFormatter(insResources[item_res_id][item_key][param_key], regParams)
                            }
                        )
                    }
                })
            })

            return insResources
        }
    },

    computed: {
        ...mapGetters([
            'tenancy'
        ]),

        formData () {
            let bp_id = Utils.uuid()
            let resources = {
                [bp_id]: {
                    attributes: { name: this.form.name },
                    display: { name: this.form.name },
                    group: 'blueprint',
                    id: bp_id,
                    reference: '',
                    service_code: this.ifEdit ? this.form.service_code : `bp_${this.form.service_code}`
                }
            }

            let owner = ''
            if (this.resourceOwner.owner_type === 'app')
                owner = this.resourceOwner.owner.id
            else if (this.resourceOwner.owner_type === 'org')
                owner = this.resourceOwner.owner.id

            let configParams = {
                _action: 'create',
                _service_code: this.ifEdit ? this.form.service_code : `bp_${this.form.service_code}`,
                order_item: [{
                    owner,
                    owner_type: this.resourceOwner.owner_type,
                    count: 1,
                    service_item: {expired_at: this.form.expired_at},
                    data: Object.assign({resources}, {service_code: this.ifEdit ? this.form.service_code : `bp_${this.form.service_code}`, group: 'blueprint', resource_pool_id: this.resourceOwner.resource_pool_id})
                }]
            }
            return { ...configParams, ...this.orderForm }
        }
    },

    created () {
        this.getTenancy()
        if (this.ifEdit) {
            this.form.name = this.blueInfo.name
            this.form.icon = this.blueInfo.icon
            this.form.service_code = this.blueInfo.service_code
            this.form.description = this.blueInfo.description
            this.copied_service_code = this.blueInfo.service_code
        }
        let self = this
        this.uniqueRule = {
            getMessage (field, params, data) {
                return (data && data.message) || 'Something went wrong'
            },
            validate (value) {
                // 更新模式，禁止校验唯一性
                if (self.ifEdit && self.copied_service_code === value)
                    return {valid: true, data: undefined}

                let service_code = self.ifEdit ? value : `bp_${value}`
                return Api.get('getMetadata', {_code: 'blueprint/service_code_check', service_code: service_code}, true).then(
                    res => {
                        return {
                            valid: res && res.result,
                            data: res && res.result ? undefined : {message: '编排编码重复，请修改'}
                        }
                    }
                )
            }
        }
        Validator.extend('uniqueRule', this.uniqueRule)
    },

    components: {
        OrderConfirm,
        InstanceOwner,
        EditBlueprintIcon
    }
}
</script>
<style lang="scss" scoped>

</style>
