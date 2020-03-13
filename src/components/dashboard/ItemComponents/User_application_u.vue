<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading", :totalPage="cacheApplications.length", :maxShowCount="maxShowCount", ref="cardItem")
        div.full-container.business-section(slot="chartCot")
          main.content-box
              div.business-item.border-bottom(v-for="(app, index) in applications" :key="index" v-if="index < maxShowCount")
                  div.cost-detail
                      el-row
                          el-col.subTitle_label(:span="3")
                              span(v-if="app.app_name.length <= 5") {{app.app_name}}
                              el-tooltip(v-if="app.app_name.length > 5", effect="dark", :content="app.app_name", placement="bottom")
                                  span {{app.app_name.slice(0, 5) + '...'}}
                          el-col(:span="21")
                              el-row
                                  el-col.ins-detail(:span="item.item_code == 'tomcat' ? 8 : 5" v-for="(item, index) in app.items" :key="index" v-if="index < 5")
                                      div.text-color-gray
                                          i.mr-2(:class="'resource-icon-' + item.item_code")
                                          span {{item.item_name}}
                                          span ({{item.item_count || 0}})
                                  el-col(v-if="app.items.length >= 5", :span="1")
                                      el-tooltip(effect="dark" placement="top-start" content="查看更多实例信息")
                                          span.ucmp-icon-down.show-more(@click="showDetail(app)")
                              el-row(v-if="app.showMore")
                                  el-col.ins-detail(:span="4" v-for="(item, _index) in app.items" :key="_index" v-if="_index >= 5")
                                      el-tooltip(effect="dark" placement="top-start")
                                          div(slot="content") {{item.item_name}} ({{item.item_count || 0}})
                                          div
                                              i.mr-2.app-logo-color(:class="'resource-icon-' + item.item_code")
                                              span {{item.item_count || 0}}
</template>
<script>
import CardItem from '../CardItem'
import Api from '@api'

export default {
    components: { CardItem },
    data () {
        return {
            titleLabel: '我的应用',
            cacheApplications: [],
            applications: [],
            maxShowCount: 5, //每一页最多展示多少个
            loading: false
        }
    },
    created () {
        this.loading = true
        Api.get('db_apps', {}).then(res => {
            this.loading = false
            if (res) {
                // top 10
                this.cacheApplications = this.sortByNums(res).splice(0, 10)
                this.applications = this.cacheApplications.slice(0, this.maxShowCount)
            }
        }, () => {
            this.loading = false
        })
    },
    methods: {
        /*
        * @params appArr:Array 服务端拿到的应用列表
        * @return newArr:Array 根据应用的实例总数排序后的数组
        */
        sortByNums (appArr) {
          appArr.forEach(app => {
            let count = app.items.reduce((preNum, nowNum) => {
                return preNum + nowNum.item_count
            }, 0)
            app.totalCount = count
          })
          return appArr.sort((a, b) => b.totalCount - a.totalCount)
        },
        showDetail (app) {
            // 切换查看更多信息
            this.$set(app, 'showMore', !app.showMore)
        },
        // 组件调用slot内部的方法
        parentCallSwitchStep () {
            // slot内部拿组件的switchIndex
            let switchIndex = this.$refs.cardItem.switchIndex
            this.applications = this.cacheApplications.slice(switchIndex * this.maxShowCount, (switchIndex + 1) * this.maxShowCount)
        }
    }
}
</script>
<style lang="scss" scoped>
.business-section{
    margin: 10px 0;
    height: calc(100% - 20px);
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
}
.content-box{
  width: calc(100% - 10px);
  margin: 0 5px;
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
.text-color-gray{
    color: #b1adad;
    font-size: 13px;
    i:hover {
        color: $fontOrange;
    }
}
.business-item{
    padding: 5px;
    span, div {
        line-height: 30px;
    }
    .label-text{
        font-size: 14px;
    }
    .subTitle_label{
        font-size: 12px;
    }
    .cost-count{
        margin-left: 6px;
    }
}

</style>
