<template lang="pug">
    transition(name="el-loading-fade" @after-leave="handleAfterLeave")
        div(
            v-if="visible"
            class="leaptocloud-loading-mask"
            :style="{backgroundColor: background || ''}"
            :class="[customClass, { 'is-fullscreen': fullscreen}]"
        )
            //- 默认 loading
            div.el-loading-spinner(v-if="!spinnerCategory" )
              svg(v-if="!spinner" class="circular" viewBox="25 25 50 50")
                circle(class="path" cx="50" cy="50" r="20" fill="none")
              i(v-else :class="spinner")
              p(v-if="text" class="el-loading-text") {{ text }}
            //- 配置、设置 loading
            div.loader(v-else-if="spinnerCategory === 'config'")
                div.loader_overlay
                div.loader_cogs
                  div.loader_cogs__top
                    each val in [1, 2, 3]
                      div.top_part
                    div.top_hole
                  div.loader_cogs__left
                    each val in [1, 2, 3]
                      .left_part
                    div.left_hole
                  div.loader_cogs__bottom
                    each val in [1, 2, 3]
                      div.bottom_part
                    div.bottom_hole
                  p.text {{ text }}
</template>
<script>
export default {
    data () {
        return {
            text: null,
            spinner: 'ucmp-icon-loading',
            background: null,
            fullscreen: true,
            visible: false,
            customClass: '',
            spinnerCategory: null
        }
    },

    methods: {
        handleAfterLeave () {
          this.$emit('after-leave')
        },
        setText (text) {
          this.text = text
        }
    }
}
</script>
<style lang="scss" scoped>
/* Variables */

$pink: lighten($danger, 20%);
$blue: lighten($themeColor, 32%);
$yellow: lighten($chartCardBgOrange, 15%);
$font:'Montserrat', sans-serif;
$heading: $themeColor;

/* Mixins */

@mixin center{
  position:absolute;
  left:0;
  right:0;
  top:0;
  bottom:0;
  margin:auto;
}

@mixin hole{
  border-radius:100%;
  background:white;
  position: absolute;
}

.leaptocloud-loading-mask {
  background-color: rgba(255, 255, 255, 0.9);
  transition: opacity 0.3s;
  z-index: 2000;
  @include center;
  .text {
    color: $heading;
  }
}
.loader{
    // top: 50%;
    margin-top: -21px;
    width: 100%;
    height: 100%;
    text-align: center;
    position: absolute;
  &_overlay{
    width:150px;
    height:150px;
    background:transparent;
    box-shadow:0px 0px 0px 100px rgba(255, 255, 255, 0.67), 0px 0px 19px 0px rgba(0, 0, 0, 0.16) inset;
    border-radius:100%;
    z-index: 1001;
    @include center;
  }
  &_cogs{
    z-index: 1000;
    width:100px;
    height:100px;
    top: -120px !important;
    @include center;
    &__top{
      position:relative;
      width:100px;
      height:100px;
      transform-origin: 50px 50px;
      animation:rotate 10s infinite linear;
      @for $i from 1 through 3{
        div:nth-of-type(#{$i}){
          transform:rotate($i * 30deg)
        }
      }
      div.top_part{
        width:100px;
        border-radius:10px;
        position:absolute;
        height:100px;
        background:$pink;
      }
      div.top_hole{
        width:50px;
        height:50px;
        @include hole;
        @include center;
      }
    }
    &__left{
      position: relative;
      width: 80px;
      transform: rotate(16deg);
      top: 28px;
      transform-origin: 40px 40px;
      animation:rotate_left 10s .1s infinite reverse linear;
      left: -24px;
      height: 80px;
      @for $i from 1 through 3{
        div:nth-of-type(#{$i}){
          transform:rotate($i * 30deg)
        }
      }
      div.left_part{
        width:80px;
        border-radius:6px;
        position:absolute;
        height:80px;
        background:$blue;
      }
      div.left_hole{
        width:40px;
        height:40px;
        @include hole;
        @include center;
      }
    }
    &__bottom{
      position: relative;
      width: 60px;
      top: -65px;
      transform-origin: 30px 30px;
      animation:rotate_left 10.2s .4s infinite linear;
      transform: rotate(4deg);
      left: 79px;
      height: 60px;
      @for $i from 1 through 3{
        div:nth-of-type(#{$i}){
          transform:rotate($i * 30deg)
        }
      }
      div.bottom_part{
        width:60px;
        border-radius:5px;
        position:absolute;
        height:60px;
        background: $yellow;
      }
      div.bottom_hole{
        width:30px;
        height:30px;
        @include hole;
        @include center;
      }
    }
  }
}

/* Animations */

@keyframes rotate{
  from{transform:rotate(0deg)}
  to{transform:rotate(360deg)}
}

@keyframes rotate_left{
  from{transform:rotate(16deg)}
  to{transform:rotate(376deg)}
}

@keyframes rotate_right{
  from{transform:rotate(4deg)}
  to{transform:rotate(364deg)}
}
</style>
