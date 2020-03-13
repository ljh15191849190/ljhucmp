<template lang="pug">
    div.ws.full-container
        UcmpContainer(:breadcrumbItems="breadcrumbItems")
            div.full-container(slot="content")
                div.top-button-container
                    el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-plus" @click="addWorkSheet") 创建工单

                el-tabs(v-model="activeTab")
                    el-tab-pane(v-for="tab in tabs" :key="tab.name" :name="tab.name" :label="tab.label")
                keep-alive
                    div.work-sheet-content(:is="activeTab" :refresh="tableChangeIndex" @reqModify="reqModify" @reqClose="reqClose" @reqAssign="reqAssign" @updated="updated")

        CreateWorkSheet(v-if="visible" :visible.sync="visible" :is-edit="isEdit" :ticket-code="modifyId" @modified="modified")
        WorkSheetAssign(v-if="visibleAssign" :visible.sync="visibleAssign" :ticket-code="assignId" @assigned="assigned")
        WorkSheetRating(v-if="visibleRating" :visible.sync="visibleRating" :ticket-code="closeId" @closed="closed")
</template>

<script>
    import CreateWorkSheet from './CreateWorkSheet'
    import WorkSheetAssign from './WorkSheetAssign'
    import WorkSheetRating from './WorkSheetRaty'
    import WorkSheetPendingList from './WorkSheetPendingList'
    import WorkSheetList from './WorkSheetList'
    import {mapActions} from 'vuex'

    /**
     * 工单 -- 总线
     *
     * @description
     * @author jia.lu
     */
    export default {
        name: 'WorkSheetIndex',
        components: {
            CreateWorkSheet,
            WorkSheetAssign,
            WorkSheetRating,
            WorkSheetPendingList,
            WorkSheetList
        },
        data () {
            return {
                breadcrumbItems: [{prop: '', label: '工单管理'}],
                tabs: [
                    {
                        name: 'WorkSheetPendingList',
                        label: '处理列表',
                        path: 'pending'
                    },
                    {
                        name: 'WorkSheetList',
                        label: '工单列表',
                        path: 'list'
                    }
                ],
                activeTab: 'WorkSheetPendingList',
                isEdit: false,
                visible: false,
                visibleRating: false,
                visibleAssign: false,
                modifyId: '',
                closeId: '',
                assignId: '',
                tableChangeIndex: 0
            }
        },
        computed: {},
        methods: {
            addWorkSheet () {
                this.modifyId = ''
                this.isEdit = false
                this.visible = true
            },

            modified (isEdit) {
                if (!isEdit) this.activeTab = 'WorkSheetList'
                this.tableChangeIndex = ++this.tableChangeIndex % Number.MAX_SAFE_INTEGER // 防止溢出
            },

            closed () {
                this.tableChangeIndex = ++this.tableChangeIndex % Number.MAX_SAFE_INTEGER
            },

            assigned () {
                this.tableChangeIndex = ++this.tableChangeIndex % Number.MAX_SAFE_INTEGER
            },

            updated () {
                this.tableChangeIndex = ++this.tableChangeIndex % Number.MAX_SAFE_INTEGER
            },

            // 子组件请求修改工单
            reqModify (id) {
                this.modifyId = id
                this.isEdit = true
                this.visible = true
            },

            // 子组件请求关闭工单
            reqClose (id) {
                this.closeId = id
                this.visibleRating = true
            },

            // 子组件请求分配新的处理对象
            reqAssign (id) {
                this.assignId = id
                this.visibleAssign = true
            },

            ...mapActions([
                'getGlobalWorkSheet',
                'getRoleList',
                'getUserRole'
            ])
        },
        created () {
            if (this.$route.params && this.$route.params.tab) {
                //
                this.activeTab = this.$route.params.tab
            }

            this.getGlobalWorkSheet()
            this.getRoleList()
            this.getUserRole()
        }
    }
</script>

<style lang="scss" scoped>
    .work-sheet-content {
        height: calc(100% - 54px);
    }
</style>