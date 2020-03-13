<template lang="pug">
    UcmpContainer.service-define-contanier(:breadcrumbItems="breadcrumbItems")
        ServiceFrame(
            slot="content" 
            :serviceList="serviceData" 
            :cornerBtns="cornerBtns"
            :cornerDisplayFuc="cornerDisplayFuc"
            @handleClick="handleClick")
        el-dialog(
        slot="content"
        :title="configDialog.title"
        :visible.sync="configDialog.isShow"
        v-loading="saveLoading"
        element-loading-text="正在保存中..."
        element-loading-spinner="ucmp-icon-loading"
        )
            //- 租户比较多的时候，显示超出页面框 #UCMP-419
            el-checkbox-group.d-flex.padding-left.padding-right.flex-wrap(v-model="selectedTenant")
                el-checkbox.w-25.margin-top.no-margin-left.text-truncate(v-for="tenant in tenants" :key="tenant.label" :label="tenant.label" :title="tenant.value") {{tenant.value}}
            div.dialog-footer.d-flex.justify-content-end(slot="footer")
                el-button.default-button(type="info" size="small" plain  @click="close") 取消
                el-button(size="small" @click="submitConfig" type="primary") 确定
</template>

<script>
    import Api from '@api'
    import {mapActions} from 'vuex'
    import ServiceFrame from '@/components/common/ServiceFrame'

    export default {
        data () {
            return {
                breadcrumbItems: [{prop: '', label: '服务定义'}],
                // 配置弹出框
                configDialog: {
                    title: '服务配置',
                    isShow: false
                },
                // loading
                saveLoading: false,
                // 保存所有租户
                tenants: [],
                // 保存当前服务选择的租户
                selectedTenant: [],
                // 当前配置的服务
                currentService: '',
                serviceData: [],
                cornerBtns: [{
                    code: 'config_service',
                    description: '服务配置',
                    icon: 'ucmp-icon-serlog-config'
                }] // 右侧按钮列表
            }
        },
        methods: {
            // 初始化
            init () {
                // 获取所有服务元数据
                this.getAllMetaData()
                this.getTenantInfo()
            },
            getTenantInfo () {
                // 获取租户信息
                // // UCMP3-4724 ie获取不到数据
                Api.get('tenantInfo', {}, true).then(res => {
                    let result = []
                    let projects = res.data.filter(pro => pro.enabled)
                    projects.forEach(item => {
                        let opt = {}
                        opt.label = item.id
                        opt.value = item.name
                        result.push(opt)
                    })
                    this.tenants = result
                })
            },
            getAllMetaData () {
                Api.get('getAllMetadata', {}, true).then(res => {
                    if (res) {
                        let metaItems = []
                        res.forEach(item => {
                            if (!item.metadata.implements) {
                                // 抽象服务的实现类 不需要展示
                                metaItems.push(item.metadata)
                            }
                        })
                        this.serviceData = metaItems
                    }
                })
            },
            // 提交服务配置
            submitConfig () {
                let param = {}
                param.service_code = this.currentService
                param.tenants = this.selectedTenant
                // Service define maybe add or cancel tenants
                param.service_code && this.saveConfig(param)
                this.configDialog.isShow = false
            },
            // 关闭弹出框
            close () {
                // 清除掉选择的租户
                this.selectedTenant = []
                this.configDialog.isShow = false
            },
            // 获取服务配置信息
            getServiceConfig (service) {
                this.currentService = service.service_code
                this.configDialog.isShow = true
                Api.get('getMetaDataTenant', {_code: service.service_code}, true).then(res => {
                    if (res && res.tenants)
                        this.selectedTenant = res.tenants
                })
            },
            // 保存配置
            saveConfig (param) {
                this.saveLoading = true
                let params = Object.assign({}, param)
                Api.put('setMetaDataTenant', params, true).then(res => {
                    this.$notify.success('保存成功')
                    // Refresh meta data
                    this.syncMetaData()
                    // 清除掉选择的租户
                    this.selectedTenant = []
                    this.saveLoading = false
                }, () => {
                    this.saveLoading = false
                })
            },
            // Refresh meta data when service define success
            syncMetaData () {
                Api.get('getMetadata', {}, true).then(res => {
                    let metadata = res.map(
                        item => {
                            return item.metadata
                        }
                    )
                    this.setMetaData(metadata)
                })
            },
            handleClick (service, btn) {
                if (btn.code === 'config_service')
                    this.getServiceConfig(service)
            },
            cornerDisplayFuc ({service, btn}) {
                if (btn.code === 'roof' || btn.code === 'unRoof')
                    return false
                return true
            },
            ...mapActions([
                'setMetaData'
            ])
        },
        components: {
            ServiceFrame
        },
        created () {
            // 初始化
            this.init()
        }
    }
</script>

<style lang="scss" scoped>
</style>
