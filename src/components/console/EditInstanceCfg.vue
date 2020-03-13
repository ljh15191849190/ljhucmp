<template lang="pug">
    el-form.edit-instance-cfg(label-width="120px" size="small" label-position="left")
        div.cfg-order-form
            div.tip-text.ecs_modify_desc(v-if="serviceCode === 'ecs' && btn.name === 'modify'")
                span CPU(核): {{checkedInstance.cpu_core_count}}
                span.padding-left 内存大小(MB): {{checkedInstance.memory_size_mb}}
            DynamicForm.basic-form(
                :formItems="attribute"
                :formData.sync="items_data"
                :display.sync="items_display"
                :keepValueFitDom="keepValueFitDom"
            )
            //- UCMP3-5001 使用动态表单获取正确的初始化显示内容
            DynamicForm.hidden(
                :formItems="hiddenAttribute"
                :formData.sync="origin.formData"
                :display.sync="origin.display"
                :keepValueFitDom="keepValueFitDom"
            )
            ChildrenDynmicForm(
                v-for="(serviceItem, index) in childRenServices"
                v-if="serviceItem.service_code !== 'ecs_snapshot'"
                :key="serviceItem.service_code"
                :multi="serviceItem.multi"
                :code="serviceItem.service_code"
                :hasEcs="serviceItem.service_code === 'pool' ? serviceItem.hasEcs : ''"
                :forms="serviceItem.forms"
                :tableForms="serviceItem.tableForms"
            )
            //- F5 设置节点
            F5NodesCfg(
                v-if="serviceCode === 'f5'"
                v-show="btn.name === 'modify_node_status'"
                :checkedInstance="checkedInstance"
                :tableForms.sync="tableForms"
                :poolDetail.sync="poolDetail"
            )
            OrderConfirm.business-form-body(:orderForm.sync="orderForm")
            //- bug UCMP-557【控制台】修改云主机时，提示信息需要修改。
            span.tip-text(v-if="serviceCode === 'ecs' && btn.name === 'modify'")
                i.el-icon-warning.margin-right-5
                i 修改主机配置后会启动该机器
            el-form-item
                el-button(size="small" @click="quit") 取消
                el-button(size="small" type="primary" @click="submitOrder" :loading="subdisabled") 提交申请
</template>

<script>
import getServiceMetadataItemParam from '@mixins/getServiceMetadataItemParam.mixin'

import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import OrderConfirm from '@/components/catalog/common/OrderConfirm'
import { mapGetters } from 'vuex'
import ChildrenDynmicForm from '@/components/catalog/common/ChildrenDynmicForm'
import Utils from '@server/Utils'
import F5NodesCfg from './F5NodesCfg'
import Api from '@api'

/**
 * @description 修改资源并提交申请单组件，控制台使用
 */
export default {
    $_veeValidate: {
        validator: 'new'
    },
    mixins: [ getServiceMetadataItemParam ],
    props: ['serviceCode', 'checkedInstance', 'ifRouteToOrder', 'btn'],
    data () {
        return {
            items_data: {},
            items_display: {},
            originDislpay: {},
            attribute: [],
            hiddenAttribute: [],
            checkedMeta: {},
            orderForm: {
                urgency_level: 'low',
                memo: ''
            },
            order_code: '',
            subdisabled: false,
            childRenServices: [],
            tableForms: [],
            originTableForms: [],
            childFormData: {},
            poolDetail: {},
            orderFormNode: {
                origin: [],
                current: []
            },
            keepValueFitDom: true,
            origin: {
                formData: {},
                display: {}
            }
        }
    },

    methods: {
        submitOrder () {
            //UCMP-865 【云硬盘】修改青云云硬盘容量大小，修改成非10的倍数，修改失败。（青云云硬盘容量增加最小step是10G）
            this.$validator.validate().then(result => {
                if (result) {
                    //根据flavor 格式化display
                    this.handlerDisplay()
                    // UCMP3-365 修改配置提交表单前使用接口全局校验内容是否OK
                    if (this.modifyBtn.validation && this.modifyBtn.validation.remote) {
                        // 对修改时的校验API接口时所需的参数过滤无用信息
                        let modifyValidateParams = {
                            resource_id: this.orderFormData.resource_id
                        }
                        modifyValidateParams = {...modifyValidateParams, ...this.orderFormData.items.attributes}

                        Api[this.modifyBtn.validation.remote.method](this.modifyBtn.validation.remote.url, modifyValidateParams, true).then(
                            res => {
                                if (res && res.enable === true)
                                    this.submitOrderAction()
                            }
                        )
                    } else
                        this.submitOrderAction()
                }
            })
        },

        handlerDisplay () {
            // 针对云主机服务作格式化
            if (this.serviceCode === 'ecs' && this.btn.name === 'modify') {
                // 规格格式化
                let flavorName = this.orderFormData.items.display.flavor
                if (!flavorName) return
                Api.get('specification', {id: 'custom', name: flavorName}).then(res => {
                    let list = res.list
                    if (list && list[0]) {
                        this.orderFormData.items.display.flavor = flavorName + '(' + 
                            (list[0].cpu_core_count + 'C' + list[0].memory_size_mb / 1024 + 'G') + ')'
                    }
                })
            }
        },
        /**
         * @description 提交表单事件
         */
        submitOrderAction () {
            let payload = JSON.parse(JSON.stringify(this.orderFormData))

            // f5 节点状态修改由前端来对比
            if (this.btn.name === 'modify_node_status') {
                if (!this.nodeStatusChange()) {
                    this.$notify({
                        type: 'warning',
                        title: '温馨提示',
                        message: '节点属性无变化'
                    })
                    return
                } else {
                    payload.items.originParams.nodes = this.orderFormNode.origin
                    payload.items.display.nodes = this.orderFormNode.current
                }
            }

            this.subdisabled = true
            Api.post('order', payload, true).then(
                res => {
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: '申请单创建成功'
                    })
                    this.$emit('closeModal')
                    this.$emit('operationSuccess')
                    
                    if (this.ifRouteToOrder(res))
                        this.$router.push('/orders')
                }, () => {
                    this.subdisabled = false
                }
            )
        },

        nodeStatusChange () {
            this.orderFormNode = {
                origin: [],
                current: []
            }

            this.orderFormData.items.originParams.nodes.forEach((node, index) => {
                let currentNode = this.orderFormData.items.display.nodes[index]
                if (node.status !== currentNode.status) {
                    this.orderFormNode.origin.push(node)
                    this.orderFormNode.current.push(currentNode)
                }
            })

            return this.orderFormNode.origin.length
        },

        quit () {
            this.$emit('closeModal')
        },

         /**
         * @description 获取子服务依赖列表
         */
        getChildrenServices () {
            this.childRenServices = []
            this.checkedMeta.children.forEach(
                service_code => {
                    let rst = {}
                    let metaAndAttr = this.getCheckedAttribute(service_code)
                    rst.service_code = service_code
                    rst.name = metaAndAttr.checkedMeta.name
                    rst.group = metaAndAttr.checkedMeta.group
                    // attribute用来生成动态属性列表数据
                    rst.attribute = metaAndAttr.attribute
                    rst.multi = metaAndAttr.checkedMeta.max > 1
                    rst.forms = []
                    rst.tableForms = []
                    // pool 处理
                    if (service_code === 'pool') {
                        rst.tableForms = [ { list: [] } ]
                        rst.hasEcs = true
                    }
                    let isIncludeService = this.childRenServices.find(item => item.service_code === rst.service_code)
                    if (!isIncludeService) {
                        this.childRenServices.push(rst)
                        let _index = this.childRenServices.length - 1
                        this.addFormData(rst.service_code, _index, metaAndAttr, this.getCheckedMeta(rst.service_code))
                    }

                    if (this.btn.modify_attrs) {
                        //
                        this.childRenServices[0].attribute = this.childRenServices[0].attribute.filter(item => this.btn.modify_attrs.indexOf(item.key) > -1)
                    }
                }
            )
        },
        addFormData (_code, _index, _config, service) {
            let form = this.addRelatedAttrs(_code, service, _config)
            this.childRenServices[_index].forms.splice(0, 0, form)

            if (this.btn.modify_attrs) {
                //
                this.childRenServices[0].forms[0].attribute = this.childRenServices[0].forms[0].attribute.filter(item => this.btn.modify_attrs.indexOf(item.key) > -1)
            }
        },

        /**
         * @description 生成关联服务表单动态数据，key = key + '@' + uuid
         */
        addRelatedAttrs (_code, childRenServices, _config) {
            let form = {
                attribute: [],
                formData: {},
                mapKeys: {},
                formDisplay: {},
                _index: null
            }
            form.attribute = _config.attribute.map(
                item => {
                    let tempKey = item.key
                    let uuid = Utils.uuid()
                    let rst = JSON.parse(JSON.stringify(item))
                    let value = item.multiple ? [] : null

                    // 添加默认值支持
                    if (item.default_value)
                        value = item.default_value

                    if (_config)
                        value = _config[item.key]
                    rst.key = _code === 'pool' ? rst.key : rst.key + '@' + Utils.uuid()
                    form.formData[rst.key] = value
                    form.mapKeys[rst.key] = tempKey
                    // _index作为v-for遍历key使用，规避删除/添加表单项条目后veevalidate失效的问题
                    form._index = uuid
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

    created () {
        let obj = this.getCheckedAttribute(this.serviceCode)
        this.checkedMeta = obj.checkedMeta
        if (this.btn.attribute)
            this.attribute = this.btn.attribute
        else this.attribute = obj.attribute

        // UCMP3-5238 获取初始化显示内容的表单不做校验
        this.hiddenAttribute = this.attribute.map(
            item => {
                let rstItem = JSON.parse(JSON.stringify(item))
                delete rstItem.required
                delete rstItem.validation
                if (rstItem.attribute) {
                    rstItem.attribute.forEach(attr => {
                        delete attr.required
                        delete attr.validation
                    })
                }
                // UCMP3-5292 map不返回导致动态表单代码出错，返回的是[undefinded, undefined, ...]
                return rstItem
            }
        )
        // 修改绑定数据
        this.attribute.forEach(item => {
            let itemValue = this.checkedInstance[item.key]
            if (itemValue) {
                this.$set(this.items_display, item.key, itemValue)
                if (item.key === 'ecs') {
                    let id = this.checkedMeta.value_field || this.checkedMeta.name_field
                    if (!item.data_link.params) 
                        this.$set(item.data_link, 'params', {})
                    
                    this.$set(item.data_link.params, id, this.checkedInstance[id])
                    itemValue = item.multiple ? itemValue.map(item => item.instance_id) : itemValue.instance_id
                }

                this.$set(this.items_data, item.key, itemValue)
            }
        })

        // UCMP3-5001 深拷贝动态表单初始化值
        this.origin.formData = JSON.parse(JSON.stringify(this.items_data))

        if (Array.isArray(this.checkedMeta.children) && this.checkedMeta.children.length)
            this.getChildrenServices()
    },

    computed: {
        ...mapGetters([
            'metadata'
        ]),

        /**
         * @description 提交申请单表单数据
         */
        orderFormData () {
            let attributes = Object.assign({}, this.items_data, this.childFormData.attributes)
            let display = Object.assign({}, this.items_display, this.childFormData.display)

            // 将该资源原有的参数保留下来，供后续展示需要
            let originParams = {}

            Object.keys(attributes).forEach(item_key => {
                if (this.checkedInstance.hasOwnProperty(item_key)) {
                    // UCMP3-7160 云硬盘需要对新老数据进行计算，因为老的展示数据是带单位的数据，在java中计算时报错，所以需要多存一个类似: size_data的数据来方便java进行计算
                    if (this.serviceCode === 'volume' && item_key === 'size') {
                        originParams[`${item_key}_data`] = this.origin.formData[item_key] || this.checkedInstance[item_key]
                        originParams[item_key] = this.origin.display[item_key] || this.checkedInstance[item_key]
                    } else
                        originParams[item_key] = this.origin.display[item_key] || this.checkedInstance[item_key]
                } else if (this.checkedInstance.base_conf && this.checkedInstance.base_conf[item_key])
                    originParams[item_key] = this.checkedInstance.base_conf[item_key]
                else if (this.origin.formData.hasOwnProperty(item_key)) // this.checkedInstance第一次修改没有usage用途信息 导致第一次申请单没有修改项信息
                    originParams[item_key] = this.origin.formData[item_key]
            })
            
            if (this.serviceCode === 'f5') {
                // go用参数"type":"monitor", // pool, monitor，node
                attributes.type = this.btn.type_for_go

                if (this.btn.name === 'modify_node_status') {
                    originParams = {nodes: this.originTableForms}
                    display = {nodes: this.tableForms}
                } else
                    originParams = this.childFormData.defaultDisply
            }
            if (this.serviceCode === 'ecs' && this.btn.name === 'modify') {
                let memory_size_mb = Number(this.checkedInstance.memory_size_mb) / 1024
                originParams.flavor = `${this.checkedInstance.cpu_core_count}C${memory_size_mb}G`
            }

            return Object.assign({}, this.orderForm, {
                _service_code: this.serviceCode,
                service_code: this.serviceCode,
                resource_id: this.checkedInstance[this.checkedMeta.value_field],
                resource_name: this.checkedInstance[this.checkedMeta.text_field],
                items: {
                    attributes: attributes,
                    display: display,
                    originParams: originParams
                },
                _action: this.btn.name
            })
        },

        modifyBtn () {
            if (this.checkedMeta && this.checkedMeta.normal_actions && this.checkedMeta.normal_actions[this.btn.name])
                return this.checkedMeta.normal_actions[this.btn.name]
            else return {}
        }
    },
    watch: {
        /**
         * @description 观察childRenServices，得到子服务的表单数据
         */
        childRenServices: {
            deep: true,
            handler (newVal, oldVal) {
                let childService = {
                    attributes: {},
                    display: {}
                }
                // 首先遍历子服务列表
                this.childRenServices.forEach(
                    item => {
                        // 再次遍历指定的关联服务的表单列表
                        item.forms.forEach(
                            formItem => {
                                let formData = {}
                                let display = {}
                                let attributes = {}
                                let defaultDisply = {}
                                // 封装一个表单的数据
                                formItem.attribute.forEach(
                                    attrItem => {
                                        if (formItem.defaultFormData && (formItem.defaultFormData[attrItem.key])) {
                                            formData[formItem.mapKeys[attrItem.key]] = formItem.defaultFormData[attrItem.key]
                                            // 处理defaultDisply
                                            if (!formItem.defaultDisply)
                                                formItem.defaultDisply = {}
                                            if (attrItem.defaultOptions) {
                                                let defaultDisplyItem = attrItem.defaultOptions.find(item => item.id === formItem.defaultFormData[attrItem.key])
                                                if (defaultDisplyItem) {
                                                    formItem.defaultDisply[formItem.mapKeys[attrItem.key]] = defaultDisplyItem.name
                                                    defaultDisply[formItem.mapKeys[attrItem.key]] = defaultDisplyItem.name
                                                }
                                            }
                                        }
                                        
                                        if (formItem.formData[attrItem.key]) 
                                            formData[formItem.mapKeys[attrItem.key]] = formItem.formData[attrItem.key]
                                        display[formItem.mapKeys[attrItem.key]] = formItem.formDisplay[attrItem.key]
                                    }
                                )
                                // 为pool时修改参数处理
                                if (item.service_code === 'pool') {
                                    let ecs = []
                                    // 切换负载均衡算法为优先级算法的，才会选择主服务器,此时才会有ecs数据
                                    if (formItem.ecsList && Array.isArray(formItem.ecsList.ecs) && formItem.ecsList.ecs.length)
                                        ecs = formItem.ecsList.ecs
                                    else {
                                        // tableForms为资源为pool时构造的数据,格式为[ { list: [] } ],其节点数据在list下
                                        Array.isArray(item.tableForms) && item.tableForms.length && (ecs = item.tableForms[0].list)
                                    }
                                    attributes = {...formData, ecs: ecs, f5_id: this.checkedInstance.f5_id}
                                } else attributes = formData
                                childService.attributes = Object.assign({}, childService.attributes, attributes)
                                childService.display = Object.assign({}, childService.display, display)
                                childService.defaultDisply = Object.assign({}, childService.defaultDisply, defaultDisply)
                            }
                        )
                    }
                )

                this.childFormData = childService
            }
        },
        tableForms: {
            deep: true,
            handler (newVal, oldVal) {
                if (newVal === oldVal || this.serviceCode !== 'f5') return
                this.childRenServices.forEach(item => {
                    if (item.service_code === 'pool' && Array.isArray(item.tableForms) && item.tableForms.length)
                        this.$set(item.tableForms[0], 'list', newVal)
                        this.originTableForms = JSON.parse(JSON.stringify(newVal))
                })
            }
        },
        poolDetail: {
            deep: true,
            handler (newVal, oldVal) {
                if (newVal === oldVal || this.serviceCode !== 'f5') return
                this.childRenServices.forEach(item => {
                    if (item.service_code === 'pool' && Array.isArray(item.forms) && item.forms.length) {
                        this.$set(item.forms[0], 'formData', newVal)
                        this.$set(item.forms[0], 'defaultFormData', JSON.parse(JSON.stringify(newVal)))
                    }
                })
            }
        }
    },
    components: {
        DynamicForm,
        OrderConfirm,
        ChildrenDynmicForm,
        F5NodesCfg
    }
}
</script>

<style lang="scss" scoped>
.ecs_modify_desc {
    padding-left: 120px;
}
</style>
<style lang="scss">
    .edit-instance-cfg {
        .pool-form {
            padding: 0px;
        }

        .business-form .business-form-body {
            margin: unset;
        }
    }
</style>
