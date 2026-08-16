# Owen MDBOX Updates

`update.json`은 Owen MDBOX가 플랫폼별 최신 버전을 확인하는 공개 제품 매니페스트다. schema v3의 모든 플랫폼은 `check-only`이며 설치 파일이나 자동 업데이트 feed URL을 제공하지 않는다.

## 지원 피드

| 플랫폼 | 폴더 | 상태 |
| --- | --- | --- |
| Windows x64 | `windows-x64` | 0.3.45 확인 |
| macOS arm64 | `mac-arm` | 0.3.47 확인 |

Windows 설치와 업데이트는 Microsoft Store를 기본 경로로 사용한다. macOS를 포함한 Store 외 설치 파일은 제품별 외부 배포 경로에서 제공한다. 이 저장소에는 제품 소스, EXE, DMG, 앱 패키지, blockmap, checksum 또는 updater feed를 두지 않는다. 외부 기관이 명시적으로 요구한 공개 ZIP만 `external/<purpose>/`에 둔다.

## 외부 요청 파일

- App Review 샘플: [MDBOX-App-Review-Sample.zip](external/app-review/MDBOX-App-Review-Sample.zip)

## 법적 문서

- [개인정보처리방침](PRIVACY.md)
- [제3자 소프트웨어 고지](THIRD-PARTY-NOTICES.md)
