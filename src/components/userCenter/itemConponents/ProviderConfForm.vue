<template lang="pug">
    div.provider-conf-form
        div.form-title 厂商信息
            div.template
                CfgTemplateDialog(:providerId="providerId" :service_code="resourceItem.service_code"
                :org_id="org_id"
                :templateId="resourceItem.template_id"
                position="left"
                @selectTemplate="selectTemplate"
                :disabled="disableValidate")
        div.provider-form-pane
            el-form-item.rw-inputloading-form-item.provider-form(label="云厂商" :class="[disableValidate ? '' : 'is-required']")
                el-select(v-model="providerId"
                    v-validate="disableValidate ? {} : {required: true}"
                    :name="'providerId'"
                    placeholder="请选择云厂商"
                    data-vv-as="云厂商"
                    :class="{'input': true, 'is-danger': errors.has('providerId')}"
                    :disabled="disableValidate"
                )
                    el-option(
                        v-for="item in providerList" :key="item.provider_id" :value="item.provider_id" :label="item.provider_name"
                    )
                span.validator-error.is-danger(v-if="errors.has('providerId')") {{ errors.first('providerId') }}
        DynamicForm.proverder-form(
            :formItems="resourceItem.providerFormItems"
            :formData.sync="resourceItem.attributes"
            :display.sync="resourceItem.display"
            labelPosition="top"
            :inline="true"
            :uniqueKey="uniqueKey"
            :keepValueFitDom="keepValueFitDom"
            :showLinkedItemKeys="showLinkedItemKeys"
            :disableValidate="disableValidate"
            :disabled="disabled"
        )
</template>
<script>
import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
import CfgTemplateDialog from '@/components/iaas/configTemplate/CfgTemplateDialog'
export default {
    name: 'ProviderConfForm',
    inject: ['$validator'],
    props: ['provider_id', 'resourceItem', 'org_id', 'providerList', 'uniqueKey', 'showLinkedItemKeys', 'isIncludingService', 'keepValueFitDom', 'disableValidate', 'disabled', 'resourceList'],
    components: {DynamicForm, CfgTemplateDialog},
    data () {
        return {}
    },
    methods: {
        selectTemplate (templateData) {
            this.$set(this.resourceItem, 'template_id', templateData.template_id)
            // 判断是否是同一个云厂商
            if (templateData.provider_id !== this.provider_id) 
                this.$emit('providerChange', templateData, this.isIncludingService, true)
            else {
                if (Array.isArray(this.resourceList) && this.resourceList.length > 1) {
                    let childServicePos = -1
                    if (this.isIncludingService) {
                        let originItem = this.resourceList.find(item => {
                            let flag = false
                            if (item.includings && item.includings.length) {
                                if (item.includings.some(includeItem => includeItem.id === this.resourceItem.id))
                                    flag = true 
                            }
                            return flag
                        })
                        childServicePos = originItem.includings.findIndex(includeItem => includeItem.id === this.resourceItem.id)
                    }
                    this.$emit('multipleInstanceChange', templateData, this.isIncludingService, true, childServicePos)
                } else {
                    this.$nextTick(() => {
                        let templateFormData = templateData.configure
                        this.resourceItem.providerFormItems.forEach(formItem => {
                            this.$set(this.resourceItem.attributes, formItem[this.uniqueKey], templateFormData[formItem.key])
                        })
                    })
                }
            }
            // UCMP3-7221 选择模板后, 同时更新所有资源的模板信息
            // this.$emit('providerChange', templateData, this.isIncludingService, true)
        }
    },
    computed: {
        providerId: {
            get () {
                return this.provider_id
            },
            set (provider_id) {
                this.$emit('update:provider_id', provider_id)
                this.$emit('onlyproviderChange')
            }
        }
    }
}
</script>
<style lang="scss" scoped>
</style>
