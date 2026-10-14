<template>
  <div class="issue-list-container">
    <div class="filter-row">
      <div class="left-part">
        <el-tag v-if="filter.projectId" type="primary" closable @close="resetProjectId">
          {{ `${$t('common.project')} ${filter.projectId}` }}
        </el-tag>
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
          <el-icon v-else @click="loadIssues" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('issueList.header.count', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('issueList.header.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="issues"
        v-loading="loading"
        class="issue-list-table"
        row-class-name="issue-row clickable"
        :show-header="true"
        :empty-text="emptyText || $t('issueList.list.emptyMsg')"
        @sort-change="sortChange"
        @filter-change="filterChange"
        @row-click="editIssue">
        <el-table-column
          v-if="columns.includes('code')"
          :label="$t('issueList.list.code')"
          prop="code"
          sortable="custom"
          sort-by="project.code, code"
          column-key="types"
          :filters="filterColumns.includes('type') ? issueTypeFilters : null"
          :filter-multiple="true"
          width="130">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.types?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <div class="flex">
              <issue-type-icon :type="scope.row.type" />
              <div class="code">
                <span v-html="scope.row.codeHighlightLabel || scope.row.code"></span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('name')"
          :label="$t('issueList.list.name')"
          prop="name"
          :show-overflow-tooltip="false"
          sortable="custom"
          sort-by="name, project.code, code"
          min-width="380">
          <template #default="scope">
            <span v-html="scope.row.nameHighlightLabel || scope.row.name"></span>
            <span v-if="showTags && scope.row.tags?.length" class="issue-tags">
              <issue-tag v-for="tag in scope.row.tags" :key="tag.id" :tag="tag" />
            </span>
            <el-icon
              v-if="scope.row.filesCount"
              :title="$t('issueList.list.filesCount', { count: scope.row.filesCount })"
              class="items-count-icon"
              ><Paperclip
            /></el-icon>
            <el-icon
              v-if="scope.row.commentsCount"
              :title="$t('issueList.list.commentsCount', { count: scope.row.commentsCount })"
              class="items-count-icon"
              ><ChatLineRound
            /></el-icon>
            <el-icon
              v-if="scope.row.linksCount"
              :title="$t('issueList.list.linksCount', { count: scope.row.linksCount })"
              class="items-count-icon"
              ><Connection
            /></el-icon>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('projectName')"
          :label="$t('issueList.list.projectName')"
          prop="projectName"
          sortable="custom"
          sort-by="project.name, project.code, code"
          show-overflow-tooltip
          min-width="130">
        </el-table-column>
        <el-table-column
          v-if="columns.includes('sprint')"
          :label="$t('issueList.list.sprint')"
          sortable="custom"
          sort-by="sprint.id, project.code, code"
          show-overflow-tooltip
          min-width="120">
          <template #default="scope">
            <span v-if="scope.row.sprint && !scope.row.sprint.backlog">{{ scope.row.sprint.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('component')"
          :label="$t('issueList.list.component')"
          prop="componentName"
          sortable="custom"
          sort-by="component.name, project.code, code"
          show-overflow-tooltip
          min-width="130">
          <template #default="scope">
            <el-tag v-if="scope.row.componentName" effect="plain" round>
              <div class="component-tag">{{ scope.row.componentName }}</div></el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('priority')"
          :label="$t('issueList.list.priority')"
          prop="priority"
          sortable="custom"
          sort-by="priority, project.code, code"
          column-key="priorities"
          :filters="filterColumns.includes('priority') ? priorityFilters : null"
          :filter-multiple="true"
          min-width="120">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.priorities?.length }"
              ><Filter
            /></el-icon>
          </template>
          <template #default="scope">
            <priority-icon :priority="scope.row.priority" showLabel />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('storyPoints')"
          :label="$t('issueList.list.storyPoints')"
          prop="storyPoints"
          sortable="custom"
          sort-by="storyPoints, project.code, code"
          min-width="100">
          <template #default="scope">
            <story-point v-if="scope.row.storyPoints != null" :value="scope.row.storyPoints" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('status')"
          :label="$t('issueList.list.status')"
          prop="issueGroup.name"
          sortable="custom"
          sort-by="issueGroup.status, project.code, issueGroup.seq, code"
          min-width="110">
          <template #default="scope">
            <status-tag
              v-if="scope.row.issueGroup"
              :status="scope.row.issueGroup.status"
              :label="scope.row.issueGroup.label" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('creator')"
          :label="$t('common.createdBy')"
          prop="createdBy.nickname"
          sortable="custom"
          sort-by="createdBy.nickname, project.code, code"
          min-width="120">
          <template #default="scope">
            <UserMiniCard :user="scope.row.createdBy" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('createdTime')"
          prop="createdTime"
          sortable="custom"
          sort-by="createdTime, project.code, code"
          :label="$t('common.createdTime')"
          min-width="180">
          <template #default="scope">
            {{ scope.row.createdTimeFormatted }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('owner')"
          :label="$t('issueList.list.assignee')"
          prop="owner.nickname"
          sortable="custom"
          sort-by="owner.nickname, project.code, code"
          min-width="120">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.ownerIds?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <UserMiniCard :user="scope.row.owner" />
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('issueList.list.emptyMsg')"> </el-empty>
        </template>
      </el-table>
      <div class="table-footer">
        <el-pagination
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
      <IssueEdit
        v-if="editingIssue"
        :editIssueId="editingIssue.id"
        :issue="editingIssue"
        :projectId="editingIssue.projectId"
        @issueFormClosed="issueDialogClosed" />
    </div>
  </div>
</template>

<script>
import { issueApi } from '@/api/issue.js'
import utils from '@/utils/util.js'
import dict from '@/locales/zh-cn/dict.json'
import highlight from '@/utils/highlight.js'
import IssueEdit from '@/components/issue/IssueEdit.vue'
import Avatar from '@/components/common/Avatar.vue'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import IssueTypeIcon from '@/components/common/IssueTypeIcon.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import IssueTag from '@/components/common/IssueTag.vue'
import StoryPoint from '@/components/common/StoryPoint.vue'
import UserMiniCard from '@/components/user/UserMiniCard.vue'

export default {
  name: 'IssueList',
  components: {
    Avatar,
    IssueEdit,
    IssueTypeIcon,
    PriorityIcon,
    StatusTag,
    IssueTag,
    StoryPoint,
    UserMiniCard
  },
  props: {
    columns: {
      type: Array,
      default: () => [
        'code',
        'name',
        'projectName',
        'priority',
        'storyPoints',
        'status',
        'creator',
        'createdTime',
        'owner'
      ]
    },
    filterColumns: {
      type: Array,
      default: () => ['type', 'priority']
    },
    showTags: {
      type: Boolean,
      default: true
    },
    issueFilter: {
      type: Object,
      default: () => ({})
    },
    emptyText: {
      type: String,
      default: 'No issue in system'
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['pageSizeChanged', 'issueFilterChanged'],
  data() {
    return {
      currentUser: this.$store.get('user'),
      issues: [],
      filter: {
        pageSize: 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      editingIssue: null,
      issueTypeFilters: [],
      priorityFilters: []
    }
  },
  computed: {},
  watch: {
    issueFilter: {
      handler: function (newValue, oldValue) {
        this.filter = JSON.parse(JSON.stringify(newValue))
        if (!this.filter.pageSize) {
          this.filter.pageSize = 10
        }
        this.loadIssues()
      },
      deep: true
    }
  },
  created() {
    if (this.issueFilter) {
      this.filter = JSON.parse(JSON.stringify(this.issueFilter))
      if (!this.filter.pageSize) {
        this.filter.pageSize = 10
      }
    } else {
      this.filter = this.newFilter()
    }

    this.loadIssues()
    this.initColumnFilters()
  },
  mounted() {},
  methods: {
    initColumnFilters() {
      this.priorityFilters = Object.keys(dict.issuePriorities).map((key) => ({
        text: this.$t(`issuePriorities.${key}`),
        value: key
      }))

      this.issueTypeFilters = Object.keys(dict.issueTypes).map((key) => ({
        text: this.$t(`issueTypes.${key}`),
        value: key
      }))
    },
    newFilter() {
      return {
        keyword: null,
        types: [],
        priorities: [],
        page: 1,
        pageSize: 10
      }
    },
    loadIssues() {
      this.filter.createdTime = null
      this.filter.updatedTime = null
      this.filter.createdBy = null

      this.loading = true
      issueApi
        .searchIssues(this.filter)
        .then((res) => {
          this.issues = highlight.highlight(res.data.results, this.filter.keyword, 'code', 'name')
          this.issues = this.issues.map(this.formatIssue)
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages
        })
        .finally(() => {
          // Delay a little bit to improve user experience
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    formatIssue(issue) {
      utils.formatCreateUpdateTime(issue)
      return issue
    },
    sortChange(event) {
      this.filter.orders = utils.getSortOrders(event)
      this.reloadList()
    },
    filterChange(filters) {
      if (filters.types) {
        if (filters.types.length > 0) {
          this.filter.types = filters.types
        } else {
          this.filter.types = null
        }
      }

      if (filters.priorities) {
        if (filters.priorities.length > 0) {
          this.filter.priorities = filters.priorities
        } else {
          this.filter.priorities = null
        }
      }

      this.reloadList()
    },
    keywordChanged() {
      // throttle keyword input changes
      if (this.keywordChangeTimeout) {
        clearTimeout(this.keywordChangeTimeout)
      }
      this.keywordChangeTimeout = setTimeout(() => {
        this.reloadList()
      }, 500)
    },
    reloadList() {
      this.filter.page = 1
      this.loadIssues()
      this.$emit('issueFilterChanged', this.filter)
    },
    pageChanged(page) {
      this.filter.page = page
      this.loadIssues()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.reloadList()

      // Emit event to parent component
      this.$emit('pageSizeChanged', size)
    },
    resetProjectId() {
      this.filter.projectId = null
      this.reloadList()
      // remove the projectId query parameter from current url
      const { projectId, ...query } = this.$route.query
      this.$router.replace({ query })
    },
    resetCreatorId() {
      this.filter.creatorId = null
      this.reloadList()
      // remove the creatorId query parameter from current url
      const { creatorId, ...query } = this.$route.query
      this.$router.replace({ query })
    },
    resetKeyword() {
      this.filter.keyword = null
      this.reloadList()
    },
    editIssue(row) {
      this.editingIssue = row
    },
    issueDialogClosed() {
      this.editingIssue = null
    }
  }
}
</script>

<style lang="less" scoped>
.issue-list-container {
  .issue-list-table {
    .issue-row {
      .code {
        margin-left: 6px;
        font-weight: bold;
        color: var(--el-color-primary);
        white-space: nowrap;
      }

      .issue-tags {
        margin-left: 8px;
        .issue-tag {
          margin: 0 2px;
        }
      }

      .items-count-icon {
        margin-left: 4px;
        height: 16px;
        vertical-align: text-bottom;
      }
    }
  }
}
</style>
