<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item 云管理平台
                el-breadcrumb-item 历史会话     
        div.ucmp-content
</template>

<script>
/**
 * @description 历史会话
 */
export default {
    name: 'History',
    data () {
        return {
            dom: ''
        }
    },
    methods: {
    },
    created () {

    }
}
</script>
<style lang="scss" scoped>
.drop {
    width:198px; 
    height:66px;
    padding:10px;
    border:1px solid #aaaaaa;
}

.drag {
    width:98px; 
    height:30px;
    padding:10px;
    border:1px solid red;
}
</style>

