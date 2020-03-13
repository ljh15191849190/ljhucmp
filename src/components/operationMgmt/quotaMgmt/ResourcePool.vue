<template lang="pug">
    div.full-container(slot="content")
        div.d-flex.full-height
            div.border-right.full-height.tree-width
                span.basicInfo 配额对象
                el-input.margin-top(v-model="searchProjectKey" clearable size="small" placeholder="请输入资源池名称搜索")
                el-tree.margin-top.tree-height(
                    ref="quotaTree"
                    accordion
                    :props="treeProps"
                    :data="Treedata"
                    :node-key="nodeKey"
                    :expand-on-click-node="false"
                    @node-click="nodeClick"
                    :highlight-current="true")
                        span(slot-scope="{node, data}")
                            span(style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;")
                                span {{data.template_name}}
            div.margin-top.quota-container.content-padding(v-loading="quotaAttrLoading")
                el-row.d-flex.align-items-flexstart(v-for="(attr, index) in quotaData" :key="index")
                    el-col(:span="4")
                        span.textlable {{attr.name}}
                    el-col.flex-InputNum(:span="18")
                        div.d-flex.align-items-center.padBottom(v-for="(item, index) in attr.quota_conf" :key="index")
                            div.quota-name
                                el-tooltip(v-if='item.quotaLabel&&item.quotaLabel.length>5' :content="item.quotaLabel" placement="top-end")
                                    span {{item.quotaLabel}}
                                span(v-else) {{item.quotaLabel}}
                            el-input-number.marginleft(
                                v-model="item.value"
                                controls-position="right"
                                :min="0"
                                :max="9999999"
                                :precision="0" 
                            )
                            div.input-group-append.tips-type(v-if="item.unit")
                                div.input-unit-text {{item.unit}}
                                el-tooltip(v-if="item.tips" :content="item.tips" placement="right")
                                    i.ucmp-icon-question.theme-color.Bigfont
                            div.quota-name.marginleft50(v-if="item.key !== 'snapshot'")
                                el-tooltip(v-if='item.usageLabel&&item.usageLabel.length>5' :content="item.usageLabel" placement="top-end")
                                    span {{item.usageLabel}}
                                span(v-else) {{item.usageLabel}}
                            div.quota-data(v-if="item.key !== 'snapshot'")
                                el-progress.progress-width.progress-adjust.marginleft(
                                    :text-inside="true" 
                                    :stroke-width="20" 
                                    :color="item.percentage <= 50 ? '#61c359' : (item.percentage <= 80 ? '#ffaa00' : '#e64550')"
                                    :percentage="item.percentage"
                                    )
                            //- 兼容页面样式
                            div.quota-name-place(v-if="item.key === 'snapshot'")
                            div.quota-data-place(v-if="item.key === 'snapshot'")
                                div.inner
                div.btn-save.d-flex.justify-content-center
                    el-button(type="warning" v-btn-privilege="'save_resource_pool_quota'" size="small" @click="saveQuota") 保存

</template>

<script>
/**
 * @description 配额管理-ResourcePool
 */

import Api from '@api'

export default {
    data () {
        return {
            // 搜索树的key值
            searchProjectKey: '',
            quotaData: [],
            saveServiceQuotas: [],
            objectId: '',
            quotaAttrLoading: false,
            // 保存按钮禁用
            isSave: true,
            //   树
            Treedata: [],
            treeProps: {
                label: 'service_name',
                isLeaf: 'leaf'
            },
            nodeKey: 'template_id'
        }
    },
    methods: {
        init () {
            let pageParam = { offset: 1, limit: 99999, template_id: 'page', keyword: this.searchProjectKey }
            Api.get('configTemplate', pageParam, true).then(
                res => {
                    this.Treedata = res.list
                    this.$nextTick(function () {
                        this.$refs.quotaTree.setCurrentKey(res.list[0].template_id)  
                        this.nodeClick(res.list[0])
                    })
                }
            )
        },
        async nodeClick (data, node) {
            await this.getAttr(data.service_code)
            this.objectId = data.template_id
            await this.getResourceQuota(data.template_id)
        },
        // 保存配额
        saveQuota () {
            // 根据是否配额保存各服务的配置
            this.saveQuotaConfig()
            // 有配额才保存
            if (this.saveServiceQuotas.length) {
                this.quotaAttrLoading = true
                let order_item = {}
                order_item.objectId = this.objectId
                order_item.objectType = 'resource_pool'
                order_item.data = this.saveServiceQuotas
                Api.post('SaveQuota', order_item, true).then(
                    () => {
                        this.$notify({
                            title: '通知',
                            type: 'success',
                            message: '保存成功!'
                        })
                        this.quotaAttrLoading = false
                        this.getResourceQuota(this.objectId)
                    },
                    () => {
                        this.quotaAttrLoading = false
                    }
                )
            }
        },
        // 生成配额
        saveQuotaConfig () {
            this.saveServiceQuotas = []
            this.quotaData.forEach(service => {
                let quotaItemObj = {}
                quotaItemObj.service_code = service.service_code
                quotaItemObj.quota_setting = {}
                service.quota_conf.forEach(attr => {
                    quotaItemObj.quota_setting[attr.key] = attr.value ? attr.value : null
                })
                this.saveServiceQuotas.push(quotaItemObj)
            })
        },
        // 获取资源配额
        getResourceQuota (id) {
            this.quotaAttrLoading = true
            let params = { objectType: 'resource_pool', objectId: id }
            Api.get('getQuotaData', params, true).then(
                res => {
                    // 处理对应服务的配额数据
                    this.handleResourceQuota(res)
                    this.quotaAttrLoading = false
                },
                () => {
                    this.quotaAttrLoading = false
                }
            )
        },
        handleResourceQuota (data) {
            if (data && data.length) {
                data.forEach(res => {
                this.quotaData.forEach(service => {
                    if (service.service_code === res.service_code) {
                    service.quota_conf.forEach(attr => {
                        for (let i in res.quota_setting) {
                            if (attr.key === i) {
                                attr.value = res.quota_setting[i].quota === null ? undefined : res.quota_setting[i].quota
                                attr.used = res.quota_setting[i].usage
                                attr.percentage = res.quota_setting[i].quota ? parseInt((res.quota_setting[i].usage + res.quota_setting[i].child_occupation) / res.quota_setting[i].quota * 100, 10) : 0
                            }
                        }
                    })
                    }
                })
                })
            }
        },

        // 清除所有配额
        clearQuotaConf () {
            // 清除保存和修改的标识
            this.isSave = true
            this.modifyQuotaNum = 0
            this.quotaData.forEach(service => {
                service.quota_conf.forEach(attr => {
                    attr.value = undefined
                    attr.used = 0
                    attr.total = 0
                    attr.percentage = 0
                })
            })
        },

        async getAttr (dataCode) {
            await Api.get('getresourceQuota', {}, true).then(res => {
                if (res) {
                    let resourceQuota = res.filter(item => item.service_code === dataCode)
                    resourceQuota.forEach(item => {
                        let result = []
                        item.quota_conf.forEach(val => {
                            let obj = {}
                            obj.key = val.attribute || val.type
                            obj.unit = val.unit
                            obj.tips = val.tips
                            obj.quotaLabel = val.label + '配额'
                            obj.usageLabel = val.label + '使用量'
                            obj.defaultValue = undefined
                            obj.value = undefined
                            obj.used = 0
                            obj.total = 0
                            obj.percentage = 0
                            result.push(obj)
                        })
                        item.quota_conf = result
                    })
                    this.quotaData = resourceQuota
                }
            })
        }
    },
    created () {
        // 初始化
        this.init()
    },
    watch: {
        // 检测数搜索添加变化
        searchProjectKey (val) {
            this.init()
        }
    }
}
</script>

<style lang="scss" scoped>
.marginleft50 {
    margin-left: 50px;
}
.padBottom {
    padding-bottom: 10px;
}
.flex-InputNum {
    display: flex;
    flex-direction: column;
    align-items: left;
}
.textlable {
    font-size: 15px;
    line-height: 45px;
}
.align-items-flexstart {
    flex-direction: flex-start;
}
.tree-width {
    width: 350px;
    padding-right: 20px;
}
.quota-container {
    width: calc(100% - 300px);
    height: 100%;
}
.content-padding {
    padding-left: 40px;
    padding-top: 10px;
    height: calc(100% - 55px);
    overflow-y: auto;
}
.basicInfo {
    font-size: 16px;
}
.marginleft {
    margin-left: 10px;
}
.quota-name {
    margin-right: 16px;
    width: 160px;
    font-size: 14px;
    color: #333;
    text-align: right;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.btn-save {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.unit-limit {
    width: 44px;
    display: flex;
    justify-content: center;
}
.progress-adjust {
    width: 150px;
    top: 25%;
}

.tree-height {
    height: calc(100% - 100px);
    overflow-y: auto;
}
.input-unit-text {
    width: 41px;
    padding: 7px 3px;
    margin-bottom: 0px;
    font-size: 12px;
    line-height: 2;
    color: #495057;
    text-align: center;
    white-space: nowrap;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
}
.tips-type {
    position: relative;
    .Bigfont {
        position: absolute;
        left: 45px;
        top: 5px;
        font-size: 16px;
    }
}
.quota-name-place {
    width: 160px;
    height: 21px;
    margin-right: 16px;
    margin-left: 50px;
}
.quota-data-place {
    .inner {
        width: 160px;
        height: 20px;
    }
}
.progress-width{
    /deep/ .el-progress-bar__inner{
        max-width: 100%;
    }
}
</style>
