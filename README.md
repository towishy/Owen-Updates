# Owen Updates

Owen 제품군의 공개 최신 버전 확인 메타데이터를 제공한다. 설치 파일과 자동 업데이트 feed는 이 저장소에서 배포하지 않는다.

## 구조

```text
<product>/
  update.json
  external/
    <purpose>/
      <externally-requested-file>.zip
```

- 제품은 루트의 고유 폴더를 사용한다.
- `update.json`은 현재 제공 중인 플랫폼과 최신 버전만 선언한다.
- `external/<purpose>/`에는 심사기관 등 외부에서 명시적으로 요구한 공개 ZIP만 둔다.
- 제품 소스, 압축을 푼 샘플, 설치·앱 패키지와 updater feed는 저장하지 않는다.
- 플랫폼 이름은 Windows x64의 `windows-x64`, Apple Silicon macOS의 `mac-arm`을 사용한다.
- 모든 플랫폼 entry는 schema v3의 `mode: "check-only"`를 사용한다.
- installer, app package, blockmap, checksum, updater feed URL은 저장하지 않는다.
- 설치 파일은 Microsoft Store 또는 제품별 외부 배포 경로에서 제공한다.

현재 등록 제품: `gsa-dashboard`, [gsa-assist](gsa-assist/README.md), [owen-mdbox](owen-mdbox/README.md), [owen-trans](owen-trans/README.md)

다른 Owen 제품을 연결할 때는 [제품 통합 프롬프트 가이드](PRODUCT-INTEGRATION-PROMPT.md)를 사용한다.

## Manifest 계약

Owen-Updates의 모든 게시 프로세스에서 가장 먼저 지킬 불변 조건이다.

- `schemaVersion`은 `3`이다.
- 플랫폼 entry에는 `mode`와 `version`만 둔다.
- `mode`는 `check-only`다.
- `version`은 SemVer 형식의 플랫폼별 최신 공개 버전이다.
- `npm run validate`는 `external/<purpose>/*.zip`의 실제 ZIP 외 binary/feed artifact나 추가 URL 필드가 들어오면 실패한다.

기존 GitHub Release와 tag를 정리할 때는 manifest를 push한 뒤 `npm run release:sync-platforms`를 실행한다. 이 명령은 check-only로 관리되는 제품·플랫폼의 Release와 tag를 제거하며 새 Release를 만들지 않는다.
