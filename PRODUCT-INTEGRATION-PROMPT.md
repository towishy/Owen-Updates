# 다른 Owen 제품용 중앙 업데이트 통합 프롬프트

이 문서는 다른 Owen 제품의 코딩 에이전트에게 그대로 전달할 수 있는 작업 지시서다. 아래 입력값만 제품에 맞게 바꾼 뒤 `복사용 프롬프트` 전체를 붙여 넣는다.

## 입력값

- `{{PRODUCT_ID}}`: 중앙 저장소의 제품 폴더명. 예: `owen-mdbox`
- `{{PRODUCT_NAME}}`: 사용자에게 표시할 제품명
- `{{PRODUCT_REPO}}`: 대상 제품의 로컬 저장소 절대 경로
- `{{PRODUCT_GITHUB}}`: 대상 제품의 `owner/repository`
- `{{PLATFORMS}}`: 지원 플랫폼. 표준값은 `windows-x64`, `mac-arm`
- `{{VERSION}}`: 구현 또는 릴리즈할 `x.y.z` 버전

제품의 빌드 명령, 패키지 이름, 서명 방식은 미리 추측하지 않는다. 에이전트가 대상 저장소의 현재 구현과 릴리즈 스크립트에서 확인하게 한다.

## 복사용 프롬프트

```text
다음 Owen 제품의 업데이트 확인, 다운로드, in-place 업그레이드를 공개 중앙 저장소 `towishy/Owen-Updates`를 통해 동작하도록 구현하고 끝까지 검증해줘.

입력:
- 제품 ID: {{PRODUCT_ID}}
- 제품명: {{PRODUCT_NAME}}
- 제품 저장소: {{PRODUCT_REPO}}
- 제품 GitHub 저장소: {{PRODUCT_GITHUB}}
- 지원 플랫폼: {{PLATFORMS}}
- 작업 버전: {{VERSION}}
- 중앙 업데이트 저장소: D:\Github\owen-updates
- 중앙 GitHub 저장소: towishy/Owen-Updates

작업 원칙:
1. 대상 제품 저장소와 Owen-Updates 저장소의 AGENTS.md, README, package/build 설정, 기존 updater, 릴리즈 스크립트, 테스트를 먼저 확인한다. 기존 사용자 변경을 되돌리거나 관련 없는 파일을 정리하지 않는다.
2. 제품의 현재 프레임워크와 릴리즈 방식을 유지한다. Electron 제품이면 검증된 `electron-updater` generic provider를 우선 사용하고, 다른 프레임워크면 그 생태계의 검증된 updater를 사용한다. 업데이트 엔진을 임의로 새로 만들지 않는다.
3. 업데이트 확인과 설치에 대상 제품의 private GitHub Release, GitHub CLI 로그인, 개인 토큰을 요구하지 않는다. 비밀값을 코드, 설정, 로그, 문서, 채팅에 기록하지 않는다.
4. 제품별 최신 버전 탐색점만 mutable `main`을 사용한다. 실제 metadata와 바이너리는 반드시 전체 40자리 Git commit SHA로 고정한다.
5. 조사나 제안에서 멈추지 말고 구현, 테스트, 패키징, 원격 피드 검증까지 진행한다. 실제 차단 사유가 있을 때만 질문한다.

중앙 manifest 계약:
1. 앱은 아래 GitHub Contents API에서 제품 manifest를 매번 새로 읽는다.
   `https://api.github.com/repos/towishy/Owen-Updates/contents/{{PRODUCT_ID}}/update.json?ref=main`
2. 요청에는 `Accept: application/vnd.github.raw+json`과 제품을 식별할 수 있는 `User-Agent`를 사용하고, 합리적인 timeout을 둔다.
3. manifest는 다음 구조를 따른다.
   {
     "schemaVersion": 1,
     "product": "{{PRODUCT_ID}}",
     "platforms": {
       "windows-x64": {
         "version": "{{VERSION}}",
         "feedUrl": "https://raw.githubusercontent.com/towishy/Owen-Updates/<METADATA_COMMIT>/{{PRODUCT_ID}}/windows-x64/{{VERSION}}"
       }
     }
   }
4. 앱에서 schemaVersion, product, semver, 현재 OS/architecture, HTTPS host, feed 경로, 전체 commit SHA를 모두 검증한다. 예상하지 않은 host, branch URL, 플랫폼, product mismatch는 업데이트 없음으로 숨기지 말고 안전한 오류 상태로 처리한다.
5. Windows x64는 `windows-x64`, Apple Silicon macOS는 `mac-arm`으로 매핑한다. 지원하지 않는 OS/architecture에서는 명확한 unsupported 결과를 반환한다.

앱 updater 계약:
1. update check 때마다 중앙 manifest를 다시 가져오되, 동일한 immutable feed URL이면 updater provider를 불필요하게 재설정하지 않는다.
2. Electron 제품은 generic feed URL을 사용하고 GitHub provider 및 private-release 인증 의존성을 제거한다. GitHub media endpoint와의 안정성을 위해 `useMultipleRangeRequest: false`를 적용한다.
3. 확인, 사용 가능, 다운로드 중, 다운로드 완료, 현재 버전, 오류 상태를 기존 UI/IPC 계약에 맞게 일관되게 노출한다. check 결과가 이벤트보다 먼저 도착해도 available version이 누락되지 않게 한다.
4. 다운로드 완료 전에는 설치를 시작하지 않고, 완료 후 명시적 사용자 명령으로 재시작 설치한다. Electron이면 검증된 `quitAndInstall` 흐름을 사용한다.
5. 현재 앱 버전과 manifest 버전은 semver로 비교한다. downgrade와 같은 버전 재설치를 기본 허용하지 않는다.
6. updater 모듈이 테스트 환경에서 앱 초기화 상태를 강제로 참조한다면 lazy load 또는 의존성 주입으로 단위 테스트 가능성을 보존한다.

Owen-Updates 저장 구조:
`{{PRODUCT_ID}}/update.json`
`{{PRODUCT_ID}}/<platform>/<version>/latest.yml` 또는 `latest-mac.yml`
`{{PRODUCT_ID}}/<platform>/<version>/<installer-or-archive>`
`{{PRODUCT_ID}}/<platform>/<version>/<blockmap-if-required>`
`{{PRODUCT_ID}}/<platform>/<version>/SHA256SUMS.txt`

중앙 저장소 구현 규칙:
1. 실행 파일, blockmap, dmg, zip 등 updater가 내려받는 대형 산출물은 Git LFS로 추적한다. `raw.githubusercontent.com`은 LFS 바이너리가 아니라 pointer를 반환하므로 바이너리 URL에 절대 사용하지 않는다.
2. `latest.yml` 또는 `latest-mac.yml`은 metadata commit의 raw feed에서 제공한다. 그 안의 실제 파일 URL은 다음 immutable LFS media URL이어야 한다.
   `https://media.githubusercontent.com/media/towishy/Owen-Updates/<ARTIFACT_COMMIT>/{{PRODUCT_ID}}/<platform>/<version>/<file>`
3. `main`을 포함한 mutable branch를 finalized feedUrl이나 바이너리 URL에 넣지 않는다.
4. 기존 `owen-mdbox` publish/finalize/pin 스크립트와 validator를 가장 가까운 기준으로 삼아 {{PRODUCT_ID}}용 최소 확장을 추가한다. 제품별 차이가 작다면 기존 패턴을 유지하고, 실제 중복이 커질 때만 공용화를 한다.
5. 중앙 validator의 제품 목록에 {{PRODUCT_ID}}를 등록하고 schema, 플랫폼, immutable URL, 파일 크기, metadata SHA-512, SHA256SUMS, 필수 blockmap/archive를 검증한다.
6. 이미 존재하는 버전 폴더의 서로 다른 바이너리나 metadata를 덮어쓰지 않는다. 같은 내용의 재실행만 idempotent하게 허용한다.

반드시 지킬 3단계 게시 순서:
1. 제품 빌드에서 생성한 installer/archive와 blockmap, 초기 metadata, SHA256SUMS를 새 버전 폴더에 준비한다. LFS 객체가 추적되는지 확인하고 artifact commit을 만든 뒤 push한다. 전체 40자리 `ARTIFACT_COMMIT`을 기록한다.
2. metadata의 파일 URL을 `ARTIFACT_COMMIT` 기반 immutable media URL로 finalize한다. metadata commit을 만들고 push한 뒤 전체 40자리 `METADATA_COMMIT`을 기록한다.
3. `update.json`의 해당 플랫폼 version과 feedUrl을 `METADATA_COMMIT` 기반 raw URL로 pin한다. 중앙 validator를 통과시킨 후 manifest commit을 만들고 push한다.

이 순서를 한 commit으로 합치지 않는다. metadata가 자기 자신의 commit을 참조할 수 없고, 바이너리와 metadata의 불변 revision 역할이 다르기 때문이다. 앱의 업데이트 동작은 Owen-Updates GitHub Release나 tag에 의존하지 않고 위 commit SHA 체인만 신뢰해야 한다.

릴리즈 자동화:
1. 대상 제품의 기존 릴리즈 명령에 중앙 3단계 게시를 연결한다. 버전 일치 확인, 제품 검증, 서명 패키징, packaged smoke, 제품 commit/push/tag/release가 성공한 뒤 중앙 게시를 수행한다.
2. 중간 실패 후 검증을 처음부터 반복하지 않도록 안전한 resume 지점을 제공한다. 이미 통과한 전체 suite는 한 릴리즈 시도에서 다시 돌리지 않고 실패 테스트와 미검증 단계만 실행한다.
3. 대상 제품 저장소의 tag/release 이름은 기존 정책을 따르고 `v` 접두사를 임의로 추가하지 않는다. 중앙 저장소는 manifest push 후 `npm run release:sync-platforms`를 실행한다. 중앙 tag는 `<product>-<platform>-<version>`, Release 제목은 숫자 버전이며, 같은 제품·플랫폼의 최신 하나만 보존한다. 다른 플랫폼과 제품의 최신 Release를 삭제하지 않으며 업데이트 정확성이 tag에 의존하게 만들지 않는다.
4. Windows 서명이나 macOS signing/notarization을 기존 제품 정책대로 유지하고, 서명되지 않은 임시 패키지를 운영 피드에 게시하지 않는다.

필수 테스트:
1. manifest parser: 정상 manifest, product mismatch, 잘못된 schema/semver, HTTP URL, mutable branch URL, 잘못된 host, 미지원 플랫폼.
2. updater 상태: current, available, download 완료, 오류, 설치 요청. check 결과와 updater event 순서가 바뀌는 경우도 검증한다.
3. manifest를 check마다 다시 가져오는지, 같은 feed를 중복 설정하지 않는지 검증한다.
4. 중앙 publish/finalize/pin 스크립트와 validator를 임시 fixture 또는 실제 릴리즈 산출물로 검증한다.
5. 패키징된 앱을 임시 userData에서 실행해 실제 `checkForUpdates()` smoke를 수행한다. 개발 모드 결과만으로 완료하지 않는다.
6. 운영 `update.json`이 새 버전과 immutable metadata commit을 가리키는지 확인한다.
7. 운영 metadata URL은 HTTP 200, installer/archive와 blockmap URL은 Range 요청에서 실제 LFS 내용과 HTTP 206을 반환하는지 확인한다. 파일 크기, SHA-512, SHA-256을 로컬 산출물과 비교한다.
8. 대상 플랫폼의 서명자와 timestamp를 확인한다. 지원 플랫폼을 현재 호스트에서 패키징할 수 없다면 구현과 정적 검증 결과, 미검증 이유를 명확히 남긴다.

완료 조건:
- 대상 제품은 인증 없이 Owen-Updates manifest를 통해 최신 버전을 확인한다.
- 사용자가 앱 안에서 다운로드하고 in-place upgrade를 시작할 수 있다.
- 모든 metadata와 바이너리 URL은 immutable commit SHA에 고정된다.
- 제품 저장소와 중앙 저장소의 관련 테스트 및 packaged smoke가 통과한다.
- 요청받은 경우 두 저장소를 commit/push하고 대상 제품 release를 생성하며, 중앙 피드를 원격에서 다시 검증한다.
- 중앙 저장소의 각 manifest 플랫폼에 namespaced tag와 최신 GitHub Release가 정확히 하나씩 남아 있다.
- 최종 보고에는 변경 파일, 테스트 결과, 제품 commit/tag/release, 중앙의 artifact/metadata/manifest commit SHA, 운영 manifest 버전, 원격 다운로드 검증 결과를 포함한다.
```

## 적용할 때 확인할 점

- 새 제품 ID는 소문자 kebab-case로 고정하고 앱, 폴더, manifest의 `product` 값을 동일하게 유지한다.
- 여러 플랫폼을 한 번에 게시하면 플랫폼마다 artifact/metadata commit이 달라질 수 있다. 각 `update.json.platforms` 항목이 해당 metadata commit을 정확히 가리키는지 확인한다.
- 중앙 GitHub Release는 운영자 편의를 위한 표식일 뿐 업데이트 탐색점이 아니다. 앱은 Release API나 tag를 조회하지 않는다.