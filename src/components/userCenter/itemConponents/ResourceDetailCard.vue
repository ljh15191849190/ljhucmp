<template lang="pug">
    div.resource-detail-content
        div.resource-item.instance-detail(v-for="(item, idx) in resourceDetail" :key="idx")
            el-row(:gutter="20")
                el-col.padding-row(:span="8")
                    span.col-name 服务名称:
                    span.col-value {{item.title}}
                el-col.padding-row(:span="8" v-for="(displayItem, idx) in item.display" :key="idx" v-title-tip)
                    span.col-name {{displayItem.label}}：
                    span.icon(v-if="displayItem.icon" :class="displayItem.value")
                    span.col-value(v-else) {{displayItem.value}}
</template>
<script>
// 已有资源的详情面板，仅供展示详情信息（任务单详情/申请单详情/审批任务详情中使用）
import MetadataUtils from '@server/metadata.utils'
import dateUtils from '@server/date-utils'
import {Owners} from '@server/ConstParams'

export default {
    props: [ 'resources', 'metadata' ],
    data () {
        return {}
    },
    methods: {
        /**
         * @description 格式化资源详情key
         */
        formatLabel (service_code, attrItem) {
            if (service_code === 'volume' && attrItem.key === 'ecs_instance_id')
                return '挂载云主机'
            return attrItem.unit ? attrItem.label + '(' + attrItem.unit + ')' : attrItem.label
        },
        /**
         * @description 格式化资源详情value
         */
        getFormatValue (service_code, currentItem, value, resouceItem) {
            return MetadataUtils.getFormatOrderDetailValue(service_code, currentItem, value, resouceItem)
        },

        /**
         * @description 处理group的显示
         */
        formatGroupDisplay (attr, displays, resouceItem) {
            MetadataUtils.formatGroupDisplay(attr, displays, resouceItem)
        },

        formatDate (date) {
            return (date && date !== '--') ? dateUtils.formate(date) : '--'
        }
    },
    computed: {
        basicMetadataCodes () {
            return this.metadata.filter(meta => { return meta.group !== 'blueprint' })
                .map(meta => { return meta.service_code })
        },
        resourceDetail () {
            // 格式化资源信息
            if (!this.resources) return []

            let resourceDetail = []
            Object.values(this.resources).forEach(resource => {
                let serviceItem = this.metadata.find(item => item.service_code === resource.service_code)
                if (serviceItem) {
                    let attributes = serviceItem.attribute.filter(attr => attr.core_attr)
                    // let resouceItem = this.resources[resource.instance_id]
                    // resources.forEach(resouceItem => {
                        let resource_item = {
                            title: serviceItem.name,
                            service_code: serviceItem.service_code,
                            display: []
                        }
                        attributes.forEach(attrItem => {
                            if (resource[attrItem.key] !== undefined) {
                                let displayItem = {
                                    key: attrItem.key,
                                    label: this.formatLabel(resource.service_code, attrItem),
                                    value: this.getFormatValue(resource.service_code, attrItem, resource[attrItem.key], resource),
                                    icon: attrItem.icon
                                }
                                resource_item.display.push(displayItem)

                                if (attrItem.table_column_group)
                                    this.formatGroupDisplay(attrItem, resource_item.display, resource)
                            }
                        })
                        // pool展示
                        // UCMP3-5580 【服务目录】F5实例pool节点添加或者删除节点，申请单详细显示有问题（见截图）
                        if (resource.service_code === 'pool') {
                            let findParentKey = resource_item.display.find(findParentItem => findParentItem.key === 'parent')
                            let findSendIndex = resource_item.display.findIndex(findSendItem => findSendItem.key === 'send')
                            // 健康检查算法(key为parent)不是http不展示健康检查URL(key为send)
                            if (findParentKey.value !== 'http') resource_item.display.splice(findSendIndex, 1)
                            // UCMP3-5903 健康检查算法(key为parent) 为ping或tcp时 返回值不展示
                            let findReceive = resource_item.display.findIndex(findReceiveItem => findReceiveItem.key === 'receive')
                            if (['ping', 'tcp'].indexOf(findParentKey.value) > -1) resource_item.display.splice(findReceive, 1)
                        }

                        if (resource.owner_type) {
                            //资源归属
                            let ownerItem = {
                                label: '资源归属',
                                value: Owners[resource.owner_type] || '--'
                            }
                            resource_item.display.push(ownerItem)
                        }

                        // 续期
                        // UCMP3-3284【申请单管理】资源续期（属于修改类的），申请单详情中需要展示修改前的租期、修改后的租期
                        if (resource.after_renewal_time && resource.before_renewal_time) {
                            let afterItem = {
                                label: '续期后租期',
                                value: this.formatDate(resource.after_renewal_time)
                            }

                            let beforeItem = {
                                label: '续期前租期',
                                value: this.formatDate(resource.before_renewal_time)
                            }

                            resource_item.display.push(beforeItem)
                            resource_item.display.push(afterItem)
                        }

                        resourceDetail.push(resource_item)
                    // })
                }
            })

            let getServiceCode = (item) => {
                return item.service_code
            }
            resourceDetail.sortAsMetadataOrder(this.basicMetadataCodes, getServiceCode)
            return resourceDetail
        }
    }
}
</script>
