import React from "react";
import { useNavigate } from "react-router-dom"
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';
import imgLogo from '../assets/giphy.gif';
import { Card } from "react-bootstrap";


const TouchList = ({users}) =>{
  const navigate = useNavigate();


  return (
    <div>
      {users.map(user => {
        return(<Button key={user.roomId} onClick={ () => navigate('/chat' ,{state: {userId: user.friendEmail ,roomId: user.roomId, name: user.friendName, alias: user.friendAlias }})}>
    <Card style={{ width: '18rem', backgroundColor: "transparent"}}>
      <Card.Img src={imgLogo} />
      <Card.Body>
        <Card.Title style={{color: "white"}}>{user.friendName}님의 {user.chatRoomType == "ONE"? "1대1" : "중계"} 채팅방</Card.Title>
        <Card.Text style={{color: "white"}}>
          <p>칭호: {user.friendAlias}</p>
          <p>로그인 중 인가요? : {user.login == false? "아니요": "예"}</p>
          <p>마지막 메세지: {user.lastMessage}</p>
          <p>마지막 메세지 보낸 시간: {user.lastWrittenMessageTime == null? "없음" : user.lastWrittenMessageTime}</p>
        </Card.Text>
      </Card.Body>
    </Card>
        </Button>)
      })}



    </div>
  )
}

export default TouchList;