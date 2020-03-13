<template lang="pug">
  div.full-container#sortList(ref="items")
    // 此处key设置成index会在chartsArr赋值过程中摧毁并重建组件
    component.float-left.dashboard-sort-item(
            v-for="item in chartsArr"
            :key="item"
            :prop="item"
            :is="item")
</template>
<script>
import Sortable from 'sortablejs'

// 我的业务
import Overview_my_business from './ItemComponents/User_business_u'
// 我的 资源
import Overview_my_resource from './ItemComponents/User_resource_u'
// 服务申请
import Overview_service_apply from './ItemComponents/Iaas_apply'
// 组织机构信息
import Overview_org_info from './ItemComponents/User_organization_u'
// 告警信息-----
import alarm_index from './ItemComponents/Alarm_index_g'
// 我的申请单 我的订单
import Overview_my_order from './ItemComponents/User_order_u'
// 我的审批
import Overview_my_approval from './ItemComponents/User_approve'
// 我的应用
import Overview_my_apps from './ItemComponents/User_application_u'
// 资源申请趋势
import Overview_resources_trend from './ItemComponents/Resource_apply_g'
// 容量分配趋势表格
import Overview_capacity_trend from './ItemComponents/Capacity_distribution_g'
// 告警--CPU使用率----
import cpu_used from './ItemComponents/Alarm_cpu_used_g'
// 内存使用率-----
import mem_used from './ItemComponents/Alarm_mem_used_g'
// 告警处理统计----
import alarm_deal from './ItemComponents/Alarm_deal_g'
// 告警趋势
import Overview_alarm_trend from './ItemComponents/Alarm_trend_g'
// 资源表格 资源概况
import Overview_resources from './ItemComponents/Provider_resource_u'
// 资源分布表格 资源概况
import Overview_capacity from './ItemComponents/Resource_overview_u'
// 应用占用资源--TOP10-----
import Overview_top10 from './ItemComponents/App_resource_top10'
import Overview_WorkSheet_statics from './ItemComponents/WorkSheet_statics'
import Overview_WorkSheet_mine from './ItemComponents/WorkSheet_mine'
import Overview_Cloud_desktop_online_people_top10 from './ItemComponents/Cloud_desktop_online_people_top10'
import Overview_Cloud_app_online_people_top10 from './ItemComponents/Cloud_app_online_people_top10'
import Overview_Cloud_app_online_duration_top10 from './ItemComponents/Cloud_app_online_duration_top10'
import Overview_Cloud_desktop_online_duration_top10 from './ItemComponents/Cloud_desktop_online_duration_top10'
//
import Overview_Cloud_app_frequency from './ItemComponents/Cloud_app_frequency'
import Overview_Cloud_app_and_desktop_frequency from './ItemComponents/Cloud_app_and_desktop_frequency'
import Overview_Month_frequency from './ItemComponents/Month_frequency'
import Overview_Info_summary from './ItemComponents/Info_summary'
import Overview_License_usage from './ItemComponents/License_usage'

export default {
    props: ['customItems'],
    components: {
        Sortable,
        Overview_my_business,
        Overview_my_resource,
        Overview_service_apply,
        Overview_org_info,
        alarm_index,
        Overview_my_order,
        Overview_my_approval,
        Overview_my_apps,
        Overview_capacity,
        Overview_resources_trend,
        Overview_capacity_trend,
        cpu_used,
        mem_used,
        alarm_deal,
        Overview_alarm_trend,
        Overview_resources,
        Overview_top10,
        Overview_WorkSheet_statics,
        Overview_WorkSheet_mine,
        //
        Overview_Cloud_desktop_online_people_top10, //done
        Overview_Cloud_app_online_people_top10, //done
        Overview_Cloud_app_online_duration_top10, //done
        Overview_Cloud_desktop_online_duration_top10, //done
        //
        Overview_Cloud_app_frequency, // done
        Overview_Cloud_app_and_desktop_frequency,
        Overview_Month_frequency, // done
        Overview_Info_summary,
        Overview_License_usage
    },
    data () {
        return {
            panelDB: null,
            loginUser: ''
        }
    },
    created () {
        this.loginUser = localStorage.getItem('systemUserName') || 'test'
    },
    methods: {
        dragStart (ev) {
        },
        sortCom (data, e) {
            let movedRow = data[e.oldIndex]
            data.splice(e.oldIndex, 1)
            data.splice(e.newIndex, 0, movedRow)
            localStorage.setItem('panel_sort' + this.loginUser, JSON.stringify(data))
        }
    },
    mounted () {
        let that = this
        /* eslint-disable */
        Sortable.create(this.$refs.items, {
            sort: true,
            scroll: true,
            animation: 150,
            group: {name: 'sortList', put: that.sortArr},
            handle: '.chart-header',
            draggable: '.dashboard-sort-item',
            chosenClass: 'sortable-chosen',
            onEnd(evt) {
                // 拖动后数据保存方法调用
                that.sortCom(that.sortArr, evt)
            },
            setData (dataTransfer) {
                // 处理火狐浏览器拖拽打开新页签问题
                dataTransfer.setData('ucmp_sort','')
            }
        })
    },
    computed: {
        chartsArr: {
            get () {
                return this.customItems
            },
            set () { }
        },
        sortArr () {
            return Object.assign([], this.customItems)
        }
    }
}
</script>
<style lang="scss" scoped>
.top-container {
    margin-bottom: 16px;
}
.top-container,
.bottom-container {
    height: calc(50% - 8px);
}
.ghost-item {
    border: 2px solid dotted;
}
.drag-item {
    opacity: 0.5;
}
.sortable-chosen{
    border: 2px dashed #333;
    opacity: 0.7;
}
</style>
<style lang="scss">
    .other-filters {
        .ucmp-icon-menu-collapse-btn {
            cursor: pointer;
            font-size: 18px;
        }
    }

    .el-popover {
        .el-form-item {
            margin-bottom: 6px;
        }

        .el-input, .el-select, .el-date-editor {
            max-width: 250px;
        }
    }
</style>
