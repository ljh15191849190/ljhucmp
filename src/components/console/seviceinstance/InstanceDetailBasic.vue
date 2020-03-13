<template lang="pug">
  div.overflow-y-auto.full-height
    div.row.font-detail.no-margin-left.no-margin-right
      div.col-md-6
        CardPanel(v-for="(leftCard, index) in cards.left" v-if="leftCard.content && leftCard.content.length" :key="index" :cardTitle="leftCard.title" :cardContent="leftCard.content" :isRelatedService="leftCard.isRelatedService" :service_code="leftCard.service_code")
      div.col-md-6.no-padding-left
        CardPanel(v-for="(rightCard, index) in cards.right" v-if="rightCard.content && rightCard.content.length" :key="index" :cardTitle="rightCard.title" :cardContent="rightCard.content" :isRelatedService="rightCard.isRelatedService" :service_code="rightCard.service_code")
</template>
<script>
import Container from '@/components/common/Container'
import CardPanel from '@/components/common/CardPanel'
import { mapGetters, mapActions } from 'vuex'
import Api from '@api'
import { VolumeType } from '@server/ConstParams'
import defaultColumns from '@mock/console/defaultColums.mock'
import DateUtil from '@server/date-utils'

// Cost statistic config map
const costStatisticsMap = {
    price: '单价(元)',  // bug #UCMP-537 【云主机】云主机基本信息里有些字段无单位
    cost: '总费用(元)', // bug #UCMP-537 【云主机】云主机基本信息里有些字段无单位
    type: '计费类型',
    bootStrap: '计费选项',  // bug #UCMP-542 【云主机】云主机的费用信息里没有计费选项
    durationName: '计费周期'
}
export default {
    data () {
        return {
        //   instanceDetail: {},
            costDetail: {},
            defaultColumns: defaultColumns
        }
    },

    methods: {
        // 初始化
        init () {
            let params = {}
            params.service = this.serviceCode
            params.instanceId = this.checkedInstanceId
            Api.get('costStatistics', params, true).then(
                res => {
                    this.costDetail = res
                }
            )
        },

        // Handle cost statistics data
        handleCostStatisticsData (data, card) {
          if (data) {
            Object.keys(data).forEach(item => {
              let costObj = {}
              costObj.key = item
              costObj.name = costStatisticsMap[item]
              // bug #UCMP-542 【云主机】云主机的费用信息里没有计费选项
              switch (item) {
                case 'type':
                  costObj.label = data[item] === 1 ? '套餐计费' : '单项资源计费'
                  break
                case 'bootStrap':
                  costObj.label = data[item] ? '开机状态' : '全部状态'
                  break
                case 'price':
                  costObj.label = Number(data[item]).toFixed(2)
                  break
                case 'cost':
                  costObj.label = Number(data[item]).toFixed(2)
                  break
                default:
                  costObj.label = data[item]
                  break
              }

              card.content.push(costObj)
            })
          }
        },

        basicInfoConstructor (checkedMetaAttr, checkedMetadata, serviceCode, instanceDetail, card, defaultColumns = [], cardId) {
            if (!checkedMetaAttr || !checkedMetaAttr.length || !checkedMetadata)
                return

            let groups = {}
            checkedMetaAttr.forEach(
                attr => {
                    let showIdServices = ['qingcloud_rdb', 'qingcloud_lb', 'netbox_ip']

                    if (checkedMetadata && (attr.key !== checkedMetadata.value_field || (attr.key === checkedMetadata.value_field && showIdServices.indexOf(serviceCode) > -1))) {
                        // bug UCMP-947【云硬盘】如果申请云硬盘并选择了所属云主机，云硬盘、云主机详情基础信息中所属云主机显示为ID，详情中已展示关联云主机信息，可删除该字段
                        if (serviceCode === 'volume' && attr.key === 'ecs_instance_id') return

                        if ((cardId && !this.otherCardKeysObj[cardId].includes(attr.key)) || (!cardId && this.otherCardKeys.includes(attr.key))) return

                        // bug #UCMP-643 【云硬盘】云硬盘页面，所属云主机下拉框中没有可选择的云主机数据
                        let item = { key: attr.key, name: attr.label + (attr.unit ? `(${attr.unit})` : ''), label: instanceDetail[attr.key] !== undefined ? instanceDetail[attr.key] : '--' }

                        if (Array.isArray(attr.enum) && attr.enum.length) {
                            !attr.multiple && attr.enum.forEach(
                                enumItem => {
                                    // UCMP3-888 控制台管理页面显示网络类型特殊配置
                                    if (checkedMetadata.service_code === 'qingcloud_lb' && attr.key === 'vxnet_type' && !instanceDetail[attr.key])
                                        instanceDetail[attr.key] = '0'
                                    // UCMP3-383 enumItem.id为 1, instanceDetail[attr.key]为 '1',针对该类型问题，数字转化为字符后再判断；元数据定义enum类型要更加规范
                                    if (enumItem.id === instanceDetail[attr.key] || enumItem.id === instanceDetail[attr.key] + '' || enumItem.id + '' === instanceDetail[attr.key]) {
                                        item.label = enumItem.name
                                        if (enumItem.style) {
                                            item.type = enumItem.style
                                            item.status = enumItem.id
                                            item.isTag = true
                                            item.custom_style = enumItem.custom_style
                                        }
                                    }
                                }
                            )
                            // UCMP3-5095 云主机 安全服务正确显示(multiple: true)
                            if (attr.multiple && Array.isArray(instanceDetail[attr.key])) {
                                let allEnumIds = attr.enum.map(enumItem => enumItem.id)
                                item.label = instanceDetail[attr.key].map(value => {
                                    let index = allEnumIds.indexOf(value)
                                    if (index === -1) {
                                        index = allEnumIds.map(id => id + '').indexOf(value)
                                        if (index === -1)
                                            index = allEnumIds.indexOf(value + '')
                                    }
                                    return index !== -1 ? attr.enum[index].name : value
                                }).join(' ')
                            }
                        }

                        // UCMP3-1570【控制台】关联pool的名称显示的不正确
                        if (attr.key === 'pool_name') {
                            //
                            item.label = item.label.replace(/^\/Common\//, '')
                        }

                        // 图标显示
                        item.icon = attr.icon

                        // F5 会话算法的展示，因元数据只存了一小部分，所以展示时用截取字符串的形式
                        if (attr.key === 'persistence_profiles' && instanceDetail[attr.key])
                            item.label = instanceDetail[attr.key].defaults_from ? instanceDetail[attr.key].defaults_from.replace(/^\/Common\//, '') : '--'
                        else if (typeof instanceDetail[attr.key] === 'object' && !attr.enum) {
                            if (Array.isArray(instanceDetail[attr.key]))
                                item.label = instanceDetail[attr.key].join(', ')
                            else
                                item.label = JSON.stringify(instanceDetail[attr.key])
                        } else if (attr.key === checkedMetadata.text_field && instanceDetail[checkedMetadata.value_field]) {
                            if (serviceCode !== 'netbox_ip') {
                                item.isLink = true
                                item.link = '/' + serviceCode + '/instanceDetail/' + instanceDetail[checkedMetadata.value_field] + '/basic'
                            }
                        } else if (serviceCode === 'volume' && attr.key === 'type') // Special handle volume type data
                            item.label = instanceDetail[attr.key] ? (VolumeType[instanceDetail[attr.key]] ? VolumeType[instanceDetail[attr.key]] : instanceDetail[attr.key]) : '--'
                        // bug #UCMP3-7304 无效的字段不仅仅只有 undefined，其他无效字段也需要修改为 '--'
                        if (item.label === 'null')
                            item.label = '--'
                        // 接口返回的数据存在该项数据，则显示在页面，否则不予显示 UCMP3-1207 明显页面只显示detail：true的属性
                        if (attr.detail && (!attr.table_column_group || (attr.table_column_group && !groups[attr.table_column_group.group_key]))) {
                            // 处理密码
                            let isPassWord = (attr.fe_type && (attr.fe_type.type === 'password')) || (attr.type === 'password')
                            if (isPassWord) {
                                item.password = isPassWord
                                item.isShowPassWord = false
                                item.hiddenPass = item.label.replace(/./g, '*')
                            }
                            card.content.push(item)
                        }
                            
                        // UCMP3-1579【云主机】在云主机详情页面，ip没区分（内网），（互联网）和（浮动）
                        // 处理group的显示如同表格的显示一致
                        if (attr.table_column_group) {
                            // UCMP3-3344【控制台】云主机界面详情里面agent 显示错误
                            if (attr.table_column_group.group_key === 'agent_group') {
                                item.label = {[attr.key]: instanceDetail[attr.key]}

                                // 是否在attr中存在了节点
                                if (groups[attr.table_column_group.group_key]) {
                                    //
                                    if (item.label) groups[attr.table_column_group.group_key] = Object.assign(groups[attr.table_column_group.group_key], item.label)
                                } else {
                                    item.name = attr.table_column_group.group_label
                                    item.isAgent = true
                                    item.isTag = false
                                    groups[attr.table_column_group.group_key] = item.label
                                }
                            } else {
                                // 处理字符串显示label
                                if (Array.isArray(instanceDetail[attr.key])) {
                                    item.label = instanceDetail[attr.key].reduce((result, item, index, arr) => {
                                        result += attr.table_column_group.group_column_label + item
                                        if (index !== arr.length - 1) result += ', '
                                        return result
                                    }, '')
                                } else {
                                    if (JSON.stringify(instanceDetail[attr.key]))
                                        item.label = attr.table_column_group.group_column_label + JSON.stringify(instanceDetail[attr.key])
                                    else
                                        item.label = null
                                }

                                // 是否在attr中存在了节点
                                if (groups[attr.table_column_group.group_key]) {
                                    //
                                    if (item.label) groups[attr.table_column_group.group_key].label += ', ' + item.label
                                } else {
                                    item.name = attr.table_column_group.group_label
                                    groups[attr.table_column_group.group_key] = item
                                }
                            }
                        }
                    }
                }
            )

            // UCMP3-4830 根据服务配置以及全局参数为条件判断是否应该显示“租期”
            defaultColumns = defaultColumns.filter(column => {
                if (column.prop !== 'resource_expired_at') return column
                // eslint-disable-next-line
                if (column.prop === 'resource_expired_at' && this.checkedMetadata && (this.checkedMetadata.group !== 'blueprint' && this.checkedMetadata.tenany || this.checkedMetadata.group === 'blueprint') && this.tenancy.available) return column
            })
            //UCMP3-3046 控制台-预留ip】ip详情中基本信息显示优化（见截图描述）
            if (serviceCode === 'netbox_ip') {
                let hiddenProperty = ['resource_expired_at', 'env']
                defaultColumns = defaultColumns.filter(item => !hiddenProperty.includes(item.prop))
            }

            defaultColumns.length && defaultColumns.forEach(attr => {
                // 资源所属不展示
                if (!attr.detail || attr.prop === 'owner_type') return

                let dataType = ['created_at', 'resource_expired_at'].indexOf(attr.prop) > -1 ? 'date' : ''
                let item = {
                    key: attr.key,
                    name: attr.label,
                    label: this.formatLabel(instanceDetail[attr.prop], dataType)
                }
                card.content.push(item)
            })
        },

        formatLabel (data, dataType) {
            if (data || data === 0 || data === false) {
                switch (dataType) {
                    case 'date': {
                        // UCMP3-3341【控制台】租期关闭时，控制台下资源详情中的租期显示为“NaN-aN-aN aN:aN:aN”，应该显示为“--”
                        return (data && data !== '--') ? DateUtil.formate(data) : '--'
                    }
                    default: {
                        return data
                    }
                }
            } else return '--'
        },

        ...mapActions([
            'setOperatorSuccess'
        ])
    },

    computed: {
        baseCard () {
            let card = {
                title: '基础信息',
                content: []
            }

            // 封装当前服务实例的基础明细信息
            if (this.selectedInstanceInfo)
                this.basicInfoConstructor(this.checkedMetaAttr, this.checkedMetadata, this.serviceCode, this.selectedInstanceInfo, card, this.defaultColumns)
            return card
        },

        otherCards () {
            let cards = []
            let basicConf = this.instanceConfig.details.find(item => item.code === 'basic')
            if (!basicConf || !basicConf.group) return []

            let group = basicConf.group || []
            if (group.length) {
                cards = group.map(item => {
                    let card = {title: item.label, content: []}
                    if (this.selectedInstanceInfo)
                        this.basicInfoConstructor(this.checkedMetaAttr, this.checkedMetadata, this.serviceCode, this.selectedInstanceInfo, card, [], item.id)
                    return card
                })
            }

            return cards
        },

        otherCardKeysObj () {
            let basicConf = this.instanceConfig.details.find(item => item.code === 'basic')
            if (!basicConf || !basicConf.group) return []

            let group = basicConf.group || []
            let obj = {}
            group.forEach(item => {
                obj[item.id] = item.list
            })

            return obj
        },

        otherCardKeys () {
            let keys = []
            for (let list of Object.values(this.otherCardKeysObj)) {
                //
                keys = keys.concat(list)
            }

            return keys
        },

        ownerCard () {
            const ownerEnum = {
                org: {
                    name: '组织机构',
                    owner_name: '组织机构名称'
                },
                app: {
                    name: '应用',
                    owner_name: '应用名称'
                },
                personal: {
                    name: '个人'
                }
            }
            let card = {}
            if (this.selectedInstanceInfo) {
                let owner_type = this.selectedInstanceInfo.owner_type
                card = {
                    title: '资源归属',
                    content: [
                        { key: 'owner_type', name: '资源所属', label: (ownerEnum[owner_type] ? ownerEnum[owner_type].name : '--') },
                        // bug UCMP-697【云主机&云硬盘】在云主机和云硬盘列表，空信息显示方式不统一
                        { key: 'user', name: '责任人', label: this.selectedInstanceInfo.user ? this.selectedInstanceInfo.user : '--' }
                    ]
                }
                // bug #UCMP-648 【云主机】云主机基本信息界面，存量资源部分基本信息有问题
                if (this.selectedInstanceInfo.owner_type) {
                    let owner_name = ownerEnum[owner_type].owner_name
                    if (owner_name)
                        card.content.splice(1, 0, { key: 'owner_name', name: owner_name, label: this.selectedInstanceInfo.owner_name ? this.selectedInstanceInfo.owner_name : '--' })
                }
            }

            return card
        },

        costStatisticsCard () {
            let card = {
                title: '费用信息',
                content: []
            }

            this.handleCostStatisticsData(this.costDetail, card)
            return card
        },

        relatedServiceCards () {
            if (this.checkedMetadata && Array.isArray(this.checkedMetadata.related_service)) {
                let cards = []
                this.checkedMetadata.related_service.forEach(
                    related => {
                        // 封装当前服务实例的基础明细信息
                        let checkedMetaAttr = this.allMetaDataAttributes[related.service_code]
                        let checkedMetadata = this.metadata.filter(
                            meta => {
                                if (meta.service_code === related.service_code)
                                    return meta
                            }
                        )[0]

                        // 根据当前服务实例明细信息分析其关联的服务实例基础明细信息
                        if (this.selectedInstanceInfo && Array.isArray(this.selectedInstanceInfo[related.service_code]) && this.selectedInstanceInfo[related.service_code].length && checkedMetadata && checkedMetaAttr) {
                            this.selectedInstanceInfo[related.service_code].forEach(
                                detail => {
                                    let card = {
                                        isRelatedService: true,
                                        service_code: related.service_code,
                                        title: '关联' + this.allMetaDataNames[related.service_code],
                                        content: []
                                    }

                                    if (related.service_code === 'ecs')
                                        this.basicInfoConstructor(checkedMetaAttr, checkedMetadata, related.service_code, detail, card, this.defaultColumns)
                                    else
                                        this.basicInfoConstructor(checkedMetaAttr, checkedMetadata, related.service_code, detail, card)
                                    cards.push(card)
                                }
                            )
                        }
                    }
                )
                return cards
            }
            return []
        },

        allCards () {
            let cards = [this.baseCard, this.ownerCard, this.costStatisticsCard, ...this.otherCards]

            return cards.concat(this.relatedServiceCards)
        },

        instanceId () {
            return this.checkedInstanceId
        },

        serviceCode () {
            return this.$route.params.code
        },

        ...mapGetters([
            'metadata',
            'checkedMetadata',
            'checkedInstanceId',
            'instanceConfig',
            'btnOperatorSuccess',
            'selectedInstanceInfo',
            'tenancy'
        ]),

        /**
         * @description 所有基础元数据的属性集合
         */
        allMetaDataAttributes () {
            let rst = {}
            let metas = this.metadata.filter(
                meta => {
                    if (meta.group !== 'blueprint')
                        return meta
                }
            )
            metas.forEach(
                meta => {
                    rst[meta.service_code] = meta.attribute
                }
            )
            return rst
        },

        allMetaDataNames () {
            let rst = {}
            let metas = this.metadata.filter(
                meta => {
                    if (meta.group !== 'blueprint')
                        return meta
                }
            )
            metas.forEach(
                meta => {
                    rst[meta.service_code] = meta.name
                }
            )
            return rst
        },

        /**
         * 当前元数据属性列表
         */
        checkedMetaAttr () {
            return this.allMetaDataAttributes[this.serviceCode]
        },

        // 基本信息
        cards () {
            let left = []
            let right = []

            let allCards = JSON.parse(JSON.stringify(this.allCards))
            let num = this.allCards.length / 2
            left = allCards.slice(0, num)
            right = allCards.slice(num)
          return {left, right}
        }
    },

    components: {
        Container,
        CardPanel
    },

    created () {
        // 初始化
        this.init()
    },

    watch: {
        checkedInstanceId (newVal, oldVal) {
            this.init()
        },
        // bug UCMP-862【云主机】云主机详情页面，云主机状态在开机后没有实时刷新
        btnOperatorSuccess (newVal, oldVal) {
          if (newVal === oldVal) return
          if (newVal) {
            this.init()
            this.setOperatorSuccess(false)
          }
        }
    }
}
</script>
<style lang="scss" scoped>
</style>
