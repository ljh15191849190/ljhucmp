<template lang="pug">
    el-form
        DynamicForm(
            :formItems="formItems"
            :formData.sync="formData"
            :display.sync="display"
            @blurWidget="blurWidget"
        )
        slot(name="moreFormSlot")
        el-form-item
            el-button(@click="cancel" size="small") 取 消
            el-button(@click="submit" type="primary" size="small" :disabled="isSaving") 保 存
</template>
<script>
/**
 * @description 简易服务的申请表单，如添加应用
 */
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'

export default {
    $_veeValidate: {
        validator: 'new'
    },
    props: ['dialogVisible', 'formItems', 'isSaving', 'formData', 'display'],

    data () {
        return {
        }
    },
    
    methods: {
        closeDialog () {
            this.$emit('update:dialogVisible', false)
        },

        cancel () {
            this.closeDialog()
        },

        submit () {
            this.$validator.validate().then(valid => {
                if (!valid) return
                this.$emit('submit', {formData: this.formData, display: this.display})
            })
        },

        blurWidget (id) {
            this.$emit('blurWidget', id, this.formData)
        }
    },

    components: {
        DynamicForm
    }
}
</script>

<style lang="scss" scoped>

</style>
