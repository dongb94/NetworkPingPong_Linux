
using System;
using System.Net.Sockets;
using UnityEngine;

public class UnityNodeJsTCPConnectionTestClient
{
    private const string IP = "13.125.85.119";
    private const int PORT = 3000;
    private Socket _socket;

    public void RecursiveConnection()
    {
        while (true)
        {
            try
            {
                Connect();
                Close();
            }
            catch (Exception e)
            {
                Debug.LogError(e);
                throw;
            }
        }
    }

    public void Connect()
    {
        try
        {
            if (_socket != null) return;
            _socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            _socket.SendBufferSize = _socket.ReceiveBufferSize = short.MaxValue;
            _socket.NoDelay = true;
            _socket.ReceiveTimeout = 1000;
            _socket.Connect(IP, PORT);
        }
        catch (Exception e)
        {
            Debug.LogError(e);
            throw;
        }
    }

    public void Close()
    {
        try
        {
            _socket.Shutdown(SocketShutdown.Both);
            _socket.Disconnect(false);
        }
        catch (Exception e)
        {
            Debug.LogError(e);
            throw;
        }
        finally
        {
            _socket.Close(0);
            _socket = null;
        }
    }
}