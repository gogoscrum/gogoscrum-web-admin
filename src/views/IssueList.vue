<template>
  <div class="issue-list-page page">
    <IssueListNew
      v-if="filter"
      :issue-filter="filter"
      :columns="columns"
      :show-export-btn="false"
      :show-new-btn="false"
      @columns-changed="columnsChanged"
      @page-size-changed="pageSizeChanged">
    </IssueListNew>
  </div>
</template>
<script>
import IssueListNew from '@/components/issue/IssueListNew.vue'

export default {
  name: 'IssueList',
  components: {
    IssueListNew
  },
  data() {
    const defaultColumns = [
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

    return {
      filter: {
        keyword: null,
        projectId: null,
        creatorId: null,
        page: 1,
        pageSize: this.$store.get('issueListPageSize') || 10
      },
      columns: this.$store.get('adminIssueListColumns') || defaultColumns
    }
  },
  watch: {
    $route(to, from) {
      this.filter.projectId = to.query.projectId || null
      this.filter.creatorId = to.query.creatorId || null
    }
  },
  created() {
    this.filter.projectId = this.$route.query.projectId || null
    this.filter.creatorId = this.$route.query.creatorId || null
  },
  methods: {
    pageSizeChanged(size) {
      // Update the local store for issue list page size.
      // Don't need to handle the pagination as the IssueList component will handle it.
      this.$store.set('issueListPageSize', size)
    },
    columnsChanged(columns) {
      this.columns = columns
      this.$store.set('adminIssueListColumns', this.columns)
    }
  }
}
</script>

<style lang="less" scoped>
.issue-list-page {
}
</style>
