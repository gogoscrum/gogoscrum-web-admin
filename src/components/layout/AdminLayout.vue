<template>
  <el-container class="admin-layout-container">
    <el-aside class="left-side-bar">
      <el-menu ref="menu" :router="true" class="left-menu">
        <el-menu-item
          index="ProjectList"
          :route="{ name: 'ProjectList' }"
          :class="$route.name == 'ProjectList' ? 'menu-selected' : ''">
          <el-icon><Menu /></el-icon>
          <template #title
            ><span>{{ $t('adminLayout.menu.project') }}</span></template
          >
        </el-menu-item>
        <el-menu-item
          index="UserList"
          :route="{ name: 'UserList' }"
          :class="$route.name == 'UserList' ? 'menu-selected' : ''">
          <el-icon><User /></el-icon>
          <template #title
            ><span>{{ $t('adminLayout.menu.user') }}</span></template
          >
        </el-menu-item>
        <el-menu-item
          index="IssueList"
          :route="{ name: 'IssueList' }"
          :class="$route.name == 'IssueList' ? 'menu-selected' : ''">
          <el-icon><Files /></el-icon>
          <template #title
            ><span>{{ $t('adminLayout.menu.issue') }}</span></template
          >
        </el-menu-item>
        <el-menu-item
          index="FileList"
          :route="{ name: 'FileList' }"
          :class="$route.name == 'FileList' ? 'menu-selected' : ''">
          <el-icon><FolderOpened /></el-icon>
          <template #title
            ><span>{{ $t('adminLayout.menu.file') }}</span></template
          >
        </el-menu-item>
        <el-menu-item
          index="DocList"
          :route="{ name: 'DocList' }"
          :class="{ 'menu-selected': ['DocList', 'DocView'].includes($route.name) }">
          <el-icon><Document /></el-icon>
          <template #title
            ><span>{{ $t('adminLayout.menu.doc') }}</span></template
          >
        </el-menu-item>
        <el-menu-item
          index="SettingEdit"
          :route="{ name: 'SettingEdit' }"
          :class="$route.name == 'SettingEdit' ? 'menu-selected' : ''">
          <el-icon><Setting /></el-icon>
          <template #title
            ><span>{{ $t('adminLayout.menu.setting') }}</span></template
          >
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-content">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'AdminLayout',
  components: {},
  data() {
    return {}
  },
  created() {
    this.user = this.$store.get('user')
  },
  mounted() {
    this.autoExpandSubMenu()
  },
  methods: {
    autoExpandSubMenu() {
      let route = this.$route.name
      if (['InvitationList', 'Tags', 'Components'].includes(route)) {
        this.$refs.menu.open('more')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.admin-layout-container {
  border-top: 1px solid var(--el-border-color);
  min-height: 400px;
  height: 100%;

  .left-side-bar {
    width: 260px !important;
    border-right: 1px solid var(--el-border-color);
    padding: 20px 20px;

    .left-menu {
      border: none;
      margin-top: 8px;

      .el-menu-item {
        height: 40px;
        line-height: 40px;
        border-radius: 5px;
        font-weight: 500;
        color: var(--el-text-color-primary);

        i {
          font-weight: 500;
        }

        &.menu-selected {
          color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }
      }
    }
  }

  .main-content {
    height: 100%;
    padding: 0;
    overflow: auto;
  }
}
</style>

<style lang="less">
.admin-layout-container {
  .main-content {
    .page {
      padding: 20px 50px;
      margin-bottom: 20px;

      @media only screen and (max-width: 680px) {
        padding: 10px 10px;
      }

      .title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 36px;
        color: var(--el-text-color-primary);
      }
    }
  }

  .el-sub-menu__title {
    height: 40px;
    line-height: 40px;
    border-radius: 5px;
    font-weight: 500;
    color: var(--el-text-color-primary);

    i {
      font-weight: 500;
    }
  }
  .el-menu-item-group {
    .el-menu-item {
      padding-left: 49px !important;
      min-width: 100%;
    }

    .el-menu-item-group__title {
      padding: 0;
    }
  }
}
</style>
