<template lang="pug">
div#delivery-container
    div.title 交付
    div.subtitle 指定如何将此应用程序交付给用户
    div.content
        el-form(label-width="100px" label-position="left" size="small")
            div.label.pad-bom 应用程序类别:
            el-input.form-width.pad-bom(v-model="formData.client_folder"
                maxlength="50" size="small" placeholder="示例: 应用程序类别\\子类别"
            )
            div.tip.pad-bom Receiver 中应用程序所属类别.
            el-checkbox(v-model="formData.shortcut_added_to_desktop") 将快捷方式添加到用户桌面
            div.use-title.pad-bom 您希望如何控制对此应用程序的使用?
            div.pad-bom
                el-radio(v-model="use" label="1") 允许无限制使用
            div.pad-bom
                el-radio(v-model="use" label="2") 将同时运行的实例数限制为:
            div.pad-bom
                el-input-number(v-model="formData.max_total_instances" :min="0" :disabled="use === '1'" size="small")
            el-checkbox.condition(v-model="formData.max_per_user_instances") 限制每个用户一个实例
</template>

<script>
/**
 * 应用程序-设置交付
 */
import axios from 'axios'
export default {
    name: 'SetupDelivery',
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
    created () {
        this.init()
    },
    data () {
        return {
            use: '1',
            formData: {
                client_folder: '',
                shortcut_added_to_desktop: false,
                max_total_instances: 1,
                // max_per_user_instances(0:不勾选 1:勾选)
                max_per_user_instances: false
            }
        }
    },
    methods: {
        /**
         * 初始化
         */
        init () {
            this.formData.client_folder = this.application.clientFolder || ''
            this.formData.shortcut_added_to_desktop = this.application.shortcutAddedToDesktop || ''
            this.formData.max_total_instances = this.application.maxTotalInstances || ''
            this.formData.max_per_user_instances = this.application.maxPerUserInstances === 1
        },
        /**
         * 确定
         */
        save () {
            return axios.put(this.url, null, {headers: {'X-Subject-Token': localStorage.getItem('authenticationToken')}})
        },
        /**
         * 应用
         */
        apply () {
            axios.put(this.url, null, {headers: {'X-Subject-Token': localStorage.getItem('authenticationToken')}}).then(res => {
                this.$notify.success('交付应用操作成功!')
            })
        }
    },
    computed: {
        url () {
            let max_per_user_instances = this.formData.max_per_user_instances ? 1 : 0
            if (this.formData.client_folder)
                return `/hacksaw/citrix/application/delivery?provider_id=${this.instance.provider_id}&application_uid=${this.instance.application_uid}&client_folder=${this.formData.client_folder}&shortcut_added_to_desktop=${this.formData.shortcut_added_to_desktop}&max_per_user_instances=${max_per_user_instances}&max_total_instances=${this.formData.max_total_instances}`
            else 
                return `/hacksaw/citrix/application/deliveryprovider_id=${this.instance.provider_id}&application_uid=${this.instance.application_uid}&shortcut_added_to_desktop=${this.formData.shortcut_added_to_desktop}&max_per_user_instances=${max_per_user_instances}&max_total_instances=${this.formData.max_total_instances}`
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
</style>