import { LIST_IDS } from '@common/constants'
import { ref } from '@common/utils/vueTools'
import { playList } from '@renderer/core/player/action'
import { setTempList } from '@renderer/store/list/action'
import { addHistoryWord } from '@renderer/store/search/action'
// import { useI18n } from '@renderer/plugins/i18n'
// import { } from '@renderer/store/search/state'
import { search as searchMusic, listInfos, type ListInfo } from '@renderer/store/search/music'
import { assertApiSupport } from '@renderer/store/utils'

export type SearchSource = LX.OnlineSource | 'all'

export default () => {
  const listRef = ref<any>(null)

  const listInfo = ref<ListInfo>({
    page: 1,
    maxPage: 0,
    limit: 30,
    total: 0,
    list: [],
    key: null,
    noItemLabel: '',
  })

  const search = (text: string, source: SearchSource, page: number) => {
    listInfo.value = listInfos[source] as ListInfo
    if (text.length) void addHistoryWord(text)
    void searchMusic(text, page, source).then((list: LX.Music.MusicInfo[]) => {
      if (list.length) {
        setTimeout(() => {
          if (listRef.value) listRef.value.scrollToTop()
        })
      }
    })
  }

  const handlePlayList = async(index: number) => {
    const targetSong = listInfo.value.list[index]

    if (!targetSong || !assertApiSupport(targetSong.source)) return

    // 将当前页搜索结果切换为播放队列，并从当前歌曲开始播放
    await setTempList('search__current', [...listInfo.value.list] as LX.Music.MusicInfoOnline[])

    playList(LIST_IDS.TEMP, index)
  }

  return {
    listRef,
    listInfo,
    search,
    handlePlayList,
  }
}
