import Api from '@api'
export default {
    data () {
        return {
            vmvareAttrItem: null
        }
    },
    methods: {
        /**
         * @description 根据主机获取vmware的网络列表
         */
        setNetWorkList () {
            if (this.vmvareAttrItem) {
                let params = { ...this.vmvareAttrItem.data_link.params, ...this.vmHostParam }
                Api.get(this.vmvareAttrItem.data_link.endpoint, params, true).then(
                    network => {
                        // 列表数据变更后，校验v-model的value是否需要变化
                        if (this.sysForm) {
                            this.sysForm.networkObj.networkList = network
                            this.sysForm.networkObj.network = this.getChangeNetwork(this.sysForm.networkObj.networkList, this.sysForm.networkObj.network)
                        } else {
                            this.networkObj.networkList = network
                            this.networkObj.network = this.getChangeNetwork(this.networkObj.networkList, this.networkObj.network)
                        }
                    }
                )
            }
        },
        /**
         * @description 根据网络列表获取最新的网络
         * @param networkList 网络列表
         */
        getChangeNetwork (networkList, network) {
            network.forEach(netItem => {
                let index = networkList.findIndex(netListItem => netListItem.network_id === netItem.network_id)
                if (index < 0) {
                    netItem.network_id = ''
                    netItem.network_name = ''
                }
            })

            return network
        },
        /**
         * @description 设置vmare的依赖参数
         */
        setVmvareDependces (formData, vmHostParam) {
            this.vmvareAttrItem.dependencies.forEach(
                item => {
                    let dependKey = item
                    if (item.indexOf('@') > 0 && item.indexOf('@') < item.length) 
                        dependKey = item.split('@')[1]

                    vmHostParam[dependKey] = Array.isArray(formData[item]) ? formData[item].join(',') : formData[item]
                }
            )
        }
    },
    computed: {
        vmHostParam () {
            let vmHostParam = {}
            if (this.vmvareAttrItem && this.vmvareAttrItem.dependencies) {
                // 处理蓝图的网络对主机依赖
                if (this.formData)
                    this.setVmvareDependces(this.formData, vmHostParam)
                
                // 处理审批的网络对主机依赖
                if (this.sysForm && this.sysForm.serviceForm && this.sysForm.serviceForm.length) {
                    this.sysForm.serviceForm.forEach(serviceItem => {
                        if (serviceItem.formData)
                            this.setVmvareDependces(serviceItem.formData, vmHostParam)
                    })
                }
            }

            return vmHostParam
        }
    },
    watch: {
        // 根据vmware主机来动态设置vmware网络
        vmHostParam (newVal, oldVal) {
            this.setNetWorkList()
        }
    }
}
