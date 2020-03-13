<template lang="pug">
    ul.resource-nav
        li.resource-item(:ref="'item_' + d[uniqueKey]" v-for="d in navbars" :key="d[uniqueKey]" draggable="true" @dragstart="dragstart_handler($event, d)" @dragend="dragend_handler($event)")
            //- bug #UCMP-450【应用编排】编排名称过长时显示问题
            span(:class="'resource-item-text ' + 'resource-icon-' + d[uniqueKey]" v-title-tip="d[label]") {{ d[label] }}
</template>
<script>
/**
 * @description resources list for hierchicaldiagram editor to drag item and drop it to svg
 * @description based on H5 drag & drop without jquery or d3
 */
export default {
    props: {
        // 左侧资源节点集合
        navbars: {
            type: Array,
            default: function () {
                return []
            }
        },

        adding_node: {
            type: Object,
            default: function () {
                return null
            }
        },

        add_node_siwtch: {
            type: Boolean,
            default: function () {
                return false
            }
        },

        uniqueKey: {
            type: String,
            default: function () {
                return 'key'
            }
        },

        label: {
            type: String,
            default: function () {
                return 'label'
            }
        }
    },

    data () {
        return {
            dragGhost: null
        }
    },

    methods: {
        dragstart_handler (ev, d) {
            // Firefox must setData but chrome not, setData key must be 'Text' according to IE‘s rule
            ev.dataTransfer && ev.dataTransfer.setData && ev.dataTransfer.setData('Text', d.service_code)
            // clone icon node for drag display
            this.dragGhost = this.$refs['item_' + d[this.uniqueKey]][0].cloneNode(true)
            this.dragGhost.classList.add('custom-drag-ghost')
            this.dragGhost.getElementsByClassName('resource-item-text')[0].innerHTML = ''
            // add cloned node to body child
            document.body.appendChild(this.dragGhost)
            // UCMP3-4682 IE not support setDragImage event
            ev.dataTransfer && ev.dataTransfer.setDragImage && ev.dataTransfer.setDragImage(this.dragGhost, 11, 22)
            ev.effectAllowed = 'copyMove'
            this.$emit('update:adding_node', d)
        },

        dragover_handler (ev) {
            console.log('dragOver')
            // Change the target element's border to signify a drag over event
            // has occurred
            ev.currentTarget.style.background = 'lightblue'
            ev.preventDefault()
        },

        dragend_handler (ev, d) {
            // remove the cloned ghost node from body
            this.dragGhost.parentNode.removeChild(this.dragGhost)
        }
    }
}
</script>
<style lang="scss" scoped>
.resource-nav {
   padding-inline-start: 0;
}
</style>
<style lang="scss">
.custom-drag-ghost {
    list-style: none;
    font-size: 22px;
}
</style>
