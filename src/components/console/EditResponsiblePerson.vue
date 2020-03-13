<template lang="pug">
    el-form(ref="form" label-width="120px" size="small" label-position="right" :rules="rules" :model="model")
        el-form-item.rw-input.is-required(label="责任人" prop="userId")
            LazySelectUser.full-width(v-model="model.userId" ref="vmUser")
        el-form-item
            el-button(size="small" @click="quit") 取消
            el-button(size="small" type="primary" @click="submit" :loading="isSaving") 提交
</template>

<script>
    import {mapGetters} from 'vuex'
    import LazySelectUser from '@common/LazySelectUser'
    import Api from '@api'

    /**
     * @description 修改资源并提交申请单组件，控制台使用
     */
    export default {
        props: ['serviceCode', 'checkedInstance', 'checkedMetadata'],
        data () {
            return {
                model: {
                    userId: ''
                },
                isSaving: false,
                rules: {
                    userId: [
                        {required: true, message: '请选择责任人', trigger: 'blur'}
                    ]
                }
            }
        },

        methods: {
            quit () {
                this.$emit('closeModal')
            },
            // 责任人修改
            submit () {
                this.$refs.form.validate(result => {
                    if (result) {
                        let param = {
                            service_code: this.serviceCode,
                            instance_id: this.checkedInstance[this.checkedMetadata.value_field],
                            service_instance_id: this.checkedInstance.service_instance_id,
                            user_id: this.model.userId,
                            user_name: this.$refs.vmUser.$refs.select.selectedLabel || ''
                        }

                        this.isSaving = true
                        Api.put('modifyServiceResource', param, true).then(res => {
                            this.isSaving = false
                            this.$notify.success('操作成功。')
                            this.$emit('operationSuccess')
                            this.$emit('closeModal')
                        }, () => {
                            this.isSaving = false
                            this.$notify.error('责任人修改失败。')
                        })
                    }
                })
            }
        },

        created () {
            // 设置责任人的默认值
            this.checkedInstance.user_id && (this.model.userId = this.checkedInstance.user_id)
        },

        computed: {
            ...mapGetters([
                'metadata'
            ])
        },

        components: {
            LazySelectUser
        }
    }
</script>
