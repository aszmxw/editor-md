<template>
  <div
    :id="id"
    class="main-editor"
  >
    <link
      href="editor.md/css/editormd.css"
      rel="stylesheet"
    />
    <link
      href="prism/prism.css"
      rel="stylesheet"
    />
    <textarea
      v-html="content"
      style="display:none;"
    ></textarea>

    <!-- 放大图片 -->
    <BigImg
      v-if="showImg"
      @clickit="showImg = false"
      :imgSrc="imgSrc"
    ></BigImg>
  </div>
</template>
<script>
import $s from 'scriptjs'
import BigImg from '@/components/EditorMd/BigImg'
export default {
  name: 'Editor',
  props: {
    content: {
      type: String,
      default: '###初始化成功'
    },
    type: {
      type: String,
      default: 'editor'
    },
    keyword: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: 'editor-md'
    },
    editorConfig: {
      type: Object,
      default() {
        return {
          path: 'editor.md/lib/',
          placeholder: '请使用 Markdown 语法',
          lineNumbers: true,      // 编辑器显示行号
          previewCodeHighlight: false,  // 关闭预览 HTML 的代码块高亮，默认开启
          height: 1000,
          taskList: true,
          tex: true, // 默认不解析
          flowChart: true, // 默认不解析
          sequenceDiagram: true, // 默认不解析
          syncScrolling: 'single',
          htmlDecode: true, // 识别和解析HTML标签
          imageUpload: true,
          imageFormats: ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'webp', 'JPG', 'JPEG', 'GIF', 'PNG', 'BMP', 'WEBP'],
          imageUploadURL: '/api/page/uploadImg',
          onload: () => {
            console.log('onload')
          },
          toolbarIcons: function () {
            // Or return editormd.toolbarModes[name]; // full, simple, mini
            // Using "||" set icons align right.
            return ['undo', 'redo', '|', 'bold', 'del', 'italic', 'quote', '|', 'toc', 'flow', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '|', 'list-ul', 'list-ol', 'hr', 'center', '|', 'link', 'reference-link', 'image', 'video', 'code', 'code-block', 'table', 'datetime', 'html-entities', 'pagebreak', '|', 'watch', 'preview', 'fullscreen', 'clear', 'search', '|', 'help', 'info']
          },
          toolbarIconsClass: {
            toc: 'fa-bars ', // 指定一个FontAawsome的图标类
            flow: 'fa-sitemap ', // 指定一个FontAawsome的图标类
            video: 'fa-file-video-o',
            center: 'fa-align-center'
          },
          // 自定义工具栏按钮的事件处理
          toolbarHandlers: {
            toc: function (cm) {
              cm.setCursor(0, 0)
              cm.replaceSelection('[TOC]\r\n\r\n')
            },
            video: function (cm, icon, cursor, selection) {
              // 替换选中文本，如果没有选中文本，则直接插入
              cm.replaceSelection(
                '\r\n<video src="http://your-site.com/your.mp4" style="width: 100%; height: 100%;" controls="controls"></video>\r\n'
              )

              // 如果当前没有选中的文本，将光标移到要输入的位置
              if (selection === '') {
                cm.setCursor(cursor.line, cursor.ch + 1)
              }
            },
            flow: function (cm, icon, cursor, selection) {
              // 替换选中文本，如果没有选中文本，则直接插入
              var text = `
\`\`\`flow
st=>start: 用户登陆
op=>operation: 登陆操作
cond=>condition: 登陆成功 Yes or No?
e=>end: 进入后台

st->op->cond
cond(yes)->e
cond(no)->op
\`\`\`
                          `
              cm.replaceSelection(text)

              // 如果当前没有选中的文本，将光标移到要输入的位置
              if (selection === '') {
                cm.setCursor(cursor.line, cursor.ch + 1)
              }
            },
            center: function (cm, icon, cursor, selection) {
              // 替换选中文本，如果没有选中文本，则直接插入
              cm.replaceSelection('<center>' + selection + '</center>')

              // 如果当前没有选中的文本，将光标移到要输入的位置
              if (selection === '') {
                cm.setCursor(cursor.line, cursor.ch + 1)
              }
            }
          },
          lang: {
            toolbar: {
              toc: '在最开头插入TOC，自动生成标题目录',
              flow: '插入思维导图',
              video: '插入视频',
              center: '居中'
            }
          },
          onchange: () => {
            this.deal_with_content()
          }
        }
      }
    }
  },
  components: {
    BigImg
  },
  data() {
    return {
      instance: null,
      showImg: false,
      imgSrc: ''
    }
  },
  computed: {},
  mounted() {
    // 加载依赖""
    $s([
      `js/jquery.min.js`,
      `prism/prism.js`,
      `editor.md/lib/raphael.min.js`,
      `editor.md/lib/flowchart.min.js`,
    ], () => {
      $s([
        `js/xss.min.js`,
        `editor.md/lib/marked.min.js`,
        `editor.md/lib/prettify.min.js`,
        `editor.md/lib/underscore.min.js`,
        `editor.md/lib/sequence-diagram.min.js`,
        `editor.md/lib/jquery.flowchart.min.js`,
      ], () => {
        $s(`editor.md/editormd.js`, () => {
          this.initEditor()
        })
      })
    }
    )
  },
  beforeDestroy() {
    // 清理所有定时器
    for (var i = 1; i < 999; i++) {
      window.clearInterval(i)
    }
    // window.removeEventListener('beforeunload', e => this.beforeunloadHandler(e))
  },
  methods: {
    initEditor() {
      this.$nextTick((editorMD = window.editormd) => {
        if (editorMD) {
          if (this.type == 'editor') {
            this.instance = editorMD(this.id, this.editorConfig)
            // 草稿
            // this.draft(); 鉴于草稿功能未完善。先停掉。
            // window.addEventListener('beforeunload', e => this.beforeunloadHandler(e));
          } else {
            this.instance = editorMD.markdownToHTML(this.id, this.editorConfig)
          }
          this.deal_with_content()
        }
      })
    },

    // 插入数据到编辑器中。插入到光标处
    insertValue(insertContent) {
      this.instance.insertValue(this.html_decode(insertContent))
    },
    // 获取编辑器内的文档内容
    getMarkdown() {
      return this.instance.getMarkdown()
    },
    editor_unwatch() {
      return this.instance.unwatch()
    },

    editor_watch() {
      return this.instance.watch()
    },
    clear() {
      return this.instance.clear()
    },

    // 草稿
    draft() {
      var that = this
      // 定时保存文本内容到localStorage
      setInterval(() => {
        localStorage.page_content = that.getMarkdown()
      }, 60000)

      // 检测是否有定时保存的内容
      var page_content = localStorage.page_content
      if (page_content && page_content.length > 0) {
        localStorage.removeItem('page_content')
        that
          .$confirm(that.$t('draft_tips'), '', {
            showClose: false
          })
          .then(() => {
            that.clear()
            that.insertValue(page_content)
            localStorage.removeItem('page_content')
          })
          .catch(() => {
            localStorage.removeItem('page_content')
          })
      }
    },
    // 关闭前提示
    beforeunloadHandler(e) {
      e = e || window.event

      // 兼容IE8和Firefox 4之前的版本
      if (e) {
        e.returnValue = '提示'
      }

      // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
      return '提示'
    },

    // 对内容做些定制化改造
    deal_with_content() {
      var that = this
      // 当表格列数过长时将自动出现滚动条
      $.each($('#' + this.id + ' table'), function () {
        $(this).prop(
          'outerHTML',
          '<div style="width: 100%;overflow-x: auto;">' +
          $(this).prop('outerHTML') +
          '</div>'
        )
      })

      // 默认超链接都在新窗口打开。但如果是本项目的页面链接，则在本窗口打开。
      $('#' + this.id + ' a[href^="http"]').click(function () {
        var url = $(this).attr('href')
        var obj = that.parseURL(url)
        if (
          window.location.hostname == obj.hostname &&
          window.location.pathname == obj.pathname
        ) {
          window.location.href = url
          if (obj.hash) {
            window.location.reload()
          }
        } else {
          window.open(url)
        }
        return false
      })


      // 获取内容总长度
      var contentWidth = $('#' + this.id + ' p').width()
      contentWidth = contentWidth || 722
      // 表格列 的宽度
      $('#' + this.id + ' table').each(function () {
        var $v = $(this).get(0) // 原生dom对象
        var num = $v.rows.item(0).cells.length // 表格的列数
        var colWidth = Math.floor(contentWidth / num) - 2
        if (num <= 5) {
          $(this)
            .find('th')
            .css('width', colWidth.toString() + 'px')
        }
      })

      // 图片点击放大
      $('#' + this.id + ' img').click(function () {
        var img_url = $(this).attr('src')
        that.showImg = true // 获取当前图片地址
        that.imgSrc = img_url
      })

      // 高亮关键字
      if (this.keyword) $('#' + this.id).mark(this.keyword)

      Prism.highlightAll()
    },

    // 转义
    html_decode(str) {
      var s = ''
      if (str.length == 0) return ''
      s = str.replace(/&gt;/g, '&')
      s = s.replace(/&lt;/g, '<')
      s = s.replace(/&gt;/g, '>')
      s = s.replace(/&nbsp;/g, ' ')
      s = s.replace(/&#39;/g, "'")
      s = s.replace(/&quot;/g, '"')
      // s = s.replace(/<br>/g, "\n");
      return s
    },

    parseURL(url) {
      var a = document.createElement('a')
      a.href = url
      // var a = new URL(url);
      return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        hostname: a.hostname,
        port: a.port,
        query: a.search,
        params: (function () {
          // eslint-disable-next-line one-var
          var params = {},
            seg = a.search.replace(/^\?/, '').split('&'),
            len = seg.length,
            p
          for (var i = 0; i < len; i++) {
            if (seg[i]) {
              p = seg[i].split('=')
              params[p[0]] = p[1]
            }
          }
          return params
        })(),
        hash: a.hash.replace('#', ''),
        // eslint-disable-next-line no-useless-escape
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        // eslint-disable-next-line no-useless-escape
        pathname: a.pathname.replace(/^([^\/])/, '/$1')
      }
    }
  }
}
</script>
