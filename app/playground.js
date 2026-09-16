import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import SafeScreen from '../components/SafeScreen';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Playground() {
  const router = useRouter();
  const webViewRef = useRef(null);
  
  // HTML Content with CodeMirror embedded via CDN
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.js"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/theme/dracula.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/mode/javascript/javascript.min.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; background: #282a36; font-family: sans-serif; display: flex; flex-direction: column; }
        .CodeMirror { flex: 1; height: auto; font-size: 14px; }
        #output { flex: 1; background: #fff; padding: 10px; overflow-y: auto; border-top: 2px solid #444; }
        #console { background: #1e1e1e; color: #0f0; padding: 10px; font-family: monospace; flex: 0.5; overflow-y: auto; }
      </style>
    </head>
    <body>
      <textarea id="editor">// Write your JavaScript code here\nconsole.log("Hello, World!");\n\n// Or write HTML/JS to manipulate the DOM\ndocument.getElementById("output").innerHTML = "<h1>Playground Ready!</h1>";</textarea>
      
      <div id="output"></div>
      <div id="console">Console output will appear here...</div>
      
      <script>
        var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
          lineNumbers: true,
          mode: "javascript",
          theme: "dracula",
          viewportMargin: Infinity
        });

        // Intercept console.log
        var oldLog = console.log;
        console.log = function(...args) {
          var consoleDiv = document.getElementById('console');
          if (consoleDiv.innerHTML === 'Console output will appear here...') consoleDiv.innerHTML = '';
          consoleDiv.innerHTML += args.join(' ') + '<br/>';
          oldLog.apply(console, args);
        };

        window.addEventListener('message', function(e) {
          if (e.data === 'run') {
            document.getElementById('console').innerHTML = ''; // clear console
            var code = editor.getValue();
            try {
              // Create a sandbox function
              new Function(code)();
            } catch (err) {
              console.log('<span style="color:red">' + err.toString() + '</span>');
            }
          }
        });
      </script>
    </body>
    </html>
  `;

  const runCode = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.dispatchEvent(new MessageEvent('message', { data: 'run' }));
        true;
      `);
    }
  };

  return (
    <SafeScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#132F94" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Code Playground</Text>
        <TouchableOpacity onPress={runCode} style={styles.runButton}>
          <Ionicons name="play" size={20} color="white" />
          <Text style={styles.runButtonText}>Run</Text>
        </TouchableOpacity>
      </View>
      <WebView 
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#CBE7F7',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'quicksand-bold',
    color: '#132F94',
  },
  runButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  runButtonText: {
    color: 'white',
    fontFamily: 'nunito-bold',
  },
  webview: {
    flex: 1,
  }
});
