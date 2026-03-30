import React, { useEffect, useState } from 'react'

const Users = () => {
    const[users,setUsers]=useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        fetch('https://fakestoreapi.com/users')
        .then(response=>response.json())
        .then(data=>{setUsers(data)
        setLoading(false)})
        .catch(error=>{
            console.error('حدث خطأ',error)
            setLoading(false);
        });
    },[]);
    if(loading){
       return <p>جاري تحميل .......</p>
    }
  return (
    <div>
        <h2>قائمة المستخدمين </h2>
        <ul>
            {users.map(user=>(<li key={user.id}>
                <strong>الاسم</strong>{user.username}<br/>
                <strong>الايميل </strong>{user.email}<br/>
                <strong>الهاتف </strong>{user.phone}<br/>


            </li>))}
        </ul>

    </div>
  )
}

export default Users;