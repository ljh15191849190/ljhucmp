<template lang="pug">
    div.full-height
        UcmpContainer(:breadcrumbItems="breadcrumbItems" :bgEmpty="true")
            div.full-container(slot="content")
                div.top-button-container
                    el-button.default-button.creat-button(type="primary" size="small" icon="el-icon-plus" @click="addCloudProvider") 添加云厂商
                div.full-height.overflow-y-auto.page-marginTop
                    EmptyPage(v-if="cloudProviders.length === 0")
                        div(slot="content")
                            span.desc 目前还没有添加任何云厂商,
                            span.theme-color.add(@click="addCloudProvider") 添加云厂商
                    div.cloud-provider-container(v-else)
                        div.cloud-provider-item(v-for="(item, index) in cloudProviders" :key="index")
                            div.cloud-provider-content
                                a.cloud-info(@click="toDetail(item)")
                                    span(:class="item.provider_code")
                                    el-tooltip(:content="item.name" placement="right")
                                        p.column-name.cloudprovider-name {{item.name}}
                                div.cloud-source
                                  el-carousel(:autoplay="false", height="159px", trigger="click", :arrow="getObjectKeysLen(item.stats)/2 > 1 ? 'hover' : 'never'")
                                    el-carousel-item(v-for="(noUse, index) in Object.keys(item.stats)", v-if="index % 2 == 0", :key="index")
                                      div.cloud-source-item(v-for="(statKey, childIndex) in Object.keys(item.stats)", v-if="childIndex == index || childIndex == index + 1", :key="childIndex")
                                        labelGroup(:stateTypes="item.stats[statKey]", :provider_name="getMetadataName[statKey]")
                            div.cloud-provider-bottom
                                //- 暂时使用provider_code规避 非云主机、云硬盘厂商没有同步信息
                                el-tooltip(:disabled="item.sync_data_status !== 3" :content="item.sync_data_msg" placement="bottom")
                                    div.status 状态：{{formatStatus(item.sync_data_status, item.sync_data_msg)}}
                                div.operation
                                    Icon-Button(v-for="operation in operations" v-if="checkSyncBtnShow(item, operation)" :key="operation.prop" :type="operation.type" @iconClick="handleOperation" :args="{id: operation.prop, row: item}" :text="operation.label")
                el-dialog(title="同步" v-if="synchronizeVisible" :visible.sync="synchronizeVisible" width="400px" :before-close="handleSyncDialogClose")
                    div.text-center {{syncInfo.title}} {{syncInfo.typeText[syncInfo.type]}} ?
                    div.text-center.margin-top
                        el-radio(v-model="syncInfo.type" label="resource") 资源
                        el-radio(v-model="syncInfo.type" label="config") 配置
                    div.dialog-footer(slot="footer")
                        el-button(@click="handleSyncDialogClose") 取消
                        el-button(@click="synchronize(syncInfo.data, syncInfo.type, syncInfo.providerCode)" type="primary") 确定
</template>

<script>
/**
 * @description 云厂商
 */
import Api from '@api'
import EmptyPage from '../../common/EmptyPage'
import DateUtil from '@server/date-utils'
import cloudProvider from '@mixins/cloudProvider.mixin'
import MetadataUtils from '@server/metadata.utils'
import labelGroup from '@/components/common/labelGroup.vue'
import {mapGetters} from 'vuex'
export default {
    name: 'CloudProvider',
    mixins: [cloudProvider],
    data () {
        return {
            total: 8,
            synchronizeVisible: false,
            breadcrumbItems: [
                { prop: '', label: '云厂商' }
            ],
            operations: [
                {
                    type: 'ucmp-icon-blacklist',
                    label: '同步规则',
                    prop: 'black'
                },
                {
                    type: 'ucmp-icon-edit',
                    label: '编辑',
                    prop: 'edit'
                },
                {
                    prop: 'delete',
                    label: '删除',
                    type: 'ucmp-icon-delete'
                },
                {
                    prop: 'synchro',
                    label: '同步',
                    type: 'ucmp-icon-synchro'
                }
            ],
            cloudProviders: [],
            syncInfo: {
                title: '',
                type: 'config',
                typeText: {
                    resource: '资源',
                    config: '配置'
                },
                data: {},
                providerCode: ''
            }
        }
    },
    methods: {
        // 获取对象的key组成数组的长度
        getObjectKeysLen (obj) {
          return Object.keys(obj).length
        },
        /**
        * @description 是否展示同步规则
        * @return Boolean
        */
        checkSyncBtnShow (provider, operation) {
          // 暂时使用provider_code规避 非云主机、云硬盘厂商没有同步、同步规则按钮, 其他按钮正常展示
          if (['bigip', 'netapp', 'alicloud', 'citrix'].indexOf(provider.provider_code) > -1 && operation.prop !== 'black') return true
          // 其他云主机正常展示
          if (['bigip', 'netapp', 'alicloud', 'citrix'].indexOf(provider.provider_code) === -1) return true
          return false
        },
        /**
         * @description 初始化获取云厂商列表
         */
        getProviderList () {
            Api.get('provider', {}, true).then(
                res => {
                    this.cloudProviders = res.list
                }
            ).then(() => {
              // UCMP3-5022
              // 同步每个云厂商的运行状态
              this.cloudProviders.forEach(provider => this.getStatusByProviderId(provider))
            })
        },
        // UCMP3-5022
        // 获取每个云厂商的运行状态
        getStatusByProviderId (provider) {
            Api.get('providerStatus', {providerId: provider.id}, true).then(
                res => {
                  let providerObj = {}
                  // UCMP3-5173 【云厂商】vmware，openstack，阿里云，青云云厂商中，云主机应该显示为第一排，云硬盘显示为第二个排，和产品的设计保持一致，青云的排版显示需要在调整
                  // 需要对云主机, 云硬盘, 关系型数据库, 缓存, 负载均衡进行排序
                  let sortproviderCodes = ['ecs', 'volume', 'qingcloud_rdb', 'qingcloud_cache', 'qingcloud_lb']
                  sortproviderCodes.forEach(code => {
                    if (Object.keys(res).find(provider_code => provider_code === code)) providerObj[code] = ''
                  })
                  console.log(res)
                  Object.keys(res).forEach(item => {
                    // 删除逻辑
                    // 同步每个云厂商的运行状态
                    providerObj[item] = this.getKeyByMetadata(item, res[item])
                  })
                  // 转换对象为二维数组
                  provider.stats = providerObj
                }
            )
        },
        /**
        *  UCMP3-5022
        *  @description getKeyByMetadata 将接口返回的状态数据同步至新建的元数据状态中
        *  @param item 云厂商名称
        *  @param res[item] 接口返回的运行状态数组
        *  @return { ecs: [{count, id, name, style}, {count, id, name, style}] }
        **/
        getKeyByMetadata (provider_code, statusArr) {
          // UCMP3-5022
          // baremetal xen_app xen_desktop 独特展示, 没有状态值, 显示总量
          if (['juniper_policy', 'baremetal', 'xen_app', 'xen_desktop'].indexOf(provider_code) > -1) {
            return [{
              count: statusArr.length ? statusArr[0].count : 0,
              name: '数量',
              custom_style: {
                background: '#61c359'
              },
              style: 'success'
            }]
          }
          // 当前服务
          let provider = MetadataUtils.getCheckedMeta(this.metadata, provider_code)
          if (!provider.attribute) return []
          let providerStatus = provider.attribute.find(attr => attr.key === 'status')
          if (providerStatus && providerStatus.query_condition && providerStatus.query_condition.enum) {
            let newProviderEnum = providerStatus.query_condition.enum.map(providerenumItemMap => {
              let findCountByAttribute = statusArr.find(status => status.attribute === providerenumItemMap.id)
              if (findCountByAttribute)
                providerenumItemMap.count = findCountByAttribute.count
              else
                providerenumItemMap.count = 0
              return providerenumItemMap
            })
            return newProviderEnum
          }
          return []
        },
        /**
         * @description 添加云厂商
         */
        addCloudProvider () {
            this.$router.push('/cloud-provider/edit/add')
        },
        openSyncDialog (obj) {
            if (obj.row.provider_code === 'bigip' || obj.row.provider_code === 'netapp') {
                this.$confirm(`确定同步云厂商 ${obj.row.name}, 是否继续?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.synchronize(obj, 'resource')
                }).catch(() => {
                })
                return
            }

            this.synchronizeVisible = true
            this.syncInfo.title = `确认同步云厂商 ${obj.row.name} 的`
            this.syncInfo.data = obj
            this.syncInfo.providerCode = obj.row.provider_code
        },
        handleSyncDialogClose () {
            this.synchronizeVisible = false
            this.syncInfo.title = ''
            this.syncInfo.type = 'config'
            this.syncInfo.data = {}
            this.syncInfo.providerCode = ''
        },
        /**
         * @description 同步
         */
        synchronize (obj, syncType, providerCode) {
            let vm = this
            if (obj.row.sync_data_status === 2) {
                vm.$message({
                    type: 'success',
                    message: `云厂商 ${obj.row.name} 正在执行同步操作, 请稍后重试!`
                })
                return
            }

            let apiName = syncType === 'config' ? 'providerConfig' : 'provider'
            // 物理机特殊处理
            if (providerCode === 'cloudboot' && syncType === 'config')
                apiName = 'cloundbootConfig'
            Api.post(apiName, { id: obj.row.id }, true).then(res => {
                vm.$message({
                    type: 'success',
                    message: `云厂商 ${obj.row.name} 同步操作执行成功!`
                })

                // UCMP-983【云厂商】云厂商同步时，状态没有联动更新
                // 问题原因：接口更新需要时间延迟
                setTimeout(() => {
                    this.getProviderList()
                    this.handleSyncDialogClose()
                }, 1000)
            })
        },
        /**
         * @description 查看云厂商详情
         */
        toDetail (row) {
            //根据当前业务，阿里云没有资源拓扑
            // UCMP35289【云厂商】NAS、F5、Ctrix厂商的拓扑超链接需要去掉（见截图描述）
            if (['alicloud', 'netapp', 'bigip', 'citrix'].indexOf(row.provider_code) === -1)
                this.$router.push('/cloud-provider/detail/' + row.id)
        },
        /**
         * @description 根据同步状态返回中文显示
         * @augments [status] 同步状态 [msg] 同步结果文本
         */
        formatStatus (status, msg) {
            switch (status) {
                case 1:
                    /**
                     *  UCMP3-613 火狐浏览器 38 在转换 '2000-01-01 00:00:00' 格式的字符串时间时，会得到一个非法日期格式
                     *  需要将 '-' 转换为 '/' => '2000/01/01 00:00:00'
                     */
                    return '同步成功' + '(' + DateUtil.formate(new Date(msg.replace(/-/g, '/'))) + ')'
                case 2:
                    return '同步中'
                case 3:
                    return '同步失败'
                default:
                    return '未同步'
            }
        },
        /**
         * @description 操作处理
         */
        handleOperation (obj) {
            switch (obj.id) {
                case 'delete':
                    this.handleDelete(obj)
                    break
                case 'edit':
                    this.handleEdit(obj)
                    break
                case 'black':
                    this.handleBlack(obj)
                    break
                case 'synchro':
                    this.openSyncDialog(obj)
                    break
                default:
                    break
            }
        },
        /**
         * @description 处理黑名单
         */
        handleBlack (obj) {
            this.$router.push(`/blacklist/${obj.row.id}`)
        },
        /**
         * @description 编辑
         */
        handleEdit (obj) {
            this.setCloudProvider({cur_step: 2, type: obj.row.provider_code})
            this.$router.push(`/cloud-provider/edit/${obj.row.id}`)
        },
        /**
         * @description 删除操作
         */
        handleDelete (obj) {
            let vm = this
            vm.$confirm(`确定删除云厂商 ${obj.row.name}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                Api.delete('provider', {id: obj.row.id}, true).then(
                    res => {
                        vm.$message({
                            type: 'success',
                            message: '删除成功!'
                        })
                        vm.getProviderList()
                    }
                )
            }).catch(() => {
            })
        }
    },
    computed: {
      ...mapGetters([
        'metadata'
      ]),
      // UCMP3-5022
      // metadata name Obj
      getMetadataName () {
        // UCMP3-5177 【云厂商】F5的列表内容应显示为：“Vserver”，NAS的列表内容应该显示为：“卷”
        let obj = {
          'nas': '卷',
          'f5': 'Vserver'
        }
        this.metadata.forEach(provider => {
          if (['nas', 'f5'].indexOf(provider.service_code) > -1) return
          obj[provider.service_code] = provider.name
        })
        return obj
      }
    },
    created () {
        this.getProviderList()
    },
    components: {
        EmptyPage,
        labelGroup
    }
}
</script>
<style lang="scss" scoped>
    .page-marginTop{
        margin-top: -10px
    }
</style>
