<template lang="pug">
    el-form(label-width="120px" size="small" label-position="left")
        div.cfg-order-form.margin-left
        el-form-item.rw-input(:label="systemConfig.configure_template")
            el-select(
                v-model="resource_pool"
                v-validate="'required'"
                :name="'resource_pool'"
                :data-vv-as="systemConfig.configure_template"
                filterable 
                clearable
                value-key="id"
                :placeholder="`请输入${systemConfig.configure_template}名称`"
            )
                el-option(
                    v-for="item in templateList" :key="item.template_id" :value="item.template_id" :label="`${item.template_name}`"
                )
            span.validator-error.is-danger(v-if="errors.has('resource_pool')") {{ errors.first('resource_pool') }}
        el-form-item
            el-button(size="small" @click="close") 取消
            el-button(size="small" type="primary" @click="submit" :loading="isSaving") 确定
</template>

<script>

import Api from '@api'
import { mapGetters } from 'vuex'
/**
 * @description 修改资源并提交申请单组件，控制台使用
 */
export default {
    props: ['serviceCode', 'checkedInstance', 'checkedMetadata', 'ifRouteToOrder', 'checkedAction'],
    $_veeValidate: {
        validator: 'new'
    },
    data () {
        return {
            templateList: [],
            resource_pool: '',
            isSaving: false,
            appList: [],
            resourcebelongForm: [],
            userInfo: null
        }
    },

    methods: {
        close () {
            this.$emit('closeModal')
        },
        async init () {
            if (this.checkedInstance && this.checkedInstance[0] && this.checkedInstance[0].template_id)
                this.resource_pool = this.checkedInstance[0].template_id
            await this.getUserDetail()
            this.getCfgTmpList(this.checkedInstance)
        },
        /**
         * @description 模板列表
         */
        getCfgTmpList (instances) {
            let instance = instances[0]
            let pageParam = { offset: 1, limit: 9999 }
            let provideParam = instance.provider_id ? {provider_id: instance.provider_id} : {}
            let serviceParam = this.serviceCode ? {service_code: this.serviceCode} : {}
            let orgParam = this.userInfo.org_id ? {org_id: this.userInfo.org_id} : {}
            let resObj = Object.assign(pageParam, provideParam, serviceParam, orgParam)
            Api.get('availableTemplates', resObj, true).then(
                res => {
                    this.templateList = res.list
                }, () => {
                }
            )
        },
        async getUserDetail () {
            let userId = localStorage.getItem('userId')
            let res = await Api.get('userById', {user_id: userId}, true)
            this.userInfo = res.data
        },
        // 提交
        submit () {
            this.$validator.validate().then(validate => { 
                if (validate) {
                    let url = this.checkedAction.endpoint.url
                    let method = this.checkedAction.endpoint.method
                    let resObj = {
                        ids: this.checkedInstance[0].resource_id,
                        serviceCode: this.serviceCode,
                        templateId: this.resource_pool
                    }
                    this.isSaving = true
                    Api[method](url, resObj, true).then(
                        res => {
                            this.isSaving = false
                            this.close()
                            this.$notify.success('操作成功')
                            this.$emit('operationSuccess')
                        }, () => {
                            this.isSaving = false
                        }
                    )
                }
            })
        }
    },

    created () {
        this.init()
    },

    computed: {
        ...mapGetters(['systemConfig'])
    },
    components: {}

}
</script>
<style lang="scss" scoped>
.resourceOwner{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>