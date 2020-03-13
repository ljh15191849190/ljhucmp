<template lang="pug">
    div.edit-blue-icon-container
        div.to-check-icon.inline-block(v-for="(icon, index) in defaultIcons" :key="index" @click="checkIcon(icon)")
            i(:class="[icon, checkedIcon === icon ? checkedClass : '']")
</template>

<script>
import DefaultIcons from '@mock/defaultBlueprint.icon'
export default {
    props: ['checkedIcon'],
    data () {
        return {
            defaultIcons: DefaultIcons,
            checkedClass: 'active-icon'
        }
    },

    methods: {
        checkIcon (icon) {
            this.$emit('update:checkedIcon', icon)
        }
    }
}
</script>

<style lang="scss" scoped>
.to-check-icon{
    margin-bottom: 10px;
    margin-right: 5px;
}
</style>
