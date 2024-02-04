import axios from "axios";
import { useEffect, useState } from "react";
import Alert from 'react-bootstrap/Alert';
import TouchList from "./TouchList";
const Home = () => {

  const [userInfos, setUserInfos] = useState([]);

  const findAllRoom = () => {
    axios.get('http://localhost:8080/api/friends/dm', {headers: {Authorization: " Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3anNhb3MyMDgxQG5hdmVyLmNvbSIsImV4cCI6MTcwOTAwMDc5MywiaWF0IjoxNzA2NDA4NzkzfQ.6QDpfmBeUZ6xSOTNWexdeV0EgJVaMcaEPbAMpad-pDM" }})
    .then((response) => {
      console.log(response);
      console.log(response.data.data);

      setUserInfos(response.data.data);

    }).catch((error) => {
      console.log(error);
    })



  }

  

  useEffect(() => {
    console.log("Home 화면이 나타남!")
    findAllRoom();


    return () => {
      console.log("Home 화면이 사라짐!")
    }
  },[])

return (
  <div style={{backgroundColor: "black"}}>
      <Alert variant='primary'>
         채팅방 리스트
        </Alert>
    <TouchList users={userInfos}/>
  </div>
)

}

export default Home;