<template lang="pug">
  div.container-flud(ref="container")
    el-row.breadcrumb-container(ref="breadcrumb")
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item.ucmp-breadcrumb-item(to="/dashboard" v-title-tip.text="sysName") {{sysName}}
            el-breadcrumb-item.ucmp-breadcrumb-item(v-for="(item, index) in breadcrumbItems" v-if="index !== breadcrumbItems.length - 1" :key="item.prop" :to="{ path: item.prop, query: item.query ? item.query : {} }" v-title-tip.text="item.label") {{item.label}}
            el-breadcrumb-item.ucmp-breadcrumb-item(v-if="breadcrumbItems.length" v-title-tip.text="breadcrumbItems[breadcrumbItems.length - 1].label") {{breadcrumbItems[breadcrumbItems.length - 1].label}}
    div.ucmp-content(ref="content" :class="{'bg-transparent': bgEmpty, 'no-padding': bgEmpty, 'no-border': noBorder}")
        slot(name="content")
</template>
<script>
/**
 * @description 通用页面组件，包含两部分：breadcrumb以及content
 * @description !!!!!! 任何页面(不含特殊布局如服务目录、申请云主机等)都应以此为基础组件使用
 * @augments [breadcrumbItems] 面包屑数据，不包含平台名称，
 *          prop：路由信息，
 *          label: 名称；
 *          [bgEmpty]背景是否透明，默认背景为白色;
 *          [noBorder] 是否有边框;
 * @author xinghua.wen
 */
import { mapGetters } from 'vuex'
export default {
  props: ['breadcrumbItems', 'bgEmpty', 'noBorder'],
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters([
        'sysName'
    ])
  },
  created () {
    // eslint-disable-next-line
    if (!this.breadcrumbItems)
        this.breadcrumbItems = []
  }
}
</script>
<style lang="scss" scoped>
.ucmp-content {
    height: calc(100% - 64px); // breadcrumb: 48px; + margin-bottom: 16px;
    overflow: hidden;
    &.no-crumbBar{
        height: calc(100% - 15px);
    }
}
</style>
