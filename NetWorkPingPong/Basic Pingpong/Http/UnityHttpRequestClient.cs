using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Net.Sockets;
using System.IO;
using System.Text;
using UnityEngine.Networking;

public class UnityNodeJSClient : MonoBehaviour
{
    private const string IP_ADDR = "192.168.0.17:9822";
    //private const string IP_ADDR = "http://naver.com";
    private const int PORT = 3000;
    
    public void ConnectServer()
    {
        StartCoroutine(GetText());
    }
    
    IEnumerator GetText() {
        UnityWebRequest www = UnityWebRequest.Get(IP_ADDR);
        yield return www.SendWebRequest();
 
        if(www.isNetworkError || www.isHttpError) {
            Debug.Log(www.error);
        }
        else {
            // Show results as text
            Debug.Log(www.downloadHandler.text);
            Debug.Log(www.downloadHandler.text);
 
            // Or retrieve results as binary data
            byte[] results = www.downloadHandler.data;
        }
    }
}
