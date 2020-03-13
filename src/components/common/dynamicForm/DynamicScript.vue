<template lang="pug">
    div.dynameic-script-section
            el-button.add-div(icon="el-icon-plus" :disabled="(!formItem.multiple && combinedValue.length >= 1)" @click="addNewScript")
            div.script-list(v-if="combinedValue.length")
                el-row(v-for="(script, index) in combinedValue" :key="script.id")
                    el-col(:span="17") {{script.name}}
                    el-col.opera-icon(:span="7")
                        i.el-icon-edit(@click="modifyScript(script)")
                        i.el-icon-delete(@click="deleteScript(script)")
            el-dialog(title="选择脚本" :visible.sync="dialogVisible" width="860px" :modal="isModal" v-if="dialogVisible")
                //- p.tip-text 脚本版本号默认为最新版本号，如需修改，请选择脚本后再进行编辑修改操作
                div.basic-items.border-bottom.margin-bottom.padding-bottom(v-if="!isModifying")
                    label.margin-right 过滤脚本：
                    el-cascader.input-width(
                        clearable
                        :options="treeData"
                        :props="props"
                        change-on-select
                        v-model="searchParams.nodeId"
                        size="small"
                        placeholder="请选择脚本目录"
                        @change="changeSearchParams"
                    )
                    el-select.margin-left.input-width(size="small" v-model="searchParams.tagIds" filterable clearable placeholder="请选择脚本标记" @change="changeSearchParams")
                        el-option(v-for="(tag, index) in tagList" :key="tag.id" :label="tag.name" :value="tag.id")
                    el-input.input-width.margin-left(size="small" v-model="searchParams.name" clearable placeholder="请输入脚本名称" @blur="changeSearchParams")
                div.basic-items
                    //- 选择脚本
                    label
                        span(v-if="!isModifying") 选择脚本：
                        span(v-else) 脚本名称/版本：
                    el-input.margin-left.input-width(v-if="isModifying" size="small" v-model="finalObj.name" disabled)
                    el-select.margin-left.input-width(v-else size="small" v-model="selectedScriptItemId" filterable placeholder="请选择脚本" @change="changeScript")
                        el-option(v-for="(script_item, index) in filterSelected(scriptsList)" :key="script_item.id" :label="script_item.name" :value="script_item.id")
                    //- 选择脚本版本
                    //- el-select.margin-left.input-width(size="small" v-model="finalObj.version" filterable placeholder="选择版本")
                    //-     el-option(v-for="version in currentScript.versions" :key="version.name" :label="version.name" :value="version.name")
                div.margin-top
                    h5 【自定义配置项】
                    div.padding-top.full-width(v-if="selectedScriptItemId && finalObj.version")
                        DynamicOtherForm.script-form(
                            v-if="currentVersionConf.params && Array.isArray(currentVersionConf.params) && currentVersionConf.params.length"
                            :value.sync="finalObj.params"
                            :formDatas="currentVersionConf.params"
                            :formId="formId"
                            :isScript="true"
                            @focusWidget="focusWidget")
                        div.tip-text(v-else)
                            | 无可编辑的自定义配置项
                    div.padding-top.full-width.tip-text(v-else)
                            | 请先选择脚本名称和版本
                div(slot="footer")
                    el-button(@click="dialogVisible = false") 取消
                    el-button(type="primary" :disabled="!selectedScriptItemId || !finalObj.version" @click="confirmHandle") 确认
</template>

<script>

import Api from '@api'
import DynamicOtherForm from './DynamicOtherForm'
import MetadataUtils from '@server/metadata.utils'

export default {
    $_veeValidate: {
        validator: 'new'
    },

    components: { DynamicOtherForm },
    props: {
        value: {
            type: Array,
            default () {
                return []
            }
        },
        // 元数据中关于脚本的信息，内含脚本列表请求地址等
        formItem: {
            type: Object,
            default: {}
        },

        display: {
            type: String,
            default: () => '[]'
        },

        // 所属资源ID
        formId: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            dialogVisible: false,
            scriptsList: [],
            finalObj: {},
            selectedScriptItemId: '',
            isModifying: false,
            currentScript: {},
            autoClose: false,
            isModal: false,
            searchParams: {
                nodeId: [],
                tagIds: '',
                type: '',
                name: ''
            },
            nodeList: [],
            tagList: [],
            languageList: [],
            props: {
                value: 'id',
                label: 'name'
            },
            treeData: [],
            currentVersionConf: {}
        }
    },
    created () {
        Api.get('api_script_node', {}, true).then(res => {
            // this.nodeList = res.data
            if (res)
                this.treeData = this.transformToTreeData(res.data, 'id', 'parentId', 'children', null)
        })
        Api.get('api_script_tags', {}, true).then(res => {
            if (res)
                this.tagList = res.data
        })

        this.initScriptList()
    },
    methods: {
        initScriptList (searchParams = {}) {
            let params = JSON.parse(JSON.stringify(searchParams))
            if (params.nodeId)
                params.nodeId = params.nodeId[params.nodeId.length - 1] || ''
            Api.get(this.formItem.data_link.endpoint, params).then(res => {
                /**
                 * 初始化获取得到脚本列表时需对其进行处理
                 * 1、将脚本具体版本中的params参数重置为customParamsAttrs对应的参数集合
                 * 2、如果为编辑状态的话对已选择的的脚本新增 isSelected 为 true
                 */
                if (res && res.data && res.data.fileList) {
                    res.data.fileList.forEach(item => {
                        item.versions.forEach(version => {
                            !version.params && (version.params = [])
                            // 原脚本数据中的params 参数无效，重新进行定义custom_params_attrs
                            let params = JSON.parse(item.versions[0].customParamsAttrs || '[]')
                            if (params && (params.key === 'SCRIPT_TYPE')) {
                                params.default && (version.script_type = params.default)
                                params.shift()
                            }
                            version.params = params
                        })
                        // 优化
                        // let params = JSON.parse(item.versions[0].customParamsAttrs || '[]')
                        // if (params && (params.key === 'SCRIPT_TYPE')) {
                        //     params.default && (item.versions[0].script_type = params.default)
                        //     params.shift()
                        // }
                        // item.versions[0].params = params
                        item.isSelected = !!(this.combinedValue.find(_item => _item.id === item.id))
                    })
                    this.scriptsList = res.data.fileList || []
                }
            })
        },
        // 删除所选脚本
        deleteScript (row) {
            this.$confirm(`此操作即将对脚本-${row.name}进行删除操作，请确认是否继续？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let delValIndex = this.combinedValue.findIndex(item => row.id === item.id)
                let delDisplayIndex = this.displayItems.findIndex(_item => row.id === _item.script_id)
                this.combinedValue.splice(delValIndex, 1)
                this.displayItems.splice(delDisplayIndex, 1)
                this.finalObj = {}
                // 将脚本列表中对应的脚本选择状态置为false
                this.handleScriptStatus(this.scriptsList, row.id, false)
                // 处理需要保存的数据
                this.$emit('update:value', this.combinedValue)
                this.$emit('update:display', JSON.stringify(this.displayItems))
            }).catch(() => { })
        },
        // 添加脚本操作
        addNewScript () {
            this.finalObj = {}
            this.dialogVisible = true
            this.isModifying = false
            // this.finalConfParams.version = ''
            this.selectedScriptItemId = ''
        },
        // 修改脚本配置
        modifyScript (row, index) {
            this.dialogVisible = true
            this.isModifying = true
            this.finalObj = JSON.parse(JSON.stringify(row))
            // this.getCurrentScript(row.id)
            this.currentScript = this.getCurrentScript(row.id)
            this.selectedScriptItemId = row.id
            this.finalObj = JSON.parse(JSON.stringify(row))
            this.currentVersionConf = this.updateCurrentVersionConf(this.currentScript, this.finalObj)
        },
        // 确认 添加/修改 脚本操作
        confirmHandle () {
            let tarObj = this.combinedValue.find(item => item.id === this.finalObj.id)

            // 对参数列表进行校验
            this.$validator.validate().then(result => {
                if (result) { //表单校验通过
                    if (tarObj) {
                        Object.keys(this.finalObj).forEach(key => {
                            if (key !== 'params')
                                tarObj[key] = this.finalObj[key]
                            else {
                                Object.keys(this.finalObj.params).forEach(_key => {
                                    tarObj.params[_key] = this.finalObj.params[_key]
                                })
                            }
                        })
                    } else {
                        // 添加操作
                        let obj = JSON.parse(JSON.stringify(this.finalObj))
                        Object.keys(obj).forEach(key => {
                            if (key === 'params') {
                                Object.keys(obj.params).forEach(_key => {
                                    obj.params[_key] = obj.params[_key] || ''
                                })
                            }
                        })
                        this.combinedValue.push(obj)
                    } 

                    this.emitFinalParams()
                    // 将脚本列表中对应的选中脚本勾选状态置为 true
                    this.handleScriptStatus(this.scriptsList, this.selectedScriptItemId, true)

                    this.selectedScriptItemId = ''
                    this.dialogVisible = false
                }
            })
        },
        changeScript (val) {
            // 脚本切换动作结束之后再进行v-if条件的生成。渲染dom界面
            this.$nextTick(() => {
                this.finalObj = {}
                this.finalObj.id = val
                this.currentScript = this.getCurrentScript(val)
                this.finalObj.type = this.currentScript.type
                this.finalObj.name = this.currentScript.name
                if (this.currentScript.versions && this.currentScript.versions.length) {
                    this.$set(this.finalObj, 'version', this.currentScript.versions[0].name)
                    this.finalObj.script_type = this.currentScript.versions[0].script_type || ''
                }
                this.currentVersionConf = this.updateCurrentVersionConf(this.currentScript, this.finalObj)
            })
        },
        emitFinalParams () {
            this.combinedValue.forEach(scirpt_item => {
                if (scirpt_item.params && (this.currentVersionConf.script_id === scirpt_item.id)) {
                    this.currentVersionConf.params.forEach(_conf => {
                        if (_conf.type === 'combinedItem') {
                            JSON.parse(scirpt_item.params[_conf.key]).forEach((item, index) => {
                                let short_obj = {}
                                /**
                                 *  处理value值中数组格式的参数
                                 * [{a:1, b:2},{a:2, b:4}] ==> {a1:1, b1:2, a2: 2, b2: 4}
                                 * */
                                for (const _key in item) {
                                    if (item.hasOwnProperty(_key) && _key !== 'serverOrder')
                                        short_obj[_key + (index + 1)] = _key === 'appserver_name' ? (item[_key] + item.serverOrder) : item[_key]
                                }
                                scirpt_item.params = { ...scirpt_item.params, ...short_obj }
                            })
                        }
                    })
                }
            })

            if (JSON.stringify(this.currentVersionConf) !== '{}') {
                let currentScript = this.displayItems.find(_item => {
                    return _item.script_id === this.currentVersionConf.script_id
                })
                if (currentScript)
                    currentScript.params = JSON.parse(JSON.stringify(this.currentVersionConf.params))
                else
                    this.displayItems.push(JSON.parse(JSON.stringify(this.currentVersionConf)))
            }

            this.$emit('update:display', JSON.stringify(this.displayItems))
            this.$emit('update:value', this.combinedValue)
        },

        // 打开脚本选择弹窗时过滤掉已选脚本
        filterSelected (list) {
            return list.filter(item => {
                return !item.isSelected
            })
        },

        // 对脚本增加 isSelected ，标识该脚本是否已存在配置项中
        handleScriptStatus (allList, tarId, finalVal = true, propName = 'isSelected') {
            let find_item = allList.find(item => {
                return tarId === item.id
            })
            if (find_item)
                find_item[propName] = !!finalVal
        },

        // 从初始的脚本列表（原子作业平台获取）过滤出当前正在编辑的脚本
        getCurrentScript (selectedScriptItemId) {
            let scriptsList = JSON.parse(JSON.stringify(this.scriptsList))
            if (scriptsList) {
                let _script = scriptsList.find(item => {
                    return item.id === selectedScriptItemId
                }) || {}
                return JSON.parse(JSON.stringify(_script))
            } else
                return {}
        },
        changeSearchParams () {
            this.initScriptList(this.searchParams)
            this.finalObj = {}
            this.selectedScriptItemId = ''
        },

        transformToTreeData (data, idName, pIdName, childrenName, pId) {
            let result = []
            let temp = []
            // 深拷贝数组对象
            for (let i = 0; i < data.length; i++) {
                if (data[i][pIdName] === pId) {
                    let node = data[i]
                    let tempArr = JSON.parse(JSON.stringify(data))
                    tempArr.splice(i, 1)
                    temp = this.transformToTreeData(tempArr, idName, pIdName, childrenName, data[i][idName])
                    if (temp.length)
                        node[childrenName] = temp
                    result.push(node)
                }
            }
            return result
        },

        /**
         * currentScript 是初始的脚本参数，可能会存在多个版本
         * finalConfParams 为当前编辑的脚本信息
         * 根据 finalConfParams从 currentScript众多版本中查找出当前编辑的指定版本参数，并且重新构建成新的object，供下一步使用
         */
        updateCurrentVersionConf (currentScript, scriptData) {
            let currentConf = {}
            if (currentScript && currentScript.versions) {
                // 查找出当前编辑的脚本版本
                currentConf = currentScript.versions.find(item_conf => {
                    return item_conf.name === scriptData.version
                })

                currentConf.script_id = currentScript.id
                currentConf.script_name = currentScript.name

                // 将初始数据中的customParamsAttrs  json字段解析为object，生成脚本参数的元数据
                // currentConf.params = JSON.parse(currentConf.customParamsAttrs || '[]')
                let params = JSON.parse(currentConf.customParamsAttrs || '[]')
                if (params[0] && (params[0].key === 'SCRIPT_TYPE')) {
                    currentConf.script_type = params[0].default
                    params.shift()
                }
                currentConf.params = params
                MetadataUtils.updateAttributeType(currentConf.params)
                // 如果为编辑状态，将参数元数据中的default值修改为当前scriptData的value值
                if (this.isModifying) {
                    currentConf.params.forEach(_conf => {
                        if (scriptData.params.hasOwnProperty(_conf.key)) {
                            if (_conf.children && Array.isArray(_conf.children))
                                _conf.default = Array.isArray(scriptData.params[_conf.key]) ? scriptData.params[_conf.key] : JSON.parse(scriptData.params[_conf.key] || '[]')
                            else
                                _conf.default = scriptData.params[_conf.key]
                        }
                    })
                }
            }
            return currentConf ? JSON.parse(JSON.stringify(currentConf)) : {}
        },
        focusWidget (formId) {
            this.$emit('focusWidget', formId)
        }
    },
    watch: {
        'finalObj.version' (newVal, oldVal) {
            if ((newVal !== oldVal) && newVal && this.currentScript && this.currentScript.versions) {
                let _nowVersion = this.currentScript.versions.find(version => {
                    return version.name === newVal
                })
                let nowVersion = JSON.parse(JSON.stringify(_nowVersion))
                MetadataUtils.updateAttributeType(nowVersion.params)
                nowVersion.version = nowVersion.name
                // this.finalObj.version = nowVersion.version
                this.finalObj.download_url = nowVersion.downloadUrl
                this.finalObj.params = {}
                nowVersion.script_type && (this.finalObj.script_type = nowVersion.script_type)
                // 在监听对象改变完成之后使用$set对params属性赋值，达到双向绑定目的
                this.$nextTick(() => {
                    nowVersion.params.forEach(param_item => {
                        // 在对finalObj.params 赋值时先对即将赋的值进行处理
                        if (param_item.default === undefined) {
                            param_item.default = param_item.multiple ? [] : null

                            // UCMP-686 修复默认值不生效的问题
                            if (param_item.type === 'number')
                                param_item.default = 0
                            if (param_item.type === 'combinedItem')
                                param_item.default = []
                        }
                        this.$set(this.finalObj.params, param_item.key, param_item.default)
                    })
                })
            }
        }
    },
    computed: {
        displayItems () {
            return JSON.parse(this.display)
        },
        combinedValue () {
            return JSON.parse(JSON.stringify(this.value))
        }
    }
}
</script>
<style lang="scss" scoped>
.basic-items{
    .input-width {
        width: 200px !important;
    }
}
.dynameic-script-section {
    width: 200px;
}
.script-form {
    width: calc(100% - 90px);
}
</style>
