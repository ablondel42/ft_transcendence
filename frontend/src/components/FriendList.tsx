import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createStyles, Table, ScrollArea, Avatar} from '@mantine/core';
import { FcCheckmark} from 'react-icons/fc';
import { RxCross1 } from 'react-icons/rx';
import { Button } from '@mantine/core';
import { useMutation, useReactiveVar, useLazyQuery } from '@apollo/client';
import { CREATE_CHAT, GET_CHATS, REMOVE_CHAT } from './Chat/query/query';
import { currentLoginVar } from '../apollo/apolloProvider';
import { useQuery } from '@apollo/react-hooks';

export const FriendList = () => {
  const [friendlist, setfriendlist] = useState([]);
  const [invites, setInvites] = useState([]);
  const currentLogin = useReactiveVar(currentLoginVar);

  useEffect(() => {
    async function fetchData() {
      const id = sessionStorage.getItem('currentUser');
      const friends = await axios.get(
        `http://localhost:3001/app/users/friends/${id}`,
      );
      const invitations = await axios.get(
        `http://localhost:3001/app/users/pending/${id}`,
      );
      setfriendlist(friends.data);
      setInvites(invitations.data);
    }
    fetchData();
  }, []);

  const [createChat] = useMutation(CREATE_CHAT, {
    onCompleted: () => {
    }
  });

  const [removeChat] = useMutation(REMOVE_CHAT, {
    onCompleted: () => {
    }
  });

  const {data} = useQuery(GET_CHATS, {});

  const Friend_List = friendlist.map((id) => (
    <tr key={id.id}>
      <td className='friend'>
        <Avatar src={`data:image/jpeg;base64,${id.avatar}`} size="md"/>
        {id.pseudo} {id.status === "online" ? <FcCheckmark/> : <RxCross1 color='red'/>}
        <Button
                  onClick={async () => {
                    await axios
                      .get(
                        `http://localhost:3001/app/users/remove/${sessionStorage.getItem(
                          'currentUser',
                        )}/${id.login}`,
                      )
                      .catch((err) => console.log(err))
                      .then(() => {
                        data && data.aliveChats.map((elem) => {
                          if(elem.type === 'dm' && elem.userID.includes(currentLogin))
                            removeChat({variables : { uuid: elem.uuid }})
                        })
                        window.location.reload();
                      });
                  }}
                >
                  Remove / Unfriend
                </Button>
        </td>
    </tr>
  ));

  const FriendRequest = invites.map((id) => (
    <tr key={id.id}>
      <td className='friend'>
        <Avatar src={`data:image/jpeg;base64,${id.avatar}`} size="md"/>
        {id.pseudo} {id.status === "online" ? <FcCheckmark/> : <RxCross1 color='red'/>}
        <Button
                  onClick={async () => {
                    await axios
                      .get(
                        `http://localhost:3001/app/users/accept/${sessionStorage.getItem(
                          'currentUser',
                        )}/${id.login}`,
                      )
                      .catch((err) => console.log(err))
                      .then(() => {
                        createChat({
                          variables: {
                            newChat: { name: id.pseudo, type: "dm", password: "", ownerID: id.login, userID: [currentLogin, id.login] },
                          }
                        });
                        window.location.reload();
                      }
                      );
                  }
                }
                >
                  Accept
                </Button>
                <Button
                  onClick={async () => {
                    await axios
                      .get(
                        `http://localhost:3001/app/users/decline/${sessionStorage.getItem(
                          'currentUser',
                        )}/${id.login}`,
                      )
                      .catch((err) => console.log(err))
                      .then(() => window.location.reload());
                  }}
                >
                  Decline
                </Button>
        </td>
    </tr>
  ));


  return (
    <div>
      <ScrollArea h={600} >
        <Table miw={700}>
          <thead >
            <tr>
              <th>Friend</th>
            </tr>
          </thead>
          <tbody>{Friend_List}</tbody>
        </Table>
      </ScrollArea>
      <ScrollArea h={200} >
      <Table miw={700}>
        <thead >
          <tr>
            <th>Request</th>
          </tr>
        </thead>
        <tbody>{FriendRequest}</tbody>
      </Table>
    </ScrollArea>
  </div>
  );
};
