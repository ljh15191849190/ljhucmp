<template lang="pug">
  div.portal-container.position-relative
    div.portal-container.center-vertical.login-container
        el-form.login-form(ref="loginForm" :model="loginForm" :rules="rules" @keyup.enter.native="submitForm")
            el-form-item.welcome
                label 欢迎登陆
            el-form-item(prop="name")
                el-input(v-model="loginForm.username" placeholder="您的账号" prefix-icon="portal-icon-user" sise="mini")
            el-form-item(prop="password")
                el-input(v-model="loginForm.password" type="password" placeholder="您的密码" prefix-icon="portal-icon-password" sise="mini")
            el-form-item(prop="domain_id")
                el-select.user-type(placeholder="请选择用户来源" sise="mini" v-model="loginForm.domain_id" )
                    el-option(v-for="item in domains" :key="item.id" :value="item.id" :label="item.name")
            el-form-item
                el-button.user-type(type="primary" @click="submitForm" :disabled="disabled") 登录
        // GaugeChart.gauge-chart-login(:value="value" :range="range" :needleVal="needleVal" :zoons="zoons" :title="title" unit="%" )
        // el-button(@click="addNeedleVal") 改变仪表盘
        // el-button(@click="subNeedleVal") 改变仪表盘
</template>
<script>
import Api from '@api'
import GaugeChart from '@/components/common/charts/GaugeChart'

export default {
  data () {
    return {
        loginForm: {
            username: null,
            password: '',
            domain_id: ''
        },
        domains: [],
        disabled: false,
        rules: {
            username: [
                {required: true, message: '请输入您的账号', trigger: 'blur'}
            ],
            password: [
                {required: true, message: '请输入您的密码', trigger: 'blur'}
            ],
            domain_id: [
                {required: true, message: '请选择用户来源', trigger: 'change'}
            ]
        },
        value: 10,
        range: [90, 270],
        needleVal: 80,
        zoons: [
            { from: 0, to: 30, color: '#29a460' },
            { from: 30, to: 80, color: '#bd7d00' },
            { from: 80, to: 100, color: '#b3323c' }
        ],
        title: 'helloMR.W'
    }
  },
  methods: {
    submitForm () {
        this.$refs.loginForm.validate(valid => {
            if (valid) {
                Api.post('login', this.loginForm).then(res => {
                    if (res.data) {
                        let data = res.data
                        this.$notify({
                            type: 'success',
                            message: '登录成功,欢迎进入!'
                        })
                        localStorage.setItem('domainId', this.loginForm.domain_id)
                        localStorage.setItem('systemUserName', this.loginForm.username)
                        localStorage.setItem('tenant', data.login_project_id)
                        localStorage.setItem('userId', data.user_id)
                        this.$router.push('/dashboard')
                    } else {
                        this.$notify({
                            type: 'error',
                            message: '用户账号或者密码错误!'
                        })
                    }
                })
            }
        })
    },

    addNeedleVal () {
        this.needleVal += 5
    },

    subNeedleVal () {
        this.needleVal -= 1
    }
  },
  created () {
      this.domains = [
          {
              'description': 'The default domain',
              'enabled': true,
              'id': 'default',
              'links': {'self': 'http://192.168.3.124:35357/v3/domains/default'},
              'name': 'Default'
          },
          {
              'description': 'My domain',
              'enabled': true,
              'id': '2cf2952e868a41a18a2fa9cdd0268990',
              'links': {'self': 'http://192.168.3.124:35357/v3/domains/2cf2952e868a41a18a2fa9cdd0268990'},
              'name': 'guardian'
          }, {
              'description': 'My domain',
              'enabled': true,
              'id': '39c4ab7a91474111bddfd3e160e5a361',
              'links': {'self': 'http://192.168.3.124:35357/v3/domains/39c4ab7a91474111bddfd3e160e5a361'},
              'name': 'leaptocloud'
          }, {
              'id': 'ff319785d21a43d3b8cc0bb7768b65c5',
              'name': 'XenTest'
          }
      ]
      this.loginForm.domain_id = this.domains[0].id
  },

  components: {
    GaugeChart
  }
}
</script>
<style lang="scss" scoped>
.login-container {
    background: #fff;
    font-size: 12px;
    border-radius: 5px;
    height: 330px;
    width: 400px;
}
.login-form {
    padding: 15px;
}
.user-type {
    width: 100%;
}
.welcome {
    text-align: center;
    label {
        font-size: 25px;
    // margin: 15px 0;
        color: #37a6ff;
    }
}
.bg-image {
    position: absolute;
    opacity: 0.78;
}
.gauge-chart-login {
    width: 400px;
    height: 300px;
}
</style>

