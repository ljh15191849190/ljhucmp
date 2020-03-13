import Utils from '@server/Utils'
import MetadataUtils from '@server/metadata.utils'
import { mapGetters, mapActions } from 'vuex'

/* eslint-disable */
export default {
    methods: {
        ...mapActions([
            'setFormDataAndDisplay',
            'setBpResources',
            'setBpDependencies',
            'setBpForm'
        ]),
        /**
         * @description 转义表单的值 id -> key
         * @param {*} configs
         */
        transformFormDataInKey (configs, splitSymbol = '@', providerConfData, providerCodeData) {
            // UCMP3-2527 splitSymbol 生成id的分隔符默认为@。也可指定其他符号
            let rst = {}

            this.basicResources.forEach(
                item => {
                    let formData = {}, display = {}
                    // 存在该资源的配置表单
                    if (configs[item.id] && configs[item.id].formData && JSON.stringify(configs[item.id].formData) !== '{}') {
                        let attribute = JSON.parse(JSON.stringify(item.info.attribute))

                        // 修复申请编排实例没有初始化脚本数据的问题
                        if (item.info.extends && item.info.extends.service_code && item.info.extends.attribute)
                            attribute = attribute.concat(MetadataUtils.getExtendAttributes(item.info.extends.service_code, item.info.extends.attribute, this.metadata))
                        if (item.info.related_service && item.info.related_service.length)
                            attribute = attribute.concat(MetadataUtils.getRelatedServiceAttributes(item.info.related_service, this.metadata))

                        // 深拷贝当前资源的表单值
                        let copiedformData = JSON.parse(JSON.stringify(configs[item.id].formData))
                        
                        // UCMP3-1367 蓝图服务审批时，转义厂商、配置模板的信息
                        // UCMP3-3216 订单明细修改参数，不需要用户权限，否则厂商信息无法合入表单数据中
                        //UCMP3-3488【个人中心】审批管理-光大总流程，申请服务lantu_cax_all，db、F5、中间件审批完成后post请求中ip设置关联信息丢失
                        if (this.providerConf && providerConfData && providerConfData[item.id] && providerConfData[item.id].formData && providerConfData[item.id].display) {
                            formData.provider_id = providerConfData[item.id].formData[item.id + '@provider_id'] ? providerConfData[item.id].formData[item.id + '@provider_id'] : null
                            display.provider_id = providerConfData[item.id].display[item.id + '@provider_id'] ? providerConfData[item.id].display[item.id + '@provider_id'] : ''
                            formData.provider_code = providerCodeData[item.id] ? providerCodeData[item.id] : null

                            formData.template_id = providerConfData[item.id].formData[item.id + '@template_id'] ? providerConfData[item.id].formData[item.id + '@template_id'] : null
                            // 转义 拼接的 id 为实际的key，赋值给formData，拼装厂商数据到配置表单中
                            if (!formData.provider_conf) formData.provider_conf = {}
                            if (!display.provider_conf) display.provider_conf = {}

                            Object.keys(providerConfData[item.id].formData).forEach(
                                confItem => {
                                    let key = confItem.indexOf('@') > -1 ? confItem.split('@')[1] : confItem
                                    if (key === 'provider_id') return
                                    formData.provider_conf[key] = providerConfData[item.id].formData[confItem]
                                    display.provider_conf[key] = providerConfData[item.id].display[confItem]
                                }
                            )
                        }
                        attribute.forEach(
                            attr => {
                                // if (attr.created || attr.orchestrate) {
                                if (configs[item.id].formData[item.id + splitSymbol + attr.key] !== undefined && configs[item.id].formData[item.id + splitSymbol + attr.key] !== null) {
                                    formData[attr.key] = configs[item.id].formData[item.id + splitSymbol + attr.key]
                                    // 从拷贝的表单值中删除已经转化并赋值的条目
                                    delete copiedformData[item.id + splitSymbol + attr.key]
                                }
                                if (configs[item.id].display[item.id + splitSymbol + attr.key] !== undefined && configs[item.id].display[item.id + splitSymbol + attr.key] !== null)
                                    display[attr.key] = configs[item.id].display[item.id + splitSymbol + attr.key]
                            }
                        )
                        // 剩余的表单值如果还有内容，拆除id为key并赋值给结果集
                        Object.keys(copiedformData).forEach(
                            formId => {
                                let _key = formId.split(splitSymbol)[1]
                                // UCMP3-3408【个人中心】带流程申请lantu_cax_all服务，cloudMgr审批时修改了ip点击同意前端传递的还是之前的值
                                // 问题原因: _key为provider_conf时, 进行复制取值不是最新的值
                                let isNotIncludeKeys = ['provider_conf', 'provider_id', 'provider_code']
                                if (_key && !isNotIncludeKeys.includes(_key)) {
                                    formData[_key] = configs[item.id].formData[formId]
                                    display[_key] = configs[item.id].display[formId]
                                }
                            }
                        )
                    }
                    rst[item.id] = {
                        formData,
                        display
                    }
                }
            )
            return rst
        },

        transformLinkFormDataInKey (link, configs, splitSymbol = '@') {
            // UCMP3-2527 splitSymbol 生成id的分隔符默认为@。也可指定其他符号
            let values = {}
            if (configs[link.id] && typeof configs[link.id] === 'object') {
                // 针对null特殊处理成''
                let linkConfig = JSON.parse(JSON.stringify(configs[link.id]))

                for (let key in linkConfig) {
                    if (!linkConfig[key])
                        linkConfig[key] = ''
                    if (key.match(new RegExp(link.id + splitSymbol + '.+'))) {
                        let attr_key = key.replace(link.id + splitSymbol, '')
                        values[attr_key] = linkConfig[key]
                    }
                }
            }
            return values
        }
    },

    computed: {
        ...mapGetters([
            'metadata'
        ]),

        /**
         * @description 资源依赖关系的表单数据
         */
        dependencies () {
            return this.defaultLinks.map(
                link => {
                    let values = this.transformLinkFormDataInKey(link, this.linkConfigs)
                    return {
                        id: link.id,
                        source: link.source && link.source.id ? link.source.id : link.source,
                        target: link.target && link.target.id ? link.target.id : link.target,
                        values: values,
                        type: link.type,
                        description: link.description
                    }
                }
            )
        },

        dependencieString () {
            if (this.dependencies)
                return JSON.stringify(this.dependencies)
            return '[]'
        },

        /**
         * @description 画布中基础资源(非编排)列表
         */
        basicResources () {
            return this.defaultResources.filter(
                item => {
                    if (item.info && !item.info.group || item.info && item.info.group && item.info.group !== 'blueprint')
                        return item
                }
            )
        },

        blueprintmeta () {
            return MetadataUtils.blueprintMetas(this.defaultResources, this.resourceCfgFormAttrs, this.rootId)
        },

        /**
         * @description 转义画布资源配置的表单数据
         * 资源配置的表单数据为了区分同一类型的表单，添加了唯一标志id，提交表单前需要转义
         */
        resourceCfgFormAttrs () {
            return this.transformFormDataInKey(this.configs, '@', this.providerConfData, this.providerCodeData)
        },

        resourceCfgFormAttrString () {
            if (this.resourceCfgFormAttrs)
                return JSON.stringify(this.resourceCfgFormAttrs)
            return '{}'
        },

        /**
         * @description 保存编排使用的资源层次结构数据
         */
        resources () {
            return Utils.transformTreeMapData(this.blueprintmeta, 'id', 'reference', 'includings', null)
        },

        resourceString () {
            if (this.resources)
                return JSON.stringify(this.resources)
            return '{}'
        },

        /**
         * @description 资源节点参数属性配置表单的值
         */
        transformedPropertiesConfig () {
            let formData = {}
            let formObj = this.transformFormDataInKey(this.propertiesConfig, '#')
            Object.keys(formObj).forEach(
                key => {
                    formData[key] = formObj[key].formData
                }
            )
            return formData
        },

        /**
         * @description 连线参数属性配置表单的值
         */
        transformedLinkPropertiesConfig () {
            let values = {}
            this.defaultLinks.forEach(
                link => {
                    values[link.id] = this.transformLinkFormDataInKey(link, this.linkPropertiesConfig, '#')
                }
            )
            return values
        },

        /**
         * @description 保存编排表单数据
         */
        blueprintForm () {
            let basicForm = {
                resources: this.resources,
                dependencies: this.dependencies
            }
            if (this.transformedPropertiesConfig)
                basicForm.properties = this.transformedPropertiesConfig
            if (this.transformedLinkPropertiesConfig)
                basicForm.linkProperties = this.transformedLinkPropertiesConfig
            return basicForm
        }
    },
    watch: {
        /**
         * @description UCMP3-2527 resourceCfgFormAttrs保持至vuex, 以便申请时使用
         * @param {*} newVal
         * @param {*} oldVal
         */
        resourceCfgFormAttrString (newVal, oldVal) {
            if (newVal === oldVal)
                return
            this.setFormDataAndDisplay(this.resourceCfgFormAttrs)
        },

        /**
         * @description UCMP3-2527 resources保持至vuex, 以便申请时使用
         * @param {*} newVal
         * @param {*} oldVal
         */
        resourceString (newVal, oldVal) {
            if (!newVal || newVal === oldVal)
                return
            this.setBpResources(this.resources)
            this.setBpForm(this.blueprintForm)
        },

        /**
         * @description UCMP3-2527 dependencies保持至vuex, 以便申请时使用
         * @param {*} newVal
         * @param {*} oldVal
         */
        dependencieString (newVal, oldVal) {
            if (!newVal || newVal === oldVal)
                return
            this.setBpDependencies(this.dependencies)
            this.setBpForm(this.blueprintForm)
        }
    }
}
