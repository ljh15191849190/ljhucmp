<template lang="pug">
div.link-config-content
    div.loop-container(v-for="link in currentTargetReferToLinks")
        div.config-form-title(v-if="link.source.data.info && link.target.data.info" @mouseover="focusWidget(link.id)" @mouseout="focusWidget('')") {{ link.source.data.info.name + '-->' + link.target.data.info.name + '配置'}}
        DynamicForm.config-dynamic-form(
            :key="link.id"
            :formItems="allAttributes[link.id]"
            :formData.sync="linkConfigs[link.id]"
            uniqueKey="id"
            labelPosition="top"
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
        linkConfigs: {
            type: Object,
            default: function () {
                return {}
            }
        }
    },

    data () {
        return {
            splitSymbol: '#' // UCMP3-2527 生成id的分隔符指定为#，区别参数配置表单，否则两个表单的校验将混合在一起
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

                    attributes[link.id] = JSON.parse(JSON.stringify(metaUtils.getRelatedAttributesByIdAndRule(source, target, link.id, 'orchestrate', '#')))
                        .map(
                        attr => {
                            return metaUtils.updatePropertiesAttribute(attr)
                        }
                    )
                }
            )
            return attributes
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
            let copiedAttrs = JSON.parse(JSON.stringify(attributes))
            // 更改元数据attribute列表的type为实际的表单控件类型
            metaUtils.updateAttributeType(copiedAttrs, null, id, { popper_not_to_body: true }, this.splitSymbol)
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
