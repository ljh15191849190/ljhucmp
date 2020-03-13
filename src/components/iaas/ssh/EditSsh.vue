<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="handleClose" width="600px")
        el-form(:model="sshForm" :rules="rules" ref="sshForm" label-width="120px")
            el-form-item(label="名称" prop="name")
                el-input(v-model="sshForm.name" :maxlength="25")
            el-form-item(label="方式" prop="type")
                el-radio-group(v-model="sshForm.type")
                    el-radio(label="create") 创建新密钥对
                    el-radio(label="reuse") 使用已有公钥
            el-form-item(label="加密方法" prop="sshType" v-if="sshForm.type === 'create'")
                el-select(v-model="sshForm.sshType")
            el-form-item(label="公钥信息" prop="msg" v-if="sshForm.type === 'reuse'")
                el-input(type="textarea" :rows="8" :maxlength="100" v-model="sshForm.msg")
        div.dialog-footer(slot="footer")
            el-button(@click="handleClose()") 取消
            el-button(@click="submitForm" type="primary") 确定
</template>
<script>
export default {
    name: 'EditSsh',
    props: ['visible', 'sshData'],
    data () {
        return {
            sshForm: {
                name: '',
                type: 'create',
                sshType: '',
                msg: ''
            },
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' }
                ]
            }
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
            this.$refs.sshForm.validate((valid) => {
                if (valid) {
                }
            })
        }
    },
    computed: {
        title () {
            let title = this.sshData ? '编辑密钥' : '创建密钥'
            return title
        }
    }
}
</script>
<style lang="scss" scoped>

</style>

