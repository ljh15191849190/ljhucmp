<template lang="pug">
  div.full-container(ref="containerRef")
    DynamicFilterForm(
        v-if="filterItems.length"
        :setStyle="setStyle"
        :serviceCode="serviceCode"
        :metaItems="filterItems"
        :formData="formData"
        ref="filterRef"
        :submit="submit"
        :searchPlaceholder="searchPlaceholder"
        @updateFilterForm="updateFilterForm"
    )
        template(slot="custonItem")
            slot(name="custonItem")
    div.main-container(ref="mainRef")
        div.tableContainer(:class="{'auto-height': tableHeightAuto}")
            slot(name="tableContainer")
        div.pagination(:class="'pagination-' + paginationPosition")
            el-pagination(
                v-if="pagination"
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="syncPagination.index"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="syncPagination.size"
                layout="sizes, total, prev, pager, next"
                :total="syncPagination.total"
                :page-count="syncPagination.count"
            )
</template>
<script>
import DynamicFilterForm from '@/components/common/dynamicForm/DynamicFilterForm'
/**
 * @description 通用表格容器组件，各个列表管理页面均应以此为基础组件使用
 * @props [advance]是否使用高级选项，不使用的话不需要指定该绑定关系
 * @slot [basic-filter] 基础查询组件卡槽 [advanced-filter] 高级查询组件卡槽 [filter-btns] 查询按钮组件卡槽 [tableContainer] 表格容器组件卡槽
 * @props [containerHeight] 表格最大高度，el-table 的 max-height使用
 * @author xinghua.wen
 */
export default {
  props: {
    pagination: Object,
    containerHeight: Number,
    filterItems: {
        type: Array,
        default: () => []
    },
    noResizeSync: Boolean,
    tableHeightAuto: Boolean, // 不对表格高度限制，table 高度设置为自由高度
    formData: {
        type: Object,
        default: () => { return {} }
    },
    submit: Function,
    searchPlaceholder: String,
    paginationPosition: {
        type: String,
        default: () => 'right'
    },
    serviceCode: String
  },
  data () {
    return {
        rowHeight: 39
    }
  },
  methods: {
    assignValue (key, value) {
        this.$refs.filterRef.assignValue(key, value)
    },

    updateFilterForm (data) {
        this.$emit('updateFilterForm', data)
    },

    // UCMP-560 消除 筛选表单 的所有值
    clearFilterData () {
        this.$refs.filterRef.clearFormData()
    },

    /**
     * @description 动态设置样式
     */
    setStyle () {
        // 高级选项显示/隐藏时，改变table容器的实际高度
        if (this.$refs.containerRef && this.$refs.containerRef.offsetHeight) {
            let container = this.$refs.containerRef.offsetHeight
            this.$nextTick(
                () => {
                    let advanced = this.$refs.filterRef && this.$refs.filterRef.$refs && this.$refs.filterRef.$refs.advanceRef && this.$refs.filterRef.$refs.advanceRef ? this.$refs.filterRef.$refs.advanceRef.offsetHeight : 0
                    let containerHeight = this.filterItems.length ? container - advanced : container
                    this.$emit('update:containerHeight', containerHeight - 60)
                    this.$refs.mainRef.style.height = containerHeight + 'px'
                }
            )
        }
    },
    handleSizeChange (val) {
        this.$emit('sizeChange', val)
    },
    handleCurrentChange (val) {
        this.$emit('currentChange', val)
    }
  },
  mounted () {
    if (this.noResizeSync) {
        this.$refs.containerRef.style.height = 'auto'
        return
    }
    this.setStyle()
    window.onresize = () => {
        if (this.noResizeSync)
            return false
        this.setStyle()
    }
  },
  computed: {
      syncPagination: {
          get () {
            return this.pagination
          },
          set (val) {
            this.$emit('update:pagination', val)
          }
      }
  },
  components: {
    DynamicFilterForm
  }
}
</script>
<style lang="scss" scoped>
.main-container {
    height: 100%;
}
.tableContainer {
  height: calc(100% - 60px) !important;
  padding-top: 10px;
  &.auto-height {
      height: auto !important;
  }
}
.pagination {
    height: 60px;
    display: flex;
    align-items: center;
}
.pagination-center {
    justify-content: center;
}
.pagination-right {
    justify-content: flex-end;
}
</style>
