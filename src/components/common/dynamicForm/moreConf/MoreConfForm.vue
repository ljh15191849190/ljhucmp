<template lang="pug">
  div(v-if="formItemList.length" )
    div(v-for="(item, index) in formItemList" :key="index")
      div(v-if="item.params && formData[index] && item.params.length")
          div.config-form-title {{item.script_type || analyzeTitle(item.gitPath) || '软件'}}配置
          DynamicOtherForm(
              v-if="formDataItems[item.script_id]"
              :value.sync="formDataItems[item.script_id]"
              :formDatas="item.params"
              :isApplyHandle="isApplyHandle"
              :hideItem="hideItem"
              :formId="formId"
              :editPrivilege="editPrivilege"
              @focusWidget="focusWidget"
              :scriptId="item.script_id"
              :updateFormData="updateFormData"
              :disableValidate="disableValidate"
          )
      span(v-else) 无更多配置
</template>
<script>
/* eslint-disable */
/**
 * @description
 * 脚本等参数存在时需要将其内部的可编辑参数直接展示出来
 */
import MetadataUtils from "@server/metadata.utils";
import DynamicOtherForm from "../DynamicOtherForm";

export default {
  components: { DynamicOtherForm },
  props: {
    formData: {
      type: Array,
      default: () => []
    },

    display: {
      type: [String, Array],
      default: () => "[]"
    },

    uniqueKey: {
      type: String,
      default: function() {
        return "key";
      }
    },
    isApplyHandle: {
      type: Boolean,
      default: () => false
    },
    // 所属资源ID
    formId: {
      type: String,
      default: ""
    },
    editPrivilege: {
      type: Boolean,
      default: () => true
    },
    disableValidate: Boolean
  },
  data() {
    return {
      defaultValueKey: "default",
      hideItem: true,
      formItemList: []
      // formDataItems: this.formData
    };
  },

  methods: {
    /**
     * 根据脚本路径分析显示名称
     */
    analyzeTitle(path) {
      if (!path) return "";
      if (path.match(/[oO]racle/g)) return "Oracle";
      if (path.match(/[wW]blogic/g)) return "Oracle";
      return "";
    },
    transformDispaly() {
      let displayArr = Array.isArray(this.display)
        ? this.display
        : JSON.parse(this.display);
      displayArr.forEach(item => {
        if (item && item.params) MetadataUtils.updateAttributeType(item.params);
      });
      this.formItemList = displayArr;
    },
    getCurrentScript(id) {
      return JSON.parse(JSON.stringify(this.formItemList)).find(
        item => item.script_id === id
      );
    },
    focusWidget(formId) {
      this.$emit("focusWidget", formId);
    },
    updateFormData(scriptId, changedForm) {
      this.$nextTick(() => {
        // 将页面中绑定的 display值与 formdata值保持同步更新
        this.formItemList.forEach(script_item => {
          if (script_item.script_id === scriptId && script_item.params) {
            script_item.params.forEach((detail, detail_index) => {
              if (
                changedForm.hasOwnProperty(detail[this.uniqueKey]) &&
                detail[this.defaultValueKey] !==
                  changedForm[detail[this.uniqueKey]]
              )
                detail[this.defaultValueKey] =
                  changedForm[detail[this.uniqueKey]];
              if (detail.type === "combinedItem") {
                JSON.parse(changedForm[detail[this.uniqueKey]]).forEach(
                  (item, index) => {
                    let short_obj = {};
                    for (const _key in item) {
                      if (item.hasOwnProperty(_key) && _key !== "serverOrder")
                        short_obj[_key + (index + 1)] =
                          _key === "appserver_name"
                            ? item[_key] + item.serverOrder
                            : item[_key];
                    }
                    changedForm = { ...changedForm, ...short_obj };
                  }
                );
              }
            });
          }
        });

        Object.keys(this.formDataItems).forEach(_id => {
          if (_id === scriptId) {
            Object.keys(changedForm).forEach(_confKey => {
              this.$set(
                this.formDataItems[_id],
                _confKey,
                changedForm[_confKey]
              );
            });
          }
        });

        // 从formData中找出修改的脚本，对进行更新操作
        let copyFormData = JSON.parse(JSON.stringify(this.formData));
        copyFormData.forEach((item, index) => {
          if (item.id === scriptId) item.params = this.formDataItems[scriptId];
        });
        this.$emit("update:formData", copyFormData);

        this.$emit("update:display", JSON.stringify(this.formItemList));
      });
    }
  },

  computed: {
    formDataItems() {
      let vals = {};
      this.formData.forEach(item => {
        vals[item.id] = JSON.parse(JSON.stringify(item.params));
      });
      return vals;
    }
  },

  created() {
    this.transformDispaly();
  }
};
</script>

<style lang="scss" scoped>
.title-cot {
  font-weight: 600;
}
</style>
