<template lang="pug">
    div.position-relative.d-flex.flex-column(ref="dragBox" v-cloak :class="{'dash-chart-container': !notDashboard}")
        slot(name="controls")
        div.absolute-rt
            slot(name="otherFilters")
            el-dropdown.mr20.drop-menu(v-if="filterItemsType.length>0" size="small" @command="handleCommandtype")
                span.select-title {{filterItemType.title}}
                    i.el-icon-caret-bottom
                el-dropdown-menu(slot="dropdown")
                    el-dropdown-item(v-for="(item, index) in filterItemsType" :key="index" :command="item.key") {{item.title}}
            el-dropdown.drop-menu(v-if="filterList.length" size="small" @command="handleCommand")
                span.select-title {{filterItem.title}}
                    i.el-icon-caret-bottom
                el-dropdown-menu(slot="dropdown")
                    el-dropdown-item(v-for="(item, index) in filterList" :key="index" :command="item.key") {{item.title}}
            el-tooltip(v-if="enlargeable" effect="dark" content="放大" placement="top")
                span.ucmp-icon-expend.expend-btn(@click="scaleBigger()")
            el-tooltip(v-if="linkToMore" effect="dark" content="查看更多" placement="top")
                span.more-btn.ucmp-icon-more-btn(@click="showMore")
        div.chart-header {{title}}
        div.chart-container.flex-1(:class="hasSwitchBtn ? 'centerBox' : ''")
          aside.handle-btn-simple.w30(v-if="hasSwitchBtn")
            i.el-icon-arrow-left(@click="handlePrev")
          main.flex1
            slot(name="chartCot")
          aside.handle-btn-simple.w30(v-if="hasSwitchBtn")
            i.el-icon-arrow-right(@click="handleNext")

        el-dialog.dialog-cot(v-if="dialogTableVisible" :title="title" :visible.sync="dialogTableVisible")
                div.position-relative
                    el-dropdown.drop-menu(v-if="filterList.length" size="small" @command="handleCommand")
                        span.select-title {{filterItem.title}}
                            i.el-icon-caret-bottom
                        el-dropdown-menu(slot="dropdown")
                            el-dropdown-item(v-for="(item, index) in filterList" :key="index" :command="item.key") {{item.title}}
                slot(name="chartCotDialog")
</template>
<script>
const filterByDays = [
    { title: '一周内', key: '7' },
    { title: '近15天', key: '15' },
    { title: '近30天', key: '30' }
]
const filterByResources = [
    { key: 'cpu', title: 'CPU' },
    { key: 'memory', title: '内存' },
    { key: 'disk', title: '存储' }
]
export default {
    props: {
        //code: String, // 为此在总览中的展示的menu url，需要传递参数到导出的传（废弃，在每个item中处理如何传递到store）
        notDashboard: Boolean, // 是否不为总览模块（控制样式）
        title: String, // 卡片title
        filterType: String, // 卡片内容的过滤类型 date|resources （当过滤项需要自定义时该参数可不传）
        filterItems: Array,  // 卡片过滤列表的内容（可选）当选择type之后会默认赋值
        enlargeable: Boolean, // 卡片是否有放大功能
        linkToMore: [Object, String, Boolean], // 跳转至更多详情页面
        // 每个card实例可以有多少分页
        totalPage: {
          type: Number,
          default: 0
        },
        // 每个card里最多展示多少条数据
        maxShowCount: {
          type: Number,
          default: 0
        },
        filterItemsType: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            filterItem: {
                title: '',
                key: ''
            },
            filterItemType: { 
                title: '',
                key: ''
            },
            filterList: [],
            dialogTableVisible: false,
            switchIndex: 0
        }
    },
    created () {
        this.filterList = this.filterItems || []
        if (!this.filterList.length) {
            switch (this.filterType) {
                case 'date':
                    this.filterList = filterByDays
                    break
                case 'resource':
                    this.filterList = filterByResources
                    break
            }
        }
        this.filterItem = this.filterList[0] || {}
        this.filterItemType = this.filterItemsType[0] || {}
    },
    methods: {
        handleCommandtype (command) {
            let selectItem = this.filterItemsType.find(item => {
                return item.key === command
            })
            this.filterItemType = selectItem
            this.$emit('changeFilterParamsType', this.filterItemType)
        },
        handleCommand (command) {
            let selectItem = this.filterList.find(item => {
                return item.key === command
            })
            this.filterItem = selectItem
            this.$emit('changeFilterParams', this.filterItem)
        },
        scaleBigger () {
            this.dialogTableVisible = true
        },
        // 查看更多信息
        showMore () {
            this.$router.push(this.linkToMore)
        },
        // prev button handle
        handlePrev () {
          this.switchIndex -= 1
          if (this.switchIndex <= 0) this.switchIndex = 0
          this.$slots.chartCot[0].context.parentCallSwitchStep()
        },
        // next button handle
        handleNext () {
          this.switchIndex += 1
          // 关于整数页的临界判断 最大为totalPageNum - 1
          if ((this.totalPageNum - 1) <= this.switchIndex) this.switchIndex = this.totalPageNum - 1
          this.$slots.chartCot[0].context.parentCallSwitchStep()
        }
    },
    computed: {
        hasSwitchBtn () {
            if (this.totalPageNum <= 1 && this.maxShowCount > 0) return false
            if (this.maxShowCount > 0) return true
        },
        // 根据maxShowCount 每个标签里最多展示多少个来得出分页的页数, 从1开始
        totalPageNum () {
            let surplusPage = (this.totalPage % this.maxShowCount) === 0 ? 0 : 1
            return parseInt(this.totalPage / this.maxShowCount + surplusPage)
        }
    },
    watch: {
        filterItems (val) {
            if (val) {
                this.filterList = val || []
                this.filterItem = val[0] || {}
            }
        },
        filterItemsType (val) {
            if (val) 
                this.filterItemType = val[0] || {}
        }
    }
}
</script>
<style lang="scss" scoped>
.absolute-rt {
    top: 10px;
    right: 10px;
}
.drop-menu {
    cursor: pointer;
    padding-right: 8px;
}
.select-title {
    font-size: 12px;
    i {
        margin-left: 5px;
        color: #aaa;
    }
}
.dialog-cot {
    .drop-menu {
        position: absolute;
        right: 10px;
        top: -25px;
    }
    .select-title{
        font-size: 16px;
    }
}
.more-btn,
.expend-btn {
    cursor: pointer;
    font-size: 12px;
    padding: 5px;
    color: #888;
    &:hover {
        color: #333;
    }
}
.centerBox{
  display: flex;
  align-items: center;
  .flex1{
    flex: 1;
  }
}

.flex1{
  height: 100%;
}
.flex-1 {
    flex: 1;
    overflow: hidden;
}

.w30{
  width: 30px;
}
.handle-btn-simple{
  font-size: 25px;
  color: #cccccc;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: #0081f6;
    cursor: pointer;
  }
}
.mr20{
    margin-right: 20px
}
</style>
