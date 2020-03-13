<template lang="pug">
    div.provider-conf-container
        div.config-form-title 厂商信息
        CfgTemplateDialog.cfg-template(
            :providerId="currentResProviderId"
            :service_code="resource.info.service_code"
            :org_id="org_id"
            position="left"
            :disabled="!editPrivilege"
            @selectTemplate="selectTemplate($event, resource.id)"
        )
        DynamicForm(
            ref="dynamicForm"
            :formItems="combinedFormItems"
            :formData.sync="formData[resource.id].formData"
            :display.sync="formData[resource.id].display"
            uniqueKey="id"
            labelPosition="top"
            :keepValueFitDom="keepValueFitDom"
            :externalFormData="computeMoreFormData(resource.id)"
            :disableValidate="disableValidate"
            @focusWidget="focusWidget"
        )
</template>
<script>
/**
 * @description 蓝图服务审批环节厂商信息表单
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import CfgTemplateDialog from '@/components/iaas/configTemplate/CfgTemplateDialog'
import { mapGetters } from 'vuex'
import metaUtils from '@/server/metadata.utils'

export default {
    inject: ['$validator'],
    props: {
        formData: {
            type: Object,
            default: {}
        },

        providerCodeData: {
            type: Object,
            default: function () {
                return {}
            }
        },

        resource: {
            type: Object,
            default: {}
        },

        externalFormData: {
            type: Object,
            default: {}
        },

        initProviderInfo: {
            type: Object,
            default: function () {
                return {}
            }
        },
        org_id: {
            type: String,
            default: ''
        },
        allResources: {
            type: Array,
            default: () => []
        },
        
        editPrivilege: {
            type: Boolean,
            default: () => false
        },
        disableValidate: Boolean
    },
    data () {
        return {
            formItems: [],
            keepValueFitDom: true,
            provider_code: null
        }
    },

    methods: {
        focusWidget () {
            this.$emit('focusWidget', this.resource.id)
        },

        /**
         * @description 初始化表单的厂商配置值
         */
        initFormData () {
            if (this.resource.id && this.formData && !this.formData[this.resource.id]) {
                let formData = {
                    formData: {}, display: {}
                }
                this.$set(this.formData, this.resource.id, formData)
            }
        },

        /**
         * @description 根据已有provider_id查找对应的provider_code 
         * @description a. 初始化当前组件并且拿到 provider_id 后使用；b. 切换厂商后使用
         */
        findCurrentProviderCode () {
            if (!this.currentResProviderId || !this.$refs.dynamicForm || !this.$refs.dynamicForm.$refs || !this.$refs.dynamicForm.$refs[this.resource.id + '@provider_id'])
                return
            
            let providerList = this.$refs.dynamicForm.$refs[this.resource.id + '@provider_id'][0].list

            if (!providerList || !Array.isArray(providerList) || !providerList.length) return
            this.providerCodeData[this.resource.id] = providerList.filter(provider => { return provider.provider_id === this.currentResProviderId })[0].provider_code
        },

        /**
         * @description 初始化组件时初始化 厂商code 内容
         */
        initProviderCode () {
            if (this.resource.id && this.providerCodeData && !this.providerCodeData[this.resource.id])
                this.$set(this.providerCodeData, this.resource.id, '')
            
            if (this.currentResProviderId) {
                let interval = setInterval(() => {
                    this.findCurrentProviderCode()
                    if (this.providerCodeData[this.resource.id])
                        clearInterval(interval)
                }, 100)
            }
        },

        /**
         * @description 根据蓝图的层级关系找到当前资源节点的根节点
         */
        findRelatedRootNode () {
            let allResourcesObj = {}
            let rootNode = null

            this.allResources.forEach(res => { allResourcesObj[res.id] = res })
            function findRootNode (_) {
                if (!_.pId || _.pId === 'null')
                    rootNode = _
                else
                    findRootNode(allResourcesObj[_.pId])
            }
            findRootNode(this.resource)
            if (!rootNode) return []

            this.$emit('getDescendants', rootNode.id, this.initProviderInfoByIds)
        },

        /**
         * @description 给指定的ids(资源节点)设置厂商信息
         */
        initProviderInfoByIds (ids) {
            let allResourcesObj = {}
            this.allResources.forEach(res => { allResourcesObj[res.id] = res })
            ids.forEach(
                id => {
                    let checkedMeta = this.metadata.find(metaItem =>
                     metaItem.service_code === allResourcesObj[id].info.service_code
                    )
                    if (id === this.resource.id || !checkedMeta.provider_conf) return
                    this.initRelatedResProviderByCur(id)
                }
            )
        },

        /**
         * @description 把当前资源的厂商信息赋值给指定的资源，保障有嵌套关系的资源厂商保持一致(如 ecs|volume, f5|pool)
         */
        initRelatedResProviderByCur (targetResId) {
            if (this.formData[targetResId].formData[targetResId + '@provider_id'] === this.currentResFormData.formData[this.resource.id + '@provider_id'])
                return
            
            let providerList = this.$parent.$parent.$parent.$refs['providerForm' + targetResId][0].$refs.dynamicForm.$refs[targetResId + '@provider_id'][0].list
            if (!providerList || !Array.isArray(providerList)) return
            let prevProviderCode = this.formData[targetResId].formData[targetResId + '@provider_id'] ? providerList.filter(provider => { return provider.provider_id === this.formData[targetResId].formData[targetResId + '@provider_id'] })[0].provider_code
                : null
            // 当前资源的厂商code 与 指定资源的厂商code不一致时，需要将指定资源的provider_conf信息清空
            if (prevProviderCode !== this.providerCodeData[this.resource.id])
                this.destroyFormData(targetResId)
            this.$set(this.formData[targetResId].formData, targetResId + '@provider_id', this.currentResFormData.formData[this.resource.id + '@provider_id'])
        },

        /**
         * @description 切换厂商后，动态变化对应的formitems 以及表单值
         */
        updateFormItems (provider_id) {
            this.findCurrentProviderCode()
            if (!this.providerCodeData[this.resource.id]) return

            let providerConfs = this.serviceMetadata.provider_conf[this.providerCodeData[this.resource.id]]
            if (!providerConfs || !providerConfs.attribute)
                return
            let formItmes = JSON.parse(JSON.stringify(providerConfs.attribute))
            metaUtils.updateAttributeType(formItmes, null, this.resource.id)

            let copiedData = { provider_id }

            formItmes.forEach(attrItem => {
                // UCMP3-2640 当前用户没有修改该服务的权限
                if (!this.editPrivilege)
                    attrItem.disabled = true
                if (attrItem.data_link && attrItem.data_link.endpoint) {
                    !attrItem.data_link.params && this.$set(attrItem.data_link, 'params', {})
                    // 满足需要云厂商id的接口动态添加参数
                    attrItem.data_link.params = { ...attrItem.data_link.params, ...copiedData }
                }
                //处理子网的org_id
                if (attrItem.attached_attrs && attrItem.attached_attrs.attribute) {
                    let orgParam = {org_id: this.org_id}
                    attrItem.attached_attrs.attribute.forEach(attachedAttr => {
                        if (attachedAttr.data_link && attachedAttr.data_link.endpoint) {
                            if (!attachedAttr.data_link.params)
                                this.$set(attachedAttr.data_link, 'params', {})
                            attachedAttr.data_link.params = { ...attachedAttr.data_link.params, ...orgParam }
                        }
                        attachedAttr.disabled = !!attrItem.disabled
                    })
                }
                
                attrItem.dependencies && attrItem.dependencies.indexOf('provider_id') !== -1 && attrItem.dependencies.forEach(
                    dependency => {
                        if (dependency === 'provider_id')
                            dependency = 'provider_id.provider_id'
                    }
                )

                // UCMP3-7111 配置模板只能通过模板填充
                if (this.resource.template_immutable)
                    attrItem.disabled = true
            })
            
            this.formItems = formItmes
            this.findRelatedRootNode()
        },

        /**
         * @description 初始化厂商以及对应formitems 的值：厂商没有选择，只做初始化参数；如果厂商被选择，需要找到对应的provider_code并更新formitems
         */
        initProviderInfoFunc () {
            let formData = {}, display = {}
            Object.keys(this.currentInitProviderInfo).forEach(
                key => {
                    formData[this.resource.id + '@' + key] = this.currentInitProviderInfo[key]
                    display[this.resource.id + '@' + key] = this.currentInitProviderInfo[key]
                }
            )
            this.$set(this.formData, this.resource.id, {formData, display})
            
            if (formData[this.resource.id + '@provider_id']) {
                let interval = setInterval(() => {
                    this.updateFormItems(formData[this.resource.id + '@provider_id'])                    
                    if (this.providerCodeData[this.resource.id])
                        clearInterval(interval)
                }, 100)
            }
        },

        /**
         * @description 选择配置模板的回调事件，将当前资源的厂商信息重新赋值
         */
        selectTemplate (obj, resourceId) {
            // 告诉父组件，开始初始化厂商信息
            this.$emit('startInitForm', resourceId)
            this.destroyFormData(this.resource.id)
            if (!this.formData[this.resource.id].formData[resourceId + '@provider_id'])
                this.$set(this.formData[this.resource.id].formData, resourceId + '@provider_id', null)
            this.formData[this.resource.id].formData[resourceId + '@provider_id'] = obj.provider_id
            // UCMP3-7298 选择模板的时候，需要将模板id传至后台，用来进行配额的计算
            if (obj.template_id)
                this.formData[this.resource.id].formData[resourceId + '@template_id'] = obj.template_id

            if (!obj.configure || !Object.keys(obj.configure).length)
                this.$emit('endInitForm', resourceId) // 告诉父组件，结束初始化厂商信息

            if (obj.configure) {
                Object.keys(obj.configure).forEach(
                    (key, index, array) => {
                        // 首先初始化display，延迟初始化formData：初始化formData后, display 更新替换为正确的显示内容
                        // UCMP3-3978【配置模板】从蓝图申请nas 后，appMgr 处理处理时云主机，先选择云厂商后，再次选择配置模板，网络参数没有传过来
                        // 此前处理BUG: UCMP3-3321\UCMP3-3351在表单处理了这种列表数据加载延迟数据绑定之后的问题，所以此次和普通服务一样，去掉setTimeout
                        this.$set(this.formData[this.resource.id].display, resourceId + '@' + key, JSON.parse(JSON.stringify(obj.configure[key])))
                        this.$set(this.formData[this.resource.id].formData, resourceId + '@' + key, JSON.parse(JSON.stringify(obj.configure[key])))
                        if (index === array.length - 1)
                            this.$emit('endInitForm', resourceId) // 告诉父组件，结束初始化厂商信息
                    }
                )
            }
        },

        destroyFormData (resourceId) {
            if (!this.formData[resourceId] || !this.formData[resourceId].formData) return

            Object.keys(this.formData[resourceId].formData).forEach(
                key => {
                    delete this.formData[resourceId].formData[key]
                }
            )
        },

        hasCheckedKeyAccodingToReg (reg) {
            let resionItem = this.formItems.filter(item => item.key.match(reg))[0]
            if (resionItem)
                return resionItem.key
            else return null
        },

        computeMoreFormData (id) {
            let owner = this.externalFormData.owner, owner_type = this.externalFormData.owner_type
            // UCMP3-3091 扁平化处理处理动态的外部表单值
            return { ...(this.externalFormData[id] && this.externalFormData[id].formData ? this.externalFormData[id].formData : {}), ...{owner, owner_type} }
        }
    },

    computed: {
        ...mapGetters([
            'metadata'
        ]),

        serviceMetadata () {
            return this.resource.info && this.resource.info.service_code ? this.metadata.find(metaItem => metaItem.service_code === this.resource.info.service_code) : {}
        },

        combinedFormItems () {
            return [this.providerItem].concat(this.formItems)
        },
        providerItem () {
            return {
                id: this.resource.id + '@' + 'provider_id',
                description: '云厂商',
                detail: false,
                key: 'provider_id',
                label: '云厂商',
                fe_type: {
                    type: 'select'
                },
                created: true,
                required: this.editPrivilege,
                disabled: !this.editPrivilege,
                type: 'string',
                data_link: {
                    endpoint: this.resource.info && this.resource.info.service_code ? '/ucmp3/service_define/' + this.resource.info.service_code + '/providers' : '',
                    text_field: 'provider_name',
                    value_field: 'provider_id'
                }
            }
        },

        currentResFormData () {
            return this.formData[this.resource.id]
        },

        currentResProviderId () {
            return this.currentResFormData && this.currentResFormData.formData ? this.currentResFormData.formData[this.resource.id + '@provider_id'] : null
        },

        initProviderInfoString () {
            return JSON.stringify(this.currentInitProviderInfo)
        },

        currentInitProviderInfo () {
            if (this.resource.id && this.initProviderInfo[this.resource.id]) {
                let obj = {}
                obj.provider_id = this.initProviderInfo[this.resource.id][this.resource.id + '@provider_id']
                // UCMP3-1380 初始化时没有厂商信息，返回空对象
                if (!this.initProviderInfo[this.resource.id][this.resource.id + '@provider_conf']) return obj
                Object.keys(this.initProviderInfo[this.resource.id][this.resource.id + '@provider_conf']).forEach(
                    key => {
                        obj[key] = this.initProviderInfo[this.resource.id][this.resource.id + '@provider_conf'][key]
                    }
                )
                return obj
            }
            return {}
        }
    },

    watch: {
        currentResProviderId (val) {
            if (!val)
                this.formItems.splice(0, this.formItems.length)
            else
                this.updateFormItems(val)
        }
    },
    
    created () {
        this.initFormData()
        this.initProviderCode()
        this.initProviderInfoFunc()
    },

    components: {
        DynamicForm,
        CfgTemplateDialog
    }
}
</script>
<style lang="scss" scoped>
.provider-conf-container {
    position: relative;
    .cfg-template {
        position: absolute;
        top: 6px;
        left: 60px;
    }
}
</style>
<style lang="scss">
.cfg-template {
    .ucmp-icon-cfg-template.icon-temp {
        font-size: 18px;
        color: $themeColor;
    }
}
.provider-conf-container {
    .network-container {
        .netItem {
            min-width: 200px!important;
            .dynamic-form-item {
                width: 100%!important;
            }
        }
    }
}
</style>
