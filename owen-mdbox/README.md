# Owen MDBOX Updates

`update.json`은 Owen MDBOX가 업데이트 확인에 사용하는 공개 제품 매니페스트다. Windows schema v2 entry는 버전 확인 feed와 중앙 Release setup ZIP URL을 함께 제공한다. 앱은 ZIP 다운로드를 열고 사용자가 압축을 푼 뒤 setup을 실행하도록 안내한다. macOS는 electron-updater 기반 in-place 설치를 유지한다.

## 지원 피드

| 플랫폼 | 폴더 | 상태 |
| --- | --- | --- |
| Windows x64 | `windows-x64` | 0.3.40 제공 |
| macOS arm64 | `mac-arm` | 0.3.39 제공 |

버전 폴더의 파일은 게시 후 교체하지 않는다. 새 릴리즈의 artifact publish와 metadata finalize 중에는 이전 빌드를 유지한다. 새 버전으로 `update.json` pin이 성공한 직후 같은 플랫폼의 이전 버전 폴더를 제거해 제품·플랫폼별 최신 버전 하나만 유지한다.

macOS 게시 자동화는 DMG와 ZIP, 각각의 blockmap을 Git LFS artifact commit에 저장하고, `latest-mac.yml`을 별도 metadata commit에서 immutable media URL로 finalize한 다음 `update.json.platforms.mac-arm`을 세 번째 manifest commit으로 pin한다.

Windows 게시 자동화는 서명된 setup EXE, setup ZIP과 blockmap을 Git LFS artifact commit에 저장한다. metadata finalize와 schema v2 manifest pin 후 `release:sync-platforms`가 setup ZIP을 `owen-mdbox-windows-x64-<version>` 중앙 Release에 업로드한다.
