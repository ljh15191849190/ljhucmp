<template lang="pug">
el-tabs.resource-form-container(v-model="service_id" @tab-click="serviceChange")
    el-tab-pane(v-for="(resourceItem, index) in resourceList" :key="resourceItem.id" :name="resourceItem.id" :label="getNavName(resourceItem.name, index)")
        div.provider-conf-pane
            el-form(label-width="120px" label-position="right" size="small")
                div.resouce-form.config-dynamic-form.approve-resource-form
                    div.title(@click="toggleFormStatus(resourceItem)") {{resourceItem.name}}
                        el-tooltip(effect="light" :content="resourceItem.description" placement="top-start")
                            i.ucmp-icon-question.theme-color.margin-left
                        i.cursor-icon(:class="[resourceItem.isShow ? 'el-icon-caret-top' : 'el-icon-caret-bottom']")
                    div.autoapply-resouce-form(v-show="resourceItem.isShow")
                        div.form-title 基本信息
                        DynamicForm.proverder-form(
                            ref="proverderform"
                            :formItems="resourceItem.baseFormItems"
                            :formData.sync="resourceItem.attributes"
                            :display.sync="resourceItem.display"
                            labelPosition="top"
                            :inline="true"
                            :uniqueKey="uniqueKey"
                            :showLinkedItemKeys="showLinkedItemKeys"
                            :keepValueFitDom="keepValueFitDom"
                            :externalFormData="externalFormData"
                            :disableValidate="ifApproveReference && !editPrivileges.includes(resourceItem.service_code)"
                        )
                            div(slot="MoreConfForm" v-if="isShowTemplate(resourceItem.service_code)")
                                ProviderConfForm(
                                    :provider_id.sync="provider_id"
                                    :resourceItem="resourceItem"
                                    :org_id="org_id"
                                    :providerList="providerList"
                                    :uniqueKey="uniqueKey"
                                    :showLinkedItemKeys="showLinkedItemKeys"
                                    :keepValueFitDom="keepValueFitDom"
                                    :isIncludingService="false"
                                    @providerChange="providerChange"
                                    @onlyproviderChange="onlyproviderChange"
                                    :disableValidate="ifApproveReference && !editPrivileges.includes(resourceItem.service_code)"
                                    :disabled="resourceItem.template_immutable"
                                    :resourceList="resourceList"
                                    @multipleInstanceChange="multipleInstanceChange"
                                )
                    div.resouce-include-form(v-for="(includeItem, idx) in resourceItem.includings" :key="includeItem.id")
                        div.title(@click="toggleFormStatus(includeItem)") {{includeItem.name}}
                            el-tooltip(effect="light" :content="includeItem.description" placement="top-start")
                                i.ucmp-icon-question.theme-color.margin-left
                            i.cursor-icon(:class="[includeItem.isShow ? 'el-icon-caret-top' : 'el-icon-caret-bottom']")
                        div.include-resouce-form(v-if="includeItem.baseFormItems && includeItem.baseFormItems.length" v-show="includeItem.isShow")
                            div.form-title 基本信息
                            ResoucePoolForm.proverder-form(
                                v-if="includeItem.service_code === 'pool'"
                                :formItems="includeItem.baseFormItems"
                                :formData.sync="includeItem.attributes"
                                :display.sync="includeItem.display"
                                :uniqueKey="uniqueKey"
                                :keepValueFitDom="keepValueFitDom"
                                :showLinkedItemKeys="showLinkedItemKeys"
                                :externalFormData="externalFormData"
                                :disableValidate="ifApproveReference && !editPrivileges.includes(includeItem.service_code)"
                            )
                            DynamicForm.proverder-form(
                                v-else
                                :formItems="includeItem.baseFormItems"
                                :formData.sync="includeItem.attributes"
                                :display.sync="includeItem.display"
                                labelPosition="top"
                                :inline="true"
                                :uniqueKey="uniqueKey"
                                :keepValueFitDom="keepValueFitDom"
                                :showLinkedItemKeys="showLinkedItemKeys"
                                :externalFormData="externalFormData"
                                :disableValidate="ifApproveReference && !editPrivileges.includes(includeItem.service_code)"
                            )
                            
                                div(slot="MoreConfForm" v-if="isShowTemplate(includeItem.service_code)")
                                    ProviderConfForm(
                                        :provider_id.sync="provider_id"
                                        :resourceItem="includeItem"
                                        :org_id="org_id"
                                        :providerList="providerList"
                                        :uniqueKey="uniqueKey"
                                        :keepValueFitDom="keepValueFitDom"
                                        :showLinkedItemKeys="showLinkedItemKeys"
                                        :isIncludingService="true"
                                        @providerChange="providerChange"
                                        @onlyproviderChange="onlyproviderChange"
                                        :disableValidate="ifApproveReference && !editPrivileges.includes(includeItem.service_code)"
                                        :disabled="includeItem.template_immutable"
                                        :resourceList="resourceList"
                                        @multipleInstanceChange="multipleInstanceChange"
                                    )
                        div(v-else v-show="includeItem.isShow") 
                            span.margin-left 已添加该服务
                            span.margin-left.ucmp-icon-complete__after
                        QingcloudParameterGroupInfo(
                            v-if="resourceItem.service_code === 'qingcloud_rdb' || resourceItem.service_code === 'qingcloud_cache'"
                            :item="resourceItem")
</template>
<script>
/**
 * @description 基础服务(云主机、云硬盘、f5等非蓝图资源)的申请单配置审批修改表单
 */
import Api from '@api'
import metaUtils from '@/server/metadata.utils'
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import ProviderConfForm from './ProviderConfForm'
import ResoucePoolForm from './ResoucePoolForm'
import QingcloudParameterGroupInfo from './QingcloudParameterGroupInfo'
import {mapGetters} from 'vuex'
export default {
    name: 'ResourceForm',
    inject: ['$validator'],
    components: {DynamicForm, ProviderConfForm, ResoucePoolForm, QingcloudParameterGroupInfo},
    props: {
        metadata: {
            type: Array,
            default: () => []
        },
        order_code: {
            type: String,
            default: () => ''
        },
        resources: {
            type: Array,
            default: () => []
        },
        org_id: {
            type: String,
            default: () => ''
        },
        owner_name: {
            type: String,
            default: () => ''
        },
        owner: {
            type: String,
            default: () => ''
        },
        owner_type: {
            type: String,
            default: () => ''
        },
        order_type: {
            type: String, 
            default: ''
        },
        ifApproveReference: {
            type: Boolean,
            default: () => false
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            resourceList: [],
            service_id: '',
            service_code: '',
            provider_id: '',
            providerList: [],
            uniqueKey: 'id',
            keepValueFitDom: true,
            linkedKeyAttrs: [],
            editPrivileges: [],
            copyResourceList: []
        }
    },
    created () {
        this.init()
    },
    methods: {
        async init () {
            await this.getBlueprintEditPrivileges()
            this.getResouceList()
        },
        getResouceList () {
            Api.get('orderDetailResouce', {orderCode: this.order_code}, true).then(
                res => {
                    this.resourceList = this.getInitResouceData(res)
                    this.copyResourceList = JSON.parse(JSON.stringify(this.resourceList))
                    if (this.resourceList.length) {
                        this.service_id = this.resourceList[0].id
                        this.service_code = this.resourceList[0].service_code
                        this.getProvidesByService(this.service_code)
                    }
                }
            )
        },
        getBlueprintEditPrivileges () {
            if (!this.ifApproveReference) return
            return Api.get('blueprintEditPrivileges', {}).then(
                res => {
                    this.editPrivileges = res
                }
            )
        },
        /**
         * @description 初始化resources
         */
        getInitResouceData (resources) {
            let resourceList = []
            let getServiceCode = res => {
                return res.service_code
            }

            JSON.parse(JSON.stringify(resources)).forEach(item => {
                let resourceItemList = Object.values(item)
                if (resourceItemList.length) {
                    let resourceItem = resourceItemList[0]
                    if (this.ifApproveReference)
                        this.$set(resourceItem, 'isShow', this.editPrivileges.includes(resourceItem.service_code))
                   
                    this.setBaseinfoFormItems(resourceItem, 'created')
                    if (resourceItem.includings) {
                        resourceItem.includings = Object.values(resourceItem.includings)
                        resourceItem.includings.forEach(includeItem => {
                            if (this.ifApproveReference)
                                this.$set(includeItem, 'isShow', this.editPrivileges.includes(includeItem.service_code))
                            
                            // UCMP3-5068【申请单】申请F5，提交申请单，管理员处理页面存在多余字段（见截图）
                            // 审批中的包含服务可能是关联也有可能是子服务
                            let filterType = this.getFilterType(includeItem.service_code)
                            this.setBaseinfoFormItems(includeItem, filterType)
                        })
                        resourceItem.includings.sortAsMetadataOrder(this.basicMetadataCodes, getServiceCode)
                    }

                    resourceList.push(resourceItem)
                }
            })
            resourceList.sortAsMetadataOrder(this.basicMetadataCodes, getServiceCode)
            return resourceList
        },
        /**
         * @description 根据service_code获取过滤类型
         */
        getFilterType (serviceCode) {
            let metadataItem = this.metadata.find(attr => attr.service_code === serviceCode)
            return metadataItem.parent ? 'created' : 'relate_created'
        },
        /**
         * @description 设置基本信息表单项
         */
        setBaseinfoFormItems (resourceItem, filterKey) {
            if (!this.ifApproveReference)
                this.$set(resourceItem, 'isShow', true)
            let metadataItem = this.metadata.find(attr => attr.service_code === resourceItem.service_code)
            resourceItem.name = metadataItem.name || metadataItem.service_code
            resourceItem.description = metadataItem.description || ''
            
            // 基本信息formItems
            if (metadataItem.attribute) {
                //UCMP3-6533【申请云桌面】机关单位用户和内部用户申请云桌面走审批流程，审批详情中出现了审批单位字段（申请的是没有，审批的时候不应该有）
                let attributes = metadataItem.attribute.filter(item => item.key !== 'approval_org')
                let baseinfoFormItems = this.getBaseinfoFormItems(attributes, resourceItem, filterKey)
                // juniper防火墙--使用本机IP这个字段在申请时候就屏蔽此处应该屏蔽掉
                baseinfoFormItems.forEach(item => {
                    if (resourceItem.service_code === 'juniper_policy') {
                        if (item.key === 'local_zone') {
                            item.disabled = true
                            item.created = false
                        } 
                    }
                })
                this.$set(resourceItem, 'formItems', baseinfoFormItems)
                // baseFormItems 目的在于多次选择不同的厂商，为总的formItems做一个对比
                this.$set(resourceItem, 'baseFormItems', baseinfoFormItems)
            }

            // filterKey: created | service_code非'nas', 'pool'(其所属服务特殊处理) | related_service.length > 0
            if (filterKey !== 'created') return 
            if (['nas', 'pool'].includes(resourceItem.service_code)) return
            if (!metadataItem.related_service || !metadataItem.related_service.length) return 
           
            let filterAttribute = metaUtils.getRelatedServiceAttributes(metadataItem.related_service, this.metadata)
            // 所属服务也要过滤 filterKey: created
            filterAttribute = filterAttribute.filter(item => item[filterKey])
            // 得到的所属服务权限控制
            let formData = resourceItem.attributes
            let {display, id} = resourceItem
            filterAttribute.forEach(filterAttr => {
                if (this.ifApproveReference) 
                    filterAttr.disabled = !this.editPrivileges.includes(resourceItem.service_code)

                // 关联服务绑定数据
                // UCMP3-5818【申请单管理】服务目录申请云硬盘，申请时已填写所属云主机，管理员处理时，申请单详情页面又显示所属云主机
                if (formData.hasOwnProperty([filterAttr.key])) {
                    let uniqueId = id + '@' + filterAttr.key
                    this.$set(formData, uniqueId, formData[filterAttr.key])
                    this.$set(display, uniqueId, display[filterAttr.key])
                }
            })  
            metaUtils.updateAttributeType(filterAttribute, null, id)
            this.$set(resourceItem, 'formItems', resourceItem.formItems ? resourceItem.formItems.concat(filterAttribute) : filterAttribute)
            // baseFormItems 目的在于多次选择不同的厂商，为总的formItems做一个对比
            this.$set(resourceItem, 'baseFormItems', resourceItem.baseFormItems ? resourceItem.baseFormItems.concat(filterAttribute) : filterAttribute)
        },
        /**
         * @description 设置厂商信息表单项
         */
        setProviderFormItems (resourceItem, provider_code, templateData) {
            // 删除冗余的属性
            Object.keys(resourceItem.attributes).forEach(attrKey => {
                if (attrKey.includes(resourceItem.id) && !resourceItem.baseFormItems.some(baseFormItem => baseFormItem[this.uniqueKey] === attrKey)) 
                    delete resourceItem.attributes[attrKey]
            })
            // 赋值云厂商id和code
            resourceItem.attributes.provider_id = this.provider_id
            resourceItem.attributes.provider_code = provider_code
            // 清除provider_conf数据
            this.$set(resourceItem.attributes, 'provider_conf', {})
            this.$set(resourceItem.display, 'provider_conf', {})
            let serviceMetadata = this.metadata.find(item => item.service_code === resourceItem.service_code)
            
            // UCMP3-2816 [qingcloud_lb 选择使用公网IP, 厂商信息需要显示公网IP] 切换厂商后，筛选出当前含有linked属性的属性(基本信息)
            resourceItem.baseFormItems.forEach(item => {
                if (item.link)
                    this.linkedKeyAttrs.push(item)
            })
            if (serviceMetadata.provider_conf) {
                let provierFormItems = this.getProviderFormItems(serviceMetadata.provider_conf[provider_code].attribute, resourceItem.id, resourceItem.service_code) 
                this.$set(resourceItem, 'providerFormItems', provierFormItems)
                resourceItem.formItems = [...resourceItem.baseFormItems, ...provierFormItems]
                
                if (templateData) {
                    this.$set(resourceItem, 'template_id', templateData.template_id)
                    provierFormItems.forEach(formItem => {
                        this.$set(resourceItem.attributes, formItem[this.uniqueKey], templateData.configure[formItem.key])
                    })
                } else 
                    this.$set(resourceItem, 'template_id', '')
            }
        },
        /**
         * @description 获取导航名称
         */
        getNavName (name, index) {
            return name + (this.resourceList.length > 1 ? '_' + (index + 1) : '')
        },
        /**
         * @description 通过服务code获取云厂商
         */
        getProvidesByService (service_code) {
            Api.get('cfgTemplateProviders', {service_code: service_code}, true).then(
                res => {
                    this.providerList = res
                    // UCMP3-3080 【云主机克隆】云主机克隆，管理员处理申请单时，云厂商下拉框需要过滤
                    // 申请单类型克隆时的云厂商只能是vmware
                    if (this.order_type === 'clone') 
                        this.providerList = res.filter(item => item.provider_code === 'vmware_vsphere')
                    
                    //UCMP3-3169【审批管理】F5审批流程或者光大分行审批流程，第一级审批人，填写参数，审批通过（同意），第二级审批人办理的时候，之前填写的参数未保存需要重新填写
                    this.copyResourceList.forEach((resourceItem, idx) => {
                        if (resourceItem.attributes.provider_id && resourceItem.attributes.provider_conf && idx === 0) {
                            let templateData = {provider_id: resourceItem.attributes.provider_id, configure: resourceItem.attributes.provider_conf}
                            this.providerChange(templateData)
                        }

                        if (resourceItem.includings) {
                            resourceItem.includings.forEach(includeItem => {
                                let hasProviderConf = includeItem.attributes.provider_conf && (JSON.stringify(includeItem.attributes.provider_conf) !== '{}')
                                if (includeItem.attributes.provider_id && hasProviderConf && idx === 0) {
                                    let templateData = {provider_id: includeItem.attributes.provider_id, configure: includeItem.attributes.provider_conf}
                                    this.providerChange(templateData, true)
                                }
                            })
                        }
                    })
                }     
            )
        },
        /**
         * @description 服务选择改变
         */
        serviceChange (tab, event) {
            let resourceItem = this.resourceList.find(item => item.id === tab.name)
            this.service_id = resourceItem.id
            this.service_code = resourceItem.service_code
            if (this.service_code === resourceItem.service_code) return
            this.getProvidesByService(resourceItem.service_code)
        },
        onlyproviderChange () {
            let provider_code = this.providerList.find(item => item.provider_id === this.provider_id).provider_code
            this.resourceList.forEach(resourceItem => {
                this.setProviderFormItems(resourceItem, provider_code, null)
                if (resourceItem.includings && resourceItem.includings.length) {
                    resourceItem.includings.forEach(includeItem => {
                        this.setProviderFormItems(includeItem, provider_code, null)
                    })
                }
            })
        },
        /**
         * @description 云厂商选择改变事件
         */
        providerChange (templateData, isIncludingService = false, isSelectTemp = false) {
            if (templateData) this.provider_id = templateData.provider_id
            this.linkedKeyAttrs = []
            // 获取云厂商code以及得到表单项
            let provider_code = this.providerList.find(item => item.provider_id === this.provider_id).provider_code
            //1.清除provider_conf数据; 2.赋值云厂商formItems
            this.resourceList.forEach(resourceItem => {
                // 模板选择
                if (isSelectTemp) {
                    let autoTemplateData = !isIncludingService ? templateData : null
                    this.setProviderFormItems(resourceItem, provider_code, autoTemplateData)
                } else {
                    // 初始化
                    if (!isIncludingService)
                        this.setProviderFormItems(resourceItem, provider_code, templateData)
                }
                
                if (resourceItem.includings && resourceItem.includings.length) {
                    if (isSelectTemp) {
                        let includeTemplateData = isIncludingService ? templateData : null
                        resourceItem.includings.forEach(includeItem => {
                            this.setProviderFormItems(includeItem, provider_code, includeTemplateData)
                        })
                    } else {
                        if (isIncludingService) {
                            resourceItem.includings.forEach(includeItem => {
                                this.setProviderFormItems(includeItem, provider_code, templateData)
                            })
                        }
                    }
                }
            })
        },
        /**
         * @description 单模板多实例变更并且是同厂商 
         * 
         */
        multipleInstanceChange (templateData, isIncludingService = false, isSelectTemp = false, childServicePos) {
            if (templateData) this.provider_id = templateData.provider_id
            let provider_code = this.providerList.find(item => item.provider_id === this.provider_id).provider_code
            this.resourceList.forEach(resourceItem => {
                if (!isIncludingService) {
                    // 外层服务
                    if (resourceItem.service_code === templateData.service_code)
                        this.setProviderFormItems(resourceItem, provider_code, templateData)
                } else {
                    // 内层服务
                    if (resourceItem.includings && resourceItem.includings.length) {
                        resourceItem.includings.forEach((includeItem, index) => {
                            if (includeItem.service_code === templateData.service_code && childServicePos === index) 
                                this.setProviderFormItems(includeItem, provider_code, templateData)
                        })
                    }
                }
            })
        },
        /**
         * @description 返回基本信息表单项FormItems
         */
        getBaseinfoFormItems (attributes, resourceItem, filterKey) {
            let formData = resourceItem.attributes
            let {display, id} = resourceItem
            //UCMP3-4208【控制台】申请克隆申请单后，在个人中心申请单处理里面看不到操作系统项
            let filterType = this.order_type === 'clone' ? 'clone' : filterKey
            let createdAttribute = Array.isArray(attributes) ? attributes.filter(attr => attr[filterType]) : []
            let baseinfoFormItems = JSON.parse(JSON.stringify(createdAttribute))
            if (filterType === 'relate_created') {
                baseinfoFormItems.forEach(item => {
                    if (item.relate && typeof item.relate === 'object') {
                        Object.keys(item.relate).forEach(key => {
                            item[key] = item.relate[key]
                        })
                    }
                })
            }
            metaUtils.updateAttributeType(baseinfoFormItems, null, id)
            baseinfoFormItems.forEach(attr => {
                if (this.ifApproveReference) 
                    // UCMP3-5919【NAS】以应用为维度申请nas，挂审批流程，到流程审批的时候，名称部分没有控制住
                    attr.disabled = attr.disabled || !this.editPrivileges.includes(resourceItem.service_code)
                if (formData.hasOwnProperty([attr.key])) { // UCMP3-4827 使用hasOwnProperty 代替 原来的formData[attr.key] 更为准确，避免0的特殊场景
                    let uniqueId = id + '@' + attr.key
                    // 绑定数据formdata
                    this.$set(formData, uniqueId, formData[attr.key])
                    // 绑定数据display
                    this.$set(display, uniqueId, display[attr.key])
                }
                // 常规申请云主机(非蓝图)，查询镜像列表添加参数pure_image
                if (resourceItem.service_code === 'ecs' && attr.key === 'image') {
                    if (!attr.data_link.params)
                        this.$set(attr.data_link, 'params', {})
                    attr.data_link.params.pure_image = true
                }
                // UCMP3-6512【审批管理】云桌面申请，审批页面不显示桌面名称（见截图）
                // 申请和审批接口参数不同，这里作特殊处理
                if (resourceItem.service_code === 'xen_desktop' && attr.key === 'delivery_group') 
                    attr.data_link.params.exclude_me = false
            })

            if (resourceItem.service_code === 'nas') {
                let nasMetadata = this.metadata.find(item => item.service_code === resourceItem.service_code)
                if (nasMetadata) {
                    nasMetadata = JSON.parse(JSON.stringify(nasMetadata))
                    let nasAttr = nasMetadata.related_service[0]
                    nasAttr.key = nasAttr.service_code
                    nasAttr[this.uniqueKey] = nasAttr.service_code
                    this.$set(nasAttr, 'type', 'table')
                    this.$set(nasAttr, 'label', this.nasAutoAttach ? '挂载主机' : '关联主机')
                    baseinfoFormItems.push(nasAttr)
                }
            }
            
            return baseinfoFormItems
        },
        /**
         * @description 返回云厂商动单项FormItems
         */
        getProviderFormItems (formItmes, id, service_code) {
            if (!formItmes || !formItmes.length) return []
            let copiedData = { provider_id: this.provider_id }
            formItmes = JSON.parse(JSON.stringify(formItmes))
            metaUtils.updateAttributeType(formItmes, null, id)
            formItmes.forEach(attrItem => {
                if (this.ifApproveReference) 
                    attrItem.disabled = !this.editPrivileges.includes(service_code)
                if (attrItem.data_link && attrItem.data_link.endpoint) {
                    if (!attrItem.data_link.params)
                        this.$set(attrItem.data_link, 'params', {})
                    // 满足需要云厂商id的接口动态添加参数
                    attrItem.data_link.params = { ...attrItem.data_link.params, ...copiedData }
                    //处理lined true
                    if (attrItem.link)
                        this.linkedKeyAttrs.push(attrItem)
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
                }
            })

            return formItmes
        },
        /**
         * @description 是否显示模板
         */
        isShowTemplate (service_code) {
            let serviceMetadata = this.metadata.find(item => item.service_code === service_code)
            let isShow = serviceMetadata.provider_conf ? true : false
            return isShow 
        },
        /**
         * @description 自动填充属性逻辑处理
         */
        handlerAutoFill () {
            // 需要自动填充的服务资源
            if (!this.provider_id) return
            let autoFillResouceList = this.resourceList.filter(item => item.service_code === this.service_code && item.id !== this.service_id)
            let currentResouce = this.resourceList.find(item => item.id === this.service_id)
            if (!currentResouce) return
            //根据元数据属性apply_unique来刷选自动填充的属性
            autoFillResouceList.forEach(resourceItem => {
                // 自动填充表单(apply_unique:true除外)
                currentResouce.formItems.forEach(formItem => {
                    let currentId = formItem[this.uniqueKey]
                    let value = currentResouce.attributes[currentId]
                    if (!formItem.apply_unique) {
                        let id = resourceItem.formItems.find(item => item.key === formItem.key)[this.uniqueKey]
                        if (id)
                            this.$set(resourceItem.attributes, id, value)
                    }
                })
                // 自动填充包含服务
                //UCMP3-2707用配置模板填完云主机1的云硬盘参数之后，参数无法prefill到云主机2对应的云硬盘参数字段
                // UCMP3-3191【配置模板】申请多个资源，如vmware云硬盘，在申请单中处理，选择了配置模板后，执行报错
                // 问题原因： 没有处理resourceItem.includings 为null
                if (resourceItem.includings) {
                    resourceItem.includings.forEach((includeItem, index) => {
                        let currentIncludeResouce = currentResouce.includings[index]
                        currentIncludeResouce.formItems.forEach(formItem => {
                            let currentId = formItem[this.uniqueKey]
                            let value = currentIncludeResouce.attributes[currentId]
                            if (!formItem.apply_unique) {
                                let id = includeItem.formItems.find(item => item.key === formItem.key)[this.uniqueKey]
                                if (id)
                                    this.$set(includeItem.attributes, id, value)
                            }
                        })
                    })
                }
            })
        },
        /*
         * @description 当前指定的表单显示/隐藏
         */
        toggleFormStatus (resouceItem) {
            resouceItem.isShow = !resouceItem.isShow
        },
        /**
         * @description 获取resouces子项
         */
        setResouceItem (item) {
            let serviceMetadata = this.metadata.find(metaItem => metaItem.service_code === item.service_code)
            if (!item.formItems) return
            item.formItems.forEach(formItem => {
                let currentId = formItem[this.uniqueKey]
                // UCMP3-5053 修复值为 [null|0] 被错误过滤的问题
                if (item.attributes.hasOwnProperty(currentId)) {
                    if (serviceMetadata) {
                        let createdAttribute = Array.isArray(serviceMetadata.attribute) ? serviceMetadata.attribute.filter(attr => attr.created) : []
                        const canEditAttr = createdAttribute.find(originData => originData.key === formItem.key)
                        if (canEditAttr) {
                            item.attributes[formItem.key] = item.attributes[currentId]
                            item.display[formItem.key] = item.display[currentId]
                        } else {
                            if (item.attributes.provider_conf) {
                                item.attributes.provider_conf[formItem.key] = item.attributes[currentId]
                                item.display.provider_conf[formItem.key] = item.display[currentId]
                            }
                        }
                    }
                }
                // UCMP3-7036 走审批流程申请nas资源，有多级审批时，第一级处理后，后边的管理员处理查看审批单时，关联的云主机信息丢失
                if (currentId !== 'ecs') {
                    delete item.attributes[currentId]
                    delete item.display[currentId]
                }
            })
            delete item.isShow
            delete item.formItems
            delete item.baseFormItems
            delete item.providerFormItems
        },
        /**
         * @description 获取resouces
         */
        getResouces () {
            let resourceList = JSON.parse(JSON.stringify(this.resourceList))
            let resouces = []
            resourceList.forEach(item => {
                let resouceItem = {}
                this.setResouceItem(item)
                // 处理包含服务
                if (item.includings) {
                    let includings = {}
                    item.includings.forEach(includeItem => {
                        this.setResouceItem(includeItem)
                        includings[includeItem.id] = includeItem
                    })
                    item.includings = includings
                }
               
                resouceItem[item.id] = item
                resouces.push(resouceItem)
            })
            this.$emit('update:resources', resouces)
        }
    },
    computed: {
        showLinkedItemKeys () {
            let showLinkedKeys = []
            this.resourceList.forEach(resourceItem => {
                this.linkedKeyAttrs.forEach(linkeAttr => {
                    let formItemData = resourceItem.attributes[linkeAttr[this.uniqueKey]]
                    if (formItemData && linkeAttr['link']['link_' + formItemData])
                        showLinkedKeys = [...showLinkedKeys, ...linkeAttr['link']['link_' + formItemData]]

                    if (resourceItem.includings && resourceItem.includings.length) {
                        resourceItem.includings.forEach(includItem => {
                            let includeFormItemData = includItem.attributes
                            if (includeFormItemData && linkeAttr['link']['link_' + includeFormItemData])
                                showLinkedKeys = [...showLinkedKeys, ...linkeAttr['link']['link_' + includeFormItemData]]
                        })
                    }
                })
            })

            return showLinkedKeys
        },
        verrors () {
            return this.$validator.errors
        },

        /**
         * @description 资源配置表单校验后不通过的资源id集合
         */
        invalidFormIds () {
            if (!this.verrors || !this.verrors.items)
                return []
            let allIds = this.verrors.items.map(
                item => {
                    return item.field.split('@')[0]
                }
            )
            return Array.from(new Set(allIds))
        },

        externalFormData () {
            let obj = {
                owner: this.owner,
                owner_type: this.owner_type
            }

            // UCMP3-5644【服务配置】Nas服务配置只勾选了名称，但申请了Nas资源，管理员处理时填写了其他参数信息，名称拼接都改变了
            // UCMP3-6426【服务配置】F5服务配置只勾选了名称，但申请了F5资源，管理员处理时填写了其他参数信息，名称拼接都改变了
            if (this.service_code === 'nas' || this.service_code === 'f5') {
                if (this.service_code === 'nas') {
                    // 针对nas添加节点的属性nas_fs_type值
                    let resourceItem = this.resourceList[0]
                    let nas_fs_type = resourceItem.attributes && Array.isArray(resourceItem.attributes.ecs) && resourceItem.attributes.ecs.length ? resourceItem.attributes.ecs[0].nas_fs_type : ''
                    obj[`${resourceItem.id}@nas_fs_type`] = nas_fs_type || ''
                }
                
                if (this.owner_type === 'app' && this.owner_name) {
                    let short = this.owner_name.match(/\((.*)\)/)
                    short = short ? short[1] : ''
                    obj.short = short
                }
            }

            return obj
        },

        basicMetadataCodes () {
            return this.metadata.filter(meta => { return meta.group !== 'blueprint' })
                .map(meta => { return meta.service_code })
        },

        ...mapGetters([
            'nasAutoAttach'
        ])
    },
    watch: {
        resourceList: {
            deep: true,
            handler (newVal, oldVal) {
                this.handlerAutoFill()
                this.getResouces()
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.ucmp-icon-complete__after {
    font-size: 18px;
    color: $running;
}
</style>
