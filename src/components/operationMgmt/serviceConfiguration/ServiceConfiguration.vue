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
            el-form(:model="applyConfig" :rules="rules" ref="ruleForm" label-width="120px" size="mini")
                el-form-item(label="处理角色" prop="role")
                    el-select(v-model="applyConfig.role" filterable)
                        el-option(v-for="role in roles" :key="role.role_id" :value="role.role_id" :label="role.name")
                el-form-item(label="申请选项" prop="attributes" v-if="currentService !== 'quota'")
                    el-checkbox-group(v-model="applyConfig.attributes")
                        el-checkbox(v-for="attr in currentServiceAttributes" :key="attr.key" :label="attr.key" @change="attributeChange(attr, $event)") {{attr.label}}
                el-form-item(label="交付选项" v-if="isTmpFill")
                    el-switch(v-model="applyConfig.config.template_immutable")
                    span.ml-10 只允许通过{{systemConfig.configure_template}}填充云厂商信息
                el-form-item
                    el-button.default-button(type="info" size="small" plain  @click="close") 取消
                    el-button(size="small" @click="submitConfig" type="primary") 确定
</template>

<script>
    import Api from '@api'
    import {mapGetters} from 'vuex'
    import ServiceFrame from '@/components/common/ServiceFrame'

    export default {
        data () {
            return {
                breadcrumbItems: [{prop: '', label: '服务配置'}],
                // 配置弹出框
                configDialog: {
                    title: '服务配置',
                    isShow: false
                },
                // loading
                saveLoading: false,
                roles: [],
                applyConfig: {
                    id: null,
                    role: null,
                    config: {
                        template_immutable: false
                    },
                    attributes: []
                },
                rules: {
                    role: [
                        { required: true, message: '请选择角色', trigger: 'blur' }
                    ],
                    attributes: [
                    ]
                },
                // 当前配置的服务
                currentService: '',
                serviceData: [],
                cornerBtns: [{
                    code: 'config_service',
                    description: '服务配置',
                    icon: 'ucmp-icon-serlog-config'
                }], // 右侧按钮列表
                cfgServiceList: []
            }
        },
        methods: {
            // 初始化
            init () {
                // 获取配置模板中的服务列表 (只有存在于配置模板中服务列表的服务才可以设置：是否开启模板填充的功能)
                this.getProvideDefine()
                // 获取所有服务元数据
                this.getAllMetaData()
            },
            getAllRolesByModule () {
                // 获取租户信息
                // // UCMP3-4724 ie获取不到数据
                Api.get('getRolesByPlatform', {platform: 'ucmp'}, true).then(res => {
                    this.roles = res.data
                })
            },
            getAllMetaData () {
                Api.get('getBasicMetadata', {}, true).then(res => {
                    if (res) {
                        // UCMP3-5717 created | orchestrate 属性为true的过滤属性集合长度为空，过滤掉，不在页面显示
                        if (Array.isArray(res)) {
                            let serviceData = []
                            // 针对配额进行特殊处理
                            let quotaItem = res.find(item => item.service_code === 'quota')
                            serviceData = res.filter(service => {
                                if (!service.metadata.implements && service.metadata.attribute.filter(attr => attr.created || attr.orchestrate).length && service.service_code !== 'tag')
                                    return true
                            })
                            .map(service => service.metadata)
                            if (quotaItem && quotaItem.metadata)
                                serviceData.push(quotaItem.metadata)
                            this.serviceData = serviceData
                        }
                    }
                })
            },
            // 提交服务配置
            submitConfig () {
                this.$refs.ruleForm.validate(valid => {
                    if (valid) {
                        let param = {}
                        param.service_code = this.currentService
                        // param.roles = this.selectedRole
                        // Service define maybe add or cancel roles
                        this.saveConfig(param)
                        this.configDialog.isShow = false
                    }
                })
            },
            // 关闭弹出框
            close () {
                // 清除掉选择的租户
                this.applyConfig.role = null
                this.applyConfig.attributes.splice(0, this.applyConfig.attributes.length)
                this.configDialog.isShow = false
                this.currentService = null
            },
            // 获取服务配置信息
            getServiceConfig (service) {
                this.currentService = service.service_code
                this.configDialog.isShow = true
                this.getAllRolesByModule()
                this.getInitValuesByCheckedService()
            },
            // 保存配置
            saveConfig (param) {
                this.saveLoading = true
                let params = Object.assign({}, this.applyConfig, param)
                // 如果当前服务不需要模板填充，则将此字段从请求参数中删除
                if (!this.isTmpFill)
                    delete params.config
                if (this.currentService === 'quota')
                    params.attributes = []
                Api.put('setMetaDataApplyPrivilegeByTenant', params, true).then(res => {
                    this.$notify.success('保存成功')
                    this.currentService = null
                    this.applyConfig.role = null
                    this.applyConfig.id = null
                    this.applyConfig.attributes.splice(0, this.applyConfig.attributes.length)
                    this.saveLoading = false
                }, () => {
                    this.saveLoading = false
                })
            },
            handleClick (service, btn) {
                if (btn.code === 'config_service')
                    this.getServiceConfig(service)
            },
            cornerDisplayFuc ({service, btn}) {
                if (btn.code === 'roof' || btn.code === 'unRoof')
                    return false
                // 针对配额需要做特殊处理
                if (btn.code === 'config_service' && service.service_code === 'quota')
                    return true
                // 没有可配置属性，服务配置按钮不显示
                if (service.attribute && !service.attribute.filter(attr => attr.created || attr.orchestrate).length && btn.code === 'config_service')
                    return false
                return true
            },
            getInitValuesByCheckedService (val) {
                Api.get('getAttributePrivilegesByRole', {service_code: this.currentService}, true).then(res => {
                    // 服务配置初始化表单值
                    this.applyConfig.id = res.id
                    this.applyConfig.role = res.role
                    this.applyConfig.config.template_immutable = res.config && res.config.template_immutable ? res.config.template_immutable : false
                    this.applyConfig.attributes = res.attributes && res.attributes.filter(attr_key => typeof attr_key === 'string' && attr_key)
                })
            },
            // UCMP3-5691 单个CheckBox 改变事件：同一行显示的多个属性(在此用一个key代表)的同时选中、取消选中(数值)控制处理
            attributeChange (attr, val) {
                if (!attr.display_same_row)
                    return
                let allKeys = this.originAttributes.filter(_attr => _attr.display_same_row && _attr.display_same_row.key === attr.display_same_row.key)
                    .map(_attr => _attr.key)

                let attributes = JSON.parse(JSON.stringify(this.applyConfig.attributes))
                this.applyConfig.attributes.splice(0, this.applyConfig.attributes.length)
                if (val)
                    this.applyConfig.attributes = Array.from(new Set(attributes.concat(allKeys)))
                else
                    this.applyConfig.attributes = attributes.filter(key => allKeys.indexOf(key) === -1)
            },
            /**
             * @description 获取所有厂商配置的服务
             */
            getProvideDefine () {
                Api.get('cfgProviderDefine', {}, true).then(
                    res => {
                        this.cfgServiceList = res
                    }, () => {

                    }
                )
            }
        },
        computed: {
            currentServiceAttributes () {
                let service = this.serviceData.find(service => service.service_code === this.currentService)
                let sameRowObj = {}
                if (service && service.attribute) {
                    // UCMP3-5642 初始化attribute 加上对关联服务的分析
                    return service.attribute.filter(attr => {
                        // 防火墙中没有current_ip，此处应该保留relate_created为true的
                        if (!attr.created && !attr.orchestrate && !attr.relate_created)
                            return false
                        // UCMP3-5691 同一行显示的属性，取第一个作为代表显示
                        if (attr.display_same_row && !sameRowObj[attr.display_same_row.key]) {
                            sameRowObj[attr.display_same_row.key] = true
                            return true
                        } else if (attr.display_same_row && sameRowObj[attr.display_same_row.key])
                            return false
                        
                        return true
                    }).map(
                        attr => {
                            // UCMP3-5691 同一行显示的属性名称统一处理
                            if (attr.display_same_row)
                                attr.label = attr.display_same_row.label
                            return attr
                        }
                    )
                } else return []
            },

            // UCMP3-5691 未进行特殊过滤(一行显示)的属性列表，在同一行显示的属性选中|取消选中控制时比较使用
            originAttributes () {
                let service = this.serviceData.find(service => service.service_code === this.currentService)
                if (service && service.attribute) {
                    return service.attribute.filter(attr => {
                        if (attr.created || attr.orchestrate)
                            return true
                    })
                } else return []
            },

            // 当前服务是否存在于配置模板中的服务列表, 存在的话才可以设置：是否使用模板填充
            isTmpFill () {
                let index = -1
                if (Array.isArray(this.cfgServiceList) && this.cfgServiceList.length) {
                    index = this.cfgServiceList.findIndex(item => {
                        return item.service_code === this.currentService
                    })
                }
                return index !== -1
            },

            ...mapGetters([
                'platform',
                'systemConfig'
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
    .ml-10 {
        margin-left: 10px;
    }
</style>
