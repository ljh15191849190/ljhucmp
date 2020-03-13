<template lang="pug">
div.form-detail-container
    //- 资源详细配置信息展示
    //- UCMP3-445【服务目录】申请单确认页面中的内容，除了基础配置之外，其他内容也需要添加展示。蓝图申请同样处理。
    div.details.padding-bottom(v-if="extendFormData && extendFormData.attribute && extendFormData.display")
        div.all-title.border-light-bottom 配置信息
        div.full-width
            div.service-title(v-if="!isOnlyShowBasic") 资源配置信息
            div.d-flex(v-for="(attr_key, attr_index) in Object.keys(extendFormData.display)" v-if="filterExtendItems(attr_key, extendFormData.display)" :key="attr_key" :class="{'dark-bg': attr_index % 2 === 0}")
                div.attribute-name {{ extendFormDataLabel(extendFormData.attribute[attr_key]) }}
                div.attribute-value {{ extendFormData.display[extendFormData.attribute[attr_key].key] }}
    div.details.border-top-0.no-margin-top(v-if="metaFormData && metaFormData.resources")
        div.full-width.padding-bottom(v-for="(resource, index) in metaFormData.resources"  :key="resource.id")
            div.service-title {{ metadataObj[resource.service_code] ? metadataObj[resource.service_code].name : '' }}
            div.d-flex
                div.full-width
                    div.d-flex(
                        v-for="(attr, attr_index) in formatAttributeConfs(resource)"
                        v-if="attr.value !== undefined || attr.value === null"
                        :key="attr_index"
                        :class="{'dark-bg': attr_index % 2 === 0}"
                    )
                        div.attribute-name {{attr.label}}
                        div.attribute-value(v-if="Array.isArray(attr.value)")
                            span(v-for="(item, index) in attr.value" :key="index")
                                span(v-if="Array.isArray(item)")
                                    span(v-for="(val, index) in item" :key="index") {{val ? val.label : ''}}: {{val ? val.value : ''}}
                                span(v-else-if="typeof item === 'object' && resource.service_code === 'juniper_policy'")
                                    span(v-for="(valAry, index) in Object.entries(item).sort(sortFn)" :key="index") {{valAry[1]}} &nbsp;
                                span(v-else) {{item.instance_name || item || ''}}
                                br
                        div.attribute-value(v-else) {{attr.value}}
</template>
<script>
import { mapGetters } from 'vuex'

export default {
    props: ['orderForm', 'metaFormData', 'attribute', 'extendFormData', 'isOnlyShowBasic'],
    data () {
        return {

        }
    },
    methods: {
        extendFormDataLabel (obj) {
            if (obj.key === 'business_name')
                obj.label = this.selectedBusinessLabel
            return obj.label
        },
        formatterTag (tag = []) {
            return tag.map(
                item => {
                    // tag_id 或 tag_type 为 null/undefined 时，将其作为 '' 处理
                    return (item.tag_type || '') + ':' + (item.tag_id || '')
                }
            )
        },

        handleScriptConf (val) {
            if (!val)
                return []
            else if (Array.isArray(val))
                return val
            else
                return JSON.parse(val)
        },

        getDisplayValue (conf) {
            let displayArr = []
            // conf.default 类型存在为数组array类型的场景
            let valueArr = []
            if (conf.default && Array.isArray(conf.default))
                valueArr = conf.default
            else if (conf.default && typeof conf.default === 'string')
                valueArr = JSON.parse(conf.default)
            valueArr.forEach(val_item => {
                let itemArr = []
                conf.children.forEach(item => {
                    Object.keys(val_item).forEach(each_pro => {
                        if (each_pro === item.key) {
                            itemArr.push({
                                label: item.label,
                                value: val_item[each_pro]
                            })
                        }
                    })
                })
                displayArr.push(itemArr)
            })
            return displayArr
        },

        // 对资源的各个参数进行整合，得到需要展示的参数列表（Array类型），其中每个参数为{label: '参数名'，value: '参数值'}的格式
        // 将主机参数中oracle等脚本需要展示的参数提取出来，和其他参数同级
        formatAttributeConfs (resource) {
            let displayList = [], formItems = this.constructedFormItemsByServiceCode[resource.service_code]
            Object.keys(formItems).forEach(key_item => {
                let attribute = formItems[key_item]
                // console.log(attribute)
                // UCMP3-3231【服务目录】申请青云缓存的时候左边的选项和右边的配置信息需要联动
                // UCMP3-2817 默认认为：多个item合并为一行显示的话需要直接显示
                // eslint-disable-next-line 
                if ((!attribute.fe_type || attribute.fe_type && attribute.fe_type.type !== 'multiItems') && !resource.attributes.hasOwnProperty(key_item)) return

                if (key_item === 'init_script') {
                    let scripts = this.handleScriptConf(resource.display[attribute.key])
                    scripts.forEach(script_item => {
                        if (script_item.params) {
                            script_item.params.forEach(conf => {
                                if (conf.creating_show) {
                                    if (conf.children) // array类型的脚本参数
                                        displayList.push({ label: conf.label, value: this.getDisplayValue(conf) })
                                    else
                                        displayList.push({ label: conf.label, value: conf.default })
                                }
                            })
                        }
                    })
                } else if (attribute.fe_type && attribute.fe_type.type === 'multiItems') {
                    // UCMP-1437 nas总大小和单位合并显示
                    let vals = attribute.children.map(
                        item => {
                            return this.getDisplayValueByKey(item, resource, key_item)
                        }
                    )
                    displayList.push({
                        label: attribute.label,
                        value: vals.join('')
                    })
                } else if ((!attribute.fe_type || (attribute.fe_type && attribute.fe_type.type !== 'multiItems')) && !attribute.display_same_row) {
                    displayList.push({
                        label: attribute.label,
                        value: this.getDisplayValueByKey(attribute, resource, key_item)
                    })
                }
            })
            return displayList
        },

        /**
         * @description 根据attribute 的key去查询对应的显示内容
         */
        getDisplayValueByKey (attribute, resource, key_item) {
            let val_item = ''
            if (!attribute.attribute)
                val_item = resource.display[attribute.key] === undefined ? resource.attributes[attribute.key] : resource.display[attribute.key]
            else {
                if (key_item === 'tag') {
                    // tag的value值为数组格式，需要另外处理
                    // UCMP3-2013【服务目录】申请云主机页面，配置信息部分，标签显示出现多余字符
                    val_item = this.formatterTag(resource.display.tag).length ? this.formatterTag(resource.display.tag).join(', ') : ''
                } else
                    val_item = resource.display[attribute.key]
            }

            return val_item
        },

        /**
         * @description UCMP3-1205 筛选extend信息的显示信息
         */
        filterExtendItems (attr_key, display) {
            if (attr_key === 'expired_at' && (display[attr_key] === '1970-01-01' || display[attr_key] === '1970/01/01'))
                return false
            return true
        },

        /**
         * @description UCMP3-363 申请单明细回显，如果某一项值为空，不予显示
         */
        filterItemsDisplay (attr_key, resource) {
            if (attr_key === 'init_script')
                return false
            // type:combinedItem 全部予以显示
            if (this.attribute[resource.service_code][attr_key].attribute)
                return true
            // 某一项的值为存在(包括为0)，则予以显示
            if (!this.attribute[resource.service_code][attr_key].attribute) {
                if (resource.display[this.attribute[resource.service_code][attr_key].key] === 0)
                    return true
                // 值不为空(null, '', undefined),且不是数组
                if (resource.display[this.attribute[resource.service_code][attr_key].key] && !Array.isArray(resource.display[this.attribute[resource.service_code][attr_key].key]))
                    return true
                // 数组类型，且长度不为空，予以显示
                if (resource.display[this.attribute[resource.service_code][attr_key].key] && Array.isArray(resource.display[this.attribute[resource.service_code][attr_key].key]) && resource.display[this.attribute[resource.service_code][attr_key].key].length)
                    return true
            }
            return false
        },

        // UCMP3-6948: 对象无法排序，转换成数组后再进行排序
        sortFn (a, b) {
            if (Array.isArray(a) && a[0]) {
                if (a[0].indexOf('name') === -1) {
                    // 不存在name的话则向后调整顺序
                    return 1
                } else 
                    return -1
            } else 
                return -1
        }
    },
    computed: {
        metadataObj () {
            let result = {}
            this.metadata.forEach(
                service => {
                    result[service.service_code] = service
                }
            )
            return result
        },
        selectedBusinessLabel () {
            return this.businessOrproject === 'business' ? '业务' : '项目'
        },

        ...mapGetters([
            'metadata', 'businessOrproject'
        ]),

        constructedFormItemsByServiceCode () {
            let attribute = JSON.parse(JSON.stringify(this.attribute))
            let rst = {}

            Object.keys(attribute).forEach(
                service_code => {
                    let formItems = attribute[service_code]
                    let groups = JSON.parse('{}')
                    Object.keys(formItems).forEach(
                        item_key => {
                            if (formItems[item_key].display_same_row && formItems[item_key].display_same_row.key) {
                                if (!groups[formItems[item_key].display_same_row.key]) {
                                    groups[formItems[item_key].display_same_row.key] = formItems[item_key].display_same_row
                                    groups[formItems[item_key].display_same_row.key].children = []
                                    formItems[formItems[item_key].display_same_row.key] = groups[formItems[item_key].display_same_row.key]
                                }
                                groups[formItems[item_key].display_same_row.key].children.push(formItems[item_key])
                            }
                        }
                    )
                    rst[service_code] = formItems
                }
            )
            return rst
        }
    }
}
</script>
<style lang="scss" scoped>
.all-title {
    font-size: 14px;
    line-height: 40px;
    margin-bottom: 10px;
    font-weight: bold;
}
</style>
