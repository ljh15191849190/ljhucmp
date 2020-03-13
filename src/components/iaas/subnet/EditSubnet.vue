<template lang="pug">
    el-form
        DynamicForm(
            :formItems="formItems"
            uniqueKey="prop"
            :formData="subnetForm"
            :labelWidth="'50px'"
            :labelPosition="labelPosition"
        )
        el-form-item.text-center
            el-button(size="small" @click="cancel") 取消
            el-button(size="small" type="primary" @click="submit") 保存
</template>
<script>
/**
 * @description 新建/编辑网段
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import Subnet from '@mock/subnet/subnet.mock'
import OperMixin from '@mixins/operatorLog.mixin'
import Api from '@api'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    props: ['prefixForm'],
    mixins: [OperMixin],
    data () {
        return {
            labelPosition: 'right',
            subnetForm: {
                prefix: '',
                status: 1, 
                role: null,
                vlan: null,
                description: ''
            },
            formItems: [
                {
                    label: '子网',
                    prop: 'prefix',
                    type: 'input',
                    tip: 'IPv4 或者 IPv6 地址 (带掩码), 如:192.168.1.0/24',
                    description: '请输入子网地(IPv4或IPv6带掩码),如:192.168.1.0/24',
                    validation: {
                        required: true,
                        reg: '/^((\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])(\\/)([1-9]|[12][0-9]|3[0-2])$/'
                    }
                },
                {
                    label: '状态',
                    prop: 'status',
                    type: 'select',
                    description: '请选择状态',
                    defaultOptions: Subnet.ipPoolStates,
                    data_link: {
                        text_field: 'label',
                        value_field: 'prop'
                    },
                    validation: {
                        required: true
                    }
                },
                {
                    label: '用途',
                    prop: 'role',
                    type: 'select',
                    description: '请选择用途',
                    data_link: {
                        endpoint: '/api/ipam/roles/',
                        method: 'GET',
                        text_field: 'name',
                        value_field: 'id',
                        result: 'results'
                    },
                    validation: {
                        required: true
                    }
                },
                {
                    label: 'vlan',
                    prop: 'vlan',
                    type: 'select',
                    description: '请选择vlan',
                    data_link: {
                        endpoint: '/api/ipam/vlans/',
                        method: 'GET',
                        text_field: 'name',
                        value_field: 'id',
                        result: 'results'
                    },
                    validation: {
                        required: false
                    }
                },
                {
                    label: '描述',
                    prop: 'description',
                    type: 'textarea',
                    description: '请输入描述',
                    validation: {
                        required: true,
                        max: 100
                    }
                }
            ]
        }
    },
    methods: {
        /**
         * @description 取消操作
         */
        cancel () {
            this.$emit('closeDialog')
        },

        /**
         * @description 保存网段
         */
        submit () {
            this.$validator.validate().then(valid => {
                if (valid) {
                    if (this.prefixForm && this.prefixForm.id) {
                        this.patchSubnetForm()
                        return
                    }
                    this.postSubnetForm()
                }
            })
        },

        postSubnetForm () {
            let subnetForm = Object.assign(this.subnetForm, {tenant: localStorage.getItem('tenant')}, { _id: 'createprefix' })
            Api.post('iaas_prefixes', subnetForm, false).then(
                res => {
                    this.$notify({
                        type: 'success',
                        message: '创建子网成功'
                    })
                    this.$emit('submit')

                    // 插入操作日志
                    this.addOperLog({
                        text: '创建子网: ' + this.subnetForm.prefix,
                        modular_code: this.MODULAR_CODE.CLOUDINFRASTRUCTURE,
                        type_code: this.TYPE_CODE.CREATE,
                        resource: '子网'
                    })
                }
            )
        },

        patchSubnetForm () {
            let subnetForm = JSON.parse(JSON.stringify(this.subnetForm))
            subnetForm.tenant = localStorage.getItem('tenant')
            Api.patch('iaas_edit_prefixes', Object.assign(subnetForm, { _id: this.prefixForm.id }), false).then(
                res => {
                    this.$notify({
                        type: 'success',
                        message: '修改子网成功'
                    })
                    this.$emit('submit')

                    // 插入操作日志
                    this.addOperLog({
                        text: '修改子网: ' + this.subnetForm.prefix,
                        modular_code: this.MODULAR_CODE.CLOUDINFRASTRUCTURE,
                        type_code: this.TYPE_CODE.UPDATE,
                        resource: '子网'
                    })
                }
            )
        }
    },

    created () {
        if (this.prefixForm.id) {
            this.subnetForm.prefix = this.prefixForm.prefix
            this.subnetForm.status = this.prefixForm.status.value
            this.subnetForm.role = this.prefixForm.role ? this.prefixForm.role.id : null
            this.subnetForm.vlan = this.prefixForm.vlan ? this.prefixForm.vlan.id : null
            this.subnetForm.description = this.prefixForm.description
        }
    },

    components: {
        DynamicForm
    }
}
</script>
<style lang="scss" scoped>
</style>
