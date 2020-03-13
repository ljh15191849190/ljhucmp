<template lang="pug">
    div.tag-table-caontainer
        div.common-tag-pane
            el-tooltip(effect="dark" :content="selectedTagName ? selectedTagName : '请选择'" placement="top-start") 
                div.select-tag.text-overflow-ellipsis(:class="{'has-select': !!selectedTagId, 'disabled-tag': formItem.disabled}") {{selectedTagName ? selectedTagName : '请选择'}}
            el-input.hidden(
                size="small"
                v-validate="computedValidation"
                v-model="selectedTagName"
                :name="'selectedTag'"
                :data-vv-as="formItem.label"
            )
            span.validator-error.is-danger(v-if="errors.has('selectedTag')") {{ errors.first('selectedTag') }}
            template(v-if="!formItem.disabled")
                div.tag-list
                    div.tag-item.text-overflow-ellipsis(v-for="item in commonTags" :key="item[id]" :class="{'active': selectedTagId === item[id]}"
                    @click="handleSelectedTag(item)") {{item[name]}}
                a.more-tag(@click="showMoreTag") {{'更多' + formItem.label}}
        el-dialog.z-index(v-if="dialogVisible" :title="formItem.label + '选择'" :visible.sync="dialogVisible" @close="closeDialog" width="600px")
            div.dialog-content
                div.search-pane
                    div {{formItem.label}}:
                    el-input.search-input(type="text" v-model.trim="keyWord"    clearable :placeholder="'请输入' + formItem.label + '查询'"
                    )
                    el-button.default-button(type="primary" size="small" @click="query") 查询
                div.tag-list
                    div.tag-item.text-overflow-ellipsis(v-for="item in tagList" :key="item[id]" :class="{'active': dialogSelectedTagId === item[id]}" @click="handleDialogSelectedTag(item)") 
                        el-tooltip(effect="dark" :content="item[name]" placement="top-start") 
                            span {{item[name]}}
            div.pagination
                el-pagination(
                    background
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="pagination.index"
                    :page-sizes="[10, 20]"
                    :page-size="pagination.size"
                    layout="sizes, total, prev, pager, next"
                    :total="pagination.total"
                    :page-count="pagination.count"
                )
            div.dialog-footer(slot="footer")
                el-button(@click="closeDialog" size="small") 取消
                el-button(type="primary" @click="save" size="small") 确定
</template>
<script>
/**
 * @description 标签table
 * 运用处: 应用申请
 */
import Api from '@api'
export default {
    name: 'TagTable',
    props: ['formItem', 'value', 'display'],
    inject: ['$validator'],
    data () {
        return {
            dialogVisible: false,
            pagination: { index: 1, total: 1, size: 20 },
            keyWord: '',
            selectedTag: {},
            dialogSelectedTag: null,
            dialogSelectedTagId: null,
            // 常见tag
            commonTags: [],
            // tag list
            tagList: []
        }
    },
    created () {
        if (this.value) {
            this.selectedTag[this.id] = this.value
            this.selectedTag[this.name] = this.display
        }
        
        this.getCommonTags()
    },
    methods: {
        getCommonTags () {
            let param = this.formItem.query_condition.data_link.param || {}
            Api.get(this.formItem.query_condition.data_link.endpoint, param, true).then(
                res => {
                    let result = this.formItem.query_condition.data_link.result
                    if (result)
                        this.commonTags = res[result]
                    else
                        this.commonTags = res
                }
            )
        },
        showMoreTag () {
            this.dialogSelectedTagId = this.selectedTagId
            this.dialogVisible = true
            this.getTagList()
        },
        closeDialog () {
            this.dialogVisible = false
        },
        getTagList () {
            let searchParams = {}
            searchParams[this.formItem.query_condition.query_attribute] = this.keyWord
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            let metaParam = this.formItem.query_condition.data_link.params || {}
            let resObj = Object.assign(pageParam, searchParams, metaParam)
            Api.get(this.formItem.query_condition.data_link.endpoint, resObj, true).then(
                res => {
                    let result = this.formItem.query_condition.data_link.result
                    if (result)
                        this.tagList = res[result]
                    else
                        this.tagList = res
                    this.pagination.total = res.total
                }
            )
        },
        save () {
            this.closeDialog()
            this.selectedTag = this.dialogSelectedTag
            // UCMP3-4988【服务目录】申请云应用，在更多应用中选择一个应用，页面还提示：不能为空
            // 问题原因：校验位置写错
            this.$validator.validate('selectedTag')
        },
        query () {
            this.pagination.index = 1
            this.getTagList()
        },
        handleSelectedTag (selectedTag) {
            this.selectedTag = selectedTag
            this.$validator.validate('selectedTag')
        },
        handleDialogSelectedTag (item) {
            this.dialogSelectedTag = item
            this.dialogSelectedTagId = item[this.id]
        },
         /**
         * @description 每页查询条数变化
         * @param size  页码大小
         */
        handleSizeChange (size) {
            this.pagination.size = size
            this.getTagList()
        },
        /**
         * @description 页码变化
         * @param index 页码索引
         */
        handleCurrentChange (index) {
            this.pagination.index = index
            this.getTagList()
        }
    },
    computed: {
        id () {
            let id = 'id'
            if (this.formItem.query_condition.data_link)
                id = this.formItem.query_condition.data_link.value_field

            return id
        },
        name () {
            let name = 'name'
            if (this.formItem.query_condition.data_link)
                name = this.formItem.query_condition.data_link.text_field

            return name
        },
        selectedTagId () {
            let selectedTagId = this.selectedTag[this.id] || ''
            this.$emit('update:value', selectedTagId)
            return selectedTagId
        },
        selectedTagName () {
            let selectedTagName = this.selectedTag[this.name] || ''
            this.$emit('update:display', selectedTagName)
            return selectedTagName
        },
        computedValidation () {
            let validation = {}
            validation.required = !!(this.formItem.validation.required || this.formItem.required)
            return validation
        }
    }
}
</script>

<style lang="scss" scoped>
%tag-view {
    width: 90px;
    height: 33px;
}
.tag-table-caontainer {
    .tag-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        .tag-item {
            border: 1px solid $borderColor;
            color: $fontContent;
            margin-right: 30px;
            margin-top: 20px;
            text-align: center;
            cursor: pointer;
            @extend %tag-view;
            &.active {
                background-color: $themeColor;
                color: $fontWhite;
            }
        }
    }
    .common-tag-pane {
        .select-tag {
            border: 1px solid $borderColor;
            color: $fontLightGrey;
            @extend %tag-view;
            text-align: center;
            &.has-select {
                background-color: $themeColor;
                color: $fontWhite;
            }
            &.disabled-tag {
                background-color: $disabledBgColor;
                color: $fontContent;
            }
        }
        .more-tag {
            display: inline-block;
            margin-top: 10px;
            text-decoration: underline;
            cursor: pointer;
            &:hover {
                color: $themeColor;
            }
        }
    }
    .dialog-content {
        height: 330px;
        .search-pane {
            display: flex;
            align-items: center;
            .search-input {
                margin: 0 10px;
                width: 415px;
            }
        }
        .tag-list {
            padding-left: 56px;
            .tag-item {
                margin-right: 18px;
            }
        }
    }
}
.pagination {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
</style>
<style lang="scss">
.tag-table-caontainer{
    .el-dialog__body {
        padding-bottom: 0;
    }
}
</style>
