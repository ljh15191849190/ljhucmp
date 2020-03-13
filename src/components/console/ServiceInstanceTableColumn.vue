<template lang="pug">
    div
        div(v-if="!column.groups && !column.multiple")
            span(v-if="column.href && checkedMetadata.type !== 'business'")
                span(v-if="row.noLink && row.noLink[column.prop]") --
                div(v-else-if="Array.isArray(row[column.prop])")
                    p.theme-color.column-name(v-for="(columnVal, idx) in row[column.prop]" :key="idx" @click="checkedInstance(column, columnVal)") {{handleRelateService(column, columnVal)}}
                span.theme-color.column-name(v-else @click="checkedInstance(column, row)") {{row[column.prop]}}
            div(v-else-if="column.enum && column.enum.length")
                el-tag(
                :type="statusTypeObj[row.status] ? statusTypeObj[row.status].style : 'default'"
                :style="statusTypeObj[row.status] && statusTypeObj[row.status].custom_style ? statusTypeObj[row.status].custom_style : {}"
                size="mini"
                v-if="column.prop === 'status'") {{formatterAttr(column, row)}}
                el-tag(
                :type="opStatusTypeObj[row.op_status] ? opStatusTypeObj[row.op_status].style : 'default'"
                :style="opStatusTypeObj[row.op_status] && opStatusTypeObj[row.op_status].custom_style ? opStatusTypeObj[row.op_status].custom_style : {background: 'transparent', color: '#333'}"
                size="mini"
                v-else-if="column.prop === 'op_status'") {{formatterAttr(column, row)}}
                div.d-flex(v-else-if="column.prop === 'at_agent_status' || column.prop === 'ucmp_agent_status'")
                    div.out-status(:class="{'up-out': row[column.prop] === 'up', 'down-out': row[column.prop] === 'down'}")
                        el-tooltip(effect="dark" :content="column.group_column_label" placement="left")
                            div.in-status(:class="row[column.prop]")
                                span {{column.group_column_label[0]}}
                    span {{formatterAttr(column, row)}}
                span(v-else) {{formatterAttr(column, row)}}
            //- bug UCMP-845【云硬盘】云硬盘列表，云硬盘类型显示不正确
            span(v-else-if="column.prop === 'owner_type' || column.prop === 'resource_expired_at' || column.prop === 'created_at' || (serviceCode === 'volume' && column.prop === 'type') || (serviceCode === 'tag' && (column.prop === 'tag_type' || column.prop === 'service_code'))") {{ formatterColumn(column.prop, row) }}
            span(v-else-if="column.prop === 'tag' || column.key === 'tag'")
                div(v-if="getTagList(row.tag) && getTagList(row.tag).length")
                    p.tag-list(v-for="item in getTagList(row.tag)")
                        el-tag(size="mini", type="success", style="padding: 2px 3px;") {{item}}
                span(v-else) --
            span(v-else-if="column.icon")
                span.ucmp-icon(v-if="row[column.prop]" :class="row[column.prop]")
                span(v-else) --
            // UCMP3-266 【优化】【优先级中】界面中将JSON字符串进行优化 -- 隐藏了IPV6
            p.array-column(v-else-if="itemLabel")
                span.text-light-grey(v-if="itemLabel") {{ itemLabel }}
                span {{row[column.prop]}}
            // 字符串数组处理
            span(v-else-if="Array.isArray(row[column.prop])") {{row[column.prop].length? row[column.prop].join(',') : '--'}}
            span(v-else) {{(row[column.prop] || row[column.prop] === 0) ? row[column.prop] : '--'}}

            // 租期icon 需要在首列展示
            span.margin-left(v-if="colIndex === 0 && row.expired_status")
                el-tooltip(:content="expiredStatus[row.expired_status]" placement="right")
                    i.ucmp-icon-tenancy-soon(v-if="row.expired_status === 'soon_to_expire'")
                    i.ucmp-icon-tenancy-expired(v-if="row.expired_status === 'expired'")
        div(v-else-if="!column.groups && column.multiple")
            div(v-if="Array.isArray(row[column.prop]) && row[column.prop].length")
                ServiceInstanceTableColumn(
                    v-for="(cell, index) in row[column.prop]"
                    :key="index"
                    :column="seperateColumn(column)"
                    :row="seperateRow(column, cell)"
                    :instanceAttributesObj="instanceAttributesObj"
                    :metadata="metadata"
                    :checkedMetadata="checkedMetadata"
                    :serviceCode="serviceCode"
                    :itemLabel="itemLabel")
            span(v-else-if="Array.isArray(row[column.prop]) && !row[column.prop].length") --
            span(v-else) {{ row[column.prop] || '--' }}
        // UCMP3-1149 控制台列表部分指定行合并显示
        div.d-flex.align-item-start(v-else v-for="child in column.groups" :key="child.prop" )
            template(v-if="row[child.prop] !== undefined && row[child.prop] !== '' && row[child.prop] && row[child.prop].length")
                span.inline-block(v-if="!Array.isArray(row[child.prop]) && child.group_column_label && column.prop !== 'agent_group'" :style="child.labelStyleSheels || {}") {{ child.group_column_label }}
                ServiceInstanceTableColumn.inline-block(:column="child" :row="row" :instanceAttributesObj="instanceAttributesObj" :metadata="metadata" :checkedMetadata="checkedMetadata" :serviceCode="serviceCode" :itemLabel="child.group_column_label")
</template>
<script>
    import {mapActions} from 'vuex'
    import MetadataUtils from '@server/metadata.utils'
    import Utils from '@server/date-utils'
    import { VolumeType } from '@server/ConstParams'
    import {isIpv6} from '@mock/util.mock'
    import expiredStatus from '@mock/console/renewal.mock'

    export default {
        name: 'ServiceInstanceTableColumn',
        props: ['column', 'row', 'metadata', 'checkedMetadata', 'serviceCode', 'instanceAttributesObj', 'itemLabel', 'colIndex'],
        data () {
            return {
                expiredStatus: expiredStatus
            }
        },
        computed: {
            tagTypes () {
                const tagMetaData = MetadataUtils.getCheckedMeta(this.metadata, 'tag')
                const metaColumn = tagMetaData.attribute.find(item => {
                    return item.key === 'tag_type'
                })

                return metaColumn ? metaColumn.enum : []
            },
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
            /**
             * @description 操作状态的对象集合
             */
            opStatusTypeObj () {
                let rst = {}
                if (this.instanceAttributesObj.status && this.instanceAttributesObj.op_status.enum) {
                    this.instanceAttributesObj.op_status.enum.forEach(
                        status => {
                            rst[status.id] = status
                        }
                    )
                }
                return rst
            },
            tagServiceCodes () {
                const tagMetaData = MetadataUtils.getCheckedMeta(this.metadata, 'tag')
                const metaColumn = tagMetaData.attribute.find(item => {
                    return item.key === 'service_code'
                })

                return metaColumn ? metaColumn.enum : []
            }
        },

        methods: {
            // 处理所属云主机的展示和跳转
            handleRelateService (col, row) {
                return col.text_field && row[col.text_field] ? row[col.text_field] : ''
            },

            formatterColumn (prop, row) {
                if (prop === 'resource_expired_at')
                // Fixed bug #UCMP-567 【云主机】在云主机列表，存量资源租期显示NaN-An-An
                // 完善云主机租期对应prop字段不存在的场景
                    return (!row[prop] || row[prop] === '--') ? '--' : Utils.formate(row[prop], 'yyyy-MM-dd')

                // 优化显示创建时间
                if (prop === 'created_at')
                    return (!row[prop] || row[prop] === '--') ? '--' : Utils.formate(row[prop], 'yyyy-MM-dd hh:mm:ss')

                if (prop === 'owner_type') {
                    // UCMP-625 同步的主机没有owner_type属性时不予赋值
                    switch (row[prop]) {
                        case 'org':
                            return '组织机构'
                        case 'app':
                            return '应用'
                        // UCMP3-3139【云厂商】同步云厂商后，同步过来的云主机资源所属类型为“个人”，存量资源无资源所属，应该显示为“--”
                        case 'personal':
                            return '个人'
                        default:
                            return '--'
                    }
                }
                // bug UCMP-845【云硬盘】云硬盘列表，云硬盘类型显示不正确
                if (this.serviceCode === 'volume' && prop === 'type')
                    return row[prop] ? (VolumeType[row[prop]] ? VolumeType[row[prop]] : row[prop]) : '--'

                if (this.serviceCode === 'tag') {
                    if (prop === 'tag_type') {
                        const getOne = this.tagTypes.find(item => {
                            return item.id === row[prop]
                        })

                        return getOne ? getOne.name : ''
                    }

                    if (prop === 'service_code') {
                        const getOne = this.tagServiceCodes.find(item => {
                            return item.id === row[prop]
                        })

                        return getOne ? getOne.name : ''
                    }
                }
            },
            /**
             * @description 需要解析显示的表格列
             */
            formatterAttr (column, row) {
                // UCMP3-888 控制台管理页面显示网络类型特殊配置
                if (this.serviceCode === 'qingcloud_lb' && column.prop === 'vxnet_type' && !row[column.prop])
                    row[column.prop] = '0'
                let allStateKeys = this.getTransformObj(column)
                if (allStateKeys && allStateKeys[row[column.prop]] && allStateKeys[row[column.prop]].name)
                    return allStateKeys[row[column.prop]].name || '--'
                else
                    return row[column.prop] ? row[column.prop] : '--'
            },

            getTagList (tagList) {
                // 标签传递下来时为Object
                if (Array.isArray(tagList)) {
                    return tagList.map(item => {
                        let tagType = this.tagTypes.find(tagType => {
                            return tagType.id === item.tag_type
                        })
                        return `${tagType.name || ''}: ${tagList.tag_name}`
                    })
                } else if (typeof tagList === 'object') {
                    let tagType = this.tagTypes.find(tagType => {
                        return tagType.id === tagList.tag_type
                    })
                    return [`${tagType.name || ''}: ${tagList.tag_name}`]
                } else return []
            },

            /**
             * @description 获取元数据属性中enum类型的映射值
             */
            getTransformObj (column) {
                let rst = {}
                if (column.prop && this.instanceAttributesObj[column.prop] && this.instanceAttributesObj[column.prop].enum) {
                    this.instanceAttributesObj[column.prop].enum.forEach(
                        status => {
                            rst[status.id] = status
                        }
                    )
                }
                return rst
            },

            /**
             * @description 点击表格的超链接事件
             */
            checkedInstance (column, row) {
                // bug UCMP-1333【控制台】mysql和tomcat资源列表中，云主机详情中基础信息无内容。
                let routerIdKey = row[column.routerIdKey]
                sessionStorage.setItem('checkedServiceInstanceId', routerIdKey)
                sessionStorage.setItem('checkedServiceProviderId', row.provider_id)
                sessionStorage.setItem('checkedBaremetalBareId', row.bare_id)
                this.setCheckedInstanceId(routerIdKey)
                this.setCheckedProviderId(row.provider_id)
                if (this.checkedMetadata && this.checkedMetadata.group !== 'blueprint')
                    this.$router.push(column.router + routerIdKey)
                else
                    this.$router.push('/' + this.serviceCode + '/bp_detail/' + routerIdKey + '?provider_id=' + row.provider_id + '&name=' + row.name)
            },

            isIpv6 (item) {
                return isIpv6(item)
            },

            seperateColumn (column) {
                let rst = JSON.parse(JSON.stringify(column))
                rst.multiple = false
                return rst
            },

            seperateRow (column, cell) {
                return {[column.prop]: cell}
            },

            ...mapActions([
                'setCheckedProviderId',
                'setCheckedInstanceId'
            ])
        }
    }
</script>
<style lang="scss" scoped>

    .ucmp-icon {
        font-size: 24px;
        line-height: 1;
    }
    // UCMP3-1416 table row的 p标签行间距设定减小(默认1em)
    .array-column {
        margin-bottom: 0px;
        line-height: 18px;
    }

    // UCMP3-1757 覆盖默认 P margin-bottom: 1rem; 与 上述 UCMP3-1416 实际是一个问题
    p {
        margin-bottom: 0;
    }

    .text-light-grey {
        margin-right: 8px;
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
