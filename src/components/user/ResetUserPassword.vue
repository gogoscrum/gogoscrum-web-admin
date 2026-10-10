<template>
  <div class="reset-user-password-container">
    <el-dialog
      :title="$t('userList.resetPassword.dialogTitle', { nickname: user.nickname })"
      v-model="dialogVisible"
      width="480px"
      :draggable="true"
      @close="$emit('resetPasswordDialogClosed')">
      <el-form ref="resetPasswordFormRef" :model="resetPasswordForm" :rules="rules" label-width="96px">
        <el-form-item :label="$t('userList.resetPassword.newPassword')" prop="newPassword">
          <el-input
            v-model="resetPasswordForm.newPassword"
            type="password"
            show-password
            :placeholder="$t('userList.resetPassword.newPasswordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('userList.resetPassword.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="resetPasswordForm.confirmPassword"
            type="password"
            show-password
            :placeholder="$t('userList.resetPassword.confirmPasswordPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="default" class="no-border" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="default" type="primary" class="no-border" @click="submitResetPassword">{{
          $t('common.save')
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user.js'
import { ElMessage } from 'element-plus'

export default {
  name: 'ResetUserPasswordDialog',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('userList.resetPassword.msg.missingConfirmPassword')))
        return
      }
      if (value !== this.resetPasswordForm.newPassword) {
        callback(new Error(this.$t('userList.resetPassword.msg.passwordNotMatch')))
        return
      }
      callback()
    }

    return {
      dialogVisible: true,
      resetPasswordForm: {
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        newPassword: [
          {
            required: true,
            message: this.$t('userList.resetPassword.msg.missingNewPassword'),
            trigger: 'blur'
          }
        ],
        confirmPassword: [
          {
            validator: validateConfirmPassword,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    submitResetPassword() {
      this.$refs.resetPasswordFormRef.validate((valid) => {
        if (!valid) {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return
        }

        userApi
          .resetPassword(this.user.id, {
            newPassword: this.resetPasswordForm.newPassword
          })
          .then(() => {
            ElMessage.success({
              message: this.$t('userList.resetPassword.msg.resetSuccess', {
                nickname: this.user.nickname
              })
            })
            this.$emit('passwordReset')
            this.dialogVisible = false
          })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.reset-user-password-container {
}
</style>
