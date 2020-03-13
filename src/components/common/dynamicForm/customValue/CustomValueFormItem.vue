<template lang="pug">
    div.custom-value-container.d-flex
        el-select.to-check-values(
            filterable
            clearable
            :placeholder="showFormItem ? formItem.placeholder || formItem.description || '请选择' : formItem.label"
            v-model="computedValue"
            v-validate="computedValidation"
            :name="formItem[this.uniqueKey]"
            :disabled="disabled || formItem.disabled"
            :data-vv-as="formItem.label"
            :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
            @focus="focusWidget"
            @blur="blurWidget"
        )
            el-option(
                v-for="(item, index) in list"
                :key="index"
                :label="formatterListDisplay(item)"
                :value="item[valueKey]"
                :disabled="ifDisableOption(item, index)"
            )
        el-input.custom-value-input(
            type="text"
            v-model.trim="computedValue"
            v-validate="computedValidation"
            v-if="tobeCheckedValues.indexOf(computedValue) === -1"
            :placeholder="showFormItem ? formItem.description : formItem.label"
            :name="nameAttribute"
            :disabled="disabled || formItem.disabled"
            :data-vv-as="formItem.label"
            :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
            clearable
            @focus="focusWidget"
            @blur="blurWidget"
        )
</template>
<script>
export default {
    inject: ['$validator'],
    props: {
        formItem: {
            type: Object,
            default: () => {}
        },

        showFormItem: {
            type: Boolean,
            default: true
        },

        value: {
            // value值直接使用传入值，赋值null的话会对部分组件有干扰
            // UCMP3-441， UCMP3-468
            type: [String, Number, Array, Object]
        },

        computedValidation: {
            type: Object,
            default: () => {}
        },

        uniqueKey: {
            type: String,
            default: 'key'
        },

        disabled: {
            type: Boolean,
            default: false
        },

        nameAttribute: {
            type: String,
            default: 'key'
        },

        list: {
            type: Array,
            default: () => []
        },

        formatterListDisplay: {
            type: Function
        },

        ifDisableOption: {
            type: Function
        }
    },

    data () {
        return {

        }
    },

    computed: {
        computedValue: {
            get () {
                return this.value
            },
            set (val) {
                this.$emit('update:value', val)
            }
        },

        valueKey () {
            return this.formItem.data_link && this.formItem.data_link.value_key ? this.formItem.data_link.value_key : 'id'
        },

        tobeCheckedValues () {
            return this.list.map(item => item[this.valueKey]).filter(item => item)
        }
    },

    methods: {
        focusWidget () {
            this.$emit('focusWidget', this.formItem[this.uniqueKey])
        },

        blurWidget () {
            this.$emit('blurWidget', this.formItem[this.uniqueKey])
        }
    }
}
</script>
<style lang="scss" scoped>
.custom-value-container {
    width: 100%;
}
.to-check-values {
    width: 100px;
}
.custom-value-input {
    width: calc(100% - 100px);
    max-width: 380px;
}
</style>
