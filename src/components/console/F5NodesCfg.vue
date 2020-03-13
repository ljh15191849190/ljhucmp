<template lang="pug">
  el-form-item(label="节点状态")
    el-table(
      :data="tableData"
      v-loading="isLoading"
      element-loading-spinner="ucmp-icon-loading"
      border
    )
      el-table-column(
        :prop="column.prop"
        v-for="column in columns"
        :key="column.prop"
        :label="column.label"
        :width="column.width"
      )
        template(slot-scope="scope")
          el-switch(
            v-if="column.prop === 'status'"
            v-model="scope.row[column.prop]"
            active-value="enabled"
            inactive-value="disabled"
            @change="change"
          )
          span(v-else) {{scope.row[column.prop]}}            
</template>

<script>
/**
 * @description 修改F5资源组件，修改节点状态使用
 */

import Api from '@api'

const columns = [
  { prop: 'instance_name', label: '名称' },
  { prop: 'ip', label: '地址' },
  { prop: 'port', label: '端口' },
  { prop: 'major', label: '优先级' },
  { prop: 'status', label: '状态' }
]

export default {
  props: ['checkedInstance', 'tableForms', 'poolDetail'],
  data () {
    return {
      columns: columns,
      tableData: [],
      isLoading: false,
      // copy 节点数据
      copyNodes: [],
      defaultFormData: {}
    }
  },

  methods: {
    // 获取节点列表
    getNodeListData () {
      let param = {
        _f5Id: this.checkedInstance.f5_id,
        syncFlag: true
      }
      this.isLoading = true
      Api.get('getF5NodeListData', param, true).then(
        res => {
          if (Array.isArray(res)) {
            this.tableData = res
            res.forEach(item => {
              item.instance_id && (item.ecs_instance_id = item.instance_id)
            })
            // bug UCMP3-614 F5实例是负载均衡算法的时候，存在两个问题，见截图描述
            let findMajorNode = res.find(item => item.major)
            if (findMajorNode) {
                // UCMP3-4206 【控制台--F5】修改健康检查算法，修改节点状态，弹出框中携带的数据不正确（见截图）
                // 保持pool_ecs等同PoolDynamicForm的mountEcsList的id
              this.defaultFormData = Object.assign({}, this.defaultFormData, {pool_ecs: findMajorNode.instance_id + (findMajorNode.port ? (':' + findMajorNode.port) : '')})
              this.$emit('update:poolDetail', this.defaultFormData)
            }
            this.$emit('update:tableForms', res)
            this.copyNodes = JSON.parse(JSON.stringify(res))
            this.isLoading = false
          }
        },
        () => { this.isLoading = false }
      )
    },
    // 获取pool详情信息
    getF5PoolDetail () {
      Api.get('getF5PoolDetail', { _f5Id: this.checkedInstance.f5_id }, true).then(
        res => {
          if (res) {
            // pool的默认信息处理
            let defaultFormData = {}
            Object.keys(res).forEach(item => {
              item === 'loadBalancingMode' && res[item] && (defaultFormData.load_balancing_mode = res[item])

              // UCMP3-4106【控制台--F5】修改健康检查算法，弹出框中的值显示不正确（见截图）
              // 所有的_和-是对等的，同步过来的都是_ 元数据是-，此处做替换
              item === 'parent' && res[item] && (defaultFormData[item] = res[item].replace(/_/g, '-'))
              if ((item === 'send' || item === 'receive') && res[item])
                defaultFormData[item] = res[item]
            })
            this.defaultFormData = Object.assign({}, this.defaultFormData, defaultFormData)
            this.$emit('update:poolDetail', this.defaultFormData)
          }
        }
      )
    },
    // 更新tableForm
    change () {
      this.$emit('update:tableForms', this.tableData)
    }
  },

  created () {
    // 获取节点数据
    this.getNodeListData()
    // 获取pool详情信息
    this.getF5PoolDetail()
  }
}
</script>
