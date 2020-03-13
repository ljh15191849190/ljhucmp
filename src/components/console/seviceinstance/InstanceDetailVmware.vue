<template lang="pug">
  UcmpTableContainer(:advance="advanceSwitch" :pagination="pagination" :filterItems="filterItems" @size-change="handleSizeChange" @current-change="handleCurrentChange")
    div.d-flex(slot="basic-filter")
        div.clearfix
            div.float-left
                el-badge.margin-left(:value="12" class="item" v-for="state in states" :key="state.prop")
                    el-button(:type="state.type" size="mini" @click="setState(state.prop)") {{state.label}}
            div.float-right
                el-button.margin-left(size="small" icon="el-icon-edit" @click="") 确定
                el-button.margin-left(size="small" icon="el-icon-download" @click="") 导出
    div.full-height(slot="tableContainer")
        el-table(:data="tableData" border)
            el-table-column(type="selection" width="45")
            el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
</template>
<script>
import EscDetailVmware from '@mock/esc/esc.detail.vmware.mock'

import StatesMock from '@mock/esc/esc.states.mock'
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
       states: StatesMock,
       alarm: {
          warn: 0,
          danger: 0
       },
       columns: [
           { prop: 'category', label: '告警类别', width: 100 },
           { prop: 'org', label: '组织机构', width: 100 },
           { prop: 'system', label: '系统' },
           { prop: 'object', label: '告警对象' },
           { prop: 'strategyName', label: '告警策略名称' },
           { prop: 'level', label: '告警级别' },
           { prop: 'content', label: '告警内容' },
           { prop: 'time', label: '告警时间' },
           { prop: 'manner', label: '处理方式' },
           { prop: 'handleTime', label: '处理时间' },
           { prop: 'handler', label: '处理人' }
       ],
       tableData: EscDetailVmware,
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
    // Api.get('escList', {category: 'ss', ss: 'asd', id: 123}, true).then(
    //     res => {

    //     }
    // )
  }
}
</script>
<style lang="scss" scoped>
</style>

