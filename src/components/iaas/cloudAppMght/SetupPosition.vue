<template lang="pug">
div#position-container
    div.title 位置
    div.subtitle 请在下面输入位置信息
    div.content
        el-form(label-width="100px" label-position="left" size="small")
            div.label.pad-bom.is-required 可执行文件的路径:
            el-input.form-width.pad-bom(v-model="formData.command_line_executable"
                maxlength="50" size="small" clearable
                placeholder="请输入执行文件路径"
                name="command_line_executable"
                data-vv-as="可执行文件路径"
                :class="{'input': true, 'is-danger': errors.has('command_line_executable')}"
                v-validate="rules.require"
            )
            span.validator-error.is-danger(v-if="errors.has('command_line_executable')") {{ errors.first('command_line_executable') }}
            div.tip.pad-bom 浏览本地计算机上的应用程序或手动输入路径。
            div.label.pad-bom 命令行参数(可选):
            el-input.form-width.pad-bom(v-model="formData.command_line_arguments"
                maxlength="50" size="small" clearable
                placeholder="示例: https://Example.com"
            )
            div.label.pad-bom.is-required 工作目录:
            el-input.form-width.pad-bom(v-model="formData.working_directory"
                maxlength="50" size="small" clearable
                placeholder="示例: \\\\myapps"
                name="working_directory"
                data-vv-as="可执行文件路径"
                :class="{'input': true, 'is-danger': errors.has('working_directory')}"
                v-validate="rules.require"
            )
            span.validator-error.is-danger(v-if="errors.has('working_directory')") {{ errors.first('working_directory') }}
</template>

<script>
/**
 * 应用程序-设置位置
 */
import Api from '@api'
export default {
    name: 'SetupPosition',
    $_veeValidate: {
        validator: 'new'
    },
    props: {
        instance: {
            type: Object,
            default: () => {}
        },
        application: {
            type: Object,
            default: () => {}
        }
    },
    data () {
        return {
            rules: {
                require: {
                    required: true
                }
            },
            formData: {
                command_line_executable: '',
                command_line_arguments: '',
                working_directory: ''
            }
        }
    },
    created () {
        this.init()
    },
    methods: { 
        /**
         * 初始化
         */
        init () {
            this.formData.command_line_executable = this.application.commandLineExecutable
            this.formData.command_line_arguments = this.application.commandLineArguments
            this.formData.working_directory = this.application.workingDirectory
        },
         /**
         * 确定
         */
        async save () {
            const result = await this.$validator.validate()
            if (result)
                return Api.put(this.url, {})
            else 
                return false
        },
        /**
         * 应用
         */
        apply () {
            this.$validator.validate().then(result => {
                if (result) {
                    Api.put(this.url, {}).then(res => {
                        this.$notify.success('位置应用操作成功!')
                    })
                }
            })
        }
    },
    computed: {
        url () {
            if (this.formData.command_line_arguments) 
                return `/vdi/xen_application/location?provider_id=${this.instance.provider_id}&application_uid=${this.instance.application_uid}&command_line_executable=${this.formData.command_line_executable}&command_line_arguments=${this.formData.command_line_arguments}&working_directory=${this.formData.working_directory}`
            else 
                return `/vdi/xen_application/location?provider_id=${this.instance.provider_id}&application_uid=${this.instance.application_uid}&command_line_executable=${this.formData.command_line_executable}&working_directory=${this.formData.working_directory}`
        }
    }
}
</script>

<style lang="scss" scoped>
.pad-bom {
    padding-bottom: 5px;
}
.title {
    color: $fontTitle;
    font-size: 16px;
    font-weight: 600;
}
.subtitle {
    padding-top: 20px;
}
.content {
    padding-top: 15px;
    .tip {
        font-size: $fontsize14;
        color: $fontTitleLight;
    }
    .use-title {
        padding-top: 20px;
        color: $fontTitle;
        font-weight: 600;
    }
    .condition {
        margin-top: 20px;
    }
}
.is-required {
    &::before {
        content: '*';
        color: $danger;
        margin-right: 4px;
    }
}
</style>