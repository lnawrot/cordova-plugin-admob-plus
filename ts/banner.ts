import { AdSizeType, AdUnitIDOption, IBannerRequest } from './core'

import { AdBase, execAsync, NativeActions, TestIds } from './base'

export default class Banner extends AdBase {
  protected testIdForAndroid = TestIds.banner_android
  protected testIdForIOS = TestIds.banner_ios

  public show(opts: IBannerRequest) {
    const adUnitID = this.resolveAdUnitID(opts.id)
    return execAsync(NativeActions.banner_show, [
      {
        position: 'bottom',
        size: AdSizeType.SMART_BANNER,
        ...opts,
        adUnitID,
        id: this.state.getAdId(adUnitID),
      },
    ])
  }

  public hide(id: AdUnitIDOption) {
    const adUnitID = this.resolveAdUnitID(id)
    return execAsync(NativeActions.banner_hide, [
      { id: this.state.getAdId(adUnitID) },
    ])
  }
}
