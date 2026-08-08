# Owen Updates

Owen 제품군의 공개 업데이트 메타데이터와 in-place upgrade 바이너리를 제공한다.

## 구조

```text
<product>/
  update.json
  <platform>/
    <version>/
      latest.yml | latest-mac.yml
      installer
      blockmap
      SHA256SUMS.txt
```

- 제품은 루트의 고유 폴더를 사용한다.
- `update.json`은 현재 제공 중인 플랫폼과 최신 버전 피드만 선언한다.
- 플랫폼 이름은 Windows x64의 `windows-x64`, Apple Silicon macOS의 `mac-arm`을 사용한다.
- 바이너리는 플랫폼 아래의 변경 불가능한 버전 폴더에 보관한다.
- 대용량 설치 바이너리는 Git LFS로 추적한다.

현재 등록 제품: [owen-mdbox](owen-mdbox/README.md)

다른 Owen 제품을 연결할 때는 [제품 통합 프롬프트 가이드](PRODUCT-INTEGRATION-PROMPT.md)를 사용한다.

## GitHub Release 보존 정책

중앙 GitHub Release는 운영자가 플랫폼별 현재 피드를 확인하기 위한 표식이며 앱의 업데이트 탐색점은 아니다. `update.json`의 각 플랫폼마다 최신 릴리스와 태그를 정확히 하나만 보유한다.

- 태그: `<product>-<platform>-<version>` (예: `owen-mdbox-windows-x64-0.3.37`)
- 릴리스 제목: 숫자 버전만 사용 (예: `0.3.37`)
- 새 플랫폼 버전을 게시하면 같은 제품·플랫폼의 이전 릴리스와 태그만 제거한다.
- 다른 플랫폼과 다른 제품의 최신 릴리스는 보존한다.
- 과거 전역 bare numeric 중앙 태그와 릴리스는 동기화 과정에서 제거한다.

manifest commit을 push한 뒤 다음 명령을 실행한다.

```text
npm run release:sync-platforms
```

이 명령은 모든 제품의 `update.json`을 읽고 manifest에 pin된 feed가 처음 게시된 commit에 플랫폼 태그를 만든다. 실행 전 `main`이 clean하고 `origin/main`과 동기화되어 있어야 한다.

Owen MDBOX macOS arm64 피드는 제품 저장소의 서명 릴리스 명령이 다음 스크립트를 artifact, metadata, manifest 커밋 사이에서 각각 호출한다.

```text
npm run publish:mdbox:mac -- --version <x.y.z> --source <Release/macOS>
npm run finalize:mdbox:mac -- --version <x.y.z> --revision <ARTIFACT_COMMIT>
npm run pin:mdbox:mac -- --version <x.y.z> --revision <METADATA_COMMIT>
npm run validate
npm run release:sync-platforms
```

세 단계를 한 커밋으로 합치지 않는다. Owen MDBOX macOS 산출물은 제품 저장소의 `OWEN.pfx` self-signed 인증서 fingerprint 검증을 통과한 뒤 게시하며 Apple Developer ID와 notarization은 사용하지 않는다.
