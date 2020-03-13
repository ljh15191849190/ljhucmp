<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading", :totalPage="cacheApplications.length", :maxShowCount="maxShowCount", ref="cardItem")
        div.full-container.application-section(slot="chartCot")
            div.bot-cot.d-flex.flex-wrap
                div.flex-item.border-bottom(v-for="(item, index) in applications" :key="index" v-if="index < maxShowCount")
                    span.apply-name.float-left.text-overflow-ellipsis
                        span(v-title-tip="item.business_name") {{item.business_name}}
                    span.apply-count.float-right.text_cost-count.text-overflow-ellipsis
                        span(v-title-tip="item.total_amount || 0") ￥{{item.total_amount || 0}}
</template>
<script>
import CardItem from '../CardItem'
import Api from '@api'
import {mapGetters} from 'vuex'

export default {
    components: { CardItem },
    data () {
        return {
            totalCounts: 0,
            applications: [],
            cacheApplications: [],
            loading: false,
            maxShowCount: 10
        }
    },
    created () {
        this.loading = true
        Api.get('db_business', {}, true).then((res) => {
            this.loading = false
            if (res) {
                this.totalCounts = res.length
                this.cacheApplications = res
                this.applications = this.cacheApplications.slice(0, this.maxShowCount)
            }
        }, () => {
            this.loading = false
        })
    },
    computed: {
        ...mapGetters([
            'businessOrproject'
        ]),
        titleLabel () {
            return this.businessOrproject === 'business' ? '我的业务' : '我的项目'
        }
    },
    methods: {
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
.application-section{
    margin-top: 20px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    .flex-wrap {
        width: 100%;
    }
}
.content-box{
    width: calc(100% - 60px);
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
.top-count {
    height: 45px;
    .float-right {
        margin-right: 10%;
        span {
            font-size: 16px;
            &.total-count {
                font-size: 20px;
                margin-left: 10px;
            }
        }
    }
}
.bot-cot {
    padding: 0 25px 0 15px;
    .flex-item {
        width: 50%;
        line-height: 38px;
        padding: 0px 10px;
        .apply-name{
            width: 50%;
            span{
                display: inline-block;
                width: 100%;
            }
        }
        .icon-logo {
            font-size: 18px;
            margin-right: 10px;
        }
        .apply-count{
            text-align: right;
            width: 50%;
            padding-right: 15px;
        }
        .float-right {
            font-size: 18px;
        }
    }
}
</style>
