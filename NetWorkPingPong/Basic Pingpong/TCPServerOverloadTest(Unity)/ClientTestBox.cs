using System;
using UnityEngine;
using UnityEngine.Experimental.PlayerLoop;
using UnityEngine.UI;

public class ClientTestBox : MonoBehaviour
{
    public MultiClientTestUI Command;
    
    private static readonly Color RecvColor = new Color(0,1,0);
    private static readonly Color DisConnectColor = new Color(1,0,0,0.5f);

    private NodeJsTCPPingpong monoClient;

    private Image _image;
    private Text _text;

    private int _recvCount;
    private bool _isClose;
    private bool _closeFlag;
    
    private void Awake()
    {
        monoClient = GetComponent<NodeJsTCPPingpong>();
        _image = GetComponent<Image>();
        _text = transform.Find("Text").GetComponent<Text>();
        _isClose = true;
        _recvCount = 0;
    }

    private void Update()
    {
        if (_isClose) return;
        
        var def = monoClient.recvCount - _recvCount;
        _recvCount = monoClient.recvCount;

        Command.CallCount += def;
        UpdateText(_recvCount.ToString());
        
        if (_closeFlag)
        {
            _isClose = true;
            _closeFlag = false;
            UpdateColor(State.Disconnect, 0);

            _recvCount = 0;
            return;
        }

        UpdateColor(State.Recv, _recvCount*0.00001f + 0.2f);
    }

    public void UpdateText(string text)
    {
        _text.text = text;
    }

    public void UpdateColor(State state, float alpha)
    {
        switch (state)
        {
            case State.Recv:
                _image.color = new Color(RecvColor.r, RecvColor.g, RecvColor.b,alpha);
                break;
            case State.Disconnect:
                _image.color = DisConnectColor;
                break;
        }
    }

    public void Connect()
    {
        _isClose = false;
        monoClient.Connect();
    }

    public void Close()
    {
        _closeFlag = true;
    }

    public void Init()
    {
        gameObject.SetActive(true);
    }

    public void Remove()
    {
        monoClient.Close();
        gameObject.SetActive(false);
    }
}

public enum State
{
    Recv,
    Disconnect
}