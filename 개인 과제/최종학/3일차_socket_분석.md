# 네트워크 아키텍처 및 소켓 심화 분석

## 1. 개요

경매 시스템의 핵심 요구사항인 **'실시간성(Real-time)'**과 **'대규모 동시 접속'**을 처리하기 위해, 단순한 API 구현을 넘어 하부구조인 네트워크(Socket)와 OS 레벨의 동작 원리를 분석함. HTTP 기반이 아닌 WebSocket(TCP) 통신의 본질을 파악하고 서버가 멈추는 장애 상황을 방지하기 위한 아키텍처를 설계함.

## 2. 소켓의 본질과 OS 구조 (Deep Dive)

### A. "소켓은 파일이다" (Socket as a File)

* **학습 배경:** 리눅스/유닉스 철학인 *"Everything is a file"*에 입각하여 네트워크 통신 또한 파일 입출력(I/O) 메커니즘을 따름을 확인함.
* **File Descriptor (FD):**
* 프로세스(JVM)가 소켓을 생성하면 커널은 이를 가리키는 **정수형 인덱스(FD)**를 반환함.
* 접속자가 1,000명이면 서버는 1,000개의 파일을 열고 있는 것과 동일함.
* **User Mode(JVM) ↔ Kernel Mode(OS):** JVM은 하드웨어(NIC)에 직접 접근 불가. `read()/write()` 시스템 콜을 통해 커널에게 데이터를 요청하며, 이 과정에서 **Context Switching** 비용이 발생함.


* **제약 사항 확인 (실습):** 서버의 `ulimit` 설정이 동시 접속자 수의 물리적 한계가 됨.
* **[실습 방법]** 터미널에서 관리자 권한으로 `netsh int ipv4 show dynamicport tcp` 명령어 입력.
* **결론:** AWS EC2 배포 시 이 값을 튜닝하지 않으면 아무리 좋은 코드를 짜도 `Too many open files` 에러로 서버가 뻗음.



### B. 메모리 모델과 버퍼

* **Socket Buffer:** 소켓 생성 시 커널 영역에 Send Buffer와 Recv Buffer가 할당됨.
* **장애 포인트:** 애플리케이션(User Mode)이 바빠서 Recv Buffer의 데이터를 읽어가지 못하면(Read 지연), TCP Window Size가 0이 되어 패킷 드랍(Packet Drop) 및 재전송이 발생, 결국 연결이 끊어짐.

## 3. I/O 모델의 진화와 선택 (Architecture Decision)

경매 시스템의 서버 모델을 결정하기 위해 Blocking 방식과 Non-Blocking 방식을 비교 분석함.

### A. Blocking I/O (BIO) - Tomcat Default

* **구조:** Connection 1개당 Thread 1개를 할당 (Thread-per-Request).
* **문제점:**
1. **Thread 폭발:** 접속자가 1만 명이면 스레드 1만 개 필요.
2. **OOM 위험:** 스레드당 스택 메모리(약 1MB) 점유 → 메모리 부족으로 JVM Crash.
3. **Blocking:** 클라이언트가 입찰을 안 하고 가만히 있으면 스레드도 아무 일 못 하고 대기(낭비).



### B. Non-Blocking I/O (NIO) - Netty (선택)

* **구조:** 소켓을 Non-Blocking 모드로 설정하고, Selector(Multiplexer)가 수천 개의 소켓(FD)을 감시함.
* **동작 원리 (Event Loop):**
* 단일 스레드(또는 소수)가 "데이터가 도착한 소켓"만 골라냄 (`epoll` 기반).
* 데이터가 준비되었을 때만 로직을 수행하므로, 스레드 대기 시간이 없음.


* **결론:** 경매 타이머 및 실시간 입찰 정보 전파를 위해 **Spring WebSocket (Netty 기반/NIO 활용)** 방식을 채택.

## 4. [실습] Wireshark를 이용한 패킷 분석

이론으로 배운 "TCP 가상 회선"과 "세그먼트" 개념을 눈으로 확인하기 위해 패킷 캡처를 수행함.

### A. 환경 구성

1. 로컬에서 Spring Boot WebSocket 서버 구동 (Port: 8080).
2. Wireshark 실행 후 Loopback 인터페이스 선택.
3. 필터 적용: `tcp.port == 8080`.

### B. 분석 결과 (Key Findings)

#### 1) 연결 수립 (3-Way Handshake)

* **현상:** 경매장 입장 시 `[SYN]` → `[SYN, ACK]` → `[ACK]` 패킷이 순차적으로 오고 감.
* **의미:** 논리적인 연결(가상 회선)이 생성됨.

#### 2) 프로토콜 업그레이드 (HTTP → WebSocket)

* **현상:** HTTP `GET /ws` 요청에 `Upgrade: websocket` 헤더가 포함됨. 이후 프로토콜이 `WebSocket`으로 변경됨.

#### 3) 데이터 전송 (Data Transfer)

* **현상:** 입찰 버튼 클릭 시 `[PSH, ACK]` 플래그가 달린 패킷 발생.
* **분석:** `PSH` (Push) 플래그는 버퍼에 데이터를 쌓지 말고 즉시 애플리케이션으로 올리라는 뜻. 실시간 경매의 중요성을 보여줌.

## 5. 성능 위협 요소: JVM과 GC (Stop-the-World)

### A. 장애 시나리오 분석

* **상황:** 경매 마감 10초 전, 트래픽 폭주로 객체(입찰 로그)가 힙 메모리에 급증.
* **발생:** JVM이 메모리 확보를 위해 **Full GC** 수행 → **Stop-the-World** 발생 (모든 애플리케이션 스레드 정지).
* **결과**
1. User Mode(서버)가 멈춤.
2. Kernel Mode의 소켓 버퍼(Recv Buffer)는 계속 차오름.
3. 버퍼 오버플로우 발생 → 패킷 유실 → 클라이언트(유저)는 "네트워크 불안정" 오류 경험.



### B. 대응 전략

* **객체 생명주기 관리:** 불필요한 객체 생성을 줄여 Eden 영역에서 GC가 끝나도록 유도.
* **모니터링:** VisualVM 등을 통해 Heap 메모리 사용량과 GC 빈도를 관찰하며 튜닝 필요.

## 6. 결론 및 향후 계획

* **기술 스택 확정:** 대용량 연결 처리에 유리한 **NIO 기반의 WebSocket** 사용.
* **OS 튜닝:** 배포 시 `ulimit` 설정을 반드시 확인 및 상향 조정.
* **네트워크 관점:** 개발 단계에서부터 Wireshark를 활용해 불필요한 패킷 전송이나 핸드셰이크 지연이 없는지 검증하는 습관을 가짐.