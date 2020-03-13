<template lang="pug">
  UcmpTableContainer(:advance="advanceSwitch" :pagination="pagination" :filterItems="filterItems" @size-change="handleSizeChange" @current-change="handleCurrentChange")
      div.d-flex(slot="basic-filter")
        el-button(type="primary" size="small" @click="") 还原
        el-button(type="primary" size="small" @click="") 删除
        el-button(type="primary" size="small" @click="") 编辑
        span.border-left.margin-left
        label.margin-left 快照名称
          el-input.input-width.margin-left(size="small" v-model="shapshotName")
        label.margin-left 状态
          el-select.margin-left(size="small" v-model="status" placeholder="请选择")
            el-option(v-for="item in options" :key="item.value" :label="item.label" :value="item.value")
        div.d-inline-block.margin-left
          span 创建时间
          el-date-picker.margin-left(size="small" v-model="createTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期")
      div.full-height(slot="tableContainer")
        el-table(:data="tableData" border)
          el-table-column(type="selection" width="45")
          el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
      el-button(slot="filter-btns" org="primary" size="small" icon="el-icon-search" type="primary") 查询
</template>
<script>
import EscDetailSnapshot from '@mock/esc/esc.detail.snapshot.mock'
// import Api from '@api/api'

export default {
  data () {
    return {
       advanceSwitch: false,
       pagination: {
            index: 1,
            count: 1,
            size: 20
       },
       shapshotName: '',
       status: '',
       createTime: '',
       options: [
         {
          value: 'creating',
          label: '创建中'
        }, {
          value: 'sucess',
          label: '创建成功'
        }, {
          value: 'fail',
          label: '创建失败'
        }
       ],
       columns: [
           { prop: 'name', label: '快照名称', width: 100 },
           { prop: 'type', label: '类型', width: 100 },
           { prop: 'config', label: '配置' },
           { prop: 'desc', label: '描述' },
           { prop: 'state', label: '状态' },
           { prop: 'createTime', label: '创建时间' },
           { prop: 'creater', label: '创建人' }
       ],
       tableData: EscDetailSnapshot,
       filterItems: []
    }
  },
  methods: {
    /**
     * @description 默认每页查询条数发生变化
     */
    handleSizeChange () {

    },
    handleCurrentChange () {

    }
  },
  computed: {
  },
  components: {
  },
  created () {
    // Api.get('escList', {name: 'ss', ss: 'asd', id: 123}, true).then(
    //     res => {

    //     }
    // )
  }
}
</script>
<style lang="scss" scoped>
</style>

