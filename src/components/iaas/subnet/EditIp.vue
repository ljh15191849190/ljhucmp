<template lang="pug">
    div
        el-form.ip-form
            DynamicForm(
                :formItems="formItems"
                uniqueKey="prop"
                :formData="ipForm"
                :labelWidth="'50px'"
                :labelPosition="labelPosition"
            )
            el-form-item
                el-button(@click="handleClose" size="small") 取消
                el-button(type="primary" @click="submitForm" size="small") 保存
</template>
<script>
/**
 * @description 创建、编辑IP组
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import Subnet from '@mock/subnet/subnet.mock'
import OperMixin from '@mixins/operatorLog.mixin'
import Api from '@api'
export default {
    $_veeValidate: {
        validator: 'new'
    },
    props: ['visible', 'ipInfo'],
    mixins: [OperMixin],
    data () {
        return {
            labelPosition: 'right',
            ipForm: {
                address: '',
                status: 1,
                purpose: '',
                description: ''
            },
            formItems: [
                {
                    label: 'IP',
                    prop: 'address',
                    type: 'input',
                    tip: 'IP地址 (带掩码), 如:192.168.1.0/24',
                    description: '请输入IP地址',
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
                    defaultOptions: Subnet.ipStates,
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
                    prop: 'purpose',
                    type: 'select',
                    description: '请选择用途',
                    defaultOptions: Subnet.ipPurposes,
                    data_link: {
                        text_field: 'label',
                        value_field: 'prop'
                    },
                    validation: {
                        required: true
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
         * @description 关闭对话框
         */
        handleClose () {
            this.$emit('closeDialog')
        },
        /**
         * @description 提交表单
         */
        submitForm () {
            this.$validator.validate().then(valid => {
                if (valid)
                    this.patchIp()
            })
        },

        patchIp () {
            let ipForm = JSON.parse(JSON.stringify(this.ipForm))
            ipForm.tenant = localStorage.getItem('tenant')
            Api.patch('iaas_edit_ip', Object.assign(ipForm, {_id: this.ipInfo.id}), false).then(
                res => {
                    this.$notify({
                        type: 'success',
                        message: '修改IP' + this.ipForm.address + '成功'
                    })
                    this.$emit('submitIp')

                    // 插入操作日志
                    this.addOperLog({
                        text: '修改IP: ' + this.ipForm.address,
                        modular_code: this.MODULAR_CODE.CLOUDINFRASTRUCTURE,
                        type_code: this.TYPE_CODE.UPDATE,
                        resource: 'IP'
                    })
                }
            )
        }
    },
    computed: {
        title () {
            let title = this.ipInfo ? '编辑IP组' : '创建IP组'
            return title
        }
    },

    created () {
        if (this.ipInfo.id) {
            this.ipForm.address = this.ipInfo.address
            this.ipForm.status = this.ipInfo.status.value
            this.ipForm.purpose = this.ipInfo.purpose
            this.ipForm.description = this.ipInfo.description
        }
    },

    components: {
        DynamicForm
    }
}
</script>
<style lang="scss" scoped>
.ip-form {
    // padding-left: 100px;
    width: 70%;
    margin: 0 auto;
}
</style>

