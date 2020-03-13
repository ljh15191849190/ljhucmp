<template lang="pug">
    div.container-flud.edit-spec
        el-row.breadcrumb-container
            el-breadcrumb(separator-class="el-icon-arrow-right")
                el-breadcrumb-item(to="/") {{sysName}}
                el-breadcrumb-item(v-for="item in breadcrumbItems" :key="item.label" :to="item.prop") {{item.label}}
        div.spec-content
            div.spec-form
                el-form(label-position="right" label-width="120px" size="small" :disabled="isCheckType")
                    el-form(ref="specForm" label-position="right" :inline="true" label-width="120px" size="small" :model="specification" :rules="rules" :disabled="isCheckType")
                        el-form-item(label="规格名称" prop="name")
                            el-input(v-model="specification.name" :maxlength="40" placeholder="请输入规格名称")
                        el-form-item(label="CPU(核)" prop="cpu_core_count")
                            el-input-number(v-model="specification.cpu_core_count" :min="cpuRange.min" :max="cpuRange.max" :step="1")
                            el-tooltip(content="范围1-32（核）" placement="bottom")
                                i.ucmp-icon-question.theme-color
                        el-form-item(label="内存大小(MB)" prop="memory_size_mb")
                            el-input-number(v-model="specification.memory_size_mb" :min="memoryRange.min" :max="memoryRange.max" :step="1024")
                            el-tooltip(content="范围1-65536MB (64GB)" placement="bottom")
                                i.ucmp-icon-question.theme-color
                    el-form-item.desc-form-item(label="规格描述" prop="desc")
                        el-input.desc(v-model="specification.desc" :maxlength="250" placeholder="请输入规格描述")
            div.spec-flavor
                el-tabs(v-model="cloudProvider" @tab-click="handleClick")
                    el-tab-pane(v-for="item in cloudProviderList" :key="item.id" :label="item.name" :name="item.id")
                        el-checkbox-group(v-model="customFlavorObj[cloudProvider]" :max="2" @change="changeFlavor" :disabled="isCheckType")
                            <!-- UCMP-566 【规格管理】同样的规格只是最后一次匹配会生效，之前的设置都会被覆盖 加判断 -->
                            el-col.margin-top(
                            v-for="(item, index) in flavorList"
                            v-if="customFlavorObjOrigin[cloudProvider] && item.flavor_id === customFlavorObjOrigin[cloudProvider][0] || !item.ecs_flavor_id"
                            :lg="8" :xl="6"
                            :key="index")
                                el-tooltip(:content="item.flavor_name + '(' + item.flavor_id + ')'" placement="left")
                                    el-checkbox.check-box.text-overflow-ellipsis(:key="item.flavor_id" :label="item.flavor_id" ) {{item.flavor_name}}({{item.flavor_id}})

            div.spec-btns
                el-button(size="small" @click="back") 返回
                el-button(v-if="!isCheckType" size="small" type="warning" @click="save" :loading="isSaving") 保存
</template>

<script>
    /**
     * @description 规格管理 - 添加/修改
     */
    import Api from '@api'
    import {mapGetters} from 'vuex'

    export default {
        name: 'EditSpecification',
        data () {
            return {
                isSaving: false,
                cloudProvider: '',
                cloudProviderList: [],
                cloudProviderListCache: {}, // 组件内缓存
                specification: {
                    name: '',
                    cpu_core_count: 1,
                    memory_size_mb: 1024,
                    desc: ''
                },
                originName: '',
                cpuRange: {
                    min: 1,
                    max: 32
                },
                memoryRange: {
                    min: 1,
                    max: 65536
                },
                flavorList: [],
                customFlavorObj: {},
                customFlavorObjOrigin: {}
            }
        },
        computed: {
            isAddType () {
                return this.$route.params.id === 'add'
            },
            // UCMP-776【规格管理】规格管理详情显示的面包屑是修改规格
            isCheckType () {
                return this.$route.query.check === '1'
            },
            breadcrumbItems () {
                return [
                    {prop: '/specification', label: '规格管理'},
                    {prop: '', label: this.isAddType ? '创建规格' : (this.isCheckType ? '规格详情' : '修改规格')}
                ]
            },
            rules () {
                return {
                    name: [
                        {required: true, message: '请输入规格名称', trigger: 'blur'},
                        {min: 3, message: '最少需要3个字符', trigger: 'blur'},
                        {
                            pattern: /^[a-zA-Z0-9\u4e00-\u9fa5][\u4e00-\u9fa5\w\-]{2,39}$/,
                            message: '支持下划线和连词符,必须以数字,字母或汉字开头',
                            trigger: 'blur'
                        },
                        {validator: this.checkNameExist, trigger: 'blur'}
                    ],
                    cpu_core_count: [
                        {
                            required: true,
                            message: '请输入CPU核数，范围1-32',
                            trigger: 'blur'
                        }
                    ],
                    memory_size_mb: [
                        {
                            required: true,
                            message: '请输入内存大小，范围1-65536MB',
                            trigger: 'blur'
                        }
                    ]
                }
            },
            ...mapGetters([
                'sysName'
            ])
        },
        methods: {
            /**
             * @description 页签切换
             */
            handleClick () {
                // 先看本地缓存是否存在
                const cacheData = this.cloudProviderListCache[this.cloudProvider]
                if (cacheData) this.flavorList = cacheData
                else this.getProviderFlavorList('', this.cloudProvider)
            },
            /**
             * @description 保存
             */
            save () {
                this.isSaving = true
                this.$refs.specForm.validate(valid => {
                    if (valid) {
                        let whichApiMethod = this.isAddType ? Api.post : Api.put

                        // payload
                        const data = {
                            id: this.specification.id,
                            name: this.specification.name,
                            cpu_core_count: this.specification.cpu_core_count,
                            memory_size_mb: this.specification.memory_size_mb,
                            desc: this.specification.desc
                        }

                        // 所有的选中id
                        data.flavor_provider_ids = []
                        Object.keys(this.customFlavorObj).forEach(item => {
                            //根据接口修改请求参数
                            if (this.customFlavorObj[item] && Array.isArray(this.customFlavorObj[item]) && this.customFlavorObj[item].length) {
                                let flavorProviderItem = {
                                    flavor_id: this.customFlavorObj[item][0],
                                    provider_id: item
                                }

                                data.flavor_provider_ids.push(flavorProviderItem)
                            }
                        })

                        // 新增 修改 call(Api) 调用了this
                        whichApiMethod.call(Api, 'specification', data).then(res => {
                            this.$message({
                                type: 'success',
                                message: this.isAddType ? '新增规格成功' : '修改规格成功'
                            })

                            this.isSaving = false

                            this.back()
                        }).catch(e => {
                            this.isSaving = false
                        })
                    } else {
                        // UCMP3-484【规格管理】创建规格，点击保存多次，可以保存多个规格
                        // 没有else在异步返回前就取消了loading状态
                        this.isSaving = false
                    }
                })
            },
            /**
             * @description 返回
             */
            back () {
                this.$router.push('/specification')
            },
            /**
             * @description 获取云厂商列表
             */
            getProviderList () {
                Api.get('provider', {}).then(res => {
                    this.cloudProviderList = res.list

                    // vmware_vsphere不需要规格，不显示
                    // UCMP-457【规格管理】规格创建界面，Vmware厂商不应该出现 可能存在多个
                    // UCMP-1435【规格管理】Netapp 和F5不应该显示在规格页面  Netapp ==> netapp, F5 ==> bigip
                    let needlesProviders = ['vmware_vsphere', 'netapp', 'bigip', 'cloudboot', 'citrix', 'juniper', 'sangfor']
                    this.cloudProviderList = this.cloudProviderList.filter(item => !needlesProviders.includes(item.provider_code))

                    // 需先初始化了custom的云厂商规格 才能分配选中列表
                    this.initCustomFlavorObj(this.cloudProviderList)
                    const id = this.$route.params.id
                    id !== 'add' && this.getDetail(id)

                    this.cloudProvider = this.cloudProviderList[0] ? this.cloudProviderList[0].id : ''
                    this.handleClick()
                })
            },
            /**
             * @description 获取云厂商规格列表
             * @params id 某个规格id
             * @params provider_id 云厂商id
             */
            getProviderFlavorList (id, provider_id) {
                Api.get('flavorProvider', {
                    id,
                    provider_id,
                    limit: 0
                }).then(res => {
                    this.flavorList = res.list
                    this.cloudProviderListCache[provider_id] = res.list
                })
            },
            /**
             * @description 获取某个规格数据
             * @param id 规格id
             */
            getDetail (id) {
                Api.get('specification', {id}).then(res => {
                    this.specification = res
                    this.originName = res.name
                    this.setCustomFlavorObj(this.customFlavorObj, this.specification.flavor_providers)

                    // 保存初始化选中，以确保在取消当前选中时选项不会消失
                    this.customFlavorObjOrigin = JSON.parse(JSON.stringify(this.customFlavorObj))
                })
            },
            /**
             * @description 组件初始化 每个厂商下的选中规格list
             * @param list 厂商列表
             */
            initCustomFlavorObj (list) {
                let data = {}
                list.forEach(item => {
                    data[item.id] = []
                })

                this.customFlavorObj = data
            },
            /**
             * @description 规格的 flavor_providers 落袋
             * @param customFlavorObj 空白的每个厂商下的选中规格list
             * @param list 规格的flavor_providers
             */
            setCustomFlavorObj (customFlavorObj, list) {
                list.forEach(item => {
                    if (customFlavorObj[item.provider_id]) customFlavorObj[item.provider_id].push(item.flavor_id)
                })
            },
            /**
             * @description 云厂商规格选中回调
             * @param val
             */
            changeFlavor (val) {
                let currentProviderFlavor = this.customFlavorObj[this.cloudProvider]

                // 机智的实现单选和可取消
                if (currentProviderFlavor.length > 1)
                    currentProviderFlavor.shift()
            },
            /**
             * @description 判断名称是否重复
             * @param rule
             * @param value
             * @param callback
             */
            checkNameExist (rule, value, callback) {
                if (this.originName && this.originName === value) {
                    callback()
                    return
                }

                const data = {name: value}

                // UCMP-499【规格管理】在规格管理界面，规格名称可以重复
                // UCMP-702【规格管理】规格管理修改名称和以前的名字重复，提示名称重复
                // 新增接口
                Api.get('specificationByName', data).then(res => {
                    if (res && res.length) callback(new Error('规格名称已存在'))
                    else callback()
                })
            }
        },
        created () {
            this.getProviderList()
        }
    }
</script>

<style lang="scss" scoped>
    .spec-content {
        height: calc(100% - 65px);
        padding: 0 16px;
        .spec-form {
            background-color: white;
            padding: 16px 0;
            .desc-form-item {
                margin-top: 16px;
            }
            .desc {
                width: 480px;
            }
        }
        .spec-flavor {
            background-color: white;
            margin-top: 16px;
            padding: 6px 12px;
            height: calc(100% - 150px - 16px - 56px);

            .el-tabs {
                height: 100%;
            }

            .check-box {
                width: 90%;
                display: inline-block;
            }
        }

        .spec-btns {
            background-color: white;
            height: 56px;
            position: fixed;
            bottom: 0;
            left: 190px;
            right: 0;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding-right: 30px;
        }

        .ucmp-icon-question {
            position: relative;
            left: 10px;
        }
    }

</style>
<style lang="scss">
    .edit-spec {
        .el-tabs__content {
            height: calc(100% - 55px);
            overflow-y: auto;
        }
    }
</style>
