<template>
  <div id="app">
    <Editormd
      v-bind:content="content"
      ref="Editormd"
      type="editor"
    ></Editormd>
  </div>
</template>

<script>
// 引入组件
import Editormd from '@/components/EditorMd'

// 引入markdown文件示例
import demo from './assets/demo.md'
export default {
  name: 'App',
  components: {
    Editormd
  },
  data() {
    return {
      content: ''
    }
  },
  methods: {
    get_content() {
      // markdown内容读取，设置到content中
      this.content = demo
    }
  },
  mounted() {
    this.get_content()
  },
}
</script>

<style>
</style>
