<template>
  <div class="doc-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-tag v-if="filter.creatorId" closable type="primary" @close="resetCreatorId">
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
          <el-icon v-else @click="loadDocs" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('docList.header.docCount', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('docList.header.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="docs"
        v-loading="loading"
        row-class-name="doc-row clickable"
        :show-header="true"
        @sort-change="sortChange"
        @filterChange="filterChange"
        @row-click="docClicked">
        <el-table-column
          :label="$t('docList.list.name')"
          sortable="custom"
          sort-by="name, createdTime"
          column-key="otherFlags"
          :filters="otherFlags"
          :filter-multiple="true"
          min-width="350">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.publicAccess }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <span v-html="scope.row.nameHighlightLabel || scope.row.name" />
            <el-tag v-if="scope.row.publicAccess" type="success" effect="plain" size="small" class="ml-2">{{
              $t('docList.list.public')
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.createdBy')"
          sortable="custom"
          sort-by="createdBy.nickname, createdTime"
          min-width="150">
          <template #default="scope">
            <UserMiniCard :user="scope.row.createdBy" />
          </template>
        </el-table-column>
        <el-table-column
          prop="createdTimeFormatted"
          :label="$t('common.createdTime')"
          sortable="custom"
          sort-by="createdTime"
          min-width="150">
        </el-table-column>
        <el-table-column prop="contentLengthFormatted" :label="$t('docList.list.length')" min-width="80" align="right">
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('docList.list.empty')"> </el-empty>
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
    </div>
  </div>
</template>

<script>
import { docApi } from '@/api/doc.js'
import highlight from '@/utils/highlight.js'
import utils from '@/utils/util.js'
import { filesize } from 'filesize'
import UserMiniCard from '@/components/user/UserMiniCard.vue'

export default {
  name: 'DocList',
  components: {
    UserMiniCard
  },
  data() {
    return {
      docs: [],
      filter: {
        creatorId: null,
        keyword: null,
        publicAccess: null,
        page: 1,
        pageSize: this.$store.get('docListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: false,
      otherFlags: [{ text: this.$t('docList.list.public'), value: 'PUBLIC' }]
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
  },
  mounted() {
    this.loadDocs()
  },
  methods: {
    loadDocs() {
      this.loading = true
      docApi
        .search(this.filter)
        .then((res) => {
          let results = highlight.highlight(res.data.results, this.filter.keyword, 'name')
          results.forEach((doc) => this.formatDoc(doc))
          this.docs = results
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
    formatDoc(doc) {
      doc.contentLengthFormatted = doc.content ? filesize(doc.content.length, { round: 1 }) : '--'
      return utils.formatCreateUpdateTime(doc)
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
      this.loadDocs()
    },
    pageChanged(page) {
      this.filter.page = page
      this.loadDocs()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filter.page = 1
      this.$store.set('docListPageSize', this.filter.pageSize)
      this.loadDocs()
    },
    filterChange(filters) {
      console.log('filterChange', filters)

      if (filters.otherFlags) {
        if (filters.otherFlags.includes('PUBLIC')) {
          this.filter.publicAccess = true
        } else {
          this.filter.publicAccess = null
        }
      }

      this.reloadList()
    },
    sortChange(event) {
      this.filter.orders = utils.getSortOrders(event)
      this.reloadList()
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
    docClicked(row) {
      this.$router.push({ name: 'DocView', params: { docId: row.id } })
    }
  }
}
</script>
