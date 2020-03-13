<template lang="pug">
    component.full-container(
    ref="vmSelect"
    :is="componentKey"
    :endpoint="formItem.data_link.endpoint"
    :params="params"
    @change="change"
    v-model="innerModel"
    :placeholder="placeholder")
</template>

<script>
    import LazySelectEcs from '@common/LazySelectEcs'

    const componentMap = {
        'lazy-ecs': 'LazySelectEcs'
    }

    /**
     * 懒加载 和 动态表单 中间件
     *
     * @description
     *   加入其他懒加载组件需补全所需params和reqKey之类的props数据
     * @author jia.lu
     */
    export default {
        name: 'DynamicItemLazyWrap',
        props: {
            type: {
                type: String,
                default: 'lazy-ecs'
            },
            value: {
                type: String
            },
            display: {
                type: String,
                default: ''
            },
            formItem: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            externalFormData: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        components: {LazySelectEcs},
        data () {
            return {
                innerModel: ''
            }
        },
        computed: {
            componentKey () {
                return componentMap[this.type]
            },

            params () {
                return {
                    owner: this.externalFormData.owner,
                    owner_type: this.externalFormData.owner_type
                }
            },

            innerDisplay () {
                return this.$refs.vmSelect.$refs.select.selectedLabel
            },

            placeholder () {
                return this.$attrs.placeholder || ''
            }
        },
        methods: {
            change (value) {
                this.$nextTick(() => {
                    this.$emit('input', this.innerModel)
                    this.$emit('update:display', this.innerDisplay)
                })
            }
        },
        watch: {
            value (newVal, oldVal) {
                if (this.innerModel !== newVal) {
                    //
                    this.innerModel = newVal
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
