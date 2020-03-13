<template lang="pug">
    el-form(label-position="right" label-width="80px")
        el-form-item(label="IP状态" size="small")
            el-select(v-model="ipStatus")
                el-option(v-for="item in options" :key="item.value" :label="item.label" :value="item.value")
</template>

<script>
    /**
     * @description 更改IP状态
     */
    export default {
        name: 'ChangeIPStatus',
        data () {
            return {
                ipStatus: '',
                options: [
                    {
                        label: '已用',
                        value: '0'
                    }, {
                        label: '未用',
                        value: '1'
                    }, {
                        label: '禁用',
                        value: '2'
                    }, {
                        label: '预留',
                        value: '3'
                    }
                ]
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>