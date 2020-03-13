<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container
                el-button.default-button(type="primary" size="small" icon="el-icon-plus" @click="handleOper('new')") 创建服务套餐
            UcmpTableContainer(:advance="advanceSwitch" :pagination="pagination" :filterItems="filterItems" @size-change="handleSizeChange" @current-change="handleCurrentChange")
                div.full-height(slot="tableContainer")
                    div.margin-bottom
                        el-button(:disabled="setCloudProviderDisabled" type="warning" plain size="small" @click="") 设置云厂商
                        el-button(:disabled="deleteDisabled" type="warning" plain size="small" @click="") 删除
                    el-table.panel-table(:data="tableData" border)
                        el-table-column(type="selection" width="45" prop="selectable" :selectable='checkboxInit')
                        el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label")
                        el-table-column(label="操作")
                            template(slot-scope="scope")
                                i.theme-color.column-name.margin-right(v-for="oper in operations" :class="oper.icon" :key="oper.type" :title="oper.title" @click="handleOper(oper.type, scope.row)")
                    el-dialog(:title="dialog.title" :visible.sync="dialog.show" @close="closeDialog")
                      el-form.margin-left(label-position="right" label-width="80px")
                        el-form-item(label="套餐名称")
                          el-input.input-width(size="small")
                        el-form-item(label="套餐描述")
                          el-input.input-width(size="small")
                        el-form-item(label="所属服务")
                          el-select(size="small" v-model="servicePackage")
                            el-option(v-for="item in servicePackageOpts" :key="item.value" :label="item.label" :value="item.value")
                        el-form-item(label="云厂商")
                          el-input.input-width(size="small" type="textarea")
                      div.dialog-footer(slot="footer")
                        el-button(@click="closeDialog()" size="small") 取消
                        el-button(type="primary" @click="" size="small") 保存
</template>

<script>
import EscCommonOptsMock from '@mock/esc/esc.common.options.mock'
import servicePackageListMock from '@/mock/operationMgmt/operMgmt.servicePackage.mock'
import MetadataUtls from '@server/metadata.utils'
import Config from '@mock/metadata/metadata.config'
import ServiceInstanceMixin from '@mixins/serviceInstance.mixin'
import { mapGetters } from 'vuex'
export default {
  mixins: [ServiceInstanceMixin],
  data () {
    return {
      breadcrumbItems: [{ prop: '', label: '服务套餐列表' }],
      advanceSwitch: false,
      pagination: {
        index: 1,
        count: 1,
        size: 20
      },
      // 所属服务下拉框
      servicePackage: 'all',
      servicePackageOpts: EscCommonOptsMock,
      columns: [
        { prop: 'packageName', label: '服务名称' },
        { prop: 'packageDesc', label: '服务描述' },
        { prop: 'serviceDefine', label: '所属服务' },
        { prop: 'cloudProvider', label: '云厂商' }
      ],
      tableData: servicePackageListMock,
      operations: [
        { type: 'view', icon: 'el-icon-view', title: '查看' },
        { type: 'edit', icon: 'el-icon-edit', title: '编辑' },
        { type: 'delete', icon: 'el-icon-delete', title: '删除' }
      ],
      filterItems: [],
      dialog: {
        title: '',
        show: false
      }
    }
  },
  methods: {
    /**
     * @description 默认每页查询条数发生变化
     */
    handleSizeChange () { },
    handleCurrentChange () { },
    // 设置表格的checkbox是否可选
    checkboxInit (row, index) {
      return row && row.selectable ? true : false
    },
    /**
    * @description 处理操作（创建、查看、编辑、删除）
    * @param {string} type 操作类型
    * @param {Object} row 当前表格行的数据
    */
    handleOper (type, row) {
      let dialog = this.dialog
      switch (type) {
        case 'new':
          // 处理创建
          dialog.title = '创建或编辑服务套餐'
          dialog.show = true
          break
        case 'view':
          // 处理查看
          let router = this.$router
          router && router.push({ name: 'servicePackageView', params: { id: row.packageName } })
          break
        case 'edit':
          // 处理编辑
          dialog.title = '创建或编辑服务套餐'
          dialog.show = true
          break
        case 'delete':
          // 处理删除
          this.$confirm(`请确认是否要删除服务套餐： ${row.packageName}?`, '确认删除操作', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
          break
        default:
          break
      }
    },
    closeDialog () {
      this.dialog.show = false
    },
    /**
     * @description 从元数据列表筛选出当前服务对应的配置信息
     */
    getCheckedMetadata () {
      return MetadataUtls.getCheckedMeta(this.metadata, this.serviceCode)
    },

    getColumnsAndFiltersByMeta () {
      if (!this.metaItem.code || !this.fontendConfig.service_code)
        return
      // this.columns = MetadataUtls.getColumns(this.metaItem, this.fontendConfig)
      this.filterItems = MetadataUtls.filterItems(this.metaItem, this.fontendConfig)
    }
  },
  computed: {
    setCloudProviderDisabled () {
      return true
    },
    deleteDisabled () {
      return true
    },
    serviceCode () {
      return 'cloud_ecs'
    },
    ...mapGetters([
      'metadata',
      'checkedMetadata',
      'instanceConfig'
    ]),

    metaItem () {
      return this.checkedMetadata
    },

    fontendConfig () {
      // 筛选得到前端的配置
      return this.instanceConfig
    }
  },
  components: {},
  created () {
    // 目前使用云主机的元数据
    MetadataUtls.initMetaInfoByServiceCode(this.serviceCode, this.metadata, Config)
    this.getColumnsAndFiltersByMeta()
  }
}
</script>

<style lang="scss" scoped>
</style>

