import React, { useState, useEffect, useRef } from 'react';
import TypeIt from 'typeit-react';
import Stack from 'react-bootstrap/Stack';
import * as StompJs from '@stomp/stompjs';
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useLocation} from "react-router-dom";
import "../Chat.css"

let stompClient;
const TESTUSER = 1;
const roomId = 1;

const Chat = (props) => {
  const location = useLocation();
  const userInfo = {...location.state };
  
  // 모든 채팅 메세지 저장
  const [messages, setMessages] = useState([]);
  // 현재 다른 사람이 타이핑하는 메세지를 추적 
  const [currentTypingId, setCurrentTypingId] = useState(null);
  // 현재 사용자가 업로드한 이미지 
  const [curImg, setImgFile] = useState("");
  const imgRef = useRef();

  const handleSendMessage = (message) => {
    console.log(message);
    // 소켓으로 메세지 보내기
    sendMessageToSocket(message);

  };

  const handleEndTyping = (id) => {
    setMessages((prevMessages) =>
    
    // 이전 메세지들을 전부 순회하면서, 그 중 제일 최근 메세지의 ChatBot Animation 여부를 false로 바꾼다. (isTyping == 챗봇의 애니메이션 여부) 
      prevMessages.map((msg) =>
        msg.id === id ? { ...msg, isTyping: false } : msg
      )
    );

    // 타이핑이 종료되면, 더 이상 타이핑 중인 메세지가 없으므로 currentTypingId의 상태를 null 로 바꾼다.

    setCurrentTypingId(null);
  };

  //currentTypingId를 최신화 한다.
  useEffect(() => {
    console.log('메세지 배열 혹은 현재 타이핑 ID가 바뀐 것을 확인')
    if (currentTypingId === null) {
      console.log(currentTypingId + "== currentTypingId")
      // User가 아니면서, isTyping이 True인 msg를 messages에서 찾는다.
      const nextTypingMessage = messages.find(
        (msg) => !msg.isUser && msg.isTyping
      );

      // 만약 그런 녀석이 존재한다면, currentTypingId를 그 녀석의 ID로 바꾼다.
      // 이러면 해당 ID의 메세지에 또 다시 타이핑 애니메이션이 나타난다. 
      if (nextTypingMessage) {
        setCurrentTypingId(nextTypingMessage.id);
      }
    }
  }, [messages, currentTypingId]);

  //--------------------------웹 소켓 파트 입니다. ------------------------------


  
  const clientHeader = {Authorization: " Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3anNhb3MyMDgxQG5hdmVyLmNvbSIsImV4cCI6MTcwOTAwMDc5MywiaWF0IjoxNzA2NDA4NzkzfQ.6QDpfmBeUZ6xSOTNWexdeV0EgJVaMcaEPbAMpad-pDM"};
  
  const connect =  (event) => {
    var sockJS = new SockJS("http://localhost:8080/ws-stomp");
    stompClient = Stomp.over(sockJS);
    console.log(stompClient)
  
    stompClient.connect(clientHeader,onConnected, onError);

  }
  
  // 첫 연결 및 환영 메세지 보내기 
  function onConnected() {
      console.log("채팅 앱 첫 연결 실행!")
      stompClient.subscribe("/sub/chat/room/"+ roomId,onMessageReceivedFromSocket ,{userId: userInfo.userId, chatRoomType: "ONE" } )
      stompClient.send("/pub/chat/enterUser",clientHeader,JSON.stringify({meesageType: "ENTER", content: userInfo.name + "님 환영합니다!", userId: TESTUSER, chatRoomId: roomId }))
  }



  function onError (error) {
    console.log(error);
  }

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
  
  // 메세지 받는 로직 -> subscribe의 두번째 로직으로 넣으면 해당 주소로 들어오는 메세지를 다 받는다. 
  function onMessageReceivedFromSocket (payload){
    
    var chat = JSON.parse(payload.body);
    console.log("들어온 메세지:" + chat.content);

    const messageDTO = {
      isUser: chat.userId === TESTUSER? true : false,
      text: chat.content,
      isTyping: chat.userId === TESTUSER? false : true,
      id: Date.now(),
      imgCode: chat.imgCode
    }

    /*
         // 내가 쓴 메세지
      { text: chat.content, isUser: true },

      // ChatBot이 쓴 메세지 
      {
        text: `당신의 메세지는: "${chat.content}"`,
        isUser: false,
        // 타이핑 애니메이션을 내는 트리거 
        isTyping: true,
        id: Date.now()
      }
    */


    // 소켓에서 받은 메세지를 전체 배열에 넣는 걸로 바꿔야함. 
    // 이전 메세지를 받아서 메세지 전체 배열에 저장 
    setMessages((prevMessages) => [
      ...prevMessages,
        messageDTO
    ]);
  
  }

  useEffect(()=> {
    connect()

    return () => stompClient.disconnect(function(){
      alert("see you next Time!!")
    })
  },[])


  //---------------------------웹소켓 끝---------------------------------

  return (
    <div className="chat">
      <div className="chat-box">
        <text style={{fontWeight: 'bold'}}>🤢{userInfo.alias}🤢</text> <h1>{userInfo.name}</h1>

        {/* 전송된 메세지들이 보이는 공간 messages => 메세지 배열, currentTypingId => 현재 타이핑 중인 메세지 ID, onEndTyping => 메세지 입력이 끝났을 때 호출하는 함수  */}
        <MessageList
          messages={messages}
          currentTypingId={currentTypingId}
          onEndTyping={handleEndTyping}
        />
        {/* 메세지가 쳐지는 INPUT FORM onSendMessage => 새로운 메세지가 전송될 때 호출하는 함수  */}
        <ImageUploader userInfo = {userInfo}/>
        <MessageForm onSendMessage={handleSendMessage} userInfo = {userInfo} />
      </div>
    </div>
  );
};

const MessageList = ({ messages, currentTypingId, onEndTyping }) => (
  <Stack className="messages-list">
    {/* 메세지 배열을 map 함수 돌려서 Message 배열에 넣고 있다. */}
    {messages.map((message, index) => (
      // 메세지 하나하나를 나타내는 컴포넌트
      <Message
        key={index}
        {...message}
        onEndTyping={onEndTyping}
        currentTypingId={currentTypingId}
      />
    ))}
  </Stack>
);

const Message = ({
  text,
  isUser,
  isTyping,
  id,
  imgCode,
  onEndTyping,
  currentTypingId
}) => {
  return (
    //메세지 타입에 따라 클래스 이름이 달라지도록! 
    <div className={isUser ? "user-message" : "ai-message"}>
      {/* isTyping = 애니메이션을 할까말까 boolean값, curretTypingId는 제일 최근에 쳤던 메세지 ID */}
      {isTyping && currentTypingId === id ? (
        imgCode !== null? (<p>
          <img
          src= {imgCode}
          height="200"
          wieght="200"
          />
        </p>) : (<p>
          <b>친구</b>:<TypeIt options={{
            speed: 50,
            waitUntilVisible: true,
            afterComplete: () => onEndTyping(id)
          }}>{text}</TypeIt> 
        </p>)

      ) : (imgCode !== null? (<p>
        <img
        src= {imgCode}
        height="200"
        wieght="200"
        />
      </p>) : (  <p>
        {/* 그냥 사용자라면 USER로 쳐지도록 함. */}
        <b>{isUser ? "당신" : "친구"}</b>: {text}
      </p>))}
    </div>
  );
};

const MessageForm = ({ onSendMessage, userInfo }) => {
  const [message, setMessage] = useState("");


  // 입력 끝나고 Enter나 전송 버튼 눌렀을 때 해야될 상황
  const HandleSubmit = (event) => {
    event.preventDefault();
    
    // 보내는 메세지에 금방 쓴 메세지를 메세지 배열 속에 넣는 함수에 인수로 넣기 
    onSendMessage(message);
    // 입력 칸은 비우기 
    setMessage("");


  };

  return (
    <form onSubmit={HandleSubmit} className="message-form">
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="message-input"
      />
      <button type="submit" className="send-button">
        Send
      </button>
    </form>
  );

}

// 이미지 보내는 로직
const ImageUploader = ({userInfo}) => {

  const [baseImage, setBaseImage] = useState("");

  const handleImageChange = async (e) => {
        console.log(e.target.files);
        const file = e.target.files[0];
        const base64 = await convertBase64(file);

        //console.log(base64);

        var chatMessage = {
          "chatRoomId": userInfo.roomId,
          "userId": TESTUSER,
          "content": null,
          "messageType": "TALK",
          "imgCode": base64
        }


        console.log(chatMessage)

        stompClient.send("/pub/chat/sendMessage", {},JSON.stringify(chatMessage));


  };

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      }

    })
  }



  return(
    <div style={{display: "inline"}}>
      <input type='file' onChange={handleImageChange}/>
      <img src={baseImage} height="200px"/>
    </div>
  )

}



export default Chat;