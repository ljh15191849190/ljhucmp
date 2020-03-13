<template lang="pug">
    div.margin-bottom.no-padding-left.d-flex.flex-column
        el-card(shadow="hover")
            div(slot="header")
                span.card-title {{cardTitle || '标题'}}
            div.row.padding.no-margin-left.no-margin-right(v-for="content in cardContent")
                div.col-md-3.text-right.section-name {{content.name}}
                div.col-md-9.text-overflow-ellipsis
                    el-tooltip(v-if="content.isTag" effect="dark" :content="content.label + ''" placement="bottom-start")
                        el-tag(
                            :type="statusTypeObj[content.status] ? statusTypeObj[content.status].style : 'default'"
                            :style="content.custom_style ? content.custom_style : {}"
                            size="mini") {{content.label}}
                        //- el-tag(:type="content.type" size="mini") {{content.label}}
                    el-tooltip(v-else-if="content.isLink" effect="dark" :content="content.label + ''" placement="bottom-start")
                        span(v-if="content.key === 'tag_name'") {{content.label}}
                        router-link(v-else :to="content.link") {{content.label}}
                    // agent
                    template(v-else-if="content.isAgent")
                        div.d-flex(v-for="(agentStatus, agent) in content.label" v-if="agentStatus")
                            div.out-status(:class="{'up-out': agentStatus === 'up', 'down-out': agentStatus === 'down'}")
                                div.in-status(:class="agentStatus")
                                    span {{agent[0] | capitalized}}
                            span {{agentStatus | capitalized}}
                    //表格
                    template(v-else-if="content.isTable")
                        el-table.margin-top(:data="content.label" border)
                            el-table-column(:prop="column.prop" v-for="column in content.columns" :key="column.prop" :label="column.label")
                                template(slot-scope="scope")
                                    span {{scope.row[column.prop]}}
                    el-tooltip(v-else-if="content.isHtml" effect="dark" :content="content.label + ''" placement="bottom-start")
                        span(v-html="content.label")
                    // 图标
                    div(v-else-if="content.icon")
                        span.icon.ucmp-icon(v-if="content.label && content.label !== '--'" :class="content.label")
                        span(v-else) --
                    // 密码
                    div(v-else-if="content.password")
                        PassWordPanel(:displayItem="content")
                    el-tooltip(v-else effect="dark" :content="content.label + ''" placement="bottom-start")
                        span {{content.label}}
</template>
<script>
    /**
     * @description 云主机详情card详情 云主机详情-基本信息/云硬盘-基本信息页面使用
     */
    import { mapGetters } from 'vuex'
    import PassWordPanel from '@/components/common/PassWordPanel'
    export default {
        /**
         * @description 父组件传递的配置参数
         * @prop {string} cardTitle 左侧卡片面板的title
         * @prop {Array} cardContent 右侧卡片面板的内容
         */
        props: {
            cardTitle: String,
            cardContent: {
                type: Array,
                default: () => [],
                required: true
            },
            service_code: {
                type: String,
                default: () => ''
            },
            isRelatedService: {
                type: Boolean,
                default: () => false
            }
        },
        components: {PassWordPanel},
        data () {
            return {}
        },
        computed: {
            ...mapGetters([
                'metadata',
                'checkedMetadata'
            ]),

            /**
             * @description 状态类型对象集合，前端配置文件必须有state配置才可生效
             */
            statusTypeObj () {
                let rst = {}
                if (this.instanceAttributesObj.status && this.instanceAttributesObj.status.enum) {
                    this.instanceAttributesObj.status.enum.forEach(
                        status => {
                            rst[status.id] = status
                        }
                    )
                }
                return rst
            },
            instanceAttributesObj () {
                let rst = {}
                // 根据是否是关联服务确定checkedMetadata
                let checkedMetadata = this.isRelatedService ? this.metadata.find(item => item.service_code === this.service_code) : this.checkedMetadata
                if (checkedMetadata && checkedMetadata.attribute) {
                    // 此处checkedMetadata需要深拷贝之后再使用，因为在代码中会对instanceAttributesObj这个checkedMetadata的衍生对象进行修改，导致vuex报错
                    JSON.parse(JSON.stringify(checkedMetadata.attribute)).forEach(
                        attr => {
                            rst[attr.key] = attr
                        }
                    )
                }

                return rst
            }
        },
        filters: {
            capitalized (str) {
                str = str.toLowerCase()
                str = str[0].toUpperCase() + str.substring(1)
                return str
            }
        }
    }
</script>
<style lang="scss" scoped>
    .card-title {
        font-size: 16px;
        font-weight: bold;
    }

    .section-name {
        font-weight: 600;
    }

    .icon {
        font-size: 24px;
        line-height: 1;
    }
    .in-status {
        text-align: center;
        position: relative;
        padding: 7px;
        span {
            display: inline-block;
            color: #fff;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: 0;
            right: 0;
        }
    }
</style>
