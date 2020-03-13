// 该文件主要是根据serviceCode返回对应的metadata
import Config from '@/mock/metadata/metadata.config'
import MetadataUtils from '@server/metadata.utils'

export default {
    data () {
        return {}
    },
    methods: {
        getCheckedMeta (serviceCode) {
            if (!this.metadata.length)
                return { name: serviceCode, code: serviceCode, attribute: [] }
            let checkedMeta = MetadataUtils.getCheckedMeta(this.metadata, serviceCode)
            if (checkedMeta.attribute) {
                checkedMeta.attribute.forEach(
                    item => {
                        if (!item.validation)
                            item.validation = {}
                        item.validation.required = item.required
                    }
                )
            }
            return checkedMeta
        },
        /**
         * @description 前端对元数据attribute属性的补充配置，比如特殊控件的类型
         */
        configAttributeType (serviceCode, attribute) {
            let filteredConfig = Config.user_defined.filter(
                item => item.service_code === serviceCode
            )[0]
            if (!filteredConfig)
                return attribute
            let configAttribute = filteredConfig.attribute
            let mergedAttribute = JSON.parse(JSON.stringify(attribute))
            mergedAttribute.forEach(
                item => {
                    let type = configAttribute[item.key] && configAttribute[item.key].type ? configAttribute[item.key].type : item.type
                    this.$set(item, 'type', type)
                }
            )
            return mergedAttribute
        },

        /**
         * @description 获取自身的属性列表，作为表单项使用
         */
        getCheckedAttribute (serviceCode, filterRule = 'modified', filterLinked = 'linked') {
            let checkedMeta = JSON.parse(JSON.stringify(this.getCheckedMeta(serviceCode)))

            // eslint-disable-next-line
            if (!checkedMeta.service_code || checkedMeta.attribute && !checkedMeta.attribute.length)
                return { checkedMeta, attribute: [] }

            let attribute = checkedMeta.attribute.filter(
                item => {
                    return item[filterRule] || item[filterLinked]
                }
            )

            attribute = this.configAttributeType(checkedMeta.serviceCode, attribute)

            // 更改元数据attribute列表的type为实际的表单控件类型
            MetadataUtils.updateAttributeType(attribute)

            return {
                checkedMeta,
                attribute
            }
        }
    }
}
