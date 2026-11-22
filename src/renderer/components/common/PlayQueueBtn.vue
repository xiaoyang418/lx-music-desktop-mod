<template>
  <material-popup-btn ref="popupRef" :class="variant === 'detail' ? $style.detailContent : $style.queue" @click="refresh">
    <button :class="variant === 'detail' ? $style.detailBtn : $style.btn" :aria-label="$t('play_queue')">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" :width="variant === 'detail' ? '95%' : '100%'" viewBox="0 0 24 24" space="preserve">
        <use xlink:href="#icon-play-queue" />
      </svg>
    </button>
    <template #content>
      <div :class="$style.panel">
        <div :class="$style.header">
          <span :class="$style.title">
            {{ $t('play_queue') }}
            <span v-if="queueName" :class="$style.subTitle">· {{ queueName }}</span>
          </span>
          <span :class="$style.count">{{ $t('play_queue_count', { num: list.length }) }}</span>
        </div>
        <div v-if="tempPlayList.length" :class="$style.later">
          <div :class="$style.laterTitle">{{ $t('play_queue_later') }}（{{ tempPlayList.length }}）</div>
          <div
            v-for="(item, index) in tempPlayList" :key="'temp_' + index"
            :class="$style.row"
            @click="playTemp(index)"
          >
            <span :class="$style.num">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
                <use xlink:href="#icon-play" />
              </svg>
            </span>
            <span :class="$style.name">{{ getMusicName(item.musicInfo) }}</span>
            <span :class="$style.singer">{{ getMusicSinger(item.musicInfo) }}</span>
          </div>
        </div>
        <div :class="$style.listScroll">
          <div
            v-for="(item, index) in list" :key="index"
            :class="[$style.row, { [$style.active]: isActive(index), [$style.disabled]: isDisabled(item) }]"
            @click="playAt(index)"
          >
            <span :class="$style.num">
              <svg v-if="isActive(index)" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" height="100%" viewBox="0 0 1024 1024" space="preserve">
                <use xlink:href="#icon-play" />
              </svg>
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span :class="$style.name">{{ getMusicName(item) }}</span>
            <span :class="$style.singer">{{ getMusicSinger(item) }}</span>
          </div>
          <div v-if="!list.length" :class="$style.empty">{{ $t('play_queue_empty') }}</div>
        </div>
      </div>
    </template>
  </material-popup-btn>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, withDefaults } from '@common/utils/vueTools'
import { getList } from '@renderer/store/player/action'
import { playInfo, playMusicInfo, tempPlayList } from '@renderer/store/player/state'
import { playList, playTempPlayMusic } from '@renderer/core/player'
import { userLists } from '@renderer/store/list/state'
import { LIST_IDS } from '@common/constants'

withDefaults(defineProps<{
  /**
   * bar: 主播放条样式
   * detail: 歌词页底部控制按钮样式
   */
  variant?: 'bar' | 'detail'
}>(), {
  variant: 'bar',
})

const popupRef = ref<any>(null)
const list = ref<Array<LX.Music.MusicInfo | LX.Download.ListItem>>([])

const refresh = () => {
  const listId = playInfo.playerListId
  list.value = listId ? [...getList(listId)] : []
}

const isActive = (index: number) => {
  return !playMusicInfo.isTempPlay && index === playInfo.playerPlayIndex
}

const isDisabled = (item: LX.Music.MusicInfo | LX.Download.ListItem) => {
  return 'progress' in item && !item.isComplate
}

const queueName = computed(() => {
  const listId = playInfo.playerListId
  if (!listId) return ''
  switch (listId) {
    case LIST_IDS.DEFAULT:
      return window.i18n.t('list__name_default')
    case LIST_IDS.LOVE:
      return window.i18n.t('list__name_love')
    case LIST_IDS.TEMP:
      return window.i18n.t('play_queue_temp')
    case LIST_IDS.DOWNLOAD:
      return window.i18n.t('play_queue_download')
    default:
      return userLists.find(l => l.id == listId)?.name ?? ''
  }
})

const getMusicName = (item: LX.Music.MusicInfo | LX.Download.ListItem) => {
  return 'progress' in item ? item.metadata.musicInfo.name : item.name
}
const getMusicSinger = (item: LX.Music.MusicInfo | LX.Download.ListItem) => {
  return 'progress' in item ? item.metadata.musicInfo.singer : item.singer
}

const playAt = (index: number) => {
  const listId = playInfo.playerListId
  const item = list.value[index]
  if (!listId || !item || isDisabled(item)) return
  playList(listId, index)
  popupRef.value?.hide()
}
const playTemp = (index: number) => {
  playTempPlayMusic(index)
  popupRef.value?.hide()
}

watch(() => playInfo.playerListId, refresh, { immediate: true })
watch(() => playMusicInfo.musicInfo?.id, refresh)

const handleListUpdate = () => {
  refresh()
}

onMounted(() => {
  window.app_event.on('myListUpdate', handleListUpdate)
  window.app_event.on('downloadListUpdate', handleListUpdate)
})
onBeforeUnmount(() => {
  window.app_event.off('myListUpdate', handleListUpdate)
  window.app_event.off('downloadListUpdate', handleListUpdate)
})
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.queue {
  flex: none;
  height: 100%;
}

.btn {
  position: relative;
  justify-content: center;
  align-items: center;
  transition: color @transition-normal;
  cursor: pointer;
  background-color: transparent;
  border: none;
  width: 24px;
  display: flex;
  flex-flow: column nowrap;
  padding: 0;
  // 跟随主题主色变化
  color: var(--color-primary);

  svg {
    transition: opacity @transition-fast;
    opacity: .6;
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.2));
  }
  &:hover {
    svg {
      opacity: .9;
    }
  }
  &:active {
    svg {
      opacity: 1;
    }
  }
}

// 歌词页底部控制按钮样式（与 LRC / 波形 / 评论等图标保持一致）
.detailContent {
  flex: none;
}

.detailBtn {
  opacity: .5;
  cursor: pointer;
  transition: opacity @transition-normal;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  padding: 0;
  width: 20px;
  // 跟随主题主色变化
  color: var(--color-primary);

  svg {
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.2));
  }
  &:hover {
    opacity: .9;
  }
  &:active {
    opacity: .8;
  }
}

.panel {
  display: flex;
  flex-flow: column nowrap;
  width: 340px;
  max-height: 420px;
  font-size: 13px;
  color: var(--color-font);
}

.header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 10px;
  border-bottom: 1px solid var(--color-primary-alpha-900);
}

.title {
  font-size: 14px;
  font-weight: 500;
  .mixin-ellipsis-1();
}

.subTitle {
  font-size: 12px;
  font-weight: normal;
  opacity: .7;
}

.count {
  flex: none;
  margin-left: 10px;
  font-size: 12px;
  opacity: .6;
}

.later {
  flex: none;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-primary-alpha-900);
}

.laterTitle {
  padding: 2px 8px 6px;
  font-size: 12px;
  color: var(--color-primary);
}

.listScroll {
  flex: auto;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 0;
}

.row {
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color @transition-fast;

  &:hover {
    background-color: var(--color-primary-alpha-900);
  }

  // 正在播放的歌曲：主题色底色 + 左侧主题色竖条 + 加粗
  &.active {
    color: var(--color-primary);
    background-color: var(--color-primary-alpha-700);
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 3px;
      border-radius: 0 2px 2px 0;
      background-color: var(--color-primary);
    }

    .num {
      opacity: 1;
    }
  }

  &.disabled {
    opacity: .45;
    cursor: default;

    &:hover {
      background-color: transparent;
    }
  }
}

.num {
  flex: none;
  width: 26px;
  text-align: center;
  font-size: 12px;
  opacity: .5;

  svg {
    height: 10px;
    fill: currentColor;
  }
}

.name {
  flex: 0 1 auto;
  min-width: 0;
  .mixin-ellipsis-1();
}

.singer {
  flex: 1 1 auto;
  min-width: 0;
  margin-left: 10px;
  font-size: 12px;
  opacity: .6;
  .mixin-ellipsis-1();
}

.empty {
  padding: 30px 8px;
  text-align: center;
  opacity: .5;
}
</style>
