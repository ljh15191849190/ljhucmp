<template lang="pug">
    CardItem.resource_overview(:title="titleLabel" v-loading="loading" :linkToMore="cacheApplications.length >= maxShowCount ? {path: '/cloud-provider'} : false", :totalPage="cacheApplications.length", :maxShowCount="maxShowCount", ref="cardItem")
        div.full-height.p-25(slot="chartCot")
            div(v-for="(item, index) in typeData" :key="index" v-if="index < maxShowCount")
                div.item-bar.d-flex.full-height
                    div.left-cot.show-more(@click="routerTo(item)")
                        span(v-if="item.provider.length <= 10") {{item.provider}}
                        el-tooltip(v-if="item.provider.length > 10", effect="dark", :content="item.provider", placement="bottom")
                          span {{item.provider.slice(0, 10) + '...'}}
                    div.right-bars.border-bottom
                        el-row.full-height
                            el-col(:span="8")
                                el-tooltip(effect="dark" placement="top-start")
                                    div.tip-cot.d-flex(slot="content")
                                        span.pull-left {{(item.total_cpu_ghz ? (item.cpu_ghz / item.total_cpu_ghz * 100) : 0).toFixed(1)}} %
                                        span.pull-right
                                            div 使用量：{{(item.cpu_ghz).toFixed(1)}} {{item.cpu_unit || '核'}}
                                            div 剩余量：{{(item.total_cpu_ghz - item.cpu_ghz).toFixed(1)}} {{item.cpu_unit || '核'}}
                                    div.d-flex
                                        span.label-text CPU
                                        el-progress.resource-progress(:show-text="false" :stroke-width="25"
                                            :percentage="+(item.total_cpu_ghz ? (item.cpu_ghz / item.total_cpu_ghz *100) : 0)"
                                            :color="handleColor(item.total_cpu_ghz ? (item.cpu_ghz / item.total_cpu_ghz *100) : 0)")
                            el-col(:span="8")
                                el-tooltip(effect="dark" placement="top-start")
                                    div.tip-cot.d-flex(slot="content")
                                        span.pull-left {{(item.total_memory_gb ? (item.memory_gb / item.total_memory_gb * 100) : 0).toFixed(1)}} %
                                        span.pull-right
                                            div 使用量：{{(item.memory_gb).toFixed(1)}} GB
                                            div 剩余量：{{(item.total_memory_gb - item.memory_gb).toFixed(1)}} GB
                                    div.d-flex
                                        span.label-text 内存
                                        el-progress.resource-progress(:show-text="false" :stroke-width="25"
                                            :percentage="+(item.total_memory_gb ? (item.memory_gb / item.total_memory_gb *100) : 0)"
                                            :color="handleColor(item.total_memory_gb ? (item.memory_gb / item.total_memory_gb *100) : 0)")
                            el-col(:span="8")
                                el-tooltip(effect="dark" placement="top-start")
                                    div.tip-cot.d-flex(slot="content")
                                        span.pull-left {{(item.total_disk_gb ? (item.disk_gb / item.total_disk_gb * 100) : 0).toFixed(1)}} %
                                        span.pull-right
                                            div 使用量：{{(item.disk_gb).toFixed(1)}} GB
                                            div 剩余量：{{(item.total_disk_gb - item.disk_gb).toFixed(1)}} GB
                                    div.d-flex
                                        span.label-text 存储
                                        el-progress.resource-progress(:show-text="false" :stroke-width="25"
                                            :percentage="+(item.total_disk_gb ? (item.disk_gb / item.total_disk_gb *100) : 0)"
                                            :color="handleColor(item.total_disk_gb ? (item.disk_gb / item.total_disk_gb *100) : 0)")
</template>
<script>

/**
 * @description 云厂商容量概况
 */

import CardItem from '../CardItem'
import Api from '@api'

export default {
  data () {
    return {
      filterItems: [],
      titleLabel: '云厂商容量概况',
      typeData: [],
      loading: false,
      cacheApplications: [],
      maxShowCount: 5
    }
  },
  created () {
    this.loading = true
    Api.get('db_resource_overview', {}).then(res => {
        this.loading = false
        if (res && res.length)
            this.cacheApplications = res
            //this.cacheApplications = res
            this.typeData = this.cacheApplications.slice(0, this.maxShowCount)
    }, () => {
        this.loading = false
    })
  },
  methods: {
    changeType (type) { console.log(type) },
    // 根据占比值处理进度条颜色
    handleColor (count) {
      if (count >= 85)
        return '#e64450'
      else if (count >= 50)
        return '#ffaa00'
      else
        return '#61c359'
    },
    routerTo (item) {
      this.$router.push({path: `/cloud-provider/detail/${item.id}`})
    },
    // 组件调用slot内部的方法
    parentCallSwitchStep () {
        // slot内部拿组件的switchIndex
        let switchIndex = this.$refs.cardItem.switchIndex
        this.typeData = this.cacheApplications.slice(switchIndex * this.maxShowCount, (switchIndex + 1) * this.maxShowCount)
    }
  },
  components: { CardItem }
}
</script>
<style lang="scss" scoped>
.p-25 {
    padding: 0 25px;
}

.item-bar {
    font-size: 12px;
    .left-cot {
        width: 80px;
        text-align: right;
        border-right: 1px solid #000;
        position: relative;
        cursor: pointer;
        span {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 10px;
            word-break: break-all;
        }
    }
    .right-bars {
        width: calc(100% - 71px);
        padding-top: 18px;
        line-height: 20px;
        .el-col {
            padding: 0 8px;
            .label-text {
                width: 30px;
                margin-right: 5px;
            }
            .resource-progress {
                width: calc(100% - 35px);
                margin-bottom: 0px;
            }
        }
    }
}

.tip-cot {
    width: 180px;
    .pull-left {
        width: 60px;
        height: 50px;
        font-size: 18px;
        line-height: 50px;
        color: #fff;
        text-align: center;
        display: inline-block;
        white-space: nowrap;
    }
    .pull-right {
        height: 50px;
        display: inline-block;
        padding: 5px;
        font-size: 12px;
        line-height: 20px;
        white-space: nowrap;
    }
}
</style>
