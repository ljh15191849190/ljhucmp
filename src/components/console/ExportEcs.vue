<template lang="pug">
    el-dialog(v-if="visible" title="导出设置" :visible.sync="visible" :before-close="close" max-heigth="300px" width="450px")
        div.dialog-content
            el-radio-group(v-model="setUp")
                el-radio(:label="1") 默认
                el-radio(:label="2") 自定义
            div.custom(v-if="setUp === 2")
                el-checkbox-group(v-model="checkedCustomCols")
                    el-checkbox(v-for="column in customColumns" :key="column.prop" :label="column.prop" :checked="column.isShow" :disabled="column.href" @change="handleColChange(column)") {{column.label}}
            div.tip {{tip}}
        div.dialog-footer(slot="footer")
            el-button(@click="close" size="small") 取消
            el-button(type="primary" @click="save" size="small" :loading="saveLoading") 保存
</template>
<script>
/**
 * 云主机导出(长庆油田)
 */
import Api from '@api'
import FileSaver from 'file-saver'
export default {
    name: 'ExportEcs',
    props: {
        visible: {
            type: Boolean,
            default: () => false
        },
        metaData: {
            type: Object,
            default: () => {}
        },
        searchParam: {
            type: Object,
            default: () => {}
        },
        serviceCode: {
            type: String,
            default: () => ''
        }
    },
    data () {
        return {
            setUp: 1,
            checkedCustomCols: [],
            customColumns: [],
            saveLoading: false
        }
    },
    created () {
        this.init()
    },
    methods: {
        init () {
            this.customColumns = this.metaData.attribute.filter(item => item.custom).map(item => {
                return {
                    isShow: false,
                    prop: item.key,
                    label: item.label
                }
            })
        },
        handleColChange (column) {
            column.isShow = !column.isShow
        },
        close () {
            this.$emit('closeExportEcsDialog')
        },
        save () {
            this.saveLoading = true
            let searchParam = this.setUp === 1 ? this.searchParam : {...this.searchParam, customCols: this.checkedCustomCols}
            let param = Object.assign({}, searchParam, {service_code: this.serviceCode, suffix: 'xlsx'})
            Api.get('serviceInstanceDownload', param, true, 'blob').then(
                res => {
                    let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                    FileSaver.saveAs(blob, this.serviceCode + '.xlsx')
                    this.$notify({
                        type: 'success',
                        title: '成功',
                        message: '导出成功'
                    })
                    this.saveLoading = false
                    this.$emit('closeExportEcsDialog')
                }
            )
        }
    },
    computed: {
        tip () {
            let tip = this.setUp === 1 ? '注：导出内容为当前显示列表' : '注：导出内容为当前显示列表加自定义列'
            return tip
        }
    },
    watch: {
        setUp (newVal, oldVal) {
            if (newVal === 1) {
                this.checkedCustomCols = []
                this.customColumns.forEach(item => { 
                    if (item.isShow)
                        item.isShow = false 
                })
            } 
        }
    }
}
</script>
<style lang="scss" scoped>
.custom {
    margin: 20px 0;
}
.tip {
    margin-top: 20px;
    color: $fontRed;
}
</style>
