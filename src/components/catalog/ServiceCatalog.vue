<template lang="pug">
    UcmpContainer.home-catalog-container(:breadcrumbItems="breadcrumbItems")
        ServiceFrame(
            slot="content" 
            :serviceList="applicableServices" 
            :cornerBtns="cornerBtns"
            :contentBtns="contentBtns"
            :cornerDisplayFuc="cornerDisplayFuc"
            @handleClick="handleClick")
        DeploySetup(slot="content" v-if="deployDialogVisible" 
        :serviceCode="serviceCode" :deployDialogVisible="deployDialogVisible" @closeDeployDialog="closeDeployDialog")

</template>
<script>
    import {mapGetters} from 'vuex'
    import Api from '@api'
    import DeploySetup from '@/components/catalog/common/DeploySetup'
    import ServiceFrame from '@/components/common/ServiceFrame'

    export default {
        data () {
            return {
                breadcrumbItems: [{prop: '', label: '服务目录'}],
                filteredService: [],
                applicableServices: [],
                bpServices: [],
                deployDialogVisible: false,
                serviceCode: '',
                cornerBtns: [
                    // {
                    //     code: 'deploy',
                    //     description: '部署配置',
                    //     privilege_code: 'Service_top',
                    //     icon: ''
                    // }
                ],
                contentBtns: [
                    {
                        code: 'apply',
                        description: '马上申请',
                        privilege_code: 'Service_apply',
                        icon: 'ucmp-icon-serlog-apply-service'
                    }
                ]
            }
        },
        components: {DeploySetup, ServiceFrame},
        computed: {
            ...mapGetters([
                'metadata',
                'menuMetadataPromise'
            ])
        },
        created () {
            this._initialize()
        },
        methods: {
            // UCMP3-5763 初始化数据
            initializeData () {
                let applicableArray = this.metadata.filter(
                    service => service.applicable
                )
                // 将编排列表和应用列表合并
                let existBpSerevice = JSON.parse(JSON.stringify(applicableArray)).filter(item => item.group === 'blueprint').map(item => item.service_code)

                this.bpServices.forEach(bp_item => {
                    // UCMP3-5614 修复编排修改后跳转进入服务目录多了一条重复数据的问题
                    if (!existBpSerevice.includes(bp_item.serviceGroup) && !applicableArray.find(meta => meta.service_code === bp_item.serviceCode)) {
                        applicableArray.push({
                            service_code: bp_item.serviceCode,
                            name: bp_item.blueprintName,
                            description: bp_item.description,
                            icon: bp_item.icon,
                            group: 'blueprint'
                        })
                    }
                })

                // store副本
                this.applicableServices = JSON.parse(JSON.stringify(applicableArray))
            },

            // UCMP3-5763 初始化函数
            _initialize () {
                // 获取编排模板列表
                let promise = Api.get('getBlueorintDetail', {}).then(
                    res => {
                        this.bpServices = res
                    }
                )
                let promises = [promise]
                if (this.menuMetadataPromise)
                    promises.push(this.menuMetadataPromise)
                Promise.all(promises).then(res => {
                    this.initializeData()
                })
            },

            goApply (catalog) {
                if (catalog.group === 'blueprint') {
                    this.$router.push({
                        path: '/catalog/' + catalog.service_code,
                        query: {type: 'service-apply'}
                    })
                } else
                    this.$router.push('/catalog/' + catalog.service_code)
            },

            /**
             * 显示专业软件部署配置
             */
            showDeploySetup () {
                this.deployDialogVisible = true
            },
            /**
             * 关闭专业软件部署配置
             */
            closeDeployDialog () {
                this.deployDialogVisible = false
            },
            cornerDisplayFuc ({service, btn}) {
                if (btn.code === 'roof' || btn.code === 'unRoof')
                    return true
                else if (btn.code === 'deploy')
                    return service.group === 'specialty_software'
            },
            handleClick (service, btn) {
                if (btn.code === 'deploy') {
                    this.serviceCode = service.service_code
                    this.showDeploySetup()
                } else if (btn.code === 'apply')
                    this.goApply(service)
            }
        }
    }
</script>
<style lang="scss" scoped>
.deploy-dialog {
    top: 60px;
    z-index: 9999;
}
</style>
