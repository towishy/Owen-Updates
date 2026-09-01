# Owen Trans Updates

`update.json`은 Owen Trans가 플랫폼별 최신 공개 버전을 확인하는 schema v3
`check-only` manifest다. 설치 파일, 자동 업데이트 feed, checksum과 앱 package는
이 저장소에 두지 않는다.

| 플랫폼 | 최신 버전 | 배포 위치 |
| --- | --- | --- |
| Windows x64 | 0.6.0 | 제품 GitHub Release |
| Apple Silicon macOS | 0.7.0 | 제품 GitHub Release |

macOS 0.7.0은 Swift MLX Metal 번역 backend를 사용한다. Windows는 0.6.0의
llama.cpp Vulkan/CUDA backend를 유지한다.