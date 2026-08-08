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