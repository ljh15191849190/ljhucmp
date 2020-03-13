<template lang="pug">
div#sign-container
    div.title 标识
    div.subtitle 标识此应用程序
    div.content
        el-form(label-width="100px" label-position="left" size="small")
            div.label.pad-bom.is-required 应用程序名称(面向用户):
            el-input.form-width.pad-bom(v-model="formData.name"
                maxlength="50" size="small" name="name" data-vv-as="应用程序名称(面向用户)"
                :class="{'input': true, 'is-danger': errors.has('name')}"
                clearable  v-validate="rules.require"
            )
            span.validator-error.is-danger(v-if="errors.has('name')") {{ errors.first('name') }}
            div.label.pad-bom.is-required 应用程序名称(面向管理员):
            el-input.form-width.pad-bom(v-model="formData.publish_name"
                maxlength="50" size="small" name="publish_name" data-vv-as="应用程序名称(面向用户)"
                :class="{'input': true, 'is-danger': errors.has('publish_name')}"
                clearable v-validate="rules.require"
            )
            span.validator-error.is-danger(v-if="errors.has('publish_name')") {{ errors.first('publish_name') }}
            div.label.pad-bom 说明和关键字(面向用户):
            el-input.form-width.pad-bom(v-model="formData.description"
                maxlength="50" size="small"
            )
            div.tip.pad-bom 此说明将度用户可见。您还可以使用此字段为StoreFront输入关键字。
</template>

<script>
/**
 * 应用程序-设置标识
 */
import Api from '@api'
export default {
    name: 'SetupSign',
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
                name: '',
                publish_name: '',
                description: ''
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
            this.formData.name = this.application.name || ''
            this.formData.publish_name = this.application.publishedName || ''
            this.formData.description = this.application.description || ''
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
                        this.$notify.success('标识应用操作成功!')
                    })
                }
            })
        }
    },
    computed: {
        url () {
            if (this.formData.description) 
                return `/vdi/xen_application/identification?provider_id=${this.instance.provider_id}&application_uid=${this.instance.application_uid}&application_name=${this.formData.name}&published_name=${this.formData.publish_name}&description=${this.formData.description}`
            else 
                return `/vdi/xen_application/identification?provider_id=${this.instance.provider_id}&application_uid=${this.instance.application_uid}&application_name=${this.formData.name}&published_name=${this.formData.publish_name}`
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

    .is-required {
        &::before {
            content: '*';
            color: $danger;
            margin-right: 4px;
        }
    }
}
</style>