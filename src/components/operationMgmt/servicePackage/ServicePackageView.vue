<template lang="pug">
    UcmpContainer(:breadcrumbItems="breadcrumbItems")
        div.height-fit-content(slot="content")
          el-form.margin-left(label-position="right")
            el-form-item(v-for="info in infos" :key="info.name" :label="info.name") {{info.label}}
</template>

<script>

export default {
  data () {
    return {
      breadcrumbItems: [{ prop: '', label: '服务套餐' }],
      infos: [
        { name: '套餐名称', label: '1C1GB' },
        { name: '套餐描述', label: '1C1GB' },
        { name: '所属服务', label: '云硬盘' }
      ]
    }
  },
  methods: {
  },
  computed: {
  },
  components: {},
  created () {}
}
</script>

<style lang="scss" scoped>

</style>

