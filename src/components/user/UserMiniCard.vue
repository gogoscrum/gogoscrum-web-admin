<template>
  <div v-if="user" class="user-mini-card-container">
    <el-tooltip placement="right" :teleported="true" popper-class="user-mini-card-popper">
      <template #content>
        <div class="icons-container">
          <router-link :to="{ name: 'UserList', query: { userId: user.id } }" replace>
            <el-icon :title="$t('userMiniCard.details')"><User /></el-icon>
          </router-link>
          <router-link :to="{ name: 'ProjectList', query: { creatorId: user.id } }">
            <el-icon :title="$t('userMiniCard.projects')"><Menu /></el-icon>
          </router-link>
          <router-link :to="{ name: 'IssueList', query: { creatorId: user.id } }">
            <el-icon :title="$t('userMiniCard.issues')"><Files /></el-icon>
          </router-link>
          <router-link :to="{ name: 'FileList', query: { creatorId: user.id } }">
            <el-icon :title="$t('userMiniCard.files')"><FolderOpened /></el-icon>
          </router-link>
          <router-link :to="{ name: 'DocList', query: { creatorId: user.id } }">
            <el-icon :title="$t('userMiniCard.docs')"><Document /></el-icon>
          </router-link>
        </div>
      </template>
      <template #default>
        <div class="flex items-center">
          <Avatar
            :name="user.nickname"
            :fancy-name="user.nicknameHighlightLabel"
            :size="24"
            :src="user.avatarUrl"
            showName></Avatar>
          <img
            v-if="user.enabled === false"
            src="/src/assets/images/user-banned.png"
            class="user-banned-icon"
            :title="$t('userMiniCard.disabled')" />
        </div>
      </template>
    </el-tooltip>
  </div>
</template>

<script>
import Avatar from '@/components/common/Avatar.vue'

export default {
  name: 'UserMiniCard',
  components: {
    Avatar
  },
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  computed: {},
  data() {
    return {}
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.user-mini-card-container {
  display: flex;
  align-items: center;

  .nickname {
    color: var(--el-color-primary);
  }

  .user-banned-icon {
    margin-left: 5px;
    height: 16px;
  }
}

.user-mini-card-popper {
  .icons-container {
    margin-top: 4px;
    display: flex;
    justify-content: space-between;

    > * {
      font-size: 17px;
      padding: 0 5px;
      cursor: pointer;
      color: #eeeeee;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
