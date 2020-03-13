<template lang="pug">
    div.operator-panel
        OperatorPanel(
        ref="commonOperatorPanel"
        :basicBtns="basicBtns"
        :advancedBtns="advancedBtns"
        :instances="instances"
        :serviceCode="serviceCode"
        :btnServiceCode="btnServiceCode"
        @operationClick="operationClick"
        )

        //- 修改配置弹窗
        el-dialog(v-if="showInstanceCfgForm" title="更改配置" :visible.sync="showInstanceCfgForm" width="710px" @close="closeEditCfgDialog")
            EditInstanceCfg(
                :serviceCode="serviceCode"
                :checkedInstance="instances[0]"
                :ifRouteToOrder="ifRouteToOrder"
                :btn="btnForEdit"
                @operationSuccess="operationSuccess"
                @closeModal="closeEditCfgDialog")
        //- 关联服务模态对话框
        el-dialog(v-if="isShowRelateServiceModel" :title="checkedAction.label + (checkedAction.modelSubTitle ? checkedAction.modelSubTitle : '')" :visible.sync="isShowRelateServiceModel" width="800px")
            //- 关联服务模态对话框只读
            template(v-if="checkedAction.readonly")
                div.overflow-y-auto(:style="{'min-height': '300px', 'max-height': '500px'}")
                    div.full-height(slot="tableContainer")
                        el-table(
                            :data="relateServiceTableData"
                            v-loading="isLoading"
                            element-loading-spinner="ucmp-icon-loading"
                            border
                        )
                            el-table-column(
                                resizable
                                :prop="column.prop"
                                v-for="column in relateColumns"
                                :key="column.prop"
                                :label="column.label"
                                :width="column.width"
                            )
                                template(slot-scope="scope")
                                    EcsCoreAttrTableColumn(v-if="(serviceCode === 'netbox_ip')"
                                        :scope="scope" :column="column")
                                    span(v-else) {{scope.row[column.prop] ? scope.row[column.prop] : '--'}}
            // - 关联服务操作(增加、减少等)
            template(v-else)
                TableSelect(ref="ecsTable" :config="relateDialogConfig" :columns="relateColumns" :selectedList.sync="relateSelectedList")
                div.dialog-footer(slot="footer")
                    el-button(
                        v-for="btn in submitBtns"
                        :key="btn.prop"
                        :type="btn.type"
                        @click="submitHandler(btn)"
                        :loading="isSaving && (btn.prop !== 'quit')") {{btn.label}}

        el-dialog(v-if="dymaicModalSwitch" :title="checkedAction.label" :visible.sync="dymaicModalSwitch" width="700px")
            el-form(label-width="120px" size="small" label-position="left")
                // UCMP3-1938【控制台】云硬盘挂载页面，不应该出来资源所属
                template(v-if="checkedAction.name === 'clone'")
                    InstanceOwner(:resourceOwner.sync="resourceOwner" type="clone" :serviceCode="serviceCode" :resourcesBelongsTo="checkedMetadata.resource_owner")
                DynamicForm(
                    :formItems="formItems || attribute"
                    :formData.sync="items_data"
                    :display.sync="items_display")
                        div.wram-tips(
                            v-if="checkedAction && checkedAction.name === 'create_snapshot'"
                            slot="MoreConfForm" 
                        ) <i class="el-icon-info"></i> 内存快照只适用于VMware;&nbsp;青云的快照即为青云备份服务。
                //- UCMP-1344 存量云主机克隆，报错，见截图
                template(v-if="(serviceCode === 'ecs') && (checkedAction.name === 'clone')")
                    el-form-item.is-required.rw-input(label="SSH端口")
                        el-input(
                          v-model="image.ssh_port"
                          placeholder="请填写被克隆主机SSH端口号"
                          v-validate="'required'"
                          name="image_port"
                          data-vv-as="SSH端口"
                          :class="{'is-danger': errors.has('image_port')}"
                        )
                        span.validator-error.is-danger(v-if="errors.has('image_port')") {{ errors.first('image_port') }}
                    el-form-item.is-required.rw-input(label="用户名")
                        el-input(
                          v-model="image.user"
                          placeholder="请填写被克隆主机用户名"
                          v-validate="'required'"
                          name="image.user"
                          data-vv-as="用户名"
                          :class="{'is-danger': errors.has('image.user')}"
                        )
                        span.validator-error.is-danger(v-if="errors.has('image.user')") {{ errors.first('image.user') }}
                    el-form-item.is-required.rw-input(label="密码")
                        //- bug UCMP-1353 点击云主机克隆，弹出框中默认有用户名、密码（登录的时候，选择记住用户名和密码）
                        el-input(
                          type="password"
                          v-model="image.passwd"
                          placeholder="请填写被克隆主机密码"
                          v-validate="'required'"
                          name="image.passwd"
                          data-vv-as="密码"
                          :class="{'is-danger': errors.has('image.passwd')}"
                          auto-complete="new-password"
                        )
                        span.validator-error.is-danger(v-if="errors.has('image.passwd')") {{ errors.first('image.passwd') }}
                    el-form-item.is-required.rw-input(label="租期")
                        ExpiredAtWidget(:value.sync="expired_at")
                    OrderConfirm.business-form-body(:orderForm.sync="orderForm")
                el-form-item.rw-input
                    el-button(
                        v-for="btn in submitBtns"
                        :key="btn.prop"
                        :type="btn.type"
                        @click="submitHandler(btn)"
                        :loading="isSaving && (btn.prop !== 'quit')") {{btn.label}}

        //- 分配
        el-dialog(v-if="assignVisible" :title="assignTitle" :visible.sync="assignVisible" width="600px" @close="closeAssignDialog")
            el-form(ref="ruleForm" label-width="100px" size="small")
                InstanceOwner(:resourceOwner.sync="resourceOwner" type="assign" :serviceCode="serviceCode" :resourcesBelongsTo="checkedMetadata.resource_owner")
                    el-form-item.is-required(v-if="globalEnv.require" label="环境" slot="otherOwnerItems")
                        el-select(v-model="env" name="env" v-validate="envRules" :class="{'is-danger': errors.has('env')}"
                        placeholder="选择环境" data-vv-as="环境")
                            el-option(v-for="item in globalEnv.env" :key="item" :label="item" :value="item")
                        span.validator-error.is-danger(v-if="errors.has('env')") {{ errors.first('env') }}
                el-form-item.is-required(label="操作系统")
                    el-select(v-model="osVersion" name="osVersion" v-validate="envRules" :class="{'is-danger': errors.has('osVersion')}" placeholder="选择操作系统" data-vv-as="操作系统")
                        el-option(v-for="item in osVersions" :key="item.os_version" :label="item.os_version" :value="item.os_version")
                    span.validator-error.is-danger(v-if="errors.has('osVersion')") {{ errors.first('osVersion') }}
                el-form-item.is-required(label="租期" v-if="tenancy.available")
                    ExpiredAtWidget(:value.sync="expiredDate")
                    //- el-date-picker(
                    //- v-model="expiredDate"
                    //- size="mini"
                    //- type="date"
                    //- name="expiredDate"
                    //- data-vv-as="租期"
                    //- v-validate="'required'"
                    //- :class="{'is-danger': errors.has('expiredDate')}"
                    //- :picker-options="getDatePickerOptions(expiredDate, tenancy.maxTime)"
                    //- placeholder="租期日期")
                    span.validator-error.is-danger(v-if="errors.has('expiredDate')") {{ errors.first('expiredDate') }}
                el-form-item.is-required(label="是否计费")
                    el-radio-group(v-model="bill")
                        el-radio(label="false") 不计费
                        el-radio(label="true") 计费
                    //- UCMP3-812【阿里云存量资源】给阿里云的存量资源分配，计费选项要去掉
                    el-tooltip(content="此处设置对公有云不生效!" placement="right")
                        i.ucmp-icon-question.theme-color.icon-tip
                    p {{assignAlert}}
            div.dialog-footer(slot="footer")
                el-button(@click="closeAssignDialog" size="small") 取消
                el-button(type="primary" @click="assign" size="small") 分配

        //- 修改标签
        EditTag(v-if="showEditTag" :metaData="checkedMetadata" :resource="instances[0]" :isEdit="true" :visible="showEditTag" @closeDialog="handlerTagDialogClose" @updateTag="updateTag")

        //- 绑定标签
        el-dialog(v-if="bingTagDialogVisible" title="绑定标签" :visible.sync="bingTagDialogVisible" @close="closeBingTagDialog" width="800px")
            TableSelect(ref="tagList" :config="tagDialogConfig" :columns="tagDialogColumns" :selectedList.sync="tagSelectedList")
            div.dialog-footer(slot="footer")
                el-button(@click="closeBingTagDialog" size="small") 取消
                el-button(type="primary" @click="bingTag" size="small" :loading="bingTagLoading") 保存
        //- NAS挂载、卸载主机
        el-dialog(v-if="nasDialog.isShow" :title="nasDialog.title" :visible.sync="nasDialog.isShow" @close="close" width="980px")
            TableSelect(ref="nasDialogList" :config="nasDialog.config" :columns="nasDialog.columns" :selectedList.sync="nasDialog.selectedList")
            div.dialog-footer(slot="footer")
                el-button(@click="close" size="small") 取消
                el-button(
                    type="primary"
                    @click="save"
                    size="small"
                    :disabled="nasDialog.config.maxChooseCount && (nasDialog.selectedList.length !== nasDialog.config.maxChooseCount) || isSaving || !nasDialog.selectedList.length"
                    :title="nasDialog.selectedList.length > 0 && nasDialog.selectedList.length !== 1 ? '该操作只可操作单台主机': ''"
                    ) {{checkedAction.name === 'attach' ? (nasAutoAttach ? '挂载' : '关联' ) : (nasAutoAttach ? '卸载' : '取消关联' )}}
        //- 修改责任人
        el-dialog(v-if="showResponsiblePersonForm" title="修改责任人" :visible.sync="showResponsiblePersonForm" width="600px")
            EditResponsiblePerson(
                :serviceCode="serviceCode"
                :checkedInstance="instances[0]"
                @closeModal="showResponsiblePersonForm = false"
                @operationSuccess="operationSuccess"
                :checkedMetadata="checkedMetadata")

        //- 修改资源所属
        el-dialog(v-if="showResourceBeiongForm" title="修改资源所属" :visible.sync="showResourceBeiongForm" width="600px")
            EditResourceBelong(
                :serviceCode="serviceCode"
                :checkedInstance="instances"
                :ifRouteToOrder="ifRouteToOrder"
                @closeModal="showResourceBeiongForm = false")

        //- oracle-pass修改密码
        el-dialog(v-if="showOraclePassForm" title="录入密码" :visible.sync="showOraclePassForm" width="600px")
            EditOraclPass(
                :serviceCode="serviceCode"
                :checkedInstance="instances"
                @closeModal="showOraclePassForm = false"
                @operationSuccess="operationSuccess"
                :checkedMetadata="checkedMetadata")
        // 续期
        Renewal(v-if="renewalVisible" :ifRouteToOrder="ifRouteToOrder" :renewalVisible="renewalVisible" :serviceCode="serviceCode" :checkedInstance="instances[0]" :checkedMetadata="checkedMetadata" @closeRenewalDialog="closeRenewalDialog" @operationSuccess="operationSuccess")

        //- 修改资源所属
        el-dialog(v-if="showResourcePool" :title="`分配${systemConfig.configure_template}`" :visible.sync="showResourcePool" width="600px")
            EditResourcePool(
                :serviceCode="serviceCode"
                :checkedInstance="instances"
                :ifRouteToOrder="ifRouteToOrder"
                @closeModal="showResourcePool = false"
                @operationSuccess="operationSuccess"
                :checkedMetadata="checkedMetadata"
                :checkedAction="checkedAction"
            )
</template>
<script>
    /**
     * @description 云主机操作面板 云主机列表/明细页面使用
     */
    import OperatorPanel from '@/components/common/panels/OperatorPanel'
    import InstanceOwner from '@/components/catalog/common/InstanceOwner'
    import EditInstanceCfg from '@/components/console/EditInstanceCfg'
    import EditTag from '@/components/iaas/tagMght/EditTag'
    import DynamicForm from '@/components/common/dynamicForm/DynamicForm'
    import TableSelect from '@/components/common/TableSelect'
    import InputTree from '@common/InputTree'
    import MetadataUtils from '@server/metadata.utils'
    import Api from '@api'
    // import Url from '@api/url'
    import {mapGetters, mapActions} from 'vuex'
    import Utils from '@server/Utils'
    import FileSaver from 'file-saver'
    import OrderConfirm from '@/components/catalog/common/OrderConfirm'
    import EditResponsiblePerson from '@/components/console/EditResponsiblePerson'
    import EditOraclPass from '@/components/console/EditOraclPass'
    import Renewal from './Renewal'
    import EcsCoreAttrTableColumn from '@/components/console/EcsCoreAttrTableColumn'
    import ExpiredAtWidget from '@/components/common/dynamicForm/ExpiredAtWidget'
    import EditResourceBelong from '@/components/console/EditResourceBelong'
    import EditResourcePool from '@/components/console/EditResourcePool'
    
    // NAS操作配置
    const nasMountConfig = {
        type: 'nas',
        search: true,
        searchKey: 'instance_name',
        searchPlaceholder: '请输入主机名',
        multiple: false, // 是否多选
        unique: 'instance_id',   // 能确定唯一数据的key
        api: '/nas/ecs/usable/list',
        params: {
            offset: 1,
            limit: 10,
            nas_id: '',
            owner: '--',
            owner_type: '--'
        },
        listRoot: 'list',
        frontPagination: false,
        pagination: true,
        selectable: function (row, index) {
            return row.os_icon
        },
        alert: 'NAS需要手动挂载'
    }
    // nas卸载云主机配置
    const nasUnmountConfig = {
        search: true,
        searchKey: 'instance_name',
        searchPlaceholder: '请输入主机名',
        multiple: false, // 是否多选
        unique: 'instance_id',   // 能确定唯一数据的key
        api: '/nas/ecs/:nas_id',
        params: {},
        frontPagination: false,
        pagination: false
    }
    // 关联云主机表格列
    const nasMountCols = [
        {prop: 'instance_name', label: '名称'},
        {prop: 'instance_id', label: 'ID'},
        {prop: 'os_icon', label: '操作系统', icon: true},
        {prop: 'ip', key: 'selectIp', isEdit: true, label: 'IP', type: 'select', width: '180px'},
        {prop: 'input', key: 'input', isEdit: true, label: '路径', type: 'input', validator: {regex: /^[\w\/\\:\-]*$/}},
        {
            prop: 'mountType',
            key: 'mountType',
            label: '挂载类型',
            reference: true,
            referenceKey: 'os_icon',
            referenceValue: {
                windows: { value: 'cifs', label: 'CIFS' },
                linux: { value: 'nfs', label: 'NFS' }
            }
        }
    ]

    const nasAutoMountCols = [
        {prop: 'port', key: 'port', isEdit: true, label: '端口', type: 'number', min: 1, max: 65535, precision: 0, step: 1},
        {prop: 'password', key: 'password', isEdit: true, label: '密码', type: 'password'}
    ]
    const nasUnmountCols = [
        {prop: 'instance_name', label: '名称'},
        {prop: 'instance_id', label: 'ID'},
        {prop: 'status', label: 'nas挂载状态', format: 'FormatNasStatus'},
        {prop: 'ip', label: 'IP', width: '180px'},
        {prop: 'path', label: '路径'}
    ]

    const nasAutoUnmountCols = [
        {prop: 'port', label: '端口'},
        {prop: 'password', key: 'password', isEdit: true, label: '密码', type: 'password'}
    ]
    // NAS 挂载类型
    const mountTypeList = [
        {
            value: 'nfs',
            label: 'nfs'
        },
        {
            value: 'cifs',
            label: 'cifs'
        }
    ]

    export default {
        $_veeValidate: {
            validator: 'new'
        },
        props: ['basicBtns', 'advancedBtns', 'instances', 'serviceCode', 'btnServiceCode', 'checkedMetadata'],
        data () {
            return {
                // 修改标签
                showInstanceCfgForm: false,
                showEditTag: false,

                // 绑定标签
                bingTagDialogVisible: false,
                bingTagLoading: false,
                tagSelectedList: [],

                checkedAction: {},
                dymaicModalSwitch: false,
                submitBtns: [
                    {prop: 'quit', label: '取消', type: 'default'},
                    {prop: 'submit', label: '确定', type: 'primary'}
                ],
                items_data: {},
                items_display: {},
                assignVisible: false,
                resourceOwner: {
                    owner_type: '',
                    owner: null,
                    user: null,
                    resource_pool_id: '',
                    provider_id: ''
                },
                expiredDate: '', // 存量分配的续期
                bill: 'false',
                env: '',
                envRules: {
                    required: true
                },
                // Nas操作
                nasDialog: {
                    isShow: false,
                    title: '',
                    config: {},
                    columns: [],
                    selectedList: [],
                    passwd: '',
                    mountType: '',
                    mountTypeList: mountTypeList
                },
                formItems: null,
                orderForm: {
                    expected_time: '',
                    urgency_level: 'low',
                    memo: ''
                },
                rules: {
                    require: {
                        required: true
                    }
                },
                expired_at: '',
                image: {
                  user: '',
                  ssh_port: '',
                  passwd: ''
                },
                expiredAtOptions: {
                    disabledDate (time) {
                        return time.getTime() < Date.now()
                    }
                },
                // 修改责任人
                showResponsiblePersonForm: false,
                showResourceBeiongForm: false,
                showOraclePassForm: false,
                // 分配资源池
                showResourcePool: false,
                globalEnv: {require: false},
                isSaving: false,
                renewalVisible: false,
                timeUnitText: {
                    day: '日',
                    hour: '小时',
                    minute: '分'
                },
                isShowRelateServiceModel: false,
                isLoading: false,
                relateColumns: [],
                relateSelectedList: [],
                relateServiceTableData: [],
                relateDialogConfig: {
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
                },
                btnForEdit: null, // 用户按钮拆分，控制资源的某个属性修改
                osVersion: '',
                osVersions: []
            }
        },
        methods: {
            operationClick (btn, self) {
                this.checkedAction = btn
                // 根据操作的url和选择的操作服务实例，发起请求
                if (!this.instances.length)
                    return

                let instance_names = this.instances.map(
                    item => {
                        return item[this.checkedMetadata.text_field]
                    })
                // 如果需要警告
                if (btn.warn) {
                    // UCMP3-4362【控制台】在nas详情中删除nas，提示“需先卸载关联的云主机”，但在列表是直接删除，需在详情中去掉提示可直接删除
                    // NAS 删除时如有关联云主机，操作前提示先卸载
                    // if (this.serviceCode === 'nas' && btn.name === 'delete') {
                    //     let findRelateEcs = this.instances.filter(item => Array.isArray(item.ecs) && item.ecs.length)
                    //     if (findRelateEcs.length) {
                    //         let tipNames = findRelateEcs.map(item => item[this.checkedMetadata.text_field])
                    //         this.$notify.warning(`请先卸载${tipNames.join(',')}关联的云主机`)
                    //         return
                    //     }
                    // }
                    let msg = ''
                    // UCMP3-693【标签】删除标签，提示语句有问题, 标签不需要去回收站
                    if (btn.name === 'delete' && this.serviceCode !== 'tag') {
                        let recycleTime = `${this.recycleConfig.storageTime}${this.timeUnitText[this.recycleConfig.timeUnit]}`
                        const noticeMsg = ['xen_desktop', 'xen_app'].includes(this.serviceCode) ? '' : '(注意：执行删除时系统会自动将资源进行关机操作, '
                        msg = '确定' + btn.label + ': ' + instance_names.join(',') + ' 吗? 删除后将放入回收站, 您可以在回收站进行恢复。' + noticeMsg + '放入回收站后, 将在' + recycleTime + '后自动删除并释放资源!)'
                    } else
                        msg = '确定' + btn.label + ': ' + instance_names.join(',') + ' 吗?'
                    this.$confirm(msg, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        customClass: 'warningConfirmBox', // bug UCMP3-4819控制台 防火墙策略批量删除86条记录，在小屏幕分辨率为1366*768下取消、确认按钮不可见
                        type: 'warning'
                    }).then(
                        () => {
                            this.realHandler(btn)
                        }
                    ).catch(() => {
                    })
                    return
                }
                if (btn.modal && !btn.asModify) {
                    if (btn.name === 'clone') {
                        this.initCloneDialog()
                        // bug UCMP-1235 克隆云主机目前只支持VMware厂商，云主机类型（服务目录申请+存量资源），控制台列表中应该做判断，给出提示（不支持克隆的，就不要让用户继续进行操作了））
                        // bug UCMP-1226 存量资源未分配所属业务，进行克隆时需要给出提示信息（存量资源需先分配所属业务，才能继续进行克隆！）

                        let instance = this.instances[0]
                        if (instance.provider_code === undefined || (instance.provider_code && instance.provider_code !== 'vmware_vsphere')) {
                            this.$notify({
                                type: 'warning',
                                message: '所选主机目前不支持克隆'
                            })
                            return
                        }

                        let owner = instance.owner !== '--' ? instance.owner : ''
                        let owner_type = instance.owner_type !== '--' ? instance.owner_type : ''
                        if (!owner || !owner_type) {
                            this.$notify({
                                type: 'warning',
                                message: '存量资源需先分配所属业务，才能继续进行克隆！'
                            })
                            return
                        }

                        // 应用初始化
                        this.$set(this.items_data, 'owner', instance.owner)
                        this.$set(this.items_display, 'owner', instance.owner_name)
                    }
                    if (btn.name === 'create_snapshot') {
                        // 初始化创建快照弹框的初始值
                        this.items_data = {}
                        this.items_display = {}
                    }
                    if (btn.relateColumns) {
                        this.relateColumns = btn.relateColumns
                        if (btn.readonly)
                            this.getRelateServiceTableData(btn)
                        else
                            this.setRelateServiceDialogConfig(btn)
                        this.isShowRelateServiceModel = true
                        return
                    }
                    if (btn.attribute) {
                        this.formItems = MetadataUtils.gerenateFormItems(btn.attribute, Array.isArray(this.instances) && this.instances[0])
                        if (btn.useInitValue && this.instances[0]) {
                            let values = {}
                            this.formItems.forEach(item => {
                                if (this.instances[0].hasOwnProperty(item.key))
                                    values[item.key] = this.instances[0][item.key]
                            })
                            this.items_data = JSON.parse(JSON.stringify(values))
                        }
                    }
                    this.dymaicModalSwitch = true
                    return
                }

                // NAS挂载卸载操作，只针对NAS的卸载、挂载操作
                if (this.serviceCode === 'nas' && (btn.name === 'attach' || btn.name === 'detach')) {
                    this.nasDialog.selectedList = []
                    if (btn.name === 'attach') {
                        this.nasDialog.config = nasMountConfig

                        // nas自动挂载时ip需要选择
                        if (this.nasAutoAttach) {
                            let cols = JSON.parse(JSON.stringify(nasMountCols))
                            let ipItem = cols.find(item => item.prop === 'ip')
                            ipItem.isEdit = true
                            this.nasDialog.columns = cols.concat(nasAutoMountCols)

                            this.nasDialog.config.alert = 'Windows暂不支持自动挂载'
                        } else {
                            // nas不自动挂载时则ip只展示
                            this.nasDialog.columns = nasMountCols
                        }

                        this.nasDialog.title = this.nasAutoAttach ? '挂载' : '关联'
                        this.nasDialog.config.params.owner_type = this.instances[0].owner_type || '--'
                        this.nasDialog.config.params.owner = this.instances[0].owner || '--'
                    } else if (btn.name === 'detach') {
                        this.nasDialog.config = nasUnmountConfig

                        // 非自动挂载，挂载状态写作 关联状态
                        if (!this.nasAutoAttach) {
                            let cols = JSON.parse(JSON.stringify(nasUnmountCols))
                            let statusCol = cols.find(item => item.prop === 'status')
                            statusCol.label = 'nas关联状态'
                            this.nasDialog.columns = cols
                        } else {
                            //
                            this.nasDialog.columns = nasUnmountCols.concat(nasAutoUnmountCols)
                        }
                        this.nasDialog.title = this.nasAutoAttach ? '卸载' : '取消关联'
                        // nas挂载主机列表添加禁用条件
                        this.nasDialog.config.selectable = this.selectableColumn
                    }
                    this.nasDialog.config.params.nas_id = this.instances[0].nas_id
                    this.nasDialog.isShow = true
                    return
                }
                this.realHandler(btn)
            },
            /**
             * @description 获取关联服务列表
             */
            getRelateServiceTableData (btn) {
                this.isLoading = true
                let _params = {}
                if (btn.name === 'view') {
                    if (this.instances && this.instances.length)
                        _params = {ip: this.instances[0].ip}
                }
                let apiUrl = btn.endpoint.url
                Api.get(apiUrl, _params, true).then(
                    res => {
                        this.isLoading = false
                        this.relateServiceTableData = res
                    }, () => {
                        this.isLoading = false
                    }
                )
            },
            /**
             * @description 设置关联服务对话框config
             */
            setRelateServiceDialogConfig (btn) {
                this.relateDialogConfig.api = btn.attribute[0].data_link.endpoint
                let ipActions = ['bindIp', 'unbindIp']
                if (ipActions.includes(btn.name)) {
                    if (this.instances && this.instances.length)
                        this.relateDialogConfig.params = {...this.relateDialogConfig.params, ...{ip: this.instances[0].ip}}

                    if (btn.name === 'unbindIp') {
                        this.relateDialogConfig.search = false
                        this.relateDialogConfig.listRoot = ''
                        this.relateDialogConfig.pagination = false
                    } else {
                        this.relateDialogConfig.search = true
                        this.relateDialogConfig.listRoot = 'list'
                        this.relateDialogConfig.pagination = true
                    }
                }
                this.relateSelectedList = []
            },

            // nas卸载主机列表中将 卸载中/挂载中/位置状态的主机置灰
            selectableColumn (row) {
                // 3.5 新加入attachable
                return row.status === 'attached' || row.status === 'attachable'
            },

            downloadConsoleFile () {
                let fileName = 'VMware-Remote-Console.exe'
                let platform = Utils.getPlatform()
                switch (platform) {
                    case 'windows':
                        fileName = 'VMware-Remote-Console.exe'
                        break
                    case 'mac':
                        fileName = 'VMware-Remote-Console.dmg'
                        break
                    case 'linux':
                        fileName = 'VMware-Remote-Console.bundle'
                        break
                    default:
                        break
                }

                Api.get('downloadConsole', {os_type: platform}, true)
                .then(    
                    res => {
                        if (res.url)
                            Utils.downloadFile(fileName, res.url)
                    }
                )
            },

            realHandler (btn, _params = {}) {
                // clone ecs
                if (btn.name === 'clone' && Object.keys(_params).length) {
                    let resourceId = `${this.serviceCode}_${Utils.uuid()}`
                    let instance = this.instances[0]

                    let owner = '', owner_display = ''
                    if (this.resourceOwner.owner_type === 'app') {
                        owner = this.resourceOwner.owner.id
                        owner_display = this.resourceOwner.owner.app_name
                    } else if (this.resourceOwner.owner_type === 'org') {
                        owner = this.resourceOwner.owner.id
                        owner_display = this.resourceOwner.owner.org_name
                    }

                    //2018-09-10 紧急出版本，防止服务端出错，网络子网单选，传给服务端数组
                    //UCMP3-518【克隆】克隆页面，云主机的hostname仍是用户输入，缺少应用角色和服务器用途字段
                    // 处理formdata
                    let attributes = {
                        instance_id: instance.instance_id,
                        image: this.image,
                        owner
                    }
                    attributes = { ..._params, ...attributes }
                    // 处理display
                    let displays = {
                        instance_id: instance.instance_id,
                        owner: owner_display
                    }
                    displays = { ...this.items_display, ...displays }

                    let param = {
                        memo: this.orderForm.memo,
                        urgency_level: this.orderForm.urgency_level,
                        expected_time: this.orderForm.expected_time ? new Date(this.orderForm.expected_time).getTime() : null,
                        order_item: [
                            {
                                owner_type: this.resourceOwner.owner_type !== '--' ? this.resourceOwner.owner_type : '',
                                owner,
                                env: instance.env !== '--' ? instance.env : '',
                                service_item: {
                                    expired_at: this.expired_at
                                },
                                data: {
                                    group: this.serviceCode,
                                    resources: {
                                        [resourceId]: {
                                            id: resourceId,
                                            group: this.serviceCode,
                                            display: displays,
                                            reference: '',
                                            attributes: attributes,
                                            provider_id: '',
                                            service_code: this.serviceCode
                                        }
                                    },
                                    service_code: this.serviceCode,
                                    resource_pool_id: ''
                                }
                            }
                        ]
                    }

                    if (btn && btn.endpoint && btn.endpoint.method && btn.endpoint.url) {
                        let request = btn.endpoint.method.toLowerCase()
                        this.isSaving = true
                        Api[request] && Api[request](btn.endpoint.url, param, true).then(
                            res => {
                                this.$notify.success('主机克隆申请单创建成功')
                                this.isSaving = false
                                this.$emit('operatorSuccess', btn)
                                this.checkedAction = {}
                                if (this.ifRouteToOrder(res))
                                    this.$router.push('/orders')

                                // 操作成功之后关闭弹窗
                                this.dymaicModalSwitch = false
                            }, () => {
                                this.isSaving = false
                            }
                        )
                    }
                    // 如果是本组件按钮触发，回调事件告知父组件以便及时更改checkedInstances
                    if (self)
                        this.$emit('afterOperator')
                    return
                }
                // 远程登录
                if (btn.name === 'console') {
                    let instances = this.instances.length > 5 ? this.instances.slice(0, 5) : this.instances
                    // Bug UCMP-1167【控制台】在控制台-云主机页面，勾选5个以上的云主机，点击“远程控制台”，打开了5个console页面，需增加提示告知用户
                    this.instances.length > 5 && this.$notify.warning('远程控制台批量操作最多可同时打开5个窗口')
                    this.$confirm('确认是否已经下载了打开控制台的插件？如没有下载插件请先点击下载，如已经下载请点击打开！', '提示', {
                        confirmButtonText: '打开',
                        cancelButtonText: '下载',
                        type: 'info',
                        showClose: false,
                        closeOnClickModal: false
                    }).then(() => {
                        let request = btn.endpoint.method.toLowerCase()
                        instances.forEach((instance, idx) => {
                            let param = {}
                            if (this.serviceCode === 'baremetal') {
                                // 物理机
                                let type = {
                                    metal: 'physical', // 裸物理机
                                    virtual: 'vsphere' // 虚拟服务器
                                }
                                param = {target_type: type[instance.type] || '', id: instance[this.checkedMetadata.value_field]}
                            } else {
                                // 非物理机
                                param = {providerid: instance.provider_id, instanceUuids: instance[this.checkedMetadata.value_field]}
                            }

                            Api[request] && Api[request](btn.endpoint.url, param, true).then(
                                res => {
                                    if (res)
                                        window.open(res, instance.instance_name)
                                    if (idx === instances.length - 1)
                                        this.checkedAction = {}
                                }, () => {
                                    this.checkedAction = {}
                                    this.$notify.error(`控制台打开失败。`)
                                }
                            )
                        })
                    }).catch(() => {
                        this.downloadConsoleFile()
                    })

                    // 如果是本组件按钮触发，回调事件告知父组件以便及时更改checkedInstances
                    if (self)
                        this.$emit('afterOperator')
                    return
                }

                // 云桌面、云应用登录
                let citrixServiceCodes = ['xen_desktop', 'xen_app']
                if (citrixServiceCodes.includes(this.serviceCode) && btn.name === 'login') {
                    let instances = this.instances[0]
                    let request = btn.endpoint.method.toLowerCase()
                    // resource_name: xen_desktop是云桌面名称 xen_app是应用名称
                    let resource_name = this.serviceCode === 'xen_desktop' ? instances.desktop_name : instances.application_name
                    let param = {provider_id: instances.provider_id, resource_name: resource_name, desktop_group_uid: instances.desktop_group_uid}
                    Api[request] && Api[request](btn.endpoint.url, param, true).then(
                        res => {
                            let downloadName = this.serviceCode === 'xen_desktop' ? instances.desktop_name : instances.application_name
                            if (res.data) {
                                let blob = new Blob([res.data], { type: 'application/octet-stream' })
                                FileSaver.saveAs(blob, `${downloadName}.ica`)
                            }

                            this.checkedAction = {}
                        }, () => {
                            this.checkedAction = {}
                        }
                    )
                    return
                }

                // 修改 (f5 修改拆分成3部分)
                if (btn.name === 'modify' || btn.asModify || btn.name === 'modify_health_check' || btn.name === 'modify_load_balancing' || btn.name === 'modify_node_status') {
                    if (this.instances.length > 1) {
                        this.$message({
                            type: 'warn',
                            title: '警告',
                            message: '每次操作只能修改一个实例'
                        })
                        return
                    } else {
                        if (this.serviceCode === 'tag')
                            this.showEditTag = true
                        else {
                            this.btnForEdit = btn
                            this.showInstanceCfgForm = true
                        }
                    }

                    return
                }
                // 修改责任人
                if (btn.name === 'modify_responsible_person') {
                    this.showResponsiblePersonForm = true
                    return
                }
                // 修改operacle密码
                if (btn.name === 'modify_password') {
                    this.showOraclePassForm = true
                    return
                }
                // 分配
                if (btn.name === 'assign') {
                    // UCMP-756【云主机】云主机列表，非存量资源的分配按钮是可点击的
                    // UCMP-1160【控制台】存量资源进入资源详情分配责任人时，提示“存在非存量资源，不能分配”。  详情不存在env
                    let getNonStock = this.instances.find(item => (item.hasOwnProperty('env') && item.env !== '--') || item.owner)
                    if (getNonStock) {
                        this.$notify({
                            type: 'warning',
                            // UCMP-1202【控制台】已分配过的存量资源不可再进行存量分配，提示信息需要修改。
                            message: '已分配资源不能重复分配'
                        })
                    } else {
                        const roleParams = {
                            user_id: localStorage.getItem('userId')
                        }

                        return Api.get('userRoles', roleParams, true).then(res => {
                            // TODO 具体的权限待定，另可以改store
                            const ucmpAdmin = res.data.ucmp.role_data === 'ucmp_admin' || res.data.ucmp.role_data === 'ucmp_root'

                            if (ucmpAdmin) {
                                // 存量分配
                                Api.get('getResourceExpired', {
                                    serviceCode: this.serviceCode,
                                    instanceId: this.instances[0][this.checkedMetadata.value_field]
                                }).then(res => {
                                    this.getOsVersions()
                                    this.assignVisible = true
                                    this.expiredDate = res.expired_at
                                })

                                this.getEnv()
                            } else {
                                this.$notify({
                                    type: 'warning',
                                    message: '没有权限分配存量资源'
                                })
                            }
                        })
                    }

                    return
                }

                // 绑定标签
                if (btn.name === 'bind') {
                    this.tagSelectedList = this.instances[0].tag
                    this.bingTagDialogVisible = true
                }

                // 修改资源所述
                if (btn.name === 'modify_resource_belong') {
                    // 信息
                    this.showResourceBeiongForm = true
                    return
                }

                // 续期
                if (btn.name === 'renewal') {
                    if (this.instances[0].blueprint && this.instances[0].stack_service_code !== this.serviceCode) {
                        // 蓝图
                        let name = this.instances[0][this.checkedMetadata.text_field]
                        this.$confirm(name + '为应用服务实例资源，不能单独操作，需在应用服务实例进行整体续期。点击确定会跳转到对应应用服务', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'info'
                        }).then(() => {
                            let blueprint_code = this.instances[0].stack_service_code
                            let blueprint_id = this.instances[0].service_instance_id
                            this.$router.push({
                                name: 'serviceInstanceList',
                                params: {
                                    code: blueprint_code,
                                    blueprint_id
                                },
                                query: {
                                    type: 'blueprint'
                                }
                            })

                            this.setActivedNavIndex('/serviceInstance/blueprint')
                        }).catch(() => {

                        })
                    } else if (this.instances[0].ecs && this.instances[0].ecs.length && this.serviceCode !== 'nas') {
                        // UCMP3-5288 nas现在有多个关联云主机，且在列表中没有响应对应的ecs信息，所以直接可以续期，详情中响应了对应的云主机信息，会
                        // 跳转到对应的云主机。然而给的ecs key值不对（其他资源1对1放在instance的ecs_instance_id， nas没有）
                        // 3.4.0的修改时暂时对nas不做跳转续期的处理
                        // 有所属云主机
                        this.$confirm('资源归属于云主机，点击确定会跳转到对应云主机详情页面', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'info'
                        }).then(() => {
                            let ecs_id = this.instances[0].ecs_instance_id
                            this.$router.push(`/ecs/instanceDetail/${ecs_id}/basic`)
                        }).catch(() => {

                        })
                    } else this.renewalVisible = true
                    return
                }

                // 创建快照
                if (btn.name === 'create_snapshot') {
                    /**
                     * _params
                     * {
                     *      "type":"memory",
                     *      "snapshot_name":"测试11",
                     *      "description":"12312321"
                     * }
                     */

                    let instance_id = this.instances[0][this.checkedMetadata.value_field]
                    let instance_name = this.instances[0][this.checkedMetadata.name_field]
                    // 创建快照的参数和其他请求不同，需要重新拼接
                    let params = {
                        display: {
                            ecs_instance_id: instance_name,
                            snapshot_name: _params.snapshot_name,
                            description: _params.description,
                            type: this.items_display.type
                        },
                        attributes: {
                            ecs_instance_id: instance_id,
                            snapshot_name: _params.snapshot_name,
                            description: _params.description,
                            type: _params.type
                        }
                    }
                    _params = params
                }

                // 分配资源池
                if (btn.name === 'modify_resource_pool') {
                    this.showResourcePool = true
                    return
                }

                // 确保发请求时method和url存在
                /* 共用以下请求的操作有:
                 * 云主机的(重启、停止、启动、删除);
                 * 云硬盘的(卸载、删除);
                 * Nas的(删除);
                 * F5的(开启、禁用、删除)
                 * 标签的(删除)
                 */
                if (btn && btn.endpoint && btn.endpoint.method && btn.endpoint.url) {
                    let instance_ids = this.instances.map(
                        item => {
                            return item[this.checkedMetadata.value_field]
                        })

                    let request = btn.endpoint.method.toLowerCase()
                    let param = Object.assign({}, _params)
                    // Request method may be GET or POST
                    param.instance_ids = request === 'get' || request === 'delete' ? instance_ids.join(',') : instance_ids
                    param.service_code = this.serviceCode

                    // 标签 需要修改参数
                    if (this.serviceCode === 'tag') {
                        param.service_code = this.instances[0].service_code
                        param.service_instance_id = this.instances[0].service_instance_id
                        param.instance_ids = this.instances[0].tag_id
                    }

                    // netbox_ip 回收IP参数处理
                    if (this.serviceCode === 'netbox_ip' && btn.name === 'release')
                        param = {ip: this.instances[0].ip}

                    if (this.isShowRelateServiceModel) {
                        let filterKey = btn.attribute[0].data_link.value_field
                        param.instance_ids = this.relateSelectedList.map(item => item[filterKey])
                        // 预留IP参数处理
                        let ipActions = ['bindIp', 'unbindIp']
                        if (ipActions.includes(btn.name)) {
                            param = {...param, ...{ip: this.instances[0].ip}}
                            delete param.service_code
                        }
                    }

                    if (this.serviceCode === 'pool') {
                        // UCMP3-3471【控制台】f5实例pool信息同步缺少参数
                        param.instance_ids = this.instances[0].f5PoolId
                    }

                    if (citrixServiceCodes.includes(this.serviceCode) && btn.name === 'logout') {
                        let session_type = this.serviceCode === 'xen_desktop' ? 0 : 1
                        param = {
                            provider_id: this.instances[0].provider_id,
                            machine_name: this.instances[0].machine_name,
                            user_name: this.instances[0].username,
                            session_type: session_type
                        }
                    }
                    Api[request] && Api[request](btn.endpoint.url, param, true).then(
                        res => {
                            // bug #UCMP-586 【控制台】云硬盘删除提示成功后页面数据仍显示，需要手动刷新页面
                            // bug UCMP-1287 【标签】删除公有标签去走审批，却提示正在删除中，请稍后查询
                            // bug UCMP-1654 【控制台】【新需求改动需修改】控制台下，删除云主机、云硬盘、蓝图实例等资源，现在需先放回收站再删，之前的提示信息“正在删除中，请稍后查询结果”就不合适了，需去掉
                            let msg = request === 'delete' ? '操作成功, 删除的资源已放入回收站中！' : btn.label + (res.approval ? '操作已进入审批流程，审批完成后，操作结果生效！' : '成功')

                            // bug UCMP-1341 【标签管理】删除私有标签，提示信息错误
                            if (request === 'delete' && this.serviceCode === 'tag') {
                                // 在返回前提前在父组件覆盖了this.instances

                                // UCMP-1345【标签】创建公有标签，没有配置审批流程，但是却提示创建公有审批申请成功
                                msg = '标签删除成功'
                            }
                            if (this.serviceCode === 'volume' && (btn.name === 'detach' || btn.name === 'attach'))
                                this.$notify.success(`正在${btn.label}中，请稍后查询`)
                            else if (this.serviceCode === 'netbox_ip') {
                                this.isShowRelateServiceModel = false
                                this.$notify.success(`${btn.label}操作成功！`)
                            } else if (this.serviceCode === 'ecs' && btn.name === 'create_snapshot')
                                this.$notify.success(`正在${btn.label}中，请稍后查询`)
                            else
                                this.$notify.success(msg)
                            // UCMP3-3409 点击确定后挂载弹框仍显示，需关闭不再显示
                            this.dymaicModalSwitch = false
                            this.$emit('operatorSuccess', btn)
                            this.checkedAction = {}
                            if (this.ifRouteToOrder(res))
                                this.$router.push('/orders')
                        }
                        // UCMP3-2901 删除云硬盘失败，多余提示 ’删除操作失败‘需要去掉
                        // , () => {
                        //     // UCMP3-2709【控制台】云硬盘挂载弹框，选择了所属云主机，点击确定后，“挂载”俩字不显示了
                        //     // this.checkedAction = {}
                        //     this.$notify.error(`${btn.label}操作失败`)
                        // }
                    )
                    // 如果是本组件按钮触发，回调事件告知父组件以便及时更改checkedInstances
                    if (self)
                        this.$emit('afterOperator')
                }
            },

            /**
             * 获取操作系统
             */
            getOsVersions () {
                Api.get('osVersion', {}).then(res => {
                    this.osVersions = res
                })
            },

            /**
             * @description UCMP3-2745 当前操作是否需要进入审批流程；TRUE: 需要跳转进入申请单；FALSE: 不需要跳转进入审批页面
             */
            ifRouteToOrder (res) {
                if (!res) return res
                return Array.isArray(res) && res.some(item => item.status === 'approving')
            },

            submitHandler (btn) {
                if (btn.prop === 'quit') {
                    this.dymaicModalSwitch = false
                    this.isShowRelateServiceModel = false
                    this.formItems = null
                } else if (btn.prop === 'submit') {
                    // 动态表单模态对话框
                    if (this.dymaicModalSwitch) {
                        this.$validator.validate().then(
                            result => {
                                if (result) {
                                    let params = JSON.parse(JSON.stringify(this.items_data))

                                    this.realHandler(this.checkedAction, params)
                                }
                            }
                        )
                    }
                    // 关联服务模态对话框
                    if (this.isShowRelateServiceModel)
                        this.realHandler(this.checkedAction)
                }
            },

            closeAssignDialog () {
                this.assignVisible = false
                this.bill = 'false'
                this.env = 'dev'
                this.osVersion = ''
                this.expiredDate = ''

                // reset
                this.resourceOwner.owner = ''
                this.resourceOwner.resource_pool_id = ''
                this.resourceOwner.provider_id = ''
                this.resourceOwner.user = null
            },
            assign () {
                this.$validator.validate().then(result => {
                    if (result) {
                        /**
                         *  {
                          "orgId":"123123123",  //组织机构id： 非必填
                          "appId":"",         // 应用id： 非必填
                          "ids":"4223649a-6803-cf0d-1083-40a1330921b8,b75d1409478d452ca2c53726fa313a3e",  //磁盘或者应用id拼接字符
                          "type":"ecs",     //类型两中 ”ecs“ 或者”volume“
                          "env":"test"，      //环境
                          "bill":"true"    //是否计费  true false
                         }
                         */
                            // UCMP-758【云主机】云主机列表，分配存量资源云硬盘出现error
                        const ids = this.instances.map(item => item[this.checkedMetadata.value_field]).join(',')

                        // 租期应在设定在选中日的最后一秒
                        let selectedDay = new Date(this.expiredDate)
                        selectedDay.setHours(23)
                        selectedDay.setMinutes(59)
                        selectedDay.setSeconds(59)
                        selectedDay.setMilliseconds(0)

                        let data = {
                            ids,
                            type: this.serviceCode,
                            bill: this.bill,
                            env: this.env,
                            osVersion: this.osVersion,
                            expiredAt: selectedDay.getTime()
                        }

                        // UCMP-1227【控制台】存量资源纳管的时候，只能选到组织机构，不能选到应用。资源只能挂靠在应用上
                        // 应用
                        if (this.resourceOwner.owner_type === 'app') {
                            data.appId = this.resourceOwner.owner.id
                            data.orgId = ''
                        } else if (this.resourceOwner.owner_type === 'org') {
                            data.appId = ''
                            data.orgId = this.resourceOwner.owner.id
                        }

                        // UCMP-1157【控制台】存量资源分配责任人失败。
                        // data.user = this.resourceOwner.user.name
                        data.userId = this.resourceOwner.user.id
                        Api.post('assign', data, true).then(res => {
                            this.$notify({
                                type: 'success',
                                message: '存量分配成功'
                            })
                            this.closeAssignDialog()
                            this.$emit('operatorSuccess')
                        })
                    }
                })
            },
            handlerTagDialogClose () {
                this.showEditTag = false
            },
            updateTag () {
                this.handlerTagDialogClose()
                this.$emit('operatorSuccess')
            },

            closeBingTagDialog () {
                this.bingTagDialogVisible = false
            },

            bingTag () {
                this.bingTagLoading = true
                const selectedArray = this.$refs.tagList.getSelection()

                const params = {
                    service_code: this.serviceCode,
                    resource_id: this.instances[0][this.checkedMetadata.value_field],
                    tag_ids: selectedArray.map(item => {
                        return item.tag_id
                    })
                }

                Api.post('bingTag', params, true).then(res => {
                    this.$notify({
                        type: 'success',
                        message: '绑定标签成功'
                    })

                    this.closeBingTagDialog()
                    this.bingTagLoading = false
                    this.$emit('operatorSuccess')
                }).catch(() => {
                    this.bingTagLoading = false
                })
            },
            // Nas保存
            save () {
                let btn = this.checkedAction
                if (btn.name === 'attach') {
                    // UCMP-1280 bug修改---挂载时将密码调整至列表内部，每个主机绑定一个密码
                    if (btn && btn.endpoint && btn.endpoint.method && btn.endpoint.url) {
                        let paramArr = this.nasDialog.selectedList.map(
                            item => {
                                return {
                                    ecs_instance_name: item.instance_name,
                                    ecs_instance_id: item.instance_id,
                                    target_host: item.selectIp,
                                    target_ssh_port: item.port,
                                    target_path: item.input,
                                    target_fs_type: item.mountType,
                                    root_passwd: item.password
                                }
                            })

                        let needCompleteEcs = []  // 参数不完整的主机列表
                        
                        // UCMP3-6249 【Nas】Nas关联挂载云主机路径，路径需增加校验，不允许输入特殊字符
                        let targetPathValidator = nasMountCols.find(item => item.prop === 'input').validator.regex
                        paramArr.forEach(_item => {
                            if (!_item.target_path || !targetPathValidator.test(_item.target_path) || !_item.target_fs_type || !_item.target_host || (this.nasAutoAttach && (!_item.target_ssh_port || !_item.root_passwd)))
                                needCompleteEcs.push(_item.ecs_instance_name)
                            else
                                delete _item.ecs_instance_name
                        })
                        if (needCompleteEcs.length) {
                            this.$notify({
                                type: 'warning',
                                message: `请为所选服务器【${needCompleteEcs.join('，')}】配置正确的参数！`
                            })
                            return
                        }

                        let params = {
                            nas_id: this.instances[0].nas_id,
                            instance_ids: this.instances[0].nas_id,
                            nas_node_list: paramArr
                        }
                        let request = btn.endpoint.method.toLowerCase()

                        this.isSaving = true
                        Api[request] && Api[request](btn.endpoint.url, params, true).then(
                            res => {
                                this.isSaving = false
                                this.$notify.success(`NAS${this.nasAutoAttach ? '挂载' : '关联'}申请单创建成功`)
                                this.nasDialog.isShow = false
                                // this.nasDialog.mountType = ''
                                // this.nasDialog.passwd = ''
                                this.nasDialog.mountTypeList = []
                                this.$emit('operatorSuccess', btn)
                                this.checkedAction = {}
                                if (this.ifRouteToOrder(res))
                                    this.$router.push('/orders')
                            }, () => {
                                // this.checkedAction = {}
                                this.isSaving = false
                            }
                        )
                        // 如果是本组件按钮触发，回调事件告知父组件以便及时更改checkedInstances
                        if (self)
                            this.$emit('afterOperator')
                    }
                } else if (btn.name === 'detach') {
                    if (btn && btn.endpoint && btn.endpoint.method && btn.endpoint.url) {
                        let paramArr = this.nasDialog.selectedList.map(
                            item => {
                                return {
                                    ecs_instance_name: item.instance_name,
                                    ecs_instance_id: item.instance_id,
                                    target_host: item.ip,
                                    target_ssh_port: item.port,
                                    root_passwd: item.password
                                }
                            }
                        )

                        let needCompleteEcs = []  // 参数不完整的主机列表
                        paramArr.forEach(_item => {
                            if (this.nasAutoAttach && !_item.root_passwd)
                                needCompleteEcs.push(_item.ecs_instance_name)
                            else
                                delete _item.ecs_instance_name
                        })

                        if (needCompleteEcs.length) {
                            this.$notify({
                                type: 'warning',
                                message: `请为所选服务器【${needCompleteEcs.join('，')}】配置正确的参数！`
                            })
                            return
                        }

                        let params = {
                            nas_id: this.instances[0].nas_id,
                            instance_ids: this.instances[0].nas_id,
                            nas_node_list: paramArr
                        }
                        let request = btn.endpoint.method.toLowerCase()

                        this.isSaving = true
                        Api[request] && Api[request](btn.endpoint.url, params, true).then(
                            res => {
                                this.isSaving = false
                                this.$notify.success(`NAS${this.nasAutoAttach ? '卸载' : '取消关联'}申请单创建成功`)
                                this.nasDialog.isShow = false
                                this.nasDialog.passwd = ''
                                this.nasDialog.mountTypeList = []
                                this.$emit('operatorSuccess', btn)
                                this.checkedAction = {}
                                if (this.ifRouteToOrder(res))
                                    this.$router.push('/orders')
                            }, () => {
                                this.isSaving = false
                            }
                        )
                        // 如果是本组件按钮触发，回调事件告知父组件以便及时更改checkedInstances
                        if (self)
                            this.$emit('afterOperator')
                    }
                }
            },
            close () {
                this.nasDialog.isShow = false
            },
            // 子组件操作成功后触发,通知父组件刷新列表数据
            operationSuccess (btn) {
              this.$emit('operatorSuccess', btn)
            },

            getEnv () {
                Api.get('getDictByCode', {code: 'env'}).then(res => {
                    this.globalEnv = res || {require: false}
                    // 如不显示env 给定默认的env product
                    this.env = this.globalEnv.require ? '' : 'product'
                })
            },

            initCloneDialog () {
                this.resourceOwner.owner = null
                this.resourceOwner.owner_type = ''
                this.items_data = {}
                this.items_display = {}
                this.image = {
                    user: '',
                    ssh_port: '',
                    passwd: ''
                }
                this.expired_at = ''
                this.orderForm = {
                    urgency_level: 'low',
                    memo: ''
                }
            },

            closeRenewalDialog () {
                this.renewalVisible = false
            },

            closeEditCfgDialog () {
                this.showInstanceCfgForm = false
                this.btnForEdit = null
            },

            ...mapActions([
                'setActivedNavIndex'
            ])
        },

        computed: {
            /**
             * @description 筛选当前操作需要的attribute列表，以便生成动态表单
             */
            attribute () {
                let copiedAttrs = JSON.parse(JSON.stringify(this.checkedMetadata.attribute))
                let attribute = []
                copiedAttrs.forEach(
                    attr => {
                        let index = -1, instance = this.instances[0]
                        index = this.checkedActionAttrsKeys.indexOf(attr.key)

                        // 筛选该操作需要的attribute，并且拼接需要依赖的数据
                        if (index !== -1) {
                            if (attr.data_link && attr.data_link.endpoint && this.checkedActionAttrsKeys.length && this.checkedActionAttrs[index].filters && this.checkedActionAttrs[index].filters.length) {
                                let endpoint = attr.data_link.endpoint

                                // if (this.serviceCode === 'volume' && attr.key === 'ecs_instance_id') {
                                //     endpoint = Url.volumeInstances
                                //     attr.data_link.text_field = 'instance_name'
                                //     attr.data_link.value_field = 'instance_id'
                                // }
                                this.checkedActionAttrs[index].filters.forEach(
                                    (item, index) => {
                                        endpoint = endpoint + (!index ? '?' : '&') + item + '=' + instance[item]
                                    }
                                )
                                attr.data_link.endpoint = endpoint
                            }
                            if (!attr.validation)
                                attr.validation = {}
                            attr.validation.required = true

                            // 更改select类型的控件类型
                            if (attr.data_link && attr.data_link.endpoint)
                                attr.type = 'select'

                            attribute.push(attr)
                        }
                    }
                )

                return attribute
            },

            checkedActionAttrs () {
                return this.checkedAction && this.checkedAction.attribute && this.checkedAction.attribute.length ? this.checkedAction.attribute : []
            },

            checkedActionAttrsKeys () {
                return this.checkedActionAttrs.map(
                    attr => {
                        return attr.key
                    }
                )
            },

            assignTitle () {
                return this.checkedMetadata.name ? '分配' + this.checkedMetadata.name : ''
            },

            assignAlert () {
                let msg = ''
                if (this.checkedMetadata) {
                    // 分配云主机提示
                    if (this.checkedMetadata.service_code === 'ecs')
                        msg = '备注： 挂载在云主机上的云硬盘，随云主机一起分配'
                    // 分配云硬盘提示
                    else if (this.checkedMetadata.service_code === 'volume')
                        msg = '备注： 挂载在云硬盘上的云主机，随云硬盘一起分配'
                }
                return msg
            },

            tagDialogColumns () {
                return [
                    {
                        prop: 'tag_name',
                        label: '标签名称'
                    },
                    {
                        prop: 'service_code',
                        label: '所属类型',
                        enum: this.tagServiceCodes,
                        text_field: 'name',
                        value_field: 'id'
                    },
                    {
                        prop: 'tag_type',
                        label: '标签类型',
                        enum: this.tagTypes,
                        text_field: 'name',
                        value_field: 'id'
                    }
                ]
            },

            tagDialogConfig () {
                return {
                    type: 'tag',
                    search: true,
                    searchKey: 'tag_name',
                    searchPlaceholder: '请输入标签名称搜索',
                    // UCMP-1229
                    maxChooseCount: this.tagMaxChoose, // 公私总共10个
                    otherSearch: [
                        {
                            select: true,
                            key: 'service_code',
                            options: {
                                defaultOptions: this.tagServiceCodes,
                                text_field: 'name',
                                value_field: 'id'
                            },
                            placeholder: '请选择所属类型'
                        },
                        {
                            select: true,
                            key: 'tag_type',
                            options: {
                                defaultOptions: this.tagTypes,
                                text_field: 'name',
                                value_field: 'id'
                            },
                            placeholder: '请选择标签类型'
                        }
                    ],
                    multiple: false, // 是否多选
                    unique: 'tag_id',   // 能确定唯一数据的key
                    // api: '/ucmp3/service_instance/tag',
                    api: '/ucmp3/tag',
                    params: {resource_id: this.instances[0][this.checkedMetadata.value_field]},
                    pagination: true,
                    frontPagination: false,
                    selectable: this.selectable,
                    listRoot: 'list'
                }
            },
            tagTypes () {
                const tagMetaData = MetadataUtils.getCheckedMeta(this.metadata, 'tag')
                const metaColumn = tagMetaData.attribute.find(item => {
                    return item.key === 'tag_type'
                })

                return metaColumn ? metaColumn.enum : []
            },
            tagServiceCodes () {
                const tagMetaData = MetadataUtils.getCheckedMeta(this.metadata, 'tag')
                const metaColumn = tagMetaData.attribute.find(item => {
                    return item.key === 'service_code'
                })

                return metaColumn ? metaColumn.enum : []
            },
            tagMaxChoose () {
                const curMetaData = MetadataUtils.getCheckedMeta(this.metadata, this.serviceCode)
                const relatedTagMetaData = curMetaData.related_service.find(item => {
                    return item.service_code === 'tag'
                })

                return relatedTagMetaData ? relatedTagMetaData.validation.max : 10
            },
            ...mapGetters([
                'metadata',
                'recycleConfig',
                'tenancy',
                'nasAutoAttach',
                'systemConfig'
            ])
        },

        created () {},

        components: {
            OperatorPanel,
            EditInstanceCfg,
            EditTag,
            DynamicForm,
            InstanceOwner,
            TableSelect,
            OrderConfirm,
            EditResponsiblePerson,
            EditOraclPass,
            InputTree,
            Renewal,
            EcsCoreAttrTableColumn,
            ExpiredAtWidget,
            EditResourceBelong,
            EditResourcePool
        }
    }
</script>
<style lang="scss" scoped>
.icon-tip {
    padding-left: 20px;
}
</style>

<style lang="scss">
.warningConfirmBox{
    .el-message-box__content{
        max-height: calc(100vh - 50px - 47px);
        overflow-y: auto;
    }
}

.wram-tips{
    padding-left: 10px;
    margin-bottom: 15px;
}
.el-icon-info{
    font-size: 15px;
    color: #409EFF;
}
</style>
