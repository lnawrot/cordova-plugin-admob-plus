import glob from 'fast-glob'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import replace from 'replace-in-file'

const warnMessage =
  'THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.'

/* tslint:disable:object-literal-sort-keys */
const Actions: { [index: string]: string } = {
  ready: 'ready',
  set_app_muted: 'set_app_muted',
  set_app_volume: 'set_app_volume',
  // banner
  banner_show: 'banner_show',
  banner_hide: 'banner_hide',
  // interstitial
  interstitial_is_loaded: 'interstitial_is_loaded',
  interstitial_load: 'interstitial_load',
  interstitial_show: 'interstitial_show',
  // reward_video
  reward_video_is_ready: 'reward_video_is_ready',
  reward_video_load: 'reward_video_load',
  reward_video_show: 'reward_video_show',

  // consent
  tracking_status_get: 'tracking_status_get',
  tracking_alert_show: 'tracking_alert_show',
}

const Events: { [index: string]: string } = {
  ready: 'admob.ready',
  // banner
  banner_load: 'admob.banner.load',
  banner_load_fail: 'admob.banner.load_fail',
  banner_open: 'admob.banner.open',
  banner_close: 'admob.banner.close',
  banner_exit_app: 'admob.banner.exit_app',
  banner_impression: 'admob.banner.impression',
  banner_click: 'admob.banner.click',
  // interstitial
  interstitial_load: 'admob.interstitial.load',
  interstitial_load_fail: 'admob.interstitial.load_fail',
  interstitial_open: 'admob.interstitial.open',
  interstitial_close: 'admob.interstitial.close',
  interstitial_exit_app: 'admob.interstitial.exit_app',
  interstitial_impression: 'admob.interstitial.impression',
  interstitial_click: 'admob.interstitial.click',
  // reward_video
  reward_video_load: 'admob.reward_video.load',
  reward_video_load_fail: 'admob.reward_video.load_fail',
  reward_video_open: 'admob.reward_video.open',
  reward_video_close: 'admob.reward_video.close',
  reward_video_start: 'admob.reward_video.start',
  reward_video_complete: 'admob.reward_video.complete',
  reward_video_reward: 'admob.reward_video.reward',
  reward_video_exit_app: 'admob.reward_video.exit_app',
  reward_video_impression: 'admob.reward_video.impression',
  reward_video_click: 'admob.reward_video.click',
}
/* tslint:enable:object-literal-sort-keys */

const AdSizeTypes = [
  'BANNER',
  'LARGE_BANNER',
  'MEDIUM_RECTANGLE',
  'FULL_BANNER',
  'LEADERBOARD',
  'SMART_BANNER',
]

function buildActionsJava(): string {
  const linesActions = Object.keys(Actions)
    .map(k => `    static final String ${k.toUpperCase()} = "${Actions[k]}";`)
    .sort()
    .join('\n')

  return `// ${warnMessage}
package admob.plugin;

final class Actions {
${linesActions}
}
`
}

function buildEventsJava(): string {
  const linesEvents = Object.keys(Events)
    .map(
      k => `    public static final String ${k.toUpperCase()} = "${Events[k]}";`,
    )
    .sort()
    .join('\n')

  return `// ${warnMessage}
package admob.plugin;

public final class Events {
${linesEvents}
}
`
}

function buildAdSizeTypeJava(): string {
  return `// ${warnMessage}
package admob.plugin;

import com.google.android.gms.ads.AdSize;

public enum AdSizeType {
    ${AdSizeTypes.map(s => `${s}`).join(', ')};

    public static AdSize getAdSize(Object adSize) {
${AdSizeTypes.map(
  s => `      if (AdSizeType.${s}.equals(adSize)) {
          return AdSize.${s};
      }`,
).join('\n')}
      return null;
    }
}
`
}

function buildConstantsSwift(): string {
  const linesEvents = Object.keys(Events)
    .map(k => `    static let ${_.camelCase(k)} = "${Events[k]}"`)
    .sort()
    .join('\n')

  return `// ${warnMessage}
struct AMSEvents {
${linesEvents}
}
`
}

function buildConstantsTs(): string {
  const linesActions = Object.keys(Actions)
    .map(k => `  ${k} = '${Actions[k]}',`)
    .sort()
    .join('\n')

  const linesEvents = Object.keys(Events)
    .map(k => `  ${k} = '${Events[k]}',`)
    .sort()
    .join('\n')

  const adSizeType = AdSizeTypes.map(s => `  ${s},`).join('\n')

  return `// ${warnMessage}
export enum NativeActions {
  Service = 'AdMob',
${linesActions}
}

export enum Events {
${linesEvents}
}

export enum AdSizeType {
${adSizeType}
}
`
}

async function updateConfigXML() {
  const [androidFiles, iosFiles] = await Promise.all([
    glob(['**/*.java'], { cwd: path.join(__dirname, '../src/android') }),
    glob(['*.swift'], { cwd: path.join(__dirname, '../src/ios') }),
  ])
  const androidContent = androidFiles
    .map(s => {
      let d = path.dirname(s.toString())
      if (d === '.') {
        d = ''
      } else {
        d = `/${d}`
      }
      return `        <source-file src="src/android/${s}" target-dir="src/admob/plugin${d}" />`
    })
    .sort()
    .join('\n')
  const iosContent = iosFiles
    .map(s => `        <source-file src="src/ios/${s}" />`)
    .sort()
    .join('\n')
  await replace({
    files: [path.join(__dirname, '../plugin.xml')],
    // tslint:disable-next-line:max-line-length
    from: /([\s\S]*ANDROID_BEGIN -->\n)[\s\S]*(\n\s+<!-- AUTOGENERATED: ANDROID_END[\s\S]*IOS_BEGIN -->\n)[\s\S]*(\n\s+<!-- AUTOGENERATED: IOS_END[\s\S]*)/,
    to: `$1${androidContent}$2${iosContent}$3`,
  })
}

async function main() {
  const l = [
    { filepath: 'src/android/AdSizeType.java', f: buildAdSizeTypeJava },
    { filepath: 'src/android/Actions.java', f: buildActionsJava },
    { filepath: 'src/android/Events.java', f: buildEventsJava },
    { filepath: 'src/ios/AMSConstants.swift', f: buildConstantsSwift },
    { filepath: 'ts/constants.ts', f: buildConstantsTs },
  ]
  await Promise.all(
    l.map(({ filepath, f }) =>
      fs.promises.writeFile(path.join(__dirname, '..', filepath), f(), 'utf8'),
    ),
  )

  await updateConfigXML()
}

main()
