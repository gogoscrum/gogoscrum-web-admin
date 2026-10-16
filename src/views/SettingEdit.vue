<template>
  <div class="setting-edit-page page">
    <div class="title">{{ $t('settingEdit.title') }}</div>
    <div class="content">
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-name">{{ $t('settingEdit.fields.allowSignup.label') }}</div>
          <div class="setting-desc">{{ $t('settingEdit.fields.allowSignup.description') }}</div>
        </div>
        <el-switch v-model="setting.allowSignup" />
      </div>
    </div>

    <div class="actions">
      <el-button type="primary" class="no-border" :loading="saving" @click="saveSettings">{{
        $t('common.save')
      }}</el-button>
    </div>
  </div>
</template>

<script>
import { settingApi } from '@/api/setting.js'
import { ElMessage } from 'element-plus'

export default {
  name: 'SettingEdit',
  data() {
    return {
      saving: false,
      setting: {
        id: null,
        allowSignup: false
      }
    }
  },
  created() {
    this.loadSetting()
  },
  methods: {
    loadSetting() {
      settingApi.getCurrent().then((res) => {
        this.setting = this.normalizeSetting(res.data)
      })
    },
    saveSettings() {
      this.saving = true
      settingApi
        .updateCurrent({
          id: this.setting.id,
          allowSignup: this.setting.allowSignup
        })
        .then((res) => {
          this.setting = this.normalizeSetting(res.data)
          ElMessage.success({
            message: this.$t('settingEdit.msg.saveSuccess')
          })
        })
        .finally(() => {
          this.saving = false
        })
    },
    normalizeSetting(setting) {
      return {
        id: setting?.id || null,
        allowSignup: setting?.allowSignup !== false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.setting-edit-page {
  .content {
    max-width: 680px;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    padding: 18px 20px;
    margin-top: 8px;
    gap: 16px;
  }

  .setting-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .setting-desc {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .actions {
    margin-top: 24px;
  }
}
</style>
