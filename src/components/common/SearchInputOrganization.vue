<template lang="pug">
    div.search-input-org(v-clickoutside="handleClickOutSide")
        div(@click="inputClick")
            el-input(
            placeholder="请选择组织机构"
            v-model="selectedLabel"
            size="small"
            clearable
            suffix-icon="el-icon-arrow-down"
            @clear="inputClear"
            @input="inputChange"
            @blur="handleBlur")
        div.filter-tree(v-show="isShowTree")
            // 列表树
            el-tree(
            v-show="!customSearching"
            :props="treeProps"
            :load="getOrgByParent"
            lazy
            :key="projectId"
            :node-key="nodeKey"
            :expand-on-click-node="false"
            :highlight-current="true"
            @node-click="treeNodeOnClick")
                span(slot-scope="{node, data}")
                    i.theme-color.ucmp-icon-device-org
                    span {{node.label}}

            // 搜索树
            el-tree(
            v-show="customSearching"
            :data="searchTree"
            :props="treeProps"
            :node-key="nodeKey"
            :expand-on-click-node="false"
            :highlight-current="true"
            default-expand-all
            @node-click="treeNodeOnClick")
                span(slot-scope="{node, data}")
                    i.theme-color.ucmp-icon-device-org
                    span {{node.label}}
</template>

<script>
    import Clickoutside from 'element-ui/lib/utils/clickoutside'
    import Api from '@api'

    /**
     * 组织机构选择 with 搜索
     * @description
     * @author jia.lu
     */
    export default {
        name: 'SearchInputOrganization',
        props: {
            value: [String, Object],
            disabled: {
                type: Boolean,
                default: false
            },
            // 用于列表，搜索的租户id，由用户传入，默认为当前用户
            projectId: {
                type: String,
                default: localStorage.getItem('tenant')
            },
            defaultOrg: {
                type: Array,
                default: () => []
            },
            // 显示所有层级名称
            showAllLevels: {
                type: Boolean,
                default: true
            },
            // 分隔符
            separator: {
                type: String,
                default: '/'
            }
        },
        data () {
            return {
                selectedLabel: '',
                isShowTree: false,
                treeProps: {
                    label: 'org_name',
                    children: 'sub_orgs'
                },
                nodeKey: 'id', // 树节点的匹配属性
                inputChangeTimer: null,
                searchTree: [],
                customSearching: false,
                chooseRealNode: false
            }
        },
        computed: {},
        methods: {
            handleClickOutSide () {
                this.isShowTree = false
                this.handleBlur()
            },

            // 展示input点击
            inputClick (e) {
                if (this.disabled) return
                // 清空按钮点击不弹出
                if (e.target.className.indexOf('el-input__clear') === -1) {
                    //
                    this.isShowTree = !this.isShowTree
                }
            },

            // 展示input输入，延迟后用户查询
            inputChange (customInput) {
                clearTimeout(this.inputChangeTimer)
                this.inputChangeTimer = setTimeout(() => {
                    if (customInput !== '') {
                        Api.get('orgQuery', {org_name: customInput, project_id: this.projectId}).then(res => {
                            this.searchTree = res.data.org_info

                            this.customSearching = true
                            this.isShowTree = true
                        })
                    }
                }, 1000)
            },

            // 点击获取下一级节点
            getOrgByParent (node, resolve) {
                if (this.projectId === '') {
                    resolve([])
                    return
                }

                let parentId
                if (node && node.level > 0) {
                    //
                    parentId = node.data.id
                }

                Api.get('orgLazy', {
                    id: parentId,
                    project_id: this.projectId
                }).then(res => {
                    resolve(res.data.orgs)
                })
            },

            // 节点选择
            treeNodeOnClick (data, node) {
                let packagedObj = this.packOrgNode(node)

                this.selectedLabel = this.showAllLevels ? packagedObj.display : data[this.treeProps.label]
                this.$emit('input', {
                    org_id: packagedObj.id,
                    org_array: packagedObj.levelArray
                })

                if (this.customSearching) {
                    //
                    this.chooseRealNode = true
                }

                this.handleClickOutSide()
            },

            // 对节点信息向上追溯
            packOrgNode (currentNode) {
                let obj = {}
                if (currentNode) {
                    obj.id = currentNode.data[this.nodeKey]
                    obj.levelArray = []
                    obj.display = []

                    let node = currentNode
                    // node.level > 0 搜索树下根节点level===0，id为undefined
                    while (node && node.data && node.level > 0) {
                        obj.levelArray.push(node.data[this.nodeKey])
                        obj.display.push(node.data[this.treeProps.label])
                        node = node.parent
                    }
                    obj.levelArray.reverse()
                    obj.display = obj.display.reverse().join(this.separator)
                }

                return obj
            },

            // 失焦，需要处理当前值是够是选择过的
            handleBlur () {
                // 失焦事件早于节点选择事件
                setTimeout(() => {
                    if (!this.isShowTree) {
                        // 处于搜索树状态 && 未选择 真实节点
                        if (this.customSearching && !this.chooseRealNode) {
                            //
                            this.selectedLabel = ''
                            this.inputClear()
                        }

                        // reset status
                        this.chooseRealNode = false
                        this.customSearching = false
                    }

                    this.$emit('blur')
                })
            },

            inputClear () {
                this.$emit('input', '')
            }
        },
        created () {
        },
        watch: {
            defaultOrg (newVal, oldVal) {
                // 展示, 当前用户以前选择的组织机构节点信息
                let label = ''
                let node = newVal.length ? newVal[0] : null
                while (node) {
                    label += node.org_name + this.separator
                    node = node[this.treeProps.children].length ? node[this.treeProps.children][0] : null
                }
                this.selectedLabel = label.slice(0, -1)
            }
        },
        directives: {
            Clickoutside
        }
    }
</script>

<style lang="scss" scoped>
    .search-input-org {
        width: 100%;
        display: inline-block;
        position: relative;
    }

    .ucmp-icon-device-org {
        margin-right: 6px;
    }

    .filter-tree {
        background-color: white;
        padding-right: 6px;
        margin-top: 10px;
        min-width: 100%;
        height: 200px;
        border: 1px solid #e6e6e6;
        overflow: auto;
        position: absolute;
        z-index: 100;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
</style>