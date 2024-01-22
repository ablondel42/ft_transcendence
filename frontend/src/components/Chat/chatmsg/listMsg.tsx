import { ActionIcon, Avatar, Button, Group, ScrollArea, Text } from "@mantine/core";
import { getHotkeyHandler, useScrollIntoView } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { MoodHappy, Send } from "tabler-icons-react";
import ChatBox from "./chatBox";
import { useLazyQuery, useMutation, useQuery, useReactiveVar, useSubscription } from "@apollo/client";
import { ADDTOCHAT, GET_CHAT, GET_MESSAGES, GET_USER, MESSAGE_ADDED_SUBSCRIPTION } from "../query/query";
import { IoIosArrowBack } from "react-icons/io";
import { FaUserFriends } from "react-icons/fa"
import { MemberList } from "./member_list";
import axios from "axios";
import { currentAvatarVar, currentChatVar, currentLoginVar } from "../../../apollo/apolloProvider";
import { ChatMessages } from './messages';
import { ToastContainer, toast } from 'react-toastify';

const ListMsg = ({ ...props }) => {
  const { setShowMessages } = props;

  const [showMembers, setShowMembers] = useState(false);
  const currentChat = useReactiveVar(currentChatVar);
  const currentLogin = useReactiveVar(currentLoginVar);

  function toggleShowMembers() {
    setShowMembers(!showMembers);
  }

  /* -------------------------------------------------------------------------- */
  /*                             Mutation and query                             */
  /* -------------------------------------------------------------------------- */

    const { loading, error, data, subscribeToMore, refetch } = useQuery(GET_CHAT, {
        onCompleted: (data) => {
            //console.log(data);
        },
        variables: {
            uuid: currentChat.uuid,
        },
        fetchPolicy: 'network-only',
    });

    const [addToChat] = useMutation(ADDTOCHAT, {
        onCompleted: async (data) => {
          refetch();
        }
      });

    if (loading) {
        return <>Loading...</>;
    }
    if (error) {
        window.location.reload();
    }

    function addUser(login: string) {
        if (data.chats.userID.includes(login)) {
          toast.error('User is already added!', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          return;
        }
        axios.get(`http://localhost:3001/app/users/avatar/${login}`).then(response => {
          addToChat({
            variables: {
              uuid: currentChat.uuid,
              userID: login,
            }
          }).then(() => {
            toast.success('You have join the chat', {
              position: 'top-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            });
          }).catch((error) => {})
        }).catch((error) => {})
      }

    const subscribeToNewMessage = () => {
        subscribeToMore({
            document: MESSAGE_ADDED_SUBSCRIPTION,
            variables: { uuid: currentChat.uuid },
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) {
                    return prev;
                }
                const newFeedItem = subscriptionData.data.messageAdded;
                const res = Object.assign({}, prev, {
                    chats: {
                        getMessages: [...prev.chats.getMessages, newFeedItem],
                        getMute: prev.chats.getMute,
                        getBan: prev.chats.getBan,
                        muteID : prev.chats.muteID,
                        adminID: prev.chats.adminID,
                        userID: prev.chats.userID,
                        ownerID: prev.chats.ownerID,
                        uuid: prev.chats.uuid,
                        index: prev.chats.index + 1,
                        name: prev.chats.name,
                        type: prev.chats.type,
                    },
                });
                return res;
            },
        });
    };

    return (
        <>
            <div>
                    <div className="top-bar">
                        <ActionIcon onClick={() => setShowMessages(false)}>
                            <IoIosArrowBack />
                        </ActionIcon>
                        <h4 className="title">{currentChat.name}</h4>
                        <ActionIcon onClick={() => toggleShowMembers()}>
                            <FaUserFriends />
                        </ActionIcon>
                    </div>
        
        
                        {
                            data.chats.userID.includes(currentLogin) ?
                                showMembers ?
                                    <MemberList subscribeToNewMessage={subscribeToNewMessage} chat={data.chats} refetch={refetch}></MemberList>
                                    :
                                    <ChatMessages subscribeToNewMessage={subscribeToNewMessage} chatMessages={data.chats.getMessages} refetch={refetch} chat={data.chats}></ChatMessages>
                            :
                                <div className="center">
                                    <Button
                                        onClick={() => addUser(currentLogin)}
                                    >Join Channel</Button>
                                </div>
        
                        }
            </div>
        </>
    );
};

export default ListMsg;
