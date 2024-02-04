# STOMP Web Socket Test 용 클라이언트 견본 (React) 

 ### 0. 왜 만들었는가

STOMP로 만든 Web Socket은 테스트하기가 어렵다. 왜냐하면 POST MAN이나 기타 확장 테스트 프로그램에서 STOMP 웹 소켓 통신을 지원하지 않기 때문이다. 따라서 백앤드 개발자가 서버를 다 만들어도, 이게 제대로 동작하는 것인지 가늠하기가 어렵다. 그래서 테스트 용으로 만들었고, VS-Code를 깔아본 적 없는 분들도 사용할 수 있게 설명을 곁드리겠다. 

### 1. 환경 세팅 및 설치 

필요한 환경 

-  node js 설치 >> 이건 구글에 쳐봐도 많이 나오니까 과정은 생략하겠다. 그냥 최신버전 깔아주면 된다. 

-  vs code 설치 >> 이것도 구글에 치면 잘 나온다. 

- npm 설치

  이거 전에 먼저 node js가 잘 설치되었는지 확인 바란다. cmd 창 키고 

  ```markdown
  node -v
  ```

  해보고 되면 vs code 열어라 

  그 다음 vs code 터미널 창에 

  ```markdown
  npm install
  ```



### 2. 클라이언트 실행 

터미널 창에 다음과 같이 치면 된다.

```markdown
npm start 
```

만약 소켓 통신을 확인하기 위해 2개 이상의 클라이언트가 필요할 경우 

package.json을 열고, scripts라 적힌 JSON을 찾아라 기본으로 해당 클라이언트가 열리는 port는 localhost:3000 이다. 근데 이걸 포트 3002번으로 바꾸고 싶다면, 다음과 같이 써라 

```javascript
  "scripts": {
    "start": "set PORT=3002 && react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
```

start 부분에 set Port=열고 싶은 포트 번호를 해주면 된다. 

### 3. 클라이언트 내용 설명 

해당 클라이언트는 제일 먼저 채팅방 리스트를 화면에 받고, 그 중 하나의 채팅방을 누르면, 그 채팅방 정보가 React Router를 통해 넘어간다. 그리고 그 정보를 통해 웹소켓 연결, 구독 실행을 한다. 

내 채팅방 화면에서 필요한 내용은 다음과 같다. 
```java
    private long roomId;
    private ChatRoom.ChatRoomType chatRoomType;
    private String friendName;
    private String friendEmail;
    private String friendImgUrl;
    private boolean isLogin;
    private String friendAlias;
    private String lastMessage;
    private LocalDateTime lastWrittenMessageTime;
    private int unreadMessageCnt;
```

![image](https://github.com/dalcheonroadhead/ReactChatClient/assets/102154788/f50d27fe-386a-44d3-b0a5-d15a7f6c918e)


여기서 하나를 클릭하면, 

![image](https://github.com/dalcheonroadhead/ReactChatClient/assets/102154788/967114e6-2c50-4acb-89d4-f5579d895f30)


연결됨. 

나는 채팅방 화면이 랜더링 될 때 자동으로 해당 채팅방 번호로 연결 및 구독 설정을 해놓았다. 

```javascript
  const connect =  (event) => {
    var sockJS = new SockJS("http://localhost:8080/ws-stomp");
    stompClient = Stomp.over(sockJS);
  
    stompClient.connect(clientHeader,onConnected, onError);
  }
```

위의 코드는 첫 연결을 위한 함수이다. 위에서 3개의 인자를 받는 것을 알 수 있다. 첫번쨰 인자는 connect 성공시에 백엔드로 보내지게될 Client 헤더이다. 백엔드인 Spring Boot에서 보면, 
![image](https://github.com/dalcheonroadhead/ReactChatClient/assets/102154788/8330a365-dbf1-485a-b505-2c7d6adb1e7b)


이런식으로 뜨고, header 내용을 다 보면,

```java
 [headers={simpMessageType=MESSAGE, stompCommand=SEND, nativeHeaders={destination=[/pub/chat/enterUser], Authorization=[ Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3anNhb3MyMDgxQG5hdmVyLmNvbSIsImV4cCI6MTcwOTAwMDc5MywiaWF0IjoxNzA2NDA4NzkzfQ.6QDpfmBeUZ6xSOTNWexdeV0EgJVaMcaEPbAMpad-pDM], content-length=[91]}, simpSessionAttributes={}, simpHeartbeat=[J@5664da93, lookupDestination=/chat/enterUser, simpSessionId=ksi4mdqr, simpDestination=/pub/chat/enterUser}]
```

이런식으로 온다. 우리는 여기서 필요한 자료를 꺼내 보면 된다. 

다시 프론트로 넘어가서 StompClient.connect()의 두 번째 인자는 연결 성공 시 실행될 콜백함수이다. 나는 해당 콜백함수에서 바로 특정 URL 주소를 바로 구독신청했다. 다음으로 코드를 보여주겠다.

```javascript
  
  // 첫 연결 및 환영 메세지 보내기 
  function onConnected() {
      console.log("채팅 앱 첫 연결 실행!")
      stompClient.subscribe("/sub/chat/room/"+ roomId,onMessageReceivedFromSocket ,{userId: userInfo.userId, chatRoomType: "ONE" } )
      stompClient.send("/pub/chat/enterUser",clientHeader,JSON.stringify({meesageType: "ENTER", content: userInfo.name +"님 환영합니다!", userId: TESTUSER, chatRoomId: userInfo.roomId }))
  }

```
여기서 onMessageReceivedFromSocket이라는 함수가 두번째 인자로 들어온 것을 알 수 있는데, 해당 함수는 첫 번째 인자 주소로 메세지가 들어오면, 실행되는 콜백함수이다. 해당 subscribe란 명령어는 성공이 된다면 해당 랜더링된 페이지가 onMount될 때까지 쭉 실행되는데, 이때 첫번째 인자의 구독 주소로 백엔드가 메세지를 보내는지 계속 확인한다. 백엔드 코드를 잠시 보면, 
![image](https://github.com/dalcheonroadhead/ReactChatClient/assets/102154788/ac928c1d-e209-43cc-b8ac-30009f413cc7)
이렇게 일처리를 끝낸 다음에는 맨 마지막에 프론트가 등록한 구독 주소로 메세지를 다시 보낸다. 그러면 프론트에서 수신이 가능하다. 그러면 OnMessageReceivedFromSocket 함수를 보자. 

```javascript
  // 메세지 받는 로직 -> subscribe의 두번째 로직으로 넣으면 해당 주소로 들어오는 메세지를 다 받는다. 
  function onMessageReceivedFromSocket (payload){
    
    var chat = JSON.parse(payload.body);
    console.log("들어온 메세지:" + chat.content);
    const messageDTO = {
      isUser: chat.userId === TESTUSER? true : false,
      text: chat.content,
      isTyping: chat.userId === TESTUSER? false : true,
      id: Date.now()
    }
```
다음과 같이 들어온 메세지를 Parsing 해서, 다시 사용하는 함수이다. 

다음은 그냥 Send 하는 함수이다. 
```javascripte
  // 메세지 보내는 로직 
  function sendMessageToSocket(message) {

      var chatMessage = {
        "chatRoomId": roomId,
        "userId": TESTUSER,
        "content": message,
        "messageType": "TALK"
      }
      stompClient.send("/pub/chat/sendMessage", {},JSON.stringify(chatMessage));
  }
```
메세지를 정제해서 보내주기만 하면 된다. 첫번째 인자는 주소, 두 번째 인자는 Header, 세 번째 인자는 메세지 내용이 들어간다. 

마지막으로 웹 소켓 연결을 끊는 함수이다. 

```javascript
stompClient.disconnect(function(){
      alert("see you next Time!!")
    }, {userId: userInfo.userId, chatRoomId: userInfo.roomId }, {userId: userInfo.userId, chatRoomId: userInfo.roomId })
```

이 함수는 방을 나가버릴 때, 브라우저나 우리 앱을 끌때 실행된다. 
첫번째 인자의 콜백 함수가 실행되고 연결이 끊긴다. 
2,3번은 Header나 Message로 값을 넣어보려고 했는데... 실패한 흔적이다. 

이상 테스트 할 수 있는 웹 소켓 코드였다... 나도 Spring man이라 이 이상 정확한 건 몰라서 공부해 봐야 한다. 
하지만 STOMP를 공부하는 Spring 개발자들에게 도움이 되면 좋겠다. 

