<template lang="pug">
    div.full-container(slot="content")
        div.d-flex.full-height
            div.border-right.full-height.tree-width
                span.basicInfo {{quotaTree.title}}
                el-input.margin-top(v-model="searchKey" clearable size="small" placeholder="请输入组织机构名称搜索")
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
            div.margin-top.quota-container.content-padding
                el-row.d-flex.align-items-flexstart(v-for="(attr, index) in quotaData" :key="index")
                    el-col(:span="4")
                        span.textlable {{attr.name}}
                    el-col.flex-InputNum(:span="18")
                        div.d-flex.align-items-center.padBottom(v-for="(item, index) in attr.quota_conf" :key="index")
                            div.quota-name
                                el-tooltip(v-if='item.quotaLabel&&item.quotaLabel.length>5' :content="item.quotaLabel" placement="top-end")
                                    span {{item.quotaLabel}}
                                span(v-else) {{item.quotaLabel}}
                            el-input-number.marginleft(
                                v-model="item.value"
                                controls-position="right"
                                :min="0"
                                :max="9999999"
                                :precision="0" 
                            )
                            div.input-group-append.tips-type(v-if="item.unit")
                                div.input-unit-text {{item.unit}}
                                el-tooltip(v-if="item.tips" :content="item.tips" placement="right")
                                    i.ucmp-icon-question.theme-color.Bigfont
                            div.quota-name.marginleft50(v-if="item.key !== 'snapshot'")
                                el-tooltip(v-if='item.usageLabel&&item.usageLabel.length>5' :content="item.usageLabel" placement="top-end")
                                    span {{item.usageLabel}}
                                span(v-else) {{item.usageLabel}}
                            div.quota-data(v-if="item.key !== 'snapshot'")
                                el-progress.progress-adjust.marginleft(
                                    :text-inside="true" 
                                    :stroke-width="20" 
                                    :color="item.percentage <= 50 ? '#61c359' : (item.percentage <= 80 ? '#ffaa00' : '#e64550')"
                                    :percentage="item.percentage")
                            //- 兼容页面样式
                            div.quota-name-place(v-if="item.key === 'snapshot'")
                            div.quota-data-place(v-if="item.key === 'snapshot'")
                                div.inner
                div.btn-save.d-flex.justify-content-center
                    el-button(v-btn-privilege="'save_org_quota'" type="warning" size="small" @click="saveQuota") 保存

</template>

<script>
/**
 * @description 配额管理
 */

import Api from '@api'

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
      // 所有服务的配额项数据
      quotaData: [],
      saveServiceQuotas: [],
      objectId: '',
      // 保存按钮禁用
      isSave: false
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
      // 获取组织机构
      Api.get('getorgTreeAuthor', {}, true).then(
        res => {
          // 处理数据 
          this.quotaTree.data = this.handleQuotaTreeData(res.data)
          this.quotaTree.loading = false
        },
        () => {
          this.quotaTree.loading = false
        }
      )
    },
    // 处理配额树的数据
    handleQuotaTreeData (data) {
        // 配置只涉及组织和业务，过滤数据
        data && data.forEach(item => {
            item.label = item.org_name
            item.type = 'org'
            item.children = item.sub_orgs
            if (item.business && item.business.length) {
                item.business.forEach(business => {
                    business.id = business.business_id
                    business.label = business.business_name
                    business.type = 'business'
                })
                item.children = item.sub_orgs.concat(item.business)
            }

            if (item.sub_orgs && item.sub_orgs.length) {
                // 递归处理子组织
                this.handleQuotaTreeData(item.sub_orgs)
            }
        })
        return data
    },
    // 树节点点击时处理(保存选择树的id和类型)
    treeNodeClick (node) {
      this.objectId = node.id
      // 清除掉别的节点配额
    //   this.clearQuotaConf()
      // 获取默认配额资源
      this.getResourceQuota(node.id)
    },
    // 保存配额
    saveQuota () {
      // 根据是否配额保存各服务的配置
      this.saveQuotaConfig()
      if (this.saveServiceQuotas.length) {
        this.quotaAttrLoading = true
        let order_item = {}
        order_item.objectType = 'org'
        order_item.objectId = this.objectId
        order_item.data = this.saveServiceQuotas
        
        Api.post('SaveQuota', order_item, true).then(
            () => {
              this.$notify({
                  title: '通知',
                  type: 'success',
                  message: '保存成功!'
              })
              this.quotaAttrLoading = false
              this.getResourceQuota(this.objectId)
            },
            () => {
              this.quotaAttrLoading = false
            }
          )
        }
    },
    // 生成配额
    saveQuotaConfig () {
      this.saveServiceQuotas = []
      this.quotaData.forEach(service => {
          let quotaItemObj = {}
          quotaItemObj.service_code = service.service_code
          quotaItemObj.quota_setting = {}
          service.quota_conf.forEach(attr => {
              quotaItemObj.quota_setting[attr.key] = attr.value ? attr.value : null
          })
          this.saveServiceQuotas.push(quotaItemObj)
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
    // 获取资源配额
    getResourceQuota (id) {
      this.quotaAttrLoading = true
      let params = Object.assign({}, { objectType: 'org', objectId: id })
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
          this.quotaData.forEach(service => {
            if (service.service_code === res.service_code) {
              service.quota_conf.forEach(attr => {
                  for (let i in res.quota_setting) {
                      if (attr.key === i) {
                          attr.value = res.quota_setting[i].quota === null ? undefined : res.quota_setting[i].quota
                        //   attr.value = res.quota_setting[i].quota
                          attr.used = res.quota_setting[i].usage
                          attr.percentage = res.quota_setting[i].quota ? parseInt((res.quota_setting[i].usage + res.quota_setting[i].child_occupation) / res.quota_setting[i].quota * 100, 10) : 0
                      }
                  }
              })
            }
          })
        })
      }
    },
    // 前台过滤树
    filterNode (value, data) {
        if (!value) return true
        return data.label.indexOf(value) !== -1
    },
    
    getAttr () {
        Api.get('getresourceQuota', {}, true).then(res => {
            if (res) {
                let resourceQuota = res
                resourceQuota.forEach(item => {
                    let result = []
                    item.quota_conf.forEach(val => {
                        let obj = {}
                        obj.key = val.attribute || val.type
                        obj.quotaLabel = val.label + '配额'
                        obj.usageLabel = val.label + '使用量'
                        obj.unit = val.unit
                        obj.tips = val.tips
                        obj.defaultValue = undefined
                        obj.value = undefined
                        obj.used = 0
                        obj.total = 0
                        obj.percentage = 0
                        result.push(obj)
                    })
                    item.quota_conf = result
                })
                this.quotaData = resourceQuota
            }
        })
    }
  },
  computed: {

  },
  created () {
    // 初始化
    this.getAttr()
    this.init()
  },
  watch: {
    // 检测数搜索添加变化
    searchKey (val) {
      this.$refs.quotaTree.filter(val)
    }
  }
}
</script>

<style lang="scss" scoped>
.padBottom{
    padding-bottom: 10px;
}
.flex-InputNum{
    display: flex;
    flex-direction: column;
    align-items: left;
}
.textlable{
    font-size: 15px;
    line-height: 45px;
}
.align-items-flexstart{
    flex-direction: flex-start;
}
.tree-width {
  width: 350px;
  padding-right: 20px;
}
.quota-container {
  width: calc(100% - 300px);
  height: 100%;
}
.content-padding {
  padding-left: 40px;
  padding-top: 10px;
  height: calc(100% - 55px);
  overflow-y: auto;
}
.basicInfo {
  font-size: 16px;
}
.marginleft{
    margin-left: 10px;
}
.quota-name {
  margin-right: 16px;
  width: 160px;
  font-size: 14px;
  color: #333;
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.marginleft50{
    margin-left: 50px;
}

.btn-save {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.input-unit-text {
    width: 41px;
    padding: 7px 7px;
    margin-bottom: 0px;
    font-size: 12px;
    line-height: 2;
    color: #495057;
    text-align: center;
    white-space: nowrap;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
}
.tips-type{
    position: relative;
    .Bigfont{
        position: absolute;
        left: 45px;
        top:5px;
        font-size: 16px;
    }
}
.quota-name-place {
    width: 160px;
    height: 21px;
    margin-right: 16px;
    margin-left: 50px;
}
.quota-data-place {
    .inner {
        width: 160px;
        height: 20px;
    }
}
</style>

