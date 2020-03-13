<template lang="pug">
    div.full-height.overflow-y-auto
      el-card(v-if="checkedMetadata && checkedMetadata.service_code === 'pool'")
          div(slot="header")
            div.d-flex.justify-content-between.align-items-center
              label Pool 详细信息
              OperatorPanel(
                  ref="operatorRef"
                  :basicBtns="justSynchroBasicBtn"
                  :advancedBtns="justSynchroAdvancedBtns"
                  :instances="[modifiedInstance]"
                  :serviceCode="extendCode"
                  :checkedMetadata="checkedMetadata"
                  @operatorSuccess="operatorSuccess"
              )
          div.d-flex.flex-wrap
            div.row.padding.no-margin-left.no-margin-right.w-50(v-for="(value, key) in filteredDetailInfo" :key="key")
              div.col-md-3.text-right {{infoDetailMap[key]}}
              div.col-md-9.text-overflow-ellipsis(v-title-tip="value") {{value ? value : '--'}}
      UcmpTableContainer.margin-top(
          :advance="advanceSwitch"
          :noResizeSync="noResizeSync"
          v-if="checkedMetadata && checkedMetadata.service_code === 'pool'"
      )
          div.full-height(slot="tableContainer")
              el-row.flex
                el-tooltip(v-btn-privilege="serviceCode+'_'+btn.button_code" v-for="(btn, index) in nodeAllActions" :key="index" :content="btn.label" placement="bottom")
                    el-button.circle-btn.ucmp-service-action(circle plain :type="btn.type" :icon="btn.icon" size="mini" :disabled="buttonsDisabed[btn.name]" @click="operationClick(btn)")
              el-table.f5-calc-height.margin-top(
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
              el-dialog(v-if="selHost.isShow" title="选择云主机" :visible.sync="selHost.isShow" @close="close" width="800px")
                TableSelect(ref="ecsTable" :config="dialogConfig" :columns="dialogColumns" :selectedList.sync="selectedList"
                :isF5FormItem="true")
                div.d-flex.margin-top(v-if="copyDetailInfo.loadBalancingMode === 'priority'")
                  label.margin-right 请选择主服务器
                  el-select(v-model="mainNode" size="mini")
                          el-option(v-for="item in selectedList" :key="item.instance_id" :value="item.instance_id" ::label="item.instance_name")
                div.dialog-footer(slot="footer")
                    el-button(@click="close()" size="small") 取消
                    el-button(type="primary" @click="selectEcs" size="small" :loading="saveLoading" :disabled="!selectedList.length") 保存
      InstanceChildDetail(
        v-else
        :checkedInstanceId="checkedInstanceId"
        :checkedProviderId="checkedProviderId"
        :checkedMetadata="checkedMetadata"
        :metadata="metadata"
        :hasSelection="false"
      )
</template>

<script>
import frontEndCfg from '@mock/metadata/metadata.config'
import { mapGetters } from 'vuex'
import OperatorPanel from '@/components/console/OperatorPanel'
import MetadataUtils from '@server/metadata.utils'
import Api from '@api'
import TableSelect from '@/components/common/TableSelect'
import InstanceChildDetail from './childService/InstanceChildDetail'

const columns = [
  { prop: 'instance_name', label: '名称' },
  { prop: 'instance_id', label: 'ID' },
  { prop: 'ip', label: '地址' },
  { prop: 'port', label: '端口' },
  { prop: 'major', label: '优先级' },
  { prop: 'status', label: '状态' }
]
const infoDetailMap = {
  f5PoolId: '资源ID',
  f5PoolName: '名称',
  loadBalancingMode: '负载均衡算法',
  parent: '健康检查算法',
  send: '健康检查URL',
  receive: '返回值'
}
const nodeAllActions = [
    {
      name: 'add',
      button_code: 'pool_increase',
      label: '添加节点',
      icon: 'ucmp-icon-plus'
    },
    {
      name: 'reduce',
      button_code: 'pool_reduce',
      label: '减少节点',
      icon: 'ucmp-icon-console-minus'
    },
    {
      name: 'synchro',
      button_code: 'pool_synchro',
      label: '同步',
      icon: 'ucmp-icon-process-convert'
    }
  ]
export default {
  props: {
    extendCode: {
      type: String,
      default: ''
    },
    serviceCode: {
      type: String,
      default: ''
    }
  },
  $_veeValidate: {
    validator: 'new'
  },
  data () {
    return {
      columns: columns,
      tableData: [],
      isLoading: false,
      noResizeSync: false,
      advanceSwitch: true,

      operatingInstances: null,
      selectedInstances: [],
      checkedColumns: [],
      selHost: {
        isShow: false
      },
      dialogColumns: [
        { label: '云主机名称', prop: 'instance_name' },
        { label: 'ID', prop: 'instance_id' },
        { label: 'IP地址', prop: 'ip', key: 'selectIp', isEdit: true, type: 'select' },
        { prop: 'port', key: 'port', isEdit: true, label: '端口', type: 'number', min: 1, max: 65535, precision: 0, step: 1 }
      ],
      dialogConfig: {
        search: true,
        searchKey: 'instance_name',
        searchPlaceholder: '请输入主机名',
        multiple: false, // 是否多选
        unique: 'instance_id',   // 能确定唯一数据的key
        api: '/f5/f5Pool/ecs/list',
        params: {
          offset: 1,
          limit: 10
        },
        listRoot: 'list',
        frontPagination: false,
        pagination: true
      },
      selectedList: [],
      infoDetailMap: infoDetailMap,
      detailInfo: {},
      copyDetailInfo: {},
      selectHostParam: [],
      operationBtn: {},
      mainNode: '',
      modifiedInstance: {},
      nodeAllActions: nodeAllActions,
      // 保存按钮loading配置
      saveLoading: false
    }
  },
  computed: {
// 从store里获取存贮的数据
    ...mapGetters([
      'metadata',
      'checkedInstanceId',
      'checkedProviderId'
    ]),
    filteredDetailInfo () {
        let temp = JSON.parse(JSON.stringify(this.detailInfo))

        // UCMP3-1225 F5显示优化,只有http算法是，显示这两个字段
        if (temp.parent !== 'http') {
          delete temp.receive
          delete temp.send
        }
        return temp
    },
    instanceConfig () {
      return MetadataUtils.getInstanceConfig(frontEndCfg, this.extendCode)
    },
    checkedMetadata () {
      return MetadataUtils.getCheckedMeta(this.metadata, this.extendCode)
    },
    allActions () {
      return MetadataUtils.getActionBtns(this.checkedMetadata, this.instanceConfig)
    },
    justSynchroBasicBtn () {
      return this.allActions.iconGroup && this.allActions.iconGroup.filter(action => action.name === 'synchro')
    },
    justSynchroAdvancedBtns () {
      return this.allActions.moreGroup && this.allActions.moreGroup.filter(action => action.name === 'synchro')
    },
    /**
     * @description Node操作机器按钮的禁用条件,其中启动和停止操作与
     *  选择的服务实例数量和服务实例的状态有关特殊处理
     */
    buttonsDisabed () {
      let result = {}
      // 判断选择操作服务实例的数量（元数据中的操作属性multiple为true才可以操作多个服务实例）
      let selectedLen = this.selectedInstances.length
      this.nodeAllActions.forEach((item) => {
        // F5 pool添加节点无置灰限制
        // 减少节点时,1、需要判断是否支持多选批量操作
        //           2、列表中所剩节点数据不得少于两条
        //           3、列表中所剩余节点中必须要有主节点
        if (item.name === 'reduce') {
          // 处理多选
          if (selectedLen > 1)
            result[item.name] = item.multiple ? false : true
          else if (selectedLen === 1) result[item.name] = false
          else result[item.name] = true
          // 处理列表中剩余情况
          if (selectedLen) {
            let leftNodes = this.tableData.filter(node => !this.selectedInstances.includes(node))
            result[item.name] = leftNodes.length > 1 ? (this.copyDetailInfo.loadBalancingMode === 'priority' && !leftNodes.find(val => val.major) ? true : false) : true
          }
        } else if (item.name === 'add') {
          // bug UCMP3-614 F5实例是负载均衡算法的时候，存在两个问题，见截图描述
          result[item.name] = this.copyDetailInfo.loadBalancingMode && this.copyDetailInfo.loadBalancingMode === 'priority' && this.tableData.length === 2 ? true : false
        }
      })

      return result
    },
    // 元数据项数据
    metaItem () {
      return this.checkedMetadata
    },
    // 前端配置
    fontendConfig () {
      // 筛选得到前端的配置
      return this.instanceConfig
    }
  },
  methods: {
    init () {
      // 获取F5_pool 详情
      if (this.checkedMetadata && this.checkedMetadata.service_code === 'pool') {
        this.getF5PoolDetail()
        this.getNodeListData({syncFlag: true})
      }
    },
    getF5PoolDetail () {
      Api.get('getF5PoolDetail', { _f5Id: this.checkedInstanceId }, true).then(
        res => {
          // bug UCMP-1251F5 pool信息不正确，见截图
          if (res) {
            this.copyDetailInfo = res
             this.modifiedInstance = res
            this.detailInfo = this.handleGetF5Data(res)
            this.dialogConfig.params = Object.assign({}, this.dialogConfig.params, {pool_id: this.detailInfo.f5PoolId})
          }
        }
      )
    },
    handleGetF5Data (response) {
      let res = JSON.parse(JSON.stringify(response))
      if (res && res.loadBalancingMode) {
        let pool = this.metadata.find(item => item.service_code === 'pool')
        if (pool && Array.isArray(pool.attribute)) {
          // 负载均衡算法
          let load_balancing_mode = pool.attribute.find(attr => attr.key === 'load_balancing_mode')
          let findLoad = null
          if (load_balancing_mode && Array.isArray(load_balancing_mode.enum))
            findLoad = load_balancing_mode.enum.find(loadBal => loadBal.id === res.loadBalancingMode)
          findLoad && (res.loadBalancingMode = findLoad.name)
          // 健康检查算法
          let parent_mode = pool.attribute.find(attr => attr.key === 'parent')
          let findParent = null
          if (parent_mode && Array.isArray(parent_mode.enum))
            findParent = parent_mode.enum.find(loadBal => loadBal.id === res.parent)
          findParent && (res.parent = findParent.name)
        }
      }
      // UCMP3-1572【控制台】在F5详情的pool页面，pool的名称显示的不正确
      res && res.f5PoolName && (res.f5PoolName = res.f5PoolName.replace(/^\/Common\//, ''))
      res && res.parent && (res.parent = res.parent.replace(/^\/Common\//, ''))
      return res
    },
    getNodeListData (param) {
      let defaultParam = {
        _f5Id: this.checkedInstanceId
      }
      this.isLoading = true
      Api.get('getF5NodeListData', Object.assign({}, defaultParam, param), true).then(
        res => {
          if (Array.isArray(res)) {
            this.tableData = res
            this.isLoading = false
          }
        },
        () => { this.isLoading = false }
      )
    },

    /**
     * @description 挂载云主机对话框确定事件
     */
    selectEcs () {
      let selectedArray = this.$refs.ecsTable.getSelection()
      let findNode = selectedArray.find(item => !item.ip || !item.port)

      if (findNode) {
        this.$notify({
          type: 'warning',
          message: '请为所选服务器配置IP地址或端口号！'
        })
        return
      }
      this.selectHostParam = selectedArray.map(item => {
        return {
          instance_id: item.instance_id,
          instance_name: item.instance_name,
          ip: item.selectIp,
          port: item.port || '',
          major: item.instance_id === this.mainNode ? 1 : 0
        }
      })
      // 确保发请求时method和url存在
      let param = {}
      // Request method is POST
      param.ecsList = this.selectHostParam
      param.poolId = this.detailInfo.f5PoolId
      param.instance_ids = this.detailInfo.f5PoolId
      // bug UCMP3-632 F5实例增加节点页面优化
      // 发送请求之前保存按钮loading
      this.$validator.validate().then(result => {
          if (result) {
            this.saveLoading = true
            Api.post('f5NodeAddOper', param, true).then(
              res => {
                this.$notify.success('操作成功')
                this.close()
                if (this.ifRouteToOrder(res))
                  this.$router.push('/orders')
                else
                  this.getNodeListData({syncFlag: true})
              },
              () => {
                this.saveLoading = false
              }
            )
          }
      })
    },
    close () {
      this.selHost.isShow = false
      // UCMP3-862 F5实例，挂载主机，挂载一次之后，再次点击挂载按钮，弹出来的保存按钮一直是loading状态，无法操作
      this.saveLoading = false
    },
    handleSelectionChange (val) {
      // 表格选择列勾选变化处理(操作按钮的禁用是否有关)
      this.selectedInstances = val
      this.operatingInstances = this.selectedInstances
    },
    operationClick (btn) {
      if (btn.name === 'reduce') {
          let param = {}
          // Request method is POST
          param.ecsList = this.selectedInstances
          param.poolId = this.detailInfo.f5PoolId
          param.instance_ids = this.detailInfo.f5PoolId

          Api.post('f5NodeReduceOper', param, true).then(
            res => {
              this.$notify.success('操作成功')
              if (this.ifRouteToOrder(res))
                this.$router.push('/orders')
              else
                this.getNodeListData({syncFlag: true})
            }
          )
      } else if (btn.name === 'add') {
        this.selHost.isShow = true
        // clear cache date
        this.selectedList = []
        this.mainNode = ''
        this.operationBtn = btn
      } else if (btn.name === 'synchro') {
        // 同步操作
          let param = {
            f5Id: this.checkedInstanceId
          }

          Api.get('f5NodeAsyncOper', param, true).then(
            res => {
              this.$notify.success('操作成功')
              this.getNodeListData({syncFlag: true})
            }
          )
      }
    },
    operatorSuccess () {
      this.getF5PoolDetail()
    },
    ifRouteToOrder (res) {
      if (!res) return res
      return Array.isArray(res) && res.some(item => item.status === 'approving')
    }
  },
  components: {
    OperatorPanel,
    TableSelect,
    InstanceChildDetail
  },
  created () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
</style>
