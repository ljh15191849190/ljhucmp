<template lang="pug">
    UcmpContainer.ws-detail(:breadcrumbItems="breadcrumbItems")
        div.d-flex.flex-column(slot="content")
            div.ws-detail__header.d-flex.align-items-center(:style="headerBg")
                span.ws-detail__title.flex-grow-1.padding-left {{resource.ticketCode}} {{resource.ticketTitle}}
                template(v-if="status !== WS_STATUS.PROCESSING")
                    template(v-if="status === WS_STATUS.WAIT_BEGIN || status === WS_STATUS.WAIT_PROCESS")
                        el-button(v-if="canTake" type="text" @click="ticketTake") 接单
                        el-button(type="text" @click="ticketAssign") 分配
                    template(v-if="isCreateUser && status === WS_STATUS.FINISHED")
                        el-button(type="text" @click="ticketClose") 关闭
                    template(v-if="isCreateUser && status === WS_STATUS.WAIT_BEGIN")
                        el-button(type="text" @click="ticketModify") 修改
                        el-button(type="text" @click="ticketCancel") 取消
                template(v-else-if="isHandler")
                    el-button(type="text" @click="ticketAssign") 分配
                    el-button(type="text" @click="ticketConfirm") 完成

            div.ws-detail__content.flex-grow-1
                div.ws-detail__info
                    el-divider(content-position="left") 工单信息
                    el-row()
                        el-col(:span="8")
                            label.text-light-grey 工单类型:
                            label.text-normal {{resource.ticketType}}
                        el-col(:span="8")
                            label.text-light-grey 创建时间:
                            label.text-normal {{resource.created_at | dateFormat}}
                        el-col(:span="8")
                            label.text-light-grey 创建人:
                            label.text-normal {{resource.userName || '--'}}
                    el-row
                        el-col(:span="8")
                            label.text-light-grey 紧急程度:
                            label.text-normal {{resource.ticketGrade}}
                        el-col(:span="8")
                            label.text-light-grey 处理角色:
                            label.text-normal {{resource.takingUserRole || '--'}}
                        el-col(:span="8")
                            label.text-light-grey 处理人:
                            label.text-normal {{resource.takingUserName || '--'}}
                    el-row
                        el-col(:span="8")
                            label.text-light-grey 工单状态:
                            label.text-normal {{statusObj[resource.ticketStatus] ? statusObj[resource.ticketStatus].label : '未知'}}
                div.ws-detail__appendix
                    el-divider(content-position="left") 工单描述
                    p {{resource.ticketDescription}}
                    div.appendix__item(v-for="(item, index) in attachmentList" :key="index")
                        FileWrap(:id="item.id" :src="item.url" :name="item.name" @view="viewBigImage")
                        p.text-wrap.text-light-grey {{item.name}}
                div.ws-detail__common
                    el-divider(content-position="left") 工单活动
                    el-timeline
                        el-timeline-item(v-for="(item, index) in actives"
                        :key="index"
                        :timestamp="item.replyDate | dateFormat"
                        placement="top"
                        size="large"
                        :color="item.replyType === 'comment' ? '' : '#0bbd87'")
                            el-card.max-width-middle(v-if="item.replyType !== 'comment'")
                                template(v-if="item.replyType === 'close'")
                                    span 服务态度:
                                    Rating.display-inline-block(:value="handleReplyRating(item.replyContent).attitude" disabled)
                                    br
                                    span 处理效率:
                                    Rating.display-inline-block(:value="handleReplyRating(item.replyContent).efficiency" disabled)
                                span(v-else) {{item.replyContent}}
                            span(v-else).reply-content.max-width-middle
                                span.font-bold {{item.replyUserName}} 评论了:
                                sapn {{item.replyContent}}

                    div.margin-top.margin-left
                        el-input.max-width-middle(type="textarea" :rows="2" v-model.trim="comment" placeholder="请输入你遇到的问题、想回复的内容" maxlength="500")
                        el-button.display-block(type="primary" size="small" :disabled="!comment" @click="reply") 发表

            el-backtop(target=".ws-detail__content")
            BigImage(v-if="viewImage" :visible.sync="viewImage" :pictures="imgList")
            CreateWorkSheet(v-if="visibleEdit" :visible.sync="visibleEdit" :is-edit="true" :ticket-code="id" @modified="modified")
            WorkSheetAssign(v-if="visibleAssign" :visible.sync="visibleAssign" :ticket-code="id" @assigned="assigned")
            WorkSheetRating(v-if="visibleRating" :visible.sync="visibleRating" :ticket-code="id" @closed="closed")
</template>

<script>
    import BigImage from '@common/BigImage'
    import FileWrap from './FileWrap'
    import CreateWorkSheet from './CreateWorkSheet'
    import WorkSheetAssign from './WorkSheetAssign'
    import WorkSheetRating from './WorkSheetRaty'
    import Rating from '@common/Raty'
    import {
        WorkSheetStatus,
        WS_STATUS,
        WS_ACTION,
        SUPPORT_IMG
    } from '@/server/ConstParams'
    import Api from '@api'
    import Utils from '@server/date-utils'
    import {mapGetters} from 'vuex'

    /**
     * 工单详情
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'WorkSheetDetail',
        components: {
            BigImage,
            FileWrap,
            CreateWorkSheet,
            WorkSheetAssign,
            WorkSheetRating,
            Rating
        },
        data () {
            return {
                id: this.$route.params.id,
                userId: localStorage.getItem('userId'),
                breadcrumbItems: [
                    {prop: '/tickets', label: '工单管理'},
                    {prop: '', label: '工单详情'}
                ],
                resource: {},
                actives: [],
                statusObj: WorkSheetStatus,
                WS_STATUS: WS_STATUS,
                viewImage: false,
                attachmentList: [],
                imgList: [],
                comment: '',
                visibleEdit: false,
                visibleAssign: false,
                visibleRating: false
            }
        },
        computed: {
            status () {
                return this.resource.ticketStatus || ''
            },
            isCreateUser () {
                return this.resource.created_by === this.userId
            },
            isHandler () {
                return this.resource.takingUser === this.userId
            },
            headerBg () {
                if (!this.status) return {background: '#ffffff'}

                let colorBegin = this.getRGBA(this.statusObj[this.status].custom_style)
                return {background: `linear-gradient(90deg, ${colorBegin}, #ffffff)`}
            },
            canTake () {
                // 详情中只有分配给自己活着自己的角色才可接单
                return (this.resource.handlerType === 'role' && this.ucmpRoleId === this.resource.handler) ||
                    (this.resource.handlerType === 'person' && this.userId === this.resource.handler)
            },
            ucmpRoleId () {
                return this.wsUserRole.ucmp ? this.wsUserRole.ucmp.id : ''
            },
            ...mapGetters(['wsUserRole'])
        },
        methods: {
            getRGBA (color, a = 0.2) {
                let r = parseInt(color.substring(1, 3), 16)
                let g = parseInt(color.substring(3, 5), 16)
                let b = parseInt(color.substring(5, 7), 16)

                return `rgba(${r}, ${g}, ${b}, ${a})`
            },
            viewBigImage () {
                this.viewImage = true
            },
            getReply () {
                // 工单回复
                Api.get('ticketReply', {id: this.id}, true).then(res => {
                    this.actives = res.reverse()
                })
            },
            reply () {
                let params = {
                    id: this.id,
                    content: this.comment
                }
                Api.post('ticketReply', params, true).then(res => {
                    this.comment = ''
                    this.getReply()
                })
            },
            // 接单
            ticketTake () {
                this.ticketAction({
                    id: this.id,
                    action: WS_ACTION.TAKING
                }, `工单${this.id}接单`)
            },
            // 分配
            ticketAssign () {
                this.visibleAssign = true
            },
            assigned () {
                this.getDetail()
                this.getReply()
            },
            // 关闭
            ticketClose () {
                this.visibleRating = true
            },
            closed () {
                this.getDetail()
                this.getReply()
            },
            // 修改
            ticketModify () {
                this.visibleEdit = true
            },
            modified () {
                this.getDetail()
                this.getReply()
            },
            // 取消
            ticketCancel () {
                this.ticketAction({
                    id: this.id,
                    action: WS_ACTION.CANCEL
                }, `工单${this.id}取消`)
            },
            // 完成
            ticketConfirm () {
                this.$confirm(`确认已完成工单${this.id}的所有工作步骤，并提交给工单发起人？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.ticketAction({
                        id: this.id,
                        action: WS_ACTION.FINISH
                    }, `工单${this.id}完成`)
                }).catch(() => {
                })
            },

            ticketAction (params, actionLabel) {
                Api.post('ticketAction', params, true).then(res => {
                    this.$notify.success(actionLabel + '操作成功！')
                    this.getDetail()
                    this.getReply()
                })
            },

            getDetail () {
                Api.get('ticket', {id: this.id}, true).then(res => {
                    this.resource = res
                    this.attachmentList = res.attachments || []
                    this.imgList = this.attachmentList.filter(item => this.isImage(item.name))
                })
            },

            isImage (name) {
                let suffix = name.split('.').pop().toString().toLowerCase()
                return SUPPORT_IMG.includes(suffix)
            },

            handleReplyRating (content) {
                let obj = JSON.parse(content)
                return obj || {}
            }
        },
        created () {
            this.getDetail()
            this.getReply()
        },
        filters: {
            dateFormat (val) {
                return Utils.formate(val)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .ws-detail__content {
        height: auto;
        overflow-y: auto;
    }

    .ws-detail__header {
    }

    .ws-detail__info, .ws-detail__appendix, .ws-detail__common {
        padding: 12px 12px 24px 12px;
    }

    .appendix__item {
        display: inline-block;
        margin-right: 24px;
        width: 200px;
        vertical-align: top;
    }

    .ws-detail__info {
        font-size: 14px;
        .text-light-grey {
            margin-right: 1rem
        }
    }

    .ws-detail__title {
        font-size: 22px;
        line-height: 56px;
    }

    .el-divider {
        margin: 16px 0 24px 0;
    }

    .el-timeline {
        padding-left: 8px;
    }

    .display-block {
        display: block;
    }

    .display-inline-block {
        display: inline-block;
    }

    .max-width-middle {
        max-width: 960px;
    }

    .margin-left {
        margin-left: 35px;
    }

    .font-bold {
        font-weight: bold;
    }

    .reply-content {
        word-break: break-all;
        display: inline-block;
    }
</style>
