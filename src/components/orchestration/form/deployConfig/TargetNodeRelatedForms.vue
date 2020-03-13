<template lang="pug">
div.link-config-content
    div.loop-container(v-for="link in currentTargetReferToLinks")
        div.config-form-title(v-if="link.source.data.info && link.target.data.info" @mouseover="focusWidget(link.id)" @mouseout="focusWidget('')") {{ link.source.data.info.name + '-->' + link.target.data.info.name + '配置'}}
        DynamicForm.config-dynamic-form(
            :key="link.id"
            :showLinkedItemKeys="showLinkedAttributes[link.id]"
            :formItems="allAttributes[link.id]"
            :formData.sync="linkConfigs[link.id]"
            uniqueKey="id"
            :labelPosition="isApplyHandle ? 'left' : 'top'"
            :inline="isApplyHandle"
            :isApplyHandle="isApplyHandle"
            :keepValueFitDom="keepValueFitDom"
            :disableValidate="disableValidate"
            @focusWidget="focusWidget"
            @blurWidget="focusWidget('')"
        )
</template>
<script>
/**
 * @description 选中节点(target)对应的连线配置表单集合
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import metaUtils from '@/server/metadata.utils'
import { mapGetters } from 'vuex'

export default {
    inject: ['$validator'],
    props: {
        targetNode: {
            type: Object,
            default: null
        },
        allLinks: {
            type: Array,
            default: function () {
                return []
            }
        },
        configs: {
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
        linkPropertiesConfig: {
            type: Object,
            default: function () {
                return {}
            }
        },
        ifOrchestrate: {
            type: Boolean,
            default: true
        },
        // 是否为申请资源流程
        isApplyHandle: {
            type: Boolean,
            default: () => false
        },
        editPrivilege: {
            type: Boolean,
            default: () => true
        },
        disableValidate: Boolean
    },

    data () {
        return {
            keepValueFitDom: true,
            splitSymbol: '@' // UCMP3-2527 生成id的分隔符指定为@，区别参数可读性配置表单，否则两个表单的校验将混合在一起
        }
    },

    computed: {
        ...mapGetters([
            'allResourceAttrs'
        ]),

        allLinksAsTargetObj () {
            let rst = {}
            this.allLinks.forEach(
                link => {
                    if (link.target && link.target.data && link.target.data.id) {
                        rst[link.target.data.id] = rst[link.target.data.id] ? rst[link.target.data.id] : []
                        rst[link.target.data.id].push(link)
                    }
                }
            )
            return rst
        },

        /**
         * @description 给定的target节点关联的连线集合
         */
        currentTargetReferToLinks () {
            if (!this.targetNode || !this.targetNode.id || !this.allLinksAsTargetObj[this.targetNode.id])
                return []
            return this.allLinksAsTargetObj[this.targetNode.id]
        },

        /**
         * @description 所有连线的attibute列表
         */
        allAttributes () {
            if (!this.allLinks || !this.allLinks.length)
                return []
            let attributes = {}
            this.allLinks.forEach(
                link => {
                    let source = this.getSourceNode(link)
                    let target = this.getTargetNode(link)

                    attributes[link.id] = this.getRelatedAttributes(source, target, link.id)
                }
            )
            return attributes
        },

        /**
         * @description 以单条连线为维度，汇总其下source、target、link的所有attribute列表
         */
        allLinkAttributes () {
            let rst = {}

            this.allLinks.forEach(
                link => {
                    let attrs = []
                    let sourceAttrs = this.allResourceAttrs[link.source.id] ? this.allResourceAttrs[link.source.id] : []
                    let targetAttrs = this.allResourceAttrs[link.target.id] ? this.allResourceAttrs[link.target.id] : []
                    rst[link.id] = attrs.concat(sourceAttrs).concat(targetAttrs).concat(this.allAttributes[link.id])
                }
            )

            return rst
        },

        /**
         * @description 以单条连线为维度，汇总其下source、target、link的所有attribute取值信息
         */
        allLinkConfigs () {
            let rst = {}
            this.allLinks.forEach(
                link => {
                    let sourceConfigs = this.configs[link.source.id] && this.configs[link.source.id].formData ? this.configs[link.source.id].formData : {}
                    let targetConfigs = this.configs[link.target.id] && this.configs[link.target.id].formData ? this.configs[link.target.id].formData : {}
                    // 修改连线配置表单的值一直为空的问题
                    let linkConfigs = this.linkConfigs[link.id] ? this.linkConfigs[link.id] : {}

                    rst[link.id] = {}
                    Object.assign(rst[link.id], sourceConfigs, targetConfigs, linkConfigs)
                }
            )

            return rst
        },

        /**
         * @description 以单条连线为维度，汇总包含动态显示表单项规则的attribute
         */
        hasLinkFormItems () {
            let rst = {}
            this.allLinks.forEach(
                link => {
                    if (!this.allLinkAttributes[link.id] || !this.allLinkAttributes[link.id].length)
                        rst[link.id] = []
                    rst[link.id] = this.allLinkAttributes[link.id].filter(
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

            this.allLinks.forEach(
                link => {
                    rst[link.id] = this.hasLinkFormItems[link.id].map(
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
            this.allLinks.forEach(
                link => {
                    rst[link.id] = {}
                    this.hasLinkFormItems[link.id].forEach(
                        item => {
                            rst[link.id][item.id] = item.link
                        }
                    )
                }
            )
            return rst
        },

        /**
         * @description 动态汇总需要显示的attribute(元数据linked:true)
         */
        showLinkedAttributes () {
            let rst = {}, self = this
            self.allLinks.forEach(
                link => {
                    let linkedKeys = []
                    self.hasLinkFormItemKeys[link.id].forEach(
                        itemKey => {
                            if (self.allLinkConfigs[link.id][itemKey] && self.formItemLinkedInfo[link.id][itemKey]['link_' + self.allLinkConfigs[link.id][itemKey]]) {
                                // 源id由 资源id + '@' + key组成，需要更换为 连线id + '@' + key
                                let transformedKeys = self.formItemLinkedInfo[link.id][itemKey]['link_' + self.allLinkConfigs[link.id][itemKey]].map(
                                    _key => {
                                        return link.id + this.splitSymbol + _key.split(this.splitSymbol)[1]
                                    }
                                )
                                linkedKeys = linkedKeys.concat(transformedKeys)
                            }
                        }
                    )
                    rst[link.id] = linkedKeys
                }
            )
            return rst
        },

        /**
         * @description 连线配置转为string，方便 vue 观察其变化
         */
        linkConfigStrings () {
            return JSON.stringify(this.linkConfigs)
        }
    },

    watch: {
        linkConfigStrings (newVal, oldVal) {
            if (newVal === oldVal)
                return

            this.allLinks.forEach(
                link => {
                    // NAS与云主机的连线，把连线的nas_fs_type信息赋值给NAS节点配置
                    if (link.type === 'shared') {
                        let target = link.target.id ? link.target.id : link.target
                        this.$set(this.configs[target].formData, target + this.splitSymbol + 'nas_fs_type', this.linkConfigs[link.id][link.id + this.splitSymbol + 'nas_fs_type'])
                    }
                }
            )
        }
    },

    methods: {
        hideConfig () {
            this.$emit('update:showConfig', false)
        },

        getSourceNode (link) {
            if (!link || !link.source || !link.source.data)
                return null
            return link.source
        },

        getTargetNode (link) {
            if (!link || !link.target || !link.target.data)
                return null
            return link.target
        },

        /**
         * @description 连线属性列表
         */
        getRelatedAttributes (source, target, id) {
            if (!source || !target || !source.data.info || !source.data.info.related_service)
                return []
            let relatedServices = source.data.info.related_service
            let linkedService = relatedServices.filter(
                service => {
                    if (service.service_code === target.data.info.service_code)
                        return service
                }
            )

            if (!linkedService.length)
                return []
            // 过滤得到允许编排使用的属性列表
            let attributes = linkedService[0].attribute.filter(
                attr => {
                    if (attr.orchestrate)
                        return attr
                }
            )
            let self = this
            let copiedAttrs = JSON.parse(JSON.stringify(attributes))
                .map(
                    attr => {
                        // 应用编排编辑模式，不做disabled的特殊配置，默认都可以编辑
                        if (!this.isApplyHandle)
                            return attr
                        // UCMP3-2640 当前用户没有修改该服务的权限
                        if (!this.editPrivilege)
                            attr.disabled = true
                        // UCMP3-2523 根据应用编排配置的参数可读性，设置其表单项是否可读
                        if (!attr.disabled && attr.orchestrate && self.linkPropertiesConfig[id]) {
                            let properties = self.linkPropertiesConfig[id][id + '#' + attr.key]
                            attr.disabled = properties && Array.isArray(properties) && properties.indexOf('readonly') !== -1
                        }
                        return attr
                    }
                )
            // 更改元数据attribute列表的type为实际的表单控件类型
            metaUtils.updateAttributeType(copiedAttrs, null, id, { popper_not_to_body: true })
            return copiedAttrs ? copiedAttrs : []
        },
        focusWidget (formId) {
            if (formId || formId.toString) {
                let idArr = formId.split(this.splitSymbol)
                if (idArr.length > 0)
                    this.$emit('defineCheckedLink', idArr[0])
                else
                    this.$emit('defineCheckedLink', null)
            }
        }
    },

    components: {
        DynamicForm
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
    .form-content {
        height: calc(100% - 50px);
    }
}
</style>
