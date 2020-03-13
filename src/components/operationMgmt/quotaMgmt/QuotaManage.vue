<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.full-container(slot="content")
            el-tabs(v-model="activeTab")
                el-tab-pane(v-for="item in tabs" :label="item.label" :name="item.name" :key="item.name")
            div.subnet-table
                component(:is="activeTab")
</template>
<script>
import QuotaProject from './QuotaProject'
import QuotaOrg from './QuotaOrg'
import ApplyQuota from './ApplyQuota'
import ResourcePool from './ResourcePool'
import { mapGetters } from 'vuex'
/**
 * @description 
 */
export default {
    data () {
        return {
            activeTab: 'project',
            tabs: [
                { label: '项目配额设置', name: 'project' },
                { label: '组织机构配额设置', name: 'organization' },
                { label: '资源池配额设置', name: 'resourcePool' },
                { label: '申请配额', name: 'apply' }
            ],
            breadcrumbItems: [       
                { prop: '', label: '配额管理' }
            ]
        }
    },
    computed: {
        ...mapGetters([
            'businessOrproject',
            'systemConfig'
        ]),

        selectedBusinessLabel () {
            return this.businessOrproject === 'business' ? '业务' : '项目'
        }
    },
    created () {
        this.tabs[0].label = `${this.selectedBusinessLabel}配额设置`
        this.tabs[2].label = `${this.systemConfig.configure_template}配额设置`
        // 由于目前页签只做一个权限  无法使用封装权限指令，暂时使用判断，后期做到这块权限设置时候在一并使用权限指令
        const btnPermissionsStr = JSON.parse(sessionStorage.getItem('btnPermissionsStr')).filter(item => item.title === '运营管理')
        const btnoperation = btnPermissionsStr[0].subMenus.filter(i => i.title === '配额管理')
        if (btnoperation[0].subButton && btnoperation[0].subButton.length > 0) {
            let applyQuota = btnoperation[0].subButton.filter(item => item.button_code === 'apply_quota')
            if (!applyQuota.length) 
                this.tabs.pop()
        } else 
            this.tabs.pop()
    },
    components: {
        project: QuotaProject,
        organization: QuotaOrg,
        apply: ApplyQuota,
        resourcePool: ResourcePool
    }
}
</script>
<style lang="scss" scoped>
.subnet {
    height: 100%;
}
.subnet-table {
    height: calc(100% - 54px);
}
</style>
