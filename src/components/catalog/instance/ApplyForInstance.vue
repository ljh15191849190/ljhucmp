<template lang="pug">
  div.full-container.apply-instance
    div.d-flex.full-with-fixed-container.position-relative
      el-form.instance-form(
        label-width="120px"
        size="small"
        label-position="right"
        :class="{'blueprint-instance-form':checkedMeta.group && checkedMeta.group === 'blueprint'}"
      )
        div.business-form(v-if="!isOnlyShowBasic" v-show="isShow")
          div.child-form-title
            label.title 资源归属
          //- 选择资源
          InstanceOwner.business-form-body(:resourceOwner.sync="resourceOwner" :serviceCode="serviceCode" :resourcesBelongsTo="checkedMeta.resource_owner")
            el-form-item.is-required.rw-input(label="环境" v-if="checkedMeta.group !== 'blueprint' && globalEnv.require" slot="otherOwnerItems")
                el-select(v-model="env" name="env" v-validate="envRules" :class="{'is-danger': errors.has('env')}"
                placeholder="请选择环境" data-vv-as="环境")
                    el-option(v-for="item in globalEnv.env" :key="item" :label="item" :value="item")
                span.validator-error.is-danger(v-if="errors.has('env')") {{ errors.first('env') }}
        //- 非编排类型的普通资源配置表单
        ServiceDynamicForm(
          v-show="isShow"
          :serviceCode="serviceCode"
          :attribute.sync="attribute"
          :metaFormData.sync="metaFormData"
          :relatedServices.sync="relatedServices"
          :childRenServices.sync="childRenServices"
          :resourceOwnerInfo="resourceOwnerInfo"
          :externalFormData="externalFormData"
          :id="resourceId"
          ref="serviceDynamicForm"
        )
        div.business-form.border-light-top(v-if="checkedMeta.group && checkedMeta.group === 'blueprint'" v-show="isShow")
          div.child-form-title
            label.title 资源配置
          //- 选择资源
          BlueprintDiagramAndNodeForms.business-form-body.apply-for-blueprint-instance(
            :class="{'margin-bottom-10':isShow}"
            :blueprintId="serviceCode"
            :externalFormData="externalFormData"
            :defaultBpResources="defaultBpResources"
            ref="blueprintConfigRef")
            InstanceFormDetail.instance-form-detail.bluprint-instance-form-detail(
              slot="moreDetail"
              v-if="checkedMeta.group && checkedMeta.group === 'blueprint'"
              :class="{'blueprint-form-detail': isShow}"
              :metaFormData="blueprintResourceConfigs"
              :attribute="blueprintAllAttributes"
              :extendFormData="extendFormData"
              :isOnlyShowBasic="isOnlyShowBasic")

        div.business-form.border-light-top(v-if="attachmentDisplay")
            div.child-form-title
                label.title 附件配置
            div.business-form-body
                el-form-item
                    el-upload(
                    ref="upload"
                    :key="resourceId"
                    action="/ucmp3/attachment"
                    :headers="attachmentConf.uploadHeaders"
                    :limit="attachmentConf.fileLimit"
                    :on-exceed="attachmentExceed"
                    :on-success="attachmentSuccess"
                    :on-remove="attachmentRemove"
                    :multiple="true"
                    :auto-upload="true"
                    :before-upload="beforeAttachmentUpload"
                    list-type="picture"
                    :data="attachmentConf.uploadData"
                    accept=".png,.jpg,.xls,.xlsx,.doc,.docx,.pdf"
                    )
                        el-button(type="primary") 点击上传
                        div.el-upload__tip(slot="tip") 可上传附件，照片(png, jpg)或文档(excel, doc, pdf)，数量不超过3个，每个文件大小不超过30M

        div.business-form.border-light-top(v-if="isShowMoreSetup && (checkedMeta.instance_apply_count || (checkedMeta.group !== 'blueprint' && currentServiceTenany || checkedMeta.group === 'blueprint') && tenancy.available)" v-show="isShow")
          div.child-form-title
            label.title 更多配置
          div.business-form-body
            el-form-item.is-required.rw-input(label="虚拟机数量" v-if="checkedMeta.instance_apply_count")
              el-input-number.is-required(type=""
                v-model="instance_apply_count"
                :min="1"
                :max="checkedMeta.instance_apply_count"
                v-validate="'required'"
                name="instance_apply_count"
                data-vv-as="虚拟机数量"
                :class="{'is-danger': errors.has('instance_apply_count')}"
              )
              el-tooltip.margin-left(v-if="serviceCode === 'volume'" :content="instance_apply_count_tip" placement="right")
                i.ucmp-icon-question.theme-color.icon-tip
              span.validator-error.is-danger(v-if="errors.has('instance_apply_count')") {{ errors.first('instance_apply_count') }}
            //- UCMP3-4842 默认应用服务(蓝图)资源都是用 租期
            el-form-item.is-required.rw-input(label="租期" v-if="(checkedMeta.group !== 'blueprint' && currentServiceTenany || checkedMeta.group === 'blueprint') && tenancy.available")
              ExpiredAtWidget(:value.sync="expired_at")
        div.business-form(v-show="!isShow")
          div.child-form-title
            label.title 申请单信息
          OrderConfirm.business-form-body(:orderForm.sync="orderForm")
      InstanceFormDetail.instance-form-detail.basic-resource-form-detail(
        v-if="checkedMeta.group && checkedMeta.group !== 'blueprint' && checkedAndRelatedServiceAttributes"
        :metaFormData="metaFormData"
        :attribute="checkedAndRelatedServiceAttributes"
        :extendFormData="extendFormData"
        :isOnlyShowBasic="isOnlyShowBasic")
      el-dialog(:visible.sync="showConfirmDialog" title="确认配置" width="470px")
        el-row
          InstanceFormDetail.confirm-dialog.instance-form-detail.basic-resource-form-detail(
          v-if="checkedMeta.group && checkedMeta.group !== 'blueprint' && checkedAndRelatedServiceAttributes"
          :metaFormData="metaFormData"
          :attribute="checkedAndRelatedServiceAttributes"
          :extendFormData="extendFormData"
          :isOnlyShowBasic="isOnlyShowBasic")
          InstanceFormDetail.confirm-dialog.instance-form-detail(
              v-if="checkedMeta.group && checkedMeta.group === 'blueprint'"
              :class="{'blueprint-form-detail': isShow}"
              :metaFormData="blueprintResourceConfigs"
              :attribute="blueprintAllAttributes"
              :extendFormData="extendFormData"
              :isOnlyShowBasic="isOnlyShowBasic")
        el-row
          el-button(size="small" @click="showConfirmDialog = false") 返回
          el-button(size="small" type="primary" @click="showConfirmDialog = false;submitOrderFormData()") 确认
    div.fixed-bottom-btns
      el-button(size="small" plain type="warning" @click="submitEvent('car')" v-if="isShow") 加入{{systemConfig.shopping_car}}
      el-button(size="small" plain type="warning" @click="submitEvent('pre')" v-if="!isShow" :disabled="isSaving") 上一步
      el-button(v-if="isShow" size="small" type="warning" @click="submitEvent('submit')" :v-loading="isSaving") 立即申请
      el-button(v-if="!isShow" size="small" type="warning" @click="submitEvent()" :v-loading="isSaving" :disabled="isSaving") 提交申请
</template>
<script>
/**
 * @description 申请云主机主体组件，包含表单组件以及购物车组件
 * @author xinghua.wen
 */
import ServiceDynamicForm from '@/components/catalog/common/ServiceDynamicForm'
import InstanceOwner from '@/components/catalog/common/InstanceOwner'
import OrderConfirm from '@/components/catalog/common/OrderConfirm'
import InstanceFormDetail from '@/components/catalog/common/InstanceFormDetail'
import BlueprintDiagramAndNodeForms from '@/components/orchestration/application/BlueprintDiagramAndNodeForms'
import MetadataUtls from '@server/metadata.utils'
import Utils from '@server/Utils'
import { mapGetters, mapActions } from 'vuex'
import Api from '@api'
import DateUtils from '@server/date-utils'
import ExpiredAtWidget from '../../common/dynamicForm/ExpiredAtWidget'
import {SUPPORT_IMG} from '@/server/ConstParams'

// 资源所属和更多配置的类元数据attribute
const resourceAndMoreconfig = {
    app_name: {
        key: 'app_name',
        label: '应用'
    },
    business_name: {
        key: 'business_name',
        label: '业务'
    },
    org_name: {
        key: 'org_name',
        label: '组织机构'
    },
    env: {
        key: 'env',
        label: '环境'
    },
    responsible_person: {
        key: 'responsible_person',
        label: '责任人'
    },
    instance_apply_count: {
        key: 'instance_apply_count',
        label: '虚拟机数量'
    },
    expired_at: {
        key: 'expired_at',
        label: '租期'
    }
}

export default {
  $_veeValidate: {
    validator: 'new'
  },
  props: ['serviceCode'],
  data () {
    return {
      metaFormData: {},
      relatedServices: [],
      childRenServices: [],
      resourceId: '',
      // 选择资源归属
      resourceOwner: {
        owner_type: '',
        owner: null,
        provider_id: '',
        isShowResources: false
      },
      // 切换服务动态表单和申请单确认组件的显示flag
      isShow: true,
      orderForm: {
        urgency_level: 'low',
        expected_time: '',
        memo: ''
      },
      instance_apply_count: 1,
      expired_at: null,
        attachmentConf: {
            uploadHeaders: {
                'X-Subject-Token': localStorage.getItem('authenticationToken')
            },
            uploadData: {
                filename: ''
            },
            fileLimit: 3,
            files: []
        },
      env: '',
      attribute: [],
      expiredAtOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      }, // UCMP-406 今日之前的日期不让点击
      envRules: {
        required: true
      },
      submitConfirm: true, // 是否在点击提交申请后弹出确认模态框
      showConfirmDialog: false, // 提交申请前确认框显示开关
      isSaving: false,
      defaultBpResources: {},
      instance_apply_count_tip: '阿里云的云主机最多可以挂载16个云硬盘，否则会引起部署失败',
      globalEnv: {require: false},
      isOnlyShowBasic: false
    }
  },

  methods: {
    /**
     * @description UCMP3-3329 [全局参数]提交订单前是否需要确认框
     */
    getHasConfirmDialog () {
      Api.get('getDictByCode', { code: 'catalog_confirm' }, true).then(
            res => {
                this.submitConfirm = res.available
            }
        )
    },

    submitEvent (type) {
        if (type === 'pre')
            this.isShow = true
        else {
            this.$validator.validate().then(result => {
                if (result)
                    this.submit && this.submit(type)
            })
        }
    },

    getBpDetail () {
        Api.get('getMetadata', { _code: 'blueprint/' + this.serviceCode + '/detail' }, true).then(
            res => {
                this.$emit('hideLoading')
                this.defaultBpResources = res
            }, () => {
                this.$emit('hideLoading')
            }
        )
    },

    submit (flag) {
        if (flag === 'car') { // 加入购物车
            this.addShopCar(this.order_item)
            this.$notify.success('当前资源成功加入购物车')
            // 清空附件
            this.attachmentConf.files = []

            this.$notify.success(`当前资源成功加入${this.systemConfig.shopping_car}`)
            // 加入购物车后重新制定资源id
            this.resourceId = Utils.uuid()
        } else if (flag === 'submit') // 立即申请操作
            this.isShow = !this.isShow
        else if (this.submitConfirm)
            this.showConfirmDialog = true
        else if (!this.submitConfirm)
          this.submitOrderFormData()
    },

    submitOrderFormData () {
      this.isSaving = true
        console.log(this.orderFormContent)
        Api.post('order', this.orderFormContent, true).then(
            res => {
                this.isSaving = false
                this.$notify.success('资源申请操作成功')
                this.$router.push('/orders')
            }, (err) => {
                this.isSaving = false
                if (err && err.response && err.response.status === 400 && (err.response.data.message || err.response.data.msg)) {
                    // 什么都不用处理，在统一公共库中已经做了处理
                } else 
                    this.$notify.error('资源申请操作失败')
            }
        )
    },

    ...mapActions([
        'addShopCar',
        'getTenancy'
    ]),

    getEnv () {
        // 非蓝图的时候才去请求
        if (this.checkedMeta.group !== 'blueprint') {
            Api.get('getDictByCode', { code: 'env' }).then(res => {
                this.globalEnv = res || { require: false }

                // 如不显示env 给定默认的env product
                this.env = this.globalEnv.require ? '' : 'product'
            })
        }
    },

    sameRowAttributeHandler (obj, attr) {
      let displaySameRow = attr.display_same_row

      if (!obj[displaySameRow.key]) {
        obj[displaySameRow.key] = JSON.parse(JSON.stringify(displaySameRow))
        obj[displaySameRow.key].children = []
      }
      obj[displaySameRow.key].children.push(JSON.parse(JSON.stringify(attr)))
    },

      beforeAttachmentUpload (file) {
          if (file.size > 30 * 1024 * 1024) {
              this.$message.error('上传文件单个大小不能超过 30MB!')
              return false
          }

          // 后台需要传filename规避中文乱码
          this.attachmentConf.uploadData.filename = file.name
          return true
      },
      attachmentRemove (file, fileList) {
          // UCMP3-5700【工单管理】创建工单，选择了附件后清除附件，保存仍有附件信息
          if (file.response) {
              // file.response存在表示是上传成功过的，而不是上传失败自动remove的
              this.attachmentConf.files = this.attachmentConf.files.filter(item => item.id !== file.response.ucmp_file_id)
          }
      },
      attachmentExceed () {
          this.$message.error(`最多上传文件${this.attachmentConf.fileLimit}个文件！`)
      },
      attachmentSuccess (response, file, fileList) {
          this.attachmentConf.files.push({name: file.name, id: response.ucmp_file_id})

          // 非img展示固定的文档图片
          let uploadDomList = document.querySelectorAll('.apply-instance .el-upload-list li')
          Array.prototype.forEach.call(uploadDomList, li => {
              this.$nextTick(() => {
                  if (!this.isImage(li.querySelector('.el-upload-list__item-name').textContent.trim())) {
                      // 替换展示
                      li.querySelector('.el-upload-list__item-thumbnail').src = process.env.NODE_ENV !== 'development'
                          ? '../../../static/ucmp-ui/static/images/icon/document.jpg'
                          : '../../../static/images/icon/document.jpg'
                  }
              })
          })
      },
      isImage (name) {
          let suffix = name.split('.').pop().toString().toLowerCase()
          return SUPPORT_IMG.includes(suffix)
      }
  },

  computed: {
    /**
     * @description 资源归属共享给动态表单(基础信息)的信息
     */
    externalFormData () {
        let formData = {}

        // 修复初始化页面，owner = null 导致控制台报错
        if (this.resourceOwner.owner) {
            formData.short = this.resourceOwner.owner.short
            formData.owner_type = this.resourceOwnerInfo.owner_type
            formData.owner = this.resourceOwnerInfo.owner
        }

        // UCMP3-4103 服务目录申请vmware云硬盘，云主机仍按照环境过滤了，需去掉
        // 解决方法：去掉env条件查询

        // 针对nas添加节点的属性nas_fs_type值
        if (this.serviceCode === 'nas' && this.metaFormData && this.metaFormData.resources && Array.isArray(this.metaFormData.resources) && this.metaFormData.resources.length) {
            let nas_fs_type = this.metaFormData.resources[0].attributes && Array.isArray(this.metaFormData.resources[0].attributes.ecs) && this.metaFormData.resources[0].attributes.ecs.length ? this.metaFormData.resources[0].attributes.ecs[0].nas_fs_type : ''
            formData.nas_fs_type = nas_fs_type
        }
        return formData
    },

    /**
     * @description 当前编排所有资源的attribute集合(object),在申请单确认中显示资源详细配置使用
     */
    blueprintAllAttributes () {
      let result = {}
      if (this.checkedMeta.group && this.checkedMeta.group === 'blueprint') {
        // UCMP3-2527 使用vuex中缓存的信息，及时得到更新的内容
        let allAttributes = this.allResourceAttrs
        Object.keys(allAttributes).forEach(
          service_attr => {
            let service_code = service_attr.split('_')[0]
            if (!result[service_code]) {
              result[service_code] = {}
              allAttributes[service_attr].forEach(
                attr => {
                  result[service_code][attr.key] = attr
                }
              )
            }
          }
        )
      }
      return result
    },
    /**
     * @description 当前服务以及关联服务的属性集合（Object）, 方便确认申请单显示资源详细配置使用
     */
    checkedAndRelatedServiceAttributes () {
        let result = {}
        if (this.checkedMeta.group && this.checkedMeta.group !== 'blueprint') {
            let attribute = {}
            this.attribute.forEach(
                attr => {
                    if (!attr.display_same_row)
                      attribute[attr.key] = attr
                    else this.sameRowAttributeHandler(attribute, attr)
                }
            )
            result[this.serviceCode] = attribute

            this.relatedServices.forEach(
                service => {
                    let attribute = JSON.parse('{}')
                    service.attribute.forEach(
                        attr => {
                            attribute[attr.key] = attr
                        }
                    )
                    result[service.service_code] = attribute
                }
            )

            this.childRenServices.forEach(
                service => {
                    let attribute = JSON.parse('{}')
                    service.attribute.forEach(
                        attr => {
                            attribute[attr.key] = attr
                        }
                    )
                    result[service.service_code] = attribute
                }
            )
        }

        return result
    },

    /**
     * @description 当前编排所有资源的属性集合（Object）, 方便确认申请单显示资源详细配置使用
     */
    blueprintResourceConfigs () {
      let result = {
        resources: []
      }
      if (this.checkedMeta.group && this.checkedMeta.group === 'blueprint') {
        // UCMP3-2527 使用vuex中缓存的信息，及时得到更新的内容
        let resourceCfgFormAttrs = this.formDataAndDisplay
        Object.keys(resourceCfgFormAttrs).forEach(
          resource_id => {
            let item = JSON.parse('{}')
            item.service_code = resource_id.split('_')[0]
            item.display = resourceCfgFormAttrs[resource_id].display
            // UCMP3-3361 修复申请蓝图服务配置信息空白
            item.attributes = resourceCfgFormAttrs[resource_id].formData
            result.resources.push(item)
          }
        )
      }
      return result
    },

    resources () {
      if (this.metaFormData.resources && this.metaFormData.resources.length) {
        let resources = this.metaFormData.resources
        if (this.checkedMeta && this.checkedMeta.group === 'blueprint') {
          // UCMP3-2527 使用vuex中缓存的信息，及时得到更新的内容
          resources[0].resources = this.bpResources
          resources[0].dependencies = this.bpDependencies
          if (this.bpForm.properties)
            resources[0].properties = this.bpForm.properties
          if (this.bpForm.linkProperties)
            resources[0].linkProperties = this.bpForm.linkProperties
        }
        return Utils.transformTreeMapData(resources, 'id', 'reference', 'includings', '')
      } else return {}
    },

    order_item () {
      // 租期应在设定在选中日的最后一秒
      // let timeAddition = 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000
      let resources = JSON.parse(JSON.stringify(this.resources))
      let rst = {
          owner_type: this.resourceOwner.owner_type,
          attachments: this.attachmentConf.files,
          env: this.env,
          service_item: { expired_at: this.correctiveExpiredAt },
          data: Object.assign({ resources }, { dependencies: [], service_code: this.serviceCode, group: this.checkedMeta.group })
      }

      // 资源归属

        // resourceOwner.owner_type === 'personal'资源归属个人，owner为'', app/org沿用之前逻辑
        rst.owner = ''
        if (this.resourceOwner.owner)
            rst.owner = this.resourceOwner.owner_type === 'app' ? this.resourceOwner.owner.id : (this.resourceOwner.owner_type !== 'personal' ? this.resourceOwner.owner.id : '')

      if (!this.tenancy.available)
          delete rst.service_item.expired_at
      if (this.checkedMeta.instance_apply_count)
          rst.count = this.instance_apply_count
      return rst
    },

    correctiveExpiredAt () {
      // 租期应在设定在选中日的最后一秒
      return this.expired_at + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000
    },

    resourceOwnerInfo () {
        // 资源归属
        // personal 归属个人，owner为''
        let ownerId = ''
        if (this.resourceOwner.owner)
            ownerId = this.resourceOwner.owner_type === 'app' ? this.resourceOwner.owner.id : (this.resourceOwner.owner_type !== 'personal' ? this.resourceOwner.owner.id : '')

        return {
            owner: ownerId,
            owner_type: this.resourceOwner.owner_type,
            env: this.env,
            provider_id: this.resourceOwner.provider_id,
            isShowResources: this.resourceOwner.isShowResources
        }
    },

    orderFormContent () {
        let confirmData = {
            _action: 'create',
            _service_code: this.order_item.data.service_code,
            order_item: [this.order_item]
        }
        return { ...confirmData, ...this.orderForm }
    },

    showResourcesCfgForms () {
        if (this.resourceOwner.owner || (this.resourceOwner.owner_type === 'personal'))
            return true
        return false
    },

    ...mapGetters([
      'metadata',
      'allResourceAttrs',
      'formDataAndDisplay',
      'bpResources',
      'bpDependencies',
      'bpForm',
      'tenancy',
      'attachmentDisplay',
      'businessDisplay',
      'systemConfig'
    ]),

    checkedMeta () {
        return MetadataUtls.getCheckedMeta(this.metadata, this.serviceCode)
    },

    currentServiceTenany () {
      return this.checkedMeta && this.checkedMeta.tenany
    },

    breadcrumbItems () {
        return [
            { prop: '/service-catalog', label: '服务目录' },
            { prop: '/catalog/' + this.checkedMeta.service_code, label: '申请' + this.checkedMeta.name }
        ]
    },

    // extendFormData数据
    // bug UCMP-1367【服务目录】申请单确认页面中的内容，除了基础配置之外，其他内容也需要添加展示。
    extendFormData () {
      let rst = {}
      // 添加上构造的资源所属和更多配置的attribute
      // UCMP3-918【服务目录】在更包之后，申请云主机，提交申请后，申请单信息页面为空
      // 问题原因：先申请蓝图再申请服务时，display和attribute的key对应不上，取lable时OrderConfirm组件dom报错造成的
      // 解决方法：深拷贝对象
      let copyResourceAndMoreconfig = JSON.parse(JSON.stringify(resourceAndMoreconfig))

      // 添加上构造的资源所属和更多配置的display
      let display = {}

      !this.checkedMeta.instance_apply_count && delete copyResourceAndMoreconfig.instance_apply_count
      !this.tenancy.available && delete copyResourceAndMoreconfig.expired_at
      this.checkedMeta.group === 'blueprint' && delete copyResourceAndMoreconfig.env

      if (this.resourceOwner.owner_type === 'org') {
          delete copyResourceAndMoreconfig.app_name
          delete copyResourceAndMoreconfig.business_name
          display.org_name = this.resourceOwner && this.resourceOwner.owner && this.resourceOwner.owner.org_name ? this.resourceOwner.owner.org_name : ''
      }

      if (this.resourceOwner.owner_type === 'app') {
          delete copyResourceAndMoreconfig.org_name
          display.app_name = this.resourceOwner && this.resourceOwner.owner && this.resourceOwner.owner.app_name ? `${this.resourceOwner.owner.app_name}(${this.resourceOwner.owner.short})` : ''
          display.business_name = this.resourceOwner && this.resourceOwner.owner && this.resourceOwner.owner.business_name ? this.resourceOwner.owner.business_name : ''
      }

      // 判断是否需要展示
      this.checkedMeta.instance_apply_count && (display.instance_apply_count = this.instance_apply_count)
      // bug UCMP3-591【确认申请单】确认申请单页面，租期显示不正确。
      !this.isOnlyShowBasic && this.currentServiceTenany && this.tenancy.available && (display.expired_at = DateUtils.formate(this.correctiveExpiredAt, 'yyyy-MM-dd'))
      // UCMP3-3055 申请云主机等资源时，如果全局参数设置不显示环境，则该处也不显示
      !this.isOnlyShowBasic && this.checkedMeta.group !== 'blueprint' && this.globalEnv.require && (display.env = this.env)

      // 全局参数-配置不显示业务
      if (!this.businessDisplay) {
          delete copyResourceAndMoreconfig.business_name
          delete display.business_name
      }

      rst['attribute'] = copyResourceAndMoreconfig
      rst['display'] = display

      return rst
    },
    metadataHasBasicServices () {
      if (!this.metadata || !this.metadata.length)
        return false
      return !!this.metadata.filter(service => { return service.group && service.group !== 'blueprint' }).length
    },
    isShowMoreSetup () {
      return !this.isOnlyShowBasic && ((this.serviceCode === 'ecs' || this.serviceCode === 'volume') || this.checkedMeta.instance_apply_count || this.tenancy.available)
    }
  },

  watch: {
      /**
       * @description 刷新页面重新获取元数据列表后，初始化编排明细信息
       */
      checkedMeta: {
          deep: true,
          handler () {
              if (this.metadataHasBasicServices && this.checkedMeta && this.checkedMeta.group && this.checkedMeta.group === 'blueprint' && JSON.stringify(this.defaultBpResources) === '{}')
                this.getBpDetail()
          }
      },

      'checkedMeta.group' (val) {
        if (val && val !== 'blueprint')
          this.$emit('hideLoading')
      }
  },

  components: {
      ServiceDynamicForm,
      InstanceOwner,
      OrderConfirm,
      InstanceFormDetail,
      BlueprintDiagramAndNodeForms,
      ExpiredAtWidget
  },

  created () {
      this.resourceId = Utils.uuid()
      this.getTenancy()
      // UCMP3-3329 提交订单前是否需要确认框
      this.getHasConfirmDialog()
      // 初始化当前页面，且有选中元数据信息(编排类型)，初始化编排明细信息
      if (this.metadataHasBasicServices && this.checkedMeta && this.checkedMeta.group && this.checkedMeta.group === 'blueprint')
          this.getBpDetail()
      if (this.checkedMeta && this.checkedMeta.group && this.checkedMeta.group !== 'blueprint')
        this.$emit('hideLoading')

      this.getEnv()
      // 处理只需要显示基础信息
      let onlyShowBasicServicecodes = ['publish_xen_app']
      this.isOnlyShowBasic = onlyShowBasicServicecodes.includes(this.serviceCode)
  }
}
</script>
<style lang="scss" scoped>
.instance-form-detail {
    width: 350px;
    background: #fff;
    &.bluprint-instance-form-detail {
        position: absolute;
        right: 0;
        width: 335px;
        top: 350px;
        overflow-y: auto;
        height: calc(100% - 350px);
        color: black;
        margin-left: 0;
        margin-right: 0;
    }
    &.basic-resource-form-detail {
        overflow-y: auto;
    }
}
.instance-form {
    width: calc(100% - 350px);
    overflow-y: auto;
}
.fixed-bottom-btns {
    position: fixed;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 70px;
    width: 100%;
    background: #fff;
    padding-right: 16px;
    .el-button {
        margin-top: 0;
    }
}
.full-with-fixed-container {
    height: calc(100% - 70px);
    overflow: hidden;
}
.display-none-important {
    display: none !important;
}
.confirm-dialog {
  max-height: 550px;
  overflow: hidden;
  overflow-y: auto;
}
</style>
