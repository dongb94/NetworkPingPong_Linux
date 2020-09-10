using System;
using System.IO;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using UnityEngine;

public class NodeJsTCPPingpong : MonoBehaviour
{
    private const string IP = "13.125.85.119";
    private const int PORT = 3000;

    private const int MAX_BUFFER_SIZE = 65535;
    private const int RESERVE_SIZE = 32;

    private int m_nRecvBufferSize = 0;

    private byte[] _sendBuffer;
    private byte[] _rcvBuffer;
    private Socket _socket;

    private Thread _recvListen;

    private int recvSize;

    public void Awake()
    {
        _rcvBuffer = new byte[MAX_BUFFER_SIZE];
        _sendBuffer = new byte[MAX_BUFFER_SIZE];

        var sendMsg = "echo message";
        _sendBuffer = Encoding.UTF8.GetBytes(sendMsg);

        Connect();
    }

    public Socket Connect()
    {
        try
        {
            if (_socket != null && _socket.Connected) return _socket;
            _socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            _socket.SendBufferSize = _socket.ReceiveBufferSize = short.MaxValue;
            _socket.NoDelay = true;
            _socket.ReceiveTimeout = 500;
            _socket.Connect(IP, PORT);

            if (_socket != null)
            {
                if (_recvListen == null)
                {
                    _recvListen = new Thread(new ThreadStart(DoReceive));
                    _recvListen.IsBackground = true;
                }

                if (!_recvListen.IsAlive)
                    _recvListen.Start();
            }

            _socket.Send(_sendBuffer, 0, _sendBuffer.Length, SocketFlags.None);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }

        return _socket;
    }

    private void DoReceive()
    {
        string msg = "";

        do
        {
            recvSize = 0;
            try
            {
                int size = MAX_BUFFER_SIZE - m_nRecvBufferSize;
                if (size > 0)
                {
                    recvSize = _socket.Receive(_rcvBuffer, m_nRecvBufferSize, size, SocketFlags.None);
                    m_nRecvBufferSize += recvSize;
                    if (recvSize == 0)
                    {
                        recvSize = 0;
                    }
                    else
                    {
                        msg += Encoding.Default.GetString(_rcvBuffer);
                    }
                }
                else
                {
                    recvSize = 1;
                }
            }
            catch (ObjectDisposedException)
            {
                Debug.LogError("tcp close");
            }
            catch (IOException ioex)
            {
                Debug.LogError("WSACancelBlockCall");
                Debug.LogError(ioex);
            }
            catch (Exception ex)
            {
                Debug.LogError(ex);
            }

            Debug.Log("DataReceive: " + recvSize);
        } while (recvSize > 0);

        Debug.Log(msg);

        Debug.Log("DataReceiveComplete");
    }

    private void OnDestroy()
    {
        if (_socket != null)
        {
            _socket.Close();
            Debug.Log("Socket close");
            
        }

        if (_recvListen.IsAlive)
        {
            _recvListen.Abort();
            Debug.Log("Thread abort");
        }
    }
}