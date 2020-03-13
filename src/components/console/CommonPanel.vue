<template lang="pug">
    // 标签不需要授权
    div(v-if="isShowAuthorize")
        el-row.flex
            // 授权
            el-tooltip(content="授权" placement="bottom")
                div.operator-btn-container
                    el-button.circle-btn.ucmp-service-action(circle plain @click="openAuthorizeDialog" size="mini" icon="ucmp-icon-authority" :disabled="disableToAuthorize")

        el-dialog(v-if="dialogVisible" :title="title" :visible.sync="dialogVisible" @close="closeDialog" width="800px")
            TableSelect(ref="userListTable" :config="dialogConfig" :columns="dialogColumns" :selectedList="selectedList")
            div.dialog-footer(slot="footer")
                el-button(@click="closeDialog()" size="small") 取消
                el-button(type="primary" @click="authorize" size="small" :loading="isSaving") 保存
</template>

<script>
    import TableSelect from '../common/TableSelect'
    import Api from '@api'

    /**
     * @description
     * @author jia.lu
     */
    export default {
        name: 'CommonPanel',
        components: {TableSelect},
        props: {
            selectedInstances: {
                type: Array,
                default: () => []
            },
            serviceCode: String,
            checkedMetadata: Object
        },
        data () {
            return {
                title: '授权',
                dialogVisible: false,
                domainId: localStorage.getItem('domainId'),
                dialogColumns: [
                    {label: '登录名', prop: 'name'},
                    {label: '姓名', prop: 'realname'},
                    {label: '邮箱地址', prop: 'email'},
                    {
                        label: '授权方式',
                        prop: 'authority',
                        key: 'authority',
                        width: '250px',
                        type: 'radios',
                        isEdit: true,
                        options: [
                            {label: '管理权限', value: 1}, // UCMP-1170 管理权限为1
                            {label: '使用权限', value: 0}
                        ]
                    }
                ],
                currentUserAuthority: {},
                selectedList: [],
                disableToAuthorize: true,
                userId: localStorage.getItem('userId'),
                isSaving: false
            }
        },
        computed: {
            dialogConfig () {
                return {
                    search: true,
                    searchKey: 'name',
                    searchPlaceholder: '请输入登录名/姓名搜索',
                    multiple: false, // 是否多选
                    unique: 'id',   // 能确定唯一数据的key
                    // UCMP3-689【修改责任人】服务目录申请和控制台下修改责任人以及授权调用的查询用户的接口需修改优化。替换了新接口
                    api: 'userListByName',
                    listRoot: 'data.users',
                    paginationParam: {offset: 'page_idx'},
                    pagination: true,
                    frontPagination: false,
                    selectedHead: true,
                    radio: 'authority',
                    selectable: this.selectable
                }
            },
            /**
             * @description 是否显示授权对话框
             */
            isShowAuthorize () {
                // 未授权服务包含列表
                let unauthorizedServices = ['tag', 'netbox_ip', 'backup']
                return !unauthorizedServices.includes(this.serviceCode)
            }
        },
        methods: {
            selectable (row, index) {
                return !row.readOnly && this.userId !== row.id
            },
            /**
             * @description 授权
             */
            openAuthorizeDialog () {
                this.getUserAuthorityOfResource(this.selectedInstances[0])
            },
            closeDialog () {
                this.dialogVisible = false
            },
            /**
             * @description 授权
             */
            authorize () {
                let selectedArray = this.$refs.userListTable.getSelection()
                if (selectedArray.length) {
                    selectedArray = selectedArray.filter(item => {
                        return item.hasOwnProperty('authority')
                    })

                    selectedArray = selectedArray.map(item => {
                        return {
                            userId: item.id,
                            authority: item.authority
                        }
                    })

                    const params = {
                        instanceId: this.selectedInstances[0][this.checkedMetadata.value_field],
                        serviceCode: this.serviceCode,
                        userAuthInfo: selectedArray
                    }

                    this.isSaving = true
                    Api.post('authorize', params, true).then(res => {
                        this.isSaving = false
                        this.closeDialog()
                        this.$notify({
                            type: 'success',
                            message: '授权成功！'
                        })
                    }).catch(e => {
                        this.isSaving = false
                    })
                }
            },
            /**
             * @description 获取选中资源的授权情况
             * @param selectedInstance
             */
            getUserAuthorityOfResource (selectedInstance) {
                const params = {
                    _serviceCode: this.serviceCode,
                    _instanceId: selectedInstance[this.checkedMetadata.value_field]
                }
                Api.get('resourceAuthority', params, true).then(res => {
                    this.selectedList = res.userAuthInfo.map(item => {
                        item.id = item.userId
                        return item
                    })

                    this.dialogVisible = true
                })
            },
            /**
             * @description 获得选中资源的当前用户权限，来控制按钮是否可点击
             * @param selectedInstance
             */
            getCurrentUserAuthority (selectedInstance) {
                const params = {
                    _serviceCode: this.serviceCode,
                    _instanceId: selectedInstance[this.checkedMetadata.value_field],
                    _info: 'info'
                }
                Api.get('resourceAuthority', params, true).then(res => {
                    this.currentUserAuthority = res

                    this.setDisableToAuthorize()
                })
            },
            setDisableToAuthorize () {
                // UCMP-1194【数据授权】控制台资源列表，勾选一个资源，点击授权，授权按钮不可点
                this.disableToAuthorize = (this.currentUserAuthority && this.currentUserAuthority.authority !== 1) || this.selectedInstances.length !== 1
            }
        },
        watch: {
            selectedInstances (newValue, oldValue) {
                if (newValue.length === 1) {
                    //
                    this.getCurrentUserAuthority(newValue[0])
                } else {
                    // 只能单个资源授权
                    this.disableToAuthorize = true
                }
            }
        },
        created () {
        }
    }
</script>

<style lang="scss" scoped>
</style>
