<template lang="pug">
    UcmpFormContainer(:breadcrumbItems="breadcrumbItems")
        div(slot="form-content")
            div.billing-container.padding
                //- UCMP-551【运营管理】计费策略中，云主机计费，单项计费，如果规格的名字过长的话，那么就会显示不下，价格框会覆盖一部分。
                //- 解决方法：暂时只能宽带给宽点(考虑到规格长度最长40字符)，超出范围换行显示
                el-form.cost-rule.padding-top.form(size="small" :labelWidth="'200px'")
                    el-form-item.margin-bottom.dynamic-form-item.rw-input.is-required(label="策略名称")
                        el-input(
                            v-model="strategyName"
                            v-validate="rules.strategyName"
                            :name="'strategyName'"
                            placeholder="请输入策略名称"
                            data-vv-as="策略名称"
                            :class="{'input': true, 'is-danger': errors.has('strategyName')}"
                            maxlength="50"
                        )
                        span.validator-error.is-danger(v-if="errors.has('strategyName')") {{ errors.first('strategyName') }}
                    el-form-item.rw-input.is-required.loading-form-item.service-item(label="服务")
                        el-select(v-model="serviceCode"
                            @change="serviceChange"
                            v-validate="'required'"
                            :name="'service_code'"
                            placeholder="请选择服务"
                            data-vv-as="服务"
                            :class="{'input': true, 'is-danger': errors.has('service_code')}"
                            :disabled="isEdit"
                        )
                            el-option(
                                v-for="item in serviceList" :key="item.service_code"
                                :value="item.service_code" :label="item.name"
                            )
                        span.validator-error.is-danger(v-if="errors.has('service_code')") {{ errors.first('service_code') }}
                    el-form-item.rw-input.is-required.loading-form-item.service-item(label="组织机构标识" v-if="isSoftWare")
                        el-select(v-model="orgId"
                            v-validate="'required'"
                            :name="'orgId'"
                            placeholder="请选择组织机构标识"
                            data-vv-as="组织机构标识"
                            :class="{'input': true, 'is-danger': errors.has('orgId')}"
                        )
                            el-option(
                                v-for="item in orgTagList" :key="item.id"
                                :value="item.id" :label="item.name"
                            )
                        span.validator-error.is-danger(v-if="errors.has('orgId')") {{ errors.first('orgId') }}
                    DynamicForm(
                        :labelWidth="'200px'"
                        :labelPosition="'right'"
                        :formItems="formItems"
                        :formData.sync="formData"
                        :uniqueKey="uniqueKey"
                        :keepValueFitDom="keepValueFitDom"
                    )
        div.bill-footer.padding-left(slot="form-footer")
            div.padding-left
                p 备注：1. 实例*单价计算， 如：单价为10元且实例为10个，则累计费用为100元
                p.capi-text 2. 容量*单价计算， 如：单价为1元且容量为100GB, 则累计费用为100元
            div
                el-button(size="small" @click="back") 返回
                el-button(type="warning" size="small" @click="submit" :disabled="submitDisabled") 保存
 </template>

<script>
    /**
     * @description 计费策略
     */
    import Api from '@api'
    import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
    import { mapGetters } from 'vuex'
    import { Validator } from 'vee-validate'
       import Utils from '@server/Utils'
    import metaUtils from '@/server/metadata.utils'
    export default {
        name: 'CostRule',
        $_veeValidate: {
            validator: 'new' // give me my own validator instance.
        },
        data () {
            return {
                id: '',
                type: 'add',
                strategyName: '',
                serviceCode: '',
                orgId: '',
                orgTagList: [],
                formData: {},
                submitDisabled: false,
                formItems: [],
                uniqueKey: 'id',
                keepValueFitDom: true,
                serviceList: [],
                rules: {
                    strategyName: { 
                        required: true, 
                        customRegex: [/^[\u4e00-\u9fa5\w\-]+$/, '策略名称只支持输入字母、数字、汉字、横杠和下划线'], 
                        uniqueRule: true 
                    }
                }
            }
        },
        methods: {
            /**
             * @description 初始化数据定义
             */
            init () {
                this.getProvideDefine()
                this.getOrgIdList()
                this.setValideForm()
                this.type = this.$route.params.id
               
                if (this.isEdit)
                    this.getBillingData()
                else {
                    this.serviceCode = 'ecs'
                    this.updateFormItems()
                }
            },
            /**
             * @description 获取所有计费的服务
             */
            getProvideDefine () {
                Api.get('billingServices', {}, true).then(
                    res => {
                        this.serviceList = res
                    }
                )
            },
            /**
             * @description 获取组织机构标识
             */
            getOrgIdList () {
                Api.get('getOrgTagList', {}, true).then(
                    res => {
                        if (res && res.data)
                            this.orgTagList = res.data.tags || []
                    }
                )
            },
            /**
             * @description 获取计费数据
             */
            getBillingData () {
                Api.get('billingPrice', {id: this.type}).then(
                    res => {
                        this.strategyName = res.strategyName
                        this.serviceCode = res.code
                        this.orgId = res.orgId || ''
                        this.updateFormItems()
                        Object.keys(res.structure).forEach(key => {
                            // 单项计费返回参数处理
                            if (key === 'item_price') {
                                Object.keys(res.structure[key]).forEach(itemKey => {
                                    this.$set(this.formData, `${this.id}@${itemKey}`, res.structure[key][itemKey])
                                })
                            } else
                                this.$set(this.formData, `${this.id}@${key}`, res.structure[key])
                        })
                    }
                )
            },
            serviceChange () {
                this.formData = {}
                this.updateFormItems()
            },
            /**
             * @description 更新表单
             */
            updateFormItems () {
                let id = Utils.uuid()
                this.id = id
                
                let formItems = []
                let metaItem = this.metadata.find(item => item.service_code === this.serviceCode)
                if (metaItem)
                    formItems = JSON.parse(JSON.stringify(metaItem.billing_conf))

                metaUtils.updateAttributeType(formItems, null, id)
                this.formItems = formItems

                if (this.isEdit) return 
                this.formItems.forEach(item => {
                    if (item.data_link && item.data_link.endpoint) {
                        if (!item.data_link.params)
                            this.$set(item.data_link, 'params', {})
                        item.data_link.params = { ...item.data_link.params, ...{service_code: this.serviceCode} }
                    }   
                    if (item.default_value) 
                        this.$set(this.formData, `${id}@${item.key}`, item.default_value)
                })
            },
            /**
             * @description 策略名称添加唯一性校验
             */
            setValideForm () {
                let self = this
                let uniqueRule = {
                    getMessage (field, params, data) {
                        return (data && data.message) || 'program error!'
                    },
                    validate (value) {
                        //修改，禁止校验唯一性
                        if (self.isEdit && (self.strategyName === value))
                            return {valid: true, data: undefined}

                        return Api.post('verifyStrategyNameExist', {strategyName: value}, true).then(
                            res => {
                                return {
                                    valid: !res.result,
                                    data: res.result ? {message: '策略名称重复，请修改'} : undefined
                                }
                            }
                        )
                    }
                }
                Validator.extend('uniqueRule', uniqueRule)
            },
            /**
             * @description 根据类型计费需要返回类型值
             */
            getInstanceType () {
                let instanceType = ''
                let instanceTypeItem = this.formItems.find(item => item.instanceType)
                if (instanceTypeItem)
                    instanceType = this.formData[`${this.id}@${instanceTypeItem.key}`] || ''
                
                return instanceType
            },
            /**
             * @description 格式化请求计费参数
             */
            formatRequestObj () {
                let formData = {
                    code: this.serviceCode, 
                    strategyName: this.strategyName,
                    orgType: this.isSoftWare ? 'org_tag' : '',
                    orgId: this.isSoftWare ? this.orgId : '',
                    orgName: '',
                    instanceType: this.getInstanceType()
                }
                if (this.isEdit)
                   formData.id = this.type
                let formDatas = JSON.parse(JSON.stringify(this.formData))

                formData.structure = {}
                Object.keys(formDatas).forEach(key => {
                    let attrKey = key.split('@')[1] || key
                    // 处理单项计费参数
                    if (attrKey === 'type' && formDatas[key] === '2') {
                        formData.structure[attrKey] = formDatas[key]
                        let typeItem = this.formItems.find(item => item.key === 'type')
                        if (typeItem && typeItem.link && typeItem.link[`link_${formDatas[key]}`]) {
                            formData.structure.item_price = {}
                            typeItem.link[`link_${formDatas[key]}`].forEach(linkKey => {
                                let linkedKey = linkKey.split('@')[1] || linkKey
                                formData.structure.item_price[linkedKey] = formDatas[linkKey]
                                delete formDatas[linkKey]
                            })
                        }
                    } else 
                        formData.structure[attrKey] = formDatas[key]
                })

                return formData
            },
            back () {
                this.$router.push('/cost-rule-mgmt')
            },
            /**
             * @description 保存计费
             */
            submit () {
                this.$validator.validate().then(result => {
                    if (result) {
                        this.submitDisabled = true
                        let formData = this.formatRequestObj()
                        let methedType = this.isEdit ? 'put' : 'post'
                        Api[methedType]('billingPrice', formData, true).then(
                            res => {
                                this.submitDisabled = false
                                let msg = this.isEdit ? '编辑策略成功!' : '添加策略成功!'
                                this.$message({
                                    type: 'success',
                                    message: msg
                                })
                                this.back()
                            }, () => {
                                this.submitDisabled = false
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
            isEdit () {
                return this.$route.params.id !== 'add'
            },
            breadcrumbItems () {
                let label = !this.isEdit ? '添加策略' : '编辑策略'
                return [
                    {prop: '/cost-rule-mgmt', label: '计费策略'},
                    {prop: '', label: label}
                ]
            },
            isSoftWare () {
                let serviceItem = this.metadata.find(item => item.service_code === this.serviceCode)
                return serviceItem && serviceItem.group && serviceItem.group === 'specialty_software'
            },
            ...mapGetters([
                'metadata'
            ])
        },
        components: {
            DynamicForm
        }
    }
</script>

<style lang="scss" scoped>
</style>
<style lang="scss">
.cost-rule {
    .input-width {
        width: 100%!important;
    }
}
</style>
