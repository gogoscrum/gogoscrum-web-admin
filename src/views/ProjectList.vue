<template>
  <div class="project-list-page page">
    <div class="filter-row">
      <div class="left-part"></div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadProjects" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{ $t('projectList.header.projectCount', { count: totalElements }) }}</span>
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
          column-key="otherFlags"
          :filters="otherFlags"
          :filter-multiple="true"
          min-width="280">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.archived }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <div class="flex items-center">
              <Avatar
                :name="scope.row.name"
                :size="30"
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
        <el-table-column prop="code" sortable="custom" :label="$t('projectList.list.code')" min-width="80">
          <template #default="scope">
            <span v-html="scope.row.codeHighlightLabel || scope.row.code"></span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('projectList.list.owner')" min-width="120">
          <template #default="scope">
            <avatar
              v-if="scope.row.owner"
              :name="scope.row.owner.nickname"
              :size="24"
              :src="scope.row.owner.avatarUrl"
              showName></avatar>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" sortable="custom" :label="$t('common.createdTime')" min-width="150">
          <template #default="scope">
            {{ scope.row.createdTimeFormatted }}
          </template>
        </el-table-column>
        <el-table-column
          prop="lastIssueSeq"
          sortable="custom"
          :label="$t('projectList.list.lastIssueSeq')"
          min-width="80"
          align="right">
          <template #default="scope">
            {{ scope.row.lastIssueSeq }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fileCount"
          sortable="custom"
          :label="$t('projectList.list.fileCount')"
          min-width="80"
          align="right">
          <template #default="scope">
            {{ scope.row.fileCount }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalFileSize"
          sortable="custom"
          :label="$t('projectList.list.totalFileSize')"
          min-width="90"
          align="right">
          <template #default="scope">
            {{ scope.row.totalFileSizeFormatted }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.actions')" width="80" class-name="actions-column">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Right" @click.native="transferProject(scope.row)">{{
                    $t('projectList.list.transfer')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click.native="deleteProject(scope.$index, scope.row)">{{
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

export default {
  name: 'ProjectList',
  components: {
    TransferProjectDialog,
    Avatar
  },
  data() {
    return {
      currentUser: {},
      projects: [],
      filter: {
        keyword: null,
        global: true,
        orders: [],
        page: 1,
        pageSize: this.$store.get('projectListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      transferringProject: null,
      otherFlags: [{ text: this.$t('projectList.list.archived'), value: 'ARCHIVED' }]
    }
  },
  created() {
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
      this.loadProjects()
    },
    pageChanged(page) {
      this.filter.page = page
      this.loadProjects()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('projectListPageSize', this.filter.pageSize)
      this.filterChanged()
    },
    filterChange(filters) {
      console.log('filterChange', filters)

      if (filters.otherFlags) {
        if (filters.otherFlags.includes('ARCHIVED')) {
          this.filter.archived = true
        } else {
          this.filter.archived = null
        }
      }

      this.filterChanged()
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
    }
  }
}
</script>

<style lang="less" scoped>
.project-list-page {
  // width: 90%;
  // max-width: 960px;
  // margin: 30px auto;

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
