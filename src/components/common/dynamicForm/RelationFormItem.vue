<template lang="pug">
    span
        UcmpDynamicFormItem(
        :key="formItem.key"
        :showFormItem="showFormItem"
        :formItem="formItem"
        :formData="formData"
        :value.sync="formItemData[formItem.key]"
        :ifTrim="ifTrim")
        UcmpDynamicFormItem(
        v-for="childForm in formItem.children"
        v-if="formItemData[formItem.key] === childForm.key"
        :key="childForm.key"
        :showFormItem="showFormItem"
        :formItem="childForm"
        :formData="formData"
        :value.sync="formItemData[childForm.key]"
        :ifTrim="ifTrim")
</template>

<script>
    /**
     * @description
     * @author jia.lu
     */
    export default {
        name: 'RelationFormItem',
        components: {},
        props: {
            formItemData: {
                type: Object,
                default: function () {
                    return {}
                }
            },

            formData: {
                type: Object,
                default: function () {
                    return {}
                }
            },

            display: {
                type: Object,
                default: function () {
                    return {}
                }
            },

            showFormItem: {
                type: Boolean,
                default: function () {
                    return true
                }
            },

            formItem: {
                type: Object,
                default: function () {
                    return {}
                }
            },

            uniqueKey: {
                type: String,
                default: function () {
                    return 'key'
                }
            },

            ifTrim: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {}
        },
        computed: {
            childrenKeys () {
                return this.formItem.children.map(item => item.key)
            }
        },
        methods: {}
    }
</script>

<style lang="scss" scoped>

</style>