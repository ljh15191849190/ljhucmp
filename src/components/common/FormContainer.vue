
<template lang="pug">
  div.container-flud.ucmp-form-container(ref="container")
    el-row.breadcrumb-container(ref="breadcrumb")
        el-breadcrumb(separator-class="el-icon-arrow-right")
            el-breadcrumb-item(to="/dashboard") {{sysName}}
            el-breadcrumb-item(v-for="(item, index) in breadcrumbItems" :key="item.prop" :to="{ path: item.prop }") {{item.label}}
    div.ucmp-form-content(ref="form-content")
        div.full-container
            div.form-content
                slot(name="form-content")
    div.ucmp-form-footer
        slot(name="form-footer")
</template>
<script>
/**
 * @description 通用表单容器组件，包含三部分：breadcrumb以及content和footer
 * @augments [breadcrumbItems] 面包屑数据，不包含平台名称，
 *          prop：路由信息，
 *          label: 名称；
 * @author davidPan
 */
import { mapGetters } from 'vuex'
export default {
    props: {
        breadcrumbItems: {
            type: Array,
            default: [],
            required: true
        }
    },
    data () {
        return {
        }
    },
    computed: {
        ...mapGetters([
            'sysName'
        ])
    },
    created () {
        if (!this.breadcrumbItems)
            this.breadcrumbItems = []
    }
}
</script>
<style lang="scss" scoped>
.ucmp-form-container {
    .ucmp-form-content {
        height: calc(100% - 63px);
        overflow: hidden;
        .form-content {
            margin: 0px 16px 20px 16px;
            height: calc(100% - 69px);
            background-color: #ffffff;
            overflow-y: auto;
            overflow-x: hidden;
        }
    }
    .ucmp-form-footer {
        height: 60px;
        background-color: #ffffff;
        position: fixed;
        bottom: 0;
        left: 190px;
        right: 0;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-right: 30px;
    }
}
@media screen and (max-width: 1366px){
    .ucmp-form-container {
        .ucmp-form-content {
            height: calc(100% - 43px);
        }
    }
}
</style>

