# OWEN MDBOX 제3자 소프트웨어 고지

- 기준 버전: OWEN MDBOX 0.3.45
- 검토일: 2026년 8월 9일

OWEN MDBOX에는 아래의 제3자 소프트웨어와 자산이 포함되어 있습니다. 각 저작권은 해당 권리자에게 있으며, OWEN MDBOX 전체가 해당 제3자 라이선스로 배포된다는 의미는 아닙니다.

이 문서는 구성 요소를 쉽게 확인하기 위한 요약입니다. 전체 라이선스 원문과 저작권 고지는 배포 패키지의 다음 위치에 함께 포함됩니다.

- Electron: `LICENSE.electron.txt`
- Chromium과 Electron이 사용하는 제3자 구성 요소: `LICENSES.chromium.html`
- npm 런타임 패키지: 각 패키지 디렉터리의 `LICENSE`, `COPYING` 또는 `NOTICE` 파일과 `resources/legal/licenses/RUNTIME-DEPENDENCY-ADDENDUM.txt`
- MDBOX browser vendor, 글꼴과 사운드: `wiki-public/vendor`와 `wiki-public/sounds`의 `*.LICENSE` 파일
- 이 고지와 개인정보처리방침: 배포 패키지의 `resources/legal` 디렉터리

## Electron과 Chromium

- Electron: MIT License, [electron/electron](https://github.com/electron/electron)
- Chromium 및 포함된 제3자 구성 요소: Chromium 배포 고지 적용

배포 패키지에 포함된 `LICENSE.electron.txt`와 `LICENSES.chromium.html`이 이 구성 요소들의 전체 고지 원문입니다.

## npm 런타임 패키지

정확한 버전은 배포 패키지의 package metadata에 고정되어 있습니다.

### Apache License 2.0

- `idb-keyval`
- `pdfjs-dist`
- `tesseract.js`
- `tesseract.js-core`
- `wasm-feature-detect`

### BSD 3-Clause License

- `diff`
- `source-map-js`

### BSD 2-Clause License

- `@mixmark-io/domino`
- `domelementtype`
- `domhandler`
- `domutils`
- `entities`
- `webidl-conversions`

### ISC License

- `fastq`
- `glob-parent`
- `graceful-fs`
- `picocolors`
- `semver`

### MIT License

- `@tesseract.js-data/eng`
- `@tesseract.js-data/kor`
- `chokidar`
- `cytoscape`
- `electron-updater`
- `fast-glob`
- `fast-xml-parser`
- `fflate`
- `js-yaml`
- `mdast-util-to-string`
- `mime-types`
- `minisearch`
- `parse5`
- `remark-frontmatter`
- `remark-gfm`
- `remark-parse`
- `sanitize-html`
- `turndown`
- `turndown-plugin-gfm`
- `unified`
- `unist-util-visit`
- 위 패키지들이 사용하는 MIT 라이선스의 transitive dependencies

### 기타 허용적 라이선스

- `argparse`: Python Software Foundation License 2.0
- `sax`: Blue Oak Model License 1.0.0
- `format`: MIT License. 구형 package metadata의 `licenses` 필드로 선언되어 있습니다.

게시된 npm 패키지에 독립 라이선스 파일이 없는 일부 런타임 구성 요소의 저작권·저자 고지와 MIT 전문은 다음 파일에 함께 배포됩니다.

- 소스 트리: `desktop/wiki-public/vendor/runtime-dependency-addendum.LICENSES.txt`
- 설치 패키지: `resources/legal/licenses/RUNTIME-DEPENDENCY-ADDENDUM.txt`

`@tesseract.js-data/eng`와 `@tesseract.js-data/kor` npm 패키지는 MIT로 선언되어 있으며, 포함된 trained data의 원본 저장소는 Apache License 2.0을 적용합니다. Apache License 2.0 전문은 설치 패키지의 `resources/legal/licenses/APACHE-2.0.txt`에 별도로 포함됩니다.

## 브라우저 번들

다음 패키지는 빌드 시 browser bundle로 컴파일되어 배포됩니다.

- `@codemirror/autocomplete`: MIT License
- `@codemirror/commands`: MIT License
- `@codemirror/lang-markdown`: MIT License
- `@codemirror/language`: MIT License
- `@codemirror/lint`: MIT License
- `@codemirror/search`: MIT License
- `@codemirror/state`: MIT License
- `@codemirror/view`: MIT License
- `@lezer/markdown`: MIT License
- `highlight.js`: BSD 3-Clause License
- `katex`: MIT License
- `lucide`: ISC License

위 패키지와 번들에 포함된 transitive dependencies의 전체 라이선스 원문은 다음 파일에 함께 배포됩니다.

- 소스 트리: `desktop/wiki-public/vendor/editor-bundles.LICENSES.txt`
- 설치 패키지: `resources/legal/licenses/EDITOR-BUNDLES-LICENSES.txt`

MDBOX가 별도 vendor 파일로 포함하는 구성 요소는 다음과 같습니다.

- Cytoscape.js: MIT License, `desktop/wiki-public/vendor/cytoscape.LICENSE`
- DOMPurify: Apache License 2.0 선택 적용, `desktop/wiki-public/vendor/dompurify.LICENSE`
- js-yaml: MIT License, `desktop/wiki-public/vendor/js-yaml.LICENSE`
- Lucide: ISC License, `desktop/wiki-public/vendor/lucide.LICENSE`
- Marked: MIT License 및 Markdown BSD-style notice, `desktop/wiki-public/vendor/marked.LICENSE`
- Mermaid: MIT License, `desktop/wiki-public/vendor/mermaid.LICENSE`
- Owen Mermaid browser editor: MIT License, `desktop/wiki-public/vendor/owen-mermaid.LICENSE`

## 글꼴

다음 글꼴은 SIL Open Font License 1.1에 따라 앱과 함께 배포됩니다. 글꼴 파일 자체를 단독 판매하지 않습니다.

- IBM Plex Sans KR: `desktop/wiki-public/vendor/ibm-plex-sans-kr.LICENSE`
- NanumSquare: `desktop/wiki-public/vendor/nanum-square.LICENSE`
- Noto Sans KR: `desktop/wiki-public/vendor/noto-sans-kr.LICENSE`
- Noto Serif KR: `desktop/wiki-public/vendor/noto-serif-kr.LICENSE`

### Pretendard 1.3.9

> Copyright (c) 2021, Kil Hyung-jin, with Reserved Font Name "Pretendard".  
> Copyright 2014-2021 Adobe, with Reserved Font Name "Source".  
> Copyright (c) 2016 The Inter Project Authors, with Reserved Font Name "Inter".  
> Copyright 2021 The M+ FONTS Project Authors, with Reserved Font Name "M PLUS 1".

Pretendard는 SIL Open Font License 1.1에 따라 MDBOX에 임베딩됩니다. MDBOX는 글꼴 파일 자체를 단독 판매하지 않으며, 글꼴과 수정본에 적용되는 OFL 조건은 앱 코드 및 사용자 문서의 라이선스와 별개로 유지됩니다.

- 소스 트리: `desktop/wiki-public/vendor/pretendard.LICENSE`
- 설치 패키지 내 원문: `resources/legal/licenses/PRETENDARD-OFL-1.1.txt`

## 사운드 자산

- Daktilo classic typewriter sounds: MIT License, upstream commit `ee3076dd2ad56d62d4e631592f0b458384e2bfd2`
- Vim Keysound typewriter sounds: MIT License, upstream commit `6c662549b477f79347c32fb3683432137c391a96`
- Typewriter Noises for VS Code sounds: MIT License, upstream commit `74309630ccfdff043d9469cca402405c574a89b6`

각 사운드 디렉터리의 `SOURCE.md`에는 원본 경로, 고정 commit과 SHA-256이 기록되어 있고, 대응하는 `*.LICENSE` 파일이 함께 배포됩니다. ICQ 타자기 프로필은 원본 음원을 포함하지 않으며 특성을 절차적으로 재현한 자체 생성 PCM만 사용합니다.

## 제외한 자산

상업적 재배포 조건이 불명확하거나 GPL, noncommercial-only 또는 무라이선스인 외부 코드와 음원은 배포물에 포함하지 않습니다.

## 문의

제3자 고지 또는 누락 가능성에 관한 문의는 [owen@sarang.day](mailto:owen@sarang.day)로 보내 주세요.
