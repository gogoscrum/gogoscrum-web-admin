import store from '@/modules/store'
import { i18n } from '@/modules/i18n.js'
import dayjs from 'dayjs'
import router from '@/router'

const indexInArray = function (objects, objectId) {
  return objects.findIndex((object) => object.id === objectId)
}

const getLang = () => {
  let lang = ''
  if (navigator.languages != undefined) {
    lang = navigator.languages[0]
  } else {
    lang = navigator.language
  }
  if (lang.startsWith('zh')) {
    return 'cn'
  } else {
    return 'en'
  }
}

const changeMetaForI18n = () => {
  let descElement = document.querySelector('head meta[name="description"]')
  let keywordsElement = document.querySelector('head meta[name="keywords"]')
  descElement.setAttribute('content', i18n.global.t('meta.description'))
  keywordsElement.setAttribute('content', i18n.global.t('meta.keywords'))
  document.title = i18n.global.t('meta.title')
}

const downloadFile = (fileBlob, fileName) => {
  const blob = new Blob([fileBlob], {
    type: 'application/x-download;charset=UTF-8'
  })
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, fileName)
  } else {
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = href
    a.download = fileName
    a.click()
    URL.revokeObjectURL(a.href)
  }
}

const isInMobile = () => {
  return window.screen.width <= 768
}

const isMac = () => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
}

const getCtrlKey = () => {
  return isMac() ? '⌘' : 'Ctrl'
}

const formatDateTime = (value) => {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const formatCreateUpdateTime = (entity) => {
  if (entity.createdTime) {
    entity.createdTimeFormatted = formatDateTime(entity.createdTime)
  }

  if (entity.updatedTime) {
    entity.updatedTimeFormatted = formatDateTime(entity.updatedTime)
  }
  return entity
}

const afterLogin = (user) => {
  store.set('user', user)
  // store.setx('remember_me', true, 60 * 60 * 24 * 10)

  const lastUrl = localStorage.getItem('lastUrl')

  if (lastUrl && lastUrl.indexOf('login') === -1) {
    localStorage.removeItem('lastUrl')
    router.push({ path: lastUrl })
  } else {
    router.push({ name: 'Homepage' })
  }
}

const getSortOrders = (event) => {
  console.log('table sorting event:', event)

  if (!event.column.sortBy) {
    console.error('Column sort-by value not set', event)
  } else if (event.order) {
    // Support multi-column sorting by allowing comma-separated sortBy values, e.g. "project.code, code"
    return event.column.sortBy.split(',').map((s) => {
      return {
        property: s.trim(),
        direction: event.order === 'ascending' ? 'ASC' : 'DESC'
      }
    })
  }
}

export default {
  indexInArray,
  getLang,
  changeMetaForI18n,
  isInMobile,
  isMac,
  getCtrlKey,
  downloadFile,
  formatDateTime,
  formatCreateUpdateTime,
  afterLogin,
  getSortOrders
}
