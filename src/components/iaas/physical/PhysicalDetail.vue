<template lang="pug">
  UcmpContainer(:breadcrumbItems="breadcrumbItems")
    div.full-container(slot="content")
        el-form.btn-group-height(v-if="allActions.iconGroup.length + allActions.moreGroup.length" label-width="120px" size="small" label-position="left")
            OperatorPanel.margin-left(
                v-if="donatube"
                ref="operatorRef"
                :basicBtns="allActions.iconGroup"
                :advancedBtns="allActions.moreGroup"
                :instances="selectedInstances"
                @operationClick="operationClick"
            )
        el-tabs.instance-calc-container(v-model="activeTab" @tab-click="handleTabClick")
            el-tab-pane.full-height(v-for="item in tabs" :label="item.label" :name="item.type" :key="item.type")
                router-view(:key="$route.fullPath" v-if="item.type === activeTab")
        el-dialog(title="修改物理机" v-if="phyVisible" :visible.sync="phyVisible" width="800px")        
            Newphysical(@closeDialog="closeDialog" @submitPhy="submitPhy" :selectRow="selectedInstances")
</template>
<script>

import OperatorPanel from '@/components/common/panels/OperatorPanel'
import Physical from '@mock/subnet/physical.mock'
import ServiceInstanceMixin from '@mixins/serviceInstance.mixin'
import Newphysical from './Newphysical'
import Api from '@api'
import { mapActions } from 'vuex'

export default {
    mixins: [ServiceInstanceMixin],
    name: 'PhysicalDetail',
    data () {
        return {
            allActions: {
                iconGroup: Physical.allActions.iconGroup,
                moreGroup: Physical.allActions.moreGroup
            },
            tabs: [
                { label: '基础信息', type: 'basic' },
                { label: '硬件监控', type: 'hardware_monitor' },
                { label: '告警信息', type: 'alarm' },
                { label: '告警策略', type: 'strategy' }
            ],
            activeTab: 'basic',
            breadcrumbItems: [       
                { prop: '', label: '物理机详情' }
            ],
            selectedInstances: [{}],
            detailBasic: {},
            donatube: '',
            phyVisible: false
        }
    },
    methods: {
        closeDialog () {
            this.phyVisible = false
        },
        /**
         * @description 修改物理机
         */
        submitPhy () {
            this.phyVisible = false
            this.getinitList()
        },
        ...mapActions([
            'setSelectedInstanceInfo',
            'setSelectedInstancephyInfo'
        ]),
        handleTabClick () {
            this.$router.push('/physical/physicalDetail/' + this.$route.params.id + '/' + this.activeTab)
        },
        operationClick (btn, self) {
            //操作按钮
            if (btn.name !== 'modify') {
                let instanceNames = []
                let instanceIds = []
                instanceNames.push(this.detailBasic.name)
                instanceIds.push(this.detailBasic.bare_id)
                let msg_tip = `确定${btn.label}${instanceNames.join(',')}吗？`
                this.$confirm(msg_tip, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(
                    () => {
                        let params = {}
                        if (btn.name === 'console') {
                            params = {
                                id: instanceIds.join(','),
                                target_type: 'physical'
                            }
                        } else {
                            params = {
                                bareId: instanceIds.join(',') 
                            }
                        }
                        Api[btn.endpoint.method.toLowerCase()](btn.endpoint.url, params, true).then(res => {
                            this.getinitList()
                        }).catch(() => {})
                    }
                ).catch(() => {})
            } else 
                this.phyVisible = true
        },
        getinitList () {
            let resObj = {bareId: this.$route.params.bare_id}
            Api.get('physic_getDetailPhy', resObj, false).then(
                res => {
                    res.isBelongToEcs = 'notBelong'
                    this.setSelectedInstancephyInfo(res)
                    this.setSelectedInstanceInfo(res)
                    this.detailBasic = res
                    this.selectedInstances = [res]
                },
                () => {
                }
            )
        }
    
    },
    destroyed () {
        this.setSelectedInstanceInfo(null)
    },
    components: {
        OperatorPanel, Newphysical
    },
    created () {
        this.donatube = this.$route.params.donatube
        this.getinitList()
        // 初始化
        this.$router.push('/physical/physicalDetail/' + this.$route.params.id + '/' + this.activeTab)
    }
}
</script>
<style lang="scss" scoped>
.calc-container {
  height: calc(100% - 100px);
}
.btn-group-height {
    height: 30px;
}
.pane-height {
    height: calc(100% - 28px);
}
.instance-calc-container {
    height: calc(100% - 30px - 10px);
}
</style>
