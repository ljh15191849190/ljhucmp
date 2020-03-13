<template lang="pug">
    div.full-height.overflow-y-auto
        UcmpTableContainer.margin-top(
          :advance="advanceSwitch"
          :noResizeSync="noResizeSync"
        )
            div.full-height(slot="tableContainer")
                el-row.flex
                    el-tooltip(v-for="(btn, index) in iconActions" :key="index" :content="toolTipContent(btn)" placement="bottom")
                        div.operator-btn-container
                            el-button.circle-btn.ucmp-service-action(circle plain :type="btn.type" :icon="btn.icon" size="mini" :disabled="buttonsDisabed[btn.name]" @click="operationClick(btn)")
                el-table.margin-top(
                    :data="tableData"
                    v-loading="isLoading"
                    element-loading-spinner="ucmp-icon-loading"
                    @selection-change="handleSelectionChange"
                    border
                )
                    el-table-column(type="selection" width="45")
                    el-table-column(
                        resizable
                        :prop="column.prop"
                        v-for="column in columns"
                        :key="column.prop"
                        :label="column.label"
                        :width="column.width"
                    )
                        template(slot-scope="scope")
                            EcsCoreAttrTableColumn(:scope="scope" :column="column")
        el-dialog(v-if="isShowEcsDialog" title="绑定云主机" :visible.sync="isShowEcsDialog" @close="close" width="800px")
            TableSelect(ref="ecsTable" :config="dialogConfig" :columns="columns" :selectedList.sync="selectedList")
            div.dialog-footer(slot="footer")
                el-button(@click="close()" size="small") 取消
                el-button(type="primary" @click="selectEcs" size="small" :loading="saveLoading" :disabled="!selectedList.length") 保存
</template>
<script>
/**
 * Ip关联云主机
 */
import { mapGetters } from 'vuex'
import Api from '@api'
import TableSelect from '@/components/common/TableSelect'
import EcsCoreAttrTableColumn from '@/components/console/EcsCoreAttrTableColumn'
export default {
    name: 'InstanceDetailRelatedEcs',
    components: {TableSelect, EcsCoreAttrTableColumn},
    data () {
        return {
            noResizeSync: false,
            advanceSwitch: true,
            
            isLoading: false,
            tableData: [],
            columns: [],
            selectedInstances: [],
            isShowEcsDialog: false,
            saveLoading: false,
            selectedList: [],
            dialogConfig: {
                isUseEcsCoreAttrColumn: true,
                search: true,
                searchKey: 'instance_name',
                searchPlaceholder: '请输入主机名称',
                multiple: false, // 是否多选
                unique: 'instance_id', // 能确定唯一数据的key
                api: '',
                params: {
                    offset: 1,
                    limit: 10
                },
                listRoot: 'list',
                frontPagination: false,
                pagination: true
            }
        }
    },
    created () {
        this.init()
    },
    methods: {
        /**
         * @description 初始化
         */
        init () {
            if (this.viewAction) {
                this.columns = this.viewAction.relateColumns
                this.getEcsList()
            }
        },
        /**
         * @description 获取云主机列表
         */
        getEcsList () {
            this.isLoading = true
            Api.get(this.viewAction.endpoint.url, {ip: this.checkedIp}, true).then(
                res => {
                    this.tableData = res
                    this.isLoading = false
                }, () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * @description 解绑云主机
         * @param [btn] bindIp btn 
         */
        unbindEcs (btn) {
            let _params = {ip: this.checkedIp}
            let paramKey = btn.attribute[0].key
            let filterKey = btn.attribute[0].data_link.value_field
            _params[paramKey] = this.selectedInstances.map(item => item[filterKey])
            Api.post(btn.endpoint.url, _params, true).then(
                res => {
                    this.$notify.success('解绑操作成功！')
                    this.getEcsList()
                }, () => {
                    this.$notify.error('解绑操作失败！')
                }
            )
        },
        /**
         * @description 绑定云主机
         * @param [btn] bindIp btn 
         */
        bindEcs (btn) {
            let _params = {ip: this.checkedIp}
            let paramKey = btn.attribute[0].key
            let filterKey = btn.attribute[0].data_link.value_field
            _params[paramKey] = this.selectedList.map(item => item[filterKey])
            Api.post(btn.endpoint.url, _params, true).then(
                res => {
                    this.$notify.success('绑定操作成功！')
                    this.isShowEcsDialog = false
                    this.getEcsList()
                }, () => {
                    this.$notify.error('绑定操作失败！')
                }
            )
        },
        operationClick (btn) {
            if (btn.name === 'unbindIp') {
                // 解绑
                this.$confirm('确定解绑选中的云主机？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.unbindEcs(btn)
                }).catch(() => {
                })
            } else {
                // 绑定
                let bindIpAction = this.iconActions.find(item => item.name === 'bindIp')
                this.dialogConfig.api = bindIpAction.attribute[0].data_link.endpoint
                this.dialogConfig.params = {...this.dialogConfig.params, ...{ip: this.checkedIp}}
                this.selectedList = []
                this.isShowEcsDialog = true
            }
        },
        selectEcs () {
            let bindIpAction = this.iconActions.find(item => item.name === 'bindIp')
            this.bindEcs(bindIpAction)
        },
        handleSelectionChange (val) {
            this.selectedInstances = val
        },
        close () {
            this.isShowEcsDialog = false
            this.saveLoading = false
        },
        toolTipContent (btn) {
            return this.buttonsDisabed[btn.name] ? `${btn.label}:${btn.disabled_description}` : btn.label
        }
    },
    computed: {
        checkedIp () {
            return this.selectedInstanceInfo ? this.selectedInstanceInfo.ip : ''
        },
        buttonsDisabed () {
            let result = {}
            let selectedLen = this.selectedInstances.length
            this.iconActions.forEach(item => {
                if (item.name === 'unbindIp') 
                    result[item.name] = selectedLen < 1
                if (item.name === 'bindIp') 
                    result[item.name] = item.disabled_rules.some(item => item.value.includes(this.selectedInstanceInfo[item.key]))
            })
            return result
        },
        viewAction () {
            return this.groupActions.iconGroup.find(item => item.name === 'view')
        },
        iconActions () {
            let iconGroups = JSON.parse(JSON.stringify(this.groupActions.iconGroup))
            let iconActions = iconGroups.filter(item => item.name !== 'view' && item.name !== 'release')
            return iconActions
        },
        ...mapGetters([
            'groupActions',
            'selectedInstanceInfo'
        ])
    }
}
</script>
<style lang="scss" scoped>
.ucmp-icon {
    font-size: 24px;
}
</style>
