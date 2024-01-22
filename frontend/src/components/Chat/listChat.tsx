import {
    gql,
    useMutation,
    useReactiveVar,
    useSubscription,
} from '@apollo/client';
import { useQuery } from '@apollo/react-hooks';
import { GET_USER, KICK, LEAVE_CHAT, REMOVE_CHAT } from './query/query';
import {
    Avatar,
    Divider,
    Group,
    UnstyledButton,
    Text,
    ScrollArea,
    ActionIcon,
    Button,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import {
    AiFillLock,
    AiOutlineDelete,
    AiOutlineSetting,
    AiOutlineUserAdd,
} from 'react-icons/ai';
import { NavbarChat } from './navbar';
import ListMsg from './chatmsg/listMsg';
import Popup from 'reactjs-popup';
import { AskPassword } from './popup/askPassword';
import { EditChat } from './popup/editchat';
import { currentChatVar, currentLoginVar } from '../../apollo/apolloProvider';
import * as moment from "moment";
import { ToastContainer, toast } from 'react-toastify';
import { useLazyQuery } from '@apollo/client';
import { IoMdExit } from 'react-icons/io';


export const ListChat = ({ ...props }) => {
    const { toggleShowCreate, chat_list, refetch } = props;

    const [showMessages, setShowMessages] = useState(false);
    const [showAskPassword, setShowAskPassword] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showAddDm, setShowAddDm] = useState(false);
    const currentChat = useReactiveVar(currentChatVar);
    const currentLogin = useReactiveVar(currentLoginVar);

    /* -------------------------------------------------------------------------- */
    /*                                   Toggle                                   */
    /* -------------------------------------------------------------------------- */

    function toggleShowPassword() {
        setShowAskPassword((prevState) => !prevState);
    }

    function toggleShowMessages() {
        setShowMessages((prevState) => !prevState);
    }

    function toggleShowEdit() {
        setShowEdit((prevState) => !prevState);
    }

    /* -------------------------------------------------------------------------- */
    /*                             Mutation and query                             */
    /* -------------------------------------------------------------------------- */
    const [onRemoveHandler] = useMutation(REMOVE_CHAT, {
        onCompleted: () => {
            refetch();
        },
    });

    const { data, loading, error } = useQuery(GET_USER, {
        variables: {
            userID: currentLogin,
        },
    });

    const [leave] = useMutation(LEAVE_CHAT, {
        onCompleted: async (data) => {
          refetch();
        },
      });

      function kickUser(login: string, uuid: string) {
        leave({
          variables: {
            uuid: uuid,
            userID: login,
          },
        }).then(() => {
          toast.success('You have leave the chat', {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
          });
        }).catch((error) => {
            //console.log(error);
        })
      }


    /* -------------------------------------------------------------------------- */


    return (
        <div className="py-3 px-5">
            <Popup
                open={showAskPassword}
                onClose={() => setShowAskPassword(false)}
                position="top center"
                modal
                nested
            >
                <AskPassword
                    togglePassword={toggleShowPassword}
                    toggleShowMessages={toggleShowMessages}
                    uuid={currentChat.uuid}
                ></AskPassword>
            </Popup>

            <Popup
                open={showEdit}
                onClose={() => setShowEdit(false)}
                position="top center"
                modal
                nested
            >
                <EditChat toggleEdit={toggleShowEdit} refetch={refetch}></EditChat>
            </Popup>


            {showMessages ? (
                <ListMsg
                    setShowMessages={setShowMessages}
                    chat_list={chat_list}
                ></ListMsg>
            ) : (
                <>
                    <NavbarChat></NavbarChat>
                    <ScrollArea
                        style={{
                            height: 450,
                            paddingTop: 10,
                        }}
                        scrollbarSize={5}
                        offsetScrollbars
                    >
                        <h4>public</h4>
                        <Divider my="sm" />

                        {chat_list &&
                            chat_list.aliveChats
                                .filter((elem) => elem.type === 'public')
                                .map((elem) => (
                                    <div key={elem.uuid} style={{ padding: '5px' }}>
                                        <Group className="chat-group">
                                            <UnstyledButton
                                                onClick={() => {
                                                    const lastBan = elem.getBan.find((elem) => elem.login === currentLogin);
                                                    if (lastBan && moment.default().diff(lastBan.bannedUntil, 'minutes') < 0) {
                                                        toast.error('You are banned from this group for ' + (Math.abs(moment.default().diff(lastBan.bannedUntil, 'minutes'))).toString() + " minutes", {
                                                            position: 'top-center',
                                                            autoClose: 5000,
                                                            hideProgressBar: false,
                                                            closeOnClick: true,
                                                            pauseOnHover: true,
                                                            draggable: true,
                                                            progress: undefined,
                                                            theme: 'colored',
                                                        });
                                                    }
                                                    else {
                                                        currentChatVar(elem);
                                                        if (currentLogin !== elem.ownerID && elem.password) {
                                                            toggleShowPassword();
                                                        } else {
                                                            toggleShowMessages();
                                                        }
                                                    }
                                                }}
                                            >
                                                <Group>
                                                    <Avatar size={40} color="blue">
                                                        {elem.password ? (
                                                            <AiFillLock></AiFillLock>
                                                        ) : (
                                                            elem.name.slice(0, 2).toUpperCase()
                                                        )}
                                                    </Avatar>

                                                    <Text>{elem.name}</Text>
                                                </Group>
                                            </UnstyledButton>
                                            
                                            {elem.ownerID === currentLogin && (
                                                <Group>
                                                    <ActionIcon
                                                        onClick={() =>
                                                            onRemoveHandler({
                                                                variables: { uuid: elem.uuid },
                                                            })
                                                        }
                                                    >
                                                        <AiOutlineDelete
                                                            size={20}
                                                            color="red"
                                                        ></AiOutlineDelete>
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        onClick={() => {
                                                            currentChatVar(elem);
                                                            setShowEdit(true);
                                                        }}
                                                    >
                                                        <AiOutlineSetting size={20}></AiOutlineSetting>
                                                    </ActionIcon>
                                                </Group>
                                            )}
                                        </Group>
                                    </div>
                                ))}

                        <h4>private</h4>
                        <Divider my="sm" />

                        {chat_list &&
                            chat_list.aliveChats
                                .filter((elem) => elem.type === 'private')
                                .filter((elem) => elem.userID.includes(currentLogin))
                                .map((elem) => (
                                    <div key={elem.uuid} style={{ padding: '5px' }}>
                                        <Group className="chat-group">
                                            <UnstyledButton
                                                onClick={() => {
                                                    const lastBan = elem.getBan.find((elem) => elem.login === currentLogin);
                                                    if (lastBan && moment.default().diff(lastBan.bannedUntil, 'minutes') < 0) {
                                                        toast.error('You are banned from this group for ' + (Math.abs(moment.default().diff(lastBan.bannedUntil, 'minutes'))).toString() + " minutes", {
                                                            position: 'top-center',
                                                            autoClose: 5000,
                                                            hideProgressBar: false,
                                                            closeOnClick: true,
                                                            pauseOnHover: true,
                                                            draggable: true,
                                                            progress: undefined,
                                                            theme: 'colored',
                                                        });
                                                    }
                                                    else {
                                                        currentChatVar(elem);
                                                        if (currentLogin !== elem.ownerID && elem.password) {
                                                            toggleShowPassword();
                                                        } else {
                                                            toggleShowMessages();
                                                        }
                                                    }
                                                }}
                                            >
                                                <Group>
                                                    <Avatar size={40} color="blue">
                                                        {elem.password ? (
                                                            <AiFillLock></AiFillLock>
                                                        ) : (
                                                            elem.name.slice(0, 2).toUpperCase()
                                                        )}
                                                    </Avatar>

                                                    <Text>{elem.name}</Text>
                                                </Group>
                                            </UnstyledButton>
                                            {
                                                elem.ownerID === currentLogin ?
                                                    <Group>
                                                        <ActionIcon
                                                            onClick={() =>
                                                                onRemoveHandler({
                                                                    variables: { uuid: elem.uuid },
                                                                })
                                                            }
                                                        >
                                                            <AiOutlineDelete
                                                                size={20}
                                                                color="red"
                                                            ></AiOutlineDelete>
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            onClick={() => {
                                                                currentChatVar(elem);
                                                                setShowEdit(true);
                                                            }}
                                                        >
                                                            <AiOutlineSetting size={20}></AiOutlineSetting>
                                                        </ActionIcon>
                                                    </Group>
                                                :

                                                (
                                                    <Group>
                                                    <ActionIcon
                                                        onClick={() => {
                                                            kickUser(currentLogin, elem.uuid);
                                                        }}
                                                    >
                                                        <IoMdExit size={20} color="red"></IoMdExit>
                                                    </ActionIcon>
                                                    </Group>
                                                )
                                            }
                                        </Group>
                                    </div>
                                ))}

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <h4 style={{ marginRight: 'auto' }}>direct messages</h4>
                        </div>

                        <Divider my="sm" />

                        {
                            chat_list &&
                            chat_list.aliveChats
                                .filter((elem) => elem.type === 'dm')
                                .filter((elem) => elem.userID.includes(currentLogin))
                                // .filter((elem) => data.getByLogin.friendList && data.getByLogin.friendList.includes(elem.userID.filter((elem) => elem !== currentLogin)))
                                .map((elem) => (
                                    <div key={elem.uuid} style={{ padding: '5px' }}>
                                        <Group className="chat-group">
                                            <UnstyledButton
                                                onClick={() => {
                                                    elem.name = elem.userID.filter((elem) => elem !== currentLogin);
                                                    currentChatVar(elem);
                                                    if (currentLogin !== elem.ownerID && elem.password) {
                                                        toggleShowPassword();
                                                    } else {
                                                        toggleShowMessages();
                                                    }
                                                }}
                                            >
                                                <Group>
                                                    <Avatar size={40} color="blue">
                                                        {elem.password ? (
                                                            <AiFillLock></AiFillLock>
                                                        ) : (
                                                            elem.userID.filter((elem) => elem !== currentLogin)[0].slice(0, 2).toUpperCase()
                                                        )}
                                                    </Avatar>

                                                    <Text>{elem.userID.filter((elem) => elem !== currentLogin)}</Text>
                                                </Group>
                                            </UnstyledButton>
                                        </Group>
                                    </div>
                                ))}
                    </ScrollArea>

                    <Button
                        style={{
                            bottom: 25,
                            left: 15,
                            position: 'absolute',
                        }}
                        radius="lg"
                        onClick={() => toggleShowCreate(true)}
                    >
                        Add Group
                    </Button>
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
                </>
            )}
        </div>
    );
};
