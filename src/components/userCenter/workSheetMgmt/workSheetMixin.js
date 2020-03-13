/**
 * @description 工单列表相关mixin
 */
import Utils from '@server/date-utils'
import {mapGetters} from 'vuex'
import {WorkSheetStatus, WS_STATUS, WS_GROUP, WS_ACTION} from '@/server/ConstParams'
import Api from '@api'

export default {
    data () {
        return {
            currUser: localStorage.getItem('userId'),
            statusObj: WorkSheetStatus,
            WS_STATUS: WS_STATUS,
            stateTypes: WS_GROUP
        }
    },
    computed: {
        columns () {
            if (!this.wsReady || !this.wsRoleReady) return []

            let originColumns = [
                {prop: 'ticketCode', label: '工单编号', isLink: true},
                {prop: 'ticketTitle', label: '工单标题'},
                {
                    prop: 'ticketType',
                    label: '工单类型',
                    filterKey: 'type',
                    filters: this.wsTypesFilterList
                },
                {
                    prop: 'ticketGrade',
                    label: '紧急程度',
                    filterKey: 'grade',
                    filters: this.wsUrgencyFilterList
                },
                {
                    prop: 'ticketStatus',
                    label: '工单状态',
                    filterKey: 'status',
                    filters: this.wsStatusFilterList
                },
                {prop: 'userName', label: '创建人'},
                {
                    prop: 'takingUserRole',
                    label: '处理角色',
                    filterKey: 'takingRoleId',
                    filters: this.wsRoleList,
                    width: '120px'
                },
                {prop: 'takingUserName', label: '处理人'}, // 待查
                {prop: 'created_at', label: '创建时间', isDate: true}
            ]

            let otherColumn = {
                prop: 'handleType',
                label: '分类',
                filterKey: 'handleType',
                filters: this.wsGroupFilterList
            }

            if (this.$options.name === 'WorkSheetPendingList') {
                // 处理列表
                originColumns.splice(4, 0, otherColumn)
            }
            return originColumns
        },

        wsStatusFilterList () {
            let arr = []
            for (let [key, data] of Object.entries(WorkSheetStatus)) {
                //
                arr.push({value: key, label: data.label})
            }

            return arr
        },

        wsUrgencyFilterList () {
            return this.wsUrgency.map(item => {
                return {label: item.name, value: item.name}
            })
        },

        wsTypesFilterList () {
            return this.wsTypes.map(item => {
                return {label: item.name, value: item.name}
            })
        },

        wsGroupFilterList () {
            let newArray = JSON.parse(JSON.stringify(this.stateTypes))

            return newArray.map(item => {
                return {label: item.name, value: item.id}
            })
        },

        wsGroupObj () {
            let newArray = JSON.parse(JSON.stringify(this.stateTypes))
            let obj = {}

            newArray.forEach(item => {
                obj[item.id] = item.name
            })
            return obj
        },

        wsUrgencyObj () {
            let obj = {}
            this.wsUrgency.forEach(item => {
                obj[item.name] = item.color
            })

            return obj
        },

        ...mapGetters([
            'wsReady',
            'wsTypes',
            'wsUrgency',
            'wsRoleReady',
            'wsRoleList'
        ])
    },
    methods: {
        checkHandler (rowHandler) {
            return rowHandler && rowHandler === this.currUser
        },

        checkCreateUser (rowCreateUser) {
            return rowCreateUser && rowCreateUser === this.currUser
        },

        // 接单
        ticketTake (id) {
            this.ticketAciton({id, action: WS_ACTION.TAKING}, `工单${id}接单`)
        },
        // 分配
        ticketAssign (id) {
            this.$emit('reqAssign', id)
        },
        // 关闭
        ticketClose (id) {
            this.$emit('reqClose', id)
        },
        // 修改
        ticketModify (id) {
            this.$emit('reqModify', id)
        },
        // 取消
        ticketCancel (id) {
            this.ticketAciton({id, action: WS_ACTION.CANCEL}, `工单${id}取消`)
        },
        // 完成
        ticketConfirm (id) {
            this.ticketAciton({id, action: WS_ACTION.FINISH}, `工单${id}完成`)
        },

        ticketAciton (params, actionLabel) {
            Api.post('ticketAction', params, true).then(res => {
                this.$notify.success(actionLabel + '操作成功!')

                // 在对工单操作以后对于两个list的展示应该都有更改，需要通过index来通知刷新
                this.$emit('updated')
            })
        }
    },
    filters: {
        dateFormat (val) {
            return Utils.formate(val)
        }
    }
}
