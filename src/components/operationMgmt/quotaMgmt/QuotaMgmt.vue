<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.d-flex.full-height
                div.border-right.full-height.tree-width
                    span.basicInfo {{quotaTree.title}}
                    el-input.margin-top(v-model="searchKey" placeholder="请输入组织名或应用名搜索")
                    el-tree.margin-top.tree-height(
                        :data="quotaTree.data"
                        :props="quotaTree.defaultProps"
                        :render-content="renderContent"
                        :highlight-current="quotaTree.isHighlight"
                        :node-key="quotaTree.nodeKey"
                        @node-click="treeNodeClick"
                        ref="quotaTree"
                        v-loading="quotaTree.loading"
                        element-loading-spinner="ucmp-icon-loading"
                        :expand-on-click-node="false"
                        :filter-node-method="filterNode"
                    )
                div.no-padding-left.no-padding-right.quota-container
                    el-tabs.adjust-container(v-model="activeTab" @tab-click="changeTab" v-loading="quotaAttrLoading" element-loading-spinner="ucmp-icon-loading")
                        el-tab-pane.content-padding(
                            v-for="(item, idx) in servicesData"
                            :key="item.name"
                            :label="item.label"
                            :name="item.name"
                        )
                            div.d-flex.flex-wrap(v-for="(attr, index) in item.quotaAttr" :key="index")
                                div.d-flex.align-items-center.margin-bottom.margin-right-120
                                    div.quota-name
                                        span {{attr.quotaLabel}}
                                    div.quota-data
                                        div.input-group
                                            //- bug UCMP-1602【配额管理】设置云主机、云硬盘的配额数量位数超过10位时，超出设置范围，但页面只显示温馨提示，没有具体提示信息
                                            el-input-number(
                                                v-model="attr.value"
                                                controls-position="right"
                                                :min="0"
                                                :max="9999999"
                                                :disabled="attr.checkbox"
                                                @change="inputNumberChange(attr)"
                                            )
                                            div.input-group-append(v-if="attr.unit")
                                                span.input-group-text.unit-limit {{attr.unit}}
                                            div.d-flex.align-self-center.flex-column.margin-left
                                                el-checkbox(v-model="attr.checkbox" label="不限制" @change="handleLimit(attr)")
                                div.d-flex.align-items-center.margin-bottom
                                    div.quota-name
                                        span {{attr.usageLabel}}
                                    div.quota-data.d-flex.position-relative
                                        el-progress.resource-progress.progress-adjust(
                                            :stroke-width="20"
                                            :show-text="false"
                                            :percentage="attr.percentage"
                                            :color="attr.percentage <= 50 ? '#61c359' : (attr.percentage <= 80 ? '#ffaa00' : '#e64550')"
                                        )
                                        span.margin-left.position-absolute {{attr.used + (attr.total > 0 ? '/' + attr.total : '') + (attr.unit ? attr.unit : '')}}
                    div.btn-save.border-top.d-flex.justify-content-end
                        el-button(type="warning" size="small" @click="saveQuota" :disabled="isSave") 保存

</template>

<script>
/**
 * @description 配额管理
 */

import Api from '@api'
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      breadcrumbItems: [{ 'prop': '', 'label': '配额管理' }],
      // 搜索树的key值
      searchKey: '',
      // 树配置
      quotaTree: {
        title: '配额对象',
        data: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        loading: false,
        // 选中后高亮
        isHighlight: true,
        nodeKey: 'id'
      },
      // 页签激活项
      activeTab: '',
      // 资源配额loading
      quotaAttrLoading: false,
      // 所有服务的配额项数据
      servicesData: [],
      // 保存参数
      saveParam: {
        'targetType': '',
        'targetId': '',
        'serviceQuotas': []
      },
      // 保存按钮禁用
      isSave: true,
      // 保存配额项修改的数量,大于0时才可保存
      modifyQuotaNum: 0
    }
  },
  methods: {
    init () {
      // 获取配额对象树
      this.getQuotaTree()
    },
    // 获取配额对象树数据
    getQuotaTree (param) {
      this.quotaTree.loading = true
      let params = Object.assign({}, { limit: 99999, page: 1 }, param)
      // 获取组织机构
      Api.get('quotaTree', params, true).then(
        res => {
          // 处理数据
          this.quotaTree.data = this.handleQuotaTreeData(res)
          this.quotaTree.loading = false
          if (this.quotaTree.data && this.quotaTree.data.length) {
            // 默认以树的第一个子树展示配额
            this.$nextTick(() => {
                this.$refs.quotaTree.setCurrentNode(this.quotaTree.data[0])
            })
            // 设置默认保存配额的参数
            this.treeNodeClick(this.quotaTree.data[0])
          }
        },
        () => {
          this.quotaTree.loading = false
        }
      )
    },
    // 处理配额树的数据
    handleQuotaTreeData (data) {
      // 数据格式为组织、业务(应用)、人
      // 配额只设置组织和应用，过滤数据
      data && data.forEach(item => {
        item.label = item.org_name
        item.type = 'org'
        let apps = []
        if (item.business && item.business.length) {
          item.business.forEach(business => {
            business.apps && business.apps.forEach(app => {
              app.id = app.app_id
              app.label = app.app_name
              app.type = 'app'
            })
            // 合并所有业务的应用
            business.apps && business.apps.length && (apps = apps.concat(business.apps))
          })
        }

        // 应用显示在同级的组织机构前面
        item.children = apps.length ? apps.concat(item.subOrgs) : item.subOrgs

        if (item.subOrgs.length) {
          // 递归处理子组织
          this.handleQuotaTreeData(item.subOrgs)
        }
      })
      return data
    },
    // 树节点点击时处理(保存选择树的id和类型)
    treeNodeClick (node) {
      // 切换节点时及时处理对象的类型和id
      this.saveParam.targetType = node.type
      this.saveParam.targetId = node.id
      // 清除掉别的节点配额
      this.clearQuotaConf()
      // 获取默认配额资源
      this.activeTab && this.activeTab !== '0' && this.getResourceQuota(this.activeTab)
    },
    // 生成配额配置
    generateQuotaConf (quotaAttr) {
      let result = []
      if (quotaAttr) {
        quotaAttr.forEach(item => {
          let attr = {}
          attr.key = item.key
          attr.quotaLabel = item.label + '配额'
          attr.usageLabel = item.label + '使用量'
          attr.unit = item.unit
          attr.defaultValue = undefined
          attr.value = undefined
          attr.hasValChange = false
          attr.checkbox = false
          attr.used = 0
          attr.total = 0
          attr.percentage = 0
          result.push(attr)
        })
      }
      return result
    },
    // 保存配额
    saveQuota () {
      // 根据是否配额保存各服务的配置
      this.saveQuotaConfig()
      // 有配额才保存
      // bug #UCMP-481 配额界面，点击保存，loading bar出现的不及时
      if (this.saveParam.serviceQuotas.length) {
        this.quotaAttrLoading = true
        Api.post('resourceQuota', this.saveParam, true).then(
            () => {
              // The notification result
              this.$notify({
                  title: '通知',
                  type: 'success',
                  message: '保存成功!'
              })
              // 清除修改数据
              this.clearQuotaConf()
              // 刷新配额资源
              this.activeTab && this.getResourceQuota(this.activeTab)
            },
            () => {
              this.quotaAttrLoading = false
            }
          )
        }
    },
    // 生成配额
    saveQuotaConfig () {
      // 保存前先清除this.saveParam.quotas的残留数据
      this.saveParam.serviceQuotas = []
      // 若当前服务有配额则存入
      this.servicesData.forEach(service => {
        // 只保存配额修改的对应服务
        let filterAttr = service.quotaAttr.filter(attr => attr.defaultValue !== attr.value)
        // 服务存在配额时
        if (filterAttr.length) {
          let quotaItemObj = {}
          quotaItemObj.serviceCode = service.service_code
          quotaItemObj.quotaDetail = []
          filterAttr.forEach(attr => {
            let quotaDetail = {}
            quotaDetail.key = attr['key']
            quotaDetail.count = (attr.value === undefined ? null : attr.value)
            quotaItemObj.quotaDetail.push(quotaDetail)
          })
          this.saveParam.serviceQuotas.push(quotaItemObj)
        }
      })
    },
    // 树渲染特殊处理
    renderContent (h, { node }) {
      let spanLabel = ''
      if (!node.isLeaf) {
        spanLabel = <i class="ucmp-icon-quota-close-file" />
        if (node.expanded)
          spanLabel = <i class="ucmp-icon-quota-open-file" />
      } else {
        if (node.data.type === 'org') spanLabel = <i class="ucmp-icon-device-org" />
        else spanLabel = <i class="ucmp-icon-dashboard-app" />
      }
      return (
        <span>
          {spanLabel}
          <span class="range-margin-left">{node.label}</span>
        </span>)
    },
    // 限额切换处理(设置值和是否可以保存)
    handleLimit (attr) {
      // Restore default value
      attr.value = attr.value !== undefined ? undefined : attr.defaultValue
      if (attr.hasValChange && attr.value === attr.defaultValue) {
        attr.hasValChange = false
        this.modifyQuotaNum && this.modifyQuotaNum--
      }
      if (!attr.hasValChange && attr.value !== attr.defaultValue) {
        attr.hasValChange = true
        this.modifyQuotaNum++
      }
      this.isSave = this.modifyQuotaNum ? false : true
    },
    // 限额值改变时处理(是否可以保存)
    inputNumberChange (attr) {
      let copyValue = attr.value
      if (attr.hasValChange && copyValue === attr.defaultValue) {
        attr.hasValChange = false
        this.modifyQuotaNum && this.modifyQuotaNum--
      }
      if (!attr.hasValChange && copyValue !== attr.defaultValue) {
        attr.hasValChange = true
        this.modifyQuotaNum++
      }
      this.isSave = this.modifyQuotaNum ? false : true
    },
    // 切换页签时获取资源使用量
    changeTab (tab) {
      tab && this.getResourceQuota(tab.name)
    },
    // 获取资源配额
    getResourceQuota (service_code) {
      this.quotaAttrLoading = true
      let params = Object.assign({}, { target_id: this.saveParam.targetId, target_type: this.saveParam.targetType, service_code: service_code })
      Api.get('resourceQuota', params, true).then(
        res => {
          // 处理对应服务的配额数据
          this.handleResourceQuota(res)
          this.quotaAttrLoading = false
        },
        () => {
          this.quotaAttrLoading = false
        }
      )
    },
    // 处理资源配额数据
    handleResourceQuota (data) {
      if (data && data.length) {
        data.forEach(res => {
          this.servicesData.forEach(service => {
            if (service.service_code === res.serviceCode) {
              service.quotaAttr.forEach(attr => {
                res.quotas && res.quotas.forEach(item => {
                  if (attr.key === item.key) {
                    // Handle switch tab
                    if (!attr.checkbox)
                      attr.defaultValue = attr.value = item.total >= 0 ? item.total : undefined
                    else attr.value = undefined
                    attr.used = item.usedCount
                    attr.total = item.total
                    attr.percentage = parseInt(item.usedCount / item.total * 100, 10)
                  }
                })
              })
            }
          })
        })
      }
    },
    // 从元数据集中获取服务
    getServiceData () {
      let metaItems = []
      if (this.metadata) {
        this.metadata.forEach(
          item => {
            // 元数据中过滤出来的配额属性
            let quotaAttr = []
            if (item.attribute)
              quotaAttr = item.attribute.filter(attr => attr.quota)

            if (quotaAttr.length) {
              let meta = {}
              meta.name = item.service_code
              meta.service_code = item.service_code
              meta.label = item.name
              meta.quotaAttr = this.generateQuotaConf(quotaAttr)
              metaItems.push(meta)
            }
          }
        )
      }
      // 设置页签默认激活项
      if (metaItems.length) {
        this.activeTab = metaItems[0].name
        // 获取默认配额资源
        this.activeTab && this.getResourceQuota(this.activeTab)
      }
      this.servicesData = metaItems
    },
    // 清除所有配额
    clearQuotaConf () {
      // 清除保存和修改的标识
      this.isSave = true
      this.modifyQuotaNum = 0
      this.servicesData.forEach(service => {
        service.quotaAttr.forEach(attr => {
          attr.defaultValue = undefined
          attr.value = undefined
          attr.hasValChange = false
          attr.checkbox = false
          attr.used = 0
          attr.total = 0
          attr.percentage = 0
        })
      })
    },
    // 前台过滤树
    filterNode (value, data) {
        if (!value) return true
        return data.label.indexOf(value) !== -1
    }
  },
  computed: {
    ...mapGetters([
      'metadata'
    ])
  },
  components: {
  },
  created () {
    // 初始化
    this.init()
    this.getServiceData()
  },
  watch: {
    // 检测元数据变化
    metadata (newVal, oldVal) {
      if (newVal === oldVal) return
      this.getServiceData()
    },
    // 检测数搜索添加变化
    searchKey (val) {
      this.$refs.quotaTree.filter(val)
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-width {
  width: 350px;
  padding-right: 20px;
}
.quota-container {
  width: calc(100% - 300px);
  height: 100%;
}
.adjust-container {
  height: calc(100% - 60px);
  min-height: 400px;
}
.content-padding {
  padding-left: 100px;
  padding-top: 40px;
  height: calc(100% - 55px);
  overflow-y: auto;
}
.basicInfo {
  font-size: 16px;
}
.quota-name {
  margin-right: 16px;
  width: 140px;
  font-size: 14px;
  color: #333;
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.quota-data {
  width: calc(100% - 150px);
}
.btn-save {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.margin-right-120 {
  margin-right: 120px;
}
.input-group-text {
  color: $fontTitleLight;
  background-color: #f9f9f9;
}
.unit-limit {
  width: 44px;
  display: flex;
  justify-content: center;
}
.progress-adjust {
  width: 150px;
  top: 25%;
}

.tree-height{
  height: calc(100% - 100px);
  overflow-y: auto;
}
</style>

