<template lang="pug">
    div.form-item-table
        el-button(type="primary" size="mini" @click="showDialog") {{ btnName }}
        el-table(ref="normalTable" :data="tableData" stripe border)
            el-table-column(v-for="(column, index) in columns" :prop="column.prop" :key="column.prop" :label="column.label" :width="column.width")
                template(slot-scope="scope")
                    el-input(v-if="column.edit"
                    v-model="scope.row[column.prop]"
                    :type="column.password ? 'password' : 'text'"
                    size="mini"
                    :name="column.prop + scope.$index"
                    :data-vv-as="column.label"
                    v-validate="rules[column.prop]"
                    :class="{'input': true, 'is-danger': errors.has(column.prop + scope.$index)}")
                    el-select(v-else-if="column.select"
                    v-model="scope.row[column.prop]"
                    size="mini"
                    :name="column.prop + scope.$index"
                    :data-vv-as="column.label"
                    v-validate="rules[column.prop]"
                    :class="{'input': true, 'is-danger': errors.has(column.prop + scope.$index)}")
                        el-option(v-for="item in column.enum" :key="item[column.value_field]" :label="item[column.text_field]" :value="item[column.value_field]")
                    //- reference
                    span(v-else-if="column.reference") {{getReference(scope.row, column.prop, column.referenceKey, column.referenceValue)}}
                    span(v-else-if="Array.isArray(scope.row[column.prop])")
                        li(v-for="arrItem in scope.row[column.prop]") {{arrItem}}
                    span(v-else) {{scope.row[column.prop]}}
                    // error message
                    span.validator-error.is-danger.cell-error(v-if="errors.has(column.prop + scope.$index)") {{ errors.first(column.prop + scope.$index) }}
        el-dialog.z-index(v-if="dialogVisible" :title="btnName" :visible.sync="dialogVisible" @close="closeDialog" width="800px")
            TableSelect(ref="tableSelect" :config="dialogConfig" :columns="dialogColumns" :selectedList="dialogSelectedList")
            div.dialog-footer(slot="footer")
                el-button(@click="closeDialog" size="small") 取消
                el-button(type="primary" @click="save" size="small") 保存
</template>

<script>
    import Api from '@api'
    import TableSelect from '@/components/common/TableSelect'
    import DynamicTableConfig from './dynamicTableConfig.mixin'
    import {mapGetters} from 'vuex'

    /**
     * @description 动态表单复杂项 —— 填充性表格
     * @author jia.lu
     */
    export default {
        name: 'DynamicTable',
        components: {TableSelect},
        mixins: [DynamicTableConfig],
        inject: ['$validator'],
        props: {
            selectedData: {
                type: Array,
                default: () => {
                    return []
                }
            },
            display: {
                type: Array,
                default: function () {
                    return []
                }
            },
            serviceCode: String,
            formItem: Object,
            externalFormData: Object,
            parentFormData: Object,
            uniqueKey: String
        },
        data () {
            return {
                tableData: [], // 表格维护数据，有自定义和edit数据
                selectedList: [],
                dialogVisible: false,
                dialogSelectedList: [],
                // UCMP3-771【服务目录】申请nas的时候，nas默认匹配的挂载路径有“\”，应该改为“/”。 是在下瓜皮了
                linuxSeparate: '/'
            }
        },
        created () {
            this.init()
        },
        computed: {
            btnName () {
                return this.serviceCode === 'ecs' ? '选择主机' : '选择' // ?
            },
            dialogColumns () {
                return (this.dynamicTableConfig && this.dynamicTableConfig[this.serviceCode]) ? this.dynamicTableConfig[this.serviceCode].dialogColumns : []
            },
            dialogConfig () {
                if (this.dynamicTableConfig && this.dynamicTableConfig[this.serviceCode]) {
                    let config = this.dynamicTableConfig[this.serviceCode].dialogConfig
                    if (this.serviceCode === 'ecs') {
                        // nas 挂载主机 需要修改对应的请求url
                        config.params = {
                            owner_type: this.externalFormData.owner_type || '--',
                            owner: this.externalFormData.owner || '--'
                        }
                    }

                    return config
                } else {
                    //
                    return {}
                }
            },
            rules () {
                return (this.dynamicTableConfig && this.dynamicTableConfig[this.serviceCode]) ? this.dynamicTableConfig[this.serviceCode].rules : {}
            },
            columns () {
                return (this.dynamicTableConfig && this.dynamicTableConfig[this.serviceCode]) ? this.dynamicTableConfig[this.serviceCode].columns : []
                // TODO 并没有使用元数据来配置，另组件中耦合了许多 'ecs' 所用代码
                // return this.formItem.attribute
            },
            formTableData () {
                return this.tableData.map(item => {
                    return {
                        instance_id: item.instance_id,
                        // UCMP3-1551【nas优化】选择好nas的配置后，右边页面的配置信息处，挂载主机显示为空。
                        instance_name: item.instance_name,
                        target_host: item.selectIp || null, // ?
                        target_ssh_port: item.target_ssh_port,
                        root_passwd: item.root_passwd,
                        target_path: item.target_path,
                        nas_fs_type: item.nas_fs_type
                    }
                })
            },
            ...mapGetters([
                'multipleCount'
            ])
        },
        methods: {
            init () {
                if ((this.formItem && this.formItem.refer_table === 'nas_ecs') && this.parentFormData[this.serviceCode]) {
                    let selectedArray = this.parentFormData[this.formItem[this.uniqueKey]] || this.parentFormData[this.formItem.key]
                    // UCMP3-4332【个人中心】存储管理员处理时查看不到nas挂载的主机信息
                    // 问题原因: 一次性取云主机没有取全部，取全部的话又有性能问题
                    // 解决方法: 通过挂载的云主机的名称去库里查云主机
                    selectedArray.forEach(item => {
                        Api.get(this.dialogConfig.api, {instance_name: item.instance_name}, true).then(res => {
                            let list = this.dialogConfig.listRoot ? res[this.dialogConfig.listRoot] : res
                            if (list && list.length) {
                                let selectedItem = list[0]
                                this.selectedList.push(selectedItem)
                                selectedItem.selectIp = item.target_host ? item.target_host : ''
                                this.tableData.push({...selectedItem, ...item})
                            }
                        })
                    })
                }
            },
            closeDialog () {
                this.dialogVisible = false
            },
            showDialog () {
                this.dialogVisible = true
            },
            save () {
                let selectedArray = this.$refs.tableSelect.getSelection()

                // 检查nas是否都选择了IP
                let nonCheckedIpList = []
                selectedArray.forEach(item => {
                    if (!item.selectIp) nonCheckedIpList.push(item.instance_name)
                })

                if (nonCheckedIpList.length) {
                    this.$notify({
                        type: 'warning',
                        message: `请为所选服务器【${nonCheckedIpList.join('，')}】选择IP！`
                    })
                    return
                }

                // selectedArray = JSON.parse(JSON.stringify(selectedArray))
                this.selectedList = selectedArray

                this.tableData = this.mergeToTableData(selectedArray)

                // UCMP-1483 添加相应节点时，每个节点的挂载路径默认显示为/挂载目录输入值，用户可以修改该值；
                this.setDefaultValue(this.tableData)
                this.$emit('update:display', JSON.parse(JSON.stringify(this.tableData)))
                this.closeDialog()
            },
            mergeToTableData (selectedArray) {
                let tempArray = []

                // 父类使用， 拿的是dialog的unique来匹配
                let unique = this.dialogConfig.unique

                selectedArray.forEach(selectedItem => {
                    let multipleCount = selectedItem[this.multipleCount] || 1

                    // table中可能存在edit项， 需保留原数据
                    let oldTableArray = this.tableData.filter(tableItem => {
                        // return tableItem[unique] === selectedItem[unique]
                        if (tableItem[unique] === selectedItem[unique]) {
                            // 更新数据
                            Object.assign(tableItem, selectedItem)
                            return true
                        }
                    })

                    oldTableArray = JSON.parse(JSON.stringify(oldTableArray))

                    if (oldTableArray.length > multipleCount) {
                        // 对数组削减，按照加入顺序减去后加入的
                        tempArray = [...tempArray, ...oldTableArray.splice(0, multipleCount)]
                    } else {
                        // 新加入补新
                        tempArray = [...tempArray, ...oldTableArray]

                        for (let i = 0, len = multipleCount - oldTableArray.length; i < len; i++) {
                            // 复制一份选中项
                            tempArray.push(JSON.parse(JSON.stringify(selectedItem)))
                        }
                    }
                })
                return tempArray
            },

            getEnum (columnEnum, value, text_field, value_field) {
                const getOne = columnEnum.find(item => {
                    if (value_field) {
                        //
                        return item[value_field] === value
                    }
                    return item === value
                })

                return getOne ? getOne[text_field] : ''
            },

            /**
             * 表格数据初始化
             *
             * @description 表格数据某列需要根据其他数据做初始化，只做初始化
             * @param tableData
             */
            setDefaultValue (tableData) {
                tableData.forEach(row => {
                    // TODO 需要替换下行 this.parentFormData.nas_name 为对应的元数据key
                    // UCMP3-4351【光大nas】服务目录申请nas，并且挂载云主机，挂载路径不能修改
                    this.$set(row, 'target_path', row.target_path || (this.linuxSeparate + (this.parentFormData.volume_set || '')))
                })
            },

            getReference (data, key, refKey, refOptionObj) {
                if (refKey === 'os_icon') {
                    let osType = data.os_icon || ''

                    if (osType) {
                        let type = osType === ('ucmp-icon-os-windows') ? 'windows' : 'linux'
                        // 赋值
                        // data[key] = refOptionObj[type].value
                        this.$set(data, key, refOptionObj[type].value)
                        return refOptionObj[type].label
                    } else {
                        // 灭有不让挂载
                        data[key] = ''
                        return ''
                    }
                }

                return '--'
            }
        },
        watch: {
            tableData: {
                handler (val) {
                    this.$emit('input', this.formTableData)
                    this.$emit('update:display', JSON.parse(JSON.stringify(this.formTableData)))

                    // 完全是为了解决rowSelect写死的问题的补丁代码，没有复用性
                    this.dialogSelectedList = this.selectedList.map(item => {
                        let temp = Object.assign({}, item)
                        temp.ip = item.selectIp
                        return temp
                    })
                },
                deep: true
            }
        }
    }
</script>

<style lang="scss" scoped>
    .form-item-table_search {
        width: 50%;
        margin: 8px 0;
    }

    .z-index {
        z-index: 2008;
    }

    .is-danger.validator-error {
        position: static;
    }

    .cell-error {
        padding-left: 0px;
    }
</style>