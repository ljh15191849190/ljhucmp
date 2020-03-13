<template lang="pug">
    div.full-height.overflow-y-auto
        div.filter-items.margin-bottom
            <!--el-cascader.margin-right(size="small" :options="orgnizations" v-model="selectedOrgs" :props="props" @change="changeOrgs" filterable clearable change-on-select placeholder="请选择组织机构")-->
            div.filter-org
                SearchInputOrganization(v-model="selectedOrgs")
            el-select.margin-right(size="small" v-model="selectedBusiness" :disabled="!selectedOrgs" multiple :multiple-limit="multipleLimit" filterable :placeholder="!selectedOrgs ? '请先选择组织机构' : `请选择${selectedBusinessLabel}`"  @change="changeBuses" collapse-tags)
                el-option(v-for="(item, index) in businessList" :key="index" :label="item.name" :value="item.id")
            el-date-picker.picker-width.margin-right(size="small" v-model="searchParams.dateRange" type="daterange" :value-format="dateFormat" :clearable="timeClearable" @change="changeDateRange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期")
            el-button.oper-icon-btn(size="small" icon="ucmp-icon-download" @click="exportReport")
        div.dash-chart-container.border
            div.chart-header.chart-header-gray 审批中的资源趋势
            div.chart-container(v-loading="isLoading" element-loading-spinner="ucmp-icon-loading")
                LineChart(:options="approvingOptions")
        div.dash-chart-container.border
            div.chart-header.chart-header-gray 使用中资源趋势
            div.chart-container(v-loading="isLoading" element-loading-spinner="ucmp-icon-loading")
                LineChart(:options="usingOptions")
</template>
<script>
import LineChart from '../../common/charts/LineCharts'
import SearchInputOrganization from '@common/SearchInputOrganization'
import Api from '@api'
import FileSaver from 'file-saver'
import {mapGetters} from 'vuex'

const buildOptions = function (dataArr) {
    let seriesArr = []
    dataArr.forEach(item => {
        let seriesItem = {
            name: item.owner_name,
            data: []
        }
        if (item.items && item.items.length) {
            item.items.forEach(_single => {
                seriesItem.data.push([_single.created_date, _single.res_count])
            })
        }
        seriesArr.push(seriesItem)
    })
    return {
        tooltip: {
            pointFormat: '{series.name}：{point.y}<br>{point.x:%Y-%m-%d}'
        },
        legend: {
            enabled: true
        },
        series: seriesArr
    }
}

export default {
    data () {
        return {
            dateFormat: 'yyyy-MM-dd',
            searchParams: {
                orgIds: '',
                businessIds: '',
                dateRange: []
            },
            orgs: [],
            businessList: [],
            props: {
                label: 'org_name',
                value: 'id',
                children: 'sub_orgs'
            },
            services: [],
            resourcePools: [],
            lineOptions: {},
            orgnizations: [],
            approvingOptions: {},
            usingOptions: {},
            selectedBusiness: [],
            selectedOrgs: null,
            multipleLimit: 5,
            timeClearable: false,
            isLoading: false
        }
    },
    created () {
        Api.get('orgTree', {}).then(res => {
            this.orgnizations = res.data
            // let orgs = []
            // res.forEach(item => {
            //     orgs.push(item._id)
            // })
            // 修改默认查询时间为一周内
            let now = new Date()
            let startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 7)).toISOString().slice(0, 10)
            let endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1)).toISOString().slice(0, 10)
            this.searchParams.dateRange.push(startDate)
            this.searchParams.dateRange.push(endDate)
            // this.searchParams.orgIds = orgs.join(',')
            this.initLineCharts(this.searchParams)
        })
    },
    computed: {
        ...mapGetters([
            'businessOrproject'
        ]),
        selectedBusinessLabel () {
            return this.businessOrproject === 'business' ? '业务' : '项目'
        }
    },
    methods: {
        initLineCharts (searchParams) {
            let startDate = ''
            let endDate = ''
            if (this.searchParams.dateRange && this.searchParams.dateRange.length) {
                startDate = new Date(this.searchParams.dateRange[0]).getTime()
                endDate = new Date(this.searchParams.dateRange[1]).getTime()
            }
            let usingList = Api.get('res_trend', { status: 'using', orgIds: searchParams.orgIds, businessIds: searchParams.businessIds, startDate: startDate, endDate: endDate })
            let approvingList = Api.get('res_trend', { status: 'approving', orgIds: searchParams.orgIds, businessIds: searchParams.businessIds, startDate: startDate, endDate: endDate })
            this.isLoading = true
            Promise.all([usingList, approvingList]).then((result) => {
                this.isLoading = false
                this.usingOptions = buildOptions(result[0])
                this.approvingOptions = buildOptions(result[1])
            }, () => {
                this.isLoading = false
            })
        },
        concatApps (businessList, org) {
            if (org && org.length) {
                org.forEach(_org => {
                    businessList = businessList.concat(_org.business)
                    if (_org.subOrgs && _org.subOrgs.length)
                        businessList = this.concatApps(businessList, _org.subOrgs)  // 递归处理子组织机构
                })
            }
            return businessList
        },
        changeOrgs (val) {
            this.searchParams.orgIds = this.selectedOrgs.org_id || ''

            this.selectedBusiness = []
            this.searchParams.businessIds = ''
            this.businessList = []
            if (!val) {
                //
                this.initLineCharts(this.searchParams)
            } else {
                Api.get('businessListByOrgRoot', {org_id: this.selectedOrgs.org_id}).then(res => {
                    this.businessList = res.data.business
                    // if (res && res.length)
                    // this.businessList = this.concatApps(this.businessList, res)
                })
            }
        },
        changeBuses () {
            this.searchParams.businessIds = this.selectedBusiness.join(',')
            this.initLineCharts(this.searchParams)
        },
        changeDateRange (val) {
            this.initLineCharts(this.searchParams)
        },

        exportReport () {
            let param = {
                startDate: this.searchParams.dateRange[0],
                endDate: this.searchParams.dateRange[1],
                orgIds: this.searchParams.orgIds,
                businessIds: this.searchParams.businessIds
            }
            Api.get('export_resource_tend', param, true, 'blob').then(res => {
                let blob = new Blob([res], {type: 'application/vnd.ms-excel'})
                FileSaver.saveAs(blob, '资源趋势报表.xlsx')
                this.$notify({
                    type: 'success',
                    title: '成功',
                    message: '导出成功'
                })
            })
        }
    },
    watch: {
        selectedOrgs (newVal) {
            this.changeOrgs(newVal)
        }
    },
    components: { LineChart, SearchInputOrganization }
}
</script>
<style lang="scss" scoped>
.filter-items {
    display: flex;
    justify-content: flex-end;

    .filter-org {
        max-width: 200px;
        margin-right: 16px;
    }
}
.charts-flex {
    height: calc(100% - 50px);
}
.dash-chart-container {
    box-shadow: none !important;
    height: 380px;
    width: 100%;
    &:nth-child(1) {
        margin-right: 10px;
    }
}

.padding-20 {
    padding: 0 20px;
    height: calc(100% - 50px);
}
</style>

