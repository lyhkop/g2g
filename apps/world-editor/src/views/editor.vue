<template>
  <div class="Editor">
    <div class="Header">
      <div class="Menu" title="菜单栏">
        <MenuView />
      </div>
      <div class="ToolBar" title="工具栏">
        <ToolBar />
      </div>
    </div>
    <div class="Body">
      <div class="Body-Left">
        <div class="Body-Left-Top">
          <div class="HierarchyWindow" title="层级结构窗口">
            <HierarchyWindow />
          </div>
          <!-- <div class="GameWindow">游戏运行窗口</div> -->
          <div class="SceneWindow" title="场景编辑窗口">
            <SceneWindow />
          </div>
        </div>
        <div class="Body-Left-Bottom">
          <div class="ProjectWindow">项目资源窗口</div>
        </div>
      </div>
      <div class="Body-Right">
        <div class="InspectorWindow" title="属性查看器">
          <InspectorWindow />
        </div>
      </div>
    </div>
    <div class="Footer">
      <div class="Statusbar">状态</div>
    </div>
  </div>
</template>

<script setup lang="ts">

import MenuView from './menu.vue'
import ToolBar from './tool-bar.vue'
import HierarchyWindow from './hierarchy-window.vue'
import InspectorWindow from './inspector-window.vue'
import SceneWindow from './scene-window.vue'

</script>

<style scoped>
.Editor {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}

.Header {
  background: rgb(25, 25, 25);
  height: 100px;
  display: flex;
  flex-direction: column;
}

.Body {
  background: rgb(94, 85, 85);
  flex-grow: 1;
  display: flex;
}

.Body-Left {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.Body-Left-Top {
  flex-grow: 1;
  display: flex;
}

.HierarchyWindow {
  width: 250px;
}

.SceneWindow {
  flex-grow: 1;
}

.Body-Left-Bottom {
  height: 300px;
}

.Body-Right {
  width: 500px;
}

.Footer {
  background: rgb(10, 10, 10);
  height: 25px;
}
</style>