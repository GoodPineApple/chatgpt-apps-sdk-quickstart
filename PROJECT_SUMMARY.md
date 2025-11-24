# 프로젝트 요약

ChatGPT Apps SDK는 ChatGPT 내 커스텀 앱을 만드는 도구입니다. 공식 문서 예제는 커넥터 등록이 실패하는데, HEAD 요청 미처리, Accept 헤더 무시, 요청 본문 스트림 처리 문제 때문입니다. 본 프로젝트는 이를 해결하여 Google Cloud Run에 배포하고, ChatGPT Plus 구독 후 개발자 모드 활성화하여 앱 추가 시 바로 사용 가능합니다. 주요 수정: HEAD 요청 처리, Accept 헤더 기반 SSE/JSON 응답 결정, 요청 본문 스트림 처리 개선.

