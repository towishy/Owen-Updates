# OWEN MDBOX 개인정보처리방침

- 시행일: 2026년 8월 9일
- 게시자: Owen Lee
- 문의: [owen@sarang.day](mailto:owen@sarang.day)

OWEN MDBOX는 사용자가 선택한 Markdown 폴더를 기기 안에서 열고 편집하는 local-first 데스크톱 앱입니다. 게시자는 앱을 통해 사용자의 문서 내용이나 사용 행태를 수집하지 않습니다.

## 1. 처리하는 데이터

앱은 핵심 기능을 제공하기 위해 다음 데이터를 사용자의 기기 안에서 처리합니다.

- 사용자가 직접 선택한 Markdown 문서와 첨부 파일
- 문서 제목, 경로, 태그, 링크, 검색 색인과 문서 상태 분석 결과
- 사용자가 선택적으로 활성화한 이미지 OCR 결과와 로컬 검색 색인
- 앱 설정, 선택한 문서 폴더 경로, 추가한 사용자 글꼴
- 자동 저장·안전 수정·이동·삭제 전에 생성되는 문서 revision
- 사용자가 직접 생성한 박스 백업

원본 문서와 첨부 파일은 사용자가 선택한 폴더에 유지됩니다. 설정, 색인, OCR 캐시, revision, 백업과 사용자 글꼴은 운영체제가 앱에 할당한 로컬 App Data 영역에 저장됩니다.

## 2. 수집 및 전송

게시자는 다음 정보를 수집, 업로드, 판매하거나 광고 목적으로 사용하지 않습니다.

- 문서 및 첨부 파일의 내용
- 검색어, OCR 결과 또는 관계 그래프
- 사용 기록, 진단 telemetry 또는 광고 식별자
- 계정, 연락처, 위치 또는 결제 정보

앱은 계정 가입을 요구하지 않으며 자체 분석·광고 SDK를 포함하지 않습니다.

## 3. 네트워크 연결과 제3자 서비스

- Microsoft Store 설치본의 설치, 라이선스와 업데이트는 Microsoft Store가 관리합니다. 이 과정에서 Microsoft가 처리하는 정보에는 [Microsoft 개인정보처리방침](https://privacy.microsoft.com/privacystatement)이 적용됩니다.
- Microsoft Store가 아닌 일반 배포본은 자동 업데이트 확인이 켜져 있을 때 공개 GitHub 저장소의 버전 manifest를 조회합니다. 이 요청에는 일반적인 인터넷 연결 정보(IP 주소, 요청 시각과 User-Agent 등)가 GitHub에 전달될 수 있으며 [GitHub Privacy Statement](https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement)가 적용됩니다.
- 사용자가 앱에서 외부 링크를 선택하면 운영체제의 기본 브라우저가 해당 웹사이트를 엽니다. 이후의 데이터 처리는 해당 사이트의 정책을 따릅니다.

앱은 사용자의 Markdown 문서, 첨부 파일, OCR 결과 또는 검색 색인을 위 서비스로 전송하지 않습니다.

## 4. 보관과 삭제

- 원본 문서와 첨부 파일은 사용자가 직접 이동하거나 삭제할 때까지 선택한 폴더에 남습니다.
- revision은 앱이 정한 개수 및 용량 한도 안에서 오래된 항목부터 자동 정리됩니다.
- 박스 백업은 앱에서 설정한 보존 개수에 따라 오래된 백업부터 자동 정리되며, 앱의 백업 관리 기능에서 삭제할 수 있습니다.
- 추가한 사용자 글꼴은 앱 설정에서 삭제할 수 있습니다.
- 검색·OCR·분석 캐시와 설정은 운영체제의 앱 데이터 초기화 또는 앱 제거 기능으로 삭제할 수 있습니다. 앱 제거가 사용자가 선택한 원본 Markdown 폴더를 삭제하지는 않습니다.

사용자는 언제든지 앱의 문서 폴더 연결을 변경하고 원본 파일을 일반 파일 관리 도구로 열거나 이동할 수 있습니다.

## 5. 보안

앱은 사용자가 명시적으로 선택한 폴더만 작업 대상으로 사용하고, 파일 경로 검증과 로컬 프로토콜 제한을 적용합니다. 다만 사용자의 기기 또는 저장 장치 자체가 침해된 경우까지 완전한 보안을 보장할 수는 없습니다. 중요한 문서는 별도의 안전한 위치에도 백업하는 것을 권장합니다.

## 6. 아동의 개인정보

앱은 아동을 대상으로 개인정보를 수집하거나 계정을 운영하지 않습니다. 게시자는 앱을 통해 사용자의 연령 정보를 수집하지 않습니다.

## 7. 방침 변경

앱의 데이터 처리 방식이 바뀌면 이 문서의 시행일과 내용을 갱신합니다. 중요한 변경은 Microsoft Store 설명, 릴리스 노트 또는 앱 안의 적절한 위치를 통해 알립니다.

## 8. 문의

이 방침 또는 OWEN MDBOX의 데이터 처리에 관한 문의는 [owen@sarang.day](mailto:owen@sarang.day)로 보내 주세요.

---

## OWEN MDBOX Privacy Policy

- Effective date: August 9, 2026
- Publisher: Owen Lee
- Contact: [owen@sarang.day](mailto:owen@sarang.day)

OWEN MDBOX is a local-first desktop application that opens and edits a Markdown folder selected by the user. The publisher does not collect document contents or usage behavior through the application.

## 1. Data processed on the device

The application processes the following data locally to provide its features:

- Markdown documents and attachments explicitly selected by the user
- Document titles, paths, tags, links, search indexes, and document health analysis
- Optional image OCR results and local search indexes
- Application settings, the selected document folder path, and user-installed fonts
- Document revisions created before saves, safe fixes, moves, and deletions
- Vault backups explicitly created by the user

Original documents and attachments remain in the folder selected by the user. Settings, indexes, OCR caches, revisions, backups, and custom fonts are stored in the local App Data location assigned to the application by the operating system.

## 2. Collection and transmission

The publisher does not collect, upload, sell, or use the following data for advertising:

- Document or attachment contents
- Search queries, OCR results, or relationship graphs
- Usage history, diagnostic telemetry, or advertising identifiers
- Account, contact, location, or payment information

The application does not require an account and does not include publisher-operated analytics or advertising SDKs.

## 3. Network connections and third-party services

- Microsoft Store manages installation, licensing, and updates for the Microsoft Store build. Information processed by Microsoft for these operations is governed by the [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement).
- A build distributed outside Microsoft Store checks a public GitHub version manifest when automatic update checks are enabled. GitHub may receive standard connection information such as the IP address, request time, and User-Agent. This processing is governed by the [GitHub Privacy Statement](https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement).
- When the user selects an external link, the operating system opens that website in the default browser. Further processing is governed by the destination website's policy.

The application does not transmit Markdown documents, attachments, OCR results, or search indexes to these services.

## 4. Retention and deletion

- Original documents and attachments remain in the selected folder until the user moves or deletes them.
- Revisions are pruned automatically within the application's entry and storage limits.
- Vault backups are pruned according to the retention count selected in the application and can be removed through backup management.
- Custom fonts can be removed in application settings.
- Search, OCR, and analysis caches and settings can be deleted by resetting application data or uninstalling the application through the operating system. Uninstalling the application does not delete the original Markdown folder selected by the user.

The user can change the connected document folder at any time and can access or move original files with standard file management tools.

## 5. Security

The application limits file operations to folders explicitly selected by the user and applies path validation and local protocol restrictions. No application can guarantee complete security if the device or storage itself is compromised. Important documents should also be backed up to a separate secure location.

## 6. Children's privacy

The application does not operate accounts or knowingly collect personal information from children. The publisher does not collect age information through the application.

## 7. Changes to this policy

If the application's data practices change, the effective date and this policy will be updated. Material changes will be communicated through the Microsoft Store listing, release notes, or an appropriate location in the application.

## 8. Contact

Questions about this policy or data handling in OWEN MDBOX may be sent to [owen@sarang.day](mailto:owen@sarang.day).
