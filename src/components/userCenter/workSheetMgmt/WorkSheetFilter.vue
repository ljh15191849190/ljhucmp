<template lang="pug">
    el-form.ws-filter(inline size="small" label-width="0")
        el-form-item
            el-input(v-model="params.ticketCode" placeholder="工单编号" @change="change('ticketCode', $event)" clearable)
        el-form-item
            el-input(v-model="params.title" placeholder="工单标题" @change="change('ticketTitle', $event)" clearable)
        el-form-item
            LazySelectUser(v-model="params.createdBy" placeholder="创建人" @change="change('createdBy', $event)")
        el-form-item
            LazySelectUser(v-model="params.takingUserId" placeholder="处理人" @change="change('takingUserId', $event)")
        el-form-item
            el-button(type="primary" @click="search") 查询
</template>

<script>
    import LazySelectUser from '@common/LazySelectUser'

    /**
     * 工单列表过滤项
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'WorkSheetFilter',
        components: {LazySelectUser},
        props: ['value'],
        data () {
            return {
                params: {
                    ticketCode: '',
                    title: '',
                    createdBy: '',
                    takingUserId: ''
                }
            }
        },
        computed: {},
        methods: {
            search () {
                this.$emit('search', this.params)
            },
            change (changeKey, event) {
                this.$emit('input', this.params, changeKey)
                this.$emit('change', this.params, changeKey)
            }
        },
        watch: {
            value: {
                immediate: true,
                handler (newVal) {
                    if (newVal) this.params = {...this.params, ...newVal}
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .el-form-item {
        margin-bottom: 6px;

        .el-input, .lazy-select-user {
            width: 200px;
        }
    }
</style>