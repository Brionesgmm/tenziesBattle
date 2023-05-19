import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (serverPath) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("useSocket called");
    const socketIo = io(serverPath);
    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [serverPath]);

  return socket;
};

export default useSocket;
