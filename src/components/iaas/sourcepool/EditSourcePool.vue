<template lang="pug">
    UcmpFormContainer(:breadcrumbItems="breadcrumbItems")
        div(slot="form-content")
            el-form.source-form.padding(ref="sourcePoolForm" :rules="rules" label-width="120px" label-position="right" size="small" :model="sourcePoolForm")
                el-form-item(label="基础配置名称" prop="name")
                    el-input.form-item-width(v-model="sourcePoolForm.name" maxlength="100" placeholder="请输入基础配置名称" v-loading="loading")
                el-form-item(label="云厂商" prop="provider_id")
                    el-select.form-item-width(:disabled="sourceId !== 'add'" v-model="sourcePoolForm.provider_id" @change="providerChange" value-key="id")
                        el-option(v-for="(item, index) in cloudProviders" :key="item.id" :value="item.id" :label="item.label")
                el-form-item(label="组织机构")
                    el-input.form-item-width(v-model="searchKey" placeholder="请输入组织机构名称")
                    el-tree.form-item-width.margin-top.tree-height(
                        show-checkbox
                        :data="configTree.data"
                        :props="configTree.defaultProps"
                        :render-content="renderContent"
                        :highlight-current="configTree.isHighlight"
                        :default-expanded-keys="defaultExpKeys"
                        :node-key="configTree.nodeKey"
                        ref="configTree"
                        v-loading="configTree.loading"
                        element-loading-spinner="ucmp-icon-loading"
                        :expand-on-click-node="false"
                        :filter-node-method="filterNode"
                    )
        div(slot="form-footer")
            el-button(@click="goBack" size="small") 返回
            el-button(type="warning" size="small" @click="submitForm" :disabled="submitDisabled") 保存
</template>
<script>
/**
 * @description 创建、编辑基础配置
 */
import Api from '@api'
import axios from 'axios'
export default {
    name: 'EditSourcePool',
    data () {
        return {
            sourceId: '',
            loading: false,
            submitDisabled: true,
            editSourcePoolName: '',
            defaultExpKeys: [],
            // 搜索树的组织名称
            searchKey: '',
            // 树配置
            configTree: {
                data: [],
                defaultProps: {
                    children: 'sub_orgs',
                    label: 'org_name'
                },
                loading: false,
                // 选中后高亮
                isHighlight: true,
                nodeKey: 'id'
            },
            breadcrumbItems: [
                {prop: '/resource-pool', label: '基础配置'},
                {prop: '', label: '创建基础配置'}
            ],
            cloudProviders: [],
            sourcePoolForm: {
                name: '',
                provider_id: null,
                org_ids: []
            },
            rules: {
                name: [
                    { required: true, message: '请输入基础配置名称', trigger: 'blur' },
                    { pattern: /^[\u4e00-\u9fa5\w\-]+$/, message: '基础配置名称格式有误', trigger: 'blur' },
                    { validator: this.ifNameExist, trigger: 'blur' }
                ],
                provider_id: [
                    { required: true, message: '请选择云厂商', trigger: 'change' }
                ]
            }
        }
    },
    methods: {
        /**
         * @description 初始化数据定义
         */
        init () {
            this.sourceId = this.$route.params.id
            let providers = Api.get('provider', {}, true)
            let orgList = Api.get('orgTree', {}, true)
            this.submitDisabled = true
            this.configTree.loading = true
            axios.all([providers, orgList]).then(axios.spread(
                (providers, orgList) => {
                    this.submitDisabled = false
                    this.configTree.loading = false
                    this.cloudProviders = providers.list.map(item => {
                        return {
                            id: item.id,
                            label: item.name + '(' + item.provider_code + ')'
                        }
                    })
                    this.configTree.data = orgList.data
                    if (orgList.length) 
                        this.defaultExpKeys = [orgList[0].id]

                    if (this.sourceId !== 'add') {
                        this.breadcrumbItems = [
                            {prop: '/resource-pool', label: '基础配置'},
                            {prop: '', label: '修改基础配置'}
                        ]
                        Api.get('sourcePool', { id: this.sourceId }, true).then(
                            res => {
                                this.sourcePoolForm.name = res.name
                                this.editSourcePoolName = res.name
                                this.sourcePoolForm.provider_id = res.provider_id
                                this.$refs.configTree.setCheckedKeys(res.org_ids)
                            }
                        )
                    }
                })
            )
        },
        /**
         * @description 渲染tree
         */
        renderContent (h, { node, data, store }) {
            let rst = null
            if (data['_subOrgs'] && data['_subOrgs'].length) {
                rst = (
                    <span>
                        <span>
                        <i class={'org ucmp-icon-device-org'}></i>
                        </span>
                        <span>{node.label}</span>
                    </span>
                )
            } else {
                rst = (
                    <span>
                        <span>
                        <i class={'org ucmp-icon-device-org'}></i>
                        </span>
                        <span>{node.label}</span>
                        <span class="icon">
                        </span>
                    </span>
                )
            }

            return rst
        },
        // 前台过滤树
        filterNode (value, data) {
            if (!value) return true
            return data.org_name.indexOf(value) !== -1
        },
        /**
         * @description 资源池名称唯一性校验
         */
        ifNameExist (rule, value, callback) {
            //UCMP-496 在创建基础配置界面，基础配置名称没有校验重名
            //问题原因：功能缺失

            //编辑时且资源池名称和编辑名称一致时不校验
            if (this.sourceId !== 'add' && this.editSourcePoolName === this.sourcePoolForm.name)
                callback()

            this.loading = true
            Api.get('sourcePoolName', {name: this.sourcePoolForm.name}, true).then(
                res => {
                    this.loading = false
                    if (res.is_exists)
                        callback(new Error('该基础配置名称已经存在，请重新输入!'))
                    else
                        callback()
                }, err => {
                    console.log(err)
                    this.loading = false
                }
            )
        },
        /**
         * @description 云厂商选择改变事件
         */
        providerChange () {
        },
        /**
         * @description 返回列表
         */
        goBack () {
            this.$router.push('/resource-pool')
        },
        /**
         * @description 提交表单
         */
        submitForm () {
            this.$refs.sourcePoolForm.validate((valid) => {
                if (valid) {
                    this.submitDisabled = true
                    this.sourcePoolForm.org_ids = this.$refs.configTree.getCheckedKeys()
                    if (this.sourceId === 'add') {
                        Api.post('sourcePool', this.sourcePoolForm, true).then(
                            res => {
                                this.submitDisabled = false
                                this.$message({
                                    type: 'success',
                                    message: '创建基础配置成功!'
                                })
                                this.$router.push('/resource-pool')
                            }, err => {
                                console.log(err)
                                this.submitDisabled = false
                            }
                        )
                    } else {
                        this.$set(this.sourcePoolForm, 'id', this.sourceId)
                        Api.put('sourcePool', this.sourcePoolForm, true).then(
                            res => {
                                this.submitDisabled = false
                                this.$message({
                                    type: 'success',
                                    message: '修改基础配置成功!'
                                })
                                this.$router.push('/resource-pool')
                            }, err => {
                                console.log(err)
                                this.submitDisabled = false
                            }
                        )
                    }
                }
            })
        }
    },
    created () {
        this.init()
    },
    watch: {
        // 检测树搜索条件变化
        searchKey (val) {
            this.$refs.configTree.filter(val)
        }
    }
}
</script>
<style lang="scss" scoped>
.source-form {
    padding-left: 150px;
    .form-item-width {
        max-width: 495px!important;
    }
}
</style>
