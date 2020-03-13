<template lang="pug">
    div
        div.box-card.margin-top(v-if="transactorList.length")
            div.box-card-title 当前办理人
            el-table(:data="transactorList" border)
                el-table-column(
                    v-for="column in transactorColumns"
                    :key="column.prop"
                    :label="column.label"
                    :prop="column.prop"
                    :type="column.type"
                    :width="column.width"
                )
        div.box-card.margin-top
            div.box-card-title 审批记录列表
            el-table(:data="recordList" border)
                el-table-column(type="expand")
                    template(slot-scope="props")
                        el-row
                            el-col.padding-row(
                                v-for="expand_column in expandColumns"
                                :label="expand_column.label"
                                :key="expand_column.prop"
                                :span="8")
                                span.col-name {{expand_column.label}}：
                                span.col-value {{props.row[expand_column.prop] || '--'}}
                el-table-column(
                    v-for="column in recordColumns"
                    :key="column.prop"
                    :label="column.label"
                    :prop="column.prop"
                    :type="column.type"
                    :width="column.width"
                )
                    //UCMP3-1842【审批管理】流程跟踪页面的处理人要改成登录名（姓名）1.用户姓名应该显示为姓名 2.处理人应该要改成登录名（姓名）
                    template(slot-scope="scope")
                        span(v-if="column.prop === 'time'") {{scope.row[column.prop] | FormatTime}}
                        span(v-else-if="column.prop === 'type'") {{scope.row[column.prop] === 'false' ? '未通过' : '通过'}}
                        span(v-else) {{scope.row[column.prop] || '--'}}
</template>
<script>
import Api from '@api'
// 审批记录列表
export default {
    props: [ 'processInstanceId' ],
    data () {
        return {
            recordList: [],
            transactorList: [],
            recordColumns: [
                { prop: 'comment_user', label: '处理人' },
                { prop: 'phone', label: '手机号码' },
                { prop: 'time', label: '处理时间' },
                { prop: 'type', label: '处理结果' }
            ],
            transactorColumns: [
                { prop: 'realname', label: '用户姓名' },
                { prop: 'email', label: '电子邮箱' },
                { prop: 'tel', label: '电话号码' },
                { prop: 'phone', label: '手机号码' }
            ],
            expandColumns: [
                { prop: 'comment_user', label: '处理人' },
                { prop: 'email', label: '电子邮箱' },
                { prop: 'tel', label: '电话号码' },
                { prop: 'full_message', label: '审批意见' }
            ]
        }
    },
    created () {
        // 获取审批记录
        Api.get('getProcessRecordList', { processInstanceId: this.processInstanceId }, true).then(
            res => {
                if (Array.isArray(res.comments))
                    this.recordList = res.comments
                if (Array.isArray(res.users))
                    this.transactorList = res.users
            }
        )
    }
}
</script>
<style lang="scss" scoped>
.box-card-title {
    color: $fontTitleLight;
}
</style>
