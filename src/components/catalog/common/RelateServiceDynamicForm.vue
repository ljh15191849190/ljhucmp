<template lang="pug">
    div.border-light-top.business-form
        div.child-form-title
            label.title {{name}}
            el-tooltip.margin-left(:content="description" placement="right")
                i.ucmp-icon-question.theme-color.icon-tip
        div.business-form-body
            div.form-body-item(
                v-for="(form, index) in forms"
                :key="form._index"
                :class="{'has_no_form': !form.attribute.length}"
            )
                div.operation-div.pos-btn(v-if="forms.length")
                    // UCMP-403 关联服务只有一项时还可以继续删除
                    el-button(type="primary" size="mini" icon="el-icon-remove-outline" @click="deleteItem(index)")
                    span.margin-left(v-if="!form.attribute.length") 已添加该服务
                    span.margin-left.ucmp-icon-complete__after(v-if="!form.attribute.length")
                div.form-items.full-width
                    DynamicForm(
                        :formItems="form.attribute"
                        :formData.sync="form.formData"
                        :display.sync="form.formDisplay"
                        labelPosition="right"
                        :keepValueFitDom="keepValueFitDom"
                    )
            div.form-body-item(v-if="multi && (!max || max && forms.length < max) || !multi && !forms.length")
                div.operation-div.add-btn
                    el-button(type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="addItem") 增加{{name}}
</template>
<script>
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'

export default {
    inject: ['$validator'],
    props: ['forms', 'name', 'description', 'code', 'multi', 'max', 'keepValueFitDom'],
    data () {
        return {

        }
    },

    methods: {
        addItem () {
            this.$emit('add:formData', this.code, this.forms.length)
        },

        deleteItem (index) {
            this.$emit('delete:formData', this.code, index)
        }
    },

    computed: {

    },

    components: {
        DynamicForm
    }
}
</script>
<style lang="scss" scoped>
.has_no_form {
    height: 50px;
    .ucmp-icon-complete__after {
        font-size: 18px;
        color: $running;
    }
}
</style>
