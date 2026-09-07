# Owen Caption Privacy Policy / 개인정보 처리방침

시행일 / Effective date: 2026-09-07

## 한국어

### 운영자와 적용 범위

운영자 및 개인정보 문의 담당자는 Owen Lee이며, 연락처는 [owen@sarang.day](mailto:owen@sarang.day)입니다.
이 방침은 Owen Caption과 관련 지원 문의에 적용됩니다. 동반 앱에는 [Owen Player 개인정보 처리방침](../owen-player/PRIVACY.md)도 적용됩니다.

### 로컬 처리

사용자가 선택한 영상과 허용한 음성 입력을 음성 인식·자막 번역에 사용합니다.
기본 로컬 모드에서는 음성 인식과 번역을 사용자의 장치에서 수행합니다.
SRT, 작업 복구 파일, 번역 사전, 설정과 모델 파일은 장치에 저장됩니다.
클라우드 동기화 폴더를 선택한 경우 해당 동기화 서비스의 설정에 따라 파일이 업로드될 수 있습니다.
음성·영상·자막에는 사용자나 다른 사람의 개인정보가 포함될 수 있으므로 처리할 권한이 있는 자료만 사용하세요.

### 모델 다운로드와 선택형 외부 AI

모델 준비 시 Hugging Face 등 모델 호스팅 서비스와 해당 배포 서버에서 파일을 다운로드합니다.
서비스는 IP 주소, 요청 파일과 연결 정보 등을 처리할 수 있습니다. [Hugging Face 개인정보 정책](https://huggingface.co/privacy)을 참고하세요.

OpenAI 또는 사용자 지정 호환 서버를 번역 제공자로 선택하면 자막 텍스트, 번역 맥락과 필요한 용어를 지정한 서비스로 전송합니다.
API 키는 해당 서비스 인증에 사용됩니다. 제공자는 직접 지정한 로컬 서버일 수도 있습니다.
처리 지역, 국외 이전, 보존·학습 여부와 요금은 제공자와 계정 설정에 따라 다릅니다.
사용 전 제공자의 정책을 확인하세요. OpenAI 이용 시 [OpenAI 개인정보 정책](https://openai.com/policies/privacy-policy/)도 참고하세요.
외부 번역 전송을 중단하려면 로컬 번역 모드로 변경하고 필요하면 저장된 API 키를 삭제하세요.
이미 전송한 데이터의 삭제는 해당 제공자의 절차를 따라야 합니다.

### 설정과 진단

저장하는 외부 AI API 키는 Electron safeStorage를 통해 운영체제 보호를 적용하며 앱 설정에서 삭제할 수 있습니다.
이 보호가 모든 위협을 방지한다는 의미는 아닙니다.
오류 진단은 최근 최대 100개를 로컬에 보관하며 민감한 경로 등을 제거하려고 시도합니다.
진단 내보내기는 사용자의 명령으로 수행합니다. 지원 요청에 첨부하기 전 내용을 직접 확인하세요.

### 지원 문의와 보존

이메일 문의 시 이메일 주소, 문의 내용과 자발적으로 첨부한 자료를 문제 해결과 답변에 사용합니다.
지원 문의와 첨부 자료는 문의 종료 후 90일 이내에 삭제합니다. 법적 보관 의무가 있는 정보는 그 의무에 필요한 기간과 범위에 한해 보관합니다.
API 키, 인증서 개인키, 민감한 원본 음성·영상은 보내지 마세요. 지원 이메일 전달·보관에는 이메일 서비스 제공자의 처리가 수반됩니다.

로컬 설정·작업 결과는 사용자가 삭제하거나 앱의 저장 정책에 따라 교체될 때까지 장치에 남을 수 있습니다.
앱 설정에서 지원되는 모델 데이터와 API 키를 삭제하고, SRT·작업 복구·캡처 파일은 저장한 작업 폴더에서 삭제할 수 있습니다.
앱 제거만으로 사용자가 만든 파일이나 모든 모델 캐시가 삭제되는 것은 아닙니다.
설정 파일 위치 확인이나 삭제 지원이 필요하면 운영체제와 설치 방식을 알려주세요. 원본 파일을 보내실 필요는 없습니다.

### 선택권과 권리

녹음 권한은 운영체제 설정에서 변경할 수 있으며, 권한을 거부하면 해당 입력 기능을 사용할 수 없습니다.
적용되는 법률에 따라 운영자가 보유한 개인정보의 열람·정정·삭제·처리 제한·이의 제기·이동 또는 동의 철회를 요청할 수 있습니다.
문의 주소로 요청하면 필요한 범위에서 본인 확인 후 적용 법률에 따라 처리합니다. 법적 보관 의무 등 제한이 있으면 그 이유를 안내합니다.
관련 개인정보 감독기관에 민원을 제기할 수 있습니다. 장치에만 있는 데이터는 사용자가 직접 관리하며, 외부 서비스 보유 데이터는 해당 제공자에게 요청해야 합니다.

### 외부 서비스와 변경

외부 링크를 열면 브라우저와 해당 사이트의 정책이 적용됩니다.
이 공개 페이지는 GitHub에서 제공하므로 [GitHub 개인정보 정책](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)도 적용됩니다.
Store 구매·결제·계정 처리는 Microsoft가 담당하며 [Microsoft 개인정보처리방침](https://privacy.microsoft.com/privacystatement)을 확인할 수 있습니다.
본 방침은 외부 제공자의 정책을 대신하지 않습니다. 변경 사항은 이 페이지에 게시하고 시행일을 갱신합니다. 법률상 별도 안내나 동의가 필요한 경우 해당 절차를 따릅니다.

## English

### Operator and scope

Owen Lee operates Owen Caption and is the privacy contact at [owen@sarang.day](mailto:owen@sarang.day).
This policy covers Owen Caption and related support enquiries. The bundled player is also covered by the [Owen Player Privacy Policy](../owen-player/PRIVACY.md).

### Local processing

The app uses videos you select and audio inputs you permit for speech recognition and subtitle translation.
Default local recognition and translation run on your device. SRT files, recovery files, glossaries, settings and models are stored on the device.
Files in a cloud-synced folder may be uploaded according to that service's settings.
Audio, video and subtitles may contain your or another person's personal information. Only process material you have permission to use.

### Model downloads and optional external AI

Model setup downloads files from hosting services such as Hugging Face and their delivery servers.
These services may process your IP address, requested files and connection information. See the [Hugging Face Privacy Policy](https://huggingface.co/privacy).

Selecting OpenAI or a custom compatible translation server sends subtitle text, translation context and relevant glossary terms to that service.
An API key is used to authenticate with the service. Your chosen provider may also be a server running locally.
Processing locations, international transfers, retention, training practices and charges depend on the provider and your account settings.
Review the provider's policy before use; for OpenAI, see its [Privacy Policy](https://openai.com/policies/privacy-policy/).
To stop external translation transfers, switch to local translation and, if needed, delete the saved API key.
For deletion of information already sent, follow the provider's procedures.

### Settings and diagnostics

Saved external AI API keys use operating-system protection through Electron safeStorage and can be deleted in app settings.
This protection is not a guarantee against every threat.
Up to 100 recent diagnostic entries are kept locally, with attempts to remove sensitive paths and similar details.
Diagnostics are exported on your command. Review them before attaching them to a support request.

### Support and retention

When you email support, your email address, message and voluntarily supplied attachments are used to investigate and respond.
Support correspondence and attachments are deleted within 90 days after the enquiry is closed, except information that must be retained for a legal obligation, limited to the required scope and period.
Do not send API keys, certificate private keys or sensitive original recordings. Email service providers process support email in transit and storage.

Local settings and work products may remain until you delete them or the app replaces them under its storage policy.
Supported model data and API keys can be deleted in app settings. Delete SRT, recovery and capture files from their saved working folders.
Uninstalling does not necessarily delete user-created files or all model caches.
For help locating or deleting settings, provide your OS and installation method; you do not need to send original media.

### Choices and rights

You can change recording permissions in OS settings. Denying permission prevents use of the corresponding input feature.
Depending on applicable law, you may request access, correction, deletion, restriction, objection, portability or withdrawal of consent for personal information held by the operator.
Email the privacy contact. We will verify identity where necessary and respond under applicable law, explaining any limitation such as a legal retention obligation.
You may complain to the relevant data protection authority. You manage data held only on your device; requests concerning external providers' data must be directed to those providers.

### External services and changes

Opening external links is subject to the browser's and destination site's policies.
This public page is hosted by GitHub; its [Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) also applies.
Microsoft handles Store purchases, payments and accounts under the [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement).
This policy does not replace external providers' policies. Changes are published here with an updated effective date, with additional notice or consent where required by law.
