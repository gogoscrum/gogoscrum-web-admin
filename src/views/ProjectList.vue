<template>
  <div class="project-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-tag v-if="filter.creatorId" type="primary" closable @close="resetCreatorId">
          {{ `${$t('common.createdBy')} ${filter.creatorId}` }}
        </el-tag>
        <el-tag v-if="filter.keyword" type="primary" closable @close="resetKeyword">
          {{ `${$t('common.search')} \"${filter.keyword}\"` }}
        </el-tag>
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadProjects" class="refresh-btn">
            <Refresh />
          </el-icon>
          <column-selector
            v-model="columns"
            :available-columns="availableColumns"
            store-key="adminProjectListColumns"></column-selector>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('projectList.header.projectCount', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('projectList.header.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="projects"
        v-loading="loading"
        class="project-list"
        row-class-name="project-row"
        @sort-change="sortChange"
        @filterChange="filterChange">
        <el-table-column
          :label="$t('projectList.list.name')"
          prop="name"
          sortable="custom"
          sort-by="name, createdTime"
          column-key="otherFlags"
          :filters="otherFlags"
          :filter-multiple="true"
          min-width="360">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.archived }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <div class="flex items-center">
              <Avatar
                :name="scope.row.name"
                :size="24"
                :src="scope.row.avatarUrl"
                :rounded="false"
                class="mr-2"></Avatar>
              <div>
                <div class="flex items-center">
                  <span v-html="scope.row.nameHighlightLabel || scope.row.name" class="project-name"></span>
                  <el-tag v-if="scope.row.archived" type="warning" effect="plain" size="small" class="ml-2">
                    {{ $t('projectList.list.archived') }}
                  </el-tag>
                </div>
                <div v-if="scope.row.description" class="desc project-desc">
                  {{ scope.row.description }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('code')"
          prop="code"
          sortable="custom"
          sort-by="code, createdTime"
          :label="$t('projectList.list.code')"
          min-width="100">
          <template #default="scope">
            <span v-html="scope.row.codeHighlightLabel || scope.row.code"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('creator')"
          :label="$t('common.createdBy')"
          sortable="custom"
          sort-by="createdBy.nickname, createdTime"
          min-width="130">
          <template #default="scope">
            <UserMiniCard :user="scope.row.createdBy" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('createdTime')"
          prop="createdTime"
          sortable="custom"
          sort-by="createdTime"
          :label="$t('common.createdTime')"
          min-width="180">
          <template #default="scope">
            {{ scope.row.createdTimeFormatted }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('owner')"
          sortable="custom"
          sort-by="owner.nickname, createdTime"
          :label="$t('projectList.list.owner')"
          min-width="130">
          <template #default="scope">
            <UserMiniCard :user="scope.row.owner" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('lastIssueSeq')"
          prop="lastIssueSeq"
          sortable="custom"
          sort-by="lastIssueSeq, createdTime"
          :label="$t('projectList.list.lastIssueSeq')"
          min-width="90"
          align="right">
          <template #default="scope">
            <router-link :to="{ name: 'IssueList', query: { projectId: scope.row.id } }">
              {{ scope.row.lastIssueSeq }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('fileCount')"
          prop="fileCount"
          sortable="custom"
          sort-by="fileCount, createdTime"
          :label="$t('projectList.list.fileCount')"
          min-width="90"
          align="right">
          <template #default="scope">
            <router-link :to="{ name: 'FileList', query: { projectId: scope.row.id } }">
              {{ scope.row.fileCount }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('totalFileSize')"
          prop="totalFileSize"
          sortable="custom"
          sort-by="totalFileSize, createdTime"
          :label="$t('projectList.list.totalFileSize')"
          min-width="100"
          align="right">
          <template #default="scope">
            {{ scope.row.totalFileSizeFormatted }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('actions')"
          :label="$t('common.actions')"
          width="80"
          class-name="actions-column">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Right" @click="transferProject(scope.row)">{{
                    $t('projectList.list.transfer')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click="deleteProject(scope.$index, scope.row)">{{
                    $t('common.delete')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('projectList.list.noProject')"> </el-empty>
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
    <transfer-project-dialog
      v-if="transferringProject"
      :projectId="transferringProject.id"
      @transferDialogClosed="transferDialogClosed"
      @projectSaved="projectSaved" />
  </div>
</template>

<script>
import { projectApi } from '@/api/project.js'
import utils from '@/utils/util.js'
import highlight from '@/utils/highlight.js'
import TransferProjectDialog from '@/components/project/TransferProject.vue'
import Avatar from '@/components/common/Avatar.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { filesize } from 'filesize'
import UserMiniCard from '@/components/user/UserMiniCard.vue'
import ColumnSelector from '@/components/common/ColumnSelector.vue'

export default {
  name: 'ProjectList',
  components: {
    TransferProjectDialog,
    Avatar,
    UserMiniCard,
    ColumnSelector
  },
  data() {
    const availableColumns = [
      { key: 'name', labelKey: 'projectList.list.name', default: true, readonly: true },
      { key: 'code', labelKey: 'projectList.list.code', default: true },
      { key: 'creator', labelKey: 'common.createdBy', default: true },
      { key: 'createdTime', labelKey: 'common.createdTime', default: true },
      { key: 'owner', labelKey: 'projectList.list.owner' },
      { key: 'lastIssueSeq', labelKey: 'projectList.list.lastIssueSeq' },
      { key: 'fileCount', labelKey: 'projectList.list.fileCount' },
      { key: 'totalFileSize', labelKey: 'projectList.list.totalFileSize' },
      { key: 'actions', labelKey: 'common.actions', default: true, readonly: true }
    ]
    const defaultColumns = availableColumns.filter((column) => column.default).map((column) => column.key)

    return {
      currentUser: {},
      projects: [],
      filter: {
        creatorId: null,
        keyword: null,
        global: true,
        orders: [],
        page: 1,
        pageSize: this.$store.get('adminProjectListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      transferringProject: null,
      otherFlags: [{ text: this.$t('projectList.list.archived'), value: 'ARCHIVED' }],
      columns: this.$store.get('adminProjectListColumns') || defaultColumns,
      availableColumns: availableColumns
    }
  },
  watch: {
    $route(to, from) {
      this.filter.creatorId = to.query.creatorId || null
      this.reloadList()
    }
  },
  created() {
    this.filter.creatorId = this.$route.query.creatorId || null
    this.currentUser = this.$store.get('user')
    this.loadProjects()
  },
  mounted() {},
  methods: {
    loadProjects() {
      this.loading = true
      projectApi
        .search(this.filter)
        .then((res) => {
          this.projects = highlight.highlight(res.data.results, this.filter.keyword, 'code', 'name')
          this.projects.forEach((project) => this.formatProject(project))
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    formatProject(project) {
      if (!project.lastIssueSeq || project.lastIssueSeq == 0) {
        project.lastIssueSeq = ''
      }

      if (!project.fileCount || project.fileCount == 0) {
        project.fileCount = ''
      }

      if (!project.totalFileSize || project.totalFileSize == 0) {
        project.totalFileSizeFormatted = ''
      } else {
        project.totalFileSizeFormatted = filesize(project.totalFileSize, { round: 1 })
      }

      utils.formatCreateUpdateTime(project)
      return project
    },
    keywordChanged() {
      // Throttle the keyword change event to avoid too many requests when user is typing
      if (this.keywordChangeTimeout) {
        clearTimeout(this.keywordChangeTimeout)
      }
      this.keywordChangeTimeout = setTimeout(() => {
        this.reloadList()
      }, 500)
    },
    sortChange(event) {
      this.filter.orders = utils.getSortOrders(event)
      this.reloadList()
    },
    reloadList() {
      this.filter.page = 1
      this.loadProjects()
    },
    pageChanged(page) {
      this.filter.page = page
      this.loadProjects()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('adminProjectListPageSize', this.filter.pageSize)
      this.reloadList()
    },
    filterChange(filters) {
      if (filters.otherFlags) {
        if (filters.otherFlags.includes('ARCHIVED')) {
          this.filter.archived = true
        } else {
          this.filter.archived = null
        }
      }

      this.reloadList()
    },
    transferProject(row) {
      this.transferringProject = row
    },
    transferDialogClosed() {
      this.transferringProject = null
    },
    projectSaved(project) {
      project = this.formatProject(project)
      let index = utils.indexInArray(this.projects, project.id)

      if (index >= 0) {
        this.projects.splice(index, 1, project)
      } else {
        this.projects.unshift(project)
      }
    },
    projectDeleted(project) {
      let index = utils.indexInArray(this.projects, project.id)

      if (index >= 0) {
        this.projects.splice(index, 1)
        this.totalElements--
      }
    },
    deleteProject: function (index, row) {
      ElMessageBox.confirm(
        this.$t('projectList.msg.delConfirmMsg', { projectName: row.name }),
        this.$t('projectList.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          projectApi.delete(row.id).then((res) => {
            ElMessage.success({
              message: this.$t('projectList.msg.delSuccess', {
                projectName: row.name
              })
            })
            this.projectDeleted(row)
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    },
    resetKeyword() {
      this.filter.keyword = null
      this.reloadList()
    },
    resetKeyword() {
      this.filter.keyword = null
      this.reloadList()
    },
    resetCreatorId() {
      this.filter.creatorId = null
      this.reloadList()
      // remove the creatorId query parameter from current url
      const { creatorId, ...query } = this.$route.query
      this.$router.replace({ query })
    }
  }
}
</script>

<style lang="less" scoped>
.project-list-page {
  .project-list {
    .project-row {
      .project-name {
        font-size: 15px;
        font-weight: 500;
      }

      .project-desc {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 40vw;
      }
    }
  }
}
</style>
