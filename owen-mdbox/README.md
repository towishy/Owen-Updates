# Owen MDBOX Updates

`update.json`은 Owen MDBOX가 업데이트 확인에 사용하는 공개 제품 매니페스트다. 앱은 현재 OS와 아키텍처에 맞는 버전 피드를 선택하고, 해당 폴더의 electron-updater 메타데이터로 다운로드와 in-place 설치를 수행한다.

## 지원 피드

| 플랫폼 | 폴더 | 상태 |
| --- | --- | --- |
| Windows x64 | `windows-x64` | 0.3.34 제공 |
| macOS arm64 | `mac-arm` | 서명·공증 릴리스 게시 대기 |

버전 폴더의 파일은 게시 후 교체하지 않는다. 새 릴리즈는 새 버전 폴더를 만들고 `update.json`의 해당 플랫폼 항목만 갱신한다.

macOS 게시 자동화는 DMG와 ZIP, 각각의 blockmap을 Git LFS artifact commit에 저장하고, `latest-mac.yml`을 별도 metadata commit에서 immutable media URL로 finalize한 다음 `update.json.platforms.mac-arm`을 세 번째 manifest commit으로 pin한다.
