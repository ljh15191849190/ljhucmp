<template lang="pug">
    CardItem(:title="titleLabel" v-loading="loading")
        div.full-container(slot="chartCot")
            div.org-cot.clearfix
                span.float-left.logo-img.ucmp-icon-user-logo
                span.float-right.right-cot
                    el-row
                        el-col.label-txt(:span="7") 普通用户
                        el-col.count-text(:span="7") {{orgInfos.user_count || 0}} 人
            div.org-cot.clearfix
                span.float-left.logo-img.ucmp-icon-organization-logo
                span.float-right.right-cot
                    el-row
                        el-col.label-txt(:span="7") 组织机构
                        el-col.count-text(:span="7") {{orgInfos.org_count || 0}} 家
</template>
<script>
import CardItem from '../CardItem'
import Api from '@api'
export default {
    components: { CardItem },
    data () {
        return {
            titleLabel: '组织信息',
            orgInfos: {},
            loading: false
        }
    },
    created () {
        this.loading = true
        Api.get('db_org', {}).then(res => {
            this.loading = false
            if (res)
                this.orgInfos = res
        }, () => {
            this.loading = false
        })
    }
}
</script>
<style lang="scss" scoped>
.full-container{
    height: 80%;
    margin-top: 3%;
}
.org-cot{
    height: 45%;
    width: 90%;
    margin: 0 auto;
    .logo-img{
        width: 100px;
        font-size: 50px;
        line-height: 100px;
        text-align: center;
        height: 100%;
    }
    .right-cot{
        height: 100%;
        width: calc(100% - 100px);
        line-height: 60px;
        padding: 20px 0px;
        box-sizing: border-box;
        .label-txt{
            height: 50%;
            font-size: 16px;
        }
        .count-text{
            font-size: 18px;
        }
    }
}
</style>
