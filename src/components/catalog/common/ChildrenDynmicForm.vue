<template lang="pug">
    div.f5-pool-form
        div.pool(v-if="code === 'pool'") 
            F5DynamicForm(:forms="forms" :tableForms="tableForms" :name="name" :hasEcs="hasEcs" :keepValueFitDom="keepValueFitDom")
        div.d-flex(v-else)
            div.applyleft-title
                label.title {{name}}
            div.form-body
                div.form-body-item(
                    v-for="(form, index) in forms"
                    :key="form._index"
                )
                    div.operation-div
                        el-button(v-if="forms.length" type="primary" size="mini" icon="el-icon-remove-outline" @click="deleteItem(index)")
                    div.form-items
                        DynamicForm(
                            :formItems="form.attribute"
                            :formData.sync="form.formData"
                            :display.sync="form.formDisplay"
                            :keepValueFitDom="keepValueFitDom"
                        )
                div.form-body-item(v-if="multi || !multi && !forms.length")
                    div.operation-div
                        el-button(type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="addItem") 增加{{name}}
</template>
<script>
import F5DynamicForm from '@/components/catalog/services/F5DynamicForm'
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'

export default {
    name: 'ChildrenDynmicForm',
    inject: ['$validator'],
    props: ['forms', 'name', 'code', 'multi', 'tableForms', 'hasEcs', 'keepValueFitDom'],
    data () {
        return {

        }
    },
    methods: {
        addItem () {
            this.$emit('add:formData', this.code, this.forms.length, null, true)
        },
        deleteItem (index) {
            this.$emit('delete:formData', this.code, index, true)
        }
    },
    created () {
    },
    components: {
        DynamicForm,
        F5DynamicForm
    }
}
</script>
<style lang="scss" scoped>
.pool {
    width: 100%;
}
.applyleft-title {
  width: 10%;
  background: #fff;
  color: $fontTitleLight;
}

.form-body {
  margin-top: 5px;
  width: 80%;
}

.form-body-item {
  display: flex;
  position: relative;
  .operation-div {
      position: absolute;
      left: -20px;
      top: 0;
    margin-right: 10px;
  }
}
</style>
