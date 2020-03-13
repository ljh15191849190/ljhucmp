<template lang="pug">
    div.business-form-items
        el-form-item.is-required(label="资源所属" v-if="resourcesBelongsTo.length")
            el-radio-group(v-model="formData.owner_type" @change="ownerTypeChange")
                el-radio(v-for="ownerType in resourcesBelongsTo" v-if="!(currentServiceObj && currentServiceObj.group === 'blueprint' && ownerType === 'personal')" :key="ownerType" :label="ownerType") {{ownerType | TranslateOrgApp}}

        template(v-if="formData.owner_type === 'app'")
            el-form-item.margin-bottom.is-required.loading-form-item(label="应用" :class="[type === 'assign' ? '' : 'rw-input']")
                el-select(
                    filterable
                    clearable
                    @clear="clearAppList"
                    remote
                    :remote-method="getRemoteAppList"
                    v-model="formData.owner"
                    v-validate="'required'"
                    name="app"
                    key="app"
                    placeholder="请选择应用"
                    data-vv-as="应用"
                    value-key="id"
                    :class="{'is-danger': errors.has('app')}"
                    v-loadmore="loadMoreApp"
                    v-loading="loading.app")
                    el-option(
                        v-for="(item, index) in app.opts"
                        :key="index"
                        :label="`${item.app_name}(${item.short})`"
                        :value="item")
                el-popover(
                    placement="right"
                    width="400"
                    trigger="manual"
                    v-model="appDialogVisible"
                    @show="getAppFormItems")
                    GuardianAppForm(v-if="appDialogVisible" :formItems="appFormItems" :dialogVisible.sync="appDialogVisible" @submitAppOrder="submitAppOrder")
                    //- el-button.position-absolute(slot="reference" v-if="!!appMetadata" type="text" size="mini" @click="addGuardianApp") 添加应用
                span.validator-error.is-danger(v-if="errors.has('app')") {{ errors.first('app') }}
            el-form-item.margin-bottom.rw-input(:label="selectedBusinessLabel" v-show="!(type === 'clone') && businessDisplay")
                span {{business.businessName}}
        el-form-item.is-required(v-if="formData.owner_type === 'org'" label="组织机构" :class="[type === 'assign' ? '' : 'rw-input']")
            Input-Tree.form-width(
                v-model="formData.owner"
                placeholder="请选择组织机构"
                name="org"
                key="org"
                v-validate="'required'"
                :defaultProps="orgDefaultProps"
                :treeData="orgList"
                data-vv-as="组织机构"
                :isDanger="errors.has('org')")
            span.validator-error.is-danger(v-if="errors.has('org')") {{ errors.first('org') }}

        el-form-item.margin-bottom.is-required.loading-form-item(label="责任人" v-if="type === 'assign'" )
            el-select(
                filterable
                clearable
                @clear="clearUserList"
                remote
                :remote-method="getRemoteUserList"
                v-loadmore="loadMoreUser"
                v-model="formData.user"
                v-validate="'required'"
                name="owner_person"
                data-vv-as="责任人"
                placeholder="请选择责任人"
                :class="{'is-danger': errors.has('owner_person')}"
                value-key="id"
                @change="changeBasicConfig"
                v-loading="loading.user"
                )
                el-option(
                    v-for="(item, index) in allUsers"
                    :key="index"
                    :label="item.name + '(' + item.realname + ')'"
                    :value="item")
            span.validator-error.is-danger(v-if="errors.has('owner_person')") {{ errors.first('owner_person') }}
        slot(name="otherOwnerItems")
</template>

<script>
/**
 * @description 申请服务实例，设置资源归属
 * @prop {Object} resourceOwner 资源数据
 * @example ResourceOwner(:resourceOwner.sync="resourceOwner")
 * @memo: 2018.9.4 #资源只需要选择应用系统即可，对应的业务、组织机构都关联显示，不需要选择
 */
import Api from '@api'
import InputTree from '@common/InputTree'
import GuardianAppForm from '../GuardianAppForm'
import SelectHelper from '@mock/lazySelect.mock'
import { mapGetters } from 'vuex'
export default {
    components: {InputTree, GuardianAppForm},
    props: {
        resourceOwner: {
            type: Object,
            default: () => {
                return {
                    owner_type: '',
                    owner: null,
                    user: null,
                    owner_default_value: '',
                    resource_pool_id: '',
                    provider_id: '',
                    business_default_value: '',
                    resource_select_value: {}
                }
            }
        },
        type: {
            type: String
        },
        serviceCode: {
            type: String
        },
        resourcesBelongsTo: {
            type: Array,
            // default: () => ['app', 'org', 'personal']
            default: () => []
        }
    },

    inject: ['$validator'],

    data () {
        return {
            // 业务
            business: {
                businessName: '',
                businessId: ''
            },
            app: {
                value: '',
                opts: []
            },
            appHelper: new SelectHelper(),
            userHelper: new SelectHelper(),
            resourceConfigs: [],
            itemTitle: '资源所属',
            resource: null,
            allUsers: [],
            env: '',
            loading: {
                app: true,
                loadedBasicConfig: true,
                user: true,
                loadingBasicConfig: false
            },
            // orgInputObj: {
            //     value: '',
            //     placeholder: '请选择组织机构'
            // },
            orgDefaultProps: {
                id: 'id',
                parentId: 'parent_id',
                children: 'sub_orgs',
                label: 'org_name'
            },
            orgList: [],
            appDialogVisible: false,
            appFormItems: []
        }
    },

    computed: {
        formData: {
            get () {
                return this.resourceOwner
            },
            set (val) {
                this.$emit('update:resourceOwner', val)
            }
        },

        resourceConfigIds () {
            return this.resourceConfigs.map(
                config => {
                    return config.id
                }
            )
        },

        ...mapGetters([
            'metadata',
            'businessOrproject',
            'businessDisplay'
        ]),

        selectedBusinessLabel () {
            return this.businessOrproject === 'business' ? '业务' : '项目'
        },

        appMetadata () {
            return this.metadata.find(meta => meta.service_code === 'guardian_app')
        },

        currentServiceObj () {
            return this.metadata.find(meta => meta.service_code === this.serviceCode)
        }
    },

    methods: {
        // 归属于更改 重置表单
        ownerTypeChange () {
            this.formData.owner = null
            this.business = {
                businessName: '',
                businessId: ''
            }
            this.app.opts = this.appHelper.allDataCache

            this.resource = null
            this.resourceConfigs = []
            this.$validator.reset()
        },
        // 设置默认值
        setDefaultValue () {
            let copyMetaData = JSON.parse(JSON.stringify(this.formData))
            this.owner_type = copyMetaData.owner_type = 'person'
            copyMetaData.owner = ''
            this.formData = copyMetaData
        },

        // getAllUsers () {
        //     let domain_id = localStorage.getItem('domainId')
        //     // UCMP3-689【修改责任人】服务目录申请和控制台下修改责任人以及授权调用的查询用户的接口需修改优化，现在版本调用的接口响应需要15s左右
        //     Api.get('userInfoList', { domain_id, limit: 9999999, offset: 1 }, true).then(
        //         res => {
        //             if (res && res.user_list)
        //                 this.allUsers = res.user_list
        //             this.loading.user = false
        //         // eslint-disable-next-line
        //         }, err => {
        //             this.loading.user = false
        //         }
        //     )
        // },

        changeBasicConfig (config) {
            this.formData.resource_pool_id = config.id
            this.formData.provider_id = config.provider_id
            // bug #UCMP-410 【服务目录】申请云主机的时候，选择好配置，然后点击“立即申请”，跳转到申请单信息页面有误
            this.formData.resource_select_value = config
        },

        initUser () {
            this.userHelper = new SelectHelper()

            // 缓存第一页数据
            this.loading.user = true
            Api.get('userListByName', {
                limit: this.userHelper.size,
                page_idx: this.userHelper.pageIndexForAll
            }, true).then(res => {
                this.userHelper.allDataCache = this.userHelper.allDataCache.concat(res.data.users)
                this.userHelper.pageCountForAll = res.data.page_count
                this.userHelper.pageIndexForAll = res.data.page + 1
                this.allUsers = this.userHelper.allDataCache

                this.loading.user = false
            }, () => {
                this.loading.user = false
            })
        },

        getRemoteUserList (query, loadMore = false) {
            // 搜索不同的或者全部的option值切换，防止loadMore多次，需要先置空
            if (query !== this.userHelper.query) {
                this.allUsers = []
                this.userHelper.pageCountForSearch = 1
                this.userHelper.pageIndexForSearch = 1
            }

            this.userHelper.query = query
            if (this.userHelper.query) {
                if (this.userHelper.pageIndexForSearch <= this.userHelper.pageCountForSearch) {
                    // 搜索 + 未完全加载
                    this.getUserList(this.userHelper.query, true)
                }
            } else {
                if (this.userHelper.pageIndexForAll <= this.userHelper.pageCountForAll) {
                    // 全部 + 未完全加载
                    this.getUserList(this.userHelper.query, true)
                } else {
                    // 全部 + 完全加载
                    this.allUsers = this.userHelper.allDataCache
                }
            }
        },

        getUserList (name, loadMore = false) {
            this.loading.user = true

            let page = name ? this.userHelper.pageIndexForSearch : this.userHelper.pageIndexForAll
            Api.get('userListByName', {limit: this.userHelper.size, page_idx: page, name}, true).then(res => {
                if (!name) {
                    this.userHelper.allDataCache = this.userHelper.allDataCache.concat(res.data.users)
                    this.userHelper.pageCountForAll = res.data.page_count
                    this.userHelper.pageIndexForAll = res.data.page + 1
                    this.allUsers = this.userHelper.allDataCache
                } else {
                    this.userHelper.pageCountForSearch = res.data.page_count
                    this.userHelper.pageIndexForSearch = res.data.page + 1
                    if (loadMore) {
                        //
                        this.allUsers = this.allUsers.concat(res.data.users)
                    } else {
                        //
                        this.allUsers = res.data.users
                    }
                }
                this.loading.user = false
            }, () => {
                this.loading.user = false
            })
        },

        clearUserList () {
            this.allUsers = this.userHelper.allDataCache
        },

        loadMoreUser () {
            this.getRemoteUserList(this.userHelper.query, true)
        },

        getRemoteAppList (query, loadMore = false) {
            // 搜索不同的或者全部的option值切换，防止loadMore多次，需要先置空
            if (query !== this.appHelper.query) {
                this.app.opts = []
                this.appHelper.pageCountForSearch = 1
                this.appHelper.pageIndexForSearch = 1
            }

            this.appHelper.query = query
            if (this.appHelper.query) {
                if (this.appHelper.pageIndexForSearch <= this.appHelper.pageCountForSearch) {
                    // 搜索 + 未完全加载
                    this.getAppList(this.appHelper.query, true)
                }
            } else {
                if (this.appHelper.pageIndexForAll <= this.appHelper.pageCountForAll) {
                    // 全部 + 未完全加载
                    this.getAppList(this.appHelper.query, true)
                } else {
                    // 全部 + 完全加载
                    this.app.opts = this.appHelper.allDataCache
                }
            }
        },
        // 获取应用列表
        getAppList (name, loadMore = false) {
            this.loading.app = true

            let page = name ? this.appHelper.pageIndexForSearch : this.appHelper.pageIndexForAll
            Api.get('appListByUserOrg', {limit: this.appHelper.size, page, name}, true).then(res => {
                if (!name) {
                    this.appHelper.allDataCache = this.appHelper.allDataCache.concat(res.data.apps)
                    this.appHelper.pageCountForAll = res.data.page_count
                    this.appHelper.pageIndexForAll = res.data.page + 1
                    this.app.opts = this.appHelper.allDataCache
                } else {
                    this.appHelper.pageCountForSearch = res.data.page_count
                    this.appHelper.pageIndexForSearch = res.data.page + 1
                    if (loadMore) {
                        //
                        this.app.opts = this.app.opts.concat(res.data.apps)
                    } else {
                        //
                        this.app.opts = res.data.apps
                    }
                }
                this.loading.app = false
            }, () => {
                this.loading.app = false
            })
        },

        clearAppList () {
            this.app.opts = this.appHelper.allDataCache
        },

        // 处理基础配置显示
        handleBaseConf () {
            Api.get('getDictByCode', {code: 'base_conf'}, true).then(
                res => {
                    if (res && res.value)
                        this.resourceOwner.isShowResources = res.value.display
                }
            )
        },

        initOrg () {
            Api.get('orgTree', {}, true).then(res => {
                this.orgList = res.data
            })
        },

        initApp () {
            this.appHelper = new SelectHelper()
            this.getAppList()
        },

        loadMoreApp () {
            this.getRemoteAppList(this.appHelper.query, true)
        },

        getBusinessByApp (appId) {
            Api.get('businessByAppId', {app_id: appId}, true).then(res => {
                this.business.businessId = res.data.business_id
                this.business.businessName = res.data.business_name
                this.$set(this.formData.owner, 'business_name', res.data.business_name)
            })
        },

        getAppFormItems () {
            this.appFormItems = this.appMetadata && this.appMetadata.attribute ? this.appMetadata.attribute.filter(item => item.created) : []
        },

        addGuardianApp () {
            this.appDialogVisible = true
        },

        submitAppOrder () {
            this.appDialogVisible = false
            this.$notify({type: 'success', message: '添加应用的申请单提交成功，请至申请单管理页面查询进度'})
        }
    },

    watch: {
        // 组织机构 应用 变更
        'resourceOwner.owner.id' (newVal, oldVal) {
            if (!newVal || newVal === oldVal)
                return

            if (this.formData.owner_type === 'app') {
                // 获取对应的业务信息
                this.getBusinessByApp(this.formData.owner.id)
            }
        },

        'resourcesBelongsTo' (newVal) {
            if (newVal)
                this.$set(this.formData, 'owner_type', newVal[0])
        }
    },

    created () {
        this.initOrg()
        this.initApp()
        this.initUser()
        // this.getAllUsers()
        // set Resource default value
        this.formData.resource_select_value && (this.resource = this.formData.resource_select_value)

        if (!this.formData.owner_type)
            this.$set(this.formData, 'owner_type', this.resourcesBelongsTo[0])
    }
}
</script>

<style lang="scss" scoped>
// .el-select {
//   max-width: 200px;
// }
</style>
