<template lang="pug">
    div.config-container(:class="{'gray-bg': !showAllItems}")
        div.config-title.border-bottom.padding-left.d-flex(v-if="!showAllItems")
            el-button(type="text" icon="el-icon-arrow-right" @click="hideConfig" v-if="!isApplyHandle")
            //- bug UCMP-450【应用编排】编排名称过长时显示问题
            el-input.nickname(size="mini" v-if="checkedNode && checkedNode.data && checkedNode.data.info" v-model="checkedNode.data.info.name")
            el-button(type="text" v-if="!isApplyHandle" @click="showPropertyForm") 切换属性配置
        div.form-content(:class="{'show-all-items-content': showAllItems}")
            //- UCMP3-2353 修改资源描述信息
            el-form(v-if="!isApplyHandle && node && node.data && node.data.info")
                el-form-item(label="描述")
                    el-input(
                        type="textarea"
                        v-model="node.data.info.description"
                        v-validate="descriptionValition"
                        :name="'desc_' + node.id"
                        :data-vv-as="node.data.info.name + '描述'"
                        :class="{'is-danger': errors.has('desc_' + node.id)}")
                    span.validator-error.is-danger(v-if="errors.has('desc_' + node.id)") {{ errors.first('desc_' + node.id) }}
            div.config-dynamic-form(
                v-for="res in allBasicResources"
                :key="res.id"
                :class="{'show-all-items border': showAllItems, 'catalog-checked-node': isApplyHandle && checkedNode.id === res.id, 'ucmp-icon-invalid': isApplyHandle && invalidFormIds.indexOf(res.id) !== -1}"
                v-show="showAllItems || !showAllItems && checkedNode && (checkedNode.id === res.id)"
                )
                div.apply_service_name.gray-bg(v-if="isApplyHandle" @click="toggleFormStatus(res.id)") {{ formatterResName(res) }}
                    el-tooltip(v-if="res.info.description" effect="light" :content="res.info.description" placement="top-start")
                        i.ucmp-icon-question.theme-color.margin-left
                    el-tooltip(v-if="ifApproveReference && editPrivileges.indexOf(res.info.service_code) === -1" effect="light" :content="'当前用户没有修改' + (res.name || res.info.name || res.service_code ) + '的权限'" placement="top-start")
                        i.ucmp-icon-disabled.margin-left.disabled-color
                    i.cursor-icon(:class="[toggleSwitches[res.id] ? 'el-icon-caret-top' : 'el-icon-caret-bottom']")
                el-collapse-transition
                    div.form-container(v-show="!isApplyHandle || isApplyHandle && toggleSwitches[res.id]" :class="{'disabled-content': ifApproveReference && editPrivileges.indexOf(res.info.service_code) === -1}")
                        div.config-form-title 基础信息
                        DynamicForm(
                            :formItems="isApplyHandle ? filterAttrItems(allAttributes[res.id], true, res.id, res.info.service_code) : allAttributes[res.id]"
                            :formData.sync="configs[res.id].formData"
                            :externalFormData="basicConfigMoreData"
                            :display.sync="configs[res.id].display"
                            :showLinkedItemKeys="showLinkedItems[res.id]"
                            uniqueKey="id"
                            labelPosition="top"
                            :inline="isApplyHandle"
                            :isApplyHandle="isApplyHandle"
                            :keepValueFitDom="keepValueFitDom"
                            :resourceId="res.id"
                            :disableValidate="ifApproveReference && editPrivileges.indexOf(res.info.service_code) === -1"
                            @focusWidget="focusWidget"
                        )
                            div(slot="MoreConfForm")
                                //- div.service_name(v-if="isApplyHandle") {{ res.name || res.info.name || res.service_code }}
                                //- 该组件仅为申请资源时的oracle和weblogic组件使用 --- 配置参数
                                MoreConfForm(
                                    v-if="isApplyHandle && filterAttrItems(allAttributes[res.id], false)"
                                    :formData.sync="configs[res.id].formData[filterAttrItems(allAttributes[res.id], false).id]"
                                    :display.sync="configs[res.id].display[filterAttrItems(allAttributes[res.id], false).id]"
                                    :resourceId="res.id"
                                    :formId="res.id+'@'"
                                    :isApplyHandle="isApplyHandle"
                                    :editPrivilege="!ifApproveReference || ifApproveReference && editPrivileges.indexOf(res.info.service_code) > -1"
                                    :disableValidate="ifApproveReference && editPrivileges.indexOf(res.info.service_code) === -1"
                                    @focusWidget="focusWidget"
                                )
                                BlueprintProviderConf(
                                    :ref="'providerForm' + res.id"
                                    v-if="providerConf && res.info.provider_conf"
                                    v-loading="formDataIniting === res.id"
                                    :editPrivilege="!ifApproveReference || ifApproveReference && editPrivileges.indexOf(res.info.service_code) > -1"
                                    :formData.sync="providerConfData"
                                    :providerCodeData="providerCodeData"
                                    :initProviderInfo="initProviderInfo"
                                    :resource="res"
                                    :externalFormData="providerExternalFormData"
                                    :allResources="allBasicResources"
                                    :org_id="org_id"
                                    :disableValidate="ifApproveReference && editPrivileges.indexOf(res.info.service_code) === -1"
                                    @focusWidget="focusWidget"
                                    @getDescendants="getDescendants"
                                    @startInitForm="startInitForm"
                                    @endInitForm="endInitForm"
                                )
                                TargetNodeRelatedConfigForms(
                                    :ref="'linkCfgRef' + res.id"
                                    :editPrivilege="!ifApproveReference || ifApproveReference && editPrivileges.indexOf(res.info.service_code) > -1"
                                    :linkConfigs.sync="linkConfigs"
                                    :allLinks="defaultLinks"
                                    :configs.sync="configs"
                                    :targetNode="res"
                                    :isApplyHandle="isApplyHandle"
                                    :linkPropertiesConfig="linkPropertiesConfig"
                                    :disableValidate="ifApproveReference && editPrivileges.indexOf(res.info.service_code) === -1"
                                    @defineCheckedLink="defineCheckedLink"
                                )
            BlueprintResourceCfgs(v-if="checkedNode && checkedNode.data && checkedNode.data.info && checkedNode.data.info.group === 'blueprint'" :blueprintId="checkedNode.data.info.service_code")
</template>

<script>
/**
 * @description 新建编排，点击选中某个资源节点，显示对应的资源配置信息
 * @description 非编排类型的资源，显示配置内容的动态表单；编排类型的资源，显示配置明细
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import TargetNodeRelatedConfigForms from './TargetNodeRelatedForms'
import Config from '@/mock/metadata/metadata.config'
import metaUtils from '@/server/metadata.utils'
import BlueprintResourceCfgs from '@/components/catalog/instance/BlueprintResourceCfgs'
import MoreConfForm from '@/components/common/dynamicForm/moreConf/MoreConfForm'
import BlueprintProviderConf from '@/components/userCenter/itemConponents/BlueprintProviderConf'
import { mapGetters, mapActions } from 'vuex'

export default {
    inject: ['$validator'],
    props: {
        node: {
            type: Object,
            default: function () {
                return {
                    data: {
                        info: {
                            service_code: ''
                        },
                        id: ''
                    }
                }
            }
        },

        allBasicResources: {
            type: Array,
            default: function () {
                return []
            }
        },

        showConfig: {
            type: Boolean,
            default: false
        },

        showPropertiesConfig: {
            type: Boolean,
            default: false
        },

        configs: {
            type: Object,
            default: function () {
                return {}
            }
        },

        providerConfData: {
            type: Object,
            default: function () {
                return {}
            }
        },

        providerCodeData: {
            type: Object,
            default: function () {
                return {}
            }
        },

        initProviderInfo: {
            type: Object,
            default: function () {
                return {}
            }
        },

        linkConfigs: {
            type: Object,
            default: function () {
                return {}
            }
        },

        backupConfigs: {
            type: Object,
            default: function () {
                return {}
            }
        },

        // 参数属性配置信息，申请实例时判断是否只读
        propertiesConfig: {
            type: Object,
            default: function () {
                return {}
            }
        },

        linkPropertiesConfig: {
            type: Object,
            default: function () {
                return {}
            }
        },

        defaultLinks: {
            type: Array,
            default: function () {
                return []
            }
        },

        // 是否为申请资源流程
        isApplyHandle: {
            type: Boolean,
            default: () => false
        },

        providerConf: {
            type: Boolean,
            default: () => false
        },

        nasValid: {
            type: Array,
            default: function () {
                return []
            }
        },
        externalFormData: {
            type: Object,
            default: function () {
                return {}
            }
        },
        popper_not_to_body: {
            type: Boolean,
            default: true
        },
        blueprintId: {
            type: String,
            default: ''
        },
        showAllItems: {
            type: Boolean,
            default: () => false
        },
        invalidFormIds: {
            type: Array,
            default: () => []
        },
        // 组织机构id，审批环节筛选配置模板使用
        org_id: {
            type: String,
            default: ''
        },

        // UCMP3-2717 是否审批页面引用
        ifApproveReference: {
            type: Boolean,
            default: false
        },

        // 是否订单修改页面引用
        ifOrderRerefence: {
            type: Boolean,
            default: false
        },

        // 审批修改权限，只在审批页面生效（UCMP3-2717）
        editPrivileges: {
            type: Array,
            default: () => []
        },

        // UCMP3-2411 资源配置表单切换显示/隐藏开关
        toggleSwitches: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            keepValueFitDom: true,
            // toggleSwitches: {}, // UCMP3-2411 资源配置表单切换显示/隐藏开关
            descriptionValition: {
                max: 200
            },
            formDataIniting: null,
            allAttributes: {} // 画布中已有节点的属性集合(id: attributes)，且对属性列表进行加工：添加id = nodeId + '@' + key
        }
    },

    created () {
        this.dynamicUpdateResourceAttribute()
    },

    methods: {
        ...mapActions([
            'setAllResourceAttrs'
        ]),
        
        hideConfig () {
            this.$emit('update:showConfig', false)
        },
        showPropertyForm () {
            this.$emit('update:showConfig', false)
            this.$emit('update:showPropertiesConfig', true)
        },
        filterAttrItems (itemArr, flag, resId, service_code) {
            if (!itemArr)
                return []
            if (flag) {
                let privilegeAttributes = this.metadataApplyPrivileges.find(service => service.service_code === service_code)
                return itemArr.filter(attr => {
                    // UCMP3-5375 服务属性列表根据已有权限进行过滤
                    if (this.ifOrderRerefence || this.ifApproveReference)
                        return attr.key !== 'init_script'
                    else return attr.key !== 'init_script' && privilegeAttributes && privilegeAttributes.attributes.find(attr_key => attr_key === attr.key)
                })
                .map(
                    attr => {
                        // UCMP3-2788 元数据缓存在 vuex, 不能随意直接修改其内部属性，故需要深拷贝
                        let copiedAttr = JSON.parse(JSON.stringify(attr))
                        // UCMP3-2640 当前用户没有修改该服务的权限 UCMP3-2717 只有在审批页面，修改权限才生效，否则默认都可以修改
                        if (this.providerConf && service_code && this.ifApproveReference && this.editPrivileges.indexOf(service_code) === -1) {
                            copiedAttr.disabled = true
                            return copiedAttr
                        }
                        // UCMP3-2352 申请应用服务实例时，根据在编排阶段配置的参数属性信息(readonly)动态判断是否应该对当前参数禁用
                        if (copiedAttr.orchestrate && resId && this.propertiesConfig[resId] && this.propertiesConfig[resId].formData) {
                            // UCMP3-2521 可读性配置表单与参数配置表单id不同：前者分隔符应该是 #
                            let id = copiedAttr.id.replace(/@/, '#')
                            let properties = this.propertiesConfig[resId].formData[id]
                            copiedAttr.disabled = properties && Array.isArray(properties) && properties.indexOf('readonly') !== -1
                        }
                        return copiedAttr
                    }
                )
            } else {
                return itemArr.find(attr => {
                    return attr.key === 'init_script'
                })
            }
        },
        
        focusWidget (formId) {
            if (formId || formId.toString) {
                let idArr = formId.split('@')
                if (idArr.length > 0)
                    this.$emit('defineCheckedNode', idArr[0])
                else
                    this.$emit('defineCheckedNode', null)
            }
        },
        defineCheckedLink (link) {
            this.$emit('defineCheckedLink', link)
        },

        /**
         * @description 当前蓝图的资源根据分类(ecs、volume等)进行排序
         */
        sortAllBasicResources () {
            let getServiceCode = (resource) => {
                return resource.info.service_code
            }
            this.allBasicResources.sortAsMetadataOrder(this.basicMetadataCodes, getServiceCode)
        },

        /*
         * @description UCMP3-2411 当前指定的表单显示/隐藏
         */
        toggleFormStatus (id) {
            let toggleSwitches = JSON.parse(JSON.stringify(this.toggleSwitches))
            toggleSwitches[id] = !this.toggleSwitches[id]

            this.$emit('update:toggleSwitches', toggleSwitches)
        },

        /**
         * @description 格式化资源名称显示
         */
        formatterResName (res) {
            if (!res.info) return ''
            let nickname = res.name || res.info.name || res.service_code
            let name = this.metadataAsObj[res.info.service_code].name
            return name + ' (' + nickname + ')'
        },

        getDescendants (id, ids) {
            this.$emit('getDescendants', id, ids)
        },

        startInitForm (id) {
            this.formDataIniting = id
            this.$emit('startInitForm', id)
        },

        endInitForm (id) {
            this.formDataIniting = null
            this.$emit('endInitForm', id)
        },

        setResourceAttribute (item) {
            if (!item.info) return
            
            let filteredConfig = Config.user_defined.filter(
                config => config.service_code === item.info.service_code
            )
            let configAttribute = null
            if (filteredConfig.length)
                configAttribute = filteredConfig[0].attribute

            // 当前服务的attribute库
            let tempAttrs = JSON.parse(JSON.stringify(item.info.attribute))

            // 添加继承的服务attribute到当前服务的attribute库
            if (item.info.extends && item.info.extends.service_code && item.info.extends.attribute)
                tempAttrs = tempAttrs.concat(metaUtils.getExtendAttributes(item.info.extends.service_code, item.info.extends.attribute, this.metadata))

            // 分析关联服务并转为当前服务的属性
            if (item.info.related_service && item.info.related_service.length)
                tempAttrs = tempAttrs.concat(metaUtils.getRelatedServiceAttributes(item.info.related_service, this.metadata))

            let filteredAttrs = tempAttrs.filter(
                attr => {
                    // UCMP3-2357 应用编排只过滤 orchestrate 为 true 的条目；申请蓝图服务实例时，过滤 created 或 orchestrate 为 true 的条目
                    // eslint-disable-next-line 
                    if (this.isApplyHandle && (attr.created || attr.orchestrate) && !attr.disable_apply_orchestrate || !this.isApplyHandle && attr.orchestrate)
                        return attr
                }
            )
            this.$set(this.allAttributes, item.id, JSON.parse(JSON.stringify(filteredAttrs)))
            // 更新元数据attribute列表的type为实际表单控件的类型
            metaUtils.updateAttributeType(this.allAttributes[item.id], configAttribute, item.id, { popper_not_to_body: this.popper_not_to_body })

            // 检索出对应的 nas 相关最小值信息，放入对应的formItem的validation中去验证
            // UCMP3-682【oracle-nas】一个云主机带两个nas，一个nas大小处于临界值，一个nas大小小于临界值，可以保存成功
            // 删除了if条件，此处会多次计算，且用item.id足够去保证拿到对应的，正确的数据
            const sizeObj = this.allAttributes[item.id].find(attr => attr.key === 'size')
            const nasObj = this.nasValid.find(nas => nas.id === item.id)

            if (sizeObj && nasObj)
                sizeObj.validation.nasMin = nasObj.min
        },

        /**
         * @description UCMP3-5717 动态增加/删除资源属性列表
         * 初始化|资源数量发生变化
         */
        dynamicUpdateResourceAttribute () {
            let allResIds = this.allBasicResources.map(res => res.id)
            let currentIds = Object.keys(this.allAttributes)
            for (let i = currentIds.length - 1; i >= 0; i--) {
                let index = allResIds.indexOf(currentIds[i])
                if (index !== -1) {
                    currentIds.splice(i, 1)
                    allResIds.splice(index, 1)
                }
            }

            if (allResIds.length)
                this.allBasicResources.filter(res => allResIds.indexOf(res.id) !== -1).forEach(res => this.setResourceAttribute(res))
            if (currentIds.length)
                currentIds.forEach(id => delete this.allAttributes[id])
        }
    },

    computed: {
        ...mapGetters([
            'metadata',
            'metadataApplyPrivileges'
        ]),

        /**
         * @description 元数据数组转为Object类型，方便初始化编排数据获取对应的元数据信息
         */
        metadataAsObj () {
            let rst = {}
            this.metadata.forEach(
                item => {
                    rst[item.service_code] = item
                }
            )
            return rst
        },
        
        basicMetadataCodes () {
            return this.metadata.filter(meta => { return meta.group !== 'blueprint' })
                .map(meta => { return meta.service_code })
        },

        checkedNode () {
            if (this.node)
                return this.node
            return {
                id: '',
                data: {
                    info: {
                        name: ''
                    }
                }
            }
        },

        allAttributeString () {
            if (this.allAttributes)
                return JSON.stringify(this.allAttributes)

            return '{}'
        },

        /**
         * @description 汇总包含动态显示表单项规则的attribute
         */
        hasLinkFormItems () {
            let rst = {}
            this.allBasicResources.forEach(
                res => {
                    if (!this.allAttributes[res.id] || !this.allAttributes[res.id].length) {
                        rst[res.id] = []
                        return
                    }
                    rst[res.id] = this.allAttributes[res.id].filter(
                        item => {
                            if (item.link)
                                return item
                        }
                    )
                }
            )

            return rst
        },

        hasLinkFormItemKeys () {
            let rst = {}

            this.allBasicResources.forEach(
                res => {
                    rst[res.id] = this.hasLinkFormItems[res.id].map(
                        item => {
                            return item.id
                        }
                    )
                }
            )

            return rst
        },

        formItemLinkedInfo () {
            let rst = {}
            this.allBasicResources.forEach(
                res => {
                    rst[res.id] = {}
                    this.hasLinkFormItems[res.id].forEach(
                        item => {
                            rst[res.id][item.id] = item.link
                        }
                    )
                }
            )
            return rst
        },

        /**
         * @description 动态汇总需要显示的attribute(元数据linked:true)
         */
        showLinkedItems () {
            let rst = {}, self = this
            self.allBasicResources.forEach(
                res => {
                    let linkedKeys = []
                    self.hasLinkFormItemKeys[res.id].forEach(
                        itemKey => {
                            if (self.configs[res.id]['formData'][itemKey] && self.formItemLinkedInfo[res.id][itemKey]['link_' + self.configs[res.id]['formData'][itemKey]])
                                linkedKeys = linkedKeys.concat(self.formItemLinkedInfo[res.id][itemKey]['link_' + self.configs[res.id]['formData'][itemKey]])
                        }
                    )
                    rst[res.id] = linkedKeys
                }
            )
            return rst
        },

        basicConfigMoreData () {
            return this.externalFormData
        },

        providerExternalFormData () {
            return { ...this.configs, ...{owner: this.externalFormData.owner, owner_type: this.externalFormData.ownerType} }
        }
    },

    watch: {
        /**
         * @description UCMP3-2411 初始化表单切换显示/隐藏开关的值，默认true显示
         */
        'allBasicResources.length' (newVal, oldVal) {
            this.dynamicUpdateResourceAttribute()
            if (!newVal || newVal === oldVal)
                return
            this.sortAllBasicResources()
        },
        allAttributeString (newVal, oldVal) {
            if (newVal === oldVal)
                return
            
            this.setAllResourceAttrs(JSON.parse(newVal))
        },
        // UCMP3-2528 去掉资源描述的前后空格
        'checkedNode.data.info.description' (newVal, oldVal) {
            if (!newVal) return
            this.node.data.info.description = newVal.replace(/(^\s*)|(\s*$)/g, '')
        },
        nasValid: {
            deep: true,
            handler (newVal, oldVal) {
                if (newVal.length) {
                    newVal.forEach(nasItem => {
                        this.allBasicResources.filter(res => nasItem.id.indexOf(res.id) !== -1).forEach(res => this.setResourceAttribute(res))
                    })
                }
            }
        }
    },

    components: {
        DynamicForm,
        TargetNodeRelatedConfigForms,
        BlueprintResourceCfgs,
        MoreConfForm,
        BlueprintProviderConf
    }
}
</script>

<style lang="scss" scoped>
.config-container {
    width: 100%;
    height: 100%;
    .config-title {
        height: 50px;
        line-height: 50px;
    }
}

.apply_service_name {
    margin-left: -10px;
    margin-top: -10px;
    margin-right: -10px;
    padding-top: 5px;
    padding-left: 10px;
    cursor: pointer;
}
.cursor-icon {
    float: right;
    padding-right: 10px;
}
.nickname {
    width: 100px;
}
.ucmp-icon-invalid {
    &:before {
        position: absolute;
        left: -20px;
        top: 3px;
        color: $danger;
    }
}
.edit-privilege-warning {
    display: inline-block;
    margin-left: 16px;
    font-size: 12px;
}
</style>
<style lang="scss">
.config-form-title {
    padding-top: 10px;
    color: $fontTitleLight;
    &:hover {
        color: $themeColor;
    }
}
</style>
