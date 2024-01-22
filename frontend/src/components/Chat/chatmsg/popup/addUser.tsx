import { gql, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { TextInput, Checkbox, Button, Group, Box, SegmentedControl, PasswordInput, Text, ActionIcon, Card, ScrollArea, Avatar } from '@mantine/core';
import { IoMdClose } from 'react-icons/io';
import { ToastContainer, toast } from 'react-toastify';
import { ADDTOCHAT, GET_USERS } from '../../query/query';
import axios from 'axios';
import { currentChatVar, currentLoginVar } from '../../../../apollo/apolloProvider';
import { useState } from 'react';
import { RiVipCrownFill } from 'react-icons/ri';
import { GrAddCircle } from 'react-icons/gr';


export const AddUser = ({ toggleShow, chat, refetch }: any) => {
  const [usersInfo, setUsersInfo] = useState([]);
  const currentChat = useReactiveVar(currentChatVar);

  const [addToChat] = useMutation(ADDTOCHAT, {
    onCompleted: async (data) => {
      refetch();
    }
  });

  const { loading, error } = useQuery(GET_USERS, {
    onCompleted: async (data) => {
      const users = data.user;
      const usersInfo = [];

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userInfo = {
          login: user.login,
          avatar: null,
          pseudo: user.pseudo,
        };

        try {
          const response = await axios.get(
            `http://localhost:3001/app/users/avatar/${user.login}`,
          );
          userInfo.avatar = response.data.avatar;
        } catch (error) {
        }
        usersInfo.push(userInfo);
      }
      setUsersInfo(usersInfo);
    },
  });

  if (loading) {
    return <>Loading...</>;
  }
  if (error) {
    return <>ERROR</>;
  }

  return (
    <Card
      withBorder
      sx={{
        borderRadius: 15,
      }}
      style={{
        padding: 15,
        position: 'absolute',
        width: 250
      }}
    >
      <ActionIcon
        onClick={() => toggleShow()}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
        }}
      ><IoMdClose size={15}></IoMdClose>
      </ActionIcon>

        {
          usersInfo && usersInfo.filter((elem) => !chat.userID.includes(elem.login))[0] ?
            <ScrollArea style={{ maxHeight: 300 }} scrollbarSize={8}>
              {
                usersInfo.filter((elem) => !chat.userID.includes(elem.login))
                .map((elem, index) => (
                  <Group key={index} id={'id' + index} style={{ padding: '5px' }}>
                    <Avatar
                      src={`data:image/jpeg;base64,${elem.avatar}`}
                    ></Avatar>
                    <Text>{elem.pseudo}</Text>
                    <ActionIcon>
                      <GrAddCircle size={20}
                        color='blue'
                        onClick={() => {
                          addToChat({
                            variables: {
                              uuid: currentChat.uuid,
                              userID: elem.login,
                            }
                          }).then(() => {
                            toast.success('User has been added to chat', {
                              position: 'top-center',
                              autoClose: 5000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              theme: 'colored',
                            });
                            toggleShow();
                          }).catch((e) => {
                          });
                        }}
                      ></GrAddCircle>
                    </ActionIcon>
                  </Group>
                ))
              }
            </ScrollArea>
            :
            <h1>Nobody can be add !</h1>
        }
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Card>
  );
}