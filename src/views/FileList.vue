<template>
  <div class="file-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-tag v-if="filter.creatorId" closable type="primary" @close="resetCreatorId">
          {{ `${$t('common.createdBy')} ${filter.creatorId}` }}
        </el-tag>
        <el-tag v-if="filter.projectId" closable type="primary" @close="resetProjectId">
          {{ `Project ${filter.projectId}` }}
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
          <el-icon v-else @click="loadFiles" class="refresh-btn">
            <Refresh />
          </el-icon>
          <column-selector
            v-model="columns"
            :available-columns="availableColumns"
            store-key="adminFileListColumns"></column-selector>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('fileList.header.count', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('fileList.header.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="files"
        v-loading="loading"
        row-class-name="file-row clickable"
        :show-header="true"
        @sort-change="sortChange"
        @filter-change="filterChange"
        @row-click="fileClicked">
        <el-table-column
          :label="$t('fileList.list.name')"
          sortable="custom"
          sort-by="name"
          min-width="400"
          class-name="icon-name-column">
          <template #default="scope">
            <div class="icon-name-container clickable">
              <div class="file-icon-outter">
                <el-image v-if="scope.row.type === 'IMAGE'" fit="contain" :src="scope.row.url" class="file-thumbnail" />
                <FileIcon v-else :type="scope.row.type" size="small" />
              </div>
              <div class="file-name-container">
                <span
                  class="file-name"
                  v-html="scope.row.nameHighlightLabel || scope.row.name"
                  :data-index="scope.$index"></span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('fileType')"
          :label="$t('fileList.list.fileType')"
          prop="fileTypeLabel"
          sortable="custom"
          column-key="fileTypes"
          :filters="fileTypeFilters"
          :filter-multiple="true"
          sort-by="type, createdTime"
          min-width="90">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.fileTypes?.length }"><Filter /></el-icon>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('targetType')"
          :label="$t('fileList.list.targetType')"
          prop="targetTypeLabel"
          sortable="custom"
          column-key="targetTypes"
          :filters="targetTypeFilters"
          :filter-multiple="true"
          sort-by="targetType, createdTime"
          min-width="120">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.targetTypes?.length }"
              ><Filter
            /></el-icon>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('creator')"
          :label="$t('common.createdBy')"
          sortable="custom"
          sort-by="createdBy.nickname, createdTime"
          min-width="150"
          class-name="owner-column">
          <template #default="scope">
            <UserMiniCard :user="scope.row.createdBy" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('createdTime')"
          prop="createdTimeFormatted"
          :label="$t('common.createdTime')"
          sortable="custom"
          sort-by="createdTime"
          min-width="180">
        </el-table-column>
        <el-table-column
          v-if="columns.includes('storage')"
          prop="storageProviderLabel"
          :label="$t('fileList.list.storage')"
          sortable="custom"
          sort-by="storageProvider, createdTime"
          min-width="100">
        </el-table-column>
        <el-table-column
          v-if="columns.includes('size')"
          prop="sizeFormatted"
          :label="$t('fileList.list.size')"
          sortable="custom"
          sort-by="size, createdTime"
          min-width="90"
          align="right">
        </el-table-column>
        <el-table-column v-if="columns.includes('actions')" :label="$t('common.actions')" width="80" align="center">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="!scope.row.folder" icon="Download" @click="downloadFile(scope.row)">{{
                    $t('common.download')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('fileList.list.empty')"> </el-empty>
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
      <el-image-viewer
        v-if="previewingImg"
        :url-list="imgPreviewSrcList"
        :infinite="false"
        :hide-on-click-modal="true"
        :initial-index="imgPreviewIndex"
        @close="closeImgPreview" />
      <el-dialog
        v-if="videoPlaying"
        v-model="videoDialogVisible"
        :title="videoPlaying?.name"
        draggable
        align-center
        width="680px"
        class="video-preview-dialog"
        @close="videoPlaying = null">
        <video v-if="videoPlaying.type == 'VIDEO'" :src="videoPlaying.url" controls class="w-full"></video>
        <audio v-else-if="videoPlaying.type == 'AUDIO'" :src="videoPlaying.url" controls class="w-full"></audio>
      </el-dialog>
      <OfficeViewer v-if="officeFile" :file="officeFile" @close="officeFile = null" />
      <PdfViewer v-if="pdfFile" :file="pdfFile" @close="pdfFile = null" />
    </div>
  </div>
</template>

<script>
import { fileApi } from '@/api/file.js'
import highlight from '@/utils/highlight.js'
import FileIcon from '@/components/common/FileIcon.vue'
import { filesize } from 'filesize'
import OfficeViewer from '@/components/common/OfficeViewer.vue'
import PdfViewer from '@/components/common/PdfViewer.vue'
import util from '@/utils/util.js'
import dict from '@/locales/zh-cn/dict.json'
import UserMiniCard from '@/components/user/UserMiniCard.vue'
import ColumnSelector from '@/components/common/ColumnSelector.vue'

export default {
  name: 'FileList',
  components: {
    FileIcon,
    OfficeViewer,
    PdfViewer,
    UserMiniCard,
    ColumnSelector
  },
  data() {
    const availableColumns = [
      { key: 'name', labelKey: 'fileList.list.name', default: true, readonly: true },
      { key: 'fileType', labelKey: 'fileList.list.fileType', default: true },
      { key: 'targetType', labelKey: 'fileList.list.targetType', default: true },
      { key: 'creator', labelKey: 'common.createdBy', default: true },
      { key: 'createdTime', labelKey: 'common.createdTime', default: true },
      { key: 'storage', labelKey: 'fileList.list.storage' },
      { key: 'size', labelKey: 'fileList.list.size', default: true },
      { key: 'actions', labelKey: 'common.actions', default: true, readonly: true }
    ]
    const defaultColumns = availableColumns.filter((column) => column.default).map((column) => column.key)

    return {
      dict: dict,
      files: [],
      imgPreviewSrcList: [],
      imgPreviewIndex: null,
      previewingImg: false,
      filter: {
        creatorId: null,
        projectId: null,
        keyword: null,
        folder: false,
        fileTypes: [],
        targetTypes: [],
        page: 1,
        pageSize: this.$store.get('fileListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      videoPlaying: null,
      videoDialogVisible: false,
      officeFile: null,
      pdfFile: null,
      columns: this.$store.get('adminFileListColumns') || defaultColumns,
      availableColumns: availableColumns,
      fileIdUrlMap: {},
      fileTypeFilters: [],
      targetTypeFilters: []
    }
  },
  watch: {
    $route(to, from) {
      this.filter.creatorId = to.query.creatorId || null
      this.filter.projectId = to.query.projectId || null
      this.reloadList()
    }
  },
  created() {
    this.filter.creatorId = this.$route.query.creatorId || null
    this.filter.projectId = this.$route.query.projectId || null
  },
  mounted() {
    this.initColumnFilters()
    this.loadFiles()
  },
  methods: {
    initColumnFilters() {
      this.fileTypeFilters = Object.keys(dict.fileTypes).map((key) => ({
        text: this.$t(`fileTypes.${key}`),
        value: key
      }))

      this.targetTypeFilters = Object.keys(dict.fileTargetTypes).map((key) => ({
        text: this.$t(`fileTargetTypes.${key}`),
        value: key
      }))
    },
    loadFiles() {
      this.loading = true
      fileApi.search(this.filter).then((res) => {
        const results = highlight.highlight(res.data.results, this.filter.keyword, 'name')
        results.forEach((file) => {
          this.formatFile(file)
        })
        this.files = results
        this.totalElements = res.data.totalElements
        this.totalPages = res.data.totalPages

        // Delay a little bit to improve user experience
        setTimeout(() => {
          this.loading = false
        }, 200)
      })
    },
    formatFile(file) {
      if (file.size) {
        file.sizeFormatted = filesize(file.size, { round: 1 })
      } else {
        file.sizeFormatted = '--'
      }

      if (file.targetType) {
        file.targetTypeLabel = this.$t('fileTargetTypes.' + file.targetType)
      }

      if (file.type) {
        file.fileTypeLabel = this.$t('fileTypes.' + file.type)
      }
      if (file.storageProvider) {
        file.storageProviderLabel = this.$t('storageProviders.' + file.storageProvider)
      }

      return util.formatCreateUpdateTime(file)
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
      this.loadFiles()
    },
    pageChanged(page) {
      this.filter.page = page
      this.loadFiles()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('fileListPageSize', this.filter.pageSize)
      this.reloadList()
    },
    sortChange(event) {
      this.filter.orders = util.getSortOrders(event)
      this.reloadList()
    },
    filterChange(filters) {
      if (filters.fileTypes) {
        if (filters.fileTypes.length > 0) {
          this.filter.fileTypes = filters.fileTypes
        } else {
          this.filter.fileTypes = null
        }
      }

      if (filters.targetTypes) {
        if (filters.targetTypes.length > 0) {
          this.filter.targetTypes = filters.targetTypes
        } else {
          this.filter.targetTypes = null
        }
      }

      this.reloadList()
    },
    fileClicked(file) {
      if (file.type === 'IMAGE') {
        this.previewImg(file)
      } else if (file.type == 'VIDEO' || file.type == 'AUDIO') {
        this.videoPlaying = file
        this.videoDialogVisible = true
      } else if (file.type == 'WORD' || file.type == 'PPT' || file.type == 'EXCEL') {
        // For Office files, we cannot preview them for now, so we download them instead
        this.downloadFile(file)
      } else if (file.type == 'PDF') {
        this.pdfFile = file
      } else {
        this.downloadFile(file)
      }
    },
    downloadFile(file) {
      fileApi.getFileBlob(file.url).then((res) => {
        util.downloadFile(res.data, file.name)
      })
    },
    previewImg(file) {
      this.initImgPreviewSrcList(file)
      this.previewingImg = true
    },
    initImgPreviewSrcList(file) {
      this.imgPreviewSrcList = []
      this.imgPreviewIndex = 0

      if (this.files?.length) {
        this.files.forEach((file) => {
          if (file.type === 'IMAGE') {
            this.imgPreviewSrcList.push(file.url)
          }
        })
      }
      this.imgPreviewIndex = this.imgPreviewSrcList.indexOf(file.url)
    },
    closeImgPreview() {
      this.previewingImg = false
    },
    resetCreatorId() {
      this.filter.creatorId = null
      this.reloadList()
      // remove the creatorId query parameter from current url
      const { creatorId, ...query } = this.$route.query
      this.$router.replace({ query })
    },
    resetProjectId() {
      this.filter.projectId = null
      this.reloadList()
      // remove the projectId query parameter from current url
      const { projectId, ...query } = this.$route.query
      this.$router.replace({ query })
    },
    resetKeyword() {
      this.filter.keyword = null
      this.reloadList()
    }
  }
}
</script>

<style lang="less" scoped>
.file-list-page {
  .file-row {
    .file-thumbnail {
      width: 32px;
      height: 32px;

      img {
        object-fit: contain;
      }
    }

    .file-name {
      line-height: 1.2;
    }
  }
}
</style>

<style lang="less">
.file-list-page {
  .file-row {
    .icon-name-column {
      padding: 5px 0;
    }
    .icon-name-container {
      display: flex;
      padding: 0 5px;
      flex-grow: 1;

      .file-icon-outter {
        height: 32px;
        margin: auto 12px auto 0;
      }

      .file-name-container {
        flex-grow: 1;
        margin: auto 0;
      }
    }
  }
}
</style>
