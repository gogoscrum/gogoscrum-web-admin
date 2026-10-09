<template>
  <div class="user-list-page page">
    <div class="filter-row">
      <div class="left-part"></div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadUsers" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{ $t('userList.header.userCount', { count: totalElements }) }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            v-model="filter.keyword"
            class="search-input"
            clearable
            prefix-icon="Search"
            :placeholder="$t('userList.header.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="users"
        v-loading="loading"
        class="user-list"
        row-class-name="user-row"
        @sort-change="sortChange"
        @filterChange="filterChange">
        <el-table-column
          prop="nickname"
          sortable="custom"
          :label="$t('userList.list.nickname')"
          column-key="userFlag"
          :filters="userFlags"
          :filter-multiple="true"
          min-width="100">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.admin || filter.enabled === false }"
              ><Filter
            /></el-icon>
          </template>
          <template #default="scope">
            <div class="flex items-center">
              <avatar :name="scope.row.nickname" :size="24" :src="scope.row.avatarUrl"></avatar>
              <span v-html="scope.row.nicknameHighlightLabel || scope.row.nickname" class="ml-2"></span>
              <el-tag v-if="scope.row.admin" type="success" effect="plain" size="small" class="ml-2">
                {{ $t('userList.list.admin') }}
              </el-tag>
              <el-tag v-if="!scope.row.enabled" type="danger" effect="plain" size="small" class="ml-2">
                {{ $t('userList.list.disabled') }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" sortable="custom" :label="$t('userList.list.username')" min-width="80">
          <template #default="scope">
            <span v-html="scope.row.usernameHighlightLabel || scope.row.username"></span>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" sortable="custom" :label="$t('common.createdTime')" min-width="80">
          <template #default="scope">
            {{ scope.row.createdTimeFormatted }}
          </template>
        </el-table-column>
        <el-table-column
          prop="lastLoginTime"
          sortable="custom"
          :label="$t('userList.list.lastLoginTime')"
          min-width="80">
          <template #default="scope">
            {{ scope.row.lastLoginTimeFormatted }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.actions')" width="80" class-name="actions-column" align="center">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    :icon="scope.row.enabled ? 'Lock' : 'Unlock'"
                    :disabled="scope.row.id === currentUser.id"
                    @click="toggleUserEnabled(scope.row)">
                    {{ getUserEnabledActionLabel(scope.row) }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    :icon="scope.row.admin ? 'User' : 'UserFilled'"
                    :disabled="scope.row.id === currentUser.id"
                    @click="toggleUserAdmin(scope.row)">
                    {{ getUserAdminActionLabel(scope.row) }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :image-size="100" :description="$t('userList.list.noUser')"></el-empty>
        </template>
      </el-table>
      <div class="table-footer">
        <el-pagination
          class="flex justify-center my-2"
          :current-page="filter.page"
          :page-count="totalPages"
          size="small"
          :page-sizes="[10, 15, 20, 25, 50]"
          :default-page-size="filter.pageSize"
          :hide-on-single-page="filter.pageSize <= 10"
          background
          layout="prev, pager, next, sizes"
          @current-change="pageChanged"
          @size-change="pageSizeChanged">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { userApi } from '@/api/user.js'
import utils from '@/utils/util.js'
import highlight from '@/utils/highlight.js'
import Avatar from '@/components/common/Avatar.vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'UserList',
  components: {
    Avatar
  },
  data() {
    return {
      currentUser: {},
      users: [],
      filter: {
        keyword: null,
        orders: [],
        page: 1,
        pageSize: this.$store.get('userListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      selectedUser: null,
      userFlags: [
        { text: this.$t('userList.list.disabled'), value: 'DISABLED' },
        { text: this.$t('userList.list.admin'), value: 'ADMIN' }
      ]
    }
  },
  created() {
    this.currentUser = this.$store.get('user')
    this.loadUsers()
  },
  beforeUnmount() {
    if (this.keywordChangeTimeout) {
      clearTimeout(this.keywordChangeTimeout)
    }
  },
  methods: {
    loadUsers() {
      this.loading = true
      userApi
        .search(this.filter)
        .then((res) => {
          this.users = highlight.highlight(res.data.results || [], this.filter.keyword, 'nickname', 'username')
          this.users.forEach((user) => this.formatUser(user))
          this.totalElements = res.data.totalElements || 0
          this.totalPages = res.data.totalPages || 0
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    formatUser(user) {
      utils.formatCreateUpdateTime(user)
      if (user.lastLoginTime) {
        user.lastLoginTimeFormatted = utils.formatDateTime(user.lastLoginTime)
      }
      return user
    },
    getUserEnabledActionLabel(user) {
      return user.enabled ? this.$t('userList.actions.disableUser') : this.$t('userList.actions.enableUser')
    },
    getUserAdminActionLabel(user) {
      return user.admin ? this.$t('userList.actions.revokeAdmin') : this.$t('userList.actions.setAdmin')
    },
    updateUserInList(updatedUser) {
      const index = this.users.findIndex((item) => item.id === updatedUser.id)

      if (index >= 0) {
        this.users.splice(index, 1, updatedUser)
      } else {
        console.warn('Updated user not found in list, id:', updatedUser.id)
      }
    },
    toggleUserEnabled(user) {
      const callApi = user.enabled ? userApi.disableUser : userApi.enableUser
      callApi(user.id).then((res) => {
        const updatedUser = this.formatUser(res.data)
        this.updateUserInList(updatedUser)

        ElMessage.success({
          message: updatedUser.enabled
            ? this.$t('userList.msg.enableSuccess', { nickname: updatedUser.nickname })
            : this.$t('userList.msg.disableSuccess', { nickname: updatedUser.nickname })
        })
      })
    },
    toggleUserAdmin(user) {
      const callApi = user.admin ? userApi.disableAdmin : userApi.enableAdmin
      callApi(user.id).then((res) => {
        const updatedUser = this.formatUser(res.data)
        this.updateUserInList(updatedUser)

        ElMessage.success({
          message: updatedUser.admin
            ? this.$t('userList.msg.setAdminSuccess', { nickname: updatedUser.nickname })
            : this.$t('userList.msg.revokeAdminSuccess', { nickname: updatedUser.nickname })
        })
      })
    },
    keywordChanged() {
      if (this.keywordChangeTimeout) {
        clearTimeout(this.keywordChangeTimeout)
      }
      this.keywordChangeTimeout = setTimeout(() => {
        this.filterChanged()
      }, 300)
    },
    sortChange(event) {
      this.filter.orders = []
      if (event.prop && event.order) {
        this.filter.orders.push({
          property: event.prop,
          direction: event.order === 'ascending' ? 'ASC' : 'DESC'
        })
      }
      this.filterChanged()
    },
    filterChanged() {
      this.filter.page = 1
      this.loadUsers()
    },
    pageChanged(page) {
      this.filter.page = page
      this.loadUsers()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('userListPageSize', this.filter.pageSize)
      this.filterChanged()
    },
    filterChange(filters) {
      console.log('filterChange', filters)

      if (filters.userFlag) {
        if (filters.userFlag.includes('DISABLED')) {
          this.filter.enabled = false
        } else {
          this.filter.enabled = null
        }

        if (filters.userFlag.includes('ADMIN')) {
          this.filter.admin = true
        } else {
          this.filter.admin = null
        }
      }

      this.filterChanged()
    }
  }
}
</script>

<style lang="less" scoped>
.user-list-page {
}
</style>
