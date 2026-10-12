<template>
  <el-container class="base-layout-container">
    <el-header class="layout-header">
      <div class="logo-container">
        <router-link :to="{ name: 'Homepage' }">
          <img v-show="darkMode" src="/src/assets/images/logo-white.png" class="logo" />
          <img v-show="!darkMode" src="/src/assets/images/logo-black.png" class="logo" />
        </router-link>
        <span>管理后台</span>
      </div>

      <div class="links-container">
        <div v-if="currentUser" class="dark-mode-switch">
          <el-switch
            v-model="darkMode"
            inline-prompt
            size="small"
            active-icon="Moon"
            inactive-icon="Sunny"
            @change="toggleDark" />
        </div>
        <LanguageSelector class="link-item" @languageChanged="languageChanged" />
        <el-dropdown v-if="currentUser" trigger="click" @command="userDropCommand">
          <div class="link-item current-user-info">
            <avatar :name="currentUser.nickname" :src="currentUser.avatar?.url" :size="20" showName />
            <el-icon class="ml-1"><CaretBottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="Logout" icon="SwitchButton">
                {{ $t('baseLayout.header.signout') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="layout-body">
      <router-view :key="$route.fullPath" />
    </el-main>
    <el-footer v-if="!currentUser" class="footer">
      <div class="copy-right-row">
        <span>{{ $t('baseLayout.footer.company') }}</span>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import utils from '@/utils/util'
import LanguageSelector from '@/components/common/LanguageSelector.vue'
import Avatar from '@/components/common/Avatar.vue'

export default {
  name: 'PublicLayout',
  components: {
    LanguageSelector,
    Avatar
  },
  data() {
    return {
      lang: localStorage['locale'] || utils.getLang(),
      currentUser: this.$store.get('user'),
      darkMode: this.$store.get('darkMode') || false
    }
  },
  watch: {},
  created() {},
  mounted() {
    if (this.darkMode) {
      this.toggleDark()
    }

    this.$bus.$on('logout', () => {
      this.currentUser = null
    })

    this.$bus.$on('login', () => {
      this.currentUser = this.$store.get('user')
    })
  },
  methods: {
    languageChanged(lang) {
      this.lang = lang
    },
    toggleDark() {
      this.$store.set('darkMode', this.darkMode)
      if (this.darkMode) {
        document.querySelector('html').classList.add('dark')
      } else {
        document.querySelector('html').classList.remove('dark')
      }
    },
    userDropCommand(command) {
      this.$router.push({ name: command })
    }
  }
}
</script>

<style lang="less" scoped>
.base-layout-container {
  height: 100vh;

  .layout-header {
    height: 48px;
    padding: 3px 12px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    background-color: #ffffff;

    .logo-container {
      display: flex;
      font-size: 16px;
      font-weight: bold;
      line-height: 1;

      .logo {
        height: 24px;
        margin-right: 10px;
      }
    }

    .links-container {
      display: flex;
      align-items: center;
      align-content: center;

      @media only screen and (max-width: 520px) {
        margin: 0 auto;
      }

      .dark-mode-switch {
        margin-right: 24px;
      }

      .link-item {
        font-size: 16px;
        font-weight: bold;
        padding: 3px 12px;
        border-radius: 5px;
        margin-left: 10px;
        cursor: pointer;

        &:hover {
          background-color: var(--el-color-primary-light-9);
        }
      }

      .current-user-info {
        display: flex;
        font-size: unset;
        font-weight: unset;
        align-items: center;
      }
    }
  }

  .layout-body {
    padding: 0;
    min-height: calc(100vh - 100px);
  }

  .footer {
    justify-content: center;
    text-align: center;
    font-size: 12px;
    color: #cccccc;
    font-weight: bold;
    margin: 10px 0;
    height: unset;

    .copy-right-row {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
