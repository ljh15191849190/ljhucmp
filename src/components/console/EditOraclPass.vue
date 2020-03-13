<template lang="pug">
    el-form(label-width="120px" size="small" label-position="left")
        div.cfg-order-form.margin-left
            el-form-item.margin-bottom.dynamic-form-item.rw-input.is-required(label="sysdba用户")
                el-input(
                    v-model="resource.sysdba_username"
                    v-validate="'required'"
                    :name="'sysdba_username'"
                    placeholder="请输入sysdba用户"
                    data-vv-as="sysdba用户"
                    :class="{'input': true, 'is-danger': errors.has('sysdba_username')}"
                    maxlength="50"
                )
                span.validator-error.is-danger(v-if="errors.has('sysdba_username')") {{ errors.first('sysdba_username') }}
            el-form-item.margin-bottom.dynamic-form-item.rw-input.is-required(label="sysdba密码")
                el-input(
                    v-model="resource.sysdba_password"
                    v-validate="'required'"
                    :name="'sysdba_password'"
                    auto-complete="new-password"
                    type='password'
                    placeholder="请输入sysdba密码"
                    data-vv-as="sysdba密码"
                    :class="{'input': true, 'has-icon': true, 'is-danger': errors.has('sysdba_password')}"
                    maxlength="50"
                )
                el-tooltip.pos-right(content="该密码为数据库管理员密码" placement="left")
                    i.ucmp-icon-question.theme-color.icon-tip
                span.validator-error.is-danger(v-if="errors.has('sysdba_password')") {{ errors.first('sysdba_password') }}
            el-form-item
                el-button(size="small" @click="close") 取消
                el-button(size="small" type="primary" @click="submit" :loading="isSaving") 提交
</template>

<script>

import Api from '@api'

/**
 * @description oraclepass密码
 */
export default {
    props: ['serviceCode', 'checkedInstance', 'checkedMetadata'],
    $_veeValidate: {
        validator: 'new'
    },
    data () {
        return {
            resource: {
                sysdba_username: '',
                sysdba_password: ''
            },
            isSaving: false
        }
    },

    methods: {
        close () {
            this.$emit('closeModal')
        },
        // 修改
        submit () {
            this.$validator.validate().then(result => {
                if (result) {
                    let param = {}
                    param.oracleRacInstanceId = this.checkedInstance[0].id
                    param.sysdba_username = this.resource.sysdba_username
                    param.sysdba_password = this.resource.sysdba_password
                    this.isSaving = true
                    Api.put('oracleUpdatePass', param, true).then(
                        res => {
                            this.isSaving = false
                            this.$notify({
                                type: 'success',
                                title: '成功',
                                message: '修改成功'
                            })
                            this.$emit('operationSuccess')
                            this.$emit('closeModal')
                        },
                        () => {
                            this.isSaving = false
                        }
                    )
                }
            })
        }
    }

}
</script>
<style lang="scss" scoped>

</style>