import React, {useEffect} from "react";
import * as StompJs from '@stomp/stompjs';
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useLocation, useNavigate } from "react-router-dom";

const Test = (props) => {
let stompClient;
const location = useLocation();
const roomId = location.state.roomId;

const connect =  () => {
  var sockJS = new SockJS("http://localhost:8080/ws-stomp");
  stompClient = Stomp.over(sockJS);

  stompClient.connect({Authorization: " Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3anNhb3MyMDgxQG5hdmVyLmNvbSIsImV4cCI6MTcwOTAwMDc5MywiaWF0IjoxNzA2NDA4NzkzfQ.6QDpfmBeUZ6xSOTNWexdeV0EgJVaMcaEPbAMpad-pDM"}, function(frame) {
    

    stompClient.subscribe("/sub/chat/room/"+ roomId, function(message){
      if(message != null){
        var parseData = JSON.parse(message.body);
        console.log(parseData);
      }
    }, {userId: 1, chatRoomType: "ONE" })
  })
}



useEffect(() => {
  connect();
  


}, [])

return (
  <div>
    TEST!!!
    <button onClick={() => {
      console.log('버튼 클릭됨');
      stompClient.publish({
        destination: '/chat/message',
        body: JSON.stringify({"type": "ENTER", "userId": "전수민", "content": "전수민 님이 입장하였습니다!", "chatRoomId": "1"})
      })
    }}>
      클릭해서 메세지를 보내보세요
    </button>
  </div>

);

}



export default Test;