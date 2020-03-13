
<template lang="pug">
    UcmpFormContainer(:breadcrumbItems="breadcrumbItems")
        div(slot="form-content")
            el-form.allocate-form.is-large.padding(label-width="120px" label-position="right" size="small")
                el-form-item.rw-input(label="配置名称" prop="name")
                    el-input.input-width(v-model="sourcePoolForm.name" :readonly="sourcePoolForm.name !== ''")
                div(v-if="serverList.length" v-for="(item, index) in serverList" :key="item.service_code")
                    div.sub-title {{item.name}}
                    div(v-for="(formItem, index) in item.metadata.attribute" :key="index")
                        UcmpDynamicFormItem(
                            v-if="formItem.key !== 'vm_network' && formItem.key !== 'f5_sub_network' && (!formItem.linked || (formItem.linked && (showLinkedItemKeys.length > 0) && showLinkedItemKeys.indexOf(formItem[uniqueKey]) !== -1))"
                            :key="formItem[uniqueKey]"
                            :formItem="formItem"
                            :formData="formData"
                            :uniqueKey="uniqueKey"
                            :display.sync="formItemDisplay"
                            :value.sync="formItemData[formItem[uniqueKey]]"
                        )
                        AllocateNetworkItem(v-else-if="formItem.key === 'vm_network' || formItem.key === 'f5_sub_network'" :formItem="formItem" :networkObj="networkObj")

        div(slot="form-footer")
            el-button(@click="goBack" size="small") 返回
            el-button(type="warning" size="small" @click="submitForm" :disabled="submitDisabled") 保存
</template>
<script>
/**
 * @description 配置资源
 */
import Api from '@api'
import axios from 'axios'
import AllocateNetworkItem from './AllocateNetworkItem'
import Utils from '@server/Utils'
import metaUtils from '@/server/metadata.utils'
import networkMixin from './network.mixin.js'
export default {
    name: 'AllocateResources',
    inject: ['$validator'],
    mixins: [networkMixin],
    data () {
        return {
            submitDisabled: true,
            sourcePoolDefines: [],
            serverList: [],
            breadcrumbItems: [
                {prop: '/resource-pool', label: '基础配置'},
                {prop: '', label: '配置服务'}
            ],
            sourcePoolForm: {
                name: '',
                provider_code: ''
            },
            formData: {},
            display: {},
            serviceName: '',
            specs: [],
            sourceId: '',
            networkObj: {
                network: [],
                networkList: [],
                vmF5NetworkList: [],
                subnetList: [],
                f5_sub_network: ''
            },
            rules: {
                require: {
                    required: true
                }
            },
            linkedKeyAttrs: [],
            uniqueKey: 'id'
        }
    },
    methods: {
        /**
         * @description 初始化数据定义
         */
        init () {
            this.sourceId = this.$route.params.id
            this.submitDisabled = true
            Api.get('sourcePoolDefine', {}, true).then(
                res => {
                    this.sourcePoolDefines = res

                    Api.get('sourcePool', { id: this.sourceId }, true).then(
                        res => {
                            this.formData = {}
                            this.submitDisabled = false
                            this.specs = res.spec || []
                            this.sourcePoolForm.name = res.name
                            this.sourcePoolForm.provider_code = res.provider_code
                            this.serverList = this.sourcePoolDefines.filter(item => item.metadata && (item.provider_code === this.sourcePoolForm.provider_code))
                            let copiedData = { provider_id: res.provider_id }
                            //处理表单类型是selcet且接口需要传值
                            this.serverList.forEach(item => {
                                metaUtils.updateAttributeType(item.metadata.attribute, null, Utils.uuid())
                                item.metadata.attribute.forEach(attrItem => {
                                    this.specs.forEach(specItem => {
                                        if (specItem.default_spec.network)
                                            this.$set(this.formData, 'network', specItem.default_spec.network)
                                        if (specItem.default_spec.f5_sub_network)
                                            this.$set(this.formData, 'f5_sub_network', specItem.default_spec.f5_sub_network)
                                        if (specItem.default_spec[attrItem.key])
                                            this.$set(this.formData, attrItem[this.uniqueKey], specItem.default_spec[attrItem.key])

                                        if (specItem.display && specItem.display.length) {
                                            for (let index = 0; index < specItem.display.length; index++) {
                                                if (specItem.display[index].key === attrItem.key) {
                                                    this.display[attrItem[this.uniqueKey]] = specItem.display[index].value
                                                    break
                                                }
                                            }
                                        }
                                    })
                                    if (attrItem.data_link && attrItem.data_link.endpoint) {
                                        // 优化云厂商与基础配置项之间的联动关系，上层组件(当前组件)不需要改动endpoint，只需把参数赋值给params
                                        if (!attrItem.data_link.params)
                                            this.$set(attrItem.data_link, 'params', {})
                                        // 针对云主机和云硬盘添加厂商的查询条件
                                        // 修改此处逻辑，满足其他需要云厂商id的接口动态添加参数
                                        attrItem.data_link.params = { ...attrItem.data_link.params, ...copiedData }

                                        attrItem.type = 'select'
                                    }

                                    if (attrItem.enum) {
                                        attrItem.type = 'select'
                                        attrItem.defaultOptions = attrItem.enum
                                    }
                                    //vmware网络单独处理
                                    if (attrItem.key === 'vm_network' || attrItem.key === 'f5_sub_network') {
                                        let isVmF5Net = attrItem.key === 'f5_sub_network'
                                        if (isVmF5Net)
                                            this.networkObj.f5_sub_network = this.formData.f5_sub_network || ''
                                        else {
                                            //UCMP-1114 【申请单管理】用多网卡，多资源池，多存储的基础配置申请云主机和云硬盘，无法确认申请单
                                            //问题原因：需求问题
                                            //解决方法：本该后端自己处理单个问题，考虑目前后端代码改动问题，暂时前端对subnet_id特殊处理
                                            this.vmvareAttrItem = attrItem
                                            if (this.formData.network) {
                                                this.formData.network.forEach(item => {
                                                    if (item.subnet_id && item.subnet_id.length)
                                                        item.subnet_id = item.subnet_id[0]
                                                })
                                            }
                                            this.networkObj.network = this.formData.network || [{network_id: '', subnet_id: '', network_name: '', float_subnet_id: ''}]
                                        }
                                        //UCMP-636 【基础配置】在Vmware的基础配置服务界面，子网要过滤不能使用的网段
                                        let containerSubnetList = Api.get('iaas_prefixes', { offset: 0, limit: 999999, status: 0, tenant: localStorage.getItem('tenant') }, true)
                                        let inUseSubnetList = Api.get('iaas_prefixes', { offset: 0, limit: 999999, status: 1, tenant: localStorage.getItem('tenant') }, true)
                                        axios.all([containerSubnetList, inUseSubnetList]).then(axios.spread(
                                            (containerSubnet, inUseSubnet) => {
                                                this.networkObj.subnetList = [...containerSubnet.results, ...inUseSubnet.results]
                                            })
                                        )
                                    }

                                    //其他网络处理
                                    if (attrItem.key === 'network_id') {
                                        let networkItemValue = ''
                                        if (this.formData.network && this.formData.network.length)
                                            networkItemValue = this.formData.network[0].network_id + '#' + this.formData.network[0].network_name

                                        this.$set(this.formData, attrItem[this.uniqueKey], networkItemValue)
                                    }

                                    //处理lined true
                                    if (attrItem.link)
                                        this.linkedKeyAttrs.push(attrItem)
                                })
                            })
                        }
                    )
                }, err => {
                    console.log(err)
                    this.submitDisabled = false
                }
            )
        },
        /**
         * @description 关闭对话框
         */
        handleClose () {
            this.$emit('closeDialog')
        },
        /**
         * @description 返回列表
         */
        goBack () {
            this.$router.push('/resource-pool')
        },
        /**
         * @description 格式化请求参数
         */
        formatResData () {
            let resArr = this.serverList.map(item => {
                let default_spec = {}, display = []
                let copyDisplay = JSON.parse(JSON.stringify(this.formItemDisplay))
                item.metadata.attribute.forEach(attrItem => {
                    let baseDisplayItem = { key: 'network', label: '网络', value: '' }
                    if (copyDisplay[attrItem[this.uniqueKey]])
                        display.push({key: attrItem.key, label: attrItem.label, value: copyDisplay[attrItem[this.uniqueKey]]})

                    default_spec[attrItem.key] = this.formData[attrItem[this.uniqueKey]]
                    //处理vm-network
                    if (attrItem.key === 'vm_network') {
                        //UCMP-1120【基础配置】基础配置里，网络无法保存
                        let network = JSON.parse(JSON.stringify(this.networkObj.network))
                        network.forEach(item => {
                            if (item.subnet_id)
                                item.subnet_id = [item.subnet_id]
                        })
                        default_spec['network'] = network
                        //处理网络display
                        baseDisplayItem.value = network.map(item => {
                            return item.network_name
                        })
                        display.push(baseDisplayItem)
                    }
                    //处理f5_sub_network
                    if (attrItem.key === 'f5_sub_network')
                        default_spec[attrItem.key] = this.networkObj.f5_sub_network
                    //其他网络处理
                    if (attrItem.key === 'network_id') {
                        let netItem = {network_id: '', subnet_id: '', network_name: ''}
                        let networkItem = this.formData[attrItem[this.uniqueKey]].split('#')
                        if (networkItem.length)
                            netItem.network_id = networkItem[0]

                        if (networkItem.length > 1)
                            netItem.network_name = networkItem[1]

                        // UCMP-1427【申请单管理】青云和openstack的申请单具体配置，网络显示有问题
                        //处理openstack网络输入
                        if (!netItem.network_name)
                            netItem.network_name = netItem.network_id
                        //处理网络display
                        let index = display.findIndex(item => item.key === attrItem.key)
                        if (index > -1)
                            display.splice(index, 1)
                        baseDisplayItem.value = netItem.network_name
                        display.push(baseDisplayItem)
                        default_spec['network'] = [netItem]
                        delete default_spec[attrItem[this.uniqueKey]]
                    }
                })

                return {
                    service_code: item.service_code,
                    default_spec: default_spec,
                    display: display
                }
            })

            return resArr
        },
        /**
         * @description 提交表单
         */
        submitForm (isSaveAdd) {
            this.$validator.validate().then(result => {
                if (result) {
                    this.submitDisabled = true
                    let resObj = {
                        id: this.sourceId,
                        specs: this.formatResData()
                    }

                    Api.post('sourcePoolConf', resObj, true).then(
                        res => {
                            this.submitDisabled = false
                            this.$message({
                                type: 'success',
                                message: `基础配置: ${this.sourcePoolForm.name} 的 ${this.serviceName} 服务配置成功!`
                            })
                            this.goBack()
                        }, err => {
                            console.log(err)
                            this.submitDisabled = false
                        }
                    )
                }
            })
        }
    },
    created () {
        this.init()
    },
    computed: {
        formItemData: {
            get () {
                return this.formData
            },
            set (newVal) {
                this.formData = newVal
            }
        },
        formItemDisplay: {
            get () {
                return this.display
            },
            set (newVal) {
                this.$emit('update:display', newVal)
            }
        },
        showLinkedItemKeys () {
            let showLinkedKeys = []
            this.linkedKeyAttrs.forEach(linkeAttr => {
                let formItemData = this.formData[linkeAttr[this.uniqueKey]]
                if (formItemData && linkeAttr['link']['link_' + formItemData])
                    showLinkedKeys = [...showLinkedKeys, ...linkeAttr['link']['link_' + formItemData]]
            })
            return showLinkedKeys
        }
    },
    components: {
        AllocateNetworkItem
    }
}
</script>
<style lang="scss" scoped>
</style>
<style lang="scss">
</style>

