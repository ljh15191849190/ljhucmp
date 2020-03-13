<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            div.top-button-container
                el-button.default-button(type="primary" size="small" icon="el-icon-circle-plus-outline" @click="add") 创建公告
            UcmpTableContainer(:pagination="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange")
                div.d-flex.height-fit-content(slot="basic-filter")
                    el-form.demo-form-inline(:inline="true" size="small" v-model="searchForm")
                        el-form-item(label="标题")
                            el-input(v-model="searchForm.title" clearable)
                        el-form-item(label="状态")
                            el-select(v-model="searchForm.onlineFlag" clearable)
                                el-option(v-for="item in options" :key="item.value" :label="item.label" :value="item.value")

                div(slot="filter-btns")
                    el-button.default-button(type="primary" size="small" ) 查询

                div.full-height.padding-top.border-top(slot="tableContainer")
                    div.margin-bottom
                        el-button(size="small" type="primary" disabled) 删除
                    el-table.panel-table(:data="tableData" border)
                        el-table-column(type="selection" width="55px")
                        template(v-for="column in columns" )
                            el-table-column(v-if="column.isLink" :label="column.label")
                                template(slot-scope="scope")
                                    a(href="javascript:;" @click="view(scope)" v-html="scope.row[column.prop]")
                            el-table-column(v-else :prop="column.prop" :key="column.prop" :label="column.label")
</template>

<script>
    /**
     * @description 通知公告
     */
    export default {
        name: 'AnnouncementList',
        data () {
            return {
                breadcrumbItems: [
                    {prop: '', label: '通知公告'}
                ],
                searchForm: {},
                pagination: {
                    index: 1,
                    count: 1,
                    size: 20
                },
                options: [
                    {value: 'ON', label: '启用'},
                    {value: 'OFF', label: '停用'}
                ],
                columns: [
                    {prop: 'title', label: '标题', isLink: true},
                    {prop: 'lastModifiedBy', label: '最后更新人'},
                    {prop: 'lastModifiedDate', label: '更新时间'},
                    {prop: 'onlineFlag', label: '状态'}
                ],
                tableData: [{
                    'id': 1,
                    'title': 'test',
                    'content': '<p>test</p>\n',
                    'publishDate': '2018-05-18T02:48:06.000Z',
                    'onlineFlag': 'ON',
                    'focusFlag': 'ON',
                    'enableFlag': 'Enabled',
                    'createdBy': 'system',
                    'createdDate': '2018-05-18T02:48:09.000Z',
                    'lastModifiedBy': 'system',
                    'lastModifiedDate': '2018-05-18T02:49:09.000Z'
                }]
            }
        },
        methods: {
            handleCurrentChange () {
            },
            handleSizeChange () {
            },
            add () {
                this.$router.push('/edit-announcement/add')
            },
            view (scope) {
                this.$router.push('/edit-announcement/' + scope.row.id)
            }
        },
        created () {

        }
    }
</script>
<style lang="scss" scoped>

</style>

