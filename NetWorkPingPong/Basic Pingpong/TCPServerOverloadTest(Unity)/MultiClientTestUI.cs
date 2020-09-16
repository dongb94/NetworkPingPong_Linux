
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

public class MultiClientTestUI :MonoBehaviour
{
    public static MultiClientTestUI Instence;
    
    private InputField _nOfClient;
    private Text _callCount;

    private Transform _content;

    private int _clientNum;
    private List<ClientTestBox> _clientGroup;
    private GameObject _clientPrefab;

    private int _recvCallCount;
    
    public int ClientNum
    {
        get => _clientNum;
        set
        {
            if (value < _clientNum)
            {
                for (int i = value; i < _clientNum; i++)
                    _clientGroup[i].Remove();
            }
            else
            {
                if(value < _clientGroup.Count)
                    for (int i = _clientNum; i < value; i++)
                    {
                        _clientGroup[i].Init();
                    }
                else
                {
                    for (int i = _clientNum; i < _clientGroup.Count; i++)
                    {
                        _clientGroup[i].Init();
                    }

                    for (int i = _clientGroup.Count; i < value; i++)
                    {
                        var instance = Instantiate(_clientPrefab, _content).GetComponent<ClientTestBox>();
                        instance.Command = this;
                        _clientGroup.Add(instance);
                    }
                }
            }

            _clientNum = value;
            
        }
    }

    public int CallCount
    {
        get => _recvCallCount;
        set
        {
            _recvCallCount = value;
            _callCount.text = _recvCallCount.ToString();
        }
    }

    private void Awake()
    {
        Instence = this;
        
        _nOfClient = transform.Find("InputField").GetComponent<InputField>();
        _callCount = transform.Find("CallCount/Text").GetComponent<Text>();

        _content = transform.Find("Scroll View/Viewport/Content");

        _clientNum = 0;
        _clientGroup = new List<ClientTestBox>();
        _clientPrefab = Resources.Load<GameObject>("ClientObject");
        
        _nOfClient.onValueChanged.AddListener(NOfClientChange);
        transform.Find("Button").GetComponent<Button>().onClick.AddListener(Connect);
        transform.Find("RecursiveButton").GetComponent<Button>().onClick.AddListener(RecursiveConnectTest);
    }

    private void RecursiveConnectTest()
    {
        Task.Run(() => new UnityNodeJsTCPConnectionTestClient().RecursiveConnection());
        
    }

    public void NOfClientChange(string text)
    {
        var inputNum = int.Parse(text);
        if (_clientNum == inputNum) return;

        ClientNum = inputNum;
    }

    public void Connect()
    {
        for (int i = 0; i < _clientNum; i++)
        {
            _clientGroup[i].Connect();
        }
    }

    public async Task RecursiveConnectTest(int a=0)
    {
        await Task.Run(() => new UnityNodeJsTCPConnectionTestClient().RecursiveConnection());
    }
    
}