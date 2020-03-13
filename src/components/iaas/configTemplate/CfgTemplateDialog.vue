<template lang="pug">
    div.cfg-temp-dialog(v-clickoutside="handleClickOutSide")
        el-tooltip(effect="dark" :content="systemConfig.configure_template" placement="bottom")
            i.ucmp-icon-cfg-template.icon-temp(@click="iconClick")
        div.dialog(v-show="isShowDialog && !disabled" :class="{'is_left': position === 'left', 'is_right': position === 'right'}")
            el-row.serach-pane
                el-input(placeholder="输入名称搜索" prefix-icon="el-icon-search"
                    v-model="name" @blur="searchName" size="mini" )
            div.empty(v-if="pagination.total === 0")
                div.desc-pane 暂无{{systemConfig.configure_template}}
            div.template-list-pane(v-else)
                div.template-item(v-for="(item, index) in templateList" :key="index" :class="{'active': templateId === item.template_id}" @click="selectTemplate(item)") 
                    el-tooltip(effect="light" :content="item.template_name" placement="top-start")
                        span {{item.template_name}}
                div.load-more(v-if="!isLoading && (templateList.length < pagination.total)" @click="loadMore") 加载更多...
                div.loading(v-if="isLoading")
                    i.el-icon-loading
                    span 加载中...
</template>
<script>
/**
 * @description 配置模板弹出层(审批使用)
 */
import Api from '@api'
import {mapGetters} from 'vuex'
import clickoutside from 'element-ui/lib/utils/clickoutside'
export default {
    name: 'CfgTemplateDialog',
    props: {
        providerId: {
            type: String,
            default: () => ''
        },
        service_code: {
            type: String,
            default: () => ''
        },
        org_id: {
            type: String,
            default: () => ''
        },
        templateId: {
            type: String,
            default: () => ''
        },
        position: {
            type: String,
            default: () => 'right'
        },
        disabled: {
            type: Boolean,
            default: () => false
        }
    },
    directives: {clickoutside},
    data () {
        return {
            name: '',
            isLoading: false,
            isShowDialog: false,
            templateList: [],
            pagination: { index: 1, total: 0, size: 10 }
        }
    },
    created () {
        this.getCfgTmpList()
    },
    methods: {
        /**
         * @description 搜索名称
         */
        searchName () {
            this.templateList = []
            this.pagination.index = 1
            this.getCfgTmpList()
        },
        /**
         * @description 加载更多
         */
        loadMore () {
            this.pagination.index += 1
            this.getCfgTmpList()
        },
        /**
         * @description 选择模板
         */
        selectTemplate (detail) {
            this.getCigTempDetail(detail.template_id)
        },
        /**
         * @description 获取配置模板详情
         */
        getCigTempDetail (template_id) {
            Api.get('configTemplate', {template_id: template_id}, true).then(
                res => {
                    this.$emit('selectTemplate', res, this.includeId, this.isIncludingService)
                    this.isShowDialog = false
                }
            )
        },
        /**
         * @description 模板列表
         */
        getCfgTmpList (isProviderChange = false) {
            let pageParam = { offset: this.pagination.index, limit: this.pagination.size }
            let provideParam = this.providerId ? {provider_id: this.providerId} : {}
            let serviceParam = this.service_code ? {service_code: this.service_code} : {}
            let serachParam = this.name ? {template_name: this.name} : {}
            let orgParam = this.org_id ? {org_id: this.org_id} : {}
            let resObj = Object.assign(pageParam, provideParam, serachParam, serviceParam, orgParam)
            Api.get('availableTemplates', resObj, true).then(
                res => {
                    this.isLoading = false
                    //下拉加载更多叠加数据
                    this.templateList = isProviderChange ? res.list : [...this.templateList, ...res.list]
                    this.pagination.total = res.total
                }, () => {
                    this.isLoading = false
                }
            )
        },
        /**
         * @description 选择创建模板点击事件
         */
        iconClick () {
            this.isShowDialog = !this.isShowDialog
        },
        /**
         * @description 点击外部元素事件
         */
        handleClickOutSide () {
            this.isShowDialog = false
        }
    },
    computed: {
        ...mapGetters([
            'systemConfig'
        ])
    },
    watch: {
        providerId () {
            this.pagination.index = 1
            this.getCfgTmpList(true)
        }
    }
}
</script>
<style lang="scss" scoped>
.cfg-temp-dialog {
    position: relative;
    text-align: right;
    .icon-temp {
        font-size: 24px;
        cursor: pointer;
    }
    .dialog {
        width: 200px;
        height: 300px;
        border: 1px solid $borderColor;
        position: absolute;
        z-index: 100;
        background-color: $fontWhite;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        &.is_left {
            left: 0;
        }
        &.is_right {
            right: 0;
        }
        .empty {
            .desc-pane {
                padding-top: 100px;
                text-align: center;
                color: $fontTitleLight;
            }
        }
        .serach-pane {
            padding: 10px;
        }
        .template-list-pane {
            height: 250px;
            overflow-y: auto;
            padding: 5px 20px 20px;
            .template-item {
                margin-bottom: 15px;
                background-color:$globalBgColor;
                height: 30px;
                line-height: 30px;
                padding-left: 5px;
                border-radius: 5px;
                text-align: center;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                &:hover {
                    cursor: pointer;
                }
                &.active {
                    background-color: $themeColor;
                    color: $fontWhite;
                }
            }
            .load-more {
                text-align: center;
                font-size: 12px;
            }
            .loading {
                text-align: center;
            }
        }
    }
}
</style>
