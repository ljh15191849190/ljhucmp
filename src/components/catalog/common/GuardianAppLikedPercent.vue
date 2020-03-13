<template lang="pug">
    el-table(:data="likedAppList")
        el-table-column(
            v-for="column in columns"
            :key="column.prop"
            :prop="column.prop" 
            :label="column.label"
        )
            template(slot-scope="scope")
                span(v-if="column.prop === 'similar'") {{scope.row[column.prop] * 100}}%
                span(v-else) {{scope.row[column.prop]}}
</template>
<script>
/**
 * @description 应用相似度表单组件，添加应用快捷入口、审批时使用
 */
import Api from '@api'

export default {
    props: ['formData'],
    data () {
        return {
            columns: [
                {
                    prop: 'business_app_name',
                    label: '应用名称'
                },
                {
                    prop: 'shorter_name',
                    label: '应用简称'
                },
                {
                    prop: 'similar',
                    label: '相似度'
                }
            ],
            likedAppList: []
        }
    },

    methods: {
        refreshAppLikedPercent () {
            if (!this.formData.business_app_name) return
            Api.get('appNameSimilarity', {business_app_name: this.formData.business_app_name}).then(
                res => {
                    this.likedAppList = res.data
                }
            )
        }
    },

    created () {
        this.refreshAppLikedPercent()
    }
}
</script>
