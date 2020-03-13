<template lang="pug">
    div.full-height.resource-month
        div.resource-month__content
            label 选择月份
            el-date-picker.margin-left(
            size="small"
            v-model="dateRange"
            type="monthrange"
            value-format="yyyy-MM"
            :picker-options="pickerOptions"
            :default-value="lastYear"
            start-placeholder="开始月份"
            end-placeholder="结束月份")

            div.margin-top
                el-button(size="small" type="primary" @click="exportData" :disabled="!dateRange") 导出
</template>

<script>
    import Api from '@api'
    import FileSaver from 'file-saver'

    /**
     * 月度统计
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'ResourceMonth',
        data () {
            return {
                dateRange: null,
                pickerOptions: {
                    disabledDate (time) {
                        return time.getTime() > Date.now()
                    }
                },
                // 改进建议，把当前月份显示在右侧面板
                lastYear: new Date().setFullYear(new Date().getFullYear() - 1)
            }
        },
        computed: {},
        methods: {
            exportData () {
                let params = {
                    startDate: this.dateRange[0],
                    endDate: this.dateRange[1]
                }

                Api.get('resource_month_export', params, true, 'blob').then(res => {
                    let blob = new Blob([res], {type: 'application/pdf'})
                    FileSaver.saveAs(blob, `${params.startDate}至${params.endDate}月度统计.pdf`)
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: '月度统计导出成功'
                    })
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .resource-month {
        text-align: center;
    }

    .resource-month__content {
        display: inline-block;
        margin: 200px auto;
    }

    .el-date-editor {
        max-width: 250px;
    }
</style>
