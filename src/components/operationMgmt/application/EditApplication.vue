<template lang="pug">
    el-dialog(:title="title" :visible.sync="visible" :before-close="handleClose" width="900px")
        el-form(:model="appForm" :rules="rules" :inline="true" label-position="right" ref="appForm" label-width="130px")
            div.requrie-form
                el-form-item(label="应用系统名称" prop="appName")
                    el-input.input-select-width(v-model="appForm.appName" :maxlength="25")
                el-form-item(label="应用系统代码" prop="shortName")
                    el-input.input-select-width(v-model="appForm.shortName" :maxlength="25")
                el-form-item(label="所属机构" prop="org")
                    el-select.input-select-width(v-model="appForm.org")
                el-form-item(label="应用系统级别" prop="applicationGrade")
                    el-select.input-select-width(v-model="appForm.applicationGrade")
            el-row
                p.basicInfo
                    span.title 资源配额设置
                    span.tip 如果您不设置配额，系统默认根据所属组织机构（获取所属组织机构的上级）配额进行限制。
            el-row.triple-cell
                el-col(:span="12")
                    el-form-item.required(label="CPU配额" prop="config.cpuQuota")
                        el-input(v-model.number="appForm.config.cpuQuota" type="number")
                            template(slot="append") 核
                el-col(:span="12")
                    el-row
                        el-col(:span="5")
                            span CPU使用量
                        el-col(:span="16")
                            el-progress(:text-inside="true" :stroke-width="28" :percentage="0")
            el-row.triple-cell
                el-col(:span="12")
                    el-form-item.required(label="内存配额" prop="config.cpuQuota")
                        el-input(v-model.number="appForm.config.cpuQuota" type="number")
                            template(slot="append") GB
                el-col(:span="12")
                    el-row
                        el-col(:span="5")
                            span 内存使用量
                        el-col(:span="16")
                            el-progress(:text-inside="true" :stroke-width="28" :percentage="0")
            el-row.triple-cell
                el-col(:span="12")
                    el-form-item.required(label="虚机配额" prop="config.cpuQuota")
                        el-input(v-model.number="appForm.config.cpuQuota" type="number")
                            template(slot="append") 台
                el-col(:span="12")
                    el-row
                        el-col(:span="5")
                            span 虚机使用量
                        el-col(:span="16")
                            el-progress(:text-inside="true" :stroke-width="28" :percentage="0")
            el-row.triple-cell
                el-col(:span="12")
                    el-form-item.required(label="存储配额" prop="config.cpuQuota")
                        el-input(v-model.number="appForm.config.cpuQuota" type="number")
                            template(slot="append") GB
                el-col(:span="12")
                    el-row
                        el-col(:span="5")
                            span 存储使用量
                        el-col(:span="16")
                            el-progress(:text-inside="true" :stroke-width="28" :percentage="0")
            el-row.triple-cell
                el-col(:span="12")
                    el-form-item.required(label="单台虚机快照配额" prop="config.cpuQuota")
                        el-input(v-model.number="appForm.config.cpuQuota" type="number")
                            template(slot="append") 次
            el-row.triple-cell
                el-col(:span="12")
                    el-form-item.required(label="虚机快照总配额" prop="config.cpuQuota")
                        el-input(v-model.number="appForm.config.cpuQuota" type="number")
                            template(slot="append") 次
                el-col(:span="12")
                    el-row
                        el-col(:span="5")
                            span 快照使用量
                        el-col(:span="16")
                            el-progress(:text-inside="true" :stroke-width="28" :percentage="0")
            el-row
                span 描叙
                el-input(type="textarea" :rows="8" :maxlength="100" v-model="appForm.desc" placeholder="请输入相关备注信息...")
        div.dialog-footer(slot="footer")
            el-button(@click="handleClose()") 取消
            el-button(@click="submitForm" type="primary") 确定
</template>
<script>
/**
 * @description 创建、编辑应用系统
 */
export default {
    name: 'EditApplication',
    props: ['visible', 'appData'],
    data () {
        return {
            appForm: {
                appName: '',
                shortName: '',
                org: '',
                applicationGrade: '',
                config: {
                    cpuQuota: ''
                },
                desc: ''
            },
            rules: {
                appName: [
                    { required: true, message: '请输入应用系统名称', trigger: 'blur' }
                ],
                shortName: [
                    { required: true, message: '请输入应用系统代码', trigger: 'blur' }
                ],
                org: [
                    { required: true, message: '请选择所属机构', trigger: 'blur, change' }
                ],
                applicationGrade: [
                    { required: true, message: '请选择应用系统级别', trigger: 'blur, change' }
                ]
            }
        }
    },
    methods: {
        /**
         * @description 关闭对话框
         */
        handleClose () {
            this.$emit('closeDialog')
        },
        /**
         * @description 提交表单
         */
        submitForm () {
            this.$refs.appForm.validate((valid) => {
                if (valid) {
                }
            })
        }
    },
    created () {

    },
    computed: {
        title () {
            let title = this.appData ? '编辑应用系统' : '创建应用系统'
            return title
        }
    }
}
</script>

<style lang="scss" scoped>
.input-select-width {
    width: 265px!important;
}
.requrie-form {
    border: 1px solid #e1e5e6;
    padding: 13px 0;
    margin: 10px 15px;
    background: #f6fafb;
}
.basicInfo {
    font-size: 14px;
    height: 50px;
    line-height: 50px;
    .tip {
        font-size: 12px;
        margin-left: 10px;
        color: #a6a6a6!important;
    }
}
</style>

