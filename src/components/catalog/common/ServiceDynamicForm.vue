<template lang="pug">
    div.service-dynamic-form
        //- 申请服务基本信息
        div.border-light-top.business-form
            div.child-form-title
                label.title 基本信息
                el-tooltip.margin-left(:content="checkedMeta.description" placement="right")
                    i.ucmp-icon-question.theme-color.icon-tip
            DynamicForm.business-form-body(
                :formItems="formItems"
                :formData.sync="items_data"
                :display.sync="items_display"
                :keepValueFitDom="keepValueFitDom"
                :externalFormData="externalFormData"
                labelPosition="right"
            )
        div.related-form
            RelateServiceDynamicForm(
                v-for="(serviceItem, index) in relatedServices"
                :key="serviceItem.service_code"
                :name="serviceItem.name"
                :multi="serviceItem.multi"
                :code="serviceItem.service_code"
                :forms="serviceItem.forms"
                :max="serviceItem.max"
                :description="serviceItem.description"
                @add:formData="addFormData"
                @delete:formData="deleteFormData"
                :keepValueFitDom="keepValueFitDom"
            )
        div.child-form.border-light-top
            ChildrenDynmicForm(
                v-for="(serviceItem, index) in childRenServices"
                v-if="serviceItem.min !== 0"
                :key="serviceItem.service_code"
                :name="serviceItem.name"
                :multi="serviceItem.multi"
                :code="serviceItem.service_code"
                :forms="serviceItem.forms"
                :tableForms="serviceItem.tableForms"
                @add:formData="addFormData"
                @delete:formData="deleteFormData"
                :keepValueFitDom="keepValueFitDom"
            )
</template>

<script>
/**
 * @description 申请服务/审批 元数据动态表单
 */
import Api from '@api'
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import RelateServiceDynamicForm from './RelateServiceDynamicForm'
import ChildrenDynmicForm from './ChildrenDynmicForm'
import MetadataUtils from '@server/metadata.utils'
import Utils from '@server/Utils'
import { mapGetters } from 'vuex'
import Config from '@/mock/metadata/metadata.config'
import BPAttribute from '@mock/metadata/blueprint.attributes'
import _groupby from 'lodash.groupby'

export default {
    inject: ['$validator'],
    props: ['serviceCode', 'metaFormData', 'id', 'resourceOwnerInfo', 'relatedServices', 'childRenServices', 'externalFormData', 'attribute'],
    data () {
        return {
            checkedMeta: {},
            items_data: {},
            items_display: {},
            // attribute: [],
            selectedCode: null,
            keepValueFitDom: true,
            related: []
        }
    },

    methods: {
        getDeskandAppPhone () {
            let userId = localStorage.getItem('userId')
            Api.get('userById', {user_id: userId}).then(res => {
                if (res.data) {
                    if (this.metaFormData.resources && this.metaFormData.resources.length) {
                        let resource = this.metaFormData.resources[0]
                        if (resource.service_code === 'xen_desktop' || resource.service_code === 'xen_app') {
                            // 视图更新
                            this.$set(resource.attributes, 'email', res.data.email)
                            this.$set(resource.attributes, 'phone', res.data.phone)
                        }
                        this.items_data = resource.attributes
                    }
                } 
            })
        },
        getCheckedMeta (serviceCode) {
            if (!this.metadata.length)
                return { name: serviceCode, code: serviceCode, attribute: [] }

            let checkedMeta = MetadataUtils.getCheckedMeta(this.metadata, serviceCode)
            // 修改vuex导致控制台报错导致
            checkedMeta = JSON.parse(JSON.stringify(checkedMeta))
            checkedMeta.attribute && checkedMeta.attribute.forEach(
                item => {
                    if (!item.validation)
                        item.validation = {}
                    item.validation.required = item.required
                }
            )
            return checkedMeta
        },

        /**
         * @description 获取自身的属性列表，作为表单项使用
         */
        getCheckedAttribute (serviceCode, filterRule = 'created') {
            let checkedMeta = JSON.parse(JSON.stringify(this.getCheckedMeta(serviceCode)))

            // eslint-disable-next-line
            if (!checkedMeta.service_code || checkedMeta.attribute && !checkedMeta.attribute.length)
                return {
                    checkedMeta,
                    attribute: []
                }
            // UCMP3-5688 修复申请云主机，附带mysql、云主机等表单为空的问题
            let privilegeAttributes = this.metadataApplyPrivileges.find(service => service.service_code === serviceCode)
            let attribute = checkedMeta.attribute

            // 根据元数据的继承以及关联关系动态添加属性列表
            if (checkedMeta.extends && checkedMeta.extends.service_code && checkedMeta.extends.attribute)
                attribute = attribute.concat(MetadataUtils.getExtendAttributes(checkedMeta.extends.service_code, checkedMeta.extends.attribute, this.metadata))
            let filterAttribute = attribute.filter(
                item => {
                    // UCMP3-5375 服务属性列表根据已有权限进行过滤
                    if (checkedMeta.group !== 'blueprint')
                        return privilegeAttributes && privilegeAttributes.attributes.find(attr_key => attr_key === item.key)
                    else return true
                }
            )
            // UCMP-1119 申请云主机，添加mysql，由于再次查询mysql与云主机的关联关系，导致多余一个input
            if (checkedMeta.related_service && checkedMeta.related_service.length && filterRule !== 'relate_created')
               filterAttribute = filterAttribute.concat(MetadataUtils.getRelatedServiceAttributes(checkedMeta.related_service, this.metadata))
            filterAttribute = this.configAttributeType(serviceCode, filterAttribute)

            let copiedAttrs = JSON.parse(JSON.stringify(filterAttribute.filter(
                    item => {
                        return item[filterRule]
                    }
                )
            ))

            // 更改元数据attribute列表的type为实际的表单控件类型
            MetadataUtils.updateAttributeType(copiedAttrs)

            copiedAttrs.forEach(
                attr => {
                    // if (attr.related_to_owner && attr.data_link && !attr._data_link)
                    //     attr._data_link = JSON.parse(JSON.stringify(attr.data_link))
                    if (attr.enum)
                        attr.defaultOptions = attr.enum

                    // nas 挂载主机
                    if (this.serviceCode === 'nas' && attr.key === 'ecs') {
                        //
                        this.$set(attr, 'type', 'table')
                        this.$set(attr, 'label', this.nasAutoAttach ? '挂载主机' : '关联主机')
                    }
                    // juniper防火墙 
                    if (this.serviceCode === 'juniper_policy' && filterRule === 'created') {
                        if (attr.key === 'current_ip') {
                            attr.disabled = true
                            attr.created = false
                        }
                        
                        if (attr.key === 'source_ip' || attr.key === 'target_ip') 
                            attr.linked = false
                    }
                }
            )
            this.dynamicChangeEndpointByOwner(copiedAttrs)
            return {
                checkedMeta,
                attribute: copiedAttrs
            }
        },
         /**
         * @description 获取子服务依赖列表
         */
        getChildrenServices () {
            this.checkedMeta.children.forEach(
                service_code => {
                    let rst = {}
                    let metaAndAttr = this.getCheckedAttribute(service_code)
                    if (metaAndAttr && this.isEmptyObj(metaAndAttr.checkedMeta)) 
                        return
                    rst.service_code = service_code
                    rst.name = metaAndAttr.checkedMeta.name
                    rst.group = metaAndAttr.checkedMeta.group
                    // attribute用来生成动态属性列表数据
                    rst.attribute = metaAndAttr.attribute
                    rst.multi = metaAndAttr.checkedMeta.max > 1
                    rst.min = metaAndAttr.checkedMeta.min
                    rst.max = metaAndAttr.checkedMeta.max
                    rst.forms = []
                    rst.tableForms = []
                    if (metaAndAttr.checkedMeta.related_service && metaAndAttr.checkedMeta.related_service.length) {
                        metaAndAttr.checkedMeta.related_service.forEach(item => {
                            //暂时不知其他子服务如何关联，这里暂时只处理有refer_table属性的
                            if (item.refer_table) {
                                rst.attribute = metaAndAttr.attribute.filter(attItem => attItem.key !== item.service_code)
                                let tableFormItem = {}
                                let metaAttr = this.getCheckedAttribute(item.service_code)
                                let tableRelateAttr = {key: '_name', label: metaAttr.checkedMeta.name, multiple: false, user_defined: true}
                                tableFormItem.name = item.title
                                tableFormItem.service_code = item.service_code
                                tableFormItem.list = []
                                tableFormItem.tabAttrs = [tableRelateAttr, ...item.attribute]
                                rst.tableForms.push(tableFormItem)
                            }
                        })
                    }
                    // UCMP-1404 F5申请页面，多次修改基础配置，挂载云主机出现重复，见截图
                    let isIncludeService = this.childRenServices.find(item => item.service_code === rst.service_code)

                    if (!isIncludeService)
                        this.childRenServices.push(rst)
                    //UCMP-1283F5申请页面，填写好信息之后，点击立即申请，点击上一步，之前的部分信息未保存
                    if (this.metaFormData.resources && this.metaFormData.resources.length > 1) {
                        this.metaFormData.resources.forEach(
                            resource => {
                                if (resource.service_code === rst.service_code) {
                                    if (rst.service_code === 'pool') {
                                        rst.tableForms[0].list = resource.attributes.ecs
                                        this.addFormData(rst.service_code, 0, resource.attributes, true)
                                    } else
                                        rst.forms.push(this.addRelatedAttrs(rst.service_code, this.childRenServices, resource.attributes))
                                }
                            }
                        )
                    } else {
                        if (rst.service_code === 'pool')
                            this.addFormData(rst.service_code, 0, null, true)
                    }
                }
            )

            return []
        },
        /**
         * @description 获取关联服务依赖列表
         */
        getRelatedServices () {
            if (this.checkedMeta && this.checkedMeta.related_service && this.checkedMeta.related_service.length) {
                // 过滤关联服务列表
                let relatedServices = this.checkedMeta.related_service.filter(
                    service => {
                        // UCMP-1191 修复当前租户看不到硬盘服务时，申请云主机浏览器控制台报错并看不到其他被关联服务的bug
                        if (!service.leading && service.created && this.metadataServiceCodes.indexOf(service.service_code) !== -1)
                            return true
                    }
                )
                relatedServices.forEach(
                    item => {
                        let rst = {}
                        let metaAndAttr = this.getCheckedAttribute(item.service_code, 'relate_created')
                        rst.service_code = item.service_code
                        rst.name = metaAndAttr.checkedMeta.name
                        rst.description = metaAndAttr.checkedMeta.description
                        rst.group = metaAndAttr.checkedMeta.group
                        // attribute用来生成动态属性列表数据
                        rst.attribute = metaAndAttr.attribute
                        rst.multi = item.refer_type === 'o:m'

                        // UCMP3-427 阿里云云主机可以挂载超过16个云主机
                        if (metaAndAttr.checkedMeta.max)
                            rst.max = metaAndAttr.checkedMeta.max
                        if (metaAndAttr.checkedMeta.min)
                            rst.min = metaAndAttr.checkedMeta.min

                        // UCMP3-773 支持副标题显示
                        if (item.sub_text_field)
                            rst.sub_text_field = item.sub_text_field
                        rst.forms = []
                        if (this.metaFormData.resources && this.metaFormData.resources.length > 1) {
                            this.metaFormData.resources.forEach(
                                resource => {
                                    if (resource.service_code === rst.service_code)
                                        rst.forms.push(this.addRelatedAttrs(rst.service_code, this.relatedServices, resource.attributes))
                                }
                            )
                        }

                        if (!item.leading)
                            this.relatedServices.push(rst)
                    }
                )
            }
        },

        /**
         * @description 生成关联服务表单动态数据，key = key + '@' + uuid
         */
        addRelatedAttrs (_code, relatedServices, _config) {
            if (!_code)
                return {}
            let codes = relatedServices.map(
                item => {
                    return item.service_code
                }
            )
            let index = codes.indexOf(_code)
            if (index !== -1) {
                let uuid = Utils.uuid()

                let form = {
                    attribute: [],
                    formData: {},
                    mapKeys: {},
                    formDisplay: {},
                    _index: uuid
                }

                // 封装关联服务动态表单组的数据
                // attribute【数组】深拷贝关联服务的属性，并动态改变key，以便获得唯一的校验
                // formData 表单数据，key与上述 attribute的key保持一致，value为实际表单的值
                // mapKeys 记录 动态key 与 源key的映射关系，以便提交表单前封装可用的关联服务表单数据
                form.attribute = relatedServices[index].attribute.map(
                    item => {
                        if (item.relate && typeof item.relate === 'object') {
                            Object.keys(item.relate).forEach(key => {
                                item[key] = item.relate[key]
                            })
                            if (item.enum)
                                item.defaultOptions = JSON.parse(JSON.stringify(item.enum))
                        }
                        let tempKey = item.key
                        let rst = JSON.parse(JSON.stringify(item))
                        let value = item.multiple ? [] : null

                        // 添加默认值支持
                        if (item.default_value)
                            value = item.default_value

                        if (_config)
                            value = _config[item.key]
                        rst.key = _code === 'pool' ? rst.key : uuid + '@' + rst.key

                        // UCMP3-4048 link、dependencies替换key
                        if (rst.link) {
                            Object.keys(rst.link).forEach(
                                link_key => {
                                    rst.link[link_key] = rst.link[link_key].map(
                                        link_item => _code === 'pool' ? link_item : uuid + '@' + link_item
                                    )
                                }
                            )
                        }
                        if (rst.dependencies) {
                            rst.dependencies = rst.dependencies.map(
                                dependency => uuid + '@' + dependency
                            )
                        }

                        form.formData[rst.key] = value
                        form.mapKeys[rst.key] = tempKey
                        // _index作为v-for遍历key使用，规避删除/添加表单项条目后veevalidate失效的问题
                        // form._index = uuid
                        return rst
                    }
                )
                // 手动添加的选择主服务器特殊处理
                if (_code === 'pool' && _config && _config['pool_ecs'])
                    form.formData['pool_ecs'] = _config['pool_ecs']
                form.formDisplay = JSON.parse(JSON.stringify(form.formData))
                return form
            }
        },

        findRelatedService (_code, isChildService) {
            if (!_code)
                return {}
            let services = isChildService ? this.childRenServices : this.relatedServices
            let codes = services.map(
                item => {
                    return item.service_code
                }
            )
            let index = codes.indexOf(_code)
            if (index !== -1)
                return services[index]
            else
                return {}
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
                    let type = configAttribute && configAttribute[item.key] && configAttribute[item.key].type ? configAttribute[item.key].type : item.type
                    this.$set(item, 'type', type)
                }
            )
            return mergedAttribute
        },

        /**
         * @description 初始化选中的元数据项以及属性列表 组件初始化或者路由发生变化触发
         */
        initMetaAndAttributes () {
            let metaAndAttr = this.getCheckedAttribute(this.serviceCode)
            this.checkedMeta = metaAndAttr.checkedMeta
            let attribute = JSON.parse(JSON.stringify(metaAndAttr.attribute))
            attribute.forEach(
                attr => {
                    // UCMP3-427 申请云硬盘，所属云主机列表接口定制化：过滤掉挂载的硬盘已经超过16个的
                    if (attr.data_link && attr.data_link_for_create) {
                        attr.data_link.endpoint = attr.data_link_for_create.endpoint ? attr.data_link_for_create.endpoint : attr.data_link.endpoint
                        attr.data_link.method = attr.data_link_for_create.method ? attr.data_link_for_create.method : attr.data_link.method
                        attr.data_link.text_field = attr.data_link_for_create.text_field ? attr.data_link_for_create.text_field : attr.data_link.text_field
                        attr.data_link.value_field = attr.data_link_for_create.value_field ? attr.data_link_for_create.value_field : attr.data_link.value_field

                        // UCMP3-3982 懒加载, 可考虑放在父级，但需所有接口都支持
                        attr.fe_type = attr.data_link_for_create.fe_type || null
                        delete attr.data_link_for_create
                    }
                }
            )
            this.$emit('update:attribute', attribute)
            if (!this.relatedServices || !this.relatedServices.length)
                this.getRelatedServices()

            if (this.checkedMeta.children && this.checkedMeta.children.length)
                this.getChildrenServices()
        },

        addFormData (_code, _index, _config, isChildService) {
            let checkedRelatedService = this.findRelatedService(_code, isChildService)
            let services = isChildService ? this.childRenServices : this.relatedServices
            let form = this.addRelatedAttrs(_code, services, _config)
            checkedRelatedService.forms.splice(_index, 0, form)
        },

        deleteFormData (_code, _index, isChildService) {
            let checkedRelatedService = this.findRelatedService(_code, isChildService)
            checkedRelatedService.forms.splice(_index, 1)
        },

        /**
         * @description 动态修改服务的attribute data_link信息，添加依赖的资源归属信息
         */
        dynamicChangeEndpointByOwner (attribute) {
            attribute.forEach(
                attr => {
                    if (attr.data_link && attr.data_link.endpoint) {
                        if (!attr.data_link.params)
                           this.$set(attr.data_link, 'params', {})
                        if (attr.key === 'image')
                            attr.data_link.params.pure_image = true
                    }
                }
            )
        },
        /**
         * 是否为空对象
         */
        isEmptyObj (obj) {
            let flag = false
            if (JSON.stringify(obj) === '{}')
                flag = true
            return flag
        }
    },

    computed: {
        ...mapGetters([
            'metadata',
            'nasAutoAttach',
            'metadataApplyPrivileges'
        ]),

        /**
         * @description 表单数据汇总
         */
        formData () {
           let data = {
                code: this.serviceCode,
                name: this.checkedMeta.name,
                group: this.checkedMeta.group ? this.checkedMeta.group : '',
                resources: [
                    {
                        id: this.id,
                        service_code: this.serviceCode,
                        group: this.checkedMeta.group ? this.checkedMeta.group : '',
                        attributes: this.items_data,
                        display: this.items_display,
                        reference: ''
                        // count: this.instance_apply_count
                    }
                ],
                canvas: {}
            }

            data.resources = data.resources.concat(this.related)
            let configGroup = _groupby(this.metadataApplyPrivileges, 'service_code')
            data.resources.forEach(item => {
                let config = configGroup[item.service_code] && configGroup[item.service_code][0] && configGroup[item.service_code][0].config ? configGroup[item.service_code][0].config : {}
                //阶段一：创建 config 存在的时候代表的是创建阶段
                if (config.template_immutable)
                    item.template_immutable = true
            })

            return data
        },

        /**
         * @description metadata service_code列表
         */
        metadataServiceCodes () {
            return this.metadata.map(
                meta => {
                    return meta.service_code
                }
            )
        },

        /**
         * @description UCMP3-3209 当前服务的创建属性汇总（针对蓝图做特殊处理：添加重复性校验）
         */
        formItems () {
            if (!this.checkedMeta.group || this.checkedMeta.group !== 'blueprint')
                return this.attribute

            let instanceNameAttr = BPAttribute.find(item => item.key === 'name')
            let backendRepetition = instanceNameAttr && instanceNameAttr.validation ? instanceNameAttr.validation.backendRepetition : null
            return JSON.parse(JSON.stringify(this.attribute)).map(
                item => {
                    if (item.key === 'name')
                        item.validation.backendRepetition = backendRepetition
                    return item
                }
            )
        }
    },

    watch: {
        /**
         * @description 表单汇总的值发生变化，以及通知父组件获知
         */
        formData: {
            deep: true,
            handler () {
                this.$emit('update:metaFormData', this.formData)
            }
        },

        /**
         * @description 观察relatedServices，得到关联服务的表单数据
         */
        relatedServices: {
            deep: true,
            handler (newVal, oldVal) {
                // 修复申请云主机添加硬盘，创建申请单没有硬盘信息的bug
                // if (newVal === oldVal) return
                let related = []

                // 首先遍历关联的服务列表
                this.relatedServices.forEach(
                    item => {
                        // 再次遍历指定的关联服务的表单列表
                        item.forms.forEach(
                            formItem => {
                                let formData = {}
                                let display = {}
                                // 封装一个表单的数据
                                formItem.attribute.forEach(
                                    attrItem => {
                                        formData[formItem.mapKeys[attrItem.key]] = formItem.formData[attrItem.key]
                                        display[formItem.mapKeys[attrItem.key]] = formItem.formDisplay[attrItem.key]
                                    }
                                )
                                related.push({
                                    id: Utils.uuid(),
                                    service_code: item.service_code,
                                    group: item.group ? item.group : '',
                                    reference: this.id,
                                    attributes: formData,
                                    display: display,
                                    count: 1
                                })
                            }
                        )
                    }
                )

                this.related = related
            }
        },
        /**
         * @description 观察childRenServices，得到子服务的表单数据
         */
        childRenServices: {
            deep: true,
            handler (newVal, oldVal) {
                let childService = []
                // 首先遍历子服务列表
                this.childRenServices.forEach(
                    item => {
                        // 再次遍历指定的关联服务的表单列表
                        item.forms.forEach(
                            formItem => {
                                let formData = {}
                                let display = {}
                                // 封装一个表单的数据
                                formItem.attribute.forEach(
                                    attrItem => {
                                        formData[formItem.mapKeys[attrItem.key]] = formItem.formData[attrItem.key]
                                        display[formItem.mapKeys[attrItem.key]] = formItem.formDisplay[attrItem.key]
                                    }
                                )
                                childService.push({
                                    id: Utils.uuid(),
                                    service_code: item.service_code,
                                    group: item.group ? item.group : '',
                                    reference: this.id,
                                    attributes: item.service_code === 'pool' ? {...formData, ...formItem.ecsList} : formData,
                                    display: display,
                                    count: 1
                                })
                            }
                        )
                    }
                )

                this.related = childService
            }
        },
        /**
         * @description 资源id变更后，依赖资源id以及父id联动变化
         */
        id () {
            this.related.forEach(
                item => {
                    item.id = Utils.uuid()
                    item.reference = this.id
                }
            )
        }
    },

    created () {
        this.getDeskandAppPhone()
        this.initMetaAndAttributes()
        if (this.metaFormData.resources && this.metaFormData.resources.length) {
            let resource = this.metaFormData.resources[0]
            this.items_data = resource.attributes
            this.items_display = resource.display
        }
    },

    components: {
        DynamicForm,
        RelateServiceDynamicForm,
        ChildrenDynmicForm
    }
}
</script>

<style lang="scss" scoped>
</style>
