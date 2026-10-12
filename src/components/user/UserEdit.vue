<template>
  <div class="user-edit-container">
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="480px"
      :draggable="true"
      @close="$emit('userEditDialogClosed')">
      <el-form ref="userEditFormRef" :model="userEditForm" :rules="rules" label-width="130px">
        <el-form-item :label="$t('userList.userEdit.username')" prop="username">
          <el-input
            v-model="userEditForm.username"
            :disabled="isResetPasswordMode"
            clearable
            :placeholder="$t('userList.userEdit.usernamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('userList.userEdit.newPassword')" prop="newPassword">
          <el-input
            v-model="userEditForm.newPassword"
            type="password"
            show-password
            clearable
            :placeholder="$t('userList.userEdit.newPasswordPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('userList.userEdit.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="userEditForm.confirmPassword"
            type="password"
            show-password
            clearable
            :placeholder="$t('userList.userEdit.confirmPasswordPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="default" class="no-border" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="default" type="primary" class="no-border" @click="submitUserForm">{{
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
  name: 'UserEditDialog',
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('userList.userEdit.msg.missingConfirmPassword')))
        return
      }
      if (value !== this.userEditForm.newPassword) {
        callback(new Error(this.$t('userList.userEdit.msg.passwordNotMatch')))
        return
      }
      callback()
    }

    return {
      dialogVisible: true,
      userEditForm: {
        username: this.user?.username || '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        username: [
          {
            required: true,
            message: this.$t('userList.userEdit.msg.missingUsername'),
            trigger: 'blur'
          }
        ],
        newPassword: [
          {
            required: true,
            message: this.$t('userList.userEdit.msg.missingNewPassword'),
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
  computed: {
    editingUserId() {
      return this.user?.id || this.user?.userId || null
    },
    isResetPasswordMode() {
      return !!this.editingUserId
    },
    dialogTitle() {
      if (this.isResetPasswordMode) {
        return this.$t('userList.userEdit.resetDialogTitle', { nickname: this.user?.nickname || '' })
      }
      return this.$t('userList.userEdit.createDialogTitle')
    }
  },
  methods: {
    submitUserForm() {
      this.$refs.userEditFormRef.validate((valid) => {
        if (!valid) {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return
        }

        if (this.isResetPasswordMode) {
          this.resetUserPassword()
        } else {
          this.createUser()
        }
      })
    },
    createUser() {
      userApi
        .create({
          username: this.userEditForm.username,
          password: this.userEditForm.newPassword
        })
        .then((res) => {
          ElMessage.success({
            message: this.$t('userList.userEdit.msg.createSuccess', {
              username: this.userEditForm.username
            })
          })
          this.$emit('userSaved', { user: res.data })
          this.dialogVisible = false
        })
    },
    resetUserPassword() {
      userApi
        .resetPassword(this.editingUserId, {
          newPassword: this.userEditForm.newPassword
        })
        .then((res) => {
          ElMessage.success({
            message: this.$t('userList.userEdit.msg.resetSuccess', {
              nickname: this.user?.nickname || this.user?.username || ''
            })
          })
          this.$emit('userSaved', { user: res.data })
          this.dialogVisible = false
        })
    }
  }
}
</script>

<style lang="less" scoped>
.user-edit-container {
}
</style>
