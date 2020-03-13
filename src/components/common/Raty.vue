<template lang="pug">
    div.raty(:class="{'raty-small': small}")
        label.title {{title}}
        i.star-icon.ucmp-icon-star-empty(v-for="(item, index) in stars"
        :class="{'ucmp-icon-star-selected': index < userChoose, 'disabled': disabled}"
        @click="selectedStar(index + 1)")

</template>

<script>
    /**
     * @description 星级评价
     * @author jia lu
     */
    export default {
        name: 'Raty',
        props: {
            stars: {
                type: Number,
                default: () => 5
            },
            title: String,
            prop: String,
            value: {
                type: Number,
                default: () => 0
            },
            disabled: {
                type: Boolean,
                default: () => false
            },
            small: {
                type: Boolean,
                default: () => false
            }
        },
        data () {
            return {
                userChoose: this.value
            }
        },
        computed: {},
        methods: {
            selectedStar (stars) {
                if (this.disabled) return
                this.userChoose = stars
                this.$emit('selectedStar', this.prop, stars)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .title {
        line-height: 1;
        font-size: 16px;
        margin-right: 8px;
    }

    .star-icon {
        font-size: 20px;
        margin-left: 8px;
        color: #ffaa00;
        cursor: pointer;
    }

    .disabled {
        cursor: not-allowed;
    }
    .raty-small{
        .title {
            font-size: 14px;
        }
        .star-icon {
            font-size: 14px;
        }
    }
</style>