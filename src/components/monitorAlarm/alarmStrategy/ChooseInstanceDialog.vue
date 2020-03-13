<template lang="pug">
    div
        el-dialog(title="提示" :visible.sync="dialogVisibleParam" width="768px")
            div(v-if="!showBasicFilter") 当前监控对象归属{{searchParams.resource_owner_type | TranslateOrgApp}}：
                span {{searchParams.ownerName}}
            //- div.padding-bottom(v-if="showBasicFilter && selectedResourceList.length")
            //-     el-badge.margin-right(v-for="(owner, index) in selectedResourceList" :key="index" :value="owner.resource_cnt")
            //-         el-button.border-radius(size="small" type="primary") {{owner.owner_name}}
            div.d-flex(v-if="showBasicFilter")
                div.half-width
                    span 选择告警维度
                    el-select.margin-left(v-model="searchParams.resource_owner_type" size="mini" @change="changeOwnerType(searchParams.resource_owner_type)" clearable)
                        el-option(v-for="owner_type in ownerTypeList" :key="owner_type.value" :label="owner_type.label" :value="owner_type.value")
                div.half-width(v-if="searchParams.resource_owner_type")
                    span 资源归属
                    el-cascader.margin-left(v-show="searchParams.resource_owner_type === 'org'" size="mini" :options="ownerOptions[searchParams.resource_owner_type] || []" v-model="searchParams.ownerOrgId" :props="props" filterable clearable change-on-select placeholder="请选择组织机构" @change="refresTableData")
                    el-select.margin-left(v-show="searchParams.resource_owner_type === 'app'" v-model="searchParams.ownerAppId" size="mini" placeholder="请选择应用" @change="refresTableData" clearable)
                        el-option(v-for="ownerInfo in ownerOptions[searchParams.resource_owner_type]" :key="ownerInfo.id" :label="ownerInfo.app_name" :value="ownerInfo.id")
            //- div 是否选择
            div.select-table-container(v-if="showTable")
                //- div.mask(v-if="!searchParams.resource_owner_type") 请先选择资源归属
                TableSelect.margin-top(ref="ecsDialog" :config="dialogConfig" :columns="tableColumns" :selectedList="selectedEcsIdList" @changeSelected="changeSelected")
            div(slot="footer" class="dialog-footer")
                el-button(type="default" @click="dialogVisibleParam = false; cancel()" size="small") 取消
                el-button(type="primary" @click="save()" size="small") 确定
</template>
<script>
import TableSelect from '@/components/common/TableSelect'
import { mapGetters } from 'vuex'
import Api from '@api'

export default {
    props: [ 'dialogVisible', 'resourceType', 'resourceList', 'isEdit', 'resourceInfoError' ],
    components: { TableSelect },
    data () {
        return {
            dialogColumns: [
                {prop: 'name', label: '实例名称'},
                {prop: 'owner_type', label: '所属资源类型', format: 'TranslateOrgApp'},
                {prop: 'owner_name', label: '所属资源'},
                {prop: 'status', label: '实例状态', format: 'FormatStatus', statusTypeObj: {}},
                {prop: 'ip', label: 'IP'}
            ],
            ownerTypeList: [
                {label: '应用', value: 'app'},
                {label: '组织机构', value: 'org'}
            ],
            ownerOptions: {},
            props: {
                label: 'org_name',
                value: 'id',
                children: 'sub_orgs'
            },
            searchParams: {
                resource_owner_type: null,
                ownerOrgId: [],
                ownerAppId: '',
                ownerId: '',
                ownerName: ''
            },
            selectedResourceList: [],
            showBasicFilter: true,
            dialogConfig: {},
            showTable: false,
            statusTypeObj: {}
        }
    },
    created () {
        let statusTypeObj = this.getEcsStatusMap()
        this.statusTypeObj = statusTypeObj
        this.selectedResourceList = JSON.parse(JSON.stringify(this.resourceList))
        this.$nextTick(() => {
            this.dialogConfig = this.initDialogConfig()
            this.showTable = true
        })

        this.dialogColumns.forEach(column => {
            if (column.prop === 'status')
                this.$set(column, 'statusTypeObj', statusTypeObj)
        })
    },
    methods: {
        getEcsStatusMap () {
            let rst = {}
            let ecsMeta = this.metadata.find(item => item.service_code === 'ecs')
            if (ecsMeta && ecsMeta.attribute) {
                let statusEnum = ecsMeta.attribute.find(_enum => _enum.key === 'status')
                if (statusEnum && statusEnum.query_condition && statusEnum.query_condition.enum) {
                    statusEnum.query_condition.enum.forEach(status => {
                        rst[status.id] = status
                    })
                }
            }
            return rst
        },
        cancel () {
            this.selectedResourceList = JSON.parse(JSON.stringify(this.resourceList))
        },

        save () {
            this.dialogVisibleParam = false
            this.$emit('update:resourceList', this.selectedResourceList)
            if (this.selectedResourceList.length)
                this.$emit('update:resourceInfoError', false)
        },

        // 根据资源归属类型获取对应的资源归属列表
        changeOwnerType (type) {
            if (type === 'org') {
                this.searchParams.ownerOrgId = []
                if (!this.ownerOptions[type]) {
                    Api.get('orgTree', {}).then(
                        res => {
                            this.$set(this.ownerOptions, type, res.data)
                        }
                    )
                }
            }
            if (type === 'app') {
                this.searchParams.ownerAppId = ''
                if (!this.ownerOptions[type]) {
                    Api.get('appListByName', { limit: 99999999999999, page: 1 }).then(
                        res => {
                            this.$set(this.ownerOptions, type, res.data.apps)
                        }
                    )
                }
            }
            this.refresTableData()
        },

        refresTableData (val) {
            this.dialogConfig = this.initDialogConfig()
            this.$nextTick(() => {
                if (this.$refs.ecsDialog)
                    this.$refs.ecsDialog.getList()
            })
        },

        changeSelected (selectedList) {
            this.$nextTick(() => {
                let ownerTypes = []
                let currentSelected = []
                selectedList.forEach(resource => {
                    if (ownerTypes.indexOf(resource.owner_type + resource.owner_id) !== -1) {
                        let findGroup = currentSelected.find(item => {
                            return resource.owner_type === item.owner_type && resource.owner_id === item.owner_id
                        })
                        findGroup.resource_cnt++
                        findGroup.resource_list.push(resource.id)
                    } else {
                        ownerTypes.push(resource.owner_type + resource.owner_id)
                        // let ownerName =
                        currentSelected.push({
                            owner_id: resource.owner_id,
                            owner_type: resource.owner_type,
                            owner_name: resource.owner_name,
                            resource_cnt: 1,
                            resource_list: [resource.id]
                        })
                    }
                })
                this.selectedResourceList = JSON.parse(JSON.stringify(currentSelected))
            })
        },
        showSelectedOwner (owner) {
            this.showBasicFilter = false
            this.searchParams.ownerName = owner.owner_name
            this.searchParams.resource_owner_type = owner.owner_type
            if (owner.owner_type === 'org')
                this.searchParams.ownerOrgId.push(owner.owner_id)
            if (owner.owner_type === 'app')
                this.searchParams.ownerAppId = owner.owner_id
            this.$nextTick(() => {
                this.$refs.ecsDialog.initSelectedArray()
            })
        },
        initDialogConfig () {
            this.searchParams.ownerId = this.searchParams.resource_owner_type === 'org' ? this.searchParams.ownerOrgId[this.searchParams.ownerOrgId.length - 1] : this.searchParams.ownerAppId

            let config = {
                search: true,
                searchKey: 'instance_name',
                searchPlaceholder: '请输入实例名称搜索',
                otherSearch: [{
                    key: 'ip',
                    placeholder: '请输入ip搜索'
                }],
                api: 'api_resource_list',
                listRoot: 'list',
                unique: 'id',
                params: {
                    resource_type: this.resourceType,
                    owner_type: this.searchParams.resource_owner_type,
                    owner_id: this.searchParams.ownerId,
                    rule_id: this.ruleId
                },
                pagination: true,
                frontPagination: false
            }

            // 只有ecs有实例状态
            if (this.resourceType === 1) {
                config.otherSearch.push({
                    key: 'status',
                    placeholder: '请选择实例状态',
                    select: true,
                    options: {
                        defaultOptions: this.statusTypeArray,
                        value_field: 'id',
                        text_field: 'name'
                    }
                })
            }
            return config
        }
    },

    computed: {
        ...mapGetters([
            'metadata'
        ]),
        // 弹出框状态控制
        dialogVisibleParam: {
            get () {
                return this.dialogVisible
            },
            set (val) {
                this.$emit('update:dialogVisible', val)
            }
        },

        // 初始化选中的主机
        selectedEcsIdList () {
            if (this.resourceList.length) { // 编辑状态，选择已有主机
                let ecsIDs = []
                this.resourceList.forEach(item => {
                    if (item.resource_list) {
                        item.resource_list.forEach(instance => {
                            ecsIDs.push({
                                id: instance,
                                owner_id: item.owner_id,
                                owner_type: item.owner_type,
                                owner_name: item.owner_name
                            })
                        })
                    }
                })
                return ecsIDs
            } else
                return []
        },

        // tableColumns
        tableColumns () {
            let columns = JSON.parse(JSON.stringify(this.dialogColumns))
            // 监控对象类型不是云主机时去掉实例状态列
            if (this.resourceType !== 1)
                columns = columns.filter(column => column.prop !== 'status')
            // UCMP3-4926
            // nas监控对象弹框页面需去掉IP列
            if (this.resourceType === 6)
                columns = columns.filter(column => column.prop !== 'ip')
            return columns
        },

        statusTypeArray () {
            let arr = []
            for (let type of Object.values(this.statusTypeObj)) {
                //
                arr.push({id: type.id, name: type.name})
            }

            return arr
        },

        ruleId () {
            return this.$route.query.strategyId || ''
        }
    }
}
</script>
<style lang="scss" scoped>
.half-width{
    width: 50%;
}
.select-table-container {
    position: relative;
    .mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        background: rgba(#000, 0.7);
        text-align: center;
        padding-top: 40%;
        font-size: 28px;
        color: #fff;
    }
}
.border-radius{
    border-radius: 5px;
    padding: 8px 5px;
}
</style>
