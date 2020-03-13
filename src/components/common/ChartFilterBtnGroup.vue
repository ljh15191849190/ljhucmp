<template lang="pug">
	div.titleBar
		span.filter_btn(v-for="(provider, index) in types", :index="index", @click="select(provider.id)")
			span(:class="{active: types[index].id == activeId}") {{provider[labelTitle || 'name']}}
			span(v-if="(index+1) != types.length") &nbsp; |&nbsp;
		span._btn_group(v-if="dataTypes.length > maxLength")
			button.iconfont.ucmp-icon-turn-small-left(@click="toLeft()", :disabled="l_offset == 0")
			button.iconfont.ucmp-icon-turn-small-right(@click="toRight()", :disabled="r_offset == 0")
</template>

<script>
export default {
    props: ['labelTitle', 'active', 'dataTypes'],
    data () {
        return {
            activeId: this.dataTypes[0].id,
            maxLength: 4,
            l_offset: 0,
            r_offset: 0,
            type: null
        }
    },
    created () {
        this.active && (this.activeId = this.active)
        if (this.dataTypes.length > this.maxLength) {
            this.r_offset = this.dataTypes.length - this.maxLength
            this.types = JSON.parse(JSON.stringify(this.dataTypes)).slice(
                0,
                this.maxLength
            )
        } else this.types = JSON.parse(JSON.stringify(this.dataTypes))
    },
    methods: {
        select (type) {
            this.activeId = type
            this.$emit('select', type)
        },
        toLeft () {
            this.r_offset++
            this.l_offset--
            this.types = JSON.parse(JSON.stringify(this.dataTypes)).slice(
                this.l_offset,
                this.l_offset + this.maxLength
            )
        },
        toRight () {
            this.r_offset--
            this.l_offset++
            this.types = JSON.parse(JSON.stringify(this.dataTypes)).slice(
                this.l_offset,
                this.l_offset + this.maxLength
            )
        }
    }
}
</script>
<style lang="scss" scoped>
.titleBar {
    line-height: 30px;
    float: right;
    margin: 10px 20px 10px 10px;
    font-size: 12px;
    height: 30px;
    .filter_btn {
        cursor: pointer;
    }
}
._btn_group {
    margin-left: 20px;
    text-align: middle;
    .iconfont {
        width: 30px;
        height: 20px;
        line-height: 20px;
        background: #fff;
        border: 1px solid #888;
        color: $fontContentGray;
        cursor: pointer;
        &:disabled {
            color: #ddd;
            border-color: #ddd;
            cursor: not-allowed;
        }
    }
}
</style>
