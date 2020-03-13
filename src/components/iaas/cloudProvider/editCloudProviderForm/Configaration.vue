<template lang="pug">
    div.cloud-container-conf
        div.cloud-conf-container
            div.full-height
                div.title API配置凭证
                div.cloud-conf-table.overflow-y-auto.padding-bottom
                    el-col(:span=16 :offset=3)
                        el-form.basic-form(label-width="120px" label-position="right") 
                            F5ConfigForm(v-if="(cloudProvider.type === 'bigip')" :form_data="form_data" :type="id")
                            DynamicForm.basic-form(
                                v-else
                                :formItems="attribute"
                                :formData.sync="form_data"
                                :display.sync="form_display"
                                :labelPosition="'right'")
                            
        div.cloud-provider-bottom
            el-button(size="small" v-for="btn in submitBtns" :key="btn.prop" :type="btn.type" :plain="btn.plain" @click="submitEvent(btn.prop)" :disabled="btn.disabled")
                span {{ btn.label }}
</template>
<script>
    import Api from '@api'
    import cloudProvider from '@mixins/cloudProvider.mixin'
    import F5ConfigForm from './F5ConfigForm'
    import DynamicForm from '@/components/common/dynamicForm/DynamicForm'

    export default {
        name: 'Configaration',
        mixins: [cloudProvider],
        inject: ['$validator'],
        data () {
            return {
                id: '',
                providers: [],
                form_data: {},
                form_display: {},
                submitBtns: [
                    {
                        prop: 'prev',
                        label: '上一步: 云厂商',
                        type: 'warning',
                        plain: true,
                        disabled: false
                    },
                    {prop: 'submit', label: '保存', type: 'warning', plain: false}
                ],
                timeOptions: this.initTimeOptions()
            }
        },
        methods: {
            initTimeOptions () {
                let hours = 0, minute = 0, arr = []
                while (hours < 24) {
                    arr.push({
                        label: `${hours}:${!minute ? '00' : minute}`,
                        value: `${hours < 10 ? ('0' + hours) : hours}:${!minute ? '00' : minute}`
                    })

                    minute += 15
                    if (minute === 60) {
                        hours++
                        minute = 0
                    }
                }
                return arr
            },
            /**
             * @description 获取云厂商定义
             */
            getProviderConf () {
                Api.get('providerDefine', {}, true).then(
                    res => {
                        this.providers = res
                        this.getProviderInfo()
                    }
                )
            },
            getProviderInfo () {
                Api.get('provider', {id: this.id}, true).then(
                    res => {
                        this.form_data = res.default_auth
                        this.$set(this.form_data, 'name', res.name)
                    }
                )
            },
            /**
             * @description 表单操作
             */
            submitEvent (prop) {
                if (prop === 'prev') {
                    this.setCloudProvider({
                        cur_step: this.cloudProvider.cur_step - 1,
                        type: this.cloudProvider.type
                    })
                } else {
                    this.$validator.validate().then(result => {
                        if (result) {
                            this.$set(this.submitBtns[1], 'disabled', true)
                            if (this.id === 'add') {
                                let resObj = {
                                    name: this.form_data.name,
                                    provider_code: this.cloudProvider.type,
                                    default_auth: this.form_data
                                }
                                Api.post('provider', resObj, true).then(res => {
                                    this.$message({
                                        type: 'success',
                                        message: `云厂商: ${this.form_data.name} 创建成功!`
                                    })
                                    this.$router.push('/cloud-provider')
                                }, err => {
                                    console.log(err)
                                    this.$set(this.submitBtns[1], 'disabled', false)
                                })
                            } else {
                                let resObj = {
                                    id: this.id,
                                    name: this.form_data.name,
                                    default_auth: this.form_data
                                }
                                Api.put('provider', resObj, true).then(res => {
                                    this.$message({
                                        type: 'success',
                                        message: `云厂商: ${this.form_data.name} 修改成功!`
                                    })
                                    this.$router.push('/cloud-provider')
                                }, err => {
                                    console.log(err)
                                    this.$set(this.submitBtns[1], 'disabled', false)
                                })
                            }
                        }
                    })
                }
            }
        },
        created () {
            this.id = this.$route.params.id
            if (this.id !== 'add') {
                this.$set(this.submitBtns[0], 'disabled', true)
                this.getProviderConf()
            } else {
                //厂商类型：vmware_vsphere中允许不授信ssl默认选中（否）
                if (this.cloudProvider.type === 'vmware_vsphere')
                    this.$set(this.form_data, 'allow_unverified_ssl', 'false')
            }
        },
        computed: {
            attribute () {
                let providers = this.id !== 'add' ? this.providers : this.cloudProvider.providers
                if (!providers.length) return []

                for (let i = 0, len = providers.length; i < len; i++) {
                    if (this.cloudProvider.type === providers[i].code) {
                        let attribute = providers[i].metadata.attribute
                        if (this.id !== 'add') {
                            attribute.forEach(item => {
                                if (item.modified === false)
                                    item.modified = true
                                if (item.key === 'password' || item.key === 'secret_key') {
                                    item.validation.required = false
                                    item.description = '******'
                                }
                            })
                        }

                        return attribute
                    }
                }
            }
        },
        components: {
            DynamicForm,
            F5ConfigForm
        }
    }
</script>
<style lang="scss" scoped>
</style>


