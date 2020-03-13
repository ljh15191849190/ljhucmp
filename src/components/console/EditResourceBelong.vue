<template lang="pug">
    el-form(label-width="120px" size="small" label-position="left")
        div.cfg-order-form.margin-left
            el-form-item.is-required(label="资源所属")
                el-radio-group(v-model="resourceBelong.resource" @change="ownerTypeChange")
                    el-radio(:label="item.key" :key="item.key" v-for="item in resourcebelongForm") {{item.value}}
            el-form-item.rw-input.is-required.loading-form-item(label="应用" v-if="resourceBelong.resource==='app'")
                el-select(v-model="resourceBelong.app"
                    filterable 
                    clearable
                    v-validate="'required'"
                    :name="'app'"
                    value-key="id"
                    placeholder="请输入应用名称搜索"
                    data-vv-as="应用"
                    :class="{'input': true, 'is-danger': errors.has('app')}"
                )
                    el-option(
                        v-for="item in appList" :key="item.id" :value="item" :label="`${item.app_name}(${item.short})`"
                    )
                span.validator-error.is-danger(v-if="errors.has('app')") {{ errors.first('app') }}                
            el-form-item.rw-input.is-required(label="组织机构" v-if="resourceBelong.resource==='org'")
                Input-Tree.form-width(
                    v-model="resourceBelong.org"
                    placeholder="请选择组织机构"
                    name="org"
                    key="org"
                    v-validate="'required'"
                    :defaultProps="orgDefaultProps"
                    :treeData="orgList"
                    data-vv-as="组织机构"
                    :isDanger="errors.has('org')")
                span.validator-error.is-danger(v-if="errors.has('org')") {{ errors.first('org') }}
            el-form-item
                div.resourceOwner(:title="owner_type.join('，')")  {{`原资源所属为：${owner_type.join("，")}`}}
            el-form-item
                el-button(size="small" @click="close") 取消
                el-button(size="small" type="primary" @click="submit" :loading="isSaving") 提交
</template>

<script>

import Api from '@api'
import InputTree from '@common/InputTree'

/**
 * @description 修改资源并提交申请单组件，控制台使用
 */
export default {
    props: ['serviceCode', 'checkedInstance', 'checkedMetadata', 'ifRouteToOrder'],
    $_veeValidate: {
        validator: 'new'
    },
    data () {
        return {
            resourceBelong: {
                resource: 'app',
                app: null,
                org: null
            },
            orgDefaultProps: {
                id: 'id',
                parentId: 'parent_id',
                children: 'sub_orgs',
                label: 'org_name'
            },
            orgList: [],
            isSaving: false,
            appList: [],
            resourcebelongForm: []
        }
    },

    methods: {
        ownerTypeChange (val) {
            this.resourceBelong.app = null
            if (val === 'org') 
                this.getOrgList()
        },
        close () {
            this.$emit('closeModal')
        },
        // 修改
        submit () {
            this.$validator.validate().then(result => {
                if (result) {
                    let param = []
                    this.checkedInstance.forEach(item => {
                        let attributes = {
                            owner: this.resourceBelong.app ? this.resourceBelong.app.id : '' || this.resourceBelong.org ? this.resourceBelong.org.id : '',
                            owner_type: this.resourceBelong.resource,
                            owner_name: this.resourceBelong.app ? `${this.resourceBelong.app.app_name}(${this.resourceBelong.app.short})` : '' || this.resourceBelong.org ? this.resourceBelong.org.org_name : ''
                        }
                        let display = {
                            owner_type: this.resourceBelong.resource,
                            owner_name: this.resourceBelong.app ? `${this.resourceBelong.app.app_name}(${this.resourceBelong.app.short})` : '' || this.resourceBelong.org ? this.resourceBelong.org.org_name : ''
                        }
                        let originParams = {
                            owner_type: item.owner_type,
                            owner_name: item.owner_name
                        }
                        let obj = {
                            service_code: this.serviceCode,
                            resource_id: item[this.checkedMetadata.value_field],
                            resource_name: item[this.checkedMetadata.text_field],
                            items: {
                                attributes: attributes,
                                display: display,
                                originParams: originParams
                            }
                        }
                        param.push(obj)
                    })
                    
                    this.isSaving = true
                    Api.post('modifyResourceBelong', param, true).then(
                        res => {
                            this.isSaving = false
                            this.$notify({
                                type: 'success',
                                title: '成功',
                                message: '申请单创建成功'
                            })
                            this.$emit('operationSuccess')
                            this.$emit('closeModal')
                            if (this.ifRouteToOrder(res))
                                this.$router.push('/orders')
                        },
                        () => {
                            this.isSaving = false
                        }
                    )
                }
            })
        },
        getOrgList () {
            Api.get('orgTree', {}, true).then(res => {
                this.orgList = res.data
            })
        },
        init () {
            Api.get('getresourcebelongForm', {}, true).then(
                res => {
                    if (res.rst === 'ok') {
                        // res.data = ['app', 'org']
                        this.resourcebelongForm = res.data.map(item => {
                            let obj = {}
                            obj.key = item
                            obj.value = item === 'app' ? '应用' : '组织机构'
                            return obj
                        })
                    }
                }
            )
        },
        // 项目负责人
        getCheckmanager () {
            Api.get('getresourceManager', {}, true).then(
                res => {
                    if (res.rst === 'ok') {
                        // res.data.business_info = ['1e21dec2ad9140e6b48fdb0a2ce16b5e', 'ec22537f9b4d48d2a9fc7ab720d4126c']
                        if (!res.data.business_info) 
                            this.getappList()
                        else 
                            this.getappAllList(res.data.business_info)
                    }
                }
            )
        },
        getappAllList (data) {
            Api.get('getappAllList', {business_ids: data.join(',')}, true).then(
                res => {
                    if (res.rst === 'ok') 
                        this.appList = res.data
                }
            )
        },
        getappList () {
            // app列表
            Api.get('getresourceApp', {offset: 1, limit: 99999}, true).then(
                res => {
                    if (res.rst === 'ok') 
                        this.appList = res.data.apps
                }
            )
        }
    },

    created () {
        this.init()
        this.getCheckmanager()
        // this.getappList()
        this.getOrgList()
    },

    computed: {
        owner_type () {
            let arr = []
            this.checkedInstance.forEach(item => {
                let ownerType = item.owner_type === 'app' ? '应用' : '组织机构'
                if (item.owner_name) 
                    arr.push(ownerType + item.owner_name)
            })
            return arr
        }
    },
    components: {InputTree}

}
</script>
<style lang="scss" scoped>
.resourceOwner{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>