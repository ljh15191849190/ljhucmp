<template lang="pug">
    div.full-width.full-width-more
        el-row.network-container(v-if="netFormItems.length" v-for="(netItem, index) in networkList" :key="index")
            el-form(size="small" label-width="0px")
                div.netItem-container
                    DynamicForm.network-form(
                        ref="networkForm"
                        :label-width="'0px'"
                        :formItems="[netFormItems[index].networkFormItem]"
                        :uniqueKey="uniqueKey"
                        :formData.sync="netItem"
                        :display.sync="netItem.display"
                        :showFormItem="showFormItem"
                        :disabled="disabled"
                    )
                    div.operation-div.pos-btn.opr-btn-pane(v-if="!disabled && formItem.attached_attrs.multiple")
                        el-button(v-if="index === networkList.length - 1" type="primary" icon="ucmp-icon-plus" @click="handleOper('add')")
                        el-button.remove-btn(v-if="networkList.length > 1" type="primary" icon="ucmp-icon-delete" @click="handleOper('delete', index)")
                el-button(
                    :disabled="disabled"
                    :type="item.type === netItem.ip_type ? 'primary':'info'"
                    v-for="item in formItem.attached_attrs.ipTypes"       :key="item.type"  
                    @click="changeType(netItem, item.type, index)") {{item.name}}
                DynamicForm.full-width.margin-top.network-form(
                    v-if="netFormItems[index].attachFormItem && netFormItems[index].attachFormItem.length"
                    :label-width="'0px'"
                    :formItems="netFormItems[index].attachFormItem"
                    :uniqueKey="uniqueKey"
                    :formData.sync="netItem"
                    :display.sync="netItem.display"
                    :showFormItem="showFormItem"
                    :disabled="disabled"
                )
           
</template>
<script>
import Utils from '@server/Utils'
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
export default {
    name: '',
    props: {
        value: {
            type: Array,
            default: () => []
        },
        display: {
            type: Array,
            default: () => []
        },
        formItem: {
            type: Object,
            default: () => {}
        },
        uniqueKey: {
            type: String,
            default: () => 'id'
        },
        formId: {
            type: String,
            default: () => 'id'
        },
        list: {
            type: Array,
            default: () => []
        },
        formData: {
            type: Object,
            default: () => {}
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    components: {DynamicForm},
    data () {
        return {
            showFormItem: false,
            netFormItems: [],
            networkList: [],
            copyFormItem: null
        }
    },
    methods: {
        init () {
            this.copyFormItem = JSON.parse(JSON.stringify(this.formItem))
            //处理formItem避免陷入循环
            if (this.formItem && this.formItem.fe_type) 
                delete this.formItem.fe_type
            this.updateFormItem()
            this.initNetworkList()
            //UCMP3-3178【应用编排】申请应用服务，不走审批，处理申请单时，选择云主机模板后，再填写云硬盘厂商信息，云主机网络字段内容消失。
            this.updateList() 
        },
        initNetworkList () {
            this.netFormItems = []
            // 克隆网络
            this.networkList = this.value ? JSON.parse(JSON.stringify(this.value)) : []
            if (this.networkList.length === 0) {
                if (this.formItem.attached_attrs && this.formItem.attached_attrs.ipTypes.length) {
                    let type = this.formItem.attached_attrs.ipTypes[0].type
                    this.netFormItems.push(this.getFormItems(type))
                    let netItem = this.getNetItems(type)
                    this.networkList.push(netItem)
                }
            } else {
                this.networkList.forEach(item => {
                    this.$set(item, 'display', {})
                    this.netFormItems.push(this.getFormItems(item.ip_type, item))
                })
            }
        },
        /**
         * @description 按钮操作
         * @param type 操作类型
         */
        handleOper (type, idx) {
            if (type === 'delete') {
                this.networkList.splice(idx, 1)
                this.netFormItems.splice(idx, 1)
            } else {
                if (this.formItem.attached_attrs && this.formItem.attached_attrs.ipTypes.length) {
                    let type = this.formItem.attached_attrs.ipTypes[0].type
                    this.netFormItems.push(this.getFormItems(type))
                    let netItem = this.getNetItems(type)
                    this.networkList.push(netItem)
                }
            }
        },
        /**
         * @description 获取网络对象
         * @param type ip类型
         */
        getNetItems (type) {
            let netItem = {
                manual: {
                    ip_type: type, display: {}
                },
                ip_pool: {
                    ip_type: type, display: {}
                },
                dhcp: {
                    ip_type: type, display: {}
                }
            }

            return netItem[type]
        },
        /**
         * @description 获取表单formItems
         * @param type ip类型
         */
        getFormItems (type, netItem) {
            let id = Utils.uuid()
            let formItem = this.getUpdateAttributes([JSON.parse(JSON.stringify(this.formItem))], id, netItem)[0]
            if (formItem.data_link.endpoint) delete formItem.data_link.endpoint
            if (!formItem.attached_attrs || !formItem.attached_attrs.attribute) return {networkFormItem: formItem, attachFormItem: []}
            // 处理动态表单附属属性
            let attachFormItems = formItem.attached_attrs.attribute.filter(item => item.attached.includes(type))
            attachFormItems = this.getUpdateAttributes(attachFormItems, id, netItem, true)
            return {networkFormItem: formItem, attachFormItem: attachFormItems}
        },
        /**
         * @description 获取更新后的表单formItems
         * @param type id uuid
         */
        getUpdateAttributes (attributes, id, netItem, isAttacheForm) {
            let formItems = []
            attributes.forEach(attr => {
                if (netItem) {
                    if (netItem[attr.key])
                        this.$set(netItem, `${id}@${attr.key}`, netItem[attr.key])
                    if (attr.type === 'selectValues') {
                        let selectObj = {}
                        attr.data_link.value_field.forEach(key => {
                            //处理selectValues情况
                            if (netItem[key])
                                selectObj[key] = netItem[key]
                        })
                        this.$set(netItem, `${id}@${attr.key}`, selectObj)
                    }
                    if (attr.dependencies) {
                        attr.dependencies = attr.dependencies.map(
                            dependency => {
                                return dependency.split('@')[1] ? `${id}@${dependency.split('@')[1]}` : `${id}@${dependency}`
                            }
                        )
                    }
                }

                // 处理子网请求默认参数enable_internet
                if (attr.data_link && attr.data_link.endpoint && attr.key === 'subnet_id') {
                    let enableInternetParam = {enable_internet: this.enableInternet}
                    let provideParam = {provider_id: this.provideId}
                    if (!attr.data_link.params)
                        this.$set(attr.data_link, 'params', {})
                    attr.data_link.params = { ...attr.data_link.params, ...enableInternetParam, ...provideParam }
                }

                // UCMP3-5923 申请云主机并开通互联网设置，提交申请单后系统管理员osMgr1审批处理时填写了IP组以及子网，但是cloudMgr1管理员审批时，子网不显示
                // 问题原因：网络过滤子网的元数据依赖没有修改为id@depkey
                if (isAttacheForm && attr.dependencies) {
                    attr.dependencies = attr.dependencies.map(item => {
                        return item.split('@')[1] ? `${id}@${item.split('@')[1]}` : `${id}@${item}`
                    })
                }

                formItems.push({...attr, ...{id: `${id}@${attr.key}`}})
            })

            return formItems
        },  
        /**
         * @description 改变ip类型操作
         */
        changeType (netItem, type, idx) {
            if (this.disabled || netItem.ip_type === type) return
            netItem.ip_type = type
            netItem.display = {}
            // 处理动态表单附属属性
            let id = this.netFormItems[idx].networkFormItem[this.uniqueKey].split('@')[1] ? this.netFormItems[idx].networkFormItem[this.uniqueKey].split('@')[0] : Utils.uuid()
            let attachFormItems = this.formItem.attached_attrs.attribute.filter(item => item.attached.includes(type))
            attachFormItems = this.getUpdateAttributes(attachFormItems, id, netItem)
            this.netFormItems[idx].attachFormItem = attachFormItems
        },
        /**
         * @description 处理networkList变化更新value与display
         */
        handleNetworkList () {
            let [formData, display] = [[], []]
            this.networkList.forEach((item, idx) => {
                let formItems = this.netFormItems[idx]
                let displays = item.display
                let ipTypeItem = this.formItem.attached_attrs.ipTypes.find(typeItem => typeItem.type === item.ip_type)
                let ipTypeName = ipTypeItem ? ipTypeItem.name : ''
                let formDataItem = {ip_type: item.ip_type}
                //UCMP3-2695【申请单管理】云主机订单详情中，网络信息显示不正确，见截图说明
                let displayValue = ipTypeName + ' | '
                //处理网络
                if (item[formItems.networkFormItem[this.uniqueKey]]) {
                    formDataItem = {...formDataItem, ...item[formItems.networkFormItem[this.uniqueKey]]}
                    displayValue += displays[formItems.networkFormItem[this.uniqueKey]] 
                    this.handleValidIPRange(formDataItem, formItems.attachFormItem)
                }

                //处理IP
                formItems.attachFormItem.forEach((attachAttr, index) => {
                    if (item[attachAttr[this.uniqueKey]]) {
                        formDataItem[attachAttr.key] = item[attachAttr[this.uniqueKey]]
                        if (index === 0) displayValue += '('
                        let displayItem = displays[attachAttr[this.uniqueKey]] || ''

                        if (displayItem)
                            displayValue += (index !== formItems.attachFormItem.length - 1) ? displayItem + '/' : displayItem
                        if (index === formItems.attachFormItem.length - 1) displayValue += ')'
                    }
                })

                formData.push(formDataItem)
                display.push(displayValue)
            })

            this.$emit('update:display', display)
            this.$emit('update:value', formData)
        },
        handleValue (newValue, oldValue) {
            if (newValue && (newValue.length !== this.networkList.length))
                this.initNetworkList()
            else {
                if (newValue && oldValue) {
                    for (let index = 0; index < newValue.length; index++) {
                        let newItem = newValue[index]
                        let oldItem = oldValue[index]
                        if (!newItem || !oldItem) return
                        let netItem = this.networkList[index]
                        let netFormItem = this.netFormItems[index]
                        if (Object.values(newItem).length !== Object.values(oldItem).length || newItem.ip_type !== oldItem.ip_type) {
                            let ipType = newItem.ip_type
                            netItem.ip_type = ipType

                            let formItem = JSON.parse(JSON.stringify(this.formItem))

                            //UCMP3-2985【申请单管理】管理员填写用户的申请信息（手动指定ip），输入框焦点定位有问题，详见截图描述
                            if (newItem.ip_type !== oldItem.ip_type) {
                                let id = netFormItem.networkFormItem[this.uniqueKey].split('@')[1] ? netFormItem.networkFormItem[this.uniqueKey].split('@')[0] : Utils.uuid()
                                let attachFormItems = formItem.attached_attrs.attribute.filter(item => item.attached.includes(ipType))
                                netFormItem.attachFormItem = this.getUpdateAttributes(attachFormItems, id, netItem)
                            }

                            if (netFormItem.networkFormItem.type === 'selectValues') {
                                let selectObj = {}
                                netFormItem.networkFormItem.data_link.value_field.forEach(key => {
                                    if (newItem[key])
                                        selectObj[key] = newItem[key]
                                })
                                let id = netFormItem.networkFormItem[this.uniqueKey]
                                JSON.stringify(selectObj) === '{}' ? this.$set(netItem, id, null) : this.$set(netItem, id, selectObj)
                            }

                            netFormItem.attachFormItem.forEach(attachItem => {
                                if (newItem[attachItem.key]) {
                                    let id = attachItem[this.uniqueKey]
                                    this.$set(netItem, id, newItem[attachItem.key])
                                }
                            })
                        } else {
                            const {ip_type, ...newRest} = newItem
                            if (netFormItem.networkFormItem.type === 'selectValues') {
                                let id = netFormItem.networkFormItem[this.uniqueKey]
                                netFormItem.networkFormItem.data_link.value_field.forEach(key => {
                                    if (newRest[key] && newRest[key] !== oldItem[key]) {
                                        this.$set(netItem, key, newRest[key])
                                        this.$set(netItem[id], key, newRest[key])
                                    }
                                })
                            }

                            netFormItem.attachFormItem.forEach(attachItem => {
                                if (newRest[attachItem.key] && newRest[attachItem.key] !== oldItem[attachItem.key]) {
                                    let id = attachItem[this.uniqueKey]
                                    this.$set(netItem, id, newRest[attachItem.key])
                                }
                            })
                        }
                    }
                }
            }
        },
        /**
         * @description ip校验针对网络返回ip/mask
         */
        handleValidIPRange (formDataItem, formItems) {
            if (!formDataItem.routerIpNetwork) return
            // 针对ip地址添加相应的校验
            let attr = formItems.find(item => item.key === 'fixed_ip4')
            if (attr && !attr.validation.validIPRange) 
                this.$set(attr.validation, 'validIPRange', this.getIPRange(formDataItem.routerIpNetwork))
        },
        /**
         * @description 获取网络IP开始和结束地址
         */
        getIPRange (routerIpNetwork) {
            let networkIp = routerIpNetwork.split('/')[0]
            let netMaskNum = Number(routerIpNetwork.split('/')[1])
            let netMask = Utils.getNetMask(netMaskNum)
            let lowAddr = Utils.getLowAddr(networkIp, netMask)
            let highAddr = Utils.getHighAddr(networkIp, netMask)
            return {startIP: lowAddr, endIP: highAddr}
        },
        /**
         * @description 更新每一个网络的下拉列表
         */
        updateList () {
            this.$nextTick(() => {
                this.$refs.networkForm.forEach((item, idx) => {
                    if (item.$refs[item.formItems[0][this.uniqueKey]][0]) {
                        item.$refs[item.formItems[0][this.uniqueKey]][0].list = this.list
                        // let copyValue = item.$refs[item.formItems[0][this.uniqueKey]][0].copyValue
                        // let originValue = this.getOriginValues(this.list, idx, copyValue)
                        // if (originValue)
                        //     item.$refs[item.formItems[0][this.uniqueKey]][0].originValue = originValue
                        // UCMP3-6415

                        // 方法一
                        if (!item.$refs[item.formItems[0][this.uniqueKey]][0].originValue) {
                            let copyValue = item.$refs[item.formItems[0][this.uniqueKey]][0].copyValue
                            let originValue = this.getOriginValues(this.list, idx, copyValue)
                            item.$refs[item.formItems[0][this.uniqueKey]][0].originValue = originValue
                        }
                        item.$refs[item.formItems[0][this.uniqueKey]][0].setOriginValue()
                        // 方法二
                        // if (this.list && this.list.length)
                        //     item.$refs[item.formItems[0][this.uniqueKey]][0].setOriginValue()
                    }
                })
            })
        },
        /**
         * @description 获取selectValues的原始对象
         */
        getOriginValues (list, idx, copyValue) {
            let type = this.netFormItems[idx].networkFormItem.type
            if (type === 'selectValues') {
                let value_key = this.formItem.data_link.value_key
                let value = this.networkList[idx][value_key]
                if (!value && this.value && this.value[idx]) 
                    value = this.value[idx][value_key]

                if (!value && copyValue && copyValue[value_key]) 
                    value = copyValue[value_key]
                if (value) {
                    let originValue = list.find(item => item[this.formItem.data_link.value_key] === value)
                    return originValue
                }
            }
        },
        /**
         * @description 更新formItems
         */
        updateFormItem () {
            if (this.enableInternet === 'yes') {
                let isHasIpPool = this.formItem.attached_attrs.ipTypes.some(item => item.type === 'ip_pool')
                this.formItem.attached_attrs.ipTypes = this.formItem.attached_attrs.ipTypes.filter(item => item.type === 'ip_pool')
                if (isHasIpPool) {
                    this.networkList.forEach(item => {
                        item.ip_type = 'ip_pool'
                    })
                }
            } else if (this.enableInternet === 'no') {
                let isHasIpPool = this.formItem.attached_attrs.ipTypes.some(item => item.type === 'ip_pool')
                if (this.copyFormItem && isHasIpPool) {
                    this.formItem.attached_attrs.ipTypes = this.copyFormItem.attached_attrs.ipTypes
                    this.netFormItems.forEach((item, index) => {
                        this.networkList[index].ip_type = this.copyFormItem.attached_attrs.ipTypes[0].type
                    })
                }
            }

            // 处理子网请求参数enable_internet
            let enableInternetParam = {enable_internet: this.enableInternet}

            let provideParam = {provide_id: this.provideId}
            this.netFormItems.forEach(item => {
                item.attachFormItem.forEach(attachItem => {
                    if (attachItem.data_link && attachItem.data_link.endpoint && attachItem.key === 'subnet_id') {
                        if (!attachItem.data_link.params)
                            this.$set(attachItem.data_link, 'params', {})
                        attachItem.data_link.params = { ...attachItem.data_link.params, ...enableInternetParam, ...provideParam }
                    }
                })
            })
        }
    },
    created () {
        this.init()
    },
    computed: {
        enableInternetKey () {
            let keys = Object.keys(this.formData)
            let enableInternetKey = keys.find(item => (item.includes('@enable_internet')))
            if (!enableInternetKey) enableInternetKey = keys.find(item => (item.includes('enable_internet')))

            return enableInternetKey
        },
        enableInternet () {
            return this.formData[this.enableInternetKey]
        },
        networkListString () {
            return JSON.stringify(this.networkList)
        },
        valueString () {
            return JSON.stringify(this.value)
        },
        provideIdKey () {
            let keys = Object.keys(this.formData)
            let provideIdKey = keys.find(item => (item.includes('@provider_id')))
            if (!provideIdKey) provideIdKey = keys.find(item => (item.includes('provider_id')))

            return provideIdKey
        },
        provideId () {
            return this.formData[this.provideIdKey]
        }
    },
    watch: {
        networkList: {
            handler (newValue, oldValue) {
                this.handleNetworkList()
            },
            deep: true
        },
        value: {
            handler (newValue, oldValue) {
                this.handleValue(newValue, oldValue)
            },
            deep: true
        },
        formItem: {
            handler (newValue, oldValue) {
                // 针对不同的云厂商切换需要初始化
                this.init()
            }
        },
        list: {
            handler (newValue, oldValue) {
                this.updateList()
                //UCMP3-6930 申请云主机选择“开通互联网”后，（审批管理）管理员处理申请单时IP组自子网不出来
                // this.updateFormItem()
            },
            deep: true
        },
        'netFormItems.length' (newLen, oldLen) {
            this.updateList()
        },
        'enableInternet' (newVal, oldVal) {
            if (newVal !== oldVal) 
                this.updateFormItem()
        },
        provideId (newVal, oldVal) {
            if (newVal && newVal !== oldVal) 
                this.updateFormItem()  
        }
    }
}
</script>
<style lang="scss" scoped>
.network-container {
    padding-right: 13px;
    .netItem-container {
        display: flex;
        position: relative;
        .network-form {
            width: 100%;
        }
        .opr-btn-pane {
            margin-left: -200px;
            @media screen and (max-width:1366px){
                margin-left: -130px;
            }
        }
    }
}
</style>
