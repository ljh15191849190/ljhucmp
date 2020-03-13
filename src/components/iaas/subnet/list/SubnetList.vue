<template lang="pug">
    UcmpTableContainer(
        :pagination.sync="pagination"
        :filterItems="filter.filterItems"
        :searchPlaceholder="filter.searchPlaceholder"
        @sizeChange="handleSizeChange"
        @currentChange="handleCurrentChange"
        :submit="searchSubnet"
    )
        div.full-height.padding-top(slot="tableContainer")
            el-table(:data="tableData" v-loading="isLoading" element-loading-spinner="ucmp-icon-loading" border)
                el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                    template(slot-scope="scope")
                        span(v-if="(column.prop === 'family')") {{ 'IPv' + scope.row[column.prop] }}
                        el-button(v-else-if="(column.prop === 'status')" :type="stateObj[scope.row.status.value].type" size="mini") {{ stateObj[scope.row.status.value].label }}
                        span(v-else-if="(column.prop === 'role' || column.prop === 'vlan')") {{ scope.row[column.prop] ? scope.row[column.prop].name : '' }}
                        span(v-else-if="(column.prop === 'last_updated')") {{ formatterTime(scope.row.last_updated) }}
                        span(v-else) {{ scope.row[column.prop] }}
                el-table-column(label="操作" width="150")
                    template(slot-scope="scope")
                        Icon-Button(v-for="operation in operations" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: scope.row}" :text="operation.label")
            el-dialog(title="编辑子网" v-if="subnetVisible"  :visible.sync="subnetVisible" width="600px")
                EditSubnet(:prefixForm="prefixForm" @closeDialog="closeSubnetDialog" @submit="submitIpPool")
            el-dialog(title="分配组织机构" v-if="isShowOrg"  :visible.sync="isShowOrg" width="600px")
                el-form(label-width="70px" :label-position="labelPosition" size="small")
                    el-form-item.is-required(label="组织机构")
                        Org-Tree(
                            v-if="orgList.length"
                            v-model="orgForm.org_names"
                            v-validate="'required'"
                            :name="'org_ids'"
                            :placeholder="'请选择组织机构'"
                            data-vv-as="组织机构"
                            :isDanger="errors.has('org_ids')"
                            :defaultProps="defaultProps"
                            :treeData="orgList"
                            :selectNodes.sync="orgForm.org_ids"
                        )
                        span.validator-error.is-danger(v-if="errors.has('org_ids')") {{ errors.first('org_ids') }}
                div.dialog-footer(slot="footer")
                    el-button(@click="closeOrgDialog" size="small") 取消
                    el-button(type="primary" @click="saveOgr" size="small") 保存
        el-button.default-button(slot="filter-btns" type="primary" size="small") 查询
</template>

<script>
import Api from '@api'
import DateUtil from '@server/date-utils'
import EditSubnet from '../EditSubnet'
import Subnet from '@mock/subnet/subnet.mock'
import OrgTree from '@common/OrgTree'
import OperMixin from '@mixins/operatorLog.mixin'

/**
 * @description IP组管理
 */

//表格操作配置operations
const operations = [
    {
        type: 'ucmp-icon-edit',
        label: '编辑',
        prop: 'edit'
    },
    {
        type: 'ucmp-icon-alloc',
        label: '组织机构',
        prop: 'alloc'
    },
    {
        prop: 'delete',
        label: '删除',
        type: 'ucmp-icon-delete'
    }
]
// 过滤条件配置
const filterItems = [
    {
        label: '请输入子网',
        key: 'q'
    },
    {
        label: '状态',
        key: 'status',
        type: 'select',
        multiple: false,
        defaultOptions: Subnet.ipPoolStates,
        data_link: {
            text_field: 'label',
            value_field: 'prop'
        }
    }
]
export default {
    $_veeValidate: {
        validator: 'new'
    },
    mixins: [OperMixin],
    data () {
        return {
            searchParams: {},
            cloudProvider: '',
            advanceSwitch: false,
            subnetVisible: false,
            prefixForm: {},
            originPagination: {
                offset: 0,
                limit: 20,
                total: 0
            },
            operations: operations,
            filter: {
                advanceSwitch: true,
                searchPlaceholder: '请输入子网',
                filterItems: filterItems
            },
            states: Subnet.ipPoolStates,
            columns: Subnet.ippoolsColumns,
            tableData: [],
            isLoading: false,
            orgList: [],
            isShowOrg: false,
            orgForm: {
                org_ids: [],
                org_names: ''
            },
            defaultProps: {
                id: 'id',
                parentId: 'parent_id',
                children: 'sub_orgs',
                label: 'org_name'
            },
            labelPosition: 'right',
            prefix_id: ''
        }
    },
    methods: {
        /**
         * @description 获取组织机构
         */
        getOrgList () {
            Api.get('orgTree', {}, true).then(
                res => {
                    this.orgList = res.data
                }
            )
        },
        /**
         * @description 默认每页查询条数发生变化
         */
        handleSizeChange (size) {
            this.originPagination.limit = size
            this.getIpPoolList()
        },
        handleCurrentChange (index) {
            this.originPagination.offset = index - 1
            this.getIpPoolList()
        },
        closeSubnetDialog () {
            this.subnetVisible = false
            this.checkedPrefix = ''
            this.prefixForm = {}
        },
        submitIpPool () {
            this.closeSubnetDialog()
            this.getIpPoolList()
        },
        formatterTime (time) {
            return DateUtil.formate(new Date(time))
        },
        /**
         * @description 搜索子网
         * @param [param] 搜索对象
         */
        searchSubnet (param) {
            this.originPagination.offset = 0
            if (param.searchKey) {
                this.$set(param, 'q', param.searchKey)
                delete param.searchKey
            }
            this.searchParams = Object.assign({}, param)
            this.getIpPoolList()
        },
        getIpPoolList () {
            let pageParam = { offset: this.originPagination.offset * this.originPagination.limit, limit: this.originPagination.limit }
            let tenantParam = { tenant: localStorage.getItem('tenant') }
            let resObj = Object.assign(pageParam, this.searchParams, tenantParam)
            this.isLoading = true
            this.isLoading = false
            Api.get('iaas_prefixes', resObj, false).then(
                res => {
                    this.isLoading = false
                    this.tableData = res.results
                    this.originPagination.total = res.count
                },
                () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * @description 操作处理
         */
        handleOperation (obj) {
            //删除操作
            if (obj.id === 'delete')
                this.handleDelete(obj)
            else if (obj.id === 'alloc')
                this.handleAlloc(obj)
            else
                this.handleEdit(obj)
        },
        /**
         * @description 删除操作
         */
        handleDelete (obj) {
            this.$confirm(`确定删除子网 ${obj.row.prefix}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteSubnet(obj.row.id, obj.row.prefix)
            }).catch(() => {
            })
        },
        /**
         * @description 配置组织机构关系
         */
        handleAlloc (obj) {
            this.prefix_id = obj.row.id
            Api.get('iass_prefixes_org', {prefix_id: this.prefix_id}, true).then(
                res => {
                    this.orgForm.org_ids = res.org_ids
                    this.isShowOrg = true
                }
            )
        },
        deleteSubnet (id, name) {
            Api.delete('iaas_prefixes', { _id: id }, true).then(
                res => {
                    this.$message({
                        type: 'success',
                        message: name + '删除成功!'
                    })
                    this.searchParams = {}
                    this.getIpPoolList()

                    // 插入操作日志
                    this.addOperLog({
                        text: '删除子网: ' + name,
                        modular_code: this.MODULAR_CODE.CLOUDINFRASTRUCTURE,
                        type_code: this.TYPE_CODE.DELETE,
                        resource: '子网'
                    })
                }
            )
        },

        /**
         * @description 编辑操作
         */
        handleEdit (obj) {
            this.subnetVisible = true
            this.prefixForm = obj.row
        },
        closeOrgDialog () {
            this.isShowOrg = false
        },
        /**
         * @description 保存子网与组织机构关系
         */
        saveOgr () {
            // 调用保存组织机构接口
            this.$validator.validate().then(valid => {
                if (valid) {
                    Api.post('iass_prefixes_org', {prefix_id: this.prefix_id, org_ids: this.orgForm.org_ids}, true).then(
                        res => {
                            this.isShowOrg = false
                            this.$message({
                                type: 'success',
                                message: '保存操作成功!'
                            })
                        }
                    )
                }
            })
        }
    },
    computed: {
        pagination: {
            get () {
                return {
                    index: this.originPagination.offset + 1,
                    size: this.originPagination.limit,
                    count: this.originPagination.count,
                    total: this.originPagination.total
                }
            },
            set (val) {
                this.originPagination.offset = val.index - 1
            }
        },
        stateObj () {
            let rst = {}
            this.states.forEach(
                item => {
                    rst[item.prop] = {
                        type: item.type,
                        label: item.label
                    }
                }
            )
            return rst
        }
    },
    created () {
        this.getOrgList()
        this.getIpPoolList()
    },
    components: {
        OrgTree,
        EditSubnet
    }
}
</script>
<style lang="scss" scoped>
</style>
