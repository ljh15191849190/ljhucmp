/**
 * @description Title tips when text overflow,you can set self-defined title with
 *              default value that you want to show.If you don't set value, the
 *              title is the target element's textContent value
 * @example span(v-title-tip="title tips")
 *          span(v-title-tip="") some texts
 */

// Handle event listener
const handleEventFn = (binding) => {
  return event => {
    let target = event.target
    // UCMP3-2825 根据修饰符显示不同的内容
    let title = binding.modifiers.text ? target.textContent : binding.value || target.textContent
    // Set target node title
    target.title = target.scrollWidth > target.clientWidth ? title : ''
  }
}

export default {
  bind (el, binding) {
    // Add mouseover listener
    el.addEventListener('mouseover', handleEventFn(binding))
  },
  unbind (el) {
    // Remove mouseover listener
    el.removeEventListener('mouseover', handleEventFn())
  }
}
