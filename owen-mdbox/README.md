# Owen MDBOX Updates

`update.json`은 Owen MDBOX가 업데이트 확인에 사용하는 공개 제품 매니페스트다. 앱은 현재 OS와 아키텍처에 맞는 버전 피드를 선택하고, 해당 폴더의 electron-updater 메타데이터로 다운로드와 in-place 설치를 수행한다.

## 지원 피드

| 플랫폼 | 폴더 | 상태 |
| --- | --- | --- |
| Windows x64 | `windows-x64` | 0.3.33 제공 |
| macOS arm64 | `mac-arm` | 바이너리 준비 후 등록 |

버전 폴더의 파일은 게시 후 교체하지 않는다. 새 릴리즈는 새 버전 폴더를 만들고 `update.json`의 해당 플랫폼 항목만 갱신한다.