<template lang="pug">
    div.color-picker-container(v-clickoutside="handleClickOutSide")
        div.color-picker(@click="pickerClick")
            div.color-trigger
                span.color-picker-color.is-alpha
                    span.inner(:style="{'background-color': selectedColor ? selectedColor : 'transparent'}")
                    span.empty.el-icon-close(v-if="selectedColor === ''")
                span.color-picker-icon.el-icon-arrow-down(:class="{'active': selectedColor !== ''}")
        div.color-container(v-show="isShow" :class="'direction_' + direction")
            div.d-flex
                div.color-selector.is-alpha(v-for='(color, index) in colors' :key="index" :class="{'selected': selectedColor === color}")
                    div.color-item(:style="{'background-color': color}" @click="selectColor(color)")
</template>
<script>
/**
 * @description 颜色选择器
 */
import clickoutside from 'element-ui/lib/utils/clickoutside'
export default {
    name: 'ColorPicker',
    props: {
        selectedColor: {
            type: String,
            default () {
                return ''
            }
        },
        colors: {
            type: Array,
            default () {
                return []
            }
        },
        direction: {
            type: String,
            default: 'bottom'
        }
    },
     data () {
        return {
            // color: '',
            isShow: false
        }
    },
    methods: {
        /**
         * @description 点击外部元素事件
         */
        handleClickOutSide () {
            this.isShow = false
        },
        /**
         * @description 选择器点击事件
         */
        pickerClick () {
            this.isShow = !this.isShow
        },
        selectColor (color) {
            this.$emit('update:selectedColor', color)
            this.isShow = false
        }
    },
    directives: {
        clickoutside
    }
}
</script>
<style lang="scss" scoped>
.color-picker-container {
    position: relative;
    .color-picker {
        display: inline-block;
        position: relative;
        line-height: normal;
        height: 40px;
        .color-trigger {
            display: inline-block;
            box-sizing: border-box;
            height: 40px;
            width: 40px;
            padding: 4px;
            border: 1px solid #e6e6e6;
            border-radius: 4px;
            font-size: 0;
            position: relative;
            cursor: pointer;
            .color-picker-color {
                position: relative;
                display: block;
                box-sizing: border-box;
                border: 1px solid $fontTitleLight;
                border-radius: 2px;
                width: 100%;
                height: 100%;
                text-align: center;
                .inner {
                    position: absolute;
                    left: 0;
                    top: 0;
                    right: 0;
                    bottom: 0;
                }
                .empty {
                    font-size: 12px;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate3d(-50%,-50%,0);
                    color: $fontTitleLight;
                }
            }
            .is-alpha {
                background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
            }
            .color-picker-icon {
                display: none;
                font-size: 12px;
                width: 100%;
                color: #fff;
                text-align: center;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate3d(-50%,-50%,0);
                &.active {
                    display: inline-block;
                }
            }
        }
    }
    &.is-danger {
        .color-picker {
            .color-trigger {
                border-color: #e64451;
            }
        }
    }
    .color-container {
        max-width: 300px;
        position: absolute;
        z-index: 10;
        padding: 8px;
        box-sizing: content-box;
        background-color: #fff;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        left: -130px;
        &.direction_right {
            left: 50px;
            top: 0;
        }
        // display: flex;
        .color-selector {
            margin: 0 0 8px 8px;
            width: 20px;
            height: 20px;
            border-radius: 4px;
            cursor: pointer;
        }
        .selected {
            box-shadow: 0 0 3px 2px #409eff;
        }
        .color-item {
            display: flex;
            height: 100%;
            border-radius: 3px;
        }
        .color-btns {
            margin-top: 6px;
            text-align: right;
        }
    }
}
</style>
