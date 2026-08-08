# Owen MDBOX Updates

`update.json`은 Owen MDBOX가 업데이트 확인에 사용하는 공개 제품 매니페스트다. 앱은 현재 OS와 아키텍처에 맞는 버전 피드를 선택하고, 해당 폴더의 electron-updater 메타데이터로 다운로드와 in-place 설치를 수행한다.

## 지원 피드

| 플랫폼 | 폴더 | 상태 |
| --- | --- | --- |
| Windows x64 | `windows-x64` | 0.3.40 제공 |
| macOS arm64 | `mac-arm` | 0.3.39 제공 |

버전 폴더의 파일은 게시 후 교체하지 않는다. 새 릴리즈의 artifact publish와 metadata finalize 중에는 이전 빌드를 유지한다. 새 버전으로 `update.json` pin이 성공한 직후 같은 플랫폼의 이전 버전 폴더를 제거해 제품·플랫폼별 최신 버전 하나만 유지한다.

macOS 게시 자동화는 DMG와 ZIP, 각각의 blockmap을 Git LFS artifact commit에 저장하고, `latest-mac.yml`을 별도 metadata commit에서 immutable media URL로 finalize한 다음 `update.json.platforms.mac-arm`을 세 번째 manifest commit으로 pin한다.
