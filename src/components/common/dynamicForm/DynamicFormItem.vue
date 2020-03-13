<template lang="pug">
  el-form-item.margin-bottom.dynamic-form-item.rw-input(:label="showFormItemLabel" :class="{'is-required': formItem.required || formItem.validation && formItem.validation.required, 'combin-block': widgetType === 'combinedItem'}" :style="[formItem.fe_type && formItem.fe_type.width ? {width: formItem.fe_type.width} : {}]")
    el-input(
      v-if="!widgetType"
      type="text"
      v-model.trim="computedValue"
      v-validate="computedValidation"
      :placeholder="showFormItem ? formItem.description : formItem.label"
      :name="nameAttribute"
      :disabled="disabled || formItem.disabled"
      :data-vv-as="formItem.label"
      :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
      clearable
      @focus="focusWidget"
      @blur="blurWidget"
    )
        template(slot="append" v-if="formItem.append") {{formItem.append}}
    el-input(
      v-else-if="widgetType === 'password'"
      type="password"
      v-model.trim="computedValue"
      auto-complete="new-password"
      v-validate="computedValidation"
      :placeholder="showFormItem ? formItem.description : formItem.label"
      :name="nameAttribute"
      :disabled="disabled || formItem.disabled"
      :data-vv-as="formItem.label"
      :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
      clearable
      show-password
      @focus="focusWidget"
      @blur="blurWidget"
    )
    el-input(
      type="textarea"
      v-else-if="widgetType === 'textarea'"
      v-model.trim="computedValue"
      v-validate="computedValidation"
      :placeholder="showFormItem ? formItem.description : formItem.label"
      :maxlength="formItem.validation.max"
      :name="nameAttribute"
      :disabled="disabled || formItem.disabled"
      :data-vv-as="formItem.label"
      :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
      clearable
      @focus="focusWidget"
      @blur="blurWidget"
    )
    el-cascader(
        v-else-if="widgetType === 'cascader'"
        v-model="computedValue"
        :options="list"
        :disabled="disabled || formItem.disabled"
        filterable
        clearable
        change-on-select
        :props="{value: formItem.data_link && formItem.data_link.value_field ? formItem.data_link.value_field : item.id, label: formItem.data_link && formItem.data_link.text_field ? formItem.data_link.text_field : item.name, children: formItem.data_link && formItem.data_link.children ? formItem.data_link.children : 'children'}"
        v-validate="computedValidation"
        :name="nameAttribute"
        :data-vv-as="formItem.label"
        :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
        :placeholder="showFormItem ? formItem.placeholder || formItem.description || '请选择' : formItem.label"
        @focus="focusWidget"
        @blur="blurWidget"
    )
    el-select(
      filterable
      clearable
      :placeholder="showFormItem ? formItem.placeholder || formItem.description || '请选择' : formItem.description|| formItem.label"
      :remote="formItem.data_link && formItem.data_link.remote_key !== undefined"
      :remote-method="updateDataSource"
      v-else-if="widgetType === 'selectValues'"
      :value-key="formItem.data_link && formItem.data_link.value_key ? formItem.data_link.value_key : 'id'"
      v-model="originValue"
      v-validate="computedValidation"
      :name="formItem[this.uniqueKey]"
      :disabled="disabled || formItem.disabled"
      :data-vv-as="formItem.label"
      :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
      @focus="focusWidget"
      @blur="blurWidget"
    )
        el-option(
            v-for="(item, index) in list"
            :key="index"
            :label="formatterListDisplay(item)"
            :value="item"
            :disabled="ifDisableOption(item, index)"
        )
    el-select(
      filterable
      clearable
      :placeholder="showFormItem ? formItem.placeholder || formItem.description || '请选择' : formItem.label"
      :popper-append-to-body="!formItem.popper_not_to_body"
      :remote="formItem.data_link && formItem.data_link.remote_key !== undefined"
      :remote-method="updateDataSource"
      v-else-if="widgetType === 'selectObj'"
      :value-key="formItem.data_link && (formItem.data_link.value_key || formItem.data_link.value_field) ? formItem.data_link.value_key || formItem.data_link.value_field : 'id'"
      v-model="originValue"
      v-validate="computedValidation"
      :name="nameAttribute"
      :disabled="disabled || formItem.disabled || loading"
      :data-vv-as="formItem.label"
      :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
      :loading="loading"
      v-loading="loading"
      @focus="focusWidget"
      @blur="blurWidget"
    )
        el-option(
            v-for="(item, index) in list"
            :key="index"
            :label="formatterListDisplay(item)"
            :value="item"
            :disabled="ifDisableOption(item, index)"
        )
    el-select(
      filterable
      clearable
      :popper-append-to-body="!formItem.popper_not_to_body"
      :placeholder="showFormItem ? formItem.placeholder || formItem.description || '请选择' : formItem.label"
      :remote="formItem.data_link && formItem.data_link.remote_key !== undefined"
      :remote-method="updateDataSource"
      v-else-if="widgetType === 'select'"
      :multiple="formItem.multiple"
      v-model="computedValue"
      v-validate="computedValidation"
      :name="nameAttribute"
      :disabled="disabled || formItem.disabled || loading"
      :data-vv-as="formItem.label"
      :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
      :loading="loading"
      v-loading="loading"
      @focus="focusWidget"
      @blur="blurWidget"
    )
        el-option(
            v-for="(item, index) in list"
            :key="index"
            :label="formatterListDisplay(item)"
            :value="formItem.data_link && formItem.data_link.value_field ? item[formItem.data_link.value_field] : item.id"
            :disabled="ifDisableOption(item, index)"
        )
            span(style="float: left") {{formatterListDisplay(item)}}
            span(v-if="item.desc" style="float: right")
                el-tooltip(effect="light" :content="item.desc" placement="right")
                    span.ucmp-icon-question.theme-color.icon-tip
    el-radio-group(
      v-else-if="widgetType === 'radio'"
      v-model="computedValue"
      v-validate="computedValidation"
      :disabled="disabled || formItem.disabled || loading"
      :name="nameAttribute"
      :data-vv-as="formItem.label"
      v-loading="loading"
      :class="{'has-icon': formItem.tip}"
      @change="focusWidget"
    )
      el-radio(
          v-for="(item, index) in list"
          :key="index"
          :label="formItem.data_link && formItem.data_link.value_field ? item[formItem.data_link.value_field] : item.id"
      ) {{ formatterListDisplay(item) }}
    el-checkbox-group(
      v-else-if="widgetType === 'checkbox'"
      v-model="computedValue"
      v-validate="computedValidation"
      :disabled="disabled || formItem.disabled || loading"
      :name="nameAttribute"
      :data-vv-as="formItem.label"
      v-loading="loading"
      :class="{'has-icon': formItem.tip}"
      @change="focusWidget"
    )
      el-checkbox(
          v-for="(item, index) in list"
          :key="index"
          :label="formItem.data_link && formItem.data_link.value_field ? item[formItem.data_link.value_field] : item.id"
          :disabled="ifDisableOption(item, index)"
      ) {{ formatterListDisplay(item) }}
    el-input-number(
      v-else-if="widgetType === 'number'"
      :disabled="disabled || formItem.disabled"
      v-model="computedValue"
      :step="formItem.validation && formItem.validation.step ? formItem.validation.step : 1"
      :min="computedValidation.min_value"
      :max="computedValidation.max_value"
      :precision="computedValidation.precision || 0"
      v-validate="computedValidation"
      :name="nameAttribute"
      :data-vv-as="formItem.label"
      :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
      clearable
      @focus="focusWidget"
      @blur="blurWidget"
    )
    div.slider-container(v-else-if="widgetType === 'slider'")
        el-slider(
            :disabled="disabled || formItem.disabled"
            v-model="computedValue"
            :step="formItem.validation && formItem.validation.step ? formItem.validation.step : 1"
            :min="computedValidation.min_value"
            :max="computedValidation.max_value"
            v-validate="computedValidation"
            :name="nameAttribute"
            :data-vv-as="formItem.label"
            :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
            @focus="focusWidget"
        )
    el-switch(
        v-else-if="widgetType === 'switch'"
        :disabled="disabled || formItem.disabled"
        :active-value="switchActiveValue"
        :inactive-value="switchInactiveValue"
        :active-text="switchActiveText"
        :inactive-text="switchInactiveText"
        v-model="computedValue"
        v-validate="computedValidation"
        :name="nameAttribute"
        :data-vv-as="formItem.label"
        :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
        @change="focusWidget"
    )
    el-date-picker(
        v-else-if="widgetType === 'date'"
        :disabled="disabled || formItem.disabled"
        v-model="computedValue"
        v-validate="computedValidation"
        type="date"
        :name="nameAttribute"
        :data-vv-as="formItem.label"
        :placeholder="showFormItem ? '选择日期' : formItem.label"
        :value-format="formItem.value_format || 'timestamp'"
        :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
        clearable
        @focus="focusWidget"
        @blur="blurWidget"
    )
    el-date-picker(
        v-else-if="widgetType === 'datetime'"
        :disabled="disabled || formItem.disabled"
        v-model="computedValue"
        v-validate="computedValidation"
        type="datetime"
        :name="nameAttribute"
        :data-vv-as="formItem.label"
        :placeholder="showFormItem ? '选择日期时间' : formItem.label"
        :value-format="formItem.value_format || 'timestamp'"
        :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
        clearable
        @focus="focusWidget"
        @blur="blurWidget"
    )
    el-date-picker.daterange-picker(
        v-else-if="widgetType === 'daterange'"
        v-model="computedValue"
        v-validate="computedValidation"
        :disabled="disabled || formItem.disabled"
        type="daterange"
        :name="nameAttribute"
        :data-vv-as="formItem.label"
        placeholder="选择日期范围"
        value-format="timestamp"
        :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
        clearable
        @focus="focusWidget"
        @blur="blurWidget"
    )

    DynamicTable(
        v-else-if="widgetType === 'table'"
        :formItem="formItem"
        :externalFormData="externalFormData"
        v-model="computedValue"
        :display.sync="display[itemKey]"
        :serviceCode="formItem.key"
        :parentFormData="formData"
        :uniqueKey="uniqueKey")

    DynamicItemLazyWrap(
        v-else-if="lazyType"
        :type="widgetType"
        :formItem="formItem"
        :externalFormData="externalFormData"
        :display.sync="display[itemKey]"
        v-model="computedValue"
        v-validate="computedValidation"
        :name="nameAttribute"
        :data-vv-as="formItem.label"
        :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
    )
    ScriptGroup(
        v-else-if="widgetType === 'script'"
        :value.sync="computedValue"
        :formItem="formItem"
        :display.sync="display[itemKey]"
        :isApplyHandle="isApplyHandle"
        :formId="formItem[uniqueKey]"
        @focusWidget="focusWidget"
        @blurWidget="blurWidget"
    )
    el-cascader(
        v-else-if="widgetType === 'image'"
        :options="list"
        v-model="computedValue"
        :props="cascaderProps"
        v-validate="computedValidation"
        :name="nameAttribute"
        :data-vv-as="formItem.label"
        :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
        filterable
        clearable
        show-all-levels
        :disabled="disabled || loading || formItem.disabled"
        v-loading="loading"
        @focus="focusWidget"
        @blur="blurWidget")
    CombinedFormItem(
      v-else-if="widgetType === 'combinedItem'"
      :value.sync="computedValue"
      :display.sync="itemDisplay"
      :formItem="formItem"
      :disabled="disabled || loading || formItem.disabled"
      :validation="formItem.validation"
      :childrenKey="formItem.children_key"
      :showFormItem="showFormItem"
      :isScriptItem="isScriptItem"
      :isApplyHandle="isApplyHandle"
      :formId="formItem[uniqueKey]"
      :isFilterItem="isFilterItem"
      :defaultValueKey="defaultValueKey"
      @focusWidget="focusWidget"
      @blurWidget="blurWidget"
      )
    MultipleFormItems(
      v-else-if="widgetType === 'multiItems'"
      :value.sync="computedValue"
      :display.sync="itemDisplay"
      :itemsObject="formItem"
      :formData="formData"
      :uniqueKey="uniqueKey"
      :formId="formItem[uniqueKey]"
      :combinedIndex="combinedIndex"
      :externalFormData="externalFormData"
      :displayLinkedItemKeys="displayLinkedItemKeys"
      @focusWidget="focusWidget"
      @blurWidget="blurWidget"
    )
    TextFormItem(
        v-else-if="widgetType === 'text'"
        :formData="formData"
        :value.sync="computedValue"
        :display.sync="itemDisplay"
        :uniqueKey="uniqueKey"
        :formItem="formItem"
        :formId="formItem[uniqueKey]"
        @focusWidget="focusWidget"
        @blurWidget="blurWidget"
    )
    NetworkFormItem(
      v-else-if="widgetType === 'networkItem'"
      :list="list"
      :value.sync="computedValue"
      :display.sync="itemDisplay"
      :disabled="disabled || loading || formItem.disabled"
      :formItem="formItem"
      :validation="formItem.validation"
      :formId="formItem[uniqueKey]"
      @focusWidget="focusWidget"
      @blurWidget="blurWidget"
      :formData="{...externalFormData,...formData}"
    )
    TagFormItem(
      v-else-if="widgetType === 'tag'"
      :value.sync="computedValue"
      :display.sync="itemDisplay"
      :tagFormItem="formItem"
    )
    TreeFolderItem(
      v-else-if="widgetType === 'folderTree'"
      :value.sync="computedValue"
      :uniqueKey="uniqueKey"
      :display.sync="itemDisplay"
      :formItem="formItem"
      :list="list"
      :disabled="disabled || formItem.disabled"
    )
    CustomValueFormItem(
        v-else-if="widgetType === 'customValue'"
        :value.sync="computedValue"
        :formItem="formItem"
        :showFormItem="showFormItem"
        :computedValidation="computedValidation"
        :uniqueKey="uniqueKey"
        :disabled="disabled"
        :nameAttribute="nameAttribute"
        :list="list"
        :formatterListDisplay="formatterListDisplay"
        :ifDisableOption="ifDisableOption"
    )
    TagTable(
      v-else-if="widgetType === 'tagTable'"
      :value.sync="computedValue"
      :display.sync="itemDisplay"
      :formItem="formItem"
    )
    //- 删掉:readonly="formItem.modified" 影响创建服务实例的表单编辑
    el-input(
      v-else
      type="text"
      :placeholder="showFormItem ? formItem.description : formItem.label"
      :maxlength="computedValidation.max"
      v-model.trim="computedValue"
      v-validate="computedValidation"
      :name="nameAttribute"
      :disabled="disabled || formItem.disabled"
      :data-vv-as="formItem.label"
      :class="{'is-danger': errors.has(nameAttribute), 'has-icon': formItem.tip}"
      clearable
      @focus="focusWidget"
      @blur="blurWidget"
    )
        template(slot="append" v-if="formItem.append") {{formItem.append}}
    span.item-unit.margin-left(v-if="formItem.unit") {{formItem.unit}}
    el-tooltip.pos-right(v-if="formItem.tip" :content="formItem.tip" placement="right")
      i.ucmp-icon-question.theme-color.icon-tip
    div.danger-text-container(v-if="!formItem.display_same_row && errors.has(nameAttribute)")
      span.is-danger {{ errors.first(nameAttribute) }}
    slot(name="formSlot")
</template>
<script>
/**
 * @description 【动态表单项原子组件】根据给定的元数据生成对应表单项以及提示信息，自动校验用户输入信息
 *   目前动态表单子组件支持input(text、textarea)、select(single、multiple)、radio、checkbox、
 *   input-number、switch、date等，后续可扩展
 * @author xinghua.wen
 */
import Api from '@api'
import CombinedFormItem from './CombinedFormItem'
import DynamicTable from './comflex/DynamicTable'
import TagTable from './comflex/TagTable'
import MultipleFormItems from './MultipleFormItems'
import NetworkFormItem from './NetworkFormItem'
import TagFormItem from './TagFormItem'
import TreeFolderItem from './TreeFolderItem'
import ScriptGroup from './DynamicScript'
import TextFormItem from './TextFormItem'
import MetadataUtils from '@server/metadata.utils'
import DateUtil from '@server/date-utils'
import CustomValueFormItem from './customValue/CustomValueFormItem'
import DynamicItemLazyWrap from './DynamicItemLazyWrap'
import axios from 'axios'

export default {
    /**
     * @description 父组件传递的配置参数
     * @prop {string} value 表单域中某一行的默认值,创建时此值为空,修改时有该值
     * @prop {Object} formData 表单的数据集合
     * @prop {string} display 表单域中某一行的展示
     * @prop {Object} formItem 表单域中某一行全部数据
     */
    // props: ['value', 'formData', 'display', 'formItem', ],
    props: {
        value: {
            // value值直接使用传入值，赋值null的话会对部分组件有干扰
            // UCMP3-441， UCMP3-468
            type: [String, Number, Array, Object]
        },

        formData: {
            type: Object,
            default: function () {
                return {}
            }
        },

        externalFormData: {
           type: Object,
            default: function () {
                return {}
            }
        },

        display: {
            type: Object,
            default: function () {
                return {}
            }
        },

        showFormItem: {
            type: Boolean,
            default: function () {
                return true
            }
        },

        formItem: {
            type: Object,
            default: function () {
                return {}
            }
        },

        uniqueKey: {
            type: String,
            default: function () {
                return 'key'
            }
        },

        defaultValueKey: {
            type: String,
            default: function () {
                return 'default_value'
            }
        },

        cascaderProps: {
            type: Object,
            default () {
                return {
                    value: 'id',
                    label: 'name'
                }
            }
        },

        isScriptItem: {
            type: Boolean,
            default: false
        },

        ifTrim: { // UCMP-982 input是否截取前后的空格
           type: Boolean,
           default: false
        },

        isApplyHandle: { // 是否为申请资源流程
            type: Boolean,
            default: () => false
        },

        // UCMP3-700【标签】云硬盘申请界面，有值的标签字段也有校验提示
        // 用于拿到CombinedFormItem传下来的index，加到name中来区分验证信息
        combinedIndex: {
            type: [String, Number],
            default: ''
        },

        // 所属资源ID
        // 该参数主要是对多个同类型（比如：标签···）根据其所归属的资源进行区分，从而处理校验时的联动问题等
        formId: {
            type: String,
            default: ''
        },

        showItemLabel: {
            type: Boolean,
            default: true
        },

        isFilterItem: {
            type: Boolean,
            default: false
        },

        disabled: {
            type: Boolean,
            default: false
        },
        displayLinkedItemKeys: {
            type: Array,
            default: () => []
        },
        // UCMP3-6074 是否禁用表单校验， 默认启用
        disableValidate: {
            type: Boolean,
            default: false
        }
    },

    inject: ['$validator'],

    data () {
        return {
          list: [],
          dataSourceList: [], // 需要过滤的初始化数据源
          basicTypes: ['input', 'string', 'password', 'number', 'slider', 'float', 'switch', 'date', 'datetime', 'textarea'],
          selectTypes: ['select', 'checkbox', 'radio', 'cascader', 'selectObj', 'selectValues', 'folderTree'],
          popper_not_to_body: false,
          originList: [],
          originValue: null, // selectObj、selectValues类型的原始选中值，包含选中项的所有信息
          loading: true,
          params: {}, // dependencies的值改变后，为了不直接修改data_link.params造成vuex报警而修改到当前对象,
          copyValue: null,
          request: {}
        }
    },

    methods: {
        /**
         * @description 下拉框禁用条件
         */
        ifDisableOption (item, index) {
            if (this.formItem.duplicated)
                return false
            if (this.formItem.disabledRows) {
                let option = this.formItem.data_link && this.formItem.data_link.value_field ? item[this.formItem.data_link.value_field] : item.id
                // 单选，当前值与option的值不同，且option的值在被禁用列表中，则禁用当前的option
                if (!this.formItem.multiple && this.computedValue !== option && this.formItem.disabledRows.indexOf(option) !== -1)
                    return true
                // 多选，与上类似
                if (this.formItem.multiple && this.computedValue.indexOf(option) === -1 && this.formItem.disabledRows.indexOf(option) !== -1)
                    return true
            }
            if (item.disabled) return true
            // UCMP3-2479 当前可选项存在 【与其他选项互相影响被禁用】 的选项
            if (item.disabled_by_option) {
                // 是否取值 object
                let ifObjValue = this.widgetType.type === 'selectObj' || this.widgetType.type === 'selectValues'
                // 唯一的key
                let unique_key = this.formItem.data_link && this.formItem.data_link.value_field ? this.formItem.data_link.value_field : 'id'
                // 根据当前取值 与 当前可选项的被禁值进行比较，确定是否应该被禁用
                return item.disabled_by_option === (ifObjValue ? this.value[unique_key] : this.value)
            }
            return false
        },

        indexOf (key) {
            if (!Array.isArray(this.list))
                return -1
            let keys = this.list.map(
                item => {
                    // 如果向后端拉取数据作为数据源
                    if (this.formItem.data_link)
                        return item[this.formItem.data_link.value_field]
                    if (this.formItem.defaultOptions || this.formItem.default_options || this.formItem.enum) // 如果使用默认数据源
                        return item.id
                }
            )
            let index = keys.indexOf(key)
            return index
        },
        /**
         * @description 更新数据源列表
         */
        updateDataSource (val) {
            // UCMP3-3864[性能优化]云硬盘列表页面加载
            // 问题原因: this.widgetType没有定义时，则是输入框，无论是否有data_link.endpoint都不要加载数据
            if (val === '' || val === null || !this.widgetType || this.lazyType || !this.formItem.data_link || !this.formItem.data_link.endpoint || this.formItem.key === 'init_script')
                return
            this.loading = true            
            let params = {}
            if (val && this.formItem.data_link.remote_key)
                params[this.formItem.data_link.remote_key] = val

            params = this.formItem.data_link && this.formItem.data_link.params
                ? { ...params, ...this.formItem.data_link.params, ...this.dependenciesValue, ...this.params, ...this.externalFormData }
                : { ...params, ...this.dependenciesValue, ...this.params, ...this.externalFormData }

            // UCMP3-3091 参数过滤掉包含'@'或者取值为 object 类型的条目，否则影响正常取值
            let finalParams = JSON.parse(JSON.stringify(params))
            Object.keys(finalParams).forEach(
                key => {
                    if (key.match(/@/g) || typeof finalParams[key] === 'object')
                        delete finalParams[key]
                }
            )
            let self = this

            // 修复同一个请求同时发送多次的问题，以最后一次发送的请求为准
            if (this.request && this.request.promise) {
                // 取消已有的promise请求
                this.request.cancelToken.cancel()
                this.request = {}
            } else {
                this.request = {}
                this.request.promise = null
                this.$set(this.request, 'cancelToken', null)
            }

            const CancelToken = axios.CancelToken
            this.request.cancelToken = CancelToken.source()
            this.request.promise = Api.get(self.formItem.data_link.endpoint, {...finalParams, ...{cancelToken: this.request.cancelToken.token}}, true).catch(thrown => {
                if (axios.isCancel(thrown))
                    console.log(thrown.message)
            }).then(
                res => {
                    this.request = {}
                    this.request.promise = null
                    this.$set(this.request, 'cancelToken', null)
                    this.loading = false
                    // 被取消的xhr仍旧会进入正确回调，但是res为undefined，需要进行过滤
                    if (!res)
                     return
                    if (self.widgetType === 'image') {
                      self.originList = JSON.parse(JSON.stringify(res))
                      self.list = MetadataUtils.transformImagesToTree(res)
                      // 修复申请编排实例，云主机操作系统不可选的问题
                      return
                    } else if (self.widgetType === 'string') {
                        // UCMP3-4998 有依赖并且需要直接赋值的资源，应返回一个obj或者基本类型，result为key值
                        self.computedValue = this.formItem.data_link.result ? res[this.formItem.data_link.result] : res
                        return
                    } else {
                        // self.list = (!self.formItem.data_link.result ? res : res[self.formItem.data_link.result]) || []
                        let tableList = res
                        let listRootArray = self.formItem.data_link.result ? self.formItem.data_link.result.split('.') : ''
                        if (listRootArray) {
                            listRootArray.forEach((item, index) => {
                                tableList = tableList[item] || []
                            })
                        }
                        self.list = tableList || []
                    }

                    // 如果需要对结果进行筛选，初始化数据源列表数据
                    if (self.formItem.data_source_filter) {
                        // UCMP-1674 显性变化数组长度，方便观察dataSourceList的长度，自动根据依赖项得到筛选后的数据源
                        self.dataSourceList.splice(0, self.dataSourceList.length)
                        this.$nextTick(
                            () => {
                                self.dataSourceList = JSON.parse(JSON.stringify(self.list))
                            }
                        )
                    }
                    let isNotComputedValueTypes = ['networkItem', 'selectValues', 'selectObj', 'folderTree']
                    // 列表数据变更后，校验v-model的value是否需要变化
                    if (self.formItem.data_link && self.formItem.multiple && self.computedValue && self.computedValue.length) {
                        // UCMP3-943【泰康青云关系型数据库】申请青云关系型数据库的时候，审批流程中修改配置组，修改完了以后，原来的配置组信息还存在。
                        //问题原因：splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目，该方法会改变原始数组，下标问题
                        //解决方法：采用数组for循环逆向遍历
                        let computedValue = JSON.parse(JSON.stringify(self.computedValue))
                        for (let i = computedValue.length - 1; i > -1; i--) {
                            let index = self.indexOf(computedValue[i])
                            if (index === -1)
                                computedValue.splice(i, 1)
                        }
                        self.computedValue = computedValue
                    //UCMP3-2787【配置模板】青云云主机、青云缓存、青云关系型数据库、青云LB配置模板在编辑修改时，网络和安全组下拉框没有值
                    //问题原因: 选择对象的类型selectValues、selectObj等 model绑定的是originValue, 此处给computedValue置空后, 会改变value的值，导致错误
                    //解决方法：只有绑定值为computedValue的表单类型才置空
                    } else if (!self.formItem.multiple && self.indexOf(self.computedValue) === -1 && !isNotComputedValueTypes.includes(self.widgetType))
                        self.computedValue = null

                    // UCMP3-3351【申请单管理】申请青云的云主机，申请单详情里，安全组显示--
                    if (self.list.length) {
                        if (['selectValues', 'selectObj'].includes(this.widgetType) && !this.value && this.copyValue) 
                            this.$emit('update:value', this.copyValue)
                        self.setOriginValue()
                        self.updateDisplay(self.value)
                    }
                // eslint-disable-next-line
                }, err => {
                    this.request = {}
                    this.request.promise = null
                    this.$set(this.request, 'cancelToken', null)
                    self.loading = false
                }
            )
        },
        /**
         * @description selectObj、selectValues等原数对象处理
         */
        setOriginValue () {
            if (this.widgetType === 'selectValues') {
                if (this.value && this.value[this.formItem.data_link.value_key]) {
                    let originValue = this.list.find(item => item[this.formItem.data_link.value_key] === this.value[this.formItem.data_link.value_key])
                    this.originValue = originValue
                }
            }

            if (this.widgetType === 'selectObj') {
                if (this.value && this.value[this.formItem.data_link.value_field]) {
                    let originValue = this.list.find(item => item[this.formItem.data_link.value_field] === this.value[this.formItem.data_link.value_field])
                    this.originValue = originValue
                }
            }
        },
        setValue (srcObj) {
            if (srcObj && this.widgetType === 'selectObj' && this.formItem.children_key) {
                let attributes = this.formItem[this.formItem.children_key]
                if (attributes && attributes.length) {
                    let targetObj = {}
                    attributes.forEach(
                        attr => {
                            targetObj[attr.key] = srcObj[attr.key]
                        }
                    )
                    return targetObj
                }
            }

            //选择对象里面指定的值
            if (srcObj && this.widgetType === 'selectValues') {
                let targetObjs = {}
                let targetKeys = this.formItem.data_link.value_field
                targetKeys.forEach(key => {
                    targetObjs[key] = srcObj[key]
                })

                return targetObjs
            }

            return srcObj
        },

        // 更新select下拉选项
        updateList (list = []) {
          this.list = list
          this.enum = list
          this.defaultOptions = list
        },

        /**
         * @description 筛选数据源，根据data_source_filter对数据源进行过滤
         */
        filterDataSourceList () {
            if (!this.formItem.data_source_filter || !this.formItem.data_source_filter.filter_value_formatter || !this.dataSourceList.length)
                return
            let filter_key = this.formItem.data_source_filter.filter_key ? this.formItem.data_source_filter.filter_key : 'filter'
            let regData = { ...this.formData, ...this.externalFormData }
            let filter_value = MetadataUtils.getDependenciesByFormatter(this.formItem.data_source_filter.filter_value_formatter, regData)
            let list = []
            list = this.dataSourceList.filter(
                item => {
                    // 一个条目可能与多个条件映射，多个条件使用 | 分割(无空格)
                    let ruleredValues = item[filter_key].split('|')
                    if (ruleredValues.indexOf(filter_value) !== -1)
                        return item
                }
            )
            this.list.splice(0, this.list.length)
            this.list = JSON.parse(JSON.stringify(list))

            let valueFeild = this.formItem.data_link && this.formItem.data_link.endpoint && this.formItem.data_link.endpoint.value_field ? this.formItem.data_link.endpoint.value_field : 'id'
            // 筛选后的数据源得到实际的值列表
            let valueKeys = this.list.map(
                item => {
                    return item[valueFeild]
                }
            )
            // 处理已有表单值与数据源列表一致性的问题
            if (this.formItem.multiple) {
                if (!Array.isArray(this.computedValue)) {
                    this.computedValue = [] // 如果是多选，且取值类型不是数组，将当前值置为空数组
                    return
                }
                // 已有值与筛选后的可选值一一比对，留下匹配OK的值
                let filterValues = this.computedValue.map(
                    value => {
                        if (valueKeys.indexOf(value) !== -1)
                            return value
                    }
                )
                this.computedValue = JSON.parse(JSON.stringify(filterValues))
            } else {
                if (valueKeys.indexOf(this.computedValue) === -1) {
                    if (this.list.length)
                        this.computedValue = this.list[0][valueFeild] // 默认给数据源列表的第一个值
                    else this.computedValue = undefined
                }
            }
        },

        /**
         * @description 下拉框显示内容格式化
         */
        formatterListDisplay (item) {
            let nameKey = this.formItem.data_link && this.formItem.data_link.text_field ? this.formItem.data_link.text_field : 'name'
            let rst = item[nameKey]

            // UCMP3-773 支持副标题显示
            let subKey = this.formItem.sub_text_field
            if (subKey)
                rst = rst + '(' + item[subKey] + ')'

            return rst
        },
        focusWidget () {
            this.$emit('focusWidget', this.formId || this.formItem[this.uniqueKey])
        },
        blurWidget () {
            this.$emit('blurWidget', this.formId || this.formItem[this.uniqueKey])
        },

        // 父组件调用该方法手动触发相关组件的校验
        updateCombinedValidation () {
            // pristine 原始值
            if (this.vfields && this.vfields[this.nameAttribute] && this.vfields[this.nameAttribute].dirty)
                this.$validator.validate(this.nameAttribute)
        },

        /**
         * @description UCMP3-3233 更新switch的显示值
         * 
         */
        updateSwitchDisplay () {
            this.itemDisplay = this.computedValue === this.switchActiveValue ? this.switchActiveText : this.switchInactiveText
        },
        updateDateDislpay () {
            if (!this.computedValue) {
                this.itemDisplay = ''
                return
            }
            this.itemDisplay = DateUtil.formate(new Date(this.computedValue))
        },
        /**
         * @description 更新对象类型的值(selectValues|selectObj)
         */
        updateObjValue (newVal) {
            //UCMP3-3321【配置模板】在申请单管理里面先点击青云云厂商，在点配置模板，发现网络信息没有填写进来
            if (this.widgetType === 'selectValues' || this.widgetType === 'selectObj') {
                if (newVal && (!this.list || this.list.length === 0))
                    this.copyValue = newVal
                    
                this.setOriginValue()
                if (!newVal) this.originValue = null
                    
                // UCMP3-1367 取值为Object类型的数据，校验赋值是否有缺失的key
                if (this.originValue && this.widgetType === 'selectObj') {
                    // 修复zone取值只能选中第一项的问题
                    let uniqueKey = this.formItem.data_link.value_key || this.formItem.data_link.value_field ? this.formItem.data_link.value_key || this.formItem.data_link.value_field : 'id'
                    let checkedItem = this.list.filter(item => { return item[uniqueKey] === this.originValue[uniqueKey] })[0]
                    // 赋值有缺失的key，则使用正确的对象重新赋值
                    if (checkedItem && JSON.stringify(checkedItem) !== JSON.stringify(this.originValue))
                        this.originValue = checkedItem
                }
            }
        },
        updateDisplay (newVal) {
            if (this.widgetType && this.basicTypes.indexOf(this.widgetType) !== -1) {
                  // 输入框类型的控件 input|number|float|switch
                // computedValue 为null 或undefined时赋值为 ''
                this.itemDisplay = this.computedValue ? (this.computedValue + (this.formItem.unit ? this.formItem.unit : '')) : ''
                // UCMP3-2893【审请单管理】青云负载均衡器，申请单详情中现在存在问题
                // 问题原因：没有对switch类型的表单display处理
                if (this.widgetType === 'switch')
                    this.updateSwitchDisplay()
                let dateTypes = ['date', 'datetime']
                if (dateTypes.includes(this.widgetType))
                    this.updateDateDislpay()
            } else if (this.widgetType && this.basicTypes.indexOf(this.widgetType) === -1 && this.selectTypes.indexOf(this.widgetType) !== -1) {
                // 网络类型|标签等display通过子组件设置
                if (this.widgetType === 'networkItem' || this.widgetType === 'tag' || this.widgetType === 'folderTree') return
                // 选择框类型的控件，select|checkbox|radio
                let tempArr = this.formItem.multiple ? this.computedValue : [this.computedValue]
                let display = []
                if (this.widgetType === 'selectObj' || this.widgetType === 'selectValues') {
                    if (this.originValue) {
                        tempArr = this.formItem.multiple ? this.originValue : [this.originValue]
                        tempArr.forEach(
                            item => {
                                let label_key = this.formItem.data_link && this.formItem.data_link.text_field ? this.formItem.data_link.text_field : 'name'
                                display.push(item[label_key])
                            }
                        )
                    }
                } else {
                    tempArr.forEach(
                        item => {
                            let index = this.indexOf(item)
                            if (index !== -1) {
                                let displayItem = {}
                                // 如果从后端拉取数据
                                if (this.formItem.data_link && this.formItem.data_link.text_field)
                                    displayItem = this.list[index][this.formItem.data_link.text_field]
                                else if (!this.formItem.data_link && (this.formItem.defaultOptions || this.formItem.default_options || this.formItem.enum)) // 如果使用默认数据源
                                    displayItem = this.list[index].name
                                else
                                    displayItem = this.list[index]

                                //UCMP3-3223【申请单管理】青云关系型数据库、青云缓存，申请单详情中，配置组信息显示不正确（见截图说明）
                                //针对有sub_text_field的display需要加上对副标题处理
                                if (this.formItem.sub_text_field) 
                                    displayItem = `${displayItem}(${this.list[index][this.formItem.sub_text_field]})`
                                display.push(displayItem)
                            }
                        }
                    )
                }
                // 处理最终显示内容
                // 显示内容不为空
                if (display.length) {
                    this.itemDisplay = this.formItem.multiple ? display : display[0]
                    return
                }
                this.itemDisplay = null
            } else if (this.widgetType === 'image' && Array.isArray(this.computedValue) && this.computedValue.length === 3) {
              // 特殊处理镜像显示
              let imageIds = this.originList.map(
                image => {
                  // UCMP3-1000 获取操作系统类型的时候添加include_services字段信息
                  return image.id + '$' + (Array.isArray(image.include_services) ? image.include_services.join(',') : '')
                }
              )
              let index = imageIds.indexOf(this.computedValue[2])
              // 修复申请编排实例，云主机操作系统不可选的问题
              if (this.originList[index] && this.originList[index].os) {
                let itemDisplay = this.originList[index].os.os_family + ' /' + this.originList[index].os.os_version + ' /' + this.originList[index].name
                this.itemDisplay = itemDisplay
              }
            } else if (this.widgetType === 'script' && (!this.computedValue || !this.computedValue.length))
                // 组件类型为script ，即脚本时给其赋值默认值为 '[]'
                this.itemDisplay = '[]'

            // UCMP-982 截取字符前后的空格
            /**
             * UCMP3-657【回收站】在查询条件里面，如果前面多输入了个空格，或者后面多* 数个空格，将查不出数据来
             * 问题原因：如果没有传表单项的类型undefined，页面呈现的是input
             * 解决方法：如果有截取字符串前后空格标志，且表单项的类型是undefined，也* 要作截取空格处理
             */

            if (this.ifTrim && (this.widgetType === 'input' || this.widgetType === 'string' || this.widgetType === undefined))
                this.computedValue = this.computedValue.replace(/(^\s*)|(\s*$)/g, '')

            // UCMP-1647 申请云主机，hostname清除后，再次选择自动生成后，仍一直提示不能为空问题修改
            if (this.widgetType !== 'combinedItem' && this.widgetType !== 'script' && this.widgetType !== 'table' && this.widgetType !== 'switch') {
                if (this.vfields && this.vfields[this.nameAttribute] && this.vfields[this.nameAttribute].touched) {
                    this.$nextTick(() => {
                        this.$validator.validate(this.nameAttribute)
                    })
                }
            }

            // 当该组件修改时其他组件也需要联动修改的话通过related_to参数的判断去触发更新其他组件的方法（weblogic脚本中有用到）
            if (this.formItem.related_to)
                this.$emit('changeRelateParams', this.formItem.related_to, this.computedValue)

            // 该组件为combinedFormRow所属时，需要告知父组件发生改变
            /**
             * unique 该参数不能重复
             * relyOn 该参数被其他参数所套用 （weblogic脚本中vserver的序号 | 重复密码是不能和已有密码相同 | ）
             *  */
            if (this.formItem.unique || this.formItem.relyOn)
                this.$emit('updateValue', [this.formItem[this.uniqueKey], this.formItem.relyOn, this.formItem.dependency])
        }
    },

    computed: {
        /**
         * @description 控件显示类型
         */
        widgetType () {
            if (this.formItem.fe_type && this.formItem.fe_type.type)
                return this.formItem.fe_type.type
            return this.formItem.type
        },

        lazyType () {
            return this.widgetType.startsWith('lazy-')
        },

        /**
         * @description switch组件默认开启的值
         */
        switchActiveValue () {
            if (this.widgetType === 'switch' && this.formItem.fe_type && this.formItem.fe_type.active_value !== undefined)
                return this.formItem.fe_type.active_value
            return true
        },

        /**
         * @description 表单项显示label内容
         */
        showFormItemLabel () {
            // eslint-disable-next-line
            if (!this.formItem.hidLabel && this.showFormItem && this.showItemLabel && (this.widgetType !== 'combinedItem' || this.widgetType === 'combinedItem' && this.formItem.fe_type && this.formItem.fe_type.showLabel))
                return this.formItem.label
            return ''
        },

        /**
         * @description switch组件默认关闭的值
         */
        switchInactiveValue () {
            if (this.widgetType === 'switch' && this.formItem.fe_type && this.formItem.fe_type.inactive_value !== undefined)
                return this.formItem.fe_type.inactive_value
            return false
        },

        switchActiveText () {
            if (this.widgetType === 'switch' && this.formItem.fe_type && this.formItem.fe_type.active_text !== undefined)
                return this.formItem.fe_type.active_text

            let active_text = ''
            if (this.list && this.list.length) {
                let activeItem = this.list.filter(
                    item => {
                        return item[this.formItem.data_link && this.formItem.data_link.value_field ? this.formItem.data_link.value_field : 'id'] === this.switchActiveValue
                    }
                )
                active_text = activeItem.length && activeItem[0][this.formItem.data_link && this.formItem.data_link.text_field ? this.formItem.data_link.text_field : 'name'] ? activeItem[0][this.formItem.data_link && this.formItem.data_link.text_field ? this.formItem.data_link.text_field : 'name'] : ''
            }
            return active_text
        },

        switchInactiveText () {
            if (this.widgetType === 'switch' && this.formItem.fe_type && this.formItem.fe_type.inactive_text !== undefined)
                return this.formItem.fe_type.inactive_text

            let inactive_text = ''
            if (this.list && this.list.length) {
                let activeItem = this.list.filter(
                    item => {
                        return item[this.formItem.data_link && this.formItem.data_link.value_field ? this.formItem.data_link.value_field : 'id'] === this.switchInactiveValue
                    }
                )
                inactive_text = activeItem.length && activeItem[0][this.formItem.data_link && this.formItem.data_link.text_field ? this.formItem.data_link.text_field : 'name'] ? activeItem[0][this.formItem.data_link && this.formItem.data_link.text_field ? this.formItem.data_link.text_field : 'name'] : ''
            }
            return inactive_text
        },

        /**
         * @description Vue单向绑定，不能直接修改props
         */
        computedValue: {
            get () {
                return this.value
            },
            set (val) {
                this.$emit('update:value', val)
            }
        },

        stringifyOriginValue () {
            return JSON.stringify(this.originValue)
        },

        /**
         *  枚举校验规则
         *  策略集
         */
        enumValidateRules () {
            return {
                'required': function (validation, formItem, self) {
                    return { code: 'required', rst: !!((formItem.validation && formItem.validation.required) || formItem.required) }
                },
                'max': function (validation, formItem, self) {
                    if (self.widgetType === 'input' || self.widgetType === 'string')
                        return { code: 'max', rst: (formItem.validation.max || 500) - '0' }
                    if (self.widgetType === 'number' || self.widgetType === 'slider')
                        return { code: 'max_value', rst: (formItem.validation.max || 9999999999999) - '0' }
                },
                'min': function (validation, formItem, self) {
                    if (self.widgetType === 'input' || self.widgetType === 'string')
                        return { code: 'min', rst: (formItem.validation.min || 1) - '0' }
                    if (self.widgetType === 'number' || self.widgetType === 'slider')
                        return { code: 'min_value', rst: (formItem.validation.min || -9999999999999) - '0' }
                },
                'reg': function (validation, formItem) {
                    let regStr = formItem.validation.reg.substr(1)
                    let reg = new RegExp(regStr.substr(0, regStr.length - 1))
                    return { code: 'customRegex', rst: [reg, formItem.validation.errMsg || formItem.validation.err_msg] }
                },
                'repeatVals': function (validation, formItem) {
                    return { code: 'customIncludes', rst: [formItem.repeatVals, formItem.relyParams, formItem.validation.other_msg || formItem.validation.errMsg || formItem.validation.err_msg] }
                },
                'sameAs': function (validation, formItem) {
                    return { code: 'is', rst: [formItem.sameAs, formItem.validation.other_msg || ''] }
                },
                'nasMin': function (validation, formItem, self) {
                    return { code: 'nasMin', rst: [formItem.validation.nasMin.size, self.formData, formItem.validation.nasMin.unit] }
                },
                'rdbParameterGroup': function (validation, formItem, self) {
                    return { code: 'rdbParameterGroup', rst: [self.list, formItem.validation.errMsg || formItem.validation.err_msg] }
                },
                'cacheParameterGroup': function (validation, formItem, self) {
                    return { code: 'cacheParameterGroup', rst: [self.list, formItem.validation.errMsg || formItem.validation.err_msg] }
                },
                'validIPRange': function (validation, formItem) {
                    return { code: 'validIPRange',
                        rst: [formItem.validation.validIPRange.startIP, formItem.validation.validIPRange.endIP] }
                },
                'backendRepetition': function (validation, formItem) {
                    return { code: 'backendRepetition', 
                    rst: [formItem.validation.backendRepetition.url ? formItem.validation.backendRepetition.url : '',
                    formItem.validation.backendRepetition.rule ? formItem.validation.backendRepetition.rule : 'valid', formItem.validation.backendRepetition.name ? formItem.validation.backendRepetition.name : 'name'] }
                },
                'backendNormal': function (validation, formItem) {
                    return { code: 'backendNormal', 
                    rst: [formItem.validation.backendNormal.url ? formItem.validation.backendNormal.url : '',
                    formItem.validation.backendNormal.rule ? formItem.validation.backendNormal.rule : 'valid', formItem.validation.backendNormal.name ? formItem.validation.backendNormal.name : 'name'] }
                },
                'keepSamePassword': function (validation, formItem, self) {
                    let confirmValue = formItem.validation.keepSamePassword.confirm_key ? self.formData[formItem.validation.keepSamePassword.confirm_key] : null
                    return { code: 'keepSamePassword', rst: [confirmValue, formItem.validation.keepSamePassword.confirm_name], force: true }
                }
            }
        },

        /**
         *  根据是否required计算校验规则
         */
        computedValidation () {
            var rules = {}
            // UCMP3-6074 如果禁用，不进行数据合法校验
            if (this.disableValidate)
                return rules
            
            let canculateRules = (key) => {
                if (!this.enumValidateRules.hasOwnProperty(key))
                    return { code: key, rst: this.formItem.validation[key] }
                return this.enumValidateRules[key](this.formItem.validation, this.formItem, this)
            }

            let isObject = Object.prototype.toString.call(this.formItem.validation) === 'object'
            let formItemValidation = isObject ? {} : this.formItem.validation
           
            // UCMP3-5717 采用策略模式管理校验规则
            // 不用校验的key的集合
            let inValidKey = ['errMsg', 'err_msg', 'other_msg', 'step']
            Object.keys({...{required: this.formItem.required ? true : false}, ...formItemValidation}).filter(key => !inValidKey.includes(key)).forEach(key => {
                let validation = canculateRules(key)
                if (validation && validation.code && validation.rst)
                    rules[validation.code] = validation.rst
            })

            return rules
        },

        /**
         * @description 动态表单项的key，唯一标志
         */
        itemKey () {
            return this.formItem[this.uniqueKey]
        },

        /**
         * @description 当前表单项的显示值
         */
        itemDisplay: {
            get () {
                return this.display[this.itemKey]
            },
            set (val) {
                // let display = JSON.parse(JSON.stringify(this.display))
                this.$set(this.display, this.itemKey, val)
                // this.$emit('update:display', display)
            }
        },

        /**
         * @description 依赖联动列表
         */
        dependencies () {
            if (!this.formItem.dependencies)
                return []
            return this.formItem.dependencies
        },

        /**
         * @description 依赖联动列表的值
         */
        dependenciesValue () {
            let rst = {}
            let formData = { ...this.formData, ...this.externalFormData }
            this.dependencies.forEach(
                item => {
                    let dependKey = item, _value = formData ? JSON.parse(JSON.stringify(formData)) : {}
                    if (item.indexOf('@') > -1 && !([0, item.length - 1].includes(item.indexOf('@'))))
                        dependKey = item.split('@')[1]
                    // UCMP3-2589 依赖项需要解构对象 'obj.key1.key2',适用于不需要解构的场景
                    item.split('.').forEach((key, index, array) => {
                        // 如果当前key取值OK
                        if (_value[key] || _value[key] === 0) {
                            if (index < array.length - 1) // 没有遍历到最底层
                                _value = _value[key]
                            else
                                rst[dependKey] = Array.isArray(_value[key]) ? _value[key].join(',') : _value[key]
                        }
                    })
                }
            )
            return rst
        },

        dependenciesValueString () {
            return JSON.stringify(this.dependenciesValue)
        },

        // UCMP3-860 处理编排时 脚本/基础配置 组件表单组件校验失败时蓝图中对应资源无提示问题
        // 根据resourceId（所属资源ID）和 combinedIndex 对表单组件的name属性进行重新计算
        nameAttribute () {
            if (this.formId)
                return this.formId + this.formItem[this.uniqueKey] + this.combinedIndex
            return this.formItem[this.uniqueKey]
        }
    },

    watch: {
        /**
         * @description 表单项绑定的值发生变化后，显示内容也跟着变化
         */
        // value (newVal, oldVal) {
        //     this.updateObjValue(newVal)
        //     this.updateDisplay(newVal)
        // },
        // 由于网络组件value为对象 需要深层监听
        value: {
            handler (newValue, oldValue) {
                this.updateObjValue(newValue)
                this.updateDisplay(newValue)
            },
            deep: true
        },

        stringifyOriginValue (newVal, oldVal) {
            if (newVal === oldVal)
                return
            let value = this.setValue(this.originValue)
            this.$emit('update:value', value)
        },

        /**
         * @description 依赖联动列表的值发生变化后，需要重新改变条件查询新的列表数据
         */
        dependenciesValueString: {
            // UCMP-1368【基础配置】青云的基础配置里网络和安全组没有下拉选项
            // computed 属性没有变化导致watch执行不到
            immediate: true,
            handler (newVal, oldVal) {
                // 加 !oldVal 是为了防止在没有其他dependecies的情况下产生多余的--
                if (newVal === oldVal)
                    return
                // 如果需要对已有结果进行筛选，不是通过接口进行筛选
                if (this.formItem.data_source_filter) {
                    this.dataSourceList.length && this.filterDataSourceList()
                    return
                }

                if (this.formItem.data_link && this.formItem.data_link.endpoint) {
                    this.params = JSON.parse(this.dependenciesValueString)
                    return
                }
                // 对于type:input|string同时依赖其他属性，按照其数据格式(formatter)自动封装数据
                // 加 oldVal 是为了防止在没有其他dependecies的情况下产生多余的--
                if (!this.formItem.data_link && this.formItem.formatter && oldVal) {
                    let regData = { ...this.formData, ...this.externalFormData }
                    this.computedValue = MetadataUtils.getDependenciesByFormatter(this.formItem.formatter, regData)
                }
            }
        },

        /**
         * @description UCMP3-2708 监听 externalFormData 变化，适时拉取新的数据
         */
        externalFormData: {
            deep: true,
            // UCMP-1368【基础配置】青云的基础配置里网络和安全组没有下拉选项
            immediate: true,
            handler (newObj, oldObj) {
                if (newObj && (JSON.stringify(newObj) !== JSON.stringify(oldObj)))
                    this.params = {...JSON.parse(this.dependenciesValueString), ...this.externalFormData}
            }
        },

        /**
         * @description data_link发生变化(params)，自动更新列表内容
         */
        params: {
            deep: true,
            // UCMP-1368【基础配置】青云的基础配置里网络和安全组没有下拉选项
            immediate: true,
            handler (newObj, oldObj) {
                if (newObj && (JSON.stringify(newObj) !== JSON.stringify(oldObj)))
                    this.updateDataSource()  
            }
        },

        'formItem.data_link.params': {
            deep: true,
            immediate: true,
            handler (newObj, oldObj) {
                if (newObj && (JSON.stringify(newObj) !== JSON.stringify(oldObj)))
                    this.updateDataSource()  
            }
        },

        /**
         * @description data_link发生变化(endpoint)，自动更新列表内容
         */
        'formItem.data_link.endpoint': {
            deep: true,
            handler (newObj, oldObj) {
                if (newObj === oldObj) return
                if (newObj) {
                    // 更新列表数据
                    this.updateDataSource()
                    // 修复申请编排实例，云主机操作系统不可选的问题
                    if (this.formItem.key !== 'image')
                      this.computedValue = this.formItem.multiple ? [] : null
                    if (this.widgetType === 'number')
                        this.computedValue = 0
                }
            }
        },

        /**
         * @description UCMP-1674 数据源发生变化后，自动根据依赖项的值动态筛选得到实际数据源
         */
        'dataSourceList.length' () {
            if (this.dataSourceList.length)
                this.filterDataSourceList()
        },

        /**
         * @description UCMP3-722 申请或者修改F5实例，负载均衡算法下拉框无法选择“优先级算法”
         */
        'formItem.defaultOptions.length' () {
            if (this.formItem.defaultOptions && Array.isArray(this.formItem.defaultOptions) && this.formItem.defaultOptions.length)
                this.list = this.formItem.defaultOptions
        },

        /**
         * @description UCMP3-3233 初始化组件时，list数据延迟得到，switchActiveText同理，需要延迟更新显示内容
         */
        switchActiveText (val) {
            if (!val) return
            this.updateSwitchDisplay()
        }
    },

    created () {
        // UCMP3-990 不需要向后端请求数据的默认不显示loading信息
        if (!this.formItem.data_link || !this.formItem.data_link.endpoint)
            this.loading = false
        // 不存在依赖，且含有获取数据源的属性，初始化获取数据列表
        if ((!this.formItem.dependencies || !this.formItem.dependencies.length || (this.formItem.dependencies.length && this.formItem.data_source_filter)) && this.formItem.data_link && this.formItem.data_link.endpoint && !this.formItem.data_link.remote_key)
            this.updateDataSource()
        
        this.$nextTick(
            () => {       
                // 自己传入数据后，不用获取数据列表，直接赋值
                if (this.formItem.defaultOptions || this.formItem.default_options || this.formItem.enum) {
                    // 深拷贝数据，取消与元数据的引用关系
                    this.list = JSON.parse(JSON.stringify(this.formItem.defaultOptions || this.formItem.default_options || this.formItem.enum))
                    if (this.formItem.data_source_filter) {
                        this.dataSourceList = JSON.parse(JSON.stringify(this.list))
                        // 初始化时赋默认值，自动筛选数据源
                        this.filterDataSourceList()
                    }
                }

                // 云硬盘容量默认值赋值失败问题处理
                // if (this.widgetType === 'number' && (!this.value && this.value !== 0) && !this.formItem[this.defaultValueKey])
                //     this.computedValue = this.computedValidation.min_value !== undefined ? this.computedValidation.min_value : 0
                // UCMP3-5292【云硬盘】修改青云存量资源云硬盘大小，硬盘大小是10GB，修改为20GB，页面仍校验“容量必须大于或等于20”
                // 云硬盘容量分创建和修改,创建时默认设置最小值;修改则需要实际值和最小值做对比
                if (this.widgetType === 'number' && !this.formItem[this.defaultValueKey]) {
                    if (!this.value && this.value !== 0) 
                        this.computedValue = this.computedValidation.min_value !== undefined ? this.computedValidation.min_value : 0
                    else {
                        let min_value = this.computedValidation.min_value !== undefined ? this.computedValidation.min_value : 0
                        this.computedValue = this.value < min_value ? min_value : this.value
                    }
                }
                // el-cascader级联组件的默认值为 undefined或者null时需要将其重置为 []
                if ((this.widgetType === 'image' || this.widgetType === 'cascader') && !this.value)
                    this.computedValue = []

                // UCMP-686 修复默认值不生效的问题 UCMP-1664 兼容默认值为0的特殊场景
                // UCMP-1664 兼容默认值为0的特殊场景
                if (!this.computedValue && this.computedValue !== 0 && this.formItem[this.defaultValueKey] !== undefined)
                    this.computedValue = this.formItem[this.defaultValueKey]
                else if (this.computedValue || this.computedValue === 0) // UCMP3-4768 初始化值存在，更新display内容
                    this.updateDisplay(this.computedValue)
            }
        )
    },

    components: {
        CombinedFormItem,
        ScriptGroup,
        DynamicTable,
        TagTable,
        MultipleFormItems,
        NetworkFormItem,
        TagFormItem,
        TreeFolderItem,
        TextFormItem,
        CustomValueFormItem,
        DynamicItemLazyWrap
    }
}
</script>
<style lang="scss" scoped>
.icon-tip {
    padding-left: 5px;
}
/** validate的is-danger扭曲了原本的样式 */
.el-input-number.el-input-number--small.is-danger {
    line-height: 30px;
    padding-top: 0;
}
.slider-container {
    width: inherit;
    min-width: 120px;
}
.danger-text-container {
    line-height: 14px;
}
.el-radio {
    line-height: 2;
}
</style>
