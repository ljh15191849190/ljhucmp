<template lang="pug">
    div.config-container(:class="{'gray-bg': !showAllItems}")
        div.config-title.border-bottom.padding-left.d-flex(v-if="!showAllItems")
            el-button(type="text" icon="el-icon-arrow-right" @click="hidePropertyForm")
            //- bug UCMP-450【应用编排】编排名称过长时显示问题
            el-input.nickname(size="mini" v-if="checkedNode && checkedNode.data && checkedNode.data.info" v-model="checkedNode.data.info.name")
            el-button(type="text" @click="showNodeConfig") 切换资源配置
        div.form-content
            div.config-form-title 基础信息
            DynamicForm(
                v-for="res in allBasicResources"
                :key="res.id"
                v-show="checkedNode && (checkedNode.id === res.id)"
                :formItems="allAttributes[res.id]"
                :formData.sync="configs[res.id].formData"
                uniqueKey="id"
                labelPosition="top"
                :resourceId="res.id"
            )
                div(slot="MoreConfForm")
                    TargetNodeRelatedPropertyForms(
                        ref="linkCfgRef"
                        :linkConfigs.sync="linkConfigs"
                        :allLinks="defaultLinks"
                        :targetNode="res"
                        @defineCheckedLink="defineCheckedLink"
                    )
</template>
<script>
/**
 * @description 资源节点参数属性配置(只读)表单
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import TargetNodeRelatedPropertyForms from './TargetNodeRelatedForms'
import metaUtils from '@/server/metadata.utils'
import { mapGetters } from 'vuex'

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

        showAllItems: {
            type: Boolean,
            default: () => false
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

        defaultLinks: {
            type: Array,
            default: function () {
                return []
            }
        }
    },

    data () {
        return {
            splitSymbol: '#' // UCMP3-2527 生成id的分隔符指定为#，区别参数配置表单，否则两个表单的校验将混合在一起
        }
    },

    methods: {
        hidePropertyForm () {
            this.$emit('update:showPropertiesConfig', false)
        },

        showNodeConfig () {
            this.$emit('update:showConfig', true)
            this.$emit('update:showPropertiesConfig', false)
        },
        defineCheckedLink (link) {
            this.$emit('defineCheckedLink', link)
        }
    },

    computed: {
        ...mapGetters([
            'metadata'
        ]),

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

        allAttributes () {
            let attributes = {}
            let allBasicResources = JSON.parse(JSON.stringify(this.allBasicResources))
            allBasicResources.forEach(
                item => {
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
                            if (attr.orchestrate && attr.key !== 'init_script' && !attr.disable_apply_orchestrate)
                                return attr
                        }
                    )
                    attributes[item.id] = JSON.parse(JSON.stringify(filteredAttrs)).map(
                        attr => {
                            return metaUtils.updatePropertiesAttribute(attr)
                        }
                    )

                    metaUtils.updateAttributeType(attributes[item.id], {}, item.id, {}, this.splitSymbol)
                }
            )

            return attributes
        }
    },

    components: {
        DynamicForm,
        TargetNodeRelatedPropertyForms
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
</style>
