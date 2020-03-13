<template lang="pug">
    div.blueprint-instance-detail(v-if="resource" @mouseover="mouseover(resource)")
        div.service-name.gray-bg(@click="toggleDetail")  {{resourceName}}
            i.cursor-icon(:class="[switches && switches[currentId] ? 'el-icon-caret-top' : 'el-icon-caret-bottom']")
        ResourceGroupItemDetail(
            v-for="group in groupAtttributes"
            v-show="switches[currentId]"
            :key="group.id"
            :groupName="group.name"
            :groupId="group.id"
            :displayList="displayConstructor(group)"
            )
</template>
<script>
import RelatedEcsList from './RelatedEcsList'
import ResourceGroupItemDetail from './ResourceGroupItemDetail'
import metaUtils from '@/server/metadata.utils'
import { mapGetters } from 'vuex'

export default {
    props: [ 'resource', 'defaultResources', 'configs', 'dependencies', 'switches' ],

    data () {
        return {
            detailColspan: 6,
            commonGroups: [
                {id: 'basic', name: '基础信息'},
                {id: 'provider', name: '厂商信息'}
            ]
        }
    },

    computed: {
        ...mapGetters([
            'metadata'
        ]),

        currentServiceCode () {
            return this.resource.service_code
        },

        currentId () {
            return this.resource.id
        },

        resourceName () {
            return this.metadataObjs[this.currentServiceCode].name + '(' + (this.resource.info && this.resource.info.name ? this.resource.info.name : '') + ')'
        },

        currentProviderCode () {
            if (this.currentId && this.configs && this.configs[this.currentId] && this.configs[this.currentId].formData)
                return this.configs[this.currentId].formData[this.currentId + '@provider_code']
            return ''
        },

        metadataObjs () {
            let rst = {}
            this.metadata.forEach(meta => {
                rst[meta.service_code] = meta
            })

            // UCMP3-3553【个人中心】申请单管理，申请单详情页面，点击每一个服务的收缩按钮后再展示，信息展示缺失
            return JSON.parse(JSON.stringify(rst))
        },

        groupAtttributes () {
            // 普通分组：基础信息、厂商信息
            let commonGroupAttrs = this.commonGroups.map(
                group => {
                    if (!this.metadataObjs || !this.metadataObjs[this.currentServiceCode]) return {}

                    let currentMetadata = this.metadataObjs[this.currentServiceCode]
                    if (group.id === 'basic' && currentMetadata.attribute) {
                        return {
                            id: group.id,
                            name: group.name,
                            uniqueKey: 'id',
                            attribute: currentMetadata.attribute.filter(attr => attr.created || attr.orchestrate).addId(this.currentId)
                        }
                    } else if (group.id === 'provider' && this.currentProviderCode && currentMetadata.provider_conf && currentMetadata.provider_conf[this.currentProviderCode] && currentMetadata.provider_conf[this.currentProviderCode].attribute) {
                        return {
                            id: group.id,
                            name: group.name,
                            uniqueKey: 'id',
                            attribute: currentMetadata.provider_conf[this.currentProviderCode].attribute.addId(this.currentId)
                        }
                    }
                    return {}
                }
            ).filter(
                group => !!group.name
            )

            // 连线关联配置分组
            let relatedGroups = this.currentTargetReferToLinks.map(
                link => {
                    if (this.currentLinkAttribute[link.id] && this.currentLinkAttribute[link.id].length) {
                        return {
                            id: link.id,
                            name: link.source.data.info.name + '->' + link.target.data.info.name + '配置',
                            uniqueKey: 'key',
                            attribute: this.currentLinkAttribute[link.id]
                        }
                    } else return {}
                }
            ).filter(link => !!link.id)
            return commonGroupAttrs.concat(relatedGroups)
        },

        dependenciesAsTargetObj () {
            let rst = {}
            this.dependencies.forEach(
                link => {
                    if (link.target && link.target.data && link.target.data.id) {
                        rst[link.target.data.id] = rst[link.target.data.id] ? rst[link.target.data.id] : []
                        rst[link.target.data.id].push(link)
                    }
                }
            )
            return rst
        },

        dependenciesAsLinkObj () {
            let rst = {}
            this.dependencies.forEach(
                link => {
                    rst[link.id] = link
                }
            )
            return rst
        },

        /**
         * @description 给定的target节点关联的连线集合
         */
        currentTargetReferToLinks () {
            if (!this.currentId || !this.dependenciesAsTargetObj[this.currentId])
                return []
            return this.dependenciesAsTargetObj[this.currentId]
        },

        currentLinkAttribute () {
            let attributes = {}
            this.currentTargetReferToLinks.forEach(
                link => {
                    attributes[link.id] = JSON.parse(JSON.stringify(metaUtils.getRelatedAttributesByIdAndRule(link.source, link.target, link.id, 'orchestrate|created')))
                }
            )

            return attributes
        }
    },

    created () {
        this.attributeArrayAddId()
    },

    methods: {
        attributeArrayAddId () {
            Array.prototype.addId = function (id) {
                return this.map(
                    item => {
                        item.id = id + '@' + item.key
                        return item
                    }
                )
            }
        },

        toggleDetail () {
            this.switches[this.currentId] = !this.switches[this.currentId]
        },

        displayConstructor (group) {
            return group.attribute.map(
                attr => {
                    let display = this.configs && this.configs[this.currentId] && this.configs[this.currentId].display ? this.configs[this.currentId].display : {}
                    if (group.id === 'basic' && display[attr[group.uniqueKey]]) {
                        // 基础信息配置
                        return {
                            key: attr.key,
                            label: attr.label,
                            value: display[attr[group.uniqueKey]]
                        }
                    } else if (group.id === 'provider' && display[this.currentId + '@provider_conf'] && display[this.currentId + '@provider_conf'][attr.key]) {
                        // 厂商信息配置
                        return {
                            key: attr.key,
                            label: attr.label,
                            value: display[this.currentId + '@provider_conf'][attr.key]
                        }
                    } else if (group.id !== 'basic' && group.id !== 'provider' && this.dependenciesAsLinkObj[group.id]) {
                        // 连线关联配置
                        return {
                            key: attr.key,
                            label: attr.label,
                            value: this.dependenciesAsLinkObj[group.id].values[attr.key]
                        }
                    } else return {}
                }
            ).filter(item => !!item.key)
        },

        mouseover (resource) {
            this.$emit('detailMouseover', resource.id)
        }
    },

    components: {
        RelatedEcsList,
        ResourceGroupItemDetail
    }
}
</script>
<style lang="scss" scoped>
.blueprint-instance-detail {
    margin-top: 16px;
}
.service-name {
    cursor: pointer;
}
.cursor-icon {
    float: right;
    padding-right: 10px;
}
</style>
