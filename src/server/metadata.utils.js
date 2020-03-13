/**
 * @description 处理元数据与前端配置的融合
 * @author xinghua.wen
 */
import store from '@/store'
import * as types from '@/store/mutations_types'
import BLUEPRINTACTIONS from '@mock/metadata/blueprint.actions'
import BLUEPRINTMOREGROUP from '@mock/metadata/blueprint.moreGroup.mock'
import { VolumeType } from '@server/ConstParams'
import Api from '@api'

const Action = {
    icon: '',
    type: 'primary',
    group: 'iconGroup'
}

const CheckboxGroup = [{
    label: 'readonly',
    text: '只读'
}]

class MetadataUtils {
    constructor (metaCodes) {
        if (Array.prototype.sortAsMetadataOrder)
            return
        Array.prototype.sortAsMetadataOrder = function (metaCodes, getServiceCode) {
            this.sort((a, b) => {
                if (metaCodes && metaCodes.length && getServiceCode) {
                    let a_index = metaCodes.indexOf(getServiceCode(a))
                    let b_index = metaCodes.indexOf(getServiceCode(b))
                    return a_index - b_index
                }
                return true
            })
        }
    }
    /**
     * @description 获取选中code的服务元数据
     * @param {*} metadata
     * @param {*} _code
     */
    getCheckedMeta (metadata, _code) {
        let metaItem = metadata.find(
            item => {
                if (item.service_code === _code)
                    return item
            }
        )
        return metaItem || {}
    }

    asyncGetCheckedMetadata (metadata, _code) {
        return new Promise(resolve => {
            let metaItem = metadata.find(
                item => {
                    if (item.service_code === _code)
                        return item
                }
            )
            if (metaItem)
               resolve(metaItem)
            else {
                Api.get('getMetadata', { _code: 'blueprint/' + _code }, true).then(
                    res => {
                        if (res && res.metadata) {
                            store.commit(types.UPDATE_METADATA, res.metadata)
                            resolve(res.metadata)
                        }
                    }
                )
            }
        })
    }

    /**
     * @description 获取按钮组以及列表
     * @param {*} metaItem
     * @param {*} _code
     */
    getActionBtns (metaItem = {}, config = {}) {
        let rst = {
            iconGroup: [],
            topGroup: [],
            columnGroup: [],
            moreGroup: []
        }

        let normalActions = []

        if (!metaItem.service_code)
            return rst

        // 导入默认的编排操作按钮组（与编排attribute不同， 考虑到可能经常改变新的操作项，actions没有保存到编排定义中，而是在前端本地保存）
        if (metaItem.group === 'blueprint') {
            return {
                iconGroup: [],
                topGroup: [],
                columnGroup: [].concat(BLUEPRINTACTIONS),
                moreGroup: [...BLUEPRINTMOREGROUP]
            }
        }
        // 遍历常规操作列表，转化为数组
        for (let key in metaItem.normal_actions) {
            let item = metaItem.normal_actions[key]
            item.name = key
            normalActions.push(item)
        }
        // 过滤出来可使用的按钮(action中的enabled属性)
        normalActions = normalActions.filter(item => item.enabled)

        // 将元数据的所有action合并(元数据并不一定有actions，自定义生成的编排就没有)
        let allActions = []
        if (metaItem.actions)
            allActions = metaItem.actions.concat(normalActions)
        else
            allActions = normalActions
        // 遍历所有action，分组并添加前端样式、布局配置
        allActions.forEach(
            item => {
                let action = {}
                action = JSON.parse(JSON.stringify(item))

                // 如果前端有对应的按钮配置，合入对应的配置
                if (config.actions && config.actions[item.name])
                    action = Object.assign({}, action, config.actions[item.name])
                else
                    action = Object.assign({}, Action, action)
                // hidden属性的按钮不予显示  business显示创建
                if (!action.hidden || metaItem.type === 'business')
                    rst[action.group].push(action)
                if (action.column)
                    rst.columnGroup.push(action)
            }
        )
        return rst
    }

    /**
     * @description 获取表格列的数组
     * @param {Array} metadata 所有元数据
     * @param {Object} config 对应服务元数的配置
     */
    getColumns (_metaItem = [], config = {}, metadata = {}) {
        let columns = [], groups = {}
        // 筛选出当前服务的元数据
        let metaItem = JSON.parse(JSON.stringify(_metaItem))
        metaItem && metaItem.attribute && metaItem.attribute.forEach(
            item => {
                // 删除 && metaItem.value_field !== item.key 允许value_field的列显示
                if (item.table_column) {
                    let column = {
                        prop: item.key,
                        label: item.unit ? `${item.label}(${item.unit})` : item.label,
                        // isShow: item.table_column, // 写了句废话！！！
                        isShow: true,
                        // multiple flag
                        multiple: item.multiple,
                        width: item.width,
                        min_width: item.min_width,
                        icon: item.icon
                    }
                    // 保留存在enum的映射关系
                    item.enum && (column.enum = item.enum)
                    // 与前端配置文件的columns合并
                    if (config.columns && config.columns[item.key])
                        column = Object.assign({}, column, config.columns[item.key])

                    // 默认超链接指向名称
                    if (item.key === metaItem.text_field) {
                        column.href = item.hasOwnProperty('href') ? item.href : true
                        column.min_width = 200
                        column.router = `/${metaItem.service_code}/instanceDetail/`
                        column.routerIdKey = metaItem.value_field
                    }

                    // UCMP3-1149 控制台列表部分指定行合并显示
                    if (item.table_column_group) {
                        if (!groups[item.table_column_group.group_key]) {
                            groups[item.table_column_group.group_key] = []
                            columns.push({
                                prop: item.table_column_group.group_key,
                                isShow: true,
                                label: item.table_column_group.group_label,
                                groups: groups[item.table_column_group.group_key],
                                width: item.table_column_group.width,
                                min_width: item.table_column_group.min_width,
                                labelStyleSheels: item.table_column_group.labelStyleSheels
                            })
                        }
                        column.group_column_label = item.table_column_group.group_column_label
                        item.table_column_group.labelStyleSheels && (column.labelStyleSheels = item.table_column_group.labelStyleSheels)
                        groups[item.table_column_group.group_key].push(column)
                    } else
                        !columns.find(col => col.prop === column.prop) && columns.push(column)
                }
            }
        )

        // 需判断处理关联服务列
        if (metaItem && metaItem.related_service) {
            // bug UCMP-1247【云硬盘】云硬盘列表设置中的标签先去勾选再勾选上后，标签列不显示；且所属云主机字段显示两列，请一并修改
            let relatedColumns = this.getRelatedServiceAttributes(metaItem.related_service, metadata)
            // 过滤转化related_service为attribute的列表
            let copyRelatedColumns = JSON.parse(JSON.stringify(relatedColumns))
            let filterColumns = copyRelatedColumns.filter(column => column.table_column)
            // 添加prop属性，若为关联云主机处理跳转
            filterColumns = filterColumns.map(col => {
              col.prop = col.key
              // 默认所有关联服务都有链接，除了tag（type为business)
              let referMetaItem = metadata.find(meta => meta.service_code === col.key && meta.type !== 'business')
              let column = {}
              referMetaItem && (column = {
                label: col.label ? col.label : '',
                isShow: true,
                // multiple flag
                multiple: false,
                href: true,
                min_width: 300,
                router: `/${col.key}/instanceDetail/`,
                routerIdKey: referMetaItem.value_field,
                text_field: referMetaItem.text_field
              })
              col = Object.assign({}, col, column)
              return col
            })
            columns = columns.concat(filterColumns)
        }

        return columns
    }

    /**
     * @description 获取动态表单过滤的数组
     * @param {Array} metadata 所有元数据
     * @param {Object} config 对应服务元数的配置
     */
    filterItems (metadata = {}, config = {}) {
        let metaItem = metadata.find(item => item.service_code === config.service_code)
        let attributes = metaItem && metaItem.attribute ? metaItem.attribute : [], rst = []

        // 需判断处理关联服务
        if (metaItem && metaItem.related_service)
            attributes = attributes.concat(this.getRelatedQueryCondition(metaItem.related_service, metadata))
        // UCMP3-4048 取消对config的依赖，可以根据元数据独立适配
        let groups = {}
        attributes.forEach(
            item => {
                if (item.query_condition && (item.query_condition.enable || (Array.isArray(item.query_condition) && item.query_condition.length))) {
                    let tempItem = JSON.parse(JSON.stringify(item))
                    tempItem.required = false
                    if (config.attribute && config.attribute[item.key])
                        tempItem = Object.assign({}, tempItem, config.attribute[item.key])

                    // 合并搜索项，创造一个table_column_group.group_key同名的项，只能为输入框
                    if (tempItem.table_column_group) {
                        let groupKey = tempItem.table_column_group.group_key
                        if (!groups[groupKey]) {
                            rst.push({
                                key: groupKey,
                                label: tempItem.table_column_group.group_description || tempItem.table_column_group.group_label,
                                type: 'string',
                                query_condition: {
                                    enable: true,
                                    table_head: false,
                                    query_attribute: groupKey,
                                    query_symbol: 'like'
                                }
                            })

                            groups[groupKey] = true
                        }
                    } else
                        rst.push(tempItem)
                }
            }
        )
        // }
        return rst
    }

    /**
     * @description 获取详情页的基本页签的信息
     */
    getDetailCardInfo (metaItem = {}, group = [], defaultColumns = []) {
        let result = []
        group.forEach(
            item => {
                let itemObj = {}
                itemObj.title = item.label
                itemObj.content = []
                if (Array.isArray(item.list)) {
                    item.list.forEach(
                        val => {
                            let contentObj = {}
                            let copyDefaultCols = JSON.parse(JSON.stringify(defaultColumns))
                            if (Array.isArray(copyDefaultCols)) {
                              copyDefaultCols.forEach(col => {
                                  col.key = col.prop
                              })
                              copyDefaultCols = copyDefaultCols.concat(metaItem.attribute)
                            }

                            let findAttrute = copyDefaultCols.find(attr => attr.key === val)
                            if (findAttrute) {
                                contentObj.key = findAttrute.key
                                // bug #UCMP-537 【云主机】云主机基本信息里有些字段无单位
                                contentObj.name = findAttrute.label + (findAttrute.unit ? `(${findAttrute.unit})` : '')
                                contentObj.label = ''
                                findAttrute.key === 'status' && (contentObj.isTag = true)
                                itemObj.content.push(contentObj)
                            }
                        }
                    )
                }
                result.push(itemObj)
            }
        )
        return result
    }

    /**
     * @description 处理申请单中资源展示
     */
    async handleOrderDetailConfig (order = {}, metadata = []) {
        let filterService = await this.asyncGetCheckedMetadata(metadata, order.service_code)

        if (!order.display) return []

        let displays = {
            basic: {
                id: 'basic',
                name: '基础信息',
                list: []
            },
            provider_conf: {
                id: 'provider',
                name: '厂商信息',
                list: []
            }
        }
        let groups = {}
        // UCMP3-3221【申请单管理】云主机带tomcat、mysql申请单详情，信息显示优化
        // 问题原因：display循环为主，导致显示顺序颠倒
        // 解决方法：表单项attribute循环为主
        // Attribute由于juniper防火墙有两套原数据 导致详情页面显示两套数据（去重）（分别处理不同单独创建 和云主机创建）
        let Attribute = this.getObjArrEqual(filterService.attribute, 'key')
        Attribute.forEach(attr => {
            let label = ''
            if (order.display.hasOwnProperty(attr.key) && !attr.display_same_row)
                label = attr.unit ? attr.label + '(' + attr.unit + ')' : attr.label

            if (label) {
                let displayItem = {
                    label: label,
                    key: attr.key,
                    value: order.display[attr.key] ? order.display[attr.key] : '--'
                }
                let isPassWord = (attr.fe_type && (attr.fe_type.type === 'password')) || (attr.type === 'password')
                if (isPassWord) {
                    displayItem.password = isPassWord
                    displayItem.isShowPassWord = false
                    displayItem.hiddenPass = displayItem.value.replace(/./g, '*')
                }

                // UCMP3-6533【申请云桌面】机关单位用户和内部用户申请云桌面走审批流程，审批详情中出现了审批单位字段（申请的是没有，审批的时候不应该有）
                // 问题原因: 审批单位只在申请时出现
                if (displayItem.key !== 'approval_org') 
                    displays.basic.list.push(displayItem)
            }

            // UCMP3-1437 添加合并显示列 【NAS 总大小与单位要合并显示】
            if (attr.display_same_row && attr.display_same_row.key) {
                if (!groups[attr.display_same_row.key]) {
                    groups[attr.display_same_row.key] = attr.display_same_row
                    groups[attr.display_same_row.key].children = []
                }
                groups[attr.display_same_row.key].children.push(JSON.parse(JSON.stringify(attr)))
            }
        })

        if (filterService.provider_conf) {
            //UCMP3-3222【申请单管理】云主机和云硬盘申请单详情中，缺少云厂商字段（见截图）
            if (order.attributes.provider_id) {
                await Api.get('provider', {}, true).then(
                    res => {
                        this.cloudProviders = res.list
                        let provider = res.list.find(item => item.id === order.attributes.provider_id)
                        displays.provider_conf.list.push({
                            label: '云厂商',
                            key: order.attributes.provider_id,
                            value: provider ? provider.name : '--'
                        })
                    }
                )
            }

            let relatedServiceItem = filterService.provider_conf[order.attributes.provider_code]
            if (relatedServiceItem && relatedServiceItem.attribute) {
                relatedServiceItem.attribute.forEach(attr => {
                    let label = ''
                    if (order.display.provider_conf.hasOwnProperty(attr.key) && !attr.display_same_row)
                        label = attr.unit ? attr.label + '(' + attr.unit + ')' : attr.label
                    if (label) {
                        displays.provider_conf.list.push({
                            label: attr.label,
                            key: attr.key,
                            value: order.display.provider_conf[attr.key] ? order.display.provider_conf[attr.key] : '--'
                        })
                    }
                })
            }
        }

        // UCMP3-1437 显示合并显示列 【NAS 总大小与单位要合并显示】
        Object.keys(groups).forEach(group_key => {
            let display = { label: groups[group_key].label, value: '' }
            display.value = groups[group_key].children.map(
                formItem => {
                    return order.display[formItem.key]
                }
            ).join('')

            displays.basic.list.push(display)
        })
        return displays
    }
        // 根据数组对象某一个属性去重（如：id）
    getObjArrEqual (arr, u_key) {
        let map = new Map()
        arr.forEach((item, index) => {
            if (!map.has(item[u_key])) 
                map.set(item[u_key], item)
        })
        return [...map.values()]
    }
    /*
     * 格式化attribute为multiple的数据
     */
    formatMultipleAttr (checkedMetadata = {}, data = {}) {
      let formatData = JSON.parse(JSON.stringify(data))

      // 找到attribute中multiple为true的属性
      let findAttrArr = checkedMetadata.attribute && checkedMetadata.attribute.filter(attr => attr.multiple)
      findAttrArr && findAttrArr.forEach(item => {
          formatData[item.key] && (formatData[item.key] = formatData[item.key].reduce(
              (preVal, val) => preVal + (preVal ? ';' : '') + val,
              ''
          ))
      })
      return formatData
    }

    initMetaInfoByServiceCode (serviceCode, metadata, frontEndCfg, group, cb) {
        let instanceConfig = this.getInstanceConfig(frontEndCfg, serviceCode)
        store.commit(types.SET_INSTANCE_CONFIG, instanceConfig)

        let checkedMetadata = this.getCheckedMeta(metadata, serviceCode)
        // 控制台下的编排资源按需加载元数据
        if (checkedMetadata.attribute === undefined && group === 'blueprint') {
            Api.get('getMetadata', { _code: 'blueprint/' + serviceCode }, true).then(
                res => {
                    if (res && res.metadata) {
                        store.commit(types.UPDATE_METADATA, res.metadata)
                        store.commit(types.SET_CHECKED_METADATA, res.metadata)
                        let allActions = this.getActionBtns(res.metadata, instanceConfig)
                        store.commit(types.SET_GROUP_ACTIONS, allActions)

                        if (cb) cb()
                    }
                }
            )
        } else {
            store.commit(types.SET_CHECKED_METADATA, checkedMetadata)
            let allActions = this.getActionBtns(checkedMetadata, instanceConfig)
            store.commit(types.SET_GROUP_ACTIONS, allActions)
            if (cb) cb()
        }
    }

    getInstanceConfig (frontEndCfg, serviceCode) {
        let config = {}
        let filteredConfig = frontEndCfg.user_defined.filter(
            item => {
                if (item.service_code === serviceCode)
                    return item
            }
        )
        if (filteredConfig.length)
            config = JSON.parse(JSON.stringify(filteredConfig[0]))

        config.actions = JSON.parse(JSON.stringify(frontEndCfg.actions))

        // 针对服务重名的action替换对应的配置
        if (frontEndCfg.actionsForService[serviceCode]) {
            for (let [action, actionConf] of Object.entries(frontEndCfg.actionsForService[serviceCode])) {
                // 替换
                config.actions[action] = actionConf
            }
        }

        return config
    }

    /**
     * @description Filter created attributes from meta data
     *
     */
    filterCreatedAttrFromMetadata (metadata, serviceCode) {
      let result = []
      if (Array.isArray(metadata)) {
        let metaItem = metadata.find(meta => meta.service_code === serviceCode)
        metaItem && Array.isArray(metaItem.attribute) && (result = metaItem.attribute.filter(attr => attr.created))
      }
      return result
    }

    getMetaDataServiceName (metadata, serviceCode) {
        if (Array.isArray(metadata)) {
            let metaItem = metadata.find(meta => meta.service_code === serviceCode)
            return metaItem.name
        }

        return ''
    }
    /**
     * @description Get actions from meta data
     * @param {Object} metaItem meta data item
     * @param {Object} actionsConfig front-end actions config for meta data
     */
    getServiceActionsType (metaItem = {}, actionsConfig = {}) {
        let result = []

        if (metaItem && (metaItem.actions || metaItem.normal_actions)) {
          let normal_actions = []
          // Construct a unified data structure
          metaItem.normal_actions && Object.keys(metaItem.normal_actions).forEach(normal => {
            // UCMP3-6247 蓝图创建操作【需要】可以选择流程
            if (metaItem.group === 'blueprint' && normal === 'create' && !metaItem.normal_actions.create.is_approve)
                normal_actions.push(Object.assign({}, metaItem.normal_actions[normal], {name: normal, is_approve: true}))
            else
                normal_actions.push(Object.assign({}, metaItem.normal_actions[normal], {name: normal}))
          })
          // Filter actions data according to is_approve is true
          let allActions = normal_actions.concat(metaItem.actions).filter(action => action.is_approve)
          // Handle meta data actions according to front-end actions config
          actionsConfig && (allActions = allActions.map(item => {
            actionsConfig[item.name] && (item = Object.assign({}, item, actionsConfig[item.name]))
            return item
          }))

          result = allActions
        }

        return result
    }

    blueprintMetas (defaultResources, resourceCfgFormAttrs, rootId) {
        return defaultResources.map(
            item => {
                let rst = {
                    id: '',
                    canvas: {},
                    service_code: '',
                    nickname: '',
                    description: '',
                    group: '',
                    attributes: {},
                    display: {}
                }
                if (item.template_immutable)
                    rst.template_immutable = item.template_immutable
                rst.id = item.id
                rst.canvas = {
                    _x: item._x,
                    _y: item._y,
                    width: item.width,
                    height: item.height,
                    pId: item.pId === rootId ? null : item.pId
                }

                // UCMP3-661 审批环节，刷新页面，未拿到元数据信息时，info不存在
                if (item.info) {
                    rst.service_code = item.info.service_code
                    rst.nickname = item.info.name
                    rst.description = item.info.description
                    rst.group = item.info.group ? item.info.group : ''
                    if (item.info.group_id)
                        rst.group_id = item.info.group_id
                    rst.attributes = item.info.group && item.info.group === 'blueprint' ? {} : resourceCfgFormAttrs[item.id].formData
                    rst.display = item.info.group && item.info.group === 'blueprint' ? {} : resourceCfgFormAttrs[item.id].display
                }
                rst.reference = item.pId === rootId ? null : item.pId
                // UCMP3-7298 选择模板的时候，需要将模板id传至后台，用来进行配额的计算
                if (rst.attributes.template_id)
                    rst.template_id = rst.attributes.template_id

                return rst
            }
        )
    }
    /**
     * 继承类型服务获取父级服务可继承的属性列表
     * @param {*} extend_code 父级服务code
     * @param {*} extend_attributes 可继承的属性列表
     * @param {*} metadatas
     */
    getExtendAttributes (extend_code, extend_attributes, metadatas) {
        if (!extend_code || !metadatas || !extend_attributes || !extend_attributes.length || !metadatas.length)
            return []
        let extend_metadata = metadatas.filter(
            meta => {
                if (meta.service_code === extend_code)
                    return meta
            }
        )
        if (!extend_metadata.length)
            return []
        let all_extend_attributes = JSON.parse(JSON.stringify(extend_metadata[0].attribute))

        let all_extend_attrs_keys = all_extend_attributes.map(
            attr => {
                return attr.key
            }
        )
        let attribute = []

        extend_attributes.forEach(
            attr => {
                let index = all_extend_attrs_keys.indexOf(attr.key)
                if (index !== -1) {
                    let temp_attr = JSON.parse('{}')
                    Object.assign(temp_attr, all_extend_attributes[index], attr)
                    temp_attr.key = extend_code + '.' + temp_attr.key
                    attribute.push(temp_attr)
                }
            }
        )
        return attribute
    }

    /**
     * 关联服务作为当前服务的属性(leading:true),获取这样的属性列表
     * @param {*} related_services
     * @param {*} metadatas
     */
    getRelatedServiceAttributes (related_services, metadatas) {
        let attributes = []

        // UCMP-1191 初始化脚本服务被当前租户禁用后，申请云主机不再看见初始化脚本信息
        let metadataCodes = []
        if (metadatas && metadatas.length) {
            metadataCodes = metadatas.map(
                meta => {
                    return meta.service_code
                }
            )
        }
        let filteredServices = related_services.filter(
            service => {
                if (metadataCodes.indexOf(service.service_code) !== -1)
                    return service
            }
        )
        filteredServices.forEach(
            related => {
                // eslint-disable-next-line
                if (!related.leading || !related.created && !related.orchestrate)
                    return
                let attribute = JSON.parse('{}')
                attribute.key = related.service_code
                attribute.label = related.label
                attribute.multiple = ['o:m', 'm:m'].indexOf(related.refer_type) !== -1
                attribute.duplicated = related.duplicated ? true : false
                attribute.data_link = related.data_link
                attribute.required = related.required
                attribute.created = related.created
                attribute.related_to_owner = related.related_to_owner ? true : false
                attribute.table_column = related.table_column
                attribute.isShow = related.table_column
                attribute.query_condition = related.query_condition
                related.leading !== undefined && (attribute.leading = related.leading)
                related.refer_type !== undefined && (attribute.refer_type = related.refer_type)

                if (related.children)
                    attribute.children = related.children
                if (related.attribute)
                    attribute.attribute = related.attribute
                if (related.children_key)
                    attribute.children_key = related.children_key
                if (related.validation)
                    attribute.validation = related.validation
                if (related.influence)
                    attribute.influence = related.influence
                if (related.orchestrate)
                    attribute.orchestrate = related.orchestrate
                if (related.disable_apply_orchestrate)
                    attribute.disable_apply_orchestrate = related.disable_apply_orchestrate
                if (related.link)
                    attribute.link = related.link
                if (related.linked)
                    attribute.linked = related.linked
                // UCMP3-427 申请云硬盘，所属云主机列表接口定制化：过滤掉挂载的硬盘已经超过16个的
                if (related.data_link_for_create)
                    attribute.data_link_for_create = related.data_link_for_create
                // UCMP3-773 支持副标题显示
                if (related.sub_text_field)
                    attribute.sub_text_field = related.sub_text_field
                // 没有 attribute 或者 attribute 长度为0 并且 data_link没有child属性，则类型为select
                // eslint-disable-next-line
                if ((!related.attribute || related.attribute && !related.attribute.length) && related.data_link) {
                    attribute.type = !related.data_link.child ? 'select' : 'script'
                }
                // 保留存在enum的映射关系
                related.enum && (attribute.enum = related.enum)

                attributes.push(attribute)
            }
        )

        return attributes
    }

    updateAttributeType (attributes, configAttribute, itemId, widget_config, splitSymbol = '@') {
        attributes.forEach(
            attribute => {
                // attribute添加唯一id，确保多个相同类型的资源配置表单能够正确校验
                // UCMP3-2527 分隔符支持自定义
                if (itemId)
                    attribute.id = itemId + splitSymbol + attribute.key

                // 补充校验信息
                if (attribute.required)
                    attribute.validation ? attribute.validation.required = true : attribute.validation = { required: true }
                // 配置默认数据源
                if (attribute.enum)
                    attribute.defaultOptions = attribute.enum
                // 更新控件显示类型信息
                if (configAttribute && configAttribute[attribute.key] && configAttribute[attribute.key].type) {
                    attribute.type = configAttribute[attribute.key].type
                    return
                }

                // UCMP-709 新建编排，初始化mysql 版本等下拉框的内容
                if (attribute.enum)
                    attribute.defaultOptions = attribute.enum
                // eslint-disable-next-line
                if (attribute.data_link && attribute.data_link.endpoint && !attribute.data_link.value_key || attribute.enum) {
                    attribute.type = 'select'
                    attribute.popper_not_to_body = widget_config && widget_config.popper_not_to_body ? true : false
                }
                if (attribute.type === 'integer')
                    attribute.type = 'number'
                 // eslint-disable-next-line
                if (attribute.children && attribute.children.length || attribute.children_key && attribute[attribute.children_key] && attribute[attribute.children_key].length)
                    attribute.type = 'combinedItem'
                if (attribute.data_link && attribute.data_link.endpoint && attribute.data_link.value_key && attribute.children_key && attribute[attribute.children_key] && attribute[attribute.children_key].length)
                    attribute.type = 'selectObj'
                // 当formItem 的data_link 中含有child 属性时 将其 type 转为script
                if (attribute.data_link && attribute.data_link.child)
                    attribute.type = 'script'
                if (attribute.key === 'image')
                    attribute.type = 'image'
            }
        )

        // 如果需要自动生成id，替换dependencies、formatter的key为对应的id
        if (itemId) {
            let attribute_keys = attributes.map(
                attr => {
                    return attr.key
                }
            )
            attributes.forEach(
                item => {
                    // UCMP3-2217 密码与确认密码一致校验
                    if (item.validation && item.validation.keepSamePassword)
                        item.validation.keepSamePassword.confirm_key = this.getAttributeIdByKey(attributes, attribute_keys, item.validation.keepSamePassword.confirm_key, itemId)
                    // dependencies 替换key为id
                    if (item.dependencies) {
                        item.dependencies = item.dependencies.map(
                            dependency => {
                                return this.getAttributeIdByKey(attributes, attribute_keys, dependency, itemId)
                            }
                        )
                    }
                    // link 替换key为id
                    if (item.link) {
                        Object.keys(item.link).forEach(
                            link_key => {
                                item.link[link_key] = item.link[link_key].map(
                                    link_item => {
                                        return this.getAttributeIdByKey(attributes, attribute_keys, link_item, itemId)
                                    }
                                )
                            }
                        )
                    }
                    // filter_value_formatter 替换key为id
                    if (item.data_source_filter && item.data_source_filter.filter_value_formatter)
                        item.data_source_filter.filter_value_formatter = this.getAttributeFormatter(item.data_source_filter.filter_value_formatter, attributes, attribute_keys, itemId)
                    // formatter替换key为id
                    if (item.formatter)
                        item.formatter = this.getAttributeFormatter(item.formatter, attributes, attribute_keys, itemId)
                }
            )
        }
    }

    // 控制台过滤条件用
    updateFilterAttributeType (attributes) {
        attributes.forEach(attribute => {
            // 过滤条件应不存在disabled
            attribute.disabled = false
            if (attribute.query_condition.enum)
                attribute.query_condition.defaultOptions = attribute.query_condition.enum
            // eslint-disable-next-line
            if (attribute.query_condition.data_link && attribute.query_condition.data_link.endpoint && !attribute.query_condition.data_link.value_key || attribute.query_condition.enum) {
                attribute.type = 'select'
            }
            if (attribute.type === 'integer')
                attribute.type = 'number'
             // eslint-disable-next-line
            if (attribute.query_condition.children && attribute.query_condition.children.length || attribute.query_condition.children_key && attribute.query_condition[attribute.query_condition.children_key] && attribute.query_condition[attribute.query_condition.children_key].length)
                attribute.type = 'combinedItem'
            if (attribute.query_condition.data_link && attribute.query_condition.data_link.endpoint && attribute.query_condition.data_link.value_key && attribute.query_condition.children_key && attribute.query_condition[attribute.query_condition.children_key] && attribute.query_condition[attribute.query_condition.children_key].length)
                attribute.type = 'selectObj'
            // 当formItem 的data_link 中含有child 属性时 将其 type 转为script
            if (attribute.query_condition.data_link && attribute.query_condition.data_link.child)
                attribute.type = 'script'
            if (attribute.key === 'image')
                attribute.type = 'image'

            // 针对不在table筛选的列，且需要更改查询key值，直接替换
            if (attribute.query_condition && attribute.query_condition.query_attribute && !attribute.query_condition.table_head)
                attribute.key = attribute.query_condition.query_attribute
        })
    }

    /**
     * @description 根据指定的key以及系统id信息得到对应的id
     * @param {*} attributes 属性列表
     * @param {*} attribute_keys 属性key列表
     * @param {*} _key 当前key值
     * @param {*} itemId 系统id
     */
    getAttributeIdByKey (attributes, attribute_keys, _key, itemId) {
        let index = attribute_keys.indexOf(_key)
        if (index !== -1)
            return attributes[index].id
        // UCMP3-671 申请nas蓝图，命名规范的文件系统类型没有正确显示
        else if (index === -1 && _key !== 'short' && _key !== 'site' && _key !== 'user_name' && _key !== 'ip')
            return itemId + '@' + _key
        // else if (_key === 'nas_fs_type')
        //     return itemId + '@' + _key
        else
            return _key
    }

    /**
     * @description 针对${key}格式的语句，自动替换key为id
     * @param {*} formatter 源格式语句
     * @param {*} attributes 属性列表
     * @param {*} attribute_keys 属性key值列表
     * @param {*} itemId 系统id
     */
    getAttributeFormatter (formatter, attributes, attribute_keys, itemId) {
        let reg = /\$\{[\w\-\u4e00-\u9fa5@#!\$%]+\}/g
        let originFormatter = formatter
        let matched = originFormatter.match(reg)
        if (matched && matched.length) {
            matched.forEach(
                alpha => {
                    let replaced = alpha.replace(/[(\$\{)\}]{1}/g, '')
                    let replacedAlpha = this.getAttributeIdByKey(attributes, attribute_keys, replaced, itemId)
                    originFormatter = originFormatter.replace(alpha, '${' + replacedAlpha + '}')
                }
            )
        }
        return originFormatter
    }

    // 获取关联服务的query_condation Attribute
    getRelatedQueryCondition (related_services = [], metadatas = []) {
      let copy_related_services = JSON.parse(JSON.stringify(related_services))
      let attributes = this.getRelatedServiceAttributes(copy_related_services, metadatas)
      let copyAttributes = JSON.parse(JSON.stringify(attributes))

      return copyAttributes
    }

    transformImagesToTree (images) {
        let tempImages = JSON.parse(JSON.stringify(images))
        let rst = []
        tempImages.forEach(
            image => {
                let operations = rst.map(
                    oper => {
                        return oper.id
                    }
                )
                // 如果没有操作系统，该镜像无法显示
                if (!image.os || !image.os.os_family || !image.os.os_version || !image.os.name)
                    return
                let oper_index = operations.indexOf(image.os.os_family)
                if (oper_index !== -1) {
                    let os_versions = rst[oper_index].children.map(
                        version => {
                            return version.id
                        }
                    )
                    // UCMP-1317 镜像选择组件过滤分组时，添加arch 判断条件
                    let version_index = os_versions.indexOf(image.os.os_version + '(' + image.os.arch + ')')
                    if (version_index !== -1) {
                      rst[oper_index].children[version_index].children.push({
                            // UCMP3-1000 获取操作系统类型的时候添加include_services字段信息
                            id: image.id + '$' + (Array.isArray(image.include_services) ? image.include_services.join(',') : ''),
                            name: image.name
                        })
                    } else {
                        let version = {
                            id: image.os.os_version + '(' + image.os.arch + ')',
                            name: image.os.os_version + '(' + image.os.arch + ')',
                            children: [
                                {
                                    id: image.id + '$' + (Array.isArray(image.include_services) ? image.include_services.join(',') : ''),
                                    name: image.name
                                }
                            ]
                        }
                        rst[oper_index].children.push(version)
                    }
                } else {
                    let operation = {
                        id: image.os.os_family,
                        name: image.os.os_family,
                        children: [
                            {
                                id: image.os.os_version + '(' + image.os.arch + ')',
                                name: image.os.os_version + '(' + image.os.arch + ')',
                                children: [
                                    {
                                        id: image.id + '$' + (Array.isArray(image.include_services) ? image.include_services.join(',') : ''),
                                        name: image.name
                                    }
                                ]
                            }
                        ]
                    }
                    rst.push(operation)
                }
            }
        )
        return rst
    }

    /**
     * @description 1. 详细配置过滤器 UCMP3-888 青云负载均衡器使用公网，不显示网络；
     * 2. F5 健康检查算法只有HTTP的情况下显示健康检查URL和返回值
     */
    detailItemFilter (row, service_code, list) {
        let valueObj = {}
        list.forEach(
            item => {
                valueObj[item.key] = item.value
            }
        )
        if (service_code === 'qingcloud_lb') {
            if ((valueObj.public_ip4 || valueObj.public_network_switch === '使用') && row.key === 'vxnet_id')
                return false
            if (!valueObj.public_ipv4 && valueObj.public_network_switch !== '使用' && row.key === 'securityGroup')
                return false
        }

        if (service_code === 'f5') {
            //
            return f5ItemVisible()
        }

        function f5ItemVisible () {
            if (list && (row.key === 'send' || row.key === 'receive')) {
                let f5Parent = list.find(item => {
                    return item.key === 'parent'
                })

                // UCMP3-1225 F5显示优化,只有http算法是，显示这两个字段
                return !f5Parent || f5Parent.value === 'http'
            } else
                return true
        }

        return true
    }

    /**
     * @description 自动根据formatter格式封装value(type:input|string)
     * @param [formatter:string]
     * @param [formData:object] {short: 'name'}
     *
     * 格式化过程 '${short}_PARAMS' => 'name__PARAMS'
     */
    getDependenciesByFormatter (formatter, formData, disabled = false) {
        let reg = /\$\{[\w\-\u4e00-\u9fa5@#!\$%]+\}/g
        let matched = formatter.match(reg)
        let value = formatter
        // let formData = { ...this.formData, ...this.externalFormData }
        if (matched && matched.length) {
            matched.forEach(
                alpha => {
                    let replaced = alpha.replace(/[(\$\{)\}]{1}/g, '')
                    if (formData[replaced] !== undefined)
                        value = value.replace(alpha, formData[replaced] || '')
                    else if (formData[replaced] === undefined && disabled)
                        value = value.replace(alpha, '')
                }
            )
        }
        return value
    }

    updatePropertiesAttribute (attribute) {
        let attr = JSON.parse(JSON.stringify(attribute))

        delete attr.linked
        delete attr.link
        delete attr.unit
        delete attr.data_link
        delete attr.tip
        delete attr.required
        delete attr.type
        delete attr.children
        delete attr.validation
        delete attr.display_same_row
        delete attr.defaultOptions
        delete attr.default_options
        delete attr.disabled

        attr.enum = JSON.parse(JSON.stringify(CheckboxGroup)).map(
            checkbox => {
                return { id: checkbox.label, name: checkbox.text }
            }
        )
        attr.fe_type = {
            type: 'checkbox'
        }
        attr.multiple = true
        return attr
    }

    /**
     * @description 连线属性列表 UCMP3-3407 特殊连接符号未指定(默认@)，导致连线属性配置无法保存
     */
    getRelatedAttributesByIdAndRule (source, target, id, rule, splitSymbol = '@') {
        if (!source || !target || !source.data.info || !source.data.info.related_service)
            return []
        let rules = rule.split('|')
        let relatedServices = source.data.info.related_service
        let linkedService = relatedServices.filter(
            service => {
                if (service.service_code === target.data.info.service_code)
                    return service
            }
        )

        if (!linkedService.length)
            return []
        // 过滤得到允许编排使用的属性列表
        let attributes = linkedService[0].attribute.filter(
            attr => {
                return rules.some(_rule => { return !!attr[_rule] })
            }
        )
        let copiedAttrs = JSON.parse(JSON.stringify(attributes))
        // 更改元数据attribute列表的type为实际的表单控件类型
        this.updateAttributeType(copiedAttrs, null, id, { popper_not_to_body: true }, splitSymbol)
        return copiedAttrs ? copiedAttrs : []
    }

    gerenateFormItems (attributes, relyInstance) {
        let result = JSON.parse(JSON.stringify(attributes))
        Array.isArray(result) && result.forEach(
            attr => {
                if (attr.data_link && attr.data_link.endpoint && attr.data_link.method && relyInstance) {
                    attr.type = 'select'

                    // 解析url参数，从this.instances[0]替换对应参数信息，例如：云硬盘的所属云主机需要当前硬盘的owner、env、owner_type、provider_id信息
                    let matched = attr.data_link.endpoint.match(/\:[\w\-]+/g)
                    if (matched && matched.length) {
                        matched.forEach(
                            item => {
                                let replacedKey = item.replace(':', '')
                                attr.data_link.endpoint = attr.data_link.endpoint.replace(item, relyInstance[replacedKey])
                            }
                        )
                    }
                }
                if (!attr.validation)
                    attr.validation = {}
                if (attr.required || attr.validation.required)
                    attr.validation.required = true
            }
        )
        return result
    }

    // 查找元数据中某服务的状态列表，并返回map格式的对象
    getStatusMapByCode (metadata, serviceCode) {
        let rst = {}
        let ecsMeta = metadata.find(item => item.service_code === serviceCode)
        if (ecsMeta && ecsMeta.attribute) {
            let statusEnum = ecsMeta.attribute.find(_enum => _enum.key === 'status')
            if (statusEnum && statusEnum.enum) {
                statusEnum.enum.forEach(
                    status => {
                        rst[status.id] = status
                    }
                )
            }
        }
        return rst
    }
    /**
     * @description 检查value是否有效
     */
    isValidValue (value) {
        return ![undefined, null, ''].includes(value)
    }
    /**
     * @description 格式化资源详情value
     */
    getFormatOrderDetailValue (service_code, currentItem, value, resouceItem) {
        // 所属云主机字段显示特殊处理
        if (currentItem.key === 'ecs_instance_id')
            return resouceItem.ecs_instance_name || '--'

        // 云硬盘类型特殊处理
        if (service_code === 'volume' && currentItem.key === 'type')
            return value ? (VolumeType[value] ? VolumeType[value] : value) : '--'

        // UCMP3-1682【个人中心】F5已经部署完成的任务单详情有Jason字符串
        if (currentItem.key === 'persistence_profiles')
            return value && value.defaults_from ? value.defaults_from.replace(/^\/Common\//, '') : '--'

        // UCMP3-5794 【控制台】F5节点删除，添加，健康检查算法是icmp类型的，申请单详情中不显示该类型
        if (currentItem.key === 'parent') 
            return value ? value.replace(/^\/Common\//, '') : '--'

        // 针对元数据enum类型处理
        if (currentItem.enum && currentItem.enum.length) {
            // 状态 和单位 取值不一样 nas挂载待执行页面的snapshot的取值为--
            let dislpayItem = currentItem.enum.find(enumItem => enumItem.id === value || enumItem.name === value || enumItem.name === String(value))
            // let dislpayItem = currentItem.enum.find(enumItem => enumItem.name)
            return dislpayItem ? dislpayItem.name : '--'
        }

        if (value === 0)
            return 0

        // UCMP3-3377 【控制台nas】nas挂载待执行页面的snapshot的取值为--，应该为准确数字
        // 问题原因：过滤了number类型0
        return this.isValidValue(value) ? (Array.isArray(value) ? value.join(',') : value) : '--'
    }

    /**
     * @description 处理group的显示
     */
    formatGroupDisplay (attr, displays, resouceItem) {
        if (!resouceItem[attr.key]) return
        let groupItem = {
            key: attr.table_column_group.group_key,
            label: attr.table_column_group.group_label,
            value: ''
        }
        // 处理显示value
        if (Array.isArray(resouceItem[attr.key])) {
            groupItem.value = resouceItem[attr.key].reduce((result, item, index, arr) => {
                result += attr.table_column_group.group_column_label + item
                if (index !== arr.length - 1) result += ', '
                return result
            }, '')
        } else
            groupItem.value = attr.table_column_group.group_column_label + resouceItem[attr.key]

        // 删除非group的显示
        let dislpayItemIndex = displays.findIndex(dislpayItem => dislpayItem.key === attr.key)
        if (dislpayItemIndex > -1)
            displays.splice(dislpayItemIndex, 1)

        // 处理group的显示
        let groupDislpayItem = displays.find(dislpayItem => dislpayItem.key === groupItem.key)
        if (groupDislpayItem)
            groupDislpayItem.value += `, ${groupItem.value}`
        else
            displays.push(groupItem)
    }

    allUniqueActionKeyAndLabels (metadatas) {
        let allActions = {}
        metadatas.forEach(
            item => {
                if (item.normal_actions && typeof item.normal_actions === 'object') {
                    Object.keys(item.normal_actions).forEach(action => {
                        let copied = JSON.parse(JSON.stringify(item.normal_actions[action]))
                        copied.name = action
                        // allActions.push(copied)
                        if (copied.is_approve && (!allActions.hasOwnProperty(action) || !allActions[action] || !allActions[action].label))
                            allActions[action] = JSON.parse(JSON.stringify(copied))
                    })
                }
                if (item.actions && Array.isArray(item.actions)) {
                    item.actions.forEach(action => {
                        allActions[action.name] = action
                    })
                }
            }
        )
        return Object.keys(allActions).filter(key => {
            if (allActions.hasOwnProperty(key) && allActions[key] && allActions[key].label)
                return key
        }).map(key => {
            return {value: key, label: allActions[key].label}
        })
    }
}

export default new MetadataUtils()
