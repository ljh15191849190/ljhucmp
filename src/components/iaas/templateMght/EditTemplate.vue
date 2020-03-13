<template lang="pug">
    div.container-flud
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item(to="/") {{sysName}}
                el-breadcrumb-item(v-for="(item, index) in breadcrumbItems" :key="item.prop" :to="{ path: item.prop }") {{item.label}}
        div.template
            el-form.template-content(label-width="100px"  :inline="true" label-position="right" size="small")
                div.table-search
                    el-input(v-model="imageNameStr" @clear="searchImageName" size="mini" placeholder="请输入镜像名称搜索" clearable)
                    el-button(@click="searchImageName" size="small" type="primary") 搜索
                div.template-header(v-if="type !== 'set'")
                    el-form-item.is-required(label="镜像名称" prop="name")
                        el-input.form-item-width(v-model="templateForm.name"
                        v-validate="rules.name"
                        :name="'name'"
                        placeholder="请输入镜像名称"
                        data-vv-as="镜像名称"
                        :class="{'input': true, 'is-danger': errors.has('name')}"
                        maxlength="100"
                        )
                        span.validator-error.is-danger(v-if="errors.has('name')") {{ errors.first('name') }}
                    el-form-item.is-required(label="操作系统" prop="system")
                        el-select.form-item-width(v-model="templateForm.system"
                        v-validate="rules.require"
                        :name="'system'"
                        placeholder="请选择操作系统"
                        data-vv-as="操作系统"
                        :class="{'input': true, 'is-danger': errors.has('system')}"
                        maxlength="20"
                        )
                            el-option(v-for="item in systemList" :key="item.id" :value="item.id" :label="item.name")
                        span.validator-error.is-danger(v-if="errors.has('system')") {{ errors.first('system') }}
                    el-form-item(label="包含服务" prop="includeServices")
                        el-select.form-item-width(v-model="templateForm.include_services"
                        :name="'includeServices'"
                        placeholder="请选择服务类型"
                        data-vv-as="服务类型"
                        multiple
                        filterable
                        collapse-tags
                        maxlength="20"
                        )
                            el-option(v-for="(item, index) in serviceList" :key="index" :value="item" :label="item")
                div.template-table(:class="{'settemplate': type === 'set'}")
                    el-tabs(v-if="templateForm.provider_id" v-model="tabModel" @tab-click="handleTabClick")
                        <!--el-tab-pane(v-for="item in providers" :key="item.id"  :label="item.name" :name="item.id")-->
                        template(v-for="provider in providers")
                            el-tab-pane(v-for="zone in provider.region_zones" :key="provider.id + zone.id"  :label="provider.name + '【' + zone.name + '】'" :name="provider.id + '|' + zone.id" :zone="zone.id" :provider="provider.id")
                    template(v-for="provider in providers")
                        div.temp-table-container.image-templates(v-for="zone in provider.region_zones" :key="provider.id + zone.id" v-show="templateForm.provider_id === provider.id && templateForm.region_zoneId === zone.id")
                            el-table.template-edit-table(:data="allProviderTemplates['provider_' + provider.id + '|' + zone.id].tableList" border stripe)
                                el-table-column(width="45")
                                    template(slot-scope="scope")
                                        el-checkbox.circle(v-model="scope.row['checked']" @change="handleSelectProvider(scope.row, allProviderTemplates['provider_' + provider.id + '|' + zone.id].tableList)")
                                el-table-column(:prop="column.prop" v-for="column in columns" :key="column.prop" :label="column.label" :width="column.width")
                                    template(slot-scope="scope")
                                        div.form-container(v-if="scope.row.checked")
                                            el-input(
                                            v-if="column.prop === 'ssh_user'"
                                            size="small"
                                            v-model="scope.row[column.prop]"
                                            placeholder="请输入用户名"
                                            maxlength="20"
                                            @change="tableRowChange(scope.row)"
                                            v-validate="rules.ssh_user"
                                            :name="'ssh_user' + provider.id + '|' + zone.id"
                                            :data-vv-as="provider.name + '【' + zone.name + '】' + '选中模板的用户名'"
                                            :class="{'input': true, 'is-danger': errors.has('ssh_user' + provider.id + '|' + zone.id)}"
                                            )
                                            el-input(
                                            v-else-if="column.prop === 'ssh_password'"
                                            size="small"
                                            v-model="scope.row[column.prop]"
                                            placeholder="请输入密码"
                                            type="text"
                                            maxlength="20"
                                            @change="tableRowChange(scope.row)"
                                            v-validate="rules.ssh_password"
                                            :name="'ssh_password' + provider.id + '|' + zone.id"
                                            :data-vv-as="provider.name + '【' + zone.name + '】' + '选中模板的密码'"
                                            :class="{'input': true, 'is-danger': errors.has('ssh_password' + provider.id + '|' + zone.id)}"
                                            )
                                            el-input(
                                            v-else-if="column.prop === 'ssh_port'"
                                            @change="tableRowChange(scope.row)"
                                            size="small"
                                            v-validate="rules.ssh_port"
                                            v-model="scope.row[column.prop]"
                                            placeholder="请输入端口号(1-65535)"
                                            maxlength="10"
                                            :name="'ssh_port' + provider.id + '|' + zone.id"
                                            :data-vv-as="provider.name + '【' + zone.name + '】' + '选中模板的端口号'"
                                            :class="{'input': true, 'is-danger': errors.has('ssh_port' + provider.id + '|' + zone.id)}"
                                            )
                                            span(v-else) {{scope.row[column.prop]}}
                                            span.validator-error.is-danger.cell-error(v-if="column.prop === 'ssh_port' && errors.has('ssh_port' + provider.id + '|' + zone.id)") {{ errors.first('ssh_port' + provider.id + '|' + zone.id) }}
                                            span.validator-error.is-danger.cell-error(v-if="column.prop === 'ssh_user' && errors.has('ssh_user' + provider.id + '|' + zone.id)") {{ errors.first('ssh_user' + provider.id + '|' + zone.id) }}
                                            span.validator-error.is-danger.cell-error(v-if="column.prop === 'ssh_password' && errors.has('ssh_password' + provider.id + '|' + zone.id)") {{ errors.first('ssh_password' + provider.id + '|' + zone.id) }}
                                        div.display-container(v-else)
                                            span(v-if="column.prop !== 'ssh_password'") {{scope.row[column.prop]}}
                                            span(v-else-if="column.prop == 'ssh_password' && scope.row.ssh_password && scope.row.ssh_password.length" v-for="(item, index) in scope.row.ssh_password.length") *
                            div.page-pane.pagination-right
                                el-pagination(
                                background
                                @size-change="handleSizeChange($event, provider.id, zone.id)"
                                @current-change="handleCurrentChange($event, provider.id, zone.id)"
                                :current-page.sync="allProviderTemplates['provider_' + provider.id + '|' + zone.id].pagination.index"
                                :page-sizes="[10, 20, 50, 100]"
                                :page-size="allProviderTemplates['provider_' + provider.id + '|' + zone.id].pagination.size"
                                layout="sizes, total, prev, pager, next"
                                :total="allProviderTemplates['provider_' + provider.id + '|' + zone.id].pagination.total"
                                )
            div.template-footer
                el-button(@click="goBack" size="small") 返回
                el-button(type="warning" size="small" @click="submit" :disabled="submitDisabled") 保存
</template>

<script>
    /**
     * @description 创建镜像
     */
    import Api from '@api'
    import {mapGetters} from 'vuex'

    export default {
        $_veeValidate: {
            validator: 'new'
        },
        data () {
            return {
                submitDisabled: false,
                type: '',
                mirrorId: '',
                systemList: [],
                providers: [],
                tableList: [],
                pagination: {
                    index: 1,
                    size: 20,
                    total: 0
                },
                defaultCheckedTemplates: [],
                templateForm: {
                    name: '',
                    system: '',
                    provider_id: '',
                    region_zoneId: '',
                    include_services: []
                },
                rules: {
                    // UCMP-561 镜像管理-自定义镜像名称不能输入().!
                    // 解决方法：与产品沟通此处只做长度校验，不应该做字符格式校验
                    name: {
                        required: true
                    },
                    require: {
                        required: true
                    },
                    ssh_user: {
                        required: true
                    },
                    ssh_password: {
                        required: true
                    },
                    ssh_port: {
                        required: true,
                        // UCMP-1106 镜像管理，输入端口号（16开头的五位数），提示端口号错误
                        regex: /^(^[1-9]\d{0,3}$)|(^[1-5]\d{4}$)|(^[6][0-5][0-5][0-3][0-5]$)/
                    }
                },
                columns: [
                    {prop: 'image_name', label: '云厂商镜像名称'},
                    {prop: 'ssh_port', label: '连接端口'},
                    {prop: 'ssh_user', label: '用户名'},
                    {prop: 'ssh_password', label: '密码'}
                ],
                allProviderTemplates: {},
                serviceList: [],
                tabModel: '',
                checkedTemplates: [],
                imageNameStr: ''
            }
        },
        methods: {
            /**
             * @description UCMP3-2860 根据场景初始化激活tab页签值：新加时默认第一个；编辑时默认取第一个有模板选中的
             */
            getActivedTab () {
                if (!this.providers.length || !Object.keys(this.allProviderTemplates).length)
                    return ''
                
                 //UCMP-786 自定义镜像，基础厂商的模板未加载出来
                this.templateForm.provider_id = this.providers.length ? this.providers[0].id : ''
                this.templateForm.region_zoneId = this.providers.length ? (this.providers[0].region_zones.length ? this.providers[0].region_zones[0].id : '') : ''
                
                if (this.type === 'add')
                    return this.templateForm.provider_id + '|' + this.templateForm.region_zoneId
                else if (this.type !== 'add') {
                    let defaultKey = ''
                    for (let index = 0; index < this.providers.length; index++) {
                        for (let zoneIndex = 0; zoneIndex < this.providers[index].region_zones.length; zoneIndex++) {
                            let zone = this.providers[index].region_zones[zoneIndex]
                            let tableData = this.allProviderTemplates['provider_' + this.providers[index].id + '|' + zone.id] ? this.allProviderTemplates['provider_' + this.providers[index].id + '|' + zone.id].tableList : []
                            this.templateForm.provider_id = this.providers[index].id
                            this.templateForm.region_zoneId = zone.id
                            defaultKey = this.providers[index].id + '|' + zone.id
                            let ifHasChecked = tableData.some(item => item.checked)
                            if (ifHasChecked)
                                return defaultKey
                        }
                    }
                    return defaultKey
                }
                return ''
            },
            /**
             * @description 初始化操作
             */
            init () {
                this.initServicesList() // 初始化所属服务列表
                this.type = this.$route.params.id
                Api.get('mirrorProvider', {}, true).then(res => {
                    //UCMP-1313镜像管理中，F5、NAS厂商需要过滤掉
                    //问题原因：需求问题
                    //解决方法：过滤掉F5、NAS
                    if (res && res.length)
                        this.providers = res.filter(item => item.provider_code !== 'netapp' && item.provider_code !== 'bigip')
                    this.$nextTick(() => {
                        let providerPromises = [], mirrorPromise = null
                        this.providers.forEach((provider, index) => {
                            provider.region_zones.forEach((zone, index) => {
                                providerPromises.push(this.getImageProviders(provider.id, zone.id))
                            })
                        })
                        if (this.type === 'add') {
                            this.getSystemList()
                            this.tabModel = this.getActivedTab()
                        } else {
                            //UCMP-754 问题一:公共镜像，配置页面，第一个标签数据显示不出来；问题二：勾选各厂商模板，点击保存，再点击编辑，之前的状态未保存
                            this.mirrorId = this.$route.query.id
                            if (this.type === 'edit')
                                this.getSystemList()

                            // 获取选中镜像模板信息
                            mirrorPromise = this.getMirrorInfo()
                            providerPromises.push(mirrorPromise)
                            // 处理选中模板状态
                            Promise.all(providerPromises).then(res => {
                                this.templateForm.provider_id = this.providers.length ? this.providers[0].id : ''
                                this.templateForm.region_zoneId = this.providers.length ? (this.providers[0].region_zones.length ? this.providers[0].region_zones[0].id : '') : ''

                                this.providers.forEach(provider => {
                                    provider.region_zones.forEach(zone => {
                                        if (this.allProviderTemplates['provider_' + provider.id + '|' + zone.id] && this.allProviderTemplates['provider_' + provider.id + '|' + zone.id].tableList && this.allProviderTemplates['provider_' + provider.id + '|' + zone.id].tableList.length) {
                                            // defaultCheckedTemplateIds
                                            this.allProviderTemplates['provider_' + provider.id + '|' + zone.id].tableList.forEach(row => {
                                                let getOne = this.defaultCheckedTemplates.find(item => {
                                                    return row.image_id === item.image_id && row.region_zone === item.region_zone && row.provider_id === item.provider_id
                                                })

                                                if (getOne) {
                                                    //
                                                    row.checked = true
                                                    this.syncCheckedTemplates(row.provider_id, row.region_zone, row)
                                                }
                                            })
                                        }
                                    })
                                })
                                this.tabModel = this.getActivedTab()
                            })
                        }
                    })
                })
            },
            /**
             * 初始化所属服务列表
             */
            initServicesList () {
                Api.get('getDictByCode', {code: 'include_services'}).then(res => {
                    if (res) this.serviceList = res.include_services
                })
            },
            /**
             * @description 处理镜像单选
             */
            handleSelectProvider (row, tableList) {
                for (let index = 0; index < tableList.length; index++) {
                    if (row.image_id === tableList[index].image_id) {
                        this.$set(tableList[index], 'checked', row.checked)
                        if (row.checked) {
                            //
                            this.syncCheckedTemplates(row.provider_id, row.region_zone, row)
                        } else {
                            //取消选中
                            this.syncCheckedTemplates(row.provider_id, row.region_zone, null)
                        }
                    } else
                        this.$set(tableList[index], 'checked', false)
                }
            },
            /**
             * @description 获取镜像详情
             */
            getMirrorInfo () {
                return Api.get('mirror', {id: this.mirrorId}, true).then(res => {
                    this.templateForm.name = res.name
                    this.templateForm.system = res.os.id
                    this.templateForm.include_services = res.include_services || []
                    this.defaultCheckedTemplates = res.image_providers
                    this.checkedTemplates = JSON.parse(JSON.stringify(this.defaultCheckedTemplates))
                    // this.getImageProviders()
                })
            },
            /**
             * @description 获取操作系统列表
             */
            getSystemList () {
                Api.get('systemOs', {
                    offset: 0,
                    limit: 9999
                }, true).then(res => {
                    this.systemList = res.list.map(item => {
                        return {
                            id: item.id,
                            name: item.name
                        }
                    })
                })
            },
            /**
             * @description 行输入变化
             */
            tableRowChange (row) {
                if (row.checked) {
                    let index = this.checkedTemplates.findIndex(templateItem =>
                        templateItem.provider_id === row.provider_id &&
                        templateItem.region_zone === row.region_zone &&
                        templateItem.image_id === row.image_id
                    )
                    if (index > -1) {
                        this.checkedTemplates[index].ssh_port = row.ssh_port
                        this.checkedTemplates[index].ssh_user = row.ssh_user
                        this.checkedTemplates[index].ssh_password = row.ssh_password
                    }
                }
            },
            /**
             * @description 获取云厂商镜像列表
             */
            getImageProviders (provider_id, region_zoneId) {
                let resUrl = ''
                let resObj = {
                    provider_id: provider_id,
                    region_zone: region_zoneId,
                    offset: this.allProviderTemplates['provider_' + provider_id + '|' + region_zoneId].pagination.index,
                    limit: this.allProviderTemplates['provider_' + provider_id + '|' + region_zoneId].pagination.size
                }

                // 过滤条件
                if (this.imageNameStr) {
                    //
                    resObj.name = this.imageNameStr
                }

                if (this.type !== 'add') {
                    resUrl = 'imageProviderSort'
                    //UCMP-870 编辑镜像，翻页之后，镜像之前的勾选状态丢失
                    this.$set(resObj, '_id', this.$route.query.id)
                } else
                    resUrl = 'imageProvider'

                return Api.get(resUrl, resObj, true).then(res => {
                    this.allProviderTemplates['provider_' + provider_id + '|' + region_zoneId].tableList = res.list
                    this.allProviderTemplates['provider_' + provider_id + '|' + region_zoneId].pagination.total = res.total
                    //设置table选中状态
                    this.allProviderTemplates['provider_' + provider_id + '|' + region_zoneId].tableList.forEach(item => {
                        if (this.checkedTemplates.length) {
                            let index = this.checkedTemplates.findIndex(templateItem =>
                                templateItem.provider_id === item.provider_id &&
                                templateItem.region_zone === item.region_zone &&
                                templateItem.image_id === item.image_id
                            )
                            if (index > -1) {
                                if (this.checkedTemplates[index].checked)
                                    delete this.checkedTemplates[index].checked
                                this.$set(item, 'checked', true)
                                this.$set(item, 'ssh_port', this.checkedTemplates[index].ssh_port)
                                this.$set(item, 'ssh_user', this.checkedTemplates[index].ssh_user)
                                this.$set(item, 'ssh_password', this.checkedTemplates[index].ssh_password)
                            } else
                                this.$set(item, 'checked', false)
                        } else
                            this.$set(item, 'checked', false)
                    })

                    //UCMP-842 镜像管理，厂商模板列表翻页功能不正常
                    this.allProviderTemplates = {...{}, ...this.allProviderTemplates}
                })
            },
            /**
             * @description 默认每页查询条数发生变化
             */
            handleSizeChange (size, provider_id, region_zoneId) {
                this.allProviderTemplates['provider_' + provider_id + '|' + region_zoneId].pagination.size = size
                this.getImageProviders(provider_id, region_zoneId)
            },
            handleCurrentChange (index, provider_id, region_zoneId) {
                this.allProviderTemplates['provider_' + provider_id + '|' + region_zoneId].pagination.index = index
                this.getImageProviders(provider_id, region_zoneId)
            },
            /**
             * @description 返回镜像列表
             */
            goBack () {
                let type = this.type === 'set' ? 'preset' : 'custom'
                this.$router.push({
                    path: '/template-define',
                    query: {type: type}
                })
            },
            /**
             * @description 保存事件
             */
            submit () {
                if (!this.checkedTemplates.length) {
                    this.$notify({
                        type: 'error',
                        message: '请至少选择一个镜像模板'
                    })
                    return
                }

                this.$validator.validate().then(result => {
                    if (!result) {
                        this.errors.items && this.errors.items.length && this.errors.items.forEach(item => {
                            // 显示所有校验错误信息
                            setTimeout(() => {
                                this.$notify({
                                    type: 'error',
                                    message: item.msg
                                })
                            }, 0)
                        })
                    } else {
                        // 不在当前页的选中项 无法通过vee-validate自动验证
                        let hasNonValidteItem = false
                        let portReg = this.rules.ssh_port.regex
                        let columnsText = this.columnsText
                        this.checkedTemplates.forEach(template => {
                            let errorAttributes = []
                            !template.ssh_user && errorAttributes.push('ssh_user')
                            !template.ssh_password && errorAttributes.push('ssh_password')
                            !template.ssh_port && errorAttributes.push('ssh_port')
                            !portReg.test(template.ssh_port) && errorAttributes.push('ssh_port')

                            if (errorAttributes.length) {
                                hasNonValidteItem = true

                                let errorTemplate = this.getProviderAndZoneName(template.provider_id, template.region_zone)
                                let errorMsg = `${errorTemplate}选中项的属性`
                                let errorAttributeStr = ''
                                errorAttributes.forEach(item => {
                                    errorAttributeStr += '【' + columnsText[item] + '】'
                                })

                                this.$notify({
                                    type: 'error',
                                    message: errorMsg + errorAttributeStr + '不正确'
                                })
                            }
                        })

                        if (hasNonValidteItem) return

                        // 提示用户 其 选中的镜像
                        let selectedTemplates = this.checkedTemplates.map(item => {
                            return '<p>' + this.getProviderAndZoneName(item.provider_id, item.region_zone) + ' ' + item.image_name + '</p>'
                        })

                        let confirmHtml = '您选中的镜像为：' + selectedTemplates.join('')

                        this.$confirm(confirmHtml, '提示', {
                            dangerouslyUseHTMLString: true,
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'info'
                        }).then(() => {
                            if (this.type !== 'add') {
                                this.submitDisabled = true
                                let isTypeOfSet = this.type === 'set'
                                let resObj = isTypeOfSet ? {
                                    id: this.mirrorId,
                                    image_provider: this.checkedTemplates
                                } : {
                                    id: this.mirrorId,
                                    name: this.templateForm.name,
                                    os_id: this.templateForm.system,
                                    image_provider: this.checkedTemplates,
                                    // UCMP-1221镜像管理，自定义镜像，选择包含服务后，点击编辑，重新勾选服务，保存不生效
                                    include_services: this.templateForm.include_services
                                }

                                Api.put('mirror', resObj, true).then(res => {
                                    let msg = isTypeOfSet ? '镜像配置成功!' : '镜像编辑成功!'
                                    this.$message({
                                        type: 'success',
                                        message: msg
                                    })
                                    this.goBack()
                                }, err => {
                                    this.submitDisabled = false
                                    console.log(err)
                                })
                            } else {
                                this.submitDisabled = true
                                let resObj = {
                                    name: this.templateForm.name,
                                    os_id: this.templateForm.system,
                                    image_provider: this.checkedTemplates,
                                    include_services: this.templateForm.include_services
                                }
                                Api.post('mirror', resObj, true).then(res => {
                                    this.$message({
                                        type: 'success',
                                        message: `镜像 ${this.templateForm.name} 创建成功!`
                                    })
                                    this.goBack()
                                }, err => {
                                    console.log(err)
                                    this.submitDisabled = false
                                })
                            }
                        }).catch(() => {
                        })
                    }
                })
            },
            handleTabClick (tab, event) {
                this.templateForm.provider_id = tab.$attrs.provider
                this.templateForm.region_zoneId = tab.$attrs.zone
                this.imageNameStr = this.allProviderTemplates['provider_' + this.templateForm.provider_id + '|' + this.templateForm.region_zoneId].imageNameStr || ''
            },
            syncCheckedTemplates (providerId, zoneId, data) {
                // 因为一个厂商+zone下 只有一个选中
                let index = this.checkedTemplates.findIndex(item => item.provider_id === providerId && item.region_zone === zoneId)
                if (index > -1) {
                    if (data) {
                        // 修改选中
                        this.checkedTemplates[index] = data
                    } else {
                        // 取消选中
                        this.checkedTemplates.splice(index, 1)
                    }
                } else {
                    //
                    this.checkedTemplates.push(data)
                }
            },
            searchImageName () {
                let provider_id = this.templateForm.provider_id
                let region_zoneId = this.templateForm.region_zoneId
                this.allProviderTemplates['provider_' + provider_id + '|' + region_zoneId].pagination.index = 1
                this.allProviderTemplates['provider_' + provider_id + '|' + region_zoneId].imageNameStr = this.imageNameStr
                this.getImageProviders(provider_id, region_zoneId)
            },
            getProviderAndZoneName (provider_id, zone_id) {
                let getProvider = this.providers.find(provider => {
                    return provider.id === provider_id
                })

                let getZone
                if (getProvider) {
                    getZone = getProvider.region_zones.find(zone => {
                        return zone.id === zone_id
                    })
                }

                return (getProvider && getZone) ? `${getProvider.name}【${getZone.name}】` : ''
            }
        },
        created () {
            this.init()
        },
        computed: {
            ...mapGetters([
                'sysName'
            ]),
            breadcrumbItems () {
                let breadcrumbItems = []
                if (this.type === 'set') {
                    breadcrumbItems = [
                        {prop: '/template-define', label: '镜像管理'},
                        {prop: '', label: '配置'}
                    ]
                } else if (this.type === 'add') {
                    breadcrumbItems = [
                        {prop: '/template-define', label: '镜像管理'},
                        {prop: '', label: '创建镜像'}
                    ]
                } else {
                    breadcrumbItems = [
                        {prop: '/template-define', label: '镜像管理'},
                        {prop: '', label: '编辑镜像'}
                    ]
                }

                return breadcrumbItems
            },
            columnsText () {
                let obj = {}
                this.columns.forEach(item => {
                    obj[item.prop] = item.label
                })

                return obj
            }
        },
        watch: {
            'providers.length' (newVal, oldVal) {
                if (newVal === oldVal)
                    return
                this.providers.forEach(provider => {
                    provider.region_zones.forEach(zone => {
                        if (this.allProviderTemplates['provider_' + provider.id + '|' + zone.id])
                            return
                        this.allProviderTemplates['provider_' + provider.id + '|' + zone.id] = {
                            tableList: [],
                            pagination: {
                                index: 1,
                                size: 20,
                                total: 0
                            }
                        }
                    })
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .template {
        // breadcrumb 48
        height: calc(100% - 48px);
        .template-content {
            position: relative;
            padding: 0px 16px;
            // footer 56px
            height: calc(100% - 60px);

            .table-search {
                position: absolute;
                bottom: 10px;
                left: 25px;

                .el-input {
                    width: 200px;
                    margin-right: 16px;
                }
            }

            .template-header {
                height: 67px;
                padding-top: 16px;
                background-color: #ffffff;
                .form-item-width {
                    width: 200px;
                }
            }

            .template-table {
                padding: 5px;
                margin-top: 16px;
                background-color: #ffffff;
                // template-header 67 + margin-top 16
                height: calc(100% - 85px);
                &.settemplate {
                    height: 100%;
                }
                .temp-table-container {
                    height: calc(100% - 54px);
                    .template-edit-table {
                        height: calc(100% - 42px);
                        overflow: hidden;
                    }
                    .page-pane {
                        margin-top: 10px;
                        text-align: right;
                    }
                }
                .cell-error {
                    top: 80% !important;
                }
            }
        }
        .template-footer {
            height: 56px;
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
</style>
