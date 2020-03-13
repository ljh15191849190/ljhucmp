<template lang="pug">
    div.config-container.gray-bg
        div.config-title.border-bottom.padding-left.d-flex
            el-button(type="text" icon="el-icon-arrow-right" @click="hideConfig")
            //- bug UCMP-450【应用编排】编排名称过长时显示问题
            span.text-overflow-ellipsis.w-100.d-inline-block {{ defaultGroups[group_id] ? defaultGroups[group_id].group_name : '' }}
        el-form.form-content.padding-left
            el-form-item(label="已添加资源")
                div.delete-node-from-group.el-icon-delete(type="text" v-for="node in groupNodes" :key="node.id" @click="deleteCheckedNodeGroup(node)" @mouseover="hovernode(node)" @mouseout="mouseoutnode(node)") {{ node.info.name }}
            el-form-item(label="待添加资源")
                div.delete-node-from-group.el-icon-plus(type="text" v-for="node in noGroupNodes" :key="node.id" @click="addGroup(node)" @mouseover="hovernode(node)" @mouseout="mouseoutnode(node)") {{ node.info.name }}
</template>
<script>
export default {
    inject: ['$validator'],
    props: ['noGroupNodes', 'group_id', 'defaultGroups', 'hasGroupInfoNodes', 'diagramInstance'],
    data () {
        return {
            checkedNode: []
        }
    },

    methods: {
        addGroup (node) {
            this.$set(node.info, 'group_id', this.group_id)
        },

        hideConfig () {
            this.$emit('update:showConfig', false)
        },

        deleteCheckedNodeGroup (node) {
            this.$confirm('确定删除' + node.info.name + node.id + '的分层信息', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                node.info.group_id = ''
            }).catch(() => {})
        },

        hovernode (node) {
            let diagramInstance = this.diagramInstance ? this.diagramInstance : this.$parent.$parent.$refs.editor.$refs.orchestrateEditor.$refs.diagram
            diagramInstance.checked_node = diagramInstance.findNodeById(node.id)
        },

        mouseoutnode (node) {
            let diagramInstance = this.diagramInstance ? this.diagramInstance : this.$parent.$parent.$refs.editor.$refs.orchestrateEditor.$refs.diagram
            diagramInstance.checked_node = null
        }
    },

    computed: {
        groupNodes () {
            return this.hasGroupInfoNodes.filter(
                node => {
                    if (node.info.group_id === this.group_id)
                        return node
                }
            )
        }
    }
}
</script>
<style lang="scss" scoped>
.config-container {
    width: 100%;
    height: 100%;
    .config-title {
        height: 50px;
        line-height: 50px;
    }
    .form-content {
        height: calc(100% - 50px);
        overflow-y: auto;
        overflow-x: hidden;
    }
}
.group-icon-button {
    margin-right: 0 !important;
    margin-left: 5px;
}

.delete-node-from-group {
    width: 180px;
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:before {
        margin-right: 5px;
    }
    &.el-button + &.el-button {
        margin-left: 0;
    }
}
</style>
