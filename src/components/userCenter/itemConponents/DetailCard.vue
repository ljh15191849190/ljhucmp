<template lang="pug">
    div.padding.card-padding-top(v-if="detailInfo && isInited")
        p.card-title {{ cardTitle }}
        el-row
            el-col.padding-row(
                v-for="content in columnParams" :key="content.key"
                v-if="(content.key === 'execution_time') || newDetailInfo[content.key]"
                :xs="24" :sm="content.span || 12" :md="content.span || 8" :lg="content.span || 8" :xl="content.span || 6"
                v-title-tip)
                span.col-name {{content.label}}：
                //- span.col-value(v-if="content.key === 'order_code'") {{ newDetailInfo[content.key] }}
                    //- el-tooltip(effect="light" content="点击拷贝到剪切板" placement="top")
                    //-     el-button.copy-btn(type="text" @click="copyToCutboard(newDetailInfo[content.key])" size="small" icon="ucmp-icon-screen-switch")
                span.col-value(v-if="content.key === 'execution_time'")
                    template(v-if="!isEditing")
                        span(v-if="newDetailInfo[content.key]") {{newDetailInfo[content.key] | FormatTime}}
                        span(v-else) 立即执行(默认)
                        el-tooltip(v-if="executionTimeEditable" effect="light" content="手动设置申请单执行时间" placement="right")
                            el-button.edit-btn(type="text" size="small" icon="el-icon-edit" @click="editExecutionTime()")
                    template(v-else)
                        el-date-picker(
                            ref="datePicker"
                            size="small"
                            v-model="newDetailInfo.execution_time"
                            type="datetime"
                            placeholder="选择日期时间"
                            @blur="isEditing = false"
                            :picker-options="expireTimeOption")
                span.col-value(
                    v-else-if="content.key === 'status'"
                    :class="statusMap[newDetailInfo[content.key]] ? statusMap[newDetailInfo[content.key]].txtColor : ''") {{newDetailInfo[content.key] | FormatOrderStatus}}
                span.col-value(v-else-if="content.key === 'order_type'") {{ newDetailInfo[content.key] | orderType2str( detailInfo.service_code, customFilters.originOrderType) }} 
                span.col-value(v-else :class="{'text-wrap': content.key === 'memo'}") {{content.filter ? $options.filters[content.filter](newDetailInfo[content.key]) : newDetailInfo[content.key]}}
        el-row(v-if="detailInfo.attachments && detailInfo.attachments.length")
            el-col.padding-row
                span.col-name 附件
                div.appendix__item(v-for="(item, index) in detailInfo.attachments" :key="index")
                    FileWrap(:id="item.id" :src="item.url" :name="item.name" @view="viewBigImage")
                    p.text-wrap.text-light-grey {{item.name}}

        BigImage(v-if="viewImage" :visible.sync="viewImage" :pictures="imgList")

</template>
<script>
import Api from '@api'
import Utils from '@server/Utils'
import { SUPPORT_IMG } from '@/server/ConstParams'
import BigImage from '@common/BigImage'
import FileWrap from '@/components/userCenter/workSheetMgmt/FileWrap'
import { StatusMap } from '@server/ConstParams.js'
import { orderTypesMixin } from '@mixins/orderTypes.mixin'

/**
 * 该组件主要适用于申请单管理/任务管理/审批管理中申请单详情的
 */
// 申请单/审批需要展示的详情信息
const COlUMN_PARAMS = {
    order: [
        { key: 'order_code', label: '申请单编号' },
        { key: 'order_type', label: '申请单类型' },
        { key: 'urgency_level', label: '优先级', filter: 'FormatOrderLevel' },
        { key: 'status', label: '申请单状态', filter: 'FormatOrderStatus' },
        { key: 'order_user', label: '申请人' },
        { key: 'created_at', label: '申请时间', filter: 'FormatTime' },
        { key: 'expected_time', label: '期望完成时间', filter: 'FormatTime' },
        { key: 'execution_time', label: '执行时间', filter: 'FormatTime' },
        { key: 'memo', label: '申请说明', span: 23 }
    ],
    approve: [
        { key: 'order_code', label: '审批单编号' },
        { key: 'order_type', label: '审批单类型' },
        { key: 'urgency_level', label: '优先级', filter: 'FormatOrderLevel' },
        { key: 'status', label: '审批单状态', filter: 'FormatOrderStatus' },
        { key: 'order_user', label: '申请人' },
        { key: 'created_at', label: '申请时间', filter: 'FormatTime' },
        { key: 'expected_time', label: '期望完成时间', filter: 'FormatTime' },
        { key: 'execution_time', label: '执行时间', filter: 'FormatTime' },
        { key: 'memo', label: '申请说明', span: 23 }
    ]
}

export default {
    props: [ 'cardType', 'detailInfo', 'cardTitle' ],
    components: {BigImage, FileWrap},
    mixins: [orderTypesMixin],
    data () {
        return {
            isEditing: false,
            statusMap: StatusMap,
            expireTimeOption: {
                disabledDate (date) {
                    let nowDate = new Date(Date.now())
                    let _year = nowDate.getFullYear()
                    let _month = nowDate.getMonth()
                    let _date = nowDate.getDate()
                    return date.getTime() < (new Date(_year, _month, _date)).getTime()
                }
            },
            viewImage: false,
            customFilters: {
                // 服务名称
                serviceCode: [],
                // 类型
                orderType: [],
                // 类型拷贝
                copyOrderType: []
            },
            isInited: false
        }
    },
    methods: {
        editExecutionTime () {
            this.isEditing = true
            this.$nextTick(() => {
                this.$refs.datePicker[0].focus()
            })
        },

        copyToCutboard (str) {
            Utils.copyToCutboard(str, '申请单号')
        },

        isImage (name) {
            let suffix = name.split('.').pop().toString().toLowerCase()
            return SUPPORT_IMG.includes(suffix)
        },

        viewBigImage () {
            this.viewImage = true
        },
        async initCustomFilters () {
            await this.getOrderTypes()
        },
        async getOrderTypes () {
            let res = await Api.get('orderType', {})
            let allType = []
            let resObj = {}
            for (let key in res) {
                let ary = Object.entries(res[key]).map(itemAry => {
                    let innerObj = {}
                    innerObj['order_type'] = itemAry[0]
                    innerObj['name'] = itemAry[1]
                    return innerObj
                })
                resObj[key] = ary
                allType = allType.concat(ary)
            }
            this.customFilters.orderType = []
            this.customFilters.copyOrderType = resObj
            this.customFilters.originOrderType = res
        }
    },
    computed: {
        columnParams () {
            return COlUMN_PARAMS[this.cardType] || []
        },
        newDetailInfo: {
            get () {
                // UCMP3-5615【服务目录】添加、删除F5主机节点，申请单详情、审批详情中不应该有：期望完成时间字段expected_time
                // 对pool进行单独处理
                if (this.detailInfo.service_code === 'pool') {
                    let newDetail = {...this.detailInfo}
                    newDetail.expected_time = ''
                    return newDetail
                }

                return this.detailInfo
            },
            set (val) {
                this.$emit('update:detailInfo', val)
            }
        },

        imgList () {
            let attachmentList = this.detailInfo.attachments || []
            return attachmentList.filter(item => this.isImage(item.name))
        },

        /**
         * @description  UCMP3-2897 审批单、审批单执行时间自定义按钮显示条件：审批环节|非审批环节 && 当前用户管理员 && 状态为待处理
         * */
        executionTimeEditable () {
            // 审批修改资源所属执行时间不能修改
            if (this.cardType === 'approve' && this.detailInfo.order_type === 'modify_resource_belong')
                return false
            // UCMP3-3449 根据订单API返回的【execute】来判断是否可以修改执行时间
            else
                return this.detailInfo.execute
        }
    },
    async created () {
        // 初始自定义的过滤参数
        await this.initCustomFilters()
        this.isInited = true
    },
    filters: {
        orderType2str (type, serviceCode, typeObj) {
            let str = ''
            if (typeObj[serviceCode] && typeObj[serviceCode][type])
                str = typeObj[serviceCode][type]
            return str ? str : ''
        }
    }
}
</script>
<style lang="scss">
.padding-row{
    vertical-align: top;
    .cot {
        color: $fontTitleLight;
    }
}
.edit-btn, .copy-btn {
    margin: 0;
    padding: 0 !important;
    margin-left: 10px;
    font-size: 14px;
}
.appendix__item {
    display: inline-block;
    margin-right: 24px;
    width: 200px;
    vertical-align: top;
}

</style>
